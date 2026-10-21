const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "user" | "ngo";
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  email: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

function getErrorMessage(result: unknown, fallback: string): string {
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
              loc?: unknown;
            };

            if (typeof validationError.msg === "string") {
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

export async function registerUser(
  data: RegisterData
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Registration failed")
    );
  }

  return result;
}

export async function loginUser(
  data: LoginData
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Login failed")
    );
  }

  return result;
}

// ======================================================
// NGO API
// ======================================================

export interface NGODetails {
  id: number;
  user_id: number;
  organization_name: string;
  description: string | null;
  address: string | null;
  website: string | null;
  status: string;
  approved_at: string | null;
  created_at: string;
}

export interface NGOCreateData {
  organization_name: string;
  description?: string;
  address?: string;
  website?: string;
}

export interface Opportunity {
  id: number;
  ngo_id: number;
  title: string;
  description: string | null;
  opportunity_type: "event" | "position";
  payment_type: "paid" | "unpaid";
  location: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  requirements: string | null;
  capacity: number | null;
  application_deadline: string | null;
  status: string;
  original_opportunity_id: number | null;
  created_at: string;
}

export interface OpportunityCreateData {
  title: string;
  description?: string;
  opportunity_type: "event" | "position";
  payment_type: "paid" | "unpaid";
  location?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  requirements?: string;
  capacity?: number;
  application_deadline?: string;
}

export interface Service {
  id: number;
  ngo_id: number;
  name: string;
  description: string | null;
}

export interface ServiceCreateData {
  name: string;
  description?: string;
}


// ------------------------------------------------------
// NGO DETAILS
// ------------------------------------------------------

export async function getNGODetails(
  token: string
): Promise<NGODetails> {
  const response = await fetch(`${API_URL}/ngo/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch NGO details")
    );
  }

  return result;
}


export async function createNGODetails(
  data: NGOCreateData,
  token: string
) {
  const response = await fetch(`${API_URL}/ngo/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to create NGO profile")
    );
  }

  return result;
}


export async function updateNGODetails(
  data: NGOCreateData,
  token: string
) {
  const response = await fetch(`${API_URL}/ngo/details`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to update NGO profile")
    );
  }

  return result;
}


// ------------------------------------------------------
// NGO OPPORTUNITIES
// ------------------------------------------------------

export async function getNGOOpportunities(
  token: string
): Promise<Opportunity[]> {
  const response = await fetch(`${API_URL}/ngo/opportunities`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch opportunities")
    );
  }

  return result;
}


export async function createNGOOpportunity(
  data: OpportunityCreateData,
  token: string
) {
  const response = await fetch(`${API_URL}/ngo/opportunities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to create opportunity")
    );
  }

  return result;
}


export async function getNGOOpportunity(
  id: number,
  token: string
): Promise<Opportunity> {
  const response = await fetch(
    `${API_URL}/ngo/opportunities/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch opportunity")
    );
  }

  return result;
}


export async function updateNGOOpportunity(
  id: number,
  data: Partial<OpportunityCreateData>,
  token: string
) {
  const response = await fetch(
    `${API_URL}/ngo/opportunities/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to update opportunity")
    );
  }

  return result;
}


export async function updateNGOOpportunityStatus(
  id: number,
  status: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/ngo/opportunities/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(status),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to update opportunity status")
    );
  }

  return result;
}


export async function repostNGOOpportunity(
  id: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/ngo/opportunities/${id}/repost`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to repost opportunity")
    );
  }

  return result;
}


// ------------------------------------------------------
// NGO SERVICES
// ------------------------------------------------------

export async function getNGOServices(
  token: string
): Promise<Service[]> {
  const response = await fetch(`${API_URL}/ngo/services`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch services")
    );
  }

  return result;
}


export async function createNGOService(
  data: ServiceCreateData,
  token: string
) {
  const response = await fetch(`${API_URL}/ngo/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to create service")
    );
  }

  return result;
}


export async function updateNGOService(
  id: number,
  data: Partial<ServiceCreateData>,
  token: string
) {
  const response = await fetch(
    `${API_URL}/ngo/services/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to update service")
    );
  }

  return result;
}


export async function deleteNGOService(
  id: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/ngo/services/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to delete service")
    );
  }

  return result;
}

// ======================================================
// NGO APPLICATIONS
// ======================================================

