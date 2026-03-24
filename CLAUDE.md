# printf() — AI-Controlled Interview Platform

> Context file for continuing development across machines/sessions.
> Last updated: 2026-03-23 | Branch: dev → master merge

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + custom design tokens (`saffron`, `india-green`) |
| Database | PostgreSQL on Railway via Prisma v7 (`@prisma/adapter-pg`) |
| Auth | NextAuth v4, credentials provider, JWT strategy |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| AI | Claude API (`@anthropic-ai/sdk`) for assist levels + audit engine |
| Payments | Stripe (global) + Razorpay (India) — optional, graceful fallback |
| 3D/WebGL | Three.js components (FluidSimulation, AIBrain, Globe, GeometricShapes, PracticeViz) |
| Hosting | Railway (persistent Node process, NOT serverless) |

## Prisma v7 Gotcha

```ts
// CORRECT — PrismaPg takes pool directly
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

Generated client location: `@/generated/prisma/client` (not `@/generated/prisma`)

## Key Architecture

### AI Assist Levels (L0–L4)
Core differentiator. Company controls how much AI help candidates get:
- **L0**: No AI (locked)
- **L1**: Socratic hints only
- **L2**: Scaffold (solution skeletons with TODOs)
- **L3**: Guide (detailed explanations)
- **L4**: Full Copilot (unrestricted)

Interviewers can adjust levels mid-session. Every interaction is logged.

### AI Audit Engine
Post-session analysis via Claude API. Generates structured scorecards with:
- Problem comprehension, code quality, communication scores
- Hire/no-hire recommendation with confidence %
- Risk flags and candidate comparisons

### Three User Roles
- `COMPANY_ADMIN` — Creates company, manages templates, views analytics
- `INTERVIEWER` — Conducts interviews, monitors candidates, controls AI
- `CANDIDATE` — Takes interviews, practices problems, earns XP

### Multi-Role Hiring (New)
Platform supports hiring beyond engineering:
- Engineering, Sales, Marketing, Product, Executive, CS, HR, Finance, Legal, General
- Role-specific interview formats and AI scoring rubrics

### India/US Region Support
- Auto-detects via timezone (South Asia → India)
- Region toggle visible on dev only (hostname check: `localhost` or `"dev"` in hostname)
- India: INR pricing, Razorpay, IIT/NIT content, Indian companies
- Global: USD pricing, Stripe, FAANG content

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page (3D components, region toggle, carousels)
│   ├── auth/                       # signin, signup, forgot-password, redirect
│   ├── dashboard/                  # Company portal with sidebar layout
│   │   ├── layout.tsx              # Sidebar + role-based navigation
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── interviews/             # Sessions, templates, calendar
│   │   ├── analytics/              # Charts & reporting
│   │   ├── positions/              # Open roles & job board
│   │   ├── pipeline/               # Candidate tracking stages
│   │   ├── team/                   # Team management
│   │   ├── candidate/              # Candidate-specific dashboard
│   │   ├── interviewer/            # Interviewer-specific dashboard
│   │   └── test-mode/              # Demo mode control panel
│   ├── session/[id]/               # Live interview (candidate view)
│   │   └── watch/                  # Interviewer observation mode
│   ├── practice/                   # 4000+ problems, patterns, analytics
│   ├── school/                     # School admin: enrollment, assignments, analytics
│   ├── jobs/                       # Public job board
│   ├── careers/                    # External job aggregation
│   └── api/
│       ├── auth/register/          # User registration with honeypot
│       ├── sessions/[id]/ai/       # AI assist endpoint
│       ├── sessions/[id]/override/ # Interviewer AI level override
│       ├── test-mode/              # seed, cleanup, status, switch-role
│       └── launch-offer/           # India launch offer tracking
├── components/
│   ├── Logo.tsx                    # Reusable printf() logo (sm/md/lg/xl)
│   ├── Carousel.tsx                # Auto-scrolling carousel with arrows
│   ├── ScrollReveal.tsx            # Scroll-triggered animations
│   ├── FluidSimulation.tsx         # WebGL fluid background
│   ├── 3d/                         # AIBrain, Globe, GeometricShapes, PracticeViz
│   ├── test-mode/                  # DemoModePage, DemoFloatingToolbar
│   └── session/                    # EditorPanel, AIPanel, QuestionPanel, etc.
├── lib/
│   ├── prisma.ts                   # DB client (hardened pool: max=10, 5s timeout)
│   ├── auth.ts                     # NextAuth config, JWT callback re-reads role from DB
│   ├── ai-levels.ts                # L0-L4 definitions and prompt builders
│   ├── ai-audit.ts                 # Post-session audit via Claude
│   ├── ai-client.ts                # Central Claude client with circuit breaker
│   ├── ai-circuit-breaker.ts       # In-memory daily spend cap ($5/day default)
│   ├── rate-limiter.ts             # Plan-based + IP rate limits (in-memory)
│   ├── payment.ts                  # Region detection, formatPrice
│   ├── stripe.ts                   # Stripe integration (optional)
│   ├── razorpay.ts                 # Razorpay integration (India)
│   ├── editor-settings.ts          # Monaco editor themes & preferences
│   └── launch-offer.ts             # India launch offer logic
└── middleware.ts                    # Route-specific rate limiting + security headers
```

