import type { Variants, Transition } from "motion/react";

const ease: Transition["ease"] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease } },
};

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.1, ease } },
};

export const stagger = (delayChildren = 0, staggerChildren = 0.12): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});
