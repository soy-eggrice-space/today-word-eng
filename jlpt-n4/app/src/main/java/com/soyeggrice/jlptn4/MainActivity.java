package com.soyeggrice.jlptn4;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.MediaStore;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class MainActivity extends Activity {

    private static final int REQ_FILE = 1001;
    private static final int REQ_NOTI = 1002;
    static final String PREFS = "jlptn4";
    static final String KEY_DATA = "data";

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private SharedPreferences prefs;
    private boolean pageReady = false;
    private String pendingOpen = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        pendingOpen = openTarget(getIntent());

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Color.parseColor("#F8F1DE"));
        getWindow().setNavigationBarColor(Color.parseColor("#F8F1DE"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#F8F1DE"));
        setContentView(web);
        lightSystemBars();

        WebSettings ws = web.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        ws.setTextZoom(100);
        ws.setCacheMode(WebSettings.LOAD_DEFAULT);

        web.addJavascriptInterface(new Bridge(), "Android");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // 앱 밖의 페이지로 이동하지 않게 막아요.
                return !"file".equals(request.getUrl().getScheme());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
                flushOpen();
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(intent, "백업 파일 고르기"), REQ_FILE);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS && tts != null) {
                tts.setLanguage(Locale.JAPAN);
                tts.setSpeechRate(0.9f);
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { notifyDone(id); }
                    @Override public void onError(String id) { notifyDone(id); }
                    @Override public void onStop(String id, boolean interrupted) { }
                });
                ttsReady = true;
            }
        });

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
            pageReady = true;
        } else {
            web.loadUrl("file:///android_asset/index.html");
        }
        Reminders.schedule(this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String t = openTarget(intent);
        if (t != null) {
            pendingOpen = t;
            flushOpen();
        }
    }

    private String openTarget(Intent i) {
        return i == null ? null : i.getStringExtra("open");
    }

    private void flushOpen() {
        if (!pageReady || pendingOpen == null || web == null) return;
        final String t = pendingOpen.replaceAll("[^a-z]", "");
        pendingOpen = null;
        web.postDelayed(() -> web.evaluateJavascript("window.__open && window.__open('" + t + "')", null), 300);
    }

    private void notifyDone(String id) {
        if (id == null || web == null) return;
        final String safe = id.replaceAll("[^A-Za-z0-9_]", "");
        runOnUiThread(() -> {
            if (web != null) web.evaluateJavascript("window.__ttsDone && window.__ttsDone('" + safe + "')", null);
        });
    }

    private void lightSystemBars() {
        int f = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (Build.VERSION.SDK_INT >= 26) f |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        getWindow().getDecorView().setSystemUiVisibility(f);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                result = new Uri[]{data.getData()};
            }
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_NOTI && web != null) {
            web.evaluateJavascript("window.render && S && S.setupDone && render(true)", null);
        }
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.appBack && window.appBack()) ? 'yes' : 'no'", value -> {
            if (value == null || !value.contains("yes")) finish();
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        if (web != null) web.destroy();
        web = null;
        super.onDestroy();
    }

    /** 화면(HTML)에서 window.Android.xxx() 로 부르는 기능들 */
    private class Bridge {

        /** 한 문장씩 말하고, 다 말하면 화면에 알려 줘요 (window.__ttsDone) */
        @JavascriptInterface
        public void speakTo(String text, String lang, float pitch, float rate, String id) {
            if (tts == null || !ttsReady || text == null) { notifyDone(id); return; }
            Locale loc = (lang != null && lang.startsWith("ko")) ? Locale.KOREAN : Locale.JAPAN;
            tts.setLanguage(loc);
            tts.setPitch(pitch > 0 ? pitch : 1.0f);
            tts.setSpeechRate(Math.max(0.5f, Math.min(1.6f, rate > 0 ? rate : 0.9f)));
            int r = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id);
            if (r != TextToSpeech.SUCCESS) notifyDone(id);
        }

        @JavascriptInterface
        public void stopTts() {
            if (tts != null) tts.stop();
        }

        /** 이 기기에 일본어 음성이 있는지 (0 이상이면 있음) */
        @JavascriptInterface
        public int hasLang(String lang) {
            if (tts == null) return -9;
            Locale loc = (lang != null && lang.startsWith("ko")) ? Locale.KOREAN : Locale.JAPAN;
            return tts.isLanguageAvailable(loc);
        }

        @JavascriptInterface
        public String loadData() {
            return prefs.getString(KEY_DATA, null);
        }

        @JavascriptInterface
        public void saveData(String json) {
            if (json != null) prefs.edit().putString(KEY_DATA, json).apply();
        }

        /** 진행 중인 모의고사처럼 따로 저장할 것 */
        @JavascriptInterface
        public String loadKey(String key) {
            return prefs.getString("k_" + key, null);
        }

        @JavascriptInterface
        public void saveKey(String key, String value) {
            if (value == null || value.isEmpty()) prefs.edit().remove("k_" + key).apply();
            else prefs.edit().putString("k_" + key, value).apply();
        }

        /** 알림 설정을 받아서 예약해요 */
        @JavascriptInterface
        public void setReminders(String json) {
            if (json == null) return;
            prefs.edit().putString(Reminders.KEY_CFG, json).apply();
            Reminders.schedule(MainActivity.this);
        }

        @JavascriptInterface
        public void askNotify() {
            if (Build.VERSION.SDK_INT >= 33
                    && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                runOnUiThread(() -> requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, REQ_NOTI));
            }
        }

        @JavascriptInterface
        public boolean notifyAllowed() {
            if (Build.VERSION.SDK_INT >= 33
                    && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            return nm == null || nm.areNotificationsEnabled();
        }

        @JavascriptInterface
        public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    v.vibrate(VibrationEffect.createOneShot(Math.max(10, ms), VibrationEffect.DEFAULT_AMPLITUDE));
                }
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public String exportBackup(String fileName, String json) {
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                    cv.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    ContentResolver cr = getContentResolver();
                    Uri uri = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (uri == null) return "저장하지 못했어요. 저장 공간을 확인해 주세요";
                    try (OutputStream os = cr.openOutputStream(uri)) {
                        if (os == null) return "저장하지 못했어요. 저장 공간을 확인해 주세요";
                        os.write(bytes);
                    }
                    return "'다운로드' 폴더에 백업을 저장했어요";
                } else {
                    File dir = getExternalFilesDir(null);
                    File f = new File(dir, fileName);
                    try (FileOutputStream fos = new FileOutputStream(f)) {
                        fos.write(bytes);
                    }
                    return "저장했어요: " + f.getAbsolutePath();
                }
            } catch (Exception e) {
                return "저장하지 못했어요: " + e.getMessage();
            }
        }
    }
}
