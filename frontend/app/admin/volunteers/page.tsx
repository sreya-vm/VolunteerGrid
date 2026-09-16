
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdminVolunteers,
  AdminVolunteer,
} from "@/lib/api";

export default function AdminVolunteersPage() {
  const router = useRouter();

  const [volunteers, setVolunteers] = useState<AdminVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVolunteers();
  }, []);

  async function loadVolunteers() {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getAdminVolunteers(token);

      setVolunteers(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load volunteers"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading volunteers...
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
              Failed to load volunteers
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

      {/* Header */}
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


      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        <button
          onClick={() => router.push("/admin")}
          className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>


        <div className="mb-8">

          <h2 className="text-3xl font-bold mb-2">
            Volunteers
          </h2>

          <p className="text-gray-600">
            View registered volunteer profiles.
          </p>

        </div>


        {/* No Volunteers */}
        {volunteers.length === 0 && (
          <div className="bg-white border rounded-xl p-8 shadow-sm">

            <p className="text-gray-600">
              No volunteers found.
            </p>

          </div>
        )}


        {/* Volunteers Table */}
        {volunteers.length > 0 && (
          <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">

            <table className="w-full border-collapse">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Phone
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Skills
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Interests
                  </th>

                  <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Availability
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

                {volunteers.map((volunteer) => (

                  <tr
                    key={volunteer.volunteer_profile_id}
                    className="hover:bg-gray-50"
                  >

                    <td className="border-b px-6 py-4 text-gray-700">
                      {volunteer.name}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {volunteer.email}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {volunteer.phone || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {volunteer.skills || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {volunteer.interests || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {volunteer.availability || "—"}
                    </td>

                    <td className="border-b px-6 py-4 text-gray-700">
                      {volunteer.location || "—"}
                    </td>

                    <td className="border-b px-6 py-4">

                      {volunteer.is_active ? (
                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}

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
