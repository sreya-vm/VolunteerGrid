"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

interface VolunteerProfile {
  volunteer_profile_id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  skills: string | null;
  interests: string | null;
  availability: string | null;
  location: string | null;
}

export default function VolunteerProfilePage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<VolunteerProfile | null>(null);

  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/volunteer/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        router.push("/login");
        return;
      }

      // Profile does not exist yet
      if (response.status === 404) {
        setProfile(null);
        setError("");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            "Unable to load profile"
          )
        );
      }

      setProfile(result);

      setSkills(result.skills || "");
      setInterests(result.interests || "");
      setAvailability(result.availability || "");
      setLocation(result.location || "");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setCreating(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/volunteer/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            skills,
            interests,
            availability,
            location,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            "Unable to create profile"
          )
        );
      }

      setMessage(
        "Your volunteer profile has been created successfully."
      );

      // Reload complete profile
      await loadProfile();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create profile"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/volunteer/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            skills,
            interests,
            availability,
            location,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            "Unable to update profile"
          )
        );
      }

      setMessage(
        "Your profile has been updated successfully."
      );

      await loadProfile();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");

    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">
          Loading profile...
        </p>
      </main>
    );
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

          <div className="flex items-center gap-3">

            <Link
              href="/volunteer"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-4xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">

          <p className="text-sm font-medium text-blue-600">
            Volunteer
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your volunteer information and
            preferences.
          </p>

        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Account Information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            Account Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These details come from your VolunteerGrid
            account.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                value={profile?.name || ""}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone
              </label>

              <input
                type="text"
                value={profile?.phone || "Not provided"}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
              />
            </div>

          </div>

        </div>

        {/* Volunteer Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            Volunteer Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tell NGOs about your skills, interests, and
            availability.
          </p>

          <form
            onSubmit={
              profile
                ? handleUpdateProfile
                : handleCreateProfile
            }
            className="mt-6 space-y-5"
          >

            {/* Skills */}
            <div>

              <label
                htmlFor="skills"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Skills
              </label>

              <textarea
                id="skills"
                value={skills}
                onChange={(e) =>
                  setSkills(e.target.value)
                }
                rows={4}
                placeholder="Example: Teaching, event management, first aid, social media..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Interests */}
            <div>

              <label
                htmlFor="interests"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Interests
              </label>

              <textarea
                id="interests"
                value={interests}
                onChange={(e) =>
                  setInterests(e.target.value)
                }
                rows={4}
                placeholder="Example: Education, environment, healthcare, community development..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Availability */}
            <div>

              <label
                htmlFor="availability"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Availability
              </label>

              <textarea
                id="availability"
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value)
                }
                rows={3}
                placeholder="Example: Weekends, weekday evenings..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Location */}
            <div>

              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="Example: Chennai, Tamil Nadu"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={saving || creating}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profile
                ? saving
                  ? "Saving changes..."
                  : "Save Changes"
                : creating
                  ? "Creating profile..."
                  : "Create Volunteer Profile"}
            </button>

          </form>

        </div>

      </section>

    </main>
  );
}

/* ============================================================
   ERROR HANDLER
   ============================================================ */

function getErrorMessage(
  result: unknown,
  fallback: string
): string {

  if (typeof result === "string") {
    return result;
  }

  if (result && typeof result === "object") {

    const error = result as {
      detail?: unknown;
      message?: unknown;
    };

    if (typeof error.detail === "string") {
      return error.detail;
    }

    if (typeof error.message === "string") {
      return error.message;
    }

    if (Array.isArray(error.detail)) {
      return error.detail
        .map((item) => {

          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object") {

            const validationError = item as {
              msg?: unknown;
            };

            if (
              typeof validationError.msg ===
              "string"
            ) {
              return validationError.msg;
            }

            return JSON.stringify(item);
          }

          return String(item);
        })
        .join(", ");
    }

    return JSON.stringify(result);
  }

  return fallback;
}