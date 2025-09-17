// frontend/lib/googleSheets.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Reuse UserRow type
export type UserRow = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  status?: string;
  created_at?: string;
};

// --- Users ---
export async function getAllUsers() { return (await axios.get(`${API_URL}/users/`)).data; }
export async function getUserByEmail(email: string) { return (await axios.get(`${API_URL}/users/by_email/`, { params: { email } })).data; }
export async function getUserById(id: string) { return (await axios.get(`${API_URL}/users/${id}/`)).data; }
export async function verifyPassword(email: string, password: string) { return (await axios.post(`${API_URL}/users/verify-password/`, { email, password })).data; }
export async function upsertUser(user: Partial<UserRow>) { return (await axios.post(`${API_URL}/users/upsert/`, user)).data; }

// --- Tenants ---
export async function getTenants() { return (await axios.get(`${API_URL}/tenants/`)).data; }

// --- Bills ---
export async function getBills() { return (await axios.get(`${API_URL}/bills/`)).data; }
export async function addBill(payload: any) { return (await axios.post(`${API_URL}/bills/`, payload)).data; }

// --- Agreements ---
export async function getAgreements() { return (await axios.get(`${API_URL}/agreements/`)).data; }
export async function addAgreement(payload: any) { return (await axios.post(`${API_URL}/agreements/`, payload)).data; }

// --- Prepayments ---
export async function getPrepayments() { return (await axios.get(`${API_URL}/prepayments/`)).data; }
export async function addPrepayment(payload: any) { return (await axios.post(`${API_URL}/prepayments/`, payload)).data; }

// --- Dashboard ---
export async function getDashboardStats() { return (await axios.get(`${API_URL}/platform-admin/dashboard/`)).data; }

// --- Properties ---
export async function getProperties() { return (await axios.get(`${API_URL}/properties/`)).data; }
export async function addProperty(payload: any) { return (await axios.post(`${API_URL}/properties/`, payload)).data; }

// --- Apartments ---
export async function getApartments() { return (await axios.get(`${API_URL}/apartments/`)).data; }
export async function addApartment(payload: any) { return (await axios.post(`${API_URL}/apartments/`, payload)).data; }

// --- Utilities ---
export async function getUtilities() { return (await axios.get(`${API_URL}/utilities/`)).data; }
export async function addUtility(payload: any) { return (await axios.post(`${API_URL}/utilities/`, payload)).data; }

// --- Templates ---
export async function getTemplates() { return (await axios.get(`${API_URL}/templates/`)).data; }
export async function addTemplate(payload: any) { return (await axios.post(`${API_URL}/templates/`, payload)).data; }

// --- Notifications ---
export async function getNotifications() { return (await axios.get(`${API_URL}/notifications/`)).data; }
export async function logNotification(payload: any) { return (await axios.post(`${API_URL}/notifications/`, payload)).data; }

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
  getProperties,
  addProperty,
  getApartments,
  addApartment,
  getUtilities,
  addUtility,
  getTemplates,
  addTemplate,
  getNotifications,
  logNotification,
};
