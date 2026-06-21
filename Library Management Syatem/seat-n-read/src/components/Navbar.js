import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BookOpen, LogOut, User } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.navContent}>
        <Link to="/" style={styles.brand}>
          <BookOpen color="var(--primary)" size={28} />
          <span style={styles.brandText}>Seat-N-Read</span>
        </Link>
        <div style={styles.links}>
          {user ? (
            <>
              <Link to="/book-seat" style={styles.link}>Book Seat</Link>
              <Link to="/request-book" style={styles.link}>Request Book</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.link}>Admin</Link>
              )}
              <div style={styles.userMenu}>
                <span style={styles.userName}><User size={16} /> {user.name}</span>
                <button onClick={handleLogout} style={styles.logoutBtn}><LogOut size={16}/> Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register"><button className="primary" style={{ padding: '8px 16px' }}>Sign Up</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    position: 'fixed',
    top: 0, width: '100%', zIndex: 1000,
    transition: 'all 0.3s ease'
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  brandText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    fontFamily: 'Outfit, sans-serif',
    background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '-0.02em'
  },
  links: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  },
  link: {
    color: 'var(--text-main)',
    textDecoration: 'none',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
    transition: 'color 0.2s',
    fontSize: '0.95rem'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginLeft: '16px',
    paddingLeft: '24px',
    borderLeft: '1px solid rgba(255,255,255,0.1)'
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-main)',
    fontWeight: '500',
    fontSize: '0.9rem'
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    fontSize: '0.85rem'
  }
};

export default Navbar;