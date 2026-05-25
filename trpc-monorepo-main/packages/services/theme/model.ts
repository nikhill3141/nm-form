import { z } from "zod";

export const formThemeValues = [
  "forest_cinematic",
  "ocean_flow",
  "cosmic_dark",
  "minimal_luxury",
  "cyber_neon",
  "sunset_studio",
] as const;

export const formThemeSchema = z.enum(formThemeValues);
export type FormTheme = z.infer<typeof formThemeSchema>;
