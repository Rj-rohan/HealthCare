import { useState, useEffect } from 'react'
import '../styles/global.css'

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        credentials: 'include'
      })
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/stats', {
        credentials: 'include'
      })
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(30px)',
    padding: 'clamp(20px, 5vw, 40px)',
    borderRadius: 'clamp(16px, 4vw, 24px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    marginBottom: 'clamp(20px, 5vw, 40px)',
    position: 'relative',
    zIndex: 1,
    animation: 'slideIn 0.6s ease-out'
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return { bg: '#fee2e2', text: '#991b1b' }
      case 'doctor': return { bg: '#dcfce7', text: '#166534' }
      case 'patient': return { bg: '#dbeafe', text: '#1e40af' }
      default: return { bg: '#f3f4f6', text: '#374151' }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fef7cd 100%)',
      padding: 'clamp(16px, 4vw, 32px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: '12%',
        right: '10%',
        width: 'clamp(100px, 18vw, 220px)',
        height: 'clamp(100px, 18vw, 220px)',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'bounce 12s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: '20%',
        left: '8%',
        width: 'clamp(70px, 12vw, 160px)',
        height: 'clamp(70px, 12vw, 160px)',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'bounce 16s ease-in-out infinite reverse',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      <div style={{ 
        marginBottom: 'clamp(32px, 8vw, 48px)',
        position: 'relative',
        zIndex: 1,
        animation: 'slideIn 0.8s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 20px)', marginBottom: '12px' }}>
          <div style={{
            width: 'clamp(50px, 10vw, 70px)',
            height: 'clamp(50px, 10vw, 70px)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(20px, 5vw, 28px)',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
            animation: 'pulse 3s ease-in-out infinite'
          }}>
            👨💼
          </div>
          <h1 style={{ 
            fontSize: 'clamp(28px, 7vw, 42px)', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Welcome, {user.name}!
          </h1>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '25px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>🏥</span>
          <span style={{ 
            color: '#374151', 
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            fontWeight: '600'
          }}>
            System Administrator Dashboard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 28vw, 180px), 1fr))',
        gap: 'clamp(8px, 2vw, 16px)', 
        marginBottom: 'clamp(24px, 6vw, 40px)',
        position: 'relative',
        zIndex: 1
      }}>
        {[
          { id: 'overview', name: 'System Overview', icon: '📊' },
          { id: 'users', name: 'Manage Users', icon: '👥' },
          { id: 'analytics', name: 'Analytics', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
              border: activeTab === tab.id ? '2px solid #f59e0b' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 'clamp(8px, 2vw, 12px)',
              background: activeTab === tab.id ? 
                'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 
                'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              color: activeTab === tab.id ? '#d97706' : '#374151',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.id ? 
                '0 4px 15px rgba(245, 158, 11, 0.2)' : 
                '0 2px 8px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* System Overview */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>
                    Total Patients
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {stats.patients || 0}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  👥
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>
                    Active Doctors
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {stats.doctors || 0}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  👨‍⚕️
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>
                    Medical Records
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {stats.records || 0}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  📋
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0, marginBottom: '4px' }}>
                    Appointments
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {stats.appointments || 0}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  📅
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
              System Health
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🟢</div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0, marginBottom: '4px' }}>
                  Database
                </p>
                <p style={{ fontSize: '14px', color: '#059669', margin: 0 }}>Operational</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🟢</div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0, marginBottom: '4px' }}>
                  API Server
                </p>
                <p style={{ fontSize: '14px', color: '#059669', margin: 0 }}>Operational</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🟢</div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0, marginBottom: '4px' }}>
                  AI Services
                </p>
                <p style={{ fontSize: '14px', color: '#059669', margin: 0 }}>Operational</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            User Management
          </h2>
          {users.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '48px' }}>
              No users found.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Name
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Email
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Role
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Phone
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const roleStyle = getRoleColor(user.role)
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                          {user.name}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.text,
                            textTransform: 'capitalize'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                          {user.phone || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            System Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '16px' }}>
                User Distribution
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Patients</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af' }}>
                  {Math.round((stats.patients / (stats.patients + stats.doctors + 1)) * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Doctors</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                  {Math.round((stats.doctors / (stats.patients + stats.doctors + 1)) * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Admins</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626' }}>
                  {Math.round((1 / (stats.patients + stats.doctors + 1)) * 100)}%
                </span>
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '16px' }}>
                Activity Summary
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Records per Patient</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  {stats.patients > 0 ? Math.round(stats.records / stats.patients) : 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Appointments per Doctor</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  {stats.doctors > 0 ? Math.round(stats.appointments / stats.doctors) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}