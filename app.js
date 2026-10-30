const express=require('express');const cors=require('cors');const app=express();
app.use(cors());app.use(express.json());
const KEY=process.env.MTNU||process.env.MTNUP2U_API_KEY||process.env.MTNU_||process.env.MTNUP2U;
const PKEY=process.env.PAYS||process.env.PAYSTACK_SECRET_KEY||process.env.PAYSTACK;

app.get('/api/v1/products',(req,res)=>{res.json({data:{mtn:[{id:"mtn-1",label:"MTN 1GB",price:5.5,capacity_gb:1},{id:"mtn-2",label:"MTN 2GB",price:10.5,capacity_gb:2},{id:"mtn-3",label:"MTN 3GB",price:16,capacity_gb:3},{id:"mtn-4",label:"MTN 4GB",price:21,capacity_gb:4},{id:"mtn-5",label:"MTN 5GB",price:26,capacity_gb:5},{id:"mtn-10",label:"MTN 10GB",price:48,capacity_gb:10},{id:"mtn-20",label:"MTN 20GB",price:88,capacity_gb:20}],airteltigo:[{id:"at-1",label:"AT 1GB",price:5,capacity_gb:1}],telecel:[{id:"telecel-5",label:"Telecel 5GB",price:25,capacity_gb:5}]}})});

app.get('/api/v1/status',(req,res)=>{res.json({ok:true,hasKey:!!KEY,hasPaystack:!!PKEY,time:new Date().toISOString()})});

app.post('/api/v1/order',async(req,res)=>{
 try{
  const phone=req.body.phone||req.body.phone_number||req.body.recipient;
  const bundle=req.body.bundle_id||req.body.id;
  const cap=req.body.capacity_gb||1;
  const ref=req.body.reference||req.body.paystack_ref;
  console.log("ORDER REQ:",{phone,bundle,cap,ref,body:req.body});
  if(!KEY) return res.status(500).json({error:"MTNUP2U KEY missing in Render"});
  if(!phone) return res.status(400).json({error:"phone missing"});

  // Try 3 possible mtnup2u endpoints (different versions use different URLs)
  const payloads=[
   {phone_number:phone,network:"mtn",volume:cap,bundle_id:bundle,reference:ref},
   {phone:phone,network:"mtn",data_volume:cap,volume:cap,reference:ref},
   {recipient:phone,network_id:1,size:cap}
  ];
  const urls=[
   "https://mtnup2u.com/api/data",
   "https://mtnup2u.com/api/v1/data/order",
   "https://mtnup2u.com/api/v1/order"
  ];
  
  let lastErr="";
  for(let url of urls){
    for(let payload of payloads){
      try{
        console.log(`TRY ${url} PAYLOAD:`,JSON.stringify(payload));
        let r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+KEY,"x-api-key":KEY,"api-key":KEY},body:JSON.stringify(payload)});
        let txt=await r.text();
        console.log(`RESP ${url} ${r.status}: ${txt.slice(0,500)}`);
        if(r.ok){ return res.json({success:true,mtnup2u_url:url,mtnup2u_response:txt,reference:ref}); }
        lastErr=`${url} ${r.status}: ${txt.slice(0,200)}`;
      }catch(e){ lastErr=e.message; console.log("FETCH ERR",e.message); }
    }
  }
  return res.status(502).json({error:"All mtnup2u endpoints failed",lastError:lastErr,note:"Check MTNUP2U API docs - key may need to be in different header or endpoint changed. See Render logs."});
 }catch(e){ console.error(e); res.status(500).json({error:e.message});}
});

