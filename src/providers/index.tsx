"use client";

import { type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { CartSync } from "@/features/cart/cart-sync";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  // AuthProvider (Clerk) is outermost so every hook below it has auth context.
  // It's a no-op passthrough when Clerk isn't configured.
  return (
    <AuthProvider>
      <QueryProvider>
        <TooltipProvider delay={200}>
          {/* Merges a guest cart into the server cart after sign-in. */}
          <CartSync />
          {children}
          <Toaster position="top-center" richColors closeButton />
        </TooltipProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
