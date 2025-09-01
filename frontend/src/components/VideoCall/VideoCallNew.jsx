import { useState, useRef, useEffect } from 'react'
import { VideoCameraIcon, UserIcon, MicrophoneIcon, XMarkIcon, VideoCameraSlashIcon, PhoneXMarkIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const VideoCallNew = () => {
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [availableDoctors] = useState([
    { id: 1, name: 'Dr. Sarah Smith', specialty: 'Cardiology', status: 'online' },
    { id: 2, name: 'Dr. Mike Johnson', specialty: 'General Medicine', status: 'online' },
    { id: 3, name: 'Dr. Emily Davis', specialty: 'Dermatology', status: 'busy' },
    { id: 4, name: 'Dr. James Wilson', specialty: 'Orthopedics', status: 'offline' }
  ])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [callHistory, setCallHistory] = useState([
    { id: 1, doctor: 'Dr. Sarah Smith', date: '2024-01-15', duration: '15:30', status: 'completed' },
    { id: 2, doctor: 'Dr. Mike Johnson', date: '2024-01-10', duration: '22:45', status: 'completed' },
    { id: 3, doctor: 'Dr. Emily Davis', date: '2024-01-08', duration: '08:15', status: 'missed' }
  ])

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const callTimerRef = useRef(null)

  useEffect(() => {
    if (isInCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(callTimerRef.current)
      setCallDuration(0)
    }

    return () => clearInterval(callTimerRef.current)
  }, [isInCall])

  const startCall = async (doctor) => {
    try {
      setSelectedDoctor(doctor)
      setConnectionStatus('connecting')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      setTimeout(() => {
        setConnectionStatus('connected')
        setIsInCall(true)
      }, 2000)
      
    } catch (error) {
      console.error('Failed to start call:', error)
      setConnectionStatus('failed')
    }
  }

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = localVideoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      localVideoRef.current.srcObject = null
    }
    
    setIsInCall(false)
    setConnectionStatus('disconnected')
    setSelectedDoctor(null)
    setCallDuration(0)
    
    if (selectedDoctor) {
      const newCall = {
        id: Date.now(),
        doctor: selectedDoctor.name,
        date: new Date().toISOString().split('T')[0],
        duration: formatDuration(callDuration),
        status: 'completed'
      }
      setCallHistory(prev => [newCall, ...prev])
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (localVideoRef.current?.srcObject) {
      const audioTracks = localVideoRef.current.srcObject.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = isMuted
      })
    }
  }

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)
    if (localVideoRef.current?.srcObject) {
      const videoTracks = localVideoRef.current.srcObject.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = isVideoOff
      })
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'var(--success)'
      case 'busy': return 'var(--warning)'
      case 'offline': return 'var(--text-muted)'
      default: return 'var(--text-muted)'
    }
  }

  const getStatusIcon = (status) => {
    const color = status === 'connected' || status === 'online' ? 'var(--success)' : status === 'connecting' || status === 'busy' ? 'var(--warning)' : 'var(--error)'
    return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color }} />
  }

  if (isInCall) {
    return (
      <div className="animate-fade-in" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--background)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Call Header */}
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              <UserIcon className="icon-24" aria-hidden="true" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                {selectedDoctor?.name}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {selectedDoctor?.specialty}
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--success)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--success)',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                {formatDuration(callDuration)}
              </span>
            </div>
            
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              background: 'var(--success)20',
              color: 'var(--success)',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', marginRight: 6 }} /> Connected
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '1rem',
          padding: '1rem'
        }}>
          {/* Remote Video (Doctor) */}
          <div style={{
            background: '#000',
            borderRadius: '1rem',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
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
            
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                <UserIcon className="icon-24" aria-hidden="true" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                {selectedDoctor?.name}
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>
                Video connecting...
              </p>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '0.75rem 1rem',
              borderRadius: '2rem',
              color: 'white',
              fontSize: '0.875rem'
            }}>
              <UserIcon className="icon-16" aria-hidden="true" /> {selectedDoctor?.name}
            </div>
          </div>

          {/* Local Video (Patient) */}
          <div style={{
            background: '#000',
            borderRadius: '1rem',
            overflow: 'hidden',
            position: 'relative'
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
            
            {isVideoOff && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><VideoCameraIcon className="icon-24" aria-hidden="true" /></div>
                <p style={{ margin: 0 }}>Video Off</p>
              </div>
            )}

            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              color: 'white',
              fontSize: '0.875rem'
            }}>
              You
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            onClick={toggleMute}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: 'none',
              background: isMuted ? 'var(--error)' : 'var(--glass-bg)',
              color: isMuted ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '1.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            {isMuted ? <XMarkIcon className="icon-24" aria-hidden="true" /> : <MicrophoneIcon className="icon-24" aria-hidden="true" />}
          </button>

          <button
            onClick={toggleVideo}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: 'none',
              background: isVideoOff ? 'var(--error)' : 'var(--glass-bg)',
              color: isVideoOff ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '1.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            {isVideoOff ? <VideoCameraSlashIcon className="icon-24" aria-hidden="true" /> : <VideoCameraIcon className="icon-24" aria-hidden="true" />}
          </button>

          <button
            onClick={endCall}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--error)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <PhoneXMarkIcon className="icon-24" aria-hidden="true" />
          </button>

          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '1.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <ChatBubbleLeftRightIcon className="icon-24" aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-1 heading-with-icon" style={{ margin: 0 }}>
              <VideoCameraIcon className="icon-24" aria-hidden="true" /> Video Consultations
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
              Connect with healthcare professionals instantly
            </p>
          </div>
          <div style={{
            padding: '1rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {availableDoctors.filter(d => d.status === 'online').length}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Available Now
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Available Doctors */}
        <div>
          <div className="glass-card">
            <h2 className="heading-2 heading-with-icon" style={{ marginBottom: '1.5rem' }}>
              <UserGroupIcon className="icon-24" aria-hidden="true" /> Available Doctors
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {availableDoctors.map(doctor => (
                <div key={doctor.id} className="glass-card" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      position: 'relative'
                    }}>
                      {doctor.avatar}
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: getStatusColor(doctor.status),
                        border: '2px solid var(--surface)'
                      }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                        {doctor.name}
                      </h4>
                      <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {doctor.specialty}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: getStatusColor(doctor.status)
                      }}>
                        {getStatusIcon(doctor.status)}
                        <span style={{ textTransform: 'capitalize' }}>{doctor.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startCall(doctor)}
                    disabled={doctor.status !== 'online'}
                    className="btn"
                    style={{
                      background: doctor.status === 'online' 
                        ? 'linear-gradient(135deg, var(--success), var(--secondary))' 
                        : 'var(--glass-bg)',
                      color: doctor.status === 'online' ? 'white' : 'var(--text-muted)',
                      cursor: doctor.status === 'online' ? 'pointer' : 'not-allowed',
                      opacity: doctor.status === 'online' ? 1 : 0.6
                    }}
                  >
                    <VideoCameraIcon className="btn-icon" aria-hidden="true" /> Call Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call History & Status */}
        <div>
          {/* Connection Status */}
          {connectionStatus !== 'disconnected' && (
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 className="heading-3 heading-with-icon" style={{ marginBottom: '1rem' }}>
                Connection Status
              </h3>
              
              <div style={{
                background: connectionStatus === 'connected' ? 'var(--success)20' : 
                           connectionStatus === 'connecting' ? 'var(--warning)20' : 'var(--error)20',
                border: `1px solid ${connectionStatus === 'connected' ? 'var(--success)' : 
                                    connectionStatus === 'connecting' ? 'var(--warning)' : 'var(--error)'}40`,
                padding: '1.5rem',
                borderRadius: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: connectionStatus === 'connected' ? 'var(--success)' : connectionStatus === 'connecting' ? 'var(--warning)' : 'var(--error)' }} />
                </div>
                <h4 style={{
                  margin: 0,
                  color: connectionStatus === 'connected' ? 'var(--success)' : 
                         connectionStatus === 'connecting' ? 'var(--warning)' : 'var(--error)',
                  textTransform: 'capitalize'
                }}>
                  {connectionStatus}
                </h4>
                {connectionStatus === 'connecting' && (
                  <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>
                    Establishing secure connection...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Call History */}
          <div className="glass-card">
            <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
              Recent Calls
            </h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {callHistory.map(call => (
                <div key={call.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h5 style={{ margin: 0, color: 'var(--text-primary)' }}>
                      {call.doctor}
                    </h5>
                    <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {call.date} • {call.duration}
                    </p>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    background: call.status === 'completed' ? 'var(--success)20' : 'var(--error)20',
                    color: call.status === 'completed' ? 'var(--success)' : 'var(--error)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {call.status}
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

export default VideoCallNew
