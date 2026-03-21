# SiteOS — The Operating System for Construction

## Overview
B2B construction management SaaS for Pakistani construction companies. AI-powered quoting, supervisor site logs, real-time budget tracking, material scheduling, worker roster management, and client reporting. Built for the Lahore market, expanding across Pakistan.

## Live Demo
URL: musical-pithivier-a50cfc.netlify.app

## Tech Stack
- Frontend: React 18 + Vite
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API (claude-sonnet-4)
- Hosting: Netlify
- Version Control: GitHub (rasalsaleh-cmd/taameerai)

## Getting Started
Prerequisites, installation steps, environment variables needed:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
How to run locally with npm run dev and build with npm run build

## Project Structure
Describe the folder structure:
- src/views/web/ — owner desktop views
- src/views/owner-mobile/ — owner mobile views  
- src/views/supervisor-mobile/ — supervisor on-site views
- src/hooks/useProjects.js — all database operations
- src/constants/ — rates, phases, translations
- src/utils/ — formatting and helper functions

## User Roles
- Owner: full access, web and mobile
- Manager: full operations, cannot delete or manage billing (coming soon)
- Supervisor: site operations only — checklist, expenses, materials, labour

## Features
Phase 1 Complete:
- Multi-project dashboard with budget health indicators
- AI BOQ generator with structured input form
- Phase and sub-phase management (multiple active simultaneously)
- Per-phase checklists with photo requirements
- Material schedule — owner pre-defines expected deliveries
- Supervisor daily log — sequential checklist with photo proof
- Worker roster — named workers with daily attendance
- Material delivery logging against schedule
- Expense tracking with categories
- Change orders and timeline edits
- Client progress reports with photo timeline
- Rate database editor (Lahore Q1 2026 rates)
- Settings: theme (light/dark/system), rate database, supervisor preview
- Three views: web desktop, owner mobile, supervisor mobile
- Landscape mode auto-switches to web layout

Phase 2 Roadmap:
- Authentication (email + phone OTP login)
- File storage for photos and drawings
- Drawings upload in AI quote generator
- Urdu translation for supervisor view
- WhatsApp sharing
- PDF report generation
- Manager role implementation

## Database Schema
List all tables: projects, project_phases, phase_checklist_items, phase_logs, phase_log_items, expenses, material_schedule, workers, change_orders, timeline_edits, drawings, annotations, knowledge.entries

## Design System
- Light mode: professional grey
- Dark mode: very dark grey  
- Accent: gold #C4A35A
- Fonts: Syne (headings) + Inter (body) + DM Mono (numbers) + Noto Nastaliq Urdu
- Follows device theme with owner override

## Architecture Rules
- Components never talk to database directly — only through hooks/useProjects.js
- One file per responsibility, 300 line maximum
- Never define React components inside other components
- camelCase for JavaScript, consistent naming throughout

## Supabase Project
Project ID: zdgedupecenfidkgaujv
Region: Singapore

## License
Proprietary. All rights reserved. © 2026 SiteOS
