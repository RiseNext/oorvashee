import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";

// Courier portal chrome. Self-contained (no storefront navbar/footer) and
// noindex — this is an internal operations surface, edge-gated to the courier
// role in proxy.ts.
export const metadata: Metadata = {
  title: { default: "Dispatch", template: "%s · Oorvashee Dispatch" },
  robots: { index: false, follow: false },
};

export default function CourierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border-light bg-bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <div>
            <p className="font-display text-lg font-semibold leading-none text-text-primary">
              Oorvashee · Dispatch
            </p>
            <p className="mt-1 font-body text-[11px] uppercase tracking-[0.14em] text-text-muted">
              Delivery partner portal
            </p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
