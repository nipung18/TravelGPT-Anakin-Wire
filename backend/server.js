require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { calculateHiddenCosts } = require("./utils/hiddenCostEngine");
const { searchTravelData } = require("./services/anakinService");
const importedModule = require("./services/anakinService");

console.log("FULL MODULE:", importedModule);
console.log("SEARCH TYPE:", typeof importedModule.searchTravelData);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client if key exists
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  console.log("Groq SDK initialized successfully. 🧠");
} else {
  console.warn("WARNING: GROQ_API_KEY not found in .env. Will run in Local AI synthesis mode. 🤖");
}

app.get("/", (req, res) => {
  res.send("TravelGPT Anakin-Powered Backend Running 🚀");
});

// Main Generate Trip Endpoint
app.post("/generate-trip", async (req, res) => {
  try {
    const {
      fromCity,
      destination,
      budget,
      days,
      style
    } = req.body;

    if (!fromCity || !destination || !budget || !days) {
      return res.status(400).json({
        success: false,
        message: "Source city, destination, budget and days are required",
      });
    }

    const tripDays = parseInt(days) || 3;
    const tripBudget = parseFloat(budget) || 0;
    const travelStyle = (style || "Explorer").toLowerCase();

    // 1. Calculate Hidden Costs via Engine
    const hiddenCostResults = calculateHiddenCosts(destination, tripDays, tripBudget);

    // 2. Fetch Live Web Search Data via Anakin Wire Service
    const anakinResults = await searchTravelData(
      destination,
      fromCity,
      tripBudget,
      tripDays,
      travelStyle,
      process.env.ANAKIN_API_KEY
    );

    // Filter hotels and flights based on travel style
    let hotelChoice = anakinResults.hotels[0]; // Default budget
    let flightChoice = anakinResults.flights[0]; // Default budget

    if (travelStyle === "explorer" && anakinResults.hotels.length > 1) {
      hotelChoice = anakinResults.hotels[1];
      flightChoice = anakinResults.flights[1] || anakinResults.flights[0];
    } else if (travelStyle === "splurge" && anakinResults.hotels.length > 2) {
      hotelChoice = anakinResults.hotels[2];
      flightChoice = anakinResults.flights[2] || anakinResults.flights[0];
    }

    const totalHotelCost = hotelChoice.price * tripDays;
    const flightCost = flightChoice.price;
    const hiddenCostsSum = hiddenCostResults.totalHidden;

    // Remaining budget for food, local activities, etc.
    const usedBudget = flightCost + totalHotelCost + hiddenCostsSum;
    const remainingBudget = Math.max(0, tripBudget - usedBudget);
    
    // Split remaining budget
    const foodAllocation = Math.round(remainingBudget * 0.45);
    const activitiesAllocation = Math.round(remainingBudget * 0.40);
    const miscellaneousAllocation = Math.round(remainingBudget * 0.15);

    // 3. AI Reasoning Step
    let finalTrip = null;

    if (groqClient) {
      // LIVE GROQ MODE - AI REASONING
      try {
        const prompt = `
You are TravelGPT, a smart budget travel planning assistant. 
Create a detailed, realistic travel plan based on the following real-time data fetched from the web.

User Request:
- Starting City: ${fromCity}
- Destination: ${destination}
- Duration: ${tripDays} days
- Total Target Budget: ₹${tripBudget} (INR)
- Style: ${style || "Explorer"}

Scraped Web Data:
- Flights found: ${JSON.stringify(anakinResults.flights)}
- Hotels found: ${JSON.stringify(anakinResults.hotels)}
- Popular local sights: ${JSON.stringify(anakinResults.places)}

Pre-Calculated Hidden Costs & Fees (do not modify values):
- Itemized Hidden Costs: ${JSON.stringify(hiddenCostResults.items)}
- Total Hidden Costs: ₹${hiddenCostsSum}

Recommended Budget Allocations (can be adjusted slightly by you):
- Lodging (Hotel): ${hotelChoice.name} (₹${hotelChoice.price}/night for ${tripDays} nights = ₹${totalHotelCost})
- Transit (Flight/Bus): ${flightChoice.name} (₹${flightCost})
- Food Allowance: ₹${foodAllocation}
- Sightseeing/Activities: ₹${activitiesAllocation}
- Local/Misc: ₹${miscellaneousAllocation}

IMPORTANT INSTRUCTIONS:
- Return ONLY a raw JSON block.
- Do NOT wrap in \`\`\`json markdown blocks.
- Do NOT output any conversational text or prefaces.
- Ensure the JSON is completely valid and parseable.

Structure the JSON exactly like this:
{
  "destination": "${destination}",
  "flight": {
    "name": "${flightChoice.name}",
    "price": "${flightCost}"
  },
  "hotel": {
    "name": "${hotelChoice.name}",
    "price": "${totalHotelCost}",
    "location": "${hotelChoice.location}"
  },
  "totalCost": "${usedBudget + foodAllocation + activitiesAllocation + miscellaneousAllocation}",
  "hiddenCosts": [
    ${hiddenCostResults.items.map(item => `"${item.name}: ₹${item.price}"`).join(",\n    ")}
  ],
  "recommendation": "Provide 3 concise, highly actionable saving tips specific to ${destination} and a ${style || "Explorer"} traveler.",
  "itinerary": [
    "Day 1: [Action-oriented timeline incorporating ${hotelChoice.name} and local sights]",
    "Day 2: [Action-oriented timeline visiting some local sights, mentioning realistic local dishes/cafes]",
    ... (create exactly ${tripDays} day entries)
  ],
  "costBreakdown": {
    "flight": ${flightCost},
    "hotel": ${totalHotelCost},
    "food": ${foodAllocation},
    "localTransit": ${hiddenCostResults.items.find(i => i.name.includes("Commutes"))?.price || 1000},
    "activities": ${activitiesAllocation},
    "hiddenCosts": ${hiddenCostsSum - (hiddenCostResults.items.find(i => i.name.includes("Commutes"))?.price || 1000)},
    "remaining": ${Math.max(0, tripBudget - (usedBudget + foodAllocation + activitiesAllocation + miscellaneousAllocation))}
  }
}
`;

        const completion = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
        });

        let responseText = completion.choices[0].message.content;
        responseText = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        finalTrip = JSON.parse(responseText);
      } catch (groqError) {
        console.error("Groq API Call failed, falling back to Local Synthesis:", groqError);
      }
    }

    // LOCAL AI SYNTHESIS MODE (Fallback if Groq is not configured or fails)
    if (!finalTrip) {
      const placesList = anakinResults.places;
      const itineraryList = [];
      
      // Simple rule-based itinerary generation
      for (let d = 1; d <= tripDays; d++) {
        const place1 = placesList[(d * 2 - 2) % placesList.length];
        const place2 = placesList[(d * 2 - 1) % placesList.length];
        itineraryList.push(
          `Day ${d}: Morning breakfast at a local cafe near ${hotelChoice.name}. Explore ${place1} in the afternoon. Evening stroll around ${place2} and savor local budget-friendly street eats.`
        );
      }

      finalTrip = {
        destination: destination,
        flight: {
          name: flightChoice.name,
          price: String(flightCost)
        },
        hotel: {
          name: hotelChoice.name,
          price: String(totalHotelCost),
          location: hotelChoice.location
        },
        totalCost: String(usedBudget + foodAllocation + activitiesAllocation + miscellaneousAllocation),
        hiddenCosts: hiddenCostResults.items.map(item => `${item.name}: ₹${item.price}`),
        recommendation: `1. Explore on foot or rent a two-wheeler to cut travel costs in ${destination}.\n2. Eat where locals eat; avoid high-end tourist trap restaurants.\n3. Book tickets to activities online in advance to secure discounts.`,
        itinerary: itineraryList,
        costBreakdown: {
          flight: flightCost,
          hotel: totalHotelCost,
          food: foodAllocation,
          localTransit: hiddenCostResults.items.find(i => i.name.includes("Commutes"))?.price || 1000,
          activities: activitiesAllocation,
          hiddenCosts: hiddenCostsSum - (hiddenCostResults.items.find(i => i.name.includes("Commutes"))?.price || 1000),
          remaining: Math.max(0, tripBudget - (usedBudget + foodAllocation + activitiesAllocation + miscellaneousAllocation))
        }
      };
    }

    // Return the response containing the plan and the wire console logs
    res.json({
      success: true,
      trip: finalTrip,
      wireLogs: anakinResults.wireLogs
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server failed to generate trip planner: " + error.message,
    });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT} 🚀`);
});
