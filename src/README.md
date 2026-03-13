# London Rentals UI

React/Vite frontend for the London Rentals flat listing gallery.

## Setup

```bash
cd src
npm install
```

## Running the dev server

```bash
npm run dev
```

The app will be available at http://localhost:5173.

The backend API must be running at http://localhost:3000 before starting the frontend.

## Building for production

```bash
npm run build
npm run preview
```

## Environment

The API base URL is hardcoded to `http://localhost:3000/api` in `src/services/api.js`. Update this value if the backend runs on a different host or port.

## Project structure

```
src/
├── main.jsx                  # React entry point
├── App.jsx                   # Root component with header layout
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration with API proxy
├── package.json
├── components/
│   ├── FlatCard.jsx          # Single flat card (image, title, price, location)
│   └── FlatGallery.jsx       # Responsive grid, fetches and renders all flats
├── services/
│   └── api.js                # fetch wrappers for GET /api/flats and GET /api/flats/:id
└── styles/
    └── App.css               # All styles (responsive grid, card, states)
```

## Notes

- Images are rendered directly from base64 data URLs returned by the API (`data:image/jpeg;base64,...`)
- No image processing or external CDN is used
- Broken images show an "Image unavailable" fallback
- Error state displays: "Unable to load flat listings. Please try again later."
