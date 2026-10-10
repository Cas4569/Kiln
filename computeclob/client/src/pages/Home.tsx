import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  CircleHelp,
  Clock3,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  LineChart,
  LockKeyhole,
  Menu,
  Network,
  Radio,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  WalletCards,
  Wifi,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

type Market = {
  id: string;
  short: string;
  name: string;
  subtitle: string;
  week: string;
  price: number;
  change: number;
  volume: string;
  supply: string;
  status: "LIVE" | "THIN";
  accent: "cyan" | "lime" | "purple";
};

type ActivityEvent = {
  id: number;
  time: string;
  type: "FILL" | "ORDER" | "SETTLE";
  label: string;
  detail: string;
  tone: "buy" | "sell" | "neutral";
};

const markets: Market[] = [
  {
    id: "h100-east-w42",
    short: "H100 / US-E",
    name: "NVIDIA H100 SXM",
    subtitle: "US-East · Week 42",
    week: "W42",
    price: 1.84,
    change: 4.7,
    volume: "48.2k",
    supply: "12,840",
    status: "LIVE",
    accent: "cyan",
  },
  {
    id: "a100-west-w42",
    short: "A100 / US-W",
    name: "NVIDIA A100 80GB",
    subtitle: "US-West · Week 42",
    week: "W42",
    price: 1.19,
    change: 2.1,
    volume: "21.9k",
    supply: "9,612",
    status: "LIVE",
    accent: "lime",
  },
  {
    id: "h200-east-w43",
    short: "H200 / US-E",
    name: "NVIDIA H200 SXM",
    subtitle: "US-East · Week 43",
    week: "W43",
    price: 2.43,
    change: -0.8,
    volume: "8.7k",
    supply: "4,280",
    status: "THIN",
    accent: "purple",
  },
];

const baseBook = {
  asks: [
    [1.89, 420, 6],
    [1.88, 680, 9],
    [1.87, 310, 4],
    [1.86, 920, 12],
    [1.85, 510, 7],
  ],
  bids: [
    [1.83, 740, 9],
    [1.82, 560, 8],
    [1.81, 880, 11],
    [1.80, 260, 3],
    [1.79, 1_120, 16],
  ],
};

const depthData = [
  { price: 1.72, bid: 0, ask: 11_900 },
  { price: 1.75, bid: 1_840, ask: 10_160 },
  { price: 1.78, bid: 3_920, ask: 8_340 },
  { price: 1.8, bid: 5_140, ask: 7_210 },
  { price: 1.81, bid: 6_060, ask: 6_200 },
  { price: 1.82, bid: 7_180, ask: 4_980 },
  { price: 1.83, bid: 8_460, ask: 3_920 },
  { price: 1.84, bid: 9_120, ask: 2_860 },
  { price: 1.85, bid: 10_760, ask: 2_210 },
  { price: 1.87, bid: 11_540, ask: 1_130 },
  { price: 1.9, bid: 12_980, ask: 320 },
];

const twapData = [
  { time: "08:00", value: 1.66, volume: 420 },
  { time: "09:00", value: 1.7, volume: 610 },
  { time: "10:00", value: 1.68, volume: 380 },
  { time: "11:00", value: 1.73, volume: 790 },
  { time: "12:00", value: 1.71, volume: 670 },
  { time: "13:00", value: 1.77, volume: 880 },
  { time: "14:00", value: 1.75, volume: 720 },
  { time: "15:00", value: 1.81, volume: 990 },
  { time: "16:00", value: 1.79, volume: 820 },
  { time: "17:00", value: 1.84, volume: 1_040 },
];

const initialActivity: ActivityEvent[] = [
  { id: 1, time: "14:32:08.412", type: "SETTLE", label: "Atomic settlement", detail: "240 H100-hours · 441.60 USDC", tone: "neutral" },
  { id: 2, time: "14:32:05.937", type: "FILL", label: "Provider_07 sold", detail: "180 @ 1.83 USDC", tone: "sell" },
  { id: 3, time: "14:31:58.102", type: "FILL", label: "Lender_02 bought", detail: "420 @ 1.82 USDC", tone: "buy" },
  { id: 4, time: "14:31:44.700", type: "ORDER", label: "New bid added", detail: "1,120 @ 1.79 USDC", tone: "buy" },
  { id: 5, time: "14:31:31.554", type: "FILL", label: "Market maker fill", detail: "90 @ 1.84 USDC", tone: "sell" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

function LogoMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function LiveDot({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="live-indicator">
      <span className="pulse-dot" />
      {label}
    </span>
  );
}

function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-label">
      <span>{children}</span>
      {action}
    </div>
  );
}

