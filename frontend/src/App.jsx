import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Plane, Hotel, HelpCircle, DollarSign, Calendar, MapPin, 
  Sparkles, Terminal, ArrowRight, CheckCircle2, Loader2, 
  Coins, Compass, ChevronDown, ChevronUp, Printer, Info, 
  AlertTriangle, RefreshCw, ShoppingBag, ShieldCheck, Smartphone
} from "lucide-react";

function App() {
  // Input states
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [style, setStyle] = useState("Explorer"); // Backpacker, Explorer, Splurge
  const [fromCity, setFromCity] = useState("");
  // API states
  const [trip, setTrip] = useState(null);
  const [wireLogs, setWireLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // UI toggle states
  const [activeTab, setActiveTab] = useState("itinerary"); // itinerary, budget, places, packing
  const [expandedDay, setExpandedDay] = useState(0); // Index of expanded day
  const [showConsole, setShowConsole] = useState(true);
  const [expandedLog, setExpandedLog] = useState(null);

  const consoleEndRef = useRef(null);

  const loadingSteps = [
    "Establishing connection with Anakin Wire API...",
    "Querying flights and transit systems...",
    "Scanning hotel availability on Booking.com...",
    "Running calculations in the Hidden Cost Engine...",
    "Performing budget optimization reasoning with Groq AI...",
    "Formatting daily itinerary and travel guidelines..."
  ];

  // Auto scroll terminal to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [wireLogs]);

  // Loading steps interval simulation
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const generateTrip = async () => {
    if (!fromCity || !destination || !budget || !days) {
      alert("Please enter source city, destination, budget and trip duration!");
      return;
    }

    try {
      setLoading(true);
      setTrip(null);
      setWireLogs([]);

      // Start connection log
      setWireLogs([{
        timestamp: new Date().toLocaleTimeString(),
        step: "Initiating TravelGPT Client Core",
        status: "STARTING",
        message: `Planning a ${days}-day trip to ${destination} with style: ${style}`
      }]);

      const response = await axios.post("http://localhost:5005/generate-trip", {
        fromCity,
        destination,
        budget,
        days,
        style
      });

      if (response.data.success) {
        setTrip(response.data.trip);
        setWireLogs(response.data.wireLogs || []);
      } else {
        alert("Failed to build plan: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend server. Make sure node backend is running on port 5005.");
      setWireLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          step: "Connection Failed",
          status: "ERROR",
          message: "Could not reach backend server at http://localhost:5005"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic packing list based on tags
  const getPackingList = () => {
    const dest = destination.toLowerCase();
    const common = ["Passport / ID documents", "Toothbrush & Toiletries", "Universal travel adapter", "First-aid / medicines", "Power bank", "Cash / Debit Cards"];
    if (dest.includes("goa") || dest.includes("bali") || dest.includes("phuket") || dest.includes("beach")) {
      return [...common, "Sunscreen (SPF 50+)", "Swimwear / Board shorts", "Sunglasses", "Flip-flops & sandals", "Quick-dry microfibre towel", "Light cotton tees"];
    } else if (dest.includes("manali") || dest.includes("leh") || dest.includes("ladakh") || dest.includes("iceland") || dest.includes("switzerland")) {
      return [...common, "Thermal innerwear", "Down jacket / Windcheater", "Beanie & woollen gloves", "Hiking shoes", "Moisturizer / Lip balm", "Socks (wool blend)"];
    } else if (dest.includes("tokyo") || dest.includes("paris") || dest.includes("london") || dest.includes("singapore") || dest.includes("dubai") || dest.includes("new york")) {
      return [...common, "Comfortable walking sneakers", "Smart casual wear for cafes", "Umbrella / lightweight rain shell", "Local travel transit card apps", "E-Wallet apps configured"];
    }
    return [...common, "Comfortable walking shoes", "Appropriate seasonal clothing", "Reusable water bottle", "Hand sanitizer"];
  };

  // Calculate SVG Donut segment coordinates
  const renderSVGDonut = () => {
    if (!trip || !trip.costBreakdown) return null;
    const breakdown = trip.costBreakdown;
    
    // Values
    const flight = parseFloat(breakdown.flight) || 0;
    const hotel = parseFloat(breakdown.hotel) || 0;
    const food = parseFloat(breakdown.food) || 0;
    const transit = parseFloat(breakdown.localTransit) || 0;
    const activities = parseFloat(breakdown.activities) || 0;
    const hidden = parseFloat(breakdown.hiddenCosts) || 0;
    
    const total = flight + hotel + food + transit + activities + hidden;
    if (total === 0) return null;

    const categories = [
      { name: "Flights", value: flight, color: "#8b5cf6" }, // Purple
      { name: "Hotels", value: hotel, color: "#06b6d4" },  // Cyan
      { name: "Food", value: food, color: "#ec4899" },    // Pink
      { name: "Transit", value: transit, color: "#f59e0b" }, // Amber
      { name: "Activities", value: activities, color: "#10b981" }, // Emerald
      { name: "Hidden Costs", value: hidden, color: "#ef4444" } // Red
    ].filter(c => c.value > 0);

    let cumulativePercentage = 0;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
        {/* SVG Circle Graph */}
        <div className="relative w-44 h-44">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {categories.map((cat, idx) => {
              const percentage = cat.value / total;
              const strokeLength = percentage * circumference;
              const strokeOffset = circumference - (cumulativePercentage * circumference);
              cumulativePercentage += percentage;

              return (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 hover:stroke-[12px] cursor-pointer"
                  title={`${cat.name}: ₹${cat.value.toLocaleString()}`}
                />
              );
            })}
            <circle cx="60" cy="60" r="40" fill="#0c111d" />
          </svg>
          {/* Centered Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Total Cost</span>
            <span className="text-xl font-bold font-display text-white">₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          {categories.map((cat, idx) => {
            const percentage = ((cat.value / total) * 100).toFixed(0);
            return (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex flex-col">
                  <span className="text-zinc-400 text-xs font-medium">{cat.name}</span>
                  <span className="text-white text-sm font-semibold font-display">
                    ₹{cat.value.toLocaleString()}<span className="text-zinc-500 text-[10px] ml-1 font-normal">({percentage}%)</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#060810] text-zinc-100 flex flex-col selection:bg-accentPurple/30 selection:text-white pb-12">
      {/* Header Banner */}
      <header className="w-full glass-panel border-t-0 border-x-0 py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-accentCyan to-accentPurple p-2 rounded-xl text-white shadow-lg shadow-accentCyan/10">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-accentCyan">
              TravelGPT <span className="text-sm font-normal text-zinc-500 font-sans px-1">v2.1</span>
            </h1>
            <p className="text-[10px] tracking-wider uppercase font-semibold text-accentPurple/80 -mt-1 flex items-center gap-1">
              Powered by <span className="text-accentCyan font-display font-bold">Anakin Wire</span>
            </p>
          </div>
        </div>

        {/* API Badge indicators for Hackathon */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anakin Wire API: Fallback Ready</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Groq Llama 3.3: Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left Side inputs / controls (Grid column 4) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden border border-zinc-800/80 shadow-2xl">
            {/* Absolute decorative gradient orb */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accentCyan/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accentPurple/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-xl font-bold font-display text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accentCyan" />
              Configure AI Planner
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Enter your parameters below. Our agent pulls actual web listings to build your optimal budget.
            </p>

            <div className="flex flex-col gap-5">
              {/* From City */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accentCyan" />
                  From City
              </label>

              <input
                type="text"
                placeholder="e.g. Delhi, Mumbai, Jaipur"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 outline-none text-sm text-white focus:border-accentCyan/50 focus:ring-1 focus:ring-accentCyan/30 transition-all font-medium"
              />
            </div>
              {/* Destination */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accentPurple" /> Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goa, Manali, Tokyo, Paris"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 outline-none text-sm text-white focus:border-accentCyan/50 focus:ring-1 focus:ring-accentCyan/30 transition-all font-medium"
                />
              </div>

              {/* Days & Budget Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accentCyan" /> Trip Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    placeholder="e.g. 5"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 outline-none text-sm text-white focus:border-accentCyan/50 focus:ring-1 focus:ring-accentCyan/30 transition-all font-medium font-display"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" /> Budget (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 outline-none text-sm text-white focus:border-accentCyan/50 focus:ring-1 focus:ring-accentCyan/30 transition-all font-medium font-display"
                  />
                </div>
              </div>

              {/* Travel Style Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Travel Class / Comfort Profile
                </label>
                <div className="grid grid-cols-3 gap-2 bg-zinc-950/50 p-1.5 rounded-xl border border-zinc-800/80">
                  {["Backpacker", "Explorer", "Splurge"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 ${
                        style === s
                          ? "bg-gradient-to-tr from-accentCyan to-accentPurple text-white shadow-md shadow-accentCyan/10"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateTrip}
                disabled={loading}
                className="mt-4 bg-gradient-to-r from-accentCyan to-accentPurple hover:from-accentCyan/90 hover:to-accentPurple/90 text-white font-bold p-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-accentPurple/20 disabled:opacity-75 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Web Data...</span>
                  </>
                ) : (
                  <>
                    <span>Generate AI Budget Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick-select cards for Hackathon demonstration */}
          <div className="glass-panel rounded-3xl p-6 border border-zinc-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-accentCyan" /> Ready Presets
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "🏖️ Goa Beach Getaway (3 Days)", dest: "Goa", budget: "15000", days: "3", style: "Backpacker" },
                { label: "🏔️ Manali Adventure (5 Days)", dest: "Manali", budget: "22000", days: "5", style: "Explorer" },
                { label: "🏙️ Tokyo Cyberpunk (7 Days)", dest: "Tokyo", budget: "120000", days: "7", style: "Explorer" },
                { label: "🗼 Paris Romantic Splurge (4 Days)", dest: "Paris", budget: "250000", days: "4", style: "Splurge" }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFromCity("");
                    setDestination(p.dest);
                    setBudget(p.budget);
                    setDays(p.days);
                    setStyle(p.style);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-950/40 border border-zinc-900/80 hover:border-zinc-800 text-left text-xs font-medium text-zinc-300 hover:text-white flex justify-between items-center transition-all group"
                >
                  <span>{p.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-accentCyan transform -rotate-90" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Side Results Display / Loading State (Grid column 8) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Loading Screen */}
          {loading && (
            <div className="glass-panel rounded-3xl p-8 min-h-[500px] flex flex-col items-center justify-center text-center relative border border-zinc-800/80 shadow-2xl">
              {/* Outer rotating pulse orbs */}
              <div className="absolute w-56 h-56 bg-accentCyan/10 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute w-56 h-56 bg-accentPurple/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
              
              <div className="bg-zinc-950/50 p-6 rounded-full border border-zinc-800/80 mb-6 shadow-xl relative">
                <Loader2 className="w-12 h-12 text-accentCyan animate-spin" />
              </div>

              <h2 className="text-2xl font-black tracking-tight font-display text-white mb-2 animate-pulse">
                AI Orchestration Active
              </h2>
              <p className="text-zinc-400 text-sm max-w-md mb-8">
                Analyzing the web using Anakin Wire. Selecting cheapest options and compiling budget limits.
              </p>

              {/* Progress Steps UI */}
              <div className="max-w-md w-full bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl text-left">
                <span className="text-[10px] uppercase font-bold text-accentCyan tracking-wider">Plan Status</span>
                <h3 className="text-white text-sm font-semibold mb-3">{loadingSteps[loadingStep]}</h3>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-accentCyan to-accentPurple h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  />
                </div>
                
                {/* Visual Step Logs */}
                <div className="mt-4 flex flex-col gap-2">
                  {loadingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {loadingStep > idx ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : loadingStep === idx ? (
                        <Loader2 className="w-3.5 h-3.5 text-accentCyan animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-zinc-800 flex-shrink-0" />
                      )}
                      <span className={loadingStep > idx ? "text-zinc-500 line-through" : loadingStep === idx ? "text-zinc-200 font-semibold" : "text-zinc-600"}>
                        {step.substring(0, 45)}...
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Welcome Screen (Initial State) */}
          {!loading && !trip && (
            <div className="glass-panel rounded-3xl p-8 min-h-[500px] flex flex-col items-center justify-center text-center border border-zinc-800/80 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-accentCyan/5 rounded-full blur-[100px]" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accentPurple/5 rounded-full blur-[100px]" />
              
              <div className="bg-gradient-to-tr from-accentCyan/10 to-accentPurple/10 p-6 rounded-full border border-zinc-800/60 mb-6">
                <Compass className="w-12 h-12 text-accentCyan" />
              </div>
              <h2 className="text-3xl font-black font-display text-white tracking-tight mb-3">
                No Active Plan
              </h2>
              <p className="text-zinc-400 text-sm max-w-sm leading-relaxed mb-6">
                Configure your destination, duration, and target budget on the left to activate the AI agent pipelines.
              </p>
              <div className="flex gap-4 items-center justify-center flex-wrap">
                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-accentCyan" />
                  <span>Anakin Web Search</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-accentPurple" />
                  <span>Groq AI Llama reasoning</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Hidden Fee calculation</span>
                </div>
              </div>
            </div>
          )}

          {/* Results Plan Display */}
          {trip && (
            <div className="flex flex-col gap-6" id="printable-trip">
              
              {/* Trip Hero Banner */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 border border-zinc-800/80 shadow-2xl relative overflow-hidden bg-gradient-to-b from-zinc-950/60 to-[#0c111d]/80">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accentPurple/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-accentCyan tracking-wider flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3" /> Custom AI Travel Plan
                    </span>
                    <h2 className="text-4xl font-black tracking-tight text-white font-display">
                      {trip.destination}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-accentCyan" /> {days} Days Itinerary
                      </span>
                      <span className="flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-accentPurple" /> Style: {style}
                      </span>
                    </p>
                  </div>
                  
                  {/* Export Options */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button 
                      onClick={() => window.print()}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Itinerary</span>
                    </button>
                  </div>
                </div>

                {/* Donut Chart and Allocation details (Hidden in Print Mode) */}
                <div className="mt-8 pt-6 border-t border-zinc-800/80 print:hidden">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" /> Budget Allocation Breakdown
                  </h3>
                  {renderSVGDonut()}
                </div>
              </div>

              {/* Content Navigator (Itinerary, Flight/Hotel, Packing list tabs) - Hidden in Print */}
              <div className="flex bg-zinc-950/60 border border-zinc-900 p-1 rounded-2xl print:hidden">
                {[
                  { id: "itinerary", label: "📅 Daily Itinerary", icon: Calendar },
                  { id: "accommodation", label: "✈️ Flights & Hotels", icon: Hotel },
                  { id: "packing", label: "🎒 Packing List", icon: ShoppingBag }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-zinc-900 text-white shadow border border-zinc-800"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Daily Itinerary */}
              {(activeTab === "itinerary" || window.matchMedia("print").matches) && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-white mb-2 hidden print:block">
                    Daily Schedule
                  </h3>
                  {trip.itinerary && trip.itinerary.map((dayText, index) => {
                    const isExpanded = expandedDay === index;
                    return (
                      <div 
                        key={index} 
                        className={`glass-panel rounded-2xl transition-all duration-300 border ${
                          isExpanded ? "border-zinc-800 bg-[#0c111d]/50" : "border-zinc-900/60 hover:border-zinc-800 bg-zinc-950/30"
                        }`}
                      >
                        {/* Day Title Bar */}
                        <div 
                          onClick={() => setExpandedDay(isExpanded ? -1 : index)}
                          className="p-5 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accentCyan to-accentPurple text-white flex items-center justify-center font-bold text-xs font-display shadow-md">
                              {index + 1}
                            </div>
                            <h4 className="text-sm font-bold text-white tracking-wide">
                              {dayText.startsWith("Day") ? dayText.split(":")[0] : `Day ${index + 1}`}
                              <span className="text-zinc-400 font-normal text-xs ml-2">
                                {dayText.includes(":") ? dayText.split(":").slice(1).join(":") : dayText}
                              </span>
                            </h4>
                          </div>
                          <div className="text-zinc-500 hover:text-zinc-300">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 border-t border-zinc-900/80 text-zinc-300 text-sm leading-relaxed space-y-4">
                            {/* Visual Timeline Details */}
                            <div className="flex flex-col gap-3 relative pl-6 border-l border-zinc-800/80 ml-4 py-2">
                              {dayText.split(".").filter(s => s.trim().length > 3).map((sentence, idx) => (
                                <div key={idx} className="relative">
                                  {/* Timeline Node Bullet */}
                                  <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-accentCyan timeline-dot shadow-md shadow-accentCyan/20" />
                                  <p className="text-zinc-300 font-medium">
                                    {sentence.trim() + "."}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Accommodation / Flight details */}
              {activeTab === "accommodation" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Flight Info */}
                  <div className="glass-panel rounded-2xl p-6 border border-zinc-900 relative bg-[#0c111d]/40">
                    <span className="absolute top-4 right-4 bg-accentPurple/10 text-accentPurple text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Cheapest
                    </span>
                    <h4 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-accentPurple" />
                      Flight Route Detail
                    </h4>

                    <div className="flex flex-col gap-4">
                      <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Airline / Route</span>
                        <p className="text-sm font-bold text-white">{trip.flight?.name || "N/A"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Estimated Cost</span>
                          <p className="text-sm font-bold font-display text-white">₹{parseInt(trip.flight?.price || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Quality Index</span>
                          <p className="text-sm font-bold text-emerald-400">4.5/5 Rating</p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-xs text-zinc-400 mt-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-900">
                        <Info className="w-4 h-4 text-accentCyan flex-shrink-0 mt-0.5" />
                        <p>Rates pulled from Anakin API scraper logs. Note: Prices fluctuate with season.</p>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="glass-panel rounded-2xl p-6 border border-zinc-900 relative bg-[#0c111d]/40">
                    <span className="absolute top-4 right-4 bg-accentCyan/10 text-accentCyan text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {style} Recommended
                    </span>
                    <h4 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-accentCyan" />
                      Accommodation Detail
                    </h4>

                    <div className="flex flex-col gap-4">
                      <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Hotel name</span>
                        <p className="text-sm font-bold text-white">{trip.hotel?.name || "N/A"}</p>
                      </div>

                      <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Address / Location</span>
                        <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          {trip.hotel?.location || "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Total Cost ({days} nights)</span>
                          <p className="text-sm font-bold font-display text-white">₹{parseInt(trip.hotel?.price || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Rate per Night</span>
                          <p className="text-sm font-bold font-display text-white">₹{Math.round(parseInt(trip.hotel?.price || 0) / days).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Packing list */}
              {activeTab === "packing" && (
                <div className="glass-panel rounded-2xl p-6 border border-zinc-900 bg-[#0c111d]/40">
                  <h4 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-accentCyan" />
                    Intelligent Packing List Generator
                  </h4>
                  <p className="text-xs text-zinc-400 mb-4">
                    Based on your destination tags and typical climate constraints, we recommend packing:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getPackingList().map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-zinc-950/50 border border-zinc-900/60 rounded-xl hover:border-zinc-800 transition-all">
                        <div className="w-4 h-4 rounded border border-zinc-800 flex items-center justify-center cursor-pointer hover:bg-accentCyan/20 hover:border-accentCyan transition-all" />
                        <span className="text-xs font-semibold text-zinc-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden Costs Table */}
              <div className="glass-panel rounded-2xl p-6 border border-zinc-900 bg-zinc-950/20">
                <h4 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-red-400" />
                  Hidden Costs & Regulatory Fees
                </h4>
                <div className="overflow-hidden border border-zinc-900 rounded-xl bg-zinc-950/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/80 border-b border-zinc-850">
                        <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider">Item / Fee Name</th>
                        <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-right">Cost Estimations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {trip.hiddenCosts && trip.hiddenCosts.map((costStr, index) => {
                        const parts = costStr.split(":");
                        const name = parts[0];
                        const price = parts[1] || "N/A";
                        return (
                          <tr key={index} className="hover:bg-zinc-900/30">
                            <td className="p-3 font-semibold text-zinc-300">{name}</td>
                            <td className="p-3 text-right font-bold font-display text-white">{price}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <Info className="w-3.5 h-3.5" />
                  <span>These represent estimated legal, commute, and safety buffers derived from regional data.</span>
                </div>
              </div>

              {/* Recommendation card */}
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800 bg-[#0c111d]/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accentPurple/5 rounded-full blur-2xl pointer-events-none" />
                <h4 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accentCyan" />
                  AI Smart Savings Recommendation
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium whitespace-pre-line">
                  {trip.recommendation}
                </p>
              </div>

            </div>
          )}
        </section>
      </main>

      {/* Anakin Wire Logs Side Console (Floating / Bottom Bar) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full mt-6 print:hidden">
        <div className="glass-panel rounded-3xl border border-zinc-900 shadow-2xl overflow-hidden bg-zinc-950/80">
          {/* Header Bar */}
          <div 
            onClick={() => setShowConsole(!showConsole)}
            className="p-4 bg-zinc-900/80 border-b border-zinc-850 flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accentCyan animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white font-display">
                Anakin Wire Live Transaction Console
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/30">
                Live Feed
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300">
              <span className="text-[10px] font-semibold">{showConsole ? "Collapse" : "Expand logs"}</span>
              {showConsole ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {/* Logs Body */}
          {showConsole && (
            <div className="p-4 flex flex-col md:flex-row gap-4 h-80 max-h-80">
              {/* Left Column: Transaction Feed */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 bg-zinc-950 border border-zinc-900 p-3 rounded-xl terminal-window text-[11px] text-zinc-400">
                {wireLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic">
                    No active tasks. Start a search to stream API logs.
                  </div>
                ) : (
                  wireLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setExpandedLog(log)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col gap-1 ${
                        log.status === "ERROR" 
                          ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-300"
                          : log.status === "COMPLETED"
                          ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300"
                          : log.status === "POLLING"
                          ? "border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40"
                          : "border-accentCyan/20 bg-accentCyan/5 hover:bg-accentCyan/10 text-accentCyan"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span>[{log.timestamp}] {log.step}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-900 font-mono tracking-widest">
                          {log.status}
                        </span>
                      </div>
                      {log.action && <p className="text-[10px] font-mono text-zinc-500">Action ID: {log.action}</p>}
                      {log.message && <p className="font-semibold mt-1">{log.message}</p>}
                      {log.summary && <p className="font-semibold text-zinc-300 mt-1">{log.summary}</p>}
                    </div>
                  ))
                )}
                <div ref={consoleEndRef} />
              </div>

              {/* Right Column: Payload detail Inspector */}
              <div className="w-full md:w-80 border border-zinc-900 bg-zinc-950/80 rounded-xl p-3 flex flex-col overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Payload Inspector
                </span>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] text-zinc-400 bg-zinc-950/40 border border-zinc-900 p-2.5 rounded-lg">
                  {expandedLog ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-zinc-600 block">// Transaction Phase</span>
                        <span className="text-white font-bold">{expandedLog.step}</span>
                      </div>
                      {expandedLog.action && (
                        <div>
                          <span className="text-zinc-600 block">// Action Identifier</span>
                          <span className="text-accentCyan font-bold">{expandedLog.action}</span>
                        </div>
                      )}
                      {expandedLog.jobId && (
                        <div>
                          <span className="text-zinc-600 block">// Anakin Task Job ID</span>
                          <span className="text-zinc-300">{expandedLog.jobId}</span>
                        </div>
                      )}
                      {expandedLog.payload && (
                        <div>
                          <span className="text-zinc-600 block">// Request Parameters</span>
                          <pre className="text-zinc-300 mt-1 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(expandedLog.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                      {expandedLog.message && (
                        <div>
                          <span className="text-zinc-600 block">// Console Output</span>
                          <p className="text-zinc-300 mt-1 italic">{expandedLog.message}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-650 italic text-center">
                      Select an execution step on the left to inspect its network payload schema.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
