import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Eye,
  Leaf,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { SiteNav, Footer } from "~/components/nm/site-chrome";
import {
  AnalyticsMockup,
  BuilderMockup,
  DashboardPreview,
  FormPreviewCard,
  GlassPanel,
  SectionHeading,
  ThemeStrip,
  VideoFallbackHero,
} from "~/components/nm/ui-blocks";
import { experienceFeatures, pricingPlans, trustedTeams } from "~/components/nm/data";

export default function Home() {
  const testimonials = [
    {
      quote: "It felt less like a survey and more like a guided conversation.",
      name: "Mira Shah",
      icon: MessageSquareQuote,
    },
    {
      quote: "The theme system made our launch feedback page feel like part of the campaign.",
      name: "Aarav Patel",
      icon: Sparkles,
    },
    {
      quote: "We could finally see where people slowed down and which questions carried the flow.",
      name: "Neha Rao",
      icon: BarChart3,
    },
  ];

  return (
    <main className="nm-app min-h-screen overflow-hidden">
      <SiteNav />

      <section className="relative min-h-[94vh] overflow-hidden px-6 pb-20 pt-32 md:pt-40">
        <VideoFallbackHero />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100 backdrop-blur-xl">
              <Sparkles className="size-4" />
              Immersive form experience platform
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-white md:text-7xl">
              Forms that feel natural.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/74">
              Create immersive, beautiful, shareable forms with cinematic themes and modern interactions.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="magnetic-button h-12 bg-emerald-300 px-6 text-base text-emerald-950 hover:bg-emerald-200">
                <Link href="/builder">
                  Start Building
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild className="nm-button-glass h-12 px-6 text-base" variant="outline">
                <Link href="/themes">
                  Explore Themes
                  <Eye className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <FormPreviewCard />
          </div>
        </div>
      </section>

      <section className="relative px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl md:grid-cols-5">
            {trustedTeams.map((team) => (
              <div className="trusted-logo rounded-lg border border-white/8 bg-white/[0.04] px-4 py-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-emerald-50/58" key={team}>
                {team}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            centered
            description="NM Forms wraps form creation, sharing, themes, and analytics in one premium product surface."
            eyebrow="Experience"
            title="Interactive forms that behave like beautiful product flows."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {experienceFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <GlassPanel className="feature-card p-5" key={feature.title}>
                  <Icon className="mb-7 size-8 text-emerald-200" />
                  <h3 className="text-xl font-semibold text-emerald-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-emerald-900/65 dark:text-emerald-50/65">{feature.text}</p>
                </GlassPanel>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            description="Switch the whole emotional register of a form while keeping labels, inputs, and focus states readable."
            eyebrow="Themes"
            title="A marketplace for immersive form worlds."
          />
          <ThemeStrip />
        </div>
      </section>

      <section className="px-6 py-24 flex flex-col">
        <div className="mx-auto flex flex-col max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionHeading
            description="The same builder your team uses: add question blocks, drag fields into the right order, set expiry and visibility, then publish without leaving the canvas."
            eyebrow="Builder"
            title="Build, reorder, and publish from one focused canvas."/>
          <BuilderMockup />
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.78fr]">
          <AnalyticsMockup />
          <DashboardPreview />
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            centered
            description="Premium glass pricing cards with a clean path from solo experiments to organization-wide form experiences."
            eyebrow="Pricing"
            title="Start small. Grow into a full experience platform."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <GlassPanel className={plan.highlighted ? "p-6 ring-2 ring-emerald-300/45" : "p-6"} key={plan.name}>
                <div className="mb-7 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/62 dark:text-emerald-50/62">{plan.description}</p>
                  </div>
                  {plan.highlighted && <BadgeCheck className="size-6 text-emerald-200" />}
                </div>
                <p className="mb-6 text-4xl font-semibold">
                  {plan.price}
                  {plan.price.startsWith("$") && <span className="text-base font-normal text-emerald-900/55 dark:text-emerald-50/55">/mo</span>}
                </p>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div className="flex items-center gap-3 text-sm text-emerald-900/75 dark:text-emerald-50/75" key={feature}>
                      <Leaf className="size-4 text-emerald-200" />
                      {feature}
                    </div>
                  ))}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {testimonials.map(({ quote, name, icon: Icon }) => (
            <GlassPanel className="floating-card p-6" key={name}>
              <Icon className="mb-8 size-7 text-emerald-200" />
              <p className="text-lg leading-8 text-emerald-950 dark:text-white">{quote}</p>
              <p className="mt-6 text-sm font-semibold text-emerald-700 dark:text-emerald-100">{name}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
