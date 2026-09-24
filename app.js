const { createClient } = window.supabase;
const sb=createClient("https://cnynfycmvmcjzaevhvmw.supabase.co","sb_publishable_9Du-_m5etaGt-vCBkDvROw_-0sdB_jT");
const qs=new URLSearchParams(location.search),place=(qs.get("place")||"M01").toUpperCase();
const $=s=>document.querySelector(s),money=n=>"L "+Number(n||0).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2});
const safe=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const state={brands:[],categories:[],products:[],allProducts:[],channels:[],heroSlides:[],promos:[],promoLinks:[],groups:[],options:[],links:[],activeCategory:null,activeDrinkCategory:null,cart:[],session:null,diner:null,place:null,promoIndex:0,heroIndex:0,current:null};let feedbackRating=0;
const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2300)};
async function init(){
 const [b,c,p,ch,hs,pr,ppr,g,o,l,pl]=await Promise.all([
  sb.from("brands").select("*").eq("active",true).order("sort_order"),
  sb.from("categories").select("*").eq("active",true).order("sort_order"),
  sb.from("products").select("*").eq("active",true).order("sort_order"),
  sb.from("product_channels").select("*").order("sort_order"),
  sb.from("hero_slides").select("*").eq("active",true).order("sort_order"),
  sb.from("promotions").select("*").eq("active",true).order("sort_order"),
  sb.from("promotion_products").select("*").order("sort_order"),
  sb.from("option_groups").select("*").eq("active",true).order("sort_order"),
  sb.from("options").select("*").eq("active",true).order("sort_order"),
  sb.from("product_option_groups").select("*").order("sort_order"),
  sb.from("places").select("*").eq("code",place).maybeSingle()
 ]);
 state.brands=b.data||[];state.categories=c.data||[];state.allProducts=p.data||[];state.channels=ch.data||[];state.heroSlides=hs.data||[];state.promos=(pr.data||[]).filter(x=>!x.audience||x.audience==="ALL"||x.audience===((pl.data||{}).place_type||"TABLE"));state.promoLinks=ppr.data||[];state.groups=g.data||[];state.options=o.data||[];state.links=l.data||[];
 state.place=pl.data||{code:place,name:place,place_type:"TABLE",theme_key:"PREMIUM",intro_title:"Bienvenido",intro_subtitle:"La Bandeja + Beer Station"};
 const allowed=new Set(state.channels.filter(x=>x.channel===state.place.place_type).map(x=>x.product_id));
 state.products=state.allProducts.filter(x=>allowed.has(x.id));
 if(state.place.place_type==="COURT"){const extra=state.allProducts.filter(x=>["hamburguesas","mocktails","daiquiris","cervezas"].includes(x.category_id));const seen=new Set(state.products.map(x=>x.id));extra.forEach(x=>{if(!seen.has(x.id))state.products.push(x)});}
 const categoryIds=new Set(state.products.map(x=>x.category_id));state.categories=state.categories.filter(x=>categoryIds.has(x.id));
 document.body.dataset.placeType=state.place.place_type;document.body.dataset.theme=state.place.theme_key||state.place.place_type;$("#placeName").textContent=state.place.name;if(state.place.place_type==="COURT"){document.body.style.backgroundImage="linear-gradient(180deg,rgba(2,7,4,.74),rgba(3,8,5,.88) 45%,rgba(3,5,4,.96)),url(/assets/new/court-stadium.jpg)";document.body.style.backgroundSize="cover";document.body.style.backgroundPosition="center top";document.body.style.backgroundRepeat="no-repeat";document.querySelector(".cinema-hero").classList.add("hidden");$("#newSection").classList.add("hidden");$("#comboSection").classList.add("hidden");$("#drinkSection").classList.add("hidden");$("#buildComboBtn").classList.remove("hidden");document.querySelector("#promoSection .section-head small").textContent="PARTIDO";document.querySelector("#promoSection .section-head h2").textContent="Promociones de cancha";document.querySelector(".menu-title small").textContent="MENÚ DE CANCHA";document.querySelector(".menu-title h2").textContent="Arma tu jugada"}
 renderHeaderLogos();setupExperience();state.activeCategory=state.categories[0]?.id||null;renderCategories();renderProducts();renderPromos();renderPromoGrid();restoreDiner();updateCart();setInterval(nextPromo,Number(state.place.hero_interval_ms||4800));
 if(state.diner)await refreshDiners();
}
function renderHeaderLogos(){const html=state.brands.filter(b=>["LB","BS"].includes(b.id)&&b.logo_url).map(b=>`<img src="${b.logo_url}" alt="${safe(b.name)}" width="44" height="44" decoding="async">`).join("");$("#headerLogos").innerHTML=html;$("#introLogos").innerHTML=html}
function setupExperienceLegacy(){
 const p=state.place,type=p.place_type||"TABLE";
 const slides=state.heroSlides.filter(x=>x.channel===type).map(x=>({id:x.product_id,name:x.title,description:x.subtitle,image_url:x.image_url||state.allProducts.find(p=>p.id===x.product_id)?.image_url})).filter(x=>x.image_url);
 const introImages=slides.length?slides:state.products.filter(x=>x.image_url).slice(0,6);
 $("#introSlides").innerHTML=introImages.map((x,i)=>`<div class="intro-slide ${i===0?"active":""}"><img src="${x.image_url}" alt=""><span>${safe(x.name||"")}</span></div>`).join("");
 const slideEls=[...document.querySelectorAll(".intro-slide")];let introIndex=0;
 const introTimer=setInterval(()=>{if(slideEls.length<2)return;slideEls[introIndex].classList.remove("active");introIndex=(introIndex+1)%slideEls.length;slideEls[introIndex].classList.add("active")},560);
 $("#introTitle").textContent=p.intro_title||"La Bandeja + Beer Station";$("#introSubtitle").textContent=p.intro_subtitle||"";$("#introLabel").textContent=type==="COURT"?"LA BANDEJA + BEER STATION · CANCHA":type==="DELIVERY"?"LA BANDEJA + BEER STATION · DELIVERY":"LA BANDEJA + BEER STATION";
 $("#heroTitle").textContent=p.intro_title||"";$("#heroSubtitle").textContent=p.intro_subtitle||"";$("#heroLabel").textContent=type==="COURT"?"CANCHA":type==="DELIVERY"?"DELIVERY":"PREMIUM";
 const ambient=slides.length?slides:introImages;$("#heroAmbient").innerHTML=ambient.slice(0,4).map((x,i)=>`<figure class="ambient-slide ${i===0?"active":""}"><img src="${x.image_url}" alt=""><span>${safe(x.name||"")}</span></figure>`).join("")+`<div class="ambient-vapor"></div>`;
 const amb=[...$("#heroAmbient").querySelectorAll(".ambient-slide")];let ai=0;setInterval(()=>{if(amb.length<2)return;amb[ai].classList.remove("active");ai=(ai+1)%amb.length;amb[ai].classList.add("active")},2600);
 $("#heroBadges").innerHTML="";
 const joinTitle=$("#joinDialog h2"),joinText=$("#joinDialog p"),kicker=$("#joinKicker");
 if(type==="COURT"){kicker.textContent=p.name.toUpperCase();joinTitle.textContent="Tu nombre";joinText.textContent="Tu pedido queda asociado a esta cancha."}
 else if(type==="DELIVERY"){kicker.textContent="DELIVERY";joinTitle.textContent="Nombre del pedido";joinText.textContent="Lo usaremos para identificar tu orden."}
 else {kicker.textContent=p.name.toUpperCase();joinTitle.textContent="Tu nombre";joinText.textContent="Tu pedido queda asociado a esta mesa."}
 const closeIntro=()=>{clearInterval(introTimer);$("#experienceIntro").classList.add("done")};setTimeout(closeIntro,3000);
}
function restoreDiner(){try{const x=JSON.parse(localStorage.getItem("d504_diner_"+place)||"null");if(x?.session_id&&x?.diner_id){state.diner=x;state.session={id:x.session_id};$("#dinerName").textContent=x.name}}catch{}}
function renderCategories(){const el=$("#categories");let cats=state.categories;if(state.place?.place_type==="COURT"){const order=["court-tajadas","court-hotdogs","court-churros","court-tacos","court-pupusas","court-pastelitos","hamburguesas","court-chilis","cervezas","mocktails","daiquiris"];const labels={"court-tajadas":"Tajadas con Pollo","court-hotdogs":"Hot Dogs","court-churros":"Churros Preparados","court-tacos":"Tacos","court-pupusas":"Pupusas","court-pastelitos":"Pastelitos","hamburguesas":"Hamburguesas","court-chilis":"Churros & Snacks","cervezas":"Cervezas","mocktails":"Frescos","daiquiris":"Smoothies & Frozen"};cats=order.map(id=>state.categories.find(c=>c.id===id)).filter(Boolean).map(c=>Object.assign({},c,{displayName:labels[c.id]||c.name}));if(!cats.some(c=>c.id===state.activeCategory))state.activeCategory=cats[0]?.id||null;}el.innerHTML=cats.map(c=>`<button class="category-tile ${c.id===state.activeCategory?"active":""}" data-cat="${c.id}" style="--cat-bg:url('${c.image_url||""}')"><span>${safe(c.displayName||c.name)}</span></button>`).join("");el.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{state.activeCategory=b.dataset.cat;renderCategories();renderProducts()})}
function renderProductsLegacy(){
 const q=$("#search").value.trim().toLowerCase();
 let list=state.products.filter(p=>p.category_id===state.activeCategory);
 if(q)list=state.products.filter(p=>(p.name+" "+(p.description||"")).toLowerCase().includes(q));
 const el=$("#products");
 el.innerHTML=list.length?list.map(p=>`<article class="product" data-open="${p.id}"><div class="product-media"><img src="${p.image_url||""}" alt=""><span class="brand-mark">${p.brand_id==="LB"?"LA BANDEJA":"BEER STATION"}</span><button class="quick-add" data-open="${p.id}" aria-label="Abrir producto">+</button></div><div class="product-body"><h3>${safe(p.name)}</h3><footer><b>${money(p.price)}</b></footer></div></article>`).join(""):'<div class="empty">Sin productos disponibles.</div>';
 el.querySelectorAll("[data-open]").forEach(x=>x.onclick=e=>{e.stopPropagation();openProduct(x.dataset.open)});
}
function openProduct(id){
 const p=state.products.find(x=>x.id===id);if(!p)return;state.current=p;
 $("#detailImage").src=p.image_url||"";$("#productDialog").className=visualClass(p);$("#detailBrand").textContent=p.brand_id==="LB"?"LA BANDEJA":"BEER STATION";$("#detailName").textContent=p.name;$("#detailDescription").textContent=p.description||"";$("#detailNote").value="";
 const linked=state.links.filter(x=>x.product_id===id).map(x=>state.groups.find(g=>g.id===x.group_id)).filter(Boolean);
 const wrap=$("#detailOptions");wrap.innerHTML="";
 linked.forEach(g=>{const box=document.createElement("section");box.className="option-group";box.dataset.group=g.id;box.innerHTML=`<div class="option-head"><div><b>${safe(g.name)}</b><small>${g.min_selections>0?"Elige una opción":"Opcional"}</small></div></div>`;
  state.options.filter(o=>o.group_id===g.id).forEach(o=>{const label=document.createElement("label");label.className="option-row";const type=g.selection_type==="multiple"?"checkbox":"radio";label.innerHTML=`<span><input type="${type}" name="g_${g.id}" value="${o.id}"> ${safe(o.name)}</span><b>${o.price_delta?("+"+money(o.price_delta)):""}</b>`;box.append(label)});wrap.append(box)});
 refreshDetailPrice();wrap.querySelectorAll("input").forEach(i=>i.onchange=refreshDetailPrice);$("#productDialog").showModal();requestProductSuggestion(p);
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
const comboPick={};
function renderComboBuilder(){const list=$("#comboBuilderList");const allowedCats=new Set(["court-pupusas","court-tacos","court-pastelitos","court-hotdogs","court-tajadas","hamburguesas","court-churros","court-chilis","cervezas","mocktails","daiquiris"]);const items=state.products.filter(p=>allowedCats.has(p.category_id));list.innerHTML=items.map(p=>`<div class="combo-pick-row"><img src="${p.image_url||""}" alt=""><div><b>${safe(p.name)}</b><small>${money(p.price)}</small></div><div class="combo-stepper"><button type="button" data-combo-minus="${p.id}">−</button><strong data-combo-qty="${p.id}">${comboPick[p.id]||0}</strong><button type="button" data-combo-plus="${p.id}">+</button></div></div>`).join("");const refresh=()=>{$("#comboBuilderTotal").textContent=money(items.reduce((s,p)=>s+(comboPick[p.id]||0)*Number(p.price||0),0));list.querySelectorAll("[data-combo-qty]").forEach(x=>x.textContent=comboPick[x.dataset.comboQty]||0)};list.querySelectorAll("[data-combo-plus]").forEach(b=>b.onclick=()=>{comboPick[b.dataset.comboPlus]=(comboPick[b.dataset.comboPlus]||0)+1;refresh()});list.querySelectorAll("[data-combo-minus]").forEach(b=>b.onclick=()=>{comboPick[b.dataset.comboMinus]=Math.max(0,(comboPick[b.dataset.comboMinus]||0)-1);refresh()});refresh()}
$("#buildComboBtn").onclick=()=>{renderComboBuilder();$("#comboBuilderDialog").showModal()};
$("#addCustomCombo").onclick=()=>{const picks=Object.entries(comboPick).filter(([,q])=>q>0);if(!picks.length)return toast("Elige al menos un producto");picks.forEach(([id,qty])=>state.cart.push({product_id:id,qty,option_ids:[],note:"Combo personalizado"}));Object.keys(comboPick).forEach(k=>delete comboPick[k]);$("#comboBuilderDialog").close();updateCart();toast("Combo personalizado agregado")};
function renderCart(){const el=$("#cartItems");el.innerHTML=state.cart.map((i,n)=>{const p=state.products.find(x=>x.id===i.product_id);const opts=(i.option_ids||[]).map(id=>state.options.find(o=>o.id===id)?.name).filter(Boolean).join(" · ");return `<div class="cart-line"><div><b>${safe(p?.name)}</b><small>${safe(opts||"Sin extras")}${i.note?" · "+safe(i.note):""}</small><small>${money(itemUnitTotal(i))} c/u</small></div><div class="qty"><button data-less="${n}">−</button><strong>${i.qty}</strong><button data-more="${n}">+</button></div></div>`}).join("")||'<div class="empty">Tu pedido está vacío.</div>';$("#cartGrand").textContent=money(state.cart.reduce((a,i)=>a+itemUnitTotal(i)*i.qty,0));el.querySelectorAll("[data-more]").forEach(b=>b.onclick=()=>{state.cart[+b.dataset.more].qty++;renderCart();updateCart()});el.querySelectorAll("[data-less]").forEach(b=>b.onclick=()=>{const i=+b.dataset.less;if(--state.cart[i].qty<=0)state.cart.splice(i,1);renderCart();updateCart()})}
async function joinTable(){const name=$("#joinName").value.trim();if(!name)return toast("Escribe tu nombre");const {data,error}=await sb.rpc("join_table_public",{p_place:place,p_name:name});if(error)return toast(error.message);state.diner={...data,name};state.session={id:data.session_id};localStorage.setItem("d504_diner_"+place,JSON.stringify(state.diner));$("#dinerName").textContent=name;$("#joinDialog").close();await refreshDiners();toast("Te uniste a "+state.place.name)}
async function refreshDiners(){if(!state.session?.id)return;const {data}=await sb.rpc("get_table_diners_public",{p_session:state.session.id});const list=Array.isArray(data)?data:[];$("#diners").innerHTML=list.map(d=>`<span class="diner">${safe(d.name).slice(0,1).toUpperCase()}</span>`).join("");const label=state.place?.place_type==="COURT"?" jugador"+(list.length===1?"":"es"):state.place?.place_type==="DELIVERY"?" pedido"+(list.length===1?"":"s"):" comensal"+(list.length===1?"":"es");$("#dinerCount").textContent=list.length+label}
async function sendOrder(){if(!state.diner){$("#joinDialog").showModal();return}if(!state.cart.length)return toast("Agrega productos");const payload={session_id:state.session.id,diner_id:state.diner.diner_id,items:state.cart};const btn=$("#sendOrder");btn.disabled=true;btn.textContent="Enviando…";const {data,error}=await sb.rpc("place_order_public",{p_payload:payload});btn.disabled=false;btn.textContent="Enviar pedido";if(error)return toast(error.message);state.cart=[];updateCart();$("#cartDialog").close();toast("Pedido enviado")}
async function callStaff(reason){if(!state.diner){$("#joinDialog").showModal();return}const {error}=await sb.rpc("call_staff_public",{p_payload:{session_id:state.session.id,diner_id:state.diner.diner_id,reason}});toast(error?error.message:"Solicitud enviada")}
function heroProducts(){const ids=state.heroSlides.filter(x=>x.channel===state.place.place_type).map(x=>x.product_id).filter(Boolean);const slides=ids.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);return slides.length?slides:state.products.filter(p=>p.featured&&p.image_url).slice(0,10)}
function renderPromosLegacy(){const list=heroProducts();if(!list.length)return;const p=list[state.heroIndex%list.length];$("#promoHero").innerHTML=`<article class="hero-product" data-hero-product="${p.id}"><img src="${p.image_url}"><div class="promo-copy"><small>${p.brand_id==="LB"?"LA BANDEJA":"BEER STATION"}</small><h2>${safe(p.name)}</h2><p>${safe(p.description||"")}</p><b>${money(p.price)}</b></div></article>`;$("#promoHero").onclick=()=>openProduct(p.id);$("#promoDots").innerHTML=list.map((_,i)=>`<button class="${i===state.heroIndex?"active":""}" data-dot="${i}"></button>`).join("");$("#promoDots").querySelectorAll("[data-dot]").forEach(d=>d.onclick=e=>{e.stopPropagation();state.heroIndex=+d.dataset.dot;renderPromos()})}
function nextPromoLegacy(){const list=heroProducts();if(!list.length)return;state.heroIndex=(state.heroIndex+1)%list.length;renderPromos()}
function openPromotionLegacy(id){const pr=state.promos.find(p=>p.id===id);if(!pr)return;const ids=state.promoLinks.filter(x=>x.promotion_id===id).map(x=>x.product_id);const list=ids.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);$("#promoDialogType").textContent=(pr.promo_type||"PROMOCIÓN").replace("_"," ");$("#promoDialogTitle").textContent=pr.title;$("#promoDialogSubtitle").textContent=pr.subtitle||"";$("#promoProducts").innerHTML=list.length?list.map(p=>`<article class="promo-product" data-promo-product="${p.id}"><img src="${p.image_url||""}"><div><b>${safe(p.name)}</b><span>${money(p.price)}</span></div></article>`).join(""):'<div class="empty">Sin productos vinculados.</div>';$("#promoProducts").querySelectorAll("[data-promo-product]").forEach(x=>x.onclick=()=>{$("#promoDialog").close();openProduct(x.dataset.promoProduct)});$("#promoDialog").showModal()}
function renderPromoGridLegacy(){const el=$("#promoGrid");const list=state.promos.filter(p=>p.promo_type&&p.promo_type!=="GENERAL").slice(0,10);el.innerHTML=list.map(p=>`<article class="promo-card" data-promo="${p.id}"><img src="${p.image_url}"><div><small>${safe(p.promo_type.replace("_"," "))}</small><b>${safe(p.title)}</b><span>${safe(p.subtitle||"")}</span></div></article>`).join("");el.querySelectorAll("[data-promo]").forEach(x=>x.onclick=()=>openPromotion(x.dataset.promo));let i=0;clearInterval(window.__promoCardsTimer);window.__promoCardsTimer=setInterval(()=>{if(el.children.length<2)return;i=(i+1)%el.children.length;el.scrollTo({left:el.children[i].offsetLeft-16,behavior:"smooth"})},3200)}
let __searchTimer=null;$("#search").oninput=()=>{clearTimeout(__searchTimer);__searchTimer=setTimeout(runGlobalSearch,180)};$("#cartDock").onclick=()=>{renderCart();$("#cartDialog").showModal()};$("#cartTop").onclick=()=>{renderCart();$("#cartDialog").showModal()};$("#joinButton").onclick=joinTable;$("#sendOrder").onclick=sendOrder;$("#bellButton").onclick=()=>$("#serviceDialog").showModal();document.querySelectorAll("[data-service]").forEach(b=>b.onclick=()=>{callStaff(b.dataset.service);$("#serviceDialog").close()});document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
$("#ratingStars").querySelectorAll("[data-rating]").forEach(b=>b.onclick=()=>{feedbackRating=Number(b.dataset.rating);$("#ratingStars").querySelectorAll("button").forEach(x=>x.classList.toggle("active",Number(x.dataset.rating)<=feedbackRating))});
$("#sendFeedback").onclick=async()=>{if(!feedbackRating)return toast("Selecciona una calificación");const {error}=await sb.rpc("submit_feedback_public",{p_payload:{place_code:place,session_id:state.session?.id||"",diner_id:state.diner?.diner_id||"",rating:feedbackRating,comment:$("#feedbackComment").value.trim()}});if(error)return toast(error.message);$("#feedbackComment").value="";toast("Gracias por tu opinión")};
$("#backToTop").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});init();

