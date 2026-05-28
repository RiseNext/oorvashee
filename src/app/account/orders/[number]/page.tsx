import type { Metadata } from "next";

import { AccountShell } from "@/features/account/account-shell";
import { AccountOrderView } from "@/features/account/account-order-view";

export const metadata: Metadata = { title: "Order Detail" };

export default async function AccountOrderPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return (
    <AccountShell title={`Order #${number}`}>
      <AccountOrderView orderNumber={number} />
    </AccountShell>
  );
}
