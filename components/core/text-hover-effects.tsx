"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextHoverEffectProps {
  text: string;
  className?: string;
}

/** Text hover effect based on Framer Motion SVG outline + stroke draw
 * with subtle gradient fill reveal and glow aura. */
export function TextHoverEffect({ text, className }: TextHoverEffectProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("relative inline-block cursor-default select-none", className)}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative overflow-hidden rounded-lg bg-muted/50 px-3 py-1.5 text-sm font-medium transition-all duration-300",
          hovered ? "glow-blue" : ""
        )}
      >
        <svg
          className="h-10 w-auto"
          viewBox="0 0 300 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <text
            x="0"
            y="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeOpacity={hovered ? 0.3 : 0.8}
            className="text-2xl font-bold tracking-tight transition-all duration-300"
          >
            {text}
          </text>
          <motion.text
            x="0"
            y="30"
            fill="url(#textGradient)"
            stroke="url(#textGradient)"
            strokeWidth="0.5"
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, strokeDasharray: 200, strokeDashoffset: 200 }}
            animate={{ opacity: hovered ? 1 : 0, strokeDashoffset: hovered ? 0 : 200 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {text}
          </motion.text>
        </svg>
      </div>
    </motion.div>
  );
}