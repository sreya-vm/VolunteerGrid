"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

interface Activity {
  application_id: number;
  opportunity_id: number;
  opportunity_title: string;
  opportunity_description?: string;
  opportunity_type?: string;
  location?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  application_status: string;
}

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchApplications() {
      try {
        const response = await fetch(
          `${API_URL}/volunteer/activities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("token_type");
          router.push("/login");
          return;
        }

        if (response.status === 404) {
          setProfileMissing(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load applications.");
        }

        const data = await response.json();

        setApplications(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load applications."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    router.push("/login");
  }

  function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case "approved":
      case "accepted":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
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

      {/* Page */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/volunteer"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            My Applications
          </h1>

          <p className="mt-2 text-slate-600">
            Track the opportunities you have applied for.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">
              Loading your applications...
            </p>
          </div>
        )}

        {/* Volunteer profile missing */}
        {!loading && profileMissing && (
          <div className="rounded-2xl border border-blue-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              👤
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              Volunteer profile not set up
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              You need a volunteer profile before you can view your
              applications and activities.
            </p>

            <Link
              href="/volunteer"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Go to Volunteer Dashboard
            </Link>
          </div>
        )}

        {/* Error */}
        {!loading && !profileMissing && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load applications
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

        {/* Empty state */}
        {!loading &&
          !profileMissing &&
          !error &&
          applications.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                📋
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-900">
                No applications yet
              </h2>

              <p className="mt-2 text-slate-600">
                You haven't applied for any volunteer opportunities yet.
              </p>

              <Link
                href="/volunteer/opportunities"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Find Opportunities
              </Link>
            </div>
          )}

        {/* Applications */}
        {!loading &&
          !profileMissing &&
          !error &&
          applications.length > 0 && (
            <div className="space-y-5">
              {applications.map((application) => (
                <div
                  key={application.application_id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {application.opportunity_title}
                      </h2>

                      {application.opportunity_description && (
                        <p className="mt-2 text-slate-600">
                          {application.opportunity_description}
                        </p>
                      )}
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                          application.application_status
                        )}`}
                      >
                        {application.application_status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    {application.opportunity_type && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Type
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {application.opportunity_type}
                        </p>
                      </div>
                    )}

                    {application.location && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Location
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {application.location}
                        </p>
                      </div>
                    )}

                    {application.date && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Date
                        </p>
                        <p className="mt-1 font-medium text-slate-800">
                          {application.date}
                        </p>
                      </div>
                    )}

                    {(application.start_time ||
                      application.end_time) && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Time
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {application.start_time || ""}
                          {application.start_time &&
                          application.end_time
                            ? " - "
                            : ""}
                          {application.end_time || ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}