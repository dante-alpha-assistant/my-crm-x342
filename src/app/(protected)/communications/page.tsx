"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

type Contact = { id: string; first_name: string; last_name: string };
type Deal = { id: string; title: string };
type Communication = {
  id: string;
  type: string;
  subject: string | null;
  body: string;
  direction: string;
  contact_id: string | null;
  deal_id: string | null;
  created_at: string;
  contacts?: Contact | null;
  deals?: Deal | null;
};

const COMM_TYPES = ["email", "call", "meeting", "note", "other"];

const typeVariant = (type: string): "default" | "secondary" | "outline" => {
  const map: Record<string, "default" | "secondary" | "outline"> = {
    email: "default",
    call: "secondary",
    meeting: "outline",
    note: "secondary",
    other: "outline",
  };
  return map[type] ?? "secondary";
};

const emptyForm = {
  type: "email",
  subject: "",
  body: "",
  direction: "outbound",
  contact_id: "",
  deal_id: "",
};

export default function CommunicationsPage() {
  const supabase = createClient();
  const [comms, setComms] = useState<Communication[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: commsData }, { data: contactsData }, { data: dealsData }] =
      await Promise.all([
        supabase
          .from("communications")
          .select("*, contacts(id, first_name, last_name), deals(id, title)")
          .order("created_at", { ascending: false }),
        supabase.from("contacts").select("id, first_name, last_name").order("first_name"),
        supabase.from("deals").select("id, title").order("title"),
      ]);
    setComms(commsData ?? []);
    setContacts(contactsData ?? []);
    setDeals(dealsData ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!form.body) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("communications").insert({
      type: form.type,
      subject: form.subject || null,
      body: form.body,
      direction: form.direction,
      contact_id: form.contact_id || null,
      deal_id: form.deal_id || null,
      user_id: user!.id,
    });
    setSaving(false);
    setDialogOpen(false);
    setForm(emptyForm);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this communication log?")) return;
    await supabase.from("communications").delete().eq("id", id);
    fetchData();
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Communications</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Communication
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : comms.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No communications logged yet. Track your first interaction!
        </p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject / Body</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead className="w-16">Del</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comms.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(c.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeVariant(c.type)}>{c.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.subject && (
                      <p className="text-sm font-medium">{c.subject}</p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {c.body}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.contacts
                      ? `${c.contacts.first_name} ${c.contacts.last_name}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.deals ? c.deals.title : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.direction === "inbound" ? "secondary" : "outline"}>
                      {c.direction}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Log Communication Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Type *</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {COMM_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Direction</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.direction}
                onChange={(e) => setForm({ ...form, direction: e.target.value })}
              >
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Body / Notes *</Label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px] resize-y"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Contact</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.contact_id}
                onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              >
                <option value="">— None —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Deal</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.deal_id}
                onChange={(e) => setForm({ ...form, deal_id: e.target.value })}
              >
                <option value="">— None —</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.body}>
              {saving ? "Saving…" : "Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
