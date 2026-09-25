const {createClient}=window.supabase;
const sb=createClient("https://cnynfycmvmcjzaevhvmw.supabase.co","sb_publishable_9Du-_m5etaGt-vCBkDvROw_-0sdB_jT");
const $=s=>document.querySelector(s),safe=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const money=n=>"L "+Number(n||0).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2});
const qs=new URLSearchParams(location.search),station=(qs.get("station")||"LB").toUpperCase()==="BS"?"BS":"LB",label=station==="LB"?"La Bandeja":"Beer Station";
const state={products:[],categories:[],activeTables:[],groups:[],options:[],links:[],orders:[],cart:[],cat:"ALL",current:null,realtime:false,origin:"ALL",billing:null,report:null,saleType:"CONTADO",billType:"CONTADO"};
const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)};
$("#posTitle").textContent=label;$("#stationPill").textContent=station;$("#ordersTitle").textContent="Pedidos "+label;document.title="Receptor · "+label;document.body.dataset.station=station;

async function boot(){await load();renderAll();setSaleType("CONTADO");setReportPreset("TODAY");startRealtime()}
async function load(){
 const [p,c,t,g,o,l,ord]=await Promise.all([
  sb.from("products").select("*").eq("active",true).order("sort_order"),
  sb.from("categories").select("*").eq("active",true).order("sort_order"),
  sb.rpc("get_active_tables_public"),
  sb.from("option_groups").select("*").eq("active",true),
  sb.from("options").select("*").eq("active",true).order("sort_order"),
  sb.from("product_option_groups").select("*"),
  sb.rpc("get_pos_orders_public",{p_station:station})
 ]);
 const all=p.data||[];state.products=all.filter(x=>x.brand_id===station);
 const catIds=new Set(state.products.map(x=>x.category_id));state.categories=(c.data||[]).filter(x=>catIds.has(x.id));
 state.activeTables=Array.isArray(t.data)?t.data:[];state.groups=g.data||[];state.options=o.data||[];state.links=l.data||[];state.orders=Array.isArray(ord.data)?ord.data:[];
 if(state.cat!=="ALL"&&!state.categories.some(c=>c.id===state.cat))state.cat="ALL";
}
function renderAll(){renderActiveTables();$("#businessCatalogLabel").textContent=label;$("#catalogBusinessTitle").textContent="Todos los productos de "+label;renderCats();renderProducts();renderTicket();renderOrdersBoard();updateDirectContext()}
function renderActiveTables(selected=""){
 const el=$("#placeSelect");el.innerHTML='<option value="">Sin mesa asignada</option>'+state.activeTables.map(t=>'<option value="'+t.place_code+'">'+safe(t.place_name)+' · '+(t.diners||[]).length+' comensal'+((t.diners||[]).length===1?"":"es")+'</option>').join("");
 if(selected&&state.activeTables.some(t=>t.place_code===selected))el.value=selected;
 renderTableDiners();
}
function selectedTable(){return state.activeTables.find(t=>t.place_code===$("#placeSelect").value)}
function renderTableDiners(selected=""){
 const table=selectedTable(),el=$("#customerSelect"),btn=$("#newCustomerBtn");
 if(!table){el.disabled=true;btn.disabled=true;el.innerHTML='<option value="">Consumidor final / sin comensal</option>';$("#activeTableNote").textContent="Solo se muestran mesas con sesión abierta. Sin mesa, la venta queda como venta directa de mostrador.";updateDirectContext();return}
 el.disabled=false;btn.disabled=false;
 el.innerHTML='<option value="">Consumidor final / sin comensal</option>'+(table.diners||[]).map(d=>'<option value="'+d.id+'">'+safe(d.name)+'</option>').join("");
 if(selected)el.value=selected;
 $("#activeTableNote").textContent=table.place_name+" está activa · "+(table.diners||[]).length+" comensal"+((table.diners||[]).length===1?"":"es")+" registrado"+((table.diners||[]).length===1?"":"s")+".";
 updateDirectContext();
}
function selectedDiner(){const t=selectedTable();return (t?.diners||[]).find(d=>d.id===$("#customerSelect").value)}
function updateDirectContext(){const t=selectedTable(),d=selectedDiner();$("#ticketPlace").textContent=t?t.place_name:"Sin mesa asignada";$("#ticketCustomer").textContent=d?d.name:"Consumidor final"}
function originLabel(o){if(o.order_source==="POS")return"POS";if(o.place_type==="TABLE")return"MESA";if(o.place_type==="COURT")return"CANCHA";if(o.place_type==="DELIVERY")return"DELIVERY";return o.order_source||"QR"}
function statusText(s){return {RECEIVED:"Recibido",PREPARING:"Preparando",READY:"Listo",DELIVERED:"Entregado",CANCELLED:"Cancelado"}[s]||s}
function renderOrdersBoard(){
 const filtered=state.origin==="ALL"?state.orders:state.orders.filter(o=>originLabel(o)===state.origin);
 const groups={RECEIVED:[],PREPARING:[],READY:[],DELIVERED:[]};filtered.forEach(o=>{if(groups[o.status])groups[o.status].push(o)});
 ["RECEIVED","PREPARING","READY","DELIVERED"].forEach(s=>{const key=s[0]+s.slice(1).toLowerCase(),el=$("#orders"+key);el.innerHTML=groups[s].map(orderCard).join("")||'<div class="empty-col">Sin pedidos</div>';$("#badge"+key).textContent=groups[s].length});
 $("#countReceived").textContent=groups.RECEIVED.length;$("#countPreparing").textContent=groups.PREPARING.length;$("#countReady").textContent=groups.READY.length;bindOrderActions();
}
function orderCard(o){const origin=originLabel(o),place=o.place_name||o.place_code||"",items=(o.items||[]).map(i=>'<li><b>'+i.qty+'×</b> '+safe(i.product_name)+(i.note?'<small>'+safe(i.note)+'</small>':'')+'</li>').join(""),next={RECEIVED:["PREPARING","Preparar"],PREPARING:["READY","Marcar listo"],READY:["DELIVERED","Entregar"]}[o.status],canPay=["READY","DELIVERED"].includes(o.status),paid=o.payment_status==="PAID";return '<article class="order-card '+o.status+'"><div class="order-card-head"><div><span class="origin '+origin+'">'+origin+'</span><b>'+safe(o.customer_name||o.diner_name||"Pedido")+'</b><small>'+safe(place)+' · '+new Date(o.created_at).toLocaleTimeString("es-HN",{hour:"2-digit",minute:"2-digit"})+'</small></div><strong>'+money(o.total)+'</strong></div>'+(o.note?'<div class="delivery-note">'+safe(o.note)+'</div>':'')+'<ul>'+items+'</ul><div class="pay-row"><span>'+safe(o.payment_method||"PAGO PENDIENTE")+'</span><em>'+safe(o.payment_status||"PENDING")+'</em></div><div class="card-actions">'+(next?'<button class="primary-action" data-status="'+next[0]+'" data-order="'+o.id+'">'+next[1]+'</button>':'')+(canPay?'<button data-bill="'+o.id+'">'+(paid?'Ver / actualizar pago':'Registrar pago')+'</button>':'')+'<button class="more-action" data-cancel="'+o.id+'">Anular pedido</button></div></article>'}
function bindOrderActions(){document.querySelectorAll("[data-status]").forEach(b=>b.onclick=async()=>{b.disabled=true;const{error}=await sb.rpc("pos_update_order_status_public",{p_order:b.dataset.order,p_station:station,p_status:b.dataset.status});if(error)toast(error.message);else{toast("Estado: "+statusText(b.dataset.status));await refreshOrders()}b.disabled=false});document.querySelectorAll("[data-cancel]").forEach(b=>b.onclick=async()=>{if(!confirm("¿Cancelar este pedido?"))return;const{error}=await sb.rpc("pos_update_order_status_public",{p_order:b.dataset.cancel,p_station:station,p_status:"CANCELLED"});toast(error?error.message:"Pedido cancelado");await refreshOrders()});document.querySelectorAll("[data-bill]").forEach(b=>b.onclick=()=>openBilling(b.dataset.bill))}
async function refreshOrders(){const{data,error}=await sb.rpc("get_pos_orders_public",{p_station:station});if(error)return toast(error.message);state.orders=Array.isArray(data)?data:[];renderOrdersBoard()}
async function refreshActiveTables(){const{data,error}=await sb.rpc("get_active_tables_public");if(error)return toast(error.message);const selected=$("#placeSelect")?.value||"";state.activeTables=Array.isArray(data)?data:[];renderActiveTables(selected)}
function paymentFieldsHTML(method,prefix,total,data={}){
 const m=(method||"").toUpperCase();
 if(m==="EFECTIVO")return '<label>Efectivo recibido<input id="'+prefix+'Cash" type="number" min="'+Number(total||0)+'" step="0.01" value="'+(data.cash_received||'')+'" placeholder="Ej. 500"></label><div class="change-box" id="'+prefix+'Change">Cambio: '+money(Math.max(0,Number(data.cash_received||0)-Number(total||0)))+'</div>';
 if(m==="TARJETA")return '<label>Últimos 4 dígitos<input id="'+prefix+'Card" inputmode="numeric" maxlength="4" value="'+safe(data.card_last4||'')+'" placeholder="1234"></label>';
 if(m==="TRANSFERENCIA")return '<label>Referencia de transferencia<input id="'+prefix+'Transfer" maxlength="80" value="'+safe(data.transfer_reference||'')+'" placeholder="Referencia / comprobante"></label>';
 if(m==="CHEQUE")return '<label>Número de cheque<input id="'+prefix+'Check" maxlength="80" value="'+safe(data.check_number||'')+'" placeholder="Número de cheque"></label>';
 return '';
}
function bindPaymentFields(methodEl,prefix,total){
 const wrap=$("#"+prefix+"PaymentDetail");if(!wrap)return;
 wrap.innerHTML=paymentFieldsHTML(methodEl.value,prefix,total,prefix==="bill"?state.billing||{}:{});
 const cash=$("#"+prefix+"Cash"),chg=$("#"+prefix+"Change");if(cash&&chg)cash.oninput=()=>chg.textContent="Cambio: "+money(Math.max(0,Number(cash.value||0)-Number(total||0)));
}
function collectCashPayment(prefix,method,total){
 const m=(method||"").toUpperCase(),p={sale_type:"CONTADO",payment_method:m};
 if(m==="EFECTIVO"){p.cash_received=$("#"+prefix+"Cash")?.value||"";if(Number(p.cash_received)<Number(total||0))throw new Error("El efectivo recibido debe ser igual o mayor al total")}
 if(m==="TARJETA"){p.card_last4=$("#"+prefix+"Card")?.value.trim()||"";if(!/^\d{4}$/.test(p.card_last4))throw new Error("Ingresa los últimos 4 dígitos de la tarjeta")}
 if(m==="TRANSFERENCIA"){p.transfer_reference=$("#"+prefix+"Transfer")?.value.trim()||"";if(!p.transfer_reference)throw new Error("Ingresa la referencia de transferencia")}
 if(m==="CHEQUE"){p.check_number=$("#"+prefix+"Check")?.value.trim()||"";if(!p.check_number)throw new Error("Ingresa el número de cheque")}
 return p;
}
function setSaleType(type){
 state.saleType=type;$("#saleTypeSwitch").querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.saleType===type));
 $("#saleCashBlock").classList.toggle("hidden",type!=="CONTADO");$("#saleCreditBlock").classList.toggle("hidden",type!=="CREDITO");
 $("#sendSale").textContent=type==="CREDITO"?"Generar factura a crédito":"Registrar pago y venta";
 if(type==="CREDITO"){const d=selectedDiner();$("#saleCreditPhone").value=d?.phone||""}
 if(type==="CONTADO")refreshSalePayment();
}
function setBillType(type){
 state.billType=type;$("#billTypeSwitch").querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.billType===type));
 $("#billCashBlock").classList.toggle("hidden",type!=="CONTADO");$("#billCreditBlock").classList.toggle("hidden",type!=="CREDITO");
 $("#billConfirm").textContent=type==="CREDITO"?"Generar factura a crédito":"Registrar pago";
 if(type==="CREDITO"&&state.billing){const d=state.activeTables.flatMap(t=>t.diners||[]).find(x=>x.name===state.billing.diner_name);$("#billCreditPhone").value=d?.phone||state.billing.credit_phone||""}
 if(type==="CONTADO"&&state.billing)bindPaymentFields($("#billMethod"),"bill",state.billing.total);
}
function openBilling(id){
 const o=state.orders.find(x=>x.id===id);if(!o)return;state.billing=o;
 $("#billTitle").textContent=(o.customer_name||o.diner_name||"Pedido")+" · "+money(o.total);$("#billMeta").textContent=originLabel(o)+" · "+(o.place_name||o.place_code||"");
 const type=o.sale_type==="CREDITO"?"CREDITO":"CONTADO";state.billType=type;$("#billMethod").value=mapPayment(o.payment_method);setBillType(type);$("#billDialog").showModal()
}
function mapPayment(v){const x=(v||"").toUpperCase();if(["EFECTIVO","CASH"].includes(x))return"EFECTIVO";if(["TARJETA","CARD"].includes(x))return"TARJETA";if(["TRANSFERENCIA","TRANSFER"].includes(x))return"TRANSFERENCIA";if(x==="CHEQUE")return"CHEQUE";return"EFECTIVO"}
$("#billMethod").onchange=()=>state.billing&&bindPaymentFields($("#billMethod"),"bill",state.billing.total);
$("#billTypeSwitch").querySelectorAll("[data-bill-type]").forEach(b=>b.onclick=()=>setBillType(b.dataset.billType));
$("#saleTypeSwitch").querySelectorAll("[data-sale-type]").forEach(b=>b.onclick=()=>setSaleType(b.dataset.saleType));
$("#billConfirm").onclick=async()=>{
 if(!state.billing)return;let payload={sale_type:state.billType};
 if(state.billType==="CONTADO"){try{payload=collectCashPayment("bill",$("#billMethod").value,state.billing.total)}catch(e){return toast(e.message)}}else{payload.credit_phone=$("#billCreditPhone").value.trim();if(payload.credit_phone.replace(/\D/g,"").length<8)return toast("Ingresa el celular del comensal")}
 const{data,error}=await sb.rpc("pos_finalize_sale_public",{p_order:state.billing.id,p_station:station,p_payload:payload});if(error)return toast(error.message);
 const o=state.billing;$("#billDialog").close();await refreshOrders();
 if(state.billType==="CREDITO")printCreditInvoice(o,data);else printReceipt(o,data);
 toast(state.billType==="CREDITO"?"Factura a crédito generada":"Pago registrado")
}
function paymentDetailText(o){
 if(o.sale_type==="CREDITO")return "CRÉDITO"+(o.invoice_number?" · "+o.invoice_number:"");
 const m=(o.payment_method||"").toUpperCase();
 if(m==="EFECTIVO")return "EFECTIVO"+(o.cash_received?(" · recibió "+money(o.cash_received)+" · cambio "+money(o.cash_change)):"");
 if(m==="TARJETA")return "TARJETA · **** "+(o.card_last4||"");
 if(m==="TRANSFERENCIA")return "TRANSFERENCIA · "+(o.transfer_reference||"");
 if(m==="CHEQUE")return "CHEQUE · "+(o.check_number||"");
 return m||"—";
}
function printReceipt(o,data){
 const items=(o.items||[]).map(i=>'<tr><td>'+i.qty+' × '+safe(i.product_name)+'</td><td>'+money(i.line_total)+'</td></tr>').join(""),w=window.open("","_blank","width=440,height=720");if(!w)return;
 const detail=data.payment_method==="EFECTIVO"?"Efectivo: "+money(data.cash_received)+" · Cambio: "+money(data.cash_change):data.payment_method==="TARJETA"?"Tarjeta **** "+data.card_last4:data.payment_method==="TRANSFERENCIA"?"Transferencia "+data.transfer_reference:"Cheque "+data.check_number;
 w.document.write('<!doctype html><title>Comprobante</title><style>body{font-family:Arial;padding:28px;color:#111}img{max-width:90px}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:8px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}.total{font-size:22px;font-weight:bold;text-align:right}</style><img src="/assets/brand/'+(station==="LB"?"lb":"bs")+'.webp"><h1>'+label+'</h1><h3>VENTA CONTADO</h3><p><b>'+(o.customer_name||o.diner_name||"Consumidor final")+'</b><br>'+(o.place_name||o.place_code||"")+'</p><table>'+items+'</table><div class="total">'+money(o.total)+'</div><p>'+safe(detail)+'</p><script>window.onload=()=>window.print()<\/script>');w.document.close()
}
function printCreditInvoice(o,data){
 const items=(o.items||[]).map(i=>'<tr><td>'+i.qty+' × '+safe(i.product_name)+'</td><td>'+money(i.line_total)+'</td></tr>').join(""),w=window.open("","_blank","width=500,height=760");if(!w)return;
 w.document.write('<!doctype html><title>Factura crédito</title><style>body{font-family:Arial;padding:28px;color:#111}img{max-width:90px}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:8px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}.total{font-size:22px;font-weight:bold;text-align:right}.box{padding:12px;background:#f4f4f4;border-radius:8px}</style><img src="/assets/brand/'+(station==="LB"?"lb":"bs")+'.webp"><h1>'+label+'</h1><h2>FACTURA A CRÉDITO</h2><div class="box"><b>'+safe(data.invoice_number||"")+'</b><br>Cliente: '+safe(o.customer_name||o.diner_name||"Consumidor final")+'<br>'+(o.place_name||o.place_code||"")+'</div><table>'+items+'</table><div class="total">'+money(o.total)+'</div><p>Saldo pendiente: <b>'+money(data.balance||o.total)+'</b></p><small>Documento interno de cuenta por cobrar.</small><script>window.onload=()=>window.print()<\/script>');w.document.close()
}
function setPosMode(mode){const direct=mode==="POS";state.origin=mode;$("#originFilters").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x.dataset.origin===mode));$("#manualSale").classList.toggle("hidden",!direct);document.querySelector(".order-board").classList.toggle("hidden",direct);document.querySelector(".receiver-stats").classList.toggle("hidden",direct);$("#ordersTitle").textContent=direct?"Venta directa · "+label:"Pedidos "+label;document.querySelector(".receiver-head p").textContent=direct?"Selecciona una mesa activa y su comensal, o registra la venta sin mesa.":"Recibe, prepara, entrega y cobra. La venta directa queda como función secundaria.";if(direct){state.cat="ALL";refreshActiveTables();renderCats();renderProducts();setTimeout(()=>$("#manualSale").scrollIntoView({behavior:"smooth",block:"start"}),50)}else renderOrdersBoard()}
$("#originFilters").querySelectorAll("[data-origin]").forEach(b=>b.onclick=()=>setPosMode(b.dataset.origin));$("#refresh").onclick=async()=>{await refreshOrders();if(state.origin==="POS")await refreshActiveTables()};$("#toggleManual").onclick=()=>setPosMode("POS");$("#closeManual").onclick=()=>setPosMode("ALL");

