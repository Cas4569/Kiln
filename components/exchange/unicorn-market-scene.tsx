"use client";

import * as React from "react";
import { UnicornSceneWrapper } from "@/components/core/unicorn-scene";
import { cn } from "@/lib/utils";

export interface UnicornMarketSceneProps {
  lastPrice: number;
  className?: string;
}

export function UnicornMarketScene({
  lastPrice,
  className,
}: UnicornMarketSceneProps) {
  // Map price range to visual variables
  const priceNormalized = React.useMemo(() => {
    // Assuming price range 2.0 - 3.0 for normalization
    const minPrice = 2.0;
    const maxPrice = 3.0;
    return Math.min(1, Math.max(0, (lastPrice - minPrice) / (maxPrice - minPrice)));
  }, [lastPrice]);

  // Variables that respond to market data
  const variables = React.useMemo(() => {
    // accentColor shifts from blue to purple as price increases
    const blue = [56, 189, 248]; // #38bdf8
    const purple = [168, 85, 247]; // #a855f7

    const r = Math.round(blue[0] + (purple[0] - blue[0]) * priceNormalized);
    const g = Math.round(blue[1] + (purple[1] - blue[1]) * priceNormalized);
    const b = Math.round(blue[2] + (purple[2] - blue[2]) * priceNormalized);

    const accentColor = `rgb(${r}, ${g}, ${b})`;

    // intensity varies with price volatility (simulated)
    const intensity = 0.5 + priceNormalized * 0.5; // 0.5 to 1.0

    return {
      accentColor,
      intensity: Number(intensity.toFixed(2)),
    };
  }, [lastPrice, priceNormalized]);

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
        <span className="h-5 w-5 bg-gradient-to-r from-blue-400 to-purple-500 rounded"></span>
        Market Visualization
      </h3>

      <UnicornSceneWrapper
        projectId="gIE7wLjDnb1IC6RN5ztv"
        width="100%"
        height="500px"
        variables={variables}
        lazyLoad={true}
        scale={0.8}
        dpi={1.5}
        fps={60}
        className="h-[500px] w-full"
      />

      <div className="text-xs text-muted-foreground flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded bg-blue-500" /> Accent Color
          <span className="font-mono">{variables.accentColor}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded bg-emerald-500" /> Intensity
          <span className="font-mono">{variables.intensity}</span>
        </div>
      </div>
    </div>
  );
}