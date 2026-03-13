# London Rentals — Built by a Claude Code Agent Swarm in 26 Minutes

![London Rentals screenshot](screenshots/screenshot01.png)

> **Built in 26 minutes. Zero manual coding.** A 4-agent Claude Code swarm was handed a product brief and autonomously shipped a working full-stack app — specs, backend, frontend, tests, and a conformity audit included.

---

## The Agent Team

| Agent | Model | Role |
|-------|-------|------|
| `@pm` | Claude Sonnet | Product Manager & Orchestrator |
| `@dev-back` | Claude Opus | Backend Developer |
| `@dev-front` | Claude Sonnet | Frontend Developer |
| `@qa` | Claude Sonnet | QA Engineer |

The `@pm` agent wrote the technical spec first, then assigned tasks to the other three agents in parallel. It blocked the frontend from starting until the backend passed a spec conformity audit, and only signed off after `@qa` confirmed all 57 tests passed.

---

## The App

A **London flat rental marketplace** — browse listings with photos, prices, and locations.

### Backend — Node.js + Express + SQLite

- REST API on **port 3000**
- Flat images stored as **binary BLOBs** in SQLite (`flats.db`)
- BLOBs served as **base64 data URIs** over JSON — no file system, no CDN
- Endpoints: `GET /api/flats` · `GET /api/flats/:id` · `GET /health`

### Frontend — React + Vite

- Responsive gallery grid (1 / 2 / 3 columns)
- Fetches listings and decodes BLOB images directly from the API response
- Loading and error states handled

---

## Run it locally

**Terminal 1 — Backend:**
```bash
cd server
npm install
node db/init.js   # seed the database
npm start         # → http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd src
npm install
npm run dev       # → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

> If port 3000 is already in use: `kill $(lsof -t -i:3000) && npm start`

---

## Results

| Metric | Result |
|--------|--------|
| Time to working app | 26 minutes |
| Automated tests | 57 / 57 passing |
| Spec conformity audit | All checks passed |
| Manual code written | 0 lines |

---

## How it works

The swarm runs inside [Claude Code](https://claude.ai/code) using the **Agent Teams** feature with `tmux` to spawn parallel agent sessions. The `@pm` agent orchestrates the workflow via `SendMessage` and `TaskCreate`, coordinates reviews between agents, and triggers a `@spec-checker` subagent to audit the backend before allowing the frontend to proceed.
