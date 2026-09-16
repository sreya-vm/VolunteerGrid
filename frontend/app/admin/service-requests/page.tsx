
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdminServiceRequests,
  updateAdminServiceRequestStatus,
  AdminServiceRequest,
} from "@/lib/api";

export default function AdminServiceRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getAdminServiceRequests(token);

      setRequests(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load service requests"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    requestId: number,
    newStatus: string
  ) {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      await updateAdminServiceRequestStatus(
        requestId,
        newStatus,
        token
      );

      await loadRequests();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update service request status"
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading service requests...
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
              Failed to load service requests
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
            Service Requests
          </h2>

          <p className="text-gray-600">
            Monitor and update service requests.
          </p>
        </div>

        {requests.length === 0 && (
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <p className="text-gray-600">
              No service requests found.
            </p>
          </div>
        )}

        {requests.length > 0 && (
          <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    User
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    NGO
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Service Type
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Location
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b px-6 py-4 text-gray-700">
                      {request.id}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {request.user_name || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {request.user_email || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {request.ngo_name || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {request.service_type}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700 max-w-xs">
                      {request.description || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {request.location || "—"}
                    </td>

                    <td className="border-b px-6 py-4">
                      <select
                        value={request.status}
                        onChange={(e) =>
                          handleStatusChange(
                            request.id,
                            e.target.value
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">
                          Pending
                        </option>

                        <option value="approved">
                          Approved
                        </option>

                        <option value="in_progress">
                          In Progress
                        </option>

                        <option value="completed">
                          Completed
                        </option>

                        <option value="rejected">
                          Rejected
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
