# Brazuerão Betting App - AI Coding Agent Instructions

## Project Overview

**Brazuerão** is a Brazilian football betting prediction game built with **Next.js 16** (App Router) where users predict the final league standings and earn points based on accuracy. The app integrates with external APIs (Brazuerão + SofaScore) for real-time league data.

### Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Database**: SQLite with Prisma ORM
- **Auth**: NextAuth.js v4 (JWT-based, credentials provider)
- **Styling**: Tailwind CSS v4 + PostCSS
- **UI Components**: Lucide React, @dnd-kit (drag-and-drop)
- **API Client**: Axios with custom interceptors
- **Validation**: Zod

---

## Architecture & Data Flow

### Three-Layer Architecture

**Layers (bottom-up)**:

1. **Database Layer** (`prisma/schema.prisma`): SQLite with 7 models
2. **Repository Layer** (`repositories/`): Data access abstraction
3. **Service Layer** (`services/`): Business logic & external API integration
4. **API Routes** (`app/api/`): Next.js App Router endpoints with auth guards
5. **UI Components** (`app/` pages & `components/`): Server & client components

### Critical Models & Relationships

**User Model** (Core):

- Stores credentials (email, hashed password with bcryptjs)
- Relations: `bets` (1:N), `userBetGroups` (1:N via join table)
- Photo support via `photoUrl` field

**Bet Model** (Core):

- `predictions`: JSON array of `{teamId: number, position: number}`
- Unique constraint: `[userId, season]` (one bet per user per season)
- Season-based (keyed to football year)

**Scoring & Groups**:

- `ScoringRule`: Defines point calculation (EXACT_CHAMPION, EXACT_POSITION, ZONE_MATCH)
- `BetGroup`, `RoleGroup`, `RequestStatus`, `UserBetGroup`: Multi-tenant group management

### Key External Integrations

**1. Brazuerão API** (`repositories/apiBrazuerao.ts`):

- Base URL from `NEXT_PUBLIC_BRAZUERAO_API` env var
- Endpoints: `/standings/{year}`, `/score`, `/rules`, `/bets`
- Axios interceptor adds auth token from session

**2. SofaScore API** (`lib/sofascore.ts`):

- Public API: `https://api.sofascore.com/api/v1`
- Fetches Brazilian Championship seasons (ID: 325) with **24-hour caching**
- User-Agent required in headers

---

## Authentication & Authorization

**Flow**:

1. User registers via `POST /api/register` → Prisma creates record
2. Login via NextAuth credentials provider → JWT token
3. API routes check session with `getServerSession(authOptions)` (from `lib/auth.ts`)
4. Session callback verifies user still exists via `existsUser()`

**Key Points**:

- Session strategy: JWT (not database sessions)
- Redirect on signIn: `/login`
- Password hashing: bcryptjs (12 salt rounds)
- User ID added to token in JWT callback

---

## Data & API Patterns

### Repository Functions (Naming Convention)

Located in `repositories/brazuerao.repository.ts` (232 lines):

- **Read functions**: `existsUser()`, `getUserBet()`, `getScoringRules()`
- **Write functions**: `createUser()`, `createUserBet()`, `updateUserBet()`
- All wrap Prisma calls with error handling (`console.error` + throw)

### Service Functions (Business Logic)

Located in `services/brazuerao.service.ts`:

- `getBrazilianLeague(year?)`: Fetch standings from Brazuerão API + map to `TeamPositionAPIResponse`
- `getIndividualUserScore()`: Fetch user scores from `/score` endpoint
- `getAllBetRules()`: Fetch scoring rules
- `saveUserBet(predictions)`: POST to `/bets` with predictions array + current year

### API Route Pattern

```typescript
// In app/api/[endpoint]/route.ts:
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user)
    return NextResponse.json({ error: '...' }, { status: 401 })
  // Use repository → service → return JSON
}
```

---

## Important Constants & Configurations

**Environment Variables**:

