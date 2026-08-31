@AGENTS.md

# Family Fund

A system of record for a family fund shared by three brothers. It does not move real money and connects to no bank. It tracks personal balances, a shared family fund, monthly commitments, requests, approvals, and an immutable ledger.

## Stack

- React Native + TypeScript (strict), Expo SDK 54 (managed workflow) with `expo-router`. Pinned to 54, not latest — that's what the App Store/Play Store build of Expo Go currently supports; a newer SDK builds fine but a real device's store Expo Go will refuse to open it with an "incompatible" error.
- Supabase — Postgres, Auth (email + password), Row Level Security, Postgres functions (RPC) for all writes
- `@supabase/supabase-js`, TanStack Query for server state, `react-hook-form` + `zod` for forms
- UI in Arabic (default) and English, switchable in Settings; layout follows the active language's direction (RTL for Arabic, LTR for English)
- No Redux, no custom backend server, no ORM. Migrations live in `supabase/migrations/`.
- Dark/gold visual design (navy `#080E1A` background, gold `#C9A84C` accent) matching a Figma Make export, `@expo-google-fonts/cairo` for type, `react-native-svg` for icons, `expo-linear-gradient` for the fund card/FAB — see `src/ui/theme.ts`.

## Invariants

1. Personal balances may go negative when a withdrawal or full monthly contribution exceeds the available balance.
2. The shared fund balance may go negative when an approved expense exceeds the available fund balance.
3. Monthly commitments are never deducted automatically. Payment happens through a request the admin approves.
4. No partial payment. A commitment is paid only as the exact full amount; that full payment may make the personal balance negative.
5. Members cannot approve anything — not their own requests, not anyone else's.
6. Admin (Moath) withdraws his own personal money directly, with no approval, but it is still recorded as a request in `approved` state with an audit note.
7. Rejection never moves money, and must store: reason, who rejected, when.
8. Every balance change is explainable from the ledger. Ledger rows are immutable — no updates, no deletes; corrections are new offsetting rows.
9. Every family member can see everything: all balances, all commitments, all requests, all ledger entries. The only role difference is who can approve/reject and who can add members.
10. Amounts are integers in fils (1 JOD = 1000 fils) everywhere — database, API, and app state. Never floats. Format to JOD only at the render layer.
11. Writes go through Postgres `SECURITY DEFINER` functions only — the client never inserts into `requests`, `ledger_entries`, or `commitments` directly.

## Decided (see brief §8)

- Admin's own deposit requires approval like everyone else (`admin_deposit_requires_approval` defaults to `true`).
- Any member can request a family expense. Even the admin's own expense request goes through the normal pending → approve flow — expenses are never auto-executed.
- Commitment periods roll over lazily: `ensure_commitments_for_period()` runs idempotently on first read of the current period, no `pg_cron`.
- Auth bootstrap is three pre-created Supabase accounts (Hani, Mohammed, Moath). No invite/sign-up flow.

## Commands

- `npm start` — run the Expo dev server
- `npm run web` / `npm run ios` / `npm run android` — run on a specific platform
- `supabase start` / `supabase stop` — start/stop the local Supabase stack (Postgres, Auth, PostgREST, Studio) in Docker
- `npm run db:reset` (`supabase db reset`) — recreate the local DB, apply every migration in `supabase/migrations/`, then run `supabase/seed.sql`
- `npm run db:types` — regenerate `src/api/database.types.ts` from the local schema; run after any migration change
- `npm test` (`vitest run`) — the §6 acceptance-criteria suite in `tests/`; resets the local DB itself, needs `supabase start` first

Local dev accounts (seeded by `supabase/seed.sql`, password `password123` for all three). Sign-in takes a **username**, not an email — `src/domain/auth.ts` appends `@family-fund.local` before calling Supabase Auth:
`hani.alzaol`, `hamada.alzaol`, `moath.alzaol` (admin).

Copy `.env.example` to `.env` and point it at the local stack to run the app against seed data:
`EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, and the `ANON_KEY` printed by `supabase start`.

`.env` currently points at the **remote** Supabase project ("Family Fund", ref `dehfypmetmfnxnpopxhr`, region eu-central-1) instead of local — all 6 migrations are applied there and it's seeded with the same three accounts/history as local (see the wake-up summary for exact credentials). Point `.env` back at `http://127.0.0.1:54321` + the local `ANON_KEY` to develop against the local stack instead.

## Client error mapping

RPC functions raise custom SQLSTATEs instead of generic Postgres errors, mapped in `src/domain/errors.ts`:
`FFR01`, `FFR02`, and `FFR04` are legacy insufficient-balance codes retained for backward compatibility; current operations permit negative balances. Active codes are `FFR03` commitment already paid / amount mismatch · `FFR05` admin-only action · `FFR06` invalid input · `FFR07` request not found / wrong state · `FFR08` not authenticated.

The server's raised *message* is always Arabic (SQL has no notion of UI locale) — never show `error.message` from an RPC call to the user. Always go through `localizeError(error)` (`src/domain/errors.ts`), which maps the code to a fully localized string via `strings.errors`. Every RPC call site in the app does this; keep new ones consistent.

Similarly, `ledger_entries.description` is written once server-side and isn't locale-aware — don't render it directly. Use `describeLedgerEntry()` (`src/domain/ledger.ts`), which derives a localized label from `entry_type` + the linked request's embedded `beneficiary`/`requester` (see `fetchLedger` in `src/api/queries.ts`). The stored column stays as the immutable historical record; only the *display* is locale-driven.

## App structure

