const { createClient } = window.supabase;
const sb=createClient("https://cnynfycmvmcjzaevhvmw.supabase.co","sb_publishable_9Du-_m5etaGt-vCBkDvROw_-0sdB_jT");
const $=s=>document.querySelector(s),safe=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)};
const state={tab:"dashboard",brands:[],categories:[],products:[],productChannels:[],heroSlides:[],promotions:[],promoLinks:[],groups:[],options:[],links:[],places:[],orders:[],calls:[],feedback:[],receivables:[],customers:[],suppliers:[],employees:[],purchases:[],purchaseItems:[],expenses:[],payables:[],payablePayments:[],inventory:[],inventoryMovements:[],measureUnits:[],inventoryItems:[],presentations:[],ingredientStock:[],recipes:[],recipeItems:[],costHistory:[],wasteRecords:[],productionBatches:[]};
async function boot(){try{await sb.auth.signOut()}catch{} $("#adminView").classList.remove("hidden");await loadAll();render()}
function showAuth(){$("#adminView").classList.remove("hidden")}
async function enter(){$("#adminView").classList.remove("hidden");await loadAll();render()}
async function loadAll(){const [b,c,p,pch,hs,pr,ppr,g,o,l,pl,ord,calls,fb,ar,cu,su,em,pu,pi,ex,pa,pp,inv,im,mu,ii,ipr,ist,rc,ri,ch,wr,pb]=await Promise.all([
 sb.from("brands").select("*").order("sort_order"),sb.from("categories").select("*").order("sort_order"),sb.from("products").select("*").order("sort_order"),sb.from("product_channels").select("*").order("sort_order"),sb.from("hero_slides").select("*").order("channel").order("sort_order"),
 sb.from("promotions").select("*").order("sort_order"),sb.from("promotion_products").select("*").order("sort_order"),sb.from("option_groups").select("*").order("sort_order"),sb.from("options").select("*").order("sort_order"),
 sb.from("product_option_groups").select("*").order("sort_order"),sb.from("places").select("*").order("sort_order"),
 sb.from("orders").select("*,diners(display_name),order_items(*),table_sessions(place_code,places(name,place_type))").order("created_at",{ascending:false}).limit(60),
 sb.from("service_calls").select("*").order("created_at",{ascending:false}).limit(60),sb.from("feedback").select("*").order("created_at",{ascending:false}).limit(100),sb.rpc("get_accounts_receivable_public"),
 sb.from("customers").select("*").order("name"),sb.from("suppliers").select("*").order("name"),sb.from("employees").select("*").order("name"),
 sb.from("purchases").select("*").order("purchase_date",{ascending:false}),sb.from("purchase_items").select("*"),
 sb.from("expenses").select("*").order("expense_date",{ascending:false}),sb.from("payables").select("*").order("created_at",{ascending:false}),
 sb.from("payable_payments").select("*").order("created_at",{ascending:false}),sb.from("inventory_stock").select("*"),sb.from("inventory_movements").select("*").order("created_at",{ascending:false}).limit(200),
 sb.from("measure_units").select("*").order("dimension").order("factor_to_reference"),sb.from("inventory_items").select("*").order("name"),sb.from("item_presentations").select("*").order("name"),sb.from("inventory_item_stock").select("*"),sb.from("recipes").select("*"),sb.from("recipe_items").select("*").order("sort_order"),sb.from("item_cost_history").select("*").order("recorded_at",{ascending:false}).limit(300),sb.from("waste_records").select("*").order("created_at",{ascending:false}).limit(200),sb.from("production_batches").select("*").order("created_at",{ascending:false}).limit(100)
]);Object.assign(state,{brands:b.data||[],categories:c.data||[],products:p.data||[],productChannels:pch.data||[],heroSlides:hs.data||[],promotions:pr.data||[],promoLinks:ppr.data||[],groups:g.data||[],options:o.data||[],links:l.data||[],places:pl.data||[],orders:ord.data||[],calls:calls.data||[],feedback:fb.data||[],receivables:Array.isArray(ar.data)?ar.data:[],customers:cu.data||[],suppliers:su.data||[],employees:em.data||[],purchases:pu.data||[],purchaseItems:pi.data||[],expenses:ex.data||[],payables:pa.data||[],payablePayments:pp.data||[],inventory:inv.data||[],inventoryMovements:im.data||[],measureUnits:mu.data||[],inventoryItems:ii.data||[],presentations:ipr.data||[],ingredientStock:ist.data||[],recipes:rc.data||[],recipeItems:ri.data||[],costHistory:ch.data||[],wasteRecords:wr.data||[],productionBatches:pb.data||[]})}
function syncNavigation(){
 const nav=$("#tabs");if(!nav)return;
 nav.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===state.tab));
 nav.querySelectorAll(".nav-group").forEach(g=>{
   const name=g.dataset.group;
   const active=name===state.tab||(name==="config"&&["combos","banners","promotions","extras","branding","places","orders","feedback"].includes(state.tab));
   g.classList.toggle("active-group",active);
   if(active)g.classList.add("open");
 });
 nav.querySelectorAll("[data-nav-tab]").forEach(b=>{
   let active=b.dataset.navTab===state.tab;
   if(active&&b.dataset.purchaseView)active=state.purchaseView===b.dataset.purchaseView;
   if(active&&b.dataset.prodView)active=state.prodView===b.dataset.prodView;
   if(active&&b.dataset.catalogView)active=state.catalogView===b.dataset.catalogView;
   b.classList.toggle("active",active);
 });
}
function navigateAdmin(tab,opts={}){
 state.tab=tab;
 if(opts.purchaseView)state.purchaseView=opts.purchaseView;
 if(opts.prodView)state.prodView=opts.prodView;
 if(opts.catalogView)state.catalogView=opts.catalogView;
 syncNavigation();
 render();
 if(window.innerWidth<=860){$("#sidebar")?.classList.remove("mobile-open");$("#sidebarBackdrop")?.classList.remove("show")}
 window.scrollTo({top:0,behavior:"smooth"});
}
$("#tabs").querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>navigateAdmin(b.dataset.tab));
$("#tabs").querySelectorAll("[data-nav-tab]").forEach(b=>b.onclick=()=>navigateAdmin(b.dataset.navTab,{purchaseView:b.dataset.purchaseView,prodView:b.dataset.prodView,catalogView:b.dataset.catalogView}));
$("#tabs").querySelectorAll("[data-group-toggle]").forEach(b=>b.onclick=()=>{const g=b.closest(".nav-group");g.classList.toggle("open")});
$("#sidebarCollapse")?.addEventListener("click",()=>document.body.classList.toggle("sidebar-collapsed"));
$("#mobileMenu")?.addEventListener("click",()=>$("#tabs")?.classList.toggle("mobile-open"));
function openSearch(){
 const p=$("#searchPalette"),i=$("#globalSearchInput");if(!p)return;p.hidden=false;document.body.classList.add("search-open");setTimeout(()=>i?.focus(),30);renderGlobalSearch("");
}
function closeSearch(){const p=$("#searchPalette");if(!p)return;p.hidden=true;document.body.classList.remove("search-open")}
function renderGlobalSearch(q){
 const box=$("#searchResults");if(!box)return;
 const term=String(q||"").trim().toLowerCase();
 const modules=[["dashboard","Dashboard"],["sales","Ventas"],["purchases","Compras"],["expenses","Gastos"],["inventory","Inventario"],["production","Producción"],["receivables","Cuentas por cobrar"],["payables","Cuentas por pagar"],["employees","Empleados"],["catalog","Catálogo"],["reports","Reportes"],["places","Ubicaciones"]];
 let rows=modules.filter(x=>!term||x[1].toLowerCase().includes(term)).slice(0,5).map(x=>({kind:"Módulo",title:x[1],sub:"Abrir módulo",tab:x[0]}));
 if(term){
  rows.push(...state.products.filter(x=>String(x.name||"").toLowerCase().includes(term)).slice(0,5).map(x=>({kind:"Producto",title:x.name,sub:"Catálogo de productos",tab:"catalog",catalogView:"products"})));
  rows.push(...state.customers.filter(x=>String(x.name||"").toLowerCase().includes(term)).slice(0,4).map(x=>({kind:"Cliente",title:x.name,sub:x.phone||"Cliente",tab:"catalog",catalogView:"customers"})));
 }
 box.innerHTML=rows.length?rows.map((x,i)=>'<button data-search-index="'+i+'"><span>'+safe(x.kind)+'</span><b>'+safe(x.title)+'</b><small>'+safe(x.sub)+'</small></button>').join(""):'<div class="search-empty">Sin resultados</div>';
 box.querySelectorAll("[data-search-index]").forEach(b=>b.onclick=()=>{const x=rows[Number(b.dataset.searchIndex)];closeSearch();navigateAdmin(x.tab,{catalogView:x.catalogView})});
}
$("#globalSearchBtn")?.addEventListener("click",openSearch);
$("#closeSearch")?.addEventListener("click",closeSearch);
$("#globalSearchInput")?.addEventListener("input",e=>renderGlobalSearch(e.target.value));
$("#searchPalette")?.addEventListener("click",e=>{if(e.target.id==="searchPalette")closeSearch()});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch()}if(e.key==="Escape")closeSearch()});
syncNavigation();
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());

function toolbar(title,eyebrow="ADMINISTRACIÓN",button=""){ $("#sectionTitle").textContent=title;$("#sectionEyebrow").textContent=eyebrow;$("#toolbarActions").innerHTML=button}
function renderLegacy(){if(state.tab==="products")renderProducts();if(state.tab==="categories")renderCategories();if(state.tab==="banners")renderBanners();if(state.tab==="promotions")renderPromotions();if(state.tab==="extras")renderExtras();if(state.tab==="branding")renderBranding();if(state.tab==="places")renderPlaces();if(state.tab==="orders")renderOrders();if(state.tab==="receivables")renderReceivables();if(state.tab==="feedback")renderFeedback()}
function renderProducts(){toolbar("Productos","CATÁLOGO",'<button id="newProduct">+ Nuevo producto</button>');$("#content").innerHTML='<div class="grid">'+state.products.map(p=>`<article class="card"><img src="${p.image_url||""}"><span class="tag">${safe(state.categories.find(c=>c.id===p.category_id)?.name||"Sin categoría")}</span><h3>${safe(p.name)}</h3><p>${safe(p.description||"")}</p><div class="card-footer"><b>L ${Number(p.price).toFixed(2)}</b><button class="edit" data-edit-product="${p.id}">Editar</button></div></article>`).join("")+"</div>";$("#newProduct").onclick=()=>editProduct();$("#content").querySelectorAll("[data-edit-product]").forEach(b=>b.onclick=()=>editProduct(b.dataset.editProduct))}
function productForm(p={}){return `<h2>${p.id?"Editar":"Nuevo"} producto</h2><div class="form-grid">
<label>Nombre<input name="name" value="${safe(p.name||"")}" required></label><label>Precio<input name="price" type="number" step=".01" value="${p.price??0}" required></label>
<label>Marca<select name="brand_id">${state.brands.map(b=>`<option value="${b.id}" ${p.brand_id===b.id?"selected":""}>${safe(b.name)}</option>`).join("")}</select></label>
<label>Categoría<select name="category_id">${state.categories.map(c=>`<option value="${c.id}" ${p.category_id===c.id?"selected":""}>${safe(c.name)}</option>`).join("")}</select></label>
<label class="wide">Descripción<textarea name="description">${safe(p.description||"")}</textarea></label>
<label class="wide">Imagen URL<input name="image_url" value="${safe(p.image_url||"")}"><span class="upload-note">O sube una imagen abajo.</span></label>
<label class="wide">Subir imagen<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp"></label>
<label class="wide">Visible en<div class="channel-checks"><label><input type="checkbox" name="channels" value="TABLE" ${!p.id||state.productChannels.some(x=>x.product_id===p.id&&x.channel==="TABLE")?"checked":""}> Mesas</label><label><input type="checkbox" name="channels" value="COURT" ${!p.id||state.productChannels.some(x=>x.product_id===p.id&&x.channel==="COURT")?"checked":""}> Canchas</label><label><input type="checkbox" name="channels" value="DELIVERY" ${!p.id||state.productChannels.some(x=>x.product_id===p.id&&x.channel==="DELIVERY")?"checked":""}> Delivery</label></div></label>
<label>Arma tu equipo<select name="team_enabled"><option value="false" ${!p.team_enabled?"selected":""}>No</option><option value="true" ${p.team_enabled?"selected":""}>Sí</option></select></label><label>Unidades de orden normal<input name="team_pack_size" type="number" min="1" value="${p.team_pack_size??1}"></label><label>Nombre de unidad<input name="team_unit_label" value="${safe(p.team_unit_label||"unidad")}"></label><label>Permitir unidad individual<select name="team_allow_split"><option value="false" ${!p.team_allow_split?"selected":""}>No</option><option value="true" ${p.team_allow_split?"selected":""}>Sí</option></select></label><label>Orden en Arma tu equipo<input name="team_sort_order" type="number" value="${p.team_sort_order??0}"></label>
<label>Orden<input name="sort_order" type="number" value="${p.sort_order??0}"></label><label>Destacado<select name="featured"><option value="false">No</option><option value="true" ${p.featured?"selected":""}>Sí</option></select></label><label>Activo<select name="active"><option value="true" ${p.active!==false?"selected":""}>Sí</option><option value="false" ${p.active===false?"selected":""}>No</option></select></label>
</div><div class="form-actions">${p.id?'<button type="button" class="danger" id="deleteProduct">Eliminar</button>':""}<button class="primary">Guardar</button></div>`}
async function optimizeImage(file){if(!file?.type?.startsWith("image/")||file.type==="image/gif")return file;try{const bmp=await createImageBitmap(file),max=1600,scale=Math.min(1,max/Math.max(bmp.width,bmp.height)),w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale)),canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;canvas.getContext("2d").drawImage(bmp,0,0,w,h);const blob=await new Promise(res=>canvas.toBlob(res,"image/webp",.8));bmp.close();return blob||file}catch{return file}}
async function uploadImage(file,folder){if(!file)return null;const optimized=await optimizeImage(file),base=file.name.replace(/\.[^.]+$/,"").replace(/[^a-zA-Z0-9._-]/g,"_"),ext=optimized.type==="image/webp"?".webp":(file.name.match(/\.[^.]+$/)?.[0]||"");const path=`${folder}/${Date.now()}-${base}${ext}`;const {error}=await sb.storage.from("menu-media").upload(path,optimized,{upsert:false,contentType:optimized.type||file.type});if(error)throw error;return sb.storage.from("menu-media").getPublicUrl(path).data.publicUrl}
async function editProduct(id){const p=id?state.products.find(x=>x.id===id):{};const f=$("#editForm");f.innerHTML=productForm(p);$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f);let image=fd.get("image_url");const file=fd.get("image_file");try{if(file?.size)image=await uploadImage(file,"products");const row={id:p.id||("p-"+Date.now()),name:fd.get("name"),price:Number(fd.get("price")),brand_id:fd.get("brand_id"),category_id:fd.get("category_id"),description:fd.get("description"),image_url:image,team_enabled:fd.get("team_enabled")==="true",team_pack_size:Math.max(1,Number(fd.get("team_pack_size")||1)),team_unit_label:fd.get("team_unit_label")||"unidad",team_allow_split:fd.get("team_allow_split")==="true",team_sort_order:Number(fd.get("team_sort_order")||0),sort_order:Number(fd.get("sort_order")||0),featured:fd.get("featured")==="true",active:fd.get("active")==="true"};const {error}=await sb.from("products").upsert(row);if(error)throw error;const selectedChannels=[...f.querySelectorAll('input[name="channels"]:checked')].map(x=>x.value);await sb.from("product_channels").delete().eq("product_id",row.id);if(selectedChannels.length){const cr=await sb.from("product_channels").insert(selectedChannels.map((channel,i)=>({product_id:row.id,channel,sort_order:i})));if(cr.error)throw cr.error}toast("Producto guardado");$("#editDialog").close();await loadAll();render()}catch(err){toast(err.message)}};if(p.id)$("#deleteProduct").onclick=async()=>{if(!confirm("¿Eliminar este producto?"))return;const {error}=await sb.from("products").delete().eq("id",p.id);if(error)return toast(error.message);$("#editDialog").close();await loadAll();render()}}

