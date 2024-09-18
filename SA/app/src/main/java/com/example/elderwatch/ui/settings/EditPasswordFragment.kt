package com.example.elderwatch.ui.settings

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.navigation.fragment.findNavController
import com.example.elderwatch.R

class EditPasswordFragment : Fragment() {

    companion object {
        fun newInstance() = EditPasswordFragment()
    }

    private lateinit var viewModel: EditPasswordViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_edit_password, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this).get(EditPasswordViewModel::class.java)

        val backButton = view.findViewById<Button>(R.id.backButton)
        val editTextCurrentPassword = view.findViewById<EditText>(R.id.edittext_current_password)
        val editTextNewPassword = view.findViewById<EditText>(R.id.edittext_new_password)
        val editTextConfirmNewPassword = view.findViewById<EditText>(R.id.edittext_confirm_new_password)
        val saveButton = view.findViewById<Button>(R.id.button_change_password)

        saveButton.setOnClickListener {
            val currentPassword = editTextCurrentPassword.text.toString()
            val newPassword = editTextNewPassword.text.toString()
            val confirmNewPassword = editTextConfirmNewPassword.text.toString()

            if (newPassword != confirmNewPassword) {
                Toast.makeText(context, "As passwords introduzidas não são iguais.", Toast.LENGTH_SHORT).show()
            } else {
                viewModel.changeUserPassword(currentPassword, newPassword)
            }
        }

        viewModel.passwordChangeResult.observe(viewLifecycleOwner) { success ->
            if (success) {
                Toast.makeText(context, "A password foi alterada com sucesso.", Toast.LENGTH_SHORT).show()
                findNavController().navigate(R.id.action_editPasswordFragment_to_settingsFragment)
            } else {
                Toast.makeText(context, "Erro ao alterar a password.", Toast.LENGTH_SHORT).show()
            }
        }

        backButton.setOnClickListener {
            findNavController().navigate(R.id.action_editPasswordFragment_to_settingsFragment)
        }
    }

}