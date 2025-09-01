import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function VideoCall({ callId, onEndCall, userRole, isInitiator }) {
  // Add test mode for localhost debugging
  const isLocalTest = window.location.hostname === 'localhost'
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [_testMode] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [socket, setSocket] = useState(null)
  const peerConnection = useRef(null)
  const [connectionState, setConnectionState] = useState('connecting')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    initializeWebRTC()
    initializeSocket()
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      cleanup()
    }
  }, [])
  
  // Update video elements when streams change
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
      localVideoRef.current.play().catch(e => console.log('Local video play error:', e))
      
      // If we're the initiator and socket is ready, create offer now
      if (isInitiator && socket && peerConnection.current) {
        console.log('Local stream ready, creating offer...')
        setTimeout(() => createOffer(), 500)
      }
    }
  }, [localStream, socket, isInitiator])
  
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
      remoteVideoRef.current.play().catch(e => console.log('Remote video play error:', e))
    }
  }, [remoteStream])
  
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (peerConnection.current) {
      peerConnection.current.close()
    }
    if (socket) {
      socket.emit('leave_call', { call_id: callId })
      socket.disconnect()
    }
  }

  const initializeSocket = () => {
    // Use different connection identifiers for same-device testing
    const socketUrl = userRole === 'patient' ? 
      'http://localhost:8000' : 
      'http://127.0.0.1:8000'
    
    const newSocket = io(socketUrl, {
      withCredentials: true,
      query: {
        role: userRole,
        callId: callId,
        timestamp: Date.now() // Unique identifier
      }
    })
    
    newSocket.on('connect', () => {
      console.log(`${userRole} socket connected, joining call:`, callId)
      newSocket.emit('join_call', { 
        call_id: callId, 
        role: userRole,
        is_initiator: isInitiator,
        test_mode: isLocalTest
      })
    })
    
    newSocket.on('user_joined', (data) => {
      console.log('User joined:', data, 'isInitiator:', isInitiator)
      // Offer creation is now handled in localStream useEffect
    })
    
    newSocket.on('offer', async (data) => {
      console.log('Received offer:', data)
      if (peerConnection.current) {
        await handleOffer(data.offer)
      }
    })
    
    newSocket.on('answer', async (data) => {
      console.log('Received answer:', data)
      if (peerConnection.current) {
        await handleAnswer(data.answer)
      }
    })
    
    newSocket.on('ice_candidate', async (data) => {
      console.log('Received ICE candidate:', data)
      if (peerConnection.current) {
        await handleIceCandidate(data.candidate)
      }
    })
    
    setSocket(newSocket)
  }
  
  const initializeWebRTC = async () => {
    try {
      // Get user media with fallback for camera conflicts
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }).catch(async (err) => {
        console.warn('Camera access failed, trying screen share for testing:', err)
        // For same device testing - use screen share
        if (userRole === 'doctor') {
          return await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        }
        // Fallback to audio-only for patient
        return await navigator.mediaDevices.getUserMedia({ audio: true })
      })
      
      console.log('Setting local stream:', stream)
      setLocalStream(stream)
      
      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
      
      const pc = new RTCPeerConnection(configuration)
      peerConnection.current = pc
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind)
        pc.addTrack(track, stream)
      })
      
      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind, 'streams:', event.streams.length)
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0]
          console.log('Setting remote stream with tracks:', stream.getTracks().length)
          setRemoteStream(stream)
          setConnectionState('connected')
          setIsConnected(true)
        }
      }
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            call_id: callId,
            candidate: event.candidate
          })
        }
      }
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState)
        if (pc.connectionState === 'connected') {
          setConnectionState('connected')
          setIsConnected(true)
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setConnectionState('failed')
          setIsConnected(false)
        }
      }
      
    } catch (err) {
      console.error('Error accessing media:', err)
      if (err.name === 'NotAllowedError' || err.name === 'NotReadableError') {
        alert('Camera is already in use by another application. Please close other video apps or use different devices.')
      }
      setConnectionState('failed')
    }
  }
  
  const createOffer = async () => {
    try {
      console.log('Creating offer...')
      const offer = await peerConnection.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      await peerConnection.current.setLocalDescription(offer)
      console.log('Local description set, sending offer')
      
      if (socket) {
        socket.emit('offer', {
          call_id: callId,
          offer: offer
        })
      }
    } catch (err) {
      console.error('Error creating offer:', err)
    }
  }
  
  const handleOffer = async (offer) => {
    try {
      console.log('Handling offer, setting remote description')
      await peerConnection.current.setRemoteDescription(offer)
      console.log('Creating answer...')
      const answer = await peerConnection.current.createAnswer()
      await peerConnection.current.setLocalDescription(answer)
      console.log('Local description set, sending answer')
      
      if (socket) {
        socket.emit('answer', {
          call_id: callId,
          answer: answer
        })
      }
    } catch (err) {
      console.error('Error handling offer:', err)
    }
  }
  
  const handleAnswer = async (answer) => {
    try {
      console.log('Handling answer, setting remote description')
      await peerConnection.current.setRemoteDescription(answer)
      console.log('Remote description set successfully')
    } catch (err) {
      console.error('Error handling answer:', err)
    }
  }
  
  const handleIceCandidate = async (candidate) => {
    try {
      console.log('Adding ICE candidate')
      await peerConnection.current.addIceCandidate(candidate)
    } catch (err) {
      console.error('Error handling ICE candidate:', err)
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
            onClick={() => {
              cleanup()
              onEndCall()
            }}
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
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              controls={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: remoteStream ? 'block' : 'none',
                backgroundColor: '#000'
              }}
            />
            {!remoteStream && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 'clamp(14px, 3vw, 18px)',
                textAlign: 'center',
                padding: '20px',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}>
                <div style={{ 
                  fontSize: 'clamp(32px, 8vw, 64px)', 
                  marginBottom: '16px',
                  animation: connectionState === 'connecting' ? 'spin 2s linear infinite' : 'none'
                }}>
                  {connectionState === 'connecting' ? '⟳' : 
                   connectionState === 'failed' ? '⚠️' : 
                   isConnected ? '✅' : '⏳'}
                </div>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  {connectionState === 'connecting' ? 'Establishing connection...' :
                   connectionState === 'failed' ? 'Connection failed - Please try again' :
                   isConnected ? 'Connected - Waiting for video' :
                   'Waiting for other participant to join'}
                </p>
                {connectionState === 'failed' && (
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      marginTop: '16px',
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Retry Connection
                  </button>
                )}
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
              {isConnected && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
              )}
            </div>
            
            {/* Debug Info */}
            <div style={{
              position: 'absolute',
              top: 'clamp(12px, 3vw, 20px)',
              right: 'clamp(12px, 3vw, 20px)',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: 'clamp(6px, 1.5vw, 10px) clamp(10px, 2.5vw, 16px)',
              borderRadius: '12px',
              fontSize: 'clamp(10px, 2vw, 12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxWidth: '200px'
            }}>
              <div>Remote: {remoteStream ? '✅' : '❌'}</div>
              <div>Connected: {isConnected ? '✅' : '❌'}</div>
              <div>State: {connectionState}</div>
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
              controls={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: localStream ? 'block' : 'none',
                backgroundColor: '#000'
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
            
            {/* Local Debug Info */}
            <div style={{
              position: 'absolute',
              top: 'clamp(8px, 2vw, 12px)',
              right: 'clamp(8px, 2vw, 12px)',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: 'clamp(4px, 1vw, 8px) clamp(8px, 2vw, 12px)',
              borderRadius: '12px',
              fontSize: 'clamp(8px, 1.5vw, 10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              Local: {localStream ? '✅' : '❌'}
            </div>
            
            {(!localStream || !isVideoOn) && (
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
                fontSize: 'clamp(32px, 8vw, 48px)',
                zIndex: 1
              }}>
                {!localStream ? '⏳' : '📷'}
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
          onClick={() => {
            cleanup()
            onEndCall()
          }}
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