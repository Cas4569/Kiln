"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatCompact } from "@/lib/utils";
import { motion } from "framer-motion";

export interface TradeFill {
  id: string;
  side: "buy" | "sell";
  price: number;
  size: number;
  time: string;
  txHash?: string;
}

export interface FillsFeedProps {
  fills: TradeFill[];
  className?: string;
}

export function FillsFeed({ fills, className }: FillsFeedProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
        <span className="font-semibold text-foreground tracking-wide">Recent Fills</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_theme(colors.emerald.500)]" />
          <span className="font-mono text-muted-foreground text-[11px]">Live</span>
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-lg">
        <table className="w-full text-right font-mono text-sm tabular-nums">
          <thead className="bg-muted/40 dark:bg-muted/30 text-muted-foreground/70">
            <tr>
              <th className="py-1.5 pl-2.5 text-left font-medium">Price</th>
              <th className="py-1.5">Size</th>
              <th className="py-1.5 pr-2.5">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {fills.slice(0, 12).map((fill, idx) => {
              const isBuy = fill.side === "buy";
              return (
                <motion.tr
                  key={fill.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                  className="hover:bg-muted/20 transition-all duration-200"
                >
                  <td className="py-1.5 pl-2.5 text-left">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 font-medium",
                        isBuy ? "text-emerald-500" : "text-rose-500"
                      )}
                    >
                      {isBuy ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      ${fill.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-1.5 text-muted-foreground">
                    {formatCompact(fill.size)}
                  </td>
                  <td className="py-1.5 pr-2.5 text-muted-foreground/70">
                    {fill.time}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}