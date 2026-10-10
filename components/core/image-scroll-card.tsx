"use client";

import React, { useState, useRef, useEffect, startTransition } from "react";
import { cn } from "@/lib/utils";

export interface ImageScrollCardProps {
  image?: { src: string; alt?: string };
  scrollSpeed?: number;
  borderRadius?: number;
  shadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ImageScrollCard({
  image = {
    src: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80",
    alt: "GPU Rack Architecture Spec",
  },
  scrollSpeed = 50,
  borderRadius = 12,
  shadow = true,
  className,
  style,
}: ImageScrollCardProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hasInitialHover, setHasInitialHover] = useState(false);
  const [imageHeight, setImageHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number>();

  const maxScroll = Math.max(0, imageHeight - containerHeight);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && imageRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        startTransition(() => {
          setContainerHeight(containerRect.height);
          setImageHeight(imageRect.height);
        });
      }
    };

    const img = new Image();
    img.onload = () => {
      setTimeout(updateDimensions, 100);
    };
    img.src = image.src;

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [image.src]);

  const stopScrollAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const startScrollAnimation = (direction: "initial" | "down" | "up") => {
    stopScrollAnimation();

    const animate = () => {
      setScrollY((current) => {
        let newScrollY = current;

        if (direction === "initial") {
          const targetScroll = Math.min(maxScroll * 0.35, maxScroll);
          const diff = targetScroll - current;
          newScrollY = current + diff * 0.05;
          if (Math.abs(diff) > 1) {
            animationRef.current = requestAnimationFrame(animate);
          }
        } else if (direction === "down") {
          newScrollY = Math.min(current + scrollSpeed * 0.016, maxScroll);
          if (newScrollY < maxScroll) {
            animationRef.current = requestAnimationFrame(animate);
          }
        } else if (direction === "up") {
          newScrollY = Math.max(current - scrollSpeed * 0.016, 0);
          if (newScrollY > 0) {
            animationRef.current = requestAnimationFrame(animate);
          }
        }

        return newScrollY;
      });
    };

    animate();
  };

  const handleMouseEnter = () => {
    startTransition(() => {
      setIsHovering(true);
      if (!hasInitialHover) {
        setHasInitialHover(true);
        startScrollAnimation("initial");
      }
    });
  };

  const handleMouseLeave = () => {
    startTransition(() => {
      setIsHovering(false);
    });
    stopScrollAnimation();
    startTransition(() => {
      setScrollY(0);
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering || !hasInitialHover || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const centerY = rect.height / 2;

    stopScrollAnimation();
    if (mouseY < centerY) {
      startScrollAnimation("up");
    } else {
      startScrollAnimation("down");
    }
  };

  useEffect(() => {
    return () => {
      stopScrollAnimation();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden border border-border bg-card transition-all duration-300",
        shadow && "shadow-lg hover:shadow-xl",
        className
      )}
      style={{
        borderRadius,
        cursor: "pointer",
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        ref={imageRef}
        src={image.src}
        alt={image.alt}
        className="w-full h-auto block select-none pointer-events-none"
        style={{
          transform: `translateY(-${scrollY}px)`,
          transition: isHovering ? "none" : "transform 0.4s ease-out",
          objectFit: "cover",
          objectPosition: "top",
        }}
        draggable={false}
      />

      {/* Top and Bottom Scroll Hints / Overlays */}
      {isHovering && hasInitialHover && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/20 to-transparent opacity-60" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
          <div className="pointer-events-none absolute top-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-mono text-muted-foreground backdrop-blur-sm border border-border">
            Hover top/bottom to scroll
          </div>
        </>
      )}
    </div>
  );
}

export default ImageScrollCard;