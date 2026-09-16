"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VolunteerDashboard() {
  const router = useRouter();

  const [userName, setUserName] = useState("Volunteer");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // If the user isn't logged in, send them to login
    if (!token) {
      router.push("/login");
      return;
    }

    // Get basic information from JWT
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      if (payload.name) {
        setUserName(payload.name);
      }
    } catch {
      // Invalid token
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      router.push("/login");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="text-2xl font-bold text-blue-600"
          >
            VolunteerGrid
          </Link>

          <div className="flex items-center gap-4">

            <span className="hidden text-sm text-slate-600 sm:block">
              Welcome, {userName}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* Dashboard */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">

          <p className="text-sm font-medium text-blue-600">
            Volunteer Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome back, {userName}!
          </h1>

          <p className="mt-2 text-slate-600">
            Find opportunities, manage your applications,
            and make a difference in your community.
          </p>

        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* Opportunities */}
          <Link
            href="/volunteer/opportunities"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              🔎
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Find Opportunities
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Browse available volunteering opportunities
              and find one that matches your interests.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              Browse opportunities →
            </p>

          </Link>

          {/* My Applications */}
          <Link
            href="/volunteer/applications"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
              📋
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              My Applications
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track the opportunities you've applied for
              and check the status of your applications.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              View applications →
            </p>

          </Link>

          {/* Notifications */}
          <Link
            href="/volunteer/notifications"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
              🔔
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Notifications
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Stay updated about your applications,
              opportunities, and important announcements.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              View notifications →
            </p>

          </Link>

          {/* Profile */}
          <Link
            href="/volunteer/profile"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              👤
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              My Profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              View and update your volunteer profile,
              skills, and personal information.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              View profile →
            </p>

          </Link>

          {/* Service Requests */}
          <Link
            href="/volunteer/services"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
              🤝
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Service Requests
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Explore service requests and opportunities
              where your skills can help.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              View services →
            </p>

          </Link>

          {/* Impact */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-2xl">
              ❤️
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Your Impact
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your volunteer journey starts here.
              Every contribution makes a difference.
            </p>

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Keep volunteering!
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}