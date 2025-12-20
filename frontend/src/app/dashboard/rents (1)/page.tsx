import TenancyList from "@/components/rents/TenancyList";
import InvoiceList from "@/components/rents/InvoiceList";
import PaymentForm from "@/components/rents/PaymentForm";
import ReceiptViewer from "@/components/rents/ReceiptViewer";

export default function RentsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TenancyList />
      <InvoiceList />
      {/* Example payment/receipt integration */}
      <PaymentForm invoiceId={1} onSuccess={() => {}} />
      <ReceiptViewer paymentId={1} />
    </div>
  );
}
