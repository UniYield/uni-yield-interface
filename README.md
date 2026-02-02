# UniYield Interface

Frontend for **UniYield** — an ERC-4626 USDC vault on Ethereum. Users deposit USDC from any chain (cross-chain via LI.FI); the vault allocates to Aave, Morpho, and Compound; users hold one ERC-4626 share token on Ethereum.

This repo is the Web3 dashboard UI: vault deposit flow, portfolio view, and explanatory pages.

---

## Tech

- **Vite** + **React** + **TypeScript**
- **React Router** for routes
- **TanStack Query** for data
- **shadcn/ui** (Radix) + **Tailwind CSS** for UI

---

## Codebase layout

```
src/
├── main.tsx              # Entry, React root
├── App.tsx                # Router, providers, route definitions
├── index.css              # Global styles
│
├── pages/                 # Route-level views
│   ├── VaultPage.tsx      # Main deposit flow (/, vault)
│   ├── PortfolioPage.tsx  # Portfolio + allocation + activity (/portfolio)
│   ├── HowItWorksPage.tsx # Explainer (/how-it-works)
│   └── NotFound.tsx       # 404
│
├── components/            # Feature / page components
│   ├── Layout.tsx         # App shell (nav + outlet)
│   ├── Navigation.tsx     # Top nav
│   ├── NavLink.tsx        # Nav link
│   ├── ChainSelector.tsx  # Chain dropdown (deposit source)
│   ├── StrategyTable.tsx  # Protocol / APY / status table
│   ├── AllocationBar.tsx  # Allocation viz (portfolio)
│   ├── ActivityTable.tsx  # Activity table (portfolio)
│   ├── MetricCard.tsx     # Metric display
│   ├── TransactionProgress.tsx  # Deposit progress modal
│   └── ui/                # shadcn primitives (button, card, dialog, etc.)
│
├── hooks/                 # Shared hooks
│   ├── use-toast.ts
│   └── use-mobile.tsx
│
├── lib/
│   └── utils.ts           # Helpers (e.g. cn)
│
└── test/                  # Vitest tests
    ├── setup.ts
    └── example.test.ts
```

- **Routes:** `/` (Vault), `/portfolio`, `/how-it-works`; everything else → NotFound.
- **Layout:** `Layout` wraps all main routes and renders the top nav + `<Outlet />` for the active page.
- **UI:** App-specific pieces live in `components/`; `components/ui/` is shadcn primitives only.

---

## Commands

```sh
npm i
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run test     # Run tests
npm run lint     # Lint
```
