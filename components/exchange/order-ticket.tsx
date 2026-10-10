"use client";

import * as React from "react";
import { ArrowLeftRight, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTicketProps {
  lastPrice: number;
  contract: string;
  selectedPrice?: number;
  onPlaceOrder?: (order: { side: "buy" | "sell"; price: number; size: number; type: "limit" | "market" }) => void;
}

export function OrderTicket({ lastPrice, contract, selectedPrice, onPlaceOrder }: OrderTicketProps) {
  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = React.useState<"limit" | "market">("limit");
  const [price, setPrice] = React.useState(lastPrice.toString());
  const [size, setSize] = React.useState("10");
  const [placed, setPlaced] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const previousContract = React.useRef(contract);
  const previousSelectedPrice = React.useRef(selectedPrice);

  // Update price when prop changes (e.g., clicked in order book)
  React.useEffect(() => {
    const contractChanged = previousContract.current !== contract;
    const selectedPriceChanged = previousSelectedPrice.current !== selectedPrice;
    if (contractChanged || selectedPriceChanged) {
      setPrice(selectedPrice?.toFixed(2) ?? lastPrice.toFixed(2));
      setSubmitError("");
    }
    previousContract.current = contract;
    previousSelectedPrice.current = selectedPrice;
  }, [contract, selectedPrice, lastPrice]);

  const total = (Number(price) || 0) * (Number(size) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);
    const numericSize = Number(size);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0 || !Number.isFinite(numericSize) || numericSize <= 0) {
      setPlaced(false);
      setSubmitError("Enter a price and quantity greater than zero.");
      return;
    }
    setSubmitError("");
    onPlaceOrder?.({
      side,
      type: orderType,
      price: orderType === "market" ? lastPrice : numericPrice,
      size: numericSize,
    });
    setPlaced(true);
    setTimeout(() => setPlaced(false), 2000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel flex flex-col gap-3.5 rounded-xl p-4 transition-all duration-300 hover:border-white/20 dark:hover:border-white/15 shadow-xl"
    >
      <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2.5">
        <span className="font-semibold text-foreground tracking-wide flex items-center gap-1.5">
          <ArrowLeftRight className="h-3.5 w-3.5 text-blue-500" />
          Order Ticket
        </span>
        <span className="font-mono text-[11px] bg-muted/80 px-2 py-0.5 rounded text-muted-foreground border border-border/50">
          {contract}
        </span>
      </div>

      {/* Buy / Sell Toggle */}
      <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-muted/60 p-1 text-xs border border-border/40">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={cn(
            "rounded-md py-1.5 font-medium transition-all duration-200",
            side === "buy"
              ? "bg-emerald-600 text-white shadow-md glow-emerald"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          Buy (Long)
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={cn(
            "rounded-md py-1.5 font-medium transition-all duration-200",
            side === "sell"
              ? "bg-rose-600 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          Sell (Short)
        </button>
      </div>

      {/* Order Type */}
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setOrderType("limit")}
          className={cn(
            "rounded-md px-3 py-1 transition-all duration-200 border",
            orderType === "limit"
              ? "bg-secondary text-foreground font-semibold border-border/80"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          Limit
        </button>
        <button
          type="button"
          onClick={() => setOrderType("market")}
          className={cn(
            "rounded-md px-3 py-1 transition-all duration-200 border",
            orderType === "market"
              ? "bg-secondary text-foreground font-semibold border-border/80"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          Market
        </button>
      </div>

      {/* Price input */}
      {orderType === "limit" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <label className="text-muted-foreground">Limit Price (USDC)</label>
            <span
              onClick={() => setPrice(lastPrice.toFixed(2))}
              className="text-[10px] text-blue-500 cursor-pointer hover:underline font-mono"
            >
              Mid: ${lastPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-xs transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <span className="text-muted-foreground mr-1 font-mono">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-transparent font-mono outline-none text-foreground"
            />
          </div>
        </div>
      )}

      {/* Size input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <label>Quantity (GPU-hours)</label>
          <div className="flex gap-1.5 text-[10px] font-mono">
            {["10", "25", "50", "100"].map((qty) => (
              <span
                key={qty}
                onClick={() => setSize(qty)}
                className="cursor-pointer hover:text-foreground hover:underline bg-muted/50 px-1 rounded"
              >
                {qty}h
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-xs transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <input
            type="number"
            step="1"
            min="1"
            required
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full bg-transparent font-mono outline-none text-foreground"
          />
          <span className="text-muted-foreground text-[10px] font-mono pl-2 border-l border-border/50">H100-h</span>
        </div>
      </div>

      {/* Total & Collateral */}
      <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] space-y-1.5 border border-border/30">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Est. Value</span>
          <span className="font-mono font-medium text-foreground">${total.toFixed(2)} USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Settlement</span>
          <span className="flex items-center gap-1 text-muted-foreground font-medium">
            <Zap className="h-3 w-3" /> Demo only · not settled
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Escrow</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-blue-500" /> Mock · not escrowed
          </span>
        </div>
      </div>

      {submitError && <p className="text-xs text-rose-500" role="alert">{submitError}</p>}

      <button
        type="submit"
        className={cn(
          "relative overflow-hidden w-full rounded-lg py-2.5 text-xs font-semibold text-white transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center gap-2",
          placed
            ? "bg-emerald-600"
            : side === "buy"
            ? "bg-emerald-600 hover:bg-emerald-500 glow-emerald"
            : "bg-rose-600 hover:bg-rose-500"
        )}
      >
        {placed ? (
          <>
            <CheckCircle2 className="h-4 w-4 animate-bounce" />
            Demo Order Recorded
          </>
        ) : (
          side === "buy" ? "Record Demo Buy Order" : "Record Demo Sell Order"
        )}
      </button>
    </form>
  );
}