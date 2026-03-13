# London Rentals - QA Test Plan

Version: 1.0.0
Date: 2026-03-13

---

## 1. Test Scope

This plan covers all quality verification for the London Rentals marketplace application. The primary critical path is the BLOB image flow: SQLite BLOB storage -> backend base64 conversion -> API JSON transport -> frontend rendering.

### In Scope

- Backend REST API (all endpoints)
- SQLite BLOB storage integrity
- Base64 encoding correctness
- Frontend image rendering via data URLs
- End-to-end BLOB flow (DB -> API -> UI)
- CORS header presence
- Error handling (404, 500)
- UI responsiveness and loading/error states

### Out of Scope

- Authentication (none required)
- Write operations (read-only API)
- Search, filtering, pagination
- Performance load testing beyond basic response time check

---

## 2. Test Types

| Type | Location | When to Run |
|------|----------|-------------|
| Unit (BLOB/base64 logic) | `tests/backend/test-db-blobs.js` | After DB is seeded |
| API Integration | `tests/backend/test-api.js` | After backend is running |
| Frontend Image Rendering | `tests/frontend/test-image-rendering.js` | After frontend is running |
| End-to-End BLOB Flow | `tests/e2e/test-blob-flow.js` | After both services are running |
| Manual | `tests/MANUAL_TESTS.md` | Final verification pass |

---

## 3. Critical Path: BLOB Image Flow

This is the most important test sequence. It must pass before the project can be considered done.

```
[1] SQLite flats table: image column contains raw binary (BLOB) data
        |
        v
[2] Backend reads BLOB bytes from SQLite via better-sqlite3
        |
        v
[3] Backend encodes bytes to base64 string
        |
        v
[4] Backend constructs data URL: data:image/jpeg;base64,{base64}
        |
        v
[5] API returns JSON with image field = data URL
        |
        v
[6] Frontend receives JSON, sets <img src={flat.image}>
        |
        v
[7] Browser decodes data URL and renders image
```

All 7 steps must be verified. Steps 1-5 are covered by BT-11, BT-12, and BT-01 through BT-10. Steps 5-7 are covered by E2E-01.

---

## 4. Test Cases

### 4.1 Backend API Tests (test-api.js)

| Test ID | Description | Method | URL | Expected |
|---------|-------------|--------|-----|----------|
| BT-01 | GET /api/flats returns 200 | GET | /api/flats | HTTP 200 |
| BT-02 | GET /api/flats returns JSON array | GET | /api/flats | Array |
| BT-03 | Array has at least 6 items | GET | /api/flats | length >= 6 |
| BT-04 | Each flat has all required fields | GET | /api/flats | id, title, price, location, image |
| BT-05 | Image is valid base64 data URL | GET | /api/flats | starts with data:image/ |
| BT-06 | GET /api/flats/1 returns 200 | GET | /api/flats/1 | HTTP 200, single object |
| BT-07 | GET /api/flats/99999 returns 404 | GET | /api/flats/99999 | HTTP 404 |
| BT-08 | 404 body has correct error field | GET | /api/flats/99999 | {"error": "Flat not found"} |
| BT-09 | CORS header present on all endpoints | GET | /api/flats | Access-Control-Allow-Origin: * |
| BT-10 | GET /health returns ok | GET | /health | {"status": "ok"} |

### 4.2 Database BLOB Tests (test-db-blobs.js)

| Test ID | Description | Pass Condition |
|---------|-------------|----------------|
| BT-11 | BLOB stored correctly in DB | Raw bytes in image column are valid image data (JPEG or PNG magic bytes) |
| BT-12 | Base64 decodes to valid image | API base64 data decodes to same binary as DB BLOB |

### 4.3 End-to-End BLOB Flow Test (test-blob-flow.js)

| Test ID | Description | Pass Condition |
|---------|-------------|----------------|
| E2E-01 | Full BLOB flow: DB -> API -> UI | BLOB in DB matches decoded base64 from API; data URL is valid for img src |

### 4.4 Frontend Image Rendering Tests (test-image-rendering.js)

| Test ID | Description | Pass Condition |
|---------|-------------|----------------|
| FT-01 | Base64 data URL is accepted as img src | No error when data URL assigned to img src |
| FT-02 | Broken image triggers fallback | onError handler is called for invalid src |
| FT-03 | FlatCard renders all fields | title, price (GBP format), location, image all present in DOM |
| FT-04 | FlatGallery renders multiple cards | At least 6 FlatCard elements rendered |

---

## 5. Test Data

### Image Validation Signatures

| Format | Magic Bytes (hex) | Base64 Prefix |
|--------|-------------------|---------------|
| JPEG | FF D8 FF | /9j/ |
| PNG | 89 50 4E 47 0D 0A 1A 0A | iVBORw |

When validating BT-11 and BT-12, check that decoded bytes start with one of these signatures.

### Expected Flat Record Structure

```json
{
  "id": 1,
  "title": "<non-empty string>",
  "price": 1800,
  "location": "<Neighbourhood>, London",
  "image": "data:image/jpeg;base64,<base64string>"
}
```

Constraints:
- `price`: integer, range 1200-4500
- `location`: contains ", London"
- `image`: starts with `data:image/`, contains `base64,`, base64 portion decodes to >= 1KB

---

## 6. Success Criteria

The project is complete when ALL of the following are satisfied:

- [ ] BT-01 through BT-10: All API integration tests pass
- [ ] BT-11: DB BLOB data contains valid image binary
- [ ] BT-12: API base64 decodes to same image binary as DB BLOB
- [ ] E2E-01: Full BLOB flow verified end-to-end
- [ ] FT-01 through FT-04: Frontend rendering tests pass
- [ ] Manual checklist completed with no blocking issues
- [ ] Zero critical or high severity open bugs

---

## 7. Environment Requirements

- Node.js >= 18 (for built-in fetch support)
- `better-sqlite3` npm package (for direct DB access in tests)
- Backend running at `http://localhost:3000`
- Frontend running at `http://localhost:5173`
- `server/flats.db` accessible at known path

---

## 8. Bug Severity Levels

| Severity | Definition | Example |
|----------|------------|---------|
| Critical | BLOB flow broken; core feature non-functional | image field is null or not base64 |
| High | Major API contract violation | Missing required field, wrong HTTP status |
| Medium | UI/UX issue affecting usability | Broken responsive layout |
| Low | Minor cosmetic issue | Spacing inconsistency |

Only Critical and High bugs block release.

---

## 9. Test Execution Order

1. Backend starts (`node server/index.js`)
2. Run `tests/backend/test-db-blobs.js` (BT-11, BT-12 - direct DB access)
3. Run `tests/backend/test-api.js` (BT-01 through BT-10)
4. Frontend starts (`npm run dev` in `src/`)
5. Run `tests/frontend/test-image-rendering.js` (FT-01 through FT-04)
6. Run `tests/e2e/test-blob-flow.js` (E2E-01)
7. Complete `tests/MANUAL_TESTS.md` checklist
8. Write `tests/FINAL_REPORT.md`
