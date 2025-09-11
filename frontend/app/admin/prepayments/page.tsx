"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from "axios";

type Prepayment = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  apartment: string;
  amount: number;
  allocated_amount: number;
  balance: number;
  created_at: string;
};

export default function PrepaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState<string | null>(null);
  const [prepayments, setPrepayments] = useState<Prepayment[]>([]);

  const fetchPrepayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/accounts/prepayments");
      setPrepayments(res.data || []);
    } catch (err) {
      console.error("Error fetching prepayments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAllocate = async (id: string) => {
    setAllocating(id);
    try {
      await axios.post(`/api/accounts/prepayments/${id}/allocate`);
      await fetchPrepayments();
    } catch (err) {
      console.error("Error allocating prepayment", err);
    } finally {
      setAllocating(null);
    }
  };

  useEffect(() => {
    fetchPrepayments();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tenant Prepayments</h1>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : prepayments.length === 0 ? (
        <p className="text-gray-500">No prepayments recorded.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {prepayments.map((p) => (
            <Card key={p.id} className="shadow-lg border rounded-2xl">
              <CardHeader>
                <CardTitle>{p.tenant_name}</CardTitle>
                <p className="text-sm text-gray-500">{p.apartment}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">₦{p.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allocated:</span>
                  <span className="font-semibold">₦{p.allocated_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unallocated Balance:</span>
                  <span className="font-semibold text-blue-600">
                    ₦{p.balance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>

                {p.balance > 0 && (
                  <Button
                    onClick={() => handleAutoAllocate(p.id)}
                    disabled={allocating === p.id}
                    className="w-full mt-4"
                  >
                    {allocating === p.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Allocating...
                      </>
                    ) : (
                      "Auto Allocate"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
