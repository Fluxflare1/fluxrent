// frontend/lib/apiOwner.ts
import api from "./api";

export async function fetchOwnerSummary() {
  return api.get("/owner/dashboard/summary/").then(res => res.data);
}

export async function fetchRevenueBreakdown() {
  return api.get("/owner/dashboard/revenue_breakdown/").then(res => res.data);
}

export async function fetchAllUsers() {
  return api.get("/owner/users/").then(res => res.data);
}

export async function suspendUser(id: number) {
  return api.post(`/owner/users/${id}/suspend/`).then(res => res.data);
}

export async function verifyKYC(id: number) {
  return api.post(`/owner/users/${id}/verify_kyc/`).then(res => res.data);
}

export async function fetchBoostedProperties() {
  return api.get("/owner/properties/").then(res => res.data);
}



// frontend/lib/apiOwner.ts (append)

export async function broadcastNotification(payload: {
  target: string;
  message: string;
  channel: string;
}) {
  return api.post("/owner/notifications/broadcast/", payload).then(res => res.data);
}

export async function fetchSettings() {
  return api.get("/owner/settings/").then(res => res.data);
}

export async function updateSetting(id: number, value: string) {
  return api.put(`/owner/settings/${id}/`, { value }).then(res => res.data);
}
