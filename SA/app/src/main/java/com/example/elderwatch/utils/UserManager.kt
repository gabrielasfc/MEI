package com.example.elderwatch.utils

import android.location.Location

object UserManager {
    var uid: String? = null
    var email: String? = null
    var name: String? = null
    var contacts: MutableList<Contact>? = null
    var activities: MutableList<Activity>? = null
    var location: Location? = null
}