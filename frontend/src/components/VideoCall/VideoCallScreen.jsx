import { useState, useRef, useEffect } from 'react'
import { PhoneXMarkIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

const VideoCallScreen = ({ onEndCall, userRole, callData }) => {
  const [stream, setStream] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  useEffect(() => {
    startVideo()
    
    // Poll to check if call was ended by other party
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/call/check-status', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'ended') {
            clearInterval(pollInterval)
            onEndCall()
          }
        }
      } catch (error) {
        console.error('Error checking call status:', error)
      }
    }, 2000)
    
    return () => {
      clearInterval(pollInterval)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setStream(mediaStream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream
        localVideoRef.current.muted = false // Enable audio for local video
      }
      console.log('Microphone and camera access granted')
    } catch (error) {
      console.error('Error accessing camera/microphone:', error)
      alert('Please allow camera and microphone access for video calls')
    }
  }

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
      console.log(isMuted ? 'Microphone unmuted' : 'Microphone muted')
    }
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = isVideoOff
      })
      setIsVideoOff(!isVideoOff)
      console.log(isVideoOff ? 'Camera turned on' : 'Camera turned off')
    }
  }

  const endCall = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    
    // End call on backend
    try {
      await fetch('http://localhost:8000/api/call/end', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error ending call on backend:', error)
    }
    
    onEndCall()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        padding: '1rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>
          Video Call - {userRole === 'doctor' ? `Patient: ${callData?.patient_name}` : `Dr. ${callData?.doctor_name}`}
        </h2>
        <button
          onClick={endCall}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <PhoneXMarkIcon style={{ width: '20px', height: '20px' }} />
          End Call
        </button>
      </div>

      {/* Video Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Remote Video (Other Person) */}
        <div style={{ flex: 1, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
            <h3>Waiting for {userRole === 'doctor' ? 'patient' : 'doctor'} video...</h3>
          </div>
        </div>

        {/* Local Video (Self) */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '300px',
          height: '200px',
          background: '#333',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '2px solid #10b981'
        }}>
          <video
            ref={localVideoRef}
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
          <div style={{
            position: 'absolute',
            bottom: '5px',
            left: '5px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button 
          onClick={toggleMute}
          style={{
            background: isMuted ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '60px',
            height: '60px',
            transition: 'background 0.3s'
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <MicrophoneIcon style={{ width: '24px', height: '24px' }} />
          {isMuted && <span style={{ position: 'absolute', fontSize: '12px' }}>🚫</span>}
        </button>
        <button 
          onClick={toggleVideo}
          style={{
            background: isVideoOff ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '60px',
            height: '60px',
            transition: 'background 0.3s'
          }}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          <VideoCameraIcon style={{ width: '24px', height: '24px' }} />
          {isVideoOff && <span style={{ position: 'absolute', fontSize: '12px' }}>🚫</span>}
        </button>
      </div>
    </div>
  )
}

export default VideoCallScreen