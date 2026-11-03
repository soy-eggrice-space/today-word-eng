package com.dadada.routine;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/** 텔레그램과 Firebase에 보내는 작은 HTTP 도우미 */
final class Net {
    private Net() { }

    static String readAll(InputStream is) throws Exception {
        if (is == null) return "";
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] b = new byte[8192];
        int n;
        while ((n = is.read(b)) > 0) bo.write(b, 0, n);
        is.close();
        return bo.toString("UTF-8");
    }

    static byte[] readFile(File f) throws Exception {
        try (FileInputStream in = new FileInputStream(f)) {
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] b = new byte[8192];
            int n;
            while ((n = in.read(b)) > 0) bo.write(b, 0, n);
            return bo.toByteArray();
        }
    }

    /** Firebase REST: method = GET / PUT / PATCH. 성공하면 응답 본문, 실패하면 예외 */
    static String http(String method, String url, String body) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(12000);
        c.setReadTimeout(30000);
        if ("PATCH".equals(method)) {
            // HttpURLConnection은 PATCH를 모르기 때문에 Firebase의 method override를 써요.
            c.setRequestMethod("POST");
            c.setRequestProperty("X-HTTP-Method-Override", "PATCH");
        } else {
            c.setRequestMethod(method);
        }
        if (body != null) {
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            try (OutputStream os = c.getOutputStream()) { os.write(body.getBytes(StandardCharsets.UTF_8)); }
        }
        int code = c.getResponseCode();
        String res = readAll(code >= 400 ? c.getErrorStream() : c.getInputStream());
        c.disconnect();
        if (code >= 400) throw new Exception("http " + code);
        return res;
    }

    static JSONObject tg(String token, String method, Map<String, String> params) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL("https://api.telegram.org/bot" + token + "/" + method).openConnection();
        c.setConnectTimeout(12000);
        c.setReadTimeout(30000);
        c.setRequestMethod("POST");
        c.setDoOutput(true);
        c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        StringBuilder sb = new StringBuilder();
        if (params != null) for (Map.Entry<String, String> e : params.entrySet()) {
            if (sb.length() > 0) sb.append('&');
            sb.append(URLEncoder.encode(e.getKey(), "UTF-8")).append('=').append(URLEncoder.encode(e.getValue(), "UTF-8"));
        }
        try (OutputStream os = c.getOutputStream()) { os.write(sb.toString().getBytes(StandardCharsets.UTF_8)); }
        int code = c.getResponseCode();
        String res = readAll(code >= 400 ? c.getErrorStream() : c.getInputStream());
        c.disconnect();
        return new JSONObject(res.isEmpty() ? "{}" : res);
    }

    static JSONObject tgVoice(String token, String chat, String caption, File voice, int seconds) throws Exception {
        String b = "----wooriga" + System.currentTimeMillis();
        HttpURLConnection c = (HttpURLConnection) new URL("https://api.telegram.org/bot" + token + "/sendVoice").openConnection();
        c.setConnectTimeout(12000);
        c.setReadTimeout(60000);
        c.setRequestMethod("POST");
        c.setDoOutput(true);
        c.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + b);
        if (caption.length() > 1000) caption = caption.substring(0, 1000);
        try (OutputStream os = c.getOutputStream()) {
            field(os, b, "chat_id", chat);
            field(os, b, "caption", caption);
            field(os, b, "duration", String.valueOf(seconds));
            os.write(("--" + b + "\r\nContent-Disposition: form-data; name=\"voice\"; filename=\"voice.m4a\"\r\nContent-Type: audio/mp4\r\n\r\n").getBytes(StandardCharsets.UTF_8));
            os.write(readFile(voice));
            os.write(("\r\n--" + b + "--\r\n").getBytes(StandardCharsets.UTF_8));
        }
        int code = c.getResponseCode();
        String res = readAll(code >= 400 ? c.getErrorStream() : c.getInputStream());
        c.disconnect();
        return new JSONObject(res.isEmpty() ? "{}" : res);
    }

    private static void field(OutputStream os, String b, String name, String value) throws Exception {
        os.write(("--" + b + "\r\nContent-Disposition: form-data; name=\"" + name + "\"\r\n\r\n" + value + "\r\n").getBytes(StandardCharsets.UTF_8));
    }
}
