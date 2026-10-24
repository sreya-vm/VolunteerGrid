"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface NGO {
  id: number;
  organization_name: string;
  description: string | null;
  address: string | null;
  website: string | null;
  status: string;
  approved_at: string | null;
}

interface Service {
  id: number;
  ngo_id: number;
  name: string;
  description: string | null;
}

interface ServiceRequest {
  id: number;
  user_id: number;
  ngo_id: number | null;
  service_type: string;
  description: string;
  location: string | null;
  status: string;
  created_at: string;
}

type View = "ngos" | "services" | "request";

export default function ServicesPage() {
  const router = useRouter();

  const [ngos, setNgos] = useState<NGO[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);
  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [view, setView] = useState<View>("ngos");

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadNGOs(token);
    loadRequests(token);
  }, [router]);

  async function loadNGOs(token: string) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/users/ngos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to load NGOs."
        );
      }

      setNgos(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load NGOs."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRequests(token: string) {
    try {
      setRequestsLoading(true);

      const response = await fetch(
        `${API_URL}/service-requests/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to load service requests."
        );
      }

      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load service requests."
      );
    } finally {
      setRequestsLoading(false);
    }
  }

  async function loadServices(ngo: NGO) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSelectedNgo(ngo);
      setServices([]);
      setServicesLoading(true);
      setError("");
      setSuccess("");
      setView("services");

      const response = await fetch(
        `${API_URL}/users/ngos/${ngo.id}/services`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to load NGO services."
        );
      }

      setServices(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load services."
      );
    } finally {
      setServicesLoading(false);
    }
  }

  function openRequestForm(service: Service) {
    setSelectedService(service);
    setDescription("");
    setLocation("");
    setError("");
    setSuccess("");
    setView("request");
  }

  async function submitRequest() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedNgo || !selectedService) {
      setError("Please select an NGO and service.");
      return;
    }
    if (submitLock.current) return;

const duplicate = requests.some(
  (request) =>
    request.ngo_id === selectedNgo.id &&
    request.service_type.trim().toLowerCase() ===
      selectedService.name.trim().toLowerCase() &&
    request.status.toLowerCase() === "pending"
);

if (duplicate) {
  const message =
    "You already have a pending request for this service.";

  setError(message);

  window.dispatchEvent(
    new CustomEvent("vg-toast", {
      detail: { type: "error", message },
    })
  );

  return;
}

    if (!description.trim()) {
      setError("Please describe the service you need.");
      return;
    }

    try {
      submitLock.current = true;
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/service-requests/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ngo_id: selectedNgo.id,
            service_id: selectedService.id,
            description: description.trim(),
            location: location.trim() || null,
          }),
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to submit service request."
        );
      }

      setSuccess(
        "Your service request has been submitted successfully."
      );
      window.dispatchEvent(
  new CustomEvent("vg-toast", {
    detail: {
      type: "success",
      message: "Service request submitted successfully!",
    },
  })
);

      setDescription("");
      setLocation("");

      await loadRequests(token);

      setTimeout(() => {
        setView("ngos");
        setSelectedNgo(null);
        setSelectedService(null);
        setSuccess("");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit service request."
      );
    } finally {
       submitLock.current = false;
      setSubmitting(false);
    }
  }

  async function cancelRequest(requestId: number) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this service request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/service-requests/my/${requestId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to cancel request."
        );
      }

      await loadRequests(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel request."
      );
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    router.push("/login");
  }

  function statusClass(status: string) {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "accepted":
        return "bg-green-100 text-green-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/volunteer"
            className="text-2xl font-bold text-blue-600"
          >
            VolunteerGrid
          </Link>

          <div className="flex items-center gap-5">
            <Link
              href="/volunteer"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/volunteer"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-5">
          <h1 className="text-3xl font-bold text-slate-900">
            Service Requests
          </h1>

          <p className="mt-2 text-slate-600">
            Request services from approved NGOs and track your
            requests.
          </p>
        </div>

        {/* Global error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setView("ngos");
              setSelectedNgo(null);
              setSelectedService(null);
              setError("");
              setSuccess("");
            }}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
              view === "ngos" ||
              view === "services" ||
              view === "request"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            Request a Service
          </button>

          
        </div>

        {/* ================================================= */}
        {/* NGO LIST */}
        {/* ================================================= */}

        {view === "ngos" && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Approved NGOs
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Choose an NGO to see the services they provide.
            </p>

            {loading ? (
              <div className="mt-6 rounded-2xl bg-white p-8 text-center">
                Loading NGOs...
              </div>
            ) : ngos.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="font-semibold text-slate-800">
                  No approved NGOs available
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Please check again later.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ngos.map((ngo) => (
                  <div
                    key={ngo.id}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex-1">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        APPROVED
                      </span>

                      <h3 className="mt-4 text-xl font-bold text-slate-900">
                        {ngo.organization_name}
                      </h3>

                      {ngo.description && (
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {ngo.description}
                        </p>
                      )}

                      {ngo.address && (
                        <p className="mt-4 text-sm text-slate-600">
                          📍 {ngo.address}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => loadServices(ngo)}
                      className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      View Services
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================================================= */}
        {/* SERVICE LIST */}
        {/* ================================================= */}

        {view === "services" && selectedNgo && (
          <section className="mt-8">
            <button
              onClick={() => {
                setView("ngos");
                setSelectedNgo(null);
                setSelectedService(null);
              }}
              className="text-sm font-medium text-blue-600"
            >
              ← Back to NGOs
            </button>

            <div className="mt-5">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedNgo.organization_name}
              </h2>

              <p className="mt-1 text-slate-600">
                Available services
              </p>
            </div>

            {servicesLoading ? (
              <div className="mt-6 rounded-2xl bg-white p-8 text-center">
                Loading services...
              </div>
            ) : services.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="font-semibold text-slate-800">
                  No services available
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-bold text-slate-900">
                      {service.name}
                    </h3>

                    {service.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {service.description}
                      </p>
                    )}

                    <button
                      onClick={() => openRequestForm(service)}
                      className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      Request This Service
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================================================= */}
        {/* REQUEST FORM */}
        {/* ================================================= */}

        {view === "request" &&
          selectedNgo &&
          selectedService && (
            <section className="mt-8 max-w-2xl">
              <button
                onClick={() => setView("services")}
                className="text-sm font-medium text-blue-600"
              >
                ← Back to Services
              </button>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">
                  Request Service
                </h2>

                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    NGO
                  </p>

                  <p className="font-semibold text-slate-900">
                    {selectedNgo.organization_name}
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    Service
                  </p>

                  <p className="font-semibold text-blue-600">
                    {selectedService.name}
                  </p>
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Describe what you need
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    rows={5}
                    placeholder="Please describe the service you need..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Location
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    placeholder="Where is the service needed?"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  onClick={submitRequest}
                  disabled={submitting}
                  className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Service Request"}
                </button>
              </div>
            </section>
          )}

        {/* ================================================= */}
        {/* MY REQUESTS */}
        {/* ================================================= */}

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            My Service Requests
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Track the services you have requested.
          </p>

          {requestsLoading ? (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center">
              Loading your requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="text-4xl">🤝</div>

              <p className="mt-3 font-semibold text-slate-800">
                No service requests yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Choose an NGO above to request a service.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {request.service_type}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Request #{request.id}
                      </p>
                    </div>

                    <span
                      className={`h-fit rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-700">
                    {request.description}
                  </p>

                  {request.location && (
                    <p className="mt-3 text-sm text-slate-600">
                      📍 {request.location}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-slate-400">
                    Submitted{" "}
                    {new Date(
                      request.created_at
                    ).toLocaleString("en-IN")}
                  </p>

                  {request.status.toLowerCase() ===
                    "pending" && (
                    <button
                      onClick={() =>
                        cancelRequest(request.id)
                      }
                      className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}