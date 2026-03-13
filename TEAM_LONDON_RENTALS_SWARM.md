# 🏙️ London Rentals Swarm - Agent Team

## Overview

The **london-rentals-swarm** is an agent team designed to collaboratively build a London flat rental marketplace. The team consists of 4 specialized agents working together to deliver a full-stack application with SQLite BLOB image storage.

## Team Members

| Agent | Role | Model | Responsibilities |
|-------|------|-------|------------------|
| **@pm** | Product Manager & Orchestrator | Sonnet | Write specs, coordinate team, run conformity audits |
| **@dev-back** | Backend Developer | Opus | Build REST API with SQLite BLOB storage |
| **@dev-front** | Frontend Developer | Sonnet | Create React/Vite gallery UI |
| **@qa** | QA Engineer | Sonnet | Write integration tests, verify BLOB flow |

## Project Goal

Build a functional London flat rental marketplace featuring:
- **Title, Price, Location, Picture** for each flat
- **Images stored as BLOBs** in SQLite database
- **REST API** serving flats with base64-encoded images
- **React/Vite UI** displaying gallery
- **End-to-end integration tests** verifying DB → API → UI flow

## How to Launch the Team

The Agent Teams framework uses tmux to spawn separate sessions for each agent.

### Prerequisites

1. Ensure `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `.claude/settings.json` ✅ (already configured)
2. Ensure `teammateMode` is set to `"tmux"` ✅ (already configured)
3. Have tmux installed: `sudo apt-get install tmux` (on WSL/Linux)

### Launch Command

From the project root, start the team:

```bash
claude --team london-rentals-swarm
```

This will spawn 4 tmux sessions:
- `claude-pm` - Product Manager
- `claude-dev-back` - Backend Developer
- `claude-dev-front` - Frontend Developer
- `claude-qa` - QA Engineer

### Navigate Between Agents

```bash
# List all sessions
tmux ls

# Attach to specific agent
tmux attach -t claude-pm
tmux attach -t claude-dev-back
tmux attach -t claude-dev-front
tmux attach -t claude-qa

# Detach from session (to switch to another)
# Press: Ctrl+B, then D
```

## Team Workflow

### Phase 1: Planning & Spec Review

1. **@pm** writes specifications:
   - `docs/api.md` - API endpoints, payloads, BLOB handling
   - `docs/requirements.md` - Product requirements, data model, acceptance criteria

2. **@pm** creates shared task backlog using `TaskCreate`

3. **@pm** sends specs to @dev-front and @qa for review via `SendMessage`

4. **@dev-front** and **@qa** review and approve specs

5. **@pm** signals @dev-back to begin implementation

### Phase 2: Backend Development

6. **@dev-back** implements:
   - SQLite database with `flats` table (BLOB column for images)
   - REST API (Node.js or Python)
   - Mock data with 6-10 London flats

7. **@dev-back** notifies @pm when complete

### Phase 3: Conformity Audit (Critical Gate)

8. **@pm** invokes `@spec-checker` subagent to audit backend

9. **@pm** reviews conformity report:
   - If **failures** exist: @pm messages @dev-back to fix
   - If **PASSED**: @pm approves @dev-front to proceed

### Phase 4: Frontend Development

10. **@dev-front** implements:
    - React/Vite gallery UI
    - API integration
    - Image rendering (base64 data URLs)
    - Responsive design

### Phase 5: QA & Integration Testing

11. **@qa** runs tests:
    - Backend API integration tests
    - Frontend UI tests
    - **End-to-end BLOB flow test** (DB → API → UI)

12. **@qa** reports bugs to @dev-back or @dev-front

13. **Developers** fix bugs, @qa re-tests

### Phase 6: Delivery

14. **All agents** produce final reports

15. **@pm** generates project summary

## Initial Task Backlog

When initializing, @pm should create these tasks:

### @pm Tasks
- [ ] Write `docs/api.md` specification
- [ ] Write `docs/requirements.md`
- [ ] Create shared task backlog
- [ ] Send specs to @dev-front and @qa for approval
- [ ] Wait for spec approval
- [ ] Signal @dev-back to start implementation
- [ ] Monitor backend progress
- [ ] Run @spec-checker conformity audit when backend complete
- [ ] Review audit results and coordinate fixes if needed
- [ ] Approve @dev-front to proceed after backend passes
- [ ] Monitor frontend and QA progress
- [ ] Generate final project report

### @dev-back Tasks
- [ ] Review and approve @pm specifications
- [ ] Set up project structure (`server/` directory)
- [ ] Initialize SQLite database with `flats` table
- [ ] Implement BLOB storage for images
- [ ] Create mock data (6-10 London flats with images)
- [ ] Implement GET /api/flats endpoint
- [ ] Implement GET /api/flats/:id endpoint
- [ ] Implement BLOB → base64 conversion for JSON transport
- [ ] Configure CORS for frontend access
- [ ] Add error handling (404, 500)
- [ ] Test endpoints with curl/Postman
- [ ] Write `server/README.md` documentation
- [ ] Notify @pm when complete
- [ ] Fix any issues found by @spec-checker
- [ ] Re-notify @pm after fixes

### @dev-front Tasks
- [ ] Review and approve @pm specifications
- [ ] Wait for @pm to approve backend (after spec-checker passes)
- [ ] Set up Vite + React project (`src/` directory)
- [ ] Create API client (`src/services/api.js`)
- [ ] Implement FlatCard component
- [ ] Implement FlatGallery component
- [ ] Implement responsive grid layout
- [ ] Test base64 image rendering
- [ ] Add loading and error states
- [ ] Style UI (modern, clean design)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Write `src/README.md` documentation
- [ ] Coordinate with @qa for integration testing
- [ ] Fix bugs reported by @qa
- [ ] Notify @pm and @qa when complete

### @qa Tasks
- [ ] Review and approve @pm specifications
- [ ] Write `tests/TEST_PLAN.md`
- [ ] Set up test infrastructure
- [ ] Write backend API integration tests
- [ ] Write database BLOB storage tests
- [ ] Write frontend image rendering tests
- [ ] Write end-to-end BLOB flow test (critical path)
- [ ] Create manual testing checklist
- [ ] Run tests when backend is complete
- [ ] Report bugs to @dev-back
- [ ] Re-test after backend fixes
- [ ] Run tests when frontend is complete
- [ ] Report bugs to @dev-front
- [ ] Re-test after frontend fixes
- [ ] Run full integration test suite
- [ ] Generate `tests/FINAL_REPORT.md`
- [ ] Notify @pm of final test results

## Communication Protocol

Agents use `SendMessage` to communicate:

```javascript
// Example: @pm to @dev-front
SendMessage({
  to: "dev-front",
  subject: "Backend approved - ready to start frontend",
  message: "The @spec-checker audit passed! Backend API is ready at http://localhost:3000. You can now begin frontend development."
});

