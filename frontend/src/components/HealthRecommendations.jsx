import { useState, useEffect } from 'react'
import './HealthRecommendations.css'

export default function HealthRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', name: 'All Tips', icon: '📋' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'exercise', name: 'Exercise', icon: '🏃‍♂️' },
    { id: 'mental', name: 'Mental Health', icon: '🧠' },
    { id: 'sleep', name: 'Sleep', icon: '😴' },
    { id: 'prevention', name: 'Prevention', icon: '🛡️' }
  ]

  const allRecommendations = [
    {
      id: 1,
      category: 'nutrition',
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily to maintain proper hydration and support bodily functions.',
      priority: 'high',
      tips: [
        'Carry a water bottle with you',
        'Set reminders to drink water',
        'Eat water-rich foods like fruits',
        'Monitor urine color as hydration indicator'
      ]
    },
    {
      id: 2,
      category: 'exercise',
      title: 'Regular Physical Activity',
      description: 'Engage in at least 150 minutes of moderate aerobic activity per week.',
      priority: 'high',
      tips: [
        'Take stairs instead of elevators',
        'Walk or bike for short trips',
        'Join group fitness classes',
        'Set achievable daily step goals'
      ]
    },
    {
      id: 3,
      category: 'sleep',
      title: 'Quality Sleep Schedule',
      description: 'Maintain 7-9 hours of quality sleep each night for optimal health.',
      priority: 'high',
      tips: [
        'Keep consistent sleep schedule',
        'Create a relaxing bedtime routine',
        'Avoid screens before bedtime',
        'Keep bedroom cool and dark'
      ]
    },
    {
      id: 4,
      category: 'mental',
      title: 'Stress Management',
      description: 'Practice stress reduction techniques to maintain mental well-being.',
      priority: 'medium',
      tips: [
        'Practice deep breathing exercises',
        'Try meditation or mindfulness',
        'Maintain social connections',
        'Engage in hobbies you enjoy'
      ]
    },
    {
      id: 5,
      category: 'nutrition',
      title: 'Balanced Diet',
      description: 'Eat a variety of nutrient-rich foods from all food groups.',
      priority: 'high',
      tips: [
        'Include fruits and vegetables',
        'Choose whole grains over refined',
        'Limit processed foods',
        'Control portion sizes'
      ]
    },
    {
      id: 6,
      category: 'prevention',
      title: 'Regular Health Checkups',
      description: 'Schedule routine medical examinations and screenings.',
      priority: 'medium',
      tips: [
        'Annual physical examinations',
        'Age-appropriate screenings',
        'Dental checkups twice yearly',
        'Eye examinations regularly'
      ]
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const filtered = selectedCategory === 'all' 
        ? allRecommendations 
        : allRecommendations.filter(rec => rec.category === selectedCategory)
      setRecommendations(filtered)
      setLoading(false)
    }, 500)
  }, [selectedCategory])



  return (
    <div className="health-recommendations-container">
      <div className="health-recommendations-header">
        <h1 className="health-recommendations-title">
          💡 Health Recommendations
        </h1>
        <p className="health-recommendations-subtitle">
          Personalized health tips and recommendations for better wellness
        </p>
      </div>

      {/* Category Filter */}
      <div className="health-recommendations-filter-card">
        <h2 className="health-recommendations-filter-title">
          Filter by Category
        </h2>
        <div className="health-recommendations-categories">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`health-recommendations-category-btn ${selectedCategory === category.id ? 'active' : 'inactive'}`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="health-recommendations-loading">
          <div className="health-recommendations-loading-spinner">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="health-recommendations-loading-text">Loading recommendations...</p>
        </div>
      ) : (
        <div className="health-recommendations-grid">
          {recommendations.map((rec) => {
            return (
              <div key={rec.id} className="health-recommendations-item">
                <div className="health-recommendations-item-header">
                  <div className="health-recommendations-item-title-section">
                    <span className="health-recommendations-item-icon">
                      {categories.find(cat => cat.id === rec.category)?.icon}
                    </span>
                    <h3 className="health-recommendations-item-title">
                      {rec.title}
                    </h3>
                  </div>
                  <span className={`health-recommendations-priority ${rec.priority}`}>
                    {rec.priority}
                  </span>
                </div>

                <p className="health-recommendations-item-description">
                  {rec.description}
                </p>

                <div className="health-recommendations-action-steps">
                  <h4 className="health-recommendations-action-title">
                    Action Steps:
                  </h4>
                  <ul className="health-recommendations-tips-list">
                    {rec.tips.map((tip, index) => (
                      <li key={index} className="health-recommendations-tip-item">
                        <div className="health-recommendations-tip-bullet"></div>
                        <span className="health-recommendations-tip-text">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="health-recommendations-tip-card">
                  <p className="health-recommendations-tip-text">
                    💡 Tip: Start with small, manageable changes and gradually build healthy habits over time.
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Health Score Card */}
      <div className="health-recommendations-score-card">
        <div className="health-recommendations-score-content">
          <div>
            <h3 className="health-recommendations-score-title">
              Your Health Score
            </h3>
            <p className="health-recommendations-score-subtitle">
              Based on your activity and health habits
            </p>
          </div>
          <div className="health-recommendations-score-display">
            <div className="health-recommendations-score-circle">
              <span className="health-recommendations-score-number">85</span>
              <span className="health-recommendations-score-percent">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}