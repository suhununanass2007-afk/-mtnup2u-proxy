const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const MTN_API = "https://mtnup2u.com";
const API_KEY = process.env.MTNUP2U_API_KEY;

app.get("/", (req, res) => {
  res.json({ status: "MASHA DATA Proxy Running", proxy: MTN_API, hasKey: !!API_KEY });
});

app.all("/api/v1/*", async (req, res) => {
  const path = req.params[0] ? req.params[0] : req.url.replace("/api/v1/", "");
  const targetUrl = `${MTN_API}/api/v1/${req.url.replace("/api/v1/", "")}`;
  
  try {
    const headers = { "Content-Type": "application/json" };
    if (API_KEY) {
      headers["Authorization"] = `Bearer ${API_KEY}`;
    }
    // also allow frontend to send its own if needed
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
    });

    const text = await response.text();
    res.status(response.status).set('Access-Control-Allow-Origin','*').send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Running on " + PORT));
