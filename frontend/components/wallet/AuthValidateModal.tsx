// frontend/components/wallet/AuthValidateModal.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  /**
   * actionName used to show context like "Confirm Transfer" or "Authorize Funding"
   */
  actionName?: string;
  /**
   * methodOptions: array e.g. ["pin","password","otp"]
   */
  methodOptions?: string[];
  /**
   * onValidated: callback when validation succeeds; receives validation payload and returns void or rejects.
   */
  onValidated: (validationResponse: any) => Promise<void> | void;
};

export default function AuthValidateModal({
  open,
  onClose,
  actionName = "Confirm Action",
  methodOptions = ["pin"],
  onValidated,
}: Props) {
  const [method, setMethod] = useState(methodOptions[0] || "pin");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!open) return null;

  async function submit() {
    setLoading(true);
    try {
      const payload = { method, value };
      // call validation endpoint
      const res = await apiFetch(ENDPOINTS.wallet.validate, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res || !res.valid) {
        toast({ title: "Validation failed", description: res?.message || "Invalid credentials" });
        setLoading(false);
        return;
      }
      await onValidated(res);
      onClose();
    } catch (err: any) {
      console.error("Validation error", err);
      toast({ title: "Validation error", description: err?.payload?.detail || err.message || "Try again" });
    } finally {
      setLoading(false);
      setValue("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-2">{actionName}</h3>
        <p className="text-sm text-slate-600 mb-4">Please authenticate to continue.</p>

        <div className="mb-4">
          <label className="block text-sm mb-1">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full border rounded p-2"
          >
            {methodOptions.map((m) => (
              <option key={m} value={m}>
                {m.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">{method === "pin" ? "Transaction PIN" : method === "otp" ? "OTP" : "Password"}</label>
          <Input
            type={method === "pin" ? "password" : method === "otp" ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={method === "pin" ? "Enter 4-6 digit PIN" : method === "otp" ? "Enter the OTP sent to you" : "Enter your password"}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setValue(""); onClose(); }}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Validating..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