Redesigned to match a Figma Make export (`Family Fund Mobile App`, https://www.figma.com/make/OM914vWicC5ECJ9H90Qc8q/Family-Fund-Mobile-App). Every screen renders its own header now — there is no shared `FundHeader` and no per-screen `Stack.Screen` header config; root `_layout.tsx` just sets `headerShown: false` app-wide and each screen either uses `src/ui/screen-header.tsx` (pushed screens) or a bespoke header block (tabs).

- `(auth)/sign-in` — real username+password Supabase auth (restyled to the dark/gold aesthetic; the Figma prototype's fake user-picker was **not** carried over).
- `(tabs)/{index,requests,fund,settings}` — the four bottom tabs (🏠 Home, 📋 Requests, 💰 Fund, ⚙️ Settings). The Figma export's original tab set was Home/Requests/Fund/**Members**; Members was demoted to a pushed route and Settings took its tab slot per a later request, since Settings — reached only via a now-removed Home header icon — didn't feel discoverable enough for something used every session (language switch, change password, admin toggle). Custom tab bar (`src/ui/tab-bar.tsx`) with a centered raised gold-gradient FAB that pushes `/request/new`, rendered via `<Tabs tabBar={...}>`'s render-prop rather than native tab icons.
  - **Home** — greeting header, gradient fund-balance card with a progress bar toward this month's target, per-member commitment status row, "my balance" button → `/balances`, pending-requests preview → `/requests`. No header icons anymore (avatar/logout/settings were all removed once Settings became its own tab and logout moved there too).
  - **Requests** — filter chips (all/pending/approved/rejected with live counts) over the full requests list; this replaces Home's old inline requests list from the previous design.
  - **Fund** — balance header + two sub-tabs (activity ledger / monthly report), local state, no separate route.
  - **Settings** — language switching, links to `/members` and `/change-password`, the static rules list, the admin-only `admin_deposit_requires_approval` toggle, and sign-out. Does not exist in the Figma export at all — see below.
- `balances`, `members`, `add-member`, `change-password`, `request/new`, `request/[id]` — top-level pushed routes (not tabs), each with `ScreenHeader`.
  - `balances` replaces the old Wallet tab: "my balance + my ledger" plus read-only balance cards for the other two brothers, reached from Home's balance button.
  - `members` — read-only per-member cards (balance + this-month paid status); admin-only "add member" button → `/add-member`. Was the fourth tab in the Figma design; moved to a pushed screen (reached from Settings) when Settings took over that tab slot. Nobody is tappable here, matching Figma's original members screen.
  - `settings` **does not exist in the Figma export** — added as a judgment call so language switching, change-password, the static rules list, and the admin-only `admin_deposit_requires_approval` toggle (all present in the pre-redesign app) aren't lost.
  - `request/[id]`'s reject flow is a `Modal`-based bottom sheet (dark overlay + sheet), matching Figma, replacing the previous full-screen-navigation reject flow.
- `src/i18n/` — `locales/{ar,en}.ts` (both satisfy the `Strings` interface in `types.ts`), `locale-state.ts` (the plain locale variable, zero RN imports — this is what `strings.ts` and `src/domain/period.ts` read from, so pure domain logic stays importable under plain Node/Vitest), `locale.ts` (the RN-touching layer: persistence via AsyncStorage, flips `I18nManager`/`document.dir`, triggers a reload — app/UI code only, never import this from `src/domain/`), `strings.ts` (a `Proxy` so every `strings.xxx` call site reads the current locale with no hook/refactor needed). Switching language in Settings reloads the app — RTL↔LTR only takes visual effect after a reload in React Native, there's no way around that. `locale.ts` also calls `applyDirection('ar')` synchronously at module-eval time (before the async AsyncStorage read resolves) — without that, the very first paint used the platform default (LTR) instead of Arabic/RTL, since I18nManager only affects view trees created after it's called.
- `src/api/` — Supabase client + env validation + typed query/mutation functions + generated `database.types.ts`.
- `src/hooks/` — TanStack Query wrappers around `src/api/`; mutations invalidate the relevant query keys (`requests`, `personal-balances`, `fund-balance`, `commitments`, `ledger`) on success.
- `src/domain/` — money (fils↔JOD), period (Asia/Amman "current month"), typed request enums, and `validation.ts` (client-side mirror of the server's checks, for instant feedback only).

## Known simplifications (flag if these need to change)

- The reject-request sheet uses RN's built-in `Modal` (dark overlay + sheet) rather than a bottom-sheet library — matches the Figma design's look without adding a dependency.
- `Alert.alert()` is a total no-op under `react-native-web` — success/failure messages go through `src/ui/notify.ts` (native `Alert.alert` on iOS/Android, `window.alert` on web) instead of calling `Alert.alert` directly.
- Optimistic UI is scoped to the request-detail screen only (approve/reject flip the status instantly, roll back on error); list screens rely on invalidate + refetch.
- No offline cache persistence — `onlineManager`/`focusManager` are wired (pause-while-offline, refetch-on-reconnect/foreground) but there's no `AsyncStorage` persister, so a cold app launch offline shows empty until connectivity returns.
- `add_member` provisions a real `auth.users` row directly (same technique as `supabase/seed.sql`) and returns a one-time temporary password in its response, since there's no invite/email flow in this MVP.
- Language switching reloads via `DevSettings.reload()` on native, which only exists in dev/Expo Go — a standalone production build would need `expo-updates`' `reloadAsync()` instead (not wired up, since this project only ships through Expo Go/dev client so far).
- Change password (`change-password`) doesn't ask for the current password first — it calls `supabase.auth.updateUser()` on the already-authenticated session, matching Supabase's own API; add a re-auth step first if that's ever a concern.
- The Settings screen has no equivalent in the Figma export at all — it was carried over from the pre-redesign app as a judgment call (see App structure above) since the user asked to preserve existing functionality alongside the new design.
