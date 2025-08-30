import { useState, useRef, useEffect } from 'react'

export default function AIGymTrainer() {
  // User Profile State
  const [userProfile, setUserProfile] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    fitnessGoal: 'muscle_gain',
    fitnessLevel: 'beginner'
  })
  
  // Workout & Progress State
  const [workoutPlan, setWorkoutPlan] = useState([])
  const [currentExercise, setCurrentExercise] = useState(null)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [repCount, setRepCount] = useState(0)
  const [setCount, setSetCount] = useState(0)
  const [workoutStreak, setWorkoutStreak] = useState(0)
  const [caloriesBurned, setCaloriesBurned] = useState(0)
  const [formFeedback, setFormFeedback] = useState('')
  const [formScore, setFormScore] = useState(100)
  const [annotatedImage, setAnnotatedImage] = useState(null)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showWorkoutPlan, setShowWorkoutPlan] = useState(false)
  
  // Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Load user data on component mount
  useEffect(() => {
    loadUserData()
    updateWorkoutStreak()
  }, [])

  // Removed unused user data loading functions

  // Removed unused generateWorkoutPlan function

  const startWorkout = async () => {
    try {
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      })
      
      // Store stream reference
      streamRef.current = stream
      
      // Ensure video element exists and wait for it
      let attempts = 0
      while (!videoRef.current && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      
      if (!videoRef.current) {
        throw new Error('Video element not found after waiting')
      }
      
      // Set video source
      videoRef.current.srcObject = stream
      
      // Set workout as active
      setIsWorkoutActive(true)
      
      // Wait for video to be ready with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video loading timeout'))
        }, 10000) // 10 second timeout
        
        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeout)
          resolve()
        }
        
        videoRef.current.onerror = (error) => {
          clearTimeout(timeout)
          reject(error)
        }
      })
      
    } catch (err) {
      console.error('❌ Camera access error:', err)
      
      // Reset state on error
      setIsWorkoutActive(false)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      // Show user-friendly error message
      if (err.name === 'NotAllowedError') {
        alert('❌ Camera access denied! Please allow camera access and try again.')
      } else if (err.name === 'NotFoundError') {
        alert('❌ No camera found! Please connect a camera and try again.')
      } else if (err.message === 'Video loading timeout') {
        alert('❌ Camera took too long to load! Please refresh and try again.')
      } else {
        alert(`❌ Camera error: ${err.message}`)
      }
    }
  }

  const loadUserData = () => {
    const savedProfile = localStorage.getItem('gymProfile')
    const savedStreak = localStorage.getItem('workoutStreak')
    
    if (savedProfile) setUserProfile(JSON.parse(savedProfile))
    if (savedStreak) setWorkoutStreak(parseInt(savedStreak))
  }

  const updateWorkoutStreak = () => {
    const today = new Date().toDateString()
    const lastWorkout = localStorage.getItem('lastWorkoutDate')
    
    if (lastWorkout !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (lastWorkout === yesterday.toDateString()) {
        const newStreak = workoutStreak + 1
        setWorkoutStreak(newStreak)
        localStorage.setItem('workoutStreak', newStreak.toString())
      } else {
        setWorkoutStreak(1)
        localStorage.setItem('workoutStreak', '1')
      }
      
      localStorage.setItem('lastWorkoutDate', today)
    }
  }

  const generateWorkoutPlan = () => {
    const plans = {
      muscle_gain: [
        { id: 1, name: 'Push-ups', sets: 3, reps: 12, calories: 8, icon: '💪', type: 'pushup', difficulty: 'beginner' },
        { id: 2, name: 'Squats', sets: 3, reps: 15, calories: 10, icon: '🦵', type: 'squat', difficulty: 'beginner' },
        { id: 3, name: 'Plank', sets: 3, duration: 30, calories: 5, icon: '🏋️', type: 'plank', difficulty: 'beginner' },
        { id: 4, name: 'Bicep Curls', sets: 3, reps: 12, calories: 6, icon: '💪', type: 'bicep_curl', difficulty: 'beginner' },
        { id: 5, name: 'Pull-ups', sets: 3, reps: 8, calories: 12, icon: '🏋️', type: 'pullup', difficulty: 'intermediate' }
      ],
      fat_loss: [
        { id: 1, name: 'Jumping Jacks', sets: 3, reps: 20, calories: 12, icon: '🤸', type: 'jumping_jack', difficulty: 'beginner' },
        { id: 2, name: 'Push-ups', sets: 3, reps: 15, calories: 10, icon: '💪', type: 'pushup', difficulty: 'beginner' },
        { id: 3, name: 'Squats', sets: 3, reps: 20, calories: 12, icon: '🦵', type: 'squat', difficulty: 'beginner' },
        { id: 4, name: 'Sit-ups', sets: 3, reps: 15, calories: 8, icon: '🏋️', type: 'situp', difficulty: 'beginner' },
        { id: 5, name: 'Burpees', sets: 3, reps: 10, calories: 15, icon: '🔥', type: 'burpee', difficulty: 'intermediate' }
      ],
      endurance: [
        { id: 1, name: 'Lunges', sets: 3, reps: 12, calories: 9, icon: '🦵', type: 'lunge', difficulty: 'beginner' },
        { id: 2, name: 'Wall Sit', sets: 3, duration: 45, calories: 7, icon: '🧱', type: 'wall_sit', difficulty: 'beginner' },
        { id: 3, name: 'Step-ups', sets: 3, reps: 15, calories: 8, icon: '📶', type: 'step_up', difficulty: 'beginner' },
        { id: 4, name: 'Calf Raises', sets: 3, reps: 20, calories: 5, icon: '🦵', type: 'calf_raise', difficulty: 'beginner' },
        { id: 5, name: 'Jumping Jacks', sets: 3, reps: 15, calories: 10, icon: '🤸', type: 'jumping_jack', difficulty: 'beginner' }
      ]
    }
    
    // Filter exercises based on user's fitness level
    const userLevel = userProfile.fitnessLevel
    const filteredExercises = plans[userProfile.fitnessGoal] || plans.muscle_gain
    const levelFiltered = filteredExercises.filter(exercise => {
      if (userLevel === 'beginner') return exercise.difficulty === 'beginner'
      if (userLevel === 'intermediate') return exercise.difficulty === 'beginner' || exercise.difficulty === 'intermediate'
      return true // advanced users can do all exercises
    })
    
    setWorkoutPlan(levelFiltered)
    localStorage.setItem('gymProfile', JSON.stringify(userProfile))
    setShowProfileModal(false)
    setShowWorkoutPlan(true)
  }

  const resetExerciseCounter = async () => {
    if (!currentExercise) return
    
    try {
      await fetch('http://localhost:8000/api/test/exercise/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          exercise_type: currentExercise.type || currentExercise.name.toLowerCase().replace(/[^a-z]/g, '_')
        })
      })
      
      setRepCount(0)
      setSetCount(0)
    } catch (err) {
      console.error('Reset error:', err)
    }
  }

  const completeSet = () => {
    setSetCount(prev => prev + 1)
    setRepCount(0)
    setFormFeedback(`Set ${setCount + 1} completed! 🎉`)
    if (voiceEnabled) {
      speakFeedback(`Set ${setCount + 1} completed! Great work!`)
    }
  }

  const calculateCaloriesBurned = () => {
    if (!currentExercise) return 0
    const baseCalories = currentExercise.calories || 5
    const totalSets = setCount
    const totalReps = repCount
    return Math.round((baseCalories * totalSets) + (baseCalories * 0.1 * totalReps))
  }

  const saveWorkoutLog = () => {
    if (currentExercise && (repCount > 0 || setCount > 0)) {
      const logs = JSON.parse(localStorage.getItem('workoutLogs') || '[]')
      const workoutLog = {
        date: new Date().toISOString(),
        exercise: currentExercise.name,
        reps: repCount,
        sets: setCount,
        calories: calculateCaloriesBurned(),
        formScore: formScore,
        duration: '30 minutes' // You can make this dynamic
      }
      logs.push(workoutLog)
      localStorage.setItem('workoutLogs', logs)
      
      // Update calories burned
      setCaloriesBurned(prev => prev + workoutLog.calories)
    }
  }

  const stopWorkout = () => {
    // Stop the real-time analysis interval
    if (streamRef.current && streamRef.current.analysisInterval) {
      clearInterval(streamRef.current.analysisInterval)
      streamRef.current.analysisInterval = null
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    setIsWorkoutActive(false)
    setCurrentExercise(null)
    setRepCount(0)
    setAnnotatedImage(null)
    setFormFeedback('')
    setFormScore(100)
    
    // Save workout log
    if (currentExercise && repCount > 0) {
      const logs = JSON.parse(localStorage.getItem('workoutLogs') || '[]')
      logs.push({
        date: new Date().toISOString(),
        exercise: currentExercise.name,
        reps: repCount
      })
      localStorage.setItem('workoutLogs', logs)
    }
    
    // Workout stopped
  }

  const startExercise = (exercise) => {
    setCurrentExercise(exercise)
    setRepCount(0)
    setFormFeedback('Get ready! Position yourself in front of the camera.')
    setAnnotatedImage(null)
    
    // Ensure video is playing
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play()
    }
    
    // Trigger immediate analysis to start visual tracking
    setTimeout(async () => {
      if (isWorkoutActive && currentExercise && videoRef.current) {
        try {
          // Wait a bit more for video to be fully ready
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const result = await analyzeExerciseFrame()
          if (result && result.annotated_image) {
            setAnnotatedImage(result.annotated_image)
            // Start continuous analysis loop
            startContinuousAnalysis()
          }
        } catch (error) {
          console.error('❌ Immediate analysis failed:', error)
        }
      }
    }, 1500) // Wait 1.5 seconds for exercise state to update
  }

  const analyzeExerciseFrame = async () => {
    try {
      const video = videoRef.current
      
      if (!video) {
        console.log('❌ Video not ready - videoRef.current is null')
        return null
      }
      
      if (!currentExercise) {
        console.log('❌ Current exercise not set')
        return null
      }
      
      if (!isWorkoutActive) {
        console.log('❌ Workout not active')
        return null
      }
      
      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.log('❌ Video dimensions not ready')
        return null
      }
      
      // Capture frame from video
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      
      const exerciseType = currentExercise.type || currentExercise.name.toLowerCase().replace(/[^a-z]/g, '_')
      
      console.log('🎯 Analyzing frame for exercise:', exerciseType)
      console.log('🎯 Image data length:', imageData.length)
      
      // Send to backend for ML-based analysis
      const response = await fetch('http://localhost:8000/api/test/exercise/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData, 
          exercise_type: exerciseType
        })
      })
      
      if (!response.ok) {
        console.error('❌ Backend response not ok:', response.status)
        return null
      }
      
      const result = await response.json()
      console.log('🎯 Backend analysis result:', result)
      
      if (result.success) {
        // Update rep count from ML model
        if (result.rep_count !== undefined) {
          setRepCount(result.rep_count)
        }
        
        // Update form feedback
        if (result.feedback) {
          setFormFeedback(result.feedback)
        }
        
        // Update form score
        if (result.form_score !== undefined) {
          setFormScore(result.form_score)
        }
        
        // Update annotated image from backend (this contains the enhanced dots and lines)
        if (result.annotated_image) {
          setAnnotatedImage(result.annotated_image)
          console.log('🎯 Enhanced visual tracking image updated!')
        }
        
        // Provide voice feedback if enabled
        if (voiceEnabled && result.feedback) {
          speakFeedback(result.feedback)
        }
        
        return result
      } else {
        console.error('❌ Analysis failed:', result.error)
        return null
      }
      
    } catch (error) {
      console.error('❌ Error in frame analysis:', error)
      return null
    }
  }

  // Removed drawPoseOverlay - using backend visual tracking instead

  // Start continuous analysis loop
  const startContinuousAnalysis = () => {
    // Clear any existing interval
    if (streamRef.current && streamRef.current.analysisInterval) {
      clearInterval(streamRef.current.analysisInterval)
    }
    
    // Start new analysis interval
    const analysisInterval = setInterval(async () => {
      if (!isWorkoutActive || !currentExercise || !videoRef.current) {
        clearInterval(analysisInterval)
        return
      }
      
      try {
        // Analyze current frame
        const result = await analyzeExerciseFrame()
        if (result) {
          // Update rep count
          if (result.count !== undefined) {
            setRepCount(result.count)
          }
          
          // Update form feedback
          if (result.feedback) {
            setFormFeedback(result.feedback)
          }
          
          // Update form score
          if (result.form_score !== undefined) {
            setFormScore(result.form_score)
          }
          
          // Update annotated image for visual tracking
          if (result.annotated_image) {
            setAnnotatedImage(result.annotated_image)
          }
          
          // Voice feedback
          if (voiceEnabled && result.feedback && result.feedback !== formFeedback) {
            speakFeedback(result.feedback)
          }
        }
      } catch (error) {
        console.error('❌ Continuous analysis error:', error)
      }
    }, 1000) // Analyze every 1 second
    
    // Store interval reference
    streamRef.current.analysisInterval = analysisInterval
  }

  // Removed unused camera status check function

  const speakFeedback = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech for immediate feedback
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9  // Slightly faster for real-time feedback
      utterance.pitch = 1.1 // Slightly higher pitch for clarity
      utterance.volume = 0.8 // Good volume for gym environment
      
      // Real-time voice assistance
      utterance.onstart = () => console.log('🔊 Voice feedback started:', text)
      utterance.onend = () => console.log('🔊 Voice feedback completed')
      
      speechSynthesis.speak(utterance)
    }
  }

  // Removed duplicate functions - they are defined above

  // Removed unused generateNutritionPlan function

  // Removed unused completeSet function

  // Removed unused cardStyle

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      padding: '32px'
    }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', margin: 0, marginBottom: '8px' }}>
          🏋️ AI Gym Trainer
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
          Your personal AI fitness coach with pose detection and form correction
        </p>
      </div>

      {/* Workout Streak */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', marginBottom: '32px', textAlign: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
          🔥 {workoutStreak}-Day Workout Streak!
        </h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          {workoutStreak === 0 ? 'Start your journey today! 💪' : workoutStreak === 1 ? 'Great start! Keep going! 🚀' : 'Amazing consistency! 🔥'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* Profile & Camera */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            📊 Fitness Profile & Camera
          </h2>
          
          {/* Exercise Selection */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '16px' }}>
              🏋️ Select Exercise
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { name: 'Push-ups', type: 'pushup', icon: '💪' },
                { name: 'Squats', type: 'squat', icon: '🦵' },
                { name: 'Plank', type: 'plank', icon: '🏋️' },
                { name: 'Bicep Curls', type: 'bicep_curl', icon: '💪' }
              ].map((exercise, index) => (
                <button
                  key={index}
                  onClick={() => startExercise(exercise)}
                  disabled={!isWorkoutActive}
                  style={{
                    padding: '12px',
                    backgroundColor: currentExercise?.name === exercise.name ? '#f59e0b' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: isWorkoutActive ? 'pointer' : 'not-allowed',
                    opacity: isWorkoutActive ? 1 : 0.5
                  }}
                >
                  {exercise.icon} {exercise.name}
                </button>
              ))}
            </div>
            
            {/* Profile & Workout Plan Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🏃‍♂️ Setup Profile
              </button>
              <button
                onClick={() => setShowWorkoutPlan(true)}
                disabled={workoutPlan.length === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: workoutPlan.length > 0 ? '#10b981' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: workoutPlan.length > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  opacity: workoutPlan.length > 0 ? 1 : 0.5
                }}
              >
                🎯 View Workout Plan
              </button>
            </div>
          </div>
          
          {/* Real-Time Instructions */}
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '14px' }}>
              🎯 How to Get Real-Time Assistance
            </h3>
            <p style={{ margin: '0', fontSize: '12px', color: '#065f46' }}>
              1. <strong>Click "Start Workout"</strong> for continuous analysis<br/>
              2. <strong>Select an exercise</strong> to begin tracking<br/>
              3. <strong>Exercise naturally</strong> - AI tracks you in real-time<br/>
              4. <strong>Get live feedback</strong> with dots, lines & voice guidance
            </p>
          </div>

          {/* Camera Feed with Pose Overlay */}
          <div style={{
            position: 'relative',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            
            {/* Real-Time Status */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: isWorkoutActive ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              zIndex: 1000,
              fontWeight: 'bold'
            }}>
              {isWorkoutActive ? '🤖 ML LIVE ANALYSIS' : '⏸️ ANALYSIS PAUSED'} | 
              {currentExercise?.name || 'No Exercise'} | 
              {annotatedImage ? '🎯 AI Dots & Lines' : '📹 Camera Feed'}
            </div>
            
            {/* Real-Time Tracking Indicator */}
            {isWorkoutActive && annotatedImage && (
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '8px',
                backgroundColor: 'rgba(255, 0, 255, 0.9)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                zIndex: 1000,
                animation: 'pulse 1s infinite'
              }}>
                🎯 AI DOTS & LINES LIVE | 🔴🟢🔵 Colors Active
              </div>
            )}
            
            {/* Real-Time ML Predictions */}
            {isWorkoutActive && (
              <div style={{
                position: 'absolute',
                top: '70px',
                left: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                zIndex: 1000,
                maxWidth: '300px'
              }}>
                <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                  🤖 ML Model Predictions
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9 }}>
                  <div>🎯 Exercise: {currentExercise?.name || 'Unknown'}</div>
                  <div>📊 Reps: {repCount} | Form: {Math.round(formScore)}%</div>
                  <div>🔍 Pose: 33 Landmarks Detected</div>
                  <div>⚡ Real-time Analysis Active</div>
                </div>
              </div>
            )}
            
            {/* Real-Time Performance */}
            {isWorkoutActive && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                zIndex: 1000
              }}>
                ⚡ Live | 🎯 Live Tracking | 🔊 Voice Active
              </div>
            )}
            {annotatedImage ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={annotatedImage}
                  alt="Pose Analysis with Visual Tracking"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onLoad={() => {
                    console.log('🎯 Annotated image loaded successfully!')
                    console.log('🎯 Image src:', annotatedImage.substring(0, 100) + '...')
                  }}
                  onError={(e) => {
                    console.error('❌ Error loading annotated image:', e)
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  🎯 Visual Tracking Active
                </div>
                
                {/* Visual tracking status overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0, 255, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  🎯 DOTS & LINES VISIBLE
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={(el) => {
                    videoRef.current = el
                  }}
                  autoPlay
                  playsInline
                  muted
                  loop
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    display: isWorkoutActive ? 'block' : 'none'
                  }}
                  onLoadedMetadata={() => {
                    // Video metadata loaded
                  }}
                  onCanPlay={() => {
                    // Video can play
                  }}
                />
                
                {/* Visual tracking is active - dots and lines are visible */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  ✅ VISUAL TRACKING ACTIVE
                </div>
              </>
            )}
            
            {!isWorkoutActive && !annotatedImage && (
              <div style={{
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '48px', marginBottom: '16px' }}>🏋️</span>
                <p style={{ color: '#6b7280' }}>Camera will activate during workout</p>
              </div>
            )}
            
            {/* Visual Tracking Status - Show when tracking is active */}
            {isWorkoutActive && annotatedImage && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                🎯 Visual Tracking Active • {formFeedback || 'AI analyzing your form...'} • 
                Form Score: {Math.round(formScore)}% • 
                {formScore > 80 ? ' 🟢 Excellent Form!' : formScore > 60 ? ' 🟡 Good Form!' : ' 🔴 Improve Form!'}
              </div>
            )}
            
            {/* Form Feedback when no visual tracking */}
            {isWorkoutActive && !annotatedImage && formFeedback && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                backgroundColor: formScore > 80 ? 'rgba(16, 185, 129, 0.9)' : formScore > 60 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                🎯 {formFeedback} • Form Score: {Math.round(formScore)}% • 
                {formScore > 80 ? ' 🟢 Excellent Form!' : formScore > 60 ? ' 🟡 Good Form!' : ' 🔴 Improve Form!'}
              </div>
            )}
            
            {isWorkoutActive && (
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                🔴 LIVE • {currentExercise?.name || 'Ready'}
              </div>
            )}
            
            {/* Clean interface - no debug info needed */}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={isWorkoutActive ? stopWorkout : startWorkout}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: isWorkoutActive ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isWorkoutActive ? '⏹️ Stop Workout' : '▶️ Start Workout'}
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              style={{
                padding: '12px',
                backgroundColor: voiceEnabled ? '#3b82f6' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            {/* Clean interface - no test buttons needed */}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Multiplayer and nutrition buttons removed */}
          </div>
        </div>

        {/* Workout Progress Tracking */}
        {isWorkoutActive && currentExercise && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            marginBottom: '32px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#111827' }}>
              🎯 {currentExercise.name} Progress
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {repCount}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Reps</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {setCount}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Sets</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
                  {Math.round(formScore)}%
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Form Score</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
                  {calculateCaloriesBurned()}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Calories</div>
              </div>
            </div>
            
            {/* Real-Time ML Model Status */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#0c4a6e' }}>
                🤖 AI Model Status
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '2px' }}>
                    🎯 ML Active
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1' }}>Real-time Analysis</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginBottom: '2px' }}>
                    🔍 Pose Detection
                  </div>
                  <div style={{ fontSize: '12px', color: '#047857' }}>33 Landmarks</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '2px' }}>
                    📊 Form Analysis
                  </div>
                  <div style={{ fontSize: '12px', color: '#d97706' }}>AI-Powered</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={completeSet}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✅ Complete Set
              </button>
              <button
                onClick={resetExerciseCounter}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        )}

        {/* Workout plan section removed */}

        {/* Live stats section completely removed */}
      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px 0', color: '#111827' }}>
              🏃‍♂️ Setup Your Fitness Profile
            </h2>
            
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Age
                </label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your age"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Gender
                </label>
                <select
                  value={userProfile.gender}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={userProfile.weight}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, weight: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your weight in kg"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={userProfile.height}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, height: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your height in cm"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Fitness Goal
                </label>
                <select
                  value={userProfile.fitnessGoal}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, fitnessGoal: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="muscle_gain">💪 Muscle Gain</option>
                  <option value="fat_loss">🔥 Fat Loss</option>
                  <option value="endurance">🏃‍♂️ Endurance</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Fitness Level
                </label>
                <select
                  value={userProfile.fitnessLevel}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, fitnessLevel: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="beginner">🌱 Beginner</option>
                  <option value="intermediate">🚀 Intermediate</option>
                  <option value="advanced">�� Advanced</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={generateWorkoutPlan}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🎯 Generate Workout Plan
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Plan Modal */}
      {showWorkoutPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px 0', color: '#111827' }}>
              🎯 Your Personalized Workout Plan
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
                Based on your {userProfile.fitnessGoal.replace('_', ' ')} goal and {userProfile.fitnessLevel} level
              </p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {workoutPlan.map((exercise, index) => (
                  <div key={exercise.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '24px', marginRight: '16px' }}>{exercise.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {exercise.name}
                      </h3>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                        {exercise.sets} sets • {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s hold`} • {exercise.calories} cal
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentExercise(exercise)
                        setShowWorkoutPlan(false)
                        if (!isWorkoutActive) {
                          startWorkout()
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowWorkoutPlan(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Removed multiplayer modal */}

      {/* Profile modal completely removed */}
    </div>
  )
}