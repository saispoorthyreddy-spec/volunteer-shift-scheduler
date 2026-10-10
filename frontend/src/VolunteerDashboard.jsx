import { useState, useEffect } from "react";
import api from "./api";

function VolunteerDashboard({ user, goToPage }) {
  const [data, setData] = useState({
    user: {},
    confirmedShifts: [],
    waitlistedShifts: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const res = await api.dashboards.volunteer();
      setData(res || {});
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(signupId, roleName) {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${roleName}"?`)) {
      return;
    }

    setCancellingId(signupId);
    setActionMessage("");
    try {
      await api.signups.cancel(signupId);
      setActionMessage("Registration cancelled successfully.");
      await loadDashboard();
    } catch (err) {
      setActionMessage(err.message || "Failed to cancel registration.");
    } finally {
      setCancellingId(null);
    }
  }

  function formatDateTime(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return `${d.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-header-card">
        <div className="dashboard-welcome">
          <span className="dashboard-pill">Volunteer Dashboard</span>
          <h1>Welcome back, <span>{user?.name || data.user?.name || "Volunteer"}</span>!</h1>
          <p>Here is an overview of your upcoming shifts, waitlists, and community updates.</p>
        </div>
        <div className="dashboard-quick-actions">
          <button className="primary-button" onClick={() => goToPage("events")}>
            Browse More Events →
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="dashboard-alert success-alert" role="status">
          <span>✓</span> {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : error ? (
        <div className="error-card">
          <p className="error-title">Unable to load dashboard</p>
          <p>{error}</p>
          <button className="primary-button" onClick={loadDashboard}>
            Retry
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Main Column: Confirmed & Waitlisted Shifts */}
          <div className="dashboard-main-col">
            {/* Confirmed Shifts */}
            <section className="dashboard-section-card">
              <div className="section-header">
                <h2>Confirmed Shifts ({data.confirmedShifts?.length || 0})</h2>
                <span className="badge-confirmed">Active</span>
              </div>

              {(!data.confirmedShifts || data.confirmedShifts.length === 0) ? (
                <div className="empty-substate">
                  <span className="substate-icon">🌱</span>
                  <h4>No confirmed shifts yet</h4>
                  <p>You haven't signed up for any upcoming shifts. Explore events to get involved!</p>
                  <button className="secondary-button" onClick={() => goToPage("events")}>
                    Find Shifts
                  </button>
                </div>
              ) : (
                <div className="signup-cards-list">
                  {data.confirmedShifts.map((item) => {
                    const shift = item.shift;
                    return (
                      <div key={item.id} className="shift-summary-card confirmed-card">
                        <div className="shift-summary-main">
                          <div className="shift-title-row">
                            <h3>{shift.role}</h3>
                            <span className="status-tag tag-confirmed">Confirmed</span>
                          </div>
                          <p className="shift-event-name">Event: <strong>{shift.eventName}</strong></p>
                          <div className="shift-meta-grid">
                            <span>🗓 <strong>Start:</strong> {formatDateTime(shift.start)}</span>
                            <span>⏰ <strong>End:</strong> {formatDateTime(shift.end)}</span>
                            <span>📍 <strong>Location:</strong> {shift.location}</span>
                          </div>
                        </div>
                        <div className="shift-summary-action">
                          <button
                            className="cancel-btn"
                            disabled={cancellingId === item.id}
                            onClick={() => handleCancel(item.id, shift.role)}
                          >
                            {cancellingId === item.id ? "Cancelling..." : "Cancel Shift"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Waitlisted Shifts */}
            <section className="dashboard-section-card">
              <div className="section-header">
                <h2>Waitlisted Shifts ({data.waitlistedShifts?.length || 0})</h2>
                <span className="badge-waitlist">Pending Spot</span>
              </div>

              {(!data.waitlistedShifts || data.waitlistedShifts.length === 0) ? (
                <div className="empty-substate">
                  <p>No waitlisted shifts currently.</p>
                </div>
              ) : (
                <div className="signup-cards-list">
                  {data.waitlistedShifts.map((item) => {
                    const shift = item.shift;
                    return (
                      <div key={item.id} className="shift-summary-card waitlist-card">
                        <div className="shift-summary-main">
                          <div className="shift-title-row">
                            <h3>{shift.role}</h3>
                            <span className="status-tag tag-waitlist">On Waitlist</span>
                          </div>
                          <p className="shift-event-name">Event: <strong>{shift.eventName}</strong></p>
                          <div className="shift-meta-grid">
                            <span>🗓 <strong>Time:</strong> {formatDateTime(shift.start)} – {formatDateTime(shift.end)}</span>
                            <span>📍 <strong>Location:</strong> {shift.location}</span>
                          </div>
                          <p className="waitlist-tip">
                            💡 If an attendee cancels, you will automatically be promoted to confirmed status!
                          </p>
                        </div>
                        <div className="shift-summary-action">
                          <button
                            className="cancel-btn"
                            disabled={cancellingId === item.id}
                            onClick={() => handleCancel(item.id, shift.role)}
                          >
                            {cancellingId === item.id ? "Leaving..." : "Leave Waitlist"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column: In-app Notifications */}
          <div className="dashboard-side-col">
            <section className="dashboard-section-card">
              <div className="section-header">
                <h2>Notifications</h2>
                <span className="notification-count">{data.notifications?.length || 0}</span>
              </div>

              {(!data.notifications || data.notifications.length === 0) ? (
                <p className="empty-notifications">No notifications yet. You will be alerted here when shift spots open up!</p>
              ) : (
                <div className="notifications-list">
                  {data.notifications.map((n) => (
                    <div key={n.id} className="notification-bubble">
                      <div className="notification-icon">🔔</div>
                      <div className="notification-content">
                        <p>{n.message}</p>
                        <span className="notification-time">
                          {n.at ? new Date(n.at).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerDashboard;
