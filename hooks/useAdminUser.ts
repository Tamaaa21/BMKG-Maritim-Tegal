"use client";

import { createContext, useContext } from "react";

export interface AdminUser {
  id: string;
  username: string;
  role: string;
  nama: string;
}

export interface AdminUserContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export const AdminUserContext = createContext<AdminUserContextType>({
  user: null,
  isAdmin: false,
  isLoggedIn: false,
});

export function useAdminUser() {
  return useContext(AdminUserContext);
}
