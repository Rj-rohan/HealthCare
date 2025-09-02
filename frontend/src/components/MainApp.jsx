import { useState, useEffect } from 'react'
import '../styles/theme.css'
import Sidebar from './layout/Sidebar'
import Navbar from './layout/Navbar'
import BottomNav from './layout/BottomNav'
import PatientDashboard from './Dashboard/PatientDashboard'
import AIGymTrainerNew from './AIGymTrainer/AIGymTrainerNew'
import MentalHealthMonitor from './MentalHealthMonitor'
import VideoCallNew from './VideoCall/VideoCallNew'
import VitalsMonitor from './VitalsMonitor'
import RelaxationExercises from './RelaxationExercises'
import SymptomChecker from './SymptomChecker'
import PersonalizedRecommendations from './PersonalizedRecommendations'
import MedicalChat from './MedicalChat'
import ImageAnalysis from './ImageAnalysis'
import HealthRecommendations from './HealthRecommendations'
import Appointments from './Appointments'
import Prescriptions from './Prescriptions'
import Reports from './Reports'
import Settings from './Settings'

const MainApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('healthai-theme')
    return savedTheme === 'dark'
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Check if mobile device
    return window.innerWidth > 768
  })

  useEffect(() => {
    // Apply theme to document and save to localStorage
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('healthai-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    // Handle window resize for responsive sidebar
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    const handleKey = (e) => {
      if (e.key === 'Escape' && window.innerWidth <= 768) setIsSidebarOpen(false)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PatientDashboard user={user} />
      case 'vitals-monitor':
        return <VitalsMonitor />
      case 'gym-trainer':
        return <AIGymTrainerNew />
      case 'mental-health':
        return <MentalHealthMonitor user={user} />
      case 'video-calls':
        return <VideoCallNew user={user} />
      case 'relaxation-exercises':
        return <RelaxationExercises />
      case 'symptom-checker':
        return <SymptomChecker />
      case 'personalized-recommendations':
        return <PersonalizedRecommendations />
      case 'medical-chat':
        return <MedicalChat />
      case 'image-analysis':
        return <ImageAnalysis />
      case 'health-recommendations':
        return <HealthRecommendations />
      case 'appointments':
        return <Appointments user={user} />
      case 'prescriptions':
        return <Prescriptions user={user} />
      case 'reports':
        return <Reports user={user} />
      case 'settings':
        return <Settings user={user} />
      default:
        return <PatientDashboard user={user} />
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onItemClick={(id) => { setActiveTab(id); if (window.innerWidth <= 768) setIsSidebarOpen(false) }}
        onClose={() => { if (window.innerWidth <= 768) setIsSidebarOpen(false) }}
      />
      
      <div className={`main-content ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Navbar
          user={user}
          onThemeToggle={handleThemeToggle}
          isDarkMode={isDarkMode}
          onLogout={onLogout}
          onSidebarToggle={handleSidebarToggle}
          isSidebarOpen={isSidebarOpen}
        />

        <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)} />

        <div style={{ padding: '1rem', paddingBottom: 'calc(56px + env(safe-area-inset-bottom))' }}>
          {renderContent()}
        </div>

        <div className="mobile-only">
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  )
}



export default MainApp
