package com.dadada.routine;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

/** 아이들 태블릿의 '시간 알림'과 '앱 자동으로 켜기'를 매일 정한 시각에 예약해요. */
final class AlarmScheduler {
    private AlarmScheduler() { }

    static boolean canExact(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        return am != null && (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms());
    }

    private static PendingIntent op(Context c, int code, String type, String text, int flags) {
        return op(c, code, type, text, null, flags);
    }

    private static PendingIntent op(Context c, int code, String type, String text, String id, int flags) {
        Intent i = new Intent(c, AlarmReceiver.class);
        i.setAction("wooriga.ALARM." + code);
        if (type != null) { i.putExtra("type", type); i.putExtra("text", text); }
        if (id != null) i.putExtra("id", id);
        return PendingIntent.getBroadcast(c, 1000 + code, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    private static final int STOP_CODE = 900;

    private static void at(Context c, AlarmManager am, long t, PendingIntent pi) {
        if (canExact(c)) {
            Intent show = new Intent(c, MainActivity.class);
            PendingIntent showPi = PendingIntent.getActivity(c, 999, show, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            am.setAlarmClock(new AlarmManager.AlarmClockInfo(t, showPi), pi);
        } else {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
        }
    }

    /**
     * 엄마·아빠 폰에서 보낸 '그만! 알림'을 이 태블릿에 예약하거나(같은 것이면 다시 예약) 취소해요.
     * 돌려주는 값: 태블릿이 받았다고 알려야 할 id (이미 알렸거나 받을 게 없으면 null).
     */
    static synchronized String applyStop(Context c, JSONObject o) {
        SharedPreferences p = c.getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return null;
        String id = o == null ? "" : o.optString("id", "");
        long t = o == null ? 0 : o.optLong("at", 0);
        if (id.isEmpty() || t == 0) {
            PendingIntent pi = op(c, STOP_CODE, null, null, PendingIntent.FLAG_NO_CREATE);
            if (pi != null) { am.cancel(pi); pi.cancel(); }
            p.edit().remove("stop_id").apply();
            return null;
        }
        // 이미 띄운 것, 3분 넘게 지난 것은 다시 띄우지 않아요
        if (id.equals(p.getString("stop_fired", "")) || id.equals(o.optString("done")) || t < System.currentTimeMillis() - 180000) return null;
        String text = o.optString("text", "");
        if (text.isEmpty()) text = "이제 그만! 정리하자!";
        PendingIntent pi = op(c, STOP_CODE, "stop", text, id, PendingIntent.FLAG_UPDATE_CURRENT);
        at(c, am, Math.max(t, System.currentTimeMillis() + 1000), pi);
        p.edit().putString("stop_id", id).apply();
        return id.equals(o.optString("got")) ? null : id;
    }

    static long nextTime(int h, int m, boolean weekdays) {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, h);
        cal.set(Calendar.MINUTE, m);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis() + 1000) cal.add(Calendar.DAY_OF_YEAR, 1);
        if (weekdays) {
            while (cal.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY || cal.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
                cal.add(Calendar.DAY_OF_YEAR, 1);
            }
        }
        return cal.getTimeInMillis();
    }

    /** 저장된 알림을 모두 다시 예약해요. 돌려주는 값: 가장 가까운 다음 알림 시각(없으면 0). */
    static long scheduleAll(Context c) {
        SharedPreferences p = c.getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return 0;
        int old = p.getInt("alarm_n", 0);
        for (int i = 0; i < old; i++) {
            PendingIntent pi = op(c, i, null, null, PendingIntent.FLAG_NO_CREATE);
            if (pi != null) { am.cancel(pi); pi.cancel(); }
        }
        long soonest = 0;
        int n = 0;
        try {
            JSONArray arr = new JSONArray(p.getString("alarms", "[]"));
            for (int i = 0; i < arr.length(); i++) {
                JSONObject a = arr.getJSONObject(i);
                String[] hm = a.optString("time", "").split(":");
                if (hm.length != 2) continue;
                long t = nextTime(Integer.parseInt(hm[0]), Integer.parseInt(hm[1]), a.optBoolean("weekdays"));
                PendingIntent pi = op(c, n, a.optString("type"), a.optString("text"), PendingIntent.FLAG_UPDATE_CURRENT);
                at(c, am, t, pi);
                if (soonest == 0 || t < soonest) soonest = t;
                n++;
            }
        } catch (Exception ignored) { }
        p.edit().putInt("alarm_n", n).putLong("alarm_next", soonest).apply();
        return soonest;
    }
}
