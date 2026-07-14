"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface FadeInProps extends HTMLMotionProps<"div"> {
  /** Délai avant le début de l'animation (en secondes). */
  delay?: number;
}

/**
 * Wrapper d'animation réutilisable (apparition en fondu + translation).
 * Exemple d'intégration de Framer Motion, à composer librement.
 */
export function FadeIn({ delay = 0, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
