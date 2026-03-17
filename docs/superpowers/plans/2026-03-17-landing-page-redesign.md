# Landing Page & Mega Menu Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the W3-Kit landing page and header with a Vercel-inspired mega menu, interactive hero demo, and 8 polished content sections to attract developers.

**Architecture:** Component-per-section approach — each landing page section is an isolated component in `src/components/landing/`. The navbar is rewritten to use Radix UI NavigationMenu for accessible mega menu panels. The page.tsx orchestrates all sections. Existing search, theme toggle, and GitHub stars features are carried over as-is.

**Tech Stack:** Next.js 15.1.5, React 19, Tailwind CSS 3.4.1, Radix UI NavigationMenu, lucide-react, Geist fonts.

**Spec:** `docs/superpowers/specs/2026-03-17-landing-page-redesign-design.md`

**Intentional simplifications from spec (can follow up later):**
- Component gallery cards use category label + title + description instead of static preview illustrations (deferred — would require creating 27+ preview images/icons)
- Code blocks use plain monospace text instead of syntax highlighting (deferred — would require adding a syntax highlighter dependency like `shiki` or `prism-react-renderer`)
- `preview-components.tsx` is deleted rather than modified, since the new gallery sources data directly from `getComponentList()`

---

## Chunk 1: Foundation — Branch, Dependencies, Config

### Task 1: Create feature branch and install dependencies

**Files:**
- Modify: `public-website/package.json`

- [ ] **Step 1: Create feature branch**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git init  # if not already a repo
git add -A && git commit -m "chore: initial state before landing page redesign"
git checkout -b feat/landing-page-redesign
```

- [ ] **Step 2: Install Radix UI NavigationMenu**

```bash
cd /Users/petarstoev/Code/w3-kit-repo/public-website
npm install @radix-ui/react-navigation-menu
```

- [ ] **Step 3: Verify installation**

Run: `cd /Users/petarstoev/Code/w3-kit-repo/public-website && npm ls @radix-ui/react-navigation-menu`
Expected: Shows installed version

- [ ] **Step 4: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/package.json public-website/package-lock.json
git commit -m "chore: install @radix-ui/react-navigation-menu for mega menu"
```

### Task 2: Update Tailwind config and globals.css

**Files:**
- Modify: `public-website/tailwind.config.js`
- Modify: `public-website/src/app/globals.css`

- [ ] **Step 1: Update tailwind.config.js**

Replace the entire `keyframes` and `animation` sections. Remove the old float/scroll animations (no longer used). Add new ones for the mega menu and landing page.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        'xs': '480px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.15s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'slide-out-right': 'slide-out-right 0.15s ease-in',
        'fade-out': 'fade-out 0.15s ease-in',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
        },
      })
    },
  ],
}
```

- [ ] **Step 2: Add reduced-motion and skip-to-content styles to globals.css**

Append to the end of `public-website/src/app/globals.css`:

```css
@layer base {
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Skip to content link */
  .skip-to-content {
    @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:dark:bg-gray-950 focus:text-gray-900 focus:dark:text-white focus:rounded-md focus:shadow-md focus:ring-2 focus:ring-blue-500;
  }
}
```

- [ ] **Step 3: Verify the dev server still starts**

Run: `cd /Users/petarstoev/Code/w3-kit-repo/public-website && npm run build`
Expected: Builds successfully (warnings OK, no errors)

- [ ] **Step 4: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/tailwind.config.js public-website/src/app/globals.css
git commit -m "chore: update tailwind config and globals for landing page redesign"
```

---

## Chunk 2: Mega Menu Navigation

### Task 3: Create the mega menu panel component

**Files:**
- Create: `public-website/src/components/mega-menu.tsx`

This is the dropdown panel content used by both "Components" and "Resources" mega menu triggers.

- [ ] **Step 1: Create mega-menu.tsx**

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { getComponentList } from "@/config/docs";

// Same category structure as existing navbar — dynamically generated
function getComponentsMenu() {
  const components = getComponentList();

  return [
    {
      title: "Data Display",
      items: components.filter((c) =>
        ["NFT Card", "Token Card", "Price Ticker", "NFT Collection Grid", "Token List", "Wallet Balance", "Transaction History"].includes(c.title)
      ),
    },
    {
      title: "Inputs & Actions",
      items: components.filter((c) =>
        ["Token Swap", "Bridge", "Network Switcher", "Connect Wallet", "Contract Interaction", "Address Book", "Token Airdrop", "Subscription Payments"].includes(c.title)
      ),
    },
    {
      title: "DeFi Tools",
      items: components.filter((c) =>
        ["DeFi Position Manager", "Limit Order & Stop-Loss Manager", "Flash Loan Executor", "Token Vesting", "Staking Interface", "Liquidity Pool Stats"].includes(c.title)
      ),
    },
    {
      title: "Analytics",
      items: components.filter((c) =>
        ["Asset Portfolio", "Gas Calculator", "Smart Contract Scanner", "NFT Marketplace Aggregator"].includes(c.title)
      ),
    },
    {
      title: "Advanced",
      items: components.filter((c) =>
        ["Multisignature Wallets", "ENS Resolver"].includes(c.title)
      ),
    },
  ];
}

