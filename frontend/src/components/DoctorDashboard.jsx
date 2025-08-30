import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import '../styles/global.css'
import VideoCall from './VideoCall'

export default function DoctorDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('records')
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [prescription, setPrescription] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    instructions: ''
  })

  // Video call states
  const [socket, setSocket] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  const [callStatus, setCallStatus] = useState('idle')

  useEffect(() => {
    fetchRecords()
    fetchPatients()
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
    
    newSocket.on('incoming_call', (data) => {
      setIncomingCall(data)
    })
    
    setSocket(newSocket)
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/doctor/records', {
        credentials: 'include'
      })
      const data = await response.json()
      setRecords(data)
    } catch (err) {
      console.error('Error fetching records:', err)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/doctor/patients', {
        credentials: 'include'
      })
      const data = await response.json()
      setPatients(data)
    } catch (err) {
      console.error('Error fetching patients:', err)
    }
  }

  const verifyRecord = async (recordId) => {
    try {
      const response = await fetch('http://localhost:8000/api/doctor/verify-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ record_id: recordId })
      })
      if (response.ok) {
        fetchRecords()
      }
    } catch (err) {
      console.error('Error verifying record:', err)
    }
  }

  const addPrescription = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/doctor/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prescription)
      })
      if (response.ok) {
        setPrescription({ patient_id: '', medication: '', dosage: '', instructions: '' })
        alert('Prescription added successfully!')
      }
    } catch (err) {
      console.error('Error adding prescription:', err)
    }
  }

  const respondToCall = async (callId, response) => {
    try {
      await fetch('http://localhost:8000/api/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ call_id: callId, response })
      })
      
      socket.emit('call_response', {
        call_id: callId,
        response: response
      })
      
      if (response === 'accept') {
        setActiveCall(callId)
        setCallStatus('in-call')
      }
      
      setIncomingCall(null)
    } catch (err) {
      console.error('Error responding to call:', err)
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
      background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 50%, #ecfdf5 100%)',
      padding: 'clamp(16px, 4vw, 32px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: '8%',
        right: '8%',
        width: 'clamp(120px, 20vw, 250px)',
        height: 'clamp(120px, 20vw, 250px)',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'bounce 10s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: '15%',
        left: '5%',
        width: 'clamp(80px, 15vw, 180px)',
        height: 'clamp(80px, 15vw, 180px)',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'bounce 14s ease-in-out infinite reverse',
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(20px, 5vw, 28px)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
            animation: 'pulse 3s ease-in-out infinite'
          }}>
            ⚕️
          </div>
          <h1 style={{ 
            fontSize: 'clamp(28px, 7vw, 42px)', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Welcome, Dr. {user.name}!
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
            Doctor Dashboard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 28vw, 180px), 1fr))',
        gap: 'clamp(8px, 2vw, 16px)', 
        marginBottom: 'clamp(24px, 6vw, 40px)',
        position: 'relative',
        zIndex: 1
      }}>
        {[
          { id: 'records', name: 'Patient Records', icon: '📋' },
          { id: 'patients', name: 'My Patients', icon: '👥' },
          { id: 'prescriptions', name: 'Add Prescription', icon: '💊' },
          { id: 'calls', name: 'Video Calls', icon: '📹' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
              border: activeTab === tab.id ? '2px solid #10b981' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 'clamp(8px, 2vw, 12px)',
              background: activeTab === tab.id ? 
                'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 
                'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              color: activeTab === tab.id ? '#059669' : '#374151',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.id ? 
                '0 4px 15px rgba(16, 185, 129, 0.2)' : 
                '0 2px 8px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* Patient Records */}
      {activeTab === 'records' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Patient Records for Review
          </h2>
          {records.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '48px' }}>
              No records pending review.
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
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '4px' }}>
                        {record.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        Patient: {record.patient_name}
                      </p>
                    </div>
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
                  
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                      <strong>AI Analysis:</strong> {record.ai_analysis}
                    </p>
                  </div>

                  {record.status === 'pending' && (
                    <button
                      onClick={() => verifyRecord(record.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Verify Record
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Patients */}
      {activeTab === 'patients' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            My Patients
          </h2>
          {patients.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '48px' }}>
              No patients assigned yet.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {patients.map(patient => (
                <div key={patient.id} style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '8px' }}>
                    {patient.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                    📧 {patient.email}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    📞 {patient.phone}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Prescription */}
      {activeTab === 'prescriptions' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Add Prescription
          </h2>
          <form onSubmit={addPrescription}>
            <select
              value={prescription.patient_id}
              onChange={(e) => setPrescription({...prescription, patient_id: e.target.value})}
              style={inputStyle}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Medication Name"
              value={prescription.medication}
              onChange={(e) => setPrescription({...prescription, medication: e.target.value})}
              style={inputStyle}
              required
            />
            
            <input
              type="text"
              placeholder="Dosage (e.g., 500mg twice daily)"
              value={prescription.dosage}
              onChange={(e) => setPrescription({...prescription, dosage: e.target.value})}
              style={inputStyle}
              required
            />
            
            <textarea
              placeholder="Instructions"
              value={prescription.instructions}
              onChange={(e) => setPrescription({...prescription, instructions: e.target.value})}
              style={{...inputStyle, height: '100px', resize: 'vertical'}}
            />
            
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Add Prescription
            </button>
          </form>
        </div>
      )}

      {/* Video Calls */}
      {activeTab === 'calls' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Video Call Management
          </h2>
          
          {callStatus === 'idle' && (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📹</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                Ready for Video Calls
              </h3>
              <p style={{ color: '#6b7280' }}>Waiting for incoming patient calls...</p>
            </div>
          )}
        </div>
      )}
      
      {/* Incoming Call Notification */}
      {incomingCall && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 1000,
          textAlign: 'center',
          minWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Incoming Video Call
          </h3>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
            {incomingCall.patient_name} is calling you
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => respondToCall(incomingCall.call_id, 'decline')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ef4444',
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
              ❌ Decline
            </button>
            
            <button
              onClick={() => respondToCall(incomingCall.call_id, 'accept')}
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
              ✅ Accept
            </button>
          </div>
        </div>
      )}
      
      {/* Active Video Call */}
      {callStatus === 'in-call' && activeCall && (
        <VideoCall
          callId={activeCall}
          onEndCall={endVideoCall}
          userRole="doctor"
          isInitiator={false}
        />
      )}
      
      {/* Overlay for incoming call */}
      {incomingCall && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }} />
      )}
    </div>
  )
}