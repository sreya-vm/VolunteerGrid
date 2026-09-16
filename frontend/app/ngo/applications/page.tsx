"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNGOApplications,
  NGOApplication,
  acceptNGOApplication,
  rejectNGOApplication,
  completeNGOApplication,
} from "@/lib/api";

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] =
    useState<NGOApplication[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadApplications(token);
  }, [router]);

  async function loadApplications(token: string) {
    try {
      const data = await getNGOApplications(token);
      setApplications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(
    id: number,
    action: "accept" | "reject" | "complete"
  ) {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
      if (action === "accept") {
        await acceptNGOApplication(id, token);
      } else if (action === "reject") {
        await rejectNGOApplication(id, token);
      } else {
        await completeNGOApplication(id, token);
      }

      await loadApplications(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Action failed"
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-2xl font-bold">
            Volunteer Applications
          </h1>

          <button
            onClick={() => router.push("/ngo")}
            className="text-blue-600"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center">
            <h2 className="text-xl font-semibold">
              No applications yet
            </h2>
            <p className="text-gray-600 mt-2">
              Applications from volunteers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {applications.map((application) => (
              <div
                key={application.application_id}
                className="bg-white rounded-xl shadow-sm p-6"
              >

                <div className="flex justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-semibold">
                      {application.volunteer_name ||
                        "Volunteer"}
                    </h2>

                    <p className="text-gray-500">
                      {application.volunteer_email}
                    </p>

                    <p className="mt-3">
                      <strong>Opportunity:</strong>{" "}
                      {application.opportunity_title}
                    </p>
                  </div>

                  <span className="h-fit px-3 py-1 rounded-full bg-gray-100 text-sm">
                    {application.status}
                  </span>

                </div>


                <div className="mt-5 grid md:grid-cols-2 gap-4 text-sm">

                  <div>
                    <strong>Skills</strong>
                    <p className="text-gray-600">
                      {application.skills || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <strong>Interests</strong>
                    <p className="text-gray-600">
                      {application.interests || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <strong>Availability</strong>
                    <p className="text-gray-600">
                      {application.availability || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <strong>Location</strong>
                    <p className="text-gray-600">
                      {application.location || "Not provided"}
                    </p>
                  </div>

                </div>


                {application.status === "pending" && (
                  <div className="mt-6 flex gap-3">

                    <button
                      onClick={() =>
                        handleAction(
                          application.application_id,
                          "accept"
                        )
                      }
                      className="px-5 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleAction(
                          application.application_id,
                          "reject"
                        )
                      }
                      className="px-5 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Reject
                    </button>

                  </div>
                )}

                {application.status === "accepted" && (
                  <button
                    onClick={() =>
                      handleAction(
                        application.application_id,
                        "complete"
                      )
                    }
                    className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Mark Completed
                  </button>
                )}

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}