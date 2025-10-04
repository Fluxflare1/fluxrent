import api from "./api";

// Tenant wallet
export const getWallet = () => api.get("/wallet/me/");
export const topUpWallet = (amount: number, method: string) =>
  api.post("/payments/prepayment/", { amount, method });
export const getWalletTransactions = () => api.get("/wallet/transactions/");

// Invoices & payments
export const payWithWallet = (invoiceId: number) =>
  api.post(`/payments/pay_with_wallet/`, { invoice: invoiceId });
export const confirmCashPayment = (invoiceId: number, reference: string) =>
  api.post(`/payments/confirm_cash/`, { invoice: invoiceId, reference });
export const verifyExternalPayment = (reference: string) =>
  api.post(`/payments/verify_external/`, { reference });

// Reports (manager/admin)
export const getPaymentReports = () => api.get("/payments/reports/");
export const getTenantStatement = (tenantId: number) =>
  api.get(`/payments/statement/?tenant=${tenantId}`);
