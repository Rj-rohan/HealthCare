import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 1247,
    activeConsultations: 23,
    completedAnalyses: 89,
    healthAlerts: 5
  })
  const [activities, setActivities] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  const generateActivity = () => {
    const types = ['Symptom Check', 'Image Analysis', 'Chat Session', 'Vitals Review', 'Health Recommendation']
    const patients = ['John D.', 'Sarah M.', 'Mike R.', 'Emma L.', 'Alex K.', 'Lisa P.', 'David W.']
    const statuses = ['completed', 'processing', 'pending']
    
    return {
      id: Date.now() + Math.random(),
      type: types[Math.floor(Math.random() * types.length)],
      patient: patients[Math.floor(Math.random() * patients.length)],
      time: new Date(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }
  }

  useEffect(() => {
    const initialActivities = Array.from({ length: 5 }, () => {
      const activity = generateActivity()
      activity.time = new Date(Date.now() - Math.random() * 3600000)
      return activity
    })
    setActivities(initialActivities)

    const interval = setInterval(() => {
      setCurrentTime(new Date())
      
      if (Math.random() > 0.7) {
        setStats(prev => ({
          totalPatients: prev.totalPatients + Math.floor(Math.random() * 3),
          activeConsultations: Math.max(0, prev.activeConsultations + (Math.random() > 0.5 ? 1 : -1)),
          completedAnalyses: prev.completedAnalyses + Math.floor(Math.random() * 2),
          healthAlerts: Math.max(0, prev.healthAlerts + (Math.random() > 0.8 ? 1 : 0))
        }))
      }
      
      if (Math.random() > 0.6) {
        const newActivity = generateActivity()
        setActivities(prev => [newActivity, ...prev.slice(0, 9)])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getTimeAgo = (time) => {
    const diff = currentTime - time
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
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
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>Healthcare Dashboard</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Monitor your AI-powered healthcare analytics • {currentTime.toLocaleTimeString()}</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#dbeafe',
              borderRadius: '8px',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>👥</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Total Patients</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.totalPatients.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#dcfce7',
              borderRadius: '8px',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>💬</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Active Consultations</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.activeConsultations}</p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#f3e8ff',
              borderRadius: '8px',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>📊</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Completed Analyses</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.completedAnalyses}</p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Health Alerts</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.healthAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Live Activity Feed</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              marginRight: '8px',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Live</span>
          </div>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {activities.map((activity) => (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '12px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  marginRight: '12px',
                  backgroundColor: activity.status === 'completed' ? '#10b981' : 
                                 activity.status === 'processing' ? '#f59e0b' : '#6b7280',
                  animation: activity.status === 'processing' ? 'pulse 2s infinite' : 'none'
                }}></div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0 }}>{activity.type}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Patient: {activity.patient}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, marginBottom: '4px' }}>{getTimeAgo(activity.time)}</p>
                <span style={{
                  display: 'inline-flex',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  backgroundColor: activity.status === 'completed' ? '#dcfce7' : 
                                 activity.status === 'processing' ? '#fef3c7' : '#f3f4f6',
                  color: activity.status === 'completed' ? '#166534' : 
                         activity.status === 'processing' ? '#92400e' : '#374151'
                }}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}