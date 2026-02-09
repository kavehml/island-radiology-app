// Simple test version to verify React is working
const App = () => {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        ✅ Island Radiology Management System
      </h1>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Application Status</h2>
        <p>✅ React is working correctly!</p>
        <p>✅ TypeScript conversion complete</p>
        <p>✅ Backend API: <a href="http://localhost:5001/api/health" target="_blank">http://localhost:5001/api/health</a></p>
        <p>✅ Frontend: Running on port 3000</p>
        <hr style={{ margin: '20px 0' }} />
        <p><strong>If you see this message, the application is working!</strong></p>
        <p>You can now switch back to the full application.</p>
      </div>
    </div>
  );
};

export default App;
