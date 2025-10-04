"use client";

import { RentService } from "@/services/rent.service";

interface Props {
  paymentId: number;
}

export default function ReceiptViewer({ paymentId }: Props) {
  const downloadPdf = async () => {
    const blob = await RentService.getReceiptPdf(paymentId);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${paymentId}.pdf`;
    link.click();
  };

  return (
    <div>
      <button
        onClick={downloadPdf}
        className="px-3 py-1 bg-gray-800 text-white rounded"
      >
        Download Receipt
      </button>
    </div>
  );
}
