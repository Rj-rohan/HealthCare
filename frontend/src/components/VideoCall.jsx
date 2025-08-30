import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'

export default function VideoCall({ callId, onEndCall, userRole, isInitiator }) {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [socket, setSocket] = useState(null)
  const peerConnection = useRef(null)
  const [connectionState, setConnectionState] = useState('connecting')

  useEffect(() => {
    initializeWebRTC()
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      cleanup()
    }
  }, [])
  
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (peerConnection.current) {
      peerConnection.current.close()
    }
    if (socket) {
      socket.disconnect()
    }
  }
  
  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      const clonedStream = stream.clone()
      setRemoteStream(clonedStream)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = clonedStream
      }
      setConnectionState('connected')
      
    } catch (err) {
      console.error('Error accessing camera:', err)
      setConnectionState('failed')
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: 'clamp(12px, 3vw, 24px)',
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ minWidth: '200px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            fontWeight: '600',
            background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📹 Video Consultation
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: 'clamp(12px, 2.5vw, 14px)', 
            opacity: 0.8,
            marginTop: '4px'
          }}>
            {userRole === 'patient' ? '⚕️ Consulting with Doctor' : 'Consulting with Patient'}
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 2vw, 16px)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: 'clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 16px)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '25px',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            {formatTime(callDuration)}
          </div>
          
          <button
            onClick={onEndCall}
            style={{
              padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 20px)',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ✕ End Call
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        padding: 'clamp(8px, 2vw, 24px)',
        gap: 'clamp(8px, 2vw, 24px)',
        flexDirection: 'column'
      }}>
        <style>{`
          @media (min-width: 768px) {
            .video-layout { flex-direction: row !important; }
          }
        `}</style>
        <div className="video-layout" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(8px, 2vw, 24px)',
          height: '100%'
        }}>
          {/* Remote Video (Large) */}
          <div style={{
            flex: 1,
            backgroundColor: '#000',
            borderRadius: 'clamp(8px, 2vw, 16px)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'clamp(200px, 40vh, 500px)',
            maxHeight: '70vh',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 'clamp(14px, 3vw, 18px)',
                textAlign: 'center',
                padding: '20px'
              }}>
                <div style={{ 
                  fontSize: 'clamp(32px, 8vw, 64px)', 
                  marginBottom: '16px',
                  animation: connectionState === 'connecting' ? 'spin 2s linear infinite' : 'none'
                }}>
                  {connectionState === 'connecting' ? '⟳' : 
                   connectionState === 'failed' ? '⚠' : '⏳'}
                </div>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  {connectionState === 'connecting' ? 'Connecting to other participant...' :
                   connectionState === 'failed' ? 'Connection failed' :
                   'Waiting for other participant'}
                </p>
              </div>
            )}
            
            <div style={{
              position: 'absolute',
              bottom: 'clamp(12px, 3vw, 20px)',
              left: 'clamp(12px, 3vw, 20px)',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: 'clamp(6px, 1.5vw, 10px) clamp(10px, 2.5vw, 16px)',
              borderRadius: '20px',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {userRole === 'patient' ? '⚕️ Doctor' : 'Patient'}
              {remoteStream && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
              )}
            </div>
          </div>

          {/* Local Video (Small) */}
          <div className="local-video" style={{
            width: '100%',
            height: 'clamp(150px, 25vh, 250px)',
            backgroundColor: '#000',
            borderRadius: 'clamp(8px, 2vw, 16px)',
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            <style>{`
              @media (min-width: 768px) {
                .local-video {
                  width: clamp(250px, 30vw, 400px) !important;
                  height: clamp(180px, 25vh, 300px) !important;
                }
              }
            `}</style>
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
              bottom: 'clamp(8px, 2vw, 12px)',
              left: 'clamp(8px, 2vw, 12px)',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: 'clamp(4px, 1vw, 8px) clamp(8px, 2vw, 12px)',
              borderRadius: '16px',
              fontSize: 'clamp(10px, 2vw, 12px)',
              fontWeight: '600',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              You ({userRole === 'patient' ? 'Patient' : '⚕️'})
            </div>
            
            {!isVideoOn && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 'clamp(32px, 8vw, 48px)'
              }}>
                📷
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: 'clamp(12px, 3vw, 24px)',
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(48px, 10vw, 72px), 1fr))',
        gap: 'clamp(8px, 2vw, 16px)',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <button
          onClick={toggleAudio}
          style={{
            width: '100%',
            aspectRatio: '1',
            minWidth: 'clamp(48px, 10vw, 64px)',
            minHeight: 'clamp(48px, 10vw, 64px)',
            borderRadius: '50%',
            border: 'none',
            background: isAudioOn ? 
              'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' : 
              'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            fontSize: 'clamp(18px, 4vw, 24px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: isAudioOn ? 
              '0 4px 16px rgba(107, 114, 128, 0.3)' : 
              '0 4px 16px rgba(239, 68, 68, 0.3)'
          }}
          title={isAudioOn ? 'Mute Audio' : 'Unmute Audio'}
        >
          {isAudioOn ? '🔊' : '🔇'}
        </button>

        <button
          onClick={toggleVideo}
          style={{
            width: '100%',
            aspectRatio: '1',
            minWidth: 'clamp(48px, 10vw, 64px)',
            minHeight: 'clamp(48px, 10vw, 64px)',
            borderRadius: '50%',
            border: 'none',
            background: isVideoOn ? 
              'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' : 
              'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            fontSize: 'clamp(18px, 4vw, 24px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: isVideoOn ? 
              '0 4px 16px rgba(107, 114, 128, 0.3)' : 
              '0 4px 16px rgba(239, 68, 68, 0.3)'
          }}
          title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
        >
          {isVideoOn ? '📺' : '⚫'}
        </button>

        <button
          onClick={onEndCall}
          style={{
            width: '100%',
            aspectRatio: '1',
            minWidth: 'clamp(56px, 12vw, 72px)',
            minHeight: 'clamp(56px, 12vw, 72px)',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            fontSize: 'clamp(20px, 5vw, 28px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
            position: 'relative'
          }}
          title="End Call"
        >
          ❌
        </button>
      </div>
    </div>
  )
}