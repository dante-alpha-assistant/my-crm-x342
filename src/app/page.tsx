import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Your CRM, Simplified
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-lg">
          Track contacts, deals, and communication history in one place. Stay
          organized and close more deals.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-semibold text-center mb-10">
          Everything you need to manage relationships
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Keep all your contacts organized with names, emails, phone
                numbers, company info, and notes in one searchable list.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Deals Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Track your deals through every stage — from lead to closed.
                Know exactly where every opportunity stands and act fast.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Log emails, calls, and meetings against contacts and deals. Never
                lose track of what was said or promised.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
