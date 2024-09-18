package com.example.elderwatch.ui.contacts

import android.app.AlertDialog
import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import androidx.core.content.ContextCompat
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.ViewModelProvider
import com.example.elderwatch.R

class DialogAddContactFragment : DialogFragment() {
    private lateinit var viewModel: ContactsViewModel

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        viewModel = ViewModelProvider(requireActivity()).get(ContactsViewModel::class.java)

        val builder = AlertDialog.Builder(activity)
        val inflater: LayoutInflater = requireActivity().layoutInflater
        val view: View = inflater.inflate(R.layout.fragment_dialog_add_contact, null)
        val emailEditText = view.findViewById<EditText>(R.id.emailEditText) // Assuming this ID in your layout

        builder.setView(view)
            .setPositiveButton("Adicionar") { dialog, which ->
                val email = emailEditText.text.toString()
                viewModel.addContact(email)
            }
            .setNegativeButton("Cancelar") { dialog, which ->
                dialog.cancel()
            }

        val alertDialog = builder.create()

        alertDialog.setOnShowListener {
            val positiveButton = alertDialog.getButton(Dialog.BUTTON_POSITIVE)
            val negativeButton = alertDialog.getButton(Dialog.BUTTON_NEGATIVE)
            positiveButton.setTextColor(ContextCompat.getColor(requireContext(), R.color.colorPrimary))
            negativeButton.setTextColor(ContextCompat.getColor(requireContext(), R.color.colorPrimary))
        }

        return alertDialog
    }


}