import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404 - Page Not Found</h1>
      <p style={styles.message}>Oops! The page you are looking for does not exist.</p>
      <Link to="/" style={styles.link}>Go back to Home</Link>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f4f4f9',
    color: '#333',
  },
  heading: {
    fontSize: '3rem',
    marginBottom: '20px',
  },
  message: {
    fontSize: '1.25rem',
    marginBottom: '20px',
  },
  link: {
    fontSize: '1rem',
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default NotFound;
