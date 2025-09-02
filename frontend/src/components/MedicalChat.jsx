import { useState } from 'react'
import './MedicalChat.css'
import { ChatBubbleLeftRightIcon, BoltIcon, PaperAirplaneIcon, CheckCircleIcon, EllipsisHorizontalIcon, UserCircleIcon } from '@heroicons/react/24/outline'

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
    <div className="medical-chat-container animate-fade-in">
      <div className="medical-chat-header">
        <h1 className="medical-chat-title">
          💬 Medical Chat Assistant
        </h1>
        <p className="medical-chat-subtitle">
          Chat with our AI medical assistant for health guidance
        </p>
      </div>

      <div className="medical-chat-card glass-card card-hover animate-fade-in-scale">
        {/* Chat Header */}
        <div className="medical-chat-card-header">
        <div className="medical-chat-avatar stat-card">🤖</div>
          <div>
            <h3 className="medical-chat-card-title">AI Medical Assistant</h3>
            <p className="medical-chat-card-status"><span className="status-dot online"></span> Online • Ready to help</p>
          </div>
          <div className="medical-chat-header-actions">
            <BoltIcon className="icon-18" aria-hidden="true" />
            <EllipsisHorizontalIcon className="icon-18" aria-hidden="true" />
          </div>
        </div>

        {/* Messages Area */}
        <div className="medical-chat-messages custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`medical-chat-row ${message.sender === 'user' ? 'right' : 'left'}`}
            >
              {message.sender === 'ai' ? (
                <div className="medical-chat-avatar-small ai"><ChatBubbleLeftRightIcon className="icon-16" aria-hidden="true" /></div>
              ) : (
                <div className="medical-chat-avatar-small user"><UserCircleIcon className="icon-16" aria-hidden="true" /></div>
              )}
              <div className={`medical-chat-bubble ${message.sender}`}>
                <p className="medical-chat-text">{message.text}</p>
                <p className="medical-chat-time"><CheckCircleIcon className="icon-14" aria-hidden="true" /> {message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="medical-chat-row left">
              <div className="medical-chat-avatar-small ai"><ChatBubbleLeftRightIcon className="icon-16" aria-hidden="true" /></div>
              <div className="medical-chat-bubble ai">
                <div className="medical-chat-typing loading-dots"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="medical-chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your medical question..."
            className="medical-chat-input-field input-enhanced"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={`medical-chat-send-btn ${!inputMessage.trim() || isTyping ? 'disabled' : 'active'}`}
          >
            <PaperAirplaneIcon className="icon-18" aria-hidden="true" />
            Send
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="medical-chat-disclaimer glass-card card-hover">
        <p className="medical-chat-disclaimer-text">
          <strong>Important:</strong> This AI assistant provides general health information only. 
          Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  )
}