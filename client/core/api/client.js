// Core API client with JWT auth, unified error handling, and request helpers.
const getToken = () => sessionStorage.getItem("authToken");

const request = async (method, endpoint, data = null, opts = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const baseUrl = import.meta.env.VITE_API_URL || "";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  const res = await fetch(url, {
    method,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...opts,
  });

  if (res.status === 401) {
    alert(`401 Unauthorized on ${method} ${endpoint}\nToken: ${!!token}`);
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Error ${res.status}`);
  return json;
};

export const apiClient = {
  get: (url, opts) => request("GET", url, null, opts),
  post: (url, data, opts) => request("POST", url, data, opts),
  put: (url, data, opts) => request("PUT", url, data, opts),
  patch: (url, data, opts) => request("PATCH", url, data, opts),
  delete: (url, opts) => request("DELETE", url, null, opts),
};

export default apiClient;
