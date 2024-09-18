package com.example.elderwatch.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.activity.ComponentActivity
import com.example.elderwatch.MainActivity
import com.example.elderwatch.R
import com.example.elderwatch.utils.Contact
import com.example.elderwatch.utils.Activity
import com.example.elderwatch.utils.UserManager
import com.google.android.gms.maps.model.LatLng
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.ktx.Firebase

class LoginActivity : ComponentActivity() {
    private lateinit var auth: FirebaseAuth
    private var db = FirebaseFirestore.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        auth = Firebase.auth

        val loginButton = findViewById<Button>(R.id.loginbtn)
        val backButton = findViewById<ImageButton>(R.id.backButton)

        loginButton.setOnClickListener {
            val email = findViewById<EditText>(R.id.email).text.toString()
            val password = findViewById<EditText>(R.id.password).text.toString()

            auth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(this) { task ->
                    if (task.isSuccessful) {
                        val user = auth.currentUser

                        if (user != null) {
                            db.collection("users")
                                .document(user.uid)
                                .get()
                                .addOnSuccessListener { document ->
                                    if (document != null) {
                                        UserManager.uid = user.uid
                                        UserManager.email = user.email
                                        UserManager.name = document.get("name") as String
                                        UserManager.location = null
                                        UserManager.contacts = mutableListOf()

                                        val activities = document.get("activities") as MutableList<HashMap<String, Any>>?

                                        if (activities != null) {
                                            var temp = mutableListOf<Activity>()
                                            for (activity in activities) {
                                                val location = activity["location"] as HashMap<String, Double>

                                                temp.add(Activity(activity["timestamp"] as Timestamp,
                                                                LatLng(location["latitude"] as Double,
                                                                       location["longitude"] as Double),
                                                                activity["fall"] as Boolean))
                                            }

                                            UserManager.activities = temp
                                            UserManager.activities?.reverse()
                                        }

                                        val uids = document.get("contacts") as MutableList<String>?

                                        if(uids != null) {
                                            for (uid in uids) {
                                                db.collection("users")
                                                    .document(uid)
                                                    .get()
                                                    .addOnSuccessListener {document ->
                                                        if(document.exists()) {
                                                            val contact = Contact(document.get("name") as String
                                                                , document.get("email") as String
                                                                , uid)

                                                            UserManager.contacts?.add(contact)
                                                        }
                                                    }
                                            }
                                        }

                                        val intent = Intent(this, MainActivity::class.java)
                                        startActivity(intent)
                                    } else {
                                        Toast.makeText(baseContext, "Erro no login", Toast.LENGTH_SHORT).show()
                                    }
                                }
                        }
                    } else {
                        Toast.makeText(baseContext, "Erro no login", Toast.LENGTH_SHORT).show()
                    }
                }
        }

        backButton.setOnClickListener {
            val intent = Intent(this, AuthenticationActivity::class.java)
            startActivity(intent)
        }
    }
}