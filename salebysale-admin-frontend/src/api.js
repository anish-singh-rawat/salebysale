import axios from "axios";

const TOKEN_KEY = "sbs_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// Attach token to every request
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap data, throw on error with backend message
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "Request failed";
    throw new Error(message);
  }
);

export async function api(path, { method = "GET", body } = {}) {
  return client.request({
    url: path,
    method,
    data: body,
  });
}

export const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
