import { useState, useEffect } from 'react'

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

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6',
    transition: 'all 0.3s ease'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      padding: '32px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>Vitals Monitor</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Real-time patient monitoring system</p>
        </div>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: isMonitoring ? '#ef4444' : '#10b981',
            color: 'white',
            transition: 'all 0.2s ease'
          }}
        >
          {isMonitoring ? '⏸️ Stop Monitoring' : '▶️ Start Monitoring'}
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '24px' }}>❤️</div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isMonitoring ? '#10b981' : '#d1d5db',
              animation: isMonitoring ? 'pulse 2s infinite' : 'none'
            }}></div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Heart Rate</p>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: getStatusColor('heartRate', vitals.heartRate),
              margin: 0
            }}>
              {vitals.heartRate}
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>BPM</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '24px' }}>🩸</div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isMonitoring ? '#10b981' : '#d1d5db',
              animation: isMonitoring ? 'pulse 2s infinite' : 'none'
            }}></div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Blood Pressure</p>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: getStatusColor('bloodPressure', vitals.bloodPressure),
              margin: 0
            }}>
              {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>mmHg</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '24px' }}>🌡️</div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isMonitoring ? '#10b981' : '#d1d5db',
              animation: isMonitoring ? 'pulse 2s infinite' : 'none'
            }}></div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Temperature</p>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: getStatusColor('temperature', vitals.temperature),
              margin: 0
            }}>
              {vitals.temperature}
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>°F</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>O₂</div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isMonitoring ? '#10b981' : '#d1d5db',
              animation: isMonitoring ? 'pulse 2s infinite' : 'none'
            }}></div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Oxygen Saturation</p>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: getStatusColor('oxygen', vitals.oxygenSaturation),
              margin: 0
            }}>
              {vitals.oxygenSaturation}
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>%</p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{
          ...cardStyle,
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '16px' }}>Recent Readings</h2>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px' }}>
              {history.slice(-10).map((reading, index) => (
                <div key={index} style={{
                  flexShrink: 0,
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px',
                  minWidth: '180px'
                }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                    {reading.timestamp.toLocaleTimeString()}
                  </p>
                  <div style={{ fontSize: '14px' }}>
                    <p style={{ margin: '4px 0' }}>HR: <span style={{ fontWeight: '500' }}>{reading.heartRate}</span></p>
                    <p style={{ margin: '4px 0' }}>BP: <span style={{ fontWeight: '500' }}>{reading.bloodPressure.systolic}/{reading.bloodPressure.diastolic}</span></p>
                    <p style={{ margin: '4px 0' }}>Temp: <span style={{ fontWeight: '500' }}>{reading.temperature}°F</span></p>
                    <p style={{ margin: '4px 0' }}>O₂: <span style={{ fontWeight: '500' }}>{reading.oxygenSaturation}%</span></p>
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