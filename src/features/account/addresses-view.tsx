"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

import {
  useAddressStore,
  type SavedAddress,
  type SavedAddressInput,
} from "@/store/address-store";
import { cn } from "@/lib/utils";

const input = cn(
  "w-full rounded-lg border border-border-default bg-white px-4 py-2.5 font-body text-sm text-text-primary",
  "placeholder:text-text-muted/60 outline-none transition-colors focus:border-border-focus",
);

const EMPTY: SavedAddressInput = {
  label: "",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
};

/** Content-only — rendered inside `AccountShell`. Client-persisted address book. */
export function AddressesView() {
  const addresses = useAddressStore((s) => s.addresses);
  const add = useAddressStore((s) => s.add);
  const update = useAddressStore((s) => s.update);
  const remove = useAddressStore((s) => s.remove);
  const setDefault = useAddressStore((s) => s.setDefault);

  const [mode, setMode] = useState<"list" | "new" | string>("list"); // "list" | "new" | <id>

  if (mode === "new") {
    return (
      <AddressForm
        initial={EMPTY}
        onCancel={() => setMode("list")}
        onSave={(v) => {
          add(v);
          setMode("list");
        }}
      />
    );
  }
  if (mode !== "list") {
    const existing = addresses.find((a) => a.id === mode);
    if (existing) {
      return (
        <AddressForm
          initial={existing}
          onCancel={() => setMode("list")}
          onSave={(v) => {
            update(existing.id, v);
            setMode("list");
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-light bg-bg-card py-16 text-center">
          <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
            <MapPin className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <p className="max-w-md font-body text-sm text-text-secondary">
            No saved addresses yet. Add one to check out faster next time.
          </p>
        </div>
      ) : (
        addresses.map((a) => (
          <AddressCard
            key={a.id}
            address={a}
            onEdit={() => setMode(a.id)}
            onRemove={() => remove(a.id)}
            onMakeDefault={() => setDefault(a.id)}
          />
        ))
      )}

      <button
        type="button"
        onClick={() => setMode("new")}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-border-default py-4",
          "font-body text-sm font-medium text-text-secondary transition-colors hover:border-cta-fill hover:text-cta-fill",
        )}
      >
        <Plus className="h-4 w-4" />
        Add a new address
      </button>
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onRemove,
  onMakeDefault,
}: {
  address: SavedAddress;
  onEdit: () => void;
  onRemove: () => void;
  onMakeDefault: () => void;
}) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-card p-5 shadow-[0_1px_2px_rgba(61,26,8,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-body text-sm font-semibold text-text-primary">{address.recipientName}</p>
            {address.label && (
              <span className="rounded-full bg-bg-secondary px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.1em] text-text-secondary">
                {address.label}
              </span>
            )}
            {address.isDefault && (
              <span className="rounded-full bg-cta-fill/10 px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.1em] text-cta-fill">
                Default
              </span>
            )}
          </div>
          <p className="mt-1 font-body text-sm text-text-secondary">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
          </p>
          <p className="font-body text-sm text-text-secondary">
            {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
          </p>
          <p className="mt-1 font-body text-xs text-text-muted">{address.phone}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" aria-label="Edit address" onClick={onEdit} className="rounded-md p-2 text-text-muted transition-colors hover:text-text-primary">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Delete address" onClick={onRemove} className="rounded-md p-2 text-text-muted transition-colors hover:text-cta-fill">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {!address.isDefault && (
        <button
          type="button"
          onClick={onMakeDefault}
          className="mt-3 font-body text-xs uppercase tracking-[0.12em] text-cta-fill transition-colors hover:text-cta-fill-hover"
        >
          Set as default
        </button>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: SavedAddressInput;
  onSave: (v: SavedAddressInput) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<SavedAddressInput>(initial);
  const set = (k: keyof SavedAddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  const valid =
    v.recipientName.trim() &&
    v.phone.trim().length >= 6 &&
    v.line1.trim() &&
    v.city.trim() &&
    v.state.trim() &&
    v.postalCode.trim().length >= 4;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave({ ...v, country: v.country || "IN" });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input className={input} placeholder="Label (e.g. Home)" value={v.label ?? ""} onChange={set("label")} />
        <input className={input} placeholder="Full name" value={v.recipientName} onChange={set("recipientName")} />
        <input className={input} placeholder="Phone" inputMode="tel" value={v.phone} onChange={set("phone")} />
        <input className={input} placeholder="PIN code" inputMode="numeric" value={v.postalCode} onChange={set("postalCode")} />
        <input className={cn(input, "sm:col-span-2")} placeholder="Address line 1" value={v.line1} onChange={set("line1")} />
        <input className={cn(input, "sm:col-span-2")} placeholder="Address line 2 (optional)" value={v.line2 ?? ""} onChange={set("line2")} />
        <input className={input} placeholder="City" value={v.city} onChange={set("city")} />
        <input className={input} placeholder="State" value={v.state} onChange={set("state")} />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!valid}
          className="rounded-full bg-text-primary px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-bg-dark disabled:opacity-40"
        >
          Save address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border-default px-6 py-2.5 font-body text-xs font-medium uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
