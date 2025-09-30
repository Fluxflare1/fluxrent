"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockUsers = [
  { id: 1, name: "Jane Doe", role: "Tenant", email: "jane@example.com" },
  { id: 2, name: "John Smith", role: "Agent", email: "john@example.com" },
];

export default function OwnerUsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
