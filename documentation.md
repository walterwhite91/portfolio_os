# Portfolio OS — Full Documentation

> **Last updated:** 2026-02-20  
> **Author:** Mimansh Neupane Pokharel  
> **Version:** 1.0.0  

---

## 1. Introduction

**Portfolio OS** (Stealth Edition) is a dual-interface personal portfolio web application with a hacker/cyberpunk aesthetic. It provides two distinct modes of interaction:

1. **CLI (Command Line Interface)** — A retro-styled terminal where visitors type commands to navigate.
2. **GUI (Graphical User Interface)** — A modern, dashboard-style interface with tabs and visual widgets.

Behind the scenes, it includes a **full-featured admin panel**, an **analytics dashboard**, a **setup wizard**, **theme/layout management**, a **CV import engine**, a **Matrix identity system**, and **production-grade infrastructure** — all secured with session-based authentication, rate limiting, and middleware protection.

---

## 2. Tech Stack

| Category           | Technology                                                    |
| :----------------- | :------------------------------------------------------------ |
| **Framework**      | Next.js 16.1.6 (App Router, Turbopack)                       |
| **Language**       | TypeScript                                                    |
| **Styling**        | Tailwind CSS v4, `tw-animate-css`                             |
| **UI Components**  | shadcn/ui (Button, Card, Dialog, Input, Label, Table, Tabs, Textarea, Alert) |
| **Animations**     | Framer Motion, Canvas-based Matrix rain                       |
| **Icons**          | Lucide React                                                  |
| **Charts**         | Recharts                                                      |
| **Backend / DB**   | Supabase (PostgreSQL + Row Level Security)                    |
| **Auth**           | Custom HMAC session tokens + bcryptjs + middleware             |
| **Validation**     | Zod (schema validation for all inputs)                        |
| **PDF Generation** | Puppeteer + `@sparticuz/chromium` (Vercel-compatible)          |
| **Font**           | Geist Mono (via `next/font/google`)                           |

---

## 3. Architecture Overview

### 3.1 Production Architecture

The codebase follows a **layered production architecture** with clear separation:

