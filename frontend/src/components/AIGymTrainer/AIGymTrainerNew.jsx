import { useState, useEffect, useRef } from 'react'

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

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-1" style={{ margin: 0 }}>
              🏋️ AI Gym Trainer
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
              Real-time pose detection with AI form correction
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div style={{
              padding: '1rem',
              borderRadius: '1rem',
              background: isActive ? 'linear-gradient(135deg, var(--success), var(--secondary))' : 'var(--glass-bg)',
              color: isActive ? 'white' : 'var(--text-primary)',
              textAlign: 'center',
              minWidth: '80px'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {isActive ? '🟢' : '🔴'}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {isActive ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Camera & Analysis */}
        <div>
          <div className="glass-card">
            <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
              📹 Live Camera Feed
            </h2>
            
            <div style={{
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: '1rem',
              overflow: 'hidden',
              marginBottom: '1.5rem',
              aspectRatio: '4/3',
              border: annotatedImage && isActive ? '3px solid var(--success)' : '2px solid var(--border)'
            }}>
              {/* Original video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: annotatedImage && isActive ? 'none' : 'block'
                }}
              />
              
              {/* AI Annotated image with pose tracking */}
              {annotatedImage && isActive && (
                <img
                  src={annotatedImage}
                  alt="AI Pose Tracking"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)'
                  }}
                />
              )}
              
              {/* Status Overlays */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '0.75rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white'
              }}>
                {isActive ? (
                  <>
                    🟢 AI Active
                    {isAnalyzing && (
                      <div style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid var(--success)',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    )}
                  </>
                ) : '🔴 Inactive'}
              </div>
              
              {/* Visual Tracking Indicator */}
              {annotatedImage && isActive && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'linear-gradient(135deg, var(--success), var(--secondary))',
                  padding: '0.75rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 255, 0, 0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  🎯 AI Pose Tracking
                </div>
              )}
              
              {/* Performance Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '1rem',
                borderRadius: '1rem',
                color: 'white',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                    {repCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Reps</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                    {formScore}%
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Form</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning)' }}>
                    {Math.round(calories)}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Calories</div>
                </div>
              </div>
            </div>

            {/* Exercise Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
                🎯 Select Exercise
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.75rem'
              }}>
                {exercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => setCurrentExercise(exercise.id)}
                    className="glass-card"
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      padding: '1rem',
                      textAlign: 'center',
                      background: currentExercise === exercise.id 
                        ? `linear-gradient(135deg, ${exercise.color}, ${exercise.color}80)`
                        : 'var(--glass-bg)',
                      color: currentExercise === exercise.id ? 'white' : 'var(--text-primary)',
                      transform: currentExercise === exercise.id ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {exercise.icon}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                      {exercise.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                      {exercise.difficulty}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Controls */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={isActive ? stopWorkout : startWorkout}
                className="btn"
                style={{
                  padding: '1rem 2rem',
                  background: isActive 
                    ? 'linear-gradient(135deg, var(--error), #FF6B6B)' 
                    : 'linear-gradient(135deg, var(--success), var(--secondary))',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  minWidth: '160px'
                }}
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
                className="btn"
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  minWidth: '120px'
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Feedback */}
        <div>
          {/* Current Exercise Info */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
              🎯 Current Exercise
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '1rem',
                background: `linear-gradient(135deg, ${currentExerciseData.color}, ${currentExerciseData.color}80)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                {currentExerciseData.icon}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {currentExerciseData.name}
                </h4>
                <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Difficulty: {currentExerciseData.difficulty}
                </p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {currentExerciseData.calories} cal/rep
                </p>
              </div>
            </div>

            {/* Workout Timer */}
            <div style={{
              background: 'var(--glass-bg)',
              padding: '1rem',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                {formatTime(workoutTime)}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Workout Duration
              </div>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
              🤖 AI Coach Feedback
            </h3>
            
            {feedback && (
              <div style={{
                background: formScore >= 80 ? 'var(--success)20' : formScore >= 60 ? 'var(--warning)20' : 'var(--error)20',
                border: `1px solid ${formScore >= 80 ? 'var(--success)' : formScore >= 60 ? 'var(--warning)' : 'var(--error)'}40`,
                padding: '1rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '1rem',
                  color: formScore >= 80 ? 'var(--success)' : formScore >= 60 ? 'var(--warning)' : 'var(--error)',
                  fontWeight: '600'
                }}>
                  {feedback}
                </div>
              </div>
            )}

            {/* Form Score Progress */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Form Quality
                </span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {formScore}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'var(--border)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${formScore}%`,
                  height: '100%',
                  background: formScore >= 80 
                    ? 'linear-gradient(90deg, var(--success), var(--secondary))' 
                    : formScore >= 60 
                    ? 'linear-gradient(90deg, var(--warning), var(--warning))' 
                    : 'linear-gradient(90deg, var(--error), var(--error))',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="glass-card">
            <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
              📊 Performance Stats
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                padding: '1rem',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                  {repCount}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Total Reps
                </div>
              </div>
              
              <div style={{
                background: 'var(--glass-bg)',
                padding: '1rem',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning)' }}>
                  {Math.round(calories)}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Calories Burned
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

export default AIGymTrainerNew