export interface NGOApplication {
  application_id: number;
  opportunity_id: number;
  opportunity_title: string;
  volunteer_profile_id: number;
  volunteer_user_id: number;
  volunteer_name: string | null;
  volunteer_email: string | null;
  skills: string | null;
  interests: string | null;
  availability: string | null;
  location: string | null;
  status: string;
  applied_at: string;
}

export async function getNGOApplications(
  token: string
): Promise<NGOApplication[]> {
  const response = await fetch(`${API_URL}/ngo/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch applications")
    );
  }

  return result;
}

async function updateApplication(
  id: number,
  action: "accept" | "reject" | "complete",
  token: string
) {
  const response = await fetch(
    `${API_URL}/ngo/applications/${id}/${action}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, `Failed to ${action} application`)
    );
  }

  return result;
}

export async function acceptNGOApplication(
  id: number,
  token: string
) {
  return updateApplication(id, "accept", token);
}

export async function rejectNGOApplication(
  id: number,
  token: string
) {
  return updateApplication(id, "reject", token);
}

export async function completeNGOApplication(
  id: number,
  token: string
) {
  return updateApplication(id, "complete", token);
}


// ======================================================
// NGO SERVICE REQUESTS
// ======================================================

export interface NGOServiceRequest {
  id: number;
  user_id: number;
  user_name: string | null;
  user_email: string | null;
  service_type: string;
  description: string | null;
  location: string | null;
  status: string;
  created_at: string;
}

export async function getNGOServiceRequests(
  token: string
): Promise<NGOServiceRequest[]> {
  const response = await fetch(
    `${API_URL}/service-requests/ngo`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to fetch service requests"
      )
    );
  }

  return result;
}

export async function getNGOService(
  id: number,
  token: string
): Promise<Service> {
  const response = await fetch(
    `${API_URL}/ngo/services/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch service")
    );
  }

  return result;
}

async function updateServiceRequest(
  id: number,
  action: "accept" | "reject" | "complete",
  token: string
) {
  const response = await fetch(
    `${API_URL}/service-requests/ngo/${id}/${action}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        `Failed to ${action} service request`
      )
    );
  }

  return result;
}

export async function acceptNGOServiceRequest(
  id: number,
  token: string
) {
  return updateServiceRequest(id, "accept", token);
}

export async function rejectNGOServiceRequest(
  id: number,
  token: string
) {
  return updateServiceRequest(id, "reject", token);
}

export async function completeNGOServiceRequest(
  id: number,
  token: string
) {
  return updateServiceRequest(id, "complete", token);
}


// ======================================================
// NOTIFICATIONS
// ======================================================

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(
  token: string
): Promise<Notification[]> {
  const response = await fetch(
    `${API_URL}/notifications/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to fetch notifications"
      )
    );
  }

  return result;
}

export async function markNotificationRead(
  id: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/notifications/${id}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to mark notification as read"
      )
    );
  }

  return result;
}

export async function markAllNotificationsRead(
  token: string
) {
  const response = await fetch(
    `${API_URL}/notifications/read-all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to mark notifications as read"
      )
    );
  }

  return result;
}
// ============================================================
// ADMIN API
// ============================================================

export interface AdminDashboard {
  users: {
    total: number;
  };
  ngos: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  volunteers: {
    total: number;
  };
  opportunities: {
    total: number;
    published: number;
  };
  applications: {
    total: number;
    pending: number;
  };
  service_requests: {
    total: number;
    pending: number;
  };
}

