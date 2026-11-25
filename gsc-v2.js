import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const sb=window.GSC_SUPABASE;
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>Number(n||0).toLocaleString("es-ES",{style:"currency",currency:"EUR"});
const user=()=>window.GSC_AUTH_API?.getUser?.()||null;
const toast=m=>window.GSC_CART_API?.toast?.(m)||alert(m);
let products=[],coupon=null;
document.head.insertAdjacentHTML("beforeend",'<style>.gsc-v2-section{padding:76px 0;border-top:1px solid var(--line)}.gsc-v2-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:28px}.gsc-v2-head h2{font-size:clamp(42px,7vw,82px)}.gsc-v2-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.gsc-v2-toolbar{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin:0 0 18px}.gsc-v2-toolbar input,.gsc-v2-toolbar select{width:100%;min-height:46px;padding:10px 12px;background:#090909;border:1px solid var(--line);color:#fff}.gsc-v2-results{font-size:11px;color:var(--muted);margin:-8px 0 14px}.gsc-v2-card{background:#111112;border:1px solid var(--line)}.gsc-v2-card img{width:100%;aspect-ratio:4/5;object-fit:cover;background:#171718}.gsc-v2-card-body{padding:16px;display:grid;gap:10px}.gsc-v2-card h3{font-size:20px}.gsc-v2-card p,.gsc-v2-muted{font-size:12px;color:var(--muted)}.gsc-v2-card select,.gsc-v2-input,.gsc-v2-form input,.gsc-v2-form textarea,.gsc-v2-form select{width:100%;padding:11px;background:#090909;border:1px solid var(--line);color:#fff}.gsc-v2-form{display:grid;gap:12px;max-width:650px}.gsc-v2-form label{font-size:10px;letter-spacing:.13em;color:var(--muted);text-transform:uppercase;display:grid;gap:6px}.gsc-v2-form textarea{min-height:90px}.gsc-v2-review,.gsc-v2-order{border-top:1px solid var(--line);padding:15px 0;display:grid;gap:7px}.gsc-v2-admin{display:grid;gap:16px;margin-top:20px}.gsc-v2-admin-card,.gsc-v2-exclusive{border:1px solid var(--line);padding:18px;display:grid;gap:12px}.gsc-v2-admin-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.gsc-v2-stat{border:1px solid var(--line);padding:14px;display:grid;gap:4px}.gsc-v2-stat span{font-size:10px;color:var(--muted);text-transform:uppercase}.gsc-v2-stat strong{font-size:22px}.gsc-v2-inline{display:flex;gap:8px;flex-wrap:wrap}.gsc-v2-inline>*{flex:1;min-width:110px}.gsc-v2-pill{border:1px solid var(--line);padding:3px 7px;font-size:10px;text-transform:uppercase}.gsc-v2-stars{letter-spacing:.12em}.gsc-v2-cart-line{display:grid;grid-template-columns:60px 1fr auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}.gsc-v2-cart-line img{width:60px;height:68px;object-fit:cover}.gsc-v2-cart-line small{display:block;color:var(--muted)}@media(max-width:850px){.gsc-v2-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.gsc-v2-admin-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.gsc-v2-toolbar{grid-template-columns:1fr 1fr}.gsc-v2-toolbar input{grid-column:1/-1}.gsc-v2-grid{gap:8px}.gsc-v2-card-body{padding:10px}.gsc-v2-card h3{font-size:15px}.gsc-v2-head{display:block}.gsc-v2-admin-grid{grid-template-columns:1fr}}</style>');
const sections='<section class="gsc-v2-section" id="gscCatalog"><div class="container"><div class="gsc-v2-head"><div><p class="eyebrow">GSC / SHOP</p><h2>COLECCIÓN.</h2></div><p class="section-intro">Descubre todas las prendas disponibles.</p></div><div class="gsc-v2-toolbar"><input id="gscCatalogSearch" type="search" placeholder="Buscar prendas…" aria-label="Buscar prendas"><select id="gscCatalogCategory" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option></select><select id="gscCatalogSort" aria-label="Ordenar productos"><option value="featured">Destacados</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="newest">Más recientes</option></select></div><p id="gscCatalogResults" class="gsc-v2-results" aria-live="polite"></p><div class="gsc-v2-grid" id="gscCatalogGrid"><p class="gsc-v2-muted">Cargando colección…</p></div></div></section>'+
'<section class="gsc-v2-section" id="gscReviews"><div class="container"><div class="gsc-v2-head"><div><p class="eyebrow">COMUNIDAD GSC</p><h2>OPINIONES.</h2></div></div><div id="gscReviewsList"></div><div class="gsc-v2-admin-card"><h3>DEJA TU VALORACIÓN</h3><p class="gsc-v2-muted">Inicia sesión. Las opiniones se revisan antes de publicarse.</p><form class="gsc-v2-form" id="gscReviewForm"><label>Producto<select name="product_id" id="gscReviewProduct" required></select></label><label>Valoración<select name="rating"><option value="5">★★★★★ — 5</option><option value="4">★★★★☆ — 4</option><option value="3">★★★☆☆ — 3</option><option value="2">★★☆☆☆ — 2</option><option value="1">★☆☆☆☆ — 1</option></select></label><label>Título<input name="title" maxlength="100"></label><label>Opinión<textarea name="body" minlength="5" maxlength="1200" required></textarea></label><button class="btn" type="submit">ENVIAR OPINIÓN</button></form></div></div></section>'+
'<section class="gsc-v2-section" id="gscClub"><div class="container"><div class="gsc-v2-exclusive"><p class="eyebrow">GSC / MEMBERS ONLY</p><h2>GSC CLUB.</h2><p class="section-intro">Accede antes a los lanzamientos y recibe novedades exclusivas.</p><div id="gscClubStatus" class="gsc-v2-muted"></div><div id="gscDropsList"></div><button class="btn" id="gscJoinClub" style="width:max-content">UNIRME AL GSC CLUB</button></div></div></section>';
$("#lookbook")?.insertAdjacentHTML("beforebegin",sections);

