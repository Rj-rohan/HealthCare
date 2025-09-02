import { useState, useEffect, useRef } from 'react'
import '../../styles/gym-trainer.css'

const AIGymTrainerNew = () => {
  const [isActive, setIsActive] = useState(false)
  const [currentExercise, setCurrentExercise] = useState('pushup')
  const [repCount, setRepCount] = useState(0)
  const [formScore, setFormScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [calories, setCalories] = useState(0)
  const [workoutTime, setWorkoutTime] = useState(0)
  const [annotatedImage, setAnnotatedImage] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const videoRef = useRef(null)
  const intervalRef = useRef(null)

  const exercises = [
    { id: 'pushup', name: 'Push-ups', icon: '💪', calories: 0.5, difficulty: 'Medium', color: 'var(--primary)' },
    { id: 'squat', name: 'Squats', icon: '🦵', calories: 0.4, difficulty: 'Easy', color: 'var(--secondary)' },
    { id: 'situp', name: 'Sit-ups', icon: '🏋️', calories: 0.3, difficulty: 'Easy', color: 'var(--accent)' },
    { id: 'jumping_jack', name: 'Jumping Jacks', icon: '🤸', calories: 0.8, difficulty: 'High', color: 'var(--warning)' },
    { id: 'plank', name: 'Plank Hold', icon: '🧘', calories: 0.2, difficulty: 'Medium', color: 'var(--info)' }
  ]

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setWorkoutTime(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isActive])

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
    await startCamera()
    startAnalysis()
  }

  const stopWorkout = () => {
    setIsActive(false)
    stopCamera()
    clearInterval(intervalRef.current)
    setIsAnalyzing(false)
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    
    const analysisInterval = setInterval(async () => {
      if (!isActive || !videoRef.current) {
        clearInterval(analysisInterval)
        setIsAnalyzing(false)
        return
      }

      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        
        const response = await fetch('http://localhost:8000/api/test/exercise/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageData,
            exercise_type: currentExercise
          })
        })
        
        const result = await response.json()
        
        if (result.error) {
          setFeedback(`Analysis Error: ${result.error}`)
          return
        }
        
        setFormScore(result.form_score || 0)
        setFeedback(result.feedback || 'Analyzing...')
        setRepCount(result.rep_count || 0)
        
        if (result.annotated_image) {
          setAnnotatedImage(result.annotated_image)
        }
        
        if (result.rep_count > repCount) {
          const exercise = exercises.find(e => e.id === currentExercise)
          setCalories(prev => prev + exercise.calories)
        }
        
      } catch (error) {
        console.error('Analysis error:', error)
        setFeedback('Analysis failed - check backend connection')
      }
    }, 500)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentExerciseData = exercises.find(e => e.id === currentExercise)
  const formLevel = formScore >= 80 ? 'good' : formScore >= 60 ? 'warn' : 'bad'

  return (
    <div className="gym-trainer-container animate-fade-in">
      {/* Header */}
      <div className="glass-card trainer-header">
        <div className="header-row">
          <div>
            <h1 className="heading-1">🏋️ AI Gym Trainer</h1>
            <p className="header-subtitle">Real-time pose detection with AI form correction</p>
          </div>
          <div className="header-actions">
            <div className={`live-status-chip ${isActive ? 'active' : 'inactive'}`}>
              <div className="live-status-icon">{isActive ? '🟢' : '🔴'}</div>
              <div className="live-status-label">{isActive ? 'LIVE' : 'OFFLINE'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Camera & Analysis */}
        <div>
          <div className="glass-card">
            <h2 className="heading-2 section-title">📹 Live Camera Feed</h2>
            
            <div className={`camera-frame ${annotatedImage && isActive ? 'tracking-active' : ''}`}>
              {/* Original video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video ${annotatedImage && isActive ? 'is-hidden' : ''}`}
              />
              
              {/* AI Annotated image with pose tracking */}
              {annotatedImage && isActive && (
                <img
                  src={annotatedImage}
                  alt="AI Pose Tracking"
                  className="camera-image"
                />
              )}
              
              {/* Status Overlays */}
              <div className="camera-status">
                {isActive ? (
                  <>
                    <span>🟢 AI Active</span>
                    {isAnalyzing && <span className="spinner-circle" />}
                  </>
                ) : (
                  '🔴 Inactive'
                )}
              </div>
              
              {/* Visual Tracking Indicator */}
              {annotatedImage && isActive && (
                <div className="pose-tracking-badge animate-pulse">🎯 AI Pose Tracking</div>
              )}
              
              {/* Performance Overlay */}
              <div className="camera-metrics">
                <div>
                  <div className="metric-value success">{repCount}</div>
                  <div className="metric-label">Reps</div>
                </div>
                <div>
                  <div className="metric-value primary">{formScore}%</div>
                  <div className="metric-label">Form</div>
                </div>
                <div>
                  <div className="metric-value warning">{Math.round(calories)}</div>
                  <div className="metric-label">Calories</div>
                </div>
              </div>
            </div>

            {/* Exercise Selection */}
            <div className="exercise-section">
              <h3 className="heading-3 section-subtitle">🎯 Select Exercise</h3>
              <div className="exercise-grid">
                {exercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => setCurrentExercise(exercise.id)}
                    className={`exercise-card ${exercise.id} ${currentExercise === exercise.id ? 'is-active' : ''}`}
                  >
                    <div className="exercise-icon">{exercise.icon}</div>
                    <div className="exercise-name">{exercise.name}</div>
                    <div className="exercise-difficulty">{exercise.difficulty}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Controls */}
            <div className="controls-row">
              <button
                onClick={isActive ? stopWorkout : startWorkout}
                className={`btn ${isActive ? 'btn-stop' : 'btn-start'}`}
              >
                {isActive ? '⏹️ Stop Workout' : '▶️ Start Workout'}
              </button>
              
              <button
                onClick={() => {
                  setRepCount(0)
                  setFormScore(0)
                  setCalories(0)
                  setFeedback('')
                  setAnnotatedImage(null)
                  
                  fetch('http://localhost:8000/api/test/exercise/reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exercise_type: currentExercise })
                  }).catch(console.error)
                }}
                className="btn btn-reset"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Feedback */}
        <div>
          {/* Current Exercise Info */}
          <div className="glass-card current-exercise-card">
            <h3 className="heading-3 section-subtitle">🎯 Current Exercise</h3>
            
            <div className="current-exercise-row">
              <div className={`exercise-badge ${currentExerciseData.id}`}>{currentExerciseData.icon}</div>
              <div>
                <h4 className="exercise-title">{currentExerciseData.name}</h4>
                <p className="exercise-meta">Difficulty: {currentExerciseData.difficulty}</p>
                <p className="exercise-meta">{currentExerciseData.calories} cal/rep</p>
              </div>
            </div>

            {/* Workout Timer */}
            <div className="timer-block">
              <div className="timer-value">{formatTime(workoutTime)}</div>
              <div className="timer-label">Workout Duration</div>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="glass-card ai-feedback-card">
            <h3 className="heading-3 section-subtitle">🤖 AI Coach Feedback</h3>
            
            {feedback && (
              <div className={`feedback-banner ${formLevel}`}>
                <div className={`feedback-text ${formLevel}`}>{feedback}</div>
              </div>
            )}

            {/* Form Score Progress */}
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Form Quality</span>
                <span className="progress-value">{formScore}%</span>
              </div>
              <div className="progress">
                <div
                  className={`progress-bar ${formLevel}`}
                  style={{ width: `${formScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="glass-card">
            <h3 className="heading-3 section-subtitle">📊 Performance Stats</h3>
            
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value stat-success">{repCount}</div>
                <div className="stat-label">Total Reps</div>
              </div>
              
              <div className="stat-box">
                <div className="stat-value stat-warning">{Math.round(calories)}</div>
                <div className="stat-label">Calories Burned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIGymTrainerNew
