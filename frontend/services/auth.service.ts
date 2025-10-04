import api from "./api";

export const requestAccess = (payload: {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}) => api.post("/users/request-access/", payload);

export const login = (email: string, password: string) =>
  api.post("/auth/token/", { email, password });

export const getMe = () => api.get("/users/me/");

export const completeKyc = (userId: string, payload: any) =>
  api.put(`/users/${userId}/kyc/`, payload);

export const changePassword = (userId: string, payload: any) =>
  api.post(`/users/${userId}/set_password/`, payload);
