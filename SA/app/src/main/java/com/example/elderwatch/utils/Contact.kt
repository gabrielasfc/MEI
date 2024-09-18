package com.example.elderwatch.utils

class Contact(val name: String, val email: String, val uid: String) {

    override fun toString(): String {
        return "Contact(name='$name', email='$email', uid='$uid)"
    }
}