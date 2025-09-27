"use client";

export default function WalletBalances({ wallets }: { wallets: any[] }) {
  const clusters = {
    personal: wallets.filter((w) => w.type === "personal"),
    business: wallets.filter((w) => w.type === "business"),
    platform: wallets.filter((w) => w.type === "platform"),
  };

  return (
    <div className="space-y-4">
      {Object.entries(clusters).map(([type, list]) =>
        list.length > 0 ? (
          <div key={type} className="border rounded-xl p-4 shadow">
            <h2 className="text-lg font-semibold capitalize">{type} Wallets</h2>
            <ul className="mt-2 space-y-2">
              {list.map((w) => (
                <li key={w.id} className="flex justify-between">
                  <span>{w.name} ({w.wallet_number})</span>
                  <span className="font-bold">₦{w.balance}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      )}
    </div>
  );
}
