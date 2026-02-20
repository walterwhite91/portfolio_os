# Portfolio OS — Stealth Edition

> A cinematic, dual-interface developer portfolio system disguised as a hacker operating system.

![Status](https://img.shields.io/badge/Status-v1.0_Production-green?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square) ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)

## ⚡ Overview

**Portfolio OS** transforms the traditional developer portfolio into an interactive **Hacker OS** experience. Visitors are greeted by a boot sequence simulating a Linux kernel initialization, followed by a Matrix rain identity screen. Interaction modes:
`
1. **Terminal Interface (CLI)** — Type commands (`help`, `projects`, `education`) to explore content
2. **Graphical Dashboard (GUI)** — A modern tabbed interface for visual browsing

Behind the scenes: a full production-grade **admin panel**, **analytics dashboard**, **CV import engine**, **setup wizard**, **theme/layout customization**, and **Matrix identity system** — all secured with session-based authentication, rate limiting, and stealth access.

## 🚀 Features

- **Dual Modes** — Seamlessly switch between CLI and GUI (`gui` / `cli` commands)
- **Matrix Identity System** — Canvas-based falling character animation with configurable text, color, speed, density, and opacity
- **Cinematic Login** — Matrix background on VisitorForm and stealth admin login
- **Admin Panel** — 1100+ lines: CRUD managers, CV import, and settings configurations.
- **Branding Manager (v2 Placeholder)** — The UI collects data for Matrix background text, colors, speed, density, opacity, and background modes. *Implementation to control frontend is planned for v2.*
- **Dynamic Theming (v2 Placeholder)** — Theme logic and Layout Control UI exist, but injecting CSS variables at runtime is planned for v2.
- **Analytics Dashboard (v2 Placeholder)** — Session tracking, command logs, resume downloads, and visitor stats are recorded in the DB, with the dashboard UI ready for v2 activation.
- **CV Import Engine** — AI-prompted JSON import with per-section error isolation and audit logging
- **PDF Resume Generator** — Puppeteer-based A4 resume from live data
- **Setup Wizard** — Multi-step first-run initialization
- **Production Hardening** — Global error boundary, toast notifications, loading skeletons, custom 404 page
- **Service Layer Architecture** — Repository pattern, Zod validation, centralized error handling, audit logging

## 🛠 Tech Stack

| Category | Technology |
|:---|:---|
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, `tw-animate-css` |
| **UI Components** | shadcn/ui (Button, Card, Dialog, Input, Label, Table, Tabs, Textarea, Alert) |
| **Animations** | Framer Motion, Canvas-based Matrix rain |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Backend / DB** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Custom HMAC session tokens + bcryptjs + middleware |
| **Validation** | Zod |
| **PDF Generation** | Puppeteer + `@sparticuz/chromium` |
| **Font** | Geist Mono (via `next/font/google`) |

## 📁 Architecture

```
src/
├── core/                           # Production infrastructure
│   ├── services/index.ts           # Centralized service layer (CRUD + config + audit)
│   ├── repositories/               # BaseRepository + entity repositories
│   │   ├── base.repository.ts      # Generic Supabase CRUD abstraction
│   │   └── index.ts                # Entity repos + DB row types
│   ├── validators/schemas.ts       # Zod schemas for all inputs
│   ├── errors/errors.ts            # AppError class + error handler
│   ├── api-response.ts             # Typed API response wrapper
│   ├── logger.ts                   # Structured logging abstraction
│   └── providers/
│       ├── ThemeProvider.tsx        # Dynamic theme context + CSS vars
│       └── ToastProvider.tsx        # Toast notification system
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (ThemeProvider + ToastProvider)
│   ├── page.tsx                    # Home page (Terminal)
│   ├── error.tsx                   # Global error boundary
│   ├── not-found.tsx               # Custom 404 page
│   ├── loading.tsx                 # Root loading state
│   ├── actions.ts                  # Server Actions
│   ├── admin/page.tsx              # Admin panel route
│   ├── setup/page.tsx              # Setup wizard
│   ├── resume/print/page.tsx       # Printable resume
│   └── api/admin/                  # Protected API routes (14 endpoints)
├── admin/AdminPanel.tsx            # Admin dashboard (1158 lines)
├── cli/Terminal.tsx                # CLI component (684 lines)
├── gui/GUIInterface.tsx            # Dashboard GUI (318 lines)
├── components/
│   ├── MatrixBackground.tsx        # Canvas-based Matrix rain (201 lines)
│   ├── VisitorForm.tsx             # Boot-time visitor form
│   ├── LoadingSkeleton.tsx         # Skeleton loading components
│   └── ui/                        # shadcn/ui primitives
├── security/
│   ├── auth.ts                     # HMAC sessions + bcrypt
│   ├── AdminLoginModal.tsx         # Stealth login modal
│   └── rate-limit.ts              # IP-based rate limiter
├── modules/analytics/tracker.ts    # Client-side analytics
├── lib/                            # Data fetching + utilities
└── types/index.ts                  # TypeScript interfaces
```

## 📦 Quick Start

```bash
git clone https://github.com/walterwhite91/portfolio-os.git
cd portfolio-os
npm install
cp .env.example .env.local          # Fill in your values
npm run dev                          # http://localhost:3000
```

### Database Setup

Initialize your Supabase database by running the master script:
1. Copy contents of `db/v1.0.0-production-schema.sql`
2. Run it in your Supabase **SQL Editor**
3. This sets up all tables, RLS policies, and seed data.

### Environment Variables

```env
# Supabase (Required for Admin Panel & Analytics)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Admin Credentials (Required)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=     # Generate: node -e "require('bcryptjs').hash('pass',12).then(console.log)"
ADMIN_KEYWORD=__admin_access__

# Session Security
SESSION_SECRET=           # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_EXPIRY_HOURS=2
```

## 🌍 Deployment

Deploy on **Vercel**:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

> PDF generation uses `puppeteer-core` + `@sparticuz/chromium` for Vercel's serverless limit. `maxDuration = 60` on the resume endpoint.

## 📄 License

MIT License. See `LICENSE` for details.

---
**Mimansh Neupane Pokharel** — [GitHub](https://github.com/walterwhite91) | [Portfolio](https://portfolio-os.vercel.app)
