import { siteConfig } from "@/config/site";

const currencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

const currencyFormatterWithPaise = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  minimumFractionDigits: 2,
});

export function formatPrice(amount: number, options?: { showPaise?: boolean }) {
  const formatter = options?.showPaise
    ? currencyFormatterWithPaise
    : currencyFormatter;
  return formatter.format(amount);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDate(input: string | number | Date) {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(input));
}
