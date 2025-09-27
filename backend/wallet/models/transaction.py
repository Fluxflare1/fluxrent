def create_refund(self, requested_by, amount=None, charge=None):
        """
        Create a refund entry for this transaction.
        """
        if hasattr(self, "refund"):
            raise ValueError("Refund already exists for this transaction")

        amount = amount or self.amount
        charge = charge if charge is not None else self.charge
        total = amount + charge

        from .refund import Refund
        return Refund.objects.create(
            transaction=self,
            amount=amount,
            charge=charge,
            total_refund=total,
            requested_by=requested_by,
            status="pending",
        )
