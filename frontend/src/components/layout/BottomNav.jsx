import React from 'react'
import {
  HomeIcon,
  BoltIcon,
  HeartIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const BottomNav = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: <HomeIcon className="bn-icon" aria-hidden="true" /> },
    { id: 'vitals-monitor', label: 'Vitals', icon: <ChartBarIcon className="bn-icon" aria-hidden="true" /> },
    { id: 'gym-trainer', label: 'Trainer', icon: <BoltIcon className="bn-icon" aria-hidden="true" /> },
    { id: 'mental-health', label: 'Mental', icon: <HeartIcon className="bn-icon" aria-hidden="true" /> },
    { id: 'video-calls', label: 'Calls', icon: <VideoCameraIcon className="bn-icon" aria-hidden="true" /> },
  ]

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
        >
          {item.icon}
          <span className="bn-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomNav
