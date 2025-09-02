import { useState, useEffect } from 'react'
import { VideoCameraIcon, UserGroupIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { apiFetch } from '../../lib/api'
import VideoCallScreen from './VideoCallScreen'

const VideoCallNew = () => {
  const [availableDoctors, setAvailableDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [callStatus, setCallStatus] = useState('')
  const [inCall, setInCall] = useState(false)
  const [currentDoctor, setCurrentDoctor] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [currentCallId, setCurrentCallId] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await apiFetch('/api/doctors')
      if (response.ok) {
        const doctors = await response.json()
        setAvailableDoctors(doctors)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const startCall = async (doctor) => {
    try {
      setCallStatus(`Calling ${doctor.name}...`)
      setConnecting(true)
      setCurrentDoctor(doctor)
      
      const response = await apiFetch('/api/call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ doctor_id: doctor.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentCallId(data.call_id)
        setCallStatus('Connecting... waiting for doctor to accept')
        
        // Poll for doctor response
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await apiFetch(`/api/call/status/${data.call_id}`, {
              credentials: 'include'
            })
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              if (statusData.status === 'accepted') {
                clearInterval(pollInterval)
                setConnecting(false)
                setInCall(true)
                setCallStatus('')
              } else if (statusData.status === 'declined') {
                clearInterval(pollInterval)
                setConnecting(false)
                setCallStatus('Call declined by doctor')
                setTimeout(() => {
                  setCallStatus('')
                  setCurrentDoctor(null)
                }, 3000)
              }
            }
          } catch (error) {
            console.error('Error polling status:', error)
          }
        }, 2000)
        
        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(pollInterval)
          if (connecting) {
            setConnecting(false)
            setCallStatus('Call timeout - doctor did not respond')
            setTimeout(() => {
              setCallStatus('')
              setCurrentDoctor(null)
            }, 3000)
          }
        }, 30000)
        
      } else {
        setConnecting(false)
        setCallStatus('Failed to initiate call')
      }
    } catch (error) {
      setConnecting(false)
      setCallStatus('Error starting call')
    }
  }

  const endCall = () => {
    setInCall(false)
    setCurrentDoctor(null)
    setCallStatus('')
    setConnecting(false)
    setCurrentCallId(null)
  }

  if (connecting) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>📞</div>
          <h2 style={{ margin: '0 0 1rem 0' }}>Calling {currentDoctor?.name}...</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Waiting for doctor to accept</p>
          <div className="spinner-ring" style={{ margin: '0 auto 2rem auto' }}></div>
          <button onClick={endCall} className="btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
            Cancel Call
          </button>
        </div>
      </div>
    )
  }

  if (inCall) {
    return (
      <VideoCallScreen
        onEndCall={endCall}
        userRole="patient"
        callData={{ doctor_name: currentDoctor?.name }}
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h1 className="heading-1 heading-with-icon" style={{ margin: 0 }}>
          <VideoCameraIcon className="icon-24" aria-hidden="true" /> Video Consultations
        </h1>
      </div>

      {callStatus && (
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--primary)' }}>{callStatus}</p>
        </div>
      )}

      <div className="glass-card">
        <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Available Doctors</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {availableDoctors.map(doctor => (
              <div key={doctor.id} className="glass-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{doctor.name}</h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>{doctor.email}</p>
                </div>
                <button onClick={() => startCall(doctor)} className="btn-gradient">
                  <PhoneIcon className="btn-icon" aria-hidden="true" /> Call Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoCallNew