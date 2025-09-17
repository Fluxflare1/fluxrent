// frontend/lib/googleSheets.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// --- User types ---
export type UserRow = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  status?: string;
  created_at?: string;
};

// --- Users ---
export async function getAllUsers(): Promise<UserRow[]> {
  const { data } = await axios.get(`${API_URL}/users/`);
  return data;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  if (!email) return null;
  const { data } = await axios.get(`${API_URL}/users/by-email/`, {
    params: { email },
  });
  return data || null;
}

export async function getUserById(id: string): Promise<UserRow | null> {
  if (!id) return null;
  const { data } = await axios.get(`${API_URL}/users/${id}/`);
  return data || null;
}

export async function verifyPassword(
  email: string,
  password: string
): Promise<UserRow | null> {
  const { data } = await axios.post(`${API_URL}/auth/verify-password/`, {
    email,
    password,
  });
  return data || null;
}

export async function upsertUser(user: Partial<UserRow>) {
  const { data } = await axios.post(`${API_URL}/users/upsert/`, user);
  return data;
}

// --- Tenants ---
export async function getTenants() {
  const { data } = await axios.get(`${API_URL}/tenants/`);
  return data;
}

// --- Bills ---
export async function getBills() {
  const { data } = await axios.get(`${API_URL}/bills/`);
  return data;
}

export async function addBill(payload: any) {
  const { data } = await axios.post(`${API_URL}/bills/`, payload);
  return data;
}

// --- Agreements ---
export async function getAgreements() {
  const { data } = await axios.get(`${API_URL}/agreements/`);
  return data;
}

export async function addAgreement(payload: any) {
  const { data } = await axios.post(`${API_URL}/agreements/`, payload);
  return data;
}

// --- Prepayments ---
export async function getPrepayments() {
  const { data } = await axios.get(`${API_URL}/prepayments/`);
  return data;
}

export async function addPrepayment(payload: any) {
  const { data } = await axios.post(`${API_URL}/prepayments/`, payload);
  return data;
}

// --- Dashboard placeholder ---
export async function getDashboardStats() {
  const { data } = await axios.get(`${API_URL}/platform-admin/dashboard/`);
  return data;
}

export default {
  getAllUsers,
  getUserByEmail,
  getUserById,
  verifyPassword,
  upsertUser,
  getTenants,
  getBills,
  addBill,
  getAgreements,
  addAgreement,
  getPrepayments,
  addPrepayment,
  getDashboardStats,
};
