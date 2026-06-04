"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductDetailData } from "./data";

interface AccordionItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

function AccordionRow({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border-light">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-body text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
          {item.label}
        </span>
        {isOpen ? (
          <Minus className="h-4 w-4 shrink-0 text-text-muted" />
        ) : (
          <Plus className="h-4 w-4 shrink-0 text-text-muted" />
        )}
      </button>

      {/* CSS grid trick for smooth height transition */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-4 font-body text-sm leading-relaxed text-text-secondary">
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccordionSections({ product }: { product: ProductDetailData }) {
  const [openId, setOpenId] = useState<string | null>("description");

  const items: AccordionItem[] = [
    {
      id: "description",
      label: "Product Description",
      content: (
        <p className="whitespace-pre-line">{product.description}</p>
      ),
    },
    {
      id: "specification",
      label: "Product Specification",
      content: (
        <table className="w-full text-sm">
          <tbody>
            {product.specification.map(({ label, value }) => (
              <tr key={label} className="border-b border-border-light last:border-0">
                <td className="w-2/5 py-2 pr-4 font-medium text-text-secondary">{label}</td>
                <td className="py-2 text-text-primary">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      id: "return",
      label: "Returns & Refunds",
      content: <p className="whitespace-pre-line">{product.returnPolicy}</p>,
    },
    {
      id: "shipping",
      label: "Shipping & Delivery",
      content: <p className="whitespace-pre-line">{product.shippingInfo}</p>,
    },
    {
      id: "manufactured",
      label: "Manufactured By",
      content: <p className="whitespace-pre-line">{product.manufacturedBy}</p>,
    },
    {
      id: "customer-care",
      label: "Customer Care",
      content: <p className="whitespace-pre-line">{product.customerCare}</p>,
    },
  ];

  return (
    <div className="mt-6 border-t border-border-light">
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
        />
      ))}
    </div>
  );
}
