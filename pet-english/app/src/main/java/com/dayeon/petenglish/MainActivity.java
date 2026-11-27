package com.dayeon.petenglish;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

public class MainActivity extends Activity {

    private WebView web;
    private TextToSpeech tts;
    private ListenService.Listener listenListener;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Color.parseColor("#FFF6E6"));
        getWindow().setNavigationBarColor(Color.parseColor("#FFF6E6"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#FFF6E6"));
        setContentView(web);
        hideSystemBars();

        WebSettings ws = web.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        ws.setTextZoom(100);

        web.addJavascriptInterface(new Bridge(), "Android");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {

                String sc = request.getUrl().getScheme();
                if ("file".equals(sc)) return false;
                if ("https".equals(sc) || "http".equals(sc)) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl())); } catch (Exception e) { }
                }
                return true;
            }
        });

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS && tts != null) {
                tts.setLanguage(Locale.US);
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { notifyJs("__ttsStart", id); }
                    @Override public void onDone(String id) { notifyJs("__ttsDone", id); }
                    @Override public void onError(String id) { notifyJs("__ttsDone", id); }
                    @Override public void onStop(String id, boolean interrupted) { notifyJs("__ttsDone", id); }
                });
            }
        });

        listenListener = new ListenService.Listener() {
            @Override public void at(int index) { callJs("window.__listenAt && window.__listenAt(" + index + ")"); }
            @Override public void end() { callJs("window.__listenEnd && window.__listenEnd()"); }
        };
        ListenService.listener = listenListener;

        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 7);
        }

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl("file:///android_asset/index.html");
        }
    }

    private void callJs(final String js) {
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(js, null); });
    }

    private void notifyJs(String fn, String id) {
        if (web == null || id == null) return;
        final String safe = id.replaceAll("[^A-Za-z0-9_]", "");
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript("window." + fn + " && window." + fn + "('" + safe + "')", null); });
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
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.onResume();
            web.evaluateJavascript("window.__resume && window.__resume()", null);
        }
    }

    @Override
    protected void onDestroy() {
        if (ListenService.listener == listenListener) ListenService.listener = null;
        if (isFinishing()) stopService(new Intent(this, ListenService.class));
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        if (web != null) web.destroy();
        super.onDestroy();
    }

    private class Bridge {

        @JavascriptInterface
        public int appVersion() {
            try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionCode; } catch (Exception e) { return 0; }
        }

        @JavascriptInterface
        public void checkUpdate(String url) {
            if (url == null || !url.startsWith("https://")) return;
            new Thread(() -> {
                String body = null;
                try {
                    java.net.HttpURLConnection c = (java.net.HttpURLConnection) new java.net.URL(url + "?t=" + System.currentTimeMillis()).openConnection();
                    c.setConnectTimeout(8000); c.setReadTimeout(8000); c.setUseCaches(false);
                    if (c.getResponseCode() == 200) {
                        java.io.BufferedReader r = new java.io.BufferedReader(new java.io.InputStreamReader(c.getInputStream(), "UTF-8"));
                        StringBuilder sb = new StringBuilder(); String line; int n = 0;
                        while ((line = r.readLine()) != null && n++ < 20) sb.append(line);
                        r.close(); body = sb.toString();
                    }
                    c.disconnect();
                } catch (Exception e) { }
                if (body == null || web == null) return;
                final String safe = org.json.JSONObject.quote(body);
                runOnUiThread(() -> { if (web != null) web.evaluateJavascript("window.__upd && window.__upd(" + safe + ")", null); });
            }).start();
        }

        @JavascriptInterface
        public void speakTo(String text, String lang, float pitch, float rate, String id) {
            if (tts == null || text == null) { notifyJs("__ttsDone", id); return; }
            Locale loc = (lang != null && lang.startsWith("en")) ? Locale.US : Locale.KOREAN;
            tts.setLanguage(loc);
            tts.setPitch(pitch > 0 ? pitch : 1.2f);
            tts.setSpeechRate(rate > 0 ? rate : 1.0f);
            int r = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id);
            if (r != TextToSpeech.SUCCESS) notifyJs("__ttsDone", id);
        }

        @JavascriptInterface
        public void stopSpeak() {
            if (tts != null) tts.stop();
        }

        @JavascriptInterface
        public String voice(String name) {
            if (name == null || !name.matches("[a-z0-9_]{1,80}")) return "";
            try (java.io.InputStream in = getAssets().open("voice/" + name + ".mp3")) {
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                byte[] buf = new byte[8192]; int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                return android.util.Base64.encodeToString(out.toByteArray(), android.util.Base64.NO_WRAP);
            } catch (Exception e) { return ""; }
        }

        @JavascriptInterface
        public void listenStart(String json) {
            Intent it = new Intent(MainActivity.this, ListenService.class).setAction(ListenService.ACT_START).putExtra("seq", json);
            startForegroundService(it);
        }

        @JavascriptInterface
        public void listenStop() {
            stopService(new Intent(MainActivity.this, ListenService.class));
        }

        @JavascriptInterface
        public int listenPos() {
            return ListenService.pos;
        }

        @JavascriptInterface
        public void keepScreen(final boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }
    }
}
