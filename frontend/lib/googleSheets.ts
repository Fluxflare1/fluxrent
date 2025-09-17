import { apiFetch } from "./api";

// === Properties ===
export async function getProperties() {
  return apiFetch("/api/properties/");
}
export async function addProperty(data: any) {
  return apiFetch("/api/properties/", { method: "POST", body: JSON.stringify(data) });
}

// === Apartments ===
export async function getApartments() {
  return apiFetch("/api/apartments/");
}
export async function addApartment(data: any) {
  return apiFetch("/api/apartments/", { method: "POST", body: JSON.stringify(data) });
}

// === Bills ===
export async function getBills() {
  return apiFetch("/api/bills/");
}
export async function addBill(data: any) {
  return apiFetch("/api/bills/", { method: "POST", body: JSON.stringify(data) });
}
export async function getBillById(id: string) {
  return apiFetch(`/api/bills/${id}/`);
}
export async function addBillPayment(id: string, data: any) {
  return apiFetch(`/api/bills/${id}/pay/`, { method: "POST", body: JSON.stringify(data) });
}

// === Rent Schedules ===
export async function getRentSchedules() {
  return apiFetch("/api/rents/");
}
export async function markRentPaid(id: string) {
  return apiFetch(`/api/rents/${id}/pay/`, { method: "POST" });
}

// === Payments ===
export async function getPayments() {
  return apiFetch("/api/payments/");
}
export async function recordPayment(data: any) {
  return apiFetch("/api/payments/", { method: "POST", body: JSON.stringify(data) });
}

// === Agreements ===
export async function getAgreements() {
  return apiFetch("/api/agreements/");
}
export async function addAgreement(data: any) {
  return apiFetch("/api/agreements/", { method: "POST", body: JSON.stringify(data) });
}

// === Notifications ===
export async function getNotifications() {
  return apiFetch("/api/notifications/");
}
export async function logNotification(data: any) {
  return apiFetch("/api/notifications/", { method: "POST", body: JSON.stringify(data) });
}

// === Utilities ===
export async function getUtilities() {
  return apiFetch("/api/utilities/");
}
export async function addUtility(data: any) {
  return apiFetch("/api/utilities/", { method: "POST", body: JSON.stringify(data) });
}

// === Templates ===
export async function getTemplates() {
  return apiFetch("/api/templates/");
}
export async function addTemplate(data: any) {
  return apiFetch("/api/templates/", { method: "POST", body: JSON.stringify(data) });
}

// === Invoices / Receipts ===
export async function addInvoiceRow(data: any) {
  return apiFetch("/api/invoices/", { method: "POST", body: JSON.stringify(data) });
}
export async function addReceiptLinkToPayment(paymentId: string, link: string) {
  return apiFetch(`/api/receipts/generate/`, {
    method: "POST",
    body: JSON.stringify({ paymentId, link }),
  });
}

// === Users / Tenants ===
export async function getUsers() {
  return apiFetch("/api/users/");
}
export async function addUser(data: any) {
  return apiFetch("/api/users/", { method: "POST", body: JSON.stringify(data) });
}
export async function getTenants() {
  return apiFetch("/api/tenants/");
}
