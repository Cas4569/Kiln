"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DockProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "top" | "middle" | "bottom";
  iconSize?: number;
  iconMagnification?: number;
  dockDistance?: number;
}

interface DockItemProps {
  className?: string;
  magnification?: number;
  distance?: number;
  children?: React.ReactNode;
}

const DockItemContext = React.createContext<{ hovered: boolean }>({ hovered: false });

export function Dock({
  className,
  direction = "bottom",
  iconSize = 40,
  iconMagnification = 60,
  dockDistance = 180,
  children,
  ...props
}: DockProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-end justify-center",
        direction === "top" && "items-start",
        direction === "middle" && "items-center",
        direction === "bottom" && "items-end",
        className
      )}
      style={{ "--dock-distance": `${dockDistance}px` } as React.CSSProperties}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement<DockItemProps>(child)
          ? React.cloneElement(child, {
              magnification: child.props.magnification ?? iconMagnification,
              distance: child.props.distance ?? dockDistance,
            })
          : child
      )}
    </div>
  );
}

export function DockItem({
  className,
  magnification = 60,
  distance = 180,
  children,
}: DockItemProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <DockItemContext.Provider value={{ hovered }}>
      <motion.div
        className={cn("relative flex flex-col items-center", className)}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={{ y: hovered ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      >
        <motion.div
          className="flex items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-border"
          animate={{ width: hovered ? magnification : 40, height: hovered ? magnification : 40 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </DockItemContext.Provider>
  );
}

export function DockLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { hovered } = React.useContext(DockItemContext);
  return (
    <motion.span
      className={cn(
        "pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-xs text-background shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.span>
  );
}

export function DockIcon({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex h-full w-full items-center justify-center text-foreground", className)}
    >
      {children}
    </div>
  );
}