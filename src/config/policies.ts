/**
 * Single source of truth for Oorvashee's legal / informational copy.
 *
 * Used by:
 *  - the dedicated pages under `/policies/*`, `/about`, `/contact`
 *  - the `PolicyAccordion` block shown under every product, in the cart, and
 *    at checkout
 *
 * Keeping the text here (not inline in each page) means a wording change lands
 * everywhere at once and admin-added products inherit the same policies for
 * free — the accordion renders from `PRODUCT_POLICIES`, never per-product data.
 */

export interface PolicyDoc {
  /** URL segment under `/policies/` and the accordion row id. */
  slug: string;
  /** Display heading. */
  title: string;
  /** One-line gist — used on the overview page and as the accordion sub-label. */
  summary: string;
  /** Full body, one entry per paragraph. */
  paragraphs: string[];
}

export const PRIVACY_POLICY: PolicyDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  summary:
    "How we collect, use, and safeguard your personal information — and our promise never to sell it.",
  paragraphs: [
    "Oorvashee Saree House respects the privacy of its customers and is committed to protecting personal information. We collect information such as names, contact details, addresses, and order-related information solely for business operations and customer service purposes.",
    "The information collected helps us process orders, provide customer support, improve our services, communicate order updates, and deliver a personalized shopping experience. We implement appropriate security measures to safeguard customer data against unauthorized access or misuse.",
    "Oorvashee Saree House does not sell customer information to third parties. Certain trusted service providers, such as payment gateways, logistics partners, and analytics platforms, may access limited information required to perform their services. By using our website, customers consent to the practices outlined in this policy.",
  ],
};

export const SHIPPING_POLICY: PolicyDoc = {
  slug: "shipping",
  title: "Shipping Policy",
  summary:
    "Domestic delivery across India only — metro orders in 1–2 days, other locations vary; tracking shared after dispatch.",
  paragraphs: [
    "We currently ship across India only; international delivery is not available. Customers outside India may place orders using international payment methods, provided the delivery address is within India.",
    "Orders are generally processed and dispatched within one to three business days after successful payment confirmation. Metro cities are usually delivered within 1–2 business days, while delivery timelines for other locations across India may vary depending on the destination, courier network, weather, and public holidays.",
    "Customers receive shipment tracking information once their order is dispatched. While we work with trusted logistics partners, occasional delays beyond our control may arise; our support team remains available on WhatsApp to assist with any shipment-related concerns.",
  ],
};

export const REFUND_POLICY: PolicyDoc = {
  slug: "refund",
  title: "Returns & Refunds",
  summary: "All sales are final — no returns, exchanges, or refunds are accepted.",
  paragraphs: [
    "All sales are final. No returns, exchanges, or refunds are accepted once an order has been placed.",
    "We encourage customers to review product details, descriptions, measurements, and images carefully before completing a purchase. If you have any questions about a product, please contact us on WhatsApp before ordering — our team will gladly help you choose with confidence.",
  ],
};

export const TERMS_AND_CONDITIONS: PolicyDoc = {
  slug: "terms",
  title: "Terms & Conditions",
  summary:
    "The terms you agree to when shopping with Oorvashee Saree House — payments, orders, and intellectual property.",
  paragraphs: [
    "By accessing and using the Oorvashee Saree House website, customers agree to comply with all applicable terms, policies, and legal requirements. The website content, products, pricing, and services are subject to change without prior notice.",
    "All orders are prepaid — we accept online payments only, and Cash on Delivery is not available. All sales are final, with no returns, exchanges, or refunds. Orders are subject to product availability and verification, and Oorvashee Saree House reserves the right to cancel or refuse orders involving pricing errors, stock issues, fraudulent activity, or policy violations.",
    "All intellectual property, including logos, designs, product images, content, and branding elements, remains the exclusive property of Oorvashee Saree House. Unauthorized reproduction, distribution, or commercial use of website content is strictly prohibited.",
  ],
};

/**
 * Policies shown in the `PolicyAccordion` under products, in the cart, and at
 * checkout — and listed on the `/policies` overview page. Order matters.
 */
export const PRODUCT_POLICIES: PolicyDoc[] = [
  SHIPPING_POLICY,
  REFUND_POLICY,
  TERMS_AND_CONDITIONS,
  PRIVACY_POLICY,
];

/** Lookup used by the dynamic-feel `/policies/[slug]` pages. */
export const POLICIES_BY_SLUG: Record<string, PolicyDoc> = {
  [PRIVACY_POLICY.slug]: PRIVACY_POLICY,
  [SHIPPING_POLICY.slug]: SHIPPING_POLICY,
  [REFUND_POLICY.slug]: REFUND_POLICY,
  [TERMS_AND_CONDITIONS.slug]: TERMS_AND_CONDITIONS,
};

/** About Us — long-form brand story for `/about`. */
export const ABOUT_US = {
  title: "About Us",
  tagline: "26+ years of trusted experience — Oorvashee Saree House, evolved from the legacy of VR Silks.",
  paragraphs: [
    "Oorvashee Saree House is the flagship retail and online brand of a saree business with over 26 years of trusted experience. Evolved from the well-loved legacy of VR Silks, we carry forward a heritage built on authenticity, craftsmanship, and the kind of personal service that has earned the loyalty of generations of customers.",
    "Our collections celebrate the timeless artistry of the Indian saree — pure silks, handwoven weaves, cottons, and designer pieces — each chosen for its quality, finish, and character. We work closely with trusted weavers and suppliers so that every saree reflects the standard our customers have come to expect from the VR Silks name.",
    "Today, Oorvashee Saree House blends that traditional craftsmanship with a modern, convenient shopping experience — secure online payments, reliable pan-India delivery, and responsive support on WhatsApp. Our commitment remains the same as it was over 26 years ago: beautiful sarees, honest value, and customers we can serve for a lifetime.",
  ],
} as const;

/** Contact Us — descriptive support copy shown on `/contact` beneath the cards. */
export const CONTACT_INTRO = {
  title: "Contact Us",
  paragraphs: [
    "Oorvashee Saree House values every customer and is committed to prompt, professional, and reliable support. Whether you have questions about a product, your order, or shipping, our team is here to help you through your shopping journey.",
    "Support is available exclusively on WhatsApp, Monday to Sunday, 11:00 AM – 8:30 PM IST. For the quickest assistance — product recommendations, order tracking, or general queries — message us on WhatsApp and we'll get back to you within our support hours.",
    "Business partnerships, bulk and wholesale enquiries, and collaboration requests are also welcome through our official channels.",
  ],
} as const;
