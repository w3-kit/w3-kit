# W3-Kit Component Rework Plan — Vercel Style + UI/UX Principles

## Vision

Rework all 27 w3-kit components to match Vercel's design language while applying the principles from `ui-ux-rules.md`. The result should feel like components that belong on vercel.com — clean, minimal, confident, with impeccable spacing and interaction states.

---

## Decisions (Locked In)

| # | Question | Decision |
|---|----------|----------|
| 1 | Breaking changes | **Full redesign** — props, structure, API can all change |
| 2 | Shared TokenIcon | **Yes** — one shared `<TokenIcon>` for all components |
| 3 | Variants | **Drop all variants** — one responsive design per component |
| 4 | Animations | **Vercel-minimal** — color transitions + loading spinners only, no hover transforms |
| 5 | Chart library | **Keep Chart.js** |
| 6 | Scope | **Both** — core `/ui/` library AND `/public-website/` copies, kept in sync |
| 7 | Font | **Geist** (Vercel's font) |
| 8 | Priority | Optimal order determined below |

---

## Current State Audit

### Problems Identified Across All Components

| Problem | Example | UI/UX Rule Violated |
|---------|---------|---------------------|
| Heavy shadows (`shadow-lg`, `shadow-md`) | NFT Card, Token Card | Rule 12 — Shadows should be subtle |
| Aggressive hover transforms (`hover:-translate-y-1`, `hover:scale-105`) | NFT Card expanded, Staking Interface | Rule 15 — Feedback should be clear, not theatrical |
| Inconsistent spacing (mix of `p-4`, `p-6`, `p-2`, `px-3`) | Every component | Rule 6 — Consistent 4/8px spacing system |
| Inline style injection (`document.createElement('style')`) | Token Swap, Wallet Balance, Staking, Gas Calculator | Code quality — pollutes DOM |
| Raw SVG icons mixed with lucide-react | NFT Card, Connect Wallet | Rule 13 — Icons should match text size consistently |
| Hardcoded colors (`bg-blue-600`, `text-purple-500`) | Gas Calculator, Staking | Rule 9/10 — Use primary + semantic color system |
| No consistent border treatment | Some use `shadow-md`, some `border`, some both | Rule 11 — Dark mode: depth from color layers, not shadows |
| Missing interaction states | Many inputs lack proper focus/error/disabled | Rule 15/16 — Every interaction needs feedback |
| Inconsistent dark mode | Mix of `dark:bg-gray-800` and `dark:bg-gray-700` | Rule 11 — Lighter cards on darker backgrounds |
| Typography inconsistency | Mixed `text-xl`, `text-lg`, `text-2xl` randomly | Rule 7 — Limit to 6 font sizes |
| Overly complex animations | Bounce-in, scale-up, multi-step transitions | Vercel style — motion should be barely noticeable |
| No shared design primitives | Each component re-implements cards, badges, buttons | Maintainability |
| Multiple variant implementations | `default`, `compact`, `expanded` per component | Adds complexity, inconsistency |
| No Geist font | Using system sans-serif | Doesn't match Vercel aesthetic |

---

## Vercel Design Language Reference

What makes Vercel's components distinctive:

- **Borders over shadows**: `border border-gray-200 dark:border-gray-800` — shadows only on elevation (dropdowns, modals)
- **Monochrome first**: Grayscale palette with ONE accent color (blue) for CTAs
- **Tight, confident spacing**: `p-4` or `p-5` for cards, `gap-3` between elements, `py-2 px-3` for small elements
- **Minimal motion**: `transition-colors duration-150` — no transforms, no bounces, no scale
- **Typography**: Geist font, tight letter-spacing on headings (`tracking-tight`), clear `text-sm` / `text-xs` / `text-base` hierarchy
- **Muted secondary text**: `text-gray-500 dark:text-gray-400` — never `text-gray-300`
- **Pill badges**: `rounded-full px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800`
- **Card pattern**: `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950`
- **Hover**: `hover:bg-gray-50 dark:hover:bg-gray-900` — subtle background shift, no transform
- **Focus rings**: `focus-visible:ring-2 focus-visible:ring-gray-400` — clean keyboard nav
- **Dark mode**: Near-black backgrounds (`gray-950`), cards at `gray-900`, never `gray-800` for backgrounds
- **Dividers**: `border-t border-gray-100 dark:border-gray-800` — very light separators
- **Responsive**: Single design that adapts, not separate variants

---

## Execution Order

### Phase 0: Foundation

Everything depends on this. No component work begins until Phase 0 is complete.

#### 0.1 Install Geist Font
- Install `geist` npm package in both `/ui/` and `/public-website/`
- Configure in `layout.tsx` and `tailwind.config.ts`
- Apply `font-sans` globally

#### 0.2 Design Tokens
Add to `tailwind.config.ts` and `globals.css`:

```
Colors (light / dark):
  bg:              white / gray-950
  bg-subtle:       gray-50 / gray-900
  border:          gray-200 / gray-800
  border-subtle:   gray-100 / gray-800/50
  text:            gray-900 / white
  text-secondary:  gray-500 / gray-400
  text-muted:      gray-400 / gray-500
  accent:          blue-600 / blue-500
  success:         green-600 / green-500
  warning:         amber-500 / amber-400
  error:           red-600 / red-500

Typography (6 sizes — Rule 7):
  text-xs    12px — captions, badges, metadata
  text-sm    14px — secondary content, descriptions
  text-base  16px — body, primary content
  text-lg    18px — section titles within cards
  text-xl    20px — card titles
  text-2xl   24px — page headings only

Spacing (4/8px — Rule 6):
  1=4  2=8  3=12  4=16  5=20  6=24  8=32

Border radius:
  Cards:   rounded-xl (12px)
  Buttons: rounded-lg (8px)
  Badges:  rounded-full
  Inputs:  rounded-lg (8px)
```

#### 0.3 Update Shared Primitives

| Primitive | Action | Key Changes |
|-----------|--------|-------------|
| `Card` | UPDATE | Remove `shadow-sm`. Border-only: `rounded-xl border border-gray-200 dark:border-gray-800`. No hover shadow by default. |
| `Button` | UPDATE | Remove shadow variants. Vercel style: `rounded-lg py-2 px-4 transition-colors duration-150`. Add `loading` state with spinner. |
| `Input` | UPDATE | Remove `shadow-sm`. Add `error` and `disabled` visual states. `rounded-lg border focus-visible:ring-2`. |
| `Badge` | CREATE | `rounded-full px-2 py-0.5 text-xs font-medium`. Variants: `default`, `success`, `warning`, `error`. |
| `Stat` | CREATE | Label (muted `text-xs uppercase tracking-wider`) + Value (bold `text-lg`). Reusable in every data component. |
| `TokenIcon` | CREATE | Shared component: circular logo with fallback to symbol initials. Sizes: `sm` (20px), `md` (24px), `lg` (32px). Loading skeleton. Used by ALL 27 components. |
| `StatusDot` | CREATE | 8px colored dot: green=success, yellow=pending, red=failed. Used by Transaction History, Multisig, DeFi Position Manager. |

#### 0.4 Animation Cleanup
- **Delete** all unused keyframes from `tailwind.config.ts` (bounce-in, scale-up, success-circle, success-check, etc.)
- **Delete** all custom animations from `globals.css` (sparkle, success, subscribePulse)
- **Remove** global `transition: border-color, background-color` from `*` selector (performance issue)
- **Keep only**: `fade-in` (for mounting), `spin` (for loading), `pulse` (for skeletons)
- **Standard transition**: `transition-colors duration-150` for interactive elements
- **Remove** all `document.createElement('style')` from component utils files

#### 0.5 Icon Standardization
- All icons: lucide-react only, no raw SVGs
- Size rules (Rule 13): `h-4 w-4` with `text-sm`, `h-5 w-5` with `text-base`

---

### Phase 1: Simple Display Components (3 components)

Start with the easiest components to establish the pattern and validate the design system.

| # | Component | Why first | Complexity |
|---|-----------|-----------|------------|
| 1 | **Token Card** | Smallest, uses TokenIcon + Stat, establishes the card pattern | Low |
| 2 | **Price Ticker** | List/table pattern, uses Badge for price changes | Low |
| 3 | **Wallet Balance** | Combines card + list patterns, has inline styles to remove | Medium |

**What we learn**: Card styling, TokenIcon usage, Stat layout, Badge for status, list row pattern.

---

### Phase 2: More Display + First Interactive (5 components)

Build on Phase 1 patterns, introduce interactivity.

| # | Component | Why here | Complexity |
|---|-----------|----------|------------|
| 4 | **Transaction History** | List pattern + StatusDot, validates row layout | Low |
| 5 | **NFT Card** | Card + image pattern, most visible component | Medium |
| 6 | **NFT Collection Grid** | Reuses NFT Card in grid, validates grid spacing | Low |
| 7 | **Token List** | List + search input, validates Input primitive | Medium |
| 8 | **Connect Wallet** | Button + dropdown, validates Button primitive | Medium |

**What we learn**: Image handling, grid layout, search/filter pattern, dropdown/modal pattern.

---

### Phase 3: Core Interactive Components (5 components)

The complex input-heavy components. Foundation patterns are now proven.

| # | Component | Why here | Complexity |
|---|-----------|----------|------------|
| 9  | **Network Switcher** | Select/dropdown pattern | Medium |
| 10 | **Token Swap** | Complex form, token selectors, has inline styles | High |
| 11 | **Bridge** | Multi-step form, chain selectors | High |
| 12 | **Address Book** | CRUD list with forms | Medium |
| 13 | **Contract Interaction** | Form with monospace inputs, dynamic fields | High |

**What we learn**: Complex form layouts, multi-step patterns, CRUD patterns.

---

### Phase 4: DeFi Components (6 components)

Data-heavy + interactive. All foundation patterns are established.

| # | Component | Why here | Complexity |
|---|-----------|----------|------------|
| 14 | **Staking Interface** | Pool cards + stake form, has inline styles | High |
| 15 | **Liquidity Pool Stats** | Stats grid, uses Stat heavily | Medium |
| 16 | **DeFi Position Manager** | Data table + actions | High |
| 17 | **Token Vesting** | Progress bars + timeline | Medium |
| 18 | **Flash Loan Executor** | Form + risk assessment | High |
| 19 | **Limit Order Manager** | Form + order table | High |

---

### Phase 5: Analytics Components (4 components)

| # | Component | Why here | Complexity |
|---|-----------|----------|------------|
| 20 | **Gas Calculator** | Speed selector + stats, has inline styles | Medium |
| 21 | **Smart Contract Scanner** | Input + results checklist | Medium |
| 22 | **Asset Portfolio** | Chart.js + asset list, most complex display | High |
| 23 | **NFT Marketplace Aggregator** | Comparison table + filters | High |

---

### Phase 6: Advanced + Remaining (4 components)

| # | Component | Why here | Complexity |
|---|-----------|----------|------------|
| 24 | **Multisig Wallet** | Complex approval flow, uses StatusDot | High |
| 25 | **ENS Resolver** | Search + results | Medium |
| 26 | **Token Airdrop** | Cards + claim flow | Medium |
| 27 | **Subscription Payments** | Pricing cards + features | Medium |

---

### Phase 7: Final Polish

- Update showcase page to reflect any new/changed props
- Visual regression test all 27 components in light + dark mode
- Verify responsive behavior (no more variants — must work at all sizes)
- Clean up any unused types, utils, or imports
- Update docs pages if component APIs changed (since breaking changes are allowed)

---

## Per-Component Checklist

For EVERY component, follow this exact sequence:

```
[ ] 1. Read current .tsx, -types.ts, -utils.ts fully
[ ] 2. Redesign props interface (breaking changes allowed)
       - Remove variant prop (single responsive design)
       - Simplify required vs optional props
       - Use shared types where possible
[ ] 3. Remove all inline style injection (document.createElement)
[ ] 4. Replace raw SVGs with lucide-react icons
[ ] 5. Rewrite JSX using shared primitives:
       - Card for containers
       - Button for actions
       - Input for form fields
       - Badge for status/tags
       - Stat for key-value data
       - TokenIcon for token logos
       - StatusDot for status indicators
[ ] 6. Apply design tokens:
       - Colors: gray-950/900/800 dark, gray-50/100/200 light
       - Spacing: 4/8px multiples only
       - Typography: 6 sizes max
       - Borders: rounded-xl cards, rounded-lg buttons/inputs
[ ] 7. Strip all animations:
       - Remove: hover transforms, bounce, scale, translate
       - Keep: transition-colors duration-150, loading spin, skeleton pulse
[ ] 8. Add interaction states:
       - Buttons: default, hover, active, disabled, loading
       - Inputs: default, focus, error, disabled
       - Cards: default, hover (subtle bg shift only)
[ ] 9. Test light + dark mode
[ ] 10. Test responsive (single design, no breakpoint variants)
[ ] 11. Update showcase page mock data if props changed
[ ] 12. Sync changes to both /ui/ and /public-website/
```

---

## File Map

```
SYNC TARGETS (changes go to BOTH):

  /ui/components/                          ← npm package source
  /public-website/src/components/w3-kit/   ← website copy

Components (27 total, each has .tsx + -types.ts + -utils.ts):
  nft-card                token-card           price-ticker
  token-list              wallet-balance       transaction-history
  nft-collection-grid     token-swap           bridge
  network-switcher        connect-wallet       contract-interaction
  address-book            token-airdrop        subscription-payments
  staking-interface       liquidity-pool-stats defi-position-manager
  flash-loan-executor     limit-order-manager  asset-portfolio
  gas-calculator          smart-contract-scanner
  nft-marketplace-aggregator  multisig-wallet  ens-resolver
  token-vesting (special: lives in /components/ui/token-vesting/)

Shared primitives to create/update:
  /public-website/src/components/ui/
    ├── button.tsx        (UPDATE)
    ├── card.tsx           (UPDATE)
    ├── input.tsx          (UPDATE)
    ├── badge.tsx          (CREATE)
    ├── stat.tsx           (CREATE)
    ├── token-icon.tsx     (CREATE)
    ├── status-dot.tsx     (CREATE)
    └── divider.tsx        (CREATE)

Config & styling:
  ├── tailwind.config.ts   (UPDATE — Geist font, design tokens, strip animations)
  ├── globals.css          (UPDATE — strip animations, add Geist, token vars)
  ├── layout.tsx           (UPDATE — Geist font provider)
  └── showcase/page.tsx    (UPDATE — adjust props as components change)
```

---

## Success Criteria

When complete, every component should:

1. **Look like it belongs on vercel.com** — monochrome, border-only, confident spacing
2. **Use Geist font** with tight heading letter-spacing
3. **Use zero shadows** except on elevated overlays (modals, dropdowns)
4. **Have zero hover transforms** — only color/background transitions
5. **Use shared primitives** — no re-implemented cards, badges, or token icons
6. **Follow the 4/8px spacing system** exclusively
7. **Use only 6 font sizes** (xs, sm, base, lg, xl, 2xl)
8. **Work responsively** without variant props
9. **Have proper interaction states** (hover, focus, active, disabled, loading)
10. **Look correct in both light and dark mode**
11. **Inject zero runtime styles** — all CSS in Tailwind/globals
12. **Use lucide-react exclusively** — no raw SVGs
