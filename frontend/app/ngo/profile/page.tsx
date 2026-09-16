"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createNGODetails,
  getNGODetails,
  updateNGODetails,
  NGODetails,
} from "@/lib/api";

export default function NGOProfilePage() {
  const router = useRouter();

  const [ngo, setNgo] = useState<NGODetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [organizationName, setOrganizationName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadProfile(token);
  }, [router]);

  async function loadProfile(token: string) {
    try {
      const data = await getNGODetails(token);

      setNgo(data);
      setOrganizationName(data.organization_name);
      setDescription(data.description || "");
      setAddress(data.address || "");
      setWebsite(data.website || "");
    } catch {
      // 404 means NGO profile has not been created yet.
      setNgo(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const data = {
      organization_name: organizationName,
      description: description || undefined,
      address: address || undefined,
      website: website || undefined,
    };

    try {
      if (ngo) {
        await updateNGODetails(data, token);
        setMessage("NGO profile updated successfully.");
      } else {
        await createNGODetails(data, token);
        setMessage(
          "NGO profile submitted successfully. It is now pending approval."
        );
      }

      const updated = await getNGODetails(token);
      setNgo(updated);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save NGO profile"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">

          <h1 className="text-xl font-bold">
            NGO Profile
          </h1>

          <button
            onClick={() => router.push("/ngo")}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>

        </div>
      </header>


      <main className="max-w-4xl mx-auto px-6 py-8">

        <div className="bg-white rounded-xl shadow-sm p-8">

          <h2 className="text-2xl font-bold mb-2">
            {ngo ? "Manage NGO Profile" : "Create NGO Profile"}
          </h2>

          <p className="text-gray-600 mb-8">
            Provide your organization's information for VolunteerGrid.
          </p>


          {ngo && (
            <div className="mb-6">
              <span className="font-medium">
                Approval Status:{" "}
              </span>

              <span className="font-semibold">
                {ngo.status.toUpperCase()}
              </span>
            </div>
          )}


          {message && (
            <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div>
              <label className="block font-medium mb-2">
                Organization Name *
              </label>

              <input
                type="text"
                value={organizationName}
                onChange={(e) =>
                  setOrganizationName(e.target.value)
                }
                required
                className="w-full border rounded-lg px-4 py-3"
                placeholder="Enter organization name"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={5}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="Describe your NGO"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                rows={3}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="NGO address"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Website
              </label>

              <input
                type="url"
                value={website}
                onChange={(e) =>
                  setWebsite(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
                placeholder="https://example.org"
              />
            </div>


            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : ngo
                ? "Update Profile"
                : "Submit NGO Profile"}
            </button>

          </form>

        </div>

      </main>
    </div>
  );
}