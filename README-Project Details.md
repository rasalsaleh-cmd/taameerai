# TaameerAI — Construction Intelligence Platform

> B2B construction management SaaS for Pakistani construction companies. AI-powered quoting, supervisor checklists, real-time budget tracking, and client reporting — built for the Lahore market.

![TaameerAI Dashboard](https://musical-pithivier-a50cfc.netlify.app)

## Live Demo
**[musical-pithivier-a50cfc.netlify.app](https://musical-pithivier-a50cfc.netlify.app)**

---

## What It Does

TaameerAI helps construction business owners in Pakistan:

- **Quote faster** — Upload architectural drawings, AI extracts dimensions and generates a full BOQ with phase-wise cost breakdown in minutes
- **Track projects** — Real-time budget vs actual tracking across all active projects
- **Manage supervisors** — Daily site logs with mandatory photo proof, Urdu/English toggle, delay reason tracking
- **Report to clients** — One-touch branded PDF reports, shareable 3D floor plan visualizations
- **Stay in control** — Change orders, timeline edits with full audit trail, editable rate database

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (planned) |
| File Storage | Supabase Storage (planned) |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Deployment | Netlify |
| Styling | Pure CSS (inline, design system via CSS variables) |

---

## Getting Started

### Prerequisites
- Node.js v18+
- A Supabase account
- An Anthropic API key

### Installation

```bash
git clone https://github.com/rasalsaleh-cmd/taameerai.git
cd taameerai
npm install
```

### Environment Setup

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The Anthropic API key is handled automatically when running inside Claude.ai. For standalone deployment, add:

```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Database Setup

Run the migrations in order from `/supabase/migrations/` against your Supabase project, or use the Supabase MCP integration to apply them automatically.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to Netlify, Vercel, or any static host.

---

## Project Structure

```
taameerai/
├── src/
│   ├── App.jsx              # Main application (state, routing, business logic)
│   ├── supabase.js          # Supabase client initialization
│   ├── components/          # Extracted React components (in progress)
│   │   └── AppComponents.jsx
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── .env.local               # Environment variables (not committed)
└── package.json
```

---

## Features

### Phase 1 (Current)
- ✅ AI Quoting Engine (drawing upload + BOQ generation)
- ✅ Editable rate database (Lahore Q1 2026 rates)
- ✅ Multi-project dashboard with health indicators
- ✅ Supervisor daily log with mandatory photo proof
- ✅ Sub-tasks per checklist item
- ✅ Global + per-project checklist templates
- ✅ Urdu/English toggle (full RTL support)
- ✅ Expense logging with receipt photos
- ✅ Timeline tracking with change log
- ✅ Change orders (delta on original contract)
- ✅ Client progress reports
- ✅ Architectural drawing viewer with pin annotations
- ✅ 3D floor plan visualization (floor plan + isometric)
- ✅ Import ongoing projects
- ✅ Supabase backend (data persistence)

### Phase 2 (Roadmap)
- 🔲 Authentication (owner + supervisor login)
- 🔲 File storage for photos and drawings (Supabase Storage)
- 🔲 WhatsApp sharing integration
- 🔲 PDF report generation
- 🔲 Mobile optimization + offline capability
- 🔲 Full enterprise accounting (invoicing, P&L, cash flow)

---

## Database Schema

Key tables in Supabase:

| Table | Description |
|-------|-------------|
| `projects` | Project metadata, contract value, status |
| `project_phases` | Phase breakdown with budget and progress |
| `expenses` | Expense records with receipt URLs |
| `checklist_logs` | Supervisor daily logs |
| `checklist_items` | Individual checklist responses with photos |
| `change_orders` | Mid-project change tracking |
| `timeline_edits` | Timeline change audit log |
| `drawings` | Uploaded architectural drawings |
| `annotations` | Drawing pin annotations |
| `room_data` | Extracted room data for 3D visualization |

---

## Design System

TaameerAI uses a custom dark industrial design system:

```css
--bg:    #0E1117   /* Main background */
--bg2:   #151922   /* Card background */
--bg3:   #1C2230   /* Input background */
--gold:  #C4A35A   /* Primary accent */
--text:  #E8E3D8   /* Primary text */
--red:   #E05858   /* Danger/overdue */
--green: #58A878   /* Success/on-track */
```

**Fonts:** Syne (headings) · Literata (body) · DM Mono (numbers) · Noto Nastaliq Urdu (Urdu text)

---

## Verified Lahore Market Rates (Q1 2026)

Sources: Mapia.pk, Glorious Builders, Avenir Developments

| Material | Rate |
|----------|------|
| DG Cement (50kg) | ₨1,370/bag |
| Amreli Steel 60-Grade | ₨242/kg |
| Bricks A-Class | ₨19/brick |
| Sand Chenab | ₨75/cft |
| Crush Margalla | ₨175/cft |
| Mason (Raj Mistri) | ₨2,500/day |

All rates are editable within the app and persist per user.

---

## Pricing Model

| Tier | Projects | Price |
|------|----------|-------|
| Starter | 1–3 active | TBD |
| Professional | 4–8 active | TBD |
| Enterprise | 8+ active | TBD |

---

## Contributing

This is currently a private commercial project. Contact [rasal.saleh@gmail.com](mailto:rasal.saleh@gmail.com) for licensing inquiries.

---

## License

Proprietary. All rights reserved. © 2026 TaameerAI.

---

*Built with Claude by Anthropic · Deployed on Netlify · Database by Supabase*
