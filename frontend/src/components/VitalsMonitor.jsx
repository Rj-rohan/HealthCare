import { useState, useEffect } from 'react'
import { HeartIcon, ArrowsUpDownIcon, FireIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline'

export default function VitalsMonitor() {
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    oxygenSaturation: 98
  })
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [history, setHistory] = useState([])

  const generateRealisticVitals = () => {
    const baseHR = 72
    const baseSys = 120
    const baseDia = 80
    const baseTemp = 98.6
    const baseO2 = 98

    return {
      heartRate: Math.round(baseHR + (Math.random() - 0.5) * 20),
      bloodPressure: {
        systolic: Math.round(baseSys + (Math.random() - 0.5) * 30),
        diastolic: Math.round(baseDia + (Math.random() - 0.5) * 20)
      },
      temperature: Math.round((baseTemp + (Math.random() - 0.5) * 2) * 10) / 10,
      oxygenSaturation: Math.round(baseO2 + (Math.random() - 0.5) * 4)
    }
  }

  useEffect(() => {
    let interval
    if (isMonitoring) {
      interval = setInterval(() => {
        const newVitals = generateRealisticVitals()
        setVitals(newVitals)
        setHistory(prev => [...prev.slice(-19), { ...newVitals, timestamp: new Date() }])
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isMonitoring])

  const getStatusColor = (type, value) => {
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return '#ef4444'
        return '#10b981'
      case 'bloodPressure':
        if (value.systolic > 140 || value.diastolic > 90) return '#ef4444'
        if (value.systolic < 90 || value.diastolic < 60) return '#f59e0b'
        return '#10b981'
      case 'temperature':
        if (value > 100.4 || value < 97) return '#ef4444'
        return '#10b981'
      case 'oxygen':
        if (value < 95) return '#ef4444'
        return '#10b981'
      default:
        return '#111827'
    }
  }

  // Removed hardcoded cardStyle - using CSS classes instead

  return (
    <div className="vitals-monitor-container">
      <div className="vitals-header">
        <div className="vitals-title-section">
          <h1 className="vitals-title">Vitals Monitor</h1>
          <p className="vitals-subtitle">Real-time patient monitoring system</p>
        </div>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`vitals-toggle-btn ${isMonitoring ? 'monitoring-active' : 'monitoring-inactive'}`}
        >
          {isMonitoring ? (<><PauseIcon className="btn-icon" aria-hidden="true" /> Stop Monitoring</>) : (<><PlayIcon className="btn-icon" aria-hidden="true" /> Start Monitoring</>)}
        </button>
      </div>
      
      <div className="vitals-grid">
        <div className="vital-card">
          <div className="vital-card-header">
            <div className="vital-icon-container">
              <HeartIcon className="icon-24" aria-hidden="true" />
            </div>
            <div className={`status-dot ${isMonitoring ? 'status-active' : 'status-inactive'}`}></div>
          </div>
          <div className="vital-content">
            <p className="vital-label">Heart Rate</p>
            <p className="vital-value" style={{ color: getStatusColor('heartRate', vitals.heartRate) }}>
              {vitals.heartRate}
            </p>
            <p className="vital-unit">BPM</p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-card-header">
            <div className="vital-icon-container">
              <ArrowsUpDownIcon className="icon-24" aria-hidden="true" />
            </div>
            <div className={`status-dot ${isMonitoring ? 'status-active' : 'status-inactive'}`}></div>
          </div>
          <div className="vital-content">
            <p className="vital-label">Blood Pressure</p>
            <p className="vital-value blood-pressure" style={{ color: getStatusColor('bloodPressure', vitals.bloodPressure) }}>
              {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
            </p>
            <p className="vital-unit">mmHg</p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-card-header">
            <div className="vital-icon-container">
              <FireIcon className="icon-24" aria-hidden="true" />
            </div>
            <div className={`status-dot ${isMonitoring ? 'status-active' : 'status-inactive'}`}></div>
          </div>
          <div className="vital-content">
            <p className="vital-label">Temperature</p>
            <p className="vital-value" style={{ color: getStatusColor('temperature', vitals.temperature) }}>
              {vitals.temperature}
            </p>
            <p className="vital-unit">°F</p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-card-header">
            <div className="vital-icon-container oxygen-icon">
              O₂
            </div>
            <div className={`status-dot ${isMonitoring ? 'status-active' : 'status-inactive'}`}></div>
          </div>
          <div className="vital-content">
            <p className="vital-label">Oxygen Saturation</p>
            <p className="vital-value" style={{ color: getStatusColor('oxygen', vitals.oxygenSaturation) }}>
              {vitals.oxygenSaturation}
            </p>
            <p className="vital-unit">%</p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="vitals-history-card">
          <h2 className="vitals-history-title">Recent Readings</h2>
          <div className="vitals-history-container">
            <div className="vitals-history-scroll">
              {history.slice(-10).map((reading, index) => (
                <div key={index} className="vitals-history-item">
                  <p className="vitals-history-time">
                    {reading.timestamp.toLocaleTimeString()}
                  </p>
                  <div className="vitals-history-data">
                    <p className="vitals-history-row">HR: <span className="vitals-history-value">{reading.heartRate}</span></p>
                    <p className="vitals-history-row">BP: <span className="vitals-history-value">{reading.bloodPressure.systolic}/{reading.bloodPressure.diastolic}</span></p>
                    <p className="vitals-history-row">Temp: <span className="vitals-history-value">{reading.temperature}°F</span></p>
                    <p className="vitals-history-row">O₂: <span className="vitals-history-value">{reading.oxygenSaturation}%</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
