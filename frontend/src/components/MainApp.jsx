import { useState, useEffect } from 'react'
import '../styles/theme.css'
import Sidebar from './layout/Sidebar'
import Navbar from './layout/Navbar'
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

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
        return <AppointmentsView user={user} />
      case 'prescriptions':
        return <PrescriptionsView user={user} />
      case 'reports':
        return <ReportsView user={user} />
      case 'settings':
        return <SettingsView user={user} />
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
        
        <div style={{ padding: '2rem' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other views
import { CalendarDaysIcon, ClipboardDocumentListIcon, DocumentChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const AppointmentsView = () => (
  <div className="glass-card animate-fade-in">
    <h1 className="heading-1 heading-with-icon"><CalendarDaysIcon className="icon-24" aria-hidden="true" /> Appointments</h1>
    <p>Appointment management coming soon...</p>
  </div>
)

const PrescriptionsView = () => (
  <div className="glass-card animate-fade-in">
    <h1 className="heading-1 heading-with-icon"><ClipboardDocumentListIcon className="icon-24" aria-hidden="true" /> Prescriptions</h1>
    <p>Prescription management coming soon...</p>
  </div>
)

const ReportsView = () => (
  <div className="glass-card animate-fade-in">
    <h1 className="heading-1 heading-with-icon"><DocumentChartBarIcon className="icon-24" aria-hidden="true" /> Medical Reports</h1>
    <p>Medical reports view coming soon...</p>
  </div>
)

const SettingsView = () => (
  <div className="glass-card animate-fade-in">
    <h1 className="heading-1 heading-with-icon"><Cog6ToothIcon className="icon-24" aria-hidden="true" /> Settings</h1>
    <p>Settings panel coming soon...</p>
  </div>
)

export default MainApp
