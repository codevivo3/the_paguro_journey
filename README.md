# The Paguro Journey 🌍

A slow-travel storytelling platform focused on clarity, calm design, and long-term scalability.

**Live site:** https://www.thepagurojourney.com

---

## Overview

**The Paguro Journey** is a modern web platform for travel stories, destinations, and video-led content.

The project explores how long-form travel content can be presented without noise, hype, or algorithm-driven clutter — prioritizing readability, structure, and editorial intent.

This repository serves both as:
- a real, evolving project, and
- a portfolio-grade codebase showcasing architectural decisions and scalable frontend patterns.

---

## Core Principles

- **Slow by design**  
  Typography-first layouts, calm spacing, and deliberate pacing.

- **Content before features**  
  Structure and data models come first; features are added only when justified.

- **Editorial control over automation**  
  CMS-driven decisions (orientation, focal points, visibility) always override “smart” defaults.

- **Scalable, not over-engineered**  
  Clean architecture without premature abstractions.

---

## Features

- Responsive, accessible navigation
- Hero slideshow with pause & interaction logic
- Destinations view with structured filtering
- Gallery with:
  - masonry layout
  - hotspot-aware cropping
  - orientation locking for sensitive images
- Reusable UI system (cards, sections, modals)
- SEO-friendly structure (semantic HTML, predictable routes)
- Keyboard and focus-aware interactions

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS variables (design tokens)
- **Images:** Next/Image + Sanity image pipeline
- **State:** Local state + derived data (no heavy global state)
- **CMS:** Sanity (custom schemas & queries)
- **Deployment:** Vercel

---

## Architecture Notes

This project intentionally avoids:
- heavy global state libraries
- over-abstracted “framework-inside-framework” patterns
- design-driven randomness without editorial guardrails

Notable design decisions:
- Media orientation and cropping are data-driven, not inferred blindly.
- Gallery layout balances variation with predictability.
- Mobile and desktop galleries are treated as distinct experiences.
- Loading states mirror final layout to avoid visual jumps.
- Content ordering respects editorial metadata (e.g., manual publication dates).

---

## Project Status

**Active development**

### Current focus:
- Destinations filters UX & styling
- CMS editor documentation
- Final layout refinements
- Performance and lazy-loading tuning

---

## Roadmap

### Short term
- Sanity Studio editorial guidelines
- Destinations filtering polish
- Search UX refinement

### Mid term
- YouTube API integration
- Cross-linking (destinations ↔ stories)
- Performance & SEO audits

### Long term
- Editorial workflows
- Internationalization strategy
- Advanced discovery patterns

---

## Maintainer

**Francesco De Vivo**  
Frontend developer focused on clarity, calm UI, and real-world scalability.

This repository reflects production-style architectural decisions and real-world editorial requirements rather than tutorial-driven patterns.

---

## License & Usage

This project is shared for educational and portfolio purposes.

Design, branding, and content concepts remain the property of their respective owners.

---

© 2026 — codevivo.dev  
Built with care, not urgency.
