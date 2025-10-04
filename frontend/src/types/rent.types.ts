export interface Tenancy {
  id: number;
  uid: string;
  tenant: number;
  tenant_email: string;
  apartment: number;
  apartment_name: string;
  start_date: string;
  end_date?: string;
  monthly_rent: string;
  billing_cycle: "monthly" | "weekly" | "daily";
  is_active: boolean;
  created_at: string;
}

export interface LateFeeRule {
  id: number;
  property: number;
  enabled: boolean;
  percentage: string;
  fixed_amount: string;
  grace_days: number;
}

export interface RentInvoice {
  id: number;
  uid: string;
  tenancy: number;
  tenancy_uid: string;
  tenant: string;
  issue_date: string;
  due_date: string;
  amount: string;
  outstanding: string;
  status: "pending" | "partially_paid" | "paid" | "overdue" | "cancelled";
  description?: string;
}

export interface RentPayment {
  id: number;
  uid: string;
  invoice: number;
  invoice_uid: string;
  payer: number;
  payer_email: string;
  amount: string;
  method: "wallet" | "card" | "bank" | "cash" | "external";
  reference?: string;
  status: "pending" | "success" | "failed";
  created_at: string;
  confirmed_at?: string;
}

export interface Receipt {
  id: number;
  uid: string;
  payment: number;
  payment_uid: string;
  issued_at: string;
  meta?: any;
}