app.post('/api/v1/refund',async(req,res)=>{
 try{
  const ref=req.body.reference||req.body.paystack_ref;
  if(!PKEY) return res.status(500).json({error:"PAYSTACK_SECRET_KEY missing"});
  let r=await fetch("https://api.paystack.co/refund",{method:"POST",headers:{Authorization:"Bearer "+PKEY,"Content-Type":"application/json"},body:JSON.stringify({transaction:ref})});
  let txt=await r.text(); console.log(`REFUND ${ref} ${r.status}: ${txt}`);
  if(!r.ok) return res.status(502).json({error:"Paystack refund failed",resp:txt});
  res.json({success:true,refund:txt});
 }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/v1/order/status',(req,res)=>{res.json({status:"Check MTNUP2U app Activity. For refund POST /api/v1/refund",ref:req.query.reference});});

app.listen(process.env.PORT||10000,()=>console.log("LIVE key="+!!KEY+" paystack="+!!PKEY));const express=require('express');const cors=require('cors');const app=express();
app.use(cors());app.use(express.json());
const KEY=process.env.MTNU||process.env.MTNUP2U_API_KEY||process.env.MTNU_||process.env.MTNUP2U;
const PKEY=process.env.PAYS||process.env.PAYSTACK_SECRET_KEY||process.env.PAYSTACK;

app.get('/api/v1/products',(req,res)=>{res.json({data:{mtn:[{id:"mtn-1",label:"MTN 1GB",price:5.5,capacity_gb:1},{id:"mtn-2",label:"MTN 2GB",price:10.5,capacity_gb:2},{id:"mtn-3",label:"MTN 3GB",price:16,capacity_gb:3},{id:"mtn-4",label:"MTN 4GB",price:21,capacity_gb:4},{id:"mtn-5",label:"MTN 5GB",price:26,capacity_gb:5},{id:"mtn-10",label:"MTN 10GB",price:48,capacity_gb:10},{id:"mtn-20",label:"MTN 20GB",price:88,capacity_gb:20}],airteltigo:[{id:"at-1",label:"AT 1GB",price:5,capacity_gb:1}],telecel:[{id:"telecel-5",label:"Telecel 5GB",price:25,capacity_gb:5}]}})});

app.get('/api/v1/status',(req,res)=>{res.json({ok:true,hasKey:!!KEY,hasPaystack:!!PKEY,time:new Date().toISOString()})});

app.post('/api/v1/order',async(req,res)=>{
 try{
  const phone=req.body.phone||req.body.phone_number||req.body.recipient;
  const bundle=req.body.bundle_id||req.body.id;
  const cap=req.body.capacity_gb||1;
  const ref=req.body.reference||req.body.paystack_ref;
  console.log("ORDER REQ:",{phone,bundle,cap,ref,body:req.body});
  if(!KEY) return res.status(500).json({error:"MTNUP2U KEY missing in Render"});
  if(!phone) return res.status(400).json({error:"phone missing"});

  // Try 3 possible mtnup2u endpoints (different versions use different URLs)
  const payloads=[
   {phone_number:phone,network:"mtn",volume:cap,bundle_id:bundle,reference:ref},
   {phone:phone,network:"mtn",data_volume:cap,volume:cap,reference:ref},
   {recipient:phone,network_id:1,size:cap}
  ];
  const urls=[
   "https://mtnup2u.com/api/data",
   "https://mtnup2u.com/api/v1/data/order",
   "https://mtnup2u.com/api/v1/order"
  ];
  
  let lastErr="";
  for(let url of urls){
    for(let payload of payloads){
      try{
        console.log(`TRY ${url} PAYLOAD:`,JSON.stringify(payload));
        let r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+KEY,"x-api-key":KEY,"api-key":KEY},body:JSON.stringify(payload)});
        let txt=await r.text();
        console.log(`RESP ${url} ${r.status}: ${txt.slice(0,500)}`);
        if(r.ok){ return res.json({success:true,mtnup2u_url:url,mtnup2u_response:txt,reference:ref}); }
        lastErr=`${url} ${r.status}: ${txt.slice(0,200)}`;
      }catch(e){ lastErr=e.message; console.log("FETCH ERR",e.message); }
    }
  }
  return res.status(502).json({error:"All mtnup2u endpoints failed",lastError:lastErr,note:"Check MTNUP2U API docs - key may need to be in different header or endpoint changed. See Render logs."});
 }catch(e){ console.error(e); res.status(500).json({error:e.message});}
});

app.post('/api/v1/refund',async(req,res)=>{
 try{
  const ref=req.body.reference||req.body.paystack_ref;
  if(!PKEY) return res.status(500).json({error:"PAYSTACK_SECRET_KEY missing"});
  let r=await fetch("https://api.paystack.co/refund",{method:"POST",headers:{Authorization:"Bearer "+PKEY,"Content-Type":"application/json"},body:JSON.stringify({transaction:ref})});
  let txt=await r.text(); console.log(`REFUND ${ref} ${r.status}: ${txt}`);
  if(!r.ok) return res.status(502).json({error:"Paystack refund failed",resp:txt});
  res.json({success:true,refund:txt});
 }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/v1/order/status',(req,res)=>{res.json({status:"Check MTNUP2U app Activity. For refund POST /api/v1/refund",ref:req.query.reference});});

app.listen(process.env.PORT||10000,()=>console.log("LIVE key="+!!KEY+" paystack="+!!PKEY));
