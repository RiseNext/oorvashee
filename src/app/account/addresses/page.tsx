import type { Metadata } from "next";

import { AccountShell } from "@/features/account/account-shell";
import { AddressesView } from "@/features/account/addresses-view";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <AccountShell title="Addresses">
      <AddressesView />
    </AccountShell>
  );
}