async function loadProducts(){
 const r=await sb.from("gsc_products").select("id,name,price,color,description,active,stock,image_url,images,category,featured,sizes,created_at").eq("active",true).order("featured",{ascending:false}).order("created_at",{ascending:false});
 if(r.error){$("#gscCatalogGrid").textContent="No se ha podido cargar la colección.";return}
 products=r.data||[];
 const catalogProducts=products.filter(p=>p.id!=="core");
 const categorySelect=$("#gscCatalogCategory");
 if(categorySelect){
  const selected=categorySelect.value;
  const categories=[...new Set(catalogProducts.map(p=>String(p.category||"GSC")).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  categorySelect.innerHTML='<option value="">Todas las categorías</option>'+categories.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");
  categorySelect.value=categories.includes(selected)?selected:"";
 }
 const render=()=>{
  const term=($("#gscCatalogSearch")?.value||"").trim().toLocaleLowerCase("es");
  const category=categorySelect?.value||"",sort=$("#gscCatalogSort")?.value||"featured";
  let visible=catalogProducts.filter(p=>{
   const text=[p.name,p.description,p.color,p.category].join(" ").toLocaleLowerCase("es");
   return (!term||text.includes(term))&&(!category||String(p.category||"GSC")===category);
  });
  if(sort==="price-asc")visible.sort((a,b)=>Number(a.price)-Number(b.price));
  else if(sort==="price-desc")visible.sort((a,b)=>Number(b.price)-Number(a.price));
  else if(sort==="newest")visible.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
  else visible.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured));
  $("#gscCatalogResults").textContent=visible.length+" "+(visible.length===1?"prenda":"prendas")+" disponibles";
  $("#gscCatalogGrid").innerHTML=visible.length?visible.map(p=>{
   const image=p.image_url||p.images?.[0]?.url||window.GSC_CONFIG.product.images.front;
   const sizes=p.sizes?.length?p.sizes:["S","M","L","XL","XXL"];
   const available=sizes.filter(size=>Number(p.stock?.[size]||0)>0);
   return '<article class="gsc-v2-card" data-product="'+esc(p.id)+'"><img src="'+esc(image)+'" alt="'+esc(p.name)+'" loading="lazy" decoding="async"><div class="gsc-v2-card-body"><p class="eyebrow">'+esc(p.category||"GSC")+'</p><h3>'+esc(p.name)+'</h3><p>'+esc(p.description||p.color||"Edición GSC")+'</p><strong>'+money(p.price)+'</strong><select class="gsc-v2-size" aria-label="Seleccionar talla para '+esc(p.name)+'">'+sizes.map(size=>'<option value="'+esc(size)+'" '+(Number(p.stock?.[size]||0)<=0?"disabled":"")+'>'+esc(size)+' · '+(Number(p.stock?.[size]||0)>0?p.stock[size]+" uds.":"Agotado")+'</option>').join("")+'</select><button class="btn small gsc-v2-add" '+(!available.length?"disabled":"")+' type="button">AÑADIR AL CARRITO</button></div></article>';
  }).join(""):'<p class="gsc-v2-muted">No encontramos prendas con esos filtros. Prueba con otra búsqueda.</p>';
  $("#gscCatalogGrid").querySelectorAll(".gsc-v2-add").forEach(button=>button.onclick=()=>{
   const card=button.closest("[data-product]"),p=products.find(x=>x.id===card.dataset.product),size=card.querySelector("select").value;
   if(!p||Number(p.stock?.[size]||0)<=0){toast("ESA TALLA ESTÁ AGOTADA");return}
   window.GSC_CART_API.addProduct({id:p.id,name:p.name,price:Number(p.price),image:p.image_url||p.images?.[0]?.url||""},size);
  });
 };
 if($("#gscCatalogSearch"))$("#gscCatalogSearch").oninput=render;if(categorySelect)categorySelect.onchange=render;if($("#gscCatalogSort"))$("#gscCatalogSort").onchange=render;
 render();
 $("#gscReviewProduct").innerHTML=products.filter(p=>p.id!=="core").map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join("");
}
async function loadReviews(){
 const r=await sb.from("gsc_reviews").select("id,rating,title,body,created_at,product_id").eq("status","approved").order("created_at",{ascending:false}).limit(30);
 $("#gscReviewsList").innerHTML=r.data?.length?r.data.map(x=>'<article class="gsc-v2-review"><div class="gsc-v2-stars">'+("★".repeat(x.rating))+("☆".repeat(5-x.rating))+'</div><strong>'+esc(x.title||"Opinión GSC")+'</strong><p class="gsc-v2-muted">'+esc(products.find(p=>p.id===x.product_id)?.name||"Producto GSC")+' · '+new Date(x.created_at).toLocaleDateString("es-ES")+'</p><p>'+esc(x.body)+'</p></article>').join(""):'<p class="gsc-v2-muted">Todavía no hay opiniones publicadas. ¡Sé el primero!</p>';
}
$("#gscReviewForm").onsubmit=async e=>{
 e.preventDefault();const u=user();if(!u){window.GSC_AUTH_API?.openAuth("login");toast("INICIA SESIÓN PARA VALORAR");return}
 const d=Object.fromEntries(new FormData(e.currentTarget));
 const r=await sb.from("gsc_reviews").upsert({user_id:u.id,product_id:d.product_id,rating:Number(d.rating),title:d.title||null,body:d.body,status:"pending",updated_at:new Date().toISOString()},{onConflict:"user_id,product_id"});
 if(r.error){toast("NO SE HA PODIDO ENVIAR");return}e.currentTarget.reset();toast("OPINIÓN ENVIADA. PENDIENTE DE REVISIÓN.");
};
async function loadClub(){
 const u=user(),b=$("#gscJoinClub"),h=$("#gscClubStatus");
 if(!u){h.textContent="Inicia sesión para unirte al Club GSC.";b.disabled=false;b.textContent="UNIRME AL GSC CLUB";return}
 const r=await sb.from("gsc_club_members").select("joined_at,early_access,points").eq("user_id",u.id).maybeSingle();
 h.textContent=r.data?"Ya formas parte del GSC Club · "+(r.data.points||0)+" puntos":"Todavía no formas parte del Club GSC.";
 b.disabled=!!r.data;b.textContent=r.data?"YA ERES MIEMBRO":"UNIRME AL GSC CLUB";
}
$("#gscJoinClub").onclick=async()=>{
 const u=user();if(!u){window.GSC_AUTH_API?.openAuth("signup");return}
 const r=await sb.from("gsc_club_members").upsert({user_id:u.id,early_access:true},{onConflict:"user_id"});
 if(r.error){toast("NO SE HA PODIDO ACTIVAR");return}await loadClub();toast("BIENVENIDO AL GSC CLUB");
};
async function loadDrops(){
 const r=await sb.from("gsc_drops").select("id,name,description,starts_at,image_url").eq("active",true).order("starts_at");
 const host=$("#gscDropsList"),u=user();let member=false;
 if(u){const m=await sb.from("gsc_club_members").select("user_id").eq("user_id",u.id).maybeSingle();member=!!m.data}
 if(!member){host.innerHTML='<p class="gsc-v2-muted">Los detalles de los próximos lanzamientos son exclusivos del GSC Club. Únete para descubrirlos antes.</p>';return}
 host.innerHTML=r.data?.length?r.data.map(d=>'<div class="gsc-v2-order">'+(d.image_url?'<img src="'+esc(d.image_url)+'" style="width:100%;max-height:220px;object-fit:cover" alt="">':"")+'<strong>'+esc(d.name)+'</strong><p class="gsc-v2-muted">'+esc(d.description||"Lanzamiento GSC")+'</p>'+(d.starts_at?'<small>'+new Date(d.starts_at).toLocaleString("es-ES")+'</small>':"")+'</div>').join(""):'<p class="gsc-v2-muted">Próximamente anunciaremos nuevos drops.</p>';
}
function enhanceCart(){
 const api=window.GSC_CART_API;if(!api)return;const base=api.getRenderer();
 api.setRenderer(()=>{base();const items=api.items;$("#cartLines").innerHTML=items.length?items.map((x,i)=>'<div class="gsc-v2-cart-line"><img src="'+esc(x.image||window.GSC_CONFIG.product.images.front)+'" alt=""><div><strong>'+esc(x.name||window.GSC_CONFIG.product.name)+'</strong><small>Talla '+esc(x.size)+' · '+money(x.price??window.GSC_CONFIG.product.price)+'</small><small>Cantidad: '+x.qty+'</small><button class="remove" data-remove="'+i+'">Eliminar</button></div><div class="qty"><button data-minus="'+i+'">−</button><span>'+x.qty+'</span><button data-plus="'+i+'">+</button></div></div>').join(""):'<p class="muted" style="padding:25px 0">Tu carrito está vacío.</p>'});
}
function setupCoupon(){
 const form=$("#gxCode");if(!form)return;
 form.onsubmit=async e=>{e.preventDefault();const code=form.querySelector("input").value.trim().toUpperCase();
  const r=await sb.from("gsc_coupons").select("code,discount_type,discount_value,min_order_total,max_uses,used_count").eq("code",code).eq("active",true).maybeSingle();
  if(r.error||!r.data||(r.data.max_uses&&r.data.used_count>=r.data.max_uses)){coupon=null;window.GSC_COUPON_CODE=null;window.GSC_GX_API?.clearCoupon();toast("CÓDIGO NO VÁLIDO");return}
  const subtotal=window.GSC_CART_API.items.reduce((n,x)=>n+Number(x.price??window.GSC_CONFIG.product.price)*x.qty,0);
  if(subtotal<Number(r.data.min_order_total||0)){toast("EL PEDIDO NO ALCANZA EL MÍNIMO DEL CUPÓN");return}
  coupon=r.data;window.GSC_COUPON_CODE=code;window.GSC_GX_API?.setCoupon(r.data);toast("CÓDIGO VALIDADO");
 };
}
function setupCheckout(){
 const form=$("#orderForm");
 const button=form?.querySelector('[type="submit"]');
 if(button){button.textContent="ENVIAR SOLICITUD";button.disabled=false}
 const note=$("#checkoutNote");
 if(note)note.textContent="Los pagos online están desactivados temporalmente. Puedes enviar una solicitud de pedido sin pagar; GSC confirmará disponibilidad, envío y forma de pago por correo.";
 const checkout=$("#checkout");
 if(checkout)checkout.textContent="SOLICITAR PEDIDO";
}
function addTracking(){
 const host=$("#gscAuthProfile"),u=user();if(!host||!u||host.dataset.gscTrack===u.id)return;host.dataset.gscTrack=u.id;
 sb.from("gsc_orders").select("id,total,status,payment_status,tracking_number,carrier,created_at").eq("user_id",u.id).order("created_at",{ascending:false}).limit(20).then(r=>{
  if(!r.data?.length)return;const el=document.createElement("div");el.className="gsc-profile-section";el.innerHTML="<h3>SEGUIMIENTO DE PEDIDOS</h3>"+r.data.map(o=>'<div class="gsc-v2-order"><div class="gsc-v2-inline"><strong>'+new Date(o.created_at).toLocaleDateString("es-ES")+'</strong><span class="gsc-v2-pill">'+esc(o.status)+'</span><span class="gsc-v2-pill">'+esc(o.payment_status)+'</span></div><strong>'+money(o.total)+'</strong><p class="gsc-v2-muted">'+(o.tracking_number?esc(o.carrier||"Transportista")+" · "+esc(o.tracking_number):"El seguimiento aparecerá cuando se envíe el pedido.")+'</p></div>').join("");
  host.append(el);
 });
}
async function renderAdminV2(){
 const host=$("#gscAdminContent");if(!host||host.dataset.v2==="yes")return;host.dataset.v2="yes";
 const results=await Promise.all([
  sb.from("gsc_products").select("*").order("created_at",{ascending:false}),
  sb.from("gsc_orders").select("*").order("created_at",{ascending:false}).limit(100),
  sb.from("profiles").select("id,full_name,marketing_opt_in,created_at").order("created_at",{ascending:false}).limit(100),
  sb.from("gsc_newsletter_subscriptions").select("user_id",{count:"exact",head:true}).eq("consent",true).is("unsubscribed_at",null),
  sb.from("gsc_reviews").select("*").order("created_at",{ascending:false}).limit(50),
  sb.from("gsc_coupons").select("*").order("created_at",{ascending:false}),
  sb.from("gsc_club_members").select("user_id",{count:"exact",head:true}),
  sb.from("gsc_drops").select("*").order("created_at",{ascending:false})
 ]);
 const ps=results[0].data||[],os=results[1].data||[],cs=results[2].data||[],rs=results[4].data||[],cps=results[5].data||[],ds=results[7].data||[];
 if(results[0].error||results[1].error||results[2].error){host.dataset.v2="";host.insertAdjacentHTML("beforeend",'<p class="gsc-v2-muted">No se han podido cargar los datos avanzados.</p>');return}
 const paid=os.filter(o=>o.payment_status==="paid"),revenue=paid.reduce((n,o)=>n+Number(o.total||0),0),byUser=new Map();
 os.forEach(o=>{if(o.user_id){const x=byUser.get(o.user_id)||{count:0,paid:0,email:o.email};x.count++;if(o.payment_status==="paid")x.paid+=Number(o.total||0);byUser.set(o.user_id,x)}});
 const html='<div id="gscV2Admin" class="gsc-v2-admin"><h3>GSC 2.0 / CENTRO DE CONTROL</h3><div class="gsc-v2-admin-grid">'+
 [['Ventas cobradas',money(revenue)],['Pedidos pagados',paid.length],['Clientes registrados',cs.length],['Suscripciones',results[3].count||0],['Miembros GSC Club',results[6].count||0],['Opiniones pendientes',rs.filter(x=>x.status==="pending").length]].map(x=>'<div class="gsc-v2-stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join("")+'</div>'+
 '<div class="gsc-v2-admin-card"><h4>AÑADIR PRODUCTO</h4><form id="gscV2ProductForm" class="gsc-v2-form"><label>Nombre<input name="name" required></label><div class="gsc-v2-inline"><label>Precio (€)<input name="price" type="number" min=".01" step=".01" required></label><label>Color<input name="color"></label></div><label>Categoría<input name="category" value="ropa"></label><label>Descripción<textarea name="description"></textarea></label><label>Fotografía<input name="image" type="file" accept="image/jpeg,image/png,image/webp"></label><div class="gsc-v2-inline">'+["S","M","L","XL","XXL"].map(s=>'<label>'+s+'<input class="gsc-v2-input" name="stock_'+s+'" type="number" min="0" value="0"></label>').join("")+'</div><label><span><input type="checkbox" name="featured"> Destacar producto</span></label><button class="btn">CREAR PRODUCTO</button></form></div>'+
 '<div class="gsc-v2-admin-card"><h4>PRODUCTOS / EDITAR</h4>'+ps.map(p=>'<div class="gsc-v2-order"><strong>'+esc(p.name)+'</strong><div class="gsc-v2-inline"><label>Precio<input class="gsc-v2-input" id="p_'+esc(p.id)+'" type="number" step=".01" value="'+esc(p.price)+'"></label><label>Color<input class="gsc-v2-input" id="c_'+esc(p.id)+'" value="'+esc(p.color||"")+'"></label></div><label>Foto<input class="gsc-v2-input" id="i_'+esc(p.id)+'" type="file" accept="image/*"></label><div class="gsc-v2-inline"><button class="gsc-profile-action" data-save="'+esc(p.id)+'">GUARDAR</button><button class="gsc-profile-action" data-toggle="'+esc(p.id)+'">'+(p.active?"OCULTAR":"PUBLICAR")+'</button><button class="gsc-profile-action" data-delete="'+esc(p.id)+'">ELIMINAR</button></div></div>').join("")+'</div>'+
 '<div class="gsc-v2-admin-card"><h4>PEDIDOS / ENVÍOS</h4>'+os.map(o=>'<div class="gsc-v2-order"><strong>'+esc(o.customer_name||o.email||"Cliente")+' · '+money(o.total)+'</strong><p class="gsc-v2-muted">'+esc(o.email)+' · '+esc(o.payment_status)+'</p><div class="gsc-v2-inline"><label>Estado<select class="gsc-v2-input" id="s_'+o.id+'">'+["pendiente","recibido","preparando","enviado","entregado","cancelado"].map(s=>'<option value="'+s+'" '+(o.status===s?"selected":"")+'>'+s.toUpperCase()+'</option>').join("")+'</select></label><label>Transportista<input class="gsc-v2-input" id="t_'+o.id+'" value="'+esc(o.carrier||"")+'"></label><label>Seguimiento<input class="gsc-v2-input" id="n_'+o.id+'" value="'+esc(o.tracking_number||"")+'"></label></div><button class="gsc-profile-action" data-order="'+o.id+'">ACTUALIZAR PEDIDO</button></div>').join("")+'</div>'+
 '<div class="gsc-v2-admin-card"><h4>CLIENTES</h4>'+cs.map(c=>{const o=byUser.get(c.id)||{};return '<div class="gsc-v2-order"><strong>'+esc(c.full_name||"Cliente GSC")+'</strong><p class="gsc-v2-muted">'+esc(o.email||"Correo al realizar el primer pedido")+' · '+(o.count||0)+' pedidos · '+money(o.paid||0)+' cobrados</p></div>'}).join("")+'</div>'+
 '<div class="gsc-v2-admin-card"><h4>CUPONES</h4><form id="gscV2CouponForm" class="gsc-v2-form"><label>Código<input name="code" required></label><div class="gsc-v2-inline"><label>Tipo<select name="discount_type"><option value="percentage">Porcentaje</option><option value="fixed">Importe fijo</option></select></label><label>Descuento<input name="discount_value" type="number" min=".01" step=".01" required></label></div><div class="gsc-v2-inline"><label>Pedido mínimo<input name="min_order_total" type="number" min="0" value="0"></label><label>Usos máximos<input name="max_uses" type="number" min="1" placeholder="Sin límite"></label></div><label>Caducidad<input name="expires_at" type="date"></label><button class="btn">CREAR CUPÓN</button></form>'+cps.map(c=>'<div class="gsc-v2-order"><strong>'+esc(c.code)+' · '+(c.discount_type==="percentage"?c.discount_value+"%":money(c.discount_value))+'</strong><p class="gsc-v2-muted">Usos '+c.used_count+(c.max_uses?" / "+c.max_uses:"")+' · '+(c.active?"Activo":"Inactivo")+'</p><button class="gsc-profile-action" data-coupon="'+c.id+'" data-active="'+c.active+'">'+(c.active?"DESACTIVAR":"ACTIVAR")+'</button></div>').join("")+'</div>'+
 '<div class="gsc-v2-admin-card"><h4>MODERAR OPINIONES</h4>'+rs.map(r=>'<div class="gsc-v2-order"><strong>'+("★".repeat(r.rating))+' · '+esc(r.title||"Opinión")+'</strong><p>'+esc(r.body)+'</p><p class="gsc-v2-muted">'+esc(r.status)+'</p><div class="gsc-v2-inline"><button class="gsc-profile-action" data-review="'+r.id+'" data-status="approved">PUBLICAR</button><button class="gsc-profile-action" data-review="'+r.id+'" data-status="rejected">RECHAZAR</button></div></div>').join("")+'</div>'+
 '<div class="gsc-v2-admin-card"><h4>LANZAMIENTOS</h4><form id="gscV2DropForm" class="gsc-v2-form"><label>Nombre<input name="name" required></label><label>Descripción<textarea name="description"></textarea></label><label>Fecha<input name="starts_at" type="datetime-local"></label><label>Imagen URL<input name="image_url" type="url"></label><label><span><input name="active" type="checkbox"> Publicar</span></label><button class="btn">CREAR DROP</button></form>'+ds.map(d=>'<div class="gsc-v2-order"><strong>'+esc(d.name)+' · '+(d.active?"Publicado":"Borrador")+'</strong><button class="gsc-profile-action" data-drop="'+d.id+'" data-active="'+d.active+'">'+(d.active?"OCULTAR":"PUBLICAR")+'</button></div>').join("")+'</div></div>';
 host.insertAdjacentHTML("beforeend",html);
 $("#gscV2ProductForm").onsubmit=async e=>{e.preventDefault();const d=new FormData(e.currentTarget),name=String(d.get("name")).trim(),id=name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")+"-"+Date.now().toString(36),stock={};["S","M","L","XL","XXL"].forEach(s=>stock[s]=Number(d.get("stock_"+s)||0));let image_url=null;const file=d.get("image");if(file?.size){const path="products/"+id+"/"+Date.now()+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const up=await sb.storage.from("gsc-products").upload(path,file,{contentType:file.type});if(up.error){toast("ERROR AL SUBIR LA FOTO");return}image_url=sb.storage.from("gsc-products").getPublicUrl(path).data.publicUrl}const r=await sb.from("gsc_products").insert({id,name,price:Number(d.get("price")),color:d.get("color")||null,description:d.get("description")||null,category:d.get("category")||"ropa",stock,sizes:["S","M","L","XL","XXL"],image_url,featured:d.get("featured")==="on",active:true});toast(r.error?"ERROR AL CREAR PRODUCTO":"PRODUCTO CREADO");if(!r.error){await loadProducts();await reloadAdmin()}};
 host.querySelectorAll("[data-save]").forEach(b=>b.onclick=async()=>{const id=b.dataset.save,p=ps.find(x=>x.id===id),file=$("#i_"+CSS.escape(id)).files[0];let image_url=p.image_url;if(file){const path="products/"+id+"/"+Date.now()+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const up=await sb.storage.from("gsc-products").upload(path,file,{contentType:file.type});if(up.error){toast("ERROR AL SUBIR IMAGEN");return}image_url=sb.storage.from("gsc-products").getPublicUrl(path).data.publicUrl}const r=await sb.from("gsc_products").update({price:Number($("#p_"+CSS.escape(id)).value),color:$("#c_"+CSS.escape(id)).value,image_url,updated_at:new Date().toISOString()}).eq("id",id);toast(r.error?"ERROR":"PRODUCTO ACTUALIZADO");if(!r.error){await loadProducts();await reloadAdmin()}});
 host.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=async()=>{const p=ps.find(x=>x.id===b.dataset.toggle),r=await sb.from("gsc_products").update({active:!p.active}).eq("id",p.id);toast(r.error?"ERROR":"VISIBILIDAD ACTUALIZADA");if(!r.error)await reloadAdmin()});
 host.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{if(b.dataset.delete==="core"){toast("EL PRODUCTO PRINCIPAL NO SE PUEDE ELIMINAR");return}if(!confirm("¿Eliminar este producto?"))return;const r=await sb.from("gsc_products").delete().eq("id",b.dataset.delete);toast(r.error?"ERROR":"PRODUCTO ELIMINADO");if(!r.error){await loadProducts();await reloadAdmin()}});
 host.querySelectorAll("[data-order]").forEach(b=>b.onclick=async()=>{const id=b.dataset.order,status=$("#s_"+id).value,carrier=$("#t_"+id).value,tracking_number=$("#n_"+id).value;const r=await sb.from("gsc_orders").update({status,carrier,tracking_number,updated_at:new Date().toISOString()}).eq("id",id);if(!r.error)await sb.from("gsc_order_events").insert({order_id:id,status,note:tracking_number?"Seguimiento: "+carrier+" "+tracking_number:null});toast(r.error?"ERROR AL ACTUALIZAR":"PEDIDO ACTUALIZADO")});
 $("#gscV2CouponForm").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget)),r=await sb.from("gsc_coupons").insert({code:d.code.trim().toUpperCase(),discount_type:d.discount_type,discount_value:Number(d.discount_value),min_order_total:Number(d.min_order_total||0),max_uses:d.max_uses?Number(d.max_uses):null,expires_at:d.expires_at?new Date(d.expires_at+"T23:59:59").toISOString():null,active:true});toast(r.error?"ERROR AL CREAR CUPÓN":"CUPÓN CREADO");if(!r.error)await reloadAdmin()};
 host.querySelectorAll("[data-coupon]").forEach(b=>b.onclick=async()=>{const r=await sb.from("gsc_coupons").update({active:b.dataset.active!=="true"}).eq("id",b.dataset.coupon);toast(r.error?"ERROR":"CUPÓN ACTUALIZADO");if(!r.error)await reloadAdmin()});
 host.querySelectorAll("[data-review]").forEach(b=>b.onclick=async()=>{const r=await sb.from("gsc_reviews").update({status:b.dataset.status,updated_at:new Date().toISOString()}).eq("id",b.dataset.review);toast(r.error?"ERROR":"OPINIÓN ACTUALIZADA");if(!r.error){await loadReviews();await reloadAdmin()}});
 $("#gscV2DropForm").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget)),r=await sb.from("gsc_drops").insert({name:d.name,description:d.description||null,starts_at:d.starts_at?new Date(d.starts_at).toISOString():null,image_url:d.image_url||null,active:d.active==="on"});toast(r.error?"ERROR":"DROP CREADO");if(!r.error){await loadDrops();await reloadAdmin()}};
 host.querySelectorAll("[data-drop]").forEach(b=>b.onclick=async()=>{const r=await sb.from("gsc_drops").update({active:b.dataset.active!=="true"}).eq("id",b.dataset.drop);toast(r.error?"ERROR":"DROP ACTUALIZADO");if(!r.error)await reloadAdmin()});
}
async function reloadAdmin(){const h=$("#gscAdminContent");if(!h)return;h.dataset.v2="";$("#gscV2Admin")?.remove();await renderAdminV2()}
function watchAccount(){const h=$("#gscAuthProfile");if(!h)return;new MutationObserver(()=>{if(user()){addTracking();loadClub();loadDrops();if($("#gscAdminContent")&&!$("#gscV2Admin"))renderAdminV2();if($("#gscAdminContent"))renderContactInbox()}}).observe(h,{childList:true,subtree:true})}

