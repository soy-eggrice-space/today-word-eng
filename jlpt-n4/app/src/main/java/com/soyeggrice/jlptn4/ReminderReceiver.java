package com.soyeggrice.jlptn4;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent intent) {
        String a = intent == null ? null : intent.getAction();
        if (Reminders.ACT_DAILY.equals(a)) Reminders.fireDaily(c);
        else if (Reminders.ACT_MOCK.equals(a)) Reminders.fireMock(c);
        Reminders.schedule(c);
    }
}
