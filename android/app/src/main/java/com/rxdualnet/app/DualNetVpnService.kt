package com.rxdualnet.app

import android.content.Intent
import android.net.VpnService
import android.os.IBinder

class DualNetVpnService : VpnService() {

    override fun onBind(intent: Intent?): IBinder? {
        return super.onBind(intent)
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        // Layanan VPN belum menjalankan tunnel.
        // Engine Xray akan diintegrasikan pada tahap berikutnya.

        return START_NOT_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
    }
}
