"use client";
import { useEffect, useState } from "react";
import { getMe } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMe();
        setUser(data);
        if (!data.kyc || !data.kyc.full_name) {
          router.push("/kyc");
        }
      } catch {
        router.push("/auth/login");
      }
    })();
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Welcome, {user.first_name}</h1>
      <p>UID: {user.uid}</p>
      <p>Wallet: {user.kyc?.wallet_id || "Not created yet"}</p>
    </div>
  );
}
