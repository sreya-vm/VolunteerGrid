"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNGOServiceRequests,
  NGOServiceRequest,
  acceptNGOServiceRequest,
  rejectNGOServiceRequest,
  completeNGOServiceRequest,
} from "@/lib/api";

export default function ServiceRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] =
    useState<NGOServiceRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadRequests(token);
  }, [router]);

  async function loadRequests(token: string) {
    try {
      const data =
        await getNGOServiceRequests(token);

      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load service requests"
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
        await acceptNGOServiceRequest(id, token);
      } else if (action === "reject") {
        await rejectNGOServiceRequest(id, token);
      } else {
        await completeNGOServiceRequest(id, token);
      }

      await loadRequests(token);
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
        Loading service requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">

          <h1 className="text-2xl font-bold">
            Service Requests
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


        {requests.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center">

            <h2 className="text-xl font-semibold">
              No service requests
            </h2>

            <p className="text-gray-600 mt-2">
              Requests from volunteers will appear here.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm p-6"
              >

                <div className="flex justify-between">

                  <div>
                    <h2 className="text-xl font-semibold">
                      {request.service_type}
                    </h2>

                    <p className="text-gray-500">
                      Requested by:{" "}
                      {request.user_name ||
                        "Unknown volunteer"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {request.user_email}
                    </p>
                  </div>

                  <span className="h-fit px-3 py-1 rounded-full bg-gray-100 text-sm">
                    {request.status}
                  </span>

                </div>


                <div className="mt-5">

                  <p>
                    <strong>Description:</strong>
                  </p>

                  <p className="text-gray-600 mt-1">
                    {request.description ||
                      "No description provided."}
                  </p>

                </div>


                {request.location && (
                  <p className="mt-4">
                    <strong>Location:</strong>{" "}
                    {request.location}
                  </p>
                )}


                {request.status === "pending" && (
                  <div className="mt-6 flex gap-3">

                    <button
                      onClick={() =>
                        handleAction(
                          request.id,
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
                          request.id,
                          "reject"
                        )
                      }
                      className="px-5 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Reject
                    </button>

                  </div>
                )}


                {request.status === "accepted" && (
                  <button
                    onClick={() =>
                      handleAction(
                        request.id,
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