export interface AdminNGO {
  id: number;
  user_id: number;
  organization_name: string;
  description: string | null;
  address: string | null;
  website: string | null;
  status: string;
  approved_at: string | null;
  created_at: string;
  email: string | null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminVolunteer {
  volunteer_profile_id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  skills: string | null;
  interests: string | null;
  availability: string | null;
  location: string | null;
  is_active: boolean;
}

export interface AdminOpportunity {
  id: number;
  ngo_id: number;
  title: string;
  description: string | null;
  opportunity_type: string;
  payment_type: string;
  location: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  requirements: string | null;
  capacity: number | null;
  application_deadline: string | null;
  status: string;
  original_opportunity_id: number | null;
  created_at: string;
}

export interface AdminApplication {
  application_id: number;
  opportunity_id: number;
  opportunity_title: string | null;
  volunteer_id: number;
  volunteer_user_id: number | null;
  volunteer_name: string | null;
  volunteer_email: string | null;
  status: string;
  applied_at: string;
}

export interface AdminServiceRequest {
  id: number;
  user_id: number;
  user_name: string | null;
  user_email: string | null;
  ngo_id: number | null;
  ngo_name: string | null;
  service_type: string;
  description: string | null;
  location: string | null;
  status: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: number;
  user_id: number;
  action: string;
  entity: string;
  entity_id: number;
  created_at: string;
}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

export async function getAdminDashboard(
  token: string
): Promise<AdminDashboard> {
  const response = await fetch(
    `${API_URL}/admin/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch admin dashboard")
    );
  }

  return result;
}


// ============================================================
// ADMIN NGOs
// ============================================================

export async function getAdminNGOs(
  token: string
): Promise<AdminNGO[]> {
  const response = await fetch(
    `${API_URL}/admin/ngos`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch NGOs")
    );
  }

  return result;
}


export async function getPendingAdminNGOs(
  token: string
): Promise<AdminNGO[]> {
  const response = await fetch(
    `${API_URL}/admin/ngos/pending`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch pending NGOs")
    );
  }

  return result;
}


export async function approveAdminNGO(
  ngoId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/admin/ngos/${ngoId}/approve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to approve NGO")
    );
  }

  return result;
}


export async function rejectAdminNGO(
  ngoId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/admin/ngos/${ngoId}/reject`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to reject NGO")
    );
  }

  return result;
}


// ============================================================
// ADMIN USERS
// ============================================================

export async function getAdminUsers(
  token: string
): Promise<AdminUser[]> {
  const response = await fetch(
    `${API_URL}/admin/users`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch users")
    );
  }

  return result;
}


export async function activateAdminUser(
  userId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}/activate`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to activate user")
    );
  }

  return result;
}
export async function getAdminUser(
  userId: number,
  token: string
): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch user")
    );
  }

  return result;
}

export async function deactivateAdminUser(
  userId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}/deactivate`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to deactivate user")
    );
  }

  return result;
}


// ============================================================
// ADMIN VOLUNTEERS
// ============================================================

export async function getAdminVolunteers(
  token: string
): Promise<AdminVolunteer[]> {
  const response = await fetch(
    `${API_URL}/admin/volunteers`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch volunteers")
    );
  }

  return result;
}


// ============================================================
// ADMIN OPPORTUNITIES
// ============================================================

export async function getAdminOpportunities(
  token: string
): Promise<AdminOpportunity[]> {
  const response = await fetch(
    `${API_URL}/admin/opportunities`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch opportunities")
    );
  }

  return result;
}


export async function updateAdminOpportunityStatus(
  opportunityId: number,
  newStatus: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/admin/opportunities/${opportunityId}/status?new_status=${encodeURIComponent(
      newStatus
    )}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to update opportunity status"
      )
    );
  }

  return result;
}


// ============================================================
// ADMIN APPLICATIONS
// ============================================================

export async function getAdminApplications(
  token: string
): Promise<AdminApplication[]> {
  const response = await fetch(
    `${API_URL}/admin/applications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch applications")
    );
  }

  return result;
}


// ============================================================
// ADMIN SERVICE REQUESTS
// ============================================================

export async function getAdminServiceRequests(
  token: string
): Promise<AdminServiceRequest[]> {
  const response = await fetch(
    `${API_URL}/admin/service-requests`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to fetch service requests"
      )
    );
  }

  return result;
}


export async function updateAdminServiceRequestStatus(
  requestId: number,
  newStatus: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/admin/service-requests/${requestId}/status?new_status=${encodeURIComponent(
      newStatus
    )}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to update service request"
      )
    );
  }

  return result;
}


// ============================================================
// ADMIN AUDIT LOGS
// ============================================================

export async function getAdminAuditLogs(
  token: string
): Promise<AdminAuditLog[]> {
  const response = await fetch(
    `${API_URL}/admin/audit-logs`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch audit logs")
    );
  }

  return result;
}

export async function getAdminOpportunity(
  opportunityId: number,
  token: string
): Promise<AdminOpportunity> {
  const response = await fetch(
    `${API_URL}/admin/opportunities/${opportunityId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Failed to fetch opportunity")
    );
  }

  return result;
}