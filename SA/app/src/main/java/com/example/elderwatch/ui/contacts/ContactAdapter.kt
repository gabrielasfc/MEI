package com.example.elderwatch.ui.contacts

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.navigation.Navigation
import androidx.recyclerview.widget.RecyclerView
import com.example.elderwatch.R
import com.example.elderwatch.utils.Contact
import com.google.android.gms.maps.model.LatLng
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore

class ContactAdapter(private val context: Context, private var contacts: MutableList<Contact>) :
    RecyclerView.Adapter<ContactAdapter.ContactViewHolder>() {

    class ContactViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val contactName: TextView = itemView.findViewById(R.id.contact_name)
        val contactEmail: TextView = itemView.findViewById(R.id.contact_email)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ContactViewHolder {
        val view = LayoutInflater.from(context).inflate(R.layout.contact_item, parent, false)
        return ContactViewHolder(view)
    }

    override fun onBindViewHolder(holder: ContactViewHolder, position: Int) {
        val db = FirebaseFirestore.getInstance()
        val contact = contacts[position]
        holder.contactName.text = contact.name
        holder.contactEmail.text = contact.email

        // Set click listener for the contact item
        holder.itemView.setOnClickListener {
            db.collection("users")
                .document(contact.uid)
                .get()
                .addOnSuccessListener {document ->
                    val location = document.get("location") as? Map<String, Any>

                    val navController = Navigation.findNavController(holder.itemView)
                    val bundle = bundleOf(
                        "contactId" to contact.uid,
                        "location" to LatLng(
                            location?.get("latitude") as Double,
                            location.get("longitude") as Double
                        ),
                        "timestamp" to (location.get("timestamp") ?: Timestamp.now()),
                        "navigation" to "contacts"
                    )
                    navController.navigate(R.id.navigation_map_contacts, bundle)
                }
        }
    }

    override fun getItemCount(): Int {
        return contacts.size
    }

    @SuppressLint("NotifyDataSetChanged")
    fun updateContacts(newContacts: List<Contact>) {
        contacts.clear()
        contacts.addAll(newContacts)
        notifyDataSetChanged()
    }
}