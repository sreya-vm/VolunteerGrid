"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdminDashboard,
  AdminDashboard,
} from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<AdminDashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getAdminDashboard(token);

      setDashboard(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard"
      );
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
        <p className="text-gray-600">
          Loading admin dashboard...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Failed to load dashboard
          </h2>

          <p className="text-gray-600">{error}</p>
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

          <div className="flex items-center gap-3">

  <span className="text-gray-600">
    Admin Dashboard
  </span>

  <button
    onClick={() => router.push("/admin/profile")}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    My Profile
  </button>

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
          Admin Dashboard
        </h2>

        <p className="text-gray-600 mb-8">
          Manage NGOs, users, volunteers and platform activity.
        </p>


        {/* Statistics */}
        {dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            <StatCard
              title="Total Users"
              value={dashboard.users.total}
            />

            <StatCard
              title="Total NGOs"
              value={dashboard.ngos.total}
            />

            <StatCard
              title="Pending NGOs"
              value={dashboard.ngos.pending}
            />

            <StatCard
              title="Approved NGOs"
              value={dashboard.ngos.approved}
            />

            <StatCard
              title="Rejected NGOs"
              value={dashboard.ngos.rejected}
            />

            <StatCard
              title="Volunteers"
              value={dashboard.volunteers.total}
            />

            <StatCard
              title="Opportunities"
              value={dashboard.opportunities.total}
            />

            <StatCard
              title="Published Opportunities"
              value={dashboard.opportunities.published}
            />

            <StatCard
              title="Applications"
              value={dashboard.applications.total}
            />

            <StatCard
              title="Pending Applications"
              value={dashboard.applications.pending}
            />

            <StatCard
              title="Service Requests"
              value={dashboard.service_requests.total}
            />

            <StatCard
              title="Pending Requests"
              value={dashboard.service_requests.pending}
            />

          </div>
        )}


        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* NGOs */}
          <AdminCard
            title="NGO Management"
            description="Review, approve and reject NGO registrations."
            button="Manage NGOs"
            onClick={() => router.push("/admin/ngos")}
          />

          {/* Users */}
          <AdminCard
            title="User Management"
            description="View users and activate or deactivate accounts."
            button="Manage Users"
            onClick={() => router.push("/admin/users")}
          />

          {/* Volunteers */}
          <AdminCard
            title="Volunteers"
            description="View registered volunteer profiles."
            button="View Volunteers"
            onClick={() => router.push("/admin/volunteers")}
          />

          {/* Opportunities */}
          <AdminCard
            title="Opportunities"
            description="Monitor volunteer opportunities and their status."
            button="View Opportunities"
            onClick={() => router.push("/admin/opportunities")}
          />

          {/* Applications */}
          <AdminCard
            title="Applications"
            description="View volunteer applications across the platform."
            button="View Applications"
            onClick={() => router.push("/admin/applications")}
          />

          {/* Service Requests */}
          <AdminCard
            title="Service Requests"
            description="Monitor and update service requests."
            button="Manage Requests"
            onClick={() => router.push("/admin/service-requests")}
          />

          {/* Audit Logs */}
          <AdminCard
            title="Audit Logs"
            description="View administrative actions performed on the platform."
            button="View Audit Logs"
            onClick={() => router.push("/admin/audit-logs")}
          />
          

        </div>

      </div>
    </main>
  );
}


function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <p className="text-gray-500 text-sm mb-2">
        {title}
      </p>

      <p className="text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}


function AdminCard({
  title,
  description,
  button,
  onClick,
}: {
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">

      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>

      <p className="text-gray-600 mb-5">
        {description}
      </p>

      <button
        onClick={onClick}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {button}
      </button>

    </div>
  );
}