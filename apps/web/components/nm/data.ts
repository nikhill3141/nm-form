import {
  ChartNoAxesCombined,
  Check,
  Eye,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  MessagesSquare,
  MoonStar,
  MousePointer2,
  Palette,
  PenTool,
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
  { label: "Explore", href: "/explore" },
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
  {
    slug: "founder-intake",
    title: "Founder Intake",
    category: "Startup",
    description: "Qualify founders, market context, traction, and next steps in one polished intake.",
    fields: 6,
    theme: "Forest Cinematic",
    themeValue: "forest_cinematic",
    questions: [
      { label: "What problem are you solving?", type: "long_text", required: true },
      { label: "Who is your primary customer?", type: "short_text", required: true },
      { label: "What stage are you at?", type: "single_select", required: true, options: ["Idea", "MVP", "Revenue", "Scaling"] },
      { label: "Share your website or deck link.", type: "url", required: false },
      { label: "How should we contact you?", type: "email", required: true },
      { label: "How strong is your current traction?", type: "rating", required: false },
    ],
  },
  {
    slug: "event-rsvp",
    title: "Event RSVP",
    category: "Community",
    description: "Collect attendance, guest needs, food preferences, and quick notes.",
    fields: 5,
    theme: "Minimal Luxury",
    themeValue: "minimal_luxury",
    questions: [
      { label: "Your full name", type: "short_text", required: true },
      { label: "Will you attend?", type: "yes_no", required: true },
      { label: "How many guests are joining you?", type: "number", required: false },
      { label: "Dietary preferences", type: "multi_select", required: false, options: ["Vegetarian", "Vegan", "Gluten-free", "No preference"] },
      { label: "Anything we should know?", type: "long_text", required: false },
    ],
  },
  {
    slug: "product-feedback",
    title: "Product Feedback",
    category: "SaaS",
    description: "Measure product sentiment, feature fit, and the clearest improvement path.",
    fields: 6,
    theme: "Ocean Flow",
    themeValue: "ocean_flow",
    questions: [
      { label: "Which product area did you use?", type: "single_select", required: true, options: ["Dashboard", "Builder", "Analytics", "Sharing"] },
      { label: "How satisfied are you?", type: "rating", required: true },
      { label: "What felt most useful?", type: "long_text", required: false },
      { label: "What slowed you down?", type: "long_text", required: false },
      { label: "Can we follow up by email?", type: "email", required: false },
      { label: "Would you recommend this?", type: "yes_no", required: true },
    ],
  },
  {
    slug: "client-onboarding",
    title: "Client Onboarding",
    category: "Agency",
    description: "Capture goals, brand context, timelines, files, and decision makers.",
    fields: 6,
    theme: "Cosmic Dark",
    themeValue: "cosmic_dark",
    questions: [
      { label: "Company name", type: "short_text", required: true },
      { label: "What outcome do you want from this project?", type: "long_text", required: true },
      { label: "Primary project type", type: "single_select", required: true, options: ["Brand", "Website", "Campaign", "Product design"] },
      { label: "Target launch date", type: "date", required: false },
      { label: "Who approves the final work?", type: "short_text", required: false },
      { label: "Share a reference URL.", type: "url", required: false },
    ],
  },
  {
    slug: "hiring-screen",
    title: "Hiring Screen",
    category: "People",
    description: "A quick first pass for fit, availability, experience, and portfolio links.",
    fields: 6,
    theme: "Cyber Neon",
    themeValue: "cyber_neon",
    questions: [
      { label: "Candidate name", type: "short_text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Role you are applying for", type: "single_select", required: true, options: ["Frontend", "Backend", "Design", "Product"] },
      { label: "Years of relevant experience", type: "number", required: false },
      { label: "Portfolio or LinkedIn URL", type: "url", required: false },
      { label: "Why are you interested?", type: "long_text", required: true },
    ],
  },
  {
    slug: "research-survey",
    title: "Research Survey",
    category: "UXR",
    description: "Recruit participants and learn about behavior, context, and product expectations.",
    fields: 6,
    theme: "Sunset Studio",
    themeValue: "sunset_studio",
    questions: [
      { label: "Which best describes you?", type: "single_select", required: true, options: ["Founder", "Operator", "Designer", "Developer", "Student"] },
      { label: "How often do you create forms?", type: "single_select", required: true, options: ["Daily", "Weekly", "Monthly", "Rarely"] },
      { label: "What tools do you use today?", type: "multi_select", required: false, options: ["Google Forms", "Typeform", "Tally", "Airtable", "Custom tools"] },
      { label: "What is missing from your current workflow?", type: "long_text", required: false },
      { label: "Would you join a 30-minute interview?", type: "yes_no", required: true },
      { label: "Best email for scheduling", type: "email", required: false },
    ],
  },
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



export const checks = Check;
export const chartIcon = ChartNoAxesCombined;
