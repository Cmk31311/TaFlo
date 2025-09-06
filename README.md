# ✨ TaFlo — Advanced Task Management  

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs)  
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)  
![Tailwind](https://img.shields.io/badge/TailwindCSS-UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)  
![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)  

**TaFlo** is a modern, minimalistic, and feature-rich **task manager** built with Next.js, Supabase, and TailwindCSS. It combines productivity tools — task lists, Kanban boards, calendars, and analytics — into a clean, responsive interface.  

<p align="center">
  <img alt="TaFlo demo preview" src="docs/screenshot-home.png" width="800" />
</p>  

---

## 🚀 Features

### ✅ Core Task Management
- ✏️ Create rich tasks with descriptions, categories, priorities, due dates, and tags  
- 🏷️ Color-coded categories with management (create / edit / delete)  
- ⚡ Recurring tasks (daily / weekly / monthly / yearly)  
- 📌 Task duplication for templates  
- 🔔 Due dates with overdue highlighting  

### 🎯 Views & Organization
- 📃 **List view** with drag-and-drop ordering  
- 🗂️ **Kanban view** grouped by status, category, or priority  
- 📅 **Calendar view** (monthly & weekly)  
- 🔍 Advanced search & filtering  

### 📊 Productivity & Analytics
- ⏱️ Time tracking with timers & logs  
- 📈 Progress tracking with completion indicators  
- 📊 Stats dashboard with charts & metrics  
- 🗃️ Category-based performance insights  

### 🛠️ UX & System
- 🔐 Authentication with Supabase  
- 🌗 Theme toggle (light/dark mode)  
- ⚙️ Settings modal for personalization  
- 🖱️ Smooth drag-and-drop + micro animations  

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router) + TypeScript  
- **UI:** Tailwind CSS, PostCSS  
- **Backend:** Supabase (Database & Auth)  
- **Tooling:** ESLint, TypeScript, Node.js (v18+)  

---

## 📂 Project Structure
```bash
.
├─ app/                      # Next.js application code
│  ├─ page.tsx              # Home page (task views & filters)
│  ├─ components/           # UI components
│  ├─ hooks/                # Custom hooks
├─ database-migration.sql    # Full database schema
├─ simple-migration.sql      # Minimal schema
├─ public/                   # Static assets
├─ tailwind.config.ts
├─ package.json
├─ FEATURES.md
├─ DEPLOYMENT_GUIDE.md
└─ README.md
```

---

## ⚡ Getting Started

### 🔧 Prerequisites
- Node.js **18+**  
- npm (or pnpm/yarn)  
- Supabase project  

### 🌍 Environment Variables
Create `.env.local`:
```bash
cp .env.example .env.local
```

Fill in with Supabase values:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 💻 Local Development
```bash
npm install
npm run dev
```
Visit → [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Setup
Run migrations in Supabase SQL editor:  
- `database-migration.sql` — full schema  
- `simple-migration.sql` — minimal schema  

---

## 📜 Scripts
```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run built app
npm run lint    # run ESLint
```

---

## ☁️ Deployment

### ▲ Vercel
- Import repo → Vercel auto-detects Next.js  
- Build command: `npm run build`  
- Output: `.next`  
- Add environment variables in **Vercel Settings**  

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)  

### 🔗 Supabase Configuration
- Go to **Authentication → URL Configuration**  
- Add: `https://your-app.vercel.app` under **Site URL**  
- Add `http://localhost:3000` for dev  

---

## ⚙️ Configuration Notes
- Never commit `.env.local`  
- Update schema references if DB changes  
- Calendar & Kanban rely on categories, priorities, and statuses  

---

## 🤝 Contributing
1. Fork this repo  
2. Create a new branch  
3. Commit changes with clear messages  
4. Run `npm run lint`  
5. Open a PR  

---

## 📄 License
Licensed under the **MIT License**.  
