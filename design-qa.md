# Design QA

- source visual truth path: unavailable; no separate source mock, screenshot, Figma frame, or reference image was provided for this navigation refactor.
- implementation screenshot path: not captured; formal visual comparison is blocked until a source visual target exists.
- viewport: current local prototype at `http://localhost:3300`, desktop route checks.
- state: refactored navigation IA and mock role-session flow for client, provider, admin, login, and landing surfaces.
- full-view comparison evidence: blocked. There is no source visual target to place beside the implementation.
- focused region comparison evidence: blocked for the same reason. Focus regions should cover header navigation, admin sidebar, provider dashboard header, and login entry controls once a visual target is available.

## Findings

- [P2] Formal visual QA cannot compare fidelity without a source visual target.
  Location: navigation refactor across `PrototypeShell`, `AdminShell`, and `LandingShell`.
  Evidence: the implementation is available locally, but no reference mock or screenshot was supplied for side-by-side comparison.
  Impact: route behavior can be verified, but visual fidelity cannot be marked passed under the Product Design QA contract.
  Fix: provide a screenshot, Figma frame, mockup, or approved source capture for the intended navigation states, then rerun visual QA.

## Patches Made Since Previous QA Pass

- Removed the cross-role workspace switcher from product surfaces.
- Scoped client navigation to `Servicios`, `Reservas`, and `Mensajes`.
- Scoped provider navigation to `Panel`, `Solicitudes`, and `Perfil`.
- Scoped admin navigation to admin-only dashboard, providers, bookings, users, and verifications.
- Removed public/admin/provider cross-role controls from admin.
- Kept `Entrar` on public landing/login surfaces only.
- Retargeted the provider public-profile preview to `/providers/maria-nails`.
- Added mock role cookie handling for `client`, `provider`, and `admin`.
- Added `proxy.ts` route guards for provider, admin, bookings, and messages.
- Added role-aware login actions with safe next-path routing.
- Added Firebase-backed demo identity selection to role login so client,
  provider, and message surfaces can filter by a stable example user before
  real Firebase Auth is connected.
- Added role-specific sign out controls that appear only when the matching mock role is active.
- Redesigned the provider dashboard into a higher-end operational surface inspired by Firebase/Cloud dashboards: status header, KPI scorecards, request queue, daily agenda, profile health, service performance, and recent activity.
- Kept provider navigation scoped to provider-only destinations while preserving the `/provider#solicitudes` and `/provider#perfil` anchors.
- Tightened the provider request-card action area after screenshot review: actions now sit in a compact horizontal row instead of a heavy vertical rail.
- Added client-side shell navigation state so provider hash anchors can mark `Solicitudes` or `Perfil` active instead of always highlighting `Panel`.
- Reduced provider nav and sign-out button sizing for narrow viewports.
- Added read-only Firebase data-fit polish after live Firestore wiring: provider dashboard now chooses the most data-rich provider while role cookies are mock-only, uses empty states instead of demo requests when live data has no active work, and keeps Firebase placeholder values like `First Last` and `noCancellationPolicy` out of visible UI.
- Updated discover filtering so Firebase providers can match every normalized service category attached to them, not only their primary category.
- Capped the first client bookings view to 24 visible reservations with a clear total count, keeping the mobile surface usable when Firebase returns hundreds of bookings.
- Promoted provider detail and booking detail titles to real `h1` elements.
- Filtered client reservations, booking detail, and chat lists by the selected
  demo identity, and filtered the provider dashboard by the selected provider
  identity.
- Added data-volume controls for Firebase-sized admin and discovery surfaces:
  full admin booking rows now feed `/admin/bookings`, while bookings,
  providers, users, and discover results render bounded first pages with total
  counts, hidden-count notices, wrapping table cells, and empty states.
- Added URL-backed admin list controls for bookings, providers, and users:
  search, filter, clear, and pagination now preserve state through query params
  and browser navigation.

## Latest Responsive/Data-Fit Evidence

- Mobile viewport `390x844`: `/discover`, `/bookings`, `/messages`, `/provider`, `/admin/bookings`, `/admin/providers`, and `/admin/users` reported `0` page-level horizontal overflow with live Firebase env.
- Desktop viewport `1280x900`: `/discover`, a live `/providers/[id]`, `/bookings`, a live `/bookings/[id]`, `/provider`, `/admin`, `/admin/bookings`, `/admin/providers`, `/admin/users`, and `/admin/verifications` reported `0` page-level horizontal overflow.
- Live Firebase provider dashboard showed `Datos Firebase activos` and no `Mock local activo`.
- Live detail checks found no visible `First Last` or `noCancellationPolicy` placeholders.
- Production builds passed both without Firebase env and with the read-only Firebase service account env.
- Admin bookings/providers/users and discover now avoid unbounded first render
  lists by showing capped first pages with explicit counts for additional
  Firebase rows.
- New data-volume smoke checks passed at `390x844` and `1280x900` for
  `/admin/bookings`, `/admin/providers`, `/admin/users`, and `/discover`, with
  `0` page-level horizontal overflow; `/admin/verifications` also passed at
  `390x844`.
- URL-backed admin controls passed filtered/paginated smoke checks at `390x844`
  and `1280x900` for `/admin/bookings?filter=pending&q=PAR&page=1`,
  `/admin/providers?filter=verified&q=a&page=1`, and
  `/admin/users?filter=provider&q=a&page=1`; the filtered empty state also
  passed on `/admin/users?filter=client&q=zzzz-no-user&page=1`.

## Final Result

formal visual comparison result: blocked because no source visual target exists.

responsive/data-fit result: passed for the checked routes above.
