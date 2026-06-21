import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Library, MapPin, Users, Activity } from "lucide-react";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      {/* HERO SECTION */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Your Library, <span style={styles.highlight}>Reimagined</span>.
        </h1>
        <p style={styles.heroSubtitle}>
          Book library seats, reserve interactive discussion rooms, and request new books digitally tracking demand instantly.
        </p>

        <div style={styles.heroActions}>
          <Link to={user ? "/book-seat" : "/login"} style={{ textDecoration: 'none' }}>
            <button className="primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Reserve a Seat Now
            </button>
          </Link>
          <Link to={user ? "/request-book" : "/login"} style={{ textDecoration: 'none' }}>
            <button className="secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Request a Book
            </button>
          </Link>
        </div>
      </div>

      {/* FEATURES */}
      <div style={styles.section}>
        <div className="grid-3" style={styles.gridContainer}>
          <div className="glass-panel" style={styles.card}>
            <div style={styles.iconWrapper}><MapPin color="#8b5cf6" size={32} /></div>
            <h3>Real-time Seat Booking</h3>
            <p>View live updates of library seating and reserve your spot instantly. No more walking around to find an empty chair.</p>
          </div>

          <div className="glass-panel" style={styles.card}>
             <div style={styles.iconWrapper}><Users color="#f59e0b" size={32} /></div>
            <h3>Discussion Rooms</h3>
            <p>Collaborate efficiently. Reserve high-capacity discussion rooms for group studies and meetings.</p>
          </div>

          <div className="glass-panel" style={styles.card}>
            <div style={styles.iconWrapper}><Library color="#10b981" size={32} /></div>
            <h3>Smart Book Requests</h3>
            <p>Request missing books directly to the library staff. The system automatically tracks high-demand titles.</p>
          </div>

          <div className="glass-panel" style={styles.card}>
            <div style={styles.iconWrapper}><Activity color="#ef4444" size={32} /></div>
             <h3>Live Dashboard & Analytics</h3>
            <p>Admins can track library usage, most requested books, and resource efficiency using data-driven insights.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    textAlign: "center",
    padding: "160px 20px 80px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
    lineHeight: "1.1",
    marginBottom: "24px",
  },
  highlight: {
    background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    position: 'relative',
  },
  heroSubtitle: {
    fontSize: "1.25rem",
    marginBottom: "48px",
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto 48px auto'
  },
  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    flexWrap: "wrap",
  },
  section: {
    padding: "0 24px",
  },
  gridContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px'
  },
  iconWrapper: {
    background: 'rgba(255,255,255,0.05)',
    padding: '16px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px'
  }
};

export default Home;