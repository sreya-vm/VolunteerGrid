"use client";

import { useEffect, useState } from "react";
import {
  getAdminUsers,
  activateAdminUser,
  deactivateAdminUser,
  AdminUser,
} from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadUsers = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getAdminUsers(token);
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeactivate = async (userId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to deactivate this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(userId);
      setError("");

      await deactivateAdminUser(userId, token);
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setActionLoading(userId);
      setError("");

      await activateAdminUser(userId, token);
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to activate user"
      );
    } finally {
      setActionLoading(null);
    }
  };

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
              Admin • User Management
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/admin")}
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
            User Management
          </h2>

          <p className="text-gray-600 mt-1">
            View and manage registered users.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <p className="text-gray-600">
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <p className="text-gray-600">
              No users found.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Name
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Email
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Role
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold">
                      Phone
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
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.phone || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.is_active
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        {user.is_active ? (
                          <button
                            onClick={() =>
                              handleDeactivate(user.id)
                            }
                            disabled={
                              actionLoading === user.id
                            }
                            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading === user.id
                              ? "Processing..."
                              : "Deactivate"}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleActivate(user.id)
                            }
                            disabled={
                              actionLoading === user.id
                            }
                            className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading === user.id
                              ? "Processing..."
                              : "Activate"}
                          </button>
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