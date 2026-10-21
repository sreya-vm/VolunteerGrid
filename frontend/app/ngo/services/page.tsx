"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getNGODetails,
  getNGOService,
  createNGOService,
  updateNGOService,
  NGODetails,
} from "@/lib/api";

export default function CreateServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceId = searchParams.get("id");
  const isEditing = Boolean(serviceId);

  const [ngo, setNgo] = useState<NGODetails | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        // Check NGO approval status
        const ngoData = await getNGODetails(token!);
        setNgo(ngoData);

        // Only load service when editing
        if (serviceId) {
          const service = await getNGOService(
            Number(serviceId),
            token!
          );

          setName(service.name);
          setDescription(service.description || "");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load service"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, serviceId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    // Extra frontend protection
    if (ngo?.status !== "approved") {
      setError(
        "Your NGO must be approved by an admin before creating or updating services."
      );
      return;
    }

    if (!name.trim()) {
      setError("Service name is required.");
      return;
    }

    setSaving(true);

    try {
      if (isEditing) {
        await updateNGOService(
          Number(serviceId),
          {
            name: name.trim(),
            description: description.trim() || undefined,
          },
          token
        );
      } else {
        await createNGOService(
          {
            name: name.trim(),
            description: description.trim() || undefined,
          },
          token
        );
      }

      router.push("/ngo/services");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditing
          ? "Failed to update service"
          : "Failed to create service"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Checking NGO approval...</p>
      </div>
    );
  }

  // NGO profile does not exist
  if (!ngo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            NGO Profile Required
          </h1>

          <p className="mt-3 text-gray-600">
            Please complete your NGO profile before creating
            services.
          </p>

          <button
            onClick={() => router.push("/ngo/profile")}
            className="mt-6 px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Complete NGO Profile
          </button>
        </div>
      </div>
    );
  }

  // NGO is not approved
  if (ngo.status !== "approved") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              VolunteerGrid
            </h1>

            <p className="text-sm text-gray-500">
              NGO Services
            </p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              NGO Approval Required
            </h2>

            <p className="mt-3 text-gray-600">
              Your NGO must be approved by an admin before you
              can create or manage services.
            </p>

            <div className="mt-5 inline-block rounded-full bg-yellow-100 px-4 py-2">
              <span className="text-sm font-semibold text-yellow-800">
                Current Status: {ngo.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push("/ngo")}
                className="px-5 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              VolunteerGrid
            </h1>

            <p className="text-sm text-gray-500">
              NGO Services
            </p>
          </div>

          <button
            onClick={() => router.push("/ngo")}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Service" : "Create Service"}
          </h2>

          <p className="mt-2 text-gray-600">
            {isEditing
              ? "Update the details of your NGO service."
              : "Add a service that your NGO can provide to volunteers."}
          </p>

          {/* Approval status */}
          <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">
              NGO Status:{" "}
              <strong>{ngo.status.toUpperCase()}</strong>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            {/* Service Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Service Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Food Distribution"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the service your NGO provides..."
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push("/ngo/services")}
                className="flex-1 rounded-lg border border-gray-300 px-5 py-3 font-medium hover:bg-gray-100"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : isEditing
                  ? "Update Service"
                  : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}