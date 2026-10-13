"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export interface MobileMenuLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS: MobileMenuLink[] = [
  { label: "Markets", href: "#markets" },
  { label: "Providers", href: "#providers" },
  { label: "Protocol", href: "#protocol" },
  { label: "Risk desk", href: "#risk" },
];

/**
 * Hamburger + slide-in panel. The panel is portalled to <body> because the
 * top bar uses backdrop-filter, which would otherwise trap position:fixed
 * children inside the bar. The button is hidden on desktop by
 * `.terminal-menu-button` in globals.css.
 */
export function MobileMenu({ links = DEFAULT_LINKS }: { links?: MobileMenuLink[] }) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const panelId = React.useId();

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close automatically if the window grows past the mobile breakpoint.
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        type="button"
        className="terminal-menu-button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[90]" id={panelId} role="dialog" aria-modal="true" aria-label="Main menu">
                <motion.div
                  className="absolute inset-0 bg-black/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                />
                <motion.nav
                  className="absolute right-0 top-0 flex h-full w-[min(86vw,320px)] flex-col border-l border-[#1f3034] bg-[#0b1012] p-5 text-[#ecf5f3]"
                  style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-[#6b8185]">MENU</span>
                    <button
                      ref={closeRef}
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#284047] bg-[#17262a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#54e7f1]"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <ul className="flex flex-col">
                    {links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="flex min-h-12 items-center border-b border-[#1c2e32] text-base font-medium text-[#cfe3e1] hover:text-[#54e7f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#54e7f1]"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto font-mono text-[10px] text-[#617579]">Simulated network · demo data</p>
                </motion.nav>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}