const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.MTNUP2U_API_KEY;
const UPSTREAM = "https://mtnup2u.com/api/v1";

// --- CORS FIX - ALLOWS NEOCITIES ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "MASHA DATA Proxy Running", proxy: "https://mtnup2u.com", hasKey: !!API_KEY, cors: "enabled" });
});

app.get('/api/v1/products', async (req, res) => {
  try {
    const r = await fetch(`${UPSTREAM}/products`, {
      headers: { "x-api-key": API_KEY, "Authorization": `Bearer ${API_KEY}` }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.all('/api/v1/*', async (req, res) => {
  try {
    const path = req.originalUrl.replace('/api/v1', '');
    const url = `${UPSTREAM}${path}`;
    const r = await fetch(url, {
      method: req.method,
      headers: { 
        "x-api-key": API_KEY, 
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`Running on ${PORT}`));
