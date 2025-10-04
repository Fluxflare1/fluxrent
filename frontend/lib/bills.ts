// frontend/lib/api/bills.ts
import { api } from "@/lib/api"; // import the named export

export interface BillItemPayload {
  id?: number;
  description: string;
  amount: number | string;
}

export interface InvoicePayload {
  tenant_apartment: number;
  type: "rent" | "utility" | "other";
  due_date: string; // ISO date
  total_amount?: number | string;
  items?: BillItemPayload[];
}

export const fetchInvoices = (params?: any) => api.get("/bills/invoices/", { params });
export const fetchInvoice = (id: number) => api.get(`/bills/invoices/${id}/`);
export const createInvoice = (payload: InvoicePayload) => api.post("/bills/invoices/", payload);
export const updateInvoice = (id: number, payload: InvoicePayload) => api.put(`/bills/invoices/${id}/`, payload);
export const deleteInvoice = (id: number) => api.delete(`/bills/invoices/${id}/`);

export const fetchBillItems = (params?: any) => api.get("/bills/items/", { params });
export const createBillItem = (payload: any) => api.post("/bills/items/", payload);
export const updateBillItem = (id: number, payload: any) => api.put(`/bills/items/${id}/`, payload);
export const deleteBillItem = (id: number) => api.delete(`/bills/items/${id}/`);
