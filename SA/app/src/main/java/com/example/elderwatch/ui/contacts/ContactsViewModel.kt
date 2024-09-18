package com.example.elderwatch.ui.contacts

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.elderwatch.utils.Contact
import com.example.elderwatch.utils.UserManager
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore

class ContactsViewModel : ViewModel() {
    private val _contacts = MutableLiveData<List<Contact>>()
    val contacts: LiveData<List<Contact>> = _contacts

    init {
        fetchData()
    }

    private fun fetchData() {
        _contacts.value = UserManager.contacts
    }

    fun addContact(email: String) {
        val db = FirebaseFirestore.getInstance()

        db.collection("users").whereEqualTo("email", email).get()
            .addOnSuccessListener { documents ->
                for (document in documents) {
                    val name = document.getString("name") ?: ""
                    val uid = document.id
                    val contact = Contact(name, email, uid)

                    val updatedContacts = ArrayList(_contacts.value ?: emptyList())
                    updatedContacts.add(contact)
                    _contacts.value = updatedContacts
                    UserManager.contacts = updatedContacts

                    val userDocument = UserManager.uid?.let { db.collection("users").document(it) }

                    userDocument?.update("contacts", FieldValue.arrayUnion(uid))
                        ?.addOnSuccessListener {
                            Log.d("Firestore", "Contact successfully added to contacts array!")
                        }?.addOnFailureListener { e ->
                        Log.e("Firestore", "Error adding contact to contacts array", e)
                    }
                }
            }
            .addOnFailureListener {
                Log.d("AddContact", "Error getting documents: ", it)
            }
    }

    fun removeContact(uid: String) {
        val db = FirebaseFirestore.getInstance()

        val updatedContacts = ArrayList(_contacts.value ?: emptyList())
        updatedContacts.removeAll { it.uid == uid }
        _contacts.value = updatedContacts
        UserManager.contacts = updatedContacts

        val userDocument = UserManager.uid?.let { db.collection("users").document(it) }
        userDocument?.update("contacts", FieldValue.arrayRemove(uid))
            ?.addOnSuccessListener {
                Log.d("Firestore", "Contact successfully removed from contacts array!")
            }?.addOnFailureListener { e ->
                Log.e("Firestore", "Error removing contact from contacts array", e)
            }
    }
}