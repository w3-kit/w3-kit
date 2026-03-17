# Landing Page & Mega Menu Redesign — Design Spec

## Overview

Redesign the W3-Kit public website landing page and header navigation, taking inspiration from Vercel's clean, developer-focused aesthetic. The goal is to attract developers by showcasing the component library's power and developer experience.

**Tech stack:** Next.js 15.1.5, React 19, Tailwind CSS 3.4.1, Radix UI, Geist fonts, lucide-react icons.

**Design principles (from ui-ux-rules.md):**
- 4/8px spacing system
- Clean sans-serif typography with tight letter-spacing on headlines (-2% to -3%)
- Generous whitespace
- Subtle shadows (light mode), color layers for depth (dark mode)
- Clear visual hierarchy via size, color, position, contrast
- Every interaction needs feedback (hover, active, disabled states)
- Micro-interactions for clarity and satisfaction

---

## 1. Mega Menu Navigation

### Structure
Sticky header with backdrop blur. Logo left, nav center, actions right.

### Top-level items
- **Components** — mega menu trigger (hover on desktop, tap on mobile)
- **Docs** — direct link to /docs
- **Showcase** — direct link to /showcase
- **Resources** — mega menu trigger

### Components Mega Menu Panel
Full-width dropdown with subtle border and shadow. Five columns matching existing component categories (sourced from `getComponentsMenu()` in navbar.tsx):

| Data Display | Inputs & Actions | DeFi Tools | Analytics | Advanced |
|---|---|---|---|---|
| NFT Card | Token Swap | DeFi Position Manager | Asset Portfolio | Multisignature Wallets |
| Token Card | Bridge | Limit Order & Stop-Loss Manager | Gas Calculator | ENS Resolver |
| Price Ticker | Network Switcher | Flash Loan Executor | Smart Contract Scanner | |
| NFT Collection Grid | Connect Wallet | Token Vesting | NFT Marketplace Aggregator | |
| Token List | Contract Interaction | Staking Interface | | |
| Wallet Balance | Address Book | Liquidity Pool Stats | | |
| Transaction History | Token Airdrop | | | |
| | Subscription Payments | | | |

Each item: icon + name + one-line description. Hover highlights the row. "View All Components" link at bottom. Component list is dynamically generated from `getComponentList()` so it stays in sync.

### Resources Mega Menu Panel
Smaller panel, two columns:
- **Learn:** Installation Guide, Getting Started, API Reference
- **Community:** GitHub, Contributing, Changelog

### Right-side actions
Search: carry over existing search implementation (expanding input, results dropdown, popular components) as-is. GitHub stars badge (existing `useGitHubStars` hook). Theme toggle (light/dark).

### Mobile
Hamburger icon triggers a slide-from-right full-screen overlay menu:
- Dark semi-transparent backdrop (click to close)
- X close button in top-right corner
- Single-level accordion for Components (expands to show all 5 categories) and Resources
- Direct links for Docs and Showcase
- Search, GitHub, and Theme toggle at the bottom

### Implementation
- Replace current navbar.tsx (~18.7KB) with new mega menu component
- Use Radix UI NavigationMenu primitive for accessibility (keyboard nav, focus trapping, aria attributes)
- Hover-triggered on desktop, click/tap-triggered on mobile
- Animate open/close with CSS transitions (opacity + translateY, 150ms ease-out)
- Backdrop blur on sticky header: `backdrop-blur-md bg-white/80 dark:bg-gray-950/80` (using existing color classes from current navbar)

---

## 2. Hero Section

### Layout
Full-width, vertically centered content. Padding: `py-28` (112px) top/bottom — a multiple of 8 per the spacing system.

