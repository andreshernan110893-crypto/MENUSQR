const {createClient}=window.supabase;
const sb=createClient("https://cnynfycmvmcjzaevhvmw.supabase.co","sb_publishable_9Du-_m5etaGt-vCBkDvROw_-0sdB_jT");
const $=s=>document.querySelector(s),safe=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const money=n=>"L "+Number(n||0).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2});
const qs=new URLSearchParams(location.search),station=(qs.get("station")||"LB").toUpperCase()==="BS"?"BS":"LB";
const label=station==="LB"?"La Bandeja":"Beer Station";
const state={products:[],categories:[],places:[],groups:[],options:[],links:[],orders:[],cart:[],cat:null,current:null,realtime:false,origin:"ALL",billing:null};
const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2000)};
$("#posTitle").textContent=label;$("#stationPill").textContent=station;$("#ordersTitle").textContent="Pedidos "+label;document.title="Receptor · "+label;document.body.dataset.station=station;

async function boot(){await load();renderAll();startRealtime()}
async function load(){
 const [p,c,pl,g,o,l,ord]=await Promise.all([
  sb.from("products").select("*").eq("active",true).order("sort_order"),
  sb.from("categories").select("*").eq("active",true).order("sort_order"),
  sb.from("places").select("*").eq("active",true).order("sort_order"),
  sb.from("option_groups").select("*").eq("active",true),
  sb.from("options").select("*").eq("active",true).order("sort_order"),
  sb.from("product_option_groups").select("*"),
  sb.rpc("get_pos_orders_public",{p_station:station})
 ]);
 const all=p.data||[];state.products=all.filter(x=>x.brand_id===station);
 const catIds=new Set(state.products.map(x=>x.category_id));state.categories=(c.data||[]).filter(x=>catIds.has(x.id));
 state.places=pl.data||[];state.groups=g.data||[];state.options=o.data||[];state.links=l.data||[];state.orders=Array.isArray(ord.data)?ord.data:[];
 if(!state.categories.some(c=>c.id===state.cat))state.cat=state.categories[0]?.id||null;
}
function renderAll(){
 $("#placeSelect").innerHTML=state.places.map(p=>'<option value="'+p.code+'">'+p.name+'</option>').join("");
 $("#ticketPlace").textContent=state.places[0]?.name||"Nuevo pedido";
 renderCats();renderProducts();renderTicket();renderOrdersBoard();
}
function originLabel(o){if(o.place_type==="TABLE")return "MESA";if(o.place_type==="COURT")return "CANCHA";if(o.place_type==="DELIVERY")return "DELIVERY";if(o.order_source==="POS")return "POS";return o.order_source||"QR"}
function statusText(s){return {RECEIVED:"Recibido",PREPARING:"Preparando",READY:"Listo",DELIVERED:"Entregado",CANCELLED:"Cancelado"}[s]||s}
function renderOrdersBoard(){
 const filtered=state.origin==="ALL"?state.orders:state.orders.filter(o=>originLabel(o)===state.origin);
 const groups={RECEIVED:[],PREPARING:[],READY:[],DELIVERED:[]};filtered.forEach(o=>{if(groups[o.status])groups[o.status].push(o)});
 ["RECEIVED","PREPARING","READY","DELIVERED"].forEach(s=>{
  const key=s[0]+s.slice(1).toLowerCase(),el=$("#orders"+key);
  el.innerHTML=groups[s].map(orderCard).join("")||'<div class="empty-col">Sin pedidos</div>';
  $("#badge"+key).textContent=groups[s].length;
 });
 $("#countReceived").textContent=groups.RECEIVED.length;$("#countPreparing").textContent=groups.PREPARING.length;$("#countReady").textContent=groups.READY.length;
 bindOrderActions();
}
function orderCard(o){
 const origin=originLabel(o),place=o.place_name||o.place_code||"",items=(o.items||[]).map(i=>'<li><b>'+i.qty+'×</b> '+safe(i.product_name)+(i.note?'<small>'+safe(i.note)+'</small>':'')+'</li>').join("");
 const next={RECEIVED:["PREPARING","Preparar"],PREPARING:["READY","Marcar listo"],READY:["DELIVERED","Entregar"]}[o.status];
 return '<article class="order-card '+o.status+'"><div class="order-card-head"><div><span class="origin '+origin+'">'+origin+'</span><b>'+safe(o.customer_name||o.diner_name||"Pedido")+'</b><small>'+safe(place)+' · '+new Date(o.created_at).toLocaleTimeString("es-HN",{hour:"2-digit",minute:"2-digit"})+'</small></div><strong>'+money(o.total)+'</strong></div>'+
 (o.note?'<div class="delivery-note">'+safe(o.note)+'</div>':'')+
 '<ul>'+items+'</ul><div class="pay-row"><span>'+safe(o.payment_method||"PAGO PENDIENTE")+'</span><em>'+safe(o.payment_status||"PENDING")+'</em></div>'+
 '<div class="card-actions">'+(next?'<button class="primary-action" data-status="'+next[0]+'" data-order="'+o.id+'">'+next[1]+'</button>':'')+
 '<button data-bill="'+o.id+'">Cobrar / facturar</button><button class="more-action" data-cancel="'+o.id+'">Cancelar</button></div></article>';
}
function bindOrderActions(){
 document.querySelectorAll("[data-status]").forEach(b=>b.onclick=async()=>{b.disabled=true;const {error}=await sb.rpc("pos_update_order_status_public",{p_order:b.dataset.order,p_station:station,p_status:b.dataset.status});if(error)toast(error.message);else{toast("Estado: "+statusText(b.dataset.status));await refreshOrders()}b.disabled=false});
 document.querySelectorAll("[data-cancel]").forEach(b=>b.onclick=async()=>{if(!confirm("¿Cancelar este pedido?"))return;const {error}=await sb.rpc("pos_update_order_status_public",{p_order:b.dataset.cancel,p_station:station,p_status:"CANCELLED"});toast(error?error.message:"Pedido cancelado");await refreshOrders()});
 document.querySelectorAll("[data-bill]").forEach(b=>b.onclick=()=>openBilling(b.dataset.bill));
}
async function refreshOrders(){const {data,error}=await sb.rpc("get_pos_orders_public",{p_station:station});if(error)return toast(error.message);state.orders=Array.isArray(data)?data:[];renderOrdersBoard()}
function openBilling(id){const o=state.orders.find(x=>x.id===id);if(!o)return;state.billing=o;$("#billTitle").textContent=(o.customer_name||o.diner_name||"Pedido")+" · "+money(o.total);$("#billMeta").textContent=originLabel(o)+" · "+(o.place_name||o.place_code||"");$("#billMethod").value=mapPayment(o.payment_method);$("#billStatus").value=o.payment_status==="PAID"?"PAID":o.payment_status==="CREDIT"?"CREDIT":"PENDING";$("#billDialog").showModal()}
function mapPayment(v){const x=(v||"").toUpperCase();if(["EFECTIVO","CASH"].includes(x))return"EFECTIVO";if(["TARJETA","CARD"].includes(x))return"TARJETA";if(["TRANSFERENCIA","TRANSFER"].includes(x))return"TRANSFERENCIA";if(x==="CREDIT")return"CREDIT";return"EFECTIVO"}
$("#billConfirm").onclick=async()=>{if(!state.billing)return;const {error}=await sb.rpc("pos_finalize_order_public",{p_order:state.billing.id,p_station:station,p_payment_method:$("#billMethod").value,p_payment_status:$("#billStatus").value});if(error)return toast(error.message);const o=state.billing;$("#billDialog").close();await refreshOrders();printReceipt(o,$("#billMethod").value,$("#billStatus").value);toast("Cobro actualizado")}
function printReceipt(o,method,status){const items=(o.items||[]).map(i=>'<tr><td>'+i.qty+' × '+safe(i.product_name)+'</td><td>'+money(i.line_total)+'</td></tr>').join("");const w=window.open("","_blank","width=440,height=720");if(!w)return;w.document.write('<!doctype html><title>Comprobante</title><style>body{font-family:Arial;padding:28px;color:#111}h1{font-size:20px}small{color:#666}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:8px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}.total{font-size:22px;font-weight:bold;text-align:right}</style><h1>'+label+'</h1><small>Comprobante de pedido · '+new Date(o.created_at).toLocaleString("es-HN")+'</small><p><b>'+(o.customer_name||o.diner_name||"Pedido")+'</b><br>'+(o.place_name||o.place_code||"")+'</p><table>'+items+'</table><div class="total">'+money(o.total)+'</div><p>Pago: '+method+' · '+status+'</p><script>window.onload=()=>window.print()<\/script>');w.document.close()}

