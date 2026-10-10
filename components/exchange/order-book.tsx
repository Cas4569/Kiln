"use client";

import * as React from "react";
import { cn, formatCompact } from "@/lib/utils";

export interface OrderLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBookProps {
  asks: OrderLevel[];
  bids: OrderLevel[];
  lastPrice: number;
  maxVolume?: number;
}

export function OrderBook({
  asks,
  bids,
  lastPrice,
  maxVolume = 1000,
}: OrderBookProps) {
  const spreadPct =
    asks.length > 0 && bids.length > 0
      ? ((asks[0].price - bids[0].price) / lastPrice) * 100
      : 0;

  return (
    <div className="flex flex-col gap-2 glass-panel rounded-xl p-3.5 shadow-xl border border-border/50">
      <div className="flex items-baseline justify-between text-xs border-b border-border/30 pb-2">
        <span className="text-muted-foreground tracking-wide">Spread {spreadPct.toFixed(3)}%</span>
        <span className="font-mono text-foreground">${lastPrice.toFixed(2)}</span>
      </div>

      <table className="w-full text-right font-mono text-sm tabular-nums">
        <thead>
          <tr className="text-xs text-muted-foreground/60">
            <th className="text-left font-medium text-foreground/80">Price</th>
            <th className="font-medium text-foreground/80">Size</th>
            <th className="font-medium text-foreground/80">Total</th>
          </tr>
        </thead>
        <tbody>
          {/* asks — reds, descending price */}
          {asks.map((a, i) => {
            const pct = Math.min(1, a.total / maxVolume);
            return (
              <tr key={`ask-${i}`} data-price={a.price} className="group border-b border-border/20 last:border-0 cursor-pointer">
                <td className="relative text-left">
                  <span
                    className="absolute inset-y-0 left-0 -z-10 w-1.5 rounded-r-sm bg-status-critical/20"
                    style={{ width: `${pct * 100}%` }}
                  />
                  <span className="text-status-critical/90 font-medium">{a.price.toFixed(2)}</span>
                </td>
                <td className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {formatCompact(a.size)}
                </td>
                <td className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {formatCompact(a.total)}
                </td>
              </tr>
            );
          })}
          <tr className="h-px">
            <td colSpan={3} className="h-px bg-border/40" />
          </tr>

          {/* bids — greens, ascending price */}
          {bids.map((b, i) => {
            const pct = Math.min(1, b.total / maxVolume);
            return (
              <tr key={`bid-${i}`} data-price={b.price} className="group border-b border-border/20 last:border-0 cursor-pointer">
                <td className="relative text-left">
                  <span
                    className="absolute inset-y-0 left-0 -z-10 w-1.5 rounded-r-sm bg-status-good/20"
                    style={{ width: `${pct * 100}%` }}
                  />
                  <span className="text-status-good font-medium">{b.price.toFixed(2)}</span>
                </td>
                <td className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {formatCompact(b.size)}
                </td>
                <td className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {formatCompact(b.total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
