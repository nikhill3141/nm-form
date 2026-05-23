import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  Eye,
  Leaf,
  Play,
  Plus,
  Send,
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
        "rounded-xl border border-white/12 bg-white/[0.075] shadow-2xl shadow-black/25 backdrop-blur-2xl",
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
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200/75">{eyebrow}</p>
      <h2 className="text-3xl font-semibold leading-tight text-white md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-emerald-50/68">{description}</p>
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
  return (
    <GlassPanel className="grid overflow-hidden lg:grid-cols-[220px_1fr_260px]">
      <aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-emerald-200/65">Blocks</p>
        <div className="grid gap-2">
          {["Intro", "Short answer", "Multi select", "Rating", "Logic", "Thank you"].map((item) => (
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 text-sm text-emerald-50" key={item}>
              <Plus className="size-4 text-emerald-200" />
              {item}
            </div>
          ))}
        </div>
      </aside>
      <section className="min-h-[440px] bg-black/18 p-4 md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/65">Canvas</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">Product research sprint</h3>
          </div>
          <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" size="sm">
            <Eye className="size-4" />
            Preview
          </Button>
        </div>
        <div className="mx-auto max-w-xl space-y-4">
          {[
            ["01", "Welcome screen", "A cinematic opening with brand context."],
            ["02", "What product area should we improve first?", "Single select with four prioritized choices."],
            ["03", "Tell us the story behind that choice.", "Long answer with required validation."],
          ].map(([number, title, text]) => (
            <div className="builder-tile rounded-xl border border-white/12 bg-[#0c1f16]/80 p-5 shadow-xl shadow-black/20" key={number}>
              <div className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-300 text-sm font-semibold text-emerald-950">
                  {number}
                </span>
                <div>
                  <h4 className="font-semibold text-white">{title}</h4>
                  <p className="mt-1 text-sm leading-6 text-emerald-50/64">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <aside className="border-t border-white/10 p-4 lg:border-l lg:border-t-0">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-emerald-200/65">Properties</p>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-emerald-50">Theme</label>
            <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-50">Forest Cinematic</div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-emerald-50">Motion</label>
            <div className="grid grid-cols-2 gap-2">
              {["Fade", "Slide", "Scale", "Morph"].map((item) => (
                <span className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-center text-xs text-emerald-50/70" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </GlassPanel>
  );
}

export function AnalyticsMockup() {
  return (
    <GlassPanel className="p-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/65">Analytics</p>
          <h3 className="mt-1 text-2xl font-semibold">Response flow</h3>
        </div>
        <div className="flex gap-2">
          {["7D", "30D", "90D"].map((item) => (
            <button className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-emerald-50/70" key={item} type="button">
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-64 items-end gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
        {[42, 64, 58, 78, 52, 88, 73, 96, 82, 91, 76, 100].map((height, index) => (
          <div className="flex flex-1 items-end" key={`${height}-${index}`}>
            <span
              className="analytics-bar block w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-cyan-200"
              style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }}
            />
          </div>
        ))}
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
            <h3 className="text-xl font-semibold text-white">{theme.name}</h3>
            <p className="mt-3 text-sm leading-6 text-white/68">{theme.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {theme.chips.map((chip) => (
                <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs text-white/72" key={chip}>
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06120d] px-6 py-24 text-white">
      <div className="forest-scene absolute inset-0 opacity-75" />
      <div className="absolute inset-0 bg-black/35" />
      <GlassPanel className="relative w-full max-w-md p-6">
        <Link className="mb-8 flex items-center gap-3" href="/">
          <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-300 text-emerald-950">
            <Leaf className="size-5" />
          </span>
          <span className="font-semibold">NM Forms</span>
        </Link>
        <h1 className="text-3xl font-semibold">{isSignup ? "Create your workspace" : "Welcome back"}</h1>
        <p className="mt-3 text-sm leading-6 text-emerald-50/66">
          {isSignup ? "Start designing immersive forms with cinematic themes." : "Open your dashboard and continue building."}
        </p>
        <form className="mt-8 space-y-4">
          {isSignup && (
            <div>
              <label className="mb-2 block text-sm font-medium text-emerald-50">Full name</label>
              <input className="nm-input" placeholder="Nikhil Mehta" />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-50">Email</label>
            <input className="nm-input" placeholder="you@example.com" type="email" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-50">Password</label>
            <input className="nm-input" placeholder="Enter your password" type="password" />
          </div>
          <Button className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200" type="button">
            {isSignup ? "Create account" : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-emerald-50/62">
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
