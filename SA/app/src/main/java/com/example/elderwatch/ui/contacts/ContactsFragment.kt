package com.example.elderwatch.ui.contacts

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.elderwatch.R
import com.example.elderwatch.utils.UserManager

class ContactsFragment : Fragment() {

    companion object {
        fun newInstance() = ContactsFragment()
    }

    private lateinit var viewModel: ContactsViewModel
    private lateinit var contactAdapter: ContactAdapter
    private lateinit var recyclerView: RecyclerView

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_contacts, container, false)
    }

    @SuppressLint("NotifyDataSetChanged")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(requireActivity()).get(ContactsViewModel::class.java)

        val contactList = UserManager.contacts?.toMutableList()
        contactAdapter = contactList?.let { ContactAdapter(requireContext(), it) }!!
        setupRecyclerView(view)

        viewModel.contacts.observe(viewLifecycleOwner) { contacts ->
            contactAdapter.updateContacts(contacts)
        }

        view.findViewById<Button>(R.id.addContactButton).setOnClickListener {
            showAddContactDialog()
        }
    }

    private fun setupRecyclerView(view: View) {
        recyclerView = view.findViewById<RecyclerView>(R.id.contact_list).apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = contactAdapter
        }
    }

    private fun showAddContactDialog() {
        val dialogFragment = DialogAddContactFragment()
        dialogFragment.show(childFragmentManager, "AddContactDialog")
    }
}