import { useState, useEffect } from 'react'

export default function PersonalizedRecommendations() {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [patientProfile, setPatientProfile] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    currentMedications: '',
    medicalHistory: '',
    lifestyle: {
      smoking: false,
      alcohol: false
    }
  })
  const [symptoms, setSymptoms] = useState('')
  const [dailyTasks, setDailyTasks] = useState([])
  const [streak, setStreak] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    loadUserData()
    updateStreak()
  }, [])

  const loadUserData = () => {
    const savedProfile = localStorage.getItem('healthProfile')
    const savedTasks = localStorage.getItem('dailyTasks')
    const savedStreak = localStorage.getItem('streak')
    
    if (savedProfile) setPatientProfile(JSON.parse(savedProfile))
    if (savedTasks) setDailyTasks(JSON.parse(savedTasks))
    if (savedStreak) setStreak(parseInt(savedStreak))
  }

  const updateStreak = () => {
    const today = new Date().toDateString()
    const lastLogin = localStorage.getItem('lastLoginDate')
    
    if (lastLogin !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (lastLogin === yesterday.toDateString()) {
        const newStreak = streak + 1
        setStreak(newStreak)
        localStorage.setItem('streak', newStreak.toString())
      } else {
        setStreak(1)
        localStorage.setItem('streak', '1')
      }
      
      localStorage.setItem('lastLoginDate', today)
    }
  }

  const saveProfile = () => {
    localStorage.setItem('healthProfile', JSON.stringify(patientProfile))
    generateDailyTasks()
    setShowProfileModal(false)
  }

  const generateDailyTasks = () => {
    const tasks = [
      { id: 1, text: 'Drink 2 liters of water', completed: false, icon: '💧' },
      { id: 2, text: 'Walk 5,000 steps', completed: false, icon: '🚶' },
      { id: 3, text: 'Take medication on time', completed: false, icon: '💊' },
      { id: 4, text: 'Eat 5 servings of fruits/vegetables', completed: false, icon: '🥗' }
    ]
    
    if (patientProfile.lifestyle.smoking) {
      tasks.push({ id: 5, text: 'Avoid smoking today', completed: false, icon: '🚭' })
    }
    if (patientProfile.lifestyle.alcohol) {
      tasks.push({ id: 6, text: 'Limit alcohol consumption', completed: false, icon: '🚫' })
    }
    
    setDailyTasks(tasks)
    localStorage.setItem('dailyTasks', JSON.stringify(tasks))
  }

  const toggleTask = (taskId) => {
    const updatedTasks = dailyTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setDailyTasks(updatedTasks)
    localStorage.setItem('dailyTasks', JSON.stringify(updatedTasks))
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>
          🤖 AI Healthcare Dashboard
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Your personalized health companion with daily tasks and streak tracking
        </p>
      </div>

      {/* Streak Display */}
      <div style={{ ...cardStyle, marginBottom: '32px', textAlign: 'center', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: 'white' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
          🔥 {streak}-Day Streak!
        </h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          {streak >= 10 ? 'Amazing consistency! 🏆' : streak >= 5 ? 'Great job! Keep it up! 🚀' : 'Building healthy habits! 🌱'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* Health Profile */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            📊 Your Health Profile
          </h2>
          <button
            onClick={() => setShowProfileModal(true)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📊 Update Health Profile
          </button>
          
          {patientProfile.age && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                Age: {patientProfile.age} | Gender: {patientProfile.gender} | BMI: {patientProfile.weight && patientProfile.height ? (patientProfile.weight / ((patientProfile.height/100)**2)).toFixed(1) : 'N/A'}
              </p>
            </div>
          )}
        </div>

        {/* Daily Tasks */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            ✅ Daily Health Tasks
          </h2>
          {dailyTasks.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>
              Complete your health profile to get personalized daily tasks!
            </p>
          ) : (
            <div>
              {dailyTasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', marginBottom: '8px', backgroundColor: task.completed ? '#f0fdf4' : '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => toggleTask(task.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '2px solid #10b981',
                      backgroundColor: task.completed ? '#10b981' : 'white',
                      color: 'white',
                      cursor: 'pointer',
                      marginRight: '12px',
                      fontSize: '12px'
                    }}
                  >
                    {task.completed ? '✓' : ''}
                  </button>
                  <span style={{ fontSize: '20px', marginRight: '12px' }}>{task.icon}</span>
                  <span style={{ flex: 1, color: task.completed ? '#166534' : '#374151', textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.text}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Completed: {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length} tasks
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
              📊 Health Profile Setup
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Age</label>
                <input type="number" value={patientProfile.age} onChange={(e) => setPatientProfile({...patientProfile, age: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                <button onClick={() => setPatientProfile({...patientProfile, age: ''})} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Gender</label>
                <select value={patientProfile.gender} onChange={(e) => setPatientProfile({...patientProfile, gender: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <button onClick={() => setPatientProfile({...patientProfile, gender: ''})} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Weight (kg)</label>
                <input type="number" value={patientProfile.weight} onChange={(e) => setPatientProfile({...patientProfile, weight: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                <button onClick={() => setPatientProfile({...patientProfile, weight: ''})} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Height (cm)</label>
                <input type="number" value={patientProfile.height} onChange={(e) => setPatientProfile({...patientProfile, height: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                <button onClick={() => setPatientProfile({...patientProfile, height: ''})} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Current Medications</label>
              <textarea value={patientProfile.currentMedications} onChange={(e) => setPatientProfile({...patientProfile, currentMedications: e.target.value})} placeholder="List your medications..." style={{ width: '100%', height: '60px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
              <button onClick={() => setPatientProfile({...patientProfile, currentMedications: ''})} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Medical History</label>
              <textarea value={patientProfile.medicalHistory} onChange={(e) => setPatientProfile({...patientProfile, medicalHistory: e.target.value})} placeholder="Diabetes, hypertension, etc..." style={{ width: '100%', height: '60px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
              <button onClick={() => setPatientProfile({...patientProfile, medicalHistory: ''})} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Lifestyle Factors</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input type="checkbox" checked={patientProfile.lifestyle.smoking} onChange={(e) => setPatientProfile({...patientProfile, lifestyle: {...patientProfile.lifestyle, smoking: e.target.checked}})} style={{ marginRight: '8px' }} />
                  🚬 Smoking
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input type="checkbox" checked={patientProfile.lifestyle.alcohol} onChange={(e) => setPatientProfile({...patientProfile, lifestyle: {...patientProfile.lifestyle, alcohol: e.target.checked}})} style={{ marginRight: '8px' }} />
                  🍺 Alcohol
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Current Symptoms</label>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe your symptoms..." style={{ width: '100%', height: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
              <button onClick={() => setSymptoms('')} style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={saveProfile} style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                💾 Save Profile
              </button>
              <button onClick={() => setShowProfileModal(false)} style={{ padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}