# Bodyweight Workout App

## Tech Stack
- Alpine.js 3.x (CDN, no build)
- Pico CSS 2.x (CDN, semantic HTML)
- uPlot (lazy-loaded for charts)
- Google Apps Script → Google Sheets
- GitHub Pages hosting
- Service Worker for offline PWA

## Conventions
- 한국어 UI, 영어 코드
- Hash-based SPA routing (#/home, #/workout, etc.)
- LocalStorage = primary storage, Sheets = backup
- Mobile-first, touch targets min 48px, key actions 64px+
- Timestamps on code changes: # 2026-MM-DD HH:MM

## Agent Team
See agents/ directory for 5 expert agent definitions:
- exercise-programmer.md — routine design, progression
- exercise-scientist.md — scientific basis
- form-safety.md — form guides, injury prevention
- behavioral-coach.md — motivation, gamification
- app-developer.md — technical implementation

## Spec
docs/superpowers/specs/2026-04-03-bodyweight-workout-app-design.md

## Plan
docs/superpowers/plans/2026-04-03-bodyweight-workout-app.md
