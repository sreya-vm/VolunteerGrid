"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOpportunities,
  applyForOpportunity,
} from "@/lib/api";

type Opportunity = {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  capacity?: number;
  organization?: string;
  category?: string;
};

type Project = {
  id: number;
  category: string;
  title: string;
  description: string;
  organization: string;
  location: string;
  date: string;
  capacity?: number;
};

function Icon({
  name,
  size = 20,
}: {
  name:
    | "dashboard"
    | "opportunities"
    | "impact"
    | "settings"
    | "search"
    | "filter"
    | "bell"
    | "chevron"
    | "arrow"
    | "clock"
    | "users"
    | "location"
    | "check";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "opportunities":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );

    case "impact":
      return (
        <svg {...common}>
          <path d="M4 19V9" />
          <path d="M10 19V5" />
          <path d="M16 19v-7" />
          <path d="M22 19V3" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.41-1.41.06.06A1.7 1.7 0 0 0 12.35 8.05 1.7 1.7 0 0 0 13.38 6.5V6h2v.5a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.41 1.41-.06.06A1.7 1.7 0 0 0 19.4 11a1.7 1.7 0 0 0 1.56 1.03H21v2h-.04A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "filter":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "location":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
  }
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 7L12 12L17 7"
            stroke="#06B6D4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 17L12 12L17 17"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="7" r="2" fill="#06B6D4" />
          <circle cx="17" cy="7" r="2" fill="#06B6D4" />
          <circle cx="12" cy="12" r="2.5" fill="#4F46E5" />
          <circle cx="7" cy="17" r="2" fill="#4F46E5" />
          <circle cx="17" cy="17" r="2" fill="#4F46E5" />
        </svg>
      </div>

      <span className="text-lg font-bold tracking-[-0.03em] text-white">
        Volunteer<span className="text-cyan-400">Grid</span>
      </span>
    </div>
  );
}

