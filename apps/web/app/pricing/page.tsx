import { BadgeCheck, Leaf } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PageShell } from "~/components/nm/site-chrome";
import { GlassPanel, SectionHeading } from "~/components/nm/ui-blocks";
import { pricingPlans } from "~/components/nm/data";

export default function PricingPage() {
  return (
    <PageShell
      description="Plans for creators, teams, and organizations that want forms to feel premium from first question to final thank you."
      eyebrow="Pricing"
      title="A pricing model that scales with your form experience."
    >
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            centered
            description="Every tier keeps the visual system readable, fast, and responsive."
            eyebrow="Plans"
            title="Choose your canopy."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <GlassPanel className={plan.highlighted ? "p-6 ring-2 ring-emerald-300/45" : "p-6"} key={plan.name}>
                <div className="mb-7 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{plan.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/62">{plan.description}</p>
                  </div>
                  {plan.highlighted && <BadgeCheck className="size-6 text-emerald-200" />}
                </div>
                <p className="mb-6 text-4xl font-semibold">
                  {plan.price}
                  {plan.price.startsWith("$") && <span className="text-base font-normal text-emerald-50/55">/mo</span>}
                </p>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div className="flex items-center gap-3 text-sm text-emerald-50/75" key={feature}>
                      <Leaf className="size-4 text-emerald-200" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button className="mt-8 w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200">Start with {plan.name}</Button>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
