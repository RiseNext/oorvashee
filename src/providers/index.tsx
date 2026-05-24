"use client";

import { type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider delay={200}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </QueryProvider>
  );
}
