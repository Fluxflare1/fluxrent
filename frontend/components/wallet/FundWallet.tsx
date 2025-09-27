
"use client";

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
      amount: amount * 100,
      callback: function (response: any) {
        // TODO: POST to backend /wallet/fund/confirm/
        fetch("/api/wallets/fund/confirm/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference }),
        });
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });
    handler.openIframe();
  };

  return <Button onClick={handlePaystack}>Fund ₦{amount}</Button>;
}