## Security (Self-Contained, No Third-Party)

All security is in-memory (works on Railway persistent process):
- **Rate limiting**: Route-categorized (auth: 10/min, AI: 20/min, sessions: 30/min, general: 60/min)
- **AI circuit breaker**: Daily spend cap via `DAILY_AI_BUDGET_CENTS` env var (default $5)
- **Bot protection**: Honeypot fields on signup, timing analysis (reject < 2s submissions)
- **Security headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **Connection pool**: max=10, idleTimeout=30s, connectionTimeout=5s
- **No Upstash, no Cloudflare Turnstile, no third-party security deps**

## Demo/Test Mode

- Accessible at `/dashboard/test-mode`
- Gated by `TEST_MODE_EMAIL` env var (only that user can access)
- Seeds realistic demo data (users, sessions, audits, etc.) using `@test.invalid` emails
- Role switcher: Admin ↔ Interviewer ↔ Candidate (stores original role in cookie)
- Floating toolbar appears on all pages when demo mode active
- Cleanup removes all `@test.invalid` records atomically

## Environment Variables (Railway)

```
DATABASE_URL          # Railway PostgreSQL connection string
NEXTAUTH_SECRET       # Secure random string (MUST change from dev default)
NEXTAUTH_URL          # https://theprintf.com (prod) or dev URL
ANTHROPIC_API_KEY     # Claude API key
STRIPE_SECRET_KEY     # Optional — gracefully handles missing
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
TEST_MODE_EMAIL       # Your email to access test mode (optional)
DAILY_AI_BUDGET_CENTS # Default 500 ($5/day)
```

## Deployment

- **Production**: `theprintf.com` (master branch)
- **Dev/Staging**: `intervue-ai-dev.up.railway.app` (dev branch)
- Railway sets `NODE_ENV=production` on BOTH — don't use NODE_ENV to distinguish
- Use `window.location.hostname` for dev vs prod detection

## Recent Changes (dev → master merge, 2026-03-23)

### Brand
- Full rebrand from "Intervue.AI" to "printf()" with code-styled logo
- Reusable `Logo` component with sm/md/lg/xl variants
- Logo shows `the` prefix and `.com` suffix in smaller text

### Homepage
- India/US region auto-detection + dev-only toggle
- 3D visual components (FluidSimulation, AIBrain, Globe, GeometricShapes, PracticeViz)
- Rich flow card mockups (mini UIs for each hiring step)
- Auto-scrolling carousels for pricing and "Why printf" sections
- Multi-role content (Engineering, Sales, Marketing, Product, etc.)
- India-specific: IIT/NIT content, INR pricing, Razorpay, launch offers

### Interview System
- Resizable panel layout (editor, AI, question panels)
- Monaco editor themes and settings
- Real-time Socket.io for interviewer observation
- Session playback and code snapshots

### Practice & Gamification
- 4,000+ problems with code execution in 7 languages
- XP, levels, streaks, 17 badges, leaderboard
- Daily challenges, activity heatmap
- 15 study patterns

### Dashboard
- Template library with "Use Template" and "AI Generate" buttons
- Interview calendar with scheduling
- Candidate pipeline with stages
- Analytics and audit reports

### Security
- In-memory rate limiting (no third-party deps)
- AI circuit breaker with daily spend cap
- Bot protection (honeypot + timing)
- Security headers

### Other
- Public job board with AI-generated descriptions
- External job aggregation (careers page)
- School/university mode with enrollment codes
- Demo mode with seed data and role switching

## Known Issues / TODO

- "Three platforms, one product" section may need visual polish
- Region toggle only shows on dev (by design)
- FluidSimulation renders at reduced opacity on light sections
- Consider removing test-mode routes from production build if not needed
