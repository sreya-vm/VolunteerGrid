
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdminApplications,
  AdminApplication,
} from "@/lib/api";

export default function AdminApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getAdminApplications(token);

      setApplications(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading applications...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-blue-600">
              VolunteerGrid
            </h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => router.push("/admin")}
            className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Failed to load applications
            </h2>

            <p className="text-gray-600">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            VolunteerGrid
          </h1>

          <span className="text-gray-600">
            Admin Dashboard
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/admin")}
          className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Applications
          </h2>

          <p className="text-gray-600">
            View volunteer applications across the platform.
          </p>
        </div>

        {applications.length === 0 && (
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <p className="text-gray-600">
              No applications found.
            </p>
          </div>
        )}

        {applications.length > 0 && (
          <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Application ID
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Opportunity
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Volunteer
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Applied At
                  </th>
                </tr>
              </thead>

              <tbody>
                {applications.map((application) => {
                  const status =
                    application.status.toLowerCase();

                  return (
                    <tr
                      key={application.application_id}
                      className="hover:bg-gray-50"
                    >
                      <td className="border-b px-6 py-4 text-gray-700">
                        {application.application_id}
                      </td>

                      <td className="border-b px-6 py-4 text-gray-700">
                        {application.opportunity_title || "—"}
                      </td>

                      <td className="border-b px-6 py-4 text-gray-700">
                        {application.volunteer_name || "—"}
                      </td>

                      <td className="border-b px-6 py-4 text-gray-700">
                        {application.volunteer_email || "—"}
                      </td>

                      <td className="border-b px-6 py-4">
                        {status === "pending" ? (
                          <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                            {application.status}
                          </span>
                        ) : status === "approved" ? (
                          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                            {application.status}
                          </span>
                        ) : status === "rejected" ? (
                          <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                            {application.status}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                            {application.status}
                          </span>
                        )}
                      </td>

                      <td className="border-b px-6 py-4 text-gray-700">
                        {new Date(
                          application.applied_at
                        ).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

