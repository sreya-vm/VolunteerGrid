
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdminAuditLogs,
  AdminAuditLog,
} from "@/lib/api";

export default function AdminAuditLogsPage() {
  const router = useRouter();

  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getAdminAuditLogs(token);

      setLogs(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load audit logs"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading audit logs...
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
              Failed to load audit logs
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
            Audit Logs
          </h2>

          <p className="text-gray-600">
            View administrative actions performed on the platform.
          </p>
        </div>

        {logs.length === 0 && (
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <p className="text-gray-600">
              No audit logs found.
            </p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    User ID
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Entity
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Entity ID
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Created At
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b px-6 py-4 text-gray-700">
                      {log.id}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {log.user_id}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {log.action}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {log.entity}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {log.entity_id}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
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
