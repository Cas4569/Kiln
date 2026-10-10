"use client";

import * as React from "react";
import UnicornScene from "unicornstudio-react";
import { cn } from "@/lib/utils";

export interface UnicornSceneProps {
  projectId: string;
  width?: string | number;
  height?: string | number;
  variables?: Record<string, any>;
  preset?: string;
  lazyLoad?: boolean;
  scale?: number;
  dpi?: number;
  fps?: React.ComponentProps<typeof UnicornScene>["fps"];
  className?: string;
  onVariableChange?: React.ComponentProps<typeof UnicornScene>["onVariableChange"];
}

export function UnicornSceneWrapper({
  projectId,
  width = "100%",
  height = "400px",
  variables,
  preset,
  lazyLoad = true,
  scale = 1,
  dpi = 1.5,
  fps = 60,
  className,
  onVariableChange,
  ...rest
}: UnicornSceneProps) {
  return (
    <UnicornScene
      projectId={projectId}
      width={width}
      height={height}
      variables={variables}
      preset={preset}
      lazyLoad={lazyLoad}
      scale={scale}
      dpi={dpi}
      fps={fps}
      onVariableChange={onVariableChange}
      className={cn(
        "glass-panel rounded-xl border border-border",
        className
      )}
      {...rest}
    />
  );
}