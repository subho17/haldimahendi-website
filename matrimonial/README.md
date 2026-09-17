# HaldiMeHendi - Matrimonial Website

A modern matrimonial platform built with Next.js 16, TypeScript, and Supabase.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 16.3 (Turbopack)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest

## Deploy on Hostinger VPS

1. SSH into your Hostinger VPS
2. Clone the repository:
   ```bash
   git clone <repo-url>
   cd matrimonial-website
   ```
3. Install dependencies:
   ```bash
   cd matrimonial && npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
5. Build and start:
   ```bash
   npm run build
   npm start
   ```

See `deploy-hostinger.sh` for automated deployment.

## Project Structure

```
matrimonial-website/
├── matrimonial/          # Main Next.js app
│   ├── app/             # Pages and API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities and stores
│   └── scratch/         # Local data files
├── supabase-coupons.sql # SQL for test coupons
└── deploy-hostinger.sh  # Deployment script
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase
