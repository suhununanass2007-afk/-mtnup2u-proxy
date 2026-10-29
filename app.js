const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: "*" }));
app.use((req,res,next)=>{res.header("Access-Control-Allow-Origin","*");next();});
app.use(express.json());
const API_KEY = process.env.MTNUP2U_API_KEY;
const UPSTREAM = "https://mtnup2u.com";
app.get("/", (req,res)=>res.json({status:"MASHA DATA Proxy Running",proxy:UPSTREAM,hasKey:!!API_KEY,cors:"enabled"}));
app.get("/api/v1/products", async (req,res)=>{
  try{
    const r = await fetch(`${UPSTREAM}/api/v1/products`,{headers:{"x-api-key":API_KEY,"Authorization":`Bearer ${API_KEY}`}});
    const t = await r.text();
    res.header("Access-Control-Allow-Origin","*");
    res.status(r.status).set('Content-Type','application/json').send(t);
  }catch(e){res.header("Access-Control-Allow-Origin","*");res.status(500).json({ok:false,error:e.message})}
});
app.listen(process.env.PORT||10000,()=>console.log("Running"));