### Content stack (centered)
1. **Badge/pill** — "v1.0 — 30+ Web3 Components" with subtle border
2. **Headline** — Responsive sizes: `text-4xl` (36px) mobile → `text-5xl` (48px) tablet (`sm:`) → `text-6xl` (60px) desktop (`lg:`). Font-weight bold, `tracking-tight` (-2% letter-spacing), `leading-[1.15]` (115% line-height per ui-ux-rules.md Rule 8). e.g. "Build faster with Web3 Components". All section headings should also use `leading-tight` (125%) or `leading-[1.15]` (115%).
3. **Subtitle** — `text-lg` (18px) mobile → `text-xl` (20px) desktop. Muted foreground color, 1-2 lines
4. **Two CTAs side by side:**
   - Primary filled: "Get Started" → /docs/installation
   - Secondary outlined: "npx w3-kit@latest init" with copy-to-clipboard icon
5. **Interactive Asset Portfolio demo** — Live, working AssetPortfolio component in a styled card container below CTAs. Visitors can hover chart segments, see balances. Replaces the current floating animated components.

### Key changes from current
- Remove scattered floating component animations
- Single focused interactive demo
- More whitespace, tighter typography
- Demo sits in a bordered card that communicates "this is a real component"

---

## 3. Component Gallery Grid

### Layout
Full-width section. Heading: "Components for every Web3 use case" + subtitle.

### Filter bar
Horizontal pill/tab buttons: All | Data Display | Inputs & Actions | DeFi Tools | Analytics | Advanced. Default: "All" selected. Selected tab gets filled background. Client-side filtering with all components pre-rendered (no URL sync needed). Tab switch transition: 150ms ease-in-out.

### Grid
- Desktop (`lg:`): 3 columns
- Tablet (`sm:`): 2 columns
- Mobile: 1 column

### Card design
- Component name (bold)
- One-line description (muted)
- Small static preview/illustration
- Hover: subtle lift (translateY -2px) + border highlight
- Click: navigate to component's docs page

### Replaces
Current horizontal scrolling carousel with a browsable, filterable grid.

---

## 4. Code Example Section

### Layout
Two-column split on desktop, stacked on mobile.

### Left column
- Headline: "Ship Web3 UI in minutes"
- Short paragraph about simplicity (import, customize with Tailwind, done)
- "View Documentation" CTA link

### Right column
Styled code block showing real usage:
```tsx
import { AssetPortfolio } from 'w3-kit'

export default function Dashboard() {
  return (
    <AssetPortfolio
      address="0x1234...abcd"
      showChart
      className="max-w-lg"
    />
  )
}
```

Code block styling: dark background, syntax highlighting, rounded corners, subtle border, Geist Mono font.

---

## 5. Feature Highlights

### Layout
3-column grid on desktop, stacked on mobile.

### Cards
Update `home-page-features.tsx` constants to:
1. **TypeScript First** — Icon: `Code` (lucide) + title + "Full type safety and autocompletion out of the box."
2. **Tailwind CSS** — Icon: `Palette` (lucide, keeping existing) + title + "Customize every component with utility classes."
3. **High Performance** — Icon: `Zap` (lucide) + title + "Optimized rendering and minimal bundle size."

### Card styling
Subtle border, `p-8` (32px) padding, icon at top (24px), no heavy shadows. Hover: slight border color change (200ms ease-out).

---

## 6. Before/After Section

### Layout
Full-width, centered heading: "Building Web3 UI without W3-Kit"

### Two panels side by side (stacked on mobile)

**Without W3-Kit** (muted/red-tinted header label):
Shows a manual wallet balance component — useState for balance/loading/error, useEffect with a fetch call, conditional rendering for loading/error/success states, manual ETH formatting. Approximately 30-35 lines demonstrating the verbose boilerplate.

**With W3-Kit** (green/primary-tinted header label):
Same result in ~5 lines:
```tsx
import { WalletBalance } from 'w3-kit'

export default function App() {
  return <WalletBalance address="0x1234...abcd" />
}
```

Both panels use the same code block styling (dark bg, syntax highlighting, Geist Mono). The visual contrast between "painful" and "easy" is immediate.

---

## 7. Stats/Social Proof

### Layout
Full-width horizontal strip with subtle background tint to break visual rhythm. Generous padding.

