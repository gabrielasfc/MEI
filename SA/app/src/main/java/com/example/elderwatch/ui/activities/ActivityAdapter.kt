package com.example.elderwatch.ui.activities

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.navigation.Navigation
import androidx.recyclerview.widget.RecyclerView
import com.example.elderwatch.R
import com.example.elderwatch.utils.Activity
import java.text.SimpleDateFormat
import java.util.Locale

class ActivityAdapter(private val context: Context, private val activities: List<Activity>) :
    RecyclerView.Adapter<ActivityAdapter.ActivityViewHolder>() {

    class ActivityViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val activityTimestamp: TextView = itemView.findViewById(R.id.activity_timestamp)
        val activityFall: TextView = itemView.findViewById(R.id.activity_fall)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ActivityViewHolder {
        val view = LayoutInflater.from(context).inflate(R.layout.activity_item, parent, false)
        return ActivityViewHolder(view)
    }


    override fun onBindViewHolder(holder: ActivityViewHolder, position: Int) {
        var activity = activities[position]
        val dateFormat = SimpleDateFormat("dd/MM 'às' HH:mm", Locale.getDefault())

        holder.activityTimestamp.text = dateFormat.format(activity.timestamp.toDate())
        holder.activityFall.text = if (activity.fall) "Queda" else "Emergência"

        // Set click listener for the contact item
        holder.itemView.setOnClickListener {
            val navController = Navigation.findNavController(holder.itemView)
            val bundle = bundleOf(
                "timestamp" to activity.timestamp,
                "location" to activity.location,
                "navigation" to "activities"
            )
            navController.navigate(R.id.navigation_map_activities, bundle)
        }
    }

    override fun getItemCount(): Int {
        return activities.size
    }
}