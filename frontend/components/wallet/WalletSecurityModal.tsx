"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ENDPOINTS } from "@/lib/api";

export default function WalletSecurityModal({ open, onClose, action, token }: any) {
  const [method, setMethod] = useState<"otp" | "pin" | "password">("otp");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    const res = await fetch(ENDPOINTS.wallet.validate, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ method, value, action }),
    });
    setLoading(false);
    if (res.ok) {
      onClose();
    } else {
      alert("Validation failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-semibold">Validate {action}</h2>
          <p className="text-sm text-gray-500">Choose a method to confirm this action</p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <select
            className="w-full border rounded p-2"
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
          >
            <option value="otp">OTP</option>
            <option value="pin">PIN</option>
            <option value="password">Password</option>
          </select>

          <Input
            placeholder={`Enter ${method}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <Button disabled={loading} onClick={handleValidate} className="w-full">
            {loading ? "Validating..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