function Sidebar() {
  const navigation = [
    { label: "Dashboard", icon: "dashboard" as const, active: true },
    {
      label: "Opportunities",
      icon: "opportunities" as const,
      active: false,
    },
    {
      label: "Impact Tracking",
      icon: "impact" as const,
      active: false,
    },
    {
      label: "Settings",
      icon: "settings" as const,
      active: false,
    },
  ];

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-800/80 bg-[#0B0F19] lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-slate-800/60 px-6">
        <Logo />
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 px-3 py-6"
      >
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Workspace
        </p>

        {navigation.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              item.active
                ? "bg-slate-800/80 text-white"
                : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-200"
            }`}
          >
            <span
              className={
                item.active
                  ? "text-cyan-400"
                  : "text-slate-600 group-hover:text-slate-300"
              }
            >
              <Icon name={item.icon} size={18} />
            </span>

            {item.label}

            {item.active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Header({
  search,
  setSearch,
  username,
}: {
  search: string;
  setSearch: (value: string) => void;
  username: string;
}) {
  /*
   * IMPORTANT:
   * Do not use toLocaleDateString() here.
   *
   * The server and browser can have different locales,
   * which causes a hydration mismatch.
   *
   * We use a fixed English locale instead.
   */
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="flex flex-col gap-5 border-b border-slate-800/60 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
      <div>
        <p className="text-xs font-medium text-slate-500">
          {formattedDate}
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
          {username || "Welcome"} <span className="ml-1">👋</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:w-72 lg:w-80">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
            <Icon name="search" size={17} />
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search opportunities..."
            aria-label="Search opportunities"
            className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        <button
          type="button"
          aria-label="Filter opportunities"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-500 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
        >
          <Icon name="filter" size={17} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-500 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200 sm:flex"
        >
          <Icon name="bell" size={17} />
        </button>

        <button
          type="button"
          aria-label="Open user profile"
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-2 hover:border-slate-700 hover:bg-slate-800"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-[11px] font-bold text-white">
            {username
              ? username
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "?"}
          </span>

          <span className="hidden text-xs font-semibold text-slate-300 md:block">
            {username || "User"}
          </span>

          <span className="hidden text-slate-600 md:block">
            <Icon name="chevron" size={14} />
          </span>
        </button>
      </div>
    </header>
  );
}

function Metrics({
  joinedCount,
}: {
  joinedCount: number;
}) {
  return (
    <section
      aria-label="Volunteer statistics"
      className="grid gap-4 md:grid-cols-3"
    >
      <article className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <p className="text-xs font-medium text-slate-500">
          Active Projects
        </p>

        <p className="mt-2 text-3xl font-bold text-white">
          {joinedCount}
        </p>

        <p className="mt-2 text-[11px] text-slate-600">
          Projects you have joined
        </p>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <p className="text-xs font-medium text-slate-500">
          Available Opportunities
        </p>

        <p className="mt-2 text-3xl font-bold text-white">
          —
        </p>

        <p className="mt-2 text-[11px] text-slate-600">
          Data not provided by the current API
        </p>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <p className="text-xs font-medium text-slate-500">
          Impact
        </p>

        <p className="mt-2 text-3xl font-bold text-white">
          —
        </p>

        <p className="mt-2 text-[11px] text-slate-600">
          Data not provided by the current API
        </p>
      </article>
    </section>
  );
}

function OpportunityCard({
  project,
  joined,
  joining,
  onJoin,
}: {
  project: Project;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] transition-all duration-200 hover:-translate-y-1 hover:border-slate-700">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-indigo-300">
            {project.category}
          </span>

          {project.location && (
            <span className="flex items-center gap-1 text-[10px] text-slate-600">
              <Icon name="location" size={12} />
              {project.location}
            </span>
          )}
        </div>

        <h2 className="mt-5 text-lg font-bold tracking-[-0.025em] text-white">
          {project.title}
        </h2>

        <p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-500">
          {project.description}
        </p>

        {project.capacity !== undefined && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[10px]">
              <span className="font-medium text-slate-500">
                Capacity
              </span>

              <span className="font-semibold text-cyan-400">
                {project.capacity}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          {project.date && (
            <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <Icon name="clock" size={13} />
              {project.date}
            </span>
          )}

          {project.organization && (
            <span className="text-[10px] font-medium text-slate-600">
              {project.organization}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onJoin}
          disabled={joined || joining}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
            joined
              ? "cursor-default border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
              : joining
                ? "cursor-wait border-slate-700 bg-slate-800/50 text-slate-500"
                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
          }`}
        >
          {joined ? (
            <>
              <Icon name="check" size={14} />
              Joined Project
            </>
          ) : joining ? (
            "Joining..."
          ) : (
            <>
              Join Project
              <Icon name="arrow" size={14} />
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<number[]>([]);
  const [joiningProjects, setJoiningProjects] = useState<number[]>([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");

    if (storedUsername) {
      setUsername(storedUsername);
    }

    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const data = await getOpportunities(token);

      setOpportunities(data);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
      setError("Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  const projects: Project[] = useMemo(() => {
    return opportunities.map((opportunity) => ({
      id: opportunity.id,
      category: opportunity.category ?? "",
      title: opportunity.title,
      description: opportunity.description,
      organization: opportunity.organization ?? "",
      location: opportunity.location ?? "",
      date: opportunity.date
        ? new Intl.DateTimeFormat("en-US").format(
            new Date(opportunity.date),
          )
        : "",
      capacity: opportunity.capacity,
    }));
  }, [opportunities]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) =>
      [
        project.title,
        project.description,
        project.category,
        project.organization,
        project.location,
        project.date,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, projects]);

  const handleJoin = async (projectId: number) => {
    if (
      joinedProjects.includes(projectId) ||
      joiningProjects.includes(projectId)
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      setJoiningProjects((current) => [
        ...current,
        projectId,
      ]);

      setError("");

      await applyForOpportunity(projectId, token);

      setJoinedProjects((current) =>
        current.includes(projectId)
          ? current
          : [...current, projectId],
      );
    } catch (err) {
      console.error("Failed to apply:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to join this opportunity.",
      );
    } finally {
      setJoiningProjects((current) =>
        current.filter((id) => id !== projectId),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans text-slate-200">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <Header
            search={search}
            setSearch={setSearch}
            username={username}
          />

          <div className="relative px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            <div className="relative mx-auto max-w-[1600px]">
              <Metrics
                joinedCount={joinedProjects.length}
              />

              {error && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <section
                className="mt-10"
                aria-labelledby="opportunities-heading"
              >
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-500/70">
                      Make an impact
                    </p>

                    <h2
                      id="opportunities-heading"
                      className="mt-1 text-xl font-bold tracking-[-0.035em] text-white"
                    >
                      Opportunities for you
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                      Discover projects where your skills can make a
                      difference.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadOpportunities}
                    className="flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-400"
                  >
                    Refresh
                    <Icon name="arrow" size={14} />
                  </button>
                </div>

                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-[#111827]"
                      />
                    ))}
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <OpportunityCard
                        key={project.id}
                        project={project}
                        joined={joinedProjects.includes(
                          project.id,
                        )}
                        joining={joiningProjects.includes(
                          project.id,
                        )}
                        onJoin={() =>
                          handleJoin(project.id)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#111827]/50">
                    <div className="text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-600">
                        <Icon name="search" size={18} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-400">
                        {search
                          ? "No opportunities found"
                          : "No opportunities available"}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {search
                          ? "Try searching for a different project or category."
                          : "Check back later for new volunteer opportunities."}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}