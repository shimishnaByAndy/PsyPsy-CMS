
function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>PsyPsy CMS - Tauri App</h1>
      <p>✅ App is running successfully!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Debug Info:</h2>
        <ul>
          <li>React: ✅ Loaded</li>
          <li>Vite: ✅ Running on port 3000</li>
          <li>Tauri: ✅ Window opened</li>
        </ul>
      </div>
      <button
        onClick={() => alert('Button works!')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  )
}

export default App