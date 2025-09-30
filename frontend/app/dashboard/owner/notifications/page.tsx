"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function OwnerNotificationsPage() {
  const [message, setMessage] = useState("");

  const sendNotification = () => {
    alert(`Broadcast sent: ${message}`);
    setMessage("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Broadcast Notification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Write your broadcast message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={sendNotification} disabled={!message}>
          Send to All Users
        </Button>
      </CardContent>
    </Card>
  );
}
