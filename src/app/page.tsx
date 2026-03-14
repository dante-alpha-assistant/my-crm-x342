import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <h1 className="text-4xl font-bold mb-4">
        {process.env.NEXT_PUBLIC_APP_NAME ?? "App"}
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Welcome. Sign in to get started.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline">Create account</Button>
        </Link>
      </div>
    </div>
  );
}
