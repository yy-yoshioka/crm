# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Build: `yarn build`
- Dev server: `yarn dev`
- Production: `yarn start`
- Lint: `yarn lint`

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5 (strict mode)
- Supabase
- TailwindCSS 4

## Code Style

- Use ES modules with named exports
- Path aliases: `@/*` maps to root directory
- Follow Next.js file-based routing conventions
- Use TypeScript for type safety (strict mode)
- Follow ESLint rules (next/core-web-vitals, next/typescript)
- Use async/await for asynchronous operations
- Use server components by default, client components when needed
- Organize imports: React, external libs, internal modules
- Error handling: use try/catch with meaningful error messages
