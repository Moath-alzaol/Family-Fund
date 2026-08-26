# Graph Report - family-fund-app  (2026-08-26)

## Corpus Check
- 103 files · ~75,923 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 440 nodes · 1049 edges · 50 communities (22 shown, 28 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Query & Balance Screens
- Auth & Member Management
- Request Flow & Error i18n
- Database Types & Config
- App Manifest & Assets
- App Icons & Docs
- Package & Scripts
- RTL i18n & App Layout
- Acceptance Tests
- TypeScript Config
- Domain Types & Strings
- Expo Dependencies
- Project Reset Script
- Android Adaptive Icons
- Tab Navigation Icons
- Approval Business Rules
- Expo Branding Assets
- Commitment Business Rules
- Money Representation Rules
- Ledger Security Rules
- React Logo Assets
- Onboarding Images
- expo-constants
- expo-font
- Cairo Font
- expo-linear-gradient
- expo-linking
- expo-router
- expo-splash-screen
- expo-status-bar
- expo-system-ui
- hookform resolvers
- react
- react-dom
- react-hook-form
- react-native
- gesture-handler
- reanimated
- safe-area-context
- react-native-svg
- url-polyfill
- react-native-web
- worklets
- supabase-js
- react-query
- zod
- Vitest Config
- Member Visibility Rule

## God Nodes (most connected - your core abstractions)
1. `isRTL()` - 34 edges
2. `colors` - 22 edges
3. `fonts` - 22 edges
4. `formatJod()` - 21 edges
5. `strings` - 18 edges
6. `RequestDetailScreen()` - 16 edges
7. `useProfiles()` - 15 edges
8. `useMyProfile()` - 15 edges
9. `expo-router` - 14 edges
10. `NewRequestScreen()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Expo Framework` --references--> `Family Fund App`  [INFERRED]
  README.md → CLAUDE.md
- `Family Fund App` --references--> `Graphify Knowledge Graph`  [EXTRACTED]
  CLAUDE.md → AGENTS.md
- `Family Fund App` --references--> `Expo SDK 54 Version Pin`  [EXTRACTED]
  CLAUDE.md → AGENTS.md
- `Expo Framework` --references--> `Expo SDK 54 Version Pin`  [INFERRED]
  README.md → AGENTS.md
- `CreateRequestInput` --references--> `RequestType`  [EXTRACTED]
  src/api/mutations.ts → src/domain/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Family Fund Business Invariants** — claude_personal_balance_invariant, claude_fund_balance_invariant, claude_commitment_no_auto_deduction, claude_no_partial_payment, claude_member_no_approval, claude_admin_direct_withdrawal, claude_rejection_no_money, claude_immutable_ledger, claude_full_visibility, claude_fils_integers, claude_security_definer_writes [EXTRACTED 1.00]
- **i18n System Components** — claude_i18n_architecture, src_i18n_locale_state, src_i18n_locale, src_i18n_strings, src_i18n_types, src_domain_period [EXTRACTED 1.00]
- **Server Data Localization Flow** — claude_error_mapping, claude_localize_error, claude_describe_ledger_entry [INFERRED 0.85]
- **Android Adaptive Icon Layer Set** — assets_images_android-icon-background_android-icon-background, assets_images_android-icon-foreground_android-icon-foreground, assets_images_android-icon-monochrome_android-icon-monochrome [INFERRED 0.95]
- **Expo Branding Asset Group** — assets_images_expo-badge_expo-badge, assets_images_expo-badge-white_expo-badge-white, assets_images_expo-logo_expo-logo [INFERRED 0.85]
- **App Identity Icon Set** — assets_images_icon_icon, assets_images_favicon_favicon, assets_images_logo-glow_logo-glow [INFERRED 0.75]
- **Explore Tab Icon Multi-resolution Asset Set** — assets_images_tabicons_explore, assets_images_tabicons_explore_2x, assets_images_tabicons_explore_3x [INFERRED 0.95]
- **Home Tab Icon Multi-resolution Asset Set** — assets_images_tabicons_home, assets_images_tabicons_home_2x, assets_images_tabicons_home_3x [INFERRED 0.95]
- **React Logo Multi-resolution Asset Set** — assets_images_react_logo_2x, assets_images_react_logo_3x [INFERRED 0.85]

## Communities (50 total, 28 thin omitted)

### Community 0 - "Query & Balance Screens"
Cohesion: 0.09
Nodes (53): fetchCommitments(), fetchFundBalance(), fetchLedger(), fetchPersonalBalances(), fetchProfiles(), fetchRequests(), BalancesScreen(), createStyles() (+45 more)

### Community 1 - "Auth & Member Management"
Cohesion: 0.09
Nodes (47): Pre-created Auth Bootstrap, expo-router, addMember(), setAdminDepositRequiresApproval(), fetchAppSettings(), AddMemberScreen(), createStyles(), createStyles() (+39 more)

### Community 2 - "Request Flow & Error i18n"
Cohesion: 0.11
Nodes (26): describeLedgerEntry Localization Function, FFR01-FFR08 Error Code Mapping, localizeError Localization Function, approveRequest(), createRequest(), CreateRequestInput, rejectRequest(), fetchRequestById() (+18 more)

### Community 3 - "Database Types & Config"
Cohesion: 0.09
Nodes (21): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+13 more)