$("#originFilters").querySelectorAll("[data-origin]").forEach(b=>b.onclick=()=>{state.origin=b.dataset.origin;$("#originFilters").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderOrdersBoard()});
$("#refresh").onclick=refreshOrders;
$("#toggleManual").onclick=()=>$("#manualSale").classList.remove("hidden");$("#closeManual").onclick=()=>$("#manualSale").classList.add("hidden");

function renderCats(){$("#cats").innerHTML=state.categories.map(c=>'<button class="'+(c.id===state.cat?"active":"")+'" data-cat="'+c.id+'">'+c.name+'</button>').join("");$("#cats").querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{state.cat=b.dataset.cat;renderCats();renderProducts()})}
function renderProducts(){const q=$("#search").value.toLowerCase().trim(),list=q?state.products.filter(p=>(p.name+" "+(p.description||"")).toLowerCase().includes(q)):state.products.filter(p=>p.category_id===state.cat);$("#productGrid").innerHTML=list.map(p=>'<article class="p"><img loading="lazy" src="'+(p.image_url||"")+'"><div><h3>'+safe(p.name)+'</h3><footer><b>'+money(p.price)+'</b><button data-p="'+p.id+'">+</button></footer></div></article>').join("");$("#productGrid").querySelectorAll("[data-p]").forEach(x=>x.onclick=e=>{e.stopPropagation();openProduct(x.dataset.p)})}
function openProduct(id){state.current=state.products.find(p=>p.id===id);const linked=state.links.filter(l=>l.product_id===id).map(l=>state.groups.find(g=>g.id===l.group_id)).filter(Boolean);if(!linked.length){state.cart.push({product_id:id,qty:1,option_ids:[]});renderTicket();return}$("#optName").textContent=state.current.name;$("#optGroups").innerHTML=linked.map(g=>'<section class="og" data-g="'+g.id+'"><b>'+g.name+'</b>'+state.options.filter(o=>o.group_id===g.id).map(o=>'<label><span><input type="'+(g.selection_type==="multiple"?"checkbox":"radio")+'" name="g_'+g.id+'" value="'+o.id+'"> '+o.name+'</span><span>'+(o.price_delta?money(o.price_delta):"")+'</span></label>').join("")+'</section>').join("");$("#optionDialog").showModal()}
const selected=()=>[...$("#optGroups").querySelectorAll("input:checked")].map(i=>i.value);
$("#optAdd").onclick=()=>{state.cart.push({product_id:state.current.id,qty:1,option_ids:selected()});$("#optionDialog").close();renderTicket()};
function unit(i){const p=state.products.find(x=>x.id===i.product_id);return Number(p?.price||0)+(i.option_ids||[]).reduce((a,id)=>a+Number(state.options.find(o=>o.id===id)?.price_delta||0),0)}
function renderTicket(){const el=$("#ticketItems");el.innerHTML=state.cart.map((i,n)=>{const p=state.products.find(x=>x.id===i.product_id),opts=(i.option_ids||[]).map(id=>state.options.find(o=>o.id===id)?.name).filter(Boolean).join(", ");return '<div class="line"><div><b>'+(p?.name||"")+'</b><small>'+opts+'</small><small>'+money(unit(i))+'</small></div><div class="qty"><button data-less="'+n+'">−</button><strong>'+i.qty+'</strong><button data-more="'+n+'">+</button></div></div>'}).join("");$("#ticketTotal").textContent=money(state.cart.reduce((a,i)=>a+unit(i)*i.qty,0));el.querySelectorAll("[data-more]").forEach(b=>b.onclick=()=>{state.cart[+b.dataset.more].qty++;renderTicket()});el.querySelectorAll("[data-less]").forEach(b=>b.onclick=()=>{const n=+b.dataset.less;if(--state.cart[n].qty<=0)state.cart.splice(n,1);renderTicket()})}
$("#placeSelect").onchange=()=>$("#ticketPlace").textContent=$("#placeSelect").selectedOptions[0]?.textContent||"Pedido";$("#search").oninput=renderProducts;
$("#sendSale").onclick=async()=>{if(!state.cart.length)return toast("Agrega productos");const payload={station,customer_name:$("#customerName").value.trim(),payment_method:$("#paymentMethod").value,payment_status:$("#paymentStatus").value,items:state.cart};const {error}=await sb.rpc("pos_place_order",{p_place:$("#placeSelect").value,p_payload:payload});if(error)return toast(error.message);state.cart=[];$("#customerName").value="";renderTicket();await refreshOrders();toast("Venta directa registrada")};

function startRealtime(){if(state.realtime)return;state.realtime=true;setInterval(async()=>{const old=state.orders[0]?.id;const {data,error}=await sb.rpc("get_pos_orders_public",{p_station:station});if(error)return;state.orders=Array.isArray(data)?data:[];renderOrdersBoard();if(old&&state.orders[0]?.id&&state.orders[0].id!==old){toast("🔔 Nuevo pedido recibido");try{new Audio("data:audio/wav;base64,UklGRl9vT19telephonering").play()}catch{}}},3500)}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
boot();