function renderCategories(){toolbar("Categorías","MENÚ",'<button id="newCategory">+ Nueva categoría</button>');$("#content").innerHTML='<div class="list">'+state.categories.map(c=>`<div class="row"><div><b>${safe(c.name)}</b><small>${safe(state.brands.find(b=>b.id===c.brand_id)?.name||"")} · orden ${c.sort_order}</small></div><div class="row-actions"><button data-edit-cat="${c.id}">Editar</button></div></div>`).join("")+"</div>";$("#newCategory").onclick=()=>editCategory();$("#content").querySelectorAll("[data-edit-cat]").forEach(b=>b.onclick=()=>editCategory(b.dataset.editCat))}
function editCategory(id){const c=id?state.categories.find(x=>x.id===id):{};const f=$("#editForm");f.innerHTML=`<h2>${id?"Editar":"Nueva"} categoría</h2><div class="form-grid"><label>Nombre<input name="name" value="${safe(c.name||"")}" required></label><label>Marca<select name="brand_id">${state.brands.map(b=>`<option value="${b.id}" ${c.brand_id===b.id?"selected":""}>${safe(b.name)}</option>`).join("")}</select></label><label class="wide">Imagen URL<input name="image_url" value="${safe(c.image_url||"")}"></label><label class="wide">Subir imagen<input name="image_file" type="file" accept="image/*"></label><label>Orden<input name="sort_order" type="number" value="${c.sort_order??0}"></label><label>Activo<select name="active"><option value="true">Sí</option><option value="false" ${c.active===false?"selected":""}>No</option></select></label></div><div class="form-actions"><button class="primary">Guardar</button></div>`;$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f);let image=fd.get("image_url");try{const file=fd.get("image_file");if(file?.size)image=await uploadImage(file,"categories");const row={id:c.id||("cat-"+Date.now()),name:fd.get("name"),brand_id:fd.get("brand_id"),image_url:image,sort_order:Number(fd.get("sort_order")||0),active:fd.get("active")==="true"};const {error}=await sb.from("categories").upsert(row);if(error)throw error;$("#editDialog").close();await loadAll();render();toast("Categoría guardada")}catch(err){toast(err.message)}}}
function renderPromotions(){toolbar("Promociones","MARKETING",'<button id="newPromo">+ Nueva promoción</button>');$("#content").innerHTML='<div class="grid">'+state.promotions.map(p=>`<article class="card"><img src="${p.image_url||""}"><h3>${safe(p.title)}</h3><p>${safe(p.subtitle||"")}</p><div class="card-footer"><span class="tag">${safe(p.promo_type||"GENERAL")}</span><div class="row-actions"><button data-promo-products="${p.id}">Productos</button><button class="edit" data-edit-promo="${p.id}">Editar</button></div></div></article>`).join("")+"</div>";$("#newPromo").onclick=()=>editPromo();$("#content").querySelectorAll("[data-edit-promo]").forEach(b=>b.onclick=()=>editPromo(b.dataset.editPromo));$("#content").querySelectorAll("[data-promo-products]").forEach(b=>b.onclick=()=>editPromoProducts(b.dataset.promoProducts))}
function editPromo(id){const p=id?state.promotions.find(x=>x.id===id):{};const f=$("#editForm");f.innerHTML=`<h2>${id?"Editar":"Nueva"} promoción</h2><div class="form-grid"><label>Título<input name="title" value="${safe(p.title||"")}" required></label><label>CTA<input name="cta" value="${safe(p.cta||"Explorar menú")}"></label><label class="wide">Subtítulo<textarea name="subtitle">${safe(p.subtitle||"")}</textarea></label><label>Categoría<select name="category_id"><option value="">Sin categoría</option>${state.categories.map(c=>`<option value="${c.id}" ${p.category_id===c.id?"selected":""}>${safe(c.name)}</option>`).join("")}</select></label><label>Tipo<select name="promo_type"><option value="GENERAL" ${p.promo_type==="GENERAL"?"selected":""}>General</option><option value="2X1" ${p.promo_type==="2X1"?"selected":""}>2x1</option><option value="HAPPY_HOUR" ${p.promo_type==="HAPPY_HOUR"?"selected":""}>Hora Feliz</option><option value="WEEKLY" ${p.promo_type==="WEEKLY"?"selected":""}>Semanal</option><option value="COMBO" ${p.promo_type==="COMBO"?"selected":""}>Combo</option><option value="FLASH" ${p.promo_type==="FLASH"?"selected":""}>Flash</option></select></label><label>Mostrar en<select name="audience"><option value="ALL" ${!p.audience||p.audience==="ALL"?"selected":""}>Todos</option><option value="TABLE" ${p.audience==="TABLE"?"selected":""}>Mesas</option><option value="COURT" ${p.audience==="COURT"?"selected":""}>Canchas</option><option value="DELIVERY" ${p.audience==="DELIVERY"?"selected":""}>Delivery</option></select></label><label>Orden<input name="sort_order" type="number" value="${p.sort_order??0}"></label><label class="wide">Imagen URL<input name="image_url" value="${safe(p.image_url||"")}"></label><label class="wide">Subir imagen<input name="image_file" type="file" accept="image/*"></label><label>Activo<select name="active"><option value="true">Sí</option><option value="false" ${p.active===false?"selected":""}>No</option></select></label></div><div class="form-actions"><button class="primary">Guardar</button></div>`;$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f);let image=fd.get("image_url");try{const file=fd.get("image_file");if(file?.size)image=await uploadImage(file,"promotions");const row={title:fd.get("title"),subtitle:fd.get("subtitle"),cta:fd.get("cta"),category_id:fd.get("category_id")||null,promo_type:fd.get("promo_type")||"GENERAL",audience:fd.get("audience")||"ALL",image_url:image,sort_order:Number(fd.get("sort_order")||0),active:fd.get("active")==="true"};let q=id?sb.from("promotions").update(row).eq("id",id):sb.from("promotions").insert(row);const {error}=await q;if(error)throw error;$("#editDialog").close();await loadAll();render();toast("Promoción guardada")}catch(err){toast(err.message)}}}

function editPromoProducts(promoId){const promo=state.promotions.find(x=>x.id===promoId),selected=new Set(state.promoLinks.filter(x=>x.promotion_id===promoId).map(x=>x.product_id)),f=$("#editForm");f.innerHTML=`<h2>Productos de ${safe(promo?.title||"promoción")}</h2><div class="list">${state.products.map(p=>`<label class="row"><div><b>${safe(p.name)}</b><small>${safe(state.categories.find(c=>c.id===p.category_id)?.name||"")}</small></div><input type="checkbox" name="promo_product" value="${p.id}" ${selected.has(p.id)?"checked":""}></label>`).join("")}</div><div class="form-actions"><button class="primary">Guardar selección</button></div>`;$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const ids=[...f.querySelectorAll('input[name="promo_product"]:checked')].map(x=>x.value);const del=await sb.from("promotion_products").delete().eq("promotion_id",promoId);if(del.error)return toast(del.error.message);if(ids.length){const rows=ids.map((product_id,i)=>({promotion_id:promoId,product_id,sort_order:i}));const ins=await sb.from("promotion_products").insert(rows);if(ins.error)return toast(ins.error.message)}$("#editDialog").close();await loadAll();render();toast("Productos de promoción actualizados")}}
function renderExtras(){toolbar("Extras y opciones","PERSONALIZACIÓN",'<button id="newGroup">+ Nuevo grupo</button>');$("#content").innerHTML='<div class="list">'+state.groups.map(g=>`<div class="row"><div><b>${safe(g.name)}</b><small>${g.selection_type==="multiple"?"Múltiple":"Una opción"} · ${state.options.filter(o=>o.group_id===g.id).length} opciones · ${state.links.filter(l=>l.group_id===g.id).length} productos</small></div><div class="row-actions"><button data-edit-group="${g.id}">Editar</button><button data-add-option="${g.id}">+ Opción</button><button data-link-group="${g.id}">Vincular</button></div></div>`).join("")+"</div>";$("#newGroup").onclick=()=>editGroup();$("#content").querySelectorAll("[data-edit-group]").forEach(b=>b.onclick=()=>editGroup(b.dataset.editGroup));$("#content").querySelectorAll("[data-add-option]").forEach(b=>b.onclick=()=>editOption(b.dataset.addOption));$("#content").querySelectorAll("[data-link-group]").forEach(b=>b.onclick=()=>linkGroup(b.dataset.linkGroup))}
function editGroup(id){const g=id?state.groups.find(x=>x.id===id):{};const f=$("#editForm");f.innerHTML=`<h2>${id?"Editar":"Nuevo"} grupo</h2><div class="form-grid"><label>Nombre<input name="name" value="${safe(g.name||"")}" required></label><label>Selección<select name="selection_type"><option value="single">Una opción</option><option value="multiple" ${g.selection_type==="multiple"?"selected":""}>Varias opciones</option></select></label><label>Tipo de personalización<select name="option_kind"><option value="extra" ${g.option_kind==="extra"?"selected":""}>Extra</option><option value="ingredient" ${g.option_kind==="ingredient"?"selected":""}>Ingrediente</option><option value="removable" ${g.option_kind==="removable"?"selected":""}>Ingrediente removible</option><option value="sauce" ${g.option_kind==="sauce"?"selected":""}>Salsa</option><option value="side" ${g.option_kind==="side"?"selected":""}>Acompañamiento</option><option value="flavor" ${g.option_kind==="flavor"?"selected":""}>Sabor</option><option value="size" ${g.option_kind==="size"?"selected":""}>Tamaño</option><option value="preparation" ${g.option_kind==="preparation"?"selected":""}>Preparación</option><option value="variant" ${!g.option_kind||g.option_kind==="variant"?"selected":""}>Variante</option></select></label><label>Mínimo<input name="min_selections" type="number" value="${g.min_selections??0}"></label><label>Máximo<input name="max_selections" type="number" value="${g.max_selections??1}"></label><label>Orden<input name="sort_order" type="number" value="${g.sort_order??0}"></label></div>${id?'<div class="list" style="margin-top:18px">'+state.options.filter(o=>o.group_id===id).map(o=>`<div class="row"><div><b>${safe(o.name)}</b><small>+${Number(o.price_delta).toFixed(2)}</small></div><button type="button" data-edit-option="${o.id}">Editar</button></div>`).join("")+"</div>":""}<div class="form-actions"><button class="primary">Guardar</button></div>`;$("#editDialog").showModal();f.querySelectorAll("[data-edit-option]").forEach(b=>b.onclick=()=>editOption(id,b.dataset.editOption));f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f),row={name:fd.get("name"),selection_type:fd.get("selection_type"),option_kind:fd.get("option_kind"),min_selections:Number(fd.get("min_selections")||0),max_selections:Number(fd.get("max_selections")||1),sort_order:Number(fd.get("sort_order")||0),active:true};let q=id?sb.from("option_groups").update(row).eq("id",id):sb.from("option_groups").insert(row);const {error}=await q;if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Grupo guardado")}}
function editOption(groupId,id){const o=id?state.options.find(x=>x.id===id):{};const f=$("#editForm");f.innerHTML=`<h2>${id?"Editar":"Nueva"} opción</h2><div class="form-grid"><label>Nombre<input name="name" value="${safe(o.name||"")}" required></label><label>Precio extra<input name="price_delta" type="number" step=".01" value="${o.price_delta??0}"></label><label>Orden<input name="sort_order" type="number" value="${o.sort_order??0}"></label></div><div class="form-actions"><button class="primary">Guardar</button></div>`;$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f),row={group_id:groupId,name:fd.get("name"),price_delta:Number(fd.get("price_delta")||0),sort_order:Number(fd.get("sort_order")||0),active:true};let q=id?sb.from("options").update(row).eq("id",id):sb.from("options").insert(row);const {error}=await q;if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Opción guardada")}}
function linkGroup(groupId){const f=$("#editForm");f.innerHTML=`<h2>Vincular grupo a producto</h2><div class="form-grid"><label class="wide">Producto<select name="product_id">${state.products.map(p=>`<option value="${p.id}">${safe(p.name)}</option>`).join("")}</select></label></div><div class="form-actions"><button class="primary">Vincular</button></div>`;$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f);const {error}=await sb.from("product_option_groups").upsert({product_id:fd.get("product_id"),group_id:groupId,sort_order:0});if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Grupo vinculado")}}

function renderBranding(){toolbar("Logos y marcas","IDENTIDAD");$("#content").innerHTML='<div class="grid">'+state.brands.map(b=>`<article class="card"><img src="${b.logo_url||""}" style="object-fit:contain;background:#fff"><h3>${safe(b.name)}</h3><p>${safe(b.short_name||"")}</p><div class="card-footer"><span class="tag">${safe(b.accent||"")}</span><button class="edit" data-brand="${b.id}">Editar</button></div></article>`).join("")+"</div>";$("#content").querySelectorAll("[data-brand]").forEach(b=>b.onclick=()=>editBrand(b.dataset.brand))}
function editBrand(id){const b=state.brands.find(x=>x.id===id),f=$("#editForm");f.innerHTML=`<h2>Editar marca</h2><div class="form-grid"><label>Nombre<input name="name" value="${safe(b.name)}"></label><label>Nombre corto<input name="short_name" value="${safe(b.short_name||"")}"></label><label>Color<input name="accent" value="${safe(b.accent||"")}"></label><label class="wide">Logo URL<input name="logo_url" value="${safe(b.logo_url||"")}"></label><label class="wide">Subir logo<input name="image_file" type="file" accept="image/*"></label></div><div class="form-actions"><button class="primary">Guardar</button></div>`;$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f);let logo=fd.get("logo_url");try{const file=fd.get("image_file");if(file?.size)logo=await uploadImage(file,"logos");const {error}=await sb.from("brands").update({name:fd.get("name"),short_name:fd.get("short_name"),accent:fd.get("accent"),logo_url:logo}).eq("id",id);if(error)throw error;$("#editDialog").close();await loadAll();render();toast("Marca actualizada")}catch(err){toast(err.message)}}}
function renderPlaces(){toolbar("Ubicaciones","OPERACIÓN");$("#content").innerHTML='<div class="list">'+state.places.map(p=>`<div class="row"><div><b>${safe(p.name)}</b><small>${p.code} · ${p.place_type} · ${p.active?"Activa":"Inactiva"}</small></div><div class="row-actions"><button data-place="${p.code}">Editar</button></div></div>`).join("")+"</div>";$("#content").querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>editPlace(b.dataset.place))}
function editPlace(code){const p=state.places.find(x=>x.code===code),f=$("#editForm");f.innerHTML=`<h2>Editar ubicación operativa</h2><div class="form-grid"><label>Nombre<input name="name" value="${safe(p.name)}"></label><label>Tipo<select name="place_type"><option value="TABLE" ${p.place_type==="TABLE"?"selected":""}>Mesa</option><option value="COURT" ${p.place_type==="COURT"?"selected":""}>Cancha</option><option value="DELIVERY" ${p.place_type==="DELIVERY"?"selected":""}>Delivery</option></select></label><label>Tema<select name="theme_key"><option value="PREMIUM" ${p.theme_key==="PREMIUM"?"selected":""}>Premium</option><option value="FOOTBALL" ${p.theme_key==="FOOTBALL"?"selected":""}>Futbolero</option><option value="DELIVERY" ${p.theme_key==="DELIVERY"?"selected":""}>Delivery</option></select></label><label>Orden<input name="sort_order" type="number" value="${p.sort_order||0}"></label><label class="wide">Título de bienvenida<input name="intro_title" value="${safe(p.intro_title||"")}"></label><label class="wide">Subtítulo<input name="intro_subtitle" value="${safe(p.intro_subtitle||"")}"></label><label>Intro<select name="intro_enabled"><option value="true" ${p.intro_enabled!==false?"selected":""}>Activa</option><option value="false" ${p.intro_enabled===false?"selected":""}>Desactivada</option></select></label><label>Estilo de entrada<select name="intro_style"><option value="FURY" ${p.intro_style==="FURY"?"selected":""}>Fury / Impacto</option><option value="STADIUM" ${p.intro_style==="STADIUM"?"selected":""}>Stadium / Futbol</option><option value="CINEMA" ${p.intro_style==="CINEMA"?"selected":""}>Cinema / Elegante</option><option value="MINIMAL" ${p.intro_style==="MINIMAL"?"selected":""}>Minimal</option></select></label><label>Duración intro (ms)<input name="intro_duration_ms" type="number" min="1200" max="7000" step="100" value="${p.intro_duration_ms||2400}"></label><label>Velocidad transición (ms)<input name="intro_speed_ms" type="number" min="220" max="2000" step="50" value="${p.intro_speed_ms||420}"></label><label>Humo / vapor<select name="smoke_enabled"><option value="true" ${p.smoke_enabled!==false?"selected":""}>Sí</option><option value="false" ${p.smoke_enabled===false?"selected":""}>No</option></select></label><label>Rotación banner (ms)<input name="hero_interval_ms" type="number" min="2500" max="15000" step="250" value="${p.hero_interval_ms||4800}"></label><label class="wide">Imagen ambiente URL<input name="hero_image_url" value="${safe(p.hero_image_url||"")}"></label><label class="wide">Subir imagen ambiente<input name="hero_image_file" type="file" accept="image/*"></label><label class="wide">Imagen superior / techo<input name="header_art_url" value="${safe(p.header_art_url||"")}"></label><label class="wide">Subir imagen superior<input name="header_art_file" type="file" accept="image/*"></label><label>Activo<select name="active"><option value="true">Sí</option><option value="false" ${!p.active?"selected":""}>No</option></select></label></div><div class="form-actions"><button class="primary">Guardar</button></div>`;$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f);try{let hero=fd.get("hero_image_url"),header=fd.get("header_art_url");const heroFile=fd.get("hero_image_file"),headerFile=fd.get("header_art_file");if(heroFile?.size)hero=await uploadImage(heroFile,"places");if(headerFile?.size)header=await uploadImage(headerFile,"places");const row={name:fd.get("name"),place_type:fd.get("place_type"),theme_key:fd.get("theme_key"),intro_title:fd.get("intro_title"),intro_subtitle:fd.get("intro_subtitle"),intro_enabled:fd.get("intro_enabled")==="true",intro_style:fd.get("intro_style")||"FURY",intro_duration_ms:Number(fd.get("intro_duration_ms")||2400),intro_speed_ms:Number(fd.get("intro_speed_ms")||420),smoke_enabled:fd.get("smoke_enabled")==="true",hero_interval_ms:Number(fd.get("hero_interval_ms")||4800),hero_image_url:hero,header_art_url:header,sort_order:Number(fd.get("sort_order")||0),active:fd.get("active")==="true"};const {error}=await sb.from("places").update(row).eq("code",code);if(error)throw error;$("#editDialog").close();await loadAll();render();toast("Ubicación actualizada")}catch(err){toast(err.message)}}}

