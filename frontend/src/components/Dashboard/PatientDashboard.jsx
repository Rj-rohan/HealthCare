import { useState } from 'react'
import { HandRaisedIcon, ChartBarIcon, HeartIcon, ArrowsUpDownIcon, BeakerIcon, FireIcon, CalendarDaysIcon, VideoCameraIcon, BoltIcon, DocumentChartBarIcon, ArrowDownTrayIcon, ClipboardDocumentListIcon, UserIcon } from '@heroicons/react/24/outline'

const PatientDashboard = ({ user }) => {
  const [vitals] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    glucose: 95,
    temperature: 98.6
  })

  const [appointments] = useState([
    { id: 1, doctor: 'Dr. Sarah Smith', specialty: 'Cardiology', date: '2024-01-15', time: '10:00 AM', status: 'confirmed' },
    { id: 2, doctor: 'Dr. Mike Johnson', specialty: 'General', date: '2024-01-20', time: '2:30 PM', status: 'pending' }
  ])

  const [prescriptions] = useState([
    { id: 1, medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', remaining: 15 },
    { id: 2, medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily', remaining: 8 }
  ])

  const [recentReports] = useState([
    { id: 1, type: 'Blood Test', date: '2024-01-10', status: 'completed', result: 'Normal' },
    { id: 2, type: 'X-Ray Chest', date: '2024-01-08', status: 'completed', result: 'Clear' }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'var(--success)'
      case 'pending': return 'var(--warning)'
      case 'cancelled': return 'var(--error)'
      default: return 'var(--text-muted)'
    }
  }



  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="glass-card card-hover" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-1 heading-with-icon" style={{ margin: 0 }}>
              <HandRaisedIcon className="icon-24" aria-hidden="true" /> Welcome back, {user?.name}!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
              Here's your health overview for today
            </p>
          </div>
          <div className="gradient-border" style={{
            padding: '1rem',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
              {new Date().getDate()}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Monitor */}
      <div className="section-spacing">
        <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1rem' }}>
          <ChartBarIcon className="icon-24" aria-hidden="true" /> Vital Signs Monitor
        </h2>
        <div className="grid-auto-cards">
          <div className="glass-card card-hover animate-fade-in-scale vital-card">
            <div className="vital-card-header">
              <div className="vital-icon-container">
                <HeartIcon className="icon-24" aria-hidden="true" />
              </div>
              <div className="status-dot success animate-pulse"></div>
            </div>
            <div>
              <p className="vital-label">Heart Rate</p>
              <p className="vital-value">
                {vitals.heartRate}
              </p>
              <p className="vital-unit">BPM</p>
            </div>
          </div>

          <div className="glass-card card-hover animate-fade-in-scale vital-card">
            <div className="vital-card-header">
              <div className="vital-icon-container">
                <ArrowsUpDownIcon className="icon-24" aria-hidden="true" />
              </div>
              <div className="status-dot success animate-pulse"></div>
            </div>
            <div>
              <p className="vital-label">Blood Pressure</p>
              <p className="vital-value blood-pressure">
                {vitals.bloodPressure}
              </p>
              <p className="vital-unit">mmHg</p>
            </div>
          </div>

          <div className="glass-card card-hover animate-fade-in-scale vital-card">
            <div className="vital-card-header">
              <div className="vital-icon-container">
                <BeakerIcon className="icon-24" aria-hidden="true" />
              </div>
              <div className="status-dot success animate-pulse"></div>
            </div>
            <div>
              <p className="vital-label">Glucose</p>
              <p className="vital-value">
                {vitals.glucose}
              </p>
              <p className="vital-unit">mg/dL</p>
            </div>
          </div>

          <div className="glass-card card-hover animate-fade-in-scale vital-card">
            <div className="vital-card-header">
              <div className="vital-icon-container">
                <FireIcon className="icon-24" aria-hidden="true" />
              </div>
              <div className="status-dot success animate-pulse"></div>
            </div>
            <div>
              <p className="vital-label">Temperature</p>
              <p className="vital-value">
                {vitals.temperature}
              </p>
              <p className="vital-unit">°F</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Upcoming Appointments */}
        <div>
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1rem' }}>
            <CalendarDaysIcon className="icon-24" aria-hidden="true" /> Upcoming Appointments
          </h2>
          <div className="glass-card">
            {appointments.map(appointment => (
              <div key={appointment.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="avatar-48-secondary">
                    <UserIcon className="icon-20" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                      {appointment.doctor}
                    </h4>
                    <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {appointment.specialty}
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                </div>
                <div className="status-indicator" style={{
                  background: getStatusColor(appointment.status) + '20',
                  color: getStatusColor(appointment.status)
                }}>
                  {appointment.status}
                </div>
              </div>
            ))}
            <button className="btn-gradient btn-block" style={{ marginTop: '1rem' }}>
              <CalendarDaysIcon className="btn-icon" aria-hidden="true" /> Schedule New Appointment
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1rem' }}>
            <BoltIcon className="icon-24" aria-hidden="true" /> Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="glass-card card-hover action-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="action-icon action-icon-primary">
                  <BoltIcon className="icon-20" aria-hidden="true" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>AI Gym Trainer</h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Start your AI-powered workout
                  </p>
                </div>
              </div>
            </button>

            <button className="glass-card card-hover action-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="action-icon action-icon-secondary">
                  <HeartIcon className="icon-20" aria-hidden="true" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Mental Health Check</h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Monitor your mental wellness
                  </p>
                </div>
              </div>
            </button>

            <button className="glass-card card-hover action-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="action-icon action-icon-accent">
                  <VideoCameraIcon className="icon-20" aria-hidden="true" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Video Consultation</h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Connect with your doctor
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports & Prescriptions */}
      <div className="grid-2" style={{ marginTop: '2rem' }}>
        <div>
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1rem' }}>
            <DocumentChartBarIcon className="icon-24" aria-hidden="true" /> Recent Reports
          </h2>
          <div className="glass-card">
            {recentReports.map(report => (
              <div key={report.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '1rem'
              }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                    {report.type}
                  </h4>
                  <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {report.date}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="status-indicator status-online" style={{ marginBottom: '0.25rem' }}>
                    {report.result}
                  </div>
                  <button className="btn-outline btn-sm">
                    <ArrowDownTrayIcon className="icon-18" aria-hidden="true" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1rem' }}>
            <ClipboardDocumentListIcon className="icon-24" aria-hidden="true" /> Active Prescriptions
          </h2>
          <div className="glass-card">
            {prescriptions.map(prescription => (
              <div key={prescription.id} style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                      {prescription.medication}
                    </h4>
                    <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {prescription.dosage} - {prescription.frequency}
                    </p>
                  </div>
                  <div className="status-indicator" style={{
                    background: prescription.remaining < 10 ? 'var(--warning)20' : 'var(--success)20',
                    color: prescription.remaining < 10 ? 'var(--warning)' : 'var(--success)'
                  }}>
                    {prescription.remaining} left
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-gradient btn-block" style={{ marginTop: '1rem' }}>
              <ClipboardDocumentListIcon className="btn-icon" aria-hidden="true" /> Request Refill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