const RESOURCES_MENU = [
  {
    title: "Learn",
    items: [
      { title: "Installation Guide", href: "/docs/installation" },
      { title: "Getting Started", href: "/docs/components" },
      { title: "API Reference", href: "/docs/api" },
    ],
  },
  {
    title: "Community",
    items: [
      { title: "GitHub", href: "https://github.com/w3-kit/ui", external: true },
      { title: "Contributing", href: "https://github.com/w3-kit/ui/contributing", external: true },
      { title: "Changelog", href: "https://github.com/w3-kit/ui/releases", external: true },
    ],
  },
];

export function ComponentsMegaMenu() {
  const categories = getComponentsMenu();

  return (
    <div className="w-full p-6">
      <div className="pb-3 mb-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Components</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Explore our collection of Web3 UI components
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6">
        {categories.map((category) => (
          <div key={category.title}>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {category.title}
            </div>
            <div className="space-y-1">
              {category.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-1.5 px-2 -mx-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                >
                  {item.title}
                  {item.description && (
                    <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/docs/components"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150"
        >
          View All Components →
        </Link>
      </div>
    </div>
  );
}

export function ResourcesMegaMenu() {
  return (
    <div className="w-full max-w-md p-6">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {RESOURCES_MENU.map((section) => (
          <div key={section.title}>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="block py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `cd /Users/petarstoev/Code/w3-kit-repo/public-website && npx tsc --noEmit src/components/mega-menu.tsx 2>&1 | head -20`
Expected: No type errors (or only unrelated ones)

- [ ] **Step 3: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/mega-menu.tsx
git commit -m "feat: add mega menu panel components for Components and Resources"
```

### Task 4: Rewrite the navbar with mega menu

**Files:**
- Rewrite: `public-website/src/components/navbar.tsx`

This replaces the entire existing navbar (506 lines) with the new mega menu version. Key decisions:
- Uses Radix UI NavigationMenu for keyboard accessibility and ARIA roles
- Carries over existing search, GitHub stars, and theme toggle logic exactly
- Desktop: hover-triggered mega menu panels
- Mobile: slide-from-right overlay with accordion

- [ ] **Step 1: Rewrite navbar.tsx**

Replace the entire content of `public-website/src/components/navbar.tsx`:

```tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Github,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { useThemeContext } from "@/providers/ThemeProvider";
import { getComponentList } from "@/config/docs";
import { useGitHubStars } from "@/hooks/useGitHubStars";
import { ComponentsMegaMenu, ResourcesMegaMenu } from "./mega-menu";

// --- Search data (carried over from old navbar) ---

function getComponentsMenu() {
  const components = getComponentList();
  return [
    { title: "Data Display", items: components.filter((c) => ["NFT Card","Token Card","Price Ticker","NFT Collection Grid","Token List","Wallet Balance","Transaction History"].includes(c.title)).map((c) => ({ name: c.title, href: c.href })) },
    { title: "Inputs & Actions", items: components.filter((c) => ["Token Swap","Bridge","Network Switcher","Connect Wallet","Contract Interaction","Address Book","Token Airdrop","Subscription Payments"].includes(c.title)).map((c) => ({ name: c.title, href: c.href })) },
    { title: "DeFi Tools", items: components.filter((c) => ["DeFi Position Manager","Limit Order & Stop-Loss Manager","Flash Loan Executor","Token Vesting","Staking Interface","Liquidity Pool Stats"].includes(c.title)).map((c) => ({ name: c.title, href: c.href })) },
    { title: "Analytics", items: components.filter((c) => ["Asset Portfolio","Gas Calculator","Smart Contract Scanner","NFT Marketplace Aggregator"].includes(c.title)).map((c) => ({ name: c.title, href: c.href })) },
    { title: "Advanced", items: components.filter((c) => ["Multisignature Wallets","ENS Resolver"].includes(c.title)).map((c) => ({ name: c.title, href: c.href })) },
  ];
}

const COMPONENTS_MENU = getComponentsMenu();

const DOCS_MENU = [
  {
    title: "Getting Started",
    items: [
      { name: "Installation", href: "/docs/installation" },
      { name: "Quick Start", href: "/docs/quick-start" },
    ],
  },
];

interface SearchResult {
  name: string;
  href: string;
  category: string;
}

// --- Navbar Component ---

export function Navbar() {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const pathname = usePathname();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
  const { stars } = useGitHubStars("https://github.com/w3-kit/ui");

  const popularComponents = [
    { name: "NFT Card", href: "/docs/components/nft-card", category: "Popular Components", description: "Display NFTs with rich metadata" },
    { name: "Token Swap", href: "/docs/components/token-swap", category: "Popular Components", description: "Swap tokens with real-time pricing" },
    { name: "Wallet Balance", href: "/docs/components/wallet-balance", category: "Popular Components", description: "Show wallet assets and balances" },
    { name: "Price Ticker", href: "/docs/components/price-ticker", category: "Popular Components", description: "Real-time crypto price updates" },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".dropdown-container")) {
        setIsSearchVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search on navigation
  useEffect(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Search filtering
  useEffect(() => {
    if (searchQuery.length > 1) {
      const allItems = [
        ...COMPONENTS_MENU.flatMap((section) =>
          section.items.map((item) => ({ ...item, category: section.title }))
        ),
        ...DOCS_MENU.flatMap((section) =>
          section.items.map((item) => ({ ...item, category: section.title }))
        ),
      ];
      const filtered = allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleThemeSwitch = () => {
    setIsThemeTransitioning(true);
    toggleTheme();
    setTimeout(() => setIsThemeTransitioning(false), 300);
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 backdrop-blur-md bg-white/80 dark:bg-gray-950/80">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-20">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="font-semibold text-xl dark:text-white flex items-center gap-2">
            <Image src="/w3-kit-logo.svg" alt="w3-kit" width={30} height={30} />
            w3-kit
          </Link>
        </div>

        {/* Desktop Navigation — Radix NavigationMenu */}
        <NavigationMenuPrimitive.Root className="hidden md:flex ml-8 relative z-50">
          <NavigationMenuPrimitive.List className="flex items-center space-x-1">
            {/* Components — mega menu trigger */}
            <NavigationMenuPrimitive.Item>
              <NavigationMenuPrimitive.Trigger className="group flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-in-out rounded-md">
                Components
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </NavigationMenuPrimitive.Trigger>
              <NavigationMenuPrimitive.Content className="absolute left-0 top-full w-screen bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg animate-slide-down data-[state=closed]:animate-fade-out">
                <div className="mx-auto max-w-7xl">
                  <ComponentsMegaMenu />
                </div>
              </NavigationMenuPrimitive.Content>
            </NavigationMenuPrimitive.Item>

            {/* Docs — direct link */}
            <NavigationMenuPrimitive.Item>
              <Link href="/docs/installation" passHref legacyBehavior>
                <NavigationMenuPrimitive.Link className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-in-out rounded-md">
                  Docs
                </NavigationMenuPrimitive.Link>
              </Link>
            </NavigationMenuPrimitive.Item>

            {/* Showcase — direct link */}
            <NavigationMenuPrimitive.Item>
              <Link href="/showcase" passHref legacyBehavior>
                <NavigationMenuPrimitive.Link className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-in-out rounded-md">
                  Showcase
                </NavigationMenuPrimitive.Link>
              </Link>
            </NavigationMenuPrimitive.Item>

            {/* Resources — mega menu trigger */}
            <NavigationMenuPrimitive.Item>
              <NavigationMenuPrimitive.Trigger className="group flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-in-out rounded-md">
                Resources
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </NavigationMenuPrimitive.Trigger>
              <NavigationMenuPrimitive.Content className="absolute left-0 top-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg animate-slide-down data-[state=closed]:animate-fade-out rounded-b-lg">
                <ResourcesMegaMenu />
              </NavigationMenuPrimitive.Content>
            </NavigationMenuPrimitive.Item>
          </NavigationMenuPrimitive.List>

          <NavigationMenuPrimitive.Viewport />
        </NavigationMenuPrimitive.Root>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Search (carried over as-is from old navbar) */}
          <div className="md:relative flex-1 md:flex-initial dropdown-container">
            <button
              className="md:hidden inline-flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
              <Search className="h-5 w-5" />
            </button>

            <div
              className={`absolute md:relative md:top-0 left-0 right-0 md:right-auto p-4 md:p-0 bg-white dark:bg-gray-950 md:bg-transparent border-b border-gray-200 dark:border-gray-800 md:border-0 transition-all duration-300 ease-in-out transform md:transform-none ${
                isSearchVisible
                  ? "opacity-100 translate-y-16"
                  : "opacity-0 -translate-y-full md:opacity-100 md:translate-y-0"
              } ${
                isSearchVisible ? "pointer-events-auto" : "pointer-events-none md:pointer-events-auto"
              } md:block z-50`}
            >
              <div className="relative w-full md:w-auto">
                <div className={`relative transition-all duration-300 ease-in-out w-full ${isSearchExpanded ? "md:w-64" : "md:w-40"}`}>
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search components..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { setIsSearchFocused(true); setIsSearchExpanded(true); }}
                    onBlur={(e) => {
                      if (!e.relatedTarget?.closest(".search-results")) {
                        setIsSearchFocused(false);
                        if (!searchQuery) setIsSearchExpanded(false);
                      }
                    }}
                  />
                  <button
                    className="md:hidden absolute right-2 top-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => { setIsSearchVisible(false); setIsSearchFocused(false); setSearchQuery(""); setSearchResults([]); }}
                  >
                    <ChevronDown className="h-5 w-5 transform rotate-180" />
                  </button>
                </div>
              </div>

              {(isSearchFocused || searchResults.length > 0) && (
                <div className={`search-results absolute left-0 right-0 md:left-auto md:right-0 top-full mt-2 w-full md:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[60vh] md:max-h-96 overflow-auto mx-auto md:mx-0 z-50 transition-all duration-300 ease-in-out ${
                  isSearchFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                }`}>
                  {searchQuery.length > 0 ? (
                    <div className="overflow-auto">
                      {searchResults.map((result) => (
                        <Link key={result.href} href={result.href} onClick={() => { setSearchQuery(""); setSearchResults([]); setIsSearchFocused(false); setIsSearchVisible(false); }} className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{result.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{result.category}</div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Popular Components</h3>
                      <div className="space-y-2">
                        {popularComponents.map((component) => (
                          <Link key={component.href} href={component.href} onClick={() => setIsSearchFocused(false)} className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{component.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{component.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* GitHub */}
          <a href="https://github.com/w3-kit/ui" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 justify-center rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Github className="h-5 w-5" />
            {stars !== null && <span className="text-xs font-medium">{stars}</span>}
            <span className="sr-only">GitHub</span>
          </a>

          {/* Theme Toggle */}
          <button onClick={handleThemeSwitch} className="inline-flex items-center justify-center rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" disabled={isThemeTransitioning}>
            <div className="relative w-5 h-5">
              {theme === "light" ? (
                <Moon className={`h-5 w-5 absolute transition-all duration-300 ${isThemeTransitioning ? "scale-50 opacity-0" : "scale-100 opacity-100"}`} />
              ) : (
                <Sun className={`h-5 w-5 absolute transition-all duration-300 ${isThemeTransitioning ? "scale-50 opacity-0" : "scale-100 opacity-100"}`} />
              )}
            </div>
            <span className="sr-only">Toggle theme</span>
          </button>

          {/* Mobile hamburger */}
          <button className="md:hidden inline-flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Slide-from-right panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-950 shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <Link href="/" className="font-semibold text-lg dark:text-white flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Image src="/w3-kit-logo.svg" alt="w3-kit" width={24} height={24} />
                w3-kit
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-130px)]">
              {/* Components accordion */}
              <div>
                <button
                  onClick={() => setExpandedMobileSection(expandedMobileSection === "components" ? null : "components")}
                  className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Components
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedMobileSection === "components" ? "rotate-180" : ""}`} />
                </button>
                {expandedMobileSection === "components" && (
                  <div className="pl-4 pb-2 space-y-4">
                    {COMPONENTS_MENU.map((section) => (
                      <div key={section.title}>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{section.title}</div>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Docs direct link */}
              <Link href="/docs/installation" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-sm font-medium text-gray-900 dark:text-white">
                Docs
              </Link>

              {/* Showcase direct link */}
              <Link href="/showcase" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-sm font-medium text-gray-900 dark:text-white">
                Showcase
              </Link>

              {/* Resources accordion */}
              <div>
                <button
                  onClick={() => setExpandedMobileSection(expandedMobileSection === "resources" ? null : "resources")}
                  className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Resources
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedMobileSection === "resources" ? "rotate-180" : ""}`} />
                </button>
                {expandedMobileSection === "resources" && (
                  <div className="pl-4 pb-2 space-y-1">
                    <Link href="/docs/installation" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Installation Guide</Link>
                    <Link href="/docs/components" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Getting Started</Link>
                    <Link href="/docs/api" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">API Reference</Link>
                    <a href="https://github.com/w3-kit/ui" target="_blank" rel="noopener noreferrer" className="block py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">GitHub</a>
                    <a href="https://github.com/w3-kit/ui/releases" target="_blank" rel="noopener noreferrer" className="block py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Changelog</a>
                  </div>
                )}
              </div>
            </nav>

            {/* Bottom actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between">
              <a href="https://github.com/w3-kit/ui" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                <Github className="h-5 w-5" />
                {stars !== null && <span className="text-xs">{stars}</span>}
              </a>
              <button onClick={handleThemeSwitch} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" disabled={isThemeTransitioning}>
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Verify the navbar renders**

Run: `cd /Users/petarstoev/Code/w3-kit-repo/public-website && npm run build`
Expected: Builds successfully

- [ ] **Step 3: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/navbar.tsx
git commit -m "feat: rewrite navbar with Vercel-style mega menu using Radix NavigationMenu"
```

### Task 5: Add skip-to-content link in layout

**Files:**
- Modify: `public-website/src/app/layout.tsx`

- [ ] **Step 1: Add skip link before Navbar**

In `layout.tsx`, inside the `<ThemeProvider>` block, add before `<Navbar />`:

```tsx
<a href="#main-content" className="skip-to-content">
  Skip to content
</a>
```

And add `id="main-content"` to the `<main>` tag:

```tsx
<main id="main-content" className="min-h-screen">{children}</main>
```

- [ ] **Step 2: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/app/layout.tsx
git commit -m "feat: add skip-to-content link for keyboard accessibility"
```

---

## Chunk 3: Landing Page Sections (Hero, Gallery, Code Example)

### Task 6: Create hero section component

**Files:**
- Create: `public-website/src/components/landing/hero.tsx`

- [ ] **Step 1: Create the landing directory**

```bash
mkdir -p /Users/petarstoev/Code/w3-kit-repo/public-website/src/components/landing
```

- [ ] **Step 2: Create hero.tsx**

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Code, Check } from "lucide-react";
import { AssetPortfolio } from "@/components/w3-kit/asset-portfolio";
import { TOKEN_CONFIGS } from "@/config/tokens";

const heroAssets = [
  {
    symbol: TOKEN_CONFIGS.ETH.symbol,
    name: TOKEN_CONFIGS.ETH.name,
    logoURI: TOKEN_CONFIGS.ETH.logoURI,
    balance: "2.5",
    price: 3500,
    value: 8750,
    change24h: 4.2,
    color: "#627EEA",
    priceHistory: {
      "24h": Array.from({ length: 24 }, (_, i) => 3500 + Math.sin(i / 4) * 100),
      "7d": Array.from({ length: 7 }, (_, i) => 3500 + Math.sin(i / 2) * 200),
      "30d": Array.from({ length: 30 }, (_, i) => 3500 + Math.sin(i) * 300),
    },
  },
  {
    symbol: TOKEN_CONFIGS.BTC.symbol,
    name: TOKEN_CONFIGS.BTC.name,
    logoURI: TOKEN_CONFIGS.BTC.logoURI,
    balance: "0.15",
    price: 45000,
    value: 6750,
    change24h: -2.1,
    color: "#F7931A",
    priceHistory: {
      "24h": Array.from({ length: 24 }, (_, i) => 45000 + Math.sin(i / 4) * 1000),
      "7d": Array.from({ length: 7 }, (_, i) => 45000 + Math.sin(i / 2) * 2000),
      "30d": Array.from({ length: 30 }, (_, i) => 45000 + Math.sin(i) * 3000),
    },
  },
  {
    symbol: TOKEN_CONFIGS.USDC.symbol,
    name: TOKEN_CONFIGS.USDC.name,
    logoURI: TOKEN_CONFIGS.USDC.logoURI,
    balance: "5000",
    price: 1,
    value: 5000,
    change24h: 0.01,
    color: "#2775CA",
    priceHistory: {
      "24h": Array.from({ length: 24 }, () => 1),
      "7d": Array.from({ length: 7 }, () => 1),
      "30d": Array.from({ length: 30 }, () => 1),
    },
  },
  {
    symbol: TOKEN_CONFIGS.SOL.symbol,
    name: TOKEN_CONFIGS.SOL.name,
    logoURI: TOKEN_CONFIGS.SOL.logoURI,
    balance: "45",
    price: 110,
    value: 4950,
    change24h: 8.5,
    color: "#00FFA3",
    priceHistory: {
      "24h": Array.from({ length: 24 }, (_, i) => 110 + Math.sin(i / 4) * 5),
      "7d": Array.from({ length: 7 }, (_, i) => 110 + Math.sin(i / 2) * 10),
      "30d": Array.from({ length: 30 }, (_, i) => 110 + Math.sin(i) * 15),
    },
  },
];

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("npx w3-kit@latest init");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <section className="px-6 lg:px-8 py-28">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400">
          v1.0 — 30+ Web3 Components
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-gray-900 dark:text-white">
          Build faster with Web3 Components
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A comprehensive library of accessible React components for building
          high-quality Web3 applications and dApps
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center justify-center gap-x-4">
          <Link
            href="/docs/installation"
            className="rounded-full bg-gray-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Get Started
          </Link>
          <button
            onClick={handleCopy}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <code>npx w3-kit@latest init</code>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Code className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Interactive Asset Portfolio Demo */}
      <div className="mx-auto mt-16 max-w-3xl">
        <div
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
          aria-label="Interactive Asset Portfolio demo component"
        >
          <AssetPortfolio
            assets={heroAssets}
            totalValue={25450}
            totalChange24h={2.8}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/landing/hero.tsx
git commit -m "feat: add hero section with interactive Asset Portfolio demo"
```

### Task 7: Create component gallery grid

**Files:**
- Create: `public-website/src/components/landing/component-gallery.tsx`

- [ ] **Step 1: Create component-gallery.tsx**

This component reads the component list from `getComponentList()`, groups them by category (same as mega menu), and renders a filterable grid.

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getComponentList } from "@/config/docs";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Data Display", value: "Data Display" },
  { label: "Inputs & Actions", value: "Inputs & Actions" },
  { label: "DeFi Tools", value: "DeFi Tools" },
  { label: "Analytics", value: "Analytics" },
  { label: "Advanced", value: "Advanced" },
];

const CATEGORY_MAP: Record<string, string> = {
  "NFT Card": "Data Display",
  "Token Card": "Data Display",
  "Price Ticker": "Data Display",
  "NFT Collection Grid": "Data Display",
  "Token List": "Data Display",
  "Wallet Balance": "Data Display",
  "Transaction History": "Data Display",
  "Token Swap": "Inputs & Actions",
  "Bridge": "Inputs & Actions",
  "Network Switcher": "Inputs & Actions",
  "Connect Wallet": "Inputs & Actions",
  "Contract Interaction": "Inputs & Actions",
  "Address Book": "Inputs & Actions",
  "Token Airdrop": "Inputs & Actions",
  "Subscription Payments": "Inputs & Actions",
  "DeFi Position Manager": "DeFi Tools",
  "Limit Order & Stop-Loss Manager": "DeFi Tools",
  "Flash Loan Executor": "DeFi Tools",
  "Token Vesting": "DeFi Tools",
  "Staking Interface": "DeFi Tools",
  "Liquidity Pool Stats": "DeFi Tools",
  "Asset Portfolio": "Analytics",
  "Gas Calculator": "Analytics",
  "Smart Contract Scanner": "Analytics",
  "NFT Marketplace Aggregator": "Analytics",
  "Multisignature Wallets": "Advanced",
  "ENS Resolver": "Advanced",
};

export function ComponentGallery() {
  const [activeFilter, setActiveFilter] = useState("all");
  const components = getComponentList();

  const filtered = activeFilter === "all"
    ? components
    : components.filter((c) => CATEGORY_MAP[c.title] === activeFilter);

  return (
    <section className="px-6 lg:px-8 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
            Components for every Web3 use case
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From NFT displays to DeFi dashboards, everything you need to build production-ready Web3 interfaces
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                activeFilter === cat.value
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((component) => (
            <Link
              key={component.href}
              href={component.href}
              className="group block p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {CATEGORY_MAP[component.title] || "Component"}
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
                {component.title}
              </h3>
              {component.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {component.description}
                </p>
              )}
              {component.isNew && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
                  New
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/landing/component-gallery.tsx
git commit -m "feat: add filterable component gallery grid section"
```

### Task 8: Create code example section

**Files:**
- Create: `public-website/src/components/landing/code-example.tsx`

- [ ] **Step 1: Create code-example.tsx**

```tsx
import React from "react";
import Link from "next/link";

const codeSnippet = `import { AssetPortfolio } from 'w3-kit'

export default function Dashboard() {
  return (
    <AssetPortfolio
      address="0x1234...abcd"
      showChart
      className="max-w-lg"
    />
  )
}`;

export function CodeExampleSection() {
  return (
    <section className="px-6 lg:px-8 py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
              Ship Web3 UI in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Import a component, customize it with Tailwind CSS, and you&apos;re
              ready to deploy. No complex setup, no boilerplate — just clean,
              accessible components that work.
            </p>
            <Link
              href="/docs/installation"
              className="mt-6 inline-flex text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150"
            >
              View Documentation →
            </Link>
          </div>

          {/* Right column — code block */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-gray-500">Dashboard.tsx</span>
            </div>
            <pre className="p-6 overflow-x-auto text-sm leading-relaxed font-mono text-gray-300">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/landing/code-example.tsx
git commit -m "feat: add code example section with styled code block"
```

---

## Chunk 4: Landing Page Sections (Features, Before/After, Stats, Getting Started)

### Task 9: Create feature highlights section

**Files:**
- Create: `public-website/src/components/landing/features.tsx`
- Modify: `public-website/src/constants/home-page-features.tsx`

- [ ] **Step 1: Update home-page-features.tsx**

Replace the content of `public-website/src/constants/home-page-features.tsx`:

```tsx
import { Code, Palette, Zap } from "lucide-react";

export const features = [
  {
    icon: <Code className="h-6 w-6" />,
    title: "TypeScript First",
    description: "Full type safety and autocompletion out of the box.",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Tailwind CSS",
    description: "Customize every component with utility classes.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "High Performance",
    description: "Optimized rendering and minimal bundle size.",
  },
];
```

- [ ] **Step 2: Create features.tsx**

```tsx
import React from "react";
import { features } from "@/constants/home-page-features";

export function FeaturesSection() {
  return (
    <section className="px-6 lg:px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/landing/features.tsx public-website/src/constants/home-page-features.tsx
git commit -m "feat: add feature highlights section with updated content"
```

### Task 10: Create before/after section

**Files:**
- Create: `public-website/src/components/landing/before-after.tsx`

- [ ] **Step 1: Create before-after.tsx**

```tsx
import React from "react";

const withoutW3Kit = `import { useState, useEffect } from 'react'

export default function WalletBalance({ address }) {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchBalance() {
      try {
        setLoading(true)
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL
        )
        const raw = await provider.getBalance(address)
        const formatted = ethers.formatEther(raw)
        setBalance(formatted)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [address])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <p>{parseFloat(balance).toFixed(4)} ETH</p>
      <p>\${(parseFloat(balance) * 3500).toFixed(2)}</p>
    </div>
  )
}`;

const withW3Kit = `import { WalletBalance } from 'w3-kit'

export default function App() {
  return <WalletBalance address="0x1234...abcd" />
}`;

export function BeforeAfterSection() {
  return (
    <section className="px-6 lg:px-8 py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
            Building Web3 UI without W3-Kit
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Without W3-Kit */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-red-950/20">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-400">Without W3-Kit — 35 lines</span>
            </div>
            <pre className="p-6 overflow-x-auto text-xs sm:text-sm leading-relaxed font-mono text-gray-400">
              <code>{withoutW3Kit}</code>
            </pre>
          </div>

          {/* With W3-Kit */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-green-950/20">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-400">With W3-Kit — 5 lines</span>
            </div>
            <pre className="p-6 overflow-x-auto text-xs sm:text-sm leading-relaxed font-mono text-gray-300">
              <code>{withW3Kit}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/landing/before-after.tsx
git commit -m "feat: add before/after code comparison section"
```

### Task 11: Create stats section

**Files:**
- Create: `public-website/src/components/landing/stats.tsx`

- [ ] **Step 1: Create stats.tsx**

```tsx
"use client";

import React from "react";
import { useGitHubStars } from "@/hooks/useGitHubStars";

export function StatsSection() {
  const { stars } = useGitHubStars("https://github.com/w3-kit/ui");

  const stats = [
    { value: "30+", label: "Components" },
    { value: stars !== null ? `${stars}` : "—", label: "GitHub Stars" },
    // npm downloads omitted — no reliable public download count endpoint available yet
    { value: "100%", label: "TypeScript" },
  ];

  return (
    <section className="px-6 lg:px-8 py-20 border-y border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <strong className="block text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white" aria-label={`${stat.value} ${stat.label}`}>
                {stat.value}
              </strong>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/landing/stats.tsx
git commit -m "feat: add stats/social proof section with live GitHub stars"
```

### Task 12: Create getting started steps section

**Files:**
- Create: `public-website/src/components/landing/getting-started.tsx`

- [ ] **Step 1: Create getting-started.tsx**

```tsx
import React from "react";
import Link from "next/link";

const steps = [
  {
    number: 1,
    title: "Install",
    content: "npx w3-kit@latest init",
    isCode: true,
  },
  {
    number: 2,
    title: "Import",
    content: "import { AssetPortfolio } from 'w3-kit'",
    isCode: true,
  },
  {
    number: 3,
    title: "Ship",
    content: "Customize with Tailwind and deploy",
    isCode: false,
  },
];

export function GettingStartedSection() {
  return (
    <section className="px-6 lg:px-8 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
          Get started in 3 steps
        </h2>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden sm:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gray-200 dark:bg-gray-800" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center">
              {/* Number badge */}
              <div className="relative z-10 flex items-center justify-center h-16 w-16 rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xl font-bold text-gray-900 dark:text-white">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>

              {/* Content */}
              {step.isCode ? (
                <code className="mt-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-900 text-xs sm:text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                  {step.content}
                </code>
              ) : (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {step.content}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-16">
          <Link
            href="/docs/installation"
            className="rounded-full bg-gray-900 dark:bg-white px-8 py-3 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/components/landing/getting-started.tsx
git commit -m "feat: add 3-step getting started section with final CTA"
```

---

## Chunk 5: Assemble the Page, Clean Up, Verify

### Task 13: Rewrite page.tsx to assemble all sections

**Files:**
- Rewrite: `public-website/src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Replace the entire content of `public-website/src/app/page.tsx`:

```tsx
import { HeroSection } from "@/components/landing/hero";
import { ComponentGallery } from "@/components/landing/component-gallery";
import { CodeExampleSection } from "@/components/landing/code-example";
import { FeaturesSection } from "@/components/landing/features";
import { BeforeAfterSection } from "@/components/landing/before-after";
import { StatsSection } from "@/components/landing/stats";
import { GettingStartedSection } from "@/components/landing/getting-started";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <HeroSection />
      <ComponentGallery />
      <CodeExampleSection />
      <FeaturesSection />
      <BeforeAfterSection />
      <StatsSection />
      <GettingStartedSection />
    </div>
  );
}
```

- [ ] **Step 2: Verify the full build passes**

Run: `cd /Users/petarstoev/Code/w3-kit-repo/public-website && npm run build`
Expected: Builds successfully with no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add public-website/src/app/page.tsx
git commit -m "feat: assemble new landing page with all 8 sections"
```

### Task 14: Clean up unused files

**Files:**
- Evaluate: `public-website/src/components/PreviewCard.tsx` — may no longer be imported anywhere
- Evaluate: `public-website/src/constants/preview-components.tsx` — may no longer be imported anywhere

- [ ] **Step 1: Check if PreviewCard and preview-components are still imported elsewhere**

Run:
```bash
cd /Users/petarstoev/Code/w3-kit-repo
grep -r "PreviewCard\|preview-components" public-website/src/ --include="*.tsx" --include="*.ts" -l
```

If only the old page.tsx imported them and page.tsx no longer does, these files are dead code. If other pages reference them, keep them.

- [ ] **Step 2: Remove unused files if confirmed dead**

Only if no other imports exist:
```bash
rm public-website/src/components/PreviewCard.tsx
rm public-website/src/constants/preview-components.tsx
```

- [ ] **Step 3: Final full build verification**

Run: `cd /Users/petarstoev/Code/w3-kit-repo/public-website && npm run build`
Expected: Builds successfully with no errors

- [ ] **Step 4: Commit cleanup**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git add -A
git commit -m "chore: remove unused PreviewCard and preview-components"
```

### Task 15: Visual verification and PR

- [ ] **Step 1: Start dev server and verify visually**

Run: `cd /Users/petarstoev/Code/w3-kit-repo/public-website && npm run dev`

Check in browser at http://localhost:3000:
- Mega menu opens on hover for Components and Resources
- All 5 component categories display in the mega menu panel
- Search still works
- Theme toggle still works
- GitHub stars still display
- Hero section shows the interactive Asset Portfolio
- Component gallery filters work (click each category tab)
- Code example section renders correctly
- Feature cards display
- Before/after shows both code panels
- Stats strip shows live GitHub stars
- Getting started 3 steps display with connecting line
- Mobile: hamburger menu works, accordion navigation works
- Dark mode: all sections look polished
- Light mode: all sections look polished

- [ ] **Step 2: Push branch and create PR**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
git push -u origin feat/landing-page-redesign
```

Create PR with title and description covering the changes.
