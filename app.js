import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
const sb=createClient("https://cnynfycmvmcjzaevhvmw.supabase.co","sb_publishable_9Du-_m5etaGt-vCBkDvROw_-0sdB_jT");
const qs=new URLSearchParams(location.search),place=(qs.get("place")||"M01").toUpperCase();
const $=s=>document.querySelector(s),money=n=>"L "+Number(n||0).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2});
const safe=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const state={brands:[],categories:[],products:[],promos:[],promoLinks:[],groups:[],options:[],links:[],activeCategory:null,cart:[],session:null,diner:null,place:null,promoIndex:0,heroIndex:0,current:null};
const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2300)};
async function init(){
 const [b,c,p,pr,ppr,g,o,l,pl]=await Promise.all([
  sb.from("brands").select("*").eq("active",true).order("sort_order"),
  sb.from("categories").select("*").eq("active",true).order("sort_order"),
  sb.from("products").select("*").eq("active",true).order("sort_order"),
  sb.from("promotions").select("*").eq("active",true).order("sort_order"),
  sb.from("promotion_products").select("*").order("sort_order"),
  sb.from("option_groups").select("*").eq("active",true).order("sort_order"),
  sb.from("options").select("*").eq("active",true).order("sort_order"),
  sb.from("product_option_groups").select("*").order("sort_order"),
  sb.from("places").select("*").eq("code",place).maybeSingle()
 ]);
 state.brands=b.data||[];state.categories=c.data||[];state.products=p.data||[];state.promos=(pr.data||[]).filter(x=>!x.audience||x.audience==="ALL"||x.audience===((pl.data||{}).place_type||"TABLE"));state.promoLinks=ppr.data||[];state.groups=g.data||[];state.options=o.data||[];state.links=l.data||[];
 state.place=pl.data||{code:place,name:place,place_type:"TABLE",theme_key:"PREMIUM",intro_title:"Bienvenido",intro_subtitle:"La Bandeja + Beer Station"};
 document.body.dataset.placeType=state.place.place_type;document.body.dataset.theme=state.place.theme_key||state.place.place_type;$("#placeName").textContent=state.place.name;
 renderHeaderLogos();setupExperience();state.activeCategory=state.categories[0]?.id||null;renderCategories();renderProducts();renderPromos();renderPromoGrid();restoreDiner();updateCart();setInterval(nextPromo,4800);
 if(state.diner)await refreshDiners();
}
function renderHeaderLogos(){const html=state.brands.map(b=>`<img src="${b.logo_url||""}" alt="${safe(b.name)}">`).join("");$("#headerLogos").innerHTML=html;$("#introLogos").innerHTML=html}
function setupExperience(){
 const p=state.place,type=p.place_type||"TABLE";
 const featured=state.products.filter(x=>x.featured&&x.image_url).slice(0,6);
 const introImages=featured.length?featured:state.products.filter(x=>x.image_url).slice(0,6);
 $("#introSlides").innerHTML=introImages.map((x,i)=>`<div class="intro-slide ${i===0?"active":""}"><img src="${x.image_url}" alt=""><span>${safe(x.name||"")}</span></div>`).join("");
 const slideEls=[...document.querySelectorAll(".intro-slide")];let introIndex=0;
 const introTimer=setInterval(()=>{if(slideEls.length<2)return;slideEls[introIndex].classList.remove("active");introIndex=(introIndex+1)%slideEls.length;slideEls[introIndex].classList.add("active")},560);
 $("#introTitle").textContent=p.intro_title||"La Bandeja + Beer Station";$("#introSubtitle").textContent=p.intro_subtitle||"";$("#introLabel").textContent=type==="COURT"?"LA BANDEJA + BEER STATION · CANCHA":type==="DELIVERY"?"LA BANDEJA + BEER STATION · DELIVERY":"LA BANDEJA + BEER STATION";
 $("#heroTitle").textContent=p.intro_title||"";$("#heroSubtitle").textContent=p.intro_subtitle||"";$("#heroLabel").textContent=type==="COURT"?"CANCHA":type==="DELIVERY"?"DELIVERY":"PREMIUM";$("#heroImage").src=p.hero_image_url||"";
 $("#heroBadges").innerHTML="";
 const joinTitle=$("#joinDialog h2"),joinText=$("#joinDialog p"),kicker=$("#joinKicker");
 if(type==="COURT"){kicker.textContent=p.name.toUpperCase();joinTitle.textContent="Tu nombre";joinText.textContent="Tu pedido queda asociado a esta cancha."}
 else if(type==="DELIVERY"){kicker.textContent="DELIVERY";joinTitle.textContent="Nombre del pedido";joinText.textContent="Lo usaremos para identificar tu orden."}
 else {kicker.textContent=p.name.toUpperCase();joinTitle.textContent="Tu nombre";joinText.textContent="Tu pedido queda asociado a esta mesa."}
 const closeIntro=()=>{clearInterval(introTimer);$("#experienceIntro").classList.add("done")};setTimeout(closeIntro,3000);
}
function restoreDiner(){try{const x=JSON.parse(localStorage.getItem("d504_diner_"+place)||"null");if(x?.session_id&&x?.diner_id){state.diner=x;state.session={id:x.session_id};$("#dinerName").textContent=x.name}}catch{}}
function renderCategories(){const el=$("#categories");el.innerHTML=state.categories.map(c=>`<button class="category-tile ${c.id===state.activeCategory?"active":""}" data-cat="${c.id}" style="--cat-bg:url('${c.image_url||""}')"><span>${safe(c.name)}</span></button>`).join("");el.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{state.activeCategory=b.dataset.cat;renderCategories();renderProducts()})}
function renderProducts(){
 const q=$("#search").value.trim().toLowerCase();
 let list=state.products.filter(p=>p.category_id===state.activeCategory);
 if(q)list=state.products.filter(p=>(p.name+" "+(p.description||"")).toLowerCase().includes(q));
 const el=$("#products");
 el.innerHTML=list.length?list.map(p=>`<article class="product" data-open="${p.id}"><div class="product-media"><img src="${p.image_url||""}" alt=""><span class="brand-mark">${p.brand_id==="LB"?"LA BANDEJA":"BEER STATION"}</span><button class="quick-add" data-open="${p.id}" aria-label="Abrir producto">+</button></div><div class="product-body"><h3>${safe(p.name)}</h3><footer><b>${money(p.price)}</b></footer></div></article>`).join(""):'<div class="empty">Sin productos disponibles.</div>';
 el.querySelectorAll("[data-open]").forEach(x=>x.onclick=e=>{e.stopPropagation();openProduct(x.dataset.open)});
}
function openProduct(id){
 const p=state.products.find(x=>x.id===id);if(!p)return;state.current=p;
 $("#detailImage").src=p.image_url||"";$("#detailBrand").textContent=p.brand_id==="LB"?"LA BANDEJA":"BEER STATION";$("#detailName").textContent=p.name;$("#detailDescription").textContent=p.description||"";$("#detailNote").value="";
 const linked=state.links.filter(x=>x.product_id===id).map(x=>state.groups.find(g=>g.id===x.group_id)).filter(Boolean);
 const wrap=$("#detailOptions");wrap.innerHTML="";
 linked.forEach(g=>{const box=document.createElement("section");box.className="option-group";box.dataset.group=g.id;box.innerHTML=`<div class="option-head"><div><b>${safe(g.name)}</b><small>${g.min_selections>0?"Elige una opción":"Opcional"}</small></div></div>`;
  state.options.filter(o=>o.group_id===g.id).forEach(o=>{const label=document.createElement("label");label.className="option-row";const type=g.selection_type==="multiple"?"checkbox":"radio";label.innerHTML=`<span><input type="${type}" name="g_${g.id}" value="${o.id}"> ${safe(o.name)}</span><b>${o.price_delta?("+"+money(o.price_delta)):""}</b>`;box.append(label)});wrap.append(box)});
 refreshDetailPrice();wrap.querySelectorAll("input").forEach(i=>i.onchange=refreshDetailPrice);$("#productDialog").showModal();
}
function selectedOptions(){return [...$("#detailOptions").querySelectorAll("input:checked")].map(i=>i.value)}
function refreshDetailPrice(){if(!state.current)return;const extra=selectedOptions().reduce((s,id)=>s+Number(state.options.find(o=>o.id===id)?.price_delta||0),0);$("#detailPrice").textContent=money(Number(state.current.price)+extra)}
function validateOptions(){
 const selected=new Set(selectedOptions());
 for(const link of state.links.filter(x=>x.product_id===state.current.id)){const g=state.groups.find(x=>x.id===link.group_id);if(!g)continue;const n=state.options.filter(o=>o.group_id===g.id&&selected.has(o.id)).length;if(n<g.min_selections){toast("Selecciona "+g.name);return false}if(g.max_selections>0&&n>g.max_selections){toast("Elige máximo "+g.max_selections+" en "+g.name);return false}}
 return true;
}
$("#addConfigured").onclick=()=>{if(!state.current||!validateOptions())return;const option_ids=selectedOptions(),note=$("#detailNote").value.trim();state.cart.push({product_id:state.current.id,qty:1,option_ids,note});$("#productDialog").close();updateCart();toast("Agregado al pedido")};
function itemUnitTotal(i){const p=state.products.find(x=>x.id===i.product_id);const extra=(i.option_ids||[]).reduce((s,id)=>s+Number(state.options.find(o=>o.id===id)?.price_delta||0),0);return Number(p?.price||0)+extra}
function updateCart(){const count=state.cart.reduce((a,b)=>a+b.qty,0),total=state.cart.reduce((a,i)=>a+itemUnitTotal(i)*i.qty,0);$("#cartCount").textContent=count;$("#cartTotalDock").textContent=money(total);$("#cartDock").classList.toggle("hidden",!count)}
function renderCart(){const el=$("#cartItems");el.innerHTML=state.cart.map((i,n)=>{const p=state.products.find(x=>x.id===i.product_id);const opts=(i.option_ids||[]).map(id=>state.options.find(o=>o.id===id)?.name).filter(Boolean).join(" · ");return `<div class="cart-line"><div><b>${safe(p?.name)}</b><small>${safe(opts||"Sin extras")}${i.note?" · "+safe(i.note):""}</small><small>${money(itemUnitTotal(i))} c/u</small></div><div class="qty"><button data-less="${n}">−</button><strong>${i.qty}</strong><button data-more="${n}">+</button></div></div>`}).join("")||'<div class="empty">Tu pedido está vacío.</div>';$("#cartGrand").textContent=money(state.cart.reduce((a,i)=>a+itemUnitTotal(i)*i.qty,0));el.querySelectorAll("[data-more]").forEach(b=>b.onclick=()=>{state.cart[+b.dataset.more].qty++;renderCart();updateCart()});el.querySelectorAll("[data-less]").forEach(b=>b.onclick=()=>{const i=+b.dataset.less;if(--state.cart[i].qty<=0)state.cart.splice(i,1);renderCart();updateCart()})}
async function joinTable(){const name=$("#joinName").value.trim();if(!name)return toast("Escribe tu nombre");const {data,error}=await sb.rpc("join_table_public",{p_place:place,p_name:name});if(error)return toast(error.message);state.diner={...data,name};state.session={id:data.session_id};localStorage.setItem("d504_diner_"+place,JSON.stringify(state.diner));$("#dinerName").textContent=name;$("#joinDialog").close();await refreshDiners();toast("Te uniste a "+state.place.name)}
async function refreshDiners(){if(!state.session?.id)return;const {data}=await sb.rpc("get_table_diners_public",{p_session:state.session.id});const list=Array.isArray(data)?data:[];$("#diners").innerHTML=list.map(d=>`<span class="diner">${safe(d.name).slice(0,1).toUpperCase()}</span>`).join("");const label=state.place?.place_type==="COURT"?" jugador"+(list.length===1?"":"es"):state.place?.place_type==="DELIVERY"?" pedido"+(list.length===1?"":"s"):" comensal"+(list.length===1?"":"es");$("#dinerCount").textContent=list.length+label}
async function sendOrder(){if(!state.diner){$("#joinDialog").showModal();return}if(!state.cart.length)return toast("Agrega productos");const payload={session_id:state.session.id,diner_id:state.diner.diner_id,items:state.cart};const btn=$("#sendOrder");btn.disabled=true;btn.textContent="Enviando…";const {data,error}=await sb.rpc("place_order_public",{p_payload:payload});btn.disabled=false;btn.textContent="Enviar pedido";if(error)return toast(error.message);state.cart=[];updateCart();$("#cartDialog").close();toast("Pedido enviado")}
async function callStaff(reason){if(!state.diner){$("#joinDialog").showModal();return}const {error}=await sb.rpc("call_staff_public",{p_payload:{session_id:state.session.id,diner_id:state.diner.diner_id,reason}});toast(error?error.message:"Solicitud enviada")}
function heroProducts(){const featured=state.products.filter(p=>p.featured&&p.image_url);return featured.length?featured.slice(0,10):state.products.filter(p=>p.image_url).slice(0,10)}
function renderPromos(){const list=heroProducts();if(!list.length)return;const p=list[state.heroIndex%list.length];$("#promoHero").innerHTML=`<article class="hero-product" data-hero-product="${p.id}"><img src="${p.image_url}"><div class="promo-copy"><small>${p.brand_id==="LB"?"LA BANDEJA":"BEER STATION"}</small><h2>${safe(p.name)}</h2><p>${safe(p.description||"")}</p><b>${money(p.price)}</b></div></article>`;$("#promoHero").onclick=()=>openProduct(p.id);$("#promoDots").innerHTML=list.map((_,i)=>`<button class="${i===state.heroIndex?"active":""}" data-dot="${i}"></button>`).join("");$("#promoDots").querySelectorAll("[data-dot]").forEach(d=>d.onclick=e=>{e.stopPropagation();state.heroIndex=+d.dataset.dot;renderPromos()})}
function nextPromo(){const list=heroProducts();if(!list.length)return;state.heroIndex=(state.heroIndex+1)%list.length;renderPromos()}
function openPromotion(id){const pr=state.promos.find(p=>p.id===id);if(!pr)return;const ids=state.promoLinks.filter(x=>x.promotion_id===id).map(x=>x.product_id);const list=ids.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);$("#promoDialogType").textContent=(pr.promo_type||"PROMOCIÓN").replace("_"," ");$("#promoDialogTitle").textContent=pr.title;$("#promoDialogSubtitle").textContent=pr.subtitle||"";$("#promoProducts").innerHTML=list.length?list.map(p=>`<article class="promo-product" data-promo-product="${p.id}"><img src="${p.image_url||""}"><div><b>${safe(p.name)}</b><span>${money(p.price)}</span></div></article>`).join(""):'<div class="empty">Sin productos vinculados.</div>';$("#promoProducts").querySelectorAll("[data-promo-product]").forEach(x=>x.onclick=()=>{$("#promoDialog").close();openProduct(x.dataset.promoProduct)});$("#promoDialog").showModal()}
function renderPromoGrid(){const el=$("#promoGrid");const list=state.promos.filter(p=>p.promo_type&&p.promo_type!=="GENERAL").slice(0,10);el.innerHTML=list.map(p=>`<article class="promo-card" data-promo="${p.id}"><img src="${p.image_url}"><div><small>${safe(p.promo_type.replace("_"," "))}</small><b>${safe(p.title)}</b><span>${safe(p.subtitle||"")}</span></div></article>`).join("");el.querySelectorAll("[data-promo]").forEach(x=>x.onclick=()=>openPromotion(x.dataset.promo));let i=0;clearInterval(window.__promoCardsTimer);window.__promoCardsTimer=setInterval(()=>{if(el.children.length<2)return;i=(i+1)%el.children.length;el.scrollTo({left:el.children[i].offsetLeft-16,behavior:"smooth"})},3200)}
$("#search").oninput=renderProducts;$("#cartDock").onclick=()=>{renderCart();$("#cartDialog").showModal()};$("#cartTop").onclick=()=>{renderCart();$("#cartDialog").showModal()};$("#joinButton").onclick=joinTable;$("#sendOrder").onclick=sendOrder;$("#bellButton").onclick=()=>$("#serviceDialog").showModal();document.querySelectorAll("[data-service]").forEach(b=>b.onclick=()=>{callStaff(b.dataset.service);$("#serviceDialog").close()});document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());init();
