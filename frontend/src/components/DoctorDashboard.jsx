import { useState, useEffect } from 'react'

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

  useEffect(() => {
    fetchRecords()
    fetchPatients()
  }, [])

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
      background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>
          Welcome, {user.name}
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Doctor Dashboard</p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        {[
          { id: 'records', name: 'Patient Records', icon: '📋' },
          { id: 'patients', name: 'My Patients', icon: '👥' },
          { id: 'prescriptions', name: 'Add Prescription', icon: '💊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              border: activeTab === tab.id ? '2px solid #059669' : '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: activeTab === tab.id ? '#dcfce7' : 'white',
              color: activeTab === tab.id ? '#059669' : '#374151',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
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
    </div>
  )
}