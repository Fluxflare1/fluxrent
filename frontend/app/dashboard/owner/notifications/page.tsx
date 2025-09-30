// frontend/app/dashboard/owner/notifications/page.tsx
"use client";
import { useState } from "react";
import { broadcastNotification } from "@/lib/apiOwner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  const [target, setTarget] = useState("all");
  const [channel, setChannel] = useState("email");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function handleSend() {
    try {
      const res = await broadcastNotification({ target, channel, message });
      setStatus(`Sent to ${res.recipients} recipients`);
    } catch (err: any) {
      setStatus("Error sending notification");
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <Card>
        <CardContent className="space-y-4">
          <h1 className="text-xl">Broadcast Notification</h1>
          <select value={target} onChange={e => setTarget(e.target.value)} className="border p-2 w-full">
            <option value="all">All Users</option>
            <option value="tenants">Tenants</option>
            <option value="managers">Managers</option>
            <option value="agents">Agents</option>
          </select>
          <select value={channel} onChange={e => setChannel(e.target.value)} className="border p-2 w-full">
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="slack">Slack</option>
          </select>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Enter message..."
            className="border p-2 w-full h-32"
          />
          <Button onClick={handleSend}>Send</Button>
          {status && <p className="text-sm text-gray-600">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
