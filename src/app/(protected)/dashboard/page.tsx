import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="font-semibold">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "App"}
          </h1>
          <UserMenu />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
        <p className="text-muted-foreground">Signed in as {user?.email}</p>
      </main>
    </div>
  );
}
