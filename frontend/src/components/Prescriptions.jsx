import { useState, useEffect } from 'react'
import { ClipboardDocumentListIcon, UserIcon } from '@heroicons/react/24/outline'
import { apiFetch } from '../lib/api'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await apiFetch('/api/patient/prescriptions', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-1 heading-with-icon" style={{ margin: 0 }}>
            <ClipboardDocumentListIcon className="icon-24" aria-hidden="true" /> Prescriptions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
            View your active prescriptions and medication history
          </p>
        </div>
      </div>

      <div className="glass-card">
        <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Active Prescriptions</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading prescriptions...
          </div>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No prescriptions available
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prescriptions.map(prescription => (
              <div key={prescription.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar-48-secondary">
                      <UserIcon className="icon-20" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                        {prescription.medication}
                      </h4>
                      <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Dosage: {prescription.dosage}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Prescribed by: {prescription.doctor_name}
                      </p>
                      {prescription.instructions && (
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          Instructions: {prescription.instructions}
                        </p>
                      )}
                      <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Prescribed on: {new Date(prescription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="status-indicator status-online">
                    Active
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Prescriptions