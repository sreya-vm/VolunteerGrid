"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getNGOOpportunity,
  updateNGOOpportunity,
  updateNGOOpportunityStatus,
  repostNGOOpportunity,
  Opportunity,
} from "@/lib/api";

export default function OpportunityDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.id);

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requirements, setRequirements] = useState("");
  const [capacity, setCapacity] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadOpportunity(token);
  }, [id, router]);

  async function loadOpportunity(token: string) {
    try {
      const data = await getNGOOpportunity(id, token);

      setOpportunity(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setLocation(data.location || "");
      setDate(data.date || "");
      setStartTime(data.start_time || "");
      setEndTime(data.end_time || "");
      setRequirements(data.requirements || "");
      setCapacity(
        data.capacity ? String(data.capacity) : ""
      );

      if (data.application_deadline) {
        setDeadline(
          data.application_deadline.slice(0, 16)
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load opportunity"
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    const token = localStorage.getItem("access_token");

    if (!token || !opportunity) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await updateNGOOpportunity(
        id,
        {
          title,
          description: description || undefined,
          opportunity_type:
            opportunity.opportunity_type,
          payment_type:
            opportunity.payment_type,
          location: location || undefined,
          date: date || undefined,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          requirements: requirements || undefined,
          capacity: capacity
            ? Number(capacity)
            : undefined,
          application_deadline: deadline
            ? new Date(deadline).toISOString()
            : undefined,
        },
        token
      );

      setMessage("Opportunity updated successfully.");

      const updated = await getNGOOpportunity(id, token);
      setOpportunity(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update opportunity"
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(newStatus: string) {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
      await updateNGOOpportunityStatus(
        id,
        newStatus,
        token
      );

      const updated = await getNGOOpportunity(id, token);
      setOpportunity(updated);

      setMessage(
        `Opportunity status changed to ${newStatus}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update status"
      );
    }
  }

  async function repost() {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
      await repostNGOOpportunity(id, token);

      setMessage("Opportunity reposted successfully.");

      router.push("/ngo/opportunities");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to repost opportunity"
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-8">
        <p>{error || "Opportunity not found."}</p>
      </div>
    );
  }

  const canEdit =
    opportunity.status !== "completed" &&
    opportunity.status !== "cancelled";

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-xl font-bold">
            Opportunity Details
          </h1>

          <button
            onClick={() =>
              router.push("/ngo/opportunities")
            }
            className="text-blue-600"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {message && (
          <div className="mb-5 bg-green-100 text-green-700 p-4 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-8">

          <div className="mb-6">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
              {opportunity.status}
            </span>

            <span className="ml-3 text-sm text-gray-500">
              {opportunity.opportunity_type}
            </span>
          </div>

          <div className="space-y-5">

            <div>
              <label className="block font-medium mb-2">
                Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                disabled={!canEdit}
                className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
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
                disabled={!canEdit}
                rows={4}
                className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Location
              </label>

              <input
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                disabled={!canEdit}
                className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block font-medium mb-2">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Capacity
                </label>

                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) =>
                    setCapacity(e.target.value)
                  }
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
                />
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block font-medium mb-2">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  End Time
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
                />
              </div>

            </div>

            <div>
              <label className="block font-medium mb-2">
                Requirements
              </label>

              <textarea
                value={requirements}
                onChange={(e) =>
                  setRequirements(e.target.value)
                }
                disabled={!canEdit}
                rows={3}
                className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Application Deadline
              </label>

              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) =>
                  setDeadline(e.target.value)
                }
                disabled={!canEdit}
                className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
              />
            </div>

          </div>


          {canEdit && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}


          <div className="mt-8 border-t pt-6">

            <h3 className="font-semibold mb-4">
              Manage Status
            </h3>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() =>
                  changeStatus("published")
                }
                className="px-4 py-2 border rounded-lg"
              >
                Publish
              </button>

              <button
                onClick={() =>
                  changeStatus("ongoing")
                }
                className="px-4 py-2 border rounded-lg"
              >
                Mark Ongoing
              </button>

              <button
                onClick={() =>
                  changeStatus("completed")
                }
                className="px-4 py-2 border rounded-lg"
              >
                Complete
              </button>

              <button
                onClick={() =>
                  changeStatus("cancelled")
                }
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

            </div>

          </div>


          {(opportunity.status === "completed" ||
            opportunity.status === "cancelled") && (
            <button
              onClick={repost}
              className="mt-5 w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50"
            >
              Repost Opportunity
            </button>
          )}

        </div>

      </main>
    </div>
  );
}