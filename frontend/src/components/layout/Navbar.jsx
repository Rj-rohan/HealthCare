import { useState } from 'react'
import { MagnifyingGlassIcon, SunIcon, MoonIcon, BellIcon, ChevronDownIcon, UserCircleIcon, LockClosedIcon, QuestionMarkCircleIcon, CalendarDaysIcon, ClipboardDocumentListIcon, DocumentChartBarIcon, ArrowRightOnRectangleIcon, HeartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const Navbar = ({ user, onThemeToggle, isDarkMode, onLogout, onSidebarToggle, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const notifications = [
    { id: 1, type: 'appointment', message: 'Appointment with Dr. Smith in 30 minutes', time: '2 min ago' },
    { id: 2, type: 'prescription', message: 'New prescription available for pickup', time: '1 hour ago' },
    { id: 3, type: 'report', message: 'Lab results are ready for review', time: '3 hours ago' }
  ]

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment': return <CalendarDaysIcon className="icon-18" aria-hidden="true" />
      case 'prescription': return <ClipboardDocumentListIcon className="icon-18" aria-hidden="true" />
      case 'report': return <DocumentChartBarIcon className="icon-18" aria-hidden="true" />
      default: return <BellIcon className="icon-18" aria-hidden="true" />
    }
  }

  return (
    <nav className="navbar">
      {/* Left Side - Sidebar Toggle and Brand */}
      <div className="navbar-left">
        {/* Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className="sidebar-toggle-btn"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <XMarkIcon className="icon-20" aria-hidden="true" /> : <Bars3Icon className="icon-20" aria-hidden="true" />}
        </button>

        {/* Brand Logo */}
        <div className="navbar-brand">
          <div className="brand-circle">
            <HeartIcon className="brand-mark" aria-hidden="true" />
          </div>
          <div className="brand-text">
            <h1 className="app-title">HealthAI</h1>
            <p className="app-subtitle">AI-Powered Healthcare</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span className="leading-icon"><MagnifyingGlassIcon className="icon-18" aria-hidden="true" /></span>
          <input
            type="text"
            placeholder="Search patients, appointments, reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-enhanced input-with-leading-icon"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="btn-outline icon-button"
        >
          {isDarkMode ? <SunIcon className="icon-20" aria-hidden="true" /> : <MoonIcon className="icon-20" aria-hidden="true" />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-outline icon-button"
            style={{ position: 'relative' }}
          >
            <BellIcon className="icon-20" aria-hidden="true" />
            {notifications.length > 0 && (
              <span className="notif-badge">{notifications.length}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="glass-card animate-fade-in-scale dropdown-panel">
              <div className="dropdown-header">
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Notifications</h3>
                <button className="btn-outline btn-sm">
                  Mark all read
                </button>
              </div>

              {notifications.map(notification => (
                <div key={notification.id} className="notification-item card-hover">
                  <span>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {notification.message}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="btn-outline card-hover dropdown-trigger"
          >
            <div className="avatar-circle avatar-40">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: 'inherit' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, textTransform: 'capitalize', color: 'inherit' }}>
                {user?.role}
              </p>
            </div>
            <ChevronDownIcon className="icon-16" aria-hidden="true" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="glass-card animate-fade-in-scale dropdown-panel dropdown-sm dropdown-panel--tinted">
              <div style={{ padding: '0.5rem' }}>
                <button className="dropdown-action">
                  <UserCircleIcon className="icon-18" aria-hidden="true" /> Profile Settings
                </button>
                <button className="dropdown-action">
                  <LockClosedIcon className="icon-18" aria-hidden="true" /> Privacy
                </button>
                <button className="dropdown-action">
                  <QuestionMarkCircleIcon className="icon-18" aria-hidden="true" /> Help & Support
                </button>
                <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                <button 
                  className="dropdown-action"
                  onClick={() => {
                    setShowProfile(false)
                    onLogout()
                  }}
                  style={{ color: 'var(--error)' }}
                >
                  <ArrowRightOnRectangleIcon className="icon-18" aria-hidden="true" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => {
            setShowNotifications(false)
            setShowProfile(false)
          }}
        />
      )}
    </nav>
  )
}

export default Navbar
