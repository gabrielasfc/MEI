package com.example.elderwatch.utils

class LowPassFilter(private val alpha: Float) {
    private var xPrevious: Float = 0.0f
    private var yPrevious: Float = 0.0f
    private var zPrevious: Float = 0.0f


    fun applyFilter(inputX: Float, inputY: Float, inputZ: Float): Triple<Float, Float, Float> {
        val filteredX = alpha * xPrevious + (1 - alpha) * inputX
        val filteredY = alpha * yPrevious + (1 - alpha) * inputY
        val filteredZ = alpha * zPrevious + (1 - alpha) * inputZ

        xPrevious = filteredX
        yPrevious = filteredY
        zPrevious = filteredZ

        return Triple(filteredX, filteredY, filteredZ)
    }
}