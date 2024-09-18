package com.example.elderwatch.ui.settings

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.Firebase
import com.google.firebase.auth.EmailAuthProvider
import com.google.firebase.auth.auth

class EditPasswordViewModel : ViewModel() {
    private val _passwordChangeResult = MutableLiveData<Boolean>()
    val passwordChangeResult: LiveData<Boolean>
        get() = _passwordChangeResult

    fun changeUserPassword(currentPassword: String, newPassword: String) {
        val user = Firebase.auth.currentUser
        // Get auth credentials from the user for re-authentication
        val credential = EmailAuthProvider.getCredential(user!!.email!!, currentPassword)

        // Prompt the user to re-provide their sign-in credentials
        user.reauthenticate(credential).addOnCompleteListener { task ->
            if (task.isSuccessful) {
                user.updatePassword(newPassword).addOnCompleteListener { task ->
                    _passwordChangeResult.postValue(task.isSuccessful)
                }
            } else {
                _passwordChangeResult.postValue(false)
            }
        }
    }
}