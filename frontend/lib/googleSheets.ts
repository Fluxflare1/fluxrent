import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function apiGet(path: string) {
  const res = await axios.get(`${API_BASE}${path}`);
  return res.data;
}

async function apiPost(path: string, data: any) {
  const res = await axios.post(`${API_BASE}${path}`, data);
  return res.data;
}

/**
 * Legacy compatibility exports
 * (so existing route.ts files don’t break during migration)
 */
export const googleSheets = {}; // placeholder
export const getGoogleSheets = async () => ({});
export const getSheets = async () => ({});

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
export async function assignTenantToApartment(data: any) {
  return { success: true, data }; // TODO: wire later
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
export async function getBillById(id: string) {
  return apiGet(`/bills/${id}/`);
}
export async function addBillPayment(data: any) {
  return apiPost("/bills/payments/", data);
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
export async function updateTenantKyc(data: any) {
  return { success: true, data }; // TODO
}

/**
 * === Rents ===
 */
export async function getRentSchedules() {
  return apiGet("/rents/");
}
export async function markRentPaid(id: string) {
  return apiPost(`/rents/${id}/pay/`, {});
}
export async function generateMonthlyBillsForProperty(propertyId: string) {
  return apiPost("/rents/generate/", { propertyId });
}

/**
 * === Invoices / Receipts ===
 */
export async function addInvoiceRow(data: any) {
  return apiPost("/invoices/", data);
}
export async function addReceiptLinkToPayment(paymentId: string, link: string) {
  return apiPost("/receipts/", { paymentId, link });
}

/**
 * === Payments ===
 */
export async function getPayments() {
  return apiGet("/payments/");
}
export async function recordPayment(data: any) {
  return apiPost("/payments/", data);
}
export async function recordPaymentFromPaystack(data: any) {
  return apiPost("/paystack/webhook/", data);
}

/**
 * === Users & Tenants ===
 */
export async function getUsers() {
  return apiGet("/users/");
}
export async function addUser(data: any) {
  return apiPost("/users/", data);
}
export async function getTenants() {
  return apiGet("/tenants/");
}
