# DonkeyGPT — The Patient Intelligence

AI-powered learning platform that explains complex topics in simple terms. No jargon. No judgment.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **Prisma v7** + **PostgreSQL** (via adapter-pg)
- **NextAuth.js v5** (email/password + Google OAuth)
- **OpenAI API** (streaming responses)
- **Zustand** (state management)
- **TanStack Query** (data fetching)
- **React Hook Form + Zod** (validation)
- **Framer Motion** (animations)
- **Sonner** (toast notifications)

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd donkeygpt-io
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/donkeygpt"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OPENAI_API_KEY="sk-..."
```

### 3. Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (dev)
npx prisma db push

# Or run migrations (production)
npx prisma migrate deploy
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signin` | Sign in |
| `/signup` | Create account |
| `/forgot-password` | Password reset |
| `/onboarding` | New user onboarding |
| `/chat` | Main chat interface |
| `/chat/[id]` | Specific conversation |
| `/settings` | User settings |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js handler |
| `/api/auth/signup` | POST | User registration |
| `/api/chat` | POST | Send message (streaming SSE) |
| `/api/chats` | GET, POST | List/create chats |
| `/api/chats/[id]` | GET, DELETE | Get/delete chat |
| `/api/user/profile` | GET, PATCH | User profile |
| `/api/user/settings` | GET, PATCH | User settings |
| `/api/user/export` | GET | Export all user data |

## Design System

The design uses the **Burro Modern** system:
- **Primary:** `#634629` (Donkey Earth)
- **Secondary:** `#6b38d4` (Playful Purple)
- **Surface:** `#fbf8ff` → `#eeedf7` (tonal layers)
- **Font:** Inter
- **Rule:** No 1px borders — use background shifts for depth

## Deploy

```bash
npm run build
npm start
```

Or deploy to Vercel:
```bash
npx vercel
```

Set all environment variables in the Vercel dashboard.
