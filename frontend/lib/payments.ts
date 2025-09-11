/**
 * payments.ts
 * Small helper for allocation logic (FIFO). For MVP we provide a simple function
 * that distributes a payment amount across invoice line items (invoice objects).
 *
 * Example invoice shape:
 *  { id: 'inv_1', total: 1000, paid: 200, balance: 800 }
 *
 * This module does not write to Sheets itself; call googleSheets functions to persist.
 */

export function allocatePayment(paymentAmount:number, invoices: any[]) {
  let remaining = Number(paymentAmount)
  const allocations: any[] = []
  for (const inv of invoices) {
    const bal = Number(inv.balance || (inv.total - (inv.paid||0)))
    if (bal <= 0) continue
    const toApply = Math.min(remaining, bal)
    if (toApply <= 0) break
    allocations.push({ invoiceId: inv.id, amount: toApply })
    remaining -= toApply
    if (remaining <= 0) break
  }
  return { allocations, remaining } // remaining > 0 becomes credit/advance
}
