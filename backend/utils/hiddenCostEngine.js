/**
 * Hidden Cost Engine for TravelGPT
 * Calculates hidden/extra costs dynamically based on destination, days, and budget.
 */

const INTERNATIONAL_DESTINATIONS = [
  "dubai", "paris", "rome", "tokyo", "bali", "new york", "london", "bangkok", 
  "singapore", "maldives", "phuket", "switzerland", "amsterdam", "iceland"
];

function calculateHiddenCosts(destination, days, budgetInput) {
  const dest = destination.toLowerCase().trim();
  const budget = parseFloat(budgetInput) || 0;
  const isInternational = INTERNATIONAL_DESTINATIONS.some(d => dest.includes(d));
  
  const items = [];
  let totalHidden = 0;

  // 1. Visa Fees
  if (isInternational) {
    let visaFee = 3500; // Default international visa/eVisa
    let visaName = "eVisa / Entry Permit";

    if (dest.includes("dubai")) {
      visaFee = 6500;
      visaName = "UAE Tourist Visa";
    } else if (dest.includes("paris") || dest.includes("rome") || dest.includes("switzerland") || dest.includes("amsterdam")) {
      visaFee = 8500;
      visaName = "Schengen Tourist Visa";
    } else if (dest.includes("new york")) {
      visaFee = 15000;
      visaName = "US B1/B2 Visa Fee";
    } else if (dest.includes("london")) {
      visaFee = 12000;
      visaName = "UK Standard Visitor Visa";
    } else if (dest.includes("bali")) {
      visaFee = 2700; // VoA (35 USD)
      visaName = "Indonesia Visa on Arrival";
    } else if (dest.includes("bangkok") || dest.includes("phuket")) {
      visaFee = 0; // Visa exemption or cheap eVisa
      visaName = "Thailand Visa Exemption Fee";
    } else if (dest.includes("singapore")) {
      visaFee = 2500;
      visaName = "Singapore Tourist Visa";
    }

    if (visaFee > 0) {
      items.push({ name: visaName, price: visaFee, category: "Documentation" });
      totalHidden += visaFee;
    }
  } else {
    // Domestic specific permits
    if (dest.includes("manali") || dest.includes("rohtang")) {
      items.push({ name: "Rohtang Pass Green Permit & Tolls", price: 550, category: "Documentation" });
      totalHidden += 550;
    } else if (dest.includes("sikkim") || dest.includes("leh") || dest.includes("ladakh")) {
      items.push({ name: "Inner Line Permit (ILP) & Environmental Fee", price: 800, category: "Documentation" });
      totalHidden += 800;
    }
  }

  // 2. Travel Insurance
  if (isInternational) {
    const insurancePrice = 1200 + (days > 7 ? (days - 7) * 100 : 0);
    items.push({ name: "Mandatory Travel Insurance (Medical + Delay Cover)", price: insurancePrice, category: "Documentation" });
    totalHidden += insurancePrice;
  }

  // 3. Local SIM Card / Connectivity
  const simPrice = isInternational ? 1500 : 0;
  if (simPrice > 0) {
    items.push({ name: "Local SIM Card & Unlimited Data Plan", price: simPrice, category: "Connectivity" });
    totalHidden += simPrice;
  }

  // 4. Airport Transfers (Round Trip)
  let transferPrice = 1000; // Domestic average cab/auto
  let transferName = "Airport / Railway Station Transfers (Round Trip)";

  if (isInternational) {
    transferPrice = 3000;
    if (dest.includes("tokyo")) {
      transferPrice = 4500; // Narita Express or Limousine Bus round trip
      transferName = "Narita Express (N'EX) Airport Transfer (Round Trip)";
    } else if (dest.includes("paris")) {
      transferPrice = 2400; // RER B Train round trip
      transferName = "RER B Airport Train Transfers (Round Trip)";
    } else if (dest.includes("london")) {
      transferPrice = 3500;
      transferName = "Heathrow Express / Underground Transfer (Round Trip)";
    }
  }
  items.push({ name: transferName, price: transferPrice, category: "Transport" });
  totalHidden += transferPrice;

  // 5. Daily Local Commute (metro, local buses, auto, Grab/Uber)
  const dailyTransitCost = isInternational ? 800 : 350;
  const transitTotal = dailyTransitCost * days;
  items.push({ 
    name: `Local Commutes (${days} Days at ₹${dailyTransitCost}/day for Metro/Cabs)`, 
    price: transitTotal, 
    category: "Transport" 
  });
  totalHidden += transitTotal;

  // 6. City / Tourist Lodging Taxes
  if (isInternational) {
    let touristTaxPerNight = 350; // Average
    if (dest.includes("paris") || dest.includes("rome") || dest.includes("amsterdam")) {
      touristTaxPerNight = 600; // European tourist tax
    }
    const totalTouristTax = touristTaxPerNight * days;
    items.push({ name: `Mandatory Hotel Tourist Tax (${days} Nights)`, price: totalTouristTax, category: "Lodging" });
    totalHidden += totalTouristTax;
  }

  // 7. Emergency Buffer / Contingency Cash (Recommended 8-10% of total budget)
  const bufferCash = Math.round(budget * 0.08);
  if (bufferCash > 0) {
    items.push({ name: "Emergency Contingency Buffer (Cash reserves)", price: bufferCash, category: "Emergency" });
    totalHidden += bufferCash;
  }

  return {
    isInternational,
    items,
    totalHidden
  };
}

module.exports = {
  calculateHiddenCosts
};