function renderReceivables(){
 toolbar("Cuentas por cobrar","FINANZAS");
 const open=state.receivables.filter(x=>x.status==="OPEN"),paid=state.receivables.filter(x=>x.status==="PAID");
 const total=open.reduce((a,x)=>a+Number(x.balance||0),0);
 $("#content").innerHTML=`
 <div class="finance-kpis">
   <article><span>Saldo pendiente</span><b>L ${total.toLocaleString("es-HN",{minimumFractionDigits:2})}</b></article>
   <article><span>Cuentas abiertas</span><b>${open.length}</b></article>
   <article><span>Pagadas</span><b>${paid.length}</b></article>
 </div>
 <div class="list">${state.receivables.map(r=>`
   <div class="row ar-row">
     <div>
       <b>${safe(r.invoice_number)} · ${safe(r.customer_name||"Consumidor final")}</b>
       <small>${new Date(r.created_at).toLocaleString("es-HN")} · ${safe(r.station==="LB"?"La Bandeja":"Beer Station")} · ${safe(r.place_name||r.place_code||"")}</small><small>Celular: ${safe(r.customer_phone||"No registrado")}</small>
       <small>Original: L ${Number(r.original_amount).toFixed(2)} · Abonado: L ${Number(r.paid_amount).toFixed(2)} · <strong>Saldo: L ${Number(r.balance).toFixed(2)}</strong></small>
       ${(r.payments||[]).length?`<small>${(r.payments||[]).map(p=>`${new Date(p.created_at).toLocaleDateString("es-HN")}: L ${Number(p.amount).toFixed(2)} ${safe(p.payment_method)}${p.reference?" · "+safe(p.reference):""}`).join(" | ")}</small>`:""}
     </div>
     <div class="row-actions"><span class="tag ${r.status==="PAID"?"paid-tag":""}">${r.status==="PAID"?"PAGADA":"PENDIENTE"}</span>${r.status==="OPEN"?`<button data-ar-pay="${r.id}">Registrar abono</button>`:""}</div>
   </div>`).join("")||'<p>No hay cuentas por cobrar.</p>'}</div>`;
 $("#content").querySelectorAll("[data-ar-pay]").forEach(b=>b.onclick=()=>openReceivablePayment(b.dataset.arPay));
}
function openReceivablePayment(id){
 const r=state.receivables.find(x=>x.id===id);if(!r)return;
 const f=$("#editForm");f.innerHTML=`<h2>Registrar abono</h2><p><b>${safe(r.invoice_number)}</b> · ${safe(r.customer_name||"Consumidor final")}</p><p>Saldo actual: <b>L ${Number(r.balance).toFixed(2)}</b></p>
 <div class="form-grid">
   <label>Monto<input name="amount" type="number" min=".01" max="${r.balance}" step=".01" value="${r.balance}" required></label>
   <label>Medio de pago<select name="method"><option>EFECTIVO</option><option>TARJETA</option><option>TRANSFERENCIA</option><option>CHEQUE</option></select></label>
   <label class="wide">Referencia<input name="reference" placeholder="Opcional: referencia, cheque, últimos 4..."></label>
 </div><div class="form-actions"><button class="primary">Registrar abono</button></div>`;
 $("#editDialog").showModal();
 f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f),amount=Number(fd.get("amount")||0);const {error}=await sb.rpc("register_receivable_payment_public",{p_receivable:id,p_amount:amount,p_method:fd.get("method"),p_reference:fd.get("reference")||null});if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Abono registrado")};
}

function renderOrders(){toolbar("Pedidos y servicio","OPERACIÓN");const calls=state.calls.map(c=>`<div class="row"><div><b>${safe(c.reason)}</b><small>${new Date(c.created_at).toLocaleString("es-HN")}</small></div><div class="row-actions"><button data-call="${c.id}" data-status="${c.status}">${c.status==="OPEN"?"Marcar atendida":"Atendida"}</button></div></div>`).join("");const orders=state.orders.map(o=>`<div class="row"><div><b>${safe(o.diners?.display_name||"Comensal")} · L ${Number(o.total).toFixed(2)}</b><small>${new Date(o.created_at).toLocaleString("es-HN")} · ${o.order_items?.length||0} productos</small>${o.note?`<small>${safe(o.note)}</small>`:""}</div><select data-order="${o.id}"><option ${o.status==="RECEIVED"?"selected":""}>RECEIVED</option><option ${o.status==="PREPARING"?"selected":""}>PREPARING</option><option ${o.status==="READY"?"selected":""}>READY</option><option ${o.status==="DELIVERED"?"selected":""}>DELIVERED</option><option ${o.status==="CANCELLED"?"selected":""}>CANCELLED</option></select></div>`).join("");$("#content").innerHTML='<h2>Llamadas de servicio</h2><div class="list">'+calls+'</div><h2 style="margin-top:28px">Pedidos recientes</h2><div class="list">'+orders+"</div>";$("#content").querySelectorAll("[data-order]").forEach(s=>s.onchange=async()=>{const {error}=await sb.from("orders").update({status:s.value}).eq("id",s.dataset.order);if(error)return toast(error.message);toast("Estado actualizado")});$("#content").querySelectorAll("[data-call]").forEach(b=>b.onclick=async()=>{if(b.dataset.status!=="OPEN")return;const {error}=await sb.from("service_calls").update({status:"DONE"}).eq("id",b.dataset.call);if(error)return toast(error.message);await loadAll();render()})}

function renderBanners(){
 toolbar("Banners por ambiente","EXPERIENCIA",'<button id="newBanner">+ Nuevo banner</button>');
 const groups=["TABLE","COURT","DELIVERY"];
 $("#content").innerHTML=groups.map(ch=>{
   const label=ch==="TABLE"?"Mesas":ch==="COURT"?"Canchas":"Delivery";
   const cards=state.heroSlides.filter(x=>x.channel===ch).map(s=>`<article class="card banner-card"><img src="${s.image_url||state.products.find(p=>p.id===s.product_id)?.image_url||""}"><span class="tag">${label}</span><h3>${safe(s.title||state.products.find(p=>p.id===s.product_id)?.name||"Banner")}</h3><p>${safe(s.subtitle||"")}</p><div class="card-footer"><small>Orden ${s.sort_order}</small><button class="edit" data-banner="${s.id}">Editar</button></div></article>`).join("");
   return `<section class="banner-group"><div class="subhead"><h2>${label}</h2><span>${state.heroSlides.filter(x=>x.channel===ch).length} banners</span></div><div class="grid">${cards||'<div class="empty-admin">Sin banners.</div>'}</div></section>`
 }).join("");
 $("#newBanner").onclick=()=>editBanner();
 $("#content").querySelectorAll("[data-banner]").forEach(b=>b.onclick=()=>editBanner(b.dataset.banner));
}
function editBanner(id){
 const s=id?state.heroSlides.find(x=>x.id===id):{},f=$("#editForm");
 f.innerHTML=`<h2>${id?"Editar":"Nuevo"} banner</h2><div class="form-grid">
 <label>Ambiente<select name="channel"><option value="TABLE" ${s.channel==="TABLE"?"selected":""}>Mesas</option><option value="COURT" ${s.channel==="COURT"?"selected":""}>Canchas</option><option value="DELIVERY" ${s.channel==="DELIVERY"?"selected":""}>Delivery</option></select></label>
 <label>Producto<select name="product_id"><option value="">Sin producto</option>${state.products.map(p=>`<option value="${p.id}" ${s.product_id===p.id?"selected":""}>${safe(p.name)}</option>`).join("")}</select></label>
 <label class="wide">Título<input name="title" value="${safe(s.title||"")}"></label>
 <label class="wide">Subtítulo<textarea name="subtitle">${safe(s.subtitle||"")}</textarea></label>
 <label class="wide">Imagen URL<input name="image_url" value="${safe(s.image_url||"")}"></label>
 <label class="wide">Subir imagen<input name="image_file" type="file" accept="image/*"></label>
 <label>Orden<input name="sort_order" type="number" value="${s.sort_order??0}"></label>
 <label>Activo<select name="active"><option value="true" ${s.active!==false?"selected":""}>Sí</option><option value="false" ${s.active===false?"selected":""}>No</option></select></label>
 </div><div class="form-actions">${id?'<button type="button" class="danger" id="deleteBanner">Eliminar</button>':""}<button class="primary">Guardar</button></div>`;
 $("#editDialog").showModal();
 f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f);let image=fd.get("image_url");try{const file=fd.get("image_file");if(file?.size)image=await uploadImage(file,"banners");const row={channel:fd.get("channel"),product_id:fd.get("product_id")||null,title:fd.get("title"),subtitle:fd.get("subtitle"),image_url:image,sort_order:Number(fd.get("sort_order")||0),active:fd.get("active")==="true"};let q=id?sb.from("hero_slides").update(row).eq("id",id):sb.from("hero_slides").insert(row);const {error}=await q;if(error)throw error;$("#editDialog").close();await loadAll();render();toast("Banner guardado")}catch(err){toast(err.message)}};
 if(id)$("#deleteBanner").onclick=async()=>{if(!confirm("¿Eliminar este banner?"))return;const {error}=await sb.from("hero_slides").delete().eq("id",id);if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Banner eliminado")};
}
function renderFeedback(){
 const list=state.feedback||[],avg=list.length?(list.reduce((a,x)=>a+Number(x.rating||0),0)/list.length):0;
 const counts=[5,4,3,2,1].map(n=>({n,c:list.filter(x=>Number(x.rating)===n).length}));
 toolbar("Feedback de clientes","EXPERIENCIA");
 $("#content").innerHTML=`<div class="feedback-summary"><div class="feedback-score"><small>PROMEDIO</small><b>${avg.toFixed(1)}</b><span>/ 5</span></div><div class="feedback-bars">${counts.map(x=>`<div><span>${x.n}</span><i><em style="width:${list.length?(x.c/list.length)*100:0}%"></em></i><b>${x.c}</b></div>`).join("")}</div><div class="feedback-total"><small>RESPUESTAS</small><b>${list.length}</b></div></div>
 <div class="list feedback-list">${list.map(x=>{const place=state.places.find(p=>p.code===x.place_code);return `<article class="row feedback-row"><div><div class="feedback-rating">${"●".repeat(Number(x.rating||0))}<span>${"○".repeat(5-Number(x.rating||0))}</span></div><b>${safe(place?.name||x.place_code||"Sin ubicación")}</b><small>${new Date(x.created_at).toLocaleString("es-HN")}</small><p>${safe(x.comment||"Sin comentario")}</p></div><span class="tag">${x.rating}/5</span></article>`}).join("")||'<div class="empty-admin">Aún no hay opiniones.</div>'}</div>`;
}

