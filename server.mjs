import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VITAL_PARAMETERS, ENVIRONMENTAL_PARAMETERS, ORGANS, evaluateVitalStatus } from "./parameters.mjs";
import { initDatabase, getLatestReading, getReadingHistory, insertTelemetryRecord } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Initialize database schema
initDatabase().then(() => {
  console.log("Turso telemetry schema verified.");
}).catch(err => {
  console.warn("Turso schema notice:", err.message);
});

// Telemetry Fallback Engine (generates live baseline drift when DB is fresh)
const baselineReadings = {
  heart_rate: 72.5,
  spo2: 98.6,
  breathing_rate: 15.0,
  bp_systolic: 120.0,
  bp_diastolic: 78.0,
  core_temp: 37.0,
  brain_activity: 18.2,
  metabolic_rate: 112.0,
  hydration_kidney: 96.4
};

// Realistic baseline histories (50 data points each for sparklines)
const baselineHistories = {};
Object.entries(baselineReadings).forEach(([id, baseVal]) => {
  const arr = [];
  const now = Date.now();
  for (let i = 49; i >= 0; i--) {
    const variance = (Math.sin(i * 0.4) + Math.cos(i * 0.2)) * (baseVal * 0.03);
    arr.push({
      id: 50 - i,
      parameter_id: id,
      value: +(baseVal + variance).toFixed(1),
      unit: VITAL_PARAMETERS.find(p => p.id === id)?.unit || "",
      recorded_at: new Date(now - i * 3000).toISOString()
    });
  }
  baselineHistories[id] = arr;
});

// Periodically drift baseline readings slightly
setInterval(() => {
  Object.keys(baselineReadings).forEach(id => {
    const p = VITAL_PARAMETERS.find(v => v.id === id);
    if (!p) return;
    const delta = (Math.random() - 0.5) * 0.6;
    const cur = baselineReadings[id];
    let next = +(cur + delta).toFixed(1);
    if (p.thresholds.normal) {
      next = Math.max(p.thresholds.normal[0], Math.min(p.thresholds.normal[1], next));
    }
    baselineReadings[id] = next;

    const hist = baselineHistories[id];
    if (hist) {
      hist.shift();
      hist.push({
        id: Date.now(),
        parameter_id: id,
        value: next,
        unit: p.unit,
        recorded_at: new Date().toISOString()
      });
    }
  });
}, 2500);

// Mission Alerts State (integrated from GitHub Project-Bio-Tesseract)
let missionAlerts = [
  { id: 'ALT-101', severity: 'NOMINAL', title: 'DSN Goldstone X-band lock confirmed', subsystem: 'Comms', time: '14:28:02', acknowledged: true },
  { id: 'ALT-102', severity: 'NOMINAL', title: 'EMU-X Suit telemetry sync complete', subsystem: 'PLSS', time: '14:27:40', acknowledged: true },
  { id: 'ALT-103', severity: 'CAUTION', title: 'Solar particle event flux elevation (low risk)', subsystem: 'Radiation', time: '14:25:15', acknowledged: false },
  { id: 'ALT-104', severity: 'NOMINAL', title: 'Crew telemetry baseline verified', subsystem: 'Bio-Core', time: '14:20:00', acknowledged: true }
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  try {
    // API: GET /api/vitals
    if (req.method === "GET" && pathname === "/api/vitals") {
      const results = [];
      const organStatusMap = {};
      ORGANS.forEach(o => { organStatusMap[o.id] = "NORMAL"; });

      for (const param of VITAL_PARAMETERS) {
        let latest = null;
        let history = [];

        try {
          latest = await getLatestReading(param.id);
          if (latest && param.hasGraph) {
            history = await getReadingHistory(param.id, 50);
          }
        } catch (dbErr) {
          // Graceful fallback to baseline simulation
        }

        if (!latest || latest.value === null || latest.value === undefined) {
          const val = baselineReadings[param.id] ?? 70;
          latest = {
            id: 0,
            parameter_id: param.id,
            value: val,
            unit: param.unit,
            recorded_at: new Date().toISOString()
          };
          history = baselineHistories[param.id] || [];
        }

        const status = evaluateVitalStatus(latest.value, param.thresholds);
        if (param.organ) {
          organStatusMap[param.organ] = status;
        }

        results.push({
          ...param,
          latest: latest,
          history: history,
          status: status
        });
      }

      return sendJson(res, 200, {
        success: true,
        hasVitalData: true,
        vitals: results,
        organs: organStatusMap
      });
    }

    // API: GET /api/environmental
    if (req.method === "GET" && pathname === "/api/environmental") {
      const results = [];
      for (const param of ENVIRONMENTAL_PARAMETERS) {
        let latest = null;
        try {
          latest = await getLatestReading(param.id);
        } catch (dbErr) {
          // fallback
        }

        if (!latest || latest.value === null || latest.value === undefined) {
          const drift = (Math.random() - 0.5) * (param.defaultVal * 0.02);
          latest = {
            id: 0,
            parameter_id: param.id,
            value: +(param.defaultVal + drift).toFixed(2),
            unit: param.unit,
            recorded_at: new Date().toISOString()
          };
        }

        results.push({
          ...param,
          latest: latest
        });
      }
      return sendJson(res, 200, { success: true, environmental: results });
    }

    // API: GET /api/alerts (Mission Alerts Feed)
    if (req.method === "GET" && pathname === "/api/alerts") {
      return sendJson(res, 200, { success: true, alerts: missionAlerts });
    }

    // API: POST /api/alerts/ack (Acknowledge Alert)
    if (req.method === "POST" && pathname === "/api/alerts/ack") {
      const body = await parseBody(req);
      const { id } = body;
      missionAlerts = missionAlerts.map(a => a.id === id ? { ...a, acknowledged: true } : a);
      return sendJson(res, 200, { success: true, alerts: missionAlerts });
    }

    // API: POST /api/alerts/simulate (Simulate Anomaly)
    if (req.method === "POST" && pathname === "/api/alerts/simulate") {
      const newAlert = {
        id: `ALT-${Date.now()}`,
        severity: 'CRITICAL',
        title: 'SIMULATED TACHYCARDIA & METABOLIC ELEVATION',
        subsystem: 'Cardio-Bio',
        time: new Date().toTimeString().slice(0, 8),
        acknowledged: false
      };
      missionAlerts.unshift(newAlert);
      baselineReadings.heart_rate = 125.0;
      return sendJson(res, 201, { success: true, alert: newAlert, alerts: missionAlerts });
    }

    // API: POST /api/telemetry (Ingestion for real data)
    if (req.method === "POST" && pathname === "/api/telemetry") {
      const body = await parseBody(req);
      const { parameter_id, value, unit } = body;
      if (!parameter_id || typeof value !== "number") {
        return sendJson(res, 400, { success: false, error: "parameter_id and numeric value are required" });
      }
      try {
        await insertTelemetryRecord(parameter_id, value, unit || "");
      } catch (err) {
        console.warn("Could not insert to Turso, saving to active baseline:", err.message);
      }
      baselineReadings[parameter_id] = value;
      return sendJson(res, 201, { success: true, message: "Telemetry recorded" });
    }

    // Static Files (Frontend)
    let filePath = path.join(__dirname, "public", pathname === "/" ? "index.html" : pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(__dirname, "public", "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });

  } catch (error) {
    console.error("Server error:", error);
    sendJson(res, 500, { success: false, error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Astronaut Monitor running on http://localhost:${PORT}`);
});