function visualClass(p){
 const coldCats=new Set(["cervezas","cubetazos","cocktails","mocktails","vinos","tequila","ron","whiskey","vodka","gin","daiquiris"]);
 const hotCats=new Set(["hotdogs","hamburguesas","pizzas","fried","papas","entradas","compartir","especialidades","combos"]);
 const portraitIds=new Set(["bs-073","bs-074","bs-075","bs-001","bs-002","bs-003","bs-004"]);
 const cold=p.brand_id==="BS"&&coldCats.has(p.category_id),hot=hotCats.has(p.category_id)||String(p.category_id||"").startsWith("court-");
 return [cold?"cold":"",hot?"hot":"",portraitIds.has(p.id)?"fit-contain":""].filter(Boolean).join(" ");
}
function productCardV2(p){const cls=visualClass(p);return '<article class="product '+cls+'" data-open="'+p.id+'"><div class="product-media"><img loading="lazy" decoding="async" src="'+(p.image_url||'')+'" alt="'+safe(p.name)+'" width="640" height="640"><span class="brand-mark">'+safe(p.badge||(p.brand_id==='LB'?'LA BANDEJA':p.brand_id==='BS'?'BEER STATION':'COMBO'))+'</span><button class="quick-add" data-open="'+p.id+'" aria-label="Abrir">+</button></div><div class="product-body"><h3>'+safe(p.name)+'</h3><p>'+safe(p.description||'')+'</p><footer><b>'+money(p.price)+'</b></footer></div></article>'}
function bindCardsV2(root){root.querySelectorAll('[data-open]').forEach(function(x){x.onclick=function(e){e.stopPropagation();openProduct(x.dataset.open)}})}
function setupExperience(){const intro=$("#experienceIntro"),p=state.place;if(!p.intro_enabled){intro.classList.add("done");return}intro.dataset.style=(p.intro_style||"FURY").toUpperCase();intro.style.setProperty("--intro-speed",Number(p.intro_speed_ms||420)+"ms");intro.style.setProperty("--intro-duration",Number(p.intro_duration_ms||2400)+"ms");const list=heroProducts().slice(0,5);$("#introSlides").innerHTML=list.map(function(x,i){return '<figure class="intro-slide '+(i?'':'active')+'"><img src="'+x.image_url+'" alt="" decoding="async" '+(i?'loading="lazy"':'fetchpriority="high"')+'></figure>'}).join("");let i=0,els=[...intro.querySelectorAll(".intro-slide")],speed=Math.max(220,Number(p.intro_speed_ms||420));const timer=setInterval(function(){if(els.length<2)return;els[i].classList.remove("active");i=(i+1)%els.length;els[i].classList.add("active")},speed);setTimeout(function(){clearInterval(timer);intro.classList.add("done")},Math.max(1200,Number(p.intro_duration_ms||2400)))}
function renderPromos(){const list=heroProducts();if(!list.length)return;const p=list[state.heroIndex%list.length],v=visualClass(p),smoke=state.place.smoke_enabled!==false&&v.includes("hot")?'<div class="steam-layer"></div>':v.includes("cold")?'<div class="cold-mist"></div>':"";$("#heroAmbient").innerHTML='<article class="cinema-slide '+v+'" data-hero="'+p.id+'"><img fetchpriority="high" decoding="async" src="'+p.image_url+'"><div class="cinema-shade"></div><div class="cinema-copy"><small>'+(p.brand_id==='LB'?'LA BANDEJA':p.brand_id==='BS'?'BEER STATION':'LA BANDEJA + BEER STATION')+'</small><h1>'+safe(p.name)+'</h1><p>'+safe(p.description||'')+'</p><b>'+money(p.price)+'</b></div>'+smoke+'</article>';$("#heroAmbient [data-hero]").onclick=function(){openProduct(p.id)};$("#heroDots").innerHTML=list.map(function(_,i){return '<button class="'+(i===state.heroIndex?'active':'')+'" data-hdot="'+i+'"></button>'}).join("");$("#heroDots").querySelectorAll("[data-hdot]").forEach(function(b){b.onclick=function(){state.heroIndex=+b.dataset.hdot;renderPromos()}})}
function nextPromo(){const list=heroProducts();if(list.length<2)return;state.heroIndex=(state.heroIndex+1)%list.length;renderPromos()}
function renderProducts(){const list=state.products.filter(function(p){return p.category_id===state.activeCategory});$('#products').innerHTML=list.length?list.map(productCardV2).join(''):'<div class="empty">Sin productos disponibles.</div>';bindCardsV2($('#products'))}
function openPromotion(id){const pr=state.promos.find(function(p){return p.id===id});if(!pr)return;const ids=state.promoLinks.filter(function(x){return x.promotion_id===id}).map(function(x){return x.product_id});const list=ids.map(function(id){return state.products.find(function(p){return p.id===id})}).filter(Boolean);$('#promoDialogType').textContent=(pr.promo_type||'PROMOCIÓN').replace('_',' ');$('#promoDialogTitle').textContent=pr.title;$('#promoDialogSubtitle').textContent=pr.subtitle||'';$('#promoProducts').innerHTML=list.length?list.map(productCardV2).join(''):'<div class="empty">Sin productos disponibles.</div>';bindCardsV2($('#promoProducts'));$('#promoDialog').showModal()}
function renderHomeSectionsV2(){
 const fresh=state.products.filter(function(p){return ['bs-073','bs-074','bs-075','lb-030'].includes(p.id)||p.badge==='NUEVO'});
 const combos=state.products.filter(function(p){return p.category_id===(state.place.place_type==='COURT'?'court-combos':'combos')});
 [['#newProducts','#newSection',fresh],['#comboProducts','#comboSection',combos]].forEach(function(x){
   const el=$(x[0]);$(x[1]).classList.toggle('hidden',!x[2].length);el.innerHTML=x[2].map(productCardV2).join('');bindCardsV2(el);
 });
 renderDrinkSection();
}
function renderDrinkSection(){
 const drinkIds=new Set(['cervezas','cocktails','mocktails','vinos','tequila','ron','whiskey','vodka','gin','daiquiris']);
 const available=state.categories.filter(function(c){return c.brand_id==='BS'&&drinkIds.has(c.id)&&state.products.some(p=>p.category_id===c.id)});
 const section=$('#drinkSection'),nav=$('#drinkCategories');
 section.classList.toggle('hidden',!available.length);
 if(!available.length)return;
 nav.innerHTML=available.map(function(c){
   const list=state.products.filter(p=>p.category_id===c.id);
   const cover=c.image_url||list.find(p=>p.image_url)?.image_url||'';
   return '<button class="category-tile drink-category-tile" data-drink-cat="'+c.id+'" style="--cat-bg:url(\''+cover+'\')"><span>'+safe(c.name)+'</span></button>';
 }).join('');
 nav.querySelectorAll('[data-drink-cat]').forEach(function(b){b.onclick=function(){
   const c=available.find(x=>x.id===b.dataset.drinkCat);if(!c)return;
   const drinks=state.products.filter(p=>p.category_id===c.id);
   openCatalog(c.name,drinks,'BEER STATION');
 }});
}
function openCatalog(title,list,kicker){
 const dlg=$('#catalogDialog'),grid=$('#catalogProducts');
 $('#catalogKicker').textContent=kicker||'CATÁLOGO';
 $('#catalogTitle').textContent=title;
 $('#catalogCount').textContent=list.length+' producto'+(list.length===1?'':'s');
 grid.innerHTML=list.length?list.map(productCardV2).join(''):'<div class="empty">Sin resultados.</div>';
 grid.querySelectorAll('[data-open]').forEach(function(x){x.onclick=function(e){
   e.stopPropagation();dlg.close();openProduct(x.dataset.open);
 }});
 if(!dlg.open)dlg.showModal();
}
function runGlobalSearch(){
 const input=$('#search'),q=input.value.trim().toLowerCase(),dlg=$('#catalogDialog');
 if(!q){if(dlg.open&&$('#catalogKicker').textContent==='RESULTADOS')dlg.close();return}
 if(q.length<2)return;
 const list=state.products.filter(function(p){
   const category=state.categories.find(c=>c.id===p.category_id)?.name||'';
   return (p.name+' '+(p.description||'')+' '+category).toLowerCase().includes(q);
 });
 openCatalog('Resultados para “'+input.value.trim()+'”',list,'RESULTADOS');
}
function renderPromoGrid(){
 const el=$("#promoGrid");
 if(state.place.place_type==="COURT"){
  const firstImg=cats=>state.products.find(p=>cats.includes(p.category_id)&&p.image_url)?.image_url||"/assets/new/court-stadium.jpg";
  const promos=[
   {key:"potra",title:"LA POTRA",subtitle:"Para compartir entre todos después del partido.",tag:"PROMO DE CANCHA",cats:["court-pupusas","court-tacos","court-pastelitos"],image_url:firstImg(["court-pupusas","court-tacos"])},
   {key:"roja",title:"ROJA DEL ÁRBITRO",subtitle:"Lo más intenso para cuando el partido se calienta.",tag:"PICANTE",cats:["court-chilis","court-tajadas","court-hotdogs"],image_url:firstImg(["court-chilis","court-tajadas"])},
   {key:"champions",title:"NOCHE DE CHAMPIONS",subtitle:"Hamburguesas, hot dogs y cerveza para partido grande.",tag:"NOCHE DE FÚTBOL",cats:["hamburguesas","court-hotdogs","cervezas"],image_url:firstImg(["hamburguesas","court-hotdogs"])},
   {key:"tercer",title:"TERCER TIEMPO",subtitle:"Cervezas, frescos y frozen para cerrar la jugada.",tag:"DESPUÉS DEL PARTIDO",cats:["cervezas","mocktails","daiquiris"],image_url:firstImg(["cervezas","daiquiris"])}
  ];
  el.innerHTML=promos.map(p=>'<article class="promo-card" data-court-promo="'+p.key+'"><img loading="lazy" decoding="async" src="'+p.image_url+'" width="820" height="460"><div><small>'+safe(p.tag)+'</small><b>'+safe(p.title)+'</b><span>'+safe(p.subtitle)+'</span></div></article>').join("");
  el.querySelectorAll("[data-court-promo]").forEach(x=>x.onclick=()=>{const p=promos.find(z=>z.key===x.dataset.courtPromo);openCatalog(p.title,state.products.filter(prod=>p.cats.includes(prod.category_id)),"PROMOCIONES DE CANCHA")});
  $("#promoSection").classList.remove("hidden");
  return;
 }
 const list=state.promos.slice(0,10);$("#promoSection").classList.toggle("hidden",!list.length);
 el.innerHTML=list.map(function(p){return '<article class="promo-card" data-promo="'+p.id+'"><img loading="lazy" decoding="async" src="'+(p.image_url||'')+'" width="820" height="460"><div><small>'+safe((p.promo_type||"PROMO").replace("_"," "))+'</small><b>'+safe(p.title)+'</b><span>'+safe(p.subtitle||"")+'</span></div></article>'}).join("");
 el.querySelectorAll("[data-promo]").forEach(function(x){x.onclick=function(){openPromotion(x.dataset.promo)}});
 renderHomeSectionsV2();
}
if($('#seeDrinks'))$('#seeDrinks').onclick=function(){const c=state.categories.find(function(c){return ['daiquiris','cervezas','cocktails','mocktails'].includes(c.id)});if(c){state.activeCategory=c.id;renderCategories();renderProducts();document.querySelector('.menu-section').scrollIntoView({behavior:'smooth'})}};
if($('#backToPromos'))$('#backToPromos').onclick=function(){$('#promoSection').scrollIntoView({behavior:'smooth'})};
document.querySelectorAll('[data-service-end]').forEach(function(b){b.onclick=function(){callStaff(b.dataset.serviceEnd)}});

