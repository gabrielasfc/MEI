package com.example.elderwatch.ui.settings

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Switch
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.elderwatch.R
import com.example.elderwatch.auth.AuthenticationActivity
import com.example.elderwatch.auth.LoginActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class SettingsFragment : Fragment() {
    private lateinit var auth: FirebaseAuth
    private lateinit var db: FirebaseFirestore

    private lateinit var viewModel: SettingsViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_settings, container, false)
    }

    @SuppressLint("UseSwitchCompatOrMaterialCode")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this).get(SettingsViewModel::class.java)

        val nameTextView = view.findViewById<TextView>(R.id.nameTextView)
        val emailTextView = view.findViewById<TextView>(R.id.emailTextView)
        val logoutTextView = view.findViewById<TextView>(R.id.logoutTextView)

        viewModel.userData.observe(viewLifecycleOwner, Observer { userData ->
            nameTextView.text = userData.name
            emailTextView.text = userData.email
        })

        val editProfileTextView = view.findViewById<TextView>(R.id.editProfileTextView)
        val editPasswordTextView = view.findViewById<TextView>(R.id.editPasswordTextView)

        editProfileTextView.setOnClickListener {
            findNavController().navigate(R.id.action_settingsFragment_to_editProfileFragment)
        }

        editPasswordTextView.setOnClickListener {
            findNavController().navigate(R.id.action_settingsFragment_to_editPasswordFragment)
        }

        logoutTextView.setOnClickListener {
            viewModel.logout()
            val intent = Intent(activity, AuthenticationActivity::class.java)
            startActivity(intent)
        }

        viewModel.fetchUserData()
    }
}