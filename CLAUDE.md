# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview
```

## Architecture

This is a **Nuxt 4** application using Vue 3 and vue-router.

- `app/app.vue` — root application component; the entry point rendered for all routes
- `nuxt.config.ts` — Nuxt configuration (compatibility date set to 2025-07-15, devtools enabled)

Nuxt 4 uses file-based routing via `app/pages/`, auto-imports for composables (`app/composables/`), components (`app/components/`), and utilities (`app/utils/`). None of these directories exist yet — create them as needed and Nuxt will pick them up automatically without any imports.