### Community 4 - "App Manifest & Assets"
Cohesion: 0.08
Nodes (25): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, softwareKeyboardLayoutMode, typedRoutes (+17 more)

### Community 5 - "App Icons & Docs"
Cohesion: 0.11
Nodes (20): Expo SDK 54 Version Pin, Graphify Knowledge Graph, Family Fund App, Figma Make Design Export, Offline State Handling, Optimistic UI on Request Detail, Expo Framework, CheckIcon() (+12 more)

### Community 6 - "Package & Scripts"
Cohesion: 0.08
Nodes (23): devDependencies, @types/node, @types/react, typescript, vitest, main, name, private (+15 more)

### Community 7 - "RTL i18n & App Layout"
Cohesion: 0.18
Nodes (16): RTL/LTR i18n Architecture, queryClient, RootLayout(), APP_TIMEZONE, formatPeriodLabel(), SessionProvider(), applyDirection(), initLocale() (+8 more)

### Community 8 - "Acceptance Tests"
Cohesion: 0.25
Nodes (14): AddMemberResult, asHani(), asMoath(), asMohammed(), asUser(), fundBalance(), HANI_ID, MOATH_ID (+6 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.13
Nodes (14): ./assets/*, expo-env.d.ts, expo/tsconfig.base, .expo/types/**/*.ts, node, **/*.ts, **/*.tsx, compilerOptions (+6 more)

### Community 10 - "Domain Types & Strings"
Cohesion: 0.38
Nodes (6): RequestStatus, RequestType, ar, en, LOCALES, Strings

### Community 11 - "Expo Dependencies"
Cohesion: 0.22
Nodes (9): expo, dependencies, expo, @react-native-async-storage/async-storage, @react-native-community/netinfo, react-native-screens, @react-native-async-storage/async-storage, @react-native-community/netinfo (+1 more)

### Community 12 - "Project Reset Script"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 13 - "Android Adaptive Icons"
Cohesion: 0.33
Nodes (7): Android Adaptive Icon Background, Android Adaptive Icon Foreground, Android Adaptive Icon Monochrome, Favicon, App Icon, Logo with Glow Effect, React Logo

### Community 14 - "Tab Navigation Icons"
Cohesion: 0.47
Nodes (6): Explore Tab Icon (1x), Explore Tab Icon (2x), Explore Tab Icon (3x), Home Tab Icon (1x), Home Tab Icon (2x), Home Tab Icon (3x)

### Community 15 - "Approval Business Rules"
Cohesion: 0.50
Nodes (4): Admin Deposit Requires Approval, Admin Direct Withdrawal With Audit, Any Member Can Request Family Expense, Members Cannot Approve

### Community 16 - "Expo Branding Assets"
Cohesion: 1.00
Nodes (3): Expo Badge (White Variant), Expo Badge, Expo Logo

### Community 17 - "Commitment Business Rules"
Cohesion: 0.67
Nodes (3): Commitments Not Auto-Deducted, Lazy Commitment Period Rollover, No Partial Payment Rule

### Community 18 - "Money Representation Rules"
Cohesion: 0.67
Nodes (3): Fils Integer Money Representation, Fund Balance Never Negative, Personal Balance Never Negative

### Community 19 - "Ledger Security Rules"
Cohesion: 0.67
Nodes (3): Immutable Ledger Entries, Rejection Never Moves Money, SECURITY DEFINER Writes Only

## Knowledge Gaps
- **141 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+136 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `expo-router` connect `Auth & Member Management` to `Query & Balance Screens`, `Request Flow & Error i18n`, `Database Types & Config`, `App Manifest & Assets`, `App Icons & Docs`, `RTL i18n & App Layout`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `plugins` connect `App Manifest & Assets` to `Auth & Member Management`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Query & Balance Screens` be split into smaller, more focused modules?**
  _Cohesion score 0.09094368340943683 - nodes in this community are weakly interconnected._
- **Should `Auth & Member Management` be split into smaller, more focused modules?**
  _Cohesion score 0.08579234972677596 - nodes in this community are weakly interconnected._
- **Should `Request Flow & Error i18n` be split into smaller, more focused modules?**
  _Cohesion score 0.10795454545454546 - nodes in this community are weakly interconnected._
- **Should `Database Types & Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09401709401709402 - nodes in this community are weakly interconnected._