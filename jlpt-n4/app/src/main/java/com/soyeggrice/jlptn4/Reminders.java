package com.soyeggrice.jlptn4;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/** 매일 공부 알림 · 정기 모의고사 알림 */
final class Reminders {
    static final String KEY_CFG = "rem_cfg";
    static final String ACT_DAILY = "com.soyeggrice.jlptn4.DAILY";
    static final String ACT_MOCK = "com.soyeggrice.jlptn4.MOCK";
    private static final String CH = "remind";

    private Reminders() { }

    private static JSONObject cfg(Context c) {
        try {
            String j = c.getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE).getString(KEY_CFG, null);
            return j == null ? null : new JSONObject(j);
        } catch (Exception e) {
            return null;
        }
    }

    private static PendingIntent pi(Context c, String action, int code) {
        Intent i = new Intent(c, ReminderReceiver.class).setAction(action);
        return PendingIntent.getBroadcast(c, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static int[] hm(String t, int dh) {
        try {
            String[] p = t.split(":");
            return new int[]{Integer.parseInt(p[0]), Integer.parseInt(p[1])};
        } catch (Exception e) {
            return new int[]{dh, 0};
        }
    }

    /** 다음 알림 시각을 예약해요 (설정이 바뀌거나, 알림이 울리거나, 폰을 켤 때마다) */
    static void schedule(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pd = pi(c, ACT_DAILY, 1), pm = pi(c, ACT_MOCK, 2);
        am.cancel(pd);
        am.cancel(pm);
        JSONObject o = cfg(c);
        if (o == null) return;
        long now = System.currentTimeMillis();
        if (o.optBoolean("dailyOn", false)) {
            int[] t = hm(o.optString("dailyTime", "21:00"), 21);
            Calendar k = Calendar.getInstance();
            k.set(Calendar.HOUR_OF_DAY, t[0]);
            k.set(Calendar.MINUTE, t[1]);
            k.set(Calendar.SECOND, 0);
            k.set(Calendar.MILLISECOND, 0);
            if (k.getTimeInMillis() <= now + 30000) k.add(Calendar.DAY_OF_MONTH, 1);
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, k.getTimeInMillis(), pd);
        }
        int day = o.optInt("mockDay", -1);
        if (o.optBoolean("mockOn", false) && day >= 0 && day <= 6) {
            int[] t = hm(o.optString("mockTime", "20:00"), 20);
            Calendar k = Calendar.getInstance();
            k.set(Calendar.HOUR_OF_DAY, t[0]);
            k.set(Calendar.MINUTE, t[1]);
            k.set(Calendar.SECOND, 0);
            k.set(Calendar.MILLISECOND, 0);
            int want = day + 1; // Calendar: 일요일 = 1
            int add = (want - k.get(Calendar.DAY_OF_WEEK) + 7) % 7;
            k.add(Calendar.DAY_OF_MONTH, add);
            if (k.getTimeInMillis() <= now + 30000) k.add(Calendar.DAY_OF_MONTH, 7);
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, k.getTimeInMillis(), pm);
        }
    }

    private static JSONObject state(Context c) {
        try {
            String j = c.getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE).getString(MainActivity.KEY_DATA, null);
            return j == null ? null : new JSONObject(j);
        } catch (Exception e) {
            return null;
        }
    }

    private static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    private static long dLeft(String exam) {
        try {
            Date d = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(exam);
            Date t = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(today());
            return Math.round((d.getTime() - t.getTime()) / 86400000.0);
        } catch (Exception e) {
            return -999;
        }
    }

    static void fireDaily(Context c) {
        JSONObject s = state(c), o = cfg(c);
        if (s == null || o == null || !s.optBoolean("setupDone", false)) return;
        if (today().equals(s.optString("lastDay", ""))) return; // 오늘 이미 공부했어요
        JSONArray mocks = s.optJSONArray("mocks");
        String name = s.optString("name", "");
        long left = dLeft(o.optString("exam", s.optString("exam", "")));
        String dd = left >= 0 && left < 400 ? "시험까지 D-" + left + " · " : "";
        if (mocks == null || mocks.length() == 0) {
            notify(c, 11, "📍 진단 모의고사를 아직 안 봤어요",
                    dd + "지금 실력을 출발점으로 기록하면 합격까지 몇 % 남았는지 보여 줄게요", "mock");
        } else {
            notify(c, 11, (name.isEmpty() ? "" : name + ", ") + "오늘의 일본어 공부 📚",
                    dd + "10분 한 라운드만 해도 합격에 한 걸음 가까워져요", "home");
        }
    }

    static void fireMock(Context c) {
        JSONObject s = state(c);
        if (s == null || !s.optBoolean("setupDone", false)) return;
        JSONArray mocks = s.optJSONArray("mocks");
        String paused = c.getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE).getString("k_mock", null);
        if (paused != null && !paused.isEmpty()) {
            notify(c, 12, "⏸ 멈춘 모의고사가 있어요", "이어서 보고 이번 주 점수를 기록해요", "mock");
            return;
        }
        if (mocks != null && mocks.length() > 0) {
            JSONObject last = mocks.optJSONObject(mocks.length() - 1);
            long ts = last == null ? 0 : last.optLong("ts", 0);
            if (System.currentTimeMillis() - ts < (long) (4.5 * 86400000L)) return; // 최근에 이미 봤어요
            int total = last == null ? 0 : last.optInt("total", 0);
            notify(c, 12, "📝 이번 주 모의고사 볼 시간이에요!",
                    "지난번 " + total + "점 → 이번엔 몇 점일까? 일주일 동안 얼마나 늘었는지 확인해요", "mock");
        }
    }

    private static void notify(Context c, int id, String title, String text, String open) {
        try {
            if (Build.VERSION.SDK_INT >= 33
                    && c.checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) return;
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            if (nm.getNotificationChannel(CH) == null) {
                NotificationChannel ch = new NotificationChannel(CH, "공부 알림", NotificationManager.IMPORTANCE_DEFAULT);
                ch.setDescription("매일 공부 · 정기 모의고사 알림");
                nm.createNotificationChannel(ch);
            }
            Intent i = new Intent(c, MainActivity.class).putExtra("open", open)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent tap = PendingIntent.getActivity(c, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            Notification n = new Notification.Builder(c, CH)
                    .setSmallIcon(R.drawable.ic_noti)
                    .setColor(0xFFE0A93B)
                    .setContentTitle(title)
                    .setContentText(text)
                    .setStyle(new Notification.BigTextStyle().bigText(text))
                    .setContentIntent(tap)
                    .setAutoCancel(true)
                    .build();
            nm.notify(id, n);
        } catch (Exception ignored) {
        }
    }
}
