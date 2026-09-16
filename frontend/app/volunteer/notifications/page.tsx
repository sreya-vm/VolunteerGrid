"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

interface Notification {
  id: number;
  message?: string;
  title?: string;
  is_read?: boolean;
  created_at?: string;
}

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchNotifications() {
      try {
        const response = await fetch(
          `${API_URL}/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("token_type");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load notifications.");
        }

        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/volunteer"
            className="text-2xl font-bold text-blue-600"
          >
            VolunteerGrid
          </Link>

          <div className="flex items-center gap-5">
            <Link
              href="/volunteer"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/volunteer"
          className="text-sm font-medium text-blue-600"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="mt-2 text-slate-600">
            Stay updated with your volunteer activities.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">
              Loading notifications...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load notifications
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">🔔</div>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No notifications
            </h2>

            <p className="mt-2 text-slate-600">
              You're all caught up!
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="mt-8 space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border p-5 ${
                  notification.is_read
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    🔔
                  </div>

                  <div className="flex-1">
                    {notification.title && (
                      <h2 className="font-semibold text-slate-900">
                        {notification.title}
                      </h2>
                    )}

                    <p className="mt-1 text-slate-700">
                      {notification.message ||
                        "You have a new notification."}
                    </p>

                    {notification.created_at && (
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {!notification.is_read && (
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}