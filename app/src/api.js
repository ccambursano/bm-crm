async function request(path, options) {
  const res = await fetch(`/api/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Error ${res.status} en /api/${path}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  list: (resource) => request(resource),
  create: (resource, data) => request(resource, { method: "POST", body: JSON.stringify(data) }),
  update: (resource, id, data) => request(`${resource}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (resource, id) => request(`${resource}/${id}`, { method: "DELETE" }),
};

export async function getCurrentUser() {
  try {
    const res = await fetch("/.auth/me");
    const data = await res.json();
    return data?.clientPrincipal || null;
  } catch {
    return null;
  }
}
