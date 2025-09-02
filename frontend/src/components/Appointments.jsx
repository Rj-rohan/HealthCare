import { useState, useEffect } from 'react'
import { CalendarDaysIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline'
import { apiFetch } from '../lib/api'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    notes: ''
  })

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await apiFetch('/api/patient/appointments', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await apiFetch('/api/doctors')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await apiFetch('/api/patient/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({ doctor_id: '', appointment_date: '', notes: '' })
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'var(--success)'
      case 'completed': return 'var(--primary)'
      case 'cancelled': return 'var(--error)'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-1 heading-with-icon" style={{ margin: 0 }}>
              <CalendarDaysIcon className="icon-24" aria-hidden="true" /> Appointments
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
              Manage your medical appointments
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-gradient"
          >
            <PlusIcon className="btn-icon" aria-hidden="true" /> Book Appointment
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Book New Appointment</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Select Doctor</label>
              <select
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="input-enhanced"
                required
              >
                <option value="">Choose a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="input-enhanced"
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="field-label">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-enhanced"
                rows="3"
                placeholder="Reason for visit, symptoms, etc."
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-gradient">Book Appointment</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Your Appointments</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No appointments scheduled
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map(appointment => (
              <div key={appointment.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar-48-secondary">
                      <UserIcon className="icon-20" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                        {appointment.doctor_name}
                      </h4>
                      <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {new Date(appointment.appointment_date).toLocaleString()}
                      </p>
                      {appointment.notes && (
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="status-indicator" style={{
                    background: getStatusColor(appointment.status) + '20',
                    color: getStatusColor(appointment.status)
                  }}>
                    {appointment.status}
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

export default Appointments