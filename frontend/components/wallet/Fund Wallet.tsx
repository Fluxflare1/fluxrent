"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function FundWallet({ email, amount }: { email: string; amount: number }) {
  const handlePaystack = () => {
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email,
      amount: amount * 100, // Paystack uses kobo
      callback: function (response: any) {
        // TODO: Call backend to confirm & credit wallet
        alert("Payment successful. Ref: " + response.reference);
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });
    handler.openIframe();
  };

  return <Button onClick={handlePaystack}>Fund ₦{amount}</Button>;
}