const L=n=>"L "+Number(n||0).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2});
function crmCard(label,value,sub=""){return '<article class="crm-kpi"><span>'+label+'</span><b>'+value+'</b><small>'+sub+'</small></article>'}
function renderDashboard(){
 const valid=state.orders.filter(o=>o.sale_recorded_at&&o.status!=="CANCELLED");
 const now=new Date(),todayKey=now.toLocaleDateString("en-CA");
 const today=valid.filter(o=>new Date(o.sale_recorded_at).toLocaleDateString("en-CA")===todayKey);
 const total=today.reduce((a,o)=>a+Number(o.total||0),0);
 const avg=today.length?total/today.length:0;
 const weekStart=new Date(now);weekStart.setDate(now.getDate()-6);weekStart.setHours(0,0,0,0);
 const week=valid.filter(o=>new Date(o.sale_recorded_at)>=weekStart);
 const weekTotal=week.reduce((a,o)=>a+Number(o.total||0),0);
 const active=state.orders.filter(o=>["RECEIVED","PREPARING","READY"].includes(o.status));
 const cxcOpen=state.receivables.filter(x=>x.status==="OPEN"),cxpOpen=state.payables.filter(x=>x.status==="OPEN");
 const cxc=cxcOpen.reduce((a,x)=>a+Number(x.balance||0),0),cxp=cxpOpen.reduce((a,x)=>a+Number(x.balance||0),0);
 const dayPoints=[];for(let n=6;n>=0;n--){const d=new Date(now);d.setDate(now.getDate()-n);const k=d.toLocaleDateString("en-CA");const v=valid.filter(o=>new Date(o.sale_recorded_at).toLocaleDateString("en-CA")===k).reduce((a,o)=>a+Number(o.total||0),0);dayPoints.push({label:d.toLocaleDateString("es-HN",{weekday:"short"}),value:v})}
 const maxDay=Math.max(1,...dayPoints.map(x=>x.value));
 const coords=dayPoints.map((x,i)=>({x:45+i*(610/Math.max(1,dayPoints.length-1)),y:205-(x.value/maxDay)*155,...x}));
 const path=coords.map((p,i)=>(i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" ");
 const area=path+" L "+coords[coords.length-1].x.toFixed(1)+" 220 L "+coords[0].x.toFixed(1)+" 220 Z";
 const recent=valid.slice().sort((a,b)=>new Date(b.sale_recorded_at)-new Date(a.sale_recorded_at)).slice(0,5);
 const orderActive=active.length;
 toolbar("Dashboard","OPERACIÓN",'<button id="refreshExecutive">Actualizar</button>');
 $("#content").innerHTML=`
 <section class="exact-hero">
   <div class="exact-hero-shade"></div>
   <div class="exact-copy">
     <div class="exact-status"><i></i> Sistema operativo</div>
     <h2>Todo lo importante,<br><em>en una sola vista.</em></h2>
     <p>Operación, ventas y control financiero en tiempo real.</p>
     <div class="exact-actions">
       <button data-go="sales" class="primary">▣ <span>Ver ventas</span><b>→</b></button>
       <button data-go="orders">▤ <span>Pedidos activos</span></button>
       <button data-go="reports">▥ <span>Abrir reportes</span></button>
     </div>
   </div>
   <div class="exact-kraken-title"><strong>KRAKEN</strong><span>CONTROL TOTAL<br>DE TU OPERACIÓN</span></div>
 </section>

 <section class="exact-kpis">
   <button data-go="sales" class="exact-kpi cyan">
     <div class="kpi-icon">▣</div><div><span>VENTAS DE HOY</span><b>${L(total)}</b><small>${today.length} operaciones · ticket ${L(avg)}</small></div><i class="mini-bars"><u></u><u></u><u></u><u></u></i>
   </button>
   <button data-go="orders" class="exact-kpi blue">
     <div class="kpi-icon">◇</div><div><span>PEDIDOS ACTIVOS</span><b>${orderActive}</b><small>Pendientes de proceso</small></div><i class="mini-bars"><u></u><u></u><u></u><u></u></i>
   </button>
   <button data-go="receivables" class="exact-kpi cyan">
     <div class="kpi-icon">◉</div><div><span>CUENTAS POR COBRAR</span><b>${L(cxc)}</b><small>${cxcOpen.length} clientes</small></div><i class="mini-bars"><u></u><u></u><u></u><u></u></i>
   </button>
   <button data-go="payables" class="exact-kpi blue">
     <div class="kpi-icon">▣</div><div><span>CUENTAS POR PAGAR</span><b>${L(cxp)}</b><small>${cxpOpen.length} proveedores</small></div><i class="mini-bars"><u></u><u></u><u></u><u></u></i>
   </button>
 </section>

 <section class="exact-main-grid">
   <article class="exact-panel exact-sales-panel">
     <div class="exact-panel-head">
       <div><span>▥</span><div><b>VENTAS</b><small>Comportamiento de ventas en el tiempo</small></div></div>
       <div class="period-tabs"><button class="active">Hoy</button><button>7 días</button><button>30 días</button><button>12 meses</button></div>
     </div>
     <div class="line-chart-wrap">
       <svg viewBox="0 0 700 245" preserveAspectRatio="none" aria-label="Ventas últimos 7 días">
         <defs>
           <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e9cff" stop-opacity=".36"/><stop offset="1" stop-color="#0e9cff" stop-opacity="0"/></linearGradient>
           <filter id="lineGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
         </defs>
         <g class="chart-grid">${[45,85,125,165,205].map(y=>`<line x1="45" y1="${y}" x2="655" y2="${y}"/>`).join("")}${coords.map(p=>`<line x1="${p.x}" y1="40" x2="${p.x}" y2="220"/>`).join("")}</g>
         <path class="chart-area" d="${area}"/>
         <path class="chart-line" d="${path}" filter="url(#lineGlow)"/>
         ${coords.map(p=>`<circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="4"/>`).join("")}
         ${coords.map((p,i)=>`<text x="${p.x}" y="238" text-anchor="middle">${safe(dayPoints[i].label)}</text>`).join("")}
       </svg>
     </div>
   </article>

   <article class="exact-panel exact-activity">
     <div class="exact-panel-head"><div><span>◷</span><div><b>ACTIVIDAD RECIENTE</b></div></div><button data-go="sales" class="see-all">Ver todo →</button></div>
     <div class="activity-timeline">
       ${recent.length?recent.map((o,i)=>`<button data-go="sales"><i class="timeline-dot t${i}"></i><div class="activity-icon">${i===0?"▣":i===1?"◇":i===2?"◉":"◎"}</div><div class="activity-copy"><b>${safe(o.customer_name||o.diners?.display_name||"Nueva venta registrada")}</b><small>${safe(o.station==="BS"?"Beer Station":"La Bandeja")} · ${L(o.total)}</small></div><time>${new Date(o.sale_recorded_at).toLocaleString("es-HN",{hour:"2-digit",minute:"2-digit"})}</time></button>`).join(""):'<div class="quiet-state">Sin actividad reciente.</div>'}
     </div>
   </article>
 </section>

 <section class="exact-shortcuts">
   <button data-go="inventory" class="green"><span>◇</span><div><b>Inventario</b><small>Gestiona tus productos</small></div><i>→</i></button>
   <button data-go="production" class="blue"><span>▥</span><div><b>Producción</b><small>Órdenes y procesos</small></div><i>→</i></button>
   <button data-go="employees" class="purple"><span>◎</span><div><b>Empleados</b><small>Administra tu equipo</small></div><i>→</i></button>
   <button data-go="reports" class="gold"><span>▥</span><div><b>Reportes</b><small>Análisis y estadísticas</small></div><i>→</i></button>
 </section>`;
 $("#content").querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>navigateAdmin(b.dataset.go));
 $("#refreshExecutive").onclick=async()=>{await loadAll();render();toast("Dashboard actualizado")};
}
function enableSpotlightCards(){
 document.querySelectorAll(".spotlight-card").forEach(card=>{
  card.onpointermove=e=>{const r=card.getBoundingClientRect();card.style.setProperty("--mx",(e.clientX-r.left)+"px");card.style.setProperty("--my",(e.clientY-r.top)+"px")};
 });
}
function renderSales(){toolbar("Ventas","COMERCIAL");const rows=state.orders.filter(o=>o.sale_recorded_at||o.payment_status==="PAID"||o.sale_type==="CREDITO");$("#content").innerHTML='<div class="crm-kpis">'+crmCard("Total",L(rows.reduce((a,x)=>a+Number(x.total||0),0)),rows.length+" ventas")+crmCard("Contado",L(rows.filter(x=>x.sale_type!=="CREDITO").reduce((a,x)=>a+Number(x.total||0),0)))+crmCard("Crédito",L(rows.filter(x=>x.sale_type==="CREDITO").reduce((a,x)=>a+Number(x.total||0),0)))+'</div><div class="crm-table"><table><thead><tr><th>Fecha</th><th>Cliente</th><th>Origen</th><th>Tipo</th><th>Pago</th><th>Total</th></tr></thead><tbody>'+rows.map(o=>'<tr><td>'+new Date(o.sale_recorded_at||o.created_at).toLocaleString("es-HN")+'</td><td>'+safe(o.customer_name||o.diners?.display_name||"Consumidor final")+'</td><td>'+safe(o.table_sessions?.places?.name||o.table_sessions?.place_code||"")+'</td><td>'+safe(o.sale_type||"CONTADO")+'</td><td>'+safe(o.payment_method||"—")+'</td><td><b>'+L(o.total)+'</b></td></tr>').join("")+'</tbody></table></div>'}
function renderCustomers(){toolbar("Clientes","CRM",'<button id="newCustomer">+ Nuevo cliente</button>');$("#content").innerHTML='<div class="crm-table"><table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Dirección</th><th></th></tr></thead><tbody>'+state.customers.map(x=>'<tr><td><b>'+safe(x.name)+'</b></td><td>'+safe(x.phone||"—")+'</td><td>'+safe(x.email||"—")+'</td><td>'+safe(x.address||"—")+'</td><td><button data-edit-customer="'+x.id+'">Editar</button></td></tr>').join("")+'</tbody></table></div>';$("#newCustomer").onclick=()=>editCustomer();$("#content").querySelectorAll("[data-edit-customer]").forEach(b=>b.onclick=()=>editCustomer(b.dataset.editCustomer))}
function editCustomer(id){const x=id?state.customers.find(v=>v.id===id):{};const f=$("#editForm");f.innerHTML='<h2>'+(id?"Editar":"Nuevo")+' cliente</h2><div class="form-grid"><label>Nombre<input name="name" value="'+safe(x.name||"")+'" required></label><label>Teléfono<input name="phone" value="'+safe(x.phone||"")+'"></label><label>Email<input name="email" value="'+safe(x.email||"")+'"></label><label>Dirección<input name="address" value="'+safe(x.address||"")+'"></label><label class="wide">Notas<textarea name="notes">'+safe(x.notes||"")+'</textarea></label></div><div class="form-actions"><button class="primary">Guardar</button></div>';$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),row={name:d.get("name"),phone:d.get("phone"),email:d.get("email"),address:d.get("address"),notes:d.get("notes"),active:true};const q=id?sb.from("customers").update(row).eq("id",id):sb.from("customers").insert(row);const{error}=await q;if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Cliente guardado")}}
function genericPeople(kind,title,list,fields){toolbar(title,"CRM",'<button id="newGeneric">+ Nuevo</button>');$("#content").innerHTML='<div class="crm-table"><table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Detalle</th><th>Estado</th><th></th></tr></thead><tbody>'+list.map(x=>'<tr><td><b>'+safe(x.name)+'</b></td><td>'+safe(x.phone||"—")+'</td><td>'+safe(kind==="suppliers"?(x.email||x.tax_id||"—"):(x.position||x.station||"—"))+'</td><td>'+(x.active?"Activo":"Inactivo")+'</td><td><button data-gen="'+x.id+'">Editar</button></td></tr>').join("")+'</tbody></table></div>';$("#newGeneric").onclick=()=>editGeneric(kind);$("#content").querySelectorAll("[data-gen]").forEach(b=>b.onclick=()=>editGeneric(kind,b.dataset.gen))}
function editGeneric(kind,id){const list=kind==="suppliers"?state.suppliers:state.employees,x=id?list.find(v=>v.id===id):{},f=$("#editForm");const extra=kind==="suppliers"?'<label>Email<input name="email" value="'+safe(x.email||"")+'"></label><label>RTN / ID fiscal<input name="tax_id" value="'+safe(x.tax_id||"")+'"></label><label class="wide">Dirección<input name="address" value="'+safe(x.address||"")+'"></label>':'<label>Cargo<input name="position" value="'+safe(x.position||"")+'"></label><label>Negocio<select name="station"><option value="LB">La Bandeja</option><option value="BS" '+(x.station==="BS"?"selected":"")+'>Beer Station</option></select></label><label>Salario<input name="salary" type="number" step=".01" value="'+Number(x.salary||0)+'"></label><label>Fecha ingreso<input name="hire_date" type="date" value="'+(x.hire_date||"")+'"></label>';f.innerHTML='<h2>'+(id?"Editar":"Nuevo")+' '+(kind==="suppliers"?"proveedor":"empleado")+'</h2><div class="form-grid"><label>Nombre<input name="name" value="'+safe(x.name||"")+'" required></label><label>Teléfono<input name="phone" value="'+safe(x.phone||"")+'"></label>'+extra+'<label class="wide">Notas<textarea name="notes">'+safe(x.notes||"")+'</textarea></label></div><div class="form-actions"><button class="primary">Guardar</button></div>';$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),row=kind==="suppliers"?{name:d.get("name"),phone:d.get("phone"),email:d.get("email"),tax_id:d.get("tax_id"),address:d.get("address"),notes:d.get("notes"),active:true}:{name:d.get("name"),phone:d.get("phone"),position:d.get("position"),station:d.get("station"),salary:Number(d.get("salary")||0),hire_date:d.get("hire_date")||null,notes:d.get("notes"),active:true};const q=id?sb.from(kind).update(row).eq("id",id):sb.from(kind).insert(row);const{error}=await q;if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Guardado")}}
function renderSuppliers(){genericPeople("suppliers","Proveedores",state.suppliers)}
function renderEmployees(){genericPeople("employees","Empleados",state.employees)}
function renderExpenses(){toolbar("Gastos","FINANZAS",'<button id="newExpense">+ Registrar gasto</button>');$("#content").innerHTML='<div class="crm-kpis">'+crmCard("Total gastos",L(state.expenses.reduce((a,x)=>a+Number(x.amount||0),0)),state.expenses.length+" registros")+'</div><div class="crm-table"><table><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Beneficiario</th><th>Pago</th><th>Monto</th></tr></thead><tbody>'+state.expenses.map(x=>'<tr><td>'+x.expense_date+'</td><td>'+safe(x.category)+'</td><td>'+safe(x.description)+'</td><td>'+safe(x.beneficiary||"—")+'</td><td>'+safe(x.payment_method||"—")+'</td><td><b>'+L(x.amount)+'</b></td></tr>').join("")+'</tbody></table></div>';$("#newExpense").onclick=()=>editExpense()}
function editExpense(){const f=$("#editForm");f.innerHTML='<h2>Registrar gasto</h2><div class="form-grid"><label>Negocio<select name="station"><option value="LB">La Bandeja</option><option value="BS">Beer Station</option></select></label><label>Fecha<input type="date" name="expense_date" value="'+new Date().toISOString().slice(0,10)+'"></label><label>Categoría<input name="category" required></label><label>Beneficiario<input name="beneficiary"></label><label class="wide">Descripción<input name="description" required></label><label>Medio de pago<input name="payment_method"></label><label>Referencia<input name="reference"></label><label>Monto<input name="amount" type="number" step=".01" required></label></div><div class="form-actions"><button class="primary">Guardar gasto</button></div>';$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),row={station:d.get("station"),expense_date:d.get("expense_date"),category:d.get("category"),beneficiary:d.get("beneficiary"),description:d.get("description"),payment_method:d.get("payment_method"),reference:d.get("reference"),amount:Number(d.get("amount"))};const{error}=await sb.from("expenses").insert(row);if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Gasto registrado")}}
function renderInventory(){toolbar("Inventario","EXISTENCIAS",'<button id="adjustStock">+ Ajustar existencia</button>');const map=new Map(state.inventory.map(x=>[x.product_id,x]));$("#content").innerHTML='<div class="crm-table"><table><thead><tr><th>Producto</th><th>Negocio</th><th>Existencia</th><th>Mínimo</th><th>Costo</th><th>Valor</th></tr></thead><tbody>'+state.products.map(p=>{const x=map.get(p.id)||{};return '<tr><td><b>'+safe(p.name)+'</b></td><td>'+safe(p.brand_id)+'</td><td>'+Number(x.qty||0).toFixed(2)+'</td><td>'+Number(x.min_stock||0).toFixed(2)+'</td><td>'+L(x.unit_cost||0)+'</td><td>'+L(Number(x.qty||0)*Number(x.unit_cost||0))+'</td></tr>'}).join("")+'</tbody></table></div>';$("#adjustStock").onclick=()=>adjustStock()}
function adjustStock(){const f=$("#editForm");f.innerHTML='<h2>Ajustar existencia</h2><div class="form-grid"><label class="wide">Producto<select name="product_id">'+state.products.map(p=>'<option value="'+p.id+'">'+safe(p.name)+'</option>').join("")+'</select></label><label>Cantidad (+/-)<input name="qty" type="number" step=".01" required></label><label>Costo unitario<input name="cost" type="number" step=".01"></label><label>Tipo<select name="type"><option>AJUSTE</option><option>COMPRA</option><option>DAÑADO</option><option>CONSUMO</option></select></label><label class="wide">Nota<input name="notes"></label></div><div class="form-actions"><button class="primary">Aplicar ajuste</button></div>';$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),{error}=await sb.rpc("crm_adjust_inventory_public",{p_product:d.get("product_id"),p_qty:Number(d.get("qty")),p_type:d.get("type"),p_cost:d.get("cost")?Number(d.get("cost")):null,p_notes:d.get("notes")||null});if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Inventario actualizado")}}
function renderPayables(){toolbar("Cuentas por pagar","FINANZAS");const open=state.payables.filter(x=>x.status==="OPEN"),total=open.reduce((a,x)=>a+Number(x.balance||0),0);$("#content").innerHTML='<div class="crm-kpis">'+crmCard("Saldo pendiente",L(total),open.length+" cuentas abiertas")+'</div><div class="list">'+state.payables.map(x=>'<div class="row"><div><b>'+safe(state.suppliers.find(s=>s.id===x.supplier_id)?.name||x.description||"Cuenta por pagar")+'</b><small>Original '+L(x.original_amount)+' · Abonado '+L(x.paid_amount)+' · Saldo '+L(x.balance)+'</small></div><div class="row-actions"><span class="tag">'+(x.status==="PAID"?"PAGADA":"PENDIENTE")+'</span>'+(x.status==="OPEN"?'<button data-payable="'+x.id+'">Abonar</button>':"")+'</div></div>').join("")+'</div>';$("#content").querySelectorAll("[data-payable]").forEach(b=>b.onclick=()=>payPayable(b.dataset.payable))}
function payPayable(id){const x=state.payables.find(v=>v.id===id),f=$("#editForm");f.innerHTML='<h2>Registrar abono</h2><p>Saldo: <b>'+L(x.balance)+'</b></p><div class="form-grid"><label>Monto<input name="amount" type="number" step=".01" max="'+x.balance+'" value="'+x.balance+'" required></label><label>Medio<select name="method"><option>EFECTIVO</option><option>TARJETA</option><option>TRANSFERENCIA</option><option>CHEQUE</option></select></label><label class="wide">Referencia<input name="reference"></label></div><div class="form-actions"><button class="primary">Registrar</button></div>';$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),{error}=await sb.rpc("crm_register_payable_payment_public",{p_payable:id,p_amount:Number(d.get("amount")),p_method:d.get("method"),p_reference:d.get("reference")||null});if(error)return toast(error.message);$("#editDialog").close();await loadAll();render();toast("Abono registrado")}}
function renderCRMReports(){toolbar("Reportes","ANÁLISIS");const sales=state.orders.filter(o=>o.sale_recorded_at&&o.status!=="CANCELLED"),total=sales.reduce((a,x)=>a+Number(x.total||0),0),expenses=state.expenses.reduce((a,x)=>a+Number(x.amount||0),0);$("#content").innerHTML='<div class="crm-kpis">'+crmCard("Ventas",L(total))+crmCard("Gastos",L(expenses))+crmCard("Resultado operativo",L(total-expenses))+crmCard("Inventario valorizado",L(state.inventory.reduce((a,x)=>a+Number(x.qty||0)*Number(x.unit_cost||0),0)))+'</div><div class="crm-panels"><article class="crm-panel"><h2>Ventas por negocio</h2><div class="metric-list"><div><span>La Bandeja</span><b>'+L(sales.filter(x=>x.station==="LB").reduce((a,x)=>a+Number(x.total||0),0))+'</b></div><div><span>Beer Station</span><b>'+L(sales.filter(x=>x.station==="BS").reduce((a,x)=>a+Number(x.total||0),0))+'</b></div></div></article><article class="crm-panel"><h2>Cartera</h2><div class="metric-list"><div><span>Por cobrar</span><b>'+L(state.receivables.filter(x=>x.status==="OPEN").reduce((a,x)=>a+Number(x.balance||0),0))+'</b></div><div><span>Por pagar</span><b>'+L(state.payables.filter(x=>x.status==="OPEN").reduce((a,x)=>a+Number(x.balance||0),0))+'</b></div></div></article></div>'}
function renderConfig(){toolbar("CONFIG","CONFIGURACIÓN DEL SISTEMA");const mods=[["combos","Combos"],["banners","Banners"],["promotions","Promociones"],["extras","Extras y opciones"],["branding","Logos y marcas"],["places","Ubicaciones"],["orders","Pedidos operativos"],["feedback","Feedback"]];$("#content").innerHTML='<div class="config-intro"><b>Configuración del menú y operación</b><span>Productos, clientes, proveedores y categorías se administran desde CATÁLOGO. Las categorías son las mismas que utiliza el menú.</span></div><div class="config-grid">'+mods.map(m=>'<button data-config="'+m[0]+'"><b>'+m[1]+'</b><small>Administrar configuración</small></button>').join("")+'</div>';$("#content").querySelectorAll("[data-config]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.config;render()})}

boot();


function unitObj(code){return state.measureUnits.find(u=>u.code===code)||{code,name:code,symbol:code,dimension:""}}
function qtyText(q,code){const u=unitObj(code);return Number(q||0).toLocaleString("es-HN",{maximumFractionDigits:4})+" "+(u.symbol||code)}
function stockItem(id){return state.ingredientStock.find(x=>x.item_id===id)||{qty_base:0,min_qty_base:0}}
function convertQty(q,from,to){const a=unitObj(from),b=unitObj(to);if(!a.code||!b.code||a.dimension!==b.dimension)return null;return Number(q)*Number(a.factor_to_reference)/Number(b.factor_to_reference)}
function recipeMetrics(r){const lines=state.recipeItems.filter(x=>x.recipe_id===r.id);let raw=0;lines.forEach(x=>{const i=state.inventoryItems.find(z=>z.id===x.item_id);raw+=Number(x.qty_base||0)*(1+Number(x.waste_pct||0)/100)*Number(i?.current_cost||0)});const total=raw*(1+Number(r.overhead_pct||0)/100),unit=Number(r.yield_qty||1)>0?total/Number(r.yield_qty):0,p=state.products.find(x=>x.id===r.product_id),margin=Number(p?.price||0)>0?((Number(p.price)-unit)/Number(p.price))*100:0;return{raw,total,unit,margin,price:Number(p?.price||0)}}
function renderProduction(){
 state.prodView=state.prodView||"overview";
 toolbar("Producción","RESTAURANTE",'<button id="newIngredient">+ Insumo</button><button id="newRecipe">+ Receta</button>');
 const views=[["overview","Resumen"],["ingredients","Insumos"],["presentations","Presentaciones"],["recipes","Recetas"],["waste","Mermas"],["costs","Variación de costos"],["batches","Producción"]];
 const tabs='<div class="prod-tabs">'+views.map(v=>'<button data-prod-view="'+v[0]+'" class="'+(state.prodView===v[0]?"active":"")+'">'+v[1]+'</button>').join("")+'</div>';
 let body="";
 if(state.prodView==="overview") body=renderProductionOverview();
 if(state.prodView==="ingredients") body=renderIngredientView();
 if(state.prodView==="presentations") body=renderPresentationView();
 if(state.prodView==="recipes") body=renderRecipeView();
 if(state.prodView==="waste") body=renderWasteView();
 if(state.prodView==="costs") body=renderCostView();
 if(state.prodView==="batches") body=renderBatchView();
 $("#content").innerHTML=tabs+body;
 $("#content").querySelectorAll("[data-prod-view]").forEach(b=>b.onclick=()=>{state.prodView=b.dataset.prodView;renderProduction()});
 $("#content").querySelectorAll("[data-prod-action]").forEach(b=>b.onclick=()=>{
   const a=b.dataset.prodAction;
   if(a==="ingredient")editIngredient();
   if(a==="recipe")editRecipe();
   if(a==="purchase"){state.tab="purchases";$("#tabs").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x.dataset.tab==="purchases"));renderPurchases()}
   if(a==="waste")registerWaste();
   if(a==="batch")produceRecipe();
 });
 if($("#newIngredient"))$("#newIngredient").onclick=()=>editIngredient();
 if($("#newRecipe"))$("#newRecipe").onclick=()=>editRecipe();
 bindProductionActions();
}
function renderProductionOverview(){
 const stockValue=state.ingredientStock.reduce((a,x)=>{const i=state.inventoryItems.find(z=>z.id===x.item_id);return a+Number(x.qty_base||0)*Number(i?.current_cost||0)},0);
 const low=state.inventoryItems.filter(i=>Number(stockItem(i.id).qty_base)<=Number(stockItem(i.id).min_qty_base));
 const waste=state.wasteRecords.reduce((a,x)=>a+Number(x.total_cost||0),0);
 const changed=state.costHistory.filter(x=>x.variation_pct!=null).slice(0,5);
 let html='<section class="prod-hero"><div><small>COCINA · COSTEO · INVENTARIO</small><h2>Producción del restaurante</h2><p>Define insumos y presentaciones, compra en cualquier unidad, calcula recetas, controla mermas y registra producción real.</p></div>';
 html+='<div class="prod-hero-number"><span>Inventario de insumos</span><b>'+L(stockValue)+'</b><small>'+state.inventoryItems.length+' insumos registrados</small></div></section>';
 html+='<section class="prod-summary">'+crmCard("Insumos",String(state.inventoryItems.length),"Catálogo de materia prima")+crmCard("Recetas",String(state.recipes.length),"Productos con costeo")+crmCard("Mermas",L(waste),state.wasteRecords.length+" registros")+'</section>';
 html+='<section class="production-launch-grid">';
 html+='<button data-prod-action="ingredient"><span>01</span><b>Crear insumo</b><small>Pollo, aceite, queso, cerveza, salsas, empaques...</small></button>';
 html+='<button data-prod-action="purchase"><span>02</span><b>Comprar insumos</b><small>Compra por caja, bolsa, botella, libra, galón o cualquier presentación.</small></button>';
 html+='<button data-prod-action="recipe"><span>03</span><b>Crear receta</b><small>Relaciona los productos vendidos con sus ingredientes y cantidades.</small></button>';
 html+='<button data-prod-action="batch"><span>04</span><b>Registrar producción</b><small>Descarga ingredientes y calcula el costo del lote producido.</small></button>';
 html+='<button data-prod-action="waste"><span>05</span><b>Registrar merma</b><small>Dañado, vencido, derrame, error de preparación o merma natural.</small></button>';
 html+='<button data-prod-view="costs"><span>06</span><b>Ver variación de costos</b><small>Compara costo anterior, costo nuevo y porcentaje de cambio.</small></button></section>';
 html+='<section class="exec-grid prod-overview-grid"><article class="exec-panel"><div class="exec-panel-head"><div><small>FLUJO RECOMENDADO</small><h3>Cómo trabaja KRAKEN</h3></div></div>';
 html+='<div class="prod-flow"><div><b>1. Insumo</b><span>Unidad base</span></div><i>→</i><div><b>2. Presentación</b><span>Conversión</span></div><i>→</i><div><b>3. Compra</b><span>Costo real</span></div><i>→</i><div><b>4. Receta</b><span>Margen</span></div><i>→</i><div><b>5. Producción</b><span>Descargo</span></div></div></article>';
 html+='<article class="exec-panel"><div class="exec-panel-head"><div><small>ALERTAS</small><h3>Inventario y costos</h3></div></div><div class="alert-stack">';
 html+=low.slice(0,4).map(i=>'<div><span>'+safe(i.name)+'</span><b>'+qtyText(stockItem(i.id).qty_base,i.base_unit)+'</b><small>mín. '+qtyText(stockItem(i.id).min_qty_base,i.base_unit)+'</small></div>').join("")||'<div class="empty-admin">Aún no hay alertas. Crea tus primeros insumos.</div>';
 html+='</div><div class="cost-mini">'+changed.map(h=>{const i=state.inventoryItems.find(x=>x.id===h.item_id);return '<div><span>'+safe(i?.name||"")+'</span><b class="'+(Number(h.variation_pct)>0?"up":"down")+'">'+(Number(h.variation_pct)>0?"+":"")+Number(h.variation_pct).toFixed(1)+'%</b></div>'}).join("")+'</div></article></section>';
 return html;
}
function renderIngredientView(){
 const total=state.ingredientStock.reduce((a,x)=>{const i=state.inventoryItems.find(z=>z.id===x.item_id);return a+Number(x.qty_base||0)*Number(i?.current_cost||0)},0);
 return '<div class="prod-summary">'+crmCard("Insumos",state.inventoryItems.length+"","Catálogo activo")+crmCard("Inventario insumos",L(total),"Valorizado al costo actual")+crmCard("Bajo mínimo",state.inventoryItems.filter(i=>Number(stockItem(i.id).qty_base)<=Number(stockItem(i.id).min_qty_base)).length+"","Requieren atención")+'</div><div class="crm-table"><table><thead><tr><th>Insumo</th><th>Unidad base</th><th>Existencia</th><th>Costo base</th><th>Costo anterior</th><th>Variación</th><th>Presentaciones</th><th></th></tr></thead><tbody>'+state.inventoryItems.map(i=>{const st=stockItem(i.id),v=Number(i.previous_cost||0)>0?((Number(i.current_cost)-Number(i.previous_cost))/Number(i.previous_cost))*100:null;return '<tr><td><b>'+safe(i.name)+'</b><small>'+safe(i.category||"")+'</small></td><td>'+safe(unitObj(i.base_unit).name)+'</td><td>'+qtyText(st.qty_base,i.base_unit)+'</td><td><b>'+L(i.current_cost)+'</b> / '+safe(unitObj(i.base_unit).symbol)+'</td><td>'+L(i.previous_cost)+'</td><td><span class="cost-var '+(v>0?"up":v<0?"down":"")+'">'+(v===null?"—":(v>0?"+":"")+v.toFixed(1)+"%")+'</span></td><td>'+state.presentations.filter(x=>x.item_id===i.id).length+'</td><td><button data-presentations="'+i.id+'">Presentaciones</button> <button data-edit-ingredient="'+i.id+'">Editar</button></td></tr>'}).join("")+'</tbody></table></div>';
}
function renderRecipeView(){
 return '<div class="recipe-grid">'+state.recipes.map(r=>{const p=state.products.find(x=>x.id===r.product_id),m=recipeMetrics(r),n=state.recipeItems.filter(x=>x.recipe_id===r.id).length;return '<article class="recipe-card"><div><small>RECETA · '+n+' INSUMOS</small><h3>'+safe(p?.name||"Producto")+'</h3><p>Rinde '+Number(r.yield_qty)+' '+safe(unitObj(r.yield_unit).symbol||r.yield_unit)+' · Indirectos '+Number(r.overhead_pct||0).toFixed(1)+'%</p></div><div class="recipe-numbers"><div><span>Costo receta</span><b>'+L(m.total)+'</b></div><div><span>Costo unitario</span><b>'+L(m.unit)+'</b></div><div><span>Venta</span><b>'+L(m.price)+'</b></div><div><span>Margen</span><b class="'+(m.margin<25?"margin-low":"")+'">'+m.margin.toFixed(1)+'%</b></div></div><div class="recipe-actions"><button data-recipe-items="'+r.id+'">Insumos</button><button data-produce="'+r.id+'">Producir</button><button data-edit-recipe="'+r.id+'">Editar</button></div></article>'}).join("")||'<div class="empty-admin">Aún no hay recetas. Crea la primera receta del restaurante.</div>';}
