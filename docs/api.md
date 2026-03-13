# London Rentals API Specification

Version: 1.0.0
Base URL: `http://localhost:3000`

---

## Overview

The London Rentals API is a REST API that serves flat listing data including images stored as BLOBs in SQLite. Images are returned as base64-encoded data URLs suitable for direct use in `<img src>` attributes.

---

## Authentication

No authentication required for this version. All endpoints are publicly accessible.

---

## Endpoints

### GET /api/flats

Returns a list of all flat listings with their images encoded as base64.

**Request**

```
GET /api/flats
```

No query parameters, no request body.

**Response: 200 OK**

```json
[
  {
    "id": 1,
    "title": "Bright Studio in Shoreditch",
    "price": 1800,
    "location": "Shoreditch, London",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
  },
  {
    "id": 2,
    "title": "Modern 1-Bed in Canary Wharf",
    "price": 2200,
    "location": "Canary Wharf, London",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
  }
]
```

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique flat identifier |
| `title` | string | Flat listing title |
| `price` | integer | Monthly rent in GBP |
| `location` | string | Neighbourhood and city |
| `image` | string | Base64 data URL: `data:image/{mime};base64,{data}` |

**Acceptance Criteria**

- Returns HTTP 200 with a JSON array
- Array contains at least 6 flat objects
- Every flat object includes all 5 fields: `id`, `title`, `price`, `location`, `image`
- `image` field is a valid base64 data URL beginning with `data:image/`
- `price` is a positive integer
- Response `Content-Type` header is `application/json`
- CORS header `Access-Control-Allow-Origin: *` is present

**Error Responses**

| Status | Body | Condition |
|--------|------|-----------|
| 500 | `{"error": "Internal server error"}` | Database unavailable or unexpected failure |

---

### GET /api/flats/:id

Returns a single flat listing by its ID.

**Request**

```
GET /api/flats/:id
```

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | The flat's unique identifier |

**Response: 200 OK**

```json
{
  "id": 1,
  "title": "Bright Studio in Shoreditch",
  "price": 1800,
  "location": "Shoreditch, London",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
}
```

**Acceptance Criteria**

- Returns HTTP 200 with a single flat JSON object when the ID exists
- Returns HTTP 404 when the ID does not exist
- `image` field is a valid base64 data URL beginning with `data:image/`
- Response `Content-Type` header is `application/json`
- CORS header `Access-Control-Allow-Origin: *` is present

**Error Responses**

| Status | Body | Condition |
|--------|------|-----------|
| 404 | `{"error": "Flat not found"}` | No flat with the given ID exists |
| 500 | `{"error": "Internal server error"}` | Database unavailable or unexpected failure |

---

### GET /health

Health check endpoint to verify the server is running.

**Request**

```
GET /health
```

**Response: 200 OK**

```json
{
  "status": "ok"
}
```

**Acceptance Criteria**

- Returns HTTP 200 with `{"status": "ok"}`
- Does not require database access

---

## BLOB Image Handling

### Storage

Images are stored in the SQLite `flats` table as a `BLOB` column named `image`. The raw binary image data (JPEG or PNG) is inserted directly.

### Transport

When returning image data via the API, the backend MUST:

1. Read the raw BLOB bytes from SQLite
2. Convert to base64 string using the runtime's built-in base64 encoder
3. Detect or assume the MIME type (default: `image/jpeg`)
4. Construct the data URL: `data:{mime};base64,{base64string}`
5. Return this string as the `image` field value

**Example (Node.js)**

```javascript
const base64 = Buffer.from(row.image).toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64}`;
```

**Example (Python)**

```python
import base64
data_url = f"data:image/jpeg;base64,{base64.b64encode(row['image']).decode()}"
```

### Validation Rules

- The `image` field must NOT be null or empty
- The `image` field must start with `data:image/`
- The base64 portion must be valid (decodable without error)

---

## CORS Policy

All responses must include:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

OPTIONS preflight requests must return HTTP 200.

---

## Error Response Format

All error responses use the same JSON structure:

```json
{
  "error": "Human-readable error message"
}
```

---

## Mock Data Requirements

The backend must seed the database with 6 to 10 London flat listings. Each listing must have:

- A descriptive title referencing a real London neighbourhood
- A realistic monthly rent in GBP (range: 1200 to 4500)
- A location string in the format `{Neighbourhood}, London`
- A real JPEG or PNG image stored as a BLOB (minimum 1KB, real image data — not a placeholder)

Suggested neighbourhoods: Shoreditch, Canary Wharf, Notting Hill, Brixton, Camden, Greenwich, Islington, Hackney, Chelsea, Fulham.

---

## Technology Stack (Backend)

- **Runtime**: Node.js (preferred) or Python
- **Database**: SQLite via `better-sqlite3` (Node) or `sqlite3` (Python)
- **Framework**: Express.js (Node) or Flask/FastAPI (Python)
- **Port**: 3000

---

## Spec Checker Criteria Summary

The following are the exact checks that `@spec-checker` will verify:

1. Server starts and responds on port 3000
2. `GET /api/flats` returns HTTP 200
3. `GET /api/flats` returns a JSON array
4. Array has at least 6 items
5. Each item has fields: `id` (integer), `title` (string), `price` (integer), `location` (string), `image` (string)
6. Each `image` starts with `data:image/`
7. `GET /api/flats/1` returns HTTP 200 with a single object
8. `GET /api/flats/99999` returns HTTP 404 with `{"error": "Flat not found"}`
9. `GET /health` returns `{"status": "ok"}`
10. All endpoints include `Access-Control-Allow-Origin: *` header
