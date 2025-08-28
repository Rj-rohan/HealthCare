import { useState } from 'react'

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState([])
  const [currentSymptom, setCurrentSymptom] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Sore throat', 'Fatigue', 'Nausea', 
    'Dizziness', 'Chest pain', 'Shortness of breath', 'Abdominal pain'
  ]

  const addSymptom = (symptom) => {
    if (symptom && !symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom])
      setCurrentSymptom('')
    }
  }

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom))
  }

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return
    
    setLoading(true)
    setHasAnalyzed(true)
    
    setTimeout(() => {
      const mockResults = generateMockResults(symptoms, age, gender)
      setResults(mockResults)
      setLoading(false)
    }, 2000)
  }

  const generateMockResults = (symptoms, age, gender) => {
    const conditions = [
      {
        disease: 'Common Cold',
        description: 'A viral infection of the upper respiratory tract',
        probability: 0.85,
        recommendations: [
          'Get plenty of rest',
          'Stay hydrated',
          'Consider over-the-counter pain relievers',
          'Monitor symptoms for 7-10 days'
        ]
      },
      {
        disease: 'Seasonal Allergies',
        description: 'Allergic reaction to environmental allergens',
        probability: 0.65,
        recommendations: [
          'Avoid known allergens',
          'Consider antihistamines',
          'Use air purifiers indoors',
          'Consult an allergist if symptoms persist'
        ]
      },
      {
        disease: 'Stress/Anxiety',
        description: 'Physical symptoms related to psychological stress',
        probability: 0.45,
        recommendations: [
          'Practice relaxation techniques',
          'Maintain regular exercise',
          'Consider speaking with a counselor',
          'Ensure adequate sleep'
        ]
      }
    ]
    
    return conditions.filter(c => Math.random() > 0.3).slice(0, 3)
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  }

  const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dcfce7 0%, #dbeafe 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>AI Symptom Checker</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Get instant AI-powered health insights based on your symptoms</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '32px'
      }}>
        {/* Input Section */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🔍</span>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>Enter Your Information</h2>
          </div>
          
          {/* Personal Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={inputStyle}
                placeholder="Enter age"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Symptom Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Add Symptom</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSymptom(currentSymptom)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Type a symptom..."
              />
              <button
                onClick={() => addSymptom(currentSymptom)}
                style={{
                  ...buttonStyle,
                  padding: '12px 16px',
                  fontSize: '20px'
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Common Symptoms */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>Common Symptoms:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => addSymptom(symptom)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Symptoms */}
          {symptoms.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>Selected Symptoms:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {symptoms.map((symptom) => (
                  <span
                    key={symptom}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      fontSize: '14px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '16px'
                    }}
                  >
                    {symptom}
                    <button
                      onClick={() => removeSymptom(symptom)}
                      style={{
                        marginLeft: '8px',
                        color: '#1e40af',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={analyzeSymptoms}
            disabled={symptoms.length === 0 || loading}
            style={{
              ...buttonStyle,
              width: '100%',
              padding: '16px',
              background: symptoms.length === 0 || loading ? '#d1d5db' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              cursor: symptoms.length === 0 || loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Analyzing Symptoms...
              </div>
            ) : (
              'Analyze Symptoms'
            )}
          </button>
        </div>

        {/* Results Section */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '24px' }}>AI Analysis Results</h2>
          
          {!hasAnalyzed ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '32px'
              }}>
                🔍
              </div>
              <p style={{ fontSize: '18px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>Enter symptoms and click analyze</p>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Get instant AI-powered health insights</p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>AI is analyzing your symptoms...</p>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>This may take a few moments</p>
            </div>
          ) : (
            <div>
              {results.map((result, index) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  transition: 'box-shadow 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>{result.disease}</h3>
                    <span style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      backgroundColor: result.probability > 0.7 ? '#fee2e2' : 
                                     result.probability > 0.5 ? '#fef3c7' : '#dcfce7',
                      color: result.probability > 0.7 ? '#991b1b' : 
                             result.probability > 0.5 ? '#92400e' : '#166534'
                    }}>
                      {Math.round(result.probability * 100)}% match
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', marginBottom: '16px', margin: 0 }}>{result.description}</p>
                  <div>
                    <p style={{ fontWeight: '500', color: '#374151', marginBottom: '12px', margin: 0 }}>Recommendations:</p>
                    <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                      {result.recommendations.map((rec, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#2563eb',
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
              ))}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                  <strong>Disclaimer:</strong> This is an AI-powered analysis for informational purposes only. 
                  Always consult with a healthcare professional for proper medical diagnosis and treatment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}