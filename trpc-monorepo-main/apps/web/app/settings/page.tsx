import { Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PageShell } from "~/components/nm/site-chrome";
import { GlassPanel } from "~/components/nm/ui-blocks";
import { settingsGroups } from "~/components/nm/data";

export default function SettingsPage() {
  return (
    <PageShell
      description="Workspace, security, integration, and assistant preferences for a premium form platform."
      eyebrow="User Settings"
      title="Tune the workspace behind the experience."
    >
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-4">
            {settingsGroups.map((group) => {
              const Icon = group.icon;
              return (
                <GlassPanel className="p-5" key={group.title}>
                  <Icon className="mb-5 size-7 text-emerald-200" />
                  <h2 className="text-xl font-semibold">{group.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/62">{group.text}</p>
                </GlassPanel>
              );
            })}
          </div>
          <GlassPanel className="p-6">
            <h2 className="text-2xl font-semibold">Workspace profile</h2>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-50">Workspace name</label>
                <input className="nm-input" defaultValue="Canopy Studio" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-50">Default theme</label>
                <input className="nm-input" defaultValue="Forest Cinematic" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-50">Public profile URL</label>
                <input className="nm-input" defaultValue="nmforms.com/canopy" />
              </div>
              <Button className="mt-2 bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
                <Save className="size-4" />
                Save changes
              </Button>
            </div>
          </GlassPanel>
        </div>
      </section>
    </PageShell>
  );
}
