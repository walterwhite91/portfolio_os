# Portfolio OS – Mimansh Neupane Pokharel

An advanced, dual-interface developer portfolio system.
**Built with:** Next.js 14, TypeScript, Tailwind CSS, Supabase, and Framer Motion.

![Portfolio OS Banner](https://img.shields.io/badge/Status-Operating_Normally-green?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## ⚡ Overview

**Portfolio OS** transforms the traditional developer portfolio into an interactive **Hacker OS** experience. Upon loading, users are greeted by a boot sequence simulating a Linux kernel initialization. They can then interact with the system via:

1.  **Terminal Interface (CLI)**: Type commands (`help`, `projects`, `education`) to explore content.
2.  **Graphical Dashboard (GUI)**: A sleek, tabbed interface for browsing projects, resume, and contact info visually.

## 🚀 Features

-   **Dual Modes**: Seamlessly switch between CLI and GUI modes (`gui` / `cli` commands).
-   **Real-time Data**: Fetches GitHub stats, repositories, and contribution graph live.
-   **Smart Boot Sequence**: Simulates system startup while pre-fetching data in the background for zero-latency interaction.
-   **Visitor Tracking**: Logs unique visitor sessions via Supabase.
-   **Resume Generator**: Auto-generates a PDF resume based on your latest data.
-   **Education Timeline**: Detailed academic history visualization.
-   **Responsive Design**: Optimized for 4K desktop monitors down to mobile screens.

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18 |
| **Styling** | Tailwind CSS, Lucide React, Framer Motion |
| **Language** | TypeScript |
| **Backend** | Supabase (PostgreSQL), Server Actions |
| **Tools** | Puppeteer (PDF Generation), Vercel |

## 📦 quick Start

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/walterwhite91/portfolio-os.git
    cd portfolio-os
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # Install PDF handling dependencies for Vercel
    npm install puppeteer-core @sparticuz/chromium
    ```

3.  **Configure Environment**:
    Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to launch.

## � Project Structure

-   `src/components/Terminal.tsx`: Main CLI logic & boot sequence.
-   `src/components/GUIInterface.tsx`: The modern dashboard UI.
-   `src/lib/data.ts`: Static data fallback (Edit this to customize content!).
-   `documentation.md`: Detailed architecture documentation.

## 🌍 Deployment

Deploy easily on **Vercel**:
1.  Push code to GitHub.
2.  Import project to Vercel.
3.  Add the `NEXT_PUBLIC_SUPABASE_` environment variables.
4.  Deploy!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
**Mimansh Neupane Pokharel**  
[GitHub](https://github.com/walterwhite91) | [Portfolio CLI](https://portfolio-os.vercel.app)