let __aiSuggestionSeq=0; let recHistory={recommended:[],viewed:[],openedFromAI:null};
function aiProduct(p){
 return {id:p.id,name:p.name,price:Number(p.price||0),category:p.category_id,brand:p.brand_id,description:String(p.description||"").slice(0,180)};
}
function aiCart(){
 return state.cart.map(i=>{const p=state.products.find(x=>x.id===i.product_id);return p?{...aiProduct(p),qty:i.qty}:null}).filter(Boolean).slice(0,20);
}
function aiCatalog(){return state.products.map(aiProduct)}
function aiCandidates(selected){
 const seen=new Set(selected?[selected.id]:[]),out=[];
 state.cart.forEach(x=>seen.add(x.product_id));
 recHistory.recommended.forEach(id=>seen.add(id));
 const add=p=>{if(p&&!seen.has(p.id)){seen.add(p.id);out.push(aiProduct(p))}};
 const combos=state.products.filter(p=>String(p.category_id||"").includes("combos"));
 const drinks=new Set(["cervezas","cocktails","mocktails","vinos","tequila","ron","whiskey","vodka","gin","daiquiris"]);
 const cartProducts=state.cart.map(i=>state.products.find(x=>x.id===i.product_id)).filter(Boolean);
 const hasDrink=cartProducts.some(p=>p.brand_id==="BS"&&drinks.has(p.category_id));
 const hasFood=cartProducts.some(p=>!(p.brand_id==="BS"&&drinks.has(p.category_id)));
 if(selected?.brand_id==="LB"&&!hasDrink)state.products.filter(p=>p.brand_id==="BS"&&drinks.has(p.category_id)).forEach(add);
 else if(selected?.brand_id==="BS"&&!hasFood)state.products.filter(p=>p.brand_id==="LB"||p.brand_id==="MIX").forEach(add);
 combos.forEach(add);
 state.products.filter(p=>p.featured).forEach(add);
 state.products.forEach(add);
 return out.slice(0,45);
}
function aiOptionsFor(productId){
 const groupIds=state.links.filter(x=>x.product_id===productId).map(x=>x.group_id);
 return state.options.filter(o=>groupIds.includes(o.group_id)).map(o=>({name:o.name,price_delta:Number(o.price_delta||0)})).slice(0,25);
}
async function askMenuAI(payload){
 const r=await fetch("/api/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
 if(!r.ok)throw new Error("AI "+r.status);
 return r.json();
}

async function requestProductSuggestion(p){
 const box=$("#aiSuggestion"),text=$("#aiSuggestionText"),actions=$("#aiSuggestionActions");
 const cameFromAI=recHistory.recommended.includes(p.id); const seq=++__aiSuggestionSeq;box.classList.remove("hidden");box.classList.add("loading");text.textContent=cameFromAI?"Revisando cómo queda con tu pedido…":"Pensando en qué combina mejor…";actions.innerHTML="";
 try{
  const data=await askMenuAI({mode:"product",message:cameFromAI?"Este producto fue abierto desde una recomendación anterior. Confirma si combina con el pedido y no inicies otra cadena de recomendaciones.":"Recomienda algo útil considerando también el pedido actual.",selected:Object.assign(aiProduct(p),{opened_from_ai:cameFromAI}),options:aiOptionsFor(p.id),cart:aiCart(),candidates:aiCandidates(p),catalog:aiCatalog(),place:{code:state.place.code,name:state.place.name,type:state.place.place_type}});
  if(seq!==__aiSuggestionSeq||state.current?.id!==p.id)return;
  text.textContent=data.message||"";
  actions.innerHTML=cameFromAI?"":(data.recommendations||[]).map(r=>{const rp=state.products.find(x=>x.id===r.id);if(rp&&!recHistory.recommended.includes(rp.id))recHistory.recommended.push(rp.id);return rp?'<button type="button" data-ai-open="'+rp.id+'"><span>'+safe(rp.name)+'</span><small>'+safe(r.reason||money(rp.price))+'</small></button>':""}).join("");
  actions.querySelectorAll("[data-ai-open]").forEach(b=>b.onclick=()=>{recHistory.openedFromAI=b.dataset.aiOpen;$("#productDialog").close();openProduct(b.dataset.aiOpen)});
  box.classList.remove("loading");box.classList.toggle("hidden",!text.textContent&&!actions.children.length);
 }catch{
  if(seq===__aiSuggestionSeq){box.classList.add("hidden");box.classList.remove("loading")}
 }
}

async function sendProductAIReply(message){
 const p=state.current;if(!p||!message)return;
 const text=$("#aiSuggestionText"),actions=$("#aiSuggestionActions");
 text.textContent="Pensando…";actions.innerHTML="";
 try{
  const data=await askMenuAI({mode:"product",message:"El cliente responde dentro de la ficha del producto: "+message+". Continúa la misma conversación, considera el carrito completo y evita ciclos de recomendaciones.",selected:Object.assign(aiProduct(p),{opened_from_ai:recHistory.recommended.includes(p.id)}),options:aiOptionsFor(p.id),cart:aiCart(),candidates:aiCandidates(p),catalog:aiCatalog(),place:{code:state.place.code,name:state.place.name,type:state.place.place_type}});
  text.textContent=data.message||"";
  actions.innerHTML=(data.recommendations||[]).map(r=>{const rp=state.products.find(x=>x.id===r.id);if(!rp||recHistory.recommended.includes(rp.id))return "";recHistory.recommended.push(rp.id);return '<button type="button" data-ai-open="'+rp.id+'"><span>'+safe(rp.name)+'</span><small>'+safe(r.reason||money(rp.price))+'</small></button>'}).join("");
  actions.querySelectorAll("[data-ai-open]").forEach(b=>b.onclick=()=>{$("#productDialog").close();openProduct(b.dataset.aiOpen)});
 }catch{text.textContent="Ahorita no pude responderte. Intenta otra vez."}
}
$("#productAiForm").onsubmit=e=>{e.preventDefault();const input=$("#productAiInput"),q=input.value.trim();if(!q)return;input.value="";sendProductAIReply(q)};
document.querySelectorAll("[data-ai-reply]").forEach(b=>b.onclick=()=>sendProductAIReply(b.dataset.aiReply));

function addAIMessage(role,html){
 const el=document.createElement("div");el.className="ai-msg "+role;el.innerHTML=html;$("#aiMessages").append(el);$("#aiMessages").scrollTop=$("#aiMessages").scrollHeight;return el;
}
$("#aiFab").onclick=()=>$("#aiDialog").showModal();
$("#aiForm").onsubmit=async e=>{
 e.preventDefault();const input=$("#aiInput"),q=input.value.trim();if(!q)return;
 addAIMessage("user",safe(q));input.value="";
 const wait=addAIMessage("assistant","Pensando…");
 try{
  const data=await askMenuAI({mode:"cart",message:"Analiza mi pedido completo. "+q,selected:null,options:[],cart:aiCart(),candidates:aiCandidates(null),catalog:aiCatalog(),place:{code:state.place.code,name:state.place.name,type:state.place.place_type}});
  wait.innerHTML=safe(data.message||"");
  (data.recommendations||[]).forEach(r=>{const p=state.products.find(x=>x.id===r.id);if(!p)return;if(!recHistory.recommended.includes(p.id))recHistory.recommended.push(p.id);const b=document.createElement("button");b.className="ai-chat-rec";b.innerHTML="<b>"+safe(p.name)+"</b><small>"+safe(r.reason||money(p.price))+"</small>";b.onclick=()=>{$("#cartDialog").close();openProduct(p.id)};wait.append(b)});
 }catch{wait.textContent="Ahorita no pude conectarme. Intenta de nuevo en un momento."}
};
