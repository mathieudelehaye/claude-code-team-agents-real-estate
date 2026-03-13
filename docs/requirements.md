# London Rentals - Product Requirements

Version: 1.0.0
Date: 2026-03-13

---

## 1. Product Overview

London Rentals is a flat rental marketplace web application for London properties. Users browse a gallery of available flats, each displaying a photo, title, price, and location. The application is a demonstration of full-stack development with SQLite BLOB image storage and a React frontend.

---

## 2. User Stories

### US-01: Browse Flat Listings
As a prospective tenant, I want to see a gallery of available flats so that I can quickly scan what is available.

**Acceptance criteria:**
- The gallery loads automatically when the page opens
- At least 6 flat cards are displayed
- Each card shows: photo, title, monthly price, location
- The gallery is responsive (works on mobile, tablet, desktop)

### US-02: View Flat Photo
As a prospective tenant, I want to see a photo of each flat so that I can visually assess the property.

**Acceptance criteria:**
- Every flat card displays an image
- Images load from the API (not static files)
- Images are fetched from the backend as base64 data URLs
- Broken images show a clear fallback state

### US-03: See Flat Details at a Glance
As a prospective tenant, I want to see the price and location for each flat without clicking so that I can filter mentally as I browse.

**Acceptance criteria:**
- Price is displayed in GBP format (e.g., "£1,800/month")
- Location is displayed clearly below the title
- Text is legible on all screen sizes

### US-04: Handle Loading State
As a user, I want to see a loading indicator while flats are being fetched so that I know the application is working.

**Acceptance criteria:**
- A loading spinner or skeleton is shown while the API call is in progress
- Loading state disappears once data is received

### US-05: Handle Error State
As a user, if the API is unavailable, I want to see a clear error message rather than a broken page.

**Acceptance criteria:**
- An error message is displayed if the API call fails
- The error message is human-readable

---

## 3. Data Model

### SQLite Database: `flats.db`

Location: `server/flats.db`

#### Table: `flats`

```sql
CREATE TABLE flats (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  title    TEXT    NOT NULL,
  price    INTEGER NOT NULL,
  location TEXT    NOT NULL,
  image    BLOB    NOT NULL
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique flat identifier |
| `title` | TEXT | NOT NULL | Flat listing title |
| `price` | INTEGER | NOT NULL, > 0 | Monthly rent in GBP |
| `location` | TEXT | NOT NULL | Neighbourhood and city string |
| `image` | BLOB | NOT NULL | Raw binary image data (JPEG or PNG) |

#### Seed Data Requirements

- Minimum 6, maximum 10 flat records
- All fields populated with realistic London data
- Images must be real JPEG or PNG files (not placeholder text or empty data)
- Prices must be in realistic London rental range: £1,200–£4,500/month

---

## 4. Architecture

### System Diagram

```
Browser (React/Vite)
       |
       | HTTP GET /api/flats
       v
Backend (Node.js / Express)
       |
       | SQL SELECT
       v
  SQLite (flats.db)
  [image stored as BLOB]
       |
       | raw bytes
       v
Backend converts BLOB -> base64 data URL
       |
       | JSON response with image as data URL
       v
Browser renders <img src="data:image/jpeg;base64,...">
```

### Components

| Component | Technology | Location |
|-----------|------------|----------|
| Backend API | Node.js + Express | `server/` |
| Database | SQLite | `server/flats.db` |
| Frontend | React + Vite | `src/` |
| Tests | Node.js (test runner) | `tests/` |

---

## 5. Directory Structure

```
project-root/
├── docs/
│   ├── api.md
│   └── requirements.md
├── server/
│   ├── index.js              # Express app entry point
│   ├── db/
│   │   └── init.js           # DB init and seed script
│   ├── routes/
│   │   └── flats.js          # /api/flats route handlers
│   ├── flats.db              # SQLite database (generated)
│   ├── package.json
│   └── README.md
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component
│   ├── components/
│   │   ├── FlatCard.jsx      # Single flat card component
│   │   └── FlatGallery.jsx   # Grid of FlatCard components
│   ├── services/
│   │   └── api.js            # API client (fetch wrapper)
│   ├── package.json
│   └── README.md
└── tests/
    ├── TEST_PLAN.md
    ├── backend/
    │   ├── test-api.js       # API integration tests
    │   └── test-db-blobs.js  # BLOB storage tests
    ├── frontend/
    │   └── test-image-rendering.js
    ├── e2e/
    │   └── test-blob-flow.js # End-to-end BLOB flow test
    ├── MANUAL_TESTS.md
    ├── FINAL_REPORT.md
    └── package.json
