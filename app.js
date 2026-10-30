const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const KEY = process.env.MTNU || process.env.MTNUP2U_API_KEY || "";
const PKEY = process.env.PAYS || process.env.PAYSTACK_SECRET_KEY || "";

app.get('/', (req,res)=>{res.send('MASHA PROXY LIVE key='+!!KEY);});

app.get('/api/v1/products', (req,res)=>{
  res.json({
    data:{
      mtn:[
        {id:"mtn-1",label:"MTN 1GB",price:5.5,capacity_gb:1},
        {id:"mtn-2",label:"MTN 2GB",price:10.5,capacity_gb:2},
        {id:"mtn-3",label:"MTN 3GB",price:16,capacity_gb:3},
        {id:"mtn-4",label:"MTN 4GB",price:21,capacity_gb:4},
        {id:"mtn-5",label:"MTN 5GB",price:26,capacity_gb:5},
        {id:"mtn-10",label:"MTN 10GB",price:48,capacity_gb:10},
        {id:"mtn-20",label:"MTN 20GB",price:88,capacity_gb:20}
      ],
      airteltigo:[
        {id:"at-1",label:"AT 1GB",price:5,capacity_gb:1}
      ],
      telecel:[
        {id:"telecel-5",label:"Telecel 5GB",price:25,capacity_gb:5}
      ]
    }
  });
});

app.get('/api/v1/status', (req,res)=>{
  res.json({ok:true, hasKey:!!KEY, hasPaystack:!!PKEY, time:new Date().toISOString()});
});

app.post('/api/v1/order', async (req,res)=>{
  try{
    const phone = req.body.phone || req.body.phone_number || req.body.recipient;
    const bundle = req.body.bundle_id || req.body.id;
    const cap = req.body.capacity_gb || 1;
    const ref = req.body.reference || "MASHA_"+Date.now();
    
    console.log("ORDER:", phone, bundle, cap, ref);
    
    if(!KEY) return res.status(500).json({error:"MTNUP2U KEY missing"});
    if(!phone) return res.status(400).json({error:"phone missing"});

    // Try mtnup2u endpoint
    const url = "https://mtnup2u.com/api/data";
    const payload = { phone_number: phone, network: "mtn", volume: cap, reference: ref };
    
    console.log("TRY:", url, payload);
    const r = await fetch(url, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer "+KEY,
        "x-api-key":KEY
      },
      body:JSON.stringify(payload)
    });
    
    const txt = await r.text();
    console.log("RESP:", r.status, txt);
    
    if(!r.ok){
      return res.status(502).json({error:"mtnup2u failed", status:r.status, response:txt});
    }
    
    res.json({success:true, response:txt, reference:ref});
    
  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message});
  }
});

app.post('/api/v1/refund', async (req,res)=>{
  try{
    const ref = req.body.reference;
    if(!PKEY) return res.status(500).json({error:"PAYSTACK key missing"});
    const r = await fetch("https://api.paystack.co/refund", {
      method:"POST",
      headers:{Authorization:"Bearer "+PKEY, "Content-Type":"application/json"},
      body:JSON.stringify({transaction:ref})
    });
    const txt = await r.text();
    console.log("REFUND", ref, r.status, txt);
    if(!r.ok) return res.status(502).json({error:"Refund failed", resp:txt});
    res.json({success:true, refund:txt});
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/v1/order/status', (req,res)=>{
  res.json({status:"Check Activity in MTNUP2U app", ref:req.query.reference});
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>{console.log("PROXY LIVE on "+PORT+" key="+!!KEY+" paystack="+!!PKEY);});
