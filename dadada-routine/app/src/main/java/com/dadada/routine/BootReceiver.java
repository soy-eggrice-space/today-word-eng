package com.dadada.routine;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** 폰을 껐다 켜도 받는 폰이면 알림 기다리기를 다시 시작해요. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction();
        if (!Intent.ACTION_BOOT_COMPLETED.equals(a) && !Intent.ACTION_MY_PACKAGE_REPLACED.equals(a)) return;
        String base = c.getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE).getString("rx_base", "");
        if (!base.isEmpty()) InboxService.start(c);
    }
}
