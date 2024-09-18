package com.example.elderwatch.utils

import android.location.Location
import android.util.Log
import com.google.android.gms.maps.model.LatLng
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.util.Properties

object DataSender {
    fun sendToken(token: String) {
        val db = FirebaseFirestore.getInstance()
        val uid = UserManager.uid

        val tokenField = hashMapOf(
            "token" to token
        )

        if (uid != null) {
            db.collection("users")
                .document(uid)
                .update(tokenField as Map<String, Any>)
        }
    }

    fun sendLocation(location: Location) {
        UserManager.location = location

        val db = FirebaseFirestore.getInstance()
        val uid = UserManager.uid
        val locationValues = hashMapOf(
            "latitude" to location.latitude,
            "longitude" to location.longitude,
            "timestamp" to FieldValue.serverTimestamp()
        )
        val location = hashMapOf(
            "location" to locationValues
        )

        if (uid != null) {
            db.collection("users")
                .document(uid)
                .update(location as Map<String, Any>)
        }
    }

    fun sendNotification(endpoint: String, token: Any?, title: String, body: String) {
        val client = OkHttpClient()

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val json = """
            {
                "token": "$token",
                "title": "$title",
                "body": "$body"
            }
        """.trimIndent()

        val body = json.toRequestBody(mediaType)
        val request = Request.Builder()
            .url(endpoint)
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onResponse(call: Call, response: Response) {
                println("Response: ${response.body?.string()}")
            }

            override fun onFailure(call: Call, e: IOException) {
                println("Error: ${e.message}")
            }
        })
    }

    fun sendActivity(isFall: Boolean) {
        val db = FirebaseFirestore.getInstance()
        val contacts = UserManager.contacts
        val uid = UserManager.uid

        // Adicionar queda à lista de quedas
        if (uid != null) {
            val timestamp = Timestamp.now()
            val location = UserManager.location
            var locMap: HashMap<String, Double>? = null

            if (location != null) {
                locMap = hashMapOf(
                    "latitude" to location.latitude,
                    "longitude" to location.longitude
                )
            }

            val activity = hashMapOf(
                "timestamp" to timestamp,
                "location" to locMap,
                "fall" to isFall
            )

            if (location != null) {
                UserManager.activities?.add(
                    0,
                    Activity(timestamp, LatLng(location.latitude, location.longitude), isFall)
                )

                db.collection("users")
                    .document(uid)
                    .update("activities", FieldValue.arrayUnion(activity))
            }
        }

        // Notificar todos os contactos
        if (contacts != null) {
            val tokens = mutableSetOf<String>()

            for (contact in contacts) {
                db.collection("users")
                    .document(contact.uid)
                    .get()
                    .addOnSuccessListener { document ->
                        if (document != null) {
                            val token = document.get("token")

                            if (token != null && !tokens.contains(token)) {
                                tokens.add(token.toString())

                                val endpoint = "http://34.27.216.187:80/send"
                                val title =
                                    if (isFall) "Alerta de queda!" else "Alerta de emergência!"
                                val body =
                                    if (isFall) "O utilizador ${UserManager.name} possivelmente sofreu uma queda." else "O utilizador ${UserManager.name} premiu o botão de emergência."

                                sendNotification(endpoint, token, title, body)
                            }
                        }
                    }
            }
        }
    }

    fun sendSensorData(data: MutableList<HashMap<String, Any>>, fall: Boolean) {
        val db = FirebaseFirestore.getInstance()
        val uid = UserManager.uid

        val document = hashMapOf(
            "uid" to uid,
            "data" to data,
            "fall" to fall
        )

        db.collection("data")
            .add(document)
    }
}