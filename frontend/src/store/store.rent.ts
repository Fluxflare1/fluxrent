import { create } from "zustand";
import { RentService } from "@/services/rent.service";
import { Tenancy, RentInvoice, RentPayment } from "@/types/rent.types";

interface RentState {
  tenancies: Tenancy[];
  invoices: RentInvoice[];
  loading: boolean;
  fetchTenancies: () => Promise<void>;
  fetchInvoices: (params?: any) => Promise<void>;
}

export const useRentStore = create<RentState>((set) => ({
  tenancies: [],
  invoices: [],
  loading: false,

  fetchTenancies: async () => {
    set({ loading: true });
    try {
      const data = await RentService.listTenancies();
      set({ tenancies: data });
    } finally {
      set({ loading: false });
    }
  },

  fetchInvoices: async (params) => {
    set({ loading: true });
    try {
      const data = await RentService.listInvoices(params);
      set({ invoices: data });
    } finally {
      set({ loading: false });
    }
  },
}));