function renderCats(){$("#cats").innerHTML='<button class="'+(state.cat==="ALL"?"active":"")+'" data-cat="ALL">Todos</button>'+state.categories.map(c=>'<button class="'+(c.id===state.cat?"active":"")+'" data-cat="'+c.id+'">'+safe(c.name)+'</button>').join("");$("#cats").querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{state.cat=b.dataset.cat;renderCats();renderProducts()})}
function renderProducts(){const q=$("#search").value.toLowerCase().trim(),list=q?state.products.filter(p=>(p.name+" "+(p.description||"")).toLowerCase().includes(q)):(state.cat==="ALL"?state.products:state.products.filter(p=>p.category_id===state.cat));$("#productGrid").innerHTML=list.map(p=>'<article class="p"><img loading="lazy" src="'+(p.image_url||"")+'"><div><h3>'+safe(p.name)+'</h3><footer><b>'+money(p.price)+'</b><button data-p="'+p.id+'">+</button></footer></div></article>').join("")||'<div class="empty-col">No hay productos en esta categoría.</div>';$("#productGrid").querySelectorAll("[data-p]").forEach(x=>x.onclick=e=>{e.stopPropagation();openProduct(x.dataset.p)})}
function openProduct(id){state.current=state.products.find(p=>p.id===id);const linked=state.links.filter(l=>l.product_id===id).map(l=>state.groups.find(g=>g.id===l.group_id)).filter(Boolean);if(!linked.length){state.cart.push({product_id:id,qty:1,option_ids:[]});renderTicket();return}$("#optName").textContent=state.current.name;$("#optGroups").innerHTML=linked.map(g=>'<section class="og" data-g="'+g.id+'"><b>'+g.name+'</b>'+state.options.filter(o=>o.group_id===g.id).map(o=>'<label><span><input type="'+(g.selection_type==="multiple"?"checkbox":"radio")+'" name="g_'+g.id+'" value="'+o.id+'"> '+o.name+'</span><span>'+(o.price_delta?money(o.price_delta):"")+'</span></label>').join("")+'</section>').join("");$("#optionDialog").showModal()}
const selected=()=>[...$("#optGroups").querySelectorAll("input:checked")].map(i=>i.value);$("#optAdd").onclick=()=>{state.cart.push({product_id:state.current.id,qty:1,option_ids:selected()});$("#optionDialog").close();renderTicket()};
function unit(i){const p=state.products.find(x=>x.id===i.product_id);return Number(p?.price||0)+(i.option_ids||[]).reduce((a,id)=>a+Number(state.options.find(o=>o.id===id)?.price_delta||0),0)}
function renderTicket(){const el=$("#ticketItems");el.innerHTML=state.cart.map((i,n)=>{const p=state.products.find(x=>x.id===i.product_id),opts=(i.option_ids||[]).map(id=>state.options.find(o=>o.id===id)?.name).filter(Boolean).join(", ");return '<div class="line"><div><b>'+(p?.name||"")+'</b><small>'+opts+'</small><small>'+money(unit(i))+'</small></div><div class="qty"><button data-less="'+n+'">−</button><strong>'+i.qty+'</strong><button data-more="'+n+'">+</button></div></div>'}).join("")||'<div class="empty-col">Aún no has agregado productos.</div>';$("#ticketTotal").textContent=money(state.cart.reduce((a,i)=>a+unit(i)*i.qty,0));refreshSalePayment();el.querySelectorAll("[data-more]").forEach(b=>b.onclick=()=>{state.cart[+b.dataset.more].qty++;renderTicket()});el.querySelectorAll("[data-less]").forEach(b=>b.onclick=()=>{const n=+b.dataset.less;if(--state.cart[n].qty<=0)state.cart.splice(n,1);renderTicket()})}
$("#placeSelect").onchange=()=>renderTableDiners();$("#customerSelect").onchange=updateDirectContext;$("#search").oninput=renderProducts;
function refreshSalePayment(){const total=state.cart.reduce((a,i)=>a+unit(i)*i.qty,0);if(state.saleType==="CONTADO")bindPaymentFields($("#paymentMethod"),"sale",total)}
$("#paymentMethod").onchange=refreshSalePayment;
$("#newCustomerBtn").onclick=()=>{const t=selectedTable();if(!t)return toast("Selecciona una mesa activa");$("#customerForm").reset();$("#customerTableLabel").textContent="Mesa: "+t.place_name;$("#customerDialog").showModal()};
$("#customerForm").onsubmit=async e=>{e.preventDefault();const t=selectedTable(),name=$("#newCustomerName").value.trim();if(!t)return toast("Selecciona una mesa activa");if(!name)return toast("Escribe el nombre del comensal");const{data,error}=await sb.rpc("add_diner_to_active_table_public",{p_place:t.place_code,p_name:name});if(error)return toast(error.message);await refreshActiveTables();$("#placeSelect").value=t.place_code;renderTableDiners(data.id);$("#customerDialog").close();toast("Comensal agregado a "+t.place_name)};
$("#sendSale").onclick=async()=>{
 if(!state.cart.length)return toast("Agrega productos");const t=selectedTable(),d=selectedDiner(),total=state.cart.reduce((a,i)=>a+unit(i)*i.qty,0);
 let finalPayload={sale_type:state.saleType};
 if(state.saleType==="CONTADO"){try{finalPayload=collectCashPayment("sale",$("#paymentMethod").value,total)}catch(e){return toast(e.message)}}else{finalPayload.credit_phone=$("#saleCreditPhone").value.trim();if(finalPayload.credit_phone.replace(/\D/g,"").length<8)return toast("Ingresa el celular del comensal")}
 const payload={station,diner_id:d?.id||null,customer_name:d?.name||"Consumidor final",payment_method:null,payment_status:"PENDING",note:$("#saleNote").value.trim(),items:state.cart};
 const{data:created,error}=await sb.rpc("pos_place_order",{p_place:t?.place_code||null,p_payload:payload});if(error)return toast(error.message);
 const orderId=created?.order_id;if(!orderId)return toast("No se pudo crear la venta");
 const{data:finalized,error:finalError}=await sb.rpc("pos_finalize_sale_public",{p_order:orderId,p_station:station,p_payload:finalPayload});if(finalError)return toast(finalError.message);
 const pseudo={id:orderId,total,customer_name:d?.name||"Consumidor final",diner_name:d?.name||null,place_name:t?.place_name||"POS "+label,place_code:t?.place_code||("POS-"+station),items:state.cart.map(i=>{const p=state.products.find(x=>x.id===i.product_id);return{qty:i.qty,product_name:p?.name||"",line_total:unit(i)*i.qty}})};
 if(state.saleType==="CREDITO")printCreditInvoice(pseudo,finalized);else printReceipt(pseudo,finalized);
 const completedType=state.saleType;state.cart=[];$("#saleNote").value="";$("#placeSelect").value="";renderTableDiners();renderTicket();await refreshOrders();setSaleType("CONTADO");toast(completedType==="CREDITO"?"Factura a crédito generada":"Venta registrada");
}

