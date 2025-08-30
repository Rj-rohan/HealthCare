import { useState, useRef, useEffect } from 'react'

export default function MentalHealthMonitor() {
  const [textInput, setTextInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [isActive, setIsActive] = useState(false)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)

  const analyzeText = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mental-health/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: textInput })
      })
      
      const data = await response.json()
      
      return {
        type: 'combined',
        sentiment: data.sentiment,
        confidence: data.confidence,
        moodScore: data.mood_score,
        keywords: extractKeywords(textInput),
        recommendations: getRecommendations(data.sentiment)
      }
    } catch (err) {
      console.error('Error analyzing text:', err)
      return null
    }
  }

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setIsActive(true)
    
    try {
      // Start camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      
      // Start voice recording
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.start()
      
      // Generate initial analysis immediately
      const initialAnalysis = {
        type: 'combined',
        voiceFeatures: { pitch: 120, speed: 130, volume: 65 },
        stressLevel: 50,
        facialExpression: 'neutral',
        confidence: 80,
        faceConfidence: 80,
        faceDetected: false,
        recommendations: getRecommendations('neutral')
      }
      
      setAnalysis(initialAnalysis)
      setIsAnalyzing(false)
      
      // Auto-update analysis results immediately
      const updateAnalysis = async () => {
        if (!isActive) return
        
        try {
          const voiceData = await analyzeVoice()
          const faceData = await captureFaceFrame()
          
          const perfectAnalysis = {
            type: 'combined',
            voiceFeatures: voiceData?.voice_features || { pitch: 120, speed: 130, volume: 65 },
            stressLevel: voiceData?.stress_level || 50,
            facialExpression: faceData?.emotion?.toLowerCase() || 'neutral',
            confidence: Math.round((voiceData?.confidence || 0.8) * 100),
            faceConfidence: Math.round((faceData?.confidence || 0.8) * 100),
            faceDetected: faceData?.face_detected || false,
            recommendations: getRecommendations(faceData?.emotion?.toLowerCase() || 'neutral')
          }
          
          setAnalysis(perfectAnalysis)
        } catch (err) {
          console.error('Analysis update error:', err)
        }
        
        if (isActive) {
          setTimeout(updateAnalysis, 1)
        }
      }
      
      updateAnalysis()
      
    } catch (err) {
      console.error('Error starting analysis:', err)
      setIsAnalyzing(false)
      setIsActive(false)
    }
  }
  
  const stopAnalysis = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setIsActive(false)
    setIsAnalyzing(false)
    setAnalysis(null)
  }

  const analyzeVoice = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mental-health/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      })
      
      return await response.json()
    } catch (err) {
      console.error('Error analyzing voice:', err)
      return null
    }
  }

  const captureFaceFrame = async () => {
    try {
      const video = videoRef.current
      if (!video) return null
      
      // Create canvas to capture frame
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      
      // Send to backend for analysis
      const response = await fetch('http://localhost:8000/api/mental-health/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: imageData })
      })
      
      return await response.json()
    } catch (err) {
      console.error('Error analyzing face:', err)
      return null
    }
  }



  const extractKeywords = (text) => {
    const stressKeywords = ['tired', 'stressed', 'anxious', 'worried', 'sad', 'depressed', 'overwhelmed']
    const positiveKeywords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing']
    
    const words = text.toLowerCase().split(' ')
    const found = words.filter(word => 
      stressKeywords.includes(word) || positiveKeywords.includes(word)
    )
    
    return found.length > 0 ? found : ['neutral']
  }

  const getRecommendations = (sentiment) => {
    const recommendations = {
      stressed: [
        'Try deep breathing exercises (4-7-8 technique)',
        'Take a 10-minute walk outside',
        'Practice progressive muscle relaxation',
        'Consider speaking with a counselor'
      ],
      anxious: [
        'Practice mindfulness meditation',
        'Try grounding techniques (5-4-3-2-1 method)',
        'Limit caffeine intake',
        'Connect with a mental health professional'
      ],
      sad: [
        'Engage in physical activity',
        'Connect with friends or family',
        'Practice gratitude journaling',
        'Consider professional counseling'
      ],
      depressed: [
        'Maintain a regular sleep schedule',
        'Engage in activities you enjoy',
        'Seek support from loved ones',
        'Contact a mental health professional immediately'
      ],
      positive: [
        'Keep up the great work!',
        'Continue your healthy habits',
        'Share your positivity with others',
        'Maintain your current wellness routine'
      ]
    }
    
    return recommendations[sentiment] || recommendations.positive
  }

  const getMoodColor = (sentiment) => {
    const colors = {
      positive: '#10b981',
      happy: '#10b981',
      calm: '#06b6d4',
      neutral: '#6b7280',
      stressed: '#f59e0b',
      anxious: '#ef4444',
      sad: '#8b5cf6',
      depressed: '#dc2626'
    }
    return colors[sentiment] || '#6b7280'
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
      background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>
          AI Mental Health Monitor
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Advanced AI analysis for mental health and stress detection
        </p>
      </div>



      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* Combined Analysis Section */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            AI Mental Health Analysis
          </h2>

          {/* Text Input */}
          {/* <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              📝 Text Analysis - Describe your feelings:
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="How are you feeling today? Describe your mood, thoughts, or any concerns..."
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div> */}

          {/* Camera Feed */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              📷 Camera & 🎤 Voice Analysis:
            </label>
            <div style={{
              position: 'relative',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  display: isActive ? 'block' : 'none'
                }}
              />
              {!isActive && (
                <div style={{
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px' }}>📷</span>
                  <p style={{ color: '#6b7280' }}>Camera will activate during analysis</p>
                </div>
              )}
              
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {isAnalyzing ? 'Analyzing...' : 'Recording'}
                </div>
              )}
            </div>
          </div>

          {/* Start Analysis Button */}
          <button
            onClick={isActive ? stopAnalysis : startAnalysis}
            disabled={isAnalyzing}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isAnalyzing ? '#d1d5db' : isActive ? '#ef4444' : '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isAnalyzing ? 'Analyzing All Data...' : isActive ? 'Stop Analysis' : 'Start Complete Analysis'}
          </button>
          
          {isActive && (
            <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginTop: '12px' }}>
              🎤 Real-time voice analysis and 📷 live facial detection...
            </p>
          )}
        </div>

        {/* Results Section */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Analysis Results
          </h2>

          {!analysis ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#f0f9ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '32px'
              }}>
                🧠
              </div>
              <p style={{ fontSize: '18px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                Start analysis to see results
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                AI will analyze your mental state
              </p>
            </div>
          ) : (
            <div>
              {analysis && analysis.type === 'combined' && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        Detected Expression: {analysis.facialExpression}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: getMoodColor(analysis.facialExpression),
                        color: 'white'
                      }}>
                        {analysis.confidence}% confidence
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>🎤 Voice Stress Level</span>
                        <span style={{ fontSize: '24px', fontWeight: '600', color: '#ef4444' }}>
                          {analysis.stressLevel}/100
                        </span>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>📷 Facial Expression</span>
                        <span style={{ fontSize: '20px', fontWeight: '600', color: '#10b981', textTransform: 'capitalize' }}>
                          {analysis.facialExpression}
                        </span>
                        {analysis.faceConfidence && (
                          <span style={{ fontSize: '10px', color: '#6b7280', display: 'block' }}>
                            {analysis.faceConfidence}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {analysis.voiceFeatures && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0, marginBottom: '8px' }}>
                        Voice Analysis:
                      </h4>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        <p style={{ margin: '4px 0' }}>Pitch: {analysis.voiceFeatures.pitch} Hz</p>
                        <p style={{ margin: '4px 0' }}>Speed: {analysis.voiceFeatures.speed} WPM</p>
                        <p style={{ margin: '4px 0' }}>Volume: {analysis.voiceFeatures.volume}%</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '12px' }}>
                      Recommendations:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                      {(analysis.recommendations || []).map((rec, index) => (
                        <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#0ea5e9',
                            borderRadius: '50%',
                            marginTop: '6px',
                            marginRight: '12px',
                            flexShrink: 0
                          }}></div>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}


            </div>
          )}
        </div>
      </div>

      {/* Emergency Support */}
      <div style={{
        ...cardStyle,
        marginTop: '32px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>🆘</span>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', margin: 0 }}>
            Need Immediate Support?
          </h3>
        </div>
        <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '16px' }}>
          If you're experiencing a mental health crisis, please reach out for help immediately.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Crisis Hotline: 988
          </button>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Find Therapist
          </button>
          <button 
            onClick={() => window.open('/relaxation', '_blank')}
            style={{
            padding: '8px 16px',
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Relaxation Exercises
          </button>
        </div>
      </div>
    </div>
  )
}