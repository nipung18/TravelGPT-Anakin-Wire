# TravelGPT ✈️ (Anakin Build-a-thon Edition)

TravelGPT is an AI-powered smart travel planner that builds optimal travel itineraries backed by real-time web listings. Rebuilt specifically for the **Anakin Build-a-thon (May 29-31, 2026)**, the application integrates the **Anakin Wire** action layer, a custom **Hidden Cost Engine**, and the **Groq Llama 3.3** model for high-fidelity reasoning.

---

## 🛠️ Project Architecture

```
                       +-----------------------------+
                       |     Frontend (React SPA)    |
                       +--------------+--------------+
                                      |
                                      v  [POST /generate-trip]
                       +--------------+--------------+
                       |    Express Node.js Server   |
                       +---+----------+----------+---+
                           |          |          |
      [1. Calc Fixed Fees] |          |          | [3. Feed Scraped Listings + Fees]
                           v          |          v
                 +---------+---+      |   +------+------+
                 | Hidden Cost |      |   |   Groq AI   |
                 |    Engine   |      |   | (Llama 3.3) |
                 +-------------+      |   +------+------+
                                      |          |
         [2. Run Web Scrapes]         v          v [4. Reason & Synthesize Itinerary]
                               +------+------+   |
                               | Anakin Wire |<--+
                               |    API      |
                               +-------------+
```

1. **Frontend (React)**: Modern dashboard featuring glassmorphic controls, live timelines, interactive SVG expense charts, dynamic packing lists, and a developer console.
2. **Backend (Express)**: Orchestrates requests and runs logic.
3. **Hidden Cost Engine**: Computes domestic/international documentation (visas, permits), mandatory travel insurance, SIM cards, airport round-trip transfers, daily local transport, and city taxes.
4. **Anakin Search (Wire Service)**: Submits search tasks (Google Search / Google Maps actions) for flight rates and hotels, polling the asynchronous job statuses until complete. Logs are streamed to the frontend terminal.
5. **Groq Reasoning**: Uses the `llama-3.3-70b-versatile` model to analyze the scraped web results, fitting them into the target budget and building the itinerary.

---

## 🌟 Hackathon Highlight: Live Wire Console
To make the submission stand out to judges, a **Live Wire Transaction Console** is embedded directly into the UI. It displays step-by-step API requests, action parameter payloads, and parsed data sizes as they occur on the backend, showcasing the power of Anakin's pre-built action layer!

*Note: If no `ANAKIN_API_KEY` is provided, the application automatically triggers its **High-Fidelity Simulation Mode** to mock the API latency, logs, and outputs so the project remains 100% functional and demo-ready out of the box.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM

### Installation

1. Open your terminal in this directory.
2. Install all dependencies for both root, frontend, and backend folders by running:
   ```bash
   npm run install-all
   ```

### Configuration

1. Locate the `.env` file in the `backend/` directory:
   `travelgpt/backend/.env`
2. Add your API keys (optional but recommended for live data):
   ```env
   PORT=5000
   GROQ_API_KEY=your_groq_api_key_here
   ANAKIN_API_KEY=your_anakin_api_key_here
   ```

### Execution

1. Start both the React frontend (port 3000) and Express backend (port 5000) concurrently with a single command:
   ```bash
   npm run dev
   ```
2. Open your web browser and navigate to `http://localhost:3000`.
