# VolunteerHub — Volunteer Shift Scheduler for Events

VolunteerHub is a full-stack web application designed for non-profits, event organizers, and community volunteers. It centralizes event scheduling, manages shift capacities with transactional concurrency control, prevents overlapping signups, and provides automatic waitlist promotions upon cancellation.

---

## Architecture & Technology Stack

### Backend
- **Framework:** Java 21, Spring Boot 3.3.5
- **Data & ORM:** Spring Data JPA, Hibernate 6
- **Security:** Spring Security 6, Spring Security OAuth2 Resource Server (stateless JWT), BCrypt password hashing
- **Concurrency Control:** Pessimistic write locking (`@Lock(PESSIMISTIC_WRITE)`) to eliminate shift overbooking
- **Databases:**
  - **Local Development:** In-memory H2 database with PostgreSQL compatibility mode
  - **Production:** Neon PostgreSQL (hosted serverless PostgreSQL)
- **Monitoring:** Spring Boot Actuator (`/actuator/health`)

### Frontend
- **Framework:** React 19, Vite
- **Styling:** Vanilla CSS design system with purple and lavender aesthetics
- **State & Networking:** React Hooks, modular `api.js` client with automatic JWT token management
- **Routing & Views:** Interactive multi-view routing (Home, Events, Features, Volunteer Dashboard, Organizer Dashboard, Login, Register)

---

## Key Features & Business Logic

1. **Role-Based Portals:**
   - **Volunteers:** Explore community opportunities, view remaining spots in real time, register for shifts, review confirmed/waitlisted commitments, cancel signups, and receive in-app notifications.
   - **Organizers:** Create events, schedule shifts with custom capacities, inspect volunteer rosters (names and emails), and close/reopen shifts.
2. **Pessimistic Concurrency & Zero Overbooking:**
   - Every shift registration locks the shift row in the database during capacity evaluation, ensuring that simultaneous signups can never overbook a shift.
3. **Automatic Waitlist Management & Promotion:**
   - If a shift is full, volunteers can join a FIFO waitlist.
   - When a confirmed volunteer cancels, the scheduler automatically identifies the earliest eligible waitlisted candidate (verifying schedule conflicts) and promotes them to confirmed status while triggering a notification.
4. **Shift Overlap Prevention:**
   - Evaluates timestamps (`newStart < existingEnd AND newEnd > existingStart`). A volunteer cannot register for or be promoted into a shift that conflicts with an existing commitment.

---

## Getting Started Locally

### Prerequisites
- **Java 21 JDK** (e.g., Eclipse Adoptium Temurin 21)
- **Maven 3.9+** (or IntelliJ IDEA bundled Maven)
- **Node.js 18+** and **npm**

---

### Option A: Running from the Terminal / Command Line

#### 1. Start the Spring Boot Backend
Ensure your shell's `JAVA_HOME` points to your Java 21 installation:

**PowerShell (Windows):**
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
cd "volunteer-scheduler"
mvn clean package -DskipTests
java -jar target/volunteer-scheduler-1.0.0.jar
```

Or using `mvn spring-boot:run`:
```powershell
mvn spring-boot:run
```
The backend will start at: `http://localhost:8080`.
Verify status: `curl http://localhost:8080/actuator/health` -> `{"status":"UP"}`

#### 2. Start the React Frontend
Open a second terminal window:
```powershell
cd "volunteer-scheduler/frontend"
npm install
npm run dev
```
The frontend dev server will launch at: `http://localhost:5173`.
Open `http://localhost:5173` in your browser.

---

### Option B: Running in IntelliJ IDEA

1. Open IntelliJ IDEA and choose **Open**, then select the `volunteer-scheduler` folder.
2. Ensure Project SDK is set to **Java 21** (**File** → **Project Structure** → **Project** → **SDK: 21**).
3. In the Maven Tool Window, run **Reload All Maven Projects**.
4. Right-click `com.shiftly.App.java` and select **Run 'App'**.
5. For the frontend: Open the IntelliJ Terminal, run `cd frontend`, `npm install`, and `npm run dev`.

---

## Running Automated Tests

Run all unit and integration tests (context startup, repository queries, capacity concurrency, waitlist promotion, and full REST API scenarios):

```powershell
mvn test
```

