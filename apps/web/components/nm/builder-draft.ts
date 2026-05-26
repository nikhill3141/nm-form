import type { FieldType } from "./field-types";
import type { FormThemeValue } from "./themes";

export const builderDraftStorageKey = "nm-form-builder-draft";

export interface BuilderDraftField {
  id: string;
  persistedId?: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface BuilderDraft {
  title: string;
  description: string;
  theme: FormThemeValue;
  visibility: "public" | "unlisted";
  activeFormId: string;
  activeSlug: string;
  shareUrl: string;
  expiresAt: string;
  allowAnonymous: boolean;
  passwordEnabled: boolean;
  formPassword: string;
  fields: BuilderDraftField[];
}

export function loadBuilderDraft() {
  if (typeof window === "undefined") return null;

  const rawDraft = window.localStorage.getItem(builderDraftStorageKey);
  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as BuilderDraft;
  } catch {
    return null;
  }
}

export function saveBuilderDraft(draft: BuilderDraft) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(builderDraftStorageKey, JSON.stringify(draft));
}
