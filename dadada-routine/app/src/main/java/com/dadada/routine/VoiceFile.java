package com.dadada.routine;

import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.media.MediaMuxer;

import java.io.File;
import java.nio.ByteBuffer;

/** 녹음한 PCM(16kHz, 모노)을 텔레그램 음성 메시지로 보낼 수 있는 m4a(AAC)로 바꿔요. */
final class VoiceFile {
    private VoiceFile() { }

    static File toM4a(byte[] pcm, int sampleRate, File out) throws Exception {
        MediaFormat fmt = MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_AAC, sampleRate, 1);
        fmt.setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC);
        fmt.setInteger(MediaFormat.KEY_BIT_RATE, 48000);
        fmt.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, 16384);

        MediaCodec codec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC);
        codec.configure(fmt, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
        codec.start();
        if (out.exists()) out.delete();
        MediaMuxer mux = new MediaMuxer(out.getPath(), MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);

        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        int track = -1, pos = 0;
        boolean muxing = false, inputDone = false, outputDone = false;
        long guard = System.currentTimeMillis() + 20000;
        try {
            while (!outputDone && System.currentTimeMillis() < guard) {
                if (!inputDone) {
                    int ii = codec.dequeueInputBuffer(10000);
                    if (ii >= 0) {
                        ByteBuffer in = codec.getInputBuffer(ii);
                        in.clear();
                        int n = Math.min(in.remaining(), pcm.length - pos);
                        long pts = (long) (pos / 2) * 1_000_000L / sampleRate;
                        if (n <= 0) {
                            codec.queueInputBuffer(ii, 0, 0, pts, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
                            inputDone = true;
                        } else {
                            in.put(pcm, pos, n);
                            codec.queueInputBuffer(ii, 0, n, pts, 0);
                            pos += n;
                        }
                    }
                }
                int oi = codec.dequeueOutputBuffer(info, 10000);
                if (oi == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    track = mux.addTrack(codec.getOutputFormat());
                    mux.start();
                    muxing = true;
                } else if (oi >= 0) {
                    ByteBuffer ob = codec.getOutputBuffer(oi);
                    if ((info.flags & MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0) info.size = 0;
                    if (info.size > 0 && muxing && ob != null) {
                        ob.position(info.offset);
                        ob.limit(info.offset + info.size);
                        mux.writeSampleData(track, ob, info);
                    }
                    codec.releaseOutputBuffer(oi, false);
                    if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) outputDone = true;
                }
            }
        } finally {
            try { codec.stop(); } catch (Exception ignored) { }
            codec.release();
            try { if (muxing) mux.stop(); } catch (Exception ignored) { }
            mux.release();
        }
        if (!outputDone) throw new Exception("encode timeout");
        return out;
    }
}
