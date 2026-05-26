import db, { eq } from "@repo/database";
import { formsTable } from "@repo/database/schema";

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "form";
}

export async function createUniqueFormSlug(title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const [existingForm] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(eq(formsTable.slug, slug))
      .limit(1);

    if (!existingForm) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
