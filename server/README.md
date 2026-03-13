# London Rentals API Server

REST API serving London flat rental listings with images stored as BLOBs in SQLite.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
cd server
npm install
```

## Initialize Database

Seeds the SQLite database with 8 London flat listings, each with a generated PNG image stored as a BLOB.

```bash
npm run init-db
```

This creates `flats.db` in the server directory.

## Run the Server

```bash
npm start
```

The server starts on **http://localhost:3000**.

## API Endpoints

### GET /health

Health check. Returns `{"status": "ok"}`.

### GET /api/flats

Returns all flats as a JSON array. Each flat includes a base64-encoded PNG data URL in the `image` field.

```bash
curl http://localhost:3000/api/flats
```

### GET /api/flats/:id

Returns a single flat by ID. Returns 404 with `{"error": "Flat not found"}` if the ID does not exist.

```bash
curl http://localhost:3000/api/flats/1
curl http://localhost:3000/api/flats/99999  # 404
```

## Response Format

```json
{
  "id": 1,
  "title": "Bright Studio in Shoreditch",
  "price": 1800,
  "location": "Shoreditch, London",
  "image": "data:image/png;base64,iVBORw0KGgo..."
}
```

## CORS

All responses include `Access-Control-Allow-Origin: *`.

## Technology Stack

- Express.js 4.x
- better-sqlite3
- cors middleware
- Port: 3000
