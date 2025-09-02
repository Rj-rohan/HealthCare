import { useState, useEffect } from 'react'
import { Cog6ToothIcon, UserIcon, BellIcon, ShieldCheckIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { apiFetch } from '../lib/api'

const Settings = ({ user }) => {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: ''
  })
  
  const [notifications, setNotifications] = useState({
    appointments: true,
    prescriptions: true,
    reports: true,
    marketing: false
  })
  
  const [privacy, setPrivacy] = useState({
    shareData: false,
    analytics: true,
    twoFactor: false
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await apiFetch('/api/user/settings', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setPrivacy(data.privacy)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      const response = await apiFetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notifications, privacy })
      })
      if (response.ok) {
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement profile update API call
    alert('Profile updated successfully!')
  }

  const handleNotificationChange = async (key) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] }
    setNotifications(newNotifications)
    await saveSettings()
  }

  const handlePrivacyChange = async (key) => {
    const newPrivacy = { ...privacy, [key]: !privacy[key] }
    setPrivacy(newPrivacy)
    await saveSettings()
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-1 heading-with-icon" style={{ margin: 0 }}>
            <Cog6ToothIcon className="icon-24" aria-hidden="true" /> Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Profile Settings */}
        <div className="glass-card">
          <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1.5rem' }}>
            <UserIcon className="icon-24" aria-hidden="true" /> Profile Information
          </h2>
          
          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input-enhanced"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="input-enhanced"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label className="field-label">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="input-enhanced"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="field-label">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="input-enhanced"
                />
              </div>
              <div>
                <label className="field-label">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="input-enhanced"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="field-label">Address</label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="input-enhanced"
                rows="3"
                placeholder="Street address, city, state, zip code"
              />
            </div>
            
            <button type="submit" className="btn-gradient">
              Update Profile
            </button>
          </form>
        </div>

        {/* Notification & Privacy Settings */}
        <div>
          {/* Notification Settings */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1.5rem' }}>
              <BellIcon className="icon-24" aria-hidden="true" /> Notifications
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </h4>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {key === 'appointments' && 'Get notified about upcoming appointments'}
                      {key === 'prescriptions' && 'Receive prescription reminders'}
                      {key === 'reports' && 'Get alerts when new reports are available'}
                      {key === 'marketing' && 'Receive promotional emails and updates'}
                    </p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleNotificationChange(key)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: value ? 'var(--success)' : 'var(--border)',
                      transition: '0.4s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '26px',
                        width: '26px',
                        left: value ? '30px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="glass-card">
            <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1.5rem' }}>
              <ShieldCheckIcon className="icon-24" aria-hidden="true" /> Privacy & Security
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(privacy).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                      {key === 'shareData' && 'Share Data for Research'}
                      {key === 'analytics' && 'Usage Analytics'}
                      {key === 'twoFactor' && 'Two-Factor Authentication'}
                    </h4>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {key === 'shareData' && 'Allow anonymized data to be used for medical research'}
                      {key === 'analytics' && 'Help improve the app by sharing usage data'}
                      {key === 'twoFactor' && 'Add an extra layer of security to your account'}
                    </p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handlePrivacyChange(key)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: value ? 'var(--success)' : 'var(--border)',
                      transition: '0.4s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '26px',
                        width: '26px',
                        left: value ? '30px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--warning)10', border: '1px solid var(--warning)30', borderRadius: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--warning)' }}>Account Actions</h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn-outline" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                  Change Password
                </button>
                <button className="btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings