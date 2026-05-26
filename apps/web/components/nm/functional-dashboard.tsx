"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { RouterOutputs } from "@repo/trpc/client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Download,
  Eye,
  FileText,
  Leaf,
  Link2,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  QrCode,
  Search,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { trpc } from "~/trpc/client";
import { GlassPanel } from "./ui-blocks";
import { getFormTheme } from "./themes";

const chartConfig = {
  responses: {
    label: "Responses",
    color: "#86efac",
  },
} satisfies ChartConfig;

const formsPageSize = 10;

function buildFormUrl(slug: string) {
  if (typeof window === "undefined") {
    return `/form/${slug}`;
  }

  return `${window.location.origin}/form/${slug}`;
}

function buildQrCodeUrl(slug: string) {
  const url = buildFormUrl(slug);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(url)}`;
}

function escapeCsv(value: string | number | null | undefined) {
  const normalized = String(value ?? "");
  return `"${normalized.replace(/"/g, '""')}"`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NM";
}

function getExpiryLabel(expiresAt?: string | null) {
  if (!expiresAt) return "No expiry set";

  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";

  const minutes = Math.ceil(diff / (1000 * 60));
  if (minutes < 60) return `Expires in ${minutes} min`;

  const hours = Math.ceil(minutes / 60);
  if (hours < 48) return `Expires in ${hours} hr`;

  const days = Math.ceil(hours / 24);
  return `Expires in ${days} days`;
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeSearchText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[-_/.,:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type DashboardTab = "overview" | "forms" | "responses" | "share";
type VisibilityTab = "unlisted" | "public";
type UserForm = RouterOutputs["form"]["getAllFormsByUserId"][number];

export function FunctionalDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const me = trpc.auth.getLogedInUser.useQuery({}, { retry: false });
  const formsQuery = trpc.form.getAllFormsByUserId.useQuery(
    {},
    { enabled: Boolean(me.data), retry: false },
  );
  const forms = useMemo(
    () =>
      [...(formsQuery.data ?? [])].sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime(),
      ),
    [formsQuery.data],
  );
  const [activeFormId, setActiveFormId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [visibilityTab, setVisibilityTab] = useState<VisibilityTab>("unlisted");
  const [formsPage, setFormsPage] = useState(1);
  const [formPendingDelete, setFormPendingDelete] = useState<UserForm | null>(null);
  const [formsSearch, setFormsSearch] = useState("");
  const [responseFormSearch, setResponseFormSearch] = useState("");
  const [responsePickerOpen, setResponsePickerOpen] = useState(false);
  const [shareSearch, setShareSearch] = useState("");

  const activeForm = forms.find((form) => form.id === activeFormId) ?? forms[0];
  const publicForms = useMemo(() => forms.filter((form) => form.visibility === "public"), [forms]);
  const unlistedForms = useMemo(() => forms.filter((form) => form.visibility === "unlisted"), [forms]);
  const publishedUnlistedForms = useMemo(
    () =>
      forms.filter(
        (form) =>
          form.visibility === "unlisted" &&
          form.status === "published" &&
          form.isPublished,
      ),
    [forms],
  );
  const recentForms = useMemo(() => forms.slice(0, 5), [forms]);
  const getSearchableFormText = (form: UserForm) => {
    const theme = getFormTheme(form.theme);
    const publishState = form.isPublished ? "published live" : "draft unpublished";

    return normalizeSearchText([
      form.title,
      form.slug,
      form.description,
      form.status,
      form.visibility,
      publishState,
      theme.label,
      theme.description,
      `${form.responseCount} response responses`,
      getExpiryLabel(form.expiresAt),
      formatDate(form.expiresAt),
      formatDate(form.createdAt),
      formatDate(form.updatedAt),
    ].join(" "));
  };
  const matchesSearch = (form: UserForm, search: string) => {
    const query = normalizeSearchText(search);
    if (!query) return true;

    const haystack = getSearchableFormText(form);
    return query.split(" ").every((token) => haystack.includes(token));
  };
  const listedForms = (visibilityTab === "public" ? publicForms : unlistedForms).filter((form) =>
    matchesSearch(form, formsSearch),
  );
  const allFormsSearchMatches = forms.filter((form) => matchesSearch(form, formsSearch)).length;
  const responsePickerForms = forms.filter((form) => matchesSearch(form, responseFormSearch));
  const filteredPublishedUnlistedForms = publishedUnlistedForms.filter((form) =>
    matchesSearch(form, shareSearch),
  );
  const totalFormPages = Math.max(1, Math.ceil(listedForms.length / formsPageSize));
  const paginatedForms = listedForms.slice(
    (formsPage - 1) * formsPageSize,
    formsPage * formsPageSize,
  );

  useEffect(() => {
    const queryFormId = searchParams.get("formId");
    if (queryFormId && forms.some((form) => form.id === queryFormId)) {
      setActiveFormId(queryFormId);
      return;
    }

    if (!activeFormId && forms[0]) {
      setActiveFormId(forms[0].id);
    }
  }, [activeFormId, forms, searchParams]);

  useEffect(() => {
    if (formsPage > totalFormPages) {
      setFormsPage(totalFormPages);
    }
  }, [formsPage, totalFormPages]);

  useEffect(() => {
    setFormsPage(1);
  }, [formsSearch]);

  const responsesQuery = trpc.response.getResponsesByFormId.useQuery(
    { formId: activeForm?.id ?? "" },
    { enabled: Boolean(me.data && activeForm?.id), retry: false },
  );
  const responseDetailsQuery = trpc.response.getResponseDetailsByFormId.useQuery(
    { formId: activeForm?.id ?? "" },
    { enabled: Boolean(me.data && activeForm?.id), retry: false },
  );

  const publishForm = trpc.form.editForm.useMutation();
  const deleteForm = trpc.form.deleteForm.useMutation();
  const createLink = trpc.formLink.createFormLink.useMutation();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.getLogedInUser.invalidate();
      toast.success("Logged out successfully.", {
        className: "nm-toast",
        description: "Your session has been closed.",
      });
      router.replace("/login");
    },
    onError: (error) => {
      toast.error("Could not log out.", {
        className: "nm-toast",
        description: error.message,
      });
    },
  });

  const responses = useMemo(() => responsesQuery.data ?? [], [responsesQuery.data]);
  const responseDetails = responseDetailsQuery.data;
  const responseTrend = useMemo(() => {
    const counts = new Map<string, number>();

    for (const response of responses) {
      const day = new Date(response.submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([day, total]) => ({
      day,
      responses: total,
    }));
  }, [responses]);

  const formBars = useMemo(
    () =>
      forms.slice(0, 8).map((form) => ({
        title: form.title.length > 16 ? `${form.title.slice(0, 16)}...` : form.title,
        responses: form.responseCount,
      })),
    [forms],
  );
  const responseRows = useMemo(() => {
    if (!responseDetails) return [];

    return responseDetails.responses.map((item) => {
      const answers = new Map(item.answers.map((answer) => [answer.fieldId, answer.value]));
      return {
        response: item.response,
        answers,
      };
    });
  }, [responseDetails]);

  const stats = [
    { label: "Live forms", value: forms.length, icon: FileText },
    { label: "Responses", value: forms.reduce((sum, form) => sum + form.responseCount, 0), icon: MessageSquare },
    { label: "Published", value: forms.filter((form) => form.isPublished).length, icon: Send },
    { label: "Unlisted links", value: publishedUnlistedForms.length, icon: Link2 },
  ];

  async function copyFormLink(form: UserForm) {
    try {
      if (form.visibility === "unlisted") {
        await createLink.mutateAsync({ formId: form.id });
      }

      await navigator.clipboard.writeText(buildFormUrl(form.slug));
      toast.success("Link copied.", {
        className: "nm-toast",
        description: `${form.title} is ready to share.`,
      });
    } catch (error) {
      toast.error("Could not copy link.", {
        className: "nm-toast",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function publishSelectedForm(form: UserForm) {
    try {
      const updated = await publishForm.mutateAsync({
        id: form.id,
        status: "published",
        isPublished: true,
      });
      setActiveFormId(updated.id);
      await utils.form.getAllFormsByUserId.invalidate();
      await utils.explore.explorePublicForms.invalidate();
      toast.success("Form published.", {
        className: "nm-toast",
        description: `${updated.title} is now live.`,
      });
    } catch (error) {
      toast.error("Could not publish form.", {
        className: "nm-toast",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function unpublishSelectedForm(form: UserForm) {
    try {
      const updated = await publishForm.mutateAsync({
        id: form.id,
        status: "draft",
        isPublished: false,
      });
      setActiveFormId(updated.id);
      await utils.form.getAllFormsByUserId.invalidate();
      await utils.explore.explorePublicForms.invalidate();
      toast.success("Form unpublished.", {
        className: "nm-toast",
        description: `${updated.title} is no longer accepting public responses.`,
      });
    } catch (error) {
      toast.error("Could not unpublish form.", {
        className: "nm-toast",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function deleteSelectedForm(form: UserForm) {
    try {
      await deleteForm.mutateAsync({ id: form.id });
      setActiveFormId("");
      await utils.form.getAllFormsByUserId.invalidate();
      toast.success("Form deleted.", {
        className: "nm-toast",
        description: `${form.title} was removed from your dashboard.`,
      });
    } catch (error) {
      toast.error("Could not delete form.", {
        className: "nm-toast",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  function exportCsv() {
    const details = responseDetailsQuery.data;
    if (!details || !activeForm) return;

    const headers = ["response_id", "submitted_at", ...details.fields.map((field) => field.label)];
    const rows = details.responses.map((item) => {
      const answers = new Map(item.answers.map((answer) => [answer.fieldId, answer.value]));
      return [
        item.response.id,
        item.response.submittedAt,
        ...details.fields.map((field) => answers.get(field.id) ?? ""),
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeForm.slug}-responses.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.", {
      className: "nm-toast",
      description: `${activeForm.title} responses were downloaded.`,
    });
  }

  function renderFormRow(form: UserForm) {
    const theme = getFormTheme(form.theme);
    const isActive = activeForm?.id === form.id;

    return (
      <div
        className={`grid gap-3 rounded-lg border p-3 transition lg:grid-cols-[1.4fr_0.75fr_0.8fr_0.8fr_0.9fr_auto] lg:items-center ${
          isActive
            ? "border-emerald-500/45 bg-emerald-300/16 dark:border-emerald-300/45 dark:bg-emerald-300/10"
            : "border-emerald-900/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.06]"
        }`}
        key={form.id}
      >
        <button
          className="min-w-0 text-left"
          onClick={() => setActiveFormId(form.id)}
          type="button"
        >
          <p className="truncate font-semibold text-emerald-950 dark:text-white">{form.title}</p>
          <p className="mt-1 truncate text-xs text-emerald-900/55 dark:text-emerald-50/55">{form.slug}</p>
        </button>
        <p className="text-sm text-emerald-900/70 dark:text-emerald-50/70">{theme.label}</p>
        <p className="text-sm capitalize text-emerald-900/70 dark:text-emerald-50/70">{form.status}</p>
        <p className="text-sm text-emerald-900/70 dark:text-emerald-50/70">{form.responseCount} responses</p>
        <div>
          <p className={`text-sm ${getExpiryLabel(form.expiresAt) === "Expired" ? "text-red-600 dark:text-red-200" : "text-emerald-900/70 dark:text-emerald-50/70"}`}>
            {getExpiryLabel(form.expiresAt)}
          </p>
          <p className="mt-1 text-xs text-emerald-900/45 dark:text-emerald-50/45">{formatDate(form.expiresAt)}</p>
        </div>
        <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
          <Button className="nm-button-glass" onClick={() => void copyFormLink(form)} size="icon" type="button" variant="outline">
            <Copy className="size-4" />
          </Button>
          <Button className="nm-button-glass" asChild size="icon" variant="outline">
            <Link href={`/form/${form.slug}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button className="nm-button-glass" asChild size="icon" variant="outline">
            <Link href={`/builder?formId=${form.id}`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="nm-button-glass" size="icon" type="button" variant="outline">
                <QrCode className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-72 border-emerald-900/10 bg-white/96 p-4 text-emerald-950 shadow-2xl dark:border-white/10 dark:bg-[#07140d]/96 dark:text-emerald-50"
            >
              <p className="font-semibold">Share QR code</p>
              <p className="mt-1 break-all text-xs text-emerald-900/56 dark:text-emerald-50/56">{buildFormUrl(form.slug)}</p>
              <img
                alt={`QR code for ${form.title}`}
                className="mx-auto mt-4 size-48 rounded-lg border border-emerald-900/10 bg-white p-2"
                src={buildQrCodeUrl(form.slug)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

  function renderRecentFormCard(form: UserForm) {
    const theme = getFormTheme(form.theme);
    const ThemeIcon = theme.icon;
    const isExpired = getExpiryLabel(form.expiresAt) === "Expired";

    return (
      <button
        className="group rounded-lg border border-emerald-900/10 bg-white/74 p-4 text-left transition hover:border-emerald-500/35 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-emerald-300/35 dark:hover:bg-white/[0.09]"
        key={form.id}
        onClick={() => {
          setActiveFormId(form.id);
          setActiveTab("forms");
          setVisibilityTab(form.visibility);
        }}
        type="button"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-300/16 text-emerald-700 dark:text-emerald-200">
            <ThemeIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-emerald-950 dark:text-white">
                {form.title}
              </h3>
              <span className="rounded-full border border-emerald-900/10 bg-emerald-50 px-2.5 py-1 text-[11px] capitalize text-emerald-900/62 dark:border-white/10 dark:bg-black/20 dark:text-emerald-50/62">
                {form.visibility}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-emerald-900/56 dark:text-emerald-50/56">
              {theme.label} - {form.responseCount} responses
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className={isExpired ? "text-red-600 dark:text-red-200" : "text-emerald-700 dark:text-emerald-200"}>
                {getExpiryLabel(form.expiresAt)}
              </span>
              <span className="text-emerald-900/32 dark:text-emerald-50/32">/</span>
              <span className="text-emerald-900/50 dark:text-emerald-50/50">
                Updated {formatDate(form.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  if (me.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-emerald-200" />
      </div>
    );
  }

  if (!me.data) {
    return (
      <GlassPanel className="p-6">
        <p className="text-sm text-emerald-900/72 dark:text-emerald-50/72">Sign in to open your protected dashboard.</p>
      </GlassPanel>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <GlassPanel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="group flex items-center gap-3" href="/">
            <span className="flex size-11 items-center justify-center rounded-lg border border-emerald-300/25 bg-emerald-300/16 shadow-[0_0_28px_rgba(74,222,128,0.22)]">
              <Leaf className="size-5 text-emerald-600 transition-transform group-hover:rotate-12 dark:text-emerald-200" />
            </span>
            <div>
              <p className="font-semibold text-emerald-950 dark:text-white">NM Forms</p>
              <p className="text-xs text-emerald-900/55 dark:text-emerald-50/55">Dashboard</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" asChild>
              <Link href="/builder">
                <Plus className="size-4" />
                New form
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full border border-emerald-900/10 bg-white/70 p-1 transition hover:border-emerald-500/40 dark:border-white/10 dark:bg-white/[0.08]"
                  type="button"
                >
                  <Avatar className="size-10">
                    <AvatarImage src={me.data.profileImageUrl ?? undefined} alt={me.data.fullName} />
                    <AvatarFallback className="bg-emerald-300 text-sm font-semibold text-emerald-950">
                      {getInitials(me.data.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 border-emerald-900/10 bg-white/95 p-2 text-emerald-950 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#07140d]/95 dark:text-emerald-50"
              >
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={me.data.profileImageUrl ?? undefined} alt={me.data.fullName} />
                      <AvatarFallback className="bg-emerald-300 font-semibold text-emerald-950">
                        {getInitials(me.data.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{me.data.fullName}</p>
                      <p className="truncate text-xs font-normal text-emerald-900/58 dark:text-emerald-50/58">{me.data.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid gap-2 p-3 text-sm">
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-50/80 p-3 dark:bg-white/[0.06]">
                    <UserRound className="size-4 text-emerald-600 dark:text-emerald-200" />
                    <div>
                      <p className="font-medium">Profile</p>
                      <p className="text-xs text-emerald-900/56 dark:text-emerald-50/56">Personal workspace owner</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-50/80 p-3 dark:bg-white/[0.06]">
                    <Mail className="size-4 text-emerald-600 dark:text-emerald-200" />
                    <div className="min-w-0">
                      <p className="font-medium">Email</p>
                      <p className="truncate text-xs text-emerald-900/56 dark:text-emerald-50/56">{me.data.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-50/80 p-3 dark:bg-white/[0.06]">
                    <FileText className="size-4 text-emerald-600 dark:text-emerald-200" />
                    <div>
                      <p className="font-medium">Forms created</p>
                      <p className="text-xs text-emerald-900/56 dark:text-emerald-50/56">{forms.length} total forms</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">
                    <UserRound className="size-4" />
                    Open profile page
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-700 focus:bg-red-50 focus:text-red-800 dark:text-red-200 dark:focus:bg-red-500/12 dark:focus:text-red-100"
                  disabled={logout.isPending}
                  onClick={() => logout.mutate()}
                >
                  {logout.isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </GlassPanel>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
        <TabsList className="mx-auto grid h-auto w-full max-w-2xl grid-cols-4 bg-emerald-50/80 p-1 dark:bg-white/[0.06]">
          <TabsTrigger value="overview">
            <BarChart3 className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="forms">
            <FileText className="size-4" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="responses">
            <MessageSquare className="size-4" />
            Responses
          </TabsTrigger>
          <TabsTrigger value="share">
            <Link2 className="size-4" />
            Share
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <GlassPanel className="p-5" key={stat.label}>
                  <Icon className="mb-5 size-6 text-emerald-500 dark:text-emerald-200" />
                  <p className="text-sm text-emerald-900/60 dark:text-emerald-50/60">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                </GlassPanel>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <GlassPanel className="p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Forms</p>
                  <h2 className="mt-1 text-2xl font-semibold">Recently updated</h2>
                </div>
                <Button className="nm-button-glass" onClick={() => setActiveTab("forms")} variant="outline">
                  View all
                </Button>
              </div>
              <div className="grid gap-3">
                {recentForms.length ? (
                  recentForms.map((form) => renderRecentFormCard(form))
                ) : (
                  <p className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 text-sm text-emerald-900/62 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/62">
                    Create your first form to see it here.
                  </p>
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Response analysis</p>
                  <h2 className="mt-1 text-2xl font-semibold">Submission trend</h2>
                </div>
                <Button
                  className="nm-button-glass"
                  disabled={!responseDetailsQuery.data?.responses.length}
                  onClick={exportCsv}
                  variant="outline"
                >
                  <Download className="size-4" />
                  CSV
                </Button>
              </div>
              <ChartContainer className="h-[280px] w-full" config={chartConfig}>
                <LineChart data={responseTrend.length ? responseTrend : [{ day: "No data", responses: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="responses" stroke="var(--color-responses)" strokeWidth={3} type="monotone" />
                </LineChart>
              </ChartContainer>
            </GlassPanel>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <GlassPanel className="p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Forms</p>
                <h2 className="mt-1 text-2xl font-semibold">All created forms</h2>
                <p className="mt-1 text-sm text-emerald-900/56 dark:text-emerald-50/56">Showing 10 forms per page.</p>
              </div>
              {formsQuery.isFetching && <Loader2 className="size-5 animate-spin text-emerald-500 dark:text-emerald-200" />}
            </div>

            <div className="mb-4 grid gap-2">
              <div className="flex items-center gap-3 rounded-lg border border-emerald-900/10 bg-white/72 px-3 dark:border-white/10 dark:bg-white/[0.06]">
                <Search className="size-4 shrink-0 text-emerald-700/60 dark:text-emerald-200/60" />
                <input
                  className="min-h-11 flex-1 bg-transparent text-sm text-emerald-950 outline-none placeholder:text-emerald-900/42 dark:text-white dark:placeholder:text-emerald-50/42"
                  onChange={(event) => setFormsSearch(event.target.value)}
                  placeholder="Search by title, slug, description, status, visibility, theme, date, or responses..."
                  value={formsSearch}
                />
                {formsSearch && (
                  <Button
                    className="h-8 px-2 text-xs"
                    onClick={() => setFormsSearch("")}
                    type="button"
                    variant="ghost"
                  >
                    Clear
                  </Button>
                )}
              </div>
              {formsSearch && (
                <p className="text-xs text-emerald-900/52 dark:text-emerald-50/52">
                  Showing {listedForms.length} {visibilityTab} forms from {allFormsSearchMatches} total matches across title, slug, description, theme, status, date, expiry, and responses.
                </p>
              )}
            </div>

            <Tabs
              value={visibilityTab}
              onValueChange={(value) => {
                setVisibilityTab(value as VisibilityTab);
                setFormsPage(1);
              }}
            >
              <TabsList className="mb-4 w-full bg-emerald-50/70 dark:bg-white/[0.06] sm:w-fit">
                <TabsTrigger value="unlisted">Unlisted ({unlistedForms.length})</TabsTrigger>
                <TabsTrigger value="public">Public ({publicForms.length})</TabsTrigger>
              </TabsList>
              <TabsContent className="grid gap-3" value={visibilityTab}>
                {paginatedForms.length ? (
                  paginatedForms.map((form) => (
                    <div key={form.id}>
                      {renderFormRow(form)}
                      <div className="mt-2 flex flex-wrap justify-end gap-2">
                        {form.isPublished ? (
                          <Button
                            className="nm-button-glass"
                            disabled={publishForm.isPending}
                            onClick={() => void unpublishSelectedForm(form)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Send className="size-4" />
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200"
                            disabled={publishForm.isPending}
                            onClick={() => void publishSelectedForm(form)}
                            size="sm"
                            type="button"
                          >
                            <Send className="size-4" />
                            Publish
                          </Button>
                        )}
                        <Button
                          className="border-red-300/30 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-100"
                          disabled={deleteForm.isPending}
                          onClick={() => setFormPendingDelete(form)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 text-sm text-emerald-900/62 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/62">
                    {formsSearch ? `No ${visibilityTab} forms match your search.` : `No ${visibilityTab} forms yet.`}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-900/10 pt-4 dark:border-white/10">
              <p className="text-sm text-emerald-900/60 dark:text-emerald-50/60">
                Page {formsPage} of {totalFormPages}
              </p>
              <div className="flex gap-2">
                <Button
                  className="nm-button-glass"
                  disabled={formsPage <= 1}
                  onClick={() => setFormsPage((page) => Math.max(1, page - 1))}
                  variant="outline"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  className="nm-button-glass"
                  disabled={formsPage >= totalFormPages}
                  onClick={() => setFormsPage((page) => Math.min(totalFormPages, page + 1))}
                  variant="outline"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="responses" className="mt-6">
          <div className="grid gap-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <GlassPanel className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Response analysis</p>
                    <h2 className="mt-1 text-2xl font-semibold">Submission trend</h2>
                  </div>
                  <Button
                    className="nm-button-glass"
                    disabled={!responseDetailsQuery.data?.responses.length}
                    onClick={exportCsv}
                    variant="outline"
                  >
                    <Download className="size-4" />
                    CSV
                  </Button>
                </div>
                <ChartContainer className="h-[280px] w-full" config={chartConfig}>
                  <LineChart data={responseTrend.length ? responseTrend : [{ day: "No data", responses: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="responses" stroke="var(--color-responses)" strokeWidth={3} type="monotone" />
                  </LineChart>
                </ChartContainer>
              </GlassPanel>

              <GlassPanel className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Form comparison</p>
                <h2 className="mt-1 text-2xl font-semibold">Responses by form</h2>
                <ChartContainer className="mt-4 h-[280px] w-full" config={chartConfig}>
                  <BarChart data={formBars.length ? formBars : [{ title: "No forms", responses: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="title" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="responses" fill="var(--color-responses)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </GlassPanel>
            </div>

            <GlassPanel className="p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Form based analysis</p>
                  <h2 className="mt-1 text-2xl font-semibold">Analyze responses by form</h2>
                  <p className="mt-1 text-sm text-emerald-900/56 dark:text-emerald-50/56">
                    Search and select a form to update the trend, response cards, and CSV export.
                  </p>
                </div>
                <div className="grid gap-3 sm:min-w-[390px]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Popover open={responsePickerOpen} onOpenChange={setResponsePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          className="nm-input h-auto min-h-12 w-full justify-between bg-white/78 px-3 py-2 text-left font-normal text-emerald-950 hover:bg-white/90 dark:bg-black/28 dark:text-white dark:hover:bg-black/34"
                          type="button"
                          variant="outline"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                              {activeForm?.title ?? "Choose a form for CSV"}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-emerald-900/52 dark:text-emerald-50/52">
                              {activeForm
                                ? `${activeForm.responseCount} responses / ${activeForm.visibility} / ${getFormTheme(activeForm.theme).label}`
                                : "Search by title, slug, status, theme, date, or response count"}
                            </span>
                          </span>
                          <ChevronsUpDown className="size-4 shrink-0 opacity-55" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-[min(92vw,520px)] border-emerald-900/10 bg-white/96 p-0 text-emerald-950 shadow-2xl shadow-emerald-950/12 backdrop-blur-xl dark:border-white/10 dark:bg-[#07140d]/96 dark:text-emerald-50"
                      >
                        <div className="border-b border-emerald-900/10 p-3 dark:border-white/10">
                          <div className="flex items-center gap-3 rounded-lg border border-emerald-900/10 bg-emerald-50/70 px-3 dark:border-white/10 dark:bg-white/[0.06]">
                            <Search className="size-4 shrink-0 text-emerald-700/60 dark:text-emerald-200/60" />
                            <input
                              className="min-h-11 flex-1 bg-transparent text-sm text-emerald-950 outline-none placeholder:text-emerald-900/42 dark:text-white dark:placeholder:text-emerald-50/42"
                              onChange={(event) => setResponseFormSearch(event.target.value)}
                              placeholder="Search forms for CSV export..."
                              value={responseFormSearch}
                            />
                          </div>
                          <p className="mt-2 text-xs text-emerald-900/52 dark:text-emerald-50/52">
                            {responsePickerForms.length} of {forms.length} forms match
                          </p>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-2">
                          {responsePickerForms.length ? (
                            responsePickerForms.map((form) => {
                              const theme = getFormTheme(form.theme);
                              const isSelected = activeForm?.id === form.id;

                              return (
                                <button
                                  className={`grid w-full gap-1 rounded-lg px-3 py-3 text-left transition ${
                                    isSelected
                                      ? "bg-emerald-300/20 text-emerald-950 dark:bg-emerald-300/14 dark:text-white"
                                      : "hover:bg-emerald-50 dark:hover:bg-white/[0.06]"
                                  }`}
                                  key={form.id}
                                  onClick={() => {
                                    setActiveFormId(form.id);
                                    setResponseFormSearch("");
                                    setResponsePickerOpen(false);
                                  }}
                                  type="button"
                                >
                                  <span className="flex min-w-0 items-center justify-between gap-3">
                                    <span className="truncate font-semibold">{form.title}</span>
                                    {isSelected && <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-200" />}
                                  </span>
                                  <span className="truncate text-xs text-emerald-900/56 dark:text-emerald-50/56">
                                    {form.slug} / {theme.label}
                                  </span>
                                  <span className="flex flex-wrap gap-2 text-xs text-emerald-900/52 dark:text-emerald-50/52">
                                    <span>{form.responseCount} responses</span>
                                    <span className="capitalize">{form.visibility}</span>
                                    <span>{getExpiryLabel(form.expiresAt)}</span>
                                  </span>
                                </button>
                              );
                            })
                          ) : (
                            <div className="rounded-lg border border-emerald-900/10 bg-emerald-50/70 p-4 text-sm text-emerald-900/62 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/62">
                              No matching forms. Try title, slug, theme, status, visibility, date, or response count.
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button
                      className="h-12 shrink-0 bg-emerald-300 text-emerald-950 hover:bg-emerald-200"
                      disabled={!responseDetails?.responses.length}
                      onClick={exportCsv}
                    >
                      <Download className="size-4" />
                      Download CSV
                    </Button>
                  </div>
                </div>
              </div>

              {activeForm && (
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-700/70 dark:text-emerald-200/65">Selected form</p>
                    <p className="mt-2 truncate font-semibold text-emerald-950 dark:text-white">{activeForm.title}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-700/70 dark:text-emerald-200/65">Responses</p>
                    <p className="mt-2 text-2xl font-semibold">{responses.length}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-700/70 dark:text-emerald-200/65">Fields</p>
                    <p className="mt-2 text-2xl font-semibold">{responseDetails?.fields.length ?? 0}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-700/70 dark:text-emerald-200/65">Expiry</p>
                    <p className="mt-2 text-sm font-semibold">{getExpiryLabel(activeForm.expiresAt)}</p>
                  </div>
                </div>
              )}
            </GlassPanel>

            <GlassPanel className="p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Response records</p>
                  <h2 className="mt-1 text-2xl font-semibold">{activeForm?.title ?? "Selected form"} responses</h2>
                </div>
                {responseDetailsQuery.isFetching && <Loader2 className="size-5 animate-spin text-emerald-500 dark:text-emerald-200" />}
              </div>

              {responseRows.length && responseDetails?.fields.length ? (
                <div className="grid gap-4">
                  {responseRows.map((row, index) => (
                    <article
                      className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.06]"
                      key={row.response.id}
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/10 pb-3 dark:border-white/10">
                        <div>
                          <p className="font-semibold text-emerald-950 dark:text-white">Response {index + 1}</p>
                          <p className="mt-1 text-xs text-emerald-900/55 dark:text-emerald-50/55">
                            {new Date(row.response.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-300/16 px-3 py-1 text-xs text-emerald-800 dark:text-emerald-100">
                          {responseDetails.fields.length} fields
                        </span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {responseDetails.fields.map((field) => (
                          <div
                            className="min-w-0 rounded-lg border border-emerald-900/10 bg-emerald-50/70 p-3 dark:border-white/10 dark:bg-black/20"
                            key={field.id}
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800/62 dark:text-emerald-100/62">
                              {field.label}
                            </p>
                            <p className="mt-2 max-h-28 overflow-y-auto break-words text-sm leading-6 text-emerald-950 dark:text-white">
                              {row.answers.get(field.id) || "Skipped"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 text-sm text-emerald-900/62 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/62">
                  No responses for this form yet. Once users submit, their answers will appear here and in the CSV export.
                </div>
              )}
            </GlassPanel>
          </div>
        </TabsContent>

        <TabsContent value="share" className="mt-6">
          <GlassPanel className="p-5">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">Share links</p>
              <h2 className="mt-1 text-2xl font-semibold">Published unlisted forms</h2>
              <p className="mt-1 text-sm text-emerald-900/56 dark:text-emerald-50/56">
                Copy or open direct links for forms that are published but not public in Explore.
              </p>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-900/10 bg-white/72 px-3 dark:border-white/10 dark:bg-white/[0.06]">
              <Search className="size-4 shrink-0 text-emerald-700/60 dark:text-emerald-200/60" />
              <input
                className="min-h-11 flex-1 bg-transparent text-sm text-emerald-950 outline-none placeholder:text-emerald-900/42 dark:text-white dark:placeholder:text-emerald-50/42"
                onChange={(event) => setShareSearch(event.target.value)}
                placeholder="Search published unlisted links..."
                value={shareSearch}
              />
            </div>

            <div className="grid gap-3">
              {filteredPublishedUnlistedForms.length ? (
                filteredPublishedUnlistedForms.map((form) => (
                  <div
                    className="grid gap-3 rounded-lg border border-emerald-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.06] md:grid-cols-[1fr_auto] md:items-center"
                    key={form.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-emerald-950 dark:text-white">{form.title}</p>
                        <span className="rounded-full border border-emerald-900/10 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-900/62 dark:border-white/10 dark:bg-black/20 dark:text-emerald-50/62">
                          {getExpiryLabel(form.expiresAt)}
                        </span>
                      </div>
                      <p className="mt-2 break-all text-sm text-emerald-900/68 dark:text-emerald-50/68">{buildFormUrl(form.slug)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button className="nm-button-glass" onClick={() => void copyFormLink(form)} variant="outline">
                        <Copy className="size-4" />
                        Copy
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button className="nm-button-glass" variant="outline">
                            <QrCode className="size-4" />
                            QR
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="w-72 border-emerald-900/10 bg-white/96 p-4 text-emerald-950 shadow-2xl dark:border-white/10 dark:bg-[#07140d]/96 dark:text-emerald-50"
                        >
                          <p className="font-semibold">Share QR code</p>
                          <p className="mt-1 break-all text-xs text-emerald-900/56 dark:text-emerald-50/56">{buildFormUrl(form.slug)}</p>
                          <img
                            alt={`QR code for ${form.title}`}
                            className="mx-auto mt-4 size-48 rounded-lg border border-emerald-900/10 bg-white p-2"
                            src={buildQrCodeUrl(form.slug)}
                          />
                        </PopoverContent>
                      </Popover>
                      <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" asChild>
                        <Link href={`/form/${form.slug}`}>
                          <Eye className="size-4" />
                          Open form
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-emerald-900/10 bg-white/70 p-4 text-sm text-emerald-900/62 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/62">
                  {shareSearch ? "No published unlisted links match your search." : "Publish an unlisted form to see its share link here."}
                </div>
              )}
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={Boolean(formPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setFormPendingDelete(null);
        }}
      >
        <AlertDialogContent className="border-emerald-900/10 bg-white text-emerald-950 dark:border-white/10 dark:bg-[#07140d] dark:text-emerald-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this form?</AlertDialogTitle>
            <AlertDialogDescription className="text-emerald-900/62 dark:text-emerald-50/62">
              {formPendingDelete
                ? `"${formPendingDelete.title}" will be removed from your dashboard. This action cannot be undone from here.`
                : "This form will be removed from your dashboard."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="nm-button-glass">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteForm.isPending}
              onClick={() => {
                if (formPendingDelete) {
                  void deleteSelectedForm(formPendingDelete);
                }
                setFormPendingDelete(null);
              }}
            >
              {deleteForm.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
