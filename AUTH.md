# Authentication

This template ships with Supabase Auth built in. Every app gets:

- ✅ Email/password login
- ✅ Google OAuth
- ✅ Route protection via Next.js middleware
- ✅ Auth context for client components
- ✅ Pre-built pages: `/login`, `/signup`, `/forgot-password`
- ✅ User profile dropdown in header
- ✅ Protected vs public routes clearly separated

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable Google OAuth in your Supabase project → **Authentication → Providers → Google**
3. Add your OAuth redirect URL: `https://your-domain.com/auth/callback`
4. Copy credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Route Structure

```
src/app/
├── page.tsx              # Public home page
├── (auth)/               # Auth route group — unauthenticated only
│   ├── layout.tsx        # Centered auth layout
│   ├── login/            # /login
│   ├── signup/           # /signup
│   └── forgot-password/  # /forgot-password
├── (protected)/          # Protected route group — requires auth
│   ├── layout.tsx        # Server-side auth check → redirect to /login
│   └── dashboard/        # /dashboard (example protected page)
└── auth/callback/        # OAuth & email confirmation handler
```

## Adding Protected Routes

Put them inside `src/app/(protected)/`:

```tsx
// src/app/(protected)/settings/page.tsx
export default function SettingsPage() {
  return <div>Settings</div>;
}
```

That's it — the layout handles auth automatically.

## Using Auth in Client Components

```tsx
"use client";
import { useAuth } from "@/contexts/auth-context";

export function MyComponent() {
  const { user, signOut, loading } = useAuth();
  if (loading) return <span>Loading...</span>;
  if (!user) return <span>Not signed in</span>;
  return <span>Hello, {user.email}</span>;
}
```

## Using Auth in Server Components

```tsx
import { createClient } from "@/lib/supabase/server";

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <div>Hello, {user?.email}</div>;
}
```

## Disabling Auth

If you don't need auth, remove:

- `middleware.ts`
- `src/lib/supabase/`
- `src/contexts/auth-context.tsx`
- `src/components/auth/`
- `src/app/(auth)/`
- `src/app/(protected)/`
- `src/app/auth/`
- `AuthProvider` from `src/app/layout.tsx`
- `@supabase/ssr` and `@supabase/supabase-js` from `package.json`
