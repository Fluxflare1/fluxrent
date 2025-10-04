import api from "../api";

export interface TenantBond {
  id: number;
  uid: string;
  tenant: number;
  property_manager: number;
  status: string;
  created_at: string;
}

export interface TenantApartment {
  id: number;
  uid: string;
  tenant_bond: number;
  apartment: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface StatementOfStay {
  id: number;
  uid: string;
  tenant_apartment: number;
  summary: string;
  issued_at: string;
}

// ---------- Bonds ----------
export const fetchTenantBonds = async () => {
  const { data } = await api.get<TenantBond[]>("/tenants/bonds/");
  return data;
};

export const createTenantBond = async (payload: Partial<TenantBond>) => {
  const { data } = await api.post<TenantBond>("/tenants/bonds/", payload);
  return data;
};

export const updateTenantBond = async (id: number, payload: Partial<TenantBond>) => {
  const { data } = await api.patch<TenantBond>(`/tenants/bonds/${id}/`, payload);
  return data;
};

// ---------- Apartments ----------
export const fetchTenantApartments = async () => {
  const { data } = await api.get<TenantApartment[]>("/tenants/apartments/");
  return data;
};

export const createTenantApartment = async (payload: Partial<TenantApartment>) => {
  const { data } = await api.post<TenantApartment>("/tenants/apartments/", payload);
  return data;
};

// ---------- Statements ----------
export const fetchStatements = async () => {
  const { data } = await api.get<StatementOfStay[]>("/tenants/statements/");
  return data;
};

export const fetchStatementDetail = async (id: number) => {
  const { data } = await api.get<StatementOfStay>(`/tenants/statements/${id}/`);
  return data;
};
