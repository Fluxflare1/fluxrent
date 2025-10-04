import api from "./api-client";

// Invoices
export const fetchInvoices = () => api.get("/bills/invoices/");
export const fetchInvoice = (id: string) => api.get(`/bills/invoices/${id}/`);
export const createInvoice = (payload: any) => api.post("/bills/invoices/", payload);
export const updateInvoice = (id: string, payload: any) => api.put(`/bills/invoices/${id}/`, payload);

// Bill Items
export const createBillItem = (payload: any) => api.post("/bills/items/", payload);
export const updateBillItem = (id: string, payload: any) => api.put(`/bills/items/${id}/`, payload);