function renderWasteView(){
 const loss=state.wasteRecords.reduce((a,x)=>a+Number(x.total_cost||0),0);
 return '<div class="prod-summary">'+crmCard("Costo de merma",L(loss),state.wasteRecords.length+" registros")+'</div><div class="section-actions"><button id="newWaste">+ Registrar merma</button></div><div class="crm-table"><table><thead><tr><th>Fecha</th><th>Insumo</th><th>Cantidad</th><th>Motivo</th><th>Negocio</th><th>Costo perdido</th></tr></thead><tbody>'+state.wasteRecords.map(w=>{const i=state.inventoryItems.find(x=>x.id===w.item_id);return '<tr><td>'+safe(w.waste_date)+'</td><td><b>'+safe(i?.name||"")+'</b></td><td>'+qtyText(w.qty_base,i?.base_unit)+'</td><td>'+safe(w.reason)+'</td><td>'+safe(w.station)+'</td><td><b>'+L(w.total_cost)+'</b></td></tr>'}).join("")+'</tbody></table></div>';
}
function renderCostView(){
 return '<div class="crm-table"><table><thead><tr><th>Fecha</th><th>Insumo</th><th>Origen</th><th>Costo anterior</th><th>Costo nuevo</th><th>Variación</th><th>Compra</th></tr></thead><tbody>'+state.costHistory.map(h=>{const i=state.inventoryItems.find(x=>x.id===h.item_id);return '<tr><td>'+new Date(h.recorded_at).toLocaleString("es-HN")+'</td><td><b>'+safe(i?.name||"")+'</b></td><td>'+safe(h.source)+'</td><td>'+L(h.old_cost)+'</td><td><b>'+L(h.new_cost)+'</b></td><td><span class="cost-var '+(Number(h.variation_pct)>0?"up":Number(h.variation_pct)<0?"down":"")+'">'+(h.variation_pct==null?"—":(Number(h.variation_pct)>0?"+":"")+Number(h.variation_pct).toFixed(1)+"%")+'</span></td><td>'+L(h.total_cost)+'</td></tr>'}).join("")+'</tbody></table></div>';
}
function renderBatchView(){
 return '<div class="section-actions"><button id="newBatch">+ Registrar producción</button></div><div class="crm-table"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Lotes</th><th>Salida</th><th>Costo total</th><th>Costo unitario</th><th>Negocio</th></tr></thead><tbody>'+state.productionBatches.map(b=>{const r=state.recipes.find(x=>x.id===b.recipe_id),p=state.products.find(x=>x.id===r?.product_id);return '<tr><td>'+safe(b.production_date)+'</td><td><b>'+safe(p?.name||"")+'</b></td><td>'+Number(b.batches)+'</td><td>'+Number(b.output_qty)+'</td><td>'+L(b.total_cost)+'</td><td><b>'+L(b.unit_cost)+'</b></td><td>'+safe(b.station)+'</td></tr>'}).join("")+'</tbody></table></div>';
}

