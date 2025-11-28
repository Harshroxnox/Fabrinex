import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const goBack = () => {
    window.history.back();
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div style={styles.buttonGroup}>
          <button 
            onClick={goBack}
            style={styles.secondaryButton}
          >
            <ArrowLeft size={18} style={{ marginRight: '8px' }} />
            Go Back
          </button>
          <button 
            onClick={goToDashboard}
            style={styles.primaryButton}
          >
            <Home size={18} style={{ marginRight: '8px' }} color='white' />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    // backgroundColor: '#F8FAFC',
    padding: '2rem',
  },
  content: {
    textAlign: 'center',
    // maxWidth: '500px',
  },
  errorCode: {
    fontSize: '8rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #396aac 0%, #2D5AA0 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    margin: 0,
    lineHeight: 1,
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#1E293B',
    margin: '1rem 0 0.5rem 0',
  },
  description: {
    fontSize: '1.1rem',
    color: '#64748B',
    marginBottom: '2.5rem',
    lineHeight: 1.6,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #18191aff 0%, #1a1c1fff 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(57, 106, 172, 0.3)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #D1D5DB',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
};

// Add hover effects
styles.primaryButton[':hover'] = {
  transform: 'translateY(-2px)',
  boxShadow: '0 4px 12px rgba(57, 106, 172, 0.4)',
};

styles.secondaryButton[':hover'] = {
  backgroundColor: '#F9FAFB',
  borderColor: '#9CA3AF',
};

export default NotFound;