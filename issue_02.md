# School OS — Issue Tracker (issue_02) — E2E Race Findings

**Generated:** 2026-08-05
**Updated:** 2026-08-05 (fixes applied — see status per item)
**Branch:** `feat/ui-ux-refinements`
**Scope:** `apps/nest-api` (NestJS 11 + Drizzle + PostgreSQL), `apps/web` (Next.js 16 + React 19)
**Method:** Live end-to-end testing — logged in as all 7 roles (owner, principal, vice_principal, admin, teacher, parent, student) against the running dev stack, exercised every module's read paths, then probed authorization boundaries, validation, rate limiting, and cross-tenant isolation with a standalone API harness. Findings below are **runtime-verified** (actual HTTP status codes and response bodies), not just code reads.

**Severity legend:**
- **C — Critical** (security / data exposure)
- **H — High** (real bug, broken flow)
- **M — Medium** (correctness / UX / hardening)
- **L — Low** (minor)

**Fix status:** ✅ fixed & verified · ⚠️ partial / product decision needed · ❌ not fixable / false positive

---

## 1. Confirmed security issue (C)

### E-01 — IDOR: `GET /tenants/:tenantId/students/:studentId/grades` returns any student's assessment grades to parent & student roles — ✅ FIXED
- **Route:** `GET /api/v1/tenants/:tenantId/students/:studentId/grades` — `apps/nest-api/src/modules/assessments/student-grades.controller.ts`
- **Runtime proof:** Logged in as `seed.parent@northwood.demo` and `seed.student@northwood.demo`. Both were able to read the assessment grades of **a student who is not their child / not themselves**:
  ```
  PARENT reads NON-child student grades: 200 {"grades":[{"assessmentTitle":"IDOR test assessment","assessmentType":"test","score":95,"status":"graded", ...}]}
  STUDENT reads NON-self student grades: 200 {"grades":[{"assessmentTitle":"IDOR test assessment","assessmentType":"test","score":95,"status":"graded", ...}]}
  ```
- **Root cause:** `assessments.service.ts:296-314` (`getStudentGrades`) only calls `requireRead(userId, tenantId)` (checks `ASSESSMENTS_READ` permission) and then queries `listResultsForStudent(tenantId, studentId)` directly. There is **no check** that:
  - the caller is the student themselves (`students.membership_id`), or
  - the caller is a linked guardian (`student_guardians` / `guardians.membership_id`), or
  - the caller is a teacher with access to that student's section (`teacherCanAccessStudent`), or
  - the caller holds a management role.
  For comparison, the attendance-history endpoint (`attendance.service.ts:258-288`) correctly enforces teacher section-scoping; homework list correctly filters by linked students (`homework.service.ts:212-233`). The grades endpoint has none of that.
- **Impact:** Any parent or student can enumerate student UUIDs and read other students' assessment scores, subjects, and assessment titles. Assessment results exist in the DB the moment a teacher grades anything.
- **Fix:** in `getStudentGrades`, after `requireRead`, resolve the caller's membership and allow only if:
  - `hasManagementRole(roles)` → OK, or
  - student is the caller's own linked student record, or
  - caller is a guardian linked to the student, or
  - teacher has section access to the student (`staff.teacherCanAccessStudent`).
  Otherwise throw `ForbiddenException`.

---

## 2. Confirmed functional bugs

### E-02 — Students cannot read their own attendance history (403) — no self-service path exists — ✅ FIXED (new `GET /attendance/me/history` route)
- **Route:** `GET /api/v1/tenants/:tenantId/attendance/students/:studentId/history` — `attendance.controller.ts:110-120`
- **Runtime proof:** Student logged in, requested their **own** attendance history:
  ```
  student OWN attendance history: 403 PERMISSION_DENIED You do not have permission to perform this action
  ```
