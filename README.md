# Northstar - Personal Goals & Projects OS

A comprehensive personal productivity web application built with Next.js and Supabase. Northstar helps you set meaningful goals, manage projects, build habits, and stay aligned with your vision.

## Features

- **Goal Management**: Set up to 5 active goals with linked values and lead indicators
- **Project Tracking**: Organize projects with tasks and definition of done
- **Habit Tracking**: Daily habit logging with streak tracking
- **Inbox Processing**: Quick capture and process thoughts into actionable items
- **Daily Dashboard**: Focus on today with top outcomes and next actions
- **Vision Board**: Visual manifestation with identity statements
- **Weekly Review**: Structured reflection and planning
- **Onboarding Wizard**: Guided setup covering values, goals, life domains, and more

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### 1. Clone and Install

```bash
git clone <repo-url>
cd northstar-opus-plan-4-5
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from **Settings > API**
3. Create a `.env.local` file with your Supabase credentials:

```env
# Required - Get from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for server-side operations (optional for basic usage)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for password reset emails
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

Execute the SQL schema in your Supabase SQL Editor:

1. Go to **Supabase Dashboard > SQL Editor**
2. Run the contents of `supabase/migrations/001_initial_schema.sql`

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated app routes
│   │   ├── goals/      # Goals management
│   │   ├── habits/     # Habit tracking
│   │   ├── inbox/      # Inbox processing
│   │   ├── projects/   # Projects & tasks
│   │   ├── review/     # Weekly review
│   │   ├── settings/   # User settings
│   │   ├── today/      # Daily dashboard
│   │   └── vision/     # Vision board
│   ├── (auth)/         # Auth pages (login, signup, reset)
│   ├── (onboarding)/   # Wizard flow
│   └── actions/        # Server actions
├── components/
│   ├── dashboard/      # Dashboard components
│   ├── shared/         # Shared components
│   ├── ui/             # shadcn/ui components
│   ├── vision/         # Vision components
│   └── wizard/         # Onboarding wizard steps
└── lib/
    ├── supabase/       # Supabase client utilities
    ├── types/          # TypeScript types
    └── utils/          # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy!

## License

MIT
