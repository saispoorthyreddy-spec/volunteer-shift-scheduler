// VolunteerHub API Client

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("vh_token");
}

function setToken(token) {
  if (token) {
    localStorage.setItem("vh_token", token);
  } else {
    localStorage.removeItem("vh_token");
  }
}

function getUser() {
  try {
    const raw = localStorage.getItem("vh_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setUser(user) {
  if (user) {
    localStorage.setItem("vh_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("vh_user");
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error("Unable to connect to the server. Please ensure the backend is running.");
  }

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  getToken,
  setToken,
  getUser,
  setUser,

  auth: {
    async register({ name, email, password, role }) {
      const res = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      if (res && res.token) {
        setToken(res.token);
        setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
      }
      return res;
    },

    async login({ email, password }) {
      const res = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res && res.token) {
        setToken(res.token);
        setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
      }
      return res;
    },

    async getMe() {
      return request("/api/auth/me");
    },

    logout() {
      setToken(null);
      setUser(null);
    },
  },

  events: {
    list() {
      return request("/api/events");
    },
    get(id) {
      return request(`/api/events/${id}`);
    },
    getShifts(id) {
      return request(`/api/events/${id}/shifts`);
    },
    create(data) {
      return request("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return request(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return request(`/api/events/${id}`, {
        method: "DELETE",
      });
    },
  },

  shifts: {
    browse(params = {}) {
      const query = new URLSearchParams();
      if (params.eventId) query.append("eventId", params.eventId);
      if (params.role) query.append("role", params.role);
      if (params.date) query.append("date", params.date);
      const qs = query.toString() ? `?${query.toString()}` : "";
      return request(`/api/shifts${qs}`);
    },
    get(id) {
      return request(`/api/shifts/${id}`);
    },
    create(eventId, data) {
      return request(`/api/events/${eventId}/shifts`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    edit(id, data) {
      return request(`/api/shifts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    close(id) {
      return request(`/api/shifts/${id}/close`, {
        method: "POST",
      });
    },
    reopen(id) {
      return request(`/api/shifts/${id}/reopen`, {
        method: "POST",
      });
    },
    getSignups(id) {
      return request(`/api/shifts/${id}/signups`);
    },
  },

  signups: {
    join(shiftId) {
      return request(`/api/shifts/${shiftId}/signup`, {
        method: "POST",
      });
    },
    cancel(signupId) {
      return request(`/api/signups/${signupId}`, {
        method: "DELETE",
      });
    },
    mine() {
      return request("/api/signups/mine");
    },
  },

  dashboards: {
    organizer() {
      return request("/api/organizer/dashboard");
    },
    volunteer() {
      return request("/api/volunteer/dashboard");
    },
  },

  notifications: {
    list() {
      return request("/api/notifications");
    },
  },
};

export default api;
