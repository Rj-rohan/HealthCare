import { useState, useEffect } from 'react'
import { HandRaisedIcon, ChartBarIcon, UserGroupIcon, ClipboardDocumentListIcon, VideoCameraIcon, BeakerIcon } from '@heroicons/react/24/outline'
import { apiFetch } from '../lib/api'
import Navbar from './layout/Navbar'
import VideoCallScreen from './VideoCall/VideoCallScreen'

export default function DoctorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [prescription, setPrescription] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    instructions: '',
    file: null
  })
  const [allPatients, setAllPatients] = useState([])
  const [incomingCalls, setIncomingCalls] = useState([])
  const [inCall, setInCall] = useState(false)
  const [currentCall, setCurrentCall] = useState(null)

  useEffect(() => {
    fetchRecords()
    fetchPatients()
    fetchAllPatients()
  }, [])
  
  // Removed automatic polling - only manual check
  
  const checkIncomingCalls = async () => {
    try {
      console.log('🔍 CHECK CALLS CLICKED - Current user:', user)
      console.log('🔍 Starting to fetch incoming calls...')
      
      // Check auth status first
      const authResponse = await apiFetch('/api/auth/status', {
        credentials: 'include'
      })
      console.log('🔐 Auth status:', authResponse.status)
      if (authResponse.ok) {
        const authData = await authResponse.json()
        console.log('🔐 Auth data:', authData)
      }
      
      const response = await apiFetch('/api/doctor/incoming-calls', {
        credentials: 'include'
      })
      
      console.log('📡 Response received:', response.status, response.statusText)
      
      if (response.ok) {
        const calls = await response.json()
        console.log('📞 Incoming calls found:', calls.length, calls)
        setIncomingCalls(calls)
        console.log('✅ State updated with calls:', calls)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to fetch calls:', response.status, errorText)
      }
    } catch (error) {
      console.error('💥 Error checking calls:', error)
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await apiFetch('/api/doctor/records', {
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
      const response = await apiFetch('/api/doctor/patients', {
        credentials: 'include'
      })
      const data = await response.json()
      setPatients(data)
    } catch (err) {
      console.error('Error fetching patients:', err)
    }
  }

  const fetchAllPatients = async () => {
    try {
      console.log('Fetching all patients...')
      const response = await apiFetch('/api/all-patients', {
        credentials: 'include'
      })
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('All patients data:', data)
        setAllPatients(data)
      } else {
        console.error('Failed to fetch patients:', response.status)
      }
    } catch (err) {
      console.error('Error fetching all patients:', err)
    }
  }

  const verifyRecord = async (recordId) => {
    try {
      const response = await apiFetch('/api/doctor/verify-record', {
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
      const formData = new FormData()
      formData.append('patient_id', prescription.patient_id)
      formData.append('medication', prescription.medication)
      formData.append('dosage', prescription.dosage)
      formData.append('instructions', prescription.instructions)
      if (prescription.file) {
        formData.append('prescription_file', prescription.file)
      }

      const response = await apiFetch('/api/doctor/prescriptions', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      if (response.ok) {
        setPrescription({ patient_id: '', medication: '', dosage: '', instructions: '', file: null })
        alert('Prescription added successfully!')
      }
    } catch (err) {
      console.error('Error adding prescription:', err)
    }
  }

  const respondToCall = async (callId, response) => {
    try {
      const apiResponse = await apiFetch('/api/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ call_id: callId, response })
      })
      
      if (apiResponse.ok) {
        if (response === 'accept') {
          const call = incomingCalls.find(c => c.id === callId)
          setCurrentCall(call)
          setInCall(true)
        }
        setIncomingCalls(prev => prev.filter(call => call.id !== callId))
      }
    } catch (err) {
      console.error('Error responding to call:', err)
    }
  }

  const endCall = () => {
    setInCall(false)
    setCurrentCall(null)
  }

  if (inCall) {
    return (
      <VideoCallScreen
        onEndCall={endCall}
        userRole="doctor"
        callData={{ patient_name: currentCall?.patient_name }}
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <Navbar
        user={user}
        onLogout={onLogout}
        isDarkMode={false}
        onThemeToggle={() => {}}
        onSidebarToggle={() => {}}
        isSidebarOpen={false}
      />
      <div style={{ padding: '1rem' }}>
      {/* Welcome Header */}
      <div className="glass-card card-hover" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-1 heading-with-icon" style={{ margin: 0 }}>
              <HandRaisedIcon className="icon-24" aria-hidden="true" /> Welcome back, Dr. {user?.name}!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
              Manage your patients and medical practice
            </p>
          </div>
          <div className="gradient-border" style={{
            padding: '1rem',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
              {patients.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Patients
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'btn-gradient' : 'btn-outline'}
          >
            <ChartBarIcon className="btn-icon" aria-hidden="true" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={activeTab === 'patients' ? 'btn-gradient' : 'btn-outline'}
          >
            <UserGroupIcon className="btn-icon" aria-hidden="true" /> Patients
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={activeTab === 'records' ? 'btn-gradient' : 'btn-outline'}
          >
            <ClipboardDocumentListIcon className="btn-icon" aria-hidden="true" /> Records
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={activeTab === 'prescriptions' ? 'btn-gradient' : 'btn-outline'}
          >
            <BeakerIcon className="btn-icon" aria-hidden="true" /> Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={activeTab === 'calls' ? 'btn-gradient' : 'btn-outline'}
          >
            <VideoCameraIcon className="btn-icon" aria-hidden="true" /> Video Calls
          </button>
        </div>
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="section-spacing">
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1rem' }}>
            <ChartBarIcon className="icon-24" aria-hidden="true" /> Practice Overview
          </h2>
          <div className="grid-auto-cards">
            <div className="glass-card card-hover animate-fade-in-scale vital-card">
              <div className="vital-card-header">
                <div className="vital-icon-container">
                  <UserGroupIcon className="icon-24" aria-hidden="true" />
                </div>
                <div className="status-dot success animate-pulse"></div>
              </div>
              <div>
                <p className="vital-label">Total Patients</p>
                <p className="vital-value">{patients.length}</p>
              </div>
            </div>
            <div className="glass-card card-hover animate-fade-in-scale vital-card">
              <div className="vital-card-header">
                <div className="vital-icon-container">
                  <ClipboardDocumentListIcon className="icon-24" aria-hidden="true" />
                </div>
                <div className="status-dot success animate-pulse"></div>
              </div>
              <div>
                <p className="vital-label">Medical Records</p>
                <p className="vital-value">{records.length}</p>
              </div>
            </div>
            <div className="glass-card card-hover animate-fade-in-scale vital-card">
              <div className="vital-card-header">
                <div className="vital-icon-container">
                  <VideoCameraIcon className="icon-24" aria-hidden="true" />
                </div>
                <div className="status-dot warning animate-pulse"></div>
              </div>
              <div>
                <p className="vital-label">Pending Calls</p>
                <p className="vital-value">{incomingCalls.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patients */}
      {activeTab === 'patients' && (
        <div className="glass-card">
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1.5rem' }}>
            <UserGroupIcon className="icon-24" aria-hidden="true" /> My Patients
          </h2>
          
          {patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No Patients Yet
              </h3>
              <p>Patients will appear here once they book appointments with you.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {patients.map(patient => (
                <div key={patient.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="avatar-48-secondary">
                        <UserGroupIcon className="icon-20" aria-hidden="true" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                          {patient.name}
                        </h4>
                        <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {patient.email}
                        </p>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {patient.phone}
                        </p>
                      </div>
                    </div>
                    <button className="btn-gradient">
                      <ClipboardDocumentListIcon className="btn-icon" aria-hidden="true" /> View Records
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Medical Records */}
      {activeTab === 'records' && (
        <div className="glass-card">
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1.5rem' }}>
            <ClipboardDocumentListIcon className="icon-24" aria-hidden="true" /> Medical Records Review
          </h2>
          
          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No Records to Review
              </h3>
              <p>Medical records will appear here when patients upload them.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {records.map(record => (
                <div key={record.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                        {record.title}
                      </h4>
                      <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Patient: {record.patient_name} • {record.record_type}
                      </p>
                    </div>
                    <div className="status-indicator" style={{
                      background: record.status === 'pending' ? 'var(--warning)20' : 'var(--success)20',
                      color: record.status === 'pending' ? 'var(--warning)' : 'var(--success)'
                    }}>
                      {record.status}
                    </div>
                  </div>
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {record.description}
                  </p>
                  {record.ai_analysis && (
                    <div style={{
                      background: 'var(--primary)10',
                      border: '1px solid var(--primary)30',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.875rem' }}>
                        AI Analysis
                      </h5>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {record.ai_analysis}
                      </p>
                    </div>
                  )}
                  {record.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => verifyRecord(record.id)} className="btn-gradient">
                        ✅ Verify Record
                      </button>
                      <button className="btn-outline">
                        📝 Add Notes
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Prescription */}
      {activeTab === 'prescriptions' && (
        <div className="glass-card">
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1.5rem' }}>
            <BeakerIcon className="icon-24" aria-hidden="true" /> Add Prescription
          </h2>
          <form onSubmit={addPrescription}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Select Patient</label>
              <select
                value={prescription.patient_id}
                onChange={(e) => setPrescription({...prescription, patient_id: e.target.value})}
                className="input-enhanced"
                required
              >
                <option value="">Choose a patient</option>
                {allPatients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name} - {patient.email}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Medication Name</label>
              <input
                type="text"
                value={prescription.medication}
                onChange={(e) => setPrescription({...prescription, medication: e.target.value})}
                className="input-enhanced"
                placeholder="e.g., Lisinopril"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Dosage</label>
              <input
                type="text"
                value={prescription.dosage}
                onChange={(e) => setPrescription({...prescription, dosage: e.target.value})}
                className="input-enhanced"
                placeholder="e.g., 10mg once daily"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Instructions</label>
              <textarea
                value={prescription.instructions}
                onChange={(e) => setPrescription({...prescription, instructions: e.target.value})}
                className="input-enhanced"
                rows="3"
                placeholder="Special instructions for the patient..."
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="field-label">Prescription File (Optional)</label>
              <input
                type="file"
                onChange={(e) => setPrescription({...prescription, file: e.target.files[0]})}
                className="input-enhanced"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ padding: '0.75rem' }}
              />
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Upload prescription document (PDF, JPG, PNG)
              </p>
            </div>
            
            <button type="submit" className="btn-gradient">
              <BeakerIcon className="btn-icon" aria-hidden="true" /> Add Prescription
            </button>
          </form>
        </div>
      )}

      {/* Video Calls */}
      {activeTab === 'calls' && (
        <div>
          <div className="glass-card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="heading-2" style={{ margin: 0 }}>📹 Video Calls</h2>
              <button onClick={checkIncomingCalls} className="btn-gradient">🔄 Check Calls</button>
            </div>
          </div>
          
          {incomingCalls.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📹</div>
              <h3>No Incoming Calls</h3>
              <p style={{ color: 'var(--text-muted)' }}>Waiting for patients to call...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {incomingCalls.map(call => (
                <div key={call.id} className="glass-card" style={{
                  padding: '2rem',
                  border: '3px solid var(--success)',
                  background: 'var(--success)20'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                      Incoming Call from {call.patient_name}
                    </h3>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>
                      Received at {new Date(call.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        respondToCall(call.id, 'decline')
                      }}
                      style={{ 
                        padding: '1rem 2rem',
                        fontSize: '1.125rem',
                        background: 'var(--error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Decline
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        respondToCall(call.id, 'accept')
                      }}
                      style={{ 
                        padding: '1rem 2rem',
                        fontSize: '1.125rem',
                        background: 'var(--success)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Accept Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}