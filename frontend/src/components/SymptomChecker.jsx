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
    <div className="symptom-checker-container">
      <div className="symptom-checker-header">
        <h1 className="symptom-checker-title">
          AI Symptom Checker
        </h1>
        <p className="symptom-checker-subtitle">
          Get instant AI-powered health insights based on your symptoms
        </p>
      </div>

      <div className="symptom-checker-grid">
        {/* Input Section */}
        <div className="symptom-checker-input-card">
          <div className="symptom-checker-card-header">
            <span className="symptom-checker-card-icon"><MagnifyingGlassIcon className="icon-24" aria-hidden="true" /></span>
            <h2 className="symptom-checker-card-title">
              Enter Your Information
            </h2>
          </div>
          
          {/* Personal Info */}
          <div className="symptom-checker-personal-info">
            <div className="symptom-checker-field">
              <label className="symptom-checker-label">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="symptom-checker-input"
                placeholder="Enter age"
              />
            </div>
            <div className="symptom-checker-field">
              <label className="symptom-checker-label">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="symptom-checker-input"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Symptom Input */}
          <div className="symptom-checker-symptom-input">
            <label className="symptom-checker-label">
              Add Symptom
            </label>
            <div className="symptom-checker-input-group">
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSymptom(currentSymptom)}
                className="symptom-checker-text-input"
                placeholder="Type a symptom..."
              />
              <button
                onClick={() => addSymptom(currentSymptom)}
                className="symptom-checker-add-btn"
              >
                +
              </button>
            </div>
          </div>

          {/* Common Symptoms */}
          <div className="symptom-checker-common-symptoms">
            <p className="symptom-checker-section-label">
              Common Symptoms:
            </p>
            <div className="symptom-checker-symptom-tags">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => addSymptom(symptom)}
                  className="symptom-checker-symptom-tag"
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Symptoms */}
          {symptoms.length > 0 && (
            <div className="symptom-checker-selected-symptoms">
              <p className="symptom-checker-section-label">
                Selected Symptoms:
              </p>
              <div className="symptom-checker-selected-tags">
                {symptoms.map((symptom) => (
                  <span
                    key={symptom}
                    className="symptom-checker-selected-tag"
                  >
                    {symptom}
                    <button
                      onClick={() => removeSymptom(symptom)}
                      className="symptom-checker-remove-btn"
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
            className={`symptom-checker-analyze-btn ${symptoms.length === 0 || loading ? 'disabled' : 'active'}`}
          >
            {loading ? (
              <div className="symptom-checker-loading">
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
        <div className="symptom-checker-results-card">
          <h2 className="symptom-checker-card-title">
            AI Analysis Results
          </h2>
          
          {!hasAnalyzed ? (
            <div className="symptom-checker-empty-state">
              <div className="symptom-checker-empty-icon">
                <MagnifyingGlassIcon className="icon-24" aria-hidden="true" />
              </div>
              <p className="symptom-checker-empty-title">
                Enter symptoms and click analyze
              </p>
              <p className="symptom-checker-empty-subtitle">
                Get instant AI-powered health insights
              </p>
            </div>
          ) : loading ? (
            <div className="symptom-checker-loading-state">
              <div className="symptom-checker-loading-spinner">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="symptom-checker-loading-title">
                AI is analyzing your symptoms...
              </p>
              <p className="symptom-checker-loading-subtitle">
                This may take a few moments
              </p>
            </div>
          ) : (
                        <div>
              {results.map((result, index) => (
                <div key={index} className="symptom-checker-result-item">
                  <div className="symptom-checker-result-header">
                    <h3 className="symptom-checker-result-title">
                      {result.disease}
                    </h3>
                    <span className={`symptom-checker-probability ${result.probability > 0.7 ? 'high' : result.probability > 0.5 ? 'medium' : 'low'}`}>
                      {Math.round(result.probability * 100)}% match
                    </span>
                  </div>
                  <p className="symptom-checker-result-description">
                    {result.description}
                  </p>
                  <div>
                    <p className="symptom-checker-recommendations-title">
                      Recommendations:
                    </p>
                    <ul className="symptom-checker-recommendations-list">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="symptom-checker-recommendation-item">
                          <div className="symptom-checker-recommendation-bullet"></div>
                          <span className="symptom-checker-recommendation-text">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              <div className="symptom-checker-disclaimer">
                <p className="symptom-checker-disclaimer-text">
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
