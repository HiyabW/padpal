# Vacancy Listings (Rooms Feed) — Design Spec

**Version 1.0 | June 8, 2026**  
**Status:** Approved for implementation planning  
**Repositories:** `padpal` (frontend) · `palpal-api` (backend)  
**Related:** `docs/product/PRD.md` · [Stakeholder PRD (Google Docs)](https://docs.google.com/document/d/12UL-DqKEXc8nN2uUIZVKX8IPAt3bseJEuadpGY7i_N4/edit)

---

## 1. Summary

PadPal adds a **Rooms** experience for the most common underserved roommate scenario: **filling one vacancy in an existing home**. Households create a listing, invite current tenants, and swipe on individuals looking to join. Seekers browse listing cards and swipe on homes. Match semantics mirror dating apps: **match opens a conversation, not a lease**.

This spec extends the existing user↔user feed (Home tab) without replacing it.

---

## 2. Product Principles

| Principle | Implementation |
|---|---|
| Match = conversation permission | Copy and UI never imply lease commitment |
| Feed separation = opt-in | No profile flag; choosing Rooms mode is the opt-in |
| Equal tenant authority | All accepted tenants swipe, edit, unmatch |
| Automate where possible | Draft save, instant reactivation, auto-transfer on leave |
| Beta-friendly matching | Per-tenant pass; any-one-tenant can create match |
| Privacy by default | Neighborhood public; full address never in-app |

---

## 3. Navigation & Feeds

```
Nav: [Home]  [Rooms]  [Chat]  [Profile]

Home (always available)
  └─ User ↔ User — find one roommate + new place together

Rooms (either/or — set at first setup; switch via Settings + confirmation)
  ├─ "I have a vacancy"  → Listing → User (swipe on seekers)
  └─ "I want to fill"    → User → Listing (swipe on homes)

Chat — 1:1 user matches, listing group chats, AI bot
```

- **Home + one Rooms mode** can run simultaneously (e.g. Sarah has a listing and browses Home if considering leaving).
- **Two Rooms modes** are mutually exclusive.
- First Rooms visit: entry screen. After setup: straight to active feed.
- **"+ Add your own listing"** on seeker feed = mode switch with confirmation.

---

## 4. Onboarding (Updated)

### Required at signup
- Age, age preferences
- City, budget
- Gender, gender preferences
- `@username` (unique handle)
- Phone (for SMS listing invites)

### Optional (Settings — improves scoring/badges)
- Hobbies, pets, smoking, cleanliness, guests
- Bio, profile photos
- Identity verification

### Terms & Conditions
- Linked at signup: "By signing up, you agree to our Terms and Conditions"
- Fair-housing language required in legal draft

---

## 5. Listing Creation Wizard

Draft-save at every step. Status `DRAFT` until go-live gate passes.

| Step | Fields |
|---|---|
| 1. Home basics | Private full address (dedup key), bed/bath, public neighborhood, rent, move-in date, lease type |
| 2. Photos + About | ≥1 home photo, description |
| 3. Ideal candidate | Prefs for hard/soft filters (gender prefs, lifestyle fields) |
| 4. Roommates | `@username` for existing users; SMS (preferred) or email invite for others |
| 5. Review | Submit |

### Go-live gate
- All required listing fields complete
- Creator + ≥1 **accepted** co-tenant
- Pending invitees may show as "Pending" on card; cannot swipe until accept

### Address dedup
- One **live** listing per normalized address
- Duplicate attempt → "Join existing listing?"
- New listing at same address only after prior listing **archived**

---

## 6. Roommate Invites

| Channel | Priority |
|---|---|
| SMS deep link | Preferred |
| Email | Fallback |
| In-app banner (Home/Profile) | Required for beta |
| Rooms tab badge | Secondary |

- Invite requires **accept** before tenant appears on public card or gains swipe authority
- Notifications: same invite object powers all channels

---

## 7. Listing Lifecycle

```
DRAFT → LIVE → ARCHIVED
         ↑         ↓
         └── instant reopen (no re-accept)
```

| Trigger | Result |
|---|---|
| Manual "Vacancy filled" | Archive; leaves seeker feed |
| 2–3 weeks no login | Auto-archive |
| Mode switch / leave household | Auto-transfer to remaining tenants; archive if nobody left |
| Depop-style reactivation popup | User picks what to restore (individual profile, listing, seeker mode) |

### Tenant management
- Any accepted tenant edits anything (last save wins)
- Any accepted tenant may remove another (confirmation + notify); listing stays live
- Creator leave / mode switch: auto-transfer to remaining accepted tenants

---

## 8. Swipe & Match Rules (Beta)

| Action | Behavior |
|---|---|
| **Pass (tenant)** | Removes candidate from **that tenant's** feed only — silent, no popup |
| **Pass (seeker on listing)** | Removes listing from seeker's feed |
| **Like (tenant)** | Recorded per tenant |
| **Like (seeker)** | Recorded per seeker per listing |
| **Match** | Any tenant right + seeker right on listing → auto **group chat** |
| **Unmatch** | Household-wide — one confirmation dialog |
| **Concurrent matches** | Unlimited until "Vacancy filled" |
| **Seeker multi-match** | Yes — multiple listings simultaneously |

**Post-beta consideration:** optional household-wide veto (one pass blocks for all tenants).

---

## 9. Compatibility & Scoring

### Hard filters (same as user↔user)
- City, gender prefs, budget range, move-in timing
- Exclude already-swiped entities

### Soft score
- Existing point system from `feed.js`
- **Badge:** top 3–4 traits where seeker overlaps the most tenants
- Copy: *"You and one or more roommates like: fashion, makeup, photography"*

### Privacy
- Public card: neighborhood + city only
- Full address: shared manually in chat by household — **never in-app**

---

## 10. Chat (Group)

- On listing match: auto-create group chat with seeker + all accepted tenants
- Extends existing Chat model with `type: group`, `participants[]`, `listingId`
- Chats persist through listing archive
- Pass history not shown to seeker

---

## 11. Safety (Beta Minimum)

- **Report/block** on users and listings
- **Image moderation** on upload (Google Cloud Vision SafeSearch or AWS Rekognition) for profile and home photos
- Terms & Conditions at signup

---

## 12. Architecture (Approach 1 — Extend Existing Models)

### New entities

**Listing**
- `addressNormalized`, `neighborhood`, `city`, `bed`, `bath`, `rent`, `moveInDate`, `leaseType`, `about`, `idealCandidatePrefs`, `photos[]`, `status`, `createdBy`, `tenants[]`

**ListingInvite**
- `listingId`, `inviterId`, `inviteePhone|email|username`, `status`

**Match** (extended)
- `type`: `user` | `listing`
- `listingId`, `seekerId`, `triggeringTenantId`, `participants[]`

**Chat** (extended)
- `type`: `direct` | `group`
- `participants[]`, `listingId?`, `matchId`

**User** (extended)
- `username`, `phone`, `roomsMode`: `null` | `creator` | `seeker`, `lastActiveAt`

### New API routes (indicative)
- `POST /listings/create|update|archive|reactivate`
- `POST /listings/invite|accept|decline|removeTenant`
- `POST /listings/feed` (seeker)
- `POST /listings/candidates` (creator)
- `POST /match/saveListingSwipe` | `getListingMatch`
- Extend `POST /chat/*` for group threads

---

## 13. Empty States & Beta Defaults

| State | CTA |
|---|---|
| No listings in city | "No listings in [city] yet" + guidance |
| No seekers | "No candidates yet" + enrich profile prompt |
| Listing card detail | Scrollable card (like UserCard) — no separate detail page for beta |
| Pending invites on archive | Cancelled; re-sent on reactivation if user opts in |

---

## 14. Post-Beta Backlog

- Household-wide pass veto (optional setting)
- Push notifications
- Pass-in-chat UX polish (tenant who passed still in group chat)
- Legal review of fair-housing copy in T&C
- Photo moderation manual review queue

---

## 15. Decision Log

| # | Decision |
|---|---|
| 1 | Any-one tenant + seeker mutual like = match |
| 2 | Auto group chat on match |
| 3 | Invite + accept for co-tenants; SMS preferred |
| 4 | Go live: creator + 1 accepted; pending OK for others |
| 5 | Group modes mutually exclusive; Home always available |
| 6 | No opt-in flag — feed choice is opt-in |
| 7 | Mode switch: archive/transfer rules; instant reactivation |
| 8 | All listing fields required; draft save anytime |
| 9 | Weighted compatibility badge (top 3–4 traits) |
| 10 | `@username` + SMS/email invite |
| 11 | Manual close + auto-archive; Depop reactivation |
| 12 | Same hard filters as user↔user |
| 13 | One listing per address; join if live |
| 14 | Address private; neighborhood public; never in-app |
| 15 | Rooms entry once; switch in settings |
| 16 | Equal edit rights; tenant removal with notify |
| 17 | Per-tenant pass for beta |
| 18 | Unlimited matches until filled; seekers multi-match |
| 19 | Report/block + image moderation |
| 20 | Required onboarding slimmed; lifestyle optional in settings |
