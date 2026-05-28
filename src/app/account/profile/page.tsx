import type { Metadata } from "next";

import { AccountShell } from "@/features/account/account-shell";
import { ProfileView } from "@/features/account/profile-view";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <AccountShell title="Profile">
      <ProfileView />
    </AccountShell>
  );
}