To build a production bundle of the React frontend:
```powershell
cd frontend
npm run build
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new account (`VOLUNTEER` or `ORGANIZER`) |
| `POST` | `/api/auth/login` | Public | Sign in and receive signed JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Events & Shifts
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/events` | Public | List all upcoming events |
| `GET` | `/api/events/{id}` | Public | Get specific event details |
| `GET` | `/api/events/{id}/shifts` | Public | List shifts for a specific event |
| `POST` | `/api/events` | Organizer | Create an event |
| `PUT` | `/api/events/{id}` | Organizer (Owner) | Update an event |
| `DELETE` | `/api/events/{id}` | Organizer (Owner) | Delete an event |
| `GET` | `/api/shifts` | Public | Browse/filter shifts by role, date, or event |
| `GET` | `/api/shifts/{id}` | Public | Get specific shift details |
| `POST` | `/api/events/{id}/shifts` | Organizer (Owner) | Create a shift under an event |
| `PUT` | `/api/shifts/{id}` | Organizer (Owner) | Edit shift time and capacity |
| `POST` | `/api/shifts/{id}/close` | Organizer (Owner) | Close shift to new signups |
| `POST` | `/api/shifts/{id}/reopen` | Organizer (Owner) | Reopen closed shift |
| `GET` | `/api/shifts/{id}/signups` | Organizer (Owner) | View registered volunteers for shift |

### Signups & Dashboards
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/shifts/{id}/signup` | Volunteer | Register for shift (confirmed or waitlist) |
| `DELETE` | `/api/signups/{id}` | Volunteer (Owner) | Cancel signup and trigger promotion |
| `GET` | `/api/signups/mine` | Volunteer | View all my active signups |
| `GET` | `/api/volunteer/dashboard` | Volunteer | Complete volunteer dashboard data |
| `GET` | `/api/organizer/dashboard` | Organizer | Complete organizer dashboard data & stats |
| `GET` | `/api/notifications` | Authenticated | View in-app notifications |

---

## Deployment Guide

### 1. Neon PostgreSQL Database
1. Go to [Neon Console](https://console.neon.tech/) and create a new project.
2. Under **Connection Details**, select **JDBC Connection String**:
   ```
   jdbc:postgresql://ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Note your username, password, and database host.

---

### 2. Render Backend Deployment
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New** → **Web Service** and connect your GitHub repository.
3. Configure settings:
   - **Environment:** `Docker` (Render will automatically detect `Dockerfile`)
   - **Health Check Path:** `/actuator/health`
4. Set Environment Variables:
   - `DB_URL`: `jdbc:postgresql://<NEON_HOST>/<DB_NAME>?sslmode=require`
   - `DB_USER`: Your Neon database username
   - `DB_PASSWORD`: Your Neon database password
   - `JWT_SECRET`: A secure 32+ character random secret (e.g. `openssl rand -base64 32`)
   - `FRONTEND_ORIGIN`: Your deployed Vercel frontend URL (e.g. `https://your-volunteerhub.vercel.app`)
   - `PORT`: `8080`
5. Click **Create Web Service**. After deployment completes, copy the service URL (e.g. `https://volunteerhub-backend.onrender.com`).

---

### 3. Vercel Frontend Deployment
1. Go to [Vercel](https://vercel.com/) and click **Add New** → **Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Root Directory:** Edit and set to `frontend`
   - **Framework Preset:** `Vite`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://volunteerhub-backend.onrender.com` (your Render backend URL)
5. Click **Deploy**.
6. Once deployed, ensure the production Vercel URL is added to the backend's `FRONTEND_ORIGIN` environment variable on Render for CORS.

---

## Environment Variables Reference

| Variable | Scope | Description | Default / Example |
|---|---|---|---|
| `DB_URL` | Backend | JDBC database URL | `jdbc:h2:mem:shifts;MODE=PostgreSQL...` |
| `DB_USER` | Backend | Database user | `sa` |
| `DB_PASSWORD` | Backend | Database password | empty (local) |
| `DDL_AUTO` | Backend | Hibernate schema management | `update` |
| `JWT_SECRET` | Backend | Secret key for signing JWTs | 32+ char random key |
| `FRONTEND_ORIGIN` | Backend | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://localhost:8080` |
| `PORT` | Backend | Web server port | `8080` |
| `VITE_API_BASE_URL` | Frontend | Target backend API URL | `http://localhost:8080` |

---

## Troubleshooting

- **`UnknownEntityException: Could not resolve root entity 'Shift'`:**
  - *Cause:* Occurred when `Shift` was an inner class in `Domain.java`.
  - *Fix:* Refactored into top-level entity classes in `com.shiftly.domain.*`.
- **`Fatal error compiling: error: release version 21 not supported`:**
  - *Cause:* Terminal environment had `JAVA_HOME` pointing to an older JDK (e.g. JDK 11).
  - *Fix:* Point `$env:JAVA_HOME` to `jdk-21.0.11` before building.
- **CORS Error in Browser:**
  - *Cause:* Request origin not present in `FRONTEND_ORIGIN`.
  - *Fix:* Add the frontend domain (e.g. `http://localhost:5173` or `https://your-app.vercel.app`) to `FRONTEND_ORIGIN`.
