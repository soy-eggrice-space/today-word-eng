package com.dadada.routine;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.Build;

import java.security.MessageDigest;

/**
 * 같은 태블릿의 '솔정마을'·'다연마을'에만 아이들 캐릭터 그림을 빌려줘요.
 * 앱 이름과 서명(우리 집 서명키)이 둘 다 맞아야 읽을 수 있고, 친구용 앱(오늘공부·단어마을)은 못 읽어요.
 */
public class CharProvider extends ContentProvider {
    static final String KEY = "shared_chars";
    private static final String[] ALLOW = {"com.dayeon.soljeong", "com.dayeon.soljeong.mobile", "com.dayeon.words", "com.dayeon.words.mobile"};
    private static final String CERT = "caa503897e02f3212cb93de6b1e15ee5a028592a0fcfc5162b916823468f5ba3";

    @Override public boolean onCreate() { return true; }

    private boolean trusted() {
        String pkg = getCallingPackage();
        if (pkg == null) return false;
        boolean ok = false;
        for (String a : ALLOW) if (a.equals(pkg)) ok = true;
        if (!ok) return false;
        try {
            PackageManager pm = getContext().getPackageManager();
            Signature[] sigs;
            if (Build.VERSION.SDK_INT >= 28) {
                PackageInfo pi = pm.getPackageInfo(pkg, PackageManager.GET_SIGNING_CERTIFICATES);
                if (pi.signingInfo == null) return false;
                sigs = pi.signingInfo.getApkContentsSigners();
            } else {
                PackageInfo pi = pm.getPackageInfo(pkg, PackageManager.GET_SIGNATURES);
                sigs = pi.signatures;
            }
            if (sigs == null) return false;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            for (Signature s : sigs) {
                byte[] d = md.digest(s.toByteArray());
                StringBuilder sb = new StringBuilder();
                for (byte b : d) sb.append(String.format("%02x", b));
                if (CERT.equals(sb.toString())) return true;
            }
        } catch (Exception ignored) { }
        return false;
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        MatrixCursor c = new MatrixCursor(new String[]{"json"});
        if (!trusted()) return c;
        String j = getContext().getSharedPreferences(MainActivity.PREFS, Context.MODE_PRIVATE).getString(KEY, "[]");
        c.addRow(new Object[]{j});
        return c;
    }

    @Override public String getType(Uri uri) { return "application/json"; }
    @Override public Uri insert(Uri uri, ContentValues values) { return null; }
    @Override public int delete(Uri uri, String s, String[] a) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String s, String[] a) { return 0; }
}
