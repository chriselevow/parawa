# Deep Functional Review

Date: 2026-07-08
Scope: Parawa clickable prototype at `http://localhost:3300`

## Review Method

- Reviewed primary routes: landing, login, discover, provider profile, bookings, messages, provider dashboard, admin bookings.
- Checked current code paths for mock data, dead controls, role routing, and Firebase integration gaps.
- Verified Firebase inventory separately: Firestore has real `users`, `services`, `bookings`, `reviews`, `provider-slots`, `enterprise`, and `punctuality_evalution`; local app still uses mock data.

## Findings Fixed

1. Discover search and category filters were static.
   - Fix: Added a client-side discover experience with real filtering, result count, reset, and empty state.

2. Chat input looked functional but did not send anything.
   - Fix: Added local message sending with an immediate demo provider reply.

3. Booking confirmation jumped to reservations without feedback.
   - Fix: Added a confirmation state explaining what will happen once Firebase writes are enabled.

4. Completed booking review action was decorative.
   - Fix: Added a review modal with star selection, comment field, and submitted state.

5. Landing and login account CTAs implied a real signup route that does not exist.
   - Fix: Retargeted copy and links to role-based demo login.

6. Admin booking detail action was decorative.
   - Fix: Added a booking detail modal.

7. Chat lacked product context.
   - Fix: Added conversation metadata, provider avatar, booking status, booking context card, quick replies, sent/read-style metadata, attachment affordance, and direct links to booking/provider.

8. Booking detail was missing as a first-class screen.
   - Fix: Added `/bookings/[id]` with status timeline, payment, location, notes, summary, provider link, chat link, and review action.

## Remaining Functional Gaps

1. Firebase Auth is not connected.
   - Current behavior: role cookie demo.
   - Needed: Firebase Auth sign-in, role claims/profile lookup, protected routes based on real user identity.

2. Firestore data is not used by UI.
   - Current behavior: `lib/mock-data.ts` and `lib/admin-mock-data.ts`.
   - Needed: read-only adapters for `users`, `services`, `bookings`, `reviews`, and `provider-slots`.

3. Writes are not persisted.
   - Current behavior: booking, review, and message states are local demo flows.
   - Needed: create booking, update booking status, create review, and create chat/message records.

4. Messaging schema is unclear.
   - Current Firebase inventory did not show a clear messages collection.
   - Needed: decide whether to add `threads`/`messages` collections or reuse an existing source not yet identified.

5. Provider dashboard uses demo metrics.
   - Current behavior: dashboard is realistic but computed from local constants.
   - Needed: derive metrics from bookings, services, reviews, and provider slots.

6. Storage assets are not rendered.
   - Current Firebase Storage has provider/service assets.
   - Needed: map service/user image paths to public or signed URLs and render them in cards and profiles.

## Recommended Next Step

Implement read-only Firebase adapters first. Pull real services, providers, bookings, reviews, and images into the current UI without creating or mutating production data. Once the live read model is stable, add writes one workflow at a time.
