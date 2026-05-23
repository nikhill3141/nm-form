"use client";

import { useMemo, useState } from "react";
import { Eye, Loader2, Plus, Save, Send, Smartphone, Sparkles, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";
import { GlassPanel } from "./ui-blocks";


type FieldType = "short_text" | "long_text" | "email" | "number" | "single_select" | "rating" | "yes_no";

interface LocalField {
  id: string;
  persistedId?: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

const blockTypes: Array<{ label: string; type: FieldType }> = [
  { label: "Short answer", type: "short_text" },
  { label: "Long answer", type: "long_text" },
  { label: "Email", type: "email" },
  { label: "Number", type: "number" },
  { label: "Select", type: "single_select" },
  { label: "Rating", type: "rating" },
  { label: "Yes / No", type: "yes_no" },
];

export function FunctionalBuilder() {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("Forest launch survey");
  const [description, setDescription] = useState("A cinematic feedback journey for a product launch.");
  const [theme, setTheme] = useState("Forest Cinematic");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("unlisted");
  const [activeFormId, setActiveFormId] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [statusMessage, setStatusMessage] = useState("");
  const [fields, setFields] = useState<LocalField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [allowAnonymous, setAllowAnonymous] = useState(true);

  const createForm = trpc.form.createForm.useMutation();
  const editForm = trpc.form.editForm.useMutation();
  const createField = trpc.field.createField.useMutation();
  const createLink = trpc.formLink.createFormLink.useMutation();

  const persistedFields = useMemo(() => fields.filter((field) => field.persistedId), [fields]);
  const isBusy = createForm.isPending || editForm.isPending || createField.isPending || createLink.isPending;

  async function syncForm({ publish = false }: { publish?: boolean } = {}) {
    setStatusMessage("");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    try {
      let formId = activeFormId;
      if (!formId) {
        const form = await createForm.mutateAsync({
          title,
          description,
          visibility,
          status: publish ? "published" : "draft",
          theme,
          allowAnonymous,
          expiresAt,
        });
        formId = form.id;
        setActiveFormId(formId);
      } else {
        await editForm.mutateAsync({
          id: formId,
          title,
          description,
          visibility,
          status: publish ? "published" : "draft",
          theme,
          isPublished: publish,
          allowAnonymous,
          expiresAt,
        });
      }

      const nextFields = [...fields];
      for (const [order, field] of nextFields.entries()) {
        if (field.persistedId) continue;
        const created = await createField.mutateAsync({
          formId,
          label: field.label,
          type: field.type,
          required: field.required,
          order,
          placeholder: "Type your answer...",
          options: field.type === "single_select" ? field.options ?? ["Option A", "Option B"] : undefined,
        });
        nextFields[order] = { ...field, persistedId: created.id };
      }
      setFields(nextFields);

      if (publish && visibility === "unlisted") {
        await createLink.mutateAsync({ formId });
      }

      await utils.form.getAllFormsByUserId.invalidate();
      setStatusMessage(publish ? "Published through tRPC. Your dashboard and public preview can now use this form." : "Draft synced through tRPC.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not sync with backend.");
    }
  }

  function addField(type: FieldType, blockLabel: string) {
    const fieldLabel = newFieldLabel.trim() || blockLabel;
    setFields((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        label: fieldLabel,
        type,
        required: newFieldRequired,
        options: type === "single_select" ? ["Option A", "Option B", "Option C"] : undefined,
      },
    ]);
    setNewFieldLabel("");
    setNewFieldRequired(false);
  }

  function updateField(id: string, patch: Partial<Pick<LocalField, "label" | "required">>) {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...patch } : field))
    );
  }

  return (
    <div className="grid gap-6">
      <GlassPanel className="overflow-hidden">
        <div className="grid min-h-[620px] lg:grid-cols-[240px_minmax(0,1fr)_300px]">
          <aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-emerald-200/65">Question blocks</p>
            <div className="mb-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div>
                <label className="mb-2 block text-xs text-emerald-50/80" htmlFor="new-field-label">
                  Question label
                </label>
                <input
                  className="nm-input"
                  id="new-field-label"
                  onChange={(event) => setNewFieldLabel(event.target.value)}
                  placeholder="e.g. What is your email?"
                  value={newFieldLabel}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-emerald-50/80">
                <input
                  checked={newFieldRequired}
                  className="size-4 rounded border-white/20 accent-emerald-400"
                  onChange={(event) => setNewFieldRequired(event.target.checked)}
                  type="checkbox"
                />
                Required question
              </label>
            </div>
            <div className="grid gap-2">
              {blockTypes.map((block) => (
                <button
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 text-left text-sm text-emerald-50 transition hover:border-emerald-300/35"
                  key={block.type}
                  onClick={() => addField(block.type, block.label)}
                  type="button"
                >
                  <Plus className="size-4 text-emerald-200" />
                  {block.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-black/18 p-4 md:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/65">Live canvas</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
              </div>
              <div className="flex gap-2">
                <Button className="border-white/15 bg-white/10 text-white hover:bg-white/15" onClick={() => setPreviewMode(previewMode === "desktop" ? "mobile" : "desktop")} variant="outline">
                  <Smartphone className="size-4" />
                  {previewMode}
                </Button>
                <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" disabled={isBusy} onClick={() => syncForm()}>
                  {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Sync
                </Button>
              </div>
            </div>
              
      
            <div className={previewMode === "mobile" ? "mx-auto max-w-sm" : "mx-auto max-w-2xl"}>
              <div className="rounded-xl border border-white/12 bg-[#0c1f16]/82 p-5 shadow-xl shadow-black/20">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-emerald-200/65">{theme}</p>
                <h3 className="text-3xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-emerald-50/64">{description}</p>
                <div className="mt-6 space-y-4">
                  {fields.map((field, index) => (
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4" key={field.id}>
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <input
                            className="nm-input text-sm font-medium"
                            onChange={(event) => updateField(field.id, { label: event.target.value })}
                            placeholder="Question label"
                            value={field.label}
                          />
                          <label className="flex cursor-pointer items-center gap-2 text-xs text-emerald-50/70">
                            <input
                              checked={field.required}
                              className="size-3.5 rounded border-white/20 accent-emerald-400"
                              onChange={(event) => updateField(field.id, { required: event.target.checked })}
                              type="checkbox"
                            />
                            Required
                          </label>
                        </div>
                        <button className="shrink-0 text-emerald-50/50 hover:text-red-100" onClick={() => setFields((current) => current.filter((item) => item.id !== field.id))} type="button">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="mb-2 text-xs text-emerald-50/45">
                        {index + 1}. Preview{field.required ? " · required" : ""}
                      </p>
                      {field.type === "long_text" ? (
                        <textarea className="nm-input min-h-24" placeholder="Type your answer..." />
                        ) : field.type === "single_select" ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {(field.options ?? []).map((option) => (
                            <button className="rounded-lg border border-white/10 bg-black/20 p-3 text-left text-sm text-emerald-50/72" key={option} type="button">
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input className="nm-input" placeholder="Type your answer..." type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="border-t border-white/10 p-4 lg:border-l lg:border-t-0">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-emerald-200/65">Form properties</p>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-emerald-50">Title</label>
                <input className="nm-input" onChange={(event) => setTitle(event.target.value)} value={title} />
              </div>
              <div>
                <label className="mb-2 block text-sm text-emerald-50">Description</label>
                <textarea className="nm-input min-h-24" onChange={(event) => setDescription(event.target.value)} value={description} />
              </div>
              <div>
                <label className="mb-2 block text-sm text-emerald-50">Theme</label>
                <input className="nm-input" onChange={(event) => setTheme(event.target.value)} value={theme} />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-emerald-50/80">
                <input
                  checked={allowAnonymous}
                  className="size-4 rounded border-white/20 accent-emerald-400"
                  onChange={(event) => setAllowAnonymous(event.target.checked)}
                  type="checkbox"
                />
                Allow anonymous responses
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["public", "unlisted"] as const).map((item) => (
                  <button
                    className={`rounded-lg border px-3 py-3 text-sm ${visibility === item ? "border-emerald-300/50 bg-emerald-300/14 text-emerald-50" : "border-white/10 bg-white/[0.06] text-emerald-50/62"}`}
                    key={item}
                    onClick={() => setVisibility(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <Button className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200" disabled={isBusy} onClick={() => syncForm({ publish: true })}>
                {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Publish and link
              </Button>
              <Button className="w-full border-white/15 bg-white/10 text-white hover:bg-white/15" asChild variant="outline">
                <a href={activeFormId ? `/form/forest-feedback?formId=${activeFormId}` : "/form/forest-feedback"}>
                  <Eye className="size-4" />
                  Preview form
                </a>
              </Button>
              <p className="text-xs leading-5 text-emerald-50/52">{persistedFields.length} of {fields.length} fields synced to backend.</p>
              {statusMessage && <p className="rounded-lg border border-white/10 bg-white/[0.06] p-3 text-sm text-emerald-50/70">{statusMessage}</p>}
            </div>
          </aside>
        </div>
      </GlassPanel>
{/* 
      <GlassPanel className="p-5">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 text-emerald-200" />
          <p className="text-sm leading-6 text-emerald-50/72">
            Backend flow used here: `form.createForm`, `form.editForm`, `field.createField`, `formLink.createFormLink`, and dashboard invalidation through tRPC utils.
          </p>
        </div>
      </GlassPanel> */}
    </div>
  );
}
