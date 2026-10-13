"use client";

import * as React from "react";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { PixelTransition } from "@/components/ui/pixel-transition";
import { useToast } from "@/components/ui/toast";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Cpu,
  Database,
  Layers3,
  Network,
  Radio,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react";
import { DepthChart } from "@/components/exchange/depth-chart";
import { FillsFeed, type TradeFill } from "@/components/exchange/fills-feed";
import { OrderBook, type OrderLevel } from "@/components/exchange/order-book";
import { OrderTicket } from "@/components/exchange/order-ticket";

type Market = {
  id: string;
  short: string;
  name: string;
  region: string;
  week: string;
  price: number;
  change: number;
  supply: string;
  accent: "cyan" | "lime" | "purple";
};

const markets: Market[] = [
  { id: "h100-east-w42", short: "H100 / US-E", name: "NVIDIA H100 SXM", region: "US-East", week: "W42", price: 1.84, change: 4.7, supply: "12,840", accent: "cyan" },
  { id: "a100-west-w42", short: "A100 / US-W", name: "NVIDIA A100 80GB", region: "US-West", week: "W42", price: 1.19, change: 2.1, supply: "9,612", accent: "lime" },
  { id: "h200-east-w43", short: "H200 / US-E", name: "NVIDIA H200 SXM", region: "US-East", week: "W43", price: 2.43, change: -0.8, supply: "4,280", accent: "purple" },
];

const initialAsks: OrderLevel[] = [
  { price: 1.89, size: 420, total: 420 },
  { price: 1.88, size: 680, total: 1100 },
  { price: 1.87, size: 310, total: 1410 },
  { price: 1.86, size: 920, total: 2330 },
  { price: 1.85, size: 510, total: 2840 },
];

const initialBids: OrderLevel[] = [
  { price: 1.83, size: 740, total: 740 },
  { price: 1.82, size: 560, total: 1300 },
  { price: 1.81, size: 880, total: 2180 },
  { price: 1.8, size: 260, total: 2440 },
  { price: 1.79, size: 1120, total: 3560 },
];

const initialFills: TradeFill[] = [
  { id: "1", side: "buy", price: 1.84, size: 240, time: "14:32:08" },
  { id: "2", side: "sell", price: 1.83, size: 180, time: "14:32:05" },
  { id: "3", side: "buy", price: 1.82, size: 420, time: "14:31:58" },
  { id: "4", side: "buy", price: 1.81, size: 90, time: "14:31:44" },
  { id: "5", side: "sell", price: 1.84, size: 120, time: "14:31:31" },
];

const initialIndex = [1.66, 1.7, 1.68, 1.73, 1.71, 1.77, 1.75, 1.81, 1.79, 1.84];

function SectionHeading({
  children,
  detail,
}: {
  children: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <div className="terminal-section-heading">
      <span>{children}</span>
      {detail}
    </div>
  );
}

function IndexChart({ values }: { values: number[] }) {
  const low = Math.min(...values) - 0.04;
  const high = Math.max(...values) + 0.04;
  const points = values.map((value, index) => {
    const x = 12 + (index / Math.max(values.length - 1, 1)) * 676;
    const y = 16 + ((high - value) / (high - low || 1)) * 150;
    return `${x},${y}`;
  });
  const path = `M ${points.join(" L ")}`;
  const area = `${path} L 688,184 L 12,184 Z`;

  return (
    <svg
      className="terminal-index-chart"
      viewBox="0 0 700 208"
      preserveAspectRatio="none"
      role="img"
      aria-label="Simulated rolling compute price index"
    >
      <defs>
        <linearGradient id="index-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#54e7f1" stopOpacity=".22" />
          <stop offset="100%" stopColor="#54e7f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[45, 90, 135, 184].map((y) => (
        <line key={y} x1="0" x2="700" y1={y} y2={y} className="terminal-chart-gridline" />
      ))}
      <path d={area} fill="url(#index-fill)" />
      <path d={path} className="terminal-chart-line" />
      <text x="8" y="203" className="terminal-chart-tick">08:00</text>
      <text x="224" y="203" className="terminal-chart-tick">11:00</text>
      <text x="449" y="203" className="terminal-chart-tick">14:00</text>
      <text x="661" y="203" className="terminal-chart-tick">NOW</text>
    </svg>
  );
}

