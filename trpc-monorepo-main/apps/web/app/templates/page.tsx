import { ArrowRight, FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PageShell } from "~/components/nm/site-chrome";
import { GlassPanel } from "~/components/nm/ui-blocks";
import { templates } from "~/components/nm/data";

export default function TemplatesPage() {
  return (
    <PageShell
      description="Start from polished templates tuned for product, research, onboarding, hiring, and events."
      eyebrow="Templates"
      title="Launch faster with form experiences that already have a point of view."
    >
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <GlassPanel className="p-5" key={template.title}>
              <FileText className="mb-8 size-8 text-emerald-200" />
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-emerald-200/65">{template.category}</p>
              <h2 className="text-2xl font-semibold">{template.title}</h2>
              <p className="mt-3 text-sm text-emerald-50/62">
                {template.fields} fields · {template.theme}
              </p>
              <Button className="mt-7 bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
                Use template
                <ArrowRight className="size-4" />
              </Button>
            </GlassPanel>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
