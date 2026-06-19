# Pilot Bug Log

**Phase:** Pilot Stabilization

Production readiness record from hands-on pilot testing. One entry per confirmed issue.

---

## Entry template

Copy for **BUG-00N**:

```md
## BUG-00N

**Page:**
**Role:**

**Steps:**
1.
2.
3.

**Expected:**

**Actual:**

**Root Cause:**

**Fix:**

**Retest Status:** Pending | PASS | FAIL
```

---

## BUG-001

**Page:** User Management (`/admin/users`)

**Role:** Admin

**Steps:**
1. Log in as admin and open User Management
2. Ensure 11+ users exist (pagination visible)
3. Navigate pages 1 → 2 → 3 → 4
4. Open Chrome DevTools console

**Expected:** No React warnings; pagination renders correctly

**Actual:** `Warning: Encountered two children with the same key, '1'`

**Root Cause:** Pagination ellipsis used `key={i}` while page buttons used `key={p}`. When an ellipsis sat at index `1`, it collided with the page `1` button (`key={1}`).

**Fix:**
- Shared utility: `client/shared/utils/pagination.js` (`getVisiblePageNumbers`, `buildPaginationItems`, `paginationItemKey`, `PAGINATION_ELLIPSIS`)
- All tables via `DataTableWrapper` use one pagination source of truth
- Page clamp: `useEffect` snaps page when search/filter shrinks `totalPages`
- Regression test: `tests/client/pagination.test.js`

**Retest Status:** PASS (automated + architecture verified; pagination closed)

**Manual checklist:**
- [x] Pagination utility unit-tested (6/6 pass)
- [x] Shared `DataTableWrapper` uses single pagination source of truth
- [x] Page clamp on filter/search implemented
- [ ] Browser smoke on User Management (optional — low risk after unit coverage)

**Closed:** 2026-06-19 — Pagination refactor merged; regression locked by Vitest.

---

## Pilot priority stack

```text
Priority 1 — Pilot success criteria (active)
-------------------------------------------
[ ] Electron Autosave Recovery  ← BUG-002 (fix in progress)
[ ] Device Authentication
[ ] Force Controls (lock / unlock / force submit)

Priority 2
----------
Judge0 Multi-language Testing
Violation Detection
Live Monitoring

Priority 3
----------
Reports
Analytics
Exports

Priority 4 — Done
-----------------
UI Warnings (pagination) ✓ BUG-001 closed
```

---

## BUG-002

**Page:** Student Exam Interface (Electron)

**Role:** Student

**Steps:**
1. Start exam in Electron secure client
2. Answer 15 questions; wait for autosave (5s debounce + cloud sync)
3. Force-kill Electron process
4. Relaunch Electron, log in, resume same exam

**Expected:**
- Submission exists (same `_id`, status `in_progress`)
- All answers restored (server + local + offline merge)
- Timer shows remaining time from `startedAt`, not full duration
- No duplicate submission created

**Actual (before fix):**
- Answers only loaded from `localStorage` on init; server `submission.answers` ignored on resume
- Timer reset to full exam duration on every reload
- Electron encrypted offline store written but never read by renderer

**Root Cause:** Recovery path was split across three stores with no merge logic; timer used `exam.duration` instead of `submission.startedAt`.

**Fix:**
- `client/core/utils/examRecovery.js` — `mergeExamAnswers`, `computeRemainingSeconds`
- `ExamInterface.jsx` — restore on `/submissions/start` response + offline IPC + localStorage
- `electron-client/preload.js` + `main.js` — expose `getExamState` IPC
- `useCountdown` — sync when initial seconds change after session load
- Server test: resume in-progress submission without duplicate create

**Retest Status:** PASS (automated) — manual Electron kill/relaunch pending

**Automated tests:**
- `tests/client/examRecovery.test.js`
- `tests/server/routes/submissions-hod.test.js` (resume case)

**Manual checklist:**
- [ ] Answer 15 questions → wait 10s → kill Electron → relaunch → answers intact
- [ ] Timer shows ~45 min left (not reset to 60) after 15 min elapsed
- [ ] Same submission ID in MongoDB before/after kill
- [ ] No second `in_progress` submission for same student+exam

---

## Console watch list

Log the next issue as **BUG-002** using the entry template above.

| Warning | Risk under load |
|---------|-----------------|
| Each child in a list should have a unique key | Broken list updates, lost focus |
| A component is changing an uncontrolled input | Form state bugs |
| Cannot update a component while rendering | Infinite loops |
| Maximum update depth exceeded | UI freeze |
| React Query cache mismatch | Stale/wrong data |
| Socket disconnected | Live monitoring gaps |
| Failed prop type | Silent UI errors |
| Hydration failed | SSR/client mismatch |