```

---

## 6. Frontend UI Requirements

### FlatCard Component

Each flat card must display:
- Flat photo (full width within the card, `<img src={flat.image}>`)
- Flat title (heading level, prominent)
- Price formatted as `£{price}/month`
- Location string

Card requirements:
- Consistent height within the grid
- Image takes up the top portion of the card (aspect ratio maintained)
- Clean typography with sufficient contrast
- Subtle hover effect (shadow or border change)

### FlatGallery Component

- Responsive CSS grid layout
- 1 column on mobile (< 640px)
- 2 columns on tablet (640px - 1024px)
- 3 columns on desktop (> 1024px)
- Gap between cards: 16px minimum
- Maximum page width: 1200px, centred

### Loading State

- Show a spinner or "Loading flats..." text while fetching
- Do not show empty grid during loading

### Error State

- Show a clear error message if the API fetch fails
- Example: "Unable to load flat listings. Please try again later."

### Image Rendering

- Images must be rendered using the `image` field directly as the `src` attribute
- No URL manipulation or external CDN — the data URL from the API is used directly
- Alt text: the flat's `title` value

---

## 7. Non-Functional Requirements

### Performance
- `GET /api/flats` must respond within 2 seconds under normal conditions
- Frontend initial load must complete within 5 seconds on a standard connection

### Accessibility
- All images must have meaningful `alt` text
- Color contrast must meet WCAG AA minimum (4.5:1 for text)
- Keyboard navigation must be possible through the gallery

### Browser Support
- Latest Chrome, Firefox, Safari, Edge

### CORS
- Backend must allow requests from `http://localhost:5173` (Vite default dev server)
- Use `Access-Control-Allow-Origin: *` for simplicity

---

## 8. Test Requirements

### Backend Tests (by @qa)

| Test ID | Description | Pass Condition |
|---------|-------------|----------------|
| BT-01 | GET /api/flats returns 200 | HTTP status 200 |
| BT-02 | GET /api/flats returns array | Response is JSON array |
| BT-03 | Array has >= 6 items | `.length >= 6` |
| BT-04 | Each flat has required fields | All of: id, title, price, location, image |
| BT-05 | Image is valid base64 data URL | Starts with `data:image/` |
| BT-06 | GET /api/flats/1 returns 200 | HTTP status 200 |
| BT-07 | GET /api/flats/99999 returns 404 | HTTP status 404 |
| BT-08 | 404 response has error field | `{"error": "Flat not found"}` |
| BT-09 | CORS header present | `Access-Control-Allow-Origin: *` |
| BT-10 | GET /health returns ok | `{"status": "ok"}` |
| BT-11 | BLOB stored correctly in DB | Raw bytes in DB are valid image data |
| BT-12 | Base64 decodes to valid image | Decoded bytes match original image |

### End-to-End Test (Critical Path)

| Test ID | Description | Pass Condition |
|---------|-------------|----------------|
| E2E-01 | BLOB flow: DB -> API -> UI | Image inserted as BLOB, served as base64, rendered in UI |

---

## 9. Out of Scope (v1.0)

The following features are explicitly NOT part of this version:

- User authentication or login
- Creating, updating, or deleting flat listings (read-only API)
- Search or filtering functionality
- Pagination
- Map integration
- Contact forms or enquiry submission
- Real-time updates

---

## 10. Definition of Done

The project is considered complete when:

1. `docs/api.md` and `docs/requirements.md` are approved by @dev-front and @qa
2. Backend passes all Spec Checker criteria (see `docs/api.md` section 10)
3. All backend tests BT-01 through BT-12 pass
4. End-to-end test E2E-01 passes
5. Frontend renders all flats from the live API
6. Frontend images display correctly using base64 data URLs
7. UI is responsive on mobile, tablet, and desktop
8. All documentation files are present (`server/README.md`, `src/README.md`, `tests/TEST_PLAN.md`, `tests/FINAL_REPORT.md`)