```
portfolio-os/
├── db/                              # Combined Production Schema
│   └── v1.0.0-production-schema.sql # Master initialization script (Tables, RLS, Seed)
├── public/                          # Static assets
├── src/
│   ├── core/                        # Production infrastructure layer
│   │   ├── services/
│   │   │   └── index.ts             # Centralized service layer (373 lines) — all business logic
│   │   ├── repositories/
│   │   │   ├── base.repository.ts   # Generic Supabase CRUD abstraction (BaseRepository<T>)
│   │   │   └── index.ts             # Entity repositories + DB row type interfaces
│   │   ├── validators/
│   │   │   └── schemas.ts           # Zod schemas for all entity + config inputs
│   │   ├── errors/
│   │   │   └── errors.ts            # AppError class + ErrorCode enum + handleApiError()
│   │   ├── providers/
│   │   │   ├── ThemeProvider.tsx     # Dynamic theme context + CSS variable injection
│   │   │   └── ToastProvider.tsx     # Toast notification context + useToast() hook
│   │   ├── api-response.ts          # Typed API response wrapper (apiSuccess/apiError/apiCatch)
│   │   └── logger.ts                # Structured logging abstraction (info/warn/error/audit)
│   ├── admin/
│   │   └── AdminPanel.tsx           # Full admin dashboard (1158 lines) — CRUD managers, CV import, branding, theme, layout, analytics
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (ThemeProvider + ToastProvider + SEO)
│   │   ├── page.tsx                 # Home page — renders Terminal
│   │   ├── error.tsx                # Global error boundary ("SYSTEM_FAULT" screen)
│   │   ├── not-found.tsx            # Custom 404 page ("PATH_NOT_FOUND")
│   │   ├── loading.tsx              # Root loading state with progress animation
│   │   ├── globals.css              # Global styles + animations
│   │   ├── actions.ts               # Server Actions (data fetching, visitor recording)
│   │   ├── admin/
│   │   │   └── page.tsx             # Admin route — mounts AdminPanel
│   │   ├── resume/
│   │   │   └── print/page.tsx       # Printable resume page (server component)
│   │   ├── setup/
│   │   │   └── page.tsx             # Setup Wizard UI (multi-step form)
│   │   └── api/                     # API Routes
│   │       ├── admin/               # Protected admin endpoints (14 routes)
│   │       │   ├── login/route.ts   # Auth with Zod validation + audit logging
│   │       │   ├── logout/route.ts
│   │       │   ├── session/route.ts
│   │       │   ├── profile/route.ts
│   │       │   ├── projects/route.ts
│   │       │   ├── projects/[id]/route.ts
│   │       │   ├── experience/route.ts
│   │       │   ├── experience/[id]/route.ts
│   │       │   ├── education/route.ts
│   │       │   ├── education/[id]/route.ts
│   │       │   ├── skills/route.ts
│   │       │   ├── analytics/route.ts   # Typed aggregate analytics endpoint
│   │       │   ├── settings/route.ts
│   │       │   ├── branding/route.ts    # Branding config (public GET + admin PUT)
│   │       │   ├── visual/route.ts      # Visual config (public GET + admin PUT)
│   │       │   └── cv-import/route.ts   # Bulk CV import with per-section error isolation
│   │       ├── analytics/
│   │       │   └── track/route.ts   # Public visitor tracking endpoint
│   │       ├── generate-resume/route.ts
│   │       └── setup/
│   │           ├── route.ts         # POST: initialize system
│   │           └── status/route.ts  # GET: check if initialized
│   ├── cli/
│   │   └── Terminal.tsx             # Core CLI component (684 lines)
│   ├── gui/
│   │   └── GUIInterface.tsx         # Dashboard GUI component (318 lines)
│   ├── components/
│   │   ├── MatrixBackground.tsx     # Canvas-based Matrix rain effect (201 lines)
│   │   ├── VisitorForm.tsx          # Boot-time visitor registration + Matrix background
│   │   ├── LoadingSkeleton.tsx      # Skeleton loading components (5 variants)
│   │   └── ui/                      # shadcn/ui primitives (9 components)
│   ├── lib/
│   │   ├── data.ts                  # Static fallback data
│   │   ├── supabase.ts              # Supabase client initialization
│   │   └── utils.ts                 # Utility helpers (cn, etc.)
│   ├── modules/
│   │   └── analytics/
│   │       └── tracker.ts           # Client-side analytics tracker
│   ├── security/
│   │   ├── auth.ts                  # Auth module (bcrypt + HMAC sessions + cookies)
│   │   ├── AdminLoginModal.tsx      # Stealth login modal
│   │   └── rate-limit.ts            # In-memory IP-based rate limiter
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces (BrandingConfig, VisualConfig, AuditLog, etc.)
│   └── middleware.ts                # Edge middleware (route protection, security headers)
├── .env.example                     # Environment variable template
├── .env.local                       # Local environment (gitignored)
├── components.json                  # shadcn/ui config
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

### 3.2 Data Flow Architecture

```
UI Components (CLI/GUI/Admin)
    ↓ Server Actions / API calls
Service Layer (src/core/services/)
    ↓ Zod validation
    ↓ Business logic
    ↓ Audit logging
Repository Layer (src/core/repositories/)
    ↓ BaseRepository<T> CRUD
Supabase PostgreSQL
    (or static fallback → src/lib/data.ts)
