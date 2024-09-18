package com.example.elderwatch.ui.settings

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class EditProfileViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    val userProfile = MutableLiveData<Map<String, String?>>()

    init {
        loadUserProfile()
    }

    private fun loadUserProfile() {
        val user = auth.currentUser
        user?.let { firebaseUser ->
            db.collection("users").document(firebaseUser.uid).get().addOnSuccessListener { document ->
                if (document.exists()) {
                    val userData = mapOf(
                        "email" to document.getString("email"),
                        "name" to document.getString("name"),
                        "phone" to document.getString("phone")
                    )
                    userProfile.postValue(userData)
                } else {
                    userProfile.postValue(mapOf("error" to "User not found"))
                }
            }.addOnFailureListener {
                userProfile.postValue(mapOf("error" to "Error fetching user data"))
            }
        }
    }

    fun saveUserProfile(name: String, phone: String) {
        val user = auth.currentUser
        user?.let { firebaseUser ->
            val userUpdates = mapOf(
                "name" to name,
                "phone" to phone
            )
            db.collection("users").document(firebaseUser.uid).update(userUpdates)
                .addOnSuccessListener {
                    userProfile.postValue(userUpdates)
                }.addOnFailureListener { e ->
                    userProfile.postValue(mapOf("error" to "Failed to save user profile: ${e.message}"))
                }
        }
    }
}