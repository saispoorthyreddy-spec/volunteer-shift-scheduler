import { useState, useEffect } from "react";
import api from "./api";

function EventsPage({ user, goToPage }) {
  const [events, setEvents] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });
  const [signingUpShiftId, setSigningUpShiftId] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [eventsData, shiftsData] = await Promise.all([
        api.events.list(),
        api.shifts.browse(selectedDate ? { date: selectedDate } : {}),
      ]);
      setEvents(eventsData || []);
      setShifts(shiftsData || []);
    } catch (err) {
      setError(err.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinShift(shiftId) {
    if (!user) {
      goToPage("login");
      return;
    }
    if (user.role !== "VOLUNTEER") {
      setActionMessage({
        text: "Only volunteers can sign up for shifts. You are logged in as an Organizer.",
        type: "error",
      });
      return;
    }

    setSigningUpShiftId(shiftId);
    setActionMessage({ text: "", type: "" });
    try {
      const res = await api.signups.join(shiftId);
      const isConfirmed = res.status === "CONFIRMED";
      setActionMessage({
        text: isConfirmed
          ? "🎉 You are confirmed for this shift! Check your dashboard for details."
          : "⏳ Shift is currently at capacity. You have been added to the waitlist!",
        type: "success",
      });
      // Refresh shifts
      const updatedShifts = await api.shifts.browse(selectedDate ? { date: selectedDate } : {});
      setShifts(updatedShifts || []);
    } catch (err) {
      setActionMessage({
        text: err.message || "Could not register for this shift.",
        type: "error",
      });
    } finally {
      setSigningUpShiftId(null);
    }
  }

  // Filtering
  const filteredEvents = events.filter((ev) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      ev.name?.toLowerCase().includes(term) ||
      ev.location?.toLowerCase().includes(term) ||
      ev.description?.toLowerCase().includes(term);
    return matchesSearch;
  });

  function getShiftsForEvent(eventId) {
    return shifts.filter((s) => s.eventId === eventId);
  }

  function formatTime(dateTimeStr) {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="events-page-container">
      {/* Page Header */}
      <div className="events-header">
        <div className="page-badge">OPPORTUNITIES</div>
        <h1>
          Explore <span>Volunteer Events</span>
        </h1>
        <p>
          Discover meaningful community causes, find shifts that fit your schedule,
          and sign up in seconds.
        </p>

        {/* Filters */}
        <div className="events-filter-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title, location or cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="date-filter-wrapper">
            <label htmlFor="dateFilter">Filter by Date:</label>
            <input
              id="dateFilter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
            {selectedDate && (
              <button
                type="button"
                className="reset-date-btn"
                onClick={() => setSelectedDate("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {actionMessage.text && (
          <div className={`events-alert-banner ${actionMessage.type}`}>
            <span>{actionMessage.type === "success" ? "✓" : "⚠️"}</span>
            {actionMessage.text}
          </div>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading community events and volunteer shifts...</p>
        </div>
      ) : error ? (
        <div className="error-card">
          <p className="error-title">Unable to load events</p>
          <p>{error}</p>
          <button className="primary-button" onClick={loadData}>
            Retry
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">📅</span>
          <h3>No events found</h3>
          <p>
            {searchTerm || selectedDate
              ? "No events match your current search filters. Try adjusting your search."
              : "No volunteer events have been scheduled yet. Check back soon!"}
          </p>
          {(searchTerm || selectedDate) && (
            <button
              className="secondary-button"
              onClick={() => {
                setSearchTerm("");
                setSelectedDate("");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="events-grid-layout">
          {filteredEvents.map((ev) => {
            const evShifts = getShiftsForEvent(ev.id);
            const isExpanded = selectedEventId === ev.id || filteredEvents.length === 1;

            return (
              <div key={ev.id} className="event-detail-card">
                <div className="event-card-header">
                  <div className="event-badge-row">
                    <span className="date-tag">🗓 {formatDate(ev.eventDate)}</span>
                    <span className="location-tag">📍 {ev.location}</span>
                  </div>
                  <h2 className="event-title">{ev.name}</h2>
                  {ev.description && <p className="event-desc">{ev.description}</p>}
                  <div className="event-organizer-meta">
                    <span>Organized by <strong>{ev.organizerName || "Community Partner"}</strong></span>
                    <span className="shift-count-pill">
                      {evShifts.length} {evShifts.length === 1 ? "Shift" : "Shifts"}
                    </span>
                  </div>
                </div>

                {/* Shift Listings for this Event */}
                <div className="shifts-container">
                  <h4 className="shifts-section-title">Available Shifts</h4>
                  {evShifts.length === 0 ? (
                    <p className="no-shifts-text">
                      No open shifts posted for this event currently.
                    </p>
                  ) : (
                    <div className="shifts-list">
                      {evShifts.map((s) => {
                        const isFull = s.spotsLeft === 0;
                        const isClosed = s.closed;

                        return (
                          <div
                            key={s.id}
                            className={`shift-item-card ${isFull ? "full-shift" : ""} ${
                              isClosed ? "closed-shift" : ""
                            }`}
                          >
                            <div className="shift-info-left">
                              <div className="shift-role-title">
                                <strong>{s.role}</strong>
                                {isClosed ? (
                                  <span className="status-badge closed-badge">Closed</span>
                                ) : isFull ? (
                                  <span className="status-badge waitlist-badge">Waitlist Only</span>
                                ) : (
                                  <span className="status-badge open-badge">
                                    {s.spotsLeft} spots left
                                  </span>
                                )}
                              </div>
                              <div className="shift-times">
                                <span>⏰ {formatTime(s.start)} – {formatTime(s.end)}</span>
                                <span className="capacity-meta">
                                  {s.confirmed} / {s.capacity} confirmed
                                  {s.waitlisted > 0 && ` • ${s.waitlisted} on waitlist`}
                                </span>
                              </div>

                              {/* Capacity Bar */}
                              <div className="capacity-bar-track">
                                <div
                                  className="capacity-bar-fill"
                                  style={{
                                    width: `${Math.min(100, s.fillRate || 0)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="shift-action-right">
                              {isClosed ? (
                                <button className="shift-btn disabled" disabled>
                                  Closed
                                </button>
                              ) : (
                                <button
                                  className={`shift-btn ${
                                    isFull ? "waitlist-btn" : "join-btn"
                                  }`}
                                  disabled={signingUpShiftId === s.id}
                                  onClick={() => handleJoinShift(s.id)}
                                >
                                  {signingUpShiftId === s.id ? (
                                    "Joining..."
                                  ) : isFull ? (
                                    "Join Waitlist"
                                  ) : (
                                    "Sign Up"
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventsPage;
