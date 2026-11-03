package com.dadada.routine;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * 할머니·할아버지·삼촌 폰에서 계속 깨어 있으면서, 가족 방에 새 마음이 오면 알림을 띄워요.
 * Firebase 스트리밍(REST)으로 방마다 연결해 둬요.
 */
public class InboxService extends Service {

    private static final String CH_RUN = "wooriga_run", CH_MSG = "wooriga_msg";
    private static final int FG_ID = 1;

    private volatile boolean alive;
    private final List<Thread> threads = new ArrayList<>();
    private final List<HttpURLConnection> conns = new ArrayList<>();
    private SharedPreferences prefs;

    static void start(Context c) {
        Intent i = new Intent(c, InboxService.class);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception ignored) { }
    }

    @Override public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        prefs = getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE);
        NotificationManager nm = getSystemService(NotificationManager.class);
        NotificationChannel run = new NotificationChannel(CH_RUN, "마음 기다리는 중", NotificationManager.IMPORTANCE_MIN);
        run.setShowBadge(false);
        nm.createNotificationChannel(run);
        NotificationChannel msg = new NotificationChannel(CH_MSG, "아이들이 보낸 마음", NotificationManager.IMPORTANCE_HIGH);
        msg.enableVibration(true);
        nm.createNotificationChannel(msg);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Notification n = new Notification.Builder(this, CH_RUN)
                .setSmallIcon(R.drawable.ic_stat)
                .setContentTitle("우리가족")
                .setContentText("아이들이 보내는 마음을 기다리고 있어요")
                .setContentIntent(openApp())
                .setOngoing(true)
                .build();
        if (Build.VERSION.SDK_INT >= 34) startForeground(FG_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(FG_ID, n);

        String base = prefs.getString("rx_base", "");
        String rooms = prefs.getString("rx_rooms", "");
        if (base.isEmpty() || rooms.isEmpty()) { stopSelf(); return START_NOT_STICKY; }
        restart(base, rooms.split(","));
        return START_STICKY;
    }

    private synchronized void restart(String base, String[] rooms) {
        stopAll();
        alive = true;
        for (String r : rooms) {
            if (r.trim().isEmpty()) continue;
            final String url = base + "/rooms/" + r.trim() + ".json";
            final String room = r.trim();
            Thread t = new Thread(() -> loop(url, room), "room-" + room);
            threads.add(t);
            t.start();
        }
    }

    private synchronized void stopAll() {
        alive = false;
        for (HttpURLConnection c : conns) try { c.disconnect(); } catch (Exception ignored) { }
        conns.clear();
        for (Thread t : threads) t.interrupt();
        threads.clear();
    }

    @Override
    public void onDestroy() {
        stopAll();
        super.onDestroy();
    }

    private void loop(String url, String room) {
        long wait = 3000;
        while (alive) {
            try {
                stream(url, room);
                wait = 3000;
            } catch (Exception ignored) { }
            if (!alive) break;
            try { Thread.sleep(wait); } catch (InterruptedException e) { break; }
            wait = Math.min(wait * 2, 60000);
        }
    }

    private void stream(String url, String room) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestProperty("Accept", "text/event-stream");
        c.setConnectTimeout(15000);
        c.setReadTimeout(120000); // Firebase가 30초마다 keep-alive를 보내요
        c.setInstanceFollowRedirects(true);
        synchronized (this) { conns.add(c); }
        try (BufferedReader br = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8))) {
            String line, event = "";
            while (alive && (line = br.readLine()) != null) {
                if (line.startsWith("event:")) event = line.substring(6).trim();
                else if (line.startsWith("data:")) {
                    if ("put".equals(event) || "patch".equals(event)) handle(line.substring(5).trim(), room);
                    else if ("cancel".equals(event) || "auth_revoked".equals(event)) throw new Exception(event);
                }
            }
        } finally {
            synchronized (this) { conns.remove(c); }
            c.disconnect();
        }
    }

    private void handle(String data, String room) {
        try {
            JSONObject m = new JSONObject(data);
            String path = m.optString("path", "/");
            Object d = m.opt("data");
            if (!(d instanceof JSONObject)) return;
            JSONObject o = (JSONObject) d;
            if ("/".equals(path)) {
                for (Iterator<String> it = o.keys(); it.hasNext(); ) {
                    String k = it.next();
                    JSONObject item = o.optJSONObject(k);
                    if (item != null) consider(k, item, room);
                }
            } else {
                String k = path.replaceAll("^/+", "");
                if (!k.contains("/")) consider(k, o, room);
            }
        } catch (Exception ignored) { }
    }

    private synchronized void consider(String mid, JSONObject item, String room) {
        long at = item.optLong("at", 0);
        long last = prefs.getLong("rx_last", 0);
        if (last == 0) { last = System.currentTimeMillis(); prefs.edit().putLong("rx_last", last).apply(); }
        String seen = prefs.getString("rx_seen", "");
        // 이미 알린 것, 그리고 마지막 알림보다 10분 넘게 앞선 옛날 것은 알리지 않아요 (기기 시계 차이는 허용)
        if (seen.contains(mid) || at < last - 600000) return;
        String s2 = (mid + "," + seen);
        if (s2.length() > 2000) s2 = s2.substring(0, 2000);
        prefs.edit().putString("rx_seen", s2).putLong("rx_last", Math.max(last, at)).apply();
        notify(mid, item);
    }

    private void notify(String mid, JSONObject item) {
        try {
            String me = prefs.getString("rx_person", "");
            JSONArray from = item.optJSONArray("from");
            StringBuilder who = new StringBuilder();
            if (from != null) for (int i = 0; i < from.length(); i++) {
                String n = from.getJSONObject(i).optString("name");
                if (who.length() > 0) who.append("·");
                who.append(withI(n));
            }
            JSONArray to = item.optJSONArray("to");
            boolean forMe = false;
            if (to != null) for (int i = 0; i < to.length(); i++) if (me.equals(to.optString(i))) forMe = true;

            StringBuilder body = new StringBuilder();
            JSONArray ph = item.optJSONArray("ph");
            if (ph != null) for (int i = 0; i < ph.length(); i++) {
                JSONObject p = ph.getJSONObject(i);
                if (body.length() > 0) body.append("\n");
                body.append(p.optString("label"));
                String e = p.optString("emoji", "");
                if (!e.isEmpty()) body.append(" ").append(e);
            }
            int voice = item.optInt("voice", 0);
            if (voice > 0) {
                if (body.length() > 0) body.append("\n");
                body.append("🎙 목소리 ").append(voice).append("초");
                String stt = item.optString("stt", "");
                if (!stt.isEmpty()) body.append(" · “").append(stt).append("”");
            }
            String title = "💌 " + who + "가 " + (forMe ? "보냈어요" : "가족에게 보냈어요");
            Notification n = new Notification.Builder(this, CH_MSG)
                    .setSmallIcon(R.drawable.ic_stat)
                    .setContentTitle(title)
                    .setContentText(body.toString().replace("\n", " · "))
                    .setStyle(new Notification.BigTextStyle().bigText(body.toString()))
                    .setContentIntent(openApp())
                    .setAutoCancel(true)
                    .setCategory(Notification.CATEGORY_MESSAGE)
                    .build();
            getSystemService(NotificationManager.class).notify(mid.hashCode(), n);
        } catch (Exception ignored) { }
    }

    private static String withI(String n) {
        if (n == null || n.isEmpty()) return "";
        char c = n.charAt(n.length() - 1);
        boolean batchim = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 > 0;
        return batchim ? n + "이" : n;
    }

    private PendingIntent openApp() {
        Intent i = new Intent(this, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(this, 0, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }
}
