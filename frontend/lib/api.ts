const API_BASE_URL = "http://127.0.0.1:8000";

export async function login(
  email: string,
  password: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed",
    );
  }

  return data;
}

export async function getOpportunities(
  token: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/opportunities/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch opportunities",
    );
  }

  return data;
}

export async function applyForOpportunity(
  opportunityId: number,
  token: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/opportunities/${opportunityId}/apply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Failed to apply for opportunity",
    );
  }

  return data;
}