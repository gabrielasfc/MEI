package com.example.elderwatch.utils

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.annotation.RequiresApi
import com.example.elderwatch.R
import com.google.firebase.Timestamp
import kotlin.math.pow
import kotlin.math.sqrt

class SensorService : Service(), SensorEventListener {
    private lateinit var sensorManager: SensorManager
    private var accelerometer: Sensor? = null
    private var sensorData: MutableList<HashMap<String, Any>> = mutableListOf()
    private var lastUpdate: Long = 0
    private val updateFallThreshold: Long = 10000 // 10 segundos
    private val updateLongLieThreshold: Long = 3000 // 3 segundos
    private val lowFallThreshold: Double = 2.5
    private val highFallThreshold: Double = 8.0
    private val lowLongLieThreshold: Double = 0.0
    private val highLongLieThreshold: Double = 2.0
    private var isLongLie: Boolean = false
    private val filter: LowPassFilter = LowPassFilter(alpha = 0.1f)
    override fun onCreate() {
        super.onCreate()

        sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)

        if (accelerometer != null){
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notification = Notification.Builder(this, "sensor_service")
                .setSmallIcon(R.drawable.ic_eye)
                .setColor(Color.parseColor("#FF0000"))
                .setContentTitle("Serviço de Sensorização Ativo")
                .setContentText("A coletar dados dos sensores.")
                .build()

            startForeground(1, notification)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }
    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()

        sensorManager.unregisterListener(this)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_LINEAR_ACCELERATION) {
            val (x, y, z) = filter.applyFilter(event.values[0], event.values[1], event.values[2])

            val x2: Double = x.toDouble() * x.toDouble()
            val y2: Double = y.toDouble() * y.toDouble()
            val z2: Double = z.toDouble() * z.toDouble()
            val magnitude = sqrt(x2+y2+z2)

            val data = HashMap<String, Any>()
            data["x"] = x
            data["y"] = y
            data["z"] = z
            data["magnitude"] = magnitude
            data["timestamp"] = Timestamp.now()

            sensorData.add(data)

            val currentTime = System.currentTimeMillis()

            if (isLongLie && ((currentTime - lastUpdate) > updateLongLieThreshold)){
                lastUpdate = currentTime

                val longLie = detectLongLie()

                if (longLie){
                    DataSender.sendActivity(true)

                    Log.d("LONGLIE DETECTION", "True")
                }
                else Log.d("LONGLIE DETECTION", "False")

                DataSender.sendSensorData(sensorData, longLie)

                isLongLie = false
                sensorData.clear()
            }
            else if ((currentTime - lastUpdate) > updateFallThreshold) {
                lastUpdate = currentTime

                if (detectFall()){
                    isLongLie = true

                    Log.d("FALL DETECTION", "True")
                }
                else {
                    DataSender.sendSensorData(sensorData, false)

                    Log.d("FALL DETECTION", "False")
                }

                sensorData.clear()
            }
        }
    }

    private fun detectFall(): Boolean {
        for (i in 0 until sensorData.size) {
            if ((sensorData[i]["magnitude"] as Double) < lowFallThreshold) {
                for (j in i+1 until sensorData.size) {
                    if ((sensorData[j]["magnitude"] as Double) > highFallThreshold) return true
                }
            }
        }

        return false
    }

    private fun detectLongLie(): Boolean {
        val max = sensorData.maxByOrNull { it["magnitude"] as Double } as HashMap<String, Any>
        val min = sensorData.minByOrNull { it["magnitude"] as Double } as HashMap<String, Any>

        return min["magnitude"] as Double >= lowLongLieThreshold && max["magnitude"] as Double <= highLongLieThreshold
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
    }
}