function bindProductionActions(){
 $("#content").querySelectorAll("[data-edit-ingredient]").forEach(b=>b.onclick=()=>editIngredient(b.dataset.editIngredient));
 $("#content").querySelectorAll("[data-presentations]").forEach(b=>b.onclick=()=>managePresentations(b.dataset.presentations));
 $("#content").querySelectorAll("[data-edit-recipe]").forEach(b=>b.onclick=()=>editRecipe(b.dataset.editRecipe));
 $("#content").querySelectorAll("[data-recipe-items]").forEach(b=>b.onclick=()=>manageRecipeItems(b.dataset.recipeItems));
 $("#content").querySelectorAll("[data-produce]").forEach(b=>b.onclick=()=>produceRecipe(b.dataset.produce));
 if($("#newWaste"))$("#newWaste").onclick=()=>registerWaste();
 if($("#newBatch"))$("#newBatch").onclick=()=>produceRecipe();
}
function editIngredient(id){
 const x=id?state.inventoryItems.find(v=>v.id===id):{},st=id?stockItem(id):{};
 const f=$("#editForm");
 f.innerHTML='<h2>'+(id?"Editar":"Nuevo")+' insumo</h2><div class="form-grid"><label>Nombre<input name="name" value="'+safe(x.name||"")+'" required></label><label>Categoría<input name="category" value="'+safe(x.category||"")+'" placeholder="Carnes, bebidas, secos..."></label><label>Unidad base<select name="base_unit">'+state.measureUnits.map(u=>'<option value="'+u.code+'" '+(x.base_unit===u.code?"selected":"")+'>'+safe(u.name)+' ('+safe(u.symbol)+')</option>').join("")+'</select></label><label>Stock mínimo<input name="min_qty" type="number" step=".0001" value="'+Number(st.min_qty_base||0)+'"></label><label>Proveedor preferido<select name="supplier"><option value="">Sin proveedor</option>'+state.suppliers.map(v=>'<option value="'+v.id+'" '+(x.preferred_supplier_id===v.id?"selected":"")+'>'+safe(v.name)+'</option>').join("")+'</select></label><label class="wide">Notas<textarea name="notes">'+safe(x.notes||"")+'</textarea></label></div><div class="form-actions"><button class="primary">Guardar insumo</button></div>';
 $("#editDialog").showModal();
 f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),row={name:d.get("name"),category:d.get("category"),base_unit:d.get("base_unit"),preferred_supplier_id:d.get("supplier")||null,notes:d.get("notes"),active:true,updated_at:new Date().toISOString()};let q=id?sb.from("inventory_items").update(row).eq("id",id):sb.from("inventory_items").insert(row).select().single();const res=await q;if(res.error)return toast(res.error.message);const iid=id||res.data.id;await sb.from("inventory_item_stock").upsert({item_id:iid,min_qty_base:Number(d.get("min_qty")||0)});$("#editDialog").close();await loadAll();state.prodView="ingredients";renderProduction();toast("Insumo guardado")};
}
function managePresentations(itemId){
 const item=state.inventoryItems.find(x=>x.id===itemId),list=state.presentations.filter(x=>x.item_id===itemId),f=$("#editForm");
 f.innerHTML='<h2>Presentaciones · '+safe(item?.name||"")+'</h2><p class="form-help">Unidad base: <b>'+safe(unitObj(item?.base_unit).name)+'</b>. Puedes crear botella, bolsa, caja, saco, galón, etc.</p><div class="presentation-list">'+list.map(p=>'<div class="presentation-row"><div><b>'+safe(p.name)+'</b><small>'+Number(p.measure_qty)+' '+safe(unitObj(p.measure_unit).symbol)+' = '+qtyText(p.base_qty,item.base_unit)+'</small></div></div>').join("")+'</div><hr><div class="form-grid"><label>Nombre presentación<input name="name" placeholder="Ej. Caja 12 botellas" required></label><label>Contenido total<input name="measure_qty" type="number" step=".0001" required></label><label>Unidad del contenido<select name="measure_unit">'+state.measureUnits.filter(u=>u.dimension===unitObj(item?.base_unit).dimension).map(u=>'<option value="'+u.code+'">'+safe(u.name)+' ('+safe(u.symbol)+')</option>').join("")+'</select></label><label>Código / barra<input name="barcode"></label></div><div class="form-actions"><button class="primary">Agregar presentación</button></div>';
 $("#editDialog").showModal();
 f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),base=convertQty(Number(d.get("measure_qty")),d.get("measure_unit"),item.base_unit);if(base==null||base<=0)return toast("La unidad no es compatible");const{error}=await sb.from("item_presentations").insert({item_id:itemId,name:d.get("name"),purchase_unit:d.get("name"),measure_qty:Number(d.get("measure_qty")),measure_unit:d.get("measure_unit"),base_qty:base,barcode:d.get("barcode")||null,active:true});if(error)return toast(error.message);$("#editDialog").close();await loadAll();managePresentations(itemId);toast("Presentación agregada")};
}
function editRecipe(id){
 const x=id?state.recipes.find(v=>v.id===id):{},f=$("#editForm");
 f.innerHTML='<h2>'+(id?"Editar":"Nueva")+' receta</h2><div class="form-grid"><label class="wide">Producto de venta<select name="product_id">'+state.products.map(p=>'<option value="'+p.id+'" '+(x.product_id===p.id?"selected":"")+'>'+safe(p.name)+' · '+L(p.price)+'</option>').join("")+'</select></label><label>Rendimiento<input name="yield_qty" type="number" step=".01" value="'+Number(x.yield_qty||1)+'"></label><label>Unidad rendimiento<select name="yield_unit">'+state.measureUnits.map(u=>'<option value="'+u.code+'" '+(x.yield_unit===u.code?"selected":"")+'>'+safe(u.name)+'</option>').join("")+'</select></label><label>% costos indirectos<input name="overhead_pct" type="number" step=".01" value="'+Number(x.overhead_pct||0)+'"></label><label class="wide">Notas<textarea name="notes">'+safe(x.notes||"")+'</textarea></label></div><div class="form-actions"><button class="primary">Guardar receta</button></div>';
 $("#editDialog").showModal();
 f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),row={product_id:d.get("product_id"),yield_qty:Number(d.get("yield_qty")||1),yield_unit:d.get("yield_unit"),overhead_pct:Number(d.get("overhead_pct")||0),notes:d.get("notes"),active:true,updated_at:new Date().toISOString()};const q=id?sb.from("recipes").update(row).eq("id",id):sb.from("recipes").insert(row);const{error}=await q;if(error)return toast(error.message);$("#editDialog").close();await loadAll();state.prodView="recipes";renderProduction();toast("Receta guardada")};
}
function manageRecipeItems(recipeId){
 const r=state.recipes.find(x=>x.id===recipeId),p=state.products.find(x=>x.id===r?.product_id),lines=state.recipeItems.filter(x=>x.recipe_id===recipeId),f=$("#editForm");
 f.innerHTML='<h2>Insumos · '+safe(p?.name||"Receta")+'</h2><div class="presentation-list">'+lines.map(x=>{const i=state.inventoryItems.find(v=>v.id===x.item_id);return '<div class="presentation-row"><div><b>'+safe(i?.name||"")+'</b><small>'+qtyText(x.qty_base,i?.base_unit)+' · merma técnica '+Number(x.waste_pct||0).toFixed(1)+'% · '+L(Number(x.qty_base)*Number(i?.current_cost||0))+'</small></div><button type="button" data-del-ri="'+x.id+'">Quitar</button></div>'}).join("")+'</div><hr><div class="form-grid"><label>Insumo<select name="item">'+state.inventoryItems.map(i=>'<option value="'+i.id+'">'+safe(i.name)+'</option>').join("")+'</select></label><label>Cantidad<input name="qty" type="number" step=".0001" required></label><label>Unidad<select name="unit"></select></label><label>% merma técnica<input name="waste_pct" type="number" step=".01" value="0"></label></div><div class="form-actions"><button class="primary">Agregar insumo</button></div>';
 const refreshUnits=()=>{const i=state.inventoryItems.find(x=>x.id===f.elements.item.value),dim=unitObj(i?.base_unit).dimension;f.elements.unit.innerHTML=state.measureUnits.filter(u=>u.dimension===dim).map(u=>'<option value="'+u.code+'">'+safe(u.name)+'</option>').join("");f.elements.unit.value=i?.base_unit||""};refreshUnits();f.elements.item.onchange=refreshUnits;
 $("#editDialog").showModal();
 f.querySelectorAll("[data-del-ri]").forEach(b=>b.onclick=async()=>{await sb.from("recipe_items").delete().eq("id",b.dataset.delRi);await loadAll();$("#editDialog").close();manageRecipeItems(recipeId)});
 f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),i=state.inventoryItems.find(x=>x.id===d.get("item")),base=convertQty(Number(d.get("qty")),d.get("unit"),i.base_unit);if(base==null)return toast("Unidad incompatible");const{error}=await sb.from("recipe_items").upsert({recipe_id:recipeId,item_id:i.id,qty_base:base,waste_pct:Number(d.get("waste_pct")||0),sort_order:lines.length},{onConflict:"recipe_id,item_id"});if(error)return toast(error.message);$("#editDialog").close();await loadAll();manageRecipeItems(recipeId)};
}
function registerWaste(){
 const f=$("#editForm");f.innerHTML='<h2>Registrar merma</h2><div class="form-grid"><label>Insumo<select name="item">'+state.inventoryItems.map(i=>'<option value="'+i.id+'">'+safe(i.name)+'</option>').join("")+'</select></label><label>Cantidad<input name="qty" type="number" step=".0001" required></label><label>Unidad<select name="unit"></select></label><label>Negocio<select name="station"><option value="LB">La Bandeja</option><option value="BS">Beer Station</option></select></label><label>Motivo<select name="reason"><option>Dañado</option><option>Vencido</option><option>Error de preparación</option><option>Derrame</option><option>Merma natural</option><option>Otro</option></select></label><label class="wide">Nota<input name="notes"></label></div><div class="form-actions"><button class="primary">Registrar y descontar</button></div>';const refresh=()=>{const i=state.inventoryItems.find(x=>x.id===f.elements.item.value),dim=unitObj(i?.base_unit).dimension;f.elements.unit.innerHTML=state.measureUnits.filter(u=>u.dimension===dim).map(u=>'<option value="'+u.code+'">'+u.name+'</option>').join("");f.elements.unit.value=i?.base_unit||""};refresh();f.elements.item.onchange=refresh;$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),i=state.inventoryItems.find(x=>x.id===d.get("item")),base=convertQty(Number(d.get("qty")),d.get("unit"),i.base_unit);const{error}=await sb.rpc("restaurant_register_waste_public",{p_item:i.id,p_qty_base:base,p_reason:d.get("reason"),p_station:d.get("station"),p_notes:d.get("notes")||null});if(error)return toast(error.message);$("#editDialog").close();await loadAll();state.prodView="waste";renderProduction();toast("Merma registrada")}}
function produceRecipe(recipeId){
 const f=$("#editForm");f.innerHTML='<h2>Registrar producción</h2><div class="form-grid"><label>Receta<select name="recipe">'+state.recipes.map(r=>{const p=state.products.find(x=>x.id===r.product_id);return '<option value="'+r.id+'" '+(recipeId===r.id?"selected":"")+'>'+safe(p?.name||"Receta")+'</option>'}).join("")+'</select></label><label>Lotes / tandas<input name="batches" type="number" step=".01" value="1" required></label><label>Negocio<select name="station"><option value="LB">La Bandeja</option><option value="BS">Beer Station</option></select></label><label class="wide">Notas<input name="notes"></label></div><div class="form-actions"><button class="primary">Producir y descargar insumos</button></div>';$("#editDialog").showModal();f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),{data,error}=await sb.rpc("restaurant_produce_recipe_public",{p_recipe:d.get("recipe"),p_batches:Number(d.get("batches")),p_station:d.get("station"),p_notes:d.get("notes")||null});if(error)return toast(error.message);$("#editDialog").close();await loadAll();state.prodView="batches";renderProduction();toast("Producción registrada · costo "+L(data?.total_cost||0))}}

