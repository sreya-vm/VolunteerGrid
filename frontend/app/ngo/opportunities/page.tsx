"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNGODetails,
  getNGOOpportunities,
  Opportunity,
  NGODetails,
} from "@/lib/api";

export default function NGOOpportunitiesPage() {
  const router = useRouter();

  const [ngo, setNgo] = useState<NGODetails | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadData(token);
  }, [router]);

  async function loadData(token: string) {
    try {
      const ngoData = await getNGODetails(token);
      setNgo(ngoData);

      const opportunityData = await getNGOOpportunities(token);
      setOpportunities(opportunityData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load opportunities"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString();
  }

  function formatDeadline(deadline: string | null) {
    if (!deadline) return "No deadline";

    return new Date(deadline).toLocaleString();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Opportunities
            </h1>

            {ngo && (
              <p className="text-sm text-gray-500">
                {ngo.organization_name}
              </p>
            )}
          </div>

          <button
            onClick={() => router.push("/ngo")}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>

        </div>
      </header>


      <main className="max-w-7xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}


        {/* Approval warning */}
        {ngo && ngo.status !== "approved" && (
          <div className="mb-6 bg-yellow-100 text-yellow-800 p-5 rounded-lg">

            <p className="font-semibold">
              NGO approval required
            </p>

            <p className="text-sm mt-1">
              Your NGO must be approved before you can create
              opportunities.
            </p>

          </div>
        )}


        {/* Page heading */}
        <div className="flex justify-between items-center mb-8">

          <div>
            <h2 className="text-3xl font-bold">
              Your Opportunities
            </h2>

            <p className="text-gray-600 mt-1">
              Manage opportunities for volunteers.
            </p>
          </div>


          {ngo?.status === "approved" && (
            <button
              onClick={() =>
                router.push("/ngo/opportunities/create")
              }
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
            >
              + Create Opportunity
            </button>
          )}

        </div>


        {/* Empty state */}
        {opportunities.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">

            <h3 className="text-xl font-semibold">
              No opportunities yet
            </h3>

            <p className="text-gray-600 mt-2">
              Create your first opportunity for volunteers.
            </p>

            {ngo?.status === "approved" && (
              <button
                onClick={() =>
                  router.push("/ngo/opportunities/create")
                }
                className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
              >
                Create Opportunity
              </button>
            )}

          </div>
        )}


        {/* Opportunity cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {opportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >

              <div className="flex justify-between items-start gap-3">

                <h3 className="text-xl font-semibold">
                  {opportunity.title}
                </h3>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    opportunity.status === "published"
                      ? "bg-green-100 text-green-700"
                      : opportunity.status === "ongoing"
                      ? "bg-blue-100 text-blue-700"
                      : opportunity.status === "completed"
                      ? "bg-gray-100 text-gray-700"
                      : opportunity.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {opportunity.status}
                </span>

              </div>


              <p className="text-gray-600 mt-3 line-clamp-3">
                {opportunity.description ||
                  "No description provided."}
              </p>


              <div className="mt-5 space-y-2 text-sm">

                <p>
                  <strong>Type:</strong>{" "}
                  {opportunity.opportunity_type}
                </p>

                <p>
                  <strong>Payment:</strong>{" "}
                  {opportunity.payment_type}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(opportunity.date)}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {opportunity.location || "Not specified"}
                </p>

                <p>
                  <strong>Capacity:</strong>{" "}
                  {opportunity.capacity ?? "Unlimited"}
                </p>

                <p>
                  <strong>Application deadline:</strong>{" "}
                  {formatDeadline(
                    opportunity.application_deadline
                  )}
                </p>

              </div>


              <button
                onClick={() =>
                  router.push(
                    `/ngo/opportunities/${opportunity.id}`
                  )
                }
                className="mt-6 w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50"
              >
                View Details
              </button>

            </div>
          ))}

        </div>

      </main>
    </div>
  );
}