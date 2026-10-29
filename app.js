const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check - so site doesn't show "Cannot GET /"
app.get('/', (req, res) => {
  res.json({ status: 'MASHA DATA Proxy Running 🔥', proxy: 'https://mtnup2u.com' });
});

// Proxy all /api requests
app.use('/api', async (req, res) => {
  try {
    const targetUrl = 'https://mtnup2u.com' + req.originalUrl;
    console.log('Proxying to:', targetUrl);
    
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers['authorization'] || '',
        'X-API-KEY': req.headers['x-api-key'] || ''
      }
    };
    
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(targetUrl, options);
    const text = await response.text();
    
    res.status(response.status).send(text);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Running on', PORT));