// Example: @qa to @dev-back
SendMessage({
  to: "dev-back",
  subject: "[BUG] Base64 encoding issue in /api/flats",
  message: "Base64 strings are missing padding. See tests/backend/test-api.js:45. Severity: High."
});
```

## Success Criteria

The project is complete when:

1. ✅ All specs approved by @dev-front and @qa
2. ✅ Backend passes @spec-checker conformity audit
3. ✅ All @qa integration tests pass
4. ✅ BLOB flow verified end-to-end (DB → API → UI)
5. ✅ Images render correctly in frontend
6. ✅ All bugs resolved
7. ✅ Documentation complete
8. ✅ Final reports generated

## Critical Path: BLOB Image Flow

The most important aspect of this project is the **Image as BLOB** workflow:

```
┌─────────────┐
│   SQLite    │  Image stored as BLOB (binary data)
│  flats.db   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Backend    │  Read BLOB, convert to base64
│  REST API   │  Format: data:image/jpeg;base64,/9j/4AAQ...
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Frontend   │  Receive base64 data URL
│  React UI   │  Render in <img src={flat.image} />
└─────────────┘
```

**This flow MUST be verified by @qa before project completion.**

## Directory Structure

Expected final structure:

```
london-rentals-swarm/
├── .claude/
│   ├── agents/
│   │   ├── pm.md
│   │   ├── dev-back.md
│   │   ├── dev-front.md
│   │   ├── qa.md
│   │   └── spec-checker.md
│   └── settings.json
├── docs/
│   ├── api.md (written by @pm)
│   └── requirements.md (written by @pm)
├── server/
│   ├── index.js (or app.py)
│   ├── db/
│   │   └── init.js
│   ├── routes/
│   │   └── flats.js
│   ├── flats.db (SQLite database)
│   ├── package.json
│   └── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── FlatCard.jsx
│   │   └── FlatGallery.jsx
│   ├── services/
│   │   └── api.js
│   ├── package.json
│   └── README.md
├── tests/
│   ├── TEST_PLAN.md
│   ├── backend/
│   │   ├── test-api.js
│   │   └── test-db-blobs.js
│   ├── frontend/
│   │   └── test-image-rendering.js
│   ├── e2e/
│   │   └── test-blob-flow.js
│   ├── MANUAL_TESTS.md
│   ├── FINAL_REPORT.md
│   └── package.json
└── TEAM_LONDON_RENTALS_SWARM.md (this file)
```

## Troubleshooting

### Agents not starting

```bash
# Check if tmux is installed
which tmux

# Check if settings are correct
cat .claude/settings.json

# Manually start tmux session
tmux new -s test-session
```

### Communication issues

- Ensure all agents use `SendMessage` tool
- Check tmux session names match agent names
- Verify all agents are running (`tmux ls`)

### Conformity audit failing

- @dev-back should review `docs/api.md` carefully
- Run @spec-checker manually to see specific failures
- Fix issues one by one, then re-run audit

## Next Steps

**@pm, you should now:**

1. Launch the team (if not already launched)
2. Start writing `docs/api.md` and `docs/requirements.md`
3. Use `TaskCreate` to populate the shared backlog with tasks listed above
4. Use `SendMessage` to notify @dev-front and @qa that specs are ready for review

**Command to start:**

```bash
# In your terminal (outside tmux)
claude --team london-rentals-swarm

# Or if already in Claude Code
/team london-rentals-swarm
```

---

**Good luck, team! Let's build an amazing London rentals marketplace! 🏠🇬🇧**
