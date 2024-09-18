package com.example.elderwatch.ui.contacts

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.elderwatch.R
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.firebase.Timestamp
import java.text.SimpleDateFormat
import java.util.Locale

class MapFragment : Fragment(), OnMapReadyCallback {
    private lateinit var contactsViewModel: ContactsViewModel

    private lateinit var map: GoogleMap
    private lateinit var contactId: String
    private lateinit var location: LatLng
    private lateinit var timestamp: Timestamp

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_map_contacts, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val mapFragment = childFragmentManager.findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        val centerButton = view.findViewById<Button>(R.id.btnCenter)
        centerButton.setOnClickListener {
            centerMap()
        }

        val backButton = view.findViewById<Button>(R.id.backButton)
        backButton.setOnClickListener {
            findNavController().navigate(R.id.action_mapFragment_to_contactsFragment)
        }

        contactId = arguments?.get("contactId") as String
        location = arguments?.get("location") as LatLng
        timestamp = arguments?.get("timestamp") as Timestamp

        val lastUpdate = formatLastUpdate(timestamp)

        val textView = view?.findViewById<TextView>(R.id.lastUpdateTextView)
        textView?.text = "Última Atualização: $lastUpdate"

        contactsViewModel = ViewModelProvider(requireActivity()).get(ContactsViewModel::class.java)
        val removeContactButton = view.findViewById<Button>(R.id.removeContactButton)
        removeContactButton.setOnClickListener {
            contactsViewModel.removeContact(contactId)
            findNavController().navigate(R.id.action_mapFragment_to_contactsFragment)
        }

        setupMap()
    }

    private fun setupMap() {
        if (::map.isInitialized) {
            updateMap()
        }
    }

    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap
        map.mapType = GoogleMap.MAP_TYPE_HYBRID

        updateMap()
    }

    private fun updateMap() {
        if (::map.isInitialized) {
            map.clear()
            map.addMarker(MarkerOptions().position(location))

            val cameraPosition = CameraPosition.Builder()
                .target(location)
                .zoom(19f)
                .build()

            map.moveCamera(CameraUpdateFactory.newCameraPosition(cameraPosition))
        }
    }

    private fun centerMap() {
        if (::map.isInitialized) {
            updateMap()
        }
    }

    private fun formatLastUpdate(timestamp: Timestamp): String {
        val date = timestamp.toDate()
        val dateFormat = SimpleDateFormat("dd/MM 'às' HH:mm", Locale.getDefault())

        return dateFormat.format(date)
    }
}