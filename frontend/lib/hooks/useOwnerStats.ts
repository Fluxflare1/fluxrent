// frontend/lib/hooks/useOwnerStats.ts
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { formatISO } from "date-fns";

export interface MonthValue {
  month: string;
  value: number;
}

export interface TopBoost {
  property_id: number | null;
  title: string;
  revenue: number;
}

const fetchRevenue = async (params?: { start_date?: string; end_date?: string }) => {
  const res = await axios.get<MonthValue[]>("/owner/stats/revenue/", { params });
  return res.data;
};

const fetchUsers = async (params?: { start_date?: string; end_date?: string }) => {
  const res = await axios.get<MonthValue[]>("/owner/stats/users/", { params });
  return res.data;
};

const fetchTopBoosts = async (params?: { start_date?: string; end_date?: string; limit?: number }) => {
  const res = await axios.get<TopBoost[]>("/owner/stats/top-boosts/", { params });
  return res.data;
};

export function useRevenueStats(params?: { start_date?: string; end_date?: string }) {
  return useQuery(["owner", "revenue", params], () => fetchRevenue(params), { staleTime: 1000 * 60 * 60 });
}

export function useUserGrowth(params?: { start_date?: string; end_date?: string }) {
  return useQuery(["owner", "users", params], () => fetchUsers(params), { staleTime: 1000 * 60 * 60 });
}

export function useTopBoosts(params?: { start_date?: string; end_date?: string; limit?: number }) {
  return useQuery(["owner", "top-boosts", params], () => fetchTopBoosts(params), { staleTime: 1000 * 60 * 60 });
}
