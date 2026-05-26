export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "checkbox"
  | "phone"
  | "date"
  | "rating"
  | "yes_no"
  | "password"
  | "url"
  | "time";

export const fieldBlocks: Array<{
  label: string;
  type: FieldType;
  placeholder: string;
}> = [
  { label: "Short answer", type: "short_text", placeholder: "Type your answer..." },
  { label: "Long answer", type: "long_text", placeholder: "Write a longer response..." },
  { label: "Email", type: "email", placeholder: "you@example.com" },
  { label: "Password", type: "password", placeholder: "Enter a secure value..." },
  { label: "Number", type: "number", placeholder: "42" },
  { label: "Phone", type: "phone", placeholder: "+1 555 000 0000" },
  { label: "URL", type: "url", placeholder: "https://example.com" },
  { label: "Date", type: "date", placeholder: "" },
  { label: "Time", type: "time", placeholder: "" },
  { label: "Select", type: "single_select", placeholder: "" },
  { label: "Multi select", type: "multi_select", placeholder: "" },
  { label: "Checkboxes", type: "checkbox", placeholder: "" },
  { label: "Rating", type: "rating", placeholder: "Add a little feedback..." },
  { label: "Yes / No", type: "yes_no", placeholder: "" },
];

export function getDefaultOptionsForFieldType(type: FieldType) {
  if (type === "yes_no") return ["Yes", "No"];
  if (type === "single_select" || type === "multi_select" || type === "checkbox") {
    return ["Option A", "Option B", "Option C"];
  }

  return undefined;
}

export function getInputTypeForFieldType(type: FieldType) {
  if (type === "phone") return "tel";
  if (type === "short_text") return "text";
  if (type === "long_text" || type === "single_select" || type === "multi_select" || type === "checkbox" || type === "rating" || type === "yes_no") {
    return "text";
  }

  return type;
}

export function isOptionField(type: FieldType) {
  return type === "single_select" || type === "multi_select" || type === "checkbox" || type === "yes_no";
}
