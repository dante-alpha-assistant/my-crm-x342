# nextjs-template

Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui starter template.

## Stack

- **Next.js 15** — App Router + Server Components
- **TypeScript** — Full type safety
- **Tailwind CSS v4** — Utility-first styling
- **shadcn/ui** — New York style, Zinc base color
- **ESLint + Prettier** — Code quality

## Pre-installed shadcn Components

| Component | Import |
|-----------|--------|
| `Button` | `@/components/ui/button` |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `@/components/ui/card` |
| `Input` | `@/components/ui/input` |
| `Label` | `@/components/ui/label` |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` | `@/components/ui/dialog` |
| `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, ... | `@/components/ui/dropdown-menu` |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `@/components/ui/table` |
| `Badge` | `@/components/ui/badge` |
| `Toast`, `Toaster` | `@/components/ui/toast`, `@/components/ui/toaster` |
| `useToast` | `@/hooks/use-toast` |

## Getting Started

### From this template

Use the GitHub template API or click "Use this template" on GitHub:

```bash
# Via GitHub CLI
gh repo create my-app --template dante-alpha-assistant/nextjs-template --public
cd my-app
npm install
cp .env.example .env.local
npm run dev
```

### Manual clone

```bash
git clone https://github.com/dante-alpha-assistant/nextjs-template.git my-app
cd my-app
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Global styles + Tailwind + CSS variables (zinc theme)
│   ├── layout.tsx        # Root layout with Inter font
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # shadcn/ui components (new-york style)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── table.tsx
│       ├── toast.tsx
│       └── toaster.tsx
├── hooks/
│   └── use-toast.ts      # Toast hook
└── lib/
    └── utils.ts          # cn() utility
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
NEXT_PUBLIC_APP_NAME=My App
```

## Adding More shadcn Components

```bash
npx shadcn@latest add <component-name>
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Deploy

Deploy to Vercel with zero config — `vercel.json` is included:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dante-alpha-assistant/nextjs-template)

## Template API

Create a new repo from this template programmatically:

```bash
curl -s -X POST "https://api.github.com/repos/dante-alpha-assistant/nextjs-template/generate" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"owner":"YOUR_ORG","name":"my-new-app","description":"My new app","private":false}'
```
