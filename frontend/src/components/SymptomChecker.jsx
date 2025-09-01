import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

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
      const mockResults = generateMockResults()
      setResults(mockResults)
      setLoading(false)
    }, 2000)
  }

  const generateMockResults = () => {
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
    
    return conditions.filter(() => Math.random() > 0.3).slice(0, 3)
  }

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dcfce7 0%, #dbeafe 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="brand-title gradient-text-brand" style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          margin: 0, 
          marginBottom: '8px' 
        }}>
          AI Symptom Checker
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Get instant AI-powered health insights based on your symptoms
        </p>
      </div>

      <div className="grid-2">
        {/* Input Section */}
        <div className="glass-card card-hover animate-fade-in-scale">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ marginRight: '12px' }}><MagnifyingGlassIcon className="icon-24" aria-hidden="true" /></span>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Enter Your Information
            </h2>
          </div>
          
          {/* Personal Info */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-enhanced"
                placeholder="Enter age"
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-enhanced"
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
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Add Symptom
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSymptom(currentSymptom)}
                className="input-enhanced"
                style={{ flex: 1 }}
                placeholder="Type a symptom..."
              />
              <button
                onClick={() => addSymptom(currentSymptom)}
                className="btn-gradient"
                style={{
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
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '12px' 
            }}>
              Common Symptoms:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => addSymptom(symptom)}
                  className="btn-outline"
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px'
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
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '12px' 
              }}>
                Selected Symptoms:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {symptoms.map((symptom) => (
                  <span
                    key={symptom}
                    className="status-indicator status-online"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      fontSize: '14px'
                    }}
                  >
                    {symptom}
                    <button
                      onClick={() => removeSymptom(symptom)}
                      style={{
                        marginLeft: '8px',
                        color: 'inherit',
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
            className="btn-gradient"
            style={{
              width: '100%',
              padding: '16px',
              background: symptoms.length === 0 || loading ? 
                'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 
                'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              cursor: symptoms.length === 0 || loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <div className="loading-dots" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <span></span>
                <span></span>
                <span></span>
                Analyzing Symptoms...
              </div>
            ) : (
              'Analyze Symptoms'
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="glass-card card-hover animate-fade-in-scale">
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827', 
            margin: 0, 
            marginBottom: '24px' 
          }}>
            AI Analysis Results
          </h2>
          
          {!hasAnalyzed ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="stat-card" style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 16px'
              }}>
                <MagnifyingGlassIcon className="icon-24" aria-hidden="true" />
              </div>
              <p style={{ fontSize: '18px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                Enter symptoms and click analyze
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                Get instant AI-powered health insights
              </p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="loading-dots" style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px'
              }}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                AI is analyzing your symptoms...
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                This may take a few moments
              </p>
            </div>
          ) : (
            <div>
              {results.map((result, index) => (
                <div key={index} className="glass-card card-hover" style={{
                  border: '1px solid #e5e7eb',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '12px' 
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#111827', 
                      margin: 0 
                    }}>
                      {result.disease}
                    </h3>
                    <span className="status-indicator" style={{
                      background: result.probability > 0.7 ? '#fee2e2' : 
                                   result.probability > 0.5 ? '#fef3c7' : '#dcfce7',
                      color: result.probability > 0.7 ? '#991b1b' : 
                             result.probability > 0.5 ? '#92400e' : '#166534'
                    }}>
                      {Math.round(result.probability * 100)}% match
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', marginBottom: '16px', margin: 0 }}>
                    {result.description}
                  </p>
                  <div>
                    <p style={{ fontWeight: '500', color: '#374151', marginBottom: '12px', margin: 0 }}>
                      Recommendations:
                    </p>
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
              <div className="glass-card" style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
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
