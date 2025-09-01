import { useState, useEffect } from 'react'
import './styles/global.css'
import './styles/theme.css'
import LoginNew from './components/Login/LoginNew'
import MainApp from './components/MainApp'
import PatientDashboard from './components/PatientDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import AdminDashboard from './components/AdminDashboard'
import { apiFetch } from './lib/api'
import { HeartIcon, ArrowPathIcon, DevicePhoneMobileIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Check if we have cached user data first
    const cachedUser = localStorage.getItem('healthcare_user')
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser)
        setUser(userData)
        console.log('Using cached user data:', userData)
      } catch (err) {
        console.error('Failed to parse cached user data:', err)
        localStorage.removeItem('healthcare_user')
      }
    }
    
    // Then check with the server
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      setAuthError(null)
      
      const response = await apiFetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        if (userData.user) {
          setUser(userData.user)
          // Cache the user data
          localStorage.setItem('healthcare_user', JSON.stringify(userData.user))
          console.log('User authenticated:', userData.user)
        } else {
          setUser(null)
          localStorage.removeItem('healthcare_user')
          console.log('No user data in response')
        }
      } else if (response.status === 401) {
        // User not authenticated, clear any stale data
        setUser(null)
        localStorage.removeItem('healthcare_user')
        console.log('User not authenticated (401)')
      } else {
        console.error('Auth check failed with status:', response.status)
        setAuthError('Authentication check failed')
        setUser(null)
        localStorage.removeItem('healthcare_user')
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setAuthError('Network error during authentication check')
      setUser(null)
      localStorage.removeItem('healthcare_user')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setAuthError(null)
    // Cache the user data
    localStorage.setItem('healthcare_user', JSON.stringify(userData))
    console.log('User logged in:', userData)
  }

  const handleLogout = async () => {
    try {
      const response = await apiFetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log('User logged out successfully')
      } else {
        console.error('Logout failed:', response.status)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setAuthError(null)
      localStorage.removeItem('healthcare_user')
    }
  }

  const renderDashboard = () => {
    if (!user) return null
    
    switch (user.role) {
      case 'patient':
        return <MainApp user={user} onLogout={handleLogout} />
      case 'doctor':
        return <DoctorDashboard user={user} onLogout={handleLogout} />
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />
      default:
        return <LoginNew onLogin={handleLogin} />
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-ring" />
        <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="auth-page centered-flex">
        <div className="glass-card auth-panel animate-fade-in">
          <div className="header-center">
            <div className="brand-badge"><HeartIcon className="brand-mark" aria-hidden="true" /></div>
            <h1 className="brand-title gradient-text-brand">HealthAI</h1>
            <p className="subtitle-muted">Authentication Error</p>
          </div>
          <div className="error-banner">
            {authError}
          </div>
          <button
            onClick={checkAuthStatus}
            className="btn btn-primary btn-block"
          >
            <ArrowPathIcon className="btn-icon" aria-hidden="true" /> Retry Authentication
          </button>
          <button
            onClick={() => setAuthError(null)}
            className="btn btn-secondary btn-block"
            style={{ marginTop: '1rem' }}
          >
            <DevicePhoneMobileIcon className="btn-icon" aria-hidden="true" /> Login Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginNew onLogin={handleLogin} />
  }

  return (
    <div className="app-root">
      {renderDashboard()}
    </div>
  )
}

export default App