function dateYMD(d){const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)}
function setReportPreset(period){document.querySelectorAll("[data-period]").forEach(b=>b.classList.toggle("active",b.dataset.period===period));const now=new Date(),from=new Date(now),to=new Date(now);if(period==="YESTERDAY"){from.setDate(now.getDate()-1);to.setDate(now.getDate()-1)}else if(period==="WEEK"){from.setDate(now.getDate()-6)}else if(period==="MONTH"){from.setDate(1)}$("#reportFrom").value=dateYMD(from);$("#reportTo").value=dateYMD(to);loadSalesReport()}
async function loadSalesReport(){const f=$("#reportFrom").value,t=$("#reportTo").value;if(!f||!t)return;const from=new Date(f+"T00:00:00"),to=new Date(t+"T00:00:00");to.setDate(to.getDate()+1);const{data,error}=await sb.rpc("get_pos_sales_report_public",{p_station:station,p_from:from.toISOString(),p_to:to.toISOString()});if(error)return toast(error.message);state.report=data||{};renderSalesReport(f,t)}
function miniRows(list,key){return (list||[]).map(x=>'<div class="mini-report-row"><span>'+safe(x[key]||"")+'</span><b>'+money(x.amount)+'</b><em>'+Number(x.count??x.qty??0).toLocaleString("es-HN")+'</em></div>').join("")||'<div class="empty-col">Sin datos</div>'}
function renderSalesReport(f,t){const r=state.report||{},s=r.summary||{};$("#reportLogo").src=station==="LB"?"/assets/brand/lb.webp":"/assets/brand/bs.webp";$("#reportTitle").textContent=label;$("#reportRangeLabel").textContent=f===t?new Date(f+"T12:00:00").toLocaleDateString("es-HN",{dateStyle:"long"}):f+" al "+t;$("#reportSales").textContent=money(s.sales_total);$("#reportOrders").textContent=Number(s.orders_count||0);$("#reportAverage").textContent=money(s.avg_ticket);$("#reportCancelled").textContent=Number(s.cancelled_count||0);$("#reportCash").textContent=money(s.cash_sales);$("#reportCredit").textContent=money(s.credit_sales);$("#reportCxC").textContent=money(s.receivable_balance);$("#reportOrigins").innerHTML=miniRows(r.by_origin,"origin");$("#reportSaleTypes").innerHTML=miniRows(r.by_sale_type,"sale_type");$("#reportPayments").innerHTML=miniRows(r.by_payment,"payment_method");$("#reportProducts").innerHTML=miniRows(r.top_products,"product_name");$("#reportCategories").innerHTML=miniRows(r.categories,"category");const orders=r.orders||[];$("#reportDetailCount").textContent=orders.length+" ventas";$("#reportRows").innerHTML=orders.map(o=>{const origin=o.order_source==="POS"?"Venta directa":o.place_type==="COURT"?"Cancha":o.place_type==="TABLE"?"Mesa":o.order_source,items=(o.items||[]).map(i=>i.qty+"× "+i.product_name).join(", ");const detail=paymentDetailText(o),saldo=o.sale_type==="CREDITO"?money(o.receivable_balance||0):"—";return '<tr><td>'+new Date(o.created_at).toLocaleString("es-HN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})+'</td><td>#'+String(o.id).slice(0,8)+(o.invoice_number?'<br><small>'+safe(o.invoice_number)+'</small>':'')+'</td><td>'+safe(origin)+'</td><td>'+safe(o.place_name||o.place_code||"—")+'</td><td>'+safe(o.diner_name||o.customer_name||"Consumidor final")+'</td><td>'+safe(items)+'</td><td>'+safe(o.sale_type||"CONTADO")+'</td><td>'+safe(detail)+'</td><td>'+saldo+'</td><td><b>'+money(o.total)+'</b></td></tr>'}).join("")||'<tr><td colspan="10">Sin ventas en el período.</td></tr>'}
$("#showReport").onclick=()=>{$("#receiverPanel").classList.add("hidden");$("#manualSale").classList.add("hidden");$("#reportPanel").classList.remove("hidden");loadSalesReport();window.scrollTo({top:0})};$("#closeReport").onclick=()=>{$("#reportPanel").classList.add("hidden");$("#receiverPanel").classList.remove("hidden");setPosMode("ALL")};$("#loadReport").onclick=loadSalesReport;document.querySelectorAll("[data-period]").forEach(b=>b.onclick=()=>setReportPreset(b.dataset.period));$("#printReport").onclick=()=>window.print();

function startRealtime(){if(state.realtime)return;state.realtime=true;setInterval(async()=>{const old=state.orders[0]?.id;const{data,error}=await sb.rpc("get_pos_orders_public",{p_station:station});if(error)return;state.orders=Array.isArray(data)?data:[];if(!$("#reportPanel").classList.contains("hidden"))return;renderOrdersBoard();if(old&&state.orders[0]?.id&&state.orders[0].id!==old)toast("🔔 Nuevo pedido recibido")},3500)}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());boot();
