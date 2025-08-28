import { useState, useEffect } from 'react'
import VitalsMonitor from './VitalsMonitor'
import SymptomChecker from './SymptomChecker'
import MedicalChat from './MedicalChat'
import ImageAnalysis from './ImageAnalysis'
import HealthRecommendations from './HealthRecommendations'

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

  useEffect(() => {
    fetchRecords()
    fetchAppointments()
    fetchDoctors()
  }, [])

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

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6',
    marginBottom: '24px'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    marginBottom: '16px'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>
          Welcome, {user.name}
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Patient Dashboard</p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
          { id: 'vitals', name: 'Vitals Monitor', icon: '❤️' },
          { id: 'symptoms', name: 'Symptom Checker', icon: '🔍' },
          { id: 'chat', name: 'Medical Chat', icon: '💬' },
          { id: 'imaging', name: 'Image Analysis', icon: '📷' },
          { id: 'recommendations', name: 'Health Tips', icon: '💡' },
          { id: 'records', name: 'My Records', icon: '📋' },
          { id: 'appointments', name: 'Appointments', icon: '📅' },
          { id: 'upload', name: 'Upload Record', icon: '📤' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              border: activeTab === tab.id ? '2px solid #2563eb' : '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: activeTab === tab.id ? '#dbeafe' : 'white',
              color: activeTab === tab.id ? '#2563eb' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
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
                { id: 'chat', name: 'Ask AI Doctor', icon: '💬', desc: 'Get medical guidance' },
                { id: 'upload', name: 'Upload Record', icon: '📤', desc: 'Add medical documents' }
              ].map(action => (
                <button
                  key={action.id}
                  onClick={() => setActiveTab(action.id)}
                  style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{action.icon}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '4px' }}>{action.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{action.desc}</p>
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

      {/* Health Recommendations */}
      {activeTab === 'recommendations' && (
        <HealthRecommendations />
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
    </div>
  )
}