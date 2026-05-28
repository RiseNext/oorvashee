import type { Metadata } from "next";

import { AccountShell } from "@/features/account/account-shell";
import { OrderHistoryView } from "@/features/account/order-history-view";

export const metadata: Metadata = { title: "My Orders" };

export default function AccountOrdersPage() {
  return (
    <AccountShell title="My Orders">
      <OrderHistoryView />
    </AccountShell>
  );
}
