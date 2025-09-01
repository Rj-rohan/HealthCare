import { useState } from 'react'

export default function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
      setAnalysis(null)
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile) return

    setLoading(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        confidence: Math.floor(Math.random() * 30) + 70,
        findings: [
          'Image quality is suitable for analysis',
          'No immediate concerning features detected',
          'Recommend professional medical evaluation',
          'Consider follow-up imaging if symptoms persist'
        ],
        recommendations: [
          'Consult with a dermatologist for professional evaluation',
          'Monitor for any changes in size, color, or texture',
          'Maintain good skin hygiene and protection',
          'Schedule regular skin examinations'
        ]
      }
      setAnalysis(mockAnalysis)
      setLoading(false)
    }, 3000)
  }

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="brand-title gradient-text-brand" style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          margin: 0, 
          marginBottom: '8px' 
        }}>
          🔬 Medical Image Analysis
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Upload medical images for AI-powered analysis and insights
        </p>
      </div>

      <div className="grid-2">
        {/* Upload Section */}
        <div className="glass-card card-hover animate-fade-in-scale">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>📷</span>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Upload Image
            </h2>
          </div>

          <div className="glass-card" style={{
            border: '2px dashed #d1d5db',
            padding: '48px 24px',
            textAlign: 'center',
            marginBottom: '24px',
            transition: 'border-color 0.2s ease'
          }}>
            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}
                />
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  {selectedFile?.name}
                </p>
              </div>
            ) : (
              <div>
                <div className="stat-card" style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  📁
                </div>
                <p style={{ fontSize: '16px', color: '#374151', margin: 0, marginBottom: '8px' }}>
                  Drop your image here or click to browse
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Supports JPG, PNG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="file-upload"
          />
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <label
              htmlFor="file-upload"
              className="btn-outline"
              style={{
                flex: 1,
                padding: '12px 24px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              Choose File
            </label>
            
            <button
              onClick={analyzeImage}
              disabled={!selectedFile || loading}
              className="btn-gradient"
              style={{
                flex: 1,
                background: !selectedFile || loading ? 
                  'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 
                  'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                cursor: !selectedFile || loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>

          {/* Supported Types */}
          <div className="glass-card" style={{ 
            marginTop: '24px', 
            backgroundColor: '#f9fafb' 
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0, marginBottom: '8px' }}>
              Supported Analysis Types:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px', color: '#6b7280' }}>
              <li>Skin lesions and moles</li>
              <li>X-ray images</li>
              <li>Wound assessment</li>
              <li>General medical imaging</li>
            </ul>
          </div>
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
            Analysis Results
          </h2>
          
          {!selectedFile ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="stat-card" style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 16px',
                fontSize: '32px'
              }}>
                🔬
              </div>
              <p style={{ fontSize: '18px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                Upload an image to start analysis
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                AI will analyze your medical image
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
                Analyzing your image...
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                This may take a few moments
              </p>
            </div>
          ) : analysis ? (
            <div>
              {/* Confidence Score */}
              <div className="glass-card" style={{
                backgroundColor: '#f0f9ff',
                marginBottom: '24px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '8px' 
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Analysis Confidence
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0369a1' }}>
                    {analysis.confidence}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e0f2fe',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${analysis.confidence}%`,
                    height: '100%',
                    backgroundColor: '#0369a1',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>

              {/* Findings */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '12px' }}>
                  Key Findings:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                  {analysis.findings.map((finding, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#7c3aed',
                        borderRadius: '50%',
                        marginTop: '6px',
                        marginRight: '12px',
                        flexShrink: 0
                      }}></div>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '12px' }}>
                  Recommendations:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#059669',
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
          ) : null}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card card-hover" style={{
        marginTop: '32px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b'
      }}>
        <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
          <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical diagnosis. 
          Always consult with qualified healthcare professionals for accurate medical evaluation and treatment decisions.
        </p>
      </div>
    </div>
  )
}