# Portfolio OS — Full Documentation

> **Last updated:** 2026-02-17  
> **Author:** Mimansh Neupane Pokharel  
> **Version:** 0.1.0  

---

## 1. Introduction

**Portfolio OS** (Stealth Edition) is a dual-interface personal portfolio web application with a hacker/cyberpunk aesthetic. It provides two distinct modes of interaction:

1. **CLI (Command Line Interface)** — A retro-styled terminal where visitors type commands to navigate.
2. **GUI (Graphical User Interface)** — A modern, dashboard-style interface with tabs and visual widgets.

Behind the scenes, it includes a **full-featured admin panel**, an **analytics dashboard**, a **setup wizard**, **theme/layout management**, and a **CV import engine** — all secured with session-based authentication, rate limiting, and middleware protection.

---

## 2. Tech Stack

| Category           | Technology                                                    |
| :----------------- | :------------------------------------------------------------ |
| **Framework**      | Next.js 16.1.6 (App Router, Turbopack)                       |
| **Language**       | TypeScript                                                    |
| **Styling**        | Tailwind CSS v4, `tw-animate-css`                             |
| **UI Components**  | shadcn/ui (Button, Card, Dialog, Input, Label, Table, Tabs, Textarea, Alert) |
| **Animations**     | Framer Motion                                                 |
| **Icons**          | Lucide React                                                  |
| **Charts**         | Recharts                                                      |
| **Backend / DB**   | Supabase (PostgreSQL + Row Level Security)                    |
| **Auth**           | Custom HMAC session tokens + bcryptjs + middleware             |
| **PDF Generation** | Puppeteer + `@sparticuz/chromium` (Vercel-compatible)          |
| **Font**           | Geist Mono (via `next/font/google`)                           |

---

## 3. Architecture Overview

### 3.1 Modular Directory Structure

The codebase follows a **modular OS-style architecture** with clear separation of concerns:

```
portfolio-os/
├── db/                              # SQL schemas
│   ├── schema.sql                   # Core tables (projects, experience, education, skills, achievements, profile, socials, resume_versions, visitors)
│   ├── analytics.sql                # Analytics tables (sessions, command_logs, resume_downloads, audit_logs, cv_versions)
│   └── visitors.sql                 # Standalone visitors table
├── public/                          # Static assets
├── src/
│   ├── admin/                       # Admin panel UI
│   │   └── AdminPanel.tsx           # Full admin dashboard (1008 lines) — CRUD managers, CV import, theme, layout, analytics
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (dark mode, scanline overlay, CRT vignette)
│   │   ├── page.tsx                 # Home page — renders Terminal
│   │   ├── globals.css              # Global styles
│   │   ├── actions.ts               # Server Actions (data fetching, visitor recording, GitHub API)
│   │   ├── admin/
│   │   │   └── page.tsx             # Admin route — mounts AdminPanel
│   │   ├── resume/
│   │   │   └── print/page.tsx       # Printable resume page (server component)
│   │   ├── setup/
│   │   │   └── page.tsx             # Setup Wizard UI (multi-step form)
│   │   └── api/                     # API Routes
│   │       ├── admin/               # Protected admin endpoints
│   │       │   ├── login/route.ts
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
│   │       │   ├── analytics/route.ts
│   │       │   ├── settings/route.ts
│   │       │   └── cv-import/route.ts
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
│   │   ├── VisitorForm.tsx          # Boot-time visitor registration
│   │   └── ui/                      # shadcn/ui primitives (9 components)
│   ├── lib/
│   │   ├── api.ts                   # Hybrid data fetching (Supabase → static fallback)
│   │   ├── data.ts                  # Static fallback data (profile, projects, experience, education, skills, achievements)
│   │   ├── supabase.ts              # Supabase client initialization
│   │   └── utils.ts                 # Utility helpers (cn, etc.)
│   ├── modules/
│   │   └── analytics/
│   │       └── tracker.ts           # Client-side analytics tracker (session start, commands, resume downloads, page views)
│   ├── security/
│   │   ├── auth.ts                  # Auth module (bcrypt validation, HMAC session tokens, cookie helpers)
│   │   ├── AdminLoginModal.tsx      # Stealth login modal
│   │   └── rate-limit.ts            # In-memory IP-based rate limiter
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces (Project, Experience, Education, SkillCategory, Achievement, Profile, CommandOutput)
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

---

## 4. Core Features (Visitor-Facing)

### 4.1 Boot Sequence

When a visitor loads the site, the `Terminal` component simulates a Linux-style boot sequence:
- Progress bars and system check messages (`LOADING_KERNEL`, `MOUNTING_FILESYSTEM`, etc.)
- Real data connections are established in the background during the boot animation
- After the boot, the `VisitorForm` appears

### 4.2 Visitor Form

`VisitorForm` collects:
- **Name** (required)
- **Email** (optional)
- **Mode toggle**: CLI or GUI

The visitor is recorded in Supabase's `visitors` table via a server action. An analytics `session_start` event is also fired through the tracker module.

### 4.3 Terminal Interface (`src/cli/Terminal.tsx`)

The main CLI component (684 lines). Manages:
- **Command processing**: A `switch (cmd)` block handles commands like `help`, `about`, `projects`, `experience`, `education`, `skills`, `achievements`, `contact`, `resume`, `speedfetch`, `gui`, `logout`, `clear`.
- **Auto-scroll**: Terminal always scrolls to bottom.
- **Command history**: Arrow keys (`Up`/`Down`) cycle through previous commands.
- **Tab completion**: Basic auto-complete for known commands.
- **Analytics integration**: Every command is tracked via `trackCommand()`.
- **Admin keyword detection**: A hidden keyword (default: `__admin_access__`) triggers the `AdminLoginModal`.

### 4.4 GUI Interface (`src/gui/GUIInterface.tsx`)

A modern dashboard (318 lines) with sidebar navigation:
- **Dashboard**: Profile card, social stats, GitHub contribution graph
- **Projects**: Fetched project cards with tech stack badges
- **Experience**: Timeline-style work history
- **Education**: Academic history
- **Skills**: Categorized skill badges
- **Contact**: Contact information and social links
- **Responsive**: Switches to stacked layout on mobile

### 4.5 PDF Resume Generation

Two-part system:
1. **`/resume/print`** — A server-rendered page (`ResumePrintPage`) that fetches all data from `lib/api.ts` and renders a clean, printable A4 resume layout (white background, structured sections: Summary, Experience, Projects, Education, Skills, Achievements).
2. **`/api/generate-resume`** — Launches Puppeteer, navigates to `/resume/print`, generates a PDF buffer, and streams it to the user. Uses `puppeteer` locally and `puppeteer-core` + `@sparticuz/chromium` on Vercel.

---

## 5. Data Management

### 5.1 Hybrid Data Fetching (`src/lib/api.ts`)

Every data function follows the same pattern:
1. Check if Supabase is configured (`supabase` client is non-null)
2. If yes → query Supabase
3. If no (or error) → return static fallback from `src/lib/data.ts`

Functions: `getProfile()`, `getProjects()`, `getExperience()`, `getEducation()`, `getSkills()`, `getAchievements()`

### 5.2 Server Actions (`src/app/actions.ts`)

Marked with `'use server'`. Wraps `lib/api.ts` functions for safe server-side invocation:
- `fetchProfile()`, `fetchProjects()`, `fetchExperience()`, `fetchEducation()`, `fetchSkills()`, `fetchAchievements()`
- `fetchGithubStats()` — Live data from GitHub REST API (`/users/walterwhite91`)
- `fetchSocialStats()` — Currently mocked (LinkedIn: 500 followers, Instagram: 1200 followers)
- `recordVisitor(name, email?)` — Inserts into Supabase `visitors` table
- `checkAdminKeyword(input)` — Validates admin keyword for stealth access

### 5.3 Static Fallback Data (`src/lib/data.ts`)

Pre-populated with real information:
- **Profile**: Mimansh Neupane Pokharel, CS Student & System Architect
- **Skills**: 8 categories (Programming, Database, Web & Backend, AI & Tools, Dev Tools, Design, Networking & Linux, Soft Skills)
- **Projects**: Ask-M, Healthcare DBMS, Linux Network Projects
- **Experience**: Blueprint Marketing, Tears of Happiness
- **Education**: Kathmandu University (B.Sc. CS), British Grammar School (+2 Science)
- **Achievements**: KU Computer Club, IT Meet 2025, Aavishkar 25, Namaste Creative Fest

### 5.4 Supabase Client (`src/lib/supabase.ts`)

Conditionally creates a Supabase client only if both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. Returns `null` otherwise, enabling the fallback-first approach.

---

## 6. Database Schema

### 6.1 Core Tables (`db/schema.sql`)

| Table              | Key Columns                                                            | Notes                              |
| :----------------- | :--------------------------------------------------------------------- | :--------------------------------- |
| `projects`         | id (UUID), title, slug (unique), description, tech_stack[], role, repo_url, live_url, is_featured, image_url | Ordered by `start_date` descending |
| `experience`       | id (UUID), company, role, start_date, end_date (nullable = Present), description, skills_used[], location, type (enum) | |
| `education`        | id (UUID), institution, degree, field_of_study, start_date, end_date, grade, activities | |
| `skills`           | id (UUID), category (unique), items[]                                  | Ordered by `category`              |
| `achievements`     | id (UUID), title, organization, date, description, url                 | |
| `profile`          | id (UUID), full_name, headline, bio, email, location, avatar_url, website_url, custom_css (JSONB) | Singleton pattern                  |
| `socials`          | id (UUID), platform, username, url, icon                               | |
| `resume_versions`  | id (UUID), version_number, file_url, changelog                         | |
| `visitors`         | id (UUID), name, email, created_at                                     | |

All tables have:
- UUID primary keys via `uuid_generate_v4()`
- Row Level Security (RLS) enabled
- Public `SELECT` policies
- Authenticated-only `INSERT`/`UPDATE`/`DELETE` policies

Seed data is included in the SQL for initial population.

### 6.2 Analytics Tables (`db/analytics.sql`)

| Table              | Key Columns                                                     | Notes                          |
| :----------------- | :-------------------------------------------------------------- | :----------------------------- |
| `sessions`         | id (UUID), visitor_name, mode ('cli'/'gui'), started_at, ended_at, page_views | Public INSERT                  |
| `command_logs`     | id (UUID), session_id (FK → sessions), command, created_at      | Public INSERT, FK cascade      |
| `resume_downloads` | id (UUID), session_id (FK → sessions), created_at               | Public INSERT                  |
| `audit_logs`       | id (UUID), action, ip_address, details (JSONB), created_at      | Admin-only                     |
| `cv_versions`      | id (UUID), version_number (SERIAL), data (JSONB), applied_at, applied_by | Tracks CV import history       |

---

## 7. Security System

### 7.1 Authentication (`src/security/auth.ts`)

- **Credential Validation**: `bcryptjs` comparison with constant-time fake comparison on username mismatch (prevents timing attacks)
- **Session Tokens**: Custom HMAC-SHA256 signed tokens: `base64(payload).signature`
  - Payload: `{ username, createdAt, expiresAt }`
  - Configurable expiry via `SESSION_EXPIRY_HOURS` (default: 2 hours)
- **Cookie Management**: HttpOnly, Secure (in production), SameSite=Strict
- **Password Hashing**: bcrypt with 12 salt rounds
- **Admin Keyword**: Hidden keyword for stealth access from the terminal

### 7.2 Middleware (`src/middleware.ts`)

Runs on Edge Runtime. Matches routes: `/admin/*`, `/api/admin/*`.

- **Protected paths**: `/admin`, `/api/admin` — require a valid session cookie
- **Excluded paths**: `/api/admin/login` — allows unauthenticated access
- **Unauthenticated visitors** hitting `/admin` are silently redirected to `/` (no login page exposed)
- **Unauthenticated API calls** to `/api/admin/*` return `401 Unauthorized`
- **Security headers** added to every matched response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

> **Note**: The middleware file uses the now-deprecated `middleware` convention. Next.js 16 recommends migrating to `proxy`. This is non-blocking.

### 7.3 Rate Limiting (`src/security/rate-limit.ts`)

In-memory IP-based rate limiter:
- **Max attempts**: 5 within 15-minute window
- **Auto-cleanup**: Every 30 minutes, expired entries are purged
- **Resets** on successful login

### 7.4 Stealth Admin Access Flow

1. Visitor types the admin keyword (e.g., `__admin_access__`) in the terminal
2. `checkAdminKeyword()` server action validates it
3. `AdminLoginModal` appears — styled to match the hacker aesthetic
4. Login form POSTs to `/api/admin/login` (rate-limited)
5. On success → session cookie is set → redirect to `/admin`
6. On failure → silent reset (no error messages shown)

---

## 8. Admin Panel (`src/admin/AdminPanel.tsx`)

A comprehensive 1008-line admin dashboard with tabbed navigation:

### 8.1 Content Managers

Each manager uses a **generic `useAdminData` hook** that handles fetching, loading states, and error handling.

| Tab              | Component           | API Endpoint                    | Capabilities                              |
| :--------------- | :------------------ | :------------------------------ | :---------------------------------------- |
| **Profile**      | `ProfileManager`    | `/api/admin/profile`            | View/edit singleton profile (PUT)         |
| **Projects**     | `ProjectsManager`   | `/api/admin/projects`, `/api/admin/projects/[id]` | List, create (POST), update (PUT), delete (DELETE) |
| **Experience**   | `ExperienceManager` | `/api/admin/experience`, `/api/admin/experience/[id]` | List, create, update, delete              |
| **Education**    | `EducationManager`  | `/api/admin/education`, `/api/admin/education/[id]`   | List, create, update, delete              |
| **Skills**       | `SkillsManager`     | `/api/admin/skills`             | List, create (POST), update (PUT) with batch support |

Each manager has dedicated form components (`ProjectForm`, `SkillForm`, `GenericForm`) with proper validation.

### 8.2 CV Import Engine

- Provides a pre-crafted AI prompt (`CV_PROMPT`) for extracting structured data from a CV
- "Copy Prompt" button for clipboard
- Paste the AI-generated JSON output into a textarea
- Parses and validates the JSON structure
- Applies data to all Supabase tables in one operation via `/api/admin/cv-import`
- Saves a version snapshot to `cv_versions` table

### 8.3 Theme Manager

Manages visual customization:
- **Color Presets**: Matrix (green), Ocean (blue), Sunset (orange), Violet, Ghost (gray)
- **Custom Colors**: Terminal color picker, accent color picker
- **Font Selection**: JetBrains Mono, Fira Code, Source Code Pro, IBM Plex Mono, Courier New
- Persists settings to Supabase `system_config` table via `/api/admin/settings`

### 8.4 Layout Control

Controls structural behavior:
- **ASCII Header text** customization
- **Dark mode** toggle
- **Default mode** selection (CLI vs GUI)
- **Boot sequence** toggle (show/hide)
- **Visitor form** toggle (show/hide)
- Persists via `/api/admin/settings`

### 8.5 Analytics Dashboard

Displays aggregated visitor analytics:
- **Stat cards**: Total visits, unique sessions, resume downloads
- **CLI vs GUI split**: Percentage breakdown with visual bar
- **Top commands**: Most-used CLI commands with counts
- **Visits by day**: Line chart (last 30 days) via Recharts
- **Recent sessions**: Table of last 20 visitor sessions
- Data fetched from `/api/admin/analytics` (aggregates from `sessions`, `command_logs`, `resume_downloads` tables)

---

## 9. Analytics Tracking (`src/modules/analytics/tracker.ts`)

Client-side tracking module. Fires events to `/api/analytics/track` (public endpoint, no auth):

| Function               | Event             | Data Sent                          |
| :--------------------- | :---------------- | :--------------------------------- |
| `trackSessionStart()`  | `session_start`   | visitor_name, mode                 |
| `trackCommand()`       | `command`         | session_id, command string         |
| `trackResumeDownload()`| `resume_download` | session_id                         |
| `trackPageView()`      | `page_view`       | session_id                         |

A `sessionId` is assigned on `session_start` and stored in module-level state for subsequent events.

---

## 10. Setup Wizard (`/setup`)

A multi-step first-run wizard (`src/app/setup/page.tsx`, 275 lines):

### Steps:
1. **Welcome** — Introduction screen
2. **Admin Credentials** — Username + password (min 8 chars) + admin keyword
3. **Database** — Optional Supabase URL + Anon Key
4. **Review** — Summary of all inputs
5. **Initialize** — POSTs to `/api/setup`

### What `/api/setup` does:
1. Checks if already initialized (marker file `.initialized` or Supabase `system_config` table)
2. Hashes the password (bcrypt, 12 rounds)
3. Generates a random `SESSION_SECRET` (32-byte hex)
4. Writes config to Supabase `system_config` table (if available)
5. Writes config to `.env.local` (if filesystem writable)
6. Creates `.initialized` marker file

### Status Check (`/api/setup/status`):
Checks three sources: `.initialized` file → env vars → Supabase `system_config` table.

---

## 11. API Routes Summary

### Public Endpoints (No Auth)
| Method | Route                       | Description                              |
| :----- | :-------------------------- | :--------------------------------------- |
| GET    | `/`                         | Main portfolio page (Terminal)           |
| GET    | `/resume/print`             | Printable resume (server-rendered HTML)  |
| GET    | `/api/generate-resume`      | PDF resume generation via Puppeteer      |
| POST   | `/api/analytics/track`      | Visitor analytics event tracking         |
| GET    | `/api/setup/status`         | Check initialization status              |
| POST   | `/api/setup`                | First-run system initialization          |
| POST   | `/api/admin/login`          | Admin authentication                     |

### Protected Endpoints (Session Cookie Required)
| Method    | Route                           | Description                         |
| :-------- | :------------------------------ | :---------------------------------- |
| GET       | `/admin`                        | Admin panel page                    |
| GET/PUT   | `/api/admin/profile`            | Fetch/update profile                |
| GET/POST  | `/api/admin/projects`           | List/create projects                |
| PUT/DELETE| `/api/admin/projects/[id]`      | Update/delete a project             |
| GET/POST  | `/api/admin/experience`         | List/create experience entries      |
| PUT/DELETE| `/api/admin/experience/[id]`    | Update/delete an experience entry   |
| GET/POST  | `/api/admin/education`          | List/create education entries       |
| PUT/DELETE| `/api/admin/education/[id]`     | Update/delete an education entry    |
| GET/POST/PUT | `/api/admin/skills`          | List/create/update skill categories |
| GET       | `/api/admin/analytics`          | Aggregated analytics data           |
| GET/PUT   | `/api/admin/settings`           | Theme & layout settings             |
| POST      | `/api/admin/cv-import`          | Bulk import CV data                 |
| POST      | `/api/admin/logout`             | Clear session cookie                |
| GET       | `/api/admin/session`            | Verify current session              |

---

## 12. UI Components (`src/components/ui/`)

Built with **shadcn/ui** (via `components.json`):

| Component      | File           | Usage                                   |
| :------------- | :------------- | :-------------------------------------- |
| `Button`       | `button.tsx`   | Admin panel actions, forms              |
| `Card`         | `card.tsx`     | Stats, manager containers               |
| `Dialog`       | `dialog.tsx`   | Modals                                  |
| `Input`        | `input.tsx`    | Form fields                             |
| `Label`        | `label.tsx`    | Form labels                             |
| `Table`        | `table.tsx`    | Analytics session list                  |
| `Tabs`         | `tabs.tsx`     | Admin panel navigation, GUI sections    |
| `Textarea`     | `textarea.tsx` | CV import, description fields           |
| `Alert`        | `alert.tsx`    | Status messages                         |

---

## 13. TypeScript Types (`src/types/index.ts`)

```typescript
interface Project       // id, title, slug, description, tech_stack[], role, repo_url, live_url, start_date, end_date, is_featured, image_url, created_at
interface Experience    // id, company, role, start_date, end_date, description, skills_used[], location, type (enum)
interface Education     // id, institution, degree, field_of_study, start_date, end_date, grade, description, activities
interface SkillCategory // id, category, items[]
interface Achievement   // id, title, organization, date, description, url
interface Profile       // full_name, headline, bio, email, location, website_url, avatar_url, custom_css
interface CommandOutput // id, command, output (ReactNode), timestamp
```

---

## 14. Environment Variables

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

## 15. Visual Design

### Root Layout (`layout.tsx`)
- **Font**: Geist Mono (monospace)
- **Background**: Pure black (`bg-black`)
- **Text**: Green-500 (terminal green)
- **Overlays**: Two layered overlays for CRT/retro effect:
  1. Scanline overlay (`mix-blend-overlay`, 20% opacity)
  2. Radial vignette gradient (dark edges, transparent center)
- **Class**: `dark` mode enabled on `<html>`

### Theme Presets (Admin Configurable)
| Preset  | Terminal Color | Accent Color |
| :------ | :------------ | :----------- |
| Matrix  | `#22c55e`     | `#06b6d4`    |
| Ocean   | `#0ea5e9`     | `#8b5cf6`    |
| Sunset  | `#f97316`     | `#ef4444`    |
| Violet  | `#a855f7`     | `#ec4899`    |
| Ghost   | `#6b7280`     | `#9ca3af`    |

---

## 16. Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (see Section 14)
4. Deploy

**Notes**:
- PDF generation uses `puppeteer-core` + `@sparticuz/chromium` to fit Vercel's 50MB serverless limit
- `maxDuration = 60` is set on the resume endpoint for longer execution
- The Setup Wizard writes `.env.local` locally but uses `system_config` table on Vercel (read-only filesystem)

### Local Development
```bash
git clone https://github.com/walterwhite91/portfolio-os.git
cd portfolio-os
npm install
cp .env.example .env.local   # Fill in your values
npm run dev                   # Starts at http://localhost:3000
```

---

## 17. Development Phases Completed

| Phase | Feature                    | Status      | Key Files                                            |
| :---- | :------------------------- | :---------- | :--------------------------------------------------- |
| 1     | Core Portfolio (CLI + GUI) | ✅ Complete | `Terminal.tsx`, `GUIInterface.tsx`, `VisitorForm.tsx` |
| 2     | Modular OS Architecture    | ✅ Complete | `src/cli/`, `src/gui/`, `src/admin/`, `src/security/`, `src/modules/` |
| 3     | Admin Panel + Security     | ✅ Complete | `AdminPanel.tsx`, `auth.ts`, `middleware.ts`, `rate-limit.ts`, all `/api/admin/*` routes |
| 4     | Analytics Dashboard        | ✅ Complete | `tracker.ts`, `/api/analytics/track`, `/api/admin/analytics`, `AnalyticsDashboard` component |
| 5     | CV Import Engine           | ✅ Complete | `CVImportEngine` (in AdminPanel), `/api/admin/cv-import` |
| 6     | Setup Wizard               | ✅ Complete | `/setup/page.tsx`, `/api/setup`, `/api/setup/status` |
| 7     | Theme Manager              | ✅ Complete | `ThemeManager` (in AdminPanel), `/api/admin/settings` |
| 8     | Layout Control             | ✅ Complete | `LayoutControl` (in AdminPanel), `/api/admin/settings` |
| 9     | PDF Resume                 | ✅ Complete | `/resume/print`, `/api/generate-resume`              |
| 10    | Database Schema + RLS      | ✅ Complete | `db/schema.sql`, `db/analytics.sql`                  |

---

## 18. Known Issues / Notes

1. **Middleware deprecation warning**: Next.js 16 shows a warning about the `middleware` file convention being deprecated in favor of `proxy`. The current middleware still works fine.
2. **Social stats are mocked**: `fetchSocialStats()` returns hardcoded numbers. Real implementation would require LinkedIn/Instagram APIs or scraping.
3. **Theme application**: The Theme Manager saves settings to the database, but the frontend doesn't yet dynamically apply the theme from the DB settings at runtime (currently uses hardcoded CSS vars).
4. **Supabase is optional**: The entire app works without Supabase configured — it falls back to static data from `data.ts`. The admin panel's write operations require Supabase to be connected.

---

*Built by Mimansh Neupane Pokharel — [GitHub](https://github.com/walterwhite91) | [Portfolio](https://portfolio-os.vercel.app)*