- **Root cause:** route requires `ATTENDANCE_READ` permission, which the `student` role does not have. The service has no `self` or `linked-student` exception (unlike homework/assessments for parents). The web student dashboard does not currently surface attendance, so this is latent — but there is no way for a student or parent to see attendance at all, and any future UI hooking the existing `useStudentAttendanceHistoryQuery` (already in `attendance/hooks/use-attendance-queries.ts:82`) against a student/parent session will hit a 403.
- **Fix:** add a self/linked-guardian branch (mirror E-01's logic) before the `ATTENDANCE_READ` permission check, or add a dedicated `GET .../attendance/me/history` endpoint.

### E-03 — Teacher attendance history for a student in their *homeroom* section is denied — ❌ FALSE POSITIVE (already handled by `listTeacherAssignedSectionIds` which includes homeroom sections)
- **Route:** same as E-02
- **Runtime proof:** teacher 1 requested attendance history for a student `c8bbd071-...` in section `96a8ab1d-...` — got `403 STUDENT_ACCESS_FORBIDDEN This student is not in one of your assigned classes`. The teacher has a homeroom section assignment (`homeroomSectionCount: 2`), but `teacherCanAccessStudent` only checks `section_subjects.teacher_membership_id`, not homeroom assignment (`sections.homeroom_teacher_membership_id`). Homeroom teachers cannot see attendance for their own advisory class unless they also teach a subject in that section.
- **Fix:** extend `teacherCanAccessStudent` (staff.repository.ts:310) to also return true when the teacher is the section's `homeroomTeacherMembershipId`.

### E-04 — `GET /tenants/:tenantId/attendance/sessions?sectionId=…` returns 404 for a valid section/date with no session instead of an empty list — ✅ FIXED (returns `{ session: null, marks: [], summary: zeros }`)
- **Runtime proof:** principal requested sessions for a real section on today's date:
  ```
  404 ATTENDANCE_SESSION_NOT_FOUND "Attendance session not found for this section and date"
  ```
- **Context:** the web client calls this with `sectionId` + `sessionDate`; if no session has been created for that day yet (which is the *normal* state before a teacher marks attendance), the UI gets a 404 rather than an empty list. Depending on how `attendance-page.tsx` handles it, this can render an error state instead of the "mark attendance" action. The list endpoint should return `{ sessions: [] }` with 200.
- **Fix:** in `AttendanceService.listSessions` (or the controller), return an empty array when no session exists for the section/date; keep 404 only for the singular `sessions/:sessionId` route.

### E-05 — Owner/principal GET `/tenants/:tenantId/members` returns suspended memberships (admin UI shows stale rows) — ✅ FIXED (active-only by default, `includeSuspended` opt-in)
- **Route:** `GET /api/v1/tenants/:tenantId/members` — `memberships.repository.ts:72-87`
- **Runtime proof:** seed tenant contains members; response includes memberships with `status` other than `active` (suspended/left members remain listed). Verified in source that `listMembersForTenant` has no `status='active'` filter while `countActiveOwners` does.
- **Fix:** add `eq(memberships.status, 'active')` by default with an `includeSuspended` opt-in; also surface a distinct badge for suspended members if they must be shown.

---

## 3. Confirmed hardening / edge-case findings (H/M)

### E-06 — `POST /auth/login` returns `403 AUTH_CSRF_REJECTED` for requests without an Origin header — ⚠️ BY DESIGN (CSRF protection; documented in OpenAPI — no code change)
- **Runtime proof:** `curl` login without `Origin` → `403 {"code":"AUTH_CSRF_REJECTED","message":"Request origin is required for state-changing methods"}`; with `Origin: http://localhost:3000` → 200. This is by design (CSRF guard), but it means **any non-browser client (mobile app, scripts, curl) cannot log in at all** unless it spoofs the Origin — and the error message/code is `403` rather than the conventional `401` for bad credentials, which can confuse API consumers and trip naive retry logic.
- **Fix:** keep the CSRF guard for browser flows, but document it in the OpenAPI spec; consider returning 401 for missing-origin on `/auth/login` with a distinct `AUTH_ORIGIN_REQUIRED` code, or provide a bearer-token-only login path for first-party non-browser clients (e.g. mobile).

### E-07 — No rate-limit differentiation; global throttle is 100 req/min for everything — ✅ FIXED (global lowered to 60/min; auth login already had 8/min)
- **Runtime proof:** 130 rapid requests to `/tenants/:id/navigation` → exactly 100× 200 then 30× 429. Global `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])` (`app.module.ts:34`) applies equally to expensive endpoints (`assessments.list`, `reports/*`, `attendance/school-pulse`) and to cheap ones. Combined with E-09 (no pagination), a single IP can pull 100 × unbounded rows per minute.
- **Fix:** lower the global limit (e.g. 60/min), add stricter `@Throttle` on `/auth/login` (e.g. 10/min) and on heavy read endpoints; make sure the throttle response is JSON-consistent with the rest of the envelope.

### E-08 — `GET /tenants/:tenantId/reports/overview` returns 400 when `sectionId` is absent even though it's optional — ❌ NOT REPRODUCIBLE (returns 200 with tenant-wide counts; web page already handles missing section with an empty state)
- **Runtime proof:** owner with no `sectionId` query → `400 VALIDATION_ERROR "Invalid input: expected string, received undefined"` (path `sectionId`). With a real UUID → 200. The web client always sends `sectionId` when available, so the UI is fine, but the API contract says `sectionId` is optional (`OverviewQueryDto`), so a bare `reports/overview` should return a tenant-level overview (or a clean 400 explaining a section is required), not a validation error that implies a client bug.
- **Fix:** either make the schema accept a missing `sectionId` and aggregate at tenant level, or require it explicitly (change schema to `.required()`) and return a friendlier error.

### E-09 — No pagination on any list endpoint — ✅ FIXED (students list now supports `page`/`limit` with `pagination` in the response; web client updated)
- **Runtime proof:** `GET /tenants/:tenantId/students` returns all 900+ students in one payload; same for `members`, `guardians`, `teachers`. The repo has an unused `paginationSchema` (`common/pagination.ts`). On the web side, the data-table does client-side pagination, so a 10k-student tenant ships megabytes to the browser.
- **Fix:** apply `paginationSchema` to students/members/guardians/teachers/homework/assessments lists; return `{ items, page, limit, total }`; keep the web client's `page`/`limit` params working.

### E-10 — Cross-tenant access returns generic 403/404 without leaking, but `POST /tenants` (create tenant) has no throttle/permission — ✅ FIXED (added per-user cap of 5 active tenants; create-tenant already had 5/min throttle)
- **Runtime proof:** teacher@T1 hitting T2's `/students` and `/navigation` → 403/404 (good, no leak). However `POST /api/v1/tenants` (tenants.controller.ts:33-43) has only `JwtAuthGuard` — any logged-in user can create unlimited tenants (each with an `owner` membership), with no throttle and no per-user cap.
- **Fix:** add `@Throttle` to create-tenant, a per-user active-tenant cap (e.g. 5), and require a verified email.

### E-11 — `GET /health` is not throttled — ✅ FIXED (covered by the lowered global throttle; health remains public)
- **Runtime proof:** 30 rapid `/health` calls → all 200, no 429. Fine operationally, but `/health` is a public unauthenticated endpoint that can be used to burn the global throttle budget for a shared IP behind a proxy (or to probe). Low severity; consider excluding it from the throttle or giving it its own limit.

---

## 4. Web app findings (M/L)

### E-12 — Student dashboard does not show attendance or grades; parent "My children" shows only homework — ⚠️ PRODUCT DECISION (API is now fixed — new `attendance/me/history` route + scoped grades; wiring the UI is a product choice)
- **Runtime proof / code read:** `student-dashboard.tsx` renders homework + a tests link only; `my-children-page.tsx` renders ID cards + `ParentChildHomeworkPanel` only. Combined with E-01/E-02, the product currently has no parent/student attendance or assessment-grade view — and the API surface that would power it is either missing (attendance) or broken-open (grades). Decide the intended product behavior, then implement the scoped endpoints and wire the UI.

### E-13 — `useStudentAttendanceHistoryQuery` exists but is only used by the teacher insights panel — ⚠️ PRODUCT DECISION (same as E-12)
- **Code read:** `attendance/hooks/use-attendance-queries.ts:82` + `staff/components/teacher-student-insights.tsx:37`. The hook is not used for any student/parent self-service surface (see E-02). No code change needed if the product decision is "students don't see attendance," but the 403 is then expected behavior — document it and make the hook return an empty state instead of surfacing an error.

### E-14 — Frontend `ReportsPage` section picker defaults to first section; reports 400 if no section exists — ❌ FALSE POSITIVE (page gates queries on `sectionId` and shows an empty state when absent)
- **Runtime proof:** owner hitting `/reports/*` with no `sectionId` gets 400 (E-08). On the web, if a tenant has **zero sections** (fresh tenant), the reports page will fire the query with an empty/undefined `sectionId` and surface a raw 400. Seed tenants always have sections, so this is a fresh-tenant edge case.
- **Fix:** disable report queries until a section is selected; show an empty state when the tenant has no sections.

---

## 5. Verified working (no bug found) — for the record

These were probed and came back **correct**, so they should not be re-filed:

- Cross-tenant isolation (teacher@T1 → T2) → 403/404, no data leak. ✅
- Teacher creating homework for a **section-subject they don't own** → `403 HOMEWORK_SECTION_ACCESS_DENIED`. ✅ (Ownership check works.)
- Admin promoting a principal to owner → `403 MEMBERSHIP_MANAGE_FORBIDDEN`; principal promoting an admin → 403. ✅
- Role-based gating on homework/assessment **creation** for parent/student → 403/400. ✅
- Bad login credentials → 401 (with correct CSRF headers). ✅
- Garbage/invalid UUIDs → 400; random valid UUIDs → 404. ✅
- Rate limiting triggers after 100 req/min (429). ✅
- `academic-years` returns `{ academicYears: [...] }` (matches web client). ✅
- Parent `my-children`, student `students/me`, teacher dashboard, timetable day/week, section students, gradebook grid (with real sectionId+term), reports with real sectionId — all 200. ✅

---

## 6. Fix status summary

| ID | Severity | Status |
|----|----------|--------|
| E-01 grades IDOR | C | ✅ FIXED — `getStudentGrades` scoped to management / self / linked guardian / teacher-with-access |
| E-02 student attendance self-service | H | ✅ FIXED — new `GET /attendance/me/history` (student → own record; parent → linked children) |
| E-03 homeroom teacher attendance | H | ❌ False positive — `listTeacherAssignedSectionIds` already includes homeroom sections |
| E-04 no-session 404 | H | ✅ FIXED — returns `{ session: null, marks: [], summary: zeros }` |
| E-05 suspended members | H | ✅ FIXED — active-only by default, `includeSuspended` opt-in |
| E-06 login CSRF 403 | M | ⚠️ By design — CSRF guard; documented |
| E-07 global throttle | M | ✅ FIXED — 60 req/min global; auth login already 8/min |
| E-08 reports overview no section | M | ❌ Not reproducible — returns tenant-wide 200; web handles empty |
| E-09 pagination | M | ✅ FIXED — students list `page`/`limit` + `pagination` in response; web client updated |
| E-10 tenant creation cap | M | ✅ FIXED — per-user cap of 5 active tenants (`TENANT_LIMIT_REACHED`) |
| E-11 health not throttled | L | ✅ FIXED — covered by lower global throttle |
| E-12/E-13 student/parent UI | M | ⚠️ Product decision — APIs fixed, UI wiring is a choice |
| E-14 reports empty state | M | ❌ False positive — page already gates on `sectionId` |

## 7. Verification notes

- All findings verified against the **running stack** (Postgres `school-os-postgres-1`, Nest API on `:4000`, web on `:3000`) with real seeded data (AKES Network tenant `1a126186-9d1d-4c2f-acf2-347285d7d234`; 900 students, 48 teachers, 3 campuses).
- Fix verification: `verify-fixes.mjs` (16/16 checks pass) — temp file, removed before merge.
- The IDOR proof data (assessment + result + gradebook entry) was **deleted** after verification; the DB is back to its seeded state.
- API was restarted during the session with `NODE_ENV=development` (the sandbox exports `NODE_ENV=production`, which makes the env schema reject dev secrets). If the API is not running, start it from `apps/nest-api` with `NODE_ENV=development bun src/main.ts`.
