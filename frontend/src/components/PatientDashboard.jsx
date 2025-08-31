import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import '../styles/global.css'
import VitalsMonitor from './VitalsMonitor'
import SymptomChecker from './SymptomChecker'
import MedicalChat from './MedicalChat'
import ImageAnalysis from './ImageAnalysis'
import HealthRecommendations from './HealthRecommendations'
import VideoCall from './VideoCall'
import MentalHealthMonitor from './MentalHealthMonitor'
import RelaxationExercises from './RelaxationExercises'
import PersonalizedRecommendations from './PersonalizedRecommendations'
import AIGymTrainer from './AIGymTrainer'

export default function PatientDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [records, setRecords] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)

  const [newRecord, setNewRecord] = useState({
    record_type: 'symptoms',
    title: '',
    description: '',
    file: null
  })

  const [newAppointment, setNewAppointment] = useState({
    doctor_id: '',
    appointment_date: ''
  })

  // Video call states
  const [socket, setSocket] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const [callStatus, setCallStatus] = useState('idle') // idle, calling, in-call

  useEffect(() => {
    fetchRecords()
    fetchAppointments()
    fetchDoctors()
    initializeSocket()
    
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const initializeSocket = () => {
    const newSocket = io('http://localhost:8000', {
      withCredentials: true
    })
    
    newSocket.on('call_responded', (data) => {
      if (data.response === 'accepted') {
        setCallStatus('in-call')
      } else if (data.response === 'declined') {
        setCallStatus('idle')
        setActiveCall(null)
        alert('Call was declined by the doctor')
      }
    })
    
    setSocket(newSocket)
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/patient/records', {
        credentials: 'include'
      })
      const data = await response.json()
      setRecords(data)
    } catch (err) {
      console.error('Error fetching records:', err)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/patient/appointments', {
        credentials: 'include'
      })
      const data = await response.json()
      setAppointments(data)
    } catch (err) {
      console.error('Error fetching appointments:', err)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/doctors')
      const data = await response.json()
      setDoctors(data)
    } catch (err) {
      console.error('Error fetching doctors:', err)
    }
  }

  const submitRecord = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('record_type', newRecord.record_type)
      formData.append('title', newRecord.title)
      formData.append('description', newRecord.description)
      if (newRecord.file) {
        formData.append('file', newRecord.file)
      }

      const response = await fetch('http://localhost:8000/api/patient/records', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      if (response.ok) {
        setNewRecord({ record_type: 'symptoms', title: '', description: '', file: null })
        fetchRecords()
      }
    } catch (err) {
      console.error('Error submitting record:', err)
    } finally {
      setLoading(false)
    }
  }

  const scheduleAppointment = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/patient/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAppointment)
      })
      if (response.ok) {
        setNewAppointment({ doctor_id: '', appointment_date: '' })
        fetchAppointments()
      }
    } catch (err) {
      console.error('Error scheduling appointment:', err)
    }
  }

  const initiateVideoCall = async (doctorId) => {
    try {
      setCallStatus('calling')
      
      const response = await fetch('http://localhost:8000/api/call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ doctor_id: doctorId })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setActiveCall(data.call_id)
        
        // Notify doctor via socket
        if (socket) {
          socket.emit('call_doctor', {
            doctor_id: doctorId,
            call_id: data.call_id
          })
        }
        
        // Auto-cancel after 30 seconds
        setTimeout(() => {
          if (callStatus === 'calling') {
            setCallStatus('idle')
            setActiveCall(null)
          }
        }, 30000)
      }
    } catch (err) {
      console.error('Error initiating call:', err)
      setCallStatus('idle')
    }
  }

  const endVideoCall = async () => {
    try {
      if (activeCall) {
        await fetch('http://localhost:8000/api/call/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ call_id: activeCall })
        })
      }
      
      setActiveCall(null)
      setCallStatus('idle')
    } catch (err) {
      console.error('Error ending call:', err)
    }
  }

  const VideoCallSection = () => (
    <div style={cardStyle}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
        Video Call with Doctor
      </h2>
      
      {callStatus === 'idle' && (
        <div>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Select a doctor to start a video consultation
          </p>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {doctors.map(doctor => (
              <div key={doctor.id} style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '4px' }}>
                    Dr. {doctor.name}
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>Available for consultation</p>
                </div>
                <button
                  onClick={() => initiateVideoCall(doctor.id)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📹 Call Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {callStatus === 'calling' && (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Calling Doctor...
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Waiting for doctor to respond</p>
          <button
            onClick={() => {
              setCallStatus('idle')
              setActiveCall(null)
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel Call
          </button>
        </div>
      )}

    </div>
  )

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(30px)',
    padding: 'clamp(20px, 5vw, 40px)',
    borderRadius: 'clamp(16px, 4vw, 24px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    marginBottom: 'clamp(20px, 5vw, 40px)',
    position: 'relative',
    zIndex: 1,
    animation: 'slideIn 0.6s ease-out'
  }

  const inputStyle = {
    width: '100%',
    padding: 'clamp(12px, 3vw, 16px)',
    border: '2px solid rgba(0, 0, 0, 0.1)',
    borderRadius: 'clamp(8px, 2vw, 12px)',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    outline: 'none',
    marginBottom: 'clamp(12px, 3vw, 20px)',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f0f9ff 100%)',
      padding: 'clamp(16px, 4vw, 32px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: '5%',
        right: '5%',
        width: 'clamp(150px, 25vw, 300px)',
        height: 'clamp(150px, 25vw, 300px)',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'bounce 8s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '10%',
        width: 'clamp(100px, 20vw, 200px)',
        height: 'clamp(100px, 20vw, 200px)',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'bounce 12s ease-in-out infinite reverse',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      <div style={{ 
        marginBottom: 'clamp(32px, 8vw, 48px)',
        position: 'relative',
        zIndex: 1,
        animation: 'slideIn 0.8s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 20px)', marginBottom: '12px' }}>
          <div style={{
            width: 'clamp(50px, 10vw, 70px)',
            height: 'clamp(50px, 10vw, 70px)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(20px, 5vw, 28px)',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            animation: 'pulse 3s ease-in-out infinite'
          }}>
            👤
          </div>
          <h1 style={{ 
            fontSize: 'clamp(28px, 7vw, 42px)', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Welcome, {user.name}!
          </h1>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '25px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>🏥</span>
          <span style={{ 
            color: '#374151', 
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            fontWeight: '600'
          }}>
            Patient Dashboard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 25vw, 160px), 1fr))',
        gap: 'clamp(8px, 2vw, 16px)', 
        marginBottom: 'clamp(24px, 6vw, 40px)'
      }}>
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
          { id: 'vitals', name: 'Vitals Monitor', icon: '❤️' },
          { id: 'symptoms', name: 'Symptom Checker', icon: '🔍' },
          { id: 'chat', name: 'Medical Chat', icon: '💬' },
          { id: 'imaging', name: 'Image Analysis', icon: '📷' },
          { id: 'mental-health', name: 'Mental Health', icon: '🧠' },
          { id: 'relaxation', name: 'Relaxation', icon: '🧘' },
          { id: 'ai-healthcare', name: 'AI Healthcare', icon: '🤖' },
          { id: 'gym-trainer', name: 'AI Gym Trainer', icon: '🏋️' },
          { id: 'recommendations', name: 'Health Tips', icon: '💡' },
          { id: 'videocall', name: 'Video Call', icon: '📹' },
          { id: 'records', name: 'My Records', icon: '📋' },
          { id: 'appointments', name: 'Appointments', icon: '📅' },
          { id: 'upload', name: 'Upload Record', icon: '📤' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
              border: activeTab === tab.id ? '2px solid #3b82f6' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 'clamp(8px, 2vw, 12px)',
              background: activeTab === tab.id ? 
                'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 
                'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              color: activeTab === tab.id ? '#1d4ed8' : '#374151',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.id ? 
                '0 4px 15px rgba(59, 130, 246, 0.2)' : 
                '0 2px 8px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div>
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
                  <span style={{ fontSize: '24px' }}>📋</span>
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Medical Records</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{records.length}</p>
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
                  <span style={{ fontSize: '24px' }}>📅</span>
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Appointments</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{appointments.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style={cardStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { id: 'vitals', name: 'Monitor Vitals', icon: '❤️', desc: 'Track your vital signs' },
                { id: 'symptoms', name: 'Check Symptoms', icon: '🔍', desc: 'AI symptom analysis' },
                { id: 'mental-health', name: 'Mental Health', icon: '🧠', desc: 'AI mood & stress detection' },
                { id: 'ai-healthcare', name: 'AI Healthcare', icon: '🤖', desc: 'Personalized recommendations' },
                { id: 'gym-trainer', name: 'AI Gym Trainer', icon: '🏋️', desc: 'Personal fitness coach' },
                { id: 'chat', name: 'Ask AI Doctor', icon: '💬', desc: 'Get medical guidance' },
                { id: 'videocall', name: 'Video Call Doctor', icon: '📹', desc: 'Connect with a doctor' },
                { id: 'upload', name: 'Upload Record', icon: '📤', desc: 'Add medical documents' }
              ].map(action => (
                <button
                  key={action.id}
                  onClick={() => setActiveTab(action.id)}
                  className="hover-lift"
                  style={{
                    padding: 'clamp(16px, 4vw, 24px)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(15px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 'clamp(12px, 3vw, 16px)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    fontSize: 'clamp(28px, 7vw, 36px)', 
                    marginBottom: '12px',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  }}>{action.icon}</div>
                  <h3 style={{ 
                    fontSize: 'clamp(16px, 4vw, 20px)', 
                    fontWeight: '700', 
                    color: '#111827', 
                    margin: 0, 
                    marginBottom: '6px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>{action.name}</h3>
                  <p style={{ 
                    fontSize: 'clamp(13px, 3vw, 15px)', 
                    color: '#6b7280', 
                    margin: 0,
                    lineHeight: '1.4'
                  }}>{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vitals Monitor */}
      {activeTab === 'vitals' && (
        <VitalsMonitor />
      )}

      {/* Symptom Checker */}
      {activeTab === 'symptoms' && (
        <SymptomChecker />
      )}

      {/* Medical Chat */}
      {activeTab === 'chat' && (
        <MedicalChat />
      )}

      {/* Image Analysis */}
      {activeTab === 'imaging' && (
        <ImageAnalysis />
      )}

      {/* Mental Health Monitor */}
      {activeTab === 'mental-health' && (
        <MentalHealthMonitor />
      )}

      {/* Relaxation Exercises */}
      {activeTab === 'relaxation' && (
        <RelaxationExercises />
      )}

      {/* AI Healthcare Recommendations */}
      {activeTab === 'ai-healthcare' && (
        <PersonalizedRecommendations />
      )}

      {/* AI Gym Trainer */}
      {activeTab === 'gym-trainer' && (
        <AIGymTrainer />
      )}

      {/* Health Recommendations */}
      {activeTab === 'recommendations' && (
        <HealthRecommendations />
      )}

      {/* Video Call */}
      {activeTab === 'videocall' && (
        <VideoCallSection />
      )}

      {/* Medical Records */}
      {activeTab === 'records' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Your Medical Records
          </h2>
          {records.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '48px' }}>
              No medical records found. Upload your first record to get started.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {records.map(record => (
                <div key={record.id} style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {record.title}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      backgroundColor: record.status === 'verified' ? '#dcfce7' : '#fef3c7',
                      color: record.status === 'verified' ? '#166534' : '#92400e'
                    }}>
                      {record.status}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', marginBottom: '12px' }}>{record.description}</p>
                  <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                    <strong>Type:</strong> {record.record_type}
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                    <strong>Doctor:</strong> {record.doctor_name}
                  </p>
                  {record.file_path && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '6px',
                      marginTop: '12px',
                      marginBottom: '12px'
                    }}>
                      <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                        <strong>📎 Attached File:</strong> {record.file_path.split('/').pop()}
                      </p>
                    </div>
                  )}
                  {record.ai_analysis && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#e0f2fe',
                      borderRadius: '6px',
                      marginTop: '12px'
                    }}>
                      <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                        <strong>AI Analysis:</strong> {record.ai_analysis}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointments */}
      {activeTab === 'appointments' && (
        <div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
              Schedule New Appointment
            </h2>
            <form onSubmit={scheduleAppointment}>
              <select
                value={newAppointment.doctor_id}
                onChange={(e) => setNewAppointment({...newAppointment, doctor_id: e.target.value})}
                style={inputStyle}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={newAppointment.appointment_date}
                onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                style={inputStyle}
                required
              />
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Schedule Appointment
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
              Your Appointments
            </h2>
            {appointments.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '48px' }}>
                No appointments scheduled.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {appointments.map(appointment => (
                  <div key={appointment.id} style={{
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '8px' }}>
                      Dr. {appointment.doctor_name}
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                      {new Date(appointment.appointment_date).toLocaleString()}
                    </p>
                    <span style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Record */}
      {activeTab === 'upload' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Upload Medical Record
          </h2>
          <form onSubmit={submitRecord} style={{ position: 'relative' }}>
            <select
              value={newRecord.record_type}
              onChange={(e) => setNewRecord({...newRecord, record_type: e.target.value})}
              style={inputStyle}
            >
              <option value="symptoms">Symptoms</option>
              <option value="lab_results">Lab Results</option>
              <option value="imaging">Medical Imaging</option>
              <option value="prescription">Prescription</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Record Title"
              value={newRecord.title}
              onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
              style={inputStyle}
              required
            />
            <textarea
              placeholder="Description"
              value={newRecord.description}
              onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
              style={{...inputStyle, height: '120px', resize: 'vertical'}}
              required
            />
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Upload File (Optional)
              </label>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#f9fafb'
              }}>
                {newRecord.file ? (
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                      {newRecord.file.type.includes('image') ? '🖼️' : 
                       newRecord.file.type.includes('pdf') ? '📄' : '📎'}
                    </div>
                    <p style={{ fontSize: '14px', color: '#111827', margin: 0, marginBottom: '4px' }}>
                      {newRecord.file.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                      {(newRecord.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setNewRecord({...newRecord, file: null})}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                    <p style={{ fontSize: '14px', color: '#374151', margin: 0, marginBottom: '4px' }}>
                      Click to upload or drag and drop
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file && file.size <= 10 * 1024 * 1024) {
                      setNewRecord({...newRecord, file})
                    } else if (file) {
                      alert('File size must be less than 10MB')
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Uploading...' : 'Upload Record'}
            </button>
          </form>
        </div>
      )}
      
      {/* Active Video Call */}
      {callStatus === 'in-call' && activeCall && (
        <VideoCall
          callId={activeCall}
          onEndCall={endVideoCall}
          userRole="patient"
          isInitiator={true}
        />
      )}
    </div>
  )
}