"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createNGOOpportunity,
  getNGODetails,
  NGODetails,
} from "@/lib/api";

export default function CreateOpportunityPage() {
  const router = useRouter();

  const [ngo, setNgo] = useState<NGODetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [opportunityType, setOpportunityType] =
    useState<"event" | "position">("event");

  const [paymentType, setPaymentType] =
    useState<"paid" | "unpaid">("unpaid");

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requirements, setRequirements] = useState("");
  const [capacity, setCapacity] = useState("");

  const [applicationDeadline, setApplicationDeadline] =
    useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadNGO(token);
  }, [router]);

  async function loadNGO(token: string) {
    try {
      const data = await getNGODetails(token);
      setNgo(data);

      if (data.status !== "approved") {
        setError(
          "Your NGO must be approved before creating opportunities."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load NGO profile"
      );
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

    if (!ngo || ngo.status !== "approved") {
      setError(
        "Your NGO must be approved before creating opportunities."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = {
        title,
        description: description || undefined,
        opportunity_type: opportunityType,
        payment_type: paymentType,
        location: location || undefined,
        date: date || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        requirements: requirements || undefined,
        capacity: capacity
          ? Number(capacity)
          : undefined,
        application_deadline:
          applicationDeadline
            ? new Date(applicationDeadline).toISOString()
            : undefined,
      };

      await createNGOOpportunity(data, token);

      router.push("/ngo/opportunities");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create opportunity"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-xl font-bold">
            Create Opportunity
          </h1>

          <button
            onClick={() =>
              router.push("/ngo/opportunities")
            }
            className="text-blue-600 hover:underline"
          >
            Back
          </button>

        </div>
      </header>


      <main className="max-w-4xl mx-auto px-6 py-8">

        <div className="bg-white rounded-xl shadow-sm p-8">

          <h2 className="text-2xl font-bold mb-2">
            Create Volunteer Opportunity
          </h2>

          <p className="text-gray-600 mb-8">
            Provide the details of the opportunity you want
            volunteers to apply for.
          </p>


          {error && (
            <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}


          {ngo?.status === "approved" && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* Title */}
              <div>
                <label className="block font-medium mb-2">
                  Title *
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="e.g. Beach Cleanup Drive"
                />
              </div>


              {/* Description */}
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
                  placeholder="Describe the opportunity"
                />
              </div>


              {/* Opportunity type */}
              <div>
                <label className="block font-medium mb-2">
                  Opportunity Type *
                </label>

                <select
                  value={opportunityType}
                  onChange={(e) =>
                    setOpportunityType(
                      e.target.value as
                        | "event"
                        | "position"
                    )
                  }
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="event">
                    Event
                  </option>

                  <option value="position">
                    Position
                  </option>
                </select>
              </div>


              {/* Payment */}
              <div>
                <label className="block font-medium mb-2">
                  Payment Type *
                </label>

                <select
                  value={paymentType}
                  onChange={(e) =>
                    setPaymentType(
                      e.target.value as
                        | "paid"
                        | "unpaid"
                    )
                  }
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="unpaid">
                    Unpaid
                  </option>

                  <option value="paid">
                    Paid
                  </option>
                </select>
              </div>


              {/* Location */}
              <div>
                <label className="block font-medium mb-2">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="e.g. Chennai"
                />
              </div>


              {/* Date */}
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
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>


              {/* Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                    className="w-full border rounded-lg px-4 py-3"
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
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

              </div>


              {/* Requirements */}
              <div>
                <label className="block font-medium mb-2">
                  Requirements
                </label>

                <textarea
                  value={requirements}
                  onChange={(e) =>
                    setRequirements(e.target.value)
                  }
                  rows={4}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Skills or requirements for volunteers"
                />
              </div>


              {/* Capacity */}
              <div>
                <label className="block font-medium mb-2">
                  Volunteer Capacity
                </label>

                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) =>
                    setCapacity(e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="e.g. 20"
                />
              </div>


              {/* Deadline */}
              <div>
                <label className="block font-medium mb-2">
                  Application Deadline
                </label>

                <input
                  type="datetime-local"
                  value={applicationDeadline}
                  onChange={(e) =>
                    setApplicationDeadline(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>


              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "Create Opportunity"}
              </button>

            </form>
          )}

        </div>

      </main>
    </div>
  );
}