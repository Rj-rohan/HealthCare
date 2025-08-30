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
  const [dietPlan, setDietPlan] = useState(null)
  const [waterIntake, setWaterIntake] = useState(0)
  const [caloriesConsumed, setCaloriesConsumed] = useState(0)

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
    generateDietPlan()
  }

  const generateDietPlan = () => {
    const bmi = patientProfile.weight && patientProfile.height ? 
      patientProfile.weight / ((patientProfile.height/100)**2) : 25
    
    const plan = {
      breakfast: bmi > 25 ? 
        ['🥚 Oatmeal with berries', '🥚 Greek yogurt', '☕ Green tea'] :
        ['🍳 Scrambled eggs', '🍞 Whole grain toast', '🥤 Orange juice'],
      lunch: bmi > 25 ?
        ['🥗 Grilled chicken salad', '🥒 Quinoa bowl', '💧 Water'] :
        ['🍖 Grilled salmon', '🍚 Brown rice', '🥦 Steamed vegetables'],
      dinner: bmi > 25 ?
        ['🌯 Vegetable soup', '🥗 Mixed greens', '🍵 Herbal tea'] :
        ['🍗 Lean protein', '🥔 Sweet potato', '🥦 Roasted vegetables'],
      snacks: ['🍎 Apple slices', '🥜 Almonds', '🥕 Carrot sticks'],
      targetCalories: bmi > 25 ? 1500 : 2000,
      targetWater: 8
    }
    
    setDietPlan(plan)
    localStorage.setItem('dietPlan', JSON.stringify(plan))
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
        {/* Health Analytics */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            📊 Health Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{streak}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Day Streak</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{dailyTasks.filter(t => t.completed).length}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Tasks Done</div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            🤖 AI Health Tips
          </h2>
          <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
              💡 Based on your profile: {patientProfile.age ? `Age ${patientProfile.age}` : 'Complete profile for personalized tips'}
            </p>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
              🎯 Daily Goal: Complete all health tasks to maintain your streak!
            </p>
          </div>
        </div>

        {/* Health Score */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            🏆 Health Score
          </h2>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {dailyTasks.length > 0 ? Math.round((dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100) : 0}
            </div>
            <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>Health Score</div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${dailyTasks.length > 0 ? (dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100 : 0}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        </div>

        {/* Daily Diet Plan */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            🍽️ Daily Diet Plan
          </h2>
          {!dietPlan ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>
              Complete your health profile to get a personalized diet plan!
            </p>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#92400e' }}>{dietPlan.targetCalories}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Target Calories</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e40af' }}>{dietPlan.targetWater}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Glasses of Water</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Breakfast</h4>
                  <div style={{ fontSize: '12px', color: '#374151' }}>
                    {dietPlan.breakfast.join(' • ')}
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#166534' }}>Lunch</h4>
                  <div style={{ fontSize: '12px', color: '#374151' }}>
                    {dietPlan.lunch.join(' • ')}
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>Dinner</h4>
                  <div style={{ fontSize: '12px', color: '#374151' }}>
                    {dietPlan.dinner.join(' • ')}
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>Snacks</h4>
                  <div style={{ fontSize: '12px', color: '#374151' }}>
                    {dietPlan.snacks.join(' • ')}
                  </div>
                </div>
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