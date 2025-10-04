import TenancyList from "@/components/rents/TenancyList";
import InvoiceList from "@/components/rents/InvoiceList";

export default function RentsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TenancyList />
      <InvoiceList />
    </div>
  );
}