async function renderContactInbox(){
 const host=$("#gscAdminContent");
 if(!host||host.dataset.contactInbox==="yes")return;
 host.dataset.contactInbox="yes";
 const {data,error}=await sb.from("gsc_contact_messages").select("id,name,email,subject,message,created_at").order("created_at",{ascending:false}).limit(100);
 const section=document.createElement("section");
 section.className="gsc-v2-admin-card";
 section.innerHTML="<h4>MENSAJES DE CLIENTES</h4>";
 if(error){section.insertAdjacentHTML("beforeend",'<p class="gsc-v2-muted">No se han podido cargar los mensajes.</p>');}
 else if(!data?.length){section.insertAdjacentHTML("beforeend",'<p class="gsc-v2-muted">Todavía no hay mensajes recibidos.</p>');}
 else{
  section.insertAdjacentHTML("beforeend",data.map(m=>'<article class="gsc-v2-order"><strong>'+esc(m.subject)+'</strong><p class="gsc-v2-muted">'+esc(m.name)+' · '+esc(m.email)+' · '+new Date(m.created_at).toLocaleString("es-ES")+'</p><p style="white-space:pre-wrap">'+esc(m.message)+'</p><a class="gsc-profile-action" href="mailto:'+encodeURIComponent(m.email)+'?subject='+encodeURIComponent("Re: "+m.subject)+'">RESPONDER POR CORREO</a></article>').join(""));
 }
 host.append(section);
}

async function init(){enhanceCart();setupCoupon();setupCheckout();watchAccount();await loadProducts();await loadReviews();await loadClub();await loadDrops();if(user()){addTracking();renderContactInbox()}const q=new URLSearchParams(location.search);if(q.get("checkout")==="success")toast("PAGO RECIBIDO. ACTUALIZANDO TU PEDIDO…");if(q.get("checkout")==="cancel")toast("PAGO CANCELADO. TU CARRITO SIGUE GUARDADO.");}
if(sb)init();
