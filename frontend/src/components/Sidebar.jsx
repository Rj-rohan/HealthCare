export default function Sidebar({ activeTab, setActiveTab }) {
  const navigation = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Symptom Checker', id: 'symptom-checker' },
    { name: 'Medical Chat', id: 'medical-chat' },
    { name: 'Image Analysis', id: 'image-analysis' },
    { name: 'Vitals Monitor', id: 'vitals-monitor' },
    { name: 'Health Tips', id: 'health-recommendations' },
  ]

  return (
    <div style={{
      width: '250px',
      backgroundColor: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>HealthAI</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>AI-Powered Healthcare</p>
      </div>
      
      <nav style={{ marginTop: '24px', flex: 1 }}>
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              textAlign: 'left',
              border: 'none',
              backgroundColor: activeTab === item.id ? '#eff6ff' : 'transparent',
              color: activeTab === item.id ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              borderRight: activeTab === item.id ? '2px solid #2563eb' : 'none',
              fontSize: '14px'
            }}
          >
            {item.name}
          </button>
        ))}
      </nav>
      
      <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#2563eb', fontWeight: '600', fontSize: '14px' }}>AI</span>
          </div>
          <div style={{ marginLeft: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>AI Assistant</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}