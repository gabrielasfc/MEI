package com.example.elderwatch.ui.home

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import com.example.elderwatch.utils.DataSender
import com.example.elderwatch.R

class HomeFragment : Fragment() {

    companion object {
        fun newInstance() = HomeFragment()
    }

    private lateinit var viewModel: HomeViewModel
    private lateinit var imageView: ImageView
    private var isOn: Boolean = false

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val view = inflater.inflate(R.layout.fragment_home, container, false)
        imageView = view.findViewById(R.id.imageView)

        imageView.setOnClickListener {
            isOn = !isOn // Toggle the isOn state
            imageView.setImageResource(if (isOn) R.drawable.sos_on else R.drawable.sos_off)

            // If it's on, set it to off after 1 second
            if (isOn) {
                Handler(Looper.getMainLooper()).postDelayed({
                    isOn = false
                    imageView.setImageResource(R.drawable.sos_off)
                }, 100) // 100 milliseconds delay for 1 second
            }
            
            // Enviar notificações
            DataSender.sendActivity(false)
        }

        return view
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this)[HomeViewModel::class.java]
        // TODO: Use the ViewModel
    }
}