- `NEXT_PUBLIC_BRAZUERAO_API`: Brazuerão API base URL (public, used in browser)
- `DATABASE_URL`: SQLite connection string (e.g., `file:./dev.db`)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`: NextAuth config

**Bet Deadline** (`helpers/constants.ts`):

- `Dates.EXPIRATION_DATE_BET = '2026-01-28T17:59:59'` ← Hard-coded, may need updates for new seasons

**Image Remotes** (`next.config.ts`):

- Only SofaScore images allowed: `api.sofascore.com`
- Dev origin allowed: `10.0.1.186`

---

## Developer Workflows

### Setup & Local Development

```bash
npm install
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run seed         # Run Prisma seed script
```

### Database Management

```bash
npx prisma migrate dev --name <change_name>  # Create + apply migration
npx prisma studio                            # Open visual DB browser
npx prisma db seed                           # Populate seed data
```

### Code Quality

```bash
npm run lint         # Run ESLint (checks, no fix)
npm run format       # Check Prettier formatting
npm run format:fix   # Auto-fix with Prettier + import organization
```

### Common Tasks

**Adding a new API endpoint**:

1. Create `app/api/[feature]/route.ts` with GET/POST handlers
2. Add session guard + error handling
3. Call repository functions from `repositories/brazuerao.repository.ts`
4. Return `NextResponse.json({ data })` or error response

**Updating schema**:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <descriptor>`
3. Verify migration in `prisma/migrations/`

**Adding a UI page**:

1. Create `.tsx` file in `app/[route]/` (App Router)
2. Can be server component (default) or use `'use client'` for interactivity
3. Fetch data in server components; pass to client components as props

---

## File Organization & Key Locations

| Directory       | Purpose                                                          |
| --------------- | ---------------------------------------------------------------- |
| `app/`          | Next.js App Router (pages + API routes)                          |
| `app/api/`      | RESTful API endpoints (8 route groups)                           |
| `components/`   | Reusable React components                                        |
| `lib/`          | Core utilities: `auth.ts`, `prisma.ts`, `sofascore.ts`           |
| `repositories/` | Data access layer (Prisma wrappers)                              |
| `services/`     | Business logic & external API calls                              |
| `types/`        | TypeScript interfaces (`api-models`, `database-models`)          |
| `helpers/`      | Utilities & constants (`utils.ts`, `parsers.ts`, `constants.ts`) |
| `prisma/`       | Database schema & migrations                                     |
| `public/`       | Static assets (e.g., `users-photos/`)                            |

---

## Conventions & Best Practices

### Error Handling

- Use try-catch in all repository & service functions
- Log errors with context: `console.error('Operation X error:', error)`
- Throw errors with descriptive messages for upstream handlers
- API routes return `NextResponse.json({ error: 'message' }, { status: 4xx/5xx })`

### Type Safety

- Interfaces in `types/index.ts` for NextAuth extensions
- API models in `types/api-models.ts` (responses from external APIs)
- Database models in `types/database-models.ts` (Prisma-derived types)
- Use Zod for runtime validation when accepting user input

### Naming Conventions

- Repository functions: verb-noun (e.g., `createUser`, `getUserBet`)
- Service functions: verb-noun (e.g., `getBrazilianLeague`)
- Components: PascalCase (e.g., `SortableTableRow.tsx`)
- Utilities: camelCase functions

### Styling

- Tailwind CSS v4 for all styles (no CSS modules in this project)
- Import global styles in `app/layout.tsx` from `app/globals.css`
- PostCSS handles Tailwind + autoprefixing

### Session & Authentication

- Always check `const session = await getServerSession(authOptions)` before accessing user data in API routes
- User ID is in `session.user.id` (added via JWT callback)
- Do NOT trust client-provided user IDs; always verify with session

---

## Common Pitfalls & Solutions

| Issue                    | Cause                                | Solution                                          |
| ------------------------ | ------------------------------------ | ------------------------------------------------- |
| "User not found" in logs | User deleted but token still valid   | Verify user exists in JWT/session callbacks       |
| Stale SofaScore data     | Cache not invalidated                | Cache duration is 24h; check `sofascore.ts` logic |
| Bet not saving           | Season mismatch or unique constraint | Check `[userId, season]` constraint in Prisma     |
| API 401 errors           | Session expired or missing auth      | Ensure endpoint calls `getServerSession()`        |
| Image not loading        | Remote domain not whitelisted        | Add to `next.config.ts` `remotePatterns`          |

---

## When to Contact Developers

- Changing scoring rules logic (complex business logic)
- Modifying authentication flow
- Adding new external API integrations
- Database schema changes affecting multiple models
