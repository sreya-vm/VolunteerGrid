"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getNGODetails,
  NGODetails,
} from "@/lib/api";

export default function NGODashboard() {
  const router = useRouter();

  const [ngo, setNgo] = useState<NGODetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNGODetails();
  }, []);

  async function loadNGODetails() {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getNGODetails(token);
      setNgo(data);
    } catch (error) {
      console.error("Failed to load NGO details:", error);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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

          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              NGO Dashboard
            </span>

            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        <h2 className="text-3xl font-bold mb-2">
          Welcome, {ngo?.organization_name || "NGO"}
        </h2>

        <p className="text-gray-600 mb-8">
          Manage your NGO activities and volunteer opportunities.
        </p>

        {/* Approval Status */}
        {ngo && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold mb-3">
              NGO Approval Status
            </h3>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full font-semibold ${
                  ngo.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : ngo.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {ngo.status.toUpperCase()}
              </span>
            </div>

            {ngo.status !== "approved" && (
              <p className="mt-3 text-yellow-700">
                You need NGO approval before creating opportunities
                or services.
              </p>
            )}
          </div>
        )}

        {/* NGO Profile */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-xl font-semibold mb-2">
            NGO Profile
          </h3>

          <p className="text-gray-600 mb-4">
            View and manage your NGO information.
          </p>

          <button
            onClick={() => router.push("/ngo/profile")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Manage Profile
          </button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Opportunities */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-2">
              Opportunities
            </h3>

            <p className="text-gray-600 mb-4">
              Create and manage volunteer opportunities.
            </p>

            <button
              onClick={() => router.push("/ngo/opportunities")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Opportunities
            </button>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-2">
              Applications
            </h3>

            <p className="text-gray-600 mb-4">
              Review volunteer applications.
            </p>

            <button
              onClick={() => router.push("/ngo/applications")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Applications
            </button>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-2">
              Services
            </h3>

            <p className="text-gray-600 mb-4">
              Manage services offered by your NGO.
            </p>

            <button
              onClick={() => router.push("/ngo/services")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Services
            </button>
          </div>

          {/* Service Requests */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-2">
              Service Requests
            </h3>

            <p className="text-gray-600 mb-4">
              View and manage service requests from volunteers.
            </p>

            <button
              onClick={() => router.push("/ngo/service-requests")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Requests
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-2">
              Notifications
            </h3>

            <p className="text-gray-600 mb-4">
              View your latest notifications.
            </p>

            <button
              onClick={() => router.push("/ngo/notifications")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Notifications
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}