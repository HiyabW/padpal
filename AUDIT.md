# PadPal v2 — System-Wide Bottleneck & Scalability Audit

**Date:** May 10, 2026  
**Scope:** Frontend (`padpal`) + Backend (`palpal-api`) + Architecture  
**Purpose:** Pre-production audit to identify all issues that must be resolved before PadPal can support thousands of real users reliably.

---

## Table of Contents

1. [Full Bottleneck Report](#1-full-bottleneck-report)
   - [Security](#11-security-critical)
   - [Backend](#12-backend)
   - [Database Layer](#13-database-layer)
   - [Frontend — Correctness Bugs](#14-frontend--correctness-bugs)
   - [Frontend — Performance & Re-renders](#15-frontend--performance--re-renders)
   - [Frontend — Bundle & Runtime](#16-frontend--bundle--runtime)
   - [Matching System](#17-matching-system)
   - [Chat / Real-Time System](#18-chat--real-time-system)
   - [System Architecture](#19-system-architecture)
   - [UX & Product Gaps](#110-ux--product-gaps)
2. [Prioritized Scaling Roadmap](#2-prioritized-scaling-roadmap)
   - [Phase 1 — Critical Fixes](#phase-1--critical-fixes-before-any-real-users)
   - [Phase 2 — Scaling Improvements](#phase-2--scaling-improvements)
   - [Phase 3 — Production Hardening](#phase-3--production-hardening)
3. [PRD Updates](#3-prd-updates)

---

## 1. Full Bottleneck Report

---

### 1.1 Security (Critical)

---

#### SEC-01 — No authentication enforcement on any API route

| Field | Value |
|---|---|
| **Category** | Backend / Security |
| **Severity** | Critical |
| **Description** | `verifyAccessToken` middleware is imported in `app.js` but never attached to any router. Every endpoint is publicly accessible to anyone who knows the URL shape. |
| **At scale** | Any user can read or write any other user's data, delete images, send messages as another user, or overwrite any profile. This is not a confidentiality concern — it is a correctness blocker even with a single user. |
| **Root cause** | Middleware was written but the attachment line was never added to the router registrations. |
| **Fix direction** | Apply `verifyAccessToken` as middleware to all routers except `POST /auth/login` and `POST /auth/register`. Move user identification from `req.body._id` to the decoded JWT payload so the client can never impersonate another user. |

---

#### SEC-02 — User identity passed in request body, not via JWT

| Field | Value |
|---|---|
| **Category** | Backend / Security |
| **Severity** | Critical |
| **Description** | Every API call passes `id` or `_id` or `from`/`to` as plain JSON fields (e.g., `{ from: Cookies.get("id") }`). The server trusts these values unconditionally. |
| **At scale** | A malicious client can send any other user's MongoDB `_id` and perform actions on their behalf — save matches, send messages, delete their images, unmatch their relationships. |
| **Root cause** | Authentication was deferred. The `id` cookie was used as a shortcut during prototyping. |
| **Fix direction** | After SEC-01 is resolved, all route handlers must extract the user's identity exclusively from the verified JWT payload (`req.user._id`). All `from`/`_id` body params must be removed. |

---

#### SEC-03 — `POST /auth/survey` allows mass-assignment / password overwrite

| Field | Value |
|---|---|
| **Category** | Backend / Security |
| **Severity** | Critical |
| **Description** | The survey endpoint does `User.findByIdAndUpdate(id, { $set: req.body })`. Any client can send `{ _id: "...", password: "newpass" }` and overwrite the hashed password. |
| **At scale** | Any authenticated (or in this case, unauthenticated) user can take over any account by overwriting their password. |
| **Root cause** | The endpoint was written without an allowlist of updatable fields. |
| **Fix direction** | Destructure only the known-safe fields from `req.body` before the `$set`. Fields like `password`, `email`, `_id`, `createdAt` must never be updatable through this endpoint. |

---

#### SEC-04 — JWT stored in a non-HttpOnly cookie

| Field | Value |
|---|---|
| **Category** | Frontend / Security |
| **Severity** | High |
| **Description** | The access token is stored in the `isLoggedIn` cookie via `js-cookie` without `httpOnly: true`. This means the token is readable from JavaScript. |
| **At scale** | Any XSS injection — through a user's bio, a third-party script, or an injected ad — can steal every active user's token. |
| **Root cause** | `js-cookie` is a client-side library that cannot set `HttpOnly` cookies. The token was stored this way as a convenience. |
| **Fix direction** | Tokens must be set server-side as `HttpOnly; Secure; SameSite=Strict` cookies. Alternatively, migrate to `Authorization: Bearer` header pattern with tokens stored in memory (not `localStorage`). |

---

#### SEC-05 — `.env` file likely committed to version control

| Field | Value |
|---|---|
| **Category** | Backend / Security |
| **Severity** | Critical |
| **Description** | The `.gitignore` only ignores `node_modules`. The `.env` file containing `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, and the Gemini `API_KEY` is not excluded. |
| **At scale** | All production secrets are publicly visible in the git history. Rotating keys is insufficient unless the entire git history is scrubbed. |
| **Root cause** | Incomplete `.gitignore` from project initialization. |
| **Fix direction** | Add `.env` and `.env.*` to `.gitignore` immediately. Rotate all secrets. Audit git history and remove committed secrets using `git filter-repo` or BFG Repo-Cleaner. |

---

#### SEC-06 — `express.json` limit set to 50 MB

| Field | Value |
|---|---|
| **Category** | Backend / Security |
| **Severity** | High |
| **Description** | `express.json({ limit: "50mb" })` allows any client to send a 50 MB JSON payload to any endpoint. |
| **At scale** | A single attacker sending repeated 50 MB requests can saturate the server's memory, causing OOM crashes. Since there's no auth middleware, this requires zero credentials. |
| **Root cause** | Images are stored as base64 strings in the request body, which inflates payload size dramatically. |
| **Fix direction** | Migrate images to object storage (S3/Cloudflare R2). Once images are sent as presigned URL uploads and only URLs are stored in MongoDB, reduce this limit to `~1mb`. |

---

### 1.2 Backend

---

#### BE-01 — `bcrypt-nodejs` is a deprecated, unmaintained package

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | High |
| **Description** | The backend uses `bcrypt-nodejs`, which was deprecated in 2015 and has known vulnerabilities. The pre-save hook also contains a bug referencing an undefined `error` variable, causing an unhandled exception path. |
| **At scale** | Password hashing is a security primitive. Using abandoned crypto libraries in production with real user passwords is unacceptable. |
| **Root cause** | Package was selected early and never revisited. |
| **Fix direction** | Replace with `bcryptjs` (pure JS, maintained) or `bcrypt` (native bindings, faster). Fix the undefined `error` variable reference in the hook. |

---

#### BE-02 — Refresh token endpoint exists but is never issued or called

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | High |
| **Description** | `POST /auth/register` calls `signAccessToken` twice and never calls `signRefreshToken`. No refresh token is issued to the client. The `POST /auth/refreshToken` endpoint exists but is never called by the frontend. |
| **At scale** | Access tokens expire after 1 hour (set in the frontend cookie). After expiry, users are silently logged out with no recovery path — their session just dies. This creates a terrible UX at any scale. |
| **Root cause** | Token refresh logic was partially implemented and left incomplete. |
| **Fix direction** | Fix `register` to call `signRefreshToken` for the second token. Have the frontend call `POST /auth/refreshToken` before token expiry (e.g., on focus, or via an interceptor). Store the refresh token in an `HttpOnly` cookie. |

---

#### BE-03 — No async error handling on Express route handlers

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | High |
| **Description** | None of the route handlers in `auth.js`, `feed.js`, `match.js`, `chat.js`, or `image.js` use `try/catch` or an async error wrapper. Any thrown exception or rejected promise will crash the Express process or return a 500 with a stack trace. |
| **At scale** | A single bad document in MongoDB, a Gemini API timeout, or a malformed request body can crash the entire server, affecting all concurrent users. |
| **Root cause** | No error handling pattern was established during development. |
| **Fix direction** | Wrap all async route handlers with a `asyncHandler` utility that catches errors and passes them to `next(err)`. Add a global Express error handler middleware that returns sanitized error responses. |

---

#### BE-04 — Joi validation schema defined but never applied

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | High |
| **Description** | `helpers/validationSchema.js` defines a Joi schema for user registration but it is never imported or used in any route. Invalid or malformed requests reach the database layer unchecked. |
| **At scale** | Without input validation, any malformed data (missing fields, wrong types, excessively long strings) gets written to MongoDB. At scale this creates data corruption that is expensive to clean up. |
| **Root cause** | Schema was written as a placeholder and never wired up. |
| **Fix direction** | Apply the Joi schema as middleware to `POST /auth/register` and `POST /auth/login`. Extend the schema to cover the survey endpoint's allowlisted fields. |

---

#### BE-05 — `DELETE /auth/logout` references undefined `error` variable

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | Medium |
| **Description** | In the logout route's catch block, the code references `error` but the catch parameter is named `err`. This causes a `ReferenceError` at runtime if the try block throws. |
| **At scale** | Any logout failure cascades into an unhandled exception instead of a clean error response. |
| **Root cause** | Typo. |
| **Fix direction** | Rename the catch variable to `error` or fix the reference to `err`. |

---

#### BE-06 — `package.json` `main` points to a nonexistent `index.js`

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | Medium |
| **Description** | The backend `package.json` has `"main": "index.js"` but the entry point is `app.js`. |
| **At scale** | Programmatic requires, some deployment scripts, and testing frameworks rely on the `main` field. This can cause silent failures during CI/CD or when using the package programmatically. |
| **Root cause** | Default CRA/npm template was not updated. |
| **Fix direction** | Change `"main"` to `"app.js"` in the backend `package.json`. |

---

#### BE-07 — `smokerPreferences` key defined twice in `userModels.js`

| Field | Value |
|---|---|
| **Category** | Backend / Database |
| **Severity** | High |
| **Description** | The Mongoose user schema has `smokerPreferences` defined twice. The second definition silently overwrites the first in JavaScript object literals, meaning the first definition is ignored. |
| **At scale** | Schema inconsistencies cause subtle data type mismatches and validation gaps that are hard to diagnose at scale. |
| **Root cause** | Typo / copy-paste error. |
| **Fix direction** | Remove the duplicate key. Verify the intended type and validate existing documents. |

---

#### BE-08 — `expectedMoveOut` stored as `Date` but accessed as `currUser.expectedMoveOut[0]`

| Field | Value |
|---|---|
| **Category** | Backend |
| **Severity** | High |
| **Description** | The schema declares `expectedMoveOut` as a `Date`, but the feed scoring logic accesses it as `currUser.expectedMoveOut[0]`, treating it as an array. The move-out date scoring is broken for any user whose data conforms to the schema. |
| **At scale** | The core matching algorithm silently produces wrong scores for a key matching dimension. This means users see wrong candidate rankings. |
| **Root cause** | Schema type and access pattern were developed inconsistently across different files. |
| **Fix direction** | Standardize `expectedMoveOut` as a `Date` scalar throughout the schema, models, and routes. Fix all array-access patterns. |

---

### 1.3 Database Layer

---

#### DB-01 — No indexes on any collection

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | Critical |
| **Description** | None of the collections (`users`, `matches`, `chats`, `images`) have declared indexes beyond the default `_id` index. All queries perform full collection scans. |
| **At scale** | With 10,000 users: a feed query scanning the `matches` collection to exclude already-swiped users will scan O(n²) documents. Chat polling every 3 seconds from 1,000 concurrent users, each scanning the full `chats` collection, will bring MongoDB to its knees. |
| **Root cause** | Indexes were not considered during prototype development. |
| **Fix direction** | Add compound indexes at minimum: `matches(from, to)`, `matches(from, isAMatch)`, `chats(from, to, date)`, `images(owner)`, `users(city, gender)` (for feed filtering). Use `explain()` to verify query plans. |

---

#### DB-02 — Images stored as base64 strings in MongoDB documents

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | Critical |
| **Description** | Profile images are stored as base64-encoded strings directly in the `images` collection. A single 1 MB image becomes ~1.37 MB as base64. Three images per user = ~4 MB of binary data per user document fetched on every feed load. |
| **At scale** | With 1,000 users on the feed: a single `POST /feed/` call fetches ~4 GB of raw image data from MongoDB into the Express process, serializes it to JSON, and sends it to the client. MongoDB's 16 MB document size limit will also be hit. Cold read latency will be measured in seconds, not milliseconds. |
| **Root cause** | Object storage was not set up during the prototype phase. |
| **Fix direction** | Migrate images to object storage (AWS S3, Cloudflare R2, or Supabase Storage). Store only the CDN URL in MongoDB. Serve images via a CDN with proper cache-control headers. |

---

#### DB-03 — N+1 query pattern in `POST /feed/`

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | Critical |
| **Description** | The feed endpoint fetches all candidate users, then for each candidate issues a separate `Match.find()` query (to check already-swiped status) and a separate `Image.find()` query. For N candidates, this generates 1 + 2N database round trips. |
| **At scale** | With 500 potential candidates, this issues 1,001 sequential queries per feed load. At 100 concurrent users loading their feed simultaneously, this is 100,100 queries/minute. MongoDB cannot serve this without either indexes + aggregation pipelines, or a caching layer. |
| **Root cause** | Standard ORM-style lazy-loading pattern applied without awareness of N+1 cost. |
| **Fix direction** | Rewrite the feed query as a single MongoDB aggregation pipeline using `$lookup` to join matches and images in one pass. Pre-filter already-swiped user IDs using a single `Match.distinct()` query before the main aggregation. |

---

#### DB-04 — Chat history fetched in full on every poll

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | High |
| **Description** | `POST /chat/getChats` loads the entire message history for every conversation the user has, on every 3-second poll. A user with 10 matches who has exchanged 500 messages each would pull 5,000 full message documents every 3 seconds. |
| **At scale** | 1,000 active chat users × 5,000 documents × every 3 seconds = ~1.67M document reads/second from MongoDB, none of which are needed (most messages haven't changed). |
| **Root cause** | No pagination was implemented. Messages are fetched as an unbounded list. |
| **Fix direction** | Add cursor-based pagination to message retrieval (fetch only the last N messages). On poll, fetch only messages with a `date > lastSeenDate` to return only new messages as a delta. |

---

#### DB-05 — No TTL or archiving strategy for old match/chat data

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | Medium |
| **Description** | There is no mechanism to archive, soft-delete, or expire old match records (e.g., left-swipes from 2 years ago) or chat messages from unmatched conversations. |
| **At scale** | The `matches` collection grows indefinitely. Every user who swipes through 100 candidates creates 100 match records that remain forever, all of which are scanned during feed generation. |
| **Root cause** | Data lifecycle was not considered during prototype design. |
| **Fix direction** | Add a MongoDB TTL index on left-swipe match records (e.g., expire after 6 months). Soft-delete chat messages on unmatch rather than leaving them orphaned. Implement an archival strategy for completed matches. |

---

#### DB-06 — `city` stored as an array of strings but used as a hard-filter scalar

| Field | Value |
|---|---|
| **Category** | Database |
| **Severity** | Medium |
| **Description** | The `city` field is defined as `[String]` in the schema, but the feed filter uses `city: currUser.city` which does an equality match against the array itself, not a set-intersection check. The behavior may be correct for single-city users but is undefined for multi-city users. |
| **At scale** | If users can select multiple cities, the filter will silently fail to match candidates who share one but not all selected cities, reducing match quality. |
| **Root cause** | Schema design was not finalized before implementation. |
| **Fix direction** | Clarify the intended behavior (single city vs. multi-city). If multi-city, use `$in` or `$elemMatch` for the filter. If single city, enforce `String` (not array) in the schema. |

---

### 1.4 Frontend — Correctness Bugs

---

#### FE-BUG-01 — `setTimeout` runs in component body, not `useEffect`

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Critical |
| **Description** | In `signIn/index.jsx`, `setTimeout(() => { setIsMobileIntroVisible(false); ... }, "2000")` is called directly in the function body — not inside a `useEffect`. This fires a new timer on every single re-render of the component. |
| **At scale** | Every state update (typing in the email field, toggling password visibility, etc.) spawns a new 2-second timer. With moderate typing, dozens of timers accumulate, each calling `setState`, which triggers more re-renders and more timers. This is a memory leak and can cause infinite render loops. |
| **Root cause** | Missing `useEffect` wrapper. |
| **Fix direction** | Move the `setTimeout` call inside a `useEffect` with an empty dependency array `[]` so it fires only on mount. Return a cleanup function that calls `clearTimeout`. |

---

#### FE-BUG-02 — `editProfile` update payload reads `.current` from state variables

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Critical |
| **Description** | In `editProfile/index.jsx`, the `updateUser` function sends `agePreferences: agePreferences.current` and `budget: budget.current`. But `agePreferences` and `budget` are `useState` values, not refs — they have no `.current` property. Both fields are always `undefined` in the update payload. |
| **At scale** | Every user who saves their profile edit loses their age preference and budget range — they are overwritten with `undefined` in the database. This silently corrupts the matching algorithm for all edited profiles. |
| **Root cause** | The code was refactored from `useRef` to `useState` at some point but the call sites were not updated. |
| **Fix direction** | Replace `agePreferences.current` with `agePreferences` and `budget.current` with `budget` in the `updateUser` body. |

---

#### FE-BUG-03 — `viewProfile` passes single user object as `users` map

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | High |
| **Description** | `viewProfile/index.jsx` does `setUsers(data["user"])` (a single object) and passes it as the `users` prop to `UserCard`. `UserCard`'s `isKeyLast` function calls `Object.keys(obj)[last]["email"]` on this, which treats the user's own fields as keys and produces incorrect results. |
| **At scale** | Every profile view renders with broken `isKeyLast` logic. On the profile view, keyboard controls and drag behavior may behave incorrectly for all users. |
| **Root cause** | `UserCard` was designed for the feed (a map of users keyed by email) and reused in `viewProfile` without adapting the data shape. |
| **Fix direction** | Either wrap the single user in the expected map format (`{ [user.email]: user }`) before passing to `UserCard`, or add a `feedOrViewProfile === "view profile"` guard in `isKeyLast` that short-circuits to `true`. |

---

#### FE-BUG-04 — `handleKeyPress` in `UserCard` creates stale closures

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | High |
| **Description** | `handleKeyPress` is defined inside the `UserCard` component body and used as a dependency in the `useEffect` that attaches the `keydown` listener. Because `handleKeyPress` is recreated on every render, the `useEffect` fires on every render, constantly removing and re-adding the event listener. The function also captures `isFront` and `handle` in a closure, creating stale closure bugs when `isFront` changes. |
| **At scale** | With a stack of 20 cards each re-attaching a `keydown` listener on every re-render, keyboard events trigger N handlers simultaneously — one per card in the stack. This causes multiple simultaneous swipes. |
| **Root cause** | `useEffect` dependency array incorrectly includes a function recreated on every render. |
| **Fix direction** | Wrap `handleKeyPress` in `useCallback` with appropriate dependencies. Alternatively, move the keydown listener to the parent `Feed` component and dispatch swipe actions downward via props or a ref. |

---

#### FE-BUG-05 — `getChats` response: `user.SortedMessages.length` is always undefined

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Medium |
| **Description** | In `chatRoom/index.jsx`, `isLastItem` is computed as `Object.keys(user.SortedMessages)[user.SortedMessages.length - 1] === key`. Since `SortedMessages` is an object (not an array), `.length` is `undefined`, so `undefined - 1 = NaN`, and `Object.keys(user.SortedMessages)[NaN]` is `undefined`. `isLastItem` is therefore always `false`. The last message's date grouping is never rendered. |
| **At scale** | Every conversation's last message always shows the wrong date group. This is a display bug that every user experiences. |
| **Root cause** | `.length` was used on a plain object instead of calling `Object.keys(...).length`. |
| **Fix direction** | Replace `user.SortedMessages.length` with `Object.keys(user.SortedMessages).length`. |

---

#### FE-BUG-06 — Survey `questions.js` has duplicate `id: 19`

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Medium |
| **Description** | Both the hobbies question and the facial verification question share `id: 19` in `survey/questions.js`. React uses keys for reconciliation — duplicate keys cause the reconciler to discard one element and may produce silent data corruption in `key`-dependent logic. |
| **At scale** | Any analytics, A/B test, or step-tracking system that relies on question IDs receives corrupted data for a significant fraction of onboarding completions. |
| **Root cause** | Manual ID assignment with no uniqueness enforcement. |
| **Fix direction** | Assign unique sequential IDs to all survey questions. Add a build-time or unit test assertion that all question IDs are unique. |

---

#### FE-BUG-07 — `window.location` used for navigation instead of React Router

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Medium |
| **Description** | Navigation in `signIn`, `survey`, `editProfile`, and `UserCard` uses `window.location = "/path"` (a hard page reload) instead of React Router's `useNavigate`. |
| **At scale** | Every navigation triggers a full browser reload, discards all React state, re-downloads JS bundles, and forces a new round-trip to the server. This destroys perceived performance on slow connections. |
| **Root cause** | React Router's `useNavigate` was not used during prototyping. |
| **Fix direction** | Replace all `window.location = "..."` assignments with `useNavigate` hook calls. This enables SPA-style client-side navigation with no full reloads. |

---

### 1.5 Frontend — Performance & Re-renders

---

#### FE-PERF-01 — No global state: every page independently re-fetches the same data

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | High |
| **Description** | There is no global state management library. Each page independently fetches its data on mount. Navigating from Feed → Chat → Feed causes the feed to be fully re-fetched, re-scored, and re-rendered every time. |
| **At scale** | Every page transition generates 1-3 fresh API calls to a cold Render.com server. With 1,000 users navigating normally, this multiplies API load by 3-5x compared to a system with a client-side cache. |
| **Root cause** | Global state was intentionally omitted during prototyping ("backend is source of truth"). |
| **Fix direction** | Adopt a client-side data fetching and caching library (React Query / TanStack Query or SWR). These provide automatic caching, background revalidation, and deduplication. Avoid heavy solutions like Redux for this use case. |

---

#### FE-PERF-02 — No memoization anywhere (`React.memo`, `useMemo`, `useCallback`)

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | High |
| **Description** | No component uses `React.memo`, `useMemo`, or `useCallback`. The `Feed` page passes `setAccept`, `setReject`, `setUsers`, and `setMatch` as new function references on every render. Every `UserCard` re-renders whenever any Feed state changes (e.g., the tooltip opening/closing). |
| **At scale** | A feed with 20 cards: every tooltip hover re-renders all 20 cards + their Framer Motion transforms. On a mid-range mobile device this causes visible frame drops. |
| **Root cause** | Performance optimization was not prioritized during prototyping. |
| **Fix direction** | Wrap `UserCard` in `React.memo`. Memoize all callback props passed to cards with `useCallback`. Memoize expensive computations (e.g., `Object.entries(users)`) with `useMemo`. |

---

#### FE-PERF-03 — `window.innerWidth` read synchronously in render

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Medium |
| **Description** | Multiple components read `window.innerWidth` directly in the render function (not in `useEffect` or `useState` with a resize listener). This value is static — it does not respond to window resizing and is incorrect on first render during server-side rendering scenarios. |
| **At scale** | On any resize or orientation change (very common on mobile), layout-dependent logic (card stacking, tooltip positioning, icon sizes) is incorrect until the component re-renders for another reason. |
| **Root cause** | Quick shortcut during development without considering responsiveness. |
| **Fix direction** | Create a `useWindowWidth` custom hook that subscribes to the `resize` event via `useEffect` and returns the current width from `useState`. Use this hook wherever `window.innerWidth` is currently read. |

---

#### FE-PERF-04 — Multiple `console.log` calls in hot render paths

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Medium |
| **Description** | `UserCard` logs `console.log(users)` and `console.log(user)` on every render. `chatRoom/index.jsx` logs every message in the render loop. `feed/index.jsx` logs the full images object after each fetch. |
| **At scale** | In production, serializing large objects (a full user map, all images) to the console on every render is a measurable CPU cost. On the feed with 20 cards, this is 40+ console serializations per render cycle. It also leaks sensitive user data to the browser console. |
| **Root cause** | Debug logging was left in during development. |
| **Fix direction** | Remove all `console.log` statements from render paths. Use a conditional logging utility that is stripped in production builds (e.g., check `process.env.NODE_ENV !== 'production'`). |

---

### 1.6 Frontend — Bundle & Runtime

---

#### FE-BUNDLE-01 — Dual build pipeline (CRA + Webpack 5) — undefined behavior

| Field | Value |
|---|---|
| **Category** | Frontend / Architecture |
| **Severity** | High |
| **Description** | The project has both a CRA (`react-scripts`) pipeline (used by `npm start` and `npm test`) and a custom Webpack 5 pipeline (used by `npm run build`). These are separate, independent configurations that may produce different bundles. The `dist/` folder (Webpack output) and the CRA default output do not match. |
| **At scale** | Development is done against CRA's fast refresh environment, but production deployments use the Webpack bundle. Bugs that appear only in the Webpack build (different Babel config, different CSS handling) are invisible during development. This is a reliability time bomb. |
| **Root cause** | Webpack was added later to gain more build control, but CRA was not removed. Both now coexist. |
| **Fix direction** | Choose one pipeline. For production control, commit fully to Webpack 5 and remove CRA (`react-scripts`, `react-app` eslint config). Or eject CRA and migrate. Do not run both. |

---

#### FE-BUNDLE-02 — Webpack entry includes `feed/index.jsx` in addition to `index.js`

| Field | Value |
|---|---|
| **Category** | Frontend / Build |
| **Severity** | High |
| **Description** | `webpack.config.js` has `entry: ['./src/index.js', './src/pages/feed/index.jsx']`. This adds the entire feed page as a second entry point, meaning its module graph is bundled twice — once as part of the app tree from `index.js`, and once as a top-level entry. |
| **At scale** | This inflates the final bundle size by duplicating modules and breaks tree-shaking. The feed module and all its dependencies (Framer Motion, tsParticles, MUI) are likely emitted twice into different chunks. |
| **Root cause** | Possibly an attempt to enable code splitting that was not completed correctly. |
| **Fix direction** | Remove `./src/pages/feed/index.jsx` from the entry array. If code splitting was the goal, implement it using dynamic `import()` inside `App.js` for each route. |

---

#### FE-BUNDLE-03 — `devServer` configuration is defined twice in `webpack.config.js`

| Field | Value |
|---|---|
| **Category** | Frontend / Build |
| **Severity** | Medium |
| **Description** | `webpack.config.js` has two separate `devServer` keys (lines 35–38 and lines 60–73). JavaScript object literals silently discard duplicate keys — the first `devServer` block is ignored entirely. |
| **At scale** | The `open: true` and `host: 'localhost'` settings from the first block are silently discarded. This creates confusion during development and could mask missing configuration. |
| **Root cause** | Config was modified incrementally without noticing the duplicate. |
| **Fix direction** | Merge both `devServer` blocks into a single declaration. |

---

#### FE-BUNDLE-04 — `face-api.js` ML models (~20 MB+) served as static files with no CDN

| Field | Value |
|---|---|
| **Category** | Frontend / Performance |
| **Severity** | High |
| **Description** | The facial verification step downloads 8+ ML model shards at runtime from `/models/` in the public folder. These include `ssd_mobilenetv1` (large), `face_recognition_model` (2 shards), `face_landmark_68_model`, and others — totaling over 20 MB of binary weights. They are served as static files from the web server with no CDN in front. |
| **At scale** | Every user who reaches onboarding step 16 downloads 20+ MB from a Render.com origin server. With 100 concurrent onboarding users, this is 2 GB of model transfer per session, likely overwhelming the free-tier server's bandwidth. On a mobile connection this step takes 30+ seconds. |
| **Root cause** | `face-api.js` was chosen for its simplicity without auditing the runtime download cost. |
| **Fix direction** | Either: (a) move all facial verification to the backend using a proper CV service (AWS Rekognition, Azure Face API), removing `face-api.js` from the client entirely; or (b) host the model files on a CDN (Cloudflare, AWS CloudFront) and add aggressive `Cache-Control` headers so models are only downloaded once. Option (a) is strongly preferred for security and reliability. |

---

#### FE-BUNDLE-05 — Large base64 image string exported from `chatRoom/index.jsx`

| Field | Value |
|---|---|
| **Category** | Frontend / Bundle |
| **Severity** | High |
| **Description** | After the `ChatRoom` component export at line 422, `chatRoom/index.jsx` contains `const sampleImg = "data:image/jpeg;base64,/9j/2wBDA..."` — a large base64-encoded JPEG that appears to be a placeholder or test image. It is exported (the `const` is module-scoped) and therefore included in every bundle that imports this module. |
| **At scale** | This single constant inflates the JS bundle by the full size of the encoded image (appears to be 50–100 KB based on character count). Every user downloads this dead data on every page load. It cannot be tree-shaken. |
| **Root cause** | Development artifact left in production code. |
| **Fix direction** | Delete the `sampleImg` constant entirely. |

---

#### FE-BUNDLE-06 — Unused dependencies inflate bundle size

| Field | Value |
|---|---|
| **Category** | Frontend / Bundle |
| **Severity** | Medium |
| **Description** | `package.json` includes `@nextui-org/react` (a full component library) and `openai` (the OpenAI Node.js SDK) — neither of which is imported anywhere in the source code. Additionally, `HashRouter` is imported in `App.js` but never used. Both MUI Material (`@mui/material`) and MUI Joy (`@mui/joy`) are used simultaneously. |
| **At scale** | `@nextui-org/react` alone adds several hundred KB to the bundle. `openai` adds network and crypto polyfills to the browser bundle. Running two competing MUI versions doubles the component library overhead. |
| **Root cause** | Dependencies were added experimentally and never removed. |
| **Fix direction** | Remove `@nextui-org/react` and `openai` from `package.json`. Remove the unused `HashRouter` import. Consolidate on a single MUI variant — migrate all `@mui/joy` usage to `@mui/material` or vice versa. |

---

#### FE-BUNDLE-07 — No route-level code splitting

| Field | Value |
|---|---|
| **Category** | Frontend / Performance |
| **Severity** | High |
| **Description** | All pages (`Survey`, `Feed`, `Chat`, `ViewProfile`, `EditProfile`, `SignIn`) are imported statically in `App.js` and bundled into the main chunk. The survey imports `face-api.js` and the feed imports `tsparticles` and `framer-motion` — all of these are downloaded even by users who never visit those pages. |
| **At scale** | The initial JS payload includes face recognition model bootstrapping code, confetti particle system code, and the full Framer Motion animation engine — all of which are unnecessary on the sign-in page, which is the first page every user sees. This delays Time to Interactive for all users. |
| **Root cause** | No code splitting strategy was implemented. |
| **Fix direction** | Use `React.lazy` + `Suspense` for all route-level components. Defer `face-api.js` imports to inside the facial verification component itself. Defer `tsparticles` to inside the confetti render path. |

---

### 1.7 Matching System

---

#### MATCH-01 — Full candidate scan on every feed request (no caching)

| Field | Value |
|---|---|
| **Category** | Backend / Matching |
| **Severity** | Critical |
| **Description** | Every call to `POST /feed/` runs the entire scoring algorithm synchronously: fetch all users, filter, score, sort. There is no caching of results. Refreshing the feed page re-runs the full computation. |
| **At scale** | With 10,000 users in a city, a single feed request scans all 10,000 user documents, issues 20,000 additional queries (DB-03), scores all results, and returns the top N. At 100 concurrent feed loads, this is effectively 2,000,000 DB operations per minute. |
| **Root cause** | Caching infrastructure (Redis) was not set up. |
| **Fix direction** | Cache feed results per user in Redis with a TTL (e.g., 10 minutes). Invalidate the cache entry when the user swipes (the set of unseen candidates changes). Pre-compute feeds for recently active users in a background job. |

---

#### MATCH-02 — Matching algorithm runs in application memory, not the database

| Field | Value |
|---|---|
| **Category** | Backend / Matching |
| **Severity** | High |
| **Description** | All filtering and scoring logic is implemented in JavaScript inside the Express route handler. MongoDB is used only to fetch raw documents; all computation happens in memory on a single Node.js thread. |
| **At scale** | A 10,000-user city scan in Node.js memory with complex scoring logic will block the event loop, making the server unresponsive to all other requests for the duration of the computation. This is a critical single-threaded bottleneck. |
| **Root cause** | The algorithm was written as a simple for-loop in the route handler without considering event loop blocking. |
| **Fix direction** | Push filtering into a MongoDB aggregation pipeline (`$match`, `$lookup`, `$addFields` for scoring). This offloads computation to MongoDB's query engine, which can use indexes and runs in parallel. Only the final sort and return remain in Node.js. |

---

#### MATCH-03 — No configurable scoring weights

| Field | Value |
|---|---|
| **Category** | Backend / Matching |
| **Severity** | Low |
| **Description** | Scoring weights (e.g., city = hard filter, hobby overlap = 1 pt, cleanliness = 3 pts) are hardcoded literals in `feed.js`. There is no admin interface, config file, or database-driven weight table. |
| **At scale** | Any change to scoring logic requires a code deployment. As PadPal grows and learns what actually correlates with successful roommate matches, weights need to be tunable without code changes. |
| **Root cause** | Prototyping shortcut — scores were chosen arbitrarily. |
| **Fix direction** | Extract scoring weights into a configuration object in a separate module. In v2, move weights to a database-backed config table that can be updated without deployments. |

---

### 1.8 Chat / Real-Time System

---

#### CHAT-01 — HTTP polling every 3 seconds with no backoff or tab visibility check

| Field | Value |
|---|---|
| **Category** | Frontend / Backend |
| **Severity** | Critical |
| **Description** | `chat/index.jsx` calls `setInterval(fetchData, 3000)` unconditionally. The poll runs even when: the browser tab is in the background, the user is not in a chat room, the network is offline, and there are no new messages. Every poll fetches the full chat history for all conversations. |
| **At scale** | 1,000 concurrent users on the chat page = 333 requests/second to a single Express process, regardless of whether any new messages exist. This is steady-state server load from a polling anti-pattern that produces zero value when nothing has changed. |
| **Root cause** | Polling was used as a quick approximation for real-time behavior. |
| **Fix direction** | Replace polling with WebSockets (Socket.io). The server pushes new messages to connected clients. No polling occurs. As an intermediate step, implement Page Visibility API detection to pause polling when the tab is hidden, and exponential backoff when no new messages are returned. |

---

#### CHAT-02 — No message pagination — full history fetched per conversation per poll

| Field | Value |
|---|---|
| **Category** | Backend / Database |
| **Severity** | Critical |
| **Description** | `POST /chat/getChats` fetches all messages for every conversation the user has, on every call. There is no limit, no offset, and no cursor. A conversation with 2,000 messages returns all 2,000 documents on every 3-second poll. |
| **At scale** | A user with 5 active chats, each with 500 messages, fetches 2,500 message documents from MongoDB every 3 seconds. This scales linearly with both conversation length and concurrent users. |
| **Root cause** | No pagination was implemented. |
| **Fix direction** | Implement cursor-based pagination. On first load, fetch only the last 50 messages. On scroll-up, fetch the next page. On poll, fetch only messages created after `lastFetchTimestamp`. |

---

#### CHAT-03 — AI bot ID hardcoded in the frontend

| Field | Value |
|---|---|
| **Category** | Frontend / Architecture |
| **Severity** | Medium |
| **Description** | The AI chatbot's MongoDB `_id` (`673eed0fd24e7b1c05d6616e`) is hardcoded in `chatRoom/index.jsx`. The check `if (user.id === "673eed0fd24e7b1c05d6616e")` determines whether to route messages to the AI endpoint. |
| **At scale** | Hardcoded IDs make environment management impossible (dev/staging/prod would need different IDs). It also means any database restore that changes this ID silently breaks AI chat for all users. |
| **Root cause** | Quick prototype hack. |
| **Fix direction** | Move the bot ID to a backend-controlled config (returned in the `getChats` response as a `isBotId` flag, or via an environment variable on the frontend). |

---

#### CHAT-04 — No read receipts, delivery status, or message ordering guarantees

| Field | Value |
|---|---|
| **Category** | Architecture / UX |
| **Severity** | Medium |
| **Description** | Messages are stored with a `date` field set client-side (`const today = new Date()` in `sendMessage`). There is no server-assigned timestamp, no delivery acknowledgment, and no monotonic ordering guarantee. |
| **At scale** | Two users sending messages simultaneously can see messages out of order if their clocks differ. On unreliable mobile connections, a message might be sent but no delivery confirmation received, leaving the user unsure if it was delivered. |
| **Root cause** | Real-time messaging semantics were not designed — messages are treated as simple DB inserts. |
| **Fix direction** | Timestamps must be assigned server-side at insertion time. Add a `status` field (`sending`, `sent`, `delivered`, `read`) to the message schema. With WebSockets, the server can emit delivery/read acknowledgments to both parties. |

---

### 1.9 System Architecture

---

#### ARCH-01 — All API URLs hardcoded in 8+ frontend files

| Field | Value |
|---|---|
| **Category** | Architecture |
| **Severity** | High |
| **Description** | Every `fetch` call across `feed/index.jsx`, `chat/index.jsx`, `chatRoom/index.jsx`, `signIn/index.jsx`, `survey/index.jsx`, `editProfile/index.jsx`, `viewProfile/index.jsx`, and `UserCard/index.jsx` has the full URL `https://palpal-api.onrender.com/...` hardcoded as a string literal. |
| **At scale** | Changing the API base URL (e.g., migrating from Render.com, adding a staging environment, or setting up a CDN proxy) requires finding and changing 15+ strings across 8 files. It is impossible to run the frontend against a local backend without editing source code. |
| **Root cause** | No centralized API client was created during prototyping. |
| **Fix direction** | Create a single `src/api/client.js` module that exports a configured `fetch` wrapper (or an `axios` instance) with the base URL read from `process.env.REACT_APP_API_URL`. All fetch calls import from this module. |

---

#### ARCH-02 — No separation of concerns between data fetching and UI

| Field | Value |
|---|---|
| **Category** | Architecture |
| **Severity** | High |
| **Description** | Every page component contains: fetch logic, loading states, error handling, business logic, and JSX rendering — all co-located in a single file. There is no separation between "what data is needed" and "how it is displayed". |
| **At scale** | This makes the codebase increasingly difficult to test, maintain, and parallelize development on. It also makes server-side rendering or React Native migration impossible without a complete rewrite of every page. |
| **Root cause** | Standard early-stage React development pattern without architectural discipline. |
| **Fix direction** | Separate data fetching into custom hooks (`useFeedData`, `useChatData`). Separate business logic from rendering. With React Query this emerges naturally — hooks own data fetching, components own rendering. |

---

#### ARCH-03 — Render.com free tier sleeps on inactivity

| Field | Value |
|---|---|
| **Category** | Architecture / Infrastructure |
| **Severity** | High |
| **Description** | The backend is deployed on Render.com's free tier, which spins down after 15 minutes of inactivity. The first request after sleep incurs a 30–60 second cold start. |
| **At scale** | Any user who opens PadPal outside of peak hours hits a 30-60 second loading screen. This is an unacceptable UX for a consumer app with real users. |
| **Root cause** | Cost optimization during prototype phase. |
| **Fix direction** | Upgrade to Render.com's paid tier (always-on), or migrate to a platform with better cold-start characteristics (Railway, Fly.io, AWS App Runner). Implement a health-check endpoint and use a free service (UptimeRobot) to ping it every 10 minutes as a temporary workaround. |

---

#### ARCH-04 — No caching layer (Redis)

| Field | Value |
|---|---|
| **Category** | Architecture |
| **Severity** | High |
| **Description** | There is no caching layer anywhere in the system. Feed scores are recomputed from scratch on every request. User profile data is re-fetched from MongoDB on every page load. Chat history is re-fetched in full on every poll cycle. |
| **At scale** | Without caching, every user action results in MongoDB reads. MongoDB is not designed to be a real-time cache — it excels at persistent storage but becomes a bottleneck when used as a hot read store for high-frequency polling. |
| **Root cause** | Redis was identified as needed but not set up. |
| **Fix direction** | Add Redis (Upstash serverless Redis works well with Render). Cache: (1) feed results per user (TTL: 5 minutes, invalidated on swipe), (2) user profile data (TTL: 10 minutes), (3) chat conversation lists (TTL: 30 seconds, or replace with WebSocket events). |

---

#### ARCH-05 — Single Express process, no horizontal scaling strategy

| Field | Value |
|---|---|
| **Category** | Architecture |
| **Severity** | Medium |
| **Description** | The backend is a single Node.js Express process with no clustering, no load balancing, and no stateless design patterns. Node.js is single-threaded for CPU work. |
| **At scale** | A CPU-intensive feed scoring operation blocks all other in-flight requests. Adding more servers requires all instances to share state (sessions, cache), which is not currently designed for. |
| **Root cause** | Single-server prototype. |
| **Fix direction** | Ensure all server state is externalized (tokens in HTTP cookies, sessions in Redis, no in-memory state). Use Node.js `cluster` module or a process manager to use all CPU cores. Design for stateless horizontal scaling behind a load balancer. |

---

#### ARCH-06 — No structured logging or error tracking

| Field | Value |
|---|---|
| **Category** | Architecture / Observability |
| **Severity** | High |
| **Description** | The backend has no structured logging (only `console.log`). The frontend has no error tracking. There is no way to know when errors occur, how frequently, or which users are affected. |
| **At scale** | With real users, silent failures (failed image uploads, dropped messages, broken matches) become invisible. There is no way to detect regressions after deployments. |
| **Root cause** | Observability infrastructure was not set up. |
| **Fix direction** | Add `pino` or `winston` for structured JSON logging on the backend. Add Sentry to both frontend and backend for error tracking and performance monitoring. Add request ID correlation headers to trace requests across logs. |

---

### 1.10 UX & Product Gaps

---

#### UX-01 — No email verification on registration

| Field | Value |
|---|---|
| **Category** | UX / Security |
| **Severity** | High |
| **Description** | Users can register with any email address without verification. Bots, fake accounts, and duplicate registrations are trivially possible. |
| **At scale** | A roommate platform requires trust. Without email verification, users cannot trust that the person they are matched with is reachable at the claimed email. Fake profiles degrade match quality for all real users. |

---

#### UX-02 — No password reset flow

| Field | Value |
|---|---|
| **Category** | UX |
| **Severity** | High |
| **Description** | There is no "Forgot Password" flow. A user who forgets their password is permanently locked out of their account with no self-service recovery path. |
| **At scale** | Password reset requests are among the top 3 user support tickets for any consumer app. Without it, every locked-out user requires manual intervention or simply churns. |

---

#### UX-03 — No onboarding resume — survey progress lost on navigation

| Field | Value |
|---|---|
| **Category** | UX |
| **Severity** | High |
| **Description** | The 16-step survey stores all answers in React component state with no persistence. Navigating away, closing the tab, or session expiry mid-survey loses all progress. The user must restart from step 1. |
| **At scale** | Survey completion rates in apps with no resume are significantly lower. A 16-step survey with photo upload and facial verification is long — users on mobile will frequently be interrupted. Every lost survey is a lost user. |

---

#### UX-04 — No push notifications for new matches or messages

| Field | Value |
|---|---|
| **Category** | UX |
| **Severity** | High |
| **Description** | Users have no way to be notified of new matches or messages unless they have the app open. The only discovery mechanism is polling while the app is in the foreground. |
| **At scale** | Engagement on roommate-matching apps is driven by the "you have a match!" moment. Without push notifications, the match moment only happens if both users happen to have the app open simultaneously. Engagement and retention will be poor. |

---

## 2. Prioritized Scaling Roadmap

---

### Phase 1 — Critical Fixes (Before Any Real Users)

All items in Phase 1 are **correctness or security blockers**. The system should not be opened to real users without completing this phase.

---

#### 1.1 — Enforce JWT authentication on all routes
Apply `verifyAccessToken` middleware to all routers. Remove `_id`/`from`/`to` user identification from request bodies — replace with values from the verified token payload.
*Commits: 1 per route file + 1 for middleware wiring*

#### 1.2 — Fix mass-assignment vulnerability in `POST /auth/survey`
Replace `$set: req.body` with `$set: { field1, field2, ... }` using an explicit allowlist. Add `password` and `email` to a blocklist of fields that can never be updated via this endpoint.
*Commits: 1*

#### 1.3 — Rotate secrets and fix `.gitignore`
Add `.env` and `.env.*` to `.gitignore`. Rotate MongoDB URI, JWT secret, and Gemini API key immediately. Scrub git history of committed secrets.
*Commits: 1 for `.gitignore`, plus secret rotation outside git*

#### 1.4 — Fix `editProfile` update payload (`agePreferences.current` bug)
Change `agePreferences.current` → `agePreferences` and `budget.current` → `budget` in the `updateUser` function.
*Commits: 1*

#### 1.5 — Fix `signIn` `setTimeout` memory leak
Move the 2-second `setTimeout` inside a `useEffect(() => { ... }, [])` with a `clearTimeout` cleanup return.
*Commits: 1*

#### 1.6 — Fix `bcrypt-nodejs` → `bcryptjs`
Replace the deprecated `bcrypt-nodejs` package with `bcryptjs`. Fix the undefined `error` variable in the pre-save hook.
*Commits: 1*

#### 1.7 — Fix `expectedMoveOut` type inconsistency
Standardize as a `Date` scalar throughout schema, all route handlers, and frontend. Remove all `[0]` array-access patterns.
*Commits: 1 backend, 1 frontend*

#### 1.8 — Fix `smokerPreferences` duplicate schema key
Remove the duplicate definition in `userModels.js`. Verify intended type.
*Commits: 1*

#### 1.9 — Fix `DELETE /auth/logout` undefined variable crash
Rename `error` → `err` in the catch block (or vice versa) to fix the `ReferenceError`.
*Commits: 1*

#### 1.10 — Fix `POST /auth/register` to issue a real refresh token
Replace the second `signAccessToken` call with `signRefreshToken`. Wire up the frontend to call `POST /auth/refreshToken` before token expiry.
*Commits: 2 (backend fix + frontend token refresh)*

#### 1.11 — Reduce `express.json` limit to `~1mb`
After images are moved to object storage (Phase 2 item 2.1), reduce `express.json({ limit: "50mb" })` to `~1mb`. As an immediate stopgap, add `express-rate-limit` to all auth routes.
*Commits: 1*

#### 1.12 — Fix `viewProfile` passing single user as `users` map
Wrap the user object in the expected email-keyed format before passing to `UserCard`, or add a guard in `isKeyLast`.
*Commits: 1*

#### 1.13 — Fix `handleKeyPress` stale closure in `UserCard`
Wrap `handleKeyPress` in `useCallback`. Add appropriate dependencies. Ensure only the front card attaches keyboard listeners.
*Commits: 1*

#### 1.14 — Fix duplicate question `id: 19` in `survey/questions.js`
Assign unique IDs to all questions. Add a build-time assertion.
*Commits: 1*

#### 1.15 — Fix `isLastItem` bug in `chatRoom` (`SortedMessages.length`)
Replace `user.SortedMessages.length` with `Object.keys(user.SortedMessages).length`.
*Commits: 1*

#### 1.16 — Add async error handling to all Express route handlers
Create an `asyncHandler(fn)` utility wrapper. Wrap all async route handlers. Add a global Express error middleware that returns sanitized JSON error responses.
*Commits: 1 for utility + 1 per route file*

#### 1.17 — Apply Joi validation to register and login routes
Wire up the existing `validationSchema.js` to `POST /auth/register` and `POST /auth/login`.
*Commits: 1*

#### 1.18 — Remove dead base64 artifact from `chatRoom/index.jsx`
Delete the `const sampleImg = "data:image/jpeg..."` constant at the bottom of the file.
*Commits: 1*

---

### Phase 2 — Scaling Improvements

Phase 2 items address performance and architectural issues that will prevent the system from handling real traffic. These are not emergency fixes but become blockers as user count grows past dozens.

---

#### 2.1 — Migrate images from MongoDB base64 to object storage
Implement an image upload flow where the client uploads directly to S3/Cloudflare R2 (via presigned URLs). Store only the CDN URL in the `image` field. Write a one-time migration script for existing base64 documents.
*Commits: 3–5 (backend upload endpoint, frontend upload flow, migration script, schema update)*

#### 2.2 — Add database indexes to all hot query paths
Add compound indexes: `matches(from, to)`, `matches(from, isAMatch)`, `chats(from, to, date)`, `images(owner)`, `users(city, gender, expectedMoveOut)`. Use `explain()` before and after to measure improvement.
*Commits: 1 per model file*

#### 2.3 — Fix N+1 query in `POST /feed/` with aggregation pipeline
Rewrite the feed endpoint as a single MongoDB aggregation that joins matches and images inline, filters already-swiped users, scores, and sorts. Benchmark before/after.
*Commits: 2 (aggregation rewrite + tests)*

#### 2.4 — Add Redis caching for feed results
Set up Redis (Upstash for serverless). Cache feed results per user with a 5-minute TTL. Invalidate on swipe. Add cache-hit/miss logging.
*Commits: 2 (Redis setup + feed caching)*

#### 2.5 — Create a centralized frontend API client module
Create `src/api/client.js` with a configured `fetch` wrapper reading `REACT_APP_API_URL` from the environment. Replace all 15+ hardcoded URL strings across all components.
*Commits: 1 for client module + 1 per page file*

#### 2.6 — Add message pagination to `POST /chat/getChats`
Add `limit` and `before` cursor parameters to the chat endpoint. On initial load, return only the last 50 messages. On scroll, load the next page. On poll, return only messages after `lastSeen`.
*Commits: 2 (backend pagination + frontend cursor management)*

#### 2.7 — Replace chat polling with WebSockets (Socket.io)
Add Socket.io to the backend. Emit `new_message` events to connected users. Remove the 3-second `setInterval` from the frontend. Implement reconnection with exponential backoff.
*Commits: 4–6 (backend setup, auth middleware for socket, frontend disconnect/reconnect, room management)*

#### 2.8 — Implement route-level code splitting
Wrap all routes in `App.js` with `React.lazy` + `Suspense`. Move `face-api.js` imports inside the facial verification component to a dynamic `import()`. Add `React.Suspense` fallback loading states per route.
*Commits: 1*

#### 2.9 — Remove duplicate dependencies and consolidate UI libraries
Remove `@nextui-org/react`, `openai`, `react-bootstrap` from `package.json`. Remove unused `HashRouter` import. Consolidate to a single MUI variant (`@mui/material` only; remove `@mui/joy`).
*Commits: 1 per library removal + migration of any used Joy components*

#### 2.10 — Resolve dual build pipeline (CRA vs. Webpack 5)
Commit to Webpack 5 as the sole build tool. Remove `react-scripts` and `react-app` ESLint config. Update `npm start` to use `webpack serve`. Add proper HMR configuration.
*Commits: 2 (Webpack config cleanup + dependency removal)*

#### 2.11 — Add client-side data caching with React Query
Install and configure `@tanstack/react-query`. Convert all `useEffect`-based fetch patterns to React Query hooks (`useQuery`, `useMutation`). This provides automatic deduplication, background revalidation, and optimistic updates.
*Commits: 1 per page*

#### 2.12 — Move facial verification to the backend
Replace client-side `face-api.js` with a server call to AWS Rekognition or Azure Face API. Remove all face-api model files from `public/models/`. Remove `face-api.js` and `react-webcam` from the bundle.
*Commits: 3 (backend verification endpoint, frontend UI update, remove models)*

#### 2.13 — Replace `window.location` navigation with React Router `useNavigate`
Replace all `window.location = "..."` assignments with `useNavigate` calls. This enables SPA-style navigation and eliminates full-page reloads on route changes.
*Commits: 1 per file*

#### 2.14 — Add `React.memo` and `useCallback` to feed card stack
Wrap `UserCard` in `React.memo`. Wrap all callback props in `useCallback`. Add `useMemo` to `Object.entries(users)`.
*Commits: 1*

#### 2.15 — Add `useWindowWidth` hook and remove inline `window.innerWidth`
Create a `useWindowWidth` hook that subscribes to `resize`. Replace all `window.innerWidth` reads in render functions.
*Commits: 1*

---

### Phase 3 — Production Hardening

Phase 3 items address observability, UX completeness, resilience, and long-term reliability. These are important for a sustainable production system but are not blockers for initial launch with real users.

---

#### 3.1 — Add structured logging with `pino`
Replace all `console.log` calls in the backend with `pino` structured JSON logs. Add request ID middleware (`express-request-id`). Log all errors with stack traces, user IDs (from token), and route context.
*Commits: 2 (pino setup + replace console.log per route file)*

#### 3.2 — Add Sentry error tracking to frontend and backend
Install `@sentry/react` and `@sentry/node`. Configure source maps. Add Sentry to the Express error middleware. Add Sentry React Error Boundary to `App.js`.
*Commits: 2*

#### 3.3 — Add rate limiting to all API routes
Install `express-rate-limit`. Add strict limits to auth routes (5 requests/15 min per IP). Add general limits to all other routes (100 requests/minute per user). Add Redis-backed rate limiting for multi-instance deployments.
*Commits: 1*

#### 3.4 — Add email verification on registration
Implement email verification: send a confirmation email with a signed link on registration. Block access to the survey/feed until email is confirmed. Use a transactional email provider (Resend, SendGrid).
*Commits: 3–4*

#### 3.5 — Add password reset flow
Implement "Forgot Password": collect email, send a signed reset link, validate the token, allow password update. Use time-limited tokens (15 minutes) signed with the JWT secret.
*Commits: 3–4*

#### 3.6 — Add onboarding progress persistence
Save survey answers to `localStorage` (or a partial user record in the DB) on every step. Resume from the last completed step if the user returns.
*Commits: 2*

#### 3.7 — Upgrade backend hosting from Render.com free tier
Migrate to Render.com paid tier, Railway, or Fly.io for always-on hosting. Add a health check endpoint at `GET /health`. Configure uptime monitoring.
*Commits: 0 (infrastructure change)*

#### 3.8 — Add push notifications (Web Push / Firebase)
Implement Web Push Notifications using the Web Push Protocol (or Firebase Cloud Messaging). Send notifications on: new match, new message (when app is in background), match expiry reminders.
*Commits: 4–6*

#### 3.9 — Store JWT in `HttpOnly` cookie server-side
Move token issuance and storage to the backend. Set `HttpOnly; Secure; SameSite=Strict` cookies server-side. Remove `js-cookie` from the frontend for auth tokens.
*Commits: 2 (backend cookie setter + frontend removal)*

#### 3.10 — Add account deletion with full data purge
Implement `DELETE /auth/account`: delete user document, all matches, all messages, all images (from object storage and DB). Implement on frontend with confirmation modal.
*Commits: 2*

#### 3.11 — Add missing empty and error states across all pages
Add: "no more candidates" state on Feed (already partially present but unstyled). "Failed to load" error state on Feed, Chat, ViewProfile. "Send failed" inline error in ChatRoom. "Save failed" error in EditProfile.
*Commits: 1 per page*

#### 3.12 — Replace CRA default metadata in `manifest.json` and `index.html`
Update app name, description, theme color, icons, and `og:` meta tags to PadPal branding.
*Commits: 1*

#### 3.13 — Add ARIA labels and keyboard accessibility
Audit all interactive elements. Add `aria-label` to all icon buttons (send, back, settings, swipe controls). Ensure modals use focus traps. Add `role` attributes where needed.
*Commits: 1 per page*

#### 3.14 — Remove all `console.log` from production frontend code
Add an ESLint rule (`no-console`) configured as an error. Add a Webpack production plugin that strips all `console.*` calls (`terser` option `drop_console`).
*Commits: 1*

#### 3.15 — Add TTL indexes on match and chat data for data hygiene
Add a MongoDB TTL index to left-swipe match records (expire after 6 months). Add archival logic for chats in unmatched conversations.
*Commits: 1*

---

## 3. PRD Updates

The following items were discovered during the code audit and are not fully captured in the current PRD. They are recorded here for integration into the PRD.

---

### New Technical Findings

**Dual build pipeline (not documented):**
The project has two parallel build systems: CRA (`react-scripts`) for development and a custom Webpack 5 pipeline for production builds. The Webpack config also has a duplicated `devServer` key and a second entry point (`feed/index.jsx`) that causes module duplication in the output bundle. These are separate issues from the ones already documented.

**`face-api.js` runtime model download cost (partially documented):**
The PRD mentions facial verification but does not document the runtime cost: 8+ ML model shards totaling over 20 MB are downloaded synchronously during the facial verification step. This cost appears on every onboarding attempt, including retries. The models are served from the Render.com origin with no CDN caching headers.

**`handleKeyPress` creates multiple concurrent event listeners (not documented):**
Because `handleKeyPress` is defined inside `UserCard` and listed as a `useEffect` dependency, every render of every `UserCard` in the stack attaches a new `keydown` listener to `document`. This means keyboard swipes trigger N simultaneous actions (one per card) instead of one.

**`SortedMessages.length` is always `undefined` (not documented):**
`SortedMessages` is a plain JavaScript object. `.length` on a plain object is always `undefined`. The `isLastItem` calculation in `chatRoom` is always `false`, meaning the last message's date grouping is never rendered for any user.

**`window.location` as navigation (not documented):**
The PRD documents the architecture but does not note that page navigation uses full browser reloads (`window.location = "..."`) rather than React Router's client-side navigation. This affects every route transition.

**`POST /auth/register` issues two access tokens (documented as a bug but root cause is deeper):**
The second `signAccessToken` call in `register` means two different access tokens are returned from the same registration call. The client only stores the second one (`data.accessToken`). The refresh token infrastructure (`jwtHelper.signRefreshToken`) is completely built but entirely unwired.

---

### Clarifications Needed

**Multi-city support:** The `city` field is `[String]` in the schema, suggesting multi-city was planned. However, the feed filter uses an equality match that only works for single-value arrays. A product decision is needed: does PadPal support users who are open to multiple cities? If so, the schema type, filter logic, and UI all need updates.

**`/auth/onboarded` endpoint:** A call to this endpoint is commented out in the survey component. It is unclear whether this endpoint exists on the backend, what it was intended to do (set a flag to prevent re-showing onboarding?), and whether it needs to be restored or removed.

**Facial verification threshold:** The current threshold for face match is `distance < 0.6` (Euclidean distance in 128-d descriptor space). This threshold has not been empirically validated for PadPal's population. A too-strict threshold will block real users; too-lenient will allow fake IDs. A product decision and possibly A/B testing is needed to calibrate this.

**`expectedMoveOut` semantics:** The schema stores this as a `Date`, but users are asked for their expected move-out date (when they plan to leave their current housing), which is used both to filter expired candidates (past move-outs) and as a soft-score signal (same calendar month as current user). It is ambiguous whether this field represents "when I need to move" or "when I can move in." This distinction affects the scoring logic and the filter (the current filter excludes users whose `expectedMoveOut` is in the past, which only makes sense if this represents a deadline, not a preference).

---

*End of audit. Last updated: May 10, 2026.*
