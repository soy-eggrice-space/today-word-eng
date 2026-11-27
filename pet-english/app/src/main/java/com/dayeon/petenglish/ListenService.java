package com.dayeon.petenglish;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.content.res.AssetFileDescriptor;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import org.json.JSONArray;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Locale;

public class ListenService extends Service implements AudioManager.OnAudioFocusChangeListener {

    public interface Listener { void at(int index); void end(); }

    public static final String ACT_START = "com.dayeon.petenglish.LISTEN_START";
    public static final String ACT_STOP = "com.dayeon.petenglish.LISTEN_STOP";
    private static final String CHANNEL = "listen";
    private static final int NOTI_ID = 71;

    public static volatile int pos = -1;
    public static volatile Listener listener;

    private final Handler h = new Handler(Looper.getMainLooper());
    private TextToSpeech tts;
    private boolean ready, paused;
    private MediaPlayer mp;
    private String[] files = new String[0];
    private String[] texts = new String[0];
    private float[] rates = new float[0];
    private int[] pres = new int[0];
    private int i = 0;
    private int step = 0;
    private PowerManager.WakeLock wake;
    private AudioFocusRequest focus;

    @Override public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || ACT_STOP.equals(intent.getAction())) { stopSelf(); return START_NOT_STICKY; }

        Notification n = buildNotification();
        if (Build.VERSION.SDK_INT >= 29) startForeground(NOTI_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(NOTI_ID, n);

        try {
            JSONArray arr = new JSONArray(intent.getStringExtra("seq"));
            int len = arr.length();
            String[] t = new String[len]; float[] r = new float[len]; int[] p = new int[len]; String[] f = new String[len];
            for (int k = 0; k < len; k++) {
                JSONArray e = arr.getJSONArray(k);
                t[k] = e.getString(0); r[k] = (float) e.optDouble(1, 0.8); p[k] = e.optInt(2, 400); f[k] = e.optString(3, "");
            }
            texts = t; rates = r; pres = p; files = f;
        } catch (Exception e) { texts = new String[0]; }
        if (texts.length == 0) { stopSelf(); return START_NOT_STICKY; }

        i = 0; step++; paused = false; pos = 0;
        if (wake == null) {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) { wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "petenglish:listen"); wake.setReferenceCounted(false); }
        }
        if (wake != null) wake.acquire(6 * 60 * 60 * 1000L);
        requestFocus();

        if (tts == null) {
            tts = new TextToSpeech(getApplicationContext(), status -> {
                if (status != TextToSpeech.SUCCESS || tts == null) {
                    tts = null; ready = true; h.post(() -> show(step)); return;
                }
                tts.setLanguage(Locale.US);
                tts.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { finished(id, 0); }
                    @Override public void onError(String id) { finished(id, 900); }
                });
                ready = true;
                h.post(() -> show(step));
            });
        } else if (ready) {
            stopPlayer();
            tts.stop();
            final int s = step;
            h.post(() -> show(s));
        }
        return START_NOT_STICKY;
    }

    private void show(final int s) {
        if (s != step || paused || texts.length == 0) return;
        pos = i;
        Listener l = listener;
        if (l != null) l.at(i);
        h.postDelayed(() -> say(s), pres[i]);
    }

    private void say(final int s) {
        if (s != step || paused) return;
        if (playFile(s)) return;
        if (tts == null) { h.postDelayed(() -> advance(s), 800); return; }
        tts.setPitch(1.15f);
        tts.setSpeechRate(rates[i]);
        int r = tts.speak(texts[i], TextToSpeech.QUEUE_FLUSH, null, "L" + s);

        long guard = (r == TextToSpeech.SUCCESS ? 2500 : 600) + texts[i].length() * 320L;
        h.postDelayed(() -> advance(s), guard);
    }

    private boolean playFile(final int s) {
        String f = i < files.length ? files[i] : "";
        if (f == null || !f.matches("[a-z0-9_]{1,80}")) return false;
        String path = "voice/" + f + ".mp3";
        stopPlayer();
        MediaPlayer m = new MediaPlayer();
        try {
            m.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
            try (AssetFileDescriptor afd = getAssets().openFd(path)) {
                m.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            } catch (java.io.FileNotFoundException gone) {

                File tmp = new File(getCacheDir(), "listen.mp3");
                try (InputStream in = getAssets().open(path); FileOutputStream out = new FileOutputStream(tmp)) {
                    byte[] buf = new byte[8192]; int n;
                    while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                }
                m.setDataSource(tmp.getPath());
            }
            m.setOnCompletionListener(x -> h.post(() -> advance(s)));
            m.setOnErrorListener((x, what, extra) -> { h.post(() -> advance(s)); return true; });
            m.prepare();
            m.start();
            mp = m;
            h.postDelayed(() -> advance(s), m.getDuration() + 2500L);
            return true;
        } catch (Exception e) {
            try { m.release(); } catch (Exception x) { }
            return false;
        }
    }

    private void stopPlayer() {
        if (mp != null) { try { mp.stop(); } catch (Exception e) { } try { mp.release(); } catch (Exception e) { } mp = null; }
    }

    private void finished(String id, final long wait) {
        if (id == null || !id.startsWith("L")) return;
        int v;
        try { v = Integer.parseInt(id.substring(1)); } catch (Exception e) { return; }
        final int s = v;
        h.postDelayed(() -> advance(s), wait);
    }

    private void advance(int s) {
        if (s != step || paused || texts.length == 0) return;
        step++;
        i = (i + 1) % texts.length;
        show(step);
    }

    private void requestFocus() {
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (am == null) return;
        if (focus == null) {
            focus = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
                    .setOnAudioFocusChangeListener(this, h)
                    .build();
        }
        am.requestAudioFocus(focus);
    }

    @Override
    public void onAudioFocusChange(int change) {
        if (change == AudioManager.AUDIOFOCUS_LOSS) { stopSelf(); return; }
        if (change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
            paused = true; step++;
            stopPlayer();
            if (tts != null) tts.stop();
        } else if (change == AudioManager.AUDIOFOCUS_GAIN && paused) {
            paused = false; step++;
            show(step);
        }
    }

    private Notification buildNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && nm.getNotificationChannel(CHANNEL) == null) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "듣기 모드", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("듣기 모드로 문장을 읽어 주는 동안 떠 있는 알림");
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        }
        Intent open = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (open == null) open = new Intent(this, MainActivity.class);
        PendingIntent pOpen = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        PendingIntent pStop = PendingIntent.getService(this, 1, new Intent(this, ListenService.class).setAction(ACT_STOP), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new Notification.Builder(this, CHANNEL)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle("듣기 모드 재생 중")
                .setContentText("배운 문장을 계속 읽어 주고 있어요")
                .setContentIntent(pOpen)
                .setOngoing(true)
                .setCategory(Notification.CATEGORY_TRANSPORT)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .addAction(new Notification.Action.Builder((android.graphics.drawable.Icon) null, "그만 듣기", pStop).build())
                .build();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        step++; pos = -1; ready = false;
        h.removeCallbacksAndMessages(null);
        stopPlayer();
        if (tts != null) { try { tts.stop(); tts.shutdown(); } catch (Exception e) { } tts = null; }
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (am != null && focus != null) am.abandonAudioFocusRequest(focus);
        if (wake != null && wake.isHeld()) wake.release();
        Listener l = listener;
        if (l != null) l.end();
        super.onDestroy();
    }
}
