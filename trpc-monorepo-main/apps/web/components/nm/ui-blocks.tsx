import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  Eye,
  GripVertical,
  Leaf,
  LayoutDashboard,
  Play,
  Plus,
  Save,
  Send,
  Smartphone,
  Star,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { recentForms, themeCards } from "./data";

export function GlassPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "nm-panel rounded-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("mb-10", centered && "mx-auto max-w-3xl text-center")}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/75">{eyebrow}</p>
      <h2 className="text-3xl font-semibold leading-tight text-emerald-950 md:text-5xl dark:text-white">{title}</h2>
      <p className="mt-4 text-base leading-7 text-emerald-900/68 dark:text-emerald-50/68">{description}</p>
    </div>
  );
}

export function FormPreviewCard() {
  return (
    <GlassPanel className="floating-card w-full max-w-md p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Live Preview</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Forest launch survey</h3>
        </div>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/12 px-3 py-1 text-xs text-emerald-100">
          72%
        </span>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-emerald-50">What should feel easier in your workflow?</label>
        <textarea
          className="min-h-28 w-full resize-none rounded-lg border border-white/14 bg-black/28 px-4 py-3 text-base text-white outline-none transition placeholder:text-emerald-50/42 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/18"
          placeholder="Share the moment that slows your team down..."
        />
        <div className="grid grid-cols-2 gap-3">
          {["Design quality", "Speed", "Analytics", "Sharing"].map((item) => (
            <button
              className="rounded-lg border border-white/12 bg-white/[0.07] px-3 py-3 text-left text-sm text-emerald-50 transition hover:border-emerald-300/50 hover:bg-emerald-300/10"
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <Button className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
          Continue
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </GlassPanel>
  );
}

export function BuilderMockup() {
  const builderFields = [
    {
      number: "01",
      title: "Which product area did you use?",
      meta: "Single select - required",
      preview: ["Dashboard", "Builder", "Analytics", "Sharing"],
      raised: false,
    },
    {
      number: "02",
      title: "How satisfied are you?",
      meta: "Rating - required",
      preview: "stars",
      raised: true,
    },
    {
      number: "03",
      title: "What slowed you down?",
      meta: "Long answer",
      preview: "textarea",
      raised: false,
    },
  ];

  return (
    <GlassPanel className="grid w-full overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)_260px]">
      <aside className="border-b border-emerald-900/10 p-4 dark:border-white/10 lg:border-b-0 lg:border-r">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Question blocks</p>
        <div className="mb-4 space-y-3 rounded-lg border border-emerald-900/10 bg-emerald-50/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
          <div>
            <p className="mb-2 text-xs text-emerald-900/80 dark:text-emerald-50/80">Question label</p>
            <div className="rounded-lg border border-emerald-900/10 bg-white/78 px-3 py-3 text-xs text-emerald-900/45 dark:border-white/10 dark:bg-black/24 dark:text-emerald-50/45">
              e.g. What is your email?
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-900/80 dark:text-emerald-50/80">
            <span className="size-4 rounded border border-emerald-900/20 bg-white dark:border-white/20 dark:bg-black/20" />
            Required question
          </div>
        </div>
        <div className="grid gap-2">
          {["Short answer", "Long answer", "Email", "Select", "Rating", "Yes / No"].map((item) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-emerald-900/10 bg-white/70 p-3 text-sm text-emerald-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50"
              key={item}
            >
              <Plus className="size-4 text-emerald-500 dark:text-emerald-200" />
              {item}
            </div>
          ))}
        </div>
      </aside>
      <section className="min-h-[520px] bg-emerald-50/72 p-4 dark:bg-black/18 md:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Live canvas</p>
            <h3 className="mt-1 text-2xl font-semibold text-emerald-950 dark:text-white">Product Feedback</h3>
          </div>
          <div className="flex gap-2">
            <Button className="nm-button-glass" size="sm" variant="outline">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Button>
            <Button className="nm-button-glass" size="sm" variant="outline">
              <Smartphone className="size-4" />
              desktop
            </Button>
            <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" size="sm">
              <Save className="size-4" />
              Save draft
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-emerald-900/10 bg-white/84 p-5 shadow-xl shadow-emerald-950/10 dark:border-white/12 dark:bg-[#0c1f16]/82 dark:shadow-black/20">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Forest Cinematic</p>
            <h4 className="text-3xl font-semibold text-emerald-950 dark:text-white">Product Feedback</h4>
            <p className="mt-3 text-sm leading-6 text-emerald-900/64 dark:text-emerald-50/64">
              Measure product sentiment, feature fit, and the clearest improvement path.
            </p>
            <div className="mt-5 rounded-lg border border-emerald-900/10 bg-emerald-50/70 p-3 text-xs text-emerald-900/62 dark:border-white/10 dark:bg-white/[0.05] dark:text-emerald-50/62">
              Drag handles reorder questions instantly, then Save syncs the new field order.
            </div>
            <div className="mt-6 space-y-4">
              {builderFields.map((field) => (
                <div
                  className={`builder-tile rounded-lg border p-4 transition ${
                    field.raised
                      ? "border-emerald-500/60 bg-emerald-300/18 shadow-xl shadow-emerald-950/10 dark:border-emerald-300/60 dark:bg-emerald-300/12"
                      : "border-emerald-900/10 bg-emerald-50/70 dark:border-white/10 dark:bg-white/[0.06]"
                  }`}
                  key={field.number}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-900/10 bg-white/72 text-emerald-900/45 dark:border-white/10 dark:bg-black/20 dark:text-emerald-50/45">
                      <GripVertical className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-semibold text-emerald-950 dark:text-white">{field.title}</h5>
                        <span className="rounded-full bg-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-950">{field.number}</span>
                      </div>
                      <p className="mt-1 text-xs text-emerald-900/50 dark:text-emerald-50/45">{field.meta}</p>
                    </div>
                  </div>
                  {Array.isArray(field.preview) && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {field.preview.map((option) => (
                        <span
                          className="rounded-lg border border-emerald-900/10 bg-white/70 p-3 text-sm text-emerald-950/72 dark:border-white/10 dark:bg-black/20 dark:text-emerald-50/72"
                          key={option}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                  {field.preview === "stars" && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star className="size-5 fill-emerald-300 text-emerald-500 dark:text-emerald-200" key={star} />
                      ))}
                    </div>
                  )}
                  {field.preview === "textarea" && (
                    <div className="min-h-20 rounded-lg border border-emerald-900/10 bg-white/70 p-3 text-sm text-emerald-900/42 dark:border-white/10 dark:bg-black/20 dark:text-emerald-50/42">
                      Disabled in builder preview
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <aside className="border-t border-emerald-900/10 p-4 dark:border-white/10 lg:border-l lg:border-t-0">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Form properties</p>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-emerald-950 dark:text-emerald-50">Title</label>
            <div className="rounded-lg border border-emerald-900/10 bg-white/78 p-3 text-sm text-emerald-950 dark:border-white/10 dark:bg-black/24 dark:text-emerald-50">
              Product Feedback
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-emerald-950 dark:text-emerald-50">Theme</label>
            <div className="flex items-center justify-between rounded-lg border border-emerald-900/10 bg-white/78 p-3 text-sm text-emerald-950 dark:border-white/10 dark:bg-black/24 dark:text-emerald-50">
              Forest Cinematic
              <ChevronRight className="size-4 rotate-90 opacity-55" />
            </div>
            <p className="mt-2 text-xs leading-5 text-emerald-900/56 dark:text-emerald-50/52">
              Moss, glass, and soft canopy light.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm text-emerald-950 dark:text-emerald-50">Form expiry</label>
            <div className="rounded-lg border border-emerald-900/10 bg-white/78 p-3 text-sm text-emerald-950 dark:border-white/10 dark:bg-black/24 dark:text-emerald-50">
              Next Friday, 6:00 PM
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["public", "unlisted"].map((item) => (
              <span
                className={`rounded-lg border px-3 py-3 text-center text-sm ${
                  item === "public"
                    ? "border-emerald-500/50 bg-emerald-300/24 text-emerald-950 dark:border-emerald-300/50 dark:bg-emerald-300/14 dark:text-emerald-50"
                    : "border-emerald-900/10 bg-white/64 text-emerald-900/62 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/62"
                }`}
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <Button className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
            <Send className="size-4" />
            Publish and view Explore
          </Button>
          <Button className="nm-button-glass w-full" variant="outline">
            <Eye className="size-4" />
            Preview current draft
          </Button>
          <div className="rounded-lg border border-emerald-900/10 bg-white/64 p-3 text-xs text-emerald-900/56 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/52">
            Drag-and-drop reorder is saved with the same field sync used by the live builder.
          </div>
        </div>
      </aside>
    </GlassPanel>
  );
}

export function AnalyticsMockup() {
  const stages = [
    { label: "Opened", value: 1240, width: "100%" },
    { label: "Started", value: 1016, width: "82%" },
    { label: "Reached rating", value: 846, width: "68%" },
    { label: "Submitted", value: 731, width: "59%" },
  ];

  return (
    <GlassPanel className="p-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Analytics</p>
          <h3 className="mt-1 text-2xl font-semibold">Response flow</h3>
          <p className="mt-2 text-sm text-emerald-900/62 dark:text-emerald-50/62">Completion, drop-off, and question momentum in one calm view.</p>
        </div>
        <div className="flex gap-2">
          {["7D", "30D", "90D"].map((item) => (
            <button className="rounded-lg border border-emerald-900/10 bg-white/70 px-3 py-2 text-xs text-emerald-900/70 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/70" key={item} type="button">
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex h-64 items-end gap-3 rounded-xl border border-emerald-900/10 bg-white/70 p-4 dark:border-white/10 dark:bg-black/20">
          {[42, 64, 58, 78, 52, 88, 73, 96, 82, 91, 76, 100].map((height, index) => (
            <div className="flex flex-1 items-end" key={`${height}-${index}`}>
              <span
                className="analytics-bar block w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-cyan-200"
                style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }}
              />
            </div>
          ))}
        </div>
        <div className="grid gap-3">
          {stages.map((stage) => (
            <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]" key={stage.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{stage.label}</span>
                <span className="text-emerald-700 dark:text-emerald-200">{stage.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-emerald-950/10 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: stage.width }} />
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-300/14 p-3">
            <p className="text-sm font-semibold">Best performing question</p>
            <p className="mt-1 text-xs leading-5 text-emerald-900/64 dark:text-emerald-50/64">“How would you rate the experience?” converts 91% after the intro.</p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

export function DashboardPreview() {
  return (
    <GlassPanel className="p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/65">Workspace</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">Canopy Studio</h3>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
          <Circle className="size-2 fill-emerald-300 text-emerald-300" />
          Live
        </span>
      </div>
      <div className="grid gap-3">
        {recentForms.map((form) => (
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] p-3" key={form.title}>
            <div>
              <p className="font-medium text-white">{form.title}</p>
              <p className="mt-1 text-xs text-emerald-50/55">{form.theme} theme</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-100">{form.responses}</p>
              <p className="mt-1 text-xs text-emerald-50/55">{form.status}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

export function ThemeStrip() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {themeCards.map((theme) => {
        const Icon = theme.icon;
        const isLightCard = theme.name === "Minimal Luxury";
        return (
          <div
            className="theme-card min-h-72 rounded-xl border border-white/12 p-5 shadow-2xl shadow-black/25"
            key={theme.name}
            style={{
              background: `linear-gradient(160deg, ${theme.surface}, ${theme.background})`,
            }}
          >
            <div
              className="mb-8 flex size-12 items-center justify-center rounded-lg border border-white/12"
              style={{ color: theme.accent, boxShadow: `0 0 30px ${theme.accent}33` }}
            >
              <Icon className="size-6" />
            </div>
            <h3 className={`text-xl font-semibold ${isLightCard ? "text-zinc-950" : "text-white"}`}>{theme.name}</h3>
            <p className={`mt-3 text-sm leading-6 ${isLightCard ? "text-zinc-700" : "text-white/68"}`}>{theme.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {theme.chips.map((chip) => (
                <span className={`rounded-full border px-3 py-1 text-xs ${isLightCard ? "border-zinc-200 bg-white/70 text-zinc-700" : "border-white/12 bg-white/10 text-white/72"}`} key={chip}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";

  return (
    <main className="nm-app relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <div className="forest-scene absolute inset-0 opacity-75" />
      <div className="absolute inset-0 bg-white/25 dark:bg-black/35" />
      <GlassPanel className="relative w-full max-w-md p-6">
        <Link className="mb-8 flex items-center gap-3" href="/">
          <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-300 text-emerald-950">
            <Leaf className="size-5" />
          </span>
          <span className="font-semibold">NM Forms</span>
        </Link>
        <h1 className="text-3xl font-semibold">{isSignup ? "Create your workspace" : "Welcome back"}</h1>
        <p className="mt-3 text-sm leading-6 text-emerald-900/66 dark:text-emerald-50/66">
          {isSignup ? "Start designing immersive forms with cinematic themes." : "Open your dashboard and continue building."}
        </p>
        <form className="mt-8 space-y-4">
          {isSignup && (
            <div>
              <label className="mb-2 block text-sm font-medium text-emerald-950 dark:text-emerald-50">Full name</label>
              <input className="nm-input" placeholder="Nikhil Mehta" />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-950 dark:text-emerald-50">Email</label>
            <input className="nm-input" placeholder="you@example.com" type="email" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-950 dark:text-emerald-50">Password</label>
            <input className="nm-input" placeholder="Enter your password" type="password" />
          </div>
          <Button className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200" type="button">
            {isSignup ? "Create account" : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-emerald-900/62 dark:text-emerald-50/62">
          {isSignup ? "Already have an account?" : "New to NM Forms?"}{" "}
          <Link className="font-medium text-emerald-200" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </GlassPanel>
    </main>
  );
}

export function PublicFormExperience() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07140d] px-6 py-10 text-white">
      <div className="forest-scene absolute inset-0 opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(3,8,6,0.78))]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-between">
        <div className="flex items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-300 text-emerald-950">
              <Leaf className="size-5" />
            </span>
            <span className="font-semibold">NM Forms</span>
          </Link>
          <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-emerald-50/72">3 of 8</span>
        </div>
        <section className="py-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200/75">Forest feedback</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">What part of the experience felt most alive?</h1>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {["The opening scene", "The form flow", "The visual theme", "The thank you screen"].map((item) => (
              <button className="public-choice rounded-xl border border-white/12 bg-white/[0.08] p-5 text-left text-lg text-white backdrop-blur-xl transition hover:border-emerald-300/50 hover:bg-emerald-300/12" key={item} type="button">
                {item}
              </button>
            ))}
          </div>
        </section>
        <div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[38%] rounded-full bg-emerald-300" />
          </div>
          <div className="flex justify-between">
            <Button className="border-white/15 bg-white/10 text-white hover:bg-white/15" variant="outline">
              Back
            </Button>
            <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
              Continue
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export function VideoFallbackHero() {
  return (
    <div className="absolute inset-0">
      <div className="forest-scene absolute inset-0" />
      <div className="fog-layer absolute inset-0" />
      <div className="particle-field absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,6,0.92),rgba(7,20,13,0.55)_52%,rgba(3,8,6,0.85)),linear-gradient(180deg,rgba(3,8,6,0.12),#06120d_92%)]" />
      <div className="light-sweep absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#06120d] to-transparent" />
      <Play className="absolute bottom-10 right-10 size-12 text-emerald-100/12" />
    </div>
  );
}

export { Check };