function renderPurchases(){
 state.purchaseView=state.purchaseView||"normal";
 state.purchaseDraftLines=state.purchaseDraftLines||[];
 toolbar("Compras","ABASTECIMIENTO");
 const tabs='<div class="purchase-subtabs"><button data-purchase-view="normal" class="'+(state.purchaseView==="normal"?"active":"")+'">Normal</button><button data-purchase-view="products" class="'+(state.purchaseView==="products"?"active":"")+'">Con productos</button></div>';
 $("#content").innerHTML=tabs+'<div id="purchaseWorkspace"></div>';
 $("#content").querySelectorAll("[data-purchase-view]").forEach(b=>b.onclick=()=>{state.purchaseView=b.dataset.purchaseView;renderPurchases()});
 if(state.purchaseView==="normal")renderNormalPurchaseWorkspace();
 else renderProductPurchaseWorkspace();
}
function renderNormalPurchaseWorkspace(){
 const rows=state.purchases.filter(x=>x.purchase_kind!=="PRODUCTS");
 const total=rows.reduce((a,x)=>a+Number(x.total||0),0);
 $("#purchaseWorkspace").innerHTML='<div class="purchase-view-head"><div><small>COMPRA NORMAL</small><h2>Compras sin productos</h2><p>Servicios, suministros, mantenimiento u otras compras que no afectan inventario.</p></div><button id="newGeneralPurchase" class="purchase-new-btn">+ Registrar compra normal</button></div>'+
 '<div class="prod-summary">'+crmCard("Total compras",L(total),rows.length+" documentos")+crmCard("Contado",L(rows.filter(x=>x.payment_type==="CONTADO").reduce((a,x)=>a+Number(x.total||0),0)),"Compras pagadas")+crmCard("Crédito",L(rows.filter(x=>x.payment_type==="CREDITO").reduce((a,x)=>a+Number(x.total||0),0)),"Generan CxP")+'</div>'+
 '<div class="crm-table"><table><thead><tr><th>Fecha</th><th>Proveedor</th><th>Factura</th><th>Negocio</th><th>Pago</th><th>Total</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+safe(x.purchase_date)+'</td><td>'+safe(state.suppliers.find(s=>s.id===x.supplier_id)?.name||"—")+'</td><td>'+safe(x.invoice_number||"—")+'</td><td>'+safe(x.station)+'</td><td>'+safe(x.payment_type)+'</td><td><b>'+L(x.total)+'</b></td></tr>').join("")+'</tbody></table></div>';
 $("#newGeneralPurchase").onclick=()=>editPurchaseGeneral();
}
function ensurePurchaseDraftHeader(){
 if(!state.purchaseDraftHeader)state.purchaseDraftHeader={supplier_id:"",station:"LB",invoice_number:"",invoice_total:"",purchase_date:new Date().toISOString().slice(0,10),payment_type:"CONTADO",notes:""};
 return state.purchaseDraftHeader;
}
function capturePurchaseDraftHeader(){
 const h=ensurePurchaseDraftHeader();
 if($("#ppSupplier"))h.supplier_id=$("#ppSupplier").value;
 if($("#ppStation"))h.station=$("#ppStation").value;
 if($("#ppInvoice"))h.invoice_number=$("#ppInvoice").value;
 if($("#ppInvoiceTotal"))h.invoice_total=$("#ppInvoiceTotal").value;
 if($("#ppDate"))h.purchase_date=$("#ppDate").value;
 if($("#ppPayment"))h.payment_type=$("#ppPayment").value;
 if($("#ppNotes"))h.notes=$("#ppNotes").value;
 return h;
}
function renderProductPurchaseWorkspace(){
 const lines=state.purchaseDraftLines||[],h=ensurePurchaseDraftHeader();
 const detailTotal=lines.reduce((a,x)=>a+Number(x.line_total||0),0),invoiceTotal=Number(h.invoice_total||0),difference=invoiceTotal-detailTotal;
 $("#purchaseWorkspace").innerHTML='<section class="product-purchase-shell">'+
 '<div class="purchase-form-title"><div><small>COMPRA CON PRODUCTOS</small><h2>Factura de compra</h2><p>Registra la factura y agrega todos sus productos. KRAKEN convierte cada presentación a la unidad base y actualiza costos e inventario.</p></div><div class="purchase-total-box"><span>Total factura</span><b id="draftPurchaseTotal">'+L(invoiceTotal)+'</b><small>Detalle '+L(detailTotal)+'</small></div></div>'+
 '<div class="purchase-header-grid"><label>Proveedor<select id="ppSupplier"><option value="">Seleccionar proveedor</option>'+state.suppliers.map(x=>'<option value="'+x.id+'" '+(h.supplier_id===x.id?"selected":"")+'>'+safe(x.name)+'</option>').join("")+'</select></label><label>Número de factura<input id="ppInvoice" value="'+safe(h.invoice_number||"")+'" placeholder="Ej. 000-001-01-00012345"></label><label>Total factura<input id="ppInvoiceTotal" type="number" min="0" step=".01" value="'+safe(h.invoice_total||"")+'" placeholder="L 0.00"></label><label>Fecha<input id="ppDate" type="date" value="'+safe(h.purchase_date||new Date().toISOString().slice(0,10))+'"></label><label>Negocio<select id="ppStation"><option value="LB" '+(h.station==="LB"?"selected":"")+'>La Bandeja</option><option value="BS" '+(h.station==="BS"?"selected":"")+'>Beer Station</option></select></label><label>Forma de compra<select id="ppPayment"><option value="CONTADO" '+(h.payment_type==="CONTADO"?"selected":"")+'>Contado</option><option value="CREDITO" '+(h.payment_type==="CREDITO"?"selected":"")+'>Crédito</option></select></label><label class="wide">Notas<input id="ppNotes" value="'+safe(h.notes||"")+'" placeholder="Observaciones opcionales"></label></div>'+
 '<div class="purchase-product-builder"><div class="builder-title"><div><small>AGREGAR PRODUCTO</small><h3>Producto y conversión</h3></div><button type="button" id="ppNewPresentation">+ Nueva presentación</button></div>'+
 '<div class="purchase-line-grid purchase-line-grid-v2"><label>Producto<select id="ppItem"><option value="">Seleccionar producto</option>'+state.inventoryItems.map(i=>'<option value="'+i.id+'">'+safe(i.name)+'</option>').join("")+'</select></label><label>Presentación<select id="ppPresentation"></select></label><label>Cantidad<input id="ppQty" type="number" min=".0001" step=".0001" value="1"></label><label>Contenido por presentación<input id="ppContentQty" type="number" min=".0001" step=".0001" placeholder="Ej. 750"></label><label>Unidad de medida<select id="ppMeasureUnit"></select></label><label>Total producto<input id="ppLineTotal" type="number" min="0" step=".01" placeholder="L 0.00"></label></div>'+
 '<div id="ppConversion" class="purchase-conversion-panel"></div><button type="button" id="ppAddLine" class="purchase-add-line">+ Agregar producto</button></div>'+
 '<div class="purchase-lines-panel"><div class="purchase-lines-head"><h3>Productos de la factura</h3><span>'+lines.length+' productos</span></div>'+renderPurchaseDraftLines(lines)+'</div>'+
 '<div class="invoice-balance '+(Math.abs(difference)<=0.01&&invoiceTotal>0?"ok":"")+'"><div><span>Total factura</span><b>'+L(invoiceTotal)+'</b></div><div><span>Suma productos</span><b>'+L(detailTotal)+'</b></div><div><span>Diferencia</span><b>'+L(difference)+'</b></div></div>'+
 '<div class="purchase-savebar"><div><span>Total factura</span><b>'+L(invoiceTotal)+'</b></div><button id="ppClear" type="button">Limpiar factura</button><button id="ppSave" type="button" class="primary">Agregar factura</button></div></section>'+
 renderRecentProductPurchases();
 bindProductPurchaseForm();
}
function renderPurchaseDraftLines(lines){
 if(!lines.length)return '<div class="empty-purchase-lines">Agrega el primer producto para construir la compra.</div>';
 return '<div class="crm-table purchase-draft-table"><table><thead><tr><th>Producto</th><th>Presentación</th><th>Cant.</th><th>Medida</th><th>Conversión</th><th>Costo base</th><th>Variación</th><th>Total</th><th></th></tr></thead><tbody>'+lines.map((x,idx)=>{const v=x.old_cost>0?((x.unit_cost_base-x.old_cost)/x.old_cost)*100:null;return '<tr><td><b>'+safe(x.item_name)+'</b></td><td>'+safe(x.presentation_name)+'</td><td>'+Number(x.qty).toLocaleString("es-HN",{maximumFractionDigits:4})+'</td><td>'+Number(x.content_qty||0).toLocaleString("es-HN",{maximumFractionDigits:4})+' '+safe(unitObj(x.measure_unit).symbol)+'</td><td>'+qtyText(x.base_qty,x.base_unit)+'</td><td>'+L(x.unit_cost_base)+' / '+safe(unitObj(x.base_unit).symbol)+'</td><td><span class="cost-var '+(v>0?"up":v<0?"down":"")+'">'+(v===null?"Nuevo":(v>0?"+":"")+v.toFixed(1)+"%")+'</span></td><td><b>'+L(x.line_total)+'</b></td><td><button data-remove-draft="'+idx+'">Quitar</button></td></tr>'}).join("")+'</tbody></table></div>';
}
function renderRecentProductPurchases(){
 const rows=state.purchases.filter(x=>x.purchase_kind==="PRODUCTS").slice(0,10);
 if(!rows.length)return '';
 return '<section class="recent-product-purchases"><div class="purchase-lines-head"><h3>Compras recientes con productos</h3><span>'+rows.length+' recientes</span></div><div class="crm-table"><table><thead><tr><th>Fecha</th><th>Proveedor</th><th>Factura</th><th>Pago</th><th>Productos</th><th>Total</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+safe(x.purchase_date)+'</td><td>'+safe(state.suppliers.find(s=>s.id===x.supplier_id)?.name||"—")+'</td><td>'+safe(x.invoice_number||"—")+'</td><td>'+safe(x.payment_type)+'</td><td>'+state.purchaseItems.filter(i=>i.purchase_id===x.id).length+'</td><td><b>'+L(x.total)+'</b></td></tr>').join("")+'</tbody></table></div></section>';
}
function bindProductPurchaseForm(){
 const itemEl=$("#ppItem"),presEl=$("#ppPresentation"),qtyEl=$("#ppQty"),contentEl=$("#ppContentQty"),unitEl=$("#ppMeasureUnit"),lineEl=$("#ppLineTotal"),conv=$("#ppConversion");
 const saveHeader=()=>capturePurchaseDraftHeader();
 ["ppSupplier","ppStation","ppInvoice","ppInvoiceTotal","ppDate","ppPayment","ppNotes"].forEach(id=>{const el=$("#"+id);if(el)el.onchange=saveHeader});
 const refreshUnits=()=>{
   const item=state.inventoryItems.find(x=>x.id===itemEl.value);
   if(!item){unitEl.innerHTML="";return}
   const dim=unitObj(item.base_unit).dimension;
   unitEl.innerHTML=state.measureUnits.filter(u=>u.dimension===dim&&u.active!==false).map(u=>'<option value="'+u.code+'">'+safe(u.name)+' ('+safe(u.symbol)+')</option>').join("");
 };
 const refreshPresentations=()=>{
   const iid=itemEl.value,item=state.inventoryItems.find(x=>x.id===iid),ps=state.presentations.filter(x=>x.item_id===iid&&x.active!==false);
   presEl.innerHTML='<option value="">Seleccionar presentación</option>'+ps.map(p=>'<option value="'+p.id+'">'+safe(p.name)+'</option>').join("");
   refreshUnits();
   if(item)unitEl.value=item.base_unit;
   contentEl.value="";
   preview();
 };
 const loadPresentation=()=>{
   const pr=state.presentations.find(x=>x.id===presEl.value);
   if(pr){contentEl.value=Number(pr.measure_qty||0)||"";refreshUnits();unitEl.value=pr.measure_unit||unitEl.value}
   preview();
 };
 const preview=()=>{
   const item=state.inventoryItems.find(x=>x.id===itemEl.value),pr=state.presentations.find(x=>x.id===presEl.value),qty=Number(qtyEl.value||0),content=Number(contentEl.value||0),lineTotal=Number(lineEl.value||0),measure=unitEl.value;
   if(!item){conv.innerHTML='<span>Selecciona un producto.</span>';return}
   if(!pr){conv.innerHTML='<div class="conversion-empty"><b>Selecciona una presentación.</b><span>Si no existe, créala desde “Nueva presentación”.</span></div>';return}
   const oneBase=convertQty(content,measure,item.base_unit);
   if(oneBase==null){conv.innerHTML='<div class="conversion-empty"><b>Unidad incompatible.</b><span>Selecciona una unidad de la misma dimensión que '+safe(unitObj(item.base_unit).name)+'.</span></div>';return}
   const baseQty=qty*oneBase,newCost=baseQty>0?lineTotal/baseQty:0,old=Number(item.current_cost||0),variation=old>0?((newCost-old)/old)*100:null,unitPerPresentation=qty>0?lineTotal/qty:0;
   conv.innerHTML='<div><span>Presentaciones</span><b>'+Number(qty).toLocaleString("es-HN",{maximumFractionDigits:4})+' × '+safe(pr.name)+'</b></div><div><span>Contenido</span><b>'+Number(content).toLocaleString("es-HN",{maximumFractionDigits:4})+' '+safe(unitObj(measure).symbol)+'</b></div><div><span>Conversión total</span><b>'+qtyText(baseQty,item.base_unit)+'</b></div><div><span>Costo / presentación</span><b>'+L(unitPerPresentation)+'</b></div><div><span>Costo anterior</span><b>'+L(old)+' / '+safe(unitObj(item.base_unit).symbol)+'</b></div><div><span>Nuevo costo base</span><b>'+L(newCost)+' / '+safe(unitObj(item.base_unit).symbol)+'</b></div><div><span>Variación</span><b class="'+(variation>0?"up":variation<0?"down":"")+'">'+(variation===null?"Primer costo":(variation>0?"+":"")+variation.toFixed(2)+"%")+'</b></div><div><span>Total producto</span><b>'+L(lineTotal)+'</b></div>';
 };
 itemEl.onchange=refreshPresentations;presEl.onchange=loadPresentation;qtyEl.oninput=preview;contentEl.oninput=preview;unitEl.onchange=preview;lineEl.oninput=preview;
 $("#ppInvoiceTotal").oninput=()=>{saveHeader();const total=Number($("#ppInvoiceTotal").value||0);$("#draftPurchaseTotal").textContent=L(total)};
 $("#ppNewPresentation").onclick=()=>{const iid=itemEl.value;if(!iid)return toast("Selecciona un producto");capturePurchaseDraftHeader();managePresentations(iid)};
 $("#ppAddLine").onclick=()=>{
   capturePurchaseDraftHeader();
   const item=state.inventoryItems.find(x=>x.id===itemEl.value),pr=state.presentations.find(x=>x.id===presEl.value),qty=Number(qtyEl.value||0),content=Number(contentEl.value||0),lineTotal=Number(lineEl.value||0),measure=unitEl.value;
   if(!item)return toast("Selecciona un producto");
   if(!pr)return toast("Selecciona una presentación");
   if(qty<=0)return toast("Ingresa una cantidad válida");
   if(content<=0)return toast("Ingresa el contenido de la presentación");
   if(lineTotal<0)return toast("Total del producto inválido");
   const oneBase=convertQty(content,measure,item.base_unit);if(oneBase==null)return toast("Unidad de medida incompatible");
   const baseQty=qty*oneBase,unitCostBase=baseQty>0?lineTotal/baseQty:0;
   state.purchaseDraftLines.push({item_id:item.id,item_name:item.name,base_unit:item.base_unit,presentation_id:pr.id,presentation_name:pr.name,qty,content_qty:content,measure_unit:measure,line_total:lineTotal,base_qty:baseQty,unit_cost_base:unitCostBase,old_cost:Number(item.current_cost||0)});
   renderProductPurchaseWorkspace();
 };
 $("#purchaseWorkspace").querySelectorAll("[data-remove-draft]").forEach(b=>b.onclick=()=>{capturePurchaseDraftHeader();state.purchaseDraftLines.splice(Number(b.dataset.removeDraft),1);renderProductPurchaseWorkspace()});
 $("#ppClear").onclick=()=>{state.purchaseDraftLines=[];state.purchaseDraftHeader=null;renderProductPurchaseWorkspace()};
 $("#ppSave").onclick=saveProductPurchase;
}
async function saveProductPurchase(){
 const lines=state.purchaseDraftLines||[],h=capturePurchaseDraftHeader();
 if(!h.supplier_id)return toast("Selecciona un proveedor");
 if(!String(h.invoice_number||"").trim())return toast("Ingresa el número de factura");
 const invoiceTotal=Number(h.invoice_total||0);if(invoiceTotal<=0)return toast("Ingresa el total de la factura");
 if(!lines.length)return toast("Agrega al menos un producto");
 const detailTotal=lines.reduce((a,x)=>a+Number(x.line_total||0),0);
 if(Math.abs(detailTotal-invoiceTotal)>0.01)return toast("La suma de productos "+L(detailTotal)+" no coincide con el total factura "+L(invoiceTotal));
 const payload={supplier_id:h.supplier_id,station:h.station,invoice_number:String(h.invoice_number).trim(),invoice_total:invoiceTotal,purchase_date:h.purchase_date,payment_type:h.payment_type,notes:String(h.notes||"").trim(),items:lines.map(x=>({item_id:x.item_id,presentation_id:x.presentation_id,qty:x.qty,content_qty:x.content_qty,measure_unit:x.measure_unit,line_total:x.line_total}))};
 const btn=$("#ppSave");btn.disabled=true;btn.textContent="Agregando factura...";
 const{data,error}=await sb.rpc("restaurant_create_product_purchase_public",{p_payload:payload});
 if(error){btn.disabled=false;btn.textContent="Agregar factura";return toast(error.message)}
 state.purchaseDraftLines=[];state.purchaseDraftHeader=null;await loadAll();renderProductPurchaseWorkspace();toast("Factura agregada · "+L(data?.total||0));
}
function purchaseHeaderForm(title,kind){
 const f=$("#editForm");
 f.innerHTML='<h2>'+title+'</h2><div class="form-grid"><label>Proveedor<select name="supplier_id"><option value="">Sin proveedor</option>'+state.suppliers.map(x=>'<option value="'+x.id+'">'+safe(x.name)+'</option>').join("")+'</select></label><label>Negocio<select name="station"><option value="LB">La Bandeja</option><option value="BS">Beer Station</option></select></label><label>Factura / documento<input name="invoice_number"></label><label>Fecha<input name="purchase_date" type="date" value="'+new Date().toISOString().slice(0,10)+'"></label><label>Pago<select name="payment_type"><option>CONTADO</option><option>CREDITO</option></select></label>'+(kind==="GENERAL"?'<label>Total<input name="total" type="number" step=".01" required></label>':"")+'<label class="wide">Notas<textarea name="notes"></textarea></label></div><div class="form-actions"><button class="primary">'+(kind==="PRODUCTS"?"Crear compra y agregar productos":"Registrar compra")+'</button></div>';
 $("#editDialog").showModal();return f;
}
function editPurchaseGeneral(){
 const f=purchaseHeaderForm("Compra normal","GENERAL");
 f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),total=Number(d.get("total")||0),row={supplier_id:d.get("supplier_id")||null,station:d.get("station"),invoice_number:d.get("invoice_number"),purchase_date:d.get("purchase_date"),payment_type:d.get("payment_type"),purchase_kind:"GENERAL",subtotal:total,total,notes:d.get("notes")};const{data,error}=await sb.from("purchases").insert(row).select().single();if(error)return toast(error.message);if(row.payment_type==="CREDITO"&&total>0)await sb.from("payables").insert({supplier_id:row.supplier_id,purchase_id:data.id,description:"Compra general "+(row.invoice_number||""),original_amount:total,paid_amount:0,balance:total,status:"OPEN"});$("#editDialog").close();await loadAll();renderPurchases();toast("Compra general registrada")};
}
function editPurchaseProducts(){
 if(!state.inventoryItems.length)return toast("Primero crea insumos en Producción");
 const f=purchaseHeaderForm("Compra con productos","PRODUCTS");
 f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),row={supplier_id:d.get("supplier_id")||null,station:d.get("station"),invoice_number:d.get("invoice_number"),purchase_date:d.get("purchase_date"),payment_type:d.get("payment_type"),purchase_kind:"PRODUCTS",subtotal:0,total:0,notes:d.get("notes")};const{data,error}=await sb.from("purchases").insert(row).select().single();if(error)return toast(error.message);$("#editDialog").close();await loadAll();managePurchaseItems(data.id)};
}
async function syncPurchasePayable(purchase){
 if(purchase.payment_type!=="CREDITO")return;
 const{data:existing}=await sb.from("payables").select("*").eq("purchase_id",purchase.id).maybeSingle();
 if(existing){const paid=Number(existing.paid_amount||0),balance=Math.max(0,Number(purchase.total||0)-paid);await sb.from("payables").update({supplier_id:purchase.supplier_id,original_amount:Number(purchase.total||0),balance,status:balance<=0?"PAID":"OPEN"}).eq("id",existing.id)}
 else if(Number(purchase.total||0)>0) await sb.from("payables").insert({supplier_id:purchase.supplier_id,purchase_id:purchase.id,description:"Compra con insumos "+(purchase.invoice_number||""),original_amount:Number(purchase.total||0),paid_amount:0,balance:Number(purchase.total||0),status:"OPEN"});
}
function managePurchaseItems(purchaseId){
 const purchase=state.purchases.find(x=>x.id===purchaseId),items=state.purchaseItems.filter(x=>x.purchase_id===purchaseId),f=$("#editForm");
 f.innerHTML='<h2>Productos de compra</h2><p><b>'+safe(purchase?.invoice_number||"Sin factura")+'</b> · '+safe(state.suppliers.find(x=>x.id===purchase?.supplier_id)?.name||"Sin proveedor")+' · Total actual <b>'+L(purchase?.total)+'</b></p><div class="presentation-list">'+items.map(x=>'<div class="presentation-row"><div><b>'+safe(x.product_name)+'</b><small>'+Number(x.qty)+' presentaciones · '+qtyText(x.base_qty,state.inventoryItems.find(i=>i.id===x.inventory_item_id)?.base_unit)+' · costo base '+L(x.unit_cost_base)+'</small></div><strong>'+L(x.line_total)+'</strong></div>').join("")+'</div><hr><div class="form-grid"><label>Insumo<select name="item">'+state.inventoryItems.map(i=>'<option value="'+i.id+'">'+safe(i.name)+'</option>').join("")+'</select></label><label>Presentación<select name="presentation"></select></label><label>Cantidad comprada<input name="qty" type="number" min=".0001" step=".0001" value="1" required></label><label>Total línea<input name="line_total" type="number" min="0" step=".01" required></label></div><div id="purchaseConversion" class="conversion-preview"></div><div class="form-actions"><button type="button" id="finishPurchase">Finalizar</button><button class="primary">Agregar insumo</button></div>';
 const refreshPres=()=>{const iid=f.elements.item.value,ps=state.presentations.filter(x=>x.item_id===iid&&x.active!==false);f.elements.presentation.innerHTML=ps.map(p=>'<option value="'+p.id+'">'+safe(p.name)+' · '+Number(p.measure_qty)+' '+safe(unitObj(p.measure_unit).symbol)+'</option>').join("");previewPurchaseConversion()};const previewPurchaseConversion=()=>{const pr=state.presentations.find(x=>x.id===f.elements.presentation.value),i=state.inventoryItems.find(x=>x.id===f.elements.item.value),q=Number(f.elements.qty.value||0),tot=Number(f.elements.line_total.value||0),base=q*Number(pr?.base_qty||0);$("#purchaseConversion").innerHTML=pr?'<b>Conversión:</b> '+q+' × '+safe(pr.name)+' = <strong>'+qtyText(base,i?.base_unit)+'</strong> · costo estimado '+L(base?tot/base:0)+' / '+safe(unitObj(i?.base_unit).symbol):'<span>Crea una presentación para este insumo.</span>'};refreshPres();f.elements.item.onchange=refreshPres;f.elements.presentation.onchange=previewPurchaseConversion;f.elements.qty.oninput=previewPurchaseConversion;f.elements.line_total.oninput=previewPurchaseConversion;
 $("#editDialog").showModal();
 $("#finishPurchase").onclick=()=>{$("#editDialog").close();renderPurchases()};
 f.onsubmit=async e=>{e.preventDefault();if(!f.elements.presentation.value)return toast("Crea o selecciona una presentación");const d=new FormData(f),{error}=await sb.rpc("restaurant_register_purchase_item_public",{p_purchase:purchaseId,p_item:d.get("item"),p_presentation:d.get("presentation"),p_qty:Number(d.get("qty")),p_line_total:Number(d.get("line_total"))});if(error)return toast(error.message);const{data:pupdated}=await sb.from("purchases").select("*").eq("id",purchaseId).single();await syncPurchasePayable(pupdated);$("#editDialog").close();await loadAll();managePurchaseItems(purchaseId);toast("Insumo agregado · costo actualizado")};
}

