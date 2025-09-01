import { useState, useEffect, useRef } from 'react'

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

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    padding: 'clamp(16px, 4vw, 24px)',
    borderRadius: 'clamp(12px, 3vw, 20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: 'clamp(16px, 4vw, 24px)'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: 'clamp(16px, 4vw, 32px)',
      color: 'white'
    }}>
      {/* Header */}
      <div style={cardStyle}>
        <h1 style={{
          fontSize: 'clamp(24px, 6vw, 36px)',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          🏋️ AI Gym Trainer
        </h1>
        <p style={{
          color: '#94a3b8',
          margin: 0,
          textAlign: 'center',
          fontSize: 'clamp(14px, 3.5vw, 18px)'
        }}>
          Real-time pose detection with AI form correction
        </p>
        
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'clamp(12px, 3vw, 20px)',
          marginTop: '20px'
        }}>
          <div style={{
            background: 'rgba(96, 165, 250, 0.1)',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}>🔥</div>
            <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#60a5fa', fontWeight: '600' }}>
              Streak: {streak} days
            </div>
          </div>
          
          <div style={{
            background: 'rgba(52, 211, 153, 0.1)',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}>⚡</div>
            <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#34d399', fontWeight: '600' }}>
              Calories: {Math.round(calories)}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(248, 113, 113, 0.1)',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}>⏱️</div>
            <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#f87171', fontWeight: '600' }}>
              Time: {formatTime(workoutTime)}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}>🎯</div>
            <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#a855f7', fontWeight: '600' }}>
              Form: {formScore}%
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: 'clamp(20px, 5vw, 32px)'
      }}>
        {/* Camera & Analysis */}
        <div style={cardStyle}>
          <h2 style={{
            fontSize: 'clamp(18px, 4.5vw, 24px)',
            fontWeight: '700',
            color: '#e2e8f0',
            marginBottom: '20px'
          }}>
            📹 Live Analysis
          </h2>
          
          <div style={{
            position: 'relative',
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '20px',
            aspectRatio: '4/3'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
            
            {/* Overlay Info */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: 'clamp(12px, 3vw, 14px)'
            }}>
              {isActive ? '🟢 AI Active' : '🔴 Inactive'}
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: 'clamp(12px, 3vw, 14px)',
              textAlign: 'center'
            }}>
              Reps: {repCount} | Form: {formScore}%
            </div>
          </div>
          
          {/* Exercise Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {exercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => setCurrentExercise(exercise.id)}
                style={{
                  padding: 'clamp(8px, 2vw, 12px)',
                  background: currentExercise === exercise.id ?
                    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' :
                    'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {exercise.icon}<br/>{exercise.name}
              </button>
            ))}
          </div>
          
          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={isActive ? stopWorkout : startWorkout}
              style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
                background: isActive ?
                  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '120px'
              }}
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
              style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* AI Coaching & Stats */}
        <div>
          {/* Current Exercise Info */}
          <div style={cardStyle}>
            <h3 style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              fontWeight: '700',
              color: '#e2e8f0',
              marginBottom: '16px'
            }}>
              🎯 Current Exercise
            </h3>
            
            {(() => {
              const exercise = exercises.find(e => e.id === currentExercise)
              return (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: 'clamp(24px, 6vw, 32px)' }}>{exercise.icon}</span>
                    <div>
                      <h4 style={{
                        margin: 0,
                        fontSize: 'clamp(16px, 4vw, 18px)',
                        color: '#f1f5f9'
                      }}>
                        {exercise.name}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: 'clamp(12px, 3vw, 14px)',
                        color: '#94a3b8'
                      }}>
                        Difficulty: {exercise.difficulty}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      color: '#cbd5e1',
                      marginBottom: '4px'
                    }}>
                      Personal Best: {personalBest[currentExercise]} reps
                    </div>
                    <div style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      color: '#cbd5e1'
                    }}>
                      Calories per rep: {exercise.calories}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* AI Feedback */}
          <div style={cardStyle}>
            <h3 style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              fontWeight: '700',
              color: '#e2e8f0',
              marginBottom: '16px'
            }}>
              🤖 AI Coach
            </h3>
            
            {feedback && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <div style={{
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  color: '#60a5fa',
                  fontWeight: '600'
                }}>
                  {feedback}
                </div>
              </div>
            )}
            
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {aiCoaching.map((tip, index) => (
                <div key={index} style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: '#cbd5e1'
                }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Workout Summary */}
          <div style={cardStyle}>
            <h3 style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              fontWeight: '700',
              color: '#e2e8f0',
              marginBottom: '16px'
            }}>
              📊 Workout Summary
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  fontWeight: 'bold',
                  color: '#34d399'
                }}>
                  {repCount}
                </div>
                <div style={{
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  color: '#94a3b8'
                }}>
                  Reps
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  fontWeight: 'bold',
                  color: '#f87171'
                }}>
                  {Math.round(calories)}
                </div>
                <div style={{
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  color: '#94a3b8'
                }}>
                  Calories
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  fontWeight: 'bold',
                  color: '#a855f7'
                }}>
                  {formScore}%
                </div>
                <div style={{
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  color: '#94a3b8'
                }}>
                  Avg Form
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}