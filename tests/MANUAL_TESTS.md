# London Rentals - Manual Test Checklist

Version: 1.0.0

---

## Prerequisites

Before running manual tests, ensure:
- [ ] Backend running: `cd server && node index.js` (port 3000)
- [ ] Frontend running: `cd src && npm run dev` (port 5173)
- [ ] Browser DevTools open (F12) throughout testing

---

## Backend Manual Tests

### Server Startup
- [ ] `cd server && node index.js` starts without errors
- [ ] Console shows server listening on port 3000
- [ ] No unhandled exception or crash on startup

### API Verification (curl or browser)
- [ ] `http://localhost:3000/health` returns `{"status":"ok"}`
- [ ] `http://localhost:3000/api/flats` returns JSON array of >= 6 flats
- [ ] Each flat in `/api/flats` has: id, title, price, location, image
- [ ] `image` field starts with `data:image/` (visible in raw JSON)
- [ ] `http://localhost:3000/api/flats/1` returns single flat object
- [ ] `http://localhost:3000/api/flats/99999` returns 404 with `{"error":"Flat not found"}`

### BLOB Verification
- [ ] Open `server/flats.db` in DB Browser for SQLite
- [ ] Confirm `image` column type is BLOB
- [ ] Select a row and export the BLOB - open in image viewer to confirm it's a real image
- [ ] Compare the image shown in the browser UI to the exported BLOB - they should match

### Base64 Spot Check
- [ ] Copy the `image` value from `GET /api/flats/1`
- [ ] Remove the `data:image/jpeg;base64,` prefix
- [ ] Paste the remaining base64 string into an online base64 decoder
- [ ] Confirm it decodes to a valid JPEG/PNG image

### CORS Verification
- [ ] In DevTools, open Console and run:
  ```javascript
  fetch('http://localhost:3000/api/flats').then(r => r.headers.get('access-control-allow-origin'))
  ```
- [ ] Confirm result is `"*"`
- [ ] No CORS errors when fetching from `http://localhost:5173`

---

## Frontend Manual Tests

### Gallery Loads
- [ ] Open `http://localhost:5173` in browser
- [ ] Gallery loads automatically without manual refresh
- [ ] At least 6 flat cards are displayed
- [ ] No broken image icons visible

### Image Rendering
- [ ] All flat card images load and render correctly
- [ ] Images are not distorted or stretched
- [ ] Images come from base64 data URLs (verify in DevTools Network tab - no external image requests)

### Flat Card Content
- [ ] Each card shows a flat photo
- [ ] Each card shows a title
- [ ] Each card shows price in format `£X,XXX/month`
- [ ] Each card shows location (e.g., "Shoreditch, London")

### Loading State
- [ ] Throttle network to "Slow 3G" in DevTools
- [ ] Reload page
- [ ] Confirm loading spinner or "Loading flats..." text appears
- [ ] Confirm loading state disappears once data arrives
- [ ] Restore normal network speed

### Error State
- [ ] Stop the backend server
- [ ] Reload the frontend
- [ ] Confirm error message appears (e.g., "Unable to load flat listings...")
- [ ] Error message is human-readable and not a raw error object
- [ ] Restart the backend and reload - gallery recovers

### Responsive Design
- [ ] Open DevTools device toolbar
- [ ] **Mobile (375px width)**: 1 column layout, cards stack vertically
- [ ] **Tablet (768px width)**: 2 column layout
- [ ] **Desktop (1280px width)**: 3 column layout
- [ ] Text is legible at all sizes
- [ ] No horizontal scroll at any breakpoint

### Accessibility
- [ ] All `<img>` elements have non-empty `alt` text matching the flat title
- [ ] Tab through the page with keyboard - can reach all interactive elements
- [ ] Check colour contrast in DevTools Accessibility panel (WCAG AA: 4.5:1 minimum)

### Cross-Browser Testing
- [ ] Chrome: gallery renders correctly with all images
- [ ] Firefox: gallery renders correctly with all images
- [ ] Edge: gallery renders correctly with all images
- [ ] Safari (if available): gallery renders correctly with all images

---

## Integration Tests

### Full Stack Integration
- [ ] Stop and restart both servers (backend + frontend)
- [ ] Gallery still loads all flats correctly after restart
- [ ] Check browser console for zero errors during normal operation
- [ ] Check browser console for zero warnings about CORS

### Performance Check
- [ ] Open DevTools Network tab
- [ ] Reload the page
- [ ] `GET /api/flats` completes in under 2 seconds
- [ ] Full page load completes in under 5 seconds (check DOMContentLoaded)

---

## Sign-Off

| Test Area | Status | Notes |
|-----------|--------|-------|
| Backend API | | |
| BLOB Storage | | |
| Base64 Encoding | | |
| CORS Headers | | |
| Frontend Gallery | | |
| Image Rendering | | |
| Loading State | | |
| Error State | | |
| Responsive Design | | |
| Cross-Browser | | |
| Accessibility | | |
| Performance | | |

**Tester**: QA Engineer
**Date**: ___________
**Overall Result**: PASS / FAIL