export default function Home() {
  const [activeMarketId, setActiveMarketId] = React.useState(markets[0].id);
  const [lastPrice, setLastPrice] = React.useState(markets[0].price);
  const [fills, setFills] = React.useState(initialFills);
  const [indexValues, setIndexValues] = React.useState(initialIndex);
  const [sessionFillCount, setSessionFillCount] = React.useState(initialFills.length);
  const [chartMode, setChartMode] = React.useState<"index" | "depth">("index");
  const [selectedPrice, setSelectedPrice] = React.useState<number | undefined>();
  const [demoOrderMessage, setDemoOrderMessage] = React.useState("");
  const [demoWallet, setDemoWallet] = React.useState(false);
  const toast = useToast();
  const market = markets.find((item) => item.id === activeMarketId) ?? markets[0];
  const priceRef = React.useRef(lastPrice);

  React.useEffect(() => {
    priceRef.current = lastPrice;
  }, [lastPrice]);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      const nextPrice = Math.max(
        0.01,
        Number((priceRef.current + (Math.random() - 0.5) * 0.02).toFixed(2)),
      );
      const side = Math.random() > 0.45 ? "buy" : "sell";
      const size = Math.floor(Math.random() * 40) + 5;
      priceRef.current = nextPrice;
      setLastPrice(nextPrice);
      setIndexValues((current) => [...current.slice(-23), nextPrice]);
      setSessionFillCount((count) => count + 1);
      setFills((current) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          side,
          price: nextPrice,
          size,
          time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        },
        ...current.slice(0, 19),
      ]);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  const onPlaceOrder = (order: {
    side: "buy" | "sell";
    price: number;
    size: number;
    type: "limit" | "market";
  }) => {
    toast.success("Order recorded", `${order.size} GPU-hours at $${order.price.toFixed(2)}`);
    setDemoOrderMessage(
      `Demo ${order.type} ${order.side} order recorded: ${order.size} GPU-hours at $${order.price.toFixed(2)}. No trade was submitted onchain.`,
    );
  };

  const marketOffset = market.price - markets[0].price;
  const asks = React.useMemo(
    () => initialAsks.map((level) => ({ ...level, price: Number((level.price + marketOffset).toFixed(2)) })),
    [marketOffset],
  );
  const bids = React.useMemo(
    () => initialBids.map((level) => ({ ...level, price: Number((level.price + marketOffset).toFixed(2)) })),
    [marketOffset],
  );
  const depth = React.useMemo(
    () => [
      ...bids.map((level) => ({ price: level.price, bidQty: level.total, askQty: 0 })),
      ...asks.map((level) => ({ price: level.price, bidQty: 0, askQty: level.total })),
    ].sort((a, b) => a.price - b.price),
    [asks, bids],
  );
  const sessionHigh = Math.max(...indexValues);
  const sessionLow = Math.min(...indexValues);

  return (
    <main className="terminal-shell">
      <header className="terminal-topbar">
        <a className="terminal-brand" href="#markets" aria-label="Compute CLOB home">
          <span className="terminal-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="terminal-brand-copy">
            <strong>COMPUTE<span>/</span>CLOB</strong>
            <small>onchain compute markets</small>
          </span>
        </a>

        <nav className="terminal-nav" aria-label="Main navigation">
          <a className="active" href="#markets">Markets</a>
          <a href="#providers">Providers</a>
          <a href="#protocol">Protocol</a>
          <a href="#risk">Risk desk</a>
        </nav>

        <div className="terminal-topbar-actions">
          <MobileMenu />
          <span className="terminal-network"><span className="terminal-live-dot" /> Demo stream</span>
          <button
            className={`terminal-wallet-button${demoWallet ? " connected" : ""}`}
            onClick={() => setDemoWallet((value) => !value)}
            title="Local demo state only; this does not connect a wallet"
          >
            <WalletCards size={15} />
            {demoWallet ? "Demo session" : "Wallet · demo"}
          </button>
        </div>
      </header>

      <div className="terminal-ticker" aria-label="Demo market prices">
        <div className="terminal-ticker-label"><Radio size={13} /> MARKET PULSE <span className="terminal-demo-tag">SIMULATED</span></div>
        <div className="terminal-ticker-items">
          {markets.map((item) => (
            <button
              key={item.id}
              className="terminal-ticker-item"
              onClick={() => {
                setActiveMarketId(item.id);
                setLastPrice(item.price);
                setSelectedPrice(undefined);
                setIndexValues(initialIndex.map((value) => Number((value + item.price - markets[0].price).toFixed(2))));
              }}
            >
              <span className={`terminal-market-dot ${item.accent}`} />
              <span>{item.short}</span>
              <strong>${item.price.toFixed(2)}</strong>
              <em className={item.change >= 0 ? "terminal-positive" : "terminal-negative"}>
                {item.change >= 0 ? "+" : ""}{item.change.toFixed(1)}%
              </em>
            </button>
          ))}
        </div>
        <span className="terminal-stream-status"><span className="terminal-live-dot" /> simulated fills updating</span>
      </div>

      <div className="terminal-content" id="markets">
        <section className="terminal-market-intro">
          <div>
            <div className="terminal-breadcrumb">
              <span>MARKETS</span><ChevronDown size={12} />
              <span>{market.region.toUpperCase()} · {market.week}</span><ChevronDown size={12} />
              <span>SPOT CONTRACT</span>
            </div>
            <div className="terminal-market-title">
              <span className={`terminal-market-orb ${market.accent}`}><i /></span>
              <div>
                <div className="terminal-title-line">
                  <h1>{market.name}</h1>
                  <span className="terminal-contract-badge">ERC-1155 DESIGN · {market.week}</span>
                </div>
                <p>1 GPU compute-hour · {market.region} · weekly delivery contract</p>
              </div>
            </div>
          </div>
          <div className="terminal-hero-stats">
            <div className="terminal-index-price">
              <span className="terminal-eyebrow">SIMULATED TWAP INDEX <b>DEMO</b></span>
              <strong>${lastPrice.toFixed(2)}</strong>
              <span className={market.change >= 0 ? "terminal-positive" : "terminal-negative"}>
                {market.change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {market.change >= 0 ? "+" : ""}{market.change.toFixed(1)}% <small>24H SAMPLE</small>
              </span>
            </div>
            <span className="terminal-stat-divider" />
            <div className="terminal-hero-stat"><span className="terminal-eyebrow">LAST DEMO FILL</span><strong>${(lastPrice - 0.01).toFixed(2)}</strong><small>simulated</small></div>
            <span className="terminal-stat-divider" />
            <div className="terminal-hero-stat"><span className="terminal-eyebrow">BOOK SPREAD</span><strong>1.08¢</strong><small>sample book</small></div>
          </div>
        </section>

        <div className="terminal-dashboard">
          <aside className="terminal-left-rail">
            <section className="terminal-panel">
              <SectionHeading detail={<span className="terminal-count">03</span>}>COMPUTE MARKETS</SectionHeading>
              <div className="terminal-market-list">
                {markets.map((item) => (
                  <button
                    key={item.id}
                    className={`terminal-market-row${item.id === market.id ? " selected" : ""}`}
                    onClick={() => {
                      setActiveMarketId(item.id);
                      setLastPrice(item.price);
                      setSelectedPrice(undefined);
                      setIndexValues(initialIndex.map((value) => Number((value + item.price - markets[0].price).toFixed(2))));
                    }}
                    aria-pressed={item.id === market.id}
                  >
                    <span className={`terminal-market-mini-orb ${item.accent}`}><i /></span>
                    <span className="terminal-market-row-copy"><strong>{item.short}</strong><small>{item.region} · {item.week}</small></span>
                    <span className="terminal-market-row-price"><strong>${item.price.toFixed(2)}</strong><small className={item.change >= 0 ? "terminal-positive" : "terminal-negative"}>{item.change >= 0 ? "+" : ""}{item.change.toFixed(1)}%</small></span>
                  </button>
                ))}
              </div>
              <div className="terminal-market-meta"><Layers3 size={13} /> Standardized contracts · 1 GPU-hour per token</div>
            </section>

            <section className="terminal-panel" id="providers">
              <SectionHeading detail={<span className="terminal-status-chip"><i /> MOCK SUPPLY</span>}>PROVIDER SUPPLY</SectionHeading>
              <div className="terminal-supply-total"><strong>{market.supply}</strong><span>GPU-hours listed · demo data</span></div>
              <div className="terminal-supply-bar"><i /></div>
              <div className="terminal-supply-meta"><span>68% illustrative capacity</span><span>18 sample providers</span></div>
              <div className="terminal-provider-stack" aria-label="Sample provider initials"><i>NV</i><i>GP</i><i>AK</i><i>+15</i></div>
              <p className="terminal-panel-note">Supply is illustrative. Provider minting and delivery attestations are not connected.</p>
              <div className="terminal-next-step"><span>NEXT TRACTION TARGET</span><strong>Onboard 2 GPU providers</strong></div>
            </section>

            <section className="terminal-panel" id="protocol">
              <SectionHeading detail={<CircleHelp size={14} />}>PROTOCOL DESIGN</SectionHeading>
              <div className="terminal-protocol-row"><span><Network size={13} /> Price-time order book</span><b>PLANNED</b></div>
              <div className="terminal-protocol-row"><span><Database size={13} /> Rolling trade TWAP</span><b>DEMO</b></div>
              <div className="terminal-protocol-row"><span><Layers3 size={13} /> ERC-1155 contracts</span><b>DESIGN</b></div>
              <div className="terminal-protocol-row"><span><Zap size={13} /> Atomic USDC settlement</span><b>PLANNED</b></div>
            </section>
          </aside>

          <section className="terminal-main-column">
            <PixelTransition triggerKey={activeMarketId}>
              <section className="terminal-panel terminal-chart-panel">
              <div className="terminal-panel-header">
                <SectionHeading detail={<span className="terminal-chart-source"><i /> DEMO DATA · NOT AN ORACLE FEED</span>}>PRICE DISCOVERY</SectionHeading>
                <div className="terminal-segmented" aria-label="Chart mode">
                  <button className={chartMode === "index" ? "active" : ""} onClick={() => setChartMode("index")} aria-pressed={chartMode === "index"}>TWAP INDEX</button>
                  <button className={chartMode === "depth" ? "active" : ""} onClick={() => setChartMode("depth")} aria-pressed={chartMode === "depth"}>DEPTH</button>
                </div>
              </div>
              <div className="terminal-chart-summary">
                <div><span className="terminal-eyebrow">SESSION HIGH</span><strong>${sessionHigh.toFixed(2)}</strong></div>
                <div><span className="terminal-eyebrow">SESSION LOW</span><strong>${sessionLow.toFixed(2)}</strong></div>
                <div><span className="terminal-eyebrow">SESSION DEMO FILLS</span><strong>{sessionFillCount.toLocaleString()}</strong></div>
                <span className="terminal-chart-sample">Illustrative sample</span>
              </div>
              <div className="terminal-chart-wrap">
                {chartMode === "index" ? (
                  <IndexChart values={indexValues} />
                ) : (
                  <DepthChart depth={depth} lastPrice={lastPrice} />
                )}
              </div>
              <div className="terminal-chart-legend">
                <span><i className="terminal-legend-cyan" /> SIMULATED COMPUTE INDEX</span>
                <span><i className="terminal-legend-lime" /> PROVIDER BID DEPTH</span>
                <span className="terminal-chart-footnote">Prices shown in USDC / GPU-hour</span>
              </div>
            </section>

            <div className="terminal-market-data">
              <section className="terminal-panel terminal-book-panel">
                <SectionHeading detail={<span className="terminal-sample-label"><Activity size={12} /> SAMPLE BOOK</span>}>ORDER BOOK</SectionHeading>
                <div className="terminal-book-content" onClick={(event) => {
                  const row = (event.target as HTMLElement).closest<HTMLElement>("[data-price]");
                  if (row) setSelectedPrice(Number(row.dataset.price));
                }}>
                  <OrderBook asks={asks} bids={bids} lastPrice={lastPrice} />
                </div>
                {selectedPrice !== undefined && <button className="terminal-selected-price" onClick={() => setSelectedPrice(undefined)}>Selected ${selectedPrice.toFixed(2)} · reset</button>}
              </section>
              <section className="terminal-panel terminal-fills-panel">
                <SectionHeading detail={<span className="terminal-stream-chip"><i /> SIMULATED STREAM</span>}>RECENT FILLS</SectionHeading>
                <div className="terminal-fills-content"><FillsFeed fills={fills} /></div>
                <p className="terminal-fills-disclaimer">Auto-generated demo activity · not blockchain events</p>
              </section>
            </div>

            <section className="terminal-traction-strip">
              <div className="terminal-traction-heading"><Activity size={15} /><span>DEMO TRACTION</span><small>sample metrics, not protocol activity</small></div>
              <div><span>Fill stream</span><strong>{sessionFillCount.toLocaleString()} <small>simulated</small></strong></div>
              <div><span>Illustrative spread</span><strong>1.08¢ <small>USDC</small></strong></div>
              <div><span>Provider target</span><strong>2 <small>to onboard</small></strong></div>
            </section>
            </PixelTransition>
          </section>

          <aside className="terminal-right-rail">
            <section className="terminal-panel terminal-ticket-panel">
              <OrderTicket
                contract={`${market.short} · ${market.week}`}
                lastPrice={lastPrice}
                selectedPrice={selectedPrice}
                onPlaceOrder={onPlaceOrder}
              />
              {demoOrderMessage && (
                <p className="terminal-order-notice" role="status">{demoOrderMessage}</p>
              )}
            </section>

            <section className="terminal-panel terminal-risk-panel" id="risk">
              <SectionHeading detail={<ShieldAlert size={14} />}>RISK &amp; SETTLEMENT</SectionHeading>
              <div className="terminal-risk-callout"><ShieldAlert size={15} /><p>Prototype only. No wallet, contract, escrow, or settlement is connected.</p></div>
              <div className="terminal-risk-row"><span>Delivery risk</span><strong>Mock attestation · unverified</strong></div>
              <div className="terminal-risk-row"><span>Provider collateral</span><strong>125% illustrative · not escrowed</strong></div>
              <div className="terminal-risk-row"><span>Trading fee</span><strong>Not configured</strong></div>
              <div className="terminal-risk-row"><span>Settlement</span><strong>Atomic flow planned</strong></div>
              <div className="terminal-risk-foot"><ShieldCheck size={13} /> Contract and delivery risks remain with participants.</div>
            </section>

            <section className="terminal-panel terminal-bot-panel">
              <SectionHeading detail={<span className="terminal-design-chip">ROADMAP</span>}>MARKET AUTOMATION</SectionHeading>
              <p>A market-maker bot is planned to quote both sides; a taker bot can seed simulated volume and stress-test matching.</p>
              <div className="terminal-bot-status"><span className="terminal-offline-dot" /> Bots not connected</div>
            </section>
          </aside>
        </div>

        <section className="terminal-pitch-panel" aria-label="Target user and market thesis">
          <div>
            <span className="terminal-eyebrow">FIRST USER HYPOTHESIS</span>
            <strong>GPU-backed lender financing cloud compute</strong>
            <p>Needs a transparent compute price reference to manage exposure to GPU utilization and inference costs.</p>
          </div>
          <div>
            <span className="terminal-eyebrow">PITCH THESIS · VALIDATE BEFORE USE</span>
            <strong>Spot contracts plus a native compute price index</strong>
            <p>The proposed market thesis is that GPU financing carries a premium when lenders cannot hedge compute exposure. The “over 5%” figure is unverified; this demo has no live index or sub-second settlement.</p>
          </div>
        </section>

        <footer className="terminal-footer">
          <span><span className="terminal-footer-mark">C/</span> compute/clob · experimental interface</span>
          <span><span className="terminal-live-dot" /> Simulated local market stream · no live network</span>
        </footer>
      </div>
    </main>
  );
}
