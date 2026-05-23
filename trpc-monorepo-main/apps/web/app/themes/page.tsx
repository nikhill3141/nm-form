import { PageShell } from "~/components/nm/site-chrome";
import { SectionHeading, ThemeStrip } from "~/components/nm/ui-blocks";

export default function ThemesPage() {
  return (
    <PageShell
      description="A cinematic marketplace where each theme changes the form world while preserving strong contrast and readable inputs."
      eyebrow="Theme Marketplace"
      title="Make every form feel like a destination."
    >
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            description="Forest, ocean, cosmic, luxury, and cyber modes are modeled as full experience systems, not just color swaps."
            eyebrow="Collection"
            title="Five premium launch themes."
          />
          <ThemeStrip />
        </div>
      </section>
    </PageShell>
  );
}