```

All data access passes through the **service layer** — no direct Supabase calls in UI components or API routes. Each service validates inputs with Zod, delegates to repositories, and logs audit events.

---

## 4. Core Features (Visitor-Facing)

### 4.1 Boot Sequence

When a visitor loads the site, the `Terminal` component simulates a Linux-style boot sequence:
- Progress bars and system check messages (`LOADING_KERNEL`, `MOUNTING_FILESYSTEM`, etc.)
- Real data connections are established in the background during the boot animation
- After the boot, the `VisitorForm` appears with the Matrix background

### 4.2 Visitor Form

`VisitorForm` collects:
- **Name** (required)
- **Email** (optional)
- **Mode toggle**: CLI or GUI

Features:
- **Matrix Background** — Canvas-based falling character animation behind the form
- **Branding Config** — Background text, color, speed, density loaded from DB
- **Stealth Admin Detection** — Admin keyword triggers the login modal instead

The visitor is recorded via the service layer. An analytics `session_start` event is also fired.

### 4.3 Terminal Interface (`src/cli/Terminal.tsx`)

The main CLI component (684 lines). Manages:
- **Command processing**: `help`, `about`, `projects`, `experience`, `education`, `skills`, `achievements`, `contact`, `resume`, `speedfetch`, `gui`, `logout`, `clear`.
- **Auto-scroll**: Terminal always scrolls to bottom.
- **Command history**: Arrow keys (`Up`/`Down`) cycle through previous commands.
- **Tab completion**: Basic auto-complete for known commands.
- **Analytics integration**: Every command is tracked via `trackCommand()`.
- **Admin keyword detection**: A hidden keyword triggers the `AdminLoginModal`.

### 4.4 GUI Interface (`src/gui/GUIInterface.tsx`)

A modern dashboard (318 lines) with sidebar navigation:
- **Dashboard**: Profile card, social stats, GitHub contribution graph
- **Projects**: Fetched project cards with tech stack badges
- **Experience**: Timeline-style work history
- **Education**: Academic history
- **Skills**: Categorized skill badges
- **Contact**: Contact information and social links

### 4.5 PDF Resume Generation

Two-part system:
1. **`/resume/print`** — Server-rendered page that fetches all data and renders a clean, printable A4 resume layout.
2. **`/api/generate-resume`** — Launches Puppeteer, navigates to `/resume/print`, generates a PDF buffer, and streams it. Uses `puppeteer-core` + `@sparticuz/chromium` on Vercel.

---

## 5. Matrix Identity System

### 5.1 MatrixBackground Component (`src/components/MatrixBackground.tsx`)

A **Canvas-based** Matrix rain effect component (201 lines):

| Feature | Implementation |
|:--------|:---------------|
| **Rendering** | HTML5 Canvas with `requestAnimationFrame` loop |
| **Characters** | Katakana + alphanumeric + special characters |
| **Background text** | Large typography (e.g. "MIMANSH") at 50% viewport width with glow layers |
| **Frame rate control** | Speed-based interval throttling |
| **Memory safety** | Properly cleaned up via effect cleanup (cancelAnimationFrame, removeEventListener) |
| **Tab pause** | Page Visibility API — pauses when tab is inactive |
| **Reduced motion** | Respects `prefers-reduced-motion` — shows static text only |
| **Configurable** | `text`, `color`, `speed`, `density`, `opacity`, `enabled` props |

### 5.2 Admin Branding Control

The admin panel's **Branding Manager** controls:
- **Background display name text** (default: "MIMANSH")
- **Matrix effect enable/disable**
- **Matrix color** (hex color picker)
- **Matrix speed** (0.1–5.0)
- **Matrix density** (0.1–2.0)
- **Matrix opacity** (0–1)
- **Background mode** (matrix / minimal / custom)

Changes persist to the `branding_config` table and are loaded by `VisitorForm` on mount.

---

## 6. Data Management

### 6.1 Service Layer (`src/core/services/index.ts`)

The centralized service layer (373 lines) handles all business logic:

| Service | Methods | Description |
|:--------|:--------|:------------|
| `projectsService` | `getAll`, `create`, `update`, `delete` | Project CRUD with slug generation |
| `experienceService` | `getAll`, `create`, `update`, `delete` | Work experience CRUD |
| `educationService` | `getAll`, `create`, `update`, `delete` | Education CRUD |
| `skillsService` | `getAll`, `upsert` | Skills with category-based upsert |
| `achievementsService` | `getAll` | Read-only achievements |
| `profileService` | `get`, `update` | Singleton profile management |
| `visitorService` | `record` | Visitor recording |
| `brandingService` | `get`, `update` | Matrix/branding config management |
| `visualConfigService` | `get`, `update` | Theme/visual config management |
| `systemConfigService` | `getAll`, `set` | Legacy key-value config |
| `auditService` | `log`, `getRecent` | Audit trail logging |

Every write operation:
1. Validates input with Zod
2. Delegates to the corresponding repository
3. Logs the action via `logger.audit()`
4. Writes to the `audit_logs` table via `auditService`

### 6.2 Repository Pattern (`src/core/repositories/`)

`BaseRepository<T>` provides generic Supabase CRUD:
- `findAll(orderBy?, ascending?)` — List all rows
- `findById(id)` — Find by UUID
- `findSingleton()` — Find single row (for config tables)
- `create(input)` — Insert new row
- `update(id, input)` — Update by ID
- `upsertSingleton(input)` — Update-or-insert for config tables
- `delete(id)` — Delete by ID
- `upsert(rows, conflictColumn)` — Bulk upsert
- `isConfigured` — Check if Supabase is connected

Entity repositories: `projectsRepo`, `experienceRepo`, `educationRepo`, `skillsRepo`, `achievementsRepo`, `profileRepo`, `visitorsRepo`, `brandingRepo`, `visualConfigRepo`, `auditRepo`, `systemConfigRepo`.

### 6.3 Validation (`src/core/validators/schemas.ts`)

Zod schemas for all inputs:
- `ProjectSchema`, `ExperienceSchema`, `EducationSchema`, `SkillSchema`, `AchievementSchema`, `ProfileSchema`
- `BrandingConfigSchema`, `VisualConfigSchema`
- `LoginInputSchema`, `VisitorInputSchema`

Validated types are exported: `ProjectInput`, `ExperienceInput`, etc.

### 6.4 Server Actions (`src/app/actions.ts`)

Marked with `'use server'`. Wraps service layer for safe server-side invocation:
- `fetchProfile()`, `fetchProjects()`, `fetchExperience()`, `fetchEducation()`, `fetchSkills()`, `fetchAchievements()`
- `fetchGithubStats()` — Live data from GitHub REST API
- `fetchSocialStats()` — Currently mocked
- `recordVisitor(name, email?)` — Records via service layer
- `fetchBrandingConfig()`, `fetchVisualConfig()` — Config for frontend theming
- `checkAdminKeyword(input)` — Validates admin keyword for stealth access

### 6.5 Static Fallback Data (`src/lib/data.ts`)

Pre-populated with real information for operation without Supabase:
- **Profile**: Mimansh Neupane Pokharel, CS Student & System Architect
- **Skills**: 8 categories
- **Projects**: Ask-M, Healthcare DBMS, Linux Network Projects
- **Experience**: Blueprint Marketing, Tears of Happiness
- **Education**: Kathmandu University, British Grammar School
- **Achievements**: KU Computer Club, IT Meet 2025, Aavishkar 25, Namaste Creative Fest

---

## 7. Database Schema

Initialize your database by running `db/v1.0.0-production-schema.sql` in the Supabase SQL Editor.

| Table              | Key Columns | Notes |
| :----------------- | :---------- | :---- |
| `projects` | id (UUID), title, slug (unique), description, tech_stack[], role, repo_url, live_url, is_featured, image_url | Ordered by `start_date` descending |
| `experience` | id (UUID), company, role, start_date, end_date, description, skills_used[], location, type | |
| `education` | id (UUID), institution, degree, field_of_study, start_date, end_date, grade, activities | |
| `skills` | id (UUID), category (unique), items[] | Ordered by `category` |
| `achievements` | id (UUID), title, organization, date, description, url | |
| `profile` | id (UUID), full_name, headline, bio, email, location, avatar_url, website_url, custom_css | Singleton |
| `socials` | id (UUID), platform, username, url, icon | |
| `resume_versions` | id (UUID), version_number, file_url, changelog | |
| `visitors` | id (UUID), name, email, created_at | |

### 7.2 Analytics Tables (`db/analytics.sql`)

| Table | Key Columns | Notes |
| :---- | :---------- | :---- |
| `sessions` | id (UUID), visitor_name, mode, started_at, ended_at, page_views | Public INSERT |
| `command_logs` | id (UUID), session_id (FK), command, created_at | Public INSERT |
| `resume_downloads` | id (UUID), session_id (FK), created_at | Public INSERT |
| `audit_logs` | id (UUID), action, admin_username, change_summary, ip_address, details (JSONB), created_at | Admin-only |
| `cv_versions` | id (UUID), version_number, data (JSONB), applied_at, applied_by | CV import history |

### 7.3 Config Tables (`db/migration-002-config-tables.sql`)

| Table | Key Columns | Notes |
| :---- | :---------- | :---- |
| `branding_config` | id, display_name, background_name_text, matrix_enabled, matrix_speed, matrix_density, matrix_color, matrix_opacity, background_mode | Singleton |
| `visual_config` | id, terminal_color, accent_color, font_family, dark_mode, ascii_header, boot_enabled, visitor_form_enabled, default_mode | Singleton |

All tables have UUID primary keys, RLS enabled, public SELECT, authenticated-only INSERT/UPDATE/DELETE.

---

## 8. Security System

### 8.1 Authentication (`src/security/auth.ts`)

- **Credential Validation**: `bcryptjs` comparison with constant-time fake comparison on username mismatch (prevents timing attacks)
- **Session Tokens**: Custom HMAC-SHA256 signed tokens: `base64(payload).signature`
  - Payload: `{ username, createdAt, expiresAt }`
  - Configurable expiry via `SESSION_EXPIRY_HOURS` (default: 2 hours)
- **Cookie Management**: HttpOnly, Secure (production), SameSite=Strict
- **Login Validation**: Zod schema validation on all login inputs
- **Audit Logging**: Both successful and failed login attempts are logged

### 8.2 Middleware (`src/middleware.ts`)

Runs on Edge Runtime. Matches routes: `/admin/*`, `/api/admin/*`.

- **Protected paths**: `/admin`, `/api/admin` — require valid session cookie
- **Excluded paths**: `/api/admin/login` — allows unauthenticated access
- **Unauthenticated visitors** hitting `/admin` → silently redirected to `/`
- **Unauthenticated API calls** → `401 Unauthorized`
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-XSS-Protection`, `Permissions-Policy`

### 8.3 Rate Limiting (`src/security/rate-limit.ts`)

In-memory IP-based rate limiter:
- **Max attempts**: 5 within 15-minute window
- **Auto-cleanup**: Every 30 minutes
- **Resets** on successful login

### 8.4 Stealth Admin Access Flow

1. Visitor types admin keyword in the terminal
2. `checkAdminKeyword()` server action validates it
3. `AdminLoginModal` appears — Matrix background shown
4. Login form POSTs to `/api/admin/login` (rate-limited, Zod-validated)
5. On success → session cookie → redirect to `/admin`
6. On failure → audit log entry → silent reset

---

## 9. Admin Panel (`src/admin/AdminPanel.tsx`)

A comprehensive 1158-line admin dashboard with tabbed navigation:

### 9.1 Content Managers

Each manager uses a generic `useAdminData` hook for fetching, loading, and error handling.

| Tab | API Endpoint | Capabilities |
| :-- | :----------- | :----------- |
| **Profile** | `/api/admin/profile` | View/edit singleton profile |
| **Projects** | `/api/admin/projects` | List, create, update, delete |
| **Experience** | `/api/admin/experience` | List, create, update, delete |
| **Education** | `/api/admin/education` | List, create, update, delete |
| **Skills** | `/api/admin/skills` | List, create, update (batch) |

### 9.2 CV Import Engine

- AI-prompted JSON extraction from CV
- Paste AI-generated JSON → parse → validate → apply to all tables
- **Per-section error isolation**: if one section fails, remaining sections still apply
- Version snapshot saved to `cv_versions`
- Audit logged with error summary

### 9.3 Branding Manager

Controls the Matrix identity system:
- Background display name text
- Matrix effect enable/disable
- Matrix color, speed, density, opacity
- Background mode (matrix / minimal / custom)
- Persists to `branding_config` table via `/api/admin/branding`

### 9.4 Theme Manager

Visual customization:
- **Color Presets**: Matrix (green), Ocean (blue), Sunset (orange), Violet, Ghost (gray)
- **Custom Colors**: Terminal + accent color pickers
- **Font Selection**: JetBrains Mono, Fira Code, Source Code Pro, IBM Plex Mono, Courier New
- Persists to `visual_config` table via `/api/admin/visual`

### 9.5 Layout Control

Structural behavior:
- ASCII Header text customization
- Dark mode toggle
- Default mode selection (CLI vs GUI)
- Boot sequence toggle
- Visitor form toggle
- Persists via `/api/admin/settings`

### 9.6 Analytics Dashboard

Aggregated visitor analytics:
- Stat cards: Total visits, unique sessions, resume downloads
- CLI vs GUI split percentage
- Top commands with counts
- Visits by day line chart (last 30 days via Recharts)
- Recent sessions table

---

## 10. Production Infrastructure

### 10.1 Error Handling

| Layer | Component | Description |
|:------|:----------|:------------|
| **Global** | `src/app/error.tsx` | Error boundary — "SYSTEM_FAULT" screen with retry/reboot |
| **404** | `src/app/not-found.tsx` | "PATH_NOT_FOUND" terminal page |
| **Loading** | `src/app/loading.tsx` | Root loading state with progress animation |
| **API** | `src/core/errors/errors.ts` | `AppError` class with typed error codes |
| **API** | `src/core/api-response.ts` | `apiSuccess()`, `apiError()`, `apiCatch()` wrappers |

### 10.2 Toast Notification System

`ToastProvider` (`src/core/providers/ToastProvider.tsx`) provides a `useToast()` hook:

```typescript
const { success, error, info, warning } = useToast();
success('Configuration saved');
error('Failed to update');
```

Features: auto-dismiss, max 5 stacked, click to dismiss, type-based styling (green/red/cyan/yellow).

### 10.3 Loading Skeletons

`LoadingSkeleton` (`src/components/LoadingSkeleton.tsx`) with variants:
- `text`, `card`, `row`, `circle`, `block`
- Presets: `CardSkeleton`, `TableSkeleton`

### 10.4 Dynamic Theme Injection

`ThemeProvider` (`src/core/providers/ThemeProvider.tsx`):
1. Loads `visual_config` + `branding_config` from API on mount
2. Injects CSS custom properties: `--terminal-color`, `--accent-color`, `--font-family`
3. Provides `useTheme()` + `useBranding()` hooks
4. Supports `refreshTheme()` for live updates after admin changes

### 10.5 Structured Logging

`logger` (`src/core/logger.ts`) with levels: `info`, `warn`, `error`, `audit`. Structured JSON output. Ready to swap with external service (Datadog, Sentry, etc.).

### 10.6 Audit Logging

`auditService` logs all admin actions to the `audit_logs` table:
- Entity CRUD (create, update, delete)
- Branding and visual config changes
- CV imports (with error summary)
- Login attempts (success + failure with IP)

---

## 11. Analytics Tracking (`src/modules/analytics/tracker.ts`)

Client-side tracking module. Fires events to `/api/analytics/track`:

| Function | Event | Data Sent |
| :------- | :---- | :-------- |
| `trackSessionStart()` | `session_start` | visitor_name, mode |
| `trackCommand()` | `command` | session_id, command string |
| `trackResumeDownload()` | `resume_download` | session_id |
| `trackPageView()` | `page_view` | session_id |

---

## 12. Setup Wizard (`/setup`)

Multi-step first-run wizard (275 lines):

1. **Welcome** — Introduction
2. **Admin Credentials** — Username + password (min 8 chars) + admin keyword
3. **Database** — Optional Supabase URL + Anon Key
4. **Review** — Summary
5. **Initialize** — Creates config, hashes password, generates SESSION_SECRET

---

## 13. API Routes Summary

### Public Endpoints (No Auth)
| Method | Route | Description |
| :----- | :---- | :---------- |
| GET | `/` | Main portfolio page |
| GET | `/resume/print` | Printable resume |
| GET | `/api/generate-resume` | PDF resume generation |
| POST | `/api/analytics/track` | Visitor event tracking |
| GET | `/api/setup/status` | Check initialization status |
| POST | `/api/setup` | First-run initialization |
| POST | `/api/admin/login` | Admin authentication (rate-limited, Zod-validated) |
| GET | `/api/admin/branding` | Public branding config read |
| GET | `/api/admin/visual` | Public visual config read |

### Protected Endpoints (Session Cookie Required)
| Method | Route | Description |
| :----- | :---- | :---------- |
| GET | `/admin` | Admin panel page |
| GET/PUT | `/api/admin/profile` | Profile management |
| GET/POST | `/api/admin/projects` | Project CRUD |
| PUT/DELETE | `/api/admin/projects/[id]` | Project by ID |
| GET/POST | `/api/admin/experience` | Experience CRUD |
| PUT/DELETE | `/api/admin/experience/[id]` | Experience by ID |
| GET/POST | `/api/admin/education` | Education CRUD |
| PUT/DELETE | `/api/admin/education/[id]` | Education by ID |
| GET/POST/PUT | `/api/admin/skills` | Skills management |
| GET | `/api/admin/analytics` | Aggregated analytics (typed response) |
| GET/PUT | `/api/admin/settings` | Visual settings (legacy compat) |
| PUT | `/api/admin/branding` | Update branding config |
| PUT | `/api/admin/visual` | Update visual config |
| POST | `/api/admin/cv-import` | Bulk CV import (error-isolated) |
| POST | `/api/admin/logout` | Clear session |
| GET | `/api/admin/session` | Verify session |

---

## 14. UI Components (`src/components/ui/`)

Built with **shadcn/ui**:

| Component | Usage |
| :-------- | :---- |
| `Button` | Admin panel actions, forms |
| `Card` | Stats, manager containers |
| `Dialog` | Modals |
| `Input` | Form fields |
| `Label` | Form labels |
| `Table` | Analytics session list |
| `Tabs` | Admin navigation, GUI sections |
| `Textarea` | CV import, description fields |
| `Alert` | Status messages |

---

## 15. TypeScript Types (`src/types/index.ts`)

```typescript
interface Project         // id, title, slug, description, tech_stack[], role, repo_url, live_url, ...
interface Experience      // id, company, role, start_date, end_date, description, skills_used[], ...
interface Education       // id, institution, degree, field_of_study, ...
interface SkillCategory   // id, category, items[]
interface Achievement     // id, title, organization, date, description, url
interface Profile         // full_name, headline, bio, email, location, ...
interface CommandOutput   // id, command, output (ReactNode), timestamp
interface BrandingConfig  // id, display_name, background_name_text, matrix_enabled, matrix_speed, ...
interface VisualConfig    // id, terminal_color, accent_color, font_family, dark_mode, ...
interface AuditLog        // id, action, admin_username, change_summary, ip_address, details, ...
```

---

## 16. Environment Variables

```env
# Supabase (optional — falls back to static data if not set)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Admin Access (REQUIRED for admin panel)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=          # Generate: node -e "const b=require('bcryptjs');b.hash('yourpassword',12).then(h=>console.log(h))"
ADMIN_KEYWORD=__admin_access__

# Session Security
SESSION_SECRET=               # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_EXPIRY_HOURS=2
```

---

## 17. Visual Design

### Root Layout (`layout.tsx`)
- **Font**: Geist Mono (monospace)
- **Background**: Pure black
- **Text**: Green-500 (terminal green) — dynamically overridable via ThemeProvider
- **Overlays**: Scanline + radial vignette for CRT effect
- **Providers**: ThemeProvider → ToastProvider → children
- **SEO**: Open Graph, meta description, keywords, robots

### Theme Presets (Admin Configurable)
| Preset | Terminal Color | Accent Color |
| :----- | :------------- | :----------- |
| Matrix | `#22c55e` | `#06b6d4` |
| Ocean | `#0ea5e9` | `#8b5cf6` |
| Sunset | `#f97316` | `#ef4444` |
| Violet | `#a855f7` | `#ec4899` |
| Ghost | `#6b7280` | `#9ca3af` |

---

## 18. Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (see Section 16)
4. Deploy

**Notes**:
- PDF generation uses `puppeteer-core` + `@sparticuz/chromium` (50MB serverless limit)
- `maxDuration = 60` on the resume endpoint
- Setup Wizard uses `system_config` table on Vercel (read-only filesystem)

### Local Development
```bash
git clone https://github.com/walterwhite91/portfolio-os.git
cd portfolio-os
npm install
cp .env.example .env.local   # Fill in your values
npm run dev                   # Starts at http://localhost:3000
```

---

## 19. Development Phases

| Phase | Feature | Status |
| :---- | :------ | :----- |
| 1 | Core Portfolio (CLI + GUI) | ✅ Complete |
| 2 | Modular OS Architecture | ✅ Complete |
| 3 | Admin Panel + Security | ✅ Complete |
| 4 | Analytics Dashboard | ✅ Complete |
| 5 | CV Import Engine | ✅ Complete |
| 6 | Setup Wizard | ✅ Complete |
| 7 | Theme Manager | ✅ Complete |
| 8 | Layout Control | ✅ Complete |
| 9 | PDF Resume | ✅ Complete |
| 10 | Database Schema + RLS | ✅ Complete |
| 11 | Service Layer Architecture | ✅ v1.0 |
| 12 | Repository Pattern + Zod Validation | ✅ v1.0 |
| 13 | Matrix Identity System | ✅ v1.0 |
| 14 | Branding Manager | ✅ v1.0 |
| 15 | Dynamic Theme Injection | ✅ v1.0 |
| 16 | Production Hardening (Error Boundary, Toast, Skeletons, 404) | ✅ v1.0 |
| 17 | Audit Logging System | ✅ v1.0 |
| 18 | API Route Upgrades (Typed Responses, Zod) | ✅ v1.0 |

---

## 20. Known Issues / Notes

1. **Middleware deprecation warning**: Next.js 16 shows a warning about the `middleware` file convention being deprecated in favor of `proxy`. The current middleware still works fine.
2. **Social stats are mocked**: `fetchSocialStats()` returns hardcoded numbers.
3. **Supabase is optional**: The entire app works without Supabase — falls back to static data. Admin write operations require Supabase.

---

*Built by Mimansh Neupane Pokharel — [GitHub](https://github.com/walterwhite91) | [Portfolio](https://portfolio-os.vercel.app)*
