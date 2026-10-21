"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Opportunity {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  requirements: string | null;
  application_deadline: string | null;
  status: string;
  ngo_id: number;
  ngo_name: string | null;
}

export default function OpportunitiesPage() {
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadOpportunities() {
      try {
        const response = await fetch(
          `${API_URL}/volunteer/events`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("token_type");
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Failed to load opportunities."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from server.");
        }

        setOpportunities(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load opportunities."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOpportunities();
  }, [router]);

  async function applyForOpportunity(id: number) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/volunteer/events/${id}/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to register for this event."
        );
      }

      alert("Successfully registered for this event!");

    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to register for this event."
      );
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    router.push("/login");
  }

  function formatDate(value: string | null) {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(value: string | null) {
    if (!value) return "";

    // Handles values such as "10:00:00"
    return value.substring(0, 5);
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/volunteer"
            className="text-2xl font-bold text-blue-600"
          >
            VolunteerGrid
          </Link>

          <div className="flex items-center gap-5">

            <Link
              href="/volunteer"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Logout
            </button>

          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        <Link
          href="/volunteer"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-5">
          <h1 className="text-3xl font-bold text-slate-900">
            Volunteer Opportunities
          </h1>

          <p className="mt-2 text-slate-600">
            Discover events and opportunities where you can make a
            difference.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">
              Loading opportunities...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

            <h2 className="text-lg font-semibold text-red-800">
              Unable to load opportunities
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          opportunities.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="text-5xl">
                🌱
              </div>

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                No opportunities available
              </h2>

              <p className="mt-2 text-slate-600">
                There are currently no published volunteer events.
                Please check again later.
              </p>

            </div>
          )}

        {/* Opportunities */}
        {!loading &&
          !error &&
          opportunities.length > 0 && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* Status */}
                  <div className="flex items-center justify-between">

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase text-green-700">
                      {opportunity.status}
                    </span>

                    {opportunity.capacity !== null && (
                      <span className="text-xs text-slate-500">
                        Capacity: {opportunity.capacity}
                      </span>
                    )}

                  </div>

                  {/* Title */}
                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    {opportunity.title}
                  </h2>

                  {/* NGO */}
                  {opportunity.ngo_name && (
                    <p className="mt-1 text-sm font-medium text-blue-600">
                      Organized by {opportunity.ngo_name}
                    </p>
                  )}

                  {/* Description */}
                  {opportunity.description && (
                    <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
                      {opportunity.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDate(opportunity.date)}
                      </p>
                    </div>

                    {(opportunity.start_time ||
                      opportunity.end_time) && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Time
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {formatTime(opportunity.start_time)}

                          {opportunity.start_time &&
                            opportunity.end_time &&
                            " - "}

                          {formatTime(opportunity.end_time)}
                        </p>
                      </div>
                    )}

                    {opportunity.location && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Location
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {opportunity.location}
                        </p>
                      </div>
                    )}

                    {opportunity.requirements && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Requirements
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {opportunity.requirements}
                        </p>
                      </div>
                    )}

                    {opportunity.application_deadline && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Application Deadline
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {formatDate(
                            opportunity.application_deadline
                          )}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Apply */}
                  <button
                    onClick={() =>
                      applyForOpportunity(opportunity.id)
                    }
                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Apply Now
                  </button>

                </div>
              ))}

            </div>
          )}

      </div>
    </main>
  );
}