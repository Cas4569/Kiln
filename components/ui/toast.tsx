"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type Kind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: Kind;
  title: string;
  description?: string;
}
interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const STYLES: Record<Kind, { icon: React.ReactNode; border: string }> = {
  success: { icon: <CheckCircle2 size={18} className="text-[#b9e86c]" />, border: "border-[#3d4f2d]" },
  error: { icon: <AlertCircle size={18} className="text-[#ff8b8b]" />, border: "border-[#5a2f2f]" },
  info: { icon: <Info size={18} className="text-[#54e7f1]" />, border: "border-[#284047]" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const idRef = React.useRef(0);
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  React.useEffect(() => {
    setMounted(true);
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const dismiss = React.useCallback((id: number) => {
    setItems((cur) => cur.filter((i) => i.id !== id));
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const push = React.useCallback(
    (kind: Kind, title: string, description?: string) => {
      const id = ++idRef.current;
      setItems((cur) => [...cur.slice(-3), { id, kind, title, description }]);
      timers.current.set(id, setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000));
    },
    [dismiss]
  );

  const api = React.useMemo<ToastApi>(
    () => ({
      success: (t, d) => push("success", t, d),
      error: (t, d) => push("error", t, d),
      info: (t, d) => push("info", t, d),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  role={item.kind === "error" ? "alert" : "status"}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={`pointer-events-auto flex items-start gap-3 rounded-lg border ${STYLES[item.kind].border} bg-[#0f181b]/95 p-3 text-[#ecf5f3] shadow-lg backdrop-blur`}
                >
                  <span className="mt-0.5 shrink-0">{STYLES[item.kind].icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-[#8aa0a3]">{item.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={() => dismiss(item.id)}
                    className="shrink-0 rounded p-1 text-[#6d8387] hover:text-[#ecf5f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#54e7f1]"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}