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
    "Oorvashee respects the privacy of its customers and is committed to protecting personal information. We collect information such as names, contact details, addresses, and order-related information solely for business operations and customer service purposes.",
    "The information collected helps us process orders, provide customer support, improve our services, communicate order updates, and deliver a personalized shopping experience. We implement appropriate security measures to safeguard customer data against unauthorized access or misuse.",
    "Oorvashee does not sell customer information to third parties. Certain trusted service providers, such as payment gateways, logistics partners, and analytics platforms, may access limited information required to perform their services. By using our website, customers consent to the practices outlined in this policy.",
  ],
};

export const SHIPPING_POLICY: PolicyDoc = {
  slug: "shipping",
  title: "Shipping Policy",
  summary:
    "Order processing times, delivery timelines, and how tracking is shared after dispatch.",
  paragraphs: [
    "Oorvashee aims to process and dispatch orders efficiently to ensure a smooth shopping experience. Orders are generally processed within one to three business days after successful payment confirmation.",
    "Delivery timelines vary depending on customer location, courier network availability, weather conditions, and public holidays. Most domestic orders are delivered within a few business days, although remote locations may require additional transit time.",
    "Customers receive shipment tracking information once orders are dispatched. While Oorvashee works with trusted logistics partners, unforeseen delays beyond our control may occasionally occur. Our support team remains available to assist customers with shipment-related concerns.",
  ],
};

export const REFUND_POLICY: PolicyDoc = {
  slug: "refund",
  title: "Refund Policy",
  summary:
    "When refunds apply, how requests are reviewed, and how approved refunds are processed.",
  paragraphs: [
    "Customer satisfaction is important to Oorvashee. Refund requests may be considered for products that arrive damaged, defective, incorrect, or significantly different from their description. Customers should report such issues within the specified return window.",
    "All refund requests undergo a review process that may include verification of photographs, videos, order details, and product condition. Once approved, refunds are initiated through the original payment method used during purchase.",
    "Refund processing times may vary depending on payment providers and banking institutions. Products that show signs of use, damage caused after delivery, or requests submitted outside the permitted period may not qualify for refunds.",
  ],
};

export const TERMS_AND_CONDITIONS: PolicyDoc = {
  slug: "terms",
  title: "Terms & Conditions",
  summary:
    "The terms you agree to when using Oorvashee, including orders, pricing, and intellectual property.",
  paragraphs: [
    "By accessing and using the Oorvashee website, customers agree to comply with all applicable terms, policies, and legal requirements. The website content, products, pricing, and services are subject to change without prior notice.",
    "All orders placed through our platform are subject to product availability and verification. Oorvashee reserves the right to cancel or refuse orders in cases involving pricing errors, stock issues, fraudulent activity, or policy violations.",
    "All intellectual property, including logos, designs, product images, content, and branding elements, remains the exclusive property of Oorvashee. Unauthorized reproduction, distribution, or commercial use of website content is strictly prohibited.",
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
  tagline: "Premium ethnic fashion, woven with heritage and care.",
  paragraphs: [
    "Oorvashee is a premium ethnic fashion destination dedicated to bringing traditional Indian elegance to modern customers. Our collections are carefully curated to showcase timeless craftsmanship, premium fabrics, and contemporary designs that celebrate the beauty of Indian culture. We believe fashion is not just about clothing but about expressing confidence, heritage, and individuality.",
    "Our team works closely with trusted suppliers and artisans to ensure that every product reflects quality, authenticity, and value. From festive wear and designer sarees to everyday ethnic collections, we focus on offering products that meet the expectations of today's customers while preserving traditional artistry.",
    "At Oorvashee, customer satisfaction is at the heart of everything we do. We continuously improve our shopping experience through secure payments, reliable delivery, responsive support, and a commitment to excellence. Our vision is to become one of India's most trusted online destinations for ethnic fashion and lifestyle products.",
  ],
} as const;

/** Contact Us — descriptive support copy shown on `/contact` beneath the cards. */
export const CONTACT_INTRO = {
  title: "Contact Us",
  paragraphs: [
    "Oorvashee values every customer and strives to provide prompt, professional, and reliable support. Whether you have questions about products, orders, shipping, returns, or general inquiries, our support team is committed to assisting you throughout your shopping journey.",
    "Customers can reach us through our official website, email support channels, and customer service platforms. We encourage customers to contact us for product recommendations, order tracking assistance, exchange requests, and any concerns related to their shopping experience.",
    "We continuously work to improve our customer service standards and aim to respond to all inquiries within a reasonable timeframe. Business partnerships, wholesale inquiries, and collaboration requests are also welcome through our official communication channels.",
  ],
} as const;
