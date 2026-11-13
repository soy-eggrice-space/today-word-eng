package com.dadada.routine;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.AudioTrack;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {

    static final String PREFS = "dadada_routine";
    private static final String KEY_DATA = "data";
    private static final String BG = "#F4F6FB";
    private static final int SR = 16000;
    private static final int REQ_MIC = 7, REQ_NOTIF = 8;

    private WebView web;
    private SharedPreferences prefs;
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final Handler main = new Handler(Looper.getMainLooper());

    // 녹음
    private AudioRecord rec;
    private Thread recThread;
    private volatile boolean recording;
    private volatile int level;
    private ByteArrayOutputStream pcmBuf = new ByteArrayOutputStream();
    private volatile byte[] lastPcm;
    private int sttSeq = 0;
    private AudioTrack player;
    private TextToSpeech tts;
    private boolean ttsReady;
    private boolean pageReady;
    private volatile String pendingAlarm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);

        getWindow().setStatusBarColor(Color.parseColor(BG));
        getWindow().setNavigationBarColor(Color.parseColor(BG));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor(BG));
        setContentView(web);
        hideSystemBars();

        WebSettings ws = web.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        ws.setTextZoom(100);

        // 앱 화면을 https 주소로 열어야 폰·태블릿 동기화(Firebase) 요청이 막히지 않아요.
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !WebViewAssetLoader.DEFAULT_DOMAIN.equals(request.getUrl().getHost());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
            }
        });

        handleAlarm(getIntent());
        AlarmScheduler.scheduleAll(this);
        web.loadUrl("https://" + WebViewAssetLoader.DEFAULT_DOMAIN + "/assets/index.html");
    }

    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.systemBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.appBack && window.appBack()) ? 'yes' : 'no'", value -> {
            if (value == null || !value.contains("yes")) finish();
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleAlarm(intent);
    }

    /** 시간 알림으로 열렸으면 잠금화면 위에서도 화면을 켜고, 웹 화면에 알려 줘요. */
    private void handleAlarm(Intent in) {
        if (in == null || in.getStringExtra("alarm_type") == null) return;
        String type = in.getStringExtra("alarm_type"), text = in.getStringExtra("alarm_text");
        in.removeExtra("alarm_type");
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
        else getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemBars();
        if (pageReady) js("window.onAlarm && window.onAlarm(" + q(type) + "," + q(text) + ")");
        else {
            try { JSONObject o = new JSONObject(); o.put("type", type); o.put("text", text); pendingAlarm = o.toString(); } catch (Exception ignored) { }
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.evaluateJavascript("window.appPause && window.appPause()", null);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.appResume && window.appResume()", null);
    }

    @Override
    protected void onDestroy() {
        recording = false;
        stopPlay();
        if (tts != null) tts.shutdown();
        super.onDestroy();
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] p, int[] r) {
        super.onRequestPermissionsResult(code, p, r);
        boolean ok = r.length > 0 && r[0] == PackageManager.PERMISSION_GRANTED;
        if (code == REQ_MIC) js("window.onRecPerm && window.onRecPerm(" + ok + ")");
        if (code == REQ_NOTIF) js("window.appResume && window.appResume()");
    }

    private void js(final String code) {
        main.post(() -> { if (web != null) web.evaluateJavascript(code, null); });
    }

    private static String q(String s) { return s == null ? "null" : JSONObject.quote(s); }

    private static Map<String, String> map(String... kv) {
        Map<String, String> m = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) m.put(kv[i], kv[i + 1]);
        return m;
    }

    // ---------- 녹음 ----------
    private boolean startRec() {
        stopPlay();
        int min = AudioRecord.getMinBufferSize(SR, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
        if (min <= 0) return false;
        try {
            rec = new AudioRecord(MediaRecorder.AudioSource.MIC, SR, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, Math.max(min, SR));
        } catch (SecurityException e) { return false; }
        if (rec.getState() != AudioRecord.STATE_INITIALIZED) { rec.release(); rec = null; return false; }
        pcmBuf = new ByteArrayOutputStream();
        lastPcm = null;
        level = 0;
        recording = true;
        rec.startRecording();
        final AudioRecord r = rec;
        final ByteArrayOutputStream out = pcmBuf;
        recThread = new Thread(() -> {
            byte[] b = new byte[2048];
            int max = SR * 2 * 65;
            while (recording) {
                int n = r.read(b, 0, b.length);
                if (n > 0) {
                    out.write(b, 0, n);
                    int peak = 0;
                    for (int i = 0; i + 1 < n; i += 2) {
                        int v = Math.abs((short) ((b[i] & 0xff) | (b[i + 1] << 8)));
                        if (v > peak) peak = v;
                    }
                    level = Math.min(100, peak * 100 / 18000);
                    if (out.size() >= max) recording = false;
                }
            }
        });
        recThread.start();
        return true;
    }

    /** 안드로이드 13 이상에서 녹음한 소리를 받아쓰기해요. 안 되면 null을 돌려줘요. */
    private boolean transcribe(final byte[] data, final int seq) {
        if (Build.VERSION.SDK_INT < 33 || !SpeechRecognizer.isRecognitionAvailable(this)) return false;
        main.post(() -> {
            final boolean[] done = {false};
            final SpeechRecognizer[] sr = {null};
            final ParcelFileDescriptor[][] pipe = {null};
            final Runnable finish = () -> { };
            try {
                pipe[0] = ParcelFileDescriptor.createPipe();
                sr[0] = SpeechRecognizer.createSpeechRecognizer(this);
                Intent it = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ko-KR");
                it.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE, pipe[0][0]);
                it.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_ENCODING, AudioFormat.ENCODING_PCM_16BIT);
                it.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_CHANNEL_COUNT, 1);
                it.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_SAMPLING_RATE, SR);
                sr[0].setRecognitionListener(new RecognitionListener() {
                    private void end(String text) {
                        if (done[0]) return;
                        done[0] = true;
                        js("window.onTranscript && window.onTranscript(" + seq + "," + q(text) + ")");
                        try { sr[0].destroy(); } catch (Exception ignored) { }
                        try { pipe[0][0].close(); } catch (Exception ignored) { }
                    }
                    @Override public void onResults(Bundle b) {
                        ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        end(r != null && !r.isEmpty() ? r.get(0) : null);
                    }
                    @Override public void onError(int e) { end(null); }
                    @Override public void onReadyForSpeech(Bundle b) { }
                    @Override public void onBeginningOfSpeech() { }
                    @Override public void onRmsChanged(float v) { }
                    @Override public void onBufferReceived(byte[] b) { }
                    @Override public void onEndOfSpeech() { }
                    @Override public void onPartialResults(Bundle b) { }
                    @Override public void onEvent(int t, Bundle b) { }
                });
                sr[0].startListening(it);
                new Thread(() -> {
                    try (OutputStream os = new ParcelFileDescriptor.AutoCloseOutputStream(pipe[0][1])) {
                        os.write(data);
                        os.write(new byte[SR * 2]); // 끝에 1초 조용히
                    } catch (Exception ignored) { }
                }).start();
                main.postDelayed(() -> {
                    if (done[0]) return;
                    done[0] = true;
                    js("window.onTranscript && window.onTranscript(" + seq + ",null)");
                    try { sr[0].cancel(); sr[0].destroy(); } catch (Exception ignored) { }
                }, 15000);
            } catch (Exception e) {
                js("window.onTranscript && window.onTranscript(" + seq + ",null)");
            }
        });
        return true;
    }

    private void stopPlay() {
        if (player != null) {
            try { player.stop(); } catch (Exception ignored) { }
            player.release();
            player = null;
        }
    }

    // ---------- 텔레그램 ----------
    private String tgToken() { return prefs.getString("tg_token", ""); }

    private JSONObject tgDeliver(String token, String chat, String text, File voice, int secs) throws Exception {
        return voice != null ? Net.tgVoice(token, chat, text, voice, secs) : Net.tg(token, "sendMessage", map("chat_id", chat, "text", text));
    }

    private JSONObject tgSendFixingChat(String token, String text, File voice, int secs) throws Exception {
        String chat = prefs.getString("tg_chat", "");
        JSONObject r = tgDeliver(token, chat, text, voice, secs);
        if (!r.optBoolean("ok")) {
            JSONObject p = r.optJSONObject("parameters");
            if (p != null && p.has("migrate_to_chat_id")) {
                chat = String.valueOf(p.getLong("migrate_to_chat_id"));
                prefs.edit().putString("tg_chat", chat).apply();
                r = tgDeliver(token, chat, text, voice, secs);
            }
        }
        return r;
    }

    // ---------- 받는 폰 ----------
    private boolean notifAllowed() {
        return Build.VERSION.SDK_INT < 33 || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    private boolean batteryFree() {
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        return pm != null && pm.isIgnoringBatteryOptimizations(getPackageName());
    }

    private class Bridge {
        @JavascriptInterface public String loadData() { return prefs.getString(KEY_DATA, null); }

        @JavascriptInterface public void saveData(String json) { if (json != null) prefs.edit().putString(KEY_DATA, json).apply(); }

        // 마을 앱(솔정마을·다연마을)에 보여 줄 아이들 캐릭터 그림
        @JavascriptInterface public void shareChars(String json) { if (json != null) prefs.edit().putString(CharProvider.KEY, json).apply(); }

        // 루틴 화면에서만 화면이 꺼지지 않게
        // 처음 설치할 때 카톡에서 복사한 연결 주소를 붙여 넣어요
        @JavascriptInterface public String clipText() {
            try {
                android.content.ClipboardManager cm = (android.content.ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm == null || !cm.hasPrimaryClip()) return "";
                android.content.ClipData cd = cm.getPrimaryClip();
                if (cd == null || cd.getItemCount() == 0) return "";
                CharSequence t = cd.getItemAt(0).coerceToText(MainActivity.this);
                return t == null ? "" : t.toString();
            } catch (Exception e) { return ""; }
        }

        @JavascriptInterface public void keepAwake(final boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        @JavascriptInterface public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v == null || !v.hasVibrator()) return;
                v.vibrate(VibrationEffect.createOneShot(Math.max(10, Math.min(ms, 200)), VibrationEffect.DEFAULT_AMPLITUDE));
            } catch (Exception ignored) { }
        }

        // ----- 녹음 -----
        @JavascriptInterface public String recStart() {
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                main.post(() -> requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC));
                return "perm";
            }
            return startRec() ? "ok" : "fail";
        }

        @JavascriptInterface public int recLevel() { return recording ? level : -1; }

        @JavascriptInterface public String recStop() {
            recording = false;
            try { if (recThread != null) recThread.join(1500); } catch (InterruptedException ignored) { }
            if (rec != null) {
                try { rec.stop(); } catch (Exception ignored) { }
                rec.release();
                rec = null;
            }
            byte[] data = pcmBuf.toByteArray();
            int ms = (int) ((long) data.length * 1000 / (SR * 2));
            if (ms < 600) { lastPcm = null; return "{\"ms\":" + ms + "}"; }
            lastPcm = data;
            int seq = ++sttSeq;
            boolean stt = transcribe(data, seq);
            return "{\"ms\":" + ms + ",\"seq\":" + seq + ",\"stt\":" + stt + "}";
        }

        @JavascriptInterface public void recDiscard() { lastPcm = null; sttSeq++; main.post(MainActivity.this::stopPlay); }

        @JavascriptInterface public void recPlay() {
            final byte[] d = lastPcm;
            if (d == null) return;
            main.post(() -> {
                stopPlay();
                try {
                    player = new AudioTrack.Builder()
                            .setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
                            .setAudioFormat(new AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(SR).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                            .setTransferMode(AudioTrack.MODE_STATIC)
                            .setBufferSizeInBytes(d.length)
                            .build();
                    player.write(d, 0, d.length);
                    player.play();
                } catch (Exception ignored) { }
            });
        }

        // ----- 읽어 주기 (답장이 오면) -----
        @JavascriptInterface public void speak(final String text) {
            main.post(() -> {
                if (tts == null) {
                    tts = new TextToSpeech(MainActivity.this, st -> {
                        ttsReady = st == TextToSpeech.SUCCESS;
                        if (ttsReady) {
                            tts.setLanguage(Locale.KOREAN);
                            tts.speak(text, TextToSpeech.QUEUE_ADD, null, "say");
                        }
                    });
                } else if (ttsReady) {
                    tts.speak(text, TextToSpeech.QUEUE_ADD, null, "say");
                }
            });
        }

        // ----- 텔레그램 -----
        @JavascriptInterface public String tgInfo() {
            JSONObject o = new JSONObject();
            try {
                o.put("hasToken", !tgToken().isEmpty());
                o.put("bot", prefs.getString("tg_bot", ""));
                o.put("chat", prefs.getString("tg_chat", ""));
                o.put("title", prefs.getString("tg_title", ""));
            } catch (Exception ignored) { }
            return o.toString();
        }

        @JavascriptInterface public void tgSetup(final String tokenIn) {
            io.execute(() -> {
                JSONObject res = new JSONObject();
                try {
                    String token = tokenIn == null || tokenIn.trim().isEmpty() ? tgToken() : tokenIn.trim();
                    JSONObject me = Net.tg(token, "getMe", null);
                    if (!me.optBoolean("ok")) {
                        res.put("ok", false); res.put("err", "token");
                    } else {
                        prefs.edit().putString("tg_token", token).putString("tg_bot", me.getJSONObject("result").optString("username")).apply();
                        JSONObject up = Net.tg(token, "getUpdates", null);
                        LinkedHashMap<String, JSONObject> chats = new LinkedHashMap<>();
                        JSONArray arr = up.optJSONArray("result");
                        if (arr != null) for (int i = 0; i < arr.length(); i++) {
                            JSONObject u = arr.getJSONObject(i);
                            for (String k : new String[]{"message", "my_chat_member", "edited_message", "channel_post"}) {
                                JSONObject m = u.optJSONObject(k);
                                JSONObject chat = m == null ? null : m.optJSONObject("chat");
                                if (chat == null) continue;
                                JSONObject c = new JSONObject();
                                c.put("id", String.valueOf(chat.getLong("id")));
                                c.put("type", chat.optString("type"));
                                String title = chat.optString("title", "");
                                if (title.isEmpty()) title = (chat.optString("first_name", "") + " " + chat.optString("last_name", "")).trim();
                                c.put("title", title);
                                chats.put(c.getString("id"), c);
                            }
                        }
                        JSONArray list = new JSONArray();
                        for (JSONObject c : chats.values()) list.put(c);
                        res.put("ok", true);
                        res.put("bot", prefs.getString("tg_bot", ""));
                        res.put("chats", list);
                    }
                } catch (Exception e) {
                    try { res.put("ok", false); res.put("err", "net"); } catch (Exception ignored) { }
                }
                js("window.onTgSetup && window.onTgSetup(" + res + ")");
            });
        }

        @JavascriptInterface public void tgChoose(final String id, final String title) {
            prefs.edit().putString("tg_chat", id).putString("tg_title", title).apply();
            io.execute(() -> {
                boolean ok = false;
                try { ok = tgSendFixingChat(tgToken(), "✅ 우리가족 앱과 연결됐어요. 아이들이 보낸 말이 여기로 와요.", null, 0).optBoolean("ok"); } catch (Exception ignored) { }
                js("window.onTgTest && window.onTgTest(" + ok + ")");
            });
        }

        @JavascriptInterface public void tgForget() {
            prefs.edit().remove("tg_token").remove("tg_bot").remove("tg_chat").remove("tg_title").apply();
        }

        @JavascriptInterface public void tgSend(final String reqId, final String text, final boolean voice) {
            io.execute(() -> {
                boolean ok = false;
                String err = "";
                try {
                    if (tgToken().isEmpty() || prefs.getString("tg_chat", "").isEmpty()) throw new IllegalStateException("setup");
                    File f = null;
                    byte[] pcm = lastPcm;
                    if (voice && pcm != null) f = VoiceFile.toM4a(pcm, SR, new File(getCacheDir(), "voice.m4a"));
                    JSONObject r = tgSendFixingChat(tgToken(), text, f, pcm == null ? 0 : pcm.length / (SR * 2));
                    ok = r.optBoolean("ok");
                    if (!ok) err = r.optString("description", "fail");
                } catch (IllegalStateException e) {
                    err = "setup";
                } catch (Exception e) {
                    err = "net";
                }
                js("window.onTgSent && window.onTgSent(" + q(reqId) + "," + ok + "," + q(err) + ")");
            });
        }

        /** 아이가 보낸 말: 텔레그램(엄마·아빠)과 가족 앱 방(Firebase)으로 함께 보내요. */
        @JavascriptInterface public void famSend(final String reqId, final String payload) {
            io.execute(() -> {
                JSONObject res = new JSONObject();
                try {
                    JSONObject p = new JSONObject(payload);
                    byte[] pcm = lastPcm;
                    File f = null;
                    if (p.optBoolean("voice") && pcm != null) {
                        try { f = VoiceFile.toM4a(pcm, SR, new File(getCacheDir(), "voice.m4a")); } catch (Exception ignored) { }
                    }
                    int secs = pcm == null ? 0 : Math.max(1, pcm.length / (SR * 2));
                    if (!tgToken().isEmpty() && !prefs.getString("tg_chat", "").isEmpty()) {
                        try { res.put("tg", tgSendFixingChat(tgToken(), p.optString("text"), f, secs).optBoolean("ok")); }
                        catch (Exception e) { res.put("tg", false); }
                    }
                    JSONObject fb = p.optJSONObject("fb");
                    if (fb != null) {
                        try {
                            String base = fb.getString("base"), mid = fb.getString("mid");
                            if (f != null) {
                                String b64 = Base64.encodeToString(Net.readFile(f), Base64.NO_WRAP);
                                Net.http("PUT", base + "/voice/" + mid + ".json", JSONObject.quote(b64));
                            }
                            Net.http("PATCH", base + ".json", fb.getJSONObject("patch").toString());
                            res.put("fb", true);
                        } catch (Exception e) { res.put("fb", false); }
                    }
                } catch (Exception ignored) { }
                js("window.onFamSent && window.onFamSent(" + q(reqId) + "," + res + ")");
            });
        }

        // ----- 받는 폰 알림 -----
        @JavascriptInterface public void setReceiver(String base, String rooms, String person) {
            prefs.edit().putString("rx_base", base).putString("rx_rooms", rooms).putString("rx_person", person).apply();
            if (prefs.getLong("rx_last", 0) == 0) prefs.edit().putLong("rx_last", System.currentTimeMillis()).apply();
            InboxService.start(MainActivity.this);
        }

        @JavascriptInterface public void stopReceiver() {
            prefs.edit().remove("rx_base").remove("rx_rooms").remove("rx_person").apply();
            stopService(new Intent(MainActivity.this, InboxService.class));
        }

        @JavascriptInterface public String receiverState() {
            JSONObject o = new JSONObject();
            try {
                o.put("svc", !prefs.getString("rx_base", "").isEmpty());
                o.put("notif", notifAllowed());
                o.put("battery", batteryFree());
            } catch (Exception ignored) { }
            return o.toString();
        }

        // ----- 시간 알림 / 자동 켜기 -----
        @JavascriptInterface public void setAlarms(String json) {
            prefs.edit().putString("alarms", json == null ? "[]" : json).apply();
            AlarmScheduler.scheduleAll(MainActivity.this);
        }

        @JavascriptInterface public void armStop(String json) {
            try { AlarmScheduler.applyStop(MainActivity.this, json == null || json.isEmpty() ? null : new JSONObject(json)); } catch (Exception ignored) { }
        }

        @JavascriptInterface public String takeAlarm() {
            String a = pendingAlarm; pendingAlarm = null; return a;
        }

        @JavascriptInterface public void alarmDone() {
            main.post(() -> {
                if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(false); setTurnScreenOn(false); }
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
                getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        @JavascriptInterface public String alarmState() {
            JSONObject o = new JSONObject();
            try {
                o.put("overlay", Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(MainActivity.this));
                if (Build.VERSION.SDK_INT >= 31) o.put("exact", AlarmScheduler.canExact(MainActivity.this));
                o.put("battery", batteryFree());
                o.put("next", prefs.getLong("alarm_next", 0));
            } catch (Exception ignored) { }
            return o.toString();
        }

        // ----- 같은 태블릿의 공부 앱(솔정마을·다연마을) 열기 -----
        @JavascriptInterface public boolean launchApp(String pkgs) {
            if (pkgs == null) return false;
            for (String p : pkgs.split(",")) {
                try {
                    Intent i = getPackageManager().getLaunchIntentForPackage(p.trim());
                    if (i == null) continue;
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    final Intent go = i;
                    main.post(() -> { try { startActivity(go); } catch (Exception ignored) { } });
                    return true;
                } catch (Exception ignored) { }
            }
            return false;
        }

        @JavascriptInterface public String hasApps(String pkgs) {
            StringBuilder sb = new StringBuilder();
            if (pkgs != null) for (String p : pkgs.split(",")) {
                try {
                    if (getPackageManager().getLaunchIntentForPackage(p.trim()) != null) { if (sb.length() > 0) sb.append(','); sb.append(p.trim()); }
                } catch (Exception ignored) { }
            }
            return sb.toString();
        }

        @JavascriptInterface public void askOverlay() {
            main.post(() -> {
                try { startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()))); }
                catch (Exception e) { try { startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)); } catch (Exception ignored) { } }
            });
        }

        @JavascriptInterface public void askExact() {
            if (Build.VERSION.SDK_INT < 31) return;
            main.post(() -> {
                try { startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getPackageName()))); } catch (Exception ignored) { }
            });
        }

        @JavascriptInterface public void askNotif() {
            if (Build.VERSION.SDK_INT >= 33) main.post(() -> requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF));
        }

        @JavascriptInterface public void askBattery() {
            main.post(() -> {
                try {
                    Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                } catch (Exception e) {
                    try { startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)); } catch (Exception ignored) { }
                }
            });
        }
    }
}
