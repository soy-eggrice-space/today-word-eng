package com.soyeggrice.jlptn4;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** 예약한 시각이 되면 알림을 띄우고, 다음 알림을 다시 예약해요. 폰을 다시 켜도 이어져요. */
public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent intent) {
        String a = intent == null ? null : intent.getAction();
        if (Reminders.ACT_DAILY.equals(a)) Reminders.fireDaily(c);
        else if (Reminders.ACT_MOCK.equals(a)) Reminders.fireMock(c);
        Reminders.schedule(c);
    }
}
