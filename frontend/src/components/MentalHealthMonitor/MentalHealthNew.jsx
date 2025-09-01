import { useState, useRef, useEffect } from 'react'

const MentalHealthNew = () => {
  const [activeMode, setActiveMode] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [moodHistory, setMoodHistory] = useState([
    { date: '2024-01-15', mood: 'positive', score: 85, type: 'text' },
    { date: '2024-01-14', mood: 'neutral', score: 65, type: 'voice' },
    { date: '2024-01-13', mood: 'positive', score: 78, type: 'face' }
  ])
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const analysisTypes = [
    { id: 'text', name: 'Text Analysis', icon: '📝', description: 'Analyze your written thoughts' },
    { id: 'voice', name: 'Voice Analysis', icon: '🎤', description: 'Analyze speech patterns' },
    { id: 'face', name: 'Facial Analysis', icon: '📷', description: 'Detect facial emotions' }
  ]

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera access error:', err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const analyzeText = async () => {
    if (!textInput.trim()) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('http://localhost:8000/api/mental-health/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
      })
      
      const result = await response.json()
      setResults(result)
      
      const newEntry = {
        date: new Date().toISOString().split('T')[0],
        mood: result.sentiment,
        score: Math.round(result.confidence * 100),
        type: 'text'
      }
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 9)])
      
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeFace = async () => {
    if (!videoRef.current) return
    
    setIsAnalyzing(true)
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      ctx.drawImage(videoRef.current, 0, 0)
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      
      const response = await fetch('http://localhost:8000/api/mental-health/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      })
      
      const result = await response.json()
      setResults(result)
      
      const newEntry = {
        date: new Date().toISOString().split('T')[0],
        mood: result.emotion,
        score: Math.round(result.confidence * 100),
        type: 'face'
      }
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 9)])
      
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeVoice = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('http://localhost:8000/api/mental-health/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await response.json()
      setResults(result)
      
      const newEntry = {
        date: new Date().toISOString().split('T')[0],
        mood: result.emotion,
        score: Math.round(result.confidence * 100),
        type: 'voice'
      }
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 9)])
      
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'positive': return 'var(--success)'
      case 'negative': return 'var(--error)'
      case 'neutral': return 'var(--warning)'
      default: return 'var(--text-muted)'
    }
  }

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'positive': return '😊'
      case 'negative': return '😔'
      case 'neutral': return '😐'
      default: return '🤔'
    }
  }

  useEffect(() => {
    if (activeMode === 'face') {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => stopCamera()
  }, [activeMode])

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-1" style={{ margin: 0 }}>
              🧠 Mental Health Monitor
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
              AI-powered emotional wellness tracking
            </p>
          </div>
          <div style={{
            padding: '1rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {moodHistory.length > 0 ? moodHistory[0].score : 0}%
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Wellness Score
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Analysis Panel */}
        <div>
          <div className="glass-card">
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>
              🔍 Emotional Analysis
            </h2>

            {/* Analysis Type Selection */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {analysisTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setActiveMode(type.id)}
                  className="glass-card"
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    background: activeMode === type.id 
                      ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                      : 'var(--glass-bg)',
                    color: activeMode === type.id ? 'white' : 'var(--text-primary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {type.icon}
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                    {type.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Analysis Interface */}
            {activeMode === 'text' && (
              <div>
                <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
                  📝 Share Your Thoughts
                </h3>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="How are you feeling today? Share your thoughts, concerns, or experiences..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    resize: 'vertical',
                    outline: 'none',
                    marginBottom: '1rem'
                  }}
                />
                <button
                  onClick={analyzeText}
                  disabled={isAnalyzing || !textInput.trim()}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {isAnalyzing ? '🔄 Analyzing...' : '🧠 Analyze Sentiment'}
                </button>
              </div>
            )}

            {activeMode === 'face' && (
              <div>
                <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
                  📷 Facial Emotion Detection
                </h3>
                <div style={{
                  position: 'relative',
                  backgroundColor: '#000',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  marginBottom: '1rem',
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
                      objectFit: 'cover'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}>
                    📷 Live Camera Feed
                  </div>
                </div>
                <button
                  onClick={analyzeFace}
                  disabled={isAnalyzing}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {isAnalyzing ? '🔄 Analyzing...' : '📸 Capture & Analyze'}
                </button>
              </div>
            )}

            {activeMode === 'voice' && (
              <div>
                <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
                  🎤 Voice Pattern Analysis
                </h3>
                <div style={{
                  background: 'var(--glass-bg)',
                  padding: '2rem',
                  borderRadius: '1rem',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎤</div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Voice analysis will detect emotional patterns in your speech
                  </p>
                  <div style={{
                    width: '100px',
                    height: '4px',
                    background: 'var(--primary)',
                    borderRadius: '2px',
                    margin: '0 auto',
                    animation: isAnalyzing ? 'pulse 1s infinite' : 'none'
                  }} />
                </div>
                <button
                  onClick={analyzeVoice}
                  disabled={isAnalyzing}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {isAnalyzing ? '🔄 Analyzing...' : '🎤 Start Voice Analysis'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results & History */}
        <div>
          {/* Current Results */}
          {results && (
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
                📊 Analysis Results
              </h3>
              
              <div style={{
                background: `${getMoodColor(results.sentiment || results.emotion)}20`,
                border: `1px solid ${getMoodColor(results.sentiment || results.emotion)}40`,
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '3rem' }}>
                    {getMoodIcon(results.sentiment || results.emotion)}
                  </div>
                  <div>
                    <h4 style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      color: getMoodColor(results.sentiment || results.emotion),
                      textTransform: 'capitalize'
                    }}>
                      {results.sentiment || results.emotion}
                    </h4>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                      Confidence: {Math.round((results.confidence || 0) * 100)}%
                    </p>
                  </div>
                </div>

                {results.stress_level && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Stress Level
                      </span>
                      <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                        {results.stress_level}/5
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'var(--border)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(results.stress_level / 5) * 100}%`,
                        height: '100%',
                        background: results.stress_level <= 2 
                          ? 'var(--success)' 
                          : results.stress_level <= 3 
                          ? 'var(--warning)' 
                          : 'var(--error)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                {results.recommendations && (
                  <div>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                      💡 Recommendations:
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                      {results.recommendations.map((rec, index) => (
                        <li key={index} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mood History */}
          <div className="glass-card">
            <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
              📈 Mood History
            </h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {moodHistory.map((entry, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: index < moodHistory.length - 1 ? '1px solid var(--border)' : 'none',
                  marginBottom: index < moodHistory.length - 1 ? '1rem' : 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `${getMoodColor(entry.mood)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      {getMoodIcon(entry.mood)}
                    </div>
                    <div>
                      <h5 style={{ margin: 0, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {entry.mood}
                      </h5>
                      <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {entry.date} • {entry.type}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    background: `${getMoodColor(entry.mood)}20`,
                    color: getMoodColor(entry.mood),
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {entry.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentalHealthNew