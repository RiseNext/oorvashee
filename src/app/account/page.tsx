import type { Metadata } from "next";

import { AccountShell } from "@/features/account/account-shell";
import { AccountOverview } from "@/features/account/account-overview";

export const metadata: Metadata = { title: "My Account" };

export default function AccountPage() {
  return (
    <AccountShell title="My Account">
      <AccountOverview />
    </AccountShell>
  );
}
