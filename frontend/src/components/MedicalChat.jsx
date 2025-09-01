import { useState } from 'react'

export default function MedicalChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI medical assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage)
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 2000)
  }

  const generateAIResponse = () => {
    const responses = [
      "Based on your symptoms, I recommend consulting with a healthcare professional for a proper evaluation.",
      "That's a common concern. Here are some general recommendations: stay hydrated, get adequate rest, and monitor your symptoms.",
      "I understand your concern. While I can provide general information, it's important to speak with a doctor for personalized medical advice.",
      "Thank you for sharing that information. For safety, I recommend scheduling an appointment with your healthcare provider.",
      "That sounds like something that should be evaluated by a medical professional. In the meantime, monitor your symptoms closely."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="brand-title gradient-text-brand" style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          margin: 0, 
          marginBottom: '8px' 
        }}>
          💬 Medical Chat Assistant
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Chat with our AI medical assistant for health guidance
        </p>
      </div>

      <div className="glass-card card-hover animate-fade-in-scale" style={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="stat-card" style={{
            width: '40px',
            height: '40px',
            marginRight: '12px',
            fontSize: '20px'
          }}>
            🤖
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
              AI Medical Assistant
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Online • Ready to help
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="custom-scrollbar" style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div className="glass-card" style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.sender === 'user' ? '#2563eb' : 'rgba(255, 255, 255, 0.8)',
                color: message.sender === 'user' ? 'white' : '#111827'
              }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{message.text}</p>
                <p style={{
                  margin: 0,
                  marginTop: '4px',
                  fontSize: '12px',
                  opacity: 0.7
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div className="glass-card" style={{
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#111827'
              }}>
                <div className="loading-dots" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your medical question..."
            className="input-enhanced"
            style={{
              flex: 1,
              borderRadius: '24px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="btn-gradient"
            style={{
              padding: '12px 20px',
              borderRadius: '24px',
              background: !inputMessage.trim() || isTyping ? 
                'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 
                'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              cursor: !inputMessage.trim() || isTyping ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card card-hover" style={{
        marginTop: '24px',
        maxWidth: '800px',
        margin: '24px auto 0',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b'
      }}>
        <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
          <strong>Important:</strong> This AI assistant provides general health information only. 
          Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  )
}