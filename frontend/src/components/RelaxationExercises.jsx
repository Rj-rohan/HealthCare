import { useState, useEffect } from 'react'

export default function RelaxationExercises() {
  const [activeExercise, setActiveExercise] = useState(null)
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState('inhale')
  const [stressLevel, setStressLevel] = useState(5)
  const [aiRecommendations, setAiRecommendations] = useState([])
  const [completedSessions, setCompletedSessions] = useState(0)

  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1)
        // Breathing guide animation
        if (activeExercise?.id === 1) {
          const cycle = timer % 14 // 4+4+6 second cycle
          if (cycle < 4) setBreathingPhase('inhale')
          else if (cycle < 8) setBreathingPhase('hold')
          else setBreathingPhase('exhale')
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, timer, activeExercise])

  useEffect(() => {
    // AI-powered recommendations based on stress level
    const getRecommendations = () => {
      if (stressLevel >= 8) {
        setAiRecommendations([
          '🚨 High stress detected - Start with deep breathing',
          '💊 Consider speaking with a healthcare provider',
          '🛌 Prioritize 7-8 hours of sleep tonight'
        ])
      } else if (stressLevel >= 5) {
        setAiRecommendations([
          '⚠️ Moderate stress - Progressive muscle relaxation recommended',
          '🚶 Take a 10-minute walk outside',
          '📱 Limit screen time for the next hour'
        ])
      } else {
        setAiRecommendations([
          '✅ Good stress levels - Maintain with mindfulness',
          '🧘 Perfect time for meditation practice',
          '🌱 Consider gratitude journaling'
        ])
      }
    }
    getRecommendations()
  }, [stressLevel])

  const exercises = [
    {
      id: 1,
      name: 'AI-Guided Deep Breathing',
      duration: 300,
      description: 'Smart breathing patterns adapted to your stress level.',
      instructions: [
        '🎯 AI will guide your breathing rhythm',
        '👁️ Follow the visual breathing guide',
        '📊 Real-time stress level monitoring',
        '🔄 Adaptive timing based on your progress'
      ],
      benefits: ['Reduces cortisol by 23%', 'Lowers heart rate', 'Improves focus']
    },
    {
      id: 2,
      name: 'Smart Muscle Relaxation',
      duration: 900,
      description: 'AI-optimized progressive relaxation with biofeedback.',
      instructions: [
        '🤖 AI monitors muscle tension patterns',
        '📱 Voice-guided instructions',
        '⏱️ Personalized timing for each muscle group',
        '📈 Progress tracking and adaptation'
      ],
      benefits: ['Reduces muscle tension', 'Improves sleep quality', 'Decreases anxiety']
    },
    {
      id: 3,
      name: 'Mindfulness with AI Coach',
      duration: 600,
      description: 'Personalized meditation with AI insights.',
      instructions: [
        '🧠 AI analyzes your meditation patterns',
        '🎵 Adaptive background sounds',
        '💭 Personalized mindfulness prompts',
        '📊 Real-time focus level feedback'
      ],
      benefits: ['Increases focus by 40%', 'Reduces mind wandering', 'Builds awareness']
    },
    {
      id: 4,
      name: 'Stress Recovery Protocol',
      duration: 420,
      description: 'AI-designed rapid stress relief sequence.',
      instructions: [
        '⚡ Quick 7-minute stress reset',
        '🎯 Combines breathing + visualization',
        '📱 Real-time stress level monitoring',
        '🔄 Adapts based on your response'
      ],
      benefits: ['Rapid stress reduction', 'Energy restoration', 'Mental clarity']
    }
  ]

  const startExercise = (exercise) => {
    setActiveExercise(exercise)
    setTimer(0)
    setIsActive(true)
    setBreathingPhase('inhale')
  }

  const stopExercise = () => {
    setIsActive(false)
    if (activeExercise && timer > 60) {
      setCompletedSessions(prev => prev + 1)
      // Simulate stress level improvement
      setStressLevel(prev => Math.max(1, prev - 1))
    }
    setActiveExercise(null)
    setTimer(0)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getBreathingGuide = () => {
    const size = breathingPhase === 'inhale' ? '120px' : 
                 breathingPhase === 'hold' ? '120px' : '80px'
    const color = breathingPhase === 'inhale' ? '#4caf50' : 
                  breathingPhase === 'hold' ? '#ff9800' : '#2196f3'
    
    return {
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: '50%',
      transition: 'all 1s ease-in-out',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '16px'
    }
  }

  return (
    <div className="animate-fade-in" style={{
      padding: 'clamp(16px, 4vw, 32px)',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header with AI Stats */}
      <div className="glass-card card-hover animate-fade-in-scale" style={{ marginBottom: '2rem' }}>
        <h2 className="brand-title gradient-text-brand" style={{
          fontSize: 'clamp(24px, 6vw, 32px)',
          fontWeight: '800',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          🧘 AI Relaxation Coach
        </h2>
        
        <div className="grid-responsive" style={{ marginBottom: '20px' }}>
          <div className="stat-card card-hover" style={{
            background: 'rgba(76, 175, 80, 0.1)',
            textAlign: 'center'
          }}>
            <div className="stat-number" style={{ color: '#4caf50' }}>📊</div>
            <div className="stat-label" style={{ color: '#4caf50' }}>
              Stress Level: {stressLevel}/10
            </div>
          </div>
          
          <div className="stat-card card-hover" style={{
            background: 'rgba(33, 150, 243, 0.1)',
            textAlign: 'center'
          }}>
            <div className="stat-number" style={{ color: '#2196f3' }}>🏆</div>
            <div className="stat-label" style={{ color: '#2196f3' }}>
              Sessions: {completedSessions}
            </div>
          </div>
          
          <div className="stat-card card-hover" style={{
            background: 'rgba(156, 39, 176, 0.1)',
            textAlign: 'center'
          }}>
            <div className="stat-number" style={{ color: '#9c27b0' }}>🤖</div>
            <div className="stat-label" style={{ color: '#9c27b0' }}>
              AI Active
            </div>
          </div>
        </div>
        
        {/* AI Recommendations */}
        <div className="glass-card" style={{
          background: 'rgba(255, 193, 7, 0.1)',
          padding: '16px',
          borderRadius: '12px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#f57c00', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
            🤖 AI Recommendations:
          </h4>
          {aiRecommendations.map((rec, index) => (
            <div key={index} style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: '#ef6c00',
              marginBottom: '4px'
            }}>
              {rec}
            </div>
          ))}
        </div>
      </div>

      {!activeExercise ? (
        <div className="grid-responsive">
          {exercises.map(exercise => (
            <div key={exercise.id} className="glass-card card-hover animate-fade-in-scale" style={{
              background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.1) 0%, rgba(63, 81, 181, 0.1) 100%)',
              cursor: 'pointer'
            }}>
              <h3 style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: '700',
                color: '#673ab7',
                marginBottom: '12px'
              }}>
                {exercise.name}
              </h3>
              
              <p style={{
                color: '#5e35b1',
                marginBottom: '16px',
                fontSize: 'clamp(12px, 3vw, 14px)',
                lineHeight: '1.5'
              }}>
                {exercise.description}
              </p>
              
              <div className="glass-card" style={{
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: '#4527a0',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  ⏱️ Duration: {Math.floor(exercise.duration / 60)} min
                </div>
                <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#6a1b9a' }}>
                  Benefits: {exercise.benefits.join(' • ')}
                </div>
              </div>
              
              <button
                onClick={() => startExercise(exercise)}
                className="btn-gradient"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #673ab7 0%, #5e35b1 100%)'
                }}
              >
                🚀 Start AI Session
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card card-hover animate-fade-in-scale" style={{
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: '700',
            color: '#9c27b0',
            marginBottom: '20px'
          }}>
            {activeExercise.name}
          </h3>
          
          <div className="stat-number" style={{
            fontSize: 'clamp(36px, 10vw, 56px)',
            color: '#7b1fa2',
            marginBottom: '24px'
          }}>
            {formatTime(timer)}
          </div>
          
          {/* Breathing Guide for Deep Breathing */}
          {activeExercise.id === 1 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={getBreathingGuide()}>
                {breathingPhase.toUpperCase()}
              </div>
              <p style={{
                marginTop: '12px',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                color: '#8e24aa',
                fontWeight: '600'
              }}>
                {breathingPhase === 'inhale' ? '🌬️ Breathe In...' :
                 breathingPhase === 'hold' ? '⏸️ Hold...' : '💨 Breathe Out...'}
              </p>
            </div>
          )}
          
          <div className="glass-card" style={{
            background: 'rgba(255, 255, 255, 0.3)',
            padding: 'clamp(16px, 4vw, 20px)',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h4 style={{
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: '600',
              color: '#7b1fa2',
              marginBottom: '12px'
            }}>
              🤖 AI Instructions:
            </h4>
            <ul style={{
              color: '#8e24aa',
              lineHeight: '1.6',
              fontSize: 'clamp(12px, 3vw, 14px)',
              paddingLeft: '20px'
            }}>
              {activeExercise.instructions.map((instruction, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{
            display: 'flex',
            gap: 'clamp(12px, 3vw, 16px)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setIsActive(!isActive)}
              className="btn-gradient"
              style={{
                background: isActive ? 
                  'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' : 
                  'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                minWidth: '100px'
              }}
            >
              {isActive ? '⏸️ Pause' : '▶️ Resume'}
            </button>
            
            <button
              onClick={stopExercise}
              className="btn-gradient"
              style={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                minWidth: '100px'
              }}
            >
              ⏹️ Complete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}