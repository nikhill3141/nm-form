import { Suspense } from "react";
import { SharedFormRuntime } from "~/components/nm/shared-form-runtime";

export default function SharedFormPage() {
  return (
    <Suspense>
      <SharedFormRuntime />
    </Suspense>
  );
}
