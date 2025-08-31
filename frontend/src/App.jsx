import { useState, useEffect } from 'react'
import Login from './components/Login'
import PatientDashboard from './components/PatientDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/status', {
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'patient':
        return <PatientDashboard user={user} onLogout={handleLogout} />
      case 'doctor':
        return <DoctorDashboard user={user} onLogout={handleLogout} />
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />
      default:
        return <Login onLogin={handleLogin} />
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh'
    }}>
      {/* Enhanced Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: 'clamp(12px, 3vw, 20px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 'clamp(32px, 6vw, 40px)',
            height: 'clamp(32px, 6vw, 40px)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(16px, 3vw, 20px)'
          }}>
            🏥
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            HealthAI
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)' }}>
          <div style={{
            padding: 'clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 16px)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '20px',
            color: 'white',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: '600',
            textTransform: 'capitalize'
          }}>
            {user.role === 'patient' ? '👤' : user.role === 'doctor' ? '⚕️' : '👨💼'} {user.role}
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 20px)',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            ↗ Logout
          </button>
        </div>
      </div>
      
      <div style={{ paddingTop: 'clamp(70px, 15vw, 90px)' }}>
        {renderDashboard()}
      </div>
    </div>
  )
}

export default App