"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

type Contact = { id: string; first_name: string; last_name: string };
type Deal = {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  currency: string;
  contact_id: string | null;
  expected_close_date: string | null;
  notes: string | null;
  created_at: string;
  contacts?: Contact | null;
};

const STAGES = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-slate-100 dark:bg-slate-800",
  qualified: "bg-blue-50 dark:bg-blue-950",
  proposal: "bg-yellow-50 dark:bg-yellow-950",
  negotiation: "bg-orange-50 dark:bg-orange-950",
  won: "bg-green-50 dark:bg-green-950",
  lost: "bg-red-50 dark:bg-red-950",
};

const emptyForm = {
  title: "",
  stage: "lead",
  value: "",
  currency: "USD",
  contact_id: "",
  expected_close_date: "",
  notes: "",
};

export default function DealsPage() {
  const supabase = createClient();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Deal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: dealsData }, { data: contactsData }] = await Promise.all([
      supabase
        .from("deals")
        .select("*, contacts(id, first_name, last_name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .order("first_name"),
    ]);
    setDeals(dealsData ?? []);
    setContacts(contactsData ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dealsByStage = (stage: string) => deals.filter((d) => d.stage === stage);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Deal) => {
    setEditTarget(d);
    setForm({
      title: d.title,
      stage: d.stage,
      value: d.value != null ? String(d.value) : "",
      currency: d.currency,
      contact_id: d.contact_id ?? "",
      expected_close_date: d.expected_close_date ?? "",
      notes: d.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    const payload = {
      title: form.title,
      stage: form.stage,
      value: form.value ? parseFloat(form.value) : null,
      currency: form.currency,
      contact_id: form.contact_id || null,
      expected_close_date: form.expected_close_date || null,
      notes: form.notes || null,
    };
    if (editTarget) {
      await supabase.from("deals").update(payload).eq("id", editTarget.id);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("deals").insert({ ...payload, user_id: user!.id });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deal?")) return;
    await supabase.from("deals").delete().eq("id", id);
    fetchData();
  };

  const moveStage = async (deal: Deal, direction: "left" | "right") => {
    const idx = STAGES.indexOf(deal.stage);
    const newIdx = direction === "left" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= STAGES.length) return;
    await supabase.from("deals").update({ stage: STAGES[newIdx] }).eq("id", deal.id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deals Pipeline</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Deal
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const stageDeals = dealsByStage(stage);
              return (
                <div
                  key={stage}
                  className={`w-56 rounded-lg border p-3 space-y-2 ${STAGE_COLORS[stage]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm capitalize">{stage}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>

                  {stageDeals.map((deal) => (
                    <Card key={deal.id} className="shadow-sm">
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {deal.title}
                        </CardTitle>
                        {deal.contacts && (
                          <p className="text-xs text-muted-foreground">
                            {deal.contacts.first_name} {deal.contacts.last_name}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="p-3 pt-1 space-y-2">
                        {deal.value != null && (
                          <p className="text-xs font-medium text-green-700 dark:text-green-400">
                            {deal.currency} {deal.value.toLocaleString()}
                          </p>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={STAGES.indexOf(deal.stage) === 0}
                            onClick={() => moveStage(deal, "left")}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <div className="flex-1" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openEdit(deal)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(deal.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={STAGES.indexOf(deal.stage) === STAGES.length - 1}
                            onClick={() => moveStage(deal, "right")}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {stageDeals.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No deals
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Deal" : "New Deal"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Stage</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
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
              <Label>Value</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                value={form.expected_close_date}
                onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
