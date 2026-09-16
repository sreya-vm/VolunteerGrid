"use client";

import { useEffect, useState } from "react";
import {
  getAdminNGOs,
  approveAdminNGO,
  rejectAdminNGO,
  AdminNGO,
} from "@/lib/api";

export default function AdminNGOsPage() {
  const [ngos, setNGOs] = useState<AdminNGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [success, setSuccess] = useState("");

  async function loadNGOs() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getAdminNGOs(token);
      setNGOs(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load NGOs"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNGOs();
  }, []);

  async function handleApprove(ngoId: number) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setActionLoading(ngoId);
      setError("");
      setSuccess("");

      const result = await approveAdminNGO(
        ngoId,
        token
      );

      setSuccess(
        result?.message || "NGO approved successfully."
      );

      await loadNGOs();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to approve NGO"
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(ngoId: number) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reject this NGO?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(ngoId);
      setError("");
      setSuccess("");

      const result = await rejectAdminNGO(
        ngoId,
        token
      );

      setSuccess(
        result?.message || "NGO rejected successfully."
      );

      await loadNGOs();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reject NGO"
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              VolunteerGrid
            </h1>

            <p className="text-sm text-gray-500">
              Admin • NGO Management
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = "/admin";
            }}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            NGO Management
          </h2>

          <p className="text-gray-600 mt-1">
            Review and manage registered NGOs.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <p className="text-gray-600">
              Loading NGOs...
            </p>
          </div>
        ) : ngos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <p className="text-gray-600">
              No NGOs found.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      NGO
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Email
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Address
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {ngos.map((ngo) => (
                    <tr
                      key={ngo.id}
                      className="hover:bg-gray-50"
                    >
                      {/* NGO */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {ngo.organization_name}
                        </p>

                        {ngo.description && (
                          <p className="text-sm text-gray-500 mt-1 max-w-md">
                            {ngo.description}
                          </p>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {ngo.email || "—"}
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {ngo.address || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            ngo.status.toLowerCase() === "approved"
                              ? "bg-green-100 text-green-700"
                              : ngo.status.toLowerCase() === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {ngo.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {ngo.status.toLowerCase() === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(ngo.id)
                              }
                              disabled={
                                actionLoading === ngo.id
                              }
                              className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === ngo.id
                                ? "Processing..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleReject(ngo.id)
                              }
                              disabled={
                                actionLoading === ngo.id
                              }
                              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === ngo.id
                                ? "Processing..."
                                : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}