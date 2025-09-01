import React from 'react'
import {
  HomeIcon,
  ChartBarIcon,
  BoltIcon,
  HeartIcon,
  VideoCameraIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  UsersIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline'

const Sidebar = ({ activeTab, setActiveTab, user, onLogout, isOpen = true }) => {

  const menuItems = [
    { id: 'dashboard', icon: <HomeIcon className="nav-icon" aria-hidden="true" />, label: 'Dashboard', roles: ['patient', 'doctor', 'admin'] },
    { id: 'vitals-monitor', icon: <ChartBarIcon className="nav-icon" aria-hidden="true" />, label: 'Vitals Monitor', roles: ['patient', 'doctor'] },
    { id: 'gym-trainer', icon: <BoltIcon className="nav-icon" aria-hidden="true" />, label: 'AI Gym Trainer', roles: ['patient'] },
    { id: 'mental-health', icon: <HeartIcon className="nav-icon" aria-hidden="true" />, label: 'Mental Health', roles: ['patient'] },
    { id: 'video-calls', icon: <VideoCameraIcon className="nav-icon" aria-hidden="true" />, label: 'Video Calls', roles: ['patient', 'doctor'] },
    { id: 'relaxation-exercises', icon: <SparklesIcon className="nav-icon" aria-hidden="true" />, label: 'Relaxation Exercises', roles: ['patient'] },
    { id: 'symptom-checker', icon: <MagnifyingGlassIcon className="nav-icon" aria-hidden="true" />, label: 'Symptom Checker', roles: ['patient'] },
    { id: 'personalized-recommendations', icon: <LightBulbIcon className="nav-icon" aria-hidden="true" />, label: 'Personalized Recommendations', roles: ['patient'] },
    { id: 'medical-chat', icon: <ChatBubbleLeftRightIcon className="nav-icon" aria-hidden="true" />, label: 'Medical Chat', roles: ['patient', 'doctor'] },
    { id: 'image-analysis', icon: <PhotoIcon className="nav-icon" aria-hidden="true" />, label: 'Image Analysis', roles: ['patient', 'doctor'] },
    { id: 'health-recommendations', icon: <LightBulbIcon className="nav-icon" aria-hidden="true" />, label: 'Health Recommendations', roles: ['patient'] },
    { id: 'appointments', icon: <CalendarDaysIcon className="nav-icon" aria-hidden="true" />, label: 'Appointments', roles: ['patient', 'doctor'] },
    { id: 'prescriptions', icon: <ClipboardDocumentListIcon className="nav-icon" aria-hidden="true" />, label: 'Prescriptions', roles: ['patient', 'doctor'] },
    { id: 'reports', icon: <DocumentChartBarIcon className="nav-icon" aria-hidden="true" />, label: 'Reports', roles: ['patient', 'doctor'] },
    { id: 'users', icon: <UsersIcon className="nav-icon" aria-hidden="true" />, label: 'User Management', roles: ['admin'] },
    { id: 'analytics', icon: <ChartPieIcon className="nav-icon" aria-hidden="true" />, label: 'Analytics', roles: ['admin'] },
    { id: 'settings', icon: <Cog6ToothIcon className="nav-icon" aria-hidden="true" />, label: 'Settings', roles: ['patient', 'doctor', 'admin'] }
  ]

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role))

  return (
    <div className={`sidebar ${!isOpen ? 'collapsed' : ''} ${isOpen ? 'open' : ''} custom-scrollbar`}>
      {/* Logo & Brand */}
      

      {/* User Profile */}
      <div className="glass-card card-hover user-card-box">
        <div className="avatar-circle avatar-48">
          {user?.name?.charAt(0) || 'U'}
        </div>
        {isOpen && (
          <div className="user-info">
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
              {user?.name || 'User'}
            </h4>
            <p className="user-role">
              {user?.role}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item nav-button ${activeTab === item.id ? 'nav-active' : ''} card-hover`}
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button
          onClick={onLogout}
          className="btn btn-logout btn-block"
        >
          <ArrowRightOnRectangleIcon className="btn-icon" aria-hidden="true" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>


    </div>
  )
}

export default Sidebar
