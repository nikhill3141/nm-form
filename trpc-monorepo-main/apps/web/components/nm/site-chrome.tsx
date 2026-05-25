import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Leaf, Menu, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { navItems } from "./data";
import { ThemeToggle } from "./theme-toggle";

export function SiteNav() {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4">
      <div className="nm-panel mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link className="group flex items-center gap-3" href="/">
          <span className="flex size-10 items-center justify-center rounded-lg border border-emerald-300/25 bg-emerald-300/12 shadow-[0_0_28px_rgba(74,222,128,0.22)]">
            <Leaf className="size-5 text-emerald-200 transition-transform group-hover:rotate-12" />
          </span>
          <span className="font-semibold">NM Forms</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-lg px-4 py-2 text-sm text-emerald-900/72 transition hover:bg-emerald-100/70 hover:text-emerald-950 dark:text-emerald-50/78 dark:hover:bg-white/10 dark:hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="nm-button-glass h-9 px-4 text-base" variant="outline">
                <Link href="/signup">
                  SignUp
                </Link>
          </Button>
          <Button asChild className="hidden bg-emerald-300 text-emerald-950 hover:bg-emerald-200 md:inline-flex">
            <Link href="/builder">
              Start Building
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button className="nm-button-glass lg:hidden" size="icon" variant="outline">
            <Menu className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-emerald-900/10 bg-emerald-50 px-6 py-16 text-emerald-950 dark:border-white/10 dark:bg-[#030806] dark:text-emerald-50">
      <div className="forest-noise absolute inset-0 opacity-35" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-emerald-300 text-emerald-950">
              <Sparkles className="size-5" />
            </span>
            <span className="text-xl font-semibold">NM Forms</span>
          </div>
          <p className="max-w-md text-sm leading-6 text-emerald-900/68 dark:text-emerald-50/68">
            Immersive forms, cinematic themes, and analytics built for modern teams that care about the response experience.
          </p>
        </div>
        {[
          ["Product", "Builder", "Explore", "Themes", "Analytics"],
          ["Company", "Pricing", "Customers", "Security", "Docs"],
          ["Social", "LinkedIn", "X", "GitHub", "Dribbble"],
        ].map(([title, ...items]) => (
          <div key={title}>
            <p className="mb-4 text-sm font-semibold text-emerald-950 dark:text-white">{title}</p>
            <div className="grid gap-3 text-sm text-emerald-900/62 dark:text-emerald-50/62">
              {items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="nm-app min-h-screen">
      <SiteNav />
      <section className="relative overflow-hidden px-6 pb-12 pt-36">
        <div className="forest-scene absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(236,253,245,0.38),#f8fafc_82%)] dark:bg-[linear-gradient(180deg,rgba(6,18,13,0.35),#06120d_82%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.26em] text-emerald-700/80 dark:text-emerald-200/80">{eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-emerald-950 md:text-6xl dark:text-white">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-900/72 md:text-lg dark:text-emerald-50/72">{description}</p>
        </div>
      </section>
      {children}
      <Footer />
    </main>
  );
}
