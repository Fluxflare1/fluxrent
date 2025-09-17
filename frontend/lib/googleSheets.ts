import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Simple API helper
 */
async function apiGet(path: string) {
  const res = await axios.get(`${API_BASE}${path}`);
  return res.data;
}

async function apiPost(path: string, data: any) {
  const res = await axios.post(`${API_BASE}${path}`, data);
  return res.data;
}

/**
 * === Properties ===
 */
export async function getProperties() {
  return apiGet("/properties/");
}

export async function addProperty(data: any) {
  return apiPost("/properties/", data);
}

/**
 * === Apartments ===
 */
export async function getApartments() {
  return apiGet("/apartments/");
}

export async function addApartment(data: any) {
  return apiPost("/apartments/", data);
}

/**
 * === Utilities ===
 */
export async function getUtilities() {
  return apiGet("/utilities/");
}

export async function addUtility(data: any) {
  return apiPost("/utilities/", data);
}

/**
 * === Templates ===
 */
export async function getTemplates() {
  return apiGet("/templates/");
}

export async function addTemplate(data: any) {
  return apiPost("/templates/", data);
}

/**
 * === Notifications ===
 */
export async function getNotifications() {
  return apiGet("/notifications/");
}

export async function logNotification(data: any) {
  return apiPost("/notifications/", data);
}

/**
 * === Bills ===
 */
export async function getBills() {
  return apiGet("/bills/");
}

export async function addBill(data: any) {
  return apiPost("/bills/", data);
}

/**
 * === Agreements ===
 */
export async function getAgreements() {
  return apiGet("/agreements/");
}

export async function addAgreement(data: any) {
  return apiPost("/agreements/", data);
}

/**
 * === Users ===
 */
export async function getUsers() {
  return apiGet("/users/");
}

export async function addUser(data: any) {
  return apiPost("/users/", data);
}
