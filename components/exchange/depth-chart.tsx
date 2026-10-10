"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A lightweight SVG order-book depth chart.
 *
 * Draws the bid depth (filled from the mid line, accent-2) and ask depth
 * (filled from the mid line, accent-3) as area paths, plus the last-trade
 * price marker (accent). All hues resolve to the validated design-system
 * palette via CSS variables — no eyeballed colors.
 */
export interface DepthChartProps {
  /** Full depth: { price, bidQty, askQty } at each level. */
  depth: Array<{ price: number; bidQty: number; askQty: number }>;
  /** Last trade price, used for the mid marker. */
  lastPrice: number;
  /** Optional explicit price domain. */
  min?: number;
  max?: number;
  className?: string;
}

export function DepthChart({
  depth,
  lastPrice,
  min,
  max,
  className,
}: DepthChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(0);
  const [h, setH] = React.useState(0);

  // chart surface geometry
  const paddingLeft = 40;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 24;

  const toX = (price: number) => {
    const lo = min ?? Math.min(lastPrice, depth[0]?.price ?? 0);
    const hi = max ?? Math.max(lastPrice, depth[depth.length - 1]?.price ?? 1);
    const span = hi > lo ? hi - lo : 1;
    return paddingLeft + ((price - lo) / span) * (w - paddingLeft - paddingRight);
  };

  const toY = (qty: number, maxQty: number) => {
    if (maxQty <= 0) return h - paddingBottom;
    const span = h - paddingTop - paddingBottom;
    return h - paddingBottom - (qty / maxQty) * span;
  };

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setW(r.width);
      setH(r.height);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // aggregate totals for scaling
  const sorted = React.useMemo(
    () => [...depth].sort((a, b) => a.price - b.price),
    [depth]
  );

  const maxBid = React.useMemo(
    () => Math.max(...sorted.map((l) => l.bidQty), 1),
    [sorted]
  );
  const maxAsk = React.useMemo(
    () => Math.max(...sorted.map((l) => l.askQty), 1),
    [sorted]
  );
  const maxQty = Math.max(maxBid, maxAsk);

  // build area paths
  const bidPath = React.useMemo(() => {
    if (sorted.length === 0) return "";
    const midIdx = sorted.findIndex((l) => l.price >= lastPrice) || 0;
    const left = sorted[midIdx]?.price ?? lastPrice;
    const pts: string[] = [];
    // close the mid
    pts.push(`${toX(left)} ${h - paddingBottom}`);
    for (let i = midIdx; i >= 0; i--) {
      const l = sorted[i];
      const y = toY(l.bidQty, maxQty);
      pts.push(`${toX(l.price)} ${y}`);
    }
    pts.push(`${toX(left)} ${h - paddingBottom}`);
    return pts.join(" ");
  }, [sorted, lastPrice, w, h, maxQty]);

  const askPath = React.useMemo(() => {
    if (sorted.length === 0) return "";
    const midIdx = sorted.findIndex((l) => l.price >= lastPrice);
    const fromIdx = Math.max(0, midIdx);
    const right = sorted[sorted.length - 1]?.price ?? lastPrice;
    const pts: string[] = [];
    pts.push(`${toX(lastPrice)} ${h - paddingBottom}`);
    for (let i = fromIdx; i < sorted.length; i++) {
      const l = sorted[i];
      const y = toY(l.askQty, maxQty);
      pts.push(`${toX(l.price)} ${y}`);
    }
    pts.push(`${toX(right)} ${h - paddingBottom}`);
    return pts.join(" ");
  }, [sorted, lastPrice, w, h, maxQty]);

  // price gridlines (5 ticks)
  const priceMin = min ?? Math.min(...sorted.map((l) => l.price), lastPrice);
  const priceMax = max ?? Math.max(...sorted.map((l) => l.price), lastPrice);
  const ticks = Array.from({ length: 5 }, (_, i) => priceMin + (priceMax - priceMin) * (i / 4));

  return (
    <div ref={containerRef} className={cn("h-full w-full", className)}>
      {w > 0 && h > 0 && (
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${w} ${h}`}
          style={{ overflow: "visible" }}
          role="img"
          aria-label={`Order book depth chart, last price ${lastPrice.toFixed(2)}`}
        >
      {/* gridlines */}
      {ticks.map((t, i) => (
        <React.Fragment key={`grid-${i}`}>
          <line
            x1={0}
            y1={h - paddingBottom}
            x2={w}
            y2={h - paddingBottom}
            stroke="var(--gridline)"
            strokeWidth={1}
          />
          <g transform={`translate(${toX(t)}, ${h - paddingBottom})`}>
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={Math.min(12, h - paddingTop - paddingBottom)}
              stroke="var(--gridline)"
              strokeWidth={1}
            />
            <text
              x={-8}
              y={-4}
              textAnchor="end"
              className="fill-[--text-muted] text-[10px]"
            >
              {t.toFixed(2)}
            </text>
          </g>
        </React.Fragment>
      ))}

      {/* bid depth area */}
      <defs>
        <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--series-2)" stopOpacity={0.35} />
          <stop offset="1" stopColor="var(--series-2)" stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--series-1)" stopOpacity={0.35} />
          <stop offset="1" stopColor="var(--series-1)" stopOpacity={0.05} />
        </linearGradient>
      </defs>

      <polygon
        points={bidPath}
        fill="url(#bidGrad)"
        stroke="var(--series-2)"
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />
      <polygon
        points={askPath}
        fill="url(#askGrad)"
        stroke="var(--series-1)"
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />

      {/* last price marker */}
      <line
        x1={toX(lastPrice)}
        y1={paddingTop}
        x2={toX(lastPrice)}
        y2={h - paddingBottom}
        stroke="var(--series-8)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        className="animate-pulse-elegance"
      />
      <style jsx>{`
        @keyframes pulse-elegance {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
        .animate-pulse-elegance {
          animation: pulse-elegance 2s ease-in-out infinite;
        }
      `}</style>
        </svg>
      )}
    </div>
  );
}
