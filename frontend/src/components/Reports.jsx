import { useState, useEffect } from 'react'
import { DocumentChartBarIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { apiFetch } from '../lib/api'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    record_type: '',
    title: '',
    description: ''
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await apiFetch('/api/patient/records', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await apiFetch('/api/patient/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({ record_type: '', title: '', description: '' })
        fetchReports()
      }
    } catch (error) {
      console.error('Error adding report:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'var(--success)'
      case 'pending': return 'var(--warning)'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-1 heading-with-icon" style={{ margin: 0 }}>
              <DocumentChartBarIcon className="icon-24" aria-hidden="true" /> Medical Reports
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
              View and manage your medical records
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-gradient"
          >
            <PlusIcon className="btn-icon" aria-hidden="true" /> Add Report
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Add Medical Report</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Report Type</label>
              <select
                value={formData.record_type}
                onChange={(e) => setFormData({ ...formData, record_type: e.target.value })}
                className="input-enhanced"
                required
              >
                <option value="">Select type</option>
                <option value="lab_report">Lab Report</option>
                <option value="x_ray">X-Ray</option>
                <option value="mri">MRI</option>
                <option value="ct_scan">CT Scan</option>
                <option value="blood_test">Blood Test</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-enhanced"
                placeholder="e.g., Blood Test Results"
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="field-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-enhanced"
                rows="4"
                placeholder="Describe the report details..."
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-gradient">Add Report</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Your Medical Reports</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No medical reports available
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map(report => (
              <div key={report.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                          {report.title}
                        </h4>
                        <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                          {report.record_type.replace('_', ' ')}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                        {report.doctor_name && (
                          <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            Reviewed by: {report.doctor_name}
                          </p>
                        )}
                      </div>
                      <div className="status-indicator" style={{
                        background: getStatusColor(report.status) + '20',
                        color: getStatusColor(report.status)
                      }}>
                        {report.status}
                      </div>
                    </div>
                    
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {report.description}
                    </p>
                    
                    {report.ai_analysis && (
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
                          {report.ai_analysis}
                        </p>
                      </div>
                    )}
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

export default Reports