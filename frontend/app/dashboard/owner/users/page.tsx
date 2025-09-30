// frontend/app/dashboard/owner/users/page.tsx
"use client";
import { useEffect, useState } from "react";
import { fetchAllUsers, suspendUser, verifyKYC } from "@/lib/apiOwner";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAllUsers().then(setUsers);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">User Management</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Email</th><th>Role</th><th>Status</th><th>KYC</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? "Active" : "Suspended"}</td>
              <td>{u.kyc_verified ? "Verified" : "Pending"}</td>
              <td className="space-x-2">
                <Button size="sm" onClick={() => suspendUser(u.id)}>Suspend</Button>
                <Button size="sm" onClick={() => verifyKYC(u.id)}>Verify KYC</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
