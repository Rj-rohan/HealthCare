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

  const generateAIResponse = (userInput) => {
    const responses = [
      "Based on your symptoms, I recommend consulting with a healthcare professional for a proper evaluation.",
      "That's a common concern. Here are some general recommendations: stay hydrated, get adequate rest, and monitor your symptoms.",
      "I understand your concern. While I can provide general information, it's important to speak with a doctor for personalized medical advice.",
      "Thank you for sharing that information. For safety, I recommend scheduling an appointment with your healthcare provider.",
      "That sounds like something that should be evaluated by a medical professional. In the meantime, monitor your symptoms closely."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>Medical Chat Assistant</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Chat with our AI medical assistant for health guidance</p>
      </div>

      <div style={{
        ...cardStyle,
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
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>AI Medical Assistant</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Online • Ready to help</p>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
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
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.sender === 'user' ? '#2563eb' : '#f3f4f6',
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
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: '#f3f4f6',
                color: '#111827'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#6b7280',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#6b7280',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#6b7280',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                  }}></div>
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
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            style={{
              padding: '12px 20px',
              backgroundColor: !inputMessage.trim() || isTyping ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: !inputMessage.trim() || isTyping ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        ...cardStyle,
        padding: '20px',
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