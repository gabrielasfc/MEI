package com.example.elderwatch.ui.settings

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class SettingsViewModel : ViewModel() {
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()

    val userData: MutableLiveData<UserData> = MutableLiveData()

    fun fetchUserData() {
        val user = auth.currentUser
        user?.let {
            val userId = user.uid
            db.collection("users").document(userId).get().addOnSuccessListener { document ->
                val name = document.getString("name")
                val email = document.getString("email")
                userData.postValue(UserData(name, email))
            }
        }
    }

    fun logout() {
        auth.signOut()
    }

    data class UserData(val name: String?, val email: String?)
}