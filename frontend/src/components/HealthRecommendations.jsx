import { useState, useEffect } from 'react'

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
      case 'medium': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
      case 'low': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
    }
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6',
    transition: 'all 0.3s ease'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px' }}>Health Recommendations</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Personalized health tips and recommendations for better wellness</p>
      </div>

      {/* Category Filter */}
      <div style={{
        ...cardStyle,
        marginBottom: '32px',
        padding: '20px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '16px' }}>Filter by Category</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '12px 16px',
                border: selectedCategory === category.id ? '2px solid #059669' : '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: selectedCategory === category.id ? '#dcfce7' : 'white',
                color: selectedCategory === category.id ? '#059669' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>Loading recommendations...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {recommendations.map((rec) => {
            const priorityStyle = getPriorityColor(rec.priority)
            return (
              <div key={rec.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {categories.find(cat => cat.id === rec.category)?.icon}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {rec.title}
                    </h3>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    backgroundColor: priorityStyle.bg,
                    color: priorityStyle.text,
                    border: `1px solid ${priorityStyle.border}`,
                    textTransform: 'capitalize'
                  }}>
                    {rec.priority}
                  </span>
                </div>

                <p style={{ color: '#6b7280', marginBottom: '20px', lineHeight: '1.6', margin: 0 }}>
                  {rec.description}
                </p>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0, marginBottom: '12px' }}>
                    Action Steps:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                    {rec.tips.map((tip, index) => (
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
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  borderLeft: '4px solid #059669'
                }}>
                  <p style={{ fontSize: '12px', color: '#374151', margin: 0, fontStyle: 'italic' }}>
                    💡 Tip: Start with small, manageable changes and gradually build healthy habits over time.
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Health Score Card */}
      <div style={{
        ...cardStyle,
        marginTop: '32px',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, marginBottom: '8px' }}>Your Health Score</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Based on your activity and health habits</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>85</span>
              <span style={{ fontSize: '12px', position: 'absolute', bottom: '18px' }}>%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}