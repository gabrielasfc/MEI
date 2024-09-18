package com.example.elderwatch.ui.activities

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.elderwatch.R
import com.example.elderwatch.utils.UserManager

class ActivitiesFragment : Fragment() {

    companion object {
        fun newInstance() = ActivitiesFragment()
    }

    private lateinit var viewModel: ActivitiesViewModel
    private lateinit var activityAdapter: ActivityAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_activities, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val activityList = UserManager.activities

        activityAdapter = activityList?.let {
            ActivityAdapter(requireContext(), it)
        }!!

        view.findViewById<RecyclerView>(R.id.activities_list).apply {
            adapter = activityAdapter
            layoutManager = LinearLayoutManager(requireContext())
        }
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(ActivitiesViewModel::class.java)
        // TODO: Use the ViewModel
    }

}