import { useState, useEffect } from 'react'

export default function RelaxationExercises() {
  const [activeExercise, setActiveExercise] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [timer, setTimer] = useState(0)
  const [breathingPhase, setBreathingPhase] = useState('inhale')

  const exercises = [
    {
      id: 'breathing',
      name: '4-7-8 Breathing',
      icon: '🫁',
      description: 'A powerful breathing technique to reduce anxiety and promote relaxation',
      duration: 240,
      instructions: [
        'Sit comfortably with your back straight',
        'Place tongue tip behind upper front teeth',
        'Exhale completely through mouth',
        'Inhale through nose for 4 counts',
        'Hold breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'Repeat cycle 4 times'
      ]
    },
    {
      id: 'progressive',
      name: 'Progressive Muscle Relaxation',
      icon: '💪',
      description: 'Systematically tense and relax muscle groups to release physical tension',
      duration: 600,
      instructions: [
        'Lie down or sit comfortably',
        'Start with your toes - tense for 5 seconds',
        'Release and notice the relaxation',
        'Move up to calves, thighs, abdomen',
        'Continue with arms, shoulders, face',
        'Hold each tension for 5 seconds',
        'Focus on the contrast between tension and relaxation'
      ]
    },
    {
      id: 'mindfulness',
      name: '5-4-3-2-1 Grounding',
      icon: '🧘',
      description: 'A mindfulness technique to bring you back to the present moment',
      duration: 300,
      instructions: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste',
        'Take deep breaths between each step',
        'Focus fully on each sensation'
      ]
    },
    {
      id: 'visualization',
      name: 'Peaceful Place Visualization',
      icon: '🌅',
      description: 'Imagine a calm, peaceful place to reduce stress and anxiety',
      duration: 480,
      instructions: [
        'Close your eyes and breathe deeply',
        'Imagine your ideal peaceful place',
        'See the colors, shapes, and lighting',
        'Hear the sounds of this place',
        'Feel the temperature and textures',
        'Smell any scents in the air',
        'Stay in this place as long as needed'
      ]
    }
  ]

  useEffect(() => {
    let interval = null
    if (isActive && activeExercise) {
      interval = setInterval(() => {
        setTimer(timer => {
          if (timer >= activeExercise.duration) {
            setIsActive(false)
            return 0
          }
          return timer + 1
        })
      }, 1000)
    } else if (!isActive && timer !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive, timer, activeExercise])

  useEffect(() => {
    if (activeExercise?.id === 'breathing' && isActive) {
      const breathingInterval = setInterval(() => {
        setBreathingPhase(phase => {
          switch (phase) {
            case 'inhale': return 'hold'
            case 'hold': return 'exhale'
            case 'exhale': return 'inhale'
            default: return 'inhale'
          }
        })
      }, 4000)
      return () => clearInterval(breathingInterval)
    }
  }, [activeExercise, isActive])

  const startExercise = (exercise) => {
    setActiveExercise(exercise)
    setTimer(0)
    setIsActive(true)
    setBreathingPhase('inhale')
  }

  const stopExercise = () => {
    setIsActive(false)
    setTimer(0)
    setActiveExercise(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In (4 counts)'
      case 'hold': return 'Hold (7 counts)'
      case 'exhale': return 'Breathe Out (8 counts)'
      default: return 'Breathe In'
    }
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>
          Relaxation Exercises
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Guided exercises to help you relax, reduce stress, and improve mental well-being
        </p>
      </div>

      {!activeExercise ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {exercises.map((exercise) => (
            <div key={exercise.id} style={cardStyle}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{exercise.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '8px' }}>
                  {exercise.name}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, marginBottom: '16px' }}>
                  {exercise.description}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                  Duration: {Math.floor(exercise.duration / 60)} minutes
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0, marginBottom: '8px' }}>
                  Instructions:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                  {exercise.instructions.slice(0, 3).map((instruction, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{
                        width: '4px',
                        height: '4px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        marginTop: '6px',
                        marginRight: '8px',
                        flexShrink: 0
                      }}></div>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => startExercise(exercise)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                Start Exercise
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>{activeExercise.icon}</div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '8px' }}>
                {activeExercise.name}
              </h2>
              <p style={{ color: '#6b7280', margin: 0 }}>{activeExercise.description}</p>
            </div>

            {/* Timer and Progress */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '8px solid #e5e7eb',
                borderTop: '8px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                position: 'relative'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    {formatTime(timer)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    / {formatTime(activeExercise.duration)}
                  </div>
                </div>
              </div>

              {activeExercise.id === 'breathing' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#166534', margin: 0 }}>
                    {getBreathingInstruction()}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setIsActive(!isActive)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: isActive ? '#f59e0b' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {isActive ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={stopExercise}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Stop
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '12px' }}>
                Follow these steps:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                {activeExercise.instructions.map((instruction, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div style={{ ...cardStyle, marginTop: '32px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0369a1', margin: 0, marginBottom: '12px' }}>
          💡 Relaxation Tips
        </h3>
        <ul style={{ margin: 0, paddingLeft: '16px', color: '#0369a1' }}>
          <li style={{ marginBottom: '4px' }}>Practice regularly for best results</li>
          <li style={{ marginBottom: '4px' }}>Find a quiet, comfortable space</li>
          <li style={{ marginBottom: '4px' }}>Don't worry if your mind wanders - it's normal</li>
          <li>Start with shorter sessions and gradually increase duration</li>
        </ul>
      </div>
    </div>
  )
}