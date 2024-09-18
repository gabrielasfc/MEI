package com.example.elderwatch.utils

import com.google.android.gms.maps.model.LatLng
import com.google.firebase.Timestamp

class Activity(val timestamp: Timestamp, val location: LatLng, val fall: Boolean) {
}