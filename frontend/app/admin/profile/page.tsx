"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminUser, AdminUser } from "@/lib/api";

export default function AdminProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        /*
         * The admin user ID is stored inside the JWT.
         * Decode only the payload to obtain the logged-in user's ID.
         */
        const payload = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        const userId = Number(payload.sub);

        if (!userId) {
          throw new Error("Unable to identify the logged-in admin.");
        }

        const data = await getAdminUser(userId, token);
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              VolunteerGrid
            </h1>
            <p className="text-sm text-gray-500">
              Admin Dashboard
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            My Profile
          </h2>
          <p className="mt-2 text-gray-600">
            View your administrator account details.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Profile heading */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profile.name}
                  </h3>
                  <p className="text-gray-500">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Account details */}
            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Account Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </p>
                  <p className="text-gray-900 font-medium">
                    {profile.name}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </p>
                  <p className="text-gray-900 font-medium">
                    {profile.email}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Phone Number
                  </p>
                  <p className="text-gray-900 font-medium">
                    {profile.phone || "Not provided"}
                  </p>
                </div>

                {/* Role */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Role
                  </p>

                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {profile.role}
                  </span>
                </div>

                {/* Account Status */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Account Status
                  </p>

                  {profile.is_active ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                      Inactive
                    </span>
                  )}
                </div>

                {/* User ID */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    User ID
                  </p>
                  <p className="text-gray-900 font-medium">
                    #{profile.id}
                  </p>
                </div>

                {/* Created */}
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Account Created
                  </p>
                  <p className="text-gray-900 font-medium">
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}