import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import { HeartIcon, BoltIcon, VideoCameraIcon, CpuChipIcon, UserGroupIcon, RocketLaunchIcon, UserPlusIcon } from '@heroicons/react/24/outline'

const LoginNew = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'patient'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register'
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        if (isLogin) {
          onLogin(data.user)
        } else {
          setIsLogin(true)
          setError('')
          setFormData({ ...formData, password: '' })
        }
      } else {
        setError(data.error || 'An error occurred')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="auth-page centered-flex">
      <div className="glass-card auth-panel animate-fade-in">
        {/* Header */}
        <div className="header-center">
          <div className="brand-badge"><HeartIcon className="brand-mark" aria-hidden="true" /></div>
          <h1 className="brand-title gradient-text-brand">HealthAI</h1>
          <p className="subtitle-muted">AI-Powered Healthcare Platform</p>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button
            onClick={() => setIsLogin(true)}
            className={`tab-button ${isLogin ? 'tab-active' : ''}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`tab-button ${!isLogin ? 'tab-active' : ''}`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="input-field"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="field-group">
            <label className="field-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="field-group-lg">
            <label className="field-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn btn-primary btn-block btn-lg ${isLoading ? 'btn-busy' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="inline-spinner spin" />
                Processing...
              </>
            ) : (
              <>
                {isLogin ? (<><RocketLaunchIcon className="btn-icon" aria-hidden="true" /> Sign In</>) : (<><UserPlusIcon className="btn-icon" aria-hidden="true" /> Create Account</>)}
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="demo-panel">
          <h4 className="heading-3"><UserGroupIcon className="section-icon" aria-hidden="true" /> Demo Accounts</h4>
          <div className="text-muted leading-relaxed">
            <p className="m-0 mb-2">
              <strong>Patient:</strong> patient@demo.com / demo123
            </p>
            <p className="m-0 mb-2">
              <strong>Doctor:</strong> doctor@healthcare.com / doctor123
            </p>
            <p className="m-0">
              <strong>Admin:</strong> admin@healthcare.com / admin123
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="features-intro">
          <p className="text-muted">Experience the future of healthcare</p>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon"><BoltIcon className="icon-lg" aria-hidden="true" /></div>
              <div className="feature-caption">AI Gym Trainer</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><HeartIcon className="icon-lg" aria-hidden="true" /></div>
              <div className="feature-caption">Mental Health</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><VideoCameraIcon className="icon-lg" aria-hidden="true" /></div>
              <div className="feature-caption">Video Calls</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CpuChipIcon className="icon-lg" aria-hidden="true" /></div>
              <div className="feature-caption">AI Analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginNew
