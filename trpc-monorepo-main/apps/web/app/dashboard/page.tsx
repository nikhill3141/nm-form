import { FunctionalDashboard } from "~/components/nm/functional-dashboard";

export default function DashboardPage() {
  return (
    <>
    {/* sidebar */}
      <section className="relative overflow-hidden px-6 pt-14">
        <div className="forest-scene absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,18,13,0.35),#06120d_82%)]" />
      </section>
      <section className="px-6 ">
        <div className="mx-auto max-w-7xl">
          <FunctionalDashboard />
        </div>
      </section>

    </>
  );
}
