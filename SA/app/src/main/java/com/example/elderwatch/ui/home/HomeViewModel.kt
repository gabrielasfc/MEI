package com.example.elderwatch.ui.home

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.MutableLiveData

class HomeViewModel : ViewModel() {
    private val _isOnLiveData = MutableLiveData<Boolean>(false)
    val isOnLiveData: LiveData<Boolean> get() = _isOnLiveData

    fun toggleImage() {
        _isOnLiveData.value = _isOnLiveData.value != true
    }
}