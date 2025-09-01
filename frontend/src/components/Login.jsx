import { useState } from 'react'
import { apiFetch } from '../lib/api'
import { HeartIcon, KeyIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'patient'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
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
          setError('Registration successful! Please login.')
        }
      } else {
        setError(data.error)
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="pattern-overlay" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon"><HeartIcon className="brand-mark" aria-hidden="true" /></div>
          <h1 className="auth-title">HealthAI</h1>
          <p className="muted subtitle">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="error-alert">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-field"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-field"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-field"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-field form-field-thick font-arial"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-field form-field-thick font-arial"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary hover-lift ${loading ? 'btn-auth-loading' : ''}`}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="link-button"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="demo-info">
          <div className="demo-title">
            <KeyIcon className="icon-18" aria-hidden="true" />
            <strong className="demo-title-text">Demo Accounts</strong>
          </div>
          <div className="demo-lines">
            <div className="demo-line mb-8">
              <UserGroupIcon className="icon-18" aria-hidden="true" /> <span className="credential-label">Admin:</span>
              <div className="credential-value"> admin@healthcare.com / admin123</div>
            </div>
            <div className="demo-line">
              <UserIcon className="icon-18" aria-hidden="true" /> <span className="credential-label">Doctor:</span>
              <div className="credential-value"> doctor@healthcare.com / doctor123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
