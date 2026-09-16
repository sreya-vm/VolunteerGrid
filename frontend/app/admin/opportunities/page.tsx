
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdminOpportunities,
  updateAdminOpportunityStatus,
  AdminOpportunity,
} from "@/lib/api";

export default function AdminOpportunitiesPage() {
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function loadOpportunities() {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getAdminOpportunities(token);

      setOpportunities(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load opportunities"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    opportunityId: number,
    newStatus: string
  ) {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      await updateAdminOpportunityStatus(
        opportunityId,
        newStatus,
        token
      );

      await loadOpportunities();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update opportunity status"
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading opportunities...
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
              Failed to load opportunities
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
            Opportunities
          </h2>

          <p className="text-gray-600">
            Monitor volunteer opportunities and their status.
          </p>
        </div>

        {opportunities.length === 0 && (
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <p className="text-gray-600">
              No opportunities found.
            </p>
          </div>
        )}

        {opportunities.length > 0 && (
          <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Title
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Payment
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Location
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Capacity
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {opportunities.map((opportunity) => (
                  <tr
                    key={opportunity.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b px-6 py-4 text-gray-700">
                      {opportunity.id}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700 font-medium">
                      {opportunity.title}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {opportunity.opportunity_type}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {opportunity.payment_type}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {opportunity.location || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {opportunity.date || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {opportunity.capacity ?? "—"}
                    </td>

                    <td className="border-b px-6 py-4">
                      <select
                        value={opportunity.status}
                        onChange={(e) =>
                          handleStatusChange(
                            opportunity.id,
                            e.target.value
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">
                          Draft
                        </option>

                        <option value="published">
                          Published
                        </option>

                        <option value="closed">
                          Closed
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

