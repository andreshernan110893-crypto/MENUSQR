module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ok:true,configured:Boolean(process.env.GEMINI_API_KEY),model:"gemini-3.5-flash-lite"});
  if (req.method !== "POST") return res.status(405).json({error:"Método no permitido"});
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({error:"Gemini no está configurado"});
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const selected = body.selected && typeof body.selected === "object" ? body.selected : null;
    const cart = Array.isArray(body.cart) ? body.cart.slice(0,20) : [];
    const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0,45) : [];
    const options = Array.isArray(body.options) ? body.options.slice(0,25) : [];
    const prompt = [
      "Eres el asistente del menú de La Bandeja + Beer Station en Honduras.",
      "Solo recomienda productos incluidos en los datos recibidos. No inventes productos, precios, ingredientes, promociones ni extras.",
      "Si hay un producto seleccionado, sugiere máximo 2 complementos útiles y evita repetir lo que ya está en el carrito.",
      "Responde en español, breve y natural.",
      'Devuelve SOLO JSON válido: {"message":"texto breve","recommendations":[{"id":"product_id","reason":"motivo breve"}]}'
    ].join("\n");
    const context = {message:String(body.message||"").slice(0,800),place:body.place||{},selected,options,cart,candidates};
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";
    const upstream = await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"application/json","x-goog-api-key":process.env.GEMINI_API_KEY},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:prompt}]},
        contents:[{role:"user",parts:[{text:JSON.stringify(context)}]}],
        generationConfig:{responseMimeType:"application/json",maxOutputTokens:420}
      })
    });
    const data = await upstream.json();
    if(!upstream.ok){
      console.error("Gemini",upstream.status,data?.error?.message||"error");
      return res.status(502).json({error:"No pude consultar el asistente en este momento."});
    }
    const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";
    let parsed;
    try{parsed=JSON.parse(raw)}catch{parsed={message:raw.slice(0,500),recommendations:[]}}
    const valid=new Set([...(selected?.id?[selected.id]:[]),...cart.map(x=>x.id).filter(Boolean),...candidates.map(x=>x.id).filter(Boolean)]);
    const recommendations=Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter(x=>x&&valid.has(x.id)).slice(0,3).map(x=>({id:x.id,reason:String(x.reason||"").slice(0,140)}))
      : [];
    return res.status(200).json({message:String(parsed.message||"¿Te ayudo a elegir algo más?").slice(0,600),recommendations});
  }catch(error){
    console.error("Assistant error",error);
    return res.status(500).json({error:"Error interno del asistente."});
  }
};
