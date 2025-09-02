import { useState } from 'react'
import './ImageAnalysis.css'

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
    <div className="image-analysis-container animate-fade-in">
      <div className="image-analysis-header">
        <h1 className="image-analysis-title">
          🔬 Medical Image Analysis
        </h1>
        <p className="image-analysis-subtitle">
          Upload medical images for AI-powered analysis and insights
        </p>
      </div>

      <div className="image-analysis-grid">
        {/* Upload Section */}
        <div className="glass-card card-hover animate-fade-in-scale image-analysis-upload-card">
          <div className="image-analysis-card-header">
            <span className="image-analysis-card-icon">📷</span>
            <h2 className="image-analysis-card-title">
              Upload Image
            </h2>
          </div>

          <div className="image-analysis-upload-area">
            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="Preview"
                  className="image-analysis-preview"
                />
                <p className="image-analysis-filename">
                  {selectedFile?.name}
                </p>
              </div>
            ) : (
              <div>
                <div className="image-analysis-upload-icon">
                  📁
                </div>
                <p className="image-analysis-upload-text">
                  Drop your image here or click to browse
                </p>
                <p className="image-analysis-upload-hint">
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
          
          <div className="image-analysis-actions">
            <label
              htmlFor="file-upload"
              className="btn-outline image-analysis-choose-btn"
            >
              Choose File
            </label>
            
            <button
              onClick={analyzeImage}
              disabled={!selectedFile || loading}
              className={`image-analysis-analyze-btn ${!selectedFile || loading ? 'disabled' : 'active'}`}
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>

          {/* Supported Types */}
          <div className="image-analysis-supported-types glass-card">
            <h3 className="image-analysis-supported-title">
              Supported Analysis Types:
            </h3>
            <ul className="image-analysis-supported-list">
              <li>Skin lesions and moles</li>
              <li>X-ray images</li>
              <li>Wound assessment</li>
              <li>General medical imaging</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="glass-card card-hover animate-fade-in-scale image-analysis-results-card">
          <h2 className="image-analysis-results-title">
            Analysis Results
          </h2>
          
          {!selectedFile ? (
            <div className="image-analysis-empty-state">
              <div className="image-analysis-empty-icon">
                🔬
              </div>
              <p className="image-analysis-empty-title">
                Upload an image to start analysis
              </p>
              <p className="image-analysis-empty-subtitle">
                AI will analyze your medical image
              </p>
            </div>
          ) : loading ? (
            <div className="image-analysis-loading-state">
              <div className="image-analysis-loading-spinner">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="image-analysis-loading-title">
                Analyzing your image...
              </p>
              <p className="image-analysis-loading-subtitle">
                This may take a few moments
              </p>
            </div>
          ) : analysis ? (
            <div>
              {/* Confidence Score */}
              <div className="image-analysis-confidence-card glass-card">
                <div className="image-analysis-confidence-header">
                  <span className="image-analysis-confidence-label">
                    Analysis Confidence
                  </span>
                  <span className="image-analysis-confidence-score">
                    {analysis.confidence}%
                  </span>
                </div>
                <div className="image-analysis-confidence-bar">
                  <div 
                    className="image-analysis-confidence-fill"
                    style={{ width: `${analysis.confidence}%` }}
                  ></div>
                </div>
              </div>

              {/* Findings */}
              <div className="image-analysis-findings-section">
                <h3 className="image-analysis-section-title">
                  Key Findings:
                </h3>
                <ul className="image-analysis-findings-list">
                  {analysis.findings.map((finding, index) => (
                    <li key={index} className="image-analysis-finding-item">
                      <div className="image-analysis-finding-bullet"></div>
                      <span className="image-analysis-finding-text">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="image-analysis-recommendations-section">
                <h3 className="image-analysis-section-title">
                  Recommendations:
                </h3>
                <ul className="image-analysis-recommendations-list">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="image-analysis-recommendation-item">
                      <div className="image-analysis-recommendation-bullet"></div>
                      <span className="image-analysis-recommendation-text">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="image-analysis-disclaimer glass-card card-hover">
        <p className="image-analysis-disclaimer-text">
          <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical diagnosis. 
          Always consult with qualified healthcare professionals for accurate medical evaluation and treatment decisions.
        </p>
      </div>
    </div>
  )
}