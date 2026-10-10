import { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import EventsPage from "./EventsPage";
import VolunteerDashboard from "./VolunteerDashboard";
import OrganizerDashboard from "./OrganizerDashboard";
import api from "./api";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check existing session
    const storedUser = api.getUser();
    if (storedUser) {
      setUser(storedUser);
    }

    // Hash-based deep link check
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setPage(hash);
    }
  }, []);

  const goToPage = (nextPage) => {
    setPage(nextPage);
    window.history.replaceState(
      null,
      "",
      nextPage === "home" ? "/" : `/#${nextPage}`
    );
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === "ORGANIZER") {
      goToPage("organizer-dashboard");
    } else {
      goToPage("volunteer-dashboard");
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    goToPage("home");
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <header className="navbar">
        <button
          className="brand"
          onClick={() => goToPage("home")}
          aria-label="Go to home page"
        >
          <span className="brand-icon">V</span>
          <span>VolunteerHub</span>
        </button>

        <nav className="nav-links">
          <button
            className={page === "home" ? "nav-link active" : "nav-link"}
            onClick={() => goToPage("home")}
          >
            Home
          </button>

          <button
            className={page === "events" ? "nav-link active" : "nav-link"}
            onClick={() => goToPage("events")}
          >
            Events
          </button>

          <button
            className={page === "features" ? "nav-link active" : "nav-link"}
            onClick={() => goToPage("features")}
          >
            Features
          </button>

          {user && user.role === "VOLUNTEER" && (
            <button
              className={page === "volunteer-dashboard" ? "nav-link active" : "nav-link"}
              onClick={() => goToPage("volunteer-dashboard")}
            >
              My Shifts
            </button>
          )}

          {user && user.role === "ORGANIZER" && (
            <button
              className={page === "organizer-dashboard" ? "nav-link active" : "nav-link"}
              onClick={() => goToPage("organizer-dashboard")}
            >
              Organizer Dashboard
            </button>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-profile-badge">
              <span className="user-avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
              <div className="user-details-text">
                <span className="user-nav-name">{user.name}</span>
                <span className="user-nav-role">
                  {user.role === "ORGANIZER" ? "Organizer" : "Volunteer"}
                </span>
              </div>
              <button
                className="logout-nav-btn"
                onClick={handleLogout}
                title="Log out of VolunteerHub"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <button
                className="login-button"
                onClick={() => goToPage("login")}
              >
                Log in
              </button>

              <button
                className="primary-button nav-register"
                onClick={() => goToPage("register")}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Home Page */}
      {page === "home" && (
        <main className="hero">
          <section className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Make a difference together
            </div>

            <h1>
              Give your time.
              <br />
              <span>Change lives.</span>
            </h1>

            <p className="hero-description">
              Discover meaningful volunteer opportunities, connect with passionate people,
              and make a real impact in your community. Your next great experience starts here.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button hero-button"
                onClick={() => (user ? goToPage("events") : goToPage("register"))}
              >
                Join as a Volunteer <span>→</span>
              </button>

              <button
                className="secondary-button hero-button"
                onClick={() => goToPage("events")}
              >
                Explore Events
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <strong>500+</strong>
                <span>Volunteers</span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat">
                <strong>100+</strong>
                <span>Events</span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat">
                <strong>50+</strong>
                <span>Organizations</span>
              </div>
            </div>
          </section>

          {/* Hero Illustration */}
          <section className="hero-visual">
            <div className="visual-glow"></div>

            <div className="illustration-card">
              <div className="illustration-header">
                <div>
                  <span className="illustration-eyebrow">YOUR COMMUNITY</span>
                  <h3>Small acts, big impact.</h3>
                </div>
                <span className="heart-icon">♡</span>
              </div>

              <div className="illustration-art">
                <div className="sun"></div>
                <div className="hill hill-back"></div>
                <div className="hill hill-front"></div>

                <div className="person person-one">
                  <div className="person-head"></div>
                  <div className="person-body"></div>
                  <div className="person-leg leg-one"></div>
                  <div className="person-leg leg-two"></div>
                </div>

                <div className="person person-two">
                  <div className="person-head"></div>
                  <div className="person-body"></div>
                  <div className="person-leg leg-one"></div>
                  <div className="person-leg leg-two"></div>
                </div>

                <div className="floating-heart">♥</div>
                <div className="floating-star">✦</div>
              </div>

              <div className="illustration-footer">
                <div className="avatar-stack">
                  <span>😊</span>
                  <span>🌻</span>
                  <span>💜</span>
                </div>

                <p>
                  <strong>People like you</strong>
                  <br />
                  are making a difference.
                </p>

                <span className="footer-arrow">↗</span>
              </div>
            </div>

            <div className="floating-card floating-card-top">
              <span className="floating-card-icon">💜</span>
              <div>
                <strong>Make an impact</strong>
                <span>One hour at a time</span>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <span className="floating-card-icon">✨</span>
              <div>
                <strong>Find your purpose</strong>
                <span>Volunteer. Connect. Grow.</span>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Register Page */}
      {page === "register" && (
        <main className="auth-page">
          <Register onLoginSuccess={handleLoginSuccess} goToPage={goToPage} />
        </main>
      )}

      {/* Login Page */}
      {page === "login" && (
        <main className="auth-page">
          <Login onLoginSuccess={handleLoginSuccess} goToPage={goToPage} />
        </main>
      )}

      {/* Events Page */}
      {page === "events" && (
        <main className="page-body">
          <EventsPage user={user} goToPage={goToPage} />
        </main>
      )}

      {/* Volunteer Dashboard */}
      {page === "volunteer-dashboard" && (
        <main className="page-body">
          <VolunteerDashboard user={user} goToPage={goToPage} />
        </main>
      )}

      {/* Organizer Dashboard */}
      {page === "organizer-dashboard" && (
        <main className="page-body">
          <OrganizerDashboard user={user} goToPage={goToPage} />
        </main>
      )}

      {/* Features Page */}
      {page === "features" && (
        <main className="features-page">
          <div className="page-badge">WHY VOLUNTEERHUB?</div>

          <h1>
            Everything you need to <span>make an impact.</span>
          </h1>

          <p className="features-description">
            A simple, dependable way to discover opportunities, organize events, manage capacity,
            and coordinate volunteers with automatic waitlists.
          </p>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon purple-icon">🔎</div>
              <h2>Discover Opportunities</h2>
              <p>
                Browse volunteer events with verified time slots, role requirements, and remaining spots in your area.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon pink-icon">📅</div>
              <h2>Manage Your Schedule</h2>
              <p>
                Prevent overlapping commitments with real-time schedule conflict detection and single-click cancellations.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon yellow-icon">⚡</div>
              <h2>Automatic Waitlists</h2>
              <p>
                Full shifts queue waitlisted volunteers. If an attendee cancels, the next candidate is instantly promoted.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon green-icon">📊</div>
              <h2>Organizer Controls</h2>
              <p>
                Create events, schedule shifts, track volunteer rosters, and close or reopen registrations in real time.
              </p>
            </article>
          </div>

          {/* Organizer Info Callout */}
          <section className="organizer-features-callout">
            <div className="callout-card">
              <div className="callout-content">
                <span className="callout-tag">FOR EVENT ORGANIZERS</span>
                <h2>Coordinating volunteer power has never been easier.</h2>
                <p>
                  Eliminate spreadsheet chaos and double-booking. Set exact shift capacities,
                  track volunteer registrations as they happen, and let our transactional engine
                  handle waitlists and spot promotions automatically.
                </p>
                <div className="callout-bullets">
                  <div className="bullet-item">✓ Zero overbooking with database locking</div>
                  <div className="bullet-item">✓ Real-time volunteer roster inspection</div>
                  <div className="bullet-item">✓ Schedule shifts with custom capacities</div>
                </div>
              </div>
              <button
                className="primary-button callout-btn"
                onClick={() => (user ? goToPage("organizer-dashboard") : goToPage("register"))}
              >
                {user ? "Open Organizer Dashboard" : "Start Organizing Events →"}
              </button>
            </div>
          </section>

          <button
            className="primary-button features-cta"
            onClick={() => goToPage("events")}
          >
            Explore Active Opportunities →
          </button>
        </main>
      )}

      {/* Footer */}
      <footer className="footer">
        <button className="footer-brand" onClick={() => goToPage("home")}>
          <span className="brand-icon">V</span>
          VolunteerHub
        </button>

        <p>Bringing people together to make a difference in our communities.</p>

        <span className="footer-copyright">
          © {new Date().getFullYear()} VolunteerHub. Made for good.
        </span>
      </footer>
    </div>
  );
}

export default App;
