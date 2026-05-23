import {
  BarChart3,
  Bot,
  ChartNoAxesCombined,
  Check,
  CloudSun,
  Eye,
  FileText,
  Gauge,
  GitBranch,
  Globe2,
  Layers3,
  Lock,
  MessagesSquare,
  MoonStar,
  MousePointer2,
  Palette,
  PenTool,
  PlugZap,
  Settings2,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Trees,
  UsersRound,
  WandSparkles,
  Waves,
  Zap,
} from "lucide-react";

export const navItems = [
  { label: "Pricing", href: "/pricing" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Builder", href: "/builder" },
  { label: "Templates", href: "/templates" },
  { label: "Themes", href: "/themes" },
];

export const trustedTeams = ["Canopy", "Northstar", "Evergreen", "Atlas", "Luma"];

export const experienceFeatures = [
  {
    icon: Trees,
    title: "Cinematic form journeys",
    text: "Fullscreen intros, paced question transitions, and focused response states turn forms into branded moments.",
  },
  {
    icon: MousePointer2,
    title: "Interactive storytelling",
    text: "Progress, conditional paths, and animated field groups help each respondent move through a natural flow.",
  },
  {
    icon: Palette,
    title: "Theme-first creation",
    text: "Forest, ocean, cosmic, luxury, and cyber themes keep readability high while changing the whole mood.",
  },
  {
    icon: ShieldCheck,
    title: "Share with control",
    text: "Public discovery, unlisted links, expiry windows, and response limits map cleanly to the backend model.",
  },
];

export const themeCards = [
  {
    name: "Forest Cinematic",
    description: "Nature inspired immersive form experience.",
    icon: Trees,
    accent: "#4ADE80",
    background: "#07140D",
    surface: "rgba(17, 35, 25, 0.75)",
    chips: ["Fog", "Parallax", "Glass blur"],
  },
  {
    name: "Ocean Flow",
    description: "Elegant deep blue fluid experience.",
    icon: Waves,
    accent: "#38BDF8",
    background: "#061826",
    surface: "rgba(12, 32, 48, 0.8)",
    chips: ["Wave gradients", "Reflections", "Blue glow"],
  },
  {
    name: "Cosmic Dark",
    description: "Futuristic galaxy-inspired interface.",
    icon: MoonStar,
    accent: "#8B5CF6",
    background: "#050816",
    surface: "rgba(20, 20, 40, 0.8)",
    chips: ["Stars", "Nebula", "Neon focus"],
  },
  {
    name: "Minimal Luxury",
    description: "Apple inspired premium minimalism.",
    icon: SunMedium,
    accent: "#111827",
    background: "#F8FAFC",
    surface: "rgba(255,255,255,0.72)",
    chips: ["Soft shadows", "Quiet UI", "Editorial"],
  },
  {
    name: "Cyber Neon",
    description: "Gaming inspired futuristic neon theme.",
    icon: Zap,
    accent: "#00F5D4",
    background: "#05010F",
    surface: "rgba(15, 15, 25, 0.82)",
    chips: ["Grid", "Glow trails", "Cyan focus"],
  },
];

export const templates = [
  { title: "Founder Intake", category: "Startup", fields: 12, theme: "Forest Cinematic" },
  { title: "Event RSVP", category: "Community", fields: 8, theme: "Minimal Luxury" },
  { title: "Product Feedback", category: "SaaS", fields: 10, theme: "Ocean Flow" },
  { title: "Client Onboarding", category: "Agency", fields: 15, theme: "Cosmic Dark" },
  { title: "Hiring Screen", category: "People", fields: 9, theme: "Cyber Neon" },
  { title: "Research Survey", category: "UXR", fields: 18, theme: "Forest Cinematic" },
];

export const pricingPlans = [
  {
    name: "Seed",
    price: "Free",
    description: "For simple immersive forms.",
    features: ["3 published forms", "Forest theme", "Basic analytics", "Unlisted sharing"],
  },
  {
    name: "Canopy",
    price: "$19",
    description: "For creators and teams shipping polished experiences.",
    highlighted: true,
    features: ["Unlimited forms", "Theme marketplace", "AI form assistant", "Advanced analytics"],
  },
  {
    name: "Grove",
    price: "$69",
    description: "For organizations with brand and collaboration needs.",
    features: ["Team workspaces", "Custom themes", "Priority support", "Audit-ready controls"],
  },
];

export const dashboardStats = [
  { label: "Live forms", value: "42", delta: "+12%", icon: FileText },
  { label: "Responses", value: "18.4k", delta: "+28%", icon: MessagesSquare },
  { label: "Completion", value: "81%", delta: "+7%", icon: Gauge },
  { label: "Collaborators", value: "16", delta: "+3", icon: UsersRound },
];

export const recentForms = [
  { title: "Forest launch survey", status: "Published", responses: 842, theme: "Forest" },
  { title: "Partner onboarding", status: "Draft", responses: 0, theme: "Luxury" },
  { title: "Product research sprint", status: "Published", responses: 291, theme: "Ocean" },
  { title: "Beta waitlist", status: "Unlisted", responses: 1038, theme: "Cosmic" },
];

export const builderBlocks = [
  { label: "Short answer", icon: PenTool },
  { label: "Select", icon: Layers3 },
  { label: "Rating", icon: Sparkles },
  { label: "Logic split", icon: GitBranch },
  { label: "Intro screen", icon: Eye },
  { label: "AI theme", icon: WandSparkles },
];

export const analyticsMetrics = [
  { label: "Total responses", value: "18,420", icon: BarChart3 },
  { label: "Avg. time", value: "2m 14s", icon: Gauge },
  { label: "Best theme", value: "Forest", icon: CloudSun },
  { label: "Top source", value: "Public", icon: Globe2 },
];

export const settingsGroups = [
  { title: "Workspace", text: "Brand name, default theme, public profile.", icon: Settings2 },
  { title: "Security", text: "Session handling, cookie auth, team access.", icon: Lock },
  { title: "Integrations", text: "Connect webhooks, CRM, sheets, and events.", icon: PlugZap },
  { title: "AI Assistant", text: "Tone, form style, and generation preferences.", icon: Bot },
];

export const checks = Check;
export const chartIcon = ChartNoAxesCombined;
