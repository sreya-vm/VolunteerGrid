"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  Notification,
} from "@/lib/api";

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadNotifications(token);
  }, [router]);

  async function loadNotifications(token: string) {
    try {
      const data = await getNotifications(token);
      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: number) {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
      await markNotificationRead(id, token);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    }
  }

  async function markAllRead() {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
      await markAllNotificationsRead(token);

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notifications as read"
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading notifications...
      </div>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Notifications
            </h1>

            <p className="text-sm text-gray-500">
              {unreadCount} unread
            </p>
          </div>

          <button
            onClick={() => router.push("/ngo")}
            className="text-blue-600"
          >
            Dashboard
          </button>

        </div>
      </header>


      <main className="max-w-4xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}


        {notifications.length > 0 && unreadCount > 0 && (
          <div className="mb-6 text-right">

            <button
              onClick={markAllRead}
              className="text-blue-600 hover:underline"
            >
              Mark all as read
            </button>

          </div>
        )}


        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center">

            <h2 className="text-xl font-semibold">
              No notifications
            </h2>

            <p className="text-gray-600 mt-2">
              You're all caught up.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${
                  notification.is_read
                    ? "border-gray-300"
                    : "border-blue-600"
                }`}
              >

                <div className="flex justify-between gap-4">

                  <div>

                    <h2
                      className={`text-lg ${
                        notification.is_read
                          ? "font-medium"
                          : "font-bold"
                      }`}
                    >
                      {notification.title}
                    </h2>

                    <p className="text-gray-600 mt-2">
                      {notification.message}
                    </p>

                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </p>

                  </div>


                  {!notification.is_read && (
                    <button
                      onClick={() =>
                        markRead(notification.id)
                      }
                      className="text-sm text-blue-600 whitespace-nowrap"
                    >
                      Mark as read
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}