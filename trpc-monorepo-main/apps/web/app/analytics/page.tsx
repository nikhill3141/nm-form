import { PageShell } from "~/components/nm/site-chrome";
import { AnalyticsMockup, GlassPanel } from "~/components/nm/ui-blocks";
import { analyticsMetrics } from "~/components/nm/data";

export default function AnalyticsPage() {
  return (
    <PageShell
      description="Response intelligence for completion, drop-off, source quality, and theme performance."
      eyebrow="Analytics"
      title="Understand the shape of every response journey."
    >
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analyticsMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <GlassPanel className="p-5" key={metric.label}>
                <Icon className="mb-6 size-7 text-emerald-200" />
                <p className="text-sm text-emerald-50/60">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
              </GlassPanel>
            );
          })}
        </div>
      </section>
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <AnalyticsMockup />
        </div>
      </section>
    </PageShell>
  );
}
