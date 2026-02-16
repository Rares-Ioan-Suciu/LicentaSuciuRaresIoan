
const LoadingScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999, 
      fontFamily: 'Inter, sans-serif'
    }}>
      {}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 0.6; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 0.6; transform: scale(0.95); }
          }
        `}
      </style>

      {}
      <h1 style={{
        fontSize: '40px',
        fontWeight: '800',
        marginBottom: '20px',
        color: '#000',
        animation: 'pulse 2.5s infinite ease-in-out'
      }}>
        Beatrix
      </h1>

      {}
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>

      <p style={{ marginTop: '20px', color: '#888', fontSize: '14px' }}>
        Beatrix se pregătește pentru aventura ta educațională...
      </p>
    </div>
  );
};

export default LoadingScreen;