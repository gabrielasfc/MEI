package com.example.elderwatch.auth

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.activity.ComponentActivity
import com.example.elderwatch.R
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.ktx.Firebase

class RegisterActivity : ComponentActivity() {
    private lateinit var auth: FirebaseAuth
    private lateinit var db: FirebaseFirestore

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        auth = Firebase.auth
        db = FirebaseFirestore.getInstance()

        val registerButton = findViewById<Button>(R.id.registerbtn)
        val backButton = findViewById<ImageButton>(R.id.backButton)

        registerButton.setOnClickListener {
            val email = findViewById<EditText>(R.id.email).text.toString()
            val name = findViewById<EditText>(R.id.name).text.toString()
            val phone = findViewById<EditText>(R.id.phone).text.toString()
            val password = findViewById<EditText>(R.id.password).text.toString()

            if (email.isNotEmpty() && name.isNotEmpty() && phone.isNotEmpty() && password.isNotEmpty()) {
                auth.createUserWithEmailAndPassword(email, password)
                    .addOnCompleteListener(this) { task ->
                        if (task.isSuccessful) {
                            val user = auth.currentUser

                            if (user != null) {
                                val doc = hashMapOf(
                                    "email" to user.email,
                                    "name" to name,
                                    "phone" to phone,
                                    "contacts" to mutableListOf<Any>(),
                                    "activities" to mutableListOf<Any>()
                                )

                                db.collection("users")
                                    .document(user.uid)
                                    .set(doc)
                                    .addOnSuccessListener {
                                        Toast.makeText(baseContext, "Registo com sucesso", Toast.LENGTH_SHORT).show()

                                        // Redireciona para o login
                                        val intent = Intent(this, LoginActivity::class.java)
                                        startActivity(intent)
                                    }
                                    .addOnFailureListener { e ->
                                        Log.w("REGISTER", "Error adding document", e)
                                    }
                            }
                        } else {
                            Toast.makeText(baseContext, "Erro no registo", Toast.LENGTH_SHORT).show()
                        }
                    }
            } else {
                Toast.makeText(this, "Todos os campos tem de ser preenchidos", Toast.LENGTH_SHORT).show()
            }
        }

        backButton.setOnClickListener {
            val intent = Intent(this, AuthenticationActivity::class.java)
            startActivity(intent)
        }
    }
}