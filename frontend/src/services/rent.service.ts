import api from "./api"; // your axios instance
import { 
  Tenancy, RentInvoice, RentPayment, Receipt, LateFeeRule 
} from "@/types/rent.types";

export const RentService = {
  // --- TENANCY ---
  async listTenancies(params?: Record<string, any>): Promise<Tenancy[]> {
    const res = await api.get("/rents/tenancies/", { params });
    return res.data;
  },
  async createTenancy(payload: Partial<Tenancy>): Promise<Tenancy> {
    const res = await api.post("/rents/tenancies/", payload);
    return res.data;
  },

  // --- LATE FEES ---
  async listLateFeeRules(): Promise<LateFeeRule[]> {
    const res = await api.get("/rents/late-fee-rules/");
    return res.data;
  },

  // --- INVOICES ---
  async listInvoices(params?: Record<string, any>): Promise<RentInvoice[]> {
    const res = await api.get("/rents/invoices/", { params });
    return res.data;
  },
  async generateInvoice(payload: { tenancy_id: number; due_date: string; amount?: string }) {
    const res = await api.post("/rents/invoices/generate/", payload);
    return res.data;
  },
  async markInvoicePaid(id: number) {
    const res = await api.post(`/rents/invoices/${id}/mark_paid/`);
    return res.data;
  },

  // --- PAYMENTS ---
  async payWithWallet(payload: { invoice: string; amount: string }) {
    const res = await api.post("/rents/payments/pay_with_wallet/", payload);
    return res.data;
  },
  async recordExternalPayment(payload: { invoice_id: number; amount: string; method: string; reference?: string }) {
    const res = await api.post("/rents/payments/record_external/", payload);
    return res.data;
  },
  async confirmPayment(id: number) {
    const res = await api.post(`/rents/payments/${id}/confirm/`);
    return res.data;
  },
  async getReceiptPdf(id: number) {
    const res = await api.get(`/rents/payments/${id}/receipt_pdf/`, { responseType: "blob" });
    return res.data;
  },
  async getReceiptHtml(id: number) {
    const res = await api.get(`/rents/payments/${id}/receipt_html/`);
    return res.data;
  },

  // --- REPORTS ---
  async getCollectionSummary(params?: Record<string, any>) {
    const res = await api.get("/rents/reports/collection-summary/", { params });
    return res.data;
  },
  async previewLateFees(payload: { action: "preview" | "apply"; property_id?: number; tenancy_id?: number }) {
    const res = await api.post("/rents/reports/late-fees/", payload);
    return res.data;
  },
};