function StatTile({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: "default" | "positive" | "warning" }) {
  return (
    <div className={`stat-tile ${tone}`}>
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  );
}

function AppTooltip({ active, payload, label, kind = "price" }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string; kind?: "price" | "depth" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      <strong>{kind === "depth" ? formatNumber(payload[0].value) : payload[0].value.toFixed(2)} <em>{kind === "depth" ? "HRS" : "USDC"}</em></strong>
    </div>
  );
}

export default function Home() {
  const [activeMarketId, setActiveMarketId] = useState(markets[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderMode, setOrderMode] = useState<"limit" | "twap">("limit");
  const [price, setPrice] = useState("1.84");
  const [quantity, setQuantity] = useState("240");
  const [twapDuration, setTwapDuration] = useState("30");
  const [chartMode, setChartMode] = useState<"index" | "depth">("index");
  const [events, setEvents] = useState(initialActivity);
  const [bookTick, setBookTick] = useState(0);
  const [connected, setConnected] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const activeMarket = markets.find((market) => market.id === activeMarketId) ?? markets[0];
  const notional = (Number(price) || 0) * (Number(quantity) || 0);
  const visibleEvents = showAllEvents ? events : events.slice(0, 4);
  const marketPriceShift = activeMarket.price - markets[0].price;
  const marketTwapData = useMemo(() => twapData.map((point) => ({ ...point, value: point.value + marketPriceShift })), [marketPriceShift]);
  const marketDepthData = useMemo(() => depthData.map((point) => ({ ...point, price: point.price + marketPriceShift })), [marketPriceShift]);
  const sessionHigh = Math.max(...marketTwapData.map((point) => point.value));
  const sessionLow = Math.min(...marketTwapData.map((point) => point.value));

  useEffect(() => {
    const interval = window.setInterval(() => setBookTick((tick) => tick + 1), 3600);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setPrice(activeMarket.price.toFixed(2));
  }, [activeMarket]);

  const currentBook = useMemo(() => {
    const shift = bookTick % 3 === 1 ? 0.01 : bookTick % 3 === 2 ? -0.01 : 0;
    return {
      asks: baseBook.asks.map(([level, size, orders], index) => [level + shift + (activeMarket.price - 1.84), size + ((bookTick + index) % 4) * 20, orders]),
      bids: baseBook.bids.map(([level, size, orders], index) => [level + shift + (activeMarket.price - 1.84), size + ((bookTick + index) % 3) * 30, orders]),
    };
  }, [activeMarket.price, bookTick]);

  const placeOrder = () => {
    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);
    if (!numericPrice || !numericQuantity || numericPrice <= 0 || numericQuantity <= 0) {
      toast.error("Enter a valid price and quantity");
      return;
    }

    const action = orderMode === "twap" ? "TWAP tranche" : "Immediate fill";
    const event: ActivityEvent = {
      id: Date.now(),
      time: new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + String(Date.now()).slice(-3),
      type: "FILL",
      label: `${action} · you`,
      detail: `${formatNumber(numericQuantity)} @ ${numericPrice.toFixed(2)} USDC${orderMode === "twap" ? ` · ${twapDuration}m window` : " · atomic"}`,
      tone: side === "buy" ? "buy" : "sell",
    };
    setEvents((current) => [event, ...current]);
    toast.success(`${side === "buy" ? "Buy" : "Sell"} ${orderMode === "twap" ? "TWAP" : "limit"} executed`, {
      description: `${formatNumber(numericQuantity)} ${activeMarket.short.split(" /")[0]} hours ${orderMode === "twap" ? `scheduled across ${twapDuration} minutes` : "settled atomically"} in the demo stream.`,
    });
  };

  return (
    <div className="terminal-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <LogoMark />
          <div>
            <div className="brand-name">COMPUTE<span>/</span>CLOB</div>
            <div className="brand-subtitle">onchain compute markets</div>
          </div>
        </div>

        <nav className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`}>
          <a className="active" href="#markets">Markets</a>
          <a href="#providers">Providers</a>
          <a href="#protocol">Protocol</a>
          <a href="#risk">Risk desk</a>
          <div className="mobile-nav-footer">
            <span><Wifi size={13} /> Simulated network</span>
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={18} /></button>
          </div>
        </nav>

        <div className="topbar-actions">
          <span className="network-status"><span className="network-dot" /> Simulated network</span>
          <button className="icon-button" aria-label="Notifications"><Bell size={16} /></button>
          <button className={`connect-button ${connected ? "connected" : ""}`} onClick={() => { setConnected((value) => !value); toast.message(connected ? "Wallet disconnected" : "Demo wallet connected"); }}>
            <WalletCards size={15} />
            {connected ? "0x84…3A1F" : "Connect wallet"}
          </button>
          <button className="menu-button" onClick={() => setMobileMenuOpen((value) => !value)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}><Menu size={20} /></button>
        </div>
      </header>

      <div className="ticker-bar" aria-label="Market ticker">
        <div className="ticker-label"><Radio size={13} /> 24H MARKET PULSE</div>
        <div className="ticker-scroll">
          {markets.map((market) => (
            <button key={market.id} className="ticker-item" onClick={() => setActiveMarketId(market.id)}>
              <span className={`ticker-dot ${market.accent}`} />
              <span>{market.short}</span>
              <strong>${market.price.toFixed(2)}</strong>
              <em className={market.change >= 0 ? "positive" : "negative"}>{market.change >= 0 ? "+" : ""}{market.change.toFixed(1)}%</em>
            </button>
          ))}
        </div>
        <div className="ticker-end"><span className="live-signal" /> fills streaming <span>·</span> block 20,484,219</div>
      </div>

      <main className="terminal-content" id="markets">
        <div className="page-intro">
          <div>
            <div className="breadcrumb"><span>MARKETS</span><ChevronDown size={13} /><span>{activeMarket.subtitle.toUpperCase()}</span><ChevronDown size={13} /><span className="muted">SPOT</span></div>
            <div className="market-title-row">
              <div className={`market-orb ${activeMarket.accent}`}><span /></div>
              <div>
                <div className="title-line"><h1>{activeMarket.name}</h1><span className="contract-badge">ERC-1155 · {activeMarket.week}</span></div>
                <p>1 compute-hour · {activeMarket.subtitle} · deliverable contract</p>
              </div>
            </div>
          </div>
          <div className="hero-metrics">
            <div className="hero-price"><span className="eyebrow">TWAP INDEX <span className="index-live">LIVE</span></span><strong>${activeMarket.price.toFixed(2)}</strong><span className="positive"><ArrowUpRight size={14} /> {activeMarket.change >= 0 ? "+" : ""}{activeMarket.change.toFixed(1)}% <small>24H</small></span></div>
            <div className="hero-metric-divider" />
            <div className="hero-stat"><span className="eyebrow">LAST FILL</span><strong>${(activeMarket.price - 0.01).toFixed(2)}</strong><span>12 sec ago</span></div>
            <div className="hero-metric-divider" />
            <div className="hero-stat"><span className="eyebrow">SPREAD</span><strong>0.54%</strong><span className="lime-copy">8.6 bps tighter</span></div>
          </div>
        </div>

        <div className="terminal-grid">
          <aside className="left-rail">
            <section className="panel markets-panel">
              <SectionLabel action={<button className="plain-icon" aria-label="Filter markets" onClick={() => toast.message("Showing all live compute contracts") }><SlidersHorizontal size={14} /></button>}>MARKETS <span className="count-pill">03</span></SectionLabel>
              <div className="market-list">
                {markets.map((market) => (
                  <button key={market.id} className={`market-row ${activeMarket.id === market.id ? "selected" : ""}`} onClick={() => setActiveMarketId(market.id)} aria-pressed={activeMarket.id === market.id}>
                    <span className={`market-mini-orb ${market.accent}`}><span /></span>
                    <span className="market-row-copy"><strong>{market.short}</strong><small>{market.subtitle}</small></span>
                    <span className="market-row-price"><strong>${market.price.toFixed(2)}</strong><small className={market.change >= 0 ? "positive" : "negative"}>{market.change >= 0 ? "+" : ""}{market.change.toFixed(1)}%</small></span>
                  </button>
                ))}
              </div>
              <button className="add-market" onClick={() => toast.message("Contract discovery is coming next") }><span>+</span> Add contract</button>
            </section>

            <section className="panel supply-panel" id="providers">
              <SectionLabel action={<span className="status-chip lime"><span /> VERIFIED</span>}>PROVIDER SUPPLY</SectionLabel>
              <div className="supply-total"><strong>{activeMarket.supply}</strong><span>hours available</span></div>
              <div className="supply-bar"><span style={{ width: "68%" }} /></div>
              <div className="supply-meta"><span>68% minted</span><span>18 providers</span></div>
              <div className="provider-stack"><span>NV</span><span>GP</span><span>AK</span><span>+15</span></div>
              <p className="panel-note">Collateral-backed supply with mock delivery attestations. Slashing is enabled for the demo.</p>
              <p className="provider-target"><span>NEXT STEP</span> onboard 2 GPU providers to mint real supply</p>
              <button className="text-button" onClick={() => toast.message("Provider registry is available in the protocol explorer")}>View provider registry <ArrowUpRight size={13} /></button>
            </section>

            <section className="panel protocol-mini" id="protocol">
              <SectionLabel action={<CircleHelp size={14} />}>PROTOCOL STATUS</SectionLabel>
              <div className="protocol-row"><span><span className="protocol-icon cyan"><Network size={13} /></span> OrderBook</span><strong>v0.8.4</strong></div>
              <div className="protocol-row"><span><span className="protocol-icon lime"><Database size={13} /></span> IndexOracle</span><strong>TWAP · 5m</strong></div>
              <div className="protocol-row"><span><span className="protocol-icon purple"><LockKeyhole size={13} /></span> Settlement</span><strong>atomic</strong></div>
              <div className="protocol-health"><span className="pulse-dot" /> all systems nominal</div>
            </section>
          </aside>

          <section className="main-column">
            <section className="panel chart-panel">
              <div className="panel-header chart-header">
                <SectionLabel action={<span className="chart-source"><span className="pulse-dot" /> INDEXORACLE / ROLLING 5M</span>}>PRICE DISCOVERY</SectionLabel>
                <div className="chart-controls">
                  <div className="segmented compact">
                    <button className={chartMode === "index" ? "active" : ""} onClick={() => setChartMode("index")} aria-pressed={chartMode === "index"}>TWAP INDEX</button>
                    <button className={chartMode === "depth" ? "active" : ""} onClick={() => setChartMode("depth")} aria-pressed={chartMode === "depth"}>DEPTH</button>
                  </div>
                  <div className="chart-range"><button className="active">1D</button><button>1W</button><button>ALL</button></div>
                </div>
              </div>
              <div className="chart-summary">
                <div><span className="eyebrow">SESSION HIGH</span><strong>${sessionHigh.toFixed(2)}</strong></div>
                <div><span className="eyebrow">SESSION LOW</span><strong>${sessionLow.toFixed(2)}</strong></div>
                <div><span className="eyebrow">VOLUME</span><strong>{activeMarket.volume} <small>HOURS</small></strong></div>
                <div className="chart-updated"><RefreshCw size={12} className={bookTick ? "spin-once" : ""} /> updated just now</div>
              </div>
              <div className="chart-wrap">
                {chartMode === "index" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketTwapData} margin={{ top: 14, right: 12, left: -18, bottom: 0 }}>
                      <defs><linearGradient id="twapFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#54e7f1" stopOpacity={0.24} /><stop offset="100%" stopColor="#54e7f1" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid stroke="#26383e" strokeDasharray="2 6" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: "#6d858b", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis domain={[sessionLow - 0.05, sessionHigh + 0.05]} tick={{ fill: "#6d858b", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toFixed(2)}`} width={48} />
                      <Tooltip content={<AppTooltip />} cursor={{ stroke: "#3c5b62", strokeDasharray: "3 3" }} />
                      <Area type="monotone" dataKey="value" stroke="#54e7f1" strokeWidth={2.5} fill="url(#twapFill)" dot={false} activeDot={{ r: 4, fill: "#54e7f1", stroke: "#0f171b", strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketDepthData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                      <defs><linearGradient id="bidFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b9e86c" stopOpacity={0.35} /><stop offset="100%" stopColor="#b9e86c" stopOpacity={0.02} /></linearGradient><linearGradient id="askFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff7b7b" stopOpacity={0.25} /><stop offset="100%" stopColor="#ff7b7b" stopOpacity={0.02} /></linearGradient></defs>
                      <CartesianGrid stroke="#26383e" strokeDasharray="2 6" vertical={false} />
                      <XAxis dataKey="price" tick={{ fill: "#6d858b", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toFixed(2)}`} dy={10} />
                      <YAxis tick={{ fill: "#6d858b", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} width={42} />
                      <Tooltip content={<AppTooltip kind="depth" />} />
                      <Area type="monotone" dataKey="bid" stroke="#b9e86c" strokeWidth={2} fill="url(#bidFill)" dot={false} />
                      <Area type="monotone" dataKey="ask" stroke="#ff7b7b" strokeWidth={2} fill="url(#askFill)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="chart-legend"><span><i className="legend-line cyan-line" /> TWAP index</span><span><i className="legend-line lime-line" /> buy-side depth</span><span><i className="legend-line coral-line" /> sell-side depth</span><span className="chart-footnote">price per compute-hour · USDC</span></div>
            </section>

            <section className="panel orderbook-panel">
              <div className="panel-header orderbook-header">
                <SectionLabel action={<span className="book-live"><Wifi size={12} /> websocket · {bookTick ? "streaming" : "connected"}</span>}>ORDER BOOK <span className="count-pill">PRICE / TIME</span></SectionLabel>
                <div className="book-actions"><button className="plain-icon" aria-label="Toggle book chart"><BarChart3 size={14} /></button><button className="plain-icon" aria-label="Order book settings"><SlidersHorizontal size={14} /></button></div>
              </div>
              <div className="book-column-labels"><span>PRICE <small>USDC</small></span><span>SIZE <small>HRS</small></span><span>ORDERS</span></div>
              <div className="book-ladder">
                <div className="book-side asks">
                  {currentBook.asks.map(([level, size, orders], index) => <div className="book-row" key={`ask-${index}`}><span className="book-depth" style={{ width: `${Math.min(96, Number(size) / 12)}%` }} /><span className="price">{Number(level).toFixed(2)}</span><span>{formatNumber(Number(size))}</span><span>{orders}</span></div>)}
                </div>
                <div className="mid-price"><span>MARK</span><strong>${activeMarket.price.toFixed(2)}</strong><em>spread 1.08¢</em></div>
                <div className="book-side bids">
                  {currentBook.bids.map(([level, size, orders], index) => <div className="book-row" key={`bid-${index}`}><span className="book-depth" style={{ width: `${Math.min(96, Number(size) / 12)}%` }} /><span className="price">{Number(level).toFixed(2)}</span><span>{formatNumber(Number(size))}</span><span>{orders}</span></div>)}
                </div>
              </div>
              <div className="book-footer"><span><i className="dot coral" /> asks 2,840 hrs</span><span><i className="dot lime" /> bids 3,560 hrs</span><span className="book-footer-right">matching engine <strong>8.4ms</strong></span></div>
            </section>
          </section>

          <aside className="right-rail">
            <section className="panel ticket-panel">
              <div className="ticket-heading"><SectionLabel action={<span className="demo-pill"><Sparkles size={12} /> DEMO MODE</span>}>ORDER TICKET</SectionLabel></div>
              <div className="segmented side-switch"><button className={side === "buy" ? "active buy-active" : ""} onClick={() => setSide("buy")} aria-pressed={side === "buy"}>Buy</button><button className={side === "sell" ? "active sell-active" : ""} onClick={() => setSide("sell")} aria-pressed={side === "sell"}>Sell</button></div>
              <div className="order-tabs"><button className={orderMode === "limit" ? "active" : ""} onClick={() => setOrderMode("limit")} aria-pressed={orderMode === "limit"}>Limit</button><button className={orderMode === "twap" ? "active" : ""} onClick={() => setOrderMode("twap")} aria-pressed={orderMode === "twap"}>TWAP</button></div>
              <label className="field-label">PRICE <span>USDC / HOUR</span><div className="input-wrap"><input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" /><span>USDC</span></div></label>
              <label className="field-label">QUANTITY <span>AVAILABLE {activeMarket.supply} HRS</span><div className="input-wrap"><input value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="numeric" /><span>HRS</span></div></label>
              {orderMode === "twap" && <label className="field-label">DURATION <span>EXECUTION WINDOW</span><div className="input-wrap select-wrap"><select value={twapDuration} onChange={(event) => setTwapDuration(event.target.value)}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select><ChevronDown size={15} /></div></label>}
              <div className="order-summary"><span>EST. NOTIONAL</span><strong>{notional.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <small>USDC</small></strong></div>
              <button className={`place-order ${side}`} onClick={placeOrder}>{side === "buy" ? "Place buy order" : "Place sell order"}<ArrowUpRight size={16} /></button>
              <div className="ticket-note"><LockKeyhole size={12} /> simulated fill · no wallet signature required</div>
            </section>

            <section className="panel activity-panel">
              <div className="panel-header"><SectionLabel action={<LiveDot label="STREAMING" />}>ACTIVITY FEED</SectionLabel><button className="plain-icon" aria-label="Activity feed settings"><SlidersHorizontal size={14} /></button></div>
              <div className="activity-list">
                {visibleEvents.map((event) => (
                  <div className="activity-row" key={event.id}>
                    <div className={`activity-icon ${event.tone}`}>{event.type === "FILL" ? <Activity size={13} /> : event.type === "SETTLE" ? <LockKeyhole size={13} /> : <ArrowUpRight size={13} />}</div>
                    <div className="activity-copy"><strong>{event.label}</strong><span>{event.detail}</span><small>{event.time}</small></div>
                    <span className={`event-type ${event.type.toLowerCase()}`}>{event.type}</span>
                  </div>
                ))}
              </div>
              <button className="feed-more" onClick={() => setShowAllEvents((value) => !value)}>{showAllEvents ? "Collapse feed" : "View full activity"} <ArrowUpRight size={13} /></button>
            </section>

            <section className="panel metrics-panel">
              <SectionLabel action={<span className="eyebrow">SINCE LAUNCH</span>}>BOT TRACTION</SectionLabel>
              <div className="mini-metric-grid"><StatTile label="TRADES" value="1,284" detail="+18.2% / hour" tone="positive" /><StatTile label="AVG SPREAD" value="0.54%" detail="top 5% of book" tone="positive" /><StatTile label="SETTLEMENT" value="&lt; 1s" detail="atomic / onchain" tone="default" /><StatTile label="TARGET" value="02" detail="GPU providers" tone="warning" /></div>
            </section>
          </aside>
        </div>

        <section className="risk-strip" id="risk">
          <div className="risk-heading"><div className="risk-icon"><ShieldCheck size={18} /></div><div><span className="eyebrow">RISK DESK</span><strong>Know what you are trading</strong></div></div>
          <div className="risk-item"><TriangleAlert size={15} /><div><span>DELIVERY RISK</span><strong>Mock attestation active</strong></div></div>
          <div className="risk-item"><Layers3 size={15} /><div><span>COLLATERAL</span><strong>125% provider-backed</strong></div></div>
          <div className="risk-item"><Gauge size={15} /><div><span>TAKER FEE</span><strong>0.08% · maker 0 bps</strong></div></div>
          <div className="risk-item"><GitBranch size={15} /><div><span>SETTLEMENT</span><strong>USDC + token atomic</strong></div></div>
          <div className="risk-disclaimer">This is a simulated market. Not financial advice.</div>
        </section>

        <section className="story-footer">
          <div className="story-copy"><span className="eyebrow">WHY THIS MARKET EXISTS</span><h2>Compute is becoming a commodity.<br /><em>Hedging should be native.</em></h2><p>Companies pay over 5% extra to borrow against GPUs because lenders cannot hedge compute. Compute/CLOB gives GPU-backed lenders and small AI startups a spot market with a native TWAP index.</p><button className="text-button" onClick={() => toast.message("Protocol thesis: make compute price discovery native")}>Read the protocol thesis <BookOpen size={14} /></button></div>
          <div className="architecture-map"><div className="architecture-line" /><div className="architecture-node"><span className="node-num">01</span><strong>ComputeToken</strong><small>ERC-1155 contract IDs</small></div><div className="architecture-node highlighted"><span className="node-num">02</span><strong>OrderBook</strong><small>bounded price-time match</small></div><div className="architecture-node"><span className="node-num">03</span><strong>Settlement</strong><small>atomic USDC / token</small></div><div className="architecture-node"><span className="node-num">04</span><strong>IndexOracle</strong><small>rolling TWAP from trades</small></div></div>
        </section>
      </main>

      <footer className="site-footer"><span><LogoMark /> compute/clob · testnet preview</span><span>built for lenders, infra funds &amp; frontier labs</span><span><Clock3 size={12} /> last block 2.4s ago</span></footer>
    </div>
  );
}
