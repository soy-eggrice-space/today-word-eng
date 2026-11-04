package com.dadada.routine;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;

/** 정한 시각이 되면 우리가족 앱을 맨 앞으로 띄우고(시간 알림이면 큰 창 + 읽어 주기), 다음 날로 다시 예약해요. */
public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent in) {
        String type = in.getStringExtra("type");
        String text = in.getStringExtra("text");
        if ("stop".equals(type)) {
            String id = in.getStringExtra("id");
            c.getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE).edit().putString("stop_fired", id == null ? "" : id).apply();
        }
        Intent a = new Intent(c, MainActivity.class);
        a.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        a.putExtra("alarm_type", type == null ? "say" : type);
        a.putExtra("alarm_text", text == null ? "" : text);
        boolean started = false;
        try {
            if (Build.VERSION.SDK_INT < 29 || Settings.canDrawOverlays(c)) { c.startActivity(a); started = true; }
        } catch (Exception ignored) { }
        if (!started) notifyFallback(c, a, type, text);
        AlarmScheduler.scheduleAll(c);
    }

    // '다른 앱 위에 표시'가 허용되지 않았을 때: 눌러서 여는 알림(가능하면 전체 화면)으로 대신 알려요
    private void notifyFallback(Context c, Intent a, String type, String text) {
        try {
            NotificationManager nm = c.getSystemService(NotificationManager.class);
            NotificationChannel ch = new NotificationChannel("wooriga_alarm", "시간 알림", NotificationManager.IMPORTANCE_HIGH);
            nm.createNotificationChannel(ch);
            PendingIntent pi = PendingIntent.getActivity(c, 77, a, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            Notification n = new Notification.Builder(c, "wooriga_alarm")
                    .setSmallIcon(R.drawable.ic_stat)
                    .setContentTitle("우리가족")
                    .setContentText("open".equals(type) ? "우리가족 앱을 열 시간이에요" : text)
                    .setContentIntent(pi)
                    .setFullScreenIntent(pi, true)
                    .setCategory(Notification.CATEGORY_ALARM)
                    .setAutoCancel(true)
                    .build();
            nm.notify("stop".equals(type) ? 7721 : 7720, n);
        } catch (Exception ignored) { }
    }
}
