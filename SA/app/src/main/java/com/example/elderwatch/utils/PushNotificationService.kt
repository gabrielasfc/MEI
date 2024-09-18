package com.example.elderwatch.utils

import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.elderwatch.R
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class PushNotificationService: FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        message.notification?.let {
            val channelId = "falls"
            val notificationBuilder = NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.drawable.ic_eye)
                .setColor(Color.parseColor("#FF0000"))
                .setContentTitle(it.title)
                .setContentText(it.body)

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(1, notificationBuilder.build())
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)

        val db = FirebaseFirestore.getInstance()
        val tokenField = hashMapOf(
            "token" to token
        )

        UserManager.uid?.let {
            db.collection("users")
                .document(it)
                .update(tokenField as Map<String, Any>)
        }
    }

}