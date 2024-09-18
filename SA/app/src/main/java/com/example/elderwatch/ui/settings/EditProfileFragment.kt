package com.example.elderwatch.ui.settings

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.elderwatch.R

class EditProfileFragment : Fragment() {

    companion object {
        fun newInstance() = EditProfileFragment()
    }

    private lateinit var viewModel: EditProfileViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_edit_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this)[EditProfileViewModel::class.java]

        val backButton = view.findViewById<Button>(R.id.backButton)
        val emailEditText = view.findViewById<EditText>(R.id.email)
        val nameEditText = view.findViewById<EditText>(R.id.name)
        val phoneEditText = view.findViewById<EditText>(R.id.phone)
        val saveButton = view.findViewById<Button>(R.id.savebtn)

        viewModel.userProfile.observe(viewLifecycleOwner) { data ->
            data["error"]?.let { error ->
                Toast.makeText(context, error, Toast.LENGTH_LONG).show()
            } ?: run {
                emailEditText.setText(data["email"])
                nameEditText.setText(data["name"])
                phoneEditText.setText(data["phone"])
            }
        }

        // Make the email field non-editable
        emailEditText.isEnabled = false

        saveButton.setOnClickListener {
            saveUserProfile(
                nameEditText.text.toString(),
                phoneEditText.text.toString()
            )
        }

        backButton.setOnClickListener {
            findNavController().navigate(R.id.action_editProfileFragment_to_settingsFragment)
        }
    }

    private fun saveUserProfile(name: String, phone: String) {
        viewModel.saveUserProfile(name, phone)
        Toast.makeText(context, "Alterações efetuadas com sucesso!", Toast.LENGTH_SHORT).show()
        findNavController().navigate(R.id.action_editProfileFragment_to_settingsFragment)
    }
}