function renderCatalog(){
 state.catalogView=state.catalogView||"products";
 toolbar("Catálogo","MAESTROS",'<button id="catalogNew">+ Nuevo</button>');
 const views=[["products","Productos"],["customers","Clientes"],["suppliers","Proveedores"],["categories","Categorías"]];
 const tabs='<div class="catalog-tabs">'+views.map(v=>'<button data-catalog-view="'+v[0]+'" class="'+(state.catalogView===v[0]?"active":"")+'">'+v[1]+'</button>').join("")+'</div>';
 let body="";
 if(state.catalogView==="products") body=catalogProductsView();
 if(state.catalogView==="customers") body=catalogCustomersView();
 if(state.catalogView==="suppliers") body=catalogSuppliersView();
 if(state.catalogView==="categories") body=catalogCategoriesView();
 $("#content").innerHTML=tabs+body;
 $("#content").querySelectorAll("[data-catalog-view]").forEach(b=>b.onclick=()=>{state.catalogView=b.dataset.catalogView;renderCatalog()});
 const n=$("#catalogNew");if(n)n.onclick=()=>{if(state.catalogView==="products")editProduct();if(state.catalogView==="customers")editCustomer();if(state.catalogView==="suppliers")editGeneric("suppliers");if(state.catalogView==="categories")editCategory()};
 $("#content").querySelectorAll("[data-cat-product]").forEach(b=>b.onclick=()=>editProduct(b.dataset.catProduct));
 $("#content").querySelectorAll("[data-cat-customer]").forEach(b=>b.onclick=()=>editCustomer(b.dataset.catCustomer));
 $("#content").querySelectorAll("[data-cat-supplier]").forEach(b=>b.onclick=()=>editGeneric("suppliers",b.dataset.catSupplier));
 $("#content").querySelectorAll("[data-cat-category]").forEach(b=>b.onclick=()=>editCategory(b.dataset.catCategory));
}
function catalogProductsView(){
 return '<div class="catalog-hero"><div><small>PRODUCTOS DEL MENÚ</small><h2>'+state.products.length+' productos</h2><p>Precio de venta, categoría, marca, disponibilidad y configuración comercial.</p></div><div><b>'+state.categories.length+'</b><span>categorías vinculadas al menú</span></div></div>'+
 '<div class="crm-table"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Marca</th><th>Precio</th><th>Estado</th><th></th></tr></thead><tbody>'+state.products.map(p=>'<tr><td><b>'+safe(p.name)+'</b><small>'+safe(p.description||"")+'</small></td><td>'+safe(state.categories.find(c=>c.id===p.category_id)?.name||"Sin categoría")+'</td><td>'+safe(state.brands.find(b=>b.id===p.brand_id)?.name||p.brand_id||"—")+'</td><td><b>'+L(p.price)+'</b></td><td><span class="tag">'+(p.active!==false?"ACTIVO":"INACTIVO")+'</span></td><td><button data-cat-product="'+p.id+'">Editar</button></td></tr>').join("")+'</tbody></table></div>';
}
function catalogCustomersView(){
 return '<div class="catalog-hero"><div><small>CLIENTES</small><h2>'+state.customers.length+' clientes</h2><p>Datos comerciales y contactos utilizados por ventas y cuentas por cobrar.</p></div></div>'+
 '<div class="crm-table"><table><thead><tr><th>Cliente</th><th>Teléfono</th><th>Email</th><th>Dirección</th><th>Estado</th><th></th></tr></thead><tbody>'+state.customers.map(x=>'<tr><td><b>'+safe(x.name)+'</b></td><td>'+safe(x.phone||"—")+'</td><td>'+safe(x.email||"—")+'</td><td>'+safe(x.address||"—")+'</td><td>'+(x.active!==false?"Activo":"Inactivo")+'</td><td><button data-cat-customer="'+x.id+'">Editar</button></td></tr>').join("")+'</tbody></table></div>';
}
function catalogSuppliersView(){
 return '<div class="catalog-hero"><div><small>PROVEEDORES</small><h2>'+state.suppliers.length+' proveedores</h2><p>Proveedores disponibles para compras, insumos y cuentas por pagar.</p></div></div>'+
 '<div class="crm-table"><table><thead><tr><th>Proveedor</th><th>Teléfono</th><th>Email</th><th>RTN / ID</th><th>Estado</th><th></th></tr></thead><tbody>'+state.suppliers.map(x=>'<tr><td><b>'+safe(x.name)+'</b></td><td>'+safe(x.phone||"—")+'</td><td>'+safe(x.email||"—")+'</td><td>'+safe(x.tax_id||"—")+'</td><td>'+(x.active!==false?"Activo":"Inactivo")+'</td><td><button data-cat-supplier="'+x.id+'">Editar</button></td></tr>').join("")+'</tbody></table></div>';
}
function catalogCategoriesView(){
 return '<div class="catalog-link-note"><b>Categorías vinculadas al menú</b><span>Esta lista usa directamente <code>categories</code>. Cualquier cambio aquí modifica las categorías que presenta el menú de KRAKEN; no existe un catálogo duplicado.</span></div>'+
 '<div class="crm-table"><table><thead><tr><th>Categoría</th><th>Negocio / marca</th><th>Orden</th><th>Productos</th><th>Estado</th><th></th></tr></thead><tbody>'+state.categories.map(c=>'<tr><td><b>'+safe(c.name)+'</b></td><td>'+safe(state.brands.find(b=>b.id===c.brand_id)?.name||"—")+'</td><td>'+Number(c.sort_order||0)+'</td><td>'+state.products.filter(p=>p.category_id===c.id).length+'</td><td>'+(c.active!==false?"Activa":"Inactiva")+'</td><td><button data-cat-category="'+c.id+'">Editar</button></td></tr>').join("")+'</tbody></table></div>';
}
function renderPresentationView(){
 if(!state.inventoryItems.length)return '<div class="empty-module"><b>Aún no hay insumos</b><span>Crea el primer insumo para luego definir sus presentaciones de compra.</span><button data-prod-action="ingredient">+ Crear insumo</button></div>';
 return '<div class="presentation-catalog">'+state.inventoryItems.map(i=>{const ps=state.presentations.filter(p=>p.item_id===i.id);return '<article class="presentation-card"><div><small>'+safe(i.category||"INSUMO")+'</small><h3>'+safe(i.name)+'</h3><p>Unidad base: <b>'+safe(unitObj(i.base_unit).name)+'</b></p></div><div class="presentation-lines">'+(ps.map(p=>'<div><span>'+safe(p.name)+'</span><b>'+Number(p.measure_qty)+' '+safe(unitObj(p.measure_unit).symbol)+' → '+qtyText(p.base_qty,i.base_unit)+'</b></div>').join("")||'<div><span>Sin presentaciones</span></div>')+'</div><button data-presentations="'+i.id+'">Administrar presentaciones</button></article>'}).join("")+'</div>';
}
function render(){if(state.tab==="dashboard")renderDashboard();if(state.tab==="sales")renderSales();if(state.tab==="purchases")renderPurchases();if(state.tab==="expenses")renderExpenses();if(state.tab==="inventory")renderInventory();if(state.tab==="production")renderProduction();if(state.tab==="receivables")renderReceivables();if(state.tab==="payables")renderPayables();if(state.tab==="employees")renderEmployees();if(state.tab==="catalog")renderCatalog();if(state.tab==="customers")renderCustomers();if(state.tab==="suppliers")renderSuppliers();if(state.tab==="reports")renderCRMReports();if(state.tab==="config")renderConfig();if(state.tab==="products")renderProducts();if(state.tab==="combos")renderCombos();if(state.tab==="categories")renderCategories();if(state.tab==="banners")renderBanners();if(state.tab==="promotions")renderPromotions();if(state.tab==="extras")renderExtras();if(state.tab==="branding")renderBranding();if(state.tab==="places")renderPlaces();if(state.tab==="orders")renderOrders();if(state.tab==="feedback")renderFeedback()}
async function renderCombos(){toolbar('Combos','LA BANDEJA + BEER STATION','<button id="newCombo">+ Nuevo combo</button>');const combos=state.products.filter(function(p){return p.category_id==='combos'}),res=await sb.from('combo_items').select('*').order('sort_order'),items=res.data||[];$('#content').innerHTML='<div class="grid">'+combos.map(function(p){const names=items.filter(function(x){return x.combo_product_id===p.id}).map(function(x){const q=state.products.find(function(z){return z.id===x.item_product_id});return q?x.qty+' × '+q.name:''}).filter(Boolean).join(' · ');return '<article class="card"><img src="'+(p.image_url||'')+'"><span class="tag">COMBO</span><h3>'+safe(p.name)+'</h3><p>'+safe(p.description||'')+'</p><small>'+safe(names||'Sin componentes definidos')+'</small><div class="card-footer"><b>L '+Number(p.price||0).toFixed(2)+'</b><div class="row-actions"><button data-combo-items="'+p.id+'">Componentes</button><button class="edit" data-edit-combo="'+p.id+'">Editar</button></div></div></article>'}).join('')+'</div>';$('#newCombo').onclick=function(){editProduct()};$('#content').querySelectorAll('[data-edit-combo]').forEach(function(b){b.onclick=function(){editProduct(b.dataset.editCombo)}});$('#content').querySelectorAll('[data-combo-items]').forEach(function(b){b.onclick=function(){editComboItems(b.dataset.comboItems)}})}
async function editComboItems(comboId){const current=(await sb.from('combo_items').select('*').eq('combo_product_id',comboId)).data||[],selected=new Set(current.map(function(x){return x.item_product_id})),f=$('#editForm'),combo=state.products.find(function(p){return p.id===comboId});f.innerHTML='<h2>Componentes de '+safe(combo?.name||'combo')+'</h2><div class="list">'+state.products.filter(function(p){return p.category_id!=='combos'}).map(function(p){return '<label class="row"><div><b>'+safe(p.name)+'</b><small>'+safe(state.categories.find(function(c){return c.id===p.category_id})?.name||'')+'</small></div><input type="checkbox" name="combo_item" value="'+p.id+'" '+(selected.has(p.id)?'checked':'')+'></label>'}).join('')+'</div><div class="form-actions"><button class="primary">Guardar componentes</button></div>';$('#editDialog').showModal();f.onsubmit=async function(e){e.preventDefault();const ids=[...f.querySelectorAll('input[name="combo_item"]:checked')].map(function(x){return x.value});const del=await sb.from('combo_items').delete().eq('combo_product_id',comboId);if(del.error)return toast(del.error.message);if(ids.length){const rows=ids.map(function(item_product_id,i){return {combo_product_id:comboId,item_product_id,qty:1,sort_order:i}}),ins=await sb.from('combo_items').insert(rows);if(ins.error)return toast(ins.error.message)}$('#editDialog').close();renderCombos();toast('Combo actualizado')}}
