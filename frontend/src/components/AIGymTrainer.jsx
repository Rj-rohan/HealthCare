import { useState, useEffect, useRef } from 'react'
import './AIGymTrainer.css'

export default function AIGymTrainer() {
  const [isActive, setIsActive] = useState(false)
  const [currentExercise, setCurrentExercise] = useState('pushup')
  const [repCount, setRepCount] = useState(0)
  const [formScore, setFormScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [calories, setCalories] = useState(0)
  const [workoutTime, setWorkoutTime] = useState(0)
  const [aiCoaching, setAiCoaching] = useState([])
  const [personalBest, setPersonalBest] = useState({ pushup: 0, squat: 0, situp: 0 })
  const [streak] = useState(7)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)

  const exercises = [
    { id: 'pushup', name: 'Push-ups', icon: '💪', calories: 0.5, difficulty: 'Medium' },
    { id: 'squat', name: 'Squats', icon: '🦵', calories: 0.4, difficulty: 'Easy' },
    { id: 'situp', name: 'Sit-ups', icon: '🏋️', calories: 0.3, difficulty: 'Easy' },
    { id: 'jumping_jack', name: 'Jumping Jacks', icon: '🤸', calories: 0.8, difficulty: 'High' },
    { id: 'plank', name: 'Plank Hold', icon: '🧘', calories: 0.2, difficulty: 'Medium' }
  ]

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setWorkoutTime(prev => prev + 1)
        // Simulate AI coaching tips
        if (workoutTime % 30 === 0 && workoutTime > 0) {
          const tips = [
            '🎯 Keep your core engaged!',
            '💪 Maintain steady breathing',
            '⚡ You\'re doing great! Keep it up!',
            '🔥 Focus on form over speed',
            '🚀 Push through - you got this!'
          ]
          setAiCoaching(prev => [...prev.slice(-2), tips[Math.floor(Math.random() * tips.length)]])
        }
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isActive, workoutTime])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setFeedback('Camera access denied. Please enable camera permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const startWorkout = async () => {
    setIsActive(true)
    setRepCount(0)
    setFormScore(0)
    setCalories(0)
    setWorkoutTime(0)
    setAiCoaching(['🤖 AI Trainer activated!', '📹 Analyzing your form...'])
    await startCamera()
    startAnalysis()
  }

  const stopWorkout = () => {
    setIsActive(false)
    stopCamera()
    clearInterval(intervalRef.current)
    
    // Update personal best
    if (repCount > personalBest[currentExercise]) {
      setPersonalBest(prev => ({ ...prev, [currentExercise]: repCount }))
      setAiCoaching(prev => [...prev, '🏆 New Personal Best! Amazing work!'])
    }
  }

  const startAnalysis = () => {
    // Simulate real-time analysis
    const analysisInterval = setInterval(() => {
      if (!isActive) {
        clearInterval(analysisInterval)
        return
      }

      // Simulate ML predictions
      const randomForm = 70 + Math.random() * 30
      const shouldCount = Math.random() > 0.7
      
      setFormScore(Math.round(randomForm))
      
      if (shouldCount) {
        setRepCount(prev => {
          const newCount = prev + 1
          const exercise = exercises.find(e => e.id === currentExercise)
          setCalories(prevCal => prevCal + exercise.calories)
          return newCount
        })
        
        // Form feedback
        if (randomForm > 85) {
          setFeedback('✅ Perfect form!')
        } else if (randomForm > 70) {
          setFeedback('⚠️ Good, but keep your back straight')
        } else {
          setFeedback('❌ Adjust your form - slow down')
        }
      }
    }, 2000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="gym-container">
      {/* Header */}
      <div className="gym-card gym-header-card">
        <h1 className="gym-title">🏋️ AI Gym Trainer</h1>
        <p className="gym-subtitle">Real-time pose detection with AI form correction</p>
        
        {/* Stats */}
        <div className="gym-stats">
          <div className="gym-stat stat-blue">
            <div className="gym-stat-emoji">🔥</div>
            <div className="gym-stat-label">Streak: {streak} days</div>
          </div>
          
          <div className="gym-stat stat-green">
            <div className="gym-stat-emoji">⚡</div>
            <div className="gym-stat-label">Calories: {Math.round(calories)}</div>
          </div>
          
          <div className="gym-stat stat-red">
            <div className="gym-stat-emoji">⏱️</div>
            <div className="gym-stat-label">Time: {formatTime(workoutTime)}</div>
          </div>
          
          <div className="gym-stat stat-purple">
            <div className="gym-stat-emoji">🎯</div>
            <div className="gym-stat-label">Form: {formScore}%</div>
          </div>
        </div>
      </div>

      <div className="gym-grid">
        {/* Camera & Analysis */}
        <div className="gym-card gym-video-card">
          <h2 className="gym-section-title">📹 Live Analysis</h2>
          
          <div className="gym-video-box">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="gym-video"
            />
            <canvas
              ref={canvasRef}
              className="gym-video-canvas"
            />
            
            {/* Overlay Info */}
            <div className="gym-badge gym-badge-top-left">
              {isActive ? '🟢 AI Active' : '🔴 Inactive'}
            </div>
            
            <div className="gym-overlay-bottom">
              Reps: {repCount} | Form: {formScore}%
            </div>
          </div>
          
          {/* Exercise Selection */}
          <div className="gym-exercises-grid">
            {exercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => setCurrentExercise(exercise.id)}
                className={`gym-exercise-btn ${currentExercise === exercise.id ? 'active' : ''}`}
              >
                {exercise.icon}<br/>{exercise.name}
              </button>
            ))}
          </div>
          
          {/* Controls */}
          <div className="gym-controls">
            <button
              onClick={isActive ? stopWorkout : startWorkout}
              className={`gym-primary-btn ${isActive ? 'stop' : 'start'}`}
            >
              {isActive ? '⏹️ Stop' : '▶️ Start Workout'}
            </button>
            
            <button
              onClick={() => {
                setRepCount(0)
                setFormScore(0)
                setCalories(0)
                setFeedback('')
              }}
              className="gym-secondary-btn"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* AI Coaching & Stats */}
        <div>
          {/* Current Exercise Info */}
          <div className="gym-card">
            <h3 className="gym-section-subtitle">🎯 Current Exercise</h3>
            {(() => {
              const exercise = exercises.find(e => e.id === currentExercise)
              return (
                <div>
                  <div className="gym-exercise-row">
                    <span className="gym-exercise-emoji">{exercise.icon}</span>
                    <div>
                      <h4 className="gym-exercise-name">{exercise.name}</h4>
                      <p className="gym-exercise-meta">Difficulty: {exercise.difficulty}</p>
                    </div>
                  </div>
                  
                  <div className="gym-info-box">
                    <div className="gym-info-line">Personal Best: {personalBest[currentExercise]} reps</div>
                    <div className="gym-info-line">Calories per rep: {exercise.calories}</div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* AI Feedback */}
          <div className="gym-card">
            <h3 className="gym-section-subtitle">🤖 AI Coach</h3>
            {feedback && (
              <div className="gym-feedback">{feedback}</div>
            )}
            <div className="gym-tips-scroll">
              {aiCoaching.map((tip, index) => (
                <div key={index} className="gym-tip">{tip}</div>
              ))}
            </div>
          </div>

          {/* Workout Summary */}
          <div className="gym-card">
            <h3 className="gym-section-subtitle">📊 Workout Summary</h3>
            <div className="gym-summary-grid">
              <div className="gym-summary-item">
                <div className="gym-summary-number num-green">{repCount}</div>
                <div className="gym-summary-label">Reps</div>
              </div>
              <div className="gym-summary-item">
                <div className="gym-summary-number num-red">{Math.round(calories)}</div>
                <div className="gym-summary-label">Calories</div>
              </div>
              <div className="gym-summary-item">
                <div className="gym-summary-number num-purple">{formScore}%</div>
                <div className="gym-summary-label">Avg Form</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}