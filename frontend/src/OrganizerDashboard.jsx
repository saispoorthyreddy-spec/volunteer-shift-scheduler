import { useState, useEffect } from "react";
import api from "./api";

function OrganizerDashboard({ user, goToPage }) {
  const [dashboardData, setDashboardData] = useState({
    events: [],
    shifts: [],
    stats: {
      totalEvents: 0,
      totalShifts: 0,
      totalCapacity: 0,
      totalConfirmed: 0,
      totalWaitlisted: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionAlert, setActionAlert] = useState({ text: "", type: "" });

  // Modal states
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [targetEventForShift, setTargetEventForShift] = useState(null);
  const [viewingShiftSignups, setViewingShiftSignups] = useState(null);
  const [signupsList, setSignupsList] = useState([]);
  const [loadingSignups, setLoadingSignups] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    eventDate: "",
    location: "",
  });

  const [shiftForm, setShiftForm] = useState({
    roleName: "",
    startTime: "",
    endTime: "",
    capacity: 5,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const res = await api.dashboards.organizer();
      setDashboardData(res || { events: [], shifts: [], stats: {} });
    } catch (err) {
      setError(err.message || "Failed to load organizer dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    setActionAlert({ text: "", type: "" });
    try {
      await api.events.create(eventForm);
      setActionAlert({ text: "Event created successfully!", type: "success" });
      setShowCreateEventModal(false);
      setEventForm({ name: "", description: "", eventDate: "", location: "" });
      await loadDashboard();
    } catch (err) {
      setActionAlert({ text: err.message || "Failed to create event.", type: "error" });
    }
  }

  async function handleCreateShift(e) {
    e.preventDefault();
    if (!targetEventForShift) return;
    setActionAlert({ text: "", type: "" });

    try {
      await api.shifts.create(targetEventForShift.id, {
        roleName: shiftForm.roleName,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        capacity: parseInt(shiftForm.capacity, 10),
      });

      setActionAlert({
        text: `Shift added to "${targetEventForShift.name}" successfully!`,
        type: "success",
      });
      setShowCreateShiftModal(false);
      setShiftForm({ roleName: "", startTime: "", endTime: "", capacity: 5 });
      await loadDashboard();
    } catch (err) {
      setActionAlert({ text: err.message || "Failed to create shift.", type: "error" });
    }
  }

  async function handleToggleClose(shift) {
    setActionAlert({ text: "", type: "" });
    try {
      if (shift.closed) {
        await api.shifts.reopen(shift.id);
        setActionAlert({ text: `Shift "${shift.role}" is now open for signups.`, type: "success" });
      } else {
        await api.shifts.close(shift.id);
        setActionAlert({ text: `Shift "${shift.role}" is now closed to new signups.`, type: "success" });
      }
      await loadDashboard();
    } catch (err) {
      setActionAlert({ text: err.message || "Failed to update shift.", type: "error" });
    }
  }

  async function handleViewSignups(shift) {
    setViewingShiftSignups(shift);
    setLoadingSignups(true);
    setSignupsList([]);
    try {
      const list = await api.shifts.getSignups(shift.id);
      setSignupsList(list || []);
    } catch (err) {
      setActionAlert({ text: err.message || "Failed to load volunteer signups.", type: "error" });
    } finally {
      setLoadingSignups(false);
    }
  }

  function formatDateTime(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return `${d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="dashboard-header-card">
        <div className="dashboard-welcome">
          <span className="dashboard-pill">Organizer Portal</span>
          <h1>Welcome, <span>{user?.name || "Organizer"}</span>!</h1>
          <p>Manage your events, coordinate volunteer shifts, and monitor real-time capacity.</p>
        </div>
        <div className="dashboard-quick-actions">
          <button className="primary-button" onClick={() => setShowCreateEventModal(true)}>
            + Create New Event
          </button>
        </div>
      </div>

      {actionAlert.text && (
        <div className={`dashboard-alert ${actionAlert.type === "success" ? "success-alert" : "error-alert"}`}>
          <span>{actionAlert.type === "success" ? "✓" : "⚠️"}</span> {actionAlert.text}
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="stats-metric-grid">
        <div className="metric-card">
          <span className="metric-icon">📅</span>
          <div>
            <strong>{dashboardData.stats?.totalEvents || 0}</strong>
            <span>Active Events</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">⏰</span>
          <div>
            <strong>{dashboardData.stats?.totalShifts || 0}</strong>
            <span>Total Shifts</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">👥</span>
          <div>
            <strong>{dashboardData.stats?.totalConfirmed || 0}</strong>
            <span>Confirmed Volunteers</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">⏳</span>
          <div>
            <strong>{dashboardData.stats?.totalWaitlisted || 0}</strong>
            <span>Waitlisted Volunteers</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">🎯</span>
          <div>
            <strong>{dashboardData.stats?.totalCapacity || 0}</strong>
            <span>Total Capacity</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your organizer dashboard...</p>
        </div>
      ) : error ? (
        <div className="error-card">
          <p className="error-title">Unable to load dashboard</p>
          <p>{error}</p>
          <button className="primary-button" onClick={loadDashboard}>Retry</button>
        </div>
      ) : (
        <div className="organizer-sections">
          {/* Events & Shifts Section */}
          <section className="dashboard-section-card">
            <div className="section-header">
              <h2>Your Events & Shifts</h2>
              <button className="secondary-button" onClick={() => setShowCreateEventModal(true)}>
                + New Event
              </button>
            </div>

            {dashboardData.events.length === 0 ? (
              <div className="empty-substate">
                <span className="substate-icon">🎪</span>
                <h4>You haven't created any events yet</h4>
                <p>Get started by creating your first event and publishing volunteer shifts.</p>
                <button className="primary-button" onClick={() => setShowCreateEventModal(true)}>
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="organizer-events-list">
                {dashboardData.events.map((ev) => {
                  const evShifts = dashboardData.shifts.filter((s) => s.eventId === ev.id);

                  return (
                    <div key={ev.id} className="organizer-event-block">
                      <div className="organizer-event-header">
                        <div>
                          <div className="event-meta-pill">
                            <span>🗓 {ev.eventDate}</span>
                            <span>📍 {ev.location}</span>
                          </div>
                          <h3>{ev.name}</h3>
                          {ev.description && <p className="event-subtext">{ev.description}</p>}
                        </div>
                        <button
                          className="secondary-button add-shift-btn"
                          onClick={() => {
                            setTargetEventForShift(ev);
                            setShowCreateShiftModal(true);
                          }}
                        >
                          + Add Shift
                        </button>
                      </div>

                      {/* Shifts Table */}
                      <div className="shifts-table-container">
                        {evShifts.length === 0 ? (
                          <p className="no-shifts-callout">
                            No shifts added yet. Click <strong>+ Add Shift</strong> to schedule volunteer roles.
                          </p>
                        ) : (
                          <table className="shifts-table">
                            <thead>
                              <tr>
                                <th>Role</th>
                                <th>Time Window</th>
                                <th>Confirmed / Capacity</th>
                                <th>Waitlist</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {evShifts.map((s) => (
                                <tr key={s.id} className={s.closed ? "row-closed" : ""}>
                                  <td><strong>{s.role}</strong></td>
                                  <td>{formatDateTime(s.start)} – {formatDateTime(s.end)}</td>
                                  <td>
                                    <div className="capacity-cell">
                                      <span>{s.confirmed} / {s.capacity}</span>
                                      <div className="mini-progress-track">
                                        <div
                                          className="mini-progress-fill"
                                          style={{ width: `${Math.min(100, s.fillRate || 0)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{s.waitlisted > 0 ? <span className="waitlist-count-tag">{s.waitlisted} waiting</span> : "0"}</td>
                                  <td>
                                    {s.closed ? (
                                      <span className="status-badge closed-badge">Closed</span>
                                    ) : s.spotsLeft === 0 ? (
                                      <span className="status-badge full-badge">Full</span>
                                    ) : (
                                      <span className="status-badge open-badge">Open ({s.spotsLeft} left)</span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="table-actions-row">
                                      <button
                                        className="btn-table-action"
                                        onClick={() => handleViewSignups(s)}
                                        title="View signed up volunteers"
                                      >
                                        👥 Volunteers ({s.confirmed + s.waitlisted})
                                      </button>
                                      <button
                                        className={`btn-table-action ${s.closed ? "btn-reopen" : "btn-close"}`}
                                        onClick={() => handleToggleClose(s)}
                                      >
                                        {s.closed ? "Reopen" : "Close"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modal: Create Event */}
      {showCreateEventModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateEventModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Volunteer Event</h3>
              <button className="modal-close" onClick={() => setShowCreateEventModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateEvent} className="modal-form">
              <div className="form-group">
                <label>Event Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Annual River Cleanup 2026"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Tell volunteers about the event, what to bring, and its community impact..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Riverside Park, Gate 3"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreateEventModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Shift */}
      {showCreateShiftModal && targetEventForShift && (
        <div className="modal-backdrop" onClick={() => setShowCreateShiftModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Shift to "{targetEventForShift.name}"</h3>
              <button className="modal-close" onClick={() => setShowCreateShiftModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateShift} className="modal-form">
              <div className="form-group">
                <label>Shift Role Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Registration Desk Assistant"
                  value={shiftForm.roleName}
                  onChange={(e) => setShiftForm({ ...shiftForm, roleName: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Volunteer Capacity (Spots) *</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={shiftForm.capacity}
                  onChange={(e) => setShiftForm({ ...shiftForm, capacity: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreateShiftModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Shift Signups */}
      {viewingShiftSignups && (
        <div className="modal-backdrop" onClick={() => setViewingShiftSignups(null)}>
          <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Volunteers for "{viewingShiftSignups.role}"</h3>
                <p className="modal-subtitle">
                  {viewingShiftSignups.confirmed} / {viewingShiftSignups.capacity} Confirmed • {viewingShiftSignups.waitlisted} Waitlisted
                </p>
              </div>
              <button className="modal-close" onClick={() => setViewingShiftSignups(null)}>×</button>
            </div>

            <div className="modal-body-content">
              {loadingSignups ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading volunteer roster...</p>
                </div>
              ) : signupsList.length === 0 ? (
                <p className="empty-roster">No volunteers have registered for this shift yet.</p>
              ) : (
                <table className="shifts-table roster-table">
                  <thead>
                    <tr>
                      <th>Volunteer Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signupsList.map((su) => (
                      <tr key={su.id}>
                        <td><strong>{su.volunteerName}</strong></td>
                        <td>{su.volunteerEmail}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              su.status === "CONFIRMED"
                                ? "open-badge"
                                : su.status === "WAITLISTED"
                                ? "waitlist-badge"
                                : "closed-badge"
                            }`}
                          >
                            {su.status}
                          </span>
                        </td>
                        <td>{new Date(su.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-actions">
              <button className="primary-button" onClick={() => setViewingShiftSignups(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizerDashboard;
