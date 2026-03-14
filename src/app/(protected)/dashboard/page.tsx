import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, MessageSquare, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch counts
  const [
    { count: contactCount },
    { count: dealCount },
    { count: commCount },
    { data: deals },
    { data: recentContacts },
    { data: recentDeals },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("deals").select("*", { count: "exact", head: true }).eq("user_id", user!.id).neq("stage", "won").neq("stage", "lost"),
    supabase
      .from("communications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from("deals").select("value").eq("user_id", user!.id).eq("stage", "won"),
    supabase.from("contacts").select("id, first_name, last_name, company, status").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("deals").select("id, title, stage, value, currency").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const totalWonValue = (deals ?? []).reduce((sum: number, d: { value: number | null }) => sum + (d.value ?? 0), 0);

  const stageBadgeColor = (stage: string) => {
    const map: Record<string, string> = {
      lead: "secondary",
      qualified: "outline",
      proposal: "outline",
      negotiation: "default",
      won: "default",
      lost: "destructive",
    };
    return (map[stage] ?? "secondary") as "secondary" | "outline" | "default" | "destructive";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{contactCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dealCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Won Deal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${totalWonValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comms This Month</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{commCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Contacts</CardTitle>
            <Link href="/contacts">
              <Button variant="ghost" size="sm">View all →</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {(recentContacts ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts yet.</p>
            ) : (
              <div className="space-y-3">
                {(recentContacts ?? []).map((c: { id: string; first_name: string; last_name: string; company: string | null; status: string }) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{c.first_name} {c.last_name}</p>
                      {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                    </div>
                    <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Deals</CardTitle>
            <Link href="/deals">
              <Button variant="ghost" size="sm">View all →</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {(recentDeals ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals yet.</p>
            ) : (
              <div className="space-y-3">
                {(recentDeals ?? []).map((d: { id: string; title: string; stage: string; value: number | null; currency: string }) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      {d.value != null && (
                        <p className="text-xs text-muted-foreground">
                          {d.currency} {d.value.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Badge variant={stageBadgeColor(d.stage)}>{d.stage}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
