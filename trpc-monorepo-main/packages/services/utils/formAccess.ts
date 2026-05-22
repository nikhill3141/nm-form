import type { SelectForm } from "@repo/database/schema";

export function assertFormNotDeleted(form: SelectForm) {
  if (form.status === "deleted") {
    throw new Error("form is deleted");
  }
}

export function assertFormPublished(form: SelectForm) {
  if (!form.isPublished || form.status !== "published") {
    throw new Error("form is not published");
  }
}

export function assertFormNotExpired(form: SelectForm) {
  if (form.expiresAt && form.expiresAt < new Date()) {
    throw new Error("form has expired");
  }
}

export function assertResponseLimitNotReached(form: SelectForm) {
  if (
    form.responseLimit !== null &&
    form.responseCount >= form.responseLimit
  ) {
    throw new Error("response limit reached");
  }
}
