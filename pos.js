const {createClient}=window.supabase;
const sb=createClient("https://cnynfycmvmcjzaevhvmw.supabase.co","sb_publishable_9Du-_m5etaGt-vCBkDvROw_-0sdB_jT");
const $=s=>document.querySelector(s);
const money=n=>"L "+Number(n||0).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2});
const qs=new URLSearchParams(location.search);
const station=(qs.get("station")||"LB").toUpperCase()==="BS"?"BS":"LB";
const state={products:[],categories:[],places:[],groups:[],options:[],links:[],orders:[],cart:[],cat:null,current:null,realtime:false};
const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)};
const label=station==="LB"?"La Bandeja":"Beer Station";
$("#posTitle").textContent="POS "+label;
$("#stationPill").textContent=station;
$("#ordersTitle").textContent="Pedidos "+label;
document.title="POS "+label;document.body.dataset.station=station;
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
 const all=p.data||[];
 state.products=all.filter(x=>x.brand_id===station);
 const catIds=new Set(state.products.map(x=>x.category_id));
 state.categories=(c.data||[]).filter(x=>catIds.has(x.id));
 state.places=pl.data||[];state.groups=g.data||[];state.options=o.data||[];state.links=l.data||[];state.orders=ord.data||[];
 if(!state.categories.some(c=>c.id===state.cat))state.cat=state.categories[0]?.id||null;
}
function renderAll(){
 $("#placeSelect").innerHTML=state.places.map(p=>'<option value="'+p.code+'">'+p.name+'</option>').join("");
 $("#ticketPlace").textContent=state.places[0]?.name||"Nuevo pedido";
 renderCats();renderProducts();renderTicket();renderOrders();
}
function renderCats(){
 $("#cats").innerHTML=state.categories.map(c=>'<button class="'+(c.id===state.cat?"active":"")+'" data-cat="'+c.id+'">'+c.name+'</button>').join("");
 $("#cats").querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{state.cat=b.dataset.cat;renderCats();renderProducts()});
}
function renderProducts(){
 const q=$("#search").value.toLowerCase().trim();
 const list=q?state.products.filter(p=>(p.name+" "+(p.description||"")).toLowerCase().includes(q)):state.products.filter(p=>p.category_id===state.cat);
 $("#productGrid").innerHTML=list.map(p=>'<article class="p" data-p="'+p.id+'"><img loading="lazy" decoding="async" width="520" height="520" src="'+(p.image_url||"")+'"><div><h3>'+p.name+'</h3><footer><b>'+money(p.price)+'</b><button data-p="'+p.id+'">+</button></footer></div></article>').join("");
 $("#productGrid").querySelectorAll("[data-p]").forEach(x=>x.onclick=e=>{e.stopPropagation();openProduct(x.dataset.p)});
}
function openProduct(id){
 state.current=state.products.find(p=>p.id===id);
 const linked=state.links.filter(l=>l.product_id===id).map(l=>state.groups.find(g=>g.id===l.group_id)).filter(Boolean);
 if(!linked.length){state.cart.push({product_id:id,qty:1,option_ids:[]});renderTicket();return}
 $("#optName").textContent=state.current.name;
 $("#optGroups").innerHTML=linked.map(g=>'<section class="og" data-g="'+g.id+'"><b>'+g.name+'</b>'+state.options.filter(o=>o.group_id===g.id).map(o=>'<label><span><input type="'+(g.selection_type==="multiple"?"checkbox":"radio")+'" name="g_'+g.id+'" value="'+o.id+'"> '+o.name+'</span><span>'+(o.price_delta?money(o.price_delta):"")+'</span></label>').join("")+'</section>').join("");
 $("#optionDialog").showModal();
}
const selected=()=>[...$("#optGroups").querySelectorAll("input:checked")].map(i=>i.value);
$("#optAdd").onclick=()=>{state.cart.push({product_id:state.current.id,qty:1,option_ids:selected()});$("#optionDialog").close();renderTicket()};
function unit(i){
 const p=state.products.find(x=>x.id===i.product_id);
 return Number(p?.price||0)+(i.option_ids||[]).reduce((a,id)=>a+Number(state.options.find(o=>o.id===id)?.price_delta||0),0);
}
function renderTicket(){
 const el=$("#ticketItems");
 el.innerHTML=state.cart.map((i,n)=>{
  const p=state.products.find(x=>x.id===i.product_id);
  const opts=(i.option_ids||[]).map(id=>state.options.find(o=>o.id===id)?.name).filter(Boolean).join(", ");
  return '<div class="line"><div><b>'+(p?.name||"")+'</b><small>'+opts+'</small><small>'+money(unit(i))+'</small></div><div class="qty"><button data-less="'+n+'">−</button><strong>'+i.qty+'</strong><button data-more="'+n+'">+</button></div></div>';
 }).join("");
 $("#ticketTotal").textContent=money(state.cart.reduce((a,i)=>a+unit(i)*i.qty,0));
 el.querySelectorAll("[data-more]").forEach(b=>b.onclick=()=>{state.cart[+b.dataset.more].qty++;renderTicket()});
 el.querySelectorAll("[data-less]").forEach(b=>b.onclick=()=>{const n=+b.dataset.less;if(--state.cart[n].qty<=0)state.cart.splice(n,1);renderTicket()});
}
function originLabel(o){
 const type=o.place_type||o.order_source||"QR";
 if(type==="TABLE")return "MESA";
 if(type==="COURT")return "CANCHA";
 if(type==="DELIVERY")return "DELIVERY";
 if(o.order_source==="POS")return "POS";
 return type;
}
function renderOrders(){
 $("#orders").innerHTML=state.orders.map(o=>{
  const placeName=o.place_name||o.place_code||"";
  const type=originLabel(o);
  const items=(o.items||[]).map(i=>'<span>'+i.qty+' × '+i.product_name+'</span>').join("");
  return '<div class="order-row station-order"><div><b>'+(o.customer_name||o.diner_name||"Pedido")+'</b><small>'+new Date(o.created_at).toLocaleString("es-HN")+' · '+money(o.total)+'</small><small class="origin '+type+'">'+type+' · '+placeName+'</small>'+(o.note?'<small class="order-note">'+safe(o.note)+'</small>':'')+'<div class="order-items">'+items+'</div></div><span>'+(o.payment_method||o.payment_status||"PENDING")+'</span><select data-order="'+o.id+'"><option '+(o.status==="RECEIVED"?"selected":"")+'>RECEIVED</option><option '+(o.status==="PREPARING"?"selected":"")+'>PREPARING</option><option '+(o.status==="READY"?"selected":"")+'>READY</option><option '+(o.status==="DELIVERED"?"selected":"")+'>DELIVERED</option><option '+(o.status==="CANCELLED"?"selected":"")+'>CANCELLED</option></select></div>';
 }).join("")||'<div class="empty-pos">Sin pedidos todavía.</div>';
 $("#orders").querySelectorAll("[data-order]").forEach(s=>s.onchange=async()=>{const {error}=await sb.rpc("pos_update_order_status_public",{p_order:s.dataset.order,p_station:station,p_status:s.value});toast(error?error.message:"Estado actualizado")});
}
function startRealtime(){
 if(state.realtime)return;state.realtime=true;
 setInterval(async()=>{const oldFirst=state.orders[0]?.id;const {data,error}=await sb.rpc("get_pos_orders_public",{p_station:station});if(error)return;state.orders=Array.isArray(data)?data:[];renderOrders();if(oldFirst&&state.orders[0]?.id&&state.orders[0].id!==oldFirst)toast("Nueva orden recibida")},4000);
}
$("#placeSelect").onchange=()=>$("#ticketPlace").textContent=$("#placeSelect").selectedOptions[0]?.textContent||"Pedido";
$("#search").oninput=renderProducts;
$("#refresh").onclick=async()=>{await load();renderAll()};
$("#sendSale").onclick=async()=>{
 if(!state.cart.length)return toast("Agrega productos");
 const payload={station,customer_name:$("#customerName").value.trim(),payment_method:$("#paymentMethod").value,payment_status:$("#paymentStatus").value,items:state.cart};
 const {error}=await sb.rpc("pos_place_order",{p_place:$("#placeSelect").value,p_payload:payload});
 if(error)return toast(error.message);
 state.cart=[];$("#customerName").value="";await load();renderAll();toast("Pedido enviado");
};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
boot();