### Stats (centered, in a row)
- **30+** Components
- **★ GitHub Stars** (live count via existing useGitHubStars hook)
- **npm Downloads** (if available, otherwise omit)
- **100%** TypeScript

### Styling
Large bold number, muted label below. No cards — clean typography only.

---

## 8. Getting Started Steps

### Layout
Centered heading: "Get started in 3 steps." Three steps in a horizontal row (stacked on mobile).

### Steps
1. **Install** — `npx w3-kit@latest init` in a small code block
2. **Import** — `import { AssetPortfolio } from 'w3-kit'` in a code block
3. **Ship** — "Customize with Tailwind and deploy"

### Styling
Circled number badge (1/2/3), title, content. Connecting line/arrow between steps on desktop. Final centered CTA: "Get Started" primary button.

---

## Footer

Out of scope for this redesign. The existing footer component (`footer.tsx`) is kept as-is.

---

## Motion & Animation

All transitions follow consistent timing:
- **Mega menu open/close:** 150ms ease-out (opacity + translateY)
- **Card hover lift:** 200ms ease-out (translateY -2px + border color)
- **Filter tab switch:** 150ms ease-in-out (background fill)
- **Button hover/active states:** 150ms ease-in-out
- **Mobile menu slide-in:** 200ms ease-out (translateX)
- **Mobile menu slide-out:** 150ms ease-in
- **`prefers-reduced-motion`:** All animations and transitions are disabled when the user has this media query active. Use `motion-safe:` Tailwind prefix or a `@media (prefers-reduced-motion: reduce)` rule.

---

## Accessibility

- **WCAG 2.1 AA** contrast ratios for all text (already maintained by existing color tokens)
- **Focus-visible styles:** All interactive elements get a visible focus ring (`ring-2 ring-blue-500 ring-offset-2`) for keyboard navigation (using `blue-500` to match the existing primary blue color; a `ring-primary` token can be added later if the project adopts CSS variable-based Tailwind colors)
- **`prefers-reduced-motion`:** Disable all animations (see Motion section)
- **Mega menu:** Built on Radix UI NavigationMenu — provides keyboard nav, arrow key support, Escape to close, and proper ARIA roles (`navigation`, `menu`, `menuitem`)
- **Interactive hero demo:** Add `aria-label="Interactive Asset Portfolio demo component"` to the container. Ensure chart segments are not focusable traps (decorative, not functional).
- **Stats section:** Use semantic markup — numbers wrapped in `<strong>` or `<span aria-label="30 plus components">`
- **Skip to content:** Add a skip-to-main-content link at the top of the page for keyboard users

---

## Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `public-website/src/components/navbar.tsx` | Rewrite | New mega menu navigation |
| `public-website/src/app/page.tsx` | Rewrite | New landing page with all 8 sections |
| `public-website/src/components/mega-menu.tsx` | Create | Mega menu panel component |
| `public-website/src/components/landing/hero.tsx` | Create | Hero section with interactive demo |
| `public-website/src/components/landing/component-gallery.tsx` | Create | Filterable component grid |
| `public-website/src/components/landing/code-example.tsx` | Create | Code example split section |
| `public-website/src/components/landing/features.tsx` | Create | Feature highlights grid |
| `public-website/src/components/landing/before-after.tsx` | Create | Before/after comparison |
| `public-website/src/components/landing/stats.tsx` | Create | Stats/social proof strip |
| `public-website/src/components/landing/getting-started.tsx` | Create | 3-step getting started |
| `public-website/src/constants/home-page-features.tsx` | Modify | Update feature card content |
| `public-website/src/constants/preview-components.tsx` | Modify | Update for new gallery grid |
| `public-website/tailwind.config.js` | Modify | Add any new animations/utilities |
| `public-website/src/app/globals.css` | Modify | Add mega menu transitions, new keyframes |

## Design Tokens (no changes to existing)
- Keep existing HSL color system and CSS variables
- Keep existing light/dark mode support (both equally polished)
- Keep Geist Sans/Mono fonts
- Follow 4/8px spacing system from ui-ux-rules.md
