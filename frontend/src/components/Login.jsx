import { useState } from 'react'

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
      const response = await fetch(`http://localhost:8000${endpoint}`, {
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
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: 'clamp(24px, 6vw, 40px)',
    borderRadius: 'clamp(12px, 3vw, 20px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  }

  const inputStyle = {
    width: '100%',
    padding: 'clamp(12px, 3vw, 16px)',
    border: '2px solid rgba(0, 0, 0, 0.1)',
    borderRadius: 'clamp(8px, 2vw, 12px)',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    outline: 'none',
    marginBottom: 'clamp(12px, 3vw, 20px)',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)'
  }

  const buttonStyle = {
    width: '100%',
    padding: 'clamp(14px, 3.5vw, 18px)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 'clamp(12px, 3vw, 16px)',
    fontSize: 'clamp(15px, 3.5vw, 17px)',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: 'clamp(20px, 5vw, 28px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(16px, 4vw, 32px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        ...cardStyle,
        width: '100%',
        maxWidth: 'clamp(350px, 90vw, 450px)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <div style={{
            width: 'clamp(60px, 12vw, 80px)',
            height: 'clamp(60px, 12vw, 80px)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(24px, 6vw, 32px)',
            margin: '0 auto 16px',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
          }}>
            🏥
          </div>
          <h1 style={{ 
            fontSize: 'clamp(24px, 6vw, 32px)', 
            fontWeight: '700', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0, 
            marginBottom: '8px' 
          }}>
            HealthAI
          </h1>
          <p style={{ 
            color: '#6b7280', 
            margin: 0,
            fontSize: 'clamp(14px, 3vw, 16px)'
          }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#991b1b',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={inputStyle}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={inputStyle}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={inputStyle}
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
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={inputStyle}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={inputStyle}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="hover-lift"
            style={{
              ...buttonStyle,
              background: loading ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : buttonStyle.background,
              cursor: loading ? 'not-allowed' : 'pointer',
              animation: loading ? 'pulse 2s ease-in-out infinite' : 'none'
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div style={{
          marginTop: 'clamp(24px, 6vw, 36px)',
          padding: 'clamp(16px, 4vw, 24px)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          fontSize: 'clamp(12px, 2.8vw, 14px)',
          color: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>🔑</span>
            <strong style={{ fontSize: 'clamp(13px, 3vw, 15px)' }}>Demo Accounts</strong>
          </div>
          <div style={{ lineHeight: '1.8' }}>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontSize: 'clamp(12px, 2.8vw, 14px)',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              👨💼 <strong style={{ color: 'white' }}>Admin:</strong> admin@healthcare.com / admin123
            </div>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontSize: 'clamp(12px, 2.8vw, 14px)',
              fontWeight: '500'
            }}>
              ⚕️ <strong style={{ color: 'white' }}>Doctor:</strong> doctor@healthcare.com / doctor123
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}