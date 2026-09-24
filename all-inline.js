
window.addEventListener("error",e=>{const b=document.getElementById("runtimeError");if(b){b.style.display="block";b.textContent="App error: "+(e.message||"unknown error");}});

;

const BASE_PRODUCTS = [
 ["Colombiana","kanja",60,150],["Tropicana Cherry","kanja",60,150],["Super Boof","kanja",60,150],["Miami","kanja",60,150],["Runtz Layer Cake","kanja",60,150],["Black Berry Oreoz","kanja",60,150],["Vanila Frosting","kanja",60,150],["Black Cherry Punch","kanja",60,150],["Night Move","kanja",60,150],["Mimosa","kanja",60,150],["King Juice","kanja",60,150],["Mochi","kanja",60,150],["Strawberry Apple","kanja",60,150],["Super Lemon Haze","kanja",60,150],["Permanent Marker","kanja",60,150],["Tropicana Cookies","kanja",60,150],["Cali Mousse 1g","kanja",350,550],
 ["Colombiana 5g","5g",300,600],["Tropicana Cherry 5g","5g",300,600],["Runtz Layer Cake 5g","5g",300,600],["Black Berry Oreoz 5g","5g",300,600],["Rose Gold Pave 5g","5g",300,600],["Super Boof 5g","5g",300,600],["Vanila Frosting 5g","5g",300,600],["Black Cherry Punch 5g","5g",300,600],["Night Move 5g","5g",300,600],["Miami 5g","5g",300,600],["Mimosa 5g","5g",300,600],["King Juice 5g","5g",300,600],["Mochi 5g","5g",300,600],["Strawberry Apple 5g","5g",300,600],["Super Lemon Haze 5g","5g",300,600],["Permanent Marker 5g","5g",300,600],["Tropicana Cookies 5g","5g",300,600],
 ["Colombiana Pre-Roll","preroll",75,150],["Tropicana Cherry Pre-Roll","preroll",75,150],["Super Boof Pre-Roll","preroll",75,150],["Runtz Layer Cake Pre-Roll","preroll",75,150],["Black Berry Oreoz Pre-Roll","preroll",75,150],["Vanila Frosting Pre-Roll","preroll",75,150],["Black Cherry Punch Pre-Roll","preroll",75,150],["Night Move Pre-Roll","preroll",75,150],["Miami Pre-Roll","preroll",75,150],["Mimosa Pre-Roll","preroll",75,150],["King Juice Pre-Roll","preroll",75,150],["Mochi Pre-Roll","preroll",75,150],["Strawberry Apple Pre-Roll","preroll",75,150],["Super Lemon Haze Pre-Roll","preroll",75,150],["Permanent Marker Pre-Roll","preroll",75,150],["Tropicana Cookies Pre-Roll","preroll",75,150],
 ["Gummy 4 Leaf","edible",100,200],
 ["King's Tars 1g","kanja",60,150],["King's Tars Pre-Roll","preroll",75,150],["Rose Gold Pave 1g","kanja",60,150]
].map((p,i)=>({id:"P"+String(i+1).padStart(3,"0"),name:p[0],type:p[1],cost:p[2],retail:p[3]}));

const LAMAI_NAMES = new Set(["Tropicana Cookies","Rose Gold Pave 1g","Black Cherry Punch","Black Berry Oreoz","Super Boof","Permanent Marker","Strawberry Apple","Miami","King Juice","Night Move","Mochi","King's Tars 1g","Super Lemon Haze",
"Colombiana Pre-Roll","Runtz Layer Cake Pre-Roll","Super Boof Pre-Roll","Strawberry Apple Pre-Roll","Miami Pre-Roll","King Juice Pre-Roll","Night Move Pre-Roll","Mochi Pre-Roll","Black Cherry Punch Pre-Roll","Black Berry Oreoz Pre-Roll","Tropicana Cherry Pre-Roll","King's Tars Pre-Roll","Super Lemon Haze Pre-Roll","Tropicana Cookies Pre-Roll","Permanent Marker Pre-Roll"]);

const db = JSON.parse(localStorage.getItem("mdpin-db")||"null") || {products:BASE_PRODUCTS,deliveries:[],weeks:[],stock:{"BM Bangrak":{},"Lamai":{}}};
if(!Array.isArray(db.docketAudit)) db.docketAudit=[];
if(!Array.isArray(db.invoices)) db.invoices=[];
if(!Array.isArray(db.adjustments)) db.adjustments=[];

// v0.10.115 TEST handoff sanitation:
// remove development-only cross-device test markers from real app data.
// This does not alter products, quantities, delivery status, notes, invoices,
// Sunday reports, mappings, prices, dates or audit history.
(function sanitizeDevelopmentTestMarkers(){
  let changed=false;
  if(Object.prototype.hasOwnProperty.call(db,"testSyncMarker")){
    delete db.testSyncMarker;
    changed=true;
  }
  (db.deliveries||[]).forEach(d=>{
    if(d && Object.prototype.hasOwnProperty.call(d,"syncTestMarker")){
      delete d.syncTestMarker;
      changed=true;
    }
  });
  if(changed)localStorage.setItem("mdpin-db",JSON.stringify(db));
})();

// v0.10.131 DEPLOY — release-candidate sanitation.
// Remove ONLY synthetic records created by the retired unpaid-conflict test helper.
// Normal dockets, Sunday reports, real invoices, payments, mappings and amounts are untouched.
(function cleanupRetiredConflictTestArtifacts(){
  const testInvoiceIds=new Set((db.invoices||[]).filter(i=>i&&(i.testOnlyConflictSeed===true||(/^INVTEST/.test(String(i.id||""))&&/-TEST$/i.test(String(i.number||""))))).map(i=>i.id));
  const testDocketIds=new Set((db.deliveries||[]).filter(d=>d&&(d.testConflictSeed===true||/^DTESTCONFLICT/.test(String(d.id||"")))).map(d=>d.id));
  let changed=false;
  const filterAssign=(key,keep)=>{const before=Array.isArray(db[key])?db[key]:[];const after=before.filter(keep);if(after.length!==before.length){db[key]=after;changed=true;}};
  filterAssign("invoices",i=>!testInvoiceIds.has(i?.id));
  filterAssign("deliveries",d=>!testDocketIds.has(d?.id));
  filterAssign("pendingCorrections",c=>!(c?.testOnlyConflictSeed===true||testInvoiceIds.has(c?.invoiceId)||testDocketIds.has(c?.docketId)));
  filterAssign("adjustments",a=>!(testInvoiceIds.has(a?.oldInvoiceId)||testInvoiceIds.has(a?.newInvoiceId)));
  filterAssign("docketAudit",a=>!(a?.testOnlyConflictSeed===true||testInvoiceIds.has(a?.affectedInvoiceId)||testDocketIds.has(a?.docketId)));
  const resumeId=sessionStorage.getItem("mdpin-conflict-wizard-resume");
  if(resumeId&&testInvoiceIds.has(resumeId))sessionStorage.removeItem("mdpin-conflict-wizard-resume");
  if(changed)localStorage.setItem("mdpin-db",JSON.stringify(db));
})();
function save(){localStorage.setItem("mdpin-db",JSON.stringify(db));renderAll()}
function baht(n){return "฿"+Number(n||0).toLocaleString("en-US",{maximumFractionDigits:2})}
function today(){return new Date().toISOString().slice(0,10)}
document.getElementById("delDate").value=today();document.getElementById("weekDate").value=today();document.getElementById("impDate").value=today();

function correctedCanonicalProductName(name){
  let n=cleanProductDisplayName(String(name||""));
  // Known legacy catalogue typos. These are deterministic corrections, not fuzzy guesses.
  n=n.replace(/\bPermanent\s+Maker\b/gi,"Permanent Marker");
  n=n.replace(/\bRuntz\s+Layer\s+(?:Cane|Cank)\b/gi,"Runtz Layer Cake");
  n=n.replace(/\bSuper\s+Haze\s+Lemon\b/gi,"Super Lemon Haze");
  n=n.replace(/\bPre[\s-]?oll\b/gi,"Pre-Roll");
  // Confirmed legacy shop spelling: keep every size/form variant on the same canonical product family.
  n=n.replace(/\bColumbiana\b/gi,"Colombiana");
  n=cleanProductDisplayName(n);
  // Most standard flower products are stored without a redundant 1g suffix.
  // Strip it only when an exact standard-flower base product exists, never by fuzzy similarity.
  if(/\s+1\s*g\.?$/i.test(n) && typeof normalizeProductKey==="function") {
    const without=n.replace(/\s+1\s*g\.?$/i,"").trim();
    if(BASE_PRODUCTS.some(p=>p.type==="kanja" && normalizeProductKey(p.name)===normalizeProductKey(without)))n=without;
  }
  return cleanProductDisplayName(n);
}
function migrateKnownCanonicalDuplicates(){
  ensureProductAliases();
  const products=(db.products||[]).filter(Boolean);
  const groups=new Map();
  products.forEach(p=>{
    if(!p?.id||!p?.name)return;
    const corrected=correctedCanonicalProductName(p.name);
    const key=normalizeProductKey(corrected);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push({p,corrected,wasCorrect:normalizeProductKey(p.name)===key && p.name===corrected});
  });
  let changed=false;
  groups.forEach(items=>{
    // Prefer an already-correctly named record; otherwise keep the oldest record so saved references stay stable.
    let chosen=items.find(x=>x.wasCorrect)?.p || items[0].p;
    const canonicalName=items[0].corrected;
    if(chosen.name!==canonicalName){
      db.productAliases[normalizeProductKey(chosen.name)]=chosen.id;
      chosen.name=canonicalName;changed=true;
    }
    items.forEach(({p})=>{
      if(p.id===chosen.id)return;
      // Preserve usable catalogue metadata before merging the duplicate identity.
      if(!(Number(chosen.cost)>0) && Number(p.cost)>0)chosen.cost=Number(p.cost);
      if(!(Number(chosen.retail)>0) && Number(p.retail)>0)chosen.retail=Number(p.retail);
      if((!chosen.type||chosen.type==="kanja") && p.type)chosen.type=p.type;
      db.productAliases[normalizeProductKey(p.name)]=chosen.id;
      reassignProductReferences(p.id,chosen.id);
      changed=true;
    });
    // Both the canonical spelling and every known legacy spelling resolve to one identity.
    db.productAliases[normalizeProductKey(canonicalName)]=chosen.id;
  });
  if(changed){
    const keep=new Set();
    const out=[];
    (db.products||[]).forEach(p=>{
      if(!p?.id)return;
      const corrected=correctedCanonicalProductName(p.name),key=normalizeProductKey(corrected);
      const targetId=db.productAliases[key]||p.id;
      if(p.id!==targetId)return;
      if(keep.has(p.id))return;
      keep.add(p.id);out.push(p);
    });
    db.products=out;
    localStorage.setItem("mdpin-db",JSON.stringify(db));
  }
  return changed;
}

function ensureKnownCatalogueAdditions(){
  ensureProductAliases();
  const additions=["King's Tars 1g","King's Tars Pre-Roll","Rose Gold Pave 1g"];
  let added=0;
  additions.forEach(name=>{
    const key=normalizeProductKey(correctedCanonicalProductName(name));
    const aliasedId=db.productAliases[key];
    if(aliasedId && (db.products||[]).some(p=>p.id===aliasedId))return;
    const existing=(db.products||[]).find(p=>normalizeProductKey(correctedCanonicalProductName(p.name))===key);
    if(existing){db.productAliases[key]=existing.id;return;}
    const ref=BASE_PRODUCTS.find(p=>normalizeProductKey(p.name)===key);
    if(!ref)return;
    let id=ref.id;
    if((db.products||[]).some(p=>p.id===id))id="P"+Date.now()+Math.random().toString(36).slice(2,7);
    db.products.push({...ref,id});db.productAliases[key]=id;added++;
  });
  if(added)localStorage.setItem("mdpin-db",JSON.stringify(db));
  return added;
}




/* Shared mobile keyboard rule — v0.10.8 DEV
   IMPORTANT ARCHITECTURE RULE:
   Magic Dragon pages live inside their own scrollable .section.active container.
   Never use browser-level scrollIntoView() as the primary mobile keyboard fix.
   Instead, move the actual app scroll owner so the focused field sits inside the
   visualViewport-safe area above the iPhone keyboard. */
let keyboardSafeActiveField=null;
let keyboardSafeTimerIds=[];

function clearKeyboardSafeTimers(){
  keyboardSafeTimerIds.forEach(id=>clearTimeout(id));
  keyboardSafeTimerIds=[];
}

function keyboardSafeScrollOwner(el){
  if(!el)return null;

  // Reusable rule: use the nearest ancestor that can actually scroll.
  // Do not assume .section.active is the owner: Delivery deliberately uses
  // nested scroll regions and iOS Safari will otherwise move the wrong box.
  let node=el.parentElement;
  while(node && node!==document.body){
    const style=getComputedStyle(node);
    const oy=style.overflowY;
    const canScroll=(oy==="auto"||oy==="scroll") && node.scrollHeight>node.clientHeight+2;
    if(canScroll)return node;
    node=node.parentElement;
  }
  const section=el.closest(".section.active");
  return section||document.scrollingElement||document.documentElement;
}

function keyboardSafeBounds(owner){
  const vv=window.visualViewport;
  const ownerRect=owner?.getBoundingClientRect?.() || {top:0,bottom:window.innerHeight||0,height:window.innerHeight||0};
  const viewportTop=vv ? vv.offsetTop : 0;
  const viewportBottom=vv ? vv.offsetTop+vv.height : (window.innerHeight||0);

  // Intersection between app scroll area and what Safari says is actually visible.
  const top=Math.max(ownerRect.top,viewportTop)+14;
  const bottom=Math.min(ownerRect.bottom,viewportBottom)-42;
  return {top,bottom,height:Math.max(0,bottom-top)};
}

function ensureFieldVisibleAboveKeyboard(el,forceCenter=false){
  if(!el || !document.body.contains(el))return;

  const owner=keyboardSafeScrollOwner(el);
  if(!owner)return;

  const bounds=keyboardSafeBounds(owner);
  if(bounds.height<80)return;

  const rect=el.getBoundingClientRect();
  const hiddenAbove=rect.top<bounds.top;
  const hiddenBelow=rect.bottom>bounds.bottom;

  if(forceCenter || hiddenAbove || hiddenBelow){
    // Aim slightly above centre so the field and the row context remain visible.
    const targetTop=bounds.top + Math.max(18,(bounds.height-rect.height)*0.34);
    const delta=rect.top-targetTop;

    if(Math.abs(delta)>2){
      owner.scrollTop += delta;
    }

    // Safari can perform another native focus adjustment after ours.
    requestAnimationFrame(()=>{
      if(!document.body.contains(el))return;
      const b=keyboardSafeBounds(owner);
      const r=el.getBoundingClientRect();

      if(r.top<b.top) owner.scrollTop -= (b.top-r.top)+8;
      else if(r.bottom>b.bottom) owner.scrollTop += (r.bottom-b.bottom)+8;
    });
  }
}

window.mobileKeyboardSafeFocus=(el)=>{
  keyboardSafeActiveField=el;
  el?.classList.add("keyboardSafeTarget","keyboardSafeActive");
  clearKeyboardSafeTimers();

  // iOS keyboard animation is multi-stage. Recalculate against the actual
  // app scroll owner several times, including after Safari's own correction.
  [30,90,170,280,420].forEach((delay,idx)=>{
    keyboardSafeTimerIds.push(setTimeout(()=>{
      ensureFieldVisibleAboveKeyboard(el,idx===2||idx===3);
    },delay));
  });
};

window.mobileKeyboardSafeBlur=(el)=>{
  setTimeout(()=>{
    el?.classList.remove("keyboardSafeActive");
    if(document.activeElement!==el && keyboardSafeActiveField===el)keyboardSafeActiveField=null;
  },120);
};

if(window.visualViewport){
  window.visualViewport.addEventListener("resize",()=>{
    if(keyboardSafeActiveField)ensureFieldVisibleAboveKeyboard(keyboardSafeActiveField,true);
  },{passive:true});
  window.visualViewport.addEventListener("scroll",()=>{
    if(keyboardSafeActiveField)ensureFieldVisibleAboveKeyboard(keyboardSafeActiveField);
  },{passive:true});
}

/* General opt-in:
   - catalogue barcode fields
   - Add Product barcode fields
   - any future input carrying class keyboardSafeInput */
document.addEventListener("focusin",e=>{
  const el=e.target;
  if(!(el instanceof HTMLElement))return;
  if(
    el.matches(".catalogueBarcodeField input") ||
    el.matches(".variantBarcodeRow input") ||
    el.classList.contains("keyboardSafeInput")
  ){
    mobileKeyboardSafeFocus(el);
  }
});

document.addEventListener("focusout",e=>{
  const el=e.target;
  if(!(el instanceof HTMLElement))return;
  if(
    el.matches(".catalogueBarcodeField input") ||
    el.matches(".variantBarcodeRow input") ||
    el.classList.contains("keyboardSafeInput")
  ){
    mobileKeyboardSafeBlur(el);
  }
});

let catalogueMissingBarcodesOnly=false;
function normalizeBarcode(v){return String(v||"").trim()}
function barcodeOwner(barcode,excludeId=""){
  const key=normalizeBarcode(barcode);
  if(!key)return null;
  return (db.products||[]).find(p=>p.id!==excludeId && normalizeBarcode(p.barcode)===key) || null;
}
function saveProductBarcode(id,value){
  const p=(db.products||[]).find(x=>x.id===id);
  if(!p)return false;
  const barcode=normalizeBarcode(value);
  if(barcode){
    const existing=barcodeOwner(barcode,id);
    if(existing){
      alert(`Barcode ${barcode} is already assigned to ${productParentName(existing)} · ${productVariantLabel(existing)}.`);
      renderCatalogue();
      return false;
    }
  }
  if(barcode)p.barcode=barcode; else delete p.barcode;
  save(); renderCatalogue(); renderPinDashboard(); return true;
}
window.saveProductBarcode=saveProductBarcode;
function activeVariantsMissingBarcode(){
  return (db.products||[]).filter(p=>!isProductArchived(p)&&!normalizeBarcode(p.barcode));
}
window.openMissingBarcodes=()=>{
  catalogueMissingBarcodesOnly=true; showArchivedCatalogue=false;
  switchTab("settings");
  const cat=document.getElementById("catalogueDetails"); if(cat)cat.open=true;
  renderCatalogue();
  requestAnimationFrame(()=>document.getElementById("catalogueArchiveStatus")?.scrollIntoView({behavior:"smooth",block:"start"}));
};
window.clearMissingBarcodeFilter=()=>{catalogueMissingBarcodesOnly=false;renderCatalogue();};

let showArchivedCatalogue=false;
function isProductArchived(p){return !!p?.archivedAt}
function activeCatalogueProducts(){return (db.products||[]).filter(p=>!isProductArchived(p))}
window.toggleArchivedCatalogue=()=>{
  showArchivedCatalogue=!showArchivedCatalogue;
  renderCatalogue();
};
window.archiveProductVariant=(id)=>{
  const p=(db.products||[]).find(x=>x.id===id);
  if(!p||isProductArchived(p))return;
  const label=`${productParentName(p)} · ${productVariantLabel(p)}`;
  if(!confirm(`Archive ${label}?\n\nIt will disappear from new delivery selections but remain in all historical records.`))return;
  p.archivedAt=new Date().toISOString();
  save();
  fillProducts();
  renderCatalogue();
};
window.restoreProductVariant=(id)=>{
  const p=(db.products||[]).find(x=>x.id===id);
  if(!p)return;
  delete p.archivedAt;
  save();
  fillProducts();
  renderCatalogue();
};
window.archiveProductFamily=(parentKey)=>{
  const family=(db.products||[]).filter(p=>normalizeProductKey(productParentName(p))===parentKey && !isProductArchived(p));
  if(!family.length)return;
  const parent=productParentName(family[0]);
  if(!confirm(`Archive all active variants of ${parent}?\n\nHistorical dockets, Sunday reports, invoices and audit data will remain untouched.`))return;
  const ts=new Date().toISOString();
  family.forEach(p=>p.archivedAt=ts);
  save();
  fillProducts();
  renderCatalogue();
};
window.restoreProductFamily=(parentKey)=>{
  const family=(db.products||[]).filter(p=>normalizeProductKey(productParentName(p))===parentKey && isProductArchived(p));
  if(!family.length)return;
  family.forEach(p=>delete p.archivedAt);
  save();
  fillProducts();
  renderCatalogue();
};

function canonicalDeliveryProducts(){
  ensureProductAliases();
  const aliasTargets=db.productAliases||{};
  const seenIds=new Set(), seenNames=new Set(), out=[];
  (db.products||[]).forEach(p=>{
    if(!p||!p.id||!p.name||isProductArchived(p))return;
    const key=normalizeProductKey(correctedCanonicalProductName(p.name));
    // If this visible name is now an alias for a different master product, never offer
    // the obsolete/duplicate product record on a delivery docket.
    const mappedId=aliasTargets[key];
    if(mappedId && mappedId!==p.id)return;
    if(seenIds.has(p.id)||seenNames.has(key))return;
    seenIds.add(p.id);seenNames.add(key);
    // Defensive display layer: delivery entry always shows the corrected canonical spelling.
    const canonicalName=correctedCanonicalProductName(p.name);
    out.push(canonicalName===p.name?p:{...p,name:canonicalName});
  });
  return out;
}
function canonicalBranchKey(branch){
  const b=String(branch||"");
  if(/lamai/i.test(b))return "Lamai";
  if(/bangrak|k\.\s*pual|k\.\s*paul|mini\s*mart|grocery\s*by\s*bm/i.test(b))return "BM Bangrak";
  return b;
}
function canonicalProductId(productOrId){
  ensureProductAliases();
  let p=typeof productOrId==="object"?productOrId:(db.products||[]).find(x=>x.id===productOrId);
  if(!p)return typeof productOrId==="string"?productOrId:"";
  let id=p.id;
  for(let i=0;i<4;i++){
    const current=(db.products||[]).find(x=>x.id===id)||p;
    const key=normalizeProductKey(correctedCanonicalProductName(current.name));
    const next=db.productAliases?.[key];
    if(!next||next===id)break;
    id=next;
  }
  return id;
}
function defaultProductAssignedToBranch(product,branch){
  const key=canonicalBranchKey(branch);
  if(key==="BM Bangrak")return true;
  if(key==="Lamai"){
    const name=correctedCanonicalProductName(product.name);
    return !/5g/i.test(name)&&name!=="Gummy 4 Leaf"&&name!=="Cali Mousse 1g";
  }
  return true;
}
function productAssignedToBranch(product,branch){
  const key=canonicalBranchKey(branch),id=canonicalProductId(product);
  const overrides=db.branchProductAssignments?.[key];
  if(overrides&&Object.prototype.hasOwnProperty.call(overrides,id))return !!overrides[id];
  return defaultProductAssignedToBranch(product,key);
}
function branchProducts(branch){
  return canonicalDeliveryProducts().filter(p=>productAssignedToBranch(p,branch));
}
let currentDelivery=[];
let editingDocketId=null;
let editingSuggestionId=null;
let deliveryEditOriginalSnapshot=null;
let deliveryEditAffectedInvoiceId=null;
let deliveryEditResolutionChoice="";
let deliveryEditReason="";
let activeDeliveryLetter="";
let deliveryShowAllProducts=false;
let addProductReturnToDelivery=false;
function deliveryPickerProducts(){
  const branch=document.getElementById("delBranch")?.value||"BM Bangrak";
  return (deliveryShowAllProducts?canonicalDeliveryProducts():branchProducts(branch))
    .sort((a,b)=>deliveryProductDisplayName(a).localeCompare(deliveryProductDisplayName(b),"en",{sensitivity:"base",numeric:true}));
}
function deliveryParentKey(p){return normalizeProductKey(productParentName(p)||deliveryProductDisplayName(p));}
function deliveryParentLabel(p){return productParentName(p)||deliveryProductDisplayName(p);}
function deliveryParentsForPicker(){
  let products=deliveryPickerProducts();
  const q=norm(document.getElementById("deliveryProductSearch")?.value||"");
  const map=new Map();
  products.forEach(p=>{const key=deliveryParentKey(p);if(!key)return;if(!map.has(key))map.set(key,{key,label:deliveryParentLabel(p),products:[]});map.get(key).products.push(p);});
  let parents=[...map.values()].sort((a,b)=>a.label.localeCompare(b.label,"en",{sensitivity:"base",numeric:true}));
  if(q)parents=parents.filter(x=>norm(x.label).includes(q));
  return parents;
}
function fillDeliveryVariants(preferredId=""){
  const parent=document.getElementById("delParent"),variant=document.getElementById("delVariant");if(!parent||!variant)return;
  const key=parent.value;
  const order={"1g":1,"5g":2,"preroll":3,"special":4};
  const products=deliveryPickerProducts().filter(p=>deliveryParentKey(p)===key).sort((a,b)=>{const av=effectiveDeliveryVariant(a),bv=effectiveDeliveryVariant(b);return (order[av.variantKey]||9)-(order[bv.variantKey]||9)||deliveryProductDisplayName(a).localeCompare(deliveryProductDisplayName(b),"en",{sensitivity:"base",numeric:true});});
  if(!products.length){variant.innerHTML='<option value="">No available variant</option>';variant.disabled=true;return;}
  variant.disabled=false;
  variant.innerHTML='<option value="">Choose variant…</option>'+products.map(p=>{const v=effectiveDeliveryVariant(p);const label=v.variantKey==="special"?(productVariantLabel(p)||deliveryProductDisplayName(p)):v.variantLabel;return `<option value="${p.id}">${escapeHtml(label)}</option>`;}).join("");
  if(preferredId&&products.some(p=>p.id===preferredId))variant.value=preferredId;
}
function fillProducts(){
  const parent=document.getElementById("delParent");if(!parent)return;
  const previousParent=parent.value,previousVariant=document.getElementById("delVariant")?.value||"";
  const parents=deliveryParentsForPicker();
  if(!parents.length){parent.innerHTML='<option value="">No matching product</option>';const variant=document.getElementById("delVariant");if(variant){variant.innerHTML='<option value="">Choose product first</option>';variant.disabled=true;}syncDeliveryQuickActions();return;}
  parent.innerHTML=parents.map(x=>`<option value="${escapeHtmlAttr(x.key)}">${escapeHtml(x.label)}</option>`).join("");
  if(!document.getElementById("deliveryProductSearch")?.value&&activeDeliveryLetter){const target=norm(activeDeliveryLetter);let idx=parents.findIndex(x=>norm(x.label).charAt(0)>=target);if(idx<0)idx=parents.length-1;parent.selectedIndex=idx;}else if(parents.some(x=>x.key===previousParent)){parent.value=previousParent;}
  fillDeliveryVariants(previousVariant);syncDeliveryQuickActions();
}
function syncDeliveryQuickActions(){
  const row=document.getElementById("deliveryQuickActions");
  const allBtn=document.getElementById("deliveryAllStockToggle");
  const editing=!!(editingDocketId||editingSuggestionId);
  if(row)row.style.display=editing?"flex":"none";
  if(allBtn){
    allBtn.textContent=deliveryShowAllProducts?"Use shop list":"Show all stock";
    allBtn.setAttribute("aria-pressed",deliveryShowAllProducts?"true":"false");
  }
}
window.toggleDeliveryAllStock=()=>{
  deliveryShowAllProducts=!deliveryShowAllProducts;
  activeDeliveryLetter="";
  clearDeliveryAlphabetVisual();
  const search=document.getElementById("deliveryProductSearch");
  if(search)search.value="";
  syncDeliveryQuickActions();
  fillProducts();
};
function normalizeDraftLines(lines){return (lines||[]).map(l=>({productId:String(l.productId||""),qty:Number(l.qty||0)})).filter(l=>l.productId&&l.qty>0);}
function docketDraftChanged(){
 if(!editingDocketId||!deliveryEditOriginalSnapshot)return false;
 const before=normalizeDraftLines(deliveryEditOriginalSnapshot.lines),after=normalizeDraftLines(currentDelivery);
 const branch=document.getElementById("delBranch")?.value||deliveryEditOriginalSnapshot.branch||"";
 const date=document.getElementById("delDate")?.value||deliveryEditOriginalSnapshot.date||"";
 const note=(document.getElementById("delNote")?.value||"").trim();
 return JSON.stringify(before)!==JSON.stringify(after)||branch!==(deliveryEditOriginalSnapshot.branch||"")||date!==(deliveryEditOriginalSnapshot.date||"")||note!==(deliveryEditOriginalSnapshot.note||"");
}
function docketBelongsToInvoiceCycle(d,inv){
 if(!d||!inv)return false;
 const items=wizardReportsForDate(inv.reportDate),prevDates=items.map(x=>x?.rec?.previousDate).filter(Boolean).sort(),prev=prevDates[0]||"";
 const date=String(d.date||""); if(!date||date>String(inv.reportDate||"")||(prev&&date<=prev))return false;
 const branches=new Set((inv.branches||[]).map(b=>canonicalBranchName(b.branch)));
 return !branches.size||branches.has(canonicalBranchName(d.branch||""));
}
function affectedInvoiceForDocket(d){
 if(!d||!d.deliveredAt)return null;
 return [...(db.invoices||[])].filter(inv=>!inv.supersededBy&&inv.status!=="void"&&docketBelongsToInvoiceCycle(d,inv)).sort((a,b)=>String(b.reportDate||"").localeCompare(String(a.reportDate||""))||Number(b.version||1)-Number(a.version||1))[0]||null;
}
function setDeliveryCorrectionChoice(choice){deliveryEditResolutionChoice=choice;updateDocketEditResolutionUI();}
window.setDeliveryCorrectionChoice=setDeliveryCorrectionChoice;
function invoiceIsPaid(inv){return !!inv&&(inv.payment?.status==="paid"||inv.status==="paid");}
function deliveryEditReasonDevice(){
 const fallback=(typeof detectCloudDeviceLabel==="function"?detectCloudDeviceLabel():"This device");
 return (localStorage.getItem("mdpin-cloud-device")||document.getElementById("cloudDeviceLabel")?.value||fallback||"This device").trim()||"This device";
}
function deliveryLineName(l){
 const p=resolvedProductById(l?.productId)||db.products.find(x=>x.id===l?.productId);
 return p?deliveryProductDisplayName(p):(l?.productName||"Unknown product");
}
function deliveryEditAutomaticSummary(before,afterLines,branch,date,note){
 const out=[];
 const changes=computeDocketLineChanges(before?.lines||[],afterLines||[],new Date().toISOString());
 changes.forEach(c=>{
   if(c.before&&c.after){
     const beforeName=deliveryLineName(c.before),afterName=deliveryLineName(c.after);
     const bq=Number(c.before.qty||0),aq=Number(c.after.qty||0);
     if(String(c.before.productId||"")!==String(c.after.productId||"")){
       out.push(`Product changed: ${beforeName} × ${bq} → ${afterName} × ${aq}`);
     }else if(bq!==aq){
       out.push(`Quantity: ${afterName} ${bq} → ${aq}`);
     }
   }else if(c.before){
     out.push(`Removed: ${deliveryLineName(c.before)} × ${Number(c.before.qty||0)}`);
   }else if(c.after){
     out.push(`Added: ${deliveryLineName(c.after)} × ${Number(c.after.qty||0)}`);
   }
 });
 if((before?.branch||"")!==(branch||""))out.push(`Shop: ${displayBranchName(before?.branch||"")} → ${displayBranchName(branch||"")}`);
 if((before?.date||"")!==(date||""))out.push(`Date: ${before?.date||"—"} → ${date||"—"}`);
 if((before?.note||"")!==(note||""))out.push(`Docket note changed`);
 return out;
}
function currentDeliveryAutomaticSummary(){
 if(!editingDocketId||!deliveryEditOriginalSnapshot)return [];
 const branch=document.getElementById("delBranch")?.value||deliveryEditOriginalSnapshot.branch||"";
 const date=document.getElementById("delDate")?.value||deliveryEditOriginalSnapshot.date||"";
 const note=(document.getElementById("delNote")?.value||"").trim();
 const lines=(currentDelivery||[]).map(l=>{const p=resolvedProductById(l.productId)||db.products.find(x=>x.id===l.productId);return {...l,productName:p?deliveryProductDisplayName(p):(l.productName||"Unknown product")};});
 return deliveryEditAutomaticSummary(deliveryEditOriginalSnapshot,lines,branch,date,note);
}
function updateDeliveryEditReasonUI(changed,wasDelivered){
 const box=document.getElementById("deliveryEditReasonBox");if(!box)return true;
 const needed=!!(editingDocketId&&changed&&wasDelivered);
 if(!needed){box.style.display="none";box.innerHTML="";if(!changed)deliveryEditReason="";return true;}
 box.style.display="block";
 const value=deliveryEditReason||"";
 box.classList.toggle("good",!!value.trim());
 const autoSummary=currentDeliveryAutomaticSummary();
 box.innerHTML=`${autoSummary.length?`<div class="deliveryEditAutoSummary"><b>Changes detected automatically</b><ul>${autoSummary.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></div>`:""}<label>Why was this correction needed?</label><textarea id="deliveryEditReasonInput" maxlength="180" placeholder="e.g. Shop called and confirmed the delivered quantity was wrong.">${escapeHtml(value)}</textarea><div class="deliveryEditReasonHelp">The app records what changed automatically. You only need to explain why. Saved with the docket and visible on other synced devices. Device: <b>${escapeHtml(deliveryEditReasonDevice())}</b></div>${value.trim()?"":'<div class="deliveryEditReasonNeed">Enter a short reason before saving.</div>'}`;
 const input=document.getElementById("deliveryEditReasonInput");if(input)input.oninput=()=>{
   deliveryEditReason=input.value;box.classList.toggle("good",!!deliveryEditReason.trim());
   const need=box.querySelector(".deliveryEditReasonNeed");if(need)need.style.display=deliveryEditReason.trim()?"none":"block";
   const changedNow=docketDraftChanged(),invNow=deliveryEditAffectedInvoiceId?(db.invoices||[]).find(x=>x.id===deliveryEditAffectedInvoiceId):null;
   const guidedRepairNow=!!(invNow?.id&&sessionStorage.getItem(CONFLICT_WIZARD_RESUME_KEY)===invNow.id);
   const decisionOk=guidedRepairNow||!(changedNow&&wasDelivered&&invNow&&!invoiceIsPaid(invNow))||!!deliveryEditResolutionChoice;
   const saveBtn=document.getElementById("saveDelivery");if(saveBtn)saveBtn.disabled=!(deliveryEditReason.trim()&&decisionOk);
 };
 return !!value.trim();
}
function updateDocketEditResolutionUI(){
 const box=document.getElementById("deliveryCorrectionChoice"),saveBtn=document.getElementById("saveDelivery");if(!box||!saveBtn)return;
 if(!editingDocketId||!deliveryEditOriginalSnapshot){box.style.display="none";updateDeliveryEditReasonUI(false,false);saveBtn.disabled=false;return;}
 const changed=docketDraftChanged(),wasDelivered=!!deliveryEditOriginalSnapshot.deliveredAt,inv=deliveryEditAffectedInvoiceId?(db.invoices||[]).find(x=>x.id===deliveryEditAffectedInvoiceId):null;
 const reasonOk=updateDeliveryEditReasonUI(changed,wasDelivered);
 const needsDecision=changed&&wasDelivered&&!!inv;
 if(!needsDecision){box.style.display="none";if(!changed)deliveryEditResolutionChoice="";saveBtn.disabled=!reasonOk;return;}
 box.style.display="block";
 if(invoiceIsPaid(inv)){
   deliveryEditResolutionChoice="next_sunday";
   box.innerHTML=`<div class="choiceTitle">Next Sunday’s invoice will be adjusted automatically</div><div class="choiceSub">${escapeHtml(inv.number||"This invoice")} has already been paid, so it will stay unchanged. Any financial difference from this docket correction will be added to or deducted from the next Sunday billing cycle.</div>`;
   saveBtn.disabled=!reasonOk;
   return;
 }
 const guidedRepair=!!(inv?.id&&sessionStorage.getItem(CONFLICT_WIZARD_RESUME_KEY)===inv.id);
 if(guidedRepair){
   deliveryEditResolutionChoice="";
   box.innerHTML=`<div class="choiceTitle">Source repair step</div><div class="choiceSub">Save the corrected docket first. The Conflict Resolution Workflow will recheck the week and ask how to handle the invoice in Step 3.</div>`;
   saveBtn.disabled=!reasonOk;
   return;
 }
 box.innerHTML=`<div class="choiceTitle">How should this correction be handled?</div><div class="choiceSub">This delivered docket belongs to ${escapeHtml(inv.number||"the saved invoice")}. Choose one option, then save.</div><div class="deliveryCorrectionOptions"><button type="button" class="deliveryCorrectionOption ${deliveryEditResolutionChoice==='update_current'?'selected':''}" onclick="setDeliveryCorrectionChoice('update_current')"><div><b>Update this invoice</b><span>Apply the correction to this billing cycle.</span></div></button><button type="button" class="deliveryCorrectionOption ${deliveryEditResolutionChoice==='next_sunday'?'selected':''}" onclick="setDeliveryCorrectionChoice('next_sunday')"><div><b>Add to next Sunday’s invoice</b><span>Keep this invoice unchanged and carry the difference automatically.</span></div></button></div>${deliveryEditResolutionChoice?'':`<div class="deliveryCorrectionNeed">Choose one option to enable Save Docket Changes.</div>`}`;
 saveBtn.disabled=!(deliveryEditResolutionChoice&&reasonOk);
}
function setDeliveryEditAddTools(open){
  const entry=document.getElementById("deliveryEntryTools");
  const finder=document.getElementById("deliveryFinderTools");
  const btn=document.getElementById("deliveryEditAddToggle");
  const editing=!!(editingDocketId||editingSuggestionId);

  // Product / Qty / Add Line are core controls and must ALWAYS remain visible.
  if(entry)entry.style.display="block";
  if(finder)finder.style.display=editing?(open?"block":"none"):"block";
  syncDeliveryQuickActions();

  if(btn){
    btn.style.display=editing?"block":"none";
    btn.textContent=open?"− Hide product finder":"＋ Show product finder";
    btn.setAttribute("aria-expanded",open?"true":"false");
  }
}
window.toggleDeliveryEditAddTools=()=>{
  const finder=document.getElementById("deliveryFinderTools");
  const open=finder?.style.display==="none";
  setDeliveryEditAddTools(open);
  if(open){
    requestAnimationFrame(()=>{
      document.getElementById("deliveryProductSearch")?.focus({preventScroll:true});
    });
  }
};


let deliveryKeyboardBaselineHeight=window.innerHeight||0;
let deliveryKeyboardActiveInput=null;
let deliveryKeyboardRaf=0;

function deliveryKeyboardMetrics(){
  const vv=window.visualViewport;
  if(!vv)return {open:false,height:0,visibleBottom:window.innerHeight||0};
  const layoutH=Math.max(window.innerHeight||0,deliveryKeyboardBaselineHeight||0);
  const keyboardH=Math.max(0,Math.round(layoutH-(vv.height+vv.offsetTop)));
  return {
    open:keyboardH>110,
    height:keyboardH,
    visibleBottom:vv.offsetTop+vv.height
  };
}

function positionActiveDeliveryQty(){
  const input=deliveryKeyboardActiveInput;
  const list=document.getElementById("deliveryEditLines");
  if(!input||!list||!document.body.classList.contains("deliveryMode"))return;

  // v0.10.37 iPhone invariant: the New Delivery top Qty field already lives
  // in the fixed picker zone. Safari owns its focus/keyboard scrolling. Never
  // scroll #docket, reparent, refocus or reposition this input. Those actions
  // race visualViewport and can push the picker above the visible keyboard area.
  if(input.id==="delQty")return;

  const card=input.closest(".deliveryEditLineCard");
  if(!card){
    const pane=input.closest("#docket")||document.scrollingElement;
    const vv=window.visualViewport;
    const nudge=()=>{
      if(!input||!vv)return;
      const r=input.getBoundingClientRect();
      const safeTop=vv.offsetTop+10;
      const safeBottom=vv.offsetTop+vv.height-18;
      if(r.bottom>safeBottom && pane) pane.scrollTop += (r.bottom-safeBottom)+18;
      else if(r.top<safeTop && pane) pane.scrollTop -= (safeTop-r.top)+10;
    };
    requestAnimationFrame(nudge);
    setTimeout(nudge,70);setTimeout(nudge,170);setTimeout(nudge,280);
    return;
  }

  document.querySelectorAll(".deliveryEditLineCard.keyboardTarget").forEach(el=>{
    if(el!==card)el.classList.remove("keyboardTarget");
  });
  card.classList.add("keyboardTarget");

  // Scroll inside the product list only. Place the active card comfortably
  // below the fixed top zone and above the keyboard.
  const listRect=list.getBoundingClientRect();
  const cardRect=card.getBoundingClientRect();
  const targetTop=listRect.top+Math.max(8,(listRect.height-cardRect.height)*0.32);
  const delta=cardRect.top-targetTop;

  if(Math.abs(delta)>4){
    list.scrollTop+=delta;
  }

  // A second correction after Safari finishes its own focus scrolling.
  requestAnimationFrame(()=>{
    const lr=list.getBoundingClientRect();
    const cr=card.getBoundingClientRect();
    const safeTop=lr.top+6;
    const safeBottom=lr.bottom-8;
    if(cr.bottom>safeBottom)list.scrollTop+=cr.bottom-safeBottom;
    else if(cr.top<safeTop)list.scrollTop-=safeTop-cr.top;
  });
}

function updateDeliveryKeyboardViewport(){
  cancelAnimationFrame(deliveryKeyboardRaf);
  deliveryKeyboardRaf=requestAnimationFrame(()=>{
    if(!document.body.classList.contains("deliveryMode")){
      document.body.classList.remove("deliveryKeyboardOpen");
      document.documentElement.style.removeProperty("--md-keyboard-height");
      return;
    }

    /* v0.10.37 hard invariant — New Delivery Qty is already in the fixed
       picker row and needs NO keyboard layout treatment. iOS Safari gets
       full ownership of focus. Do not collapse the header, hide rows, move
       panes, set keyboard CSS variables, scroll, select, refocus or reposition. */
    if(deliveryKeyboardActiveInput?.id==="delQty"){
      document.body.classList.remove("deliveryKeyboardOpen");
      document.documentElement.style.removeProperty("--md-keyboard-height");
      document.querySelectorAll(".deliveryEditLineCard.keyboardTarget").forEach(el=>el.classList.remove("keyboardTarget"));
      return;
    }

    const m=deliveryKeyboardMetrics();
    document.body.classList.toggle("deliveryKeyboardOpen",m.open);
    if(m.open){
      document.documentElement.style.setProperty("--md-keyboard-height",`${m.height}px`);
      setTimeout(positionActiveDeliveryQty,40);
    }else{
      document.documentElement.style.removeProperty("--md-keyboard-height");
      document.querySelectorAll(".deliveryEditLineCard.keyboardTarget").forEach(el=>el.classList.remove("keyboardTarget"));
    }
  });
}


let newDeliveryQtySessionTop=null;
let newDeliveryQtySessionHeight=null;

function applyNewDeliveryQtyVisualViewport(top,height){
  const vv=window.visualViewport;
  const synthetic=Number.isFinite(top)||Number.isFinite(height);
  let vvTop=Number.isFinite(top)?top:(vv?.offsetTop||0);
  let vvHeight=Number.isFinite(height)?height:(vv?.height||window.innerHeight||0);

  // iOS can report several visualViewport positions during one keyboard
  // animation. In 0.10.42 the Qty row could be visible, then disappear again
  // when a later transient offset moved the shell back upward. During one Qty
  // focus session, only accept MORE downward pan and a SMALLER visible height.
  // Never chase a later transient value back toward the top until blur.
  if(!synthetic){
    newDeliveryQtySessionTop=newDeliveryQtySessionTop==null?vvTop:Math.max(newDeliveryQtySessionTop,vvTop);
    newDeliveryQtySessionHeight=newDeliveryQtySessionHeight==null?vvHeight:Math.min(newDeliveryQtySessionHeight,vvHeight);
    vvTop=newDeliveryQtySessionTop;
    vvHeight=newDeliveryQtySessionHeight;
  }

  document.documentElement.style.setProperty("--md-vv-top",`${Math.max(0,Math.round(vvTop))}px`);
  document.documentElement.style.setProperty("--md-vv-height",`${Math.max(0,Math.round(vvHeight))}px`);
  document.body.classList.add("deliveryNewQtyViewport");

  requestAnimationFrame(()=>window.syncShellGeometry?.());
}

function clearNewDeliveryQtyVisualViewport(){
  newDeliveryQtySessionTop=null;
  newDeliveryQtySessionHeight=null;
  document.body.classList.remove("deliveryNewQtyViewport");
  document.documentElement.style.removeProperty("--md-vv-top");
  document.documentElement.style.removeProperty("--md-vv-height");
  requestAnimationFrame(()=>window.syncShellGeometry?.());
}

function newDeliveryQtyViewportInvariant(visibleTopOverride,visibleHeightOverride){
  const input=document.activeElement?.id==="delQty"?document.activeElement:document.getElementById("delQty");
  const hero=document.querySelector(".hero");
  const content=document.querySelector(".contentViewport");
  const vv=window.visualViewport;
  if(!input||!hero||!content)return {ok:false,reason:"missing-elements"};

  // IMPORTANT iPhone/Safari coordinate-space rule (v0.10.44, retained from 0.10.41):
  // visualViewport.offsetTop is a LAYOUT-viewport offset, but the rectangles
  // returned by getBoundingClientRect() for the fixed shell we are testing are
  // VISUAL-viewport coordinates while the keyboard is open. Mixing those two
  // spaces caused v0.10.40 to raise a false FAIL even when Qty was visibly safe.
  //
  // Therefore geometry assertions are made in rect/visual coordinates:
  //     0 .. visualViewport.height
  // offsetTop is retained only as a diagnostic value / absolute-layout interval.
  const viewportOffsetTop=Number.isFinite(visibleTopOverride)?visibleTopOverride:(vv?.offsetTop||0);
  const visibleHeight=Number.isFinite(visibleHeightOverride)?visibleHeightOverride:(vv?.height||window.innerHeight||0);
  const visibleTop=0;
  const visibleBottom=visibleHeight;
  const layoutVisibleTop=viewportOffsetTop;
  const layoutVisibleBottom=viewportOffsetTop+visibleHeight;
  const ir=input.getBoundingClientRect(),hr=hero.getBoundingClientRect(),cr=content.getBoundingClientRect();
  const safeTop=Math.max(visibleTop,hr.bottom,cr.top)+8;
  const safeBottom=Math.min(visibleBottom,cr.bottom)-12;
  const cx=Math.max(0,Math.min(window.innerWidth-1,ir.left+Math.min(ir.width/2,12)));
  const cy=Math.max(0,Math.min(visibleBottom-1,ir.top+ir.height/2));
  const hit=document.elementFromPoint(cx,cy);
  const hitVisible=!!hit&&(hit===input||input.contains(hit)||hit.contains?.(input));

  // The Qty field itself is the regression invariant. The shell contributes the
  // safe boundaries, but a harmless Safari pan of the fixed hero must not turn
  // an otherwise visible/tappable Qty field into a false failure.
  const qtySafe=ir.top>=safeTop-2 && ir.bottom<=safeBottom;
  const ok=qtySafe && hitVisible;
  return {ok,top:visibleTop,bottom:visibleBottom,visibleHeight,viewportOffsetTop,layoutVisibleTop,layoutVisibleBottom,safeTop,safeBottom,qtySafe,hitVisible,input:{top:ir.top,bottom:ir.bottom,left:ir.left,right:ir.right},hero:{top:hr.top,bottom:hr.bottom},content:{top:cr.top,bottom:cr.bottom}};
}
window.newDeliveryQtyViewportInvariant=newDeliveryQtyViewportInvariant;

function runNewDeliveryQtyRuntimeCheck(){
  if(deliveryKeyboardActiveInput?.id!=="delQty")return;
  const result=newDeliveryQtyViewportInvariant();
  window.__mdQtyViewportLastCheck=result;
  let flag=document.getElementById("qtyViewportTestFlag");
  if(result.ok){flag?.remove();return;}
  if(!flag){
    flag=document.createElement("div");
    flag.id="qtyViewportTestFlag";
    flag.style.cssText="position:fixed;left:8px;right:8px;z-index:20000;padding:6px 8px;border-radius:8px;background:#7f1d1d;color:#fff;font:11px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:800;box-shadow:0 2px 8px #0004";
    document.body.appendChild(flag);
  }
  flag.style.top="4px";
  flag.textContent=`QTY VIEWPORT SELF-TEST FAIL · visible ${Math.round(result.top)}–${Math.round(result.bottom)} · offset ${Math.round(result.viewportOffsetTop||0)} · safe ${Math.round(result.safeTop||0)}–${Math.round(result.safeBottom||0)} · header ${Math.round(result.hero?.top||0)}–${Math.round(result.hero?.bottom||0)} · Qty ${Math.round(result.input?.top||0)}–${Math.round(result.input?.bottom||0)}`;
}

function clearStaleNewDeliveryQtyFocusState(){
  const active=document.activeElement;
  if(active?.id==="delQty")return;
  deliveryKeyboardActiveInput=null;
  document.body.classList.remove("deliveryNewQtyFocus","deliveryNewQtyViewport");
  document.documentElement.style.removeProperty("--md-vv-top");
  document.documentElement.style.removeProperty("--md-vv-height");
  document.getElementById("qtyViewportTestFlag")?.remove();
  requestAnimationFrame(()=>window.syncShellGeometry?.());
}
window.clearStaleNewDeliveryQtyFocusState=clearStaleNewDeliveryQtyFocusState;

window.newDeliveryQtyFocus=(input)=>{
  // New focus session: forget any viewport values from the previous keyboard.
  newDeliveryQtySessionTop=null;
  newDeliveryQtySessionHeight=null;
  deliveryKeyboardActiveInput=input;
  document.body.classList.add("deliveryNewQtyFocus");
  document.body.classList.remove("deliveryKeyboardOpen");
  document.documentElement.style.removeProperty("--md-keyboard-height");
  applyNewDeliveryQtyVisualViewport();
  [40,120,240,420].forEach(ms=>setTimeout(()=>{
    if(document.activeElement===input)applyNewDeliveryQtyVisualViewport();
  },ms));
  // Automatic on-device regression check after the iOS keyboard animation.
  // PASS is silent. FAIL puts exact viewport/header/Qty geometry on screen.
  setTimeout(()=>{if(document.activeElement===input)runNewDeliveryQtyRuntimeCheck()},700);
};

window.newDeliveryQtyBlur=(input)=>{
  setTimeout(()=>{
    if(document.activeElement!==input){
      clearStaleNewDeliveryQtyFocusState();
    }
  },120);
};

window.deliveryQtyFocus=(input)=>{
  deliveryKeyboardActiveInput=input;
  try{input.select()}catch(_){}
  const card=input.closest(".deliveryEditLineCard");
  if(card)card.classList.add("keyboardTarget");

  // Safari's visualViewport changes after focus. Re-run at a few short intervals
  // so the card lands correctly even when the keyboard animation is still running.
  updateDeliveryKeyboardViewport();
  setTimeout(updateDeliveryKeyboardViewport,60);
  setTimeout(updateDeliveryKeyboardViewport,180);
  setTimeout(positionActiveDeliveryQty,240);
};

window.deliveryQtyBlur=(input)=>{
  setTimeout(()=>{
    if(document.activeElement!==input)deliveryKeyboardActiveInput=null;
    updateDeliveryKeyboardViewport();
  },80);
};

if(window.visualViewport){
  window.visualViewport.addEventListener("resize",()=>{
    if(deliveryKeyboardActiveInput?.id==="delQty")applyNewDeliveryQtyVisualViewport();
    updateDeliveryKeyboardViewport();
  },{passive:true});
  window.visualViewport.addEventListener("scroll",()=>{
    if(deliveryKeyboardActiveInput?.id==="delQty")applyNewDeliveryQtyVisualViewport();
    updateDeliveryKeyboardViewport();
  },{passive:true});
}
window.addEventListener("orientationchange",()=>{
  setTimeout(()=>{
    deliveryKeyboardBaselineHeight=window.innerHeight||deliveryKeyboardBaselineHeight;
    updateDeliveryKeyboardViewport();
  },250);
},{passive:true});

function renderDelivery(){
 const tb=document.getElementById("deliveryLines");
 const editBox=document.getElementById("deliveryEditLines");
 const tableWrap=document.getElementById("deliveryCreateLinesTable");
 const products=canonicalDeliveryProducts().sort((a,b)=>deliveryProductDisplayName(a).localeCompare(deliveryProductDisplayName(b),"en",{sensitivity:"base",numeric:true}));

 // One reusable line-item component for New, Edit and Suggested Delivery.
 // The old New-Delivery table is intentionally retired from the live editor.
 if(editBox)editBox.style.display="grid";
 if(tableWrap)tableWrap.style.display="none";
 if(tb)tb.innerHTML="";

 if(editBox){
   editBox.innerHTML=currentDelivery.map((l,i)=>{
     const p=resolvedProductById(l.productId);
     if(!p)return `<div class="deliveryEditLineCard">Unknown product record</div>`;
     const prices=validatedProductPrices(p)||{cost:0,retail:0};
     const productOptions=products.map(x=>`<option value="${x.id}" ${x.id===l.productId?'selected':''}>${escapeHtml(deliveryProductDisplayName(x))}</option>`).join('');
     return `<div class="deliveryEditLineCard" data-line-index="${i}">
       <div class="deliveryEditLineProduct">
         <label>Product</label>
         <select onchange="editDeliveryLineProduct(${i},this.value)">${productOptions}</select>
       </div>
       <div class="deliveryEditLineBottom">
         <div class="deliveryEditLineMeta">
           Cost <b>${baht(prices.cost)}</b> · Retail <b>${baht(prices.retail)}</b><br>
           Cost total <b>${baht(Number(l.qty||0)*prices.cost)}</b>
         </div>
         <div class="deliveryEditQtyBox">
           <label>Qty</label>
           <input type="number" min="1" inputmode="numeric" value="${Number(l.qty||0)}" onfocus="deliveryQtyFocus(this)" onclick="this.select()" onblur="deliveryQtyBlur(this)" onchange="editDeliveryLineQty(${i},this.value)">
         </div>
         <button class="deliveryEditRemoveBtn" type="button" aria-label="Remove ${escapeHtmlAttr(deliveryProductDisplayName(p))}" onclick="removeDel(${i})">×</button>
       </div>
     </div>`;
   }).join("");
 }

 const t=currentDelivery.reduce((sum,l)=>{const p=resolvedProductById(l.productId),prices=validatedProductPrices(p);return sum+(prices?Number(l.qty||0)*prices.cost:0)},0);
 document.getElementById("deliveryTotal").textContent=baht(t);
 updateDocketEditResolutionUI();
}
function rerenderDeliveryStable(){
 const section=document.getElementById("docket");
 const sectionTop=section?.scrollTop||0;
 const editLines=document.getElementById("deliveryEditLines");
 const editTop=editLines?.scrollTop||0;
 const scroller=document.querySelector("#deliveryCreatePane .deliveryLinesWrap");
 const st=scroller?.scrollTop||0;
 renderDelivery();
 requestAnimationFrame(()=>{
   const next=document.querySelector("#deliveryCreatePane .deliveryLinesWrap");
   if(next)next.scrollTop=st;
   const nextEdit=document.getElementById("deliveryEditLines");
   if(nextEdit)nextEdit.scrollTop=editTop;
   if(section)section.scrollTop=sectionTop;
 });
}
window.editDeliveryLineProduct=(i,pid)=>{if(!document.body.classList.contains("deliveryMode"))return;const p=resolvedProductById(pid),prices=validatedProductPrices(p);if(!p||!prices)return alert("Choose a valid priced product.");currentDelivery[i].productId=pid;rerenderDeliveryStable();};
window.editDeliveryLineQty=(i,val)=>{if(!document.body.classList.contains("deliveryMode"))return;const q=Number(val||0);if(q<=0){alert("Quantity must be greater than zero.");rerenderDeliveryStable();return;}currentDelivery[i].qty=q;rerenderDeliveryStable();};
window.removeDel=i=>{currentDelivery.splice(i,1);rerenderDeliveryStable()}
document.getElementById("delBranch").onchange=()=>{deliveryShowAllProducts=false;fillProducts();updateDocketEditResolutionUI();};
document.getElementById("delParent").onchange=()=>fillDeliveryVariants();
document.getElementById("delDate").addEventListener("change",updateDocketEditResolutionUI);
document.getElementById("delNote").addEventListener("input",updateDocketEditResolutionUI);
document.getElementById("addDeliveryLine").onclick=()=>{
 const pid=document.getElementById("delVariant").value, qty=+document.getElementById("delQty").value||0;
 if(!document.getElementById("delParent").value)return alert("Choose a product first.");
 if(!pid)return alert("Choose a variant first.");
 if(qty<=0)return alert("Enter a quantity greater than zero.");
 const p=resolvedProductById(pid);
 if(!p)return alert("That product could not be found in Pin's master catalogue. Please refresh the app and try again.");
 const prices=validatedProductPrices(p);
 if(!prices || prices.cost<=0 || prices.retail<=0)return alert(`Price information is missing for ${p.name}. Set its cost and retail price in Settings before adding it to a delivery.`);
 // Persist any high-confidence repaired base prices so the catalogue and docket stay consistent.
 if(!(Number(p.cost)>0))p.cost=prices.cost;if(!(Number(p.retail)>0))p.retail=prices.retail;
 const old=currentDelivery.find(x=>x.productId===pid); if(old)old.qty+=qty;else currentDelivery.push({productId:pid,qty});
 const qtyInput=document.getElementById("delQty");
 qtyInput.value="";
 qtyInput.blur();
 const variantInput=document.getElementById("delVariant");
 if(variantInput)variantInput.value="";
 // Adding a line ends the top Qty keyboard session. Restore every hidden
 // top control immediately even if iOS fails to deliver the expected blur
 // timing during the keyboard dismissal animation.
 clearStaleNewDeliveryQtyFocusState();

 // Draft line changes stay local until Pin explicitly saves the docket.
 // Never rebuild the whole application or scroll the entire docket here.
 renderDelivery();

 requestAnimationFrame(()=>{
   const list=document.getElementById("deliveryEditLines");
   if(list)list.scrollTop=list.scrollHeight;
 });
}
document.getElementById("clearDelivery").onclick=()=>{clearStaleNewDeliveryQtyFocusState();currentDelivery=[];renderDelivery()}
function resetDeliveryEditor(){
 editingDocketId=null; editingSuggestionId=null; currentDelivery=[]; deliveryEditOriginalSnapshot=null; deliveryEditAffectedInvoiceId=null; deliveryEditResolutionChoice=""; deliveryEditReason="";
 document.getElementById("delNote").value="";
 document.getElementById("delQty").value="";
 document.getElementById("saveDelivery").textContent="Save Delivery + Create Docket";
 document.getElementById("cancelEditDelivery").style.display="none";
 document.getElementById("clearDelivery").textContent="Clear";
 const editBanner=document.getElementById("deliveryEditBanner");
 if(editBanner){editBanner.style.display="none";editBanner.innerHTML='<b>Editing docket.</b> Change product or quantity directly, add/remove lines, then save.';}
 const chip=document.getElementById("deliveryEditChip");if(chip){chip.style.display="none";chip.textContent="Editing docket";}
 const nt=document.getElementById("deliveryNoteToggle");if(nt)nt.open=false;
 document.body.classList.remove("deliveryEditMode","deliveryKeyboardOpen","deliveryNewQtyFocus","deliveryNewQtyViewport");
 document.documentElement.style.removeProperty("--md-keyboard-height");
 deliveryKeyboardActiveInput=null;
 setDeliveryEditAddTools(true);
 const title=document.getElementById("deliveryEditorTitle");if(title)title.childNodes[0].nodeValue="Create delivery ";
 renderDelivery();
}
document.getElementById("cancelEditDelivery").onclick=()=>{resetDeliveryEditor();openDeliveryArchive();const id=sessionStorage.getItem(CONFLICT_WIZARD_RESUME_KEY);if(id)setTimeout(()=>openConflictResolutionWizard(id),90)};
function refreshReconciliationViews(){
  try{
    const recs=refreshStoredReconciliations();
    renderArchive();
    renderExcelReconciliation(recs.slice(-4));
    renderSundayWizard();
  }catch(e){console.warn("Could not refresh reconciliation views",e)}
}
document.getElementById("saveDelivery").onclick=()=>{
 if(!currentDelivery.length)return alert("Add at least one product.");
 const lines=[];
 for(const x of currentDelivery){
   const p=resolvedProductById(x.productId),prices=validatedProductPrices(p);
   if(!p||!prices||prices.cost<=0||prices.retail<=0)return alert(`Cannot save this docket because price information is missing for ${p?.name||"a product"}.`);
   lines.push({...x,productName:deliveryProductDisplayName(p),cost:prices.cost,retail:prices.retail});
 }
 const branch=document.getElementById("delBranch").value,date=document.getElementById("delDate").value||today(),note=document.getElementById("delNote").value.trim();
 if(editingDocketId){
   const d=db.deliveries.find(x=>x.id===editingDocketId); if(!d)return alert("The delivery docket being edited could not be found.");
   const before=JSON.parse(JSON.stringify(d));
   const changed=docketDraftChanged();
   const affectedInv=deliveryEditAffectedInvoiceId?(db.invoices||[]).find(x=>x.id===deliveryEditAffectedInvoiceId):null;
   if(changed&&before.deliveredAt&&affectedInv&&invoiceIsPaid(affectedInv))deliveryEditResolutionChoice="next_sunday";
   if(changed&&before.deliveredAt&&!deliveryEditReason.trim()){updateDocketEditResolutionUI();return alert("Enter a short reason for editing this delivered docket.");}
   const guidedConflictRepair=!!(affectedInv?.id&&sessionStorage.getItem(CONFLICT_WIZARD_RESUME_KEY)===affectedInv.id);
   if(changed&&before.deliveredAt&&affectedInv&&!deliveryEditResolutionChoice&&!guidedConflictRepair){updateDocketEditResolutionUI();return alert("Choose whether to update this invoice or add the correction to next Sunday’s invoice.");}
   const editAt=new Date().toISOString();
   const changes=computeDocketLineChanges(before.lines||[],lines,editAt);
   db.docketAudit.push({id:"DA"+Date.now(),action:"edited",at:editAt,docketId:d.id,date:d.date||"",branch:d.branch||"",note:d.note||"",lines:(d.lines||[]).map(l=>({...l})),beforeSnapshot:before,resolutionChoice:deliveryEditResolutionChoice||null,affectedInvoiceId:affectedInv?.id||null});
   if(before.deliveredAt&&changes.length)d.lineChanges=[...(Array.isArray(d.lineChanges)?d.lineChanges:[]),...changes];
   if(changed&&before.deliveredAt){
     if(!Array.isArray(d.editAudit))d.editAudit=[];
     const lineSummary=deliveryEditAutomaticSummary(before,lines,branch,date,note);
     d.editAudit.push({at:editAt,reason:deliveryEditReason.trim(),device:deliveryEditReasonDevice(),user:mdCloudSession?.user?.email||"",summary:lineSummary});
   }
   d.branch=branch; d.date=date; d.note=note; d.lines=lines; d.editedAt=editAt;
   if(d.generatedFromSundaySuggestion){
     d.userEditedSuggestedDraft=true;
     d.suggestedRef=d.suggestedRef||suggestedDraftRef(d.sourceSundayDate||date,d.branch);
   }
   if(changed&&before.deliveredAt&&affectedInv&&!guidedConflictRepair){
     if(!Array.isArray(db.pendingCorrections))db.pendingCorrections=[];
     const replacedCorrections=db.pendingCorrections.filter(c=>c.invoiceId===affectedInv.id&&["pending","waiting_reconciliation","queued"].includes(c.status));
     const replacedIds=new Set(replacedCorrections.map(c=>c.id));
     if(replacedIds.size)db.adjustments=(db.adjustments||[]).filter(a=>!(replacedIds.has(a.correctionId)&&a.status==="pending"));
     db.pendingCorrections=db.pendingCorrections.filter(c=>!replacedIds.has(c.id));
     db.pendingCorrections.push({id:"COR"+Date.now(),status:"pending",docketId:d.id,invoiceId:affectedInv.id,sourceDate:affectedInv.reportDate,choice:deliveryEditResolutionChoice,createdAt:editAt,changes:changes.map(c=>({before:c.before?{...c.before}:null,after:c.after?{...c.after}:null})),message:"Waiting for the edited week to reconcile."});
   }else if(changed&&before.deliveredAt&&affectedInv&&guidedConflictRepair){
     const existing=[...(db.pendingCorrections||[])].filter(c=>c.invoiceId===affectedInv.id&&["pending","waiting_reconciliation"].includes(c.status)).sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")))[0];
     if(existing){existing.message="Source docket repaired in guided workflow; rechecking reconciliation.";existing.sourceRepairAt=editAt;}
   }
   const savedId=d.id,resolutionChoice=deliveryEditResolutionChoice;
   save();
   refreshReconciliationViews();
   processPendingDocketCorrections();
   resetDeliveryEditor(); renderDocketArchive(savedId); renderMetrics(); renderHistory(); renderAudit(); renderDashboardAlerts();
   openDeliveryArchive(savedId);
   const resumeConflictId=sessionStorage.getItem(CONFLICT_WIZARD_RESUME_KEY);if(resumeConflictId)setTimeout(()=>openConflictResolutionWizard(resumeConflictId),90);
   const corr=(db.pendingCorrections||[]).find(c=>c.docketId===savedId&&c.createdAt===editAt);
   if(guidedConflictRepair)alert("Docket correction saved. Returning to Conflict Resolution Workflow for recheck.");
   else if(corr?.status==="waiting_reconciliation")alert("Docket saved. The correction choice is locked in. The app will apply it automatically as soon as this week reconciles again.");
   else if(changed&&before.deliveredAt&&affectedInv)alert(resolutionChoice==="update_current"?"Docket saved. This invoice has been updated automatically.":(invoiceIsPaid(affectedInv)?"Docket saved. The paid invoice remains unchanged. Any financial difference will be added automatically to the next Sunday invoice.":"Docket saved. The correction will be added automatically to the next Sunday invoice."));
   return;
 }
 const d={id:"D"+Date.now(),branch,date,note,lines,deliveredAt:null,lineChanges:[]};
 db.deliveries.push(d); resetDeliveryEditor(); save(); refreshReconciliationViews(); renderDocket(d); renderMetrics(); renderHistory(); renderAudit(); openDeliveryArchive(d.id);
}

function lineKey(l){return String(l.productId||"")+"|"+String(Number(l.qty||0));}
function productLineLabel(l){const p=resolvedProductById(l.productId)||db.products.find(x=>x.id===l.productId);return `${p?deliveryProductDisplayName(p):(l.productName||"Unknown product")} × ${Number(l.qty||0)}`;}
function docketChangeHistoryMarkup(d){
 const changes=Array.isArray(d.lineChanges)?d.lineChanges:[];
 const audit=Array.isArray(d.editAudit)?d.editAudit:[];
 const lineHtml=changes.length?`<div class="lineHistory"><b>Changes after delivery</b>${changes.map(c=>`<div style="margin-top:7px">${c.before?`<div><del>${escapeHtml(productLineLabel(c.before))}</del></div>`:""}${c.after?`<div class="newValue">${escapeHtml(productLineLabel(c.after))}</div>`:`<div class="newValue">Deleted</div>`}<div class="changeMeta">${escapeHtml(c.at?new Date(c.at).toLocaleString():"")}</div></div>`).join("")}</div>`:"";
 const auditHtml=audit.length?`<details class="deliveryAuditTrail"><summary>Edit history · ${audit.length}</summary>${[...audit].reverse().map(a=>`<div class="deliveryAuditItem"><div class="deliveryAuditReason">${escapeHtml(a.reason||"Edited delivered docket")}</div><div class="deliveryAuditMeta">${escapeHtml(a.device||"Unknown device")}${a.user?` · ${escapeHtml(a.user)}`:""} · ${escapeHtml(a.at?new Date(a.at).toLocaleString():"")}</div>${Array.isArray(a.summary)&&a.summary.length?`<div class="deliveryAuditChanges">${a.summary.map(x=>escapeHtml(x)).join("<br>")}</div>`:""}</div>`).join("")}</details>`:"";
 return lineHtml+auditHtml;
}
function computeDocketLineChanges(beforeLines,afterLines,at){
 const b=new Map((beforeLines||[]).map(l=>[String(l.productId||""),l])),a=new Map((afterLines||[]).map(l=>[String(l.productId||""),l])),out=[],removed=[],added=[];
 b.forEach((old,id)=>{const neu=a.get(id);if(neu){if(Number(old.qty||0)!==Number(neu.qty||0))out.push({at,before:{...old},after:{...neu}});}else removed.push(old);});
 a.forEach((neu,id)=>{if(!b.has(id))added.push(neu);});
 if(removed.length===1&&added.length===1){out.push({at,before:{...removed[0]},after:{...added[0]}});return out;}
 removed.forEach(old=>out.push({at,before:{...old},after:null}));added.forEach(neu=>out.push({at,before:null,after:{...neu}}));return out;
}

/* Reusable Code 128-B module.
   Stores only barcode text in data; graphics are generated on demand. */
const CODE128_PATTERNS=[
"212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
"221312","231212","112232","122132","122231","113222","123122","123221","223211","221132",
"221231","213212","223112","312131","311222","321122","321221","312212","322112","322211",
"212123","212321","232121","111323","131123","131321","112313","132113","132311","211313",
"231113","231311","112133","112331","132131","113123","113321","133121","313121","211331",
"231131","213113","213311","213131","311123","311321","331121","312113","312311","332111",
"314111","221411","431111","111224","111422","121124","121421","141122","141221","112214",
"112412","122114","122411","142112","142211","241211","221114","413111","241112","134111",
"111242","121142","121241","114212","124112","124211","411212","421112","421211","212141",
"214121","412121","111143","111341","131141","114113","114311","411113","411311","113141",
"114131","311141","411131","211412","211214","211232","2331112"
];

function code128Values(text){
  const s=String(text||"");
  if(!s)return null;
  const values=[];
  for(const ch of s){
    const code=ch.charCodeAt(0);
    if(code<32||code>126)return null; // Code 128-B printable ASCII
    values.push(code-32);
  }
  let checksum=104; // Start B
  values.forEach((v,i)=>checksum+=v*(i+1));
  checksum%=103;
  return [104,...values,checksum,106];
}
function code128Modules(text){
  const values=code128Values(text);
  if(!values)return null;
  const widths=[];
  values.forEach(v=>{
    const p=CODE128_PATTERNS[v];
    if(!p)return;
    for(const n of p)widths.push(Number(n));
  });
  return widths;
}
function code128Svg(text){
  const safe=normalizeBarcode(text);
  if(!safe)return "";
  const widths=code128Modules(safe);
  if(!widths)return "";
  const quiet=10;
  const total=widths.reduce((a,b)=>a+b,0)+quiet*2;
  let x=quiet,bar=true,rects="";
  widths.forEach(w=>{
    if(bar)rects+=`<rect x="${x}" y="0" width="${w}" height="28"></rect>`;
    x+=w;bar=!bar;
  });
  return `<svg viewBox="0 0 ${total} 28" preserveAspectRatio="none" role="img" aria-label="Barcode ${escapeHtmlAttr(safe)}"><g fill="#000">${rects}</g></svg>`;
}
function productBarcode(productId){
  return normalizeBarcode((db.products||[]).find(p=>p.id===productId)?.barcode||"");
}
function docketBarcodeMarkup(productId){
  const code=productBarcode(productId);
  if(!code)return `<span class="docketBarcodeBlank">—</span>`;
  const svg=code128Svg(code);
  return svg?`${svg}<span class="docketBarcodeText">${escapeHtml(code)}</span>`:`<span class="docketBarcodeText">${escapeHtml(code)}</span>`;
}

/* PDF barcode painter. Uses the same Code 128-B module widths as HTML/SVG. */
function pdfDrawCode128(commands,text,x,y,w,h){
  const safe=normalizeBarcode(text);
  const widths=code128Modules(safe);
  if(!widths)return false;
  const quiet=10;
  const modules=widths.reduce((a,b)=>a+b,0)+quiet*2;
  const moduleW=w/modules;
  // Refuse to render an impractically narrow barcode. Human-readable text still prints.
  if(moduleW<0.34)return false;
  let cursor=x+quiet*moduleW,bar=true;
  commands.push("q 0 0 0 rg");
  widths.forEach(part=>{
    const pw=part*moduleW;
    if(bar)commands.push(`${cursor.toFixed(2)} ${y.toFixed(2)} ${pw.toFixed(2)} ${h.toFixed(2)} re f`);
    cursor+=pw;bar=!bar;
  });
  commands.push("Q");
  return true;
}

function stockReviewMarkup(d){
  const items=(d?.stockReviewLines||[]);
  if(!items.length)return "";
  const rows=items.map(r=>`<div class="stockReviewRow"><div><div class="stockReviewName">${escapeHtml(r.productName||"Product")}</div><div class="stockReviewMeta">Possible out of stock · shop ${Number(r.previousStock||0)} → ${Number(r.sundayClosing||0)} · target ${Number(r.suggestedTarget||0)} · proposed ${Number(r.proposedQty||0)}<br>${escapeHtml(r.reason||"")}</div></div><div class="stockReviewActions"><button type="button" class="stockReviewOos" onclick='markSuggestedProductOutOfStock("${escapeHtmlAttr(d.id)}","${escapeHtmlAttr(r.productId)}")'>Out of stock</button><button type="button" class="stockReviewKeep" onclick='keepSuggestedProductActive("${escapeHtmlAttr(d.id)}","${escapeHtmlAttr(r.productId)}")'>Keep top-up</button></div></div>`).join("");
  return `<div class="stockReviewBox"><div class="stockReviewTitle">Review before top-up · ${items.length} possible out-of-stock item${items.length===1?"":"s"}</div>${rows}</div>`;
}
window.markSuggestedProductOutOfStock=(docketId,productId)=>{
  const p=(db.products||[]).find(x=>x.id===productId),d=(db.deliveries||[]).find(x=>x.id===docketId);if(!p||!d)return;
  if(!confirm(`Mark ${deliveryProductDisplayName(p)} as Out of Stock?\n\nIt will be removed from automatic suggested top-ups until reactivated in Master Products.`))return;
  p.stockStatus="out_of_stock";p.stockStatusUpdatedAt=new Date().toISOString();p.stockStatusReason="Confirmed from Sunday suggested top-up review";delete p.stockReviewKeepActiveDate;
  (db.deliveries||[]).filter(isSuggestedDraftDocket).forEach(x=>{x.lines=(x.lines||[]).filter(l=>l.productId!==productId);x.stockReviewLines=(x.stockReviewLines||[]).filter(l=>l.productId!==productId);});
  save();renderDocketArchive(docketId);renderCatalogue();renderPinDashboard();
};
window.keepSuggestedProductActive=(docketId,productId)=>{
  const p=(db.products||[]).find(x=>x.id===productId),d=(db.deliveries||[]).find(x=>x.id===docketId);if(!p||!d)return;
  const r=(d.stockReviewLines||[]).find(x=>x.productId===productId);if(!r)return;
  p.stockReviewKeepActiveDate=d.sourceSundayDate||d.date||today();
  d.lines=d.lines||[];if(!d.lines.some(l=>l.productId===productId))d.lines.push({productId,qty:Number(r.proposedQty||0),productName:r.productName,cost:Number(r.cost||0),retail:Number(r.retail||0),suggestedTarget:Number(r.suggestedTarget||0),sundayClosing:Number(r.sundayClosing||0),suggestionClass:r.suggestionClass});
  d.stockReviewLines=(d.stockReviewLines||[]).filter(x=>x.productId!==productId);
  save();renderDocketArchive(docketId);renderPinDashboard();
};
window.setProductStockStatus=(id,status)=>{
  const p=(db.products||[]).find(x=>x.id===id);if(!p||isProductArchived(p))return;
  if(status==="out_of_stock"){
    p.stockStatus="out_of_stock";
    p.stockStatusUpdatedAt=new Date().toISOString();
    p.stockStatusReason="Set manually in Product catalogue";
    delete p.stockReviewKeepActiveDate;
    (db.deliveries||[]).filter(isSuggestedDraftDocket).forEach(x=>{
      x.lines=(x.lines||[]).filter(l=>l.productId!==id);
      x.stockReviewLines=(x.stockReviewLines||[]).filter(l=>l.productId!==id);
    });
  }else{
    delete p.stockStatus;delete p.stockStatusUpdatedAt;delete p.stockStatusReason;delete p.stockReviewKeepActiveDate;
  }
  save();renderCatalogue();renderPinDashboard();
};
window.toggleProductStockStatus=id=>{const p=(db.products||[]).find(x=>x.id===id);if(!p)return;setProductStockStatus(id,productIsOutOfStock(p)?"in_stock":"out_of_stock");};
window.reactivateProductStock=id=>setProductStockStatus(id,"in_stock");

function docketMarkup(d){
 let total=0;
 const rows=(d.lines||[]).map(l=>{
  const p=db.products.find(x=>x.id===l.productId);
  const name=p?deliveryProductDisplayName(p):(l.productName||"Unknown product");
  const cost=Number(l.cost ?? p?.cost ?? 0), retail=Number(l.retail ?? p?.retail ?? 0), amount=Number(l.qty||0)*cost; total+=amount;
  return `<tr>
    <td>${escapeHtml(name)}</td>
    <td>${l.qty||0}</td>
    <td>${baht(cost)}</td>
    <td>${baht(retail)}</td>
    <td>${baht(amount)}</td>
    <td class="docketBarcodeCell">${docketBarcodeMarkup(l.productId)}</td>
  </tr>`;
 }).join("");
 const suggested=isSuggestedDraftDocket(d);
 const ref=d.suggestedRef||suggestedDraftRef(d.sourceSundayDate||d.date,d.branch);
 const statusText=d.deliveredAt
   ? `✓ DELIVERED · ${escapeHtml(String(d.deliveredAt).slice(0,10))}`
   : (suggested?`DRAFT · ${escapeHtml(ref)}`:"NOT DELIVERED");
 return `<div class="docket"><div class="docketHead"><div><b>DELIVERY DOCKET</b><div class="small">Yaowaret</div><div class="docketStatus ${d.deliveredAt?"delivered":"draft"}">${statusText}</div></div><div style="text-align:right"><b>${escapeHtml(displayBranchName(d.branch))}</b><div class="small">${escapeHtml(d.date||"—")}${d.note?` · ${escapeHtml(d.note)}`:""}</div></div></div>
 ${suggested?stockReviewMarkup(d):""}
 <table style="min-width:0;table-layout:fixed">
   <colgroup><col style="width:34%"><col style="width:8%"><col style="width:11%"><col style="width:11%"><col style="width:13%"><col style="width:23%"></colgroup>
   <thead><tr><th>Description</th><th>Qty</th><th>Unit cost</th><th>Retail</th><th>Amount</th><th>Barcode</th></tr></thead>
   <tbody>${rows}</tbody>
 </table>
 <div class="totalbar"><span>TOTAL COST ${baht(total)}</span></div>${docketChangeHistoryMarkup(d)}</div>`;
}
function inferLegacyDeliveredDockets(){
 let changed=false;
 (db.deliveries||[]).forEach(d=>{if(d.deliveredAt||d.generatedFromSundaySuggestion)return;const inv=affectedInvoiceForDocket(d);if(inv){d.deliveredAt=(inv.createdAt||(`${d.date||inv.reportDate}T12:00:00`));d.deliveryStatusInferred=true;changed=true;}});
 if(changed)localStorage.setItem("mdpin-db",JSON.stringify(db));
}
let activeDocketArchiveId=null;
function removeDocketViewportActions(){
 document.querySelectorAll(".docketViewportActions").forEach(el=>el.remove());
 document.body.style.removeProperty("--docket-footer-height");
}
function mountDocketViewportActions(){
 removeDocketViewportActions();
 if(!document.body.classList.contains("docketMode"))return;
 const actions=document.querySelector("#docketArchive .docketActivePanel>.docketActions");
 if(!actions)return;
 const panel=actions.closest(".docketActivePanel");
 if(panel?.dataset.docketId)actions.dataset.docketId=panel.dataset.docketId;
 actions.classList.add("docketViewportActions");
 document.body.appendChild(actions);
 requestAnimationFrame(()=>{
   const height=Math.ceil(actions.getBoundingClientRect().height);
   if(height>0)document.body.style.setProperty("--docket-footer-height",`${height}px`);
 });
}
function docketSelectorButtonMarkup(d,active=false,action=""){
 const suggested=isSuggestedDraftDocket(d);
 const ref=d.suggestedRef||suggestedDraftRef(d.sourceSundayDate||d.date,d.branch);
 const label=suggested
   ? `<b>${escapeHtml(ref)}</b> · ${escapeHtml(displayBranchName(d.branch))} · ${escapeHtml(recordDateLabel(d.date||d.sourceSundayDate))}`
   : `${escapeHtml(d.date||"No date")} — ${escapeHtml(displayBranchName(d.branch))}`;
 const statusBadge=d.deliveredAt
   ? `<span class="docketStatusBadge delivered">Delivered</span>`
   : `<span class="docketStatusBadge notDelivered">Not delivered</span>`;
 return `<button type="button" class="docketSelector ${suggested?"suggestedSelector":""} ${active?"active":""}" onclick='${action}'><span class="docketSelectorMain"><span class="docketSelectorLabel">${label}</span>${statusBadge}</span><span class="docketSelectorChevron">${active?"⌃":"⌄"}</span></button>`;
}
function renderDocketArchive(openId){
 const box=document.getElementById("docketArchive"); if(!box)return;
 removeDocketViewportActions();
 migrateLegacyDeliverySuggestions();
 const dockets=[...(db.deliveries||[])].sort((a,b)=>
   Number(isSuggestedDraftDocket(b))-Number(isSuggestedDraftDocket(a)) ||
   String(b.date||"").localeCompare(String(a.date||"")) ||
   String(b.id).localeCompare(String(a.id))
 );
 const ids=new Set(dockets.map(x=>x.id));
 if(!dockets.length){
   activeDocketArchiveId=null;
   box.innerHTML=`<div class="notice">No delivery dockets yet.<div style="margin-top:10px"><button class="btn" onclick='openDeliveryCreate()'>Create New Delivery</button></div></div>`;
   return;
 }
 if(openId!==undefined)activeDocketArchiveId=ids.has(openId)?openId:null;
 else if(activeDocketArchiveId&&!ids.has(activeDocketArchiveId))activeDocketArchiveId=null;

 const activeDocket=dockets.find(d=>d.id===activeDocketArchiveId)||null;
 // v0.10.80 — focus mode: when one docket is open, hide the other selectors
 // until the active docket is collapsed again. Mirrors the proven Settings
 // chevron behaviour and keeps the screen focused on one task at a time.
 const visibleDockets=activeDocket?[activeDocket]:dockets;
 const docketSelectors=visibleDockets.map(d=>docketSelectorButtonMarkup(d,!!(activeDocket&&activeDocket.id===d.id),`selectDocketArchive("${d.id}")`)).join("");

 let viewer=`<div class="docketEmptyState">Tap a delivery above to view it.</div>`;
 if(activeDocket){
   const suggested=isSuggestedDraftDocket(activeDocket);
   viewer=`<div class="docketActivePanel" data-docket-id="${activeDocket.id}">
     <div class="docketActiveScroll">${docketMarkup(activeDocket)}</div>
     <div class="docketActions">
       <button class="btn gold" onclick='editDocket("${activeDocket.id}")'>Edit Docket</button>
       <button class="btn" onclick='toggleDocketDelivered("${activeDocket.id}")'>${activeDocket.deliveredAt?"Mark Not Delivered":"Mark Delivered"}</button>
       <button class="btn danger" onclick='deleteDocket("${activeDocket.id}")'>Delete Docket</button>
       <button class="btn" onclick='printDocket("${activeDocket.id}")'>Create / Share PDF</button>
     </div>
   </div>`;
 }
 box.innerHTML=`<div class="docketSelectorList">${docketSelectors}</div>${viewer}`;
 mountDocketViewportActions();
}

window.selectDocketArchive=id=>{
 const box=document.getElementById("docketArchive");
 activeDocketArchiveId=(activeDocketArchiveId===id)?null:id;
 renderDocketArchive(activeDocketArchiveId===null?null:activeDocketArchiveId);
 // v0.10.109: never scroll the whole Delivery module when a docket opens.
 // The docket body owns its own scroll viewport; the module header/navigation stays visible.
 if(box){
   box.scrollTop=0;
   requestAnimationFrame(()=>{
     box.scrollTop=0;
     const scroller=box.querySelector('.docketActiveScroll');
     if(scroller)scroller.scrollTop=0;
   });
 }
};
function renderDocket(d){ renderDocketArchive(d?.id); }
window.editDocket=id=>{
 const d=db.deliveries.find(x=>x.id===id); if(!d)return alert("Delivery docket not found.");
 document.getElementById('conflictResumeChip')?.remove();
 editingDocketId=id;
 deliveryEditOriginalSnapshot=JSON.parse(JSON.stringify(d));
 const affectedInvoice=affectedInvoiceForDocket(d); deliveryEditAffectedInvoiceId=affectedInvoice?.id||null; deliveryEditResolutionChoice=""; deliveryEditReason="";
 currentDelivery=(d.lines||[]).map(l=>({productId:l.productId,qty:Number(l.qty||0)})).filter(l=>l.productId&&l.qty>0);
 openDeliveryCreate(true);
 document.getElementById("delBranch").value=d.branch||"BM Bangrak";
 fillProducts();
 document.getElementById("delDate").value=d.date||today();
 document.getElementById("delNote").value=d.note||"";
 document.getElementById("saveDelivery").textContent="Save Docket Changes";
 document.getElementById("cancelEditDelivery").style.display="inline-block";
 document.getElementById("clearDelivery").textContent="Clear";
 const editBanner=document.getElementById("deliveryEditBanner");if(editBanner){
   editBanner.style.display="block";
   editBanner.innerHTML=d.generatedFromSundaySuggestion
     ? `<b>${escapeHtml(d.suggestedRef||suggestedDraftRef(d.sourceSundayDate||d.date,d.branch))}</b> · Suggested from Sunday sales. Edit this exactly like any other unsent docket.`
     : '<b>Editing docket.</b> Change product or quantity directly, add/remove lines, then save.';
 }
 const chip=document.getElementById("deliveryEditChip");if(chip){
   chip.style.display="inline-block";
   chip.textContent=d.generatedFromSundaySuggestion?(d.suggestedRef||"Suggested draft"):"Editing docket";
 }
 const nt=document.getElementById("deliveryNoteToggle");if(nt)nt.open=!!(d.note||"");
 setDeliveryEditAddTools(false);
 setDeliveryView("create");
 renderDelivery();
 requestAnimationFrame(()=>{
   const section=document.getElementById("docket");
   if(section)section.scrollTop=0;
   const lines=document.getElementById("deliveryEditLines");
   if(lines)lines.scrollTop=0;
 });
};

function canUndoLateDeliveredMark(d,inv){
 if(!d||!inv)return false;
 const marks=(db.docketAudit||[]).filter(a=>a?.docketId===d.id&&a.action==="marked-delivered"&&a.at).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
 const mark=marks[0];
 if(!mark?.at||!inv?.createdAt)return false;
 // Safe exception: the invoice was already saved before this Delivered click, so
 // reverting the later mistaken status cannot remove a delivery that formed part
 // of that saved invoice. Post-delivery line edits remain protected separately.
 return String(mark.at)>String(inv.createdAt);
}

function openDeliveredDatePicker(id){
 const d=db.deliveries.find(x=>x.id===id);if(!d)return;
 let o=document.getElementById('deliveryDateOverlay');if(o)o.remove();
 o=document.createElement('div');o.id='deliveryDateOverlay';o.className='deliveryDateOverlay';
 o.innerHTML=`<div class="deliveryDateCard"><div class="deliveryDateTitle">Mark delivered</div><div class="deliveryDateHint">Choose the actual delivery date. This date determines the accounting week.</div><input id="deliveredDatePicker" type="date" value="${escapeHtmlAttr(today())}"><div class="deliveryDateActions"><button class="btn alt" type="button" onclick="closeDeliveredDatePicker()">Cancel</button><button class="btn gold" type="button" onclick="confirmDeliveredDatePicker('${id}')">Mark Delivered</button></div></div>`;
 o.addEventListener('click',e=>{if(e.target===o)closeDeliveredDatePicker();});document.body.appendChild(o);
 const input=document.getElementById('deliveredDatePicker');setTimeout(()=>{try{input?.focus();if(input?.showPicker)input.showPicker();}catch(e){}},80);
}
function closeDeliveredDatePicker(){document.getElementById('deliveryDateOverlay')?.remove();}
function confirmDeliveredDatePicker(id){const d=db.deliveries.find(x=>x.id===id),input=document.getElementById('deliveredDatePicker');if(!d||!input)return;const date=input.value;if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return alert('Choose a delivery date.');if(d.generatedFromSundaySuggestion&&d.sourceSundayDate&&date<=d.sourceSundayDate)return alert(`This top-up was calculated from the ${d.sourceSundayDate} Sunday closing stock. Choose the actual delivery date after that report, or leave it Not Delivered.`);const previousDate=d.date||'';d.deliveredAt=date+'T12:00:00';d.date=date;db.docketAudit.push({id:'DA'+Date.now(),action:'marked-delivered',at:new Date().toISOString(),docketId:d.id,date,previousDate,sourceSundayDate:d.sourceSundayDate||'',branch:d.branch||''});closeDeliveredDatePicker();save();renderDocketArchive(id);renderHistory();renderAudit();renderMetrics();}
window.openDeliveredDatePicker=openDeliveredDatePicker;window.closeDeliveredDatePicker=closeDeliveredDatePicker;window.confirmDeliveredDatePicker=confirmDeliveredDatePicker;

window.toggleDocketDelivered=id=>{
 const d=db.deliveries.find(x=>x.id===id);if(!d)return;
 if(!d.deliveredAt){
   return openDeliveredDatePicker(id);
 }else{
   const inv=affectedInvoiceForDocket(d);
   if(inv&&!canUndoLateDeliveredMark(d,inv))return alert("This docket is already part of a completed invoice cycle, so its Delivered status is locked.");
   if((d.lineChanges||[]).length)return alert("This docket has post-delivery changes, so its Delivered status is locked to preserve the record.");
   if(inv&&!confirm("This Delivered mark was made after the completed invoice was already saved. Revert it to Not Delivered? The saved invoice will remain unchanged."))return;
   if(!inv&&!confirm("Mark this docket Not Delivered again? Only do this if Delivered was selected by mistake."))return;
   d.deliveredAt=null;
   db.docketAudit.push({id:"DA"+Date.now(),action:"marked-not-delivered",at:new Date().toISOString(),docketId:d.id,date:d.date||"",sourceSundayDate:d.sourceSundayDate||"",branch:d.branch||""});
 }
 save();renderDocketArchive(id);renderHistory();renderAudit();renderMetrics();
};

window.deleteDocket=id=>{
 const d=db.deliveries.find(x=>x.id===id); if(!d)return;
 const label=`${d.date||"No date"} — ${d.branch||"No branch"}`;
 if(!confirm(`Delete delivery docket ${label}?\n\nThis will remove its quantities from live reconciliation and totals.`))return;
 if(!confirm(`Confirm deletion of ${label}.\n\nA read-only audit snapshot will be kept.`))return;
 db.docketAudit.push({
   id:"DA"+Date.now(), action:"deleted", at:new Date().toISOString(), docketId:d.id,
   date:d.date||"", branch:d.branch||"", note:d.note||"",
   lines:(d.lines||[]).map(l=>({...l})), deletedSnapshot:JSON.parse(JSON.stringify(d))
 });
 db.deliveries=db.deliveries.filter(x=>x.id!==id);
 save(); refreshReconciliationViews(); renderDocketArchive(); renderMetrics(); renderHistory(); renderAudit();
};

function buildDocketPdfBytes(d,includeHistory=false){
  const c=[];
  const esc=t=>pdfEscapeText(pdfAscii(t));
  const txt=(text,x,y,size=10,bold=false,r=.09,g=.13,b=.20)=>c.push(`${r} ${g} ${b} rg BT /F${bold?2:1} ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET`);
  const rect=(x,y,w,h,fr,fg,fb,sr=null,sg=null,sb=null,lw=.8)=>{c.push('q');if(fr!==null)c.push(`${fr} ${fg} ${fb} rg`);if(sr!==null)c.push(`${sr} ${sg} ${sb} RG ${lw} w`);c.push(`${x} ${y} ${w} ${h} re ${fr!==null?(sr!==null?'B':'f'):'S'}`);c.push('Q');};
  const line=(x1,y1,x2,y2,r=.86,g=.88,b=.91,w=.7)=>c.push(`q ${r} ${g} ${b} RG ${w} w ${x1} ${y1} m ${x2} ${y2} l S Q`);
  const L=42,R=553,W=511;
  txt('DELIVERY DOCKET',L,790,22,true);
  txt('Issued by Yaowaret',L,767,10,false,.38,.42,.50);
  txt(displayBranchName(d.branch),R-165,790,12,true);
  txt(invoiceDateLabel(d.date||''),R-165,772,10,false,.38,.42,.50);
  if(d.note)txt(pdfAscii(d.note).slice(0,35),R-165,756,8.5,false,.38,.42,.50);
  line(L,744,R,744);
  // Barcode gets the right margin; product remains the widest data column.
  const cols=[L,L+195,L+240,L+295,L+350,L+405,R];
  const headers=['PRODUCT','QTY','COST','RETAIL','LINE COST','BARCODE'];
  rect(L,711,W,28,.965,.972,.982,null,null,null);
  headers.forEach((h,i)=>txt(h,cols[i]+5,722,7.2,true,.38,.42,.50));
  let y=711,total=0;
  const rows=[];
  (d.lines||[]).forEach(l=>{
    const p=db.products.find(x=>x.id===l.productId);
    const name=p?deliveryProductDisplayName(p):(l.productName||'Unknown product');
    const cost=Number(l.cost??p?.cost??0),retail=Number(l.retail??p?.retail??0),qty=Number(l.qty||0),amount=qty*cost;
    total+=amount;rows.push({name,qty,cost,retail,amount,barcode:normalizeBarcode(p?.barcode||"")});
  });
  rows.forEach((r,idx)=>{
    y-=29;if(idx%2===1)rect(L,y,W,29,.988,.99,.994,null,null,null);
    txt(r.name.slice(0,34),cols[0]+5,y+10,8.9,false);
    txt(String(r.qty),cols[1]+7,y+10,9.1,true);
    txt(pdfMoney(r.cost),cols[2]+4,y+10,8.1);
    txt(pdfMoney(r.retail),cols[3]+4,y+10,8.1);
    txt(pdfMoney(r.amount),cols[4]+4,y+10,8.1,true);
    if(r.barcode){
      const bx=cols[5]+4,bw=(cols[6]-cols[5])-8;
      const rendered=pdfDrawCode128(c,r.barcode,bx,y+11,bw,12);
      txt(r.barcode.slice(0,28),bx,y+3,5.3,false,.18,.20,.24);
      if(!rendered)txt('BARCODE TEXT',bx,y+18,5.3,true,.55,.25,.08);
    }
    line(L,y,R,y,.91,.92,.94,.45);
  });
  y-=16;
  // v0.9.69: ink-light docket summary — compact, right-aligned total with outlined status
  line(L,y,R,y,.09,.13,.20,1.35);
  const totalLabel='TOTAL COST VALUE';
  const totalValue=pdfMoney(total);
  txt(totalLabel,R-150,y-18,8.2,true,.38,.42,.50);
  txt(totalValue,R-150,y-39,17,true,.09,.13,.20);
  const statusText=d.deliveredAt?'DELIVERED':'NOT DELIVERED';
  const statusW=d.deliveredAt?72:98;
  rect(L,y-38,statusW,24,null,null,null,d.deliveredAt?.27:.55,d.deliveredAt?.55:.55,d.deliveredAt?.34:.55,.9);
  txt(statusText,L+9,y-30,8.2,true,d.deliveredAt?.18:.42,d.deliveredAt?.46:.42,d.deliveredAt?.26:.42);
  y-=58;
  if(includeHistory&&(d.lineChanges||[]).length){
    txt('POST-DELIVERY CHANGE HISTORY',L,y,9,true,.55,.25,.08);y-=16;
    for(const ch of (d.lineChanges||[]).slice(0,8)){
      const before=ch.before?productLineLabel(ch.before):'';
      const after=ch.after?productLineLabel(ch.after):'Deleted';
      for(const row of pdfWrap(`${before} -> ${after}`,90).slice(0,2)){txt(row,L,y,8.2,false,.30,.33,.39);y-=12;}
      y-=2;if(y<85)break;
    }
  }
  line(L,53,R,53,.90,.91,.93,.7);
  txt('Yaowaret - Delivery Docket',L,37,7.5,false,.48,.51,.57);
  txt(`${invoiceDateLabel(d.date||'')} - ${displayBranchName(d.branch)}`,365,37,7.5,false,.48,.51,.57);
  const content=c.join('\n'),objs=[];
  objs[1]='<< /Type /Catalog /Pages 2 0 R >>';objs[2]='<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objs[3]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>';
  objs[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';objs[5]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
  objs[6]=`<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`;
  let pdf='%PDF-1.4\n%MDPIN-DOCKET\n',offsets=[0];
  for(let i=1;i<=6;i++){offsets[i]=new TextEncoder().encode(pdf).length;pdf+=`${i} 0 obj\n${objs[i]}\nendobj\n`;}
  const xref=new TextEncoder().encode(pdf).length;pdf+='xref\n0 7\n0000000000 65535 f \n';
  for(let i=1;i<=6;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
  pdf+=`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
function docketPdfDownload(blob,filename){
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=filename;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),120000);
}
function setDocketPdfBusy(id,busy){
  const panel=document.querySelector(`.docketActivePanel[data-docket-id="${id}"]`);
  const btn=document.querySelector(`.docketViewportActions[data-docket-id="${id}"] button:last-child`)||panel?.querySelector('.docketActions button:last-child');
  if(!btn)return;
  if(busy){btn.dataset.oldText=btn.textContent;btn.textContent='Preparing PDF…';btn.setAttribute('aria-busy','true');}
  else{btn.textContent=btn.dataset.oldText||'Create / Share PDF';btn.removeAttribute('aria-busy');delete btn.dataset.oldText;}
}
async function generateDocketPdf(id,includeHistory=false){
  const live=db.deliveries.find(x=>x.id===id);if(!live)return alert('Delivery docket not found.');
  const d=JSON.parse(JSON.stringify(live)); // stable snapshot: edits cannot change the record mid-generation
  setDocketPdfBusy(id,true);
  try{
    const bytes=buildDocketPdfBytes(d,includeHistory);
    if(!(bytes instanceof Uint8Array)||bytes.length<500)throw new Error('PDF generation returned incomplete data');
    const head=new TextDecoder().decode(bytes.slice(0,8)),tail=new TextDecoder().decode(bytes.slice(-16));
    if(!head.startsWith('%PDF-')||!tail.includes('%%EOF'))throw new Error('PDF validation failed');
    const blob=new Blob([bytes],{type:'application/pdf'});
    const safeBranch=displayBranchName(d.branch).replace(/[^a-z0-9]+/gi,' ').trim();
    const filename=`Delivery Docket - ${safeBranch} - ${d.date||'undated'}.pdf`;
    let file=null;
    try{file=new File([blob],filename,{type:'application/pdf',lastModified:Date.now()});}catch(e){console.warn('File constructor unavailable; using download fallback',e);}
    if(file&&navigator.share){
      let canShare=true;
      try{if(navigator.canShare)canShare=navigator.canShare({files:[file]});}catch(e){canShare=false;}
      if(canShare){
        try{await navigator.share({files:[file],title:'Delivery Docket'});return;}
        catch(err){
          if(err&&err.name==='AbortError')return;
          console.warn('Native share failed; falling back to direct PDF save',err);
        }
      }
    }
    docketPdfDownload(blob,filename);
  }catch(err){
    console.error('Delivery docket PDF error',err);
    alert('The delivery docket PDF could not be created. Please try again.');
  }finally{setDocketPdfBusy(id,false);}
}
function closeDocketPdfChoice(){document.querySelector('.docketPdfChoiceOverlay')?.remove();}
function chooseDocketPdfVersion(id){
  closeDocketPdfChoice();
  const overlay=document.createElement('div');overlay.className='docketPdfChoiceOverlay';
  overlay.innerHTML=`<div class="docketPdfChoiceCard" role="dialog" aria-modal="true" aria-label="Choose PDF version"><h3>Choose PDF version</h3><p>Use the clean current docket, or include the saved post-delivery change history.</p><div class="docketPdfChoiceButtons"><button class="btn gold" type="button" data-current>Current docket</button><button class="btn" type="button" data-history>Include change history</button></div><button class="docketPdfChoiceCancel" type="button" data-cancel>Cancel</button></div>`;
  overlay.querySelector('[data-current]').onclick=()=>{closeDocketPdfChoice();generateDocketPdf(id,false);};
  overlay.querySelector('[data-history]').onclick=()=>{closeDocketPdfChoice();generateDocketPdf(id,true);};
  overlay.querySelector('[data-cancel]').onclick=closeDocketPdfChoice;
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeDocketPdfChoice();});
  document.body.appendChild(overlay);
}
window.printDocket=id=>{
  const d=db.deliveries.find(x=>x.id===id);if(!d)return alert('Delivery docket not found.');
  if((d.lineChanges||[]).length)return chooseDocketPdfVersion(id);
  return generateDocketPdf(id,false);
};

function deliveriesSinceLastWeek(branch,date){
 const previous=db.weeks.filter(w=>w.branch===branch && w.date<date).sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
 const start=previous?.date||"0000-00-00";
 const map={}; db.deliveries.map(businessDeliverySource).filter(d=>d&&!deliveryFromReportBeingChecked(d,date)&&d.branch===branch && !!d.deliveredAt && d.date>start && d.date<=date).forEach(d=>d.lines.forEach(l=>map[l.productId]=(map[l.productId]||0)+l.qty));
 return map;
}
function loadWeek(){
 const b=document.getElementById("weekBranch").value, date=document.getElementById("weekDate").value||today(), dels=deliveriesSinceLastWeek(b,date);
 const last=db.weeks.filter(w=>w.branch===b && w.date<date).sort((a,c)=>a.date.localeCompare(c.date)).at(-1);
 const rows=branchProducts(b).map(p=>({p,opening:last?.rows?.find(r=>r.productId===p.id)?.closing ?? db.stock[b]?.[p.id] ?? 0,delivered:dels[p.id]||0,takeout:0,closing:""}));
 const tb=document.getElementById("weekRows");
 tb.dataset.branch=b;tb.dataset.date=date;
 tb.innerHTML=rows.map(r=>`<details class="weekProduct ${r.p.type}" data-pid="${r.p.id}" data-opening="${r.opening}" data-delivered="${r.delivered}">
   <summary>
     <div class="weekProductTitle"><b>${r.p.name}</b><span class="weekMini">Open ${r.opening}${r.delivered?` • Delivered ${r.delivered}`:""}</span></div>
     <div class="weekQuick">
       <label>Closing</label>
       <input class="closing" type="number" min="0" inputmode="decimal" placeholder="—" aria-label="Closing stock for ${r.p.name}">
     </div>
     <span class="weekState status warn">Waiting</span><span class="weekChev">⌄</span>
   </summary>
   <div class="weekDetail">
     <div class="weekStat"><span>Opening</span><b>${r.opening}</b></div>
     <div class="weekStat"><span>Deliveries</span><b>${r.delivered}</b></div>
     <label class="weekStat editable"><span>Take out</span><input class="takeout" type="number" min="0" inputmode="decimal" value="0"></label>
     <div class="weekStat"><span>Expected</span><b class="expected">${r.opening+r.delivered}</b></div>
     <div class="weekStat"><span>Sold</span><b class="sold">—</b></div>
     <div class="weekStat"><span>Sales</span><b class="sales">—</b></div>
     <div class="weekStat"><span>Pay Pin</span><b class="pin">—</b></div>
     <div class="check" hidden><span class="status warn">Waiting</span></div>
   </div>
 </details>`).join("");
 tb.querySelectorAll("input").forEach(i=>i.oninput=e=>{calcWeek(); if(i.classList.contains("closing") && i.value!=="") i.closest(".weekProduct").open=false;});
 calcWeek();filterWeekRows();
}
function calcWeek(){
 let sales=0,cost=0,profit=0,pin=0,alix=0,bm=0;
 document.querySelectorAll("#weekRows .weekProduct").forEach(tr=>{
  const p=db.products.find(x=>x.id===tr.dataset.pid), opening=+tr.dataset.opening, delivered=+tr.dataset.delivered, take=+tr.querySelector(".takeout").value||0, cval=tr.querySelector(".closing").value;
  const expected=opening+delivered-take;tr.querySelector(".expected").textContent=expected;
  if(cval===""){
    tr.classList.add("isPending");tr.classList.remove("isDone","hasError");
    tr.querySelector(".sold").textContent="—";tr.querySelector(".sales").textContent="—";tr.querySelector(".pin").textContent="—";
    tr.querySelector(".check").innerHTML=`<span class="status warn">Waiting</span>`;
    tr.querySelector(".weekState").className="weekState status warn";tr.querySelector(".weekState").textContent="Waiting";
    return
  }
  const closing=+cval, sold=expected-closing, s=sold*p.retail, c=sold*p.cost, pr=s-c;
  const isEd=p.type==="edible"; const pinProfit=pr*(isEd?.40:.30), alixProfit=pr*(isEd?.20:.30), bmProfit=pr*.40, pinPay=c+pinProfit;
  tr.querySelector(".sold").innerHTML=sold<0?`<span class="bad">${sold}</span>`:sold;
  tr.querySelector(".sales").textContent=baht(s);tr.querySelector(".pin").textContent=baht(pinPay);tr.querySelector(".check").innerHTML=sold<0?`<span class="status bad">Investigate</span>`:`<span class="status ok">OK</span>`;
  tr.classList.remove("isPending");tr.classList.add("isDone");tr.classList.toggle("hasError",sold<0);
  tr.querySelector(".weekState").className=`weekState status ${sold<0?"bad":"ok"}`;
  tr.querySelector(".weekState").textContent=sold<0?"Check":"OK";
  tr.querySelector(".weekMini").textContent=`Stock ${closing} • Sold ${sold}${delivered?` • Delivered ${delivered}`:""}`;
  sales+=s;cost+=c;profit+=pr;pin+=pinPay;alix+=alixProfit;bm+=bmProfit;
 });
 document.getElementById("weekTotals").innerHTML=`<span>Sales ${baht(sales)}</span><span>Cost ${baht(cost)}</span><span>Profit ${baht(profit)}</span><span>BM ${baht(bm)}</span><span>Alix ${baht(alix)}</span><span>Pay Pin ${baht(pin)}</span>`;
 return {sales,cost,profit,pin,alix,bm};
}

let weekFilter="pending";
function filterWeekRows(){
 const q=norm(document.getElementById("weekSearch")?.value||"");
 document.querySelectorAll("#weekRows .weekProduct").forEach(row=>{
   const name=norm(row.querySelector(".weekProductTitle b")?.textContent||"");
   const pending=row.querySelector(".closing")?.value==="";
   row.hidden=!!q&&!name.includes(q) || (weekFilter==="pending"&&!pending);
 });
 const pending=[...document.querySelectorAll("#weekRows .weekProduct")].filter(r=>r.querySelector(".closing")?.value==="").length;
 const btn=document.getElementById("weekShowPending");if(btn)btn.textContent=`Pending (${pending})`;
}
document.getElementById("weekSearch").oninput=filterWeekRows;
document.getElementById("weekShowPending").onclick=()=>{weekFilter="pending";filterWeekRows()};
document.getElementById("weekShowAll").onclick=()=>{weekFilter="all";filterWeekRows()};

document.getElementById("loadWeek").onclick=loadWeek;
document.getElementById("weekBranch").onchange=loadWeek;
document.getElementById("saveWeek").onclick=()=>{
 const tb=document.getElementById("weekRows");if(!tb.children.length)return alert("Load the weekly stock first.");
 const trs=[...tb.querySelectorAll(".weekProduct")];
 const missing=trs.filter(tr=>tr.querySelector(".closing").value==="");
 if(missing.length && !confirm(`${missing.length} closing-stock fields are blank. Save blanks as zero?`)) return;
 const rows=trs.map(tr=>({productId:tr.dataset.pid,opening:+tr.dataset.opening,delivered:+tr.dataset.delivered,takeout:+tr.querySelector(".takeout").value||0,closing:tr.querySelector(".closing").value===""?0:+tr.querySelector(".closing").value}));
 const totals=calcWeek(), w={id:"W"+Date.now(),branch:tb.dataset.branch,date:tb.dataset.date,rows,totals};db.weeks.push(w);save();alert("Weekly check saved.");
}

function displayBranchName(branch){
 const b=String(branch||"");
 if(/lamai/i.test(b)) return "BM Lamai";
 if(/bangrak|k\.\s*pual|k\.\s*paul|mini mart/i.test(b)) return "The Grocery by BM";
 return b||"—";
}
function recordDateLabel(d){
 if(!d)return "No date";
 try{return new Date(String(d)+"T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}catch(e){return d}
}
const MD_DELIVERY_LAST_PULL_KEY="mdpin-delivery-last-pull";
const MD_DELIVERY_LAST_CHANGE_KEY="mdpin-delivery-last-change";
function deliveryLastPull(){try{return JSON.parse(localStorage.getItem(MD_DELIVERY_LAST_PULL_KEY)||"null")}catch(e){return null}}
function saveDeliveryLastPull(v){if(v)localStorage.setItem(MD_DELIVERY_LAST_PULL_KEY,JSON.stringify(v));else localStorage.removeItem(MD_DELIVERY_LAST_PULL_KEY)}
function deliveryLastChange(){try{return JSON.parse(localStorage.getItem(MD_DELIVERY_LAST_CHANGE_KEY)||"null")}catch(e){return null}}
function saveDeliveryLastChange(v){if(v)localStorage.setItem(MD_DELIVERY_LAST_CHANGE_KEY,JSON.stringify(v));else localStorage.removeItem(MD_DELIVERY_LAST_CHANGE_KEY)}
function renderDeliveryTransferSummary(current=null){
 const a=document.getElementById("cloudDeliveryThisPull"),b=document.getElementById("cloudDeliveryLastChange");if(!a||!b)return;
 const c=current||deliveryLastPull();
 if(c){const n=Number(c.added||0),u=Number(c.updated||0),same=Number(c.same||0);a.textContent=(n||u)?`${n} new · ${u} updated · ${same} already current`:`No changes · ${same} already current`;a.className=(n||u)?"changed":"neutral";}else{a.textContent="No pull yet";a.className="neutral";}
 const l=deliveryLastChange();
 if(l){const when=l.at?new Date(l.at).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"";b.textContent=`${l.added||0} new · ${l.updated||0} updated${when?` · ${when}`:""}`;b.className="changed";}else{b.textContent="No delivery records transferred yet";b.className="neutral";}
}
function deliveryCloudStateForRecord(id){const r=deliveryLastPull();if(!r)return "";if((r.addedIds||[]).includes(id))return "new";if((r.updatedIds||[]).includes(id))return "updated";return ""}
function renderHistory(){
 const box=document.getElementById("historyList"); if(!box)return;
 const q=(document.getElementById("recordsSearch")?.value||"").trim().toLowerCase();
 const type=document.getElementById("recordsType")?.value||"all";
 const groups=[];
 const deliveries=[...(db.deliveries||[])].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).map(d=>{const cs=deliveryCloudStateForRecord(d.id),cloudNote=cs==="new"?" · New from cloud":cs==="updated"?" · Updated from cloud":"";return {type:"delivery",date:d.date,title:displayBranchName(d.branch),meta:`${d.note||"Delivery docket"} · ${d.id||""}${cloudNote}`,status:d.deliveredAt?"Delivered":"Not delivered",statusClass:d.deliveredAt?"ok":"unpaid",obj:d}});
 const sundays=[...(db.sundayImports||[])].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).map(r=>{const st=r.reconciliation?reconStatusLabel(r.reconciliation):["unknown","Not checked"];return {type:"sunday",date:r.date,title:displayBranchName(r.branch),meta:`${r.rows?.length||0} products`,status:st[1],statusClass:st[0]==="ok"?"ok":"",obj:r}});
 const invoices=[...(db.invoices||[])].filter(i=>i.status!=="void").sort((a,b)=>String(b.reportDate||"").localeCompare(String(a.reportDate||""))||Number(b.version||1)-Number(a.version||1)).map(i=>{const cur=invoiceRecordState(i);return {type:"invoice",date:i.reportDate,title:(i.number||"Invoice")+(Number(i.version||1)>1?` v${Number(i.version||1)}`:""),meta:"The Grocery by BM + BM Lamai",status:cur.label,statusClass:cur.cls,obj:i};});
 const payments=invoices.filter(x=>x.obj.payment).map(x=>({type:"payment",date:x.obj.payment?.date||x.date,title:x.obj.number||"Payment",meta:x.obj.payment?.note||"Payment record",status:String(x.obj.payment?.status||"unpaid").toUpperCase(),statusClass:x.obj.payment?.status==="paid"?"paid":"unpaid",obj:x.obj}));
 const weekly=[...(db.weeks||[])].filter(w=>!/Excel/i.test(String(w.source||""))).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).map(w=>({type:"weekly",date:w.date,title:displayBranchName(w.branch),meta:"Stock / weekly check",status:"Saved",obj:w}));
 const defs=[['delivery','Delivery dockets',deliveries],['sunday','Sunday reports',sundays],['invoice','Invoices',invoices],['payment','Payments',payments],['weekly','Stock / weekly checks',weekly]];
 defs.forEach(([key,label,items])=>{if(type!=="all"&&type!==key)return;const filtered=items.filter(x=>!q||`${x.date} ${x.title} ${x.meta} ${x.status}`.toLowerCase().includes(q));if(filtered.length)groups.push({key,label,items:filtered})});
 if(!groups.length){box.innerHTML='<div class="recordsEmpty">No matching records. Try another type or clear the search.</div>';return;}
 box.innerHTML=groups.map((g,gi)=>`<details class="recordGroup" ${groups.length===1||gi===0?'open':''}><summary><span class="recordGroupTitle">${g.label}</span><span class="recordGroupChevron">›</span></summary><div class="recordGroupBody ${g.key==='delivery'?'recordsDocketSelectorList':''}">${g.key==='delivery'?g.items.map(x=>docketSelectorButtonMarkup(x.obj,false,`openRecordDelivery("${x.obj.id}")`)).join(''):g.items.map(x=>recordItemHtml(x)).join('')}</div></details>`).join('');
 box.querySelectorAll('.recordGroup').forEach(el=>el.addEventListener('toggle',()=>{if(!el.open)return;box.querySelectorAll('.recordGroup[open]').forEach(o=>{if(o!==el)o.open=false})}));
}
function recordItemHtml(x){
 const o=x.obj||{};
 let action="";
 if(x.type==='delivery') action=`openRecordDelivery('${o.id}')`;
 else if(x.type==='sunday') action=`openRecordSunday('${o.id}')`;
 else if(x.type==='invoice'||x.type==='payment') action=`openInvoiceRecord('${o.id}')`;
 else action=`openRecordWeekly('${o.id}')`;
 return `<div class="recordItemDirect"><button type="button" class="recordItemButton" onclick="${action}"><span class="recordDate">${escapeHtml(recordDateLabel(x.date))}</span><span class="recordMain"><div class="recordName">${escapeHtml(x.title)}</div><div class="recordMeta">${escapeHtml(x.meta)}</div></span><span class="recordStatus ${x.statusClass||''}">${escapeHtml(x.status)}</span><span class="recordOpenChevron">›</span></button></div>`;
}
window.openRecordDelivery=id=>openDeliveryArchive(id);
window.openRecordSunday=id=>{switchTab('import');renderArchive(id);setTimeout(()=>{document.getElementById('archiveList')?.scrollIntoView({behavior:'smooth',block:'start'})},60)};
window.openRecordInvoice=id=>openInvoiceRecord(id);
window.openRecordWeekly=id=>{
 const w=(db.weeks||[]).find(x=>x.id===id);if(!w)return;
 // Manual weekly records are retained for evidence but are not part of Pin's normal workflow.
 alert(`${recordDateLabel(w.date)} — ${displayBranchName(w.branch)}\n\nSaved manual stock/weekly check. This is a fallback record; normal Sunday work is handled from the Sunday Excel reports.`);
};

window.showDock=id=>openDeliveryArchive(id)
window.deleteRecord=(kind,id)=>{
 if(kind==="Delivery")return deleteDocket(id);
 if(!confirm(`Delete this ${kind.toLowerCase()} record?`))return;
 db.weeks=db.weeks.filter(x=>x.id!==id);
 save(); renderHistory(); renderMetrics(); renderAudit();
}


function renderCatalogue(){
 ensureProductFamilyStructure();
 const rows=document.getElementById("catalogueRows");
 if(!rows)return;

 const archivedCount=(db.products||[]).filter(isProductArchived).length;
 const activeCount=(db.products||[]).length-archivedCount;
 const status=document.getElementById("catalogueArchiveStatus");
 const missingBarcodeCount=activeVariantsMissingBarcode().length;
 const outOfStockCount=(db.products||[]).filter(p=>!isProductArchived(p)&&productIsOutOfStock(p)).length;
 if(status)status.innerHTML=`${activeCount} active variant${activeCount===1?"":"s"}${outOfStockCount?` · ${outOfStockCount} out of stock`:""}${archivedCount?` · ${archivedCount} archived`:""}${missingBarcodeCount?` · ${missingBarcodeCount} missing barcode`:""}${catalogueMissingBarcodesOnly?`<div class="catalogueMissingOnlyNotice">Showing active variants with no barcode only. <button type="button" class="catalogueActionBtn" onclick="clearMissingBarcodeFilter()">Show full catalogue</button></div>`:""}`;
 const toggle=document.getElementById("toggleArchivedProducts");
 if(toggle)toggle.textContent=showArchivedCatalogue?`Hide archived (${archivedCount})`:`Show archived${archivedCount?` (${archivedCount})`:""}`;

 const visible=(db.products||[]).filter(p=>{
   if(catalogueMissingBarcodesOnly)return !isProductArchived(p)&&!normalizeBarcode(p.barcode);
   return showArchivedCatalogue || !isProductArchived(p);
 });
 const groups=new Map();
 visible.forEach(p=>{
   const parent=productParentName(p)||p.name;
   const key=normalizeProductKey(parent);
   if(!groups.has(key))groups.set(key,{parent,key,items:[]});
   groups.get(key).items.push(p);
 });

 const variantOrder={"1g":1,"5g":2,preroll:3,special:9};
 rows.innerHTML=[...groups.values()]
   .sort((a,b)=>a.parent.localeCompare(b.parent,"en",{sensitivity:"base",numeric:true}))
   .map(g=>{
     const items=g.items.slice().sort((a,b)=>
       (isProductArchived(a)?1:0)-(isProductArchived(b)?1:0) ||
       (variantOrder[a.variantKey]||8)-(variantOrder[b.variantKey]||8) ||
       String(a.name).localeCompare(String(b.name),"en",{sensitivity:"base",numeric:true})
     );
     const allFamily=(db.products||[]).filter(p=>normalizeProductKey(productParentName(p))===g.key);
     const activeFamily=allFamily.filter(p=>!isProductArchived(p));
     const archivedFamily=allFamily.filter(isProductArchived);
     const familyAction=activeFamily.length
       ? `<button class="catalogueParentArchive" type="button" onclick='archiveProductFamily("${escapeHtmlAttr(g.key)}")'>Archive all</button>`
       : `<button class="catalogueParentArchive" type="button" onclick='restoreProductFamily("${escapeHtmlAttr(g.key)}")'>Restore all</button>`;
     const head=`<tr class="catalogueParentRow"><td colspan="5"><div class="catalogueParentMeta"><span>${escapeHtml(g.parent)}${!activeFamily.length?'<span class="catalogueArchivedBadge">ARCHIVED</span>':""}</span><span style="display:flex;align-items:center;gap:7px"><small>${allFamily.length} variant${allFamily.length===1?"":"s"}${archivedFamily.length?` · ${archivedFamily.length} archived`:""}</small>${familyAction}</span></div></td></tr>`;

     const variants=items.map(p=>{
       const archived=isProductArchived(p);
       const outOfStock=!archived&&productIsOutOfStock(p);
       const missingBarcode=!archived&&!normalizeBarcode(p.barcode);
       return `<tr class="catalogueMobileRow ${archived?"catalogueArchivedRow":""} ${outOfStock?"stockOutRow":""} ${missingBarcode?"catalogueMissingBarcodeRow":""}">
         <td colspan="5">
           <div class="catalogueMobileMain">
             <div class="catalogueMobileInfo">
               <div class="catalogueMobileTop">
                 <span class="catalogueVariantTag">${escapeHtml(productVariantLabel(p))}</span>
                 <span class="catalogueMobileName">${escapeHtml(p.name)}${archived?'<span class="catalogueArchivedBadge">ARCHIVED</span>':""}${outOfStock?'<span class="catalogueStockBadge">OUT OF STOCK</span>':""}</span>
               </div>
               <div class="catalogueMobileMeta">
                 <span>Type <b>${escapeHtml(p.type||"—")}</b></span>
                 <span>Cost <b>฿${Number(p.cost||0)}</b></span>
                 <span>Retail <b>฿${Number(p.retail||0)}</b></span>
               </div>
               <div class="catalogueBarcodeField">
                 <input type="text" value="${escapeHtmlAttr(p.barcode||"")}" placeholder="Optional shop barcode" class="keyboardSafeInput" ${archived?"disabled":""} onchange='saveProductBarcode("${p.id}",this.value)'>
                 <span class="catalogueBarcodeStatus ${p.barcode?"ok":"missing"}">${p.barcode?"BARCODE":"MISSING"}</span>
               </div>
               ${archived?"":`<div class="catalogueStockControl"><span class="catalogueStockControlLabel">Stock status</span><button type="button" class="catalogueStockToggle ${outOfStock?"isOut":"isIn"}" role="switch" aria-checked="${outOfStock?"false":"true"}" aria-label="${outOfStock?"Out of stock":"In stock"}. Tap to change stock status." onclick='toggleProductStockStatus("${p.id}")'><span>IN STOCK</span><span>OUT OF STOCK</span></button></div>`}
             </div>
             <div class="catalogueMobileAction catalogueActionStack">
               ${archived
                 ? `<button class="catalogueActionBtn restore" type="button" onclick='restoreProductVariant("${p.id}")'>Restore</button>`
                 : `<button class="catalogueActionBtn archive" type="button" onclick='archiveProductVariant("${p.id}")'>Archive</button>`}
             </div>
           </div>
         </td>
       </tr>`;
     }).join("");

     return head+variants;
   }).join("");

 if(!rows.innerHTML)rows.innerHTML='<tr><td colspan="5" class="small">No active products. Use Show archived to restore products.</td></tr>';
}
window.editPrice=(id,k,v)=>{const p=db.products.find(x=>x.id===id);if(!p)return;p[k]=+v;save()}
window.editProductName=(id,value)=>{
 const p=db.products.find(x=>x.id===id);if(!p)return;
 const next=cleanProductDisplayName(value);if(!next){renderCatalogue();return alert("Product name cannot be blank.")}
 const conflict=db.products.find(x=>x.id!==id&&normalizeProductKey(x.name)===normalizeProductKey(next));
 if(conflict){renderCatalogue();return alert(`That master product name already exists as “${conflict.name}”. Use Master Product Setup to merge shop names into it.`)}
 const old=p.name;p.name=next;ensureProductAliases();
 Object.keys(db.productAliases).forEach(k=>{if(db.productAliases[k]===id)db.productAliases[k]=id});
 db.productAliases[normalizeProductKey(old)]=id;
 retroactivelyRemapAllImports(false);save();renderMasterProductSetup();
}

function openDashboardInvoices(){
  switchTab("history");
  const type=document.getElementById("recordsType");
  if(type)type.value="invoice";
  renderHistory();
}
window.openDashboardInvoices=openDashboardInvoices;



function latestActiveSuggestedPackingGroup(){
  const active=(db.deliveries||[]).filter(isSuggestedDraftDocket);
  if(!active.length)return null;
  const dates=[...new Set(active.map(d=>d.sourceSundayDate||d.date||"").filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a)));
  const date=dates[0]||"";
  const dockets=active.filter(d=>(d.sourceSundayDate||d.date||"")===date);
  return {date,dockets};
}

function combinedSuggestedPackingRows(date){
  const active=(db.deliveries||[]).filter(d=>
    isSuggestedDraftDocket(d) &&
    String(d.sourceSundayDate||d.date||"")===String(date||"")
  );
  const combined=new Map();
  active.forEach(d=>{
    (d.lines||[]).forEach(l=>{
      const p=resolvedProductById(l.productId)||db.products.find(x=>x.id===l.productId);
      const name=p?deliveryProductDisplayName(p):cleanProductDisplayName(l.productName||"Unknown product");
      const key=l.productId||normalizeProductKey(name);
      const row=combined.get(key)||{name,qty:0};
      row.qty+=Number(l.qty||0);
      combined.set(key,row);
    });
  });
  return [...combined.values()]
    .filter(x=>x.qty>0)
    .sort((a,b)=>String(a.name).localeCompare(String(b.name),"en",{sensitivity:"base",numeric:true}));
}

window.openCombinedPackingView=(date)=>{
  const group=latestActiveSuggestedPackingGroup();
  const targetDate=date||group?.date;
  const overlay=document.getElementById("combinedPackingOverlay");
  const body=document.getElementById("combinedPackingBody");
  const subtitle=document.getElementById("combinedPackingSubtitle");
  if(!overlay||!body)return;
  const rows=combinedSuggestedPackingRows(targetDate);
  if(!rows.length){
    body.innerHTML='<div class="packingEmpty">There are no active suggested delivery quantities to pack.</div>';
    if(subtitle)subtitle.textContent="Nothing currently waiting to be packed";
  }else{
    const total=rows.reduce((n,r)=>n+Number(r.qty||0),0);
    if(subtitle)subtitle.textContent=`Week ending ${recordDateLabel(targetDate)} · A–Z packing list`;
    body.innerHTML=`<div class="packingSummary"><span>${rows.length} products</span><b>${total} units to pack</b></div>
      <div class="packingList">${rows.map(r=>`<div class="packingRow"><div class="packingName">${escapeHtml(r.name)}</div><div class="packingQty">${Number(r.qty||0)}</div></div>`).join("")}</div>`;
  }
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
};
function combinedSuggestedBranchRows(date){
  const active=(db.deliveries||[]).filter(d=>
    isSuggestedDraftDocket(d) &&
    String(d.sourceSundayDate||d.date||"")===String(date||"")
  );
  return active
    .sort((a,b)=>displayBranchName(a.branch).localeCompare(displayBranchName(b.branch),"en",{sensitivity:"base"}))
    .map(d=>({
      branch:displayBranchName(d.branch),
      rows:(d.lines||[]).map(l=>{
        const p=resolvedProductById(l.productId)||db.products.find(x=>x.id===l.productId);
        return {name:p?deliveryProductDisplayName(p):cleanProductDisplayName(l.productName||"Unknown product"),qty:Number(l.qty||0)};
      }).filter(r=>r.qty>0).sort((a,b)=>a.name.localeCompare(b.name,"en",{sensitivity:"base",numeric:true}))
    }));
}
function mdPdfEsc(v){
  // Keep generated PDF content to printable ASCII and escape PDF string syntax.
  return pdfEscapeText(pdfAscii(v));
}
function buildCombinedPackingPdfBytes(date){
  const groups=combinedSuggestedBranchRows(date);
  const totalUnits=groups.reduce((n,g)=>n+g.rows.reduce((a,r)=>a+r.qty,0),0);
  const lines=[];
  lines.push("BT /F2 18 Tf 50 790 Td (Combined Suggested Delivery) Tj ET");
  lines.push(`BT /F1 9 Tf 50 773 Td (Week ending ${mdPdfEsc(recordDateLabel(date))}) Tj ET`);
  lines.push(`BT /F1 9 Tf 50 758 Td (${totalUnits} total units) Tj ET`);
  let y=730;
  const addText=(txt,x,yy,size=9,bold=false)=>lines.push(`BT /F${bold?2:1} ${size} Tf ${x} ${yy} Td (${mdPdfEsc(txt)}) Tj ET`);
  groups.forEach(g=>{
    if(y<115)return;
    addText(g.branch,50,y,11,true);y-=17;
    if(!g.rows.length){addText("No top-up required",62,y,8,false);y-=14;}
    g.rows.forEach((r,rowIndex)=>{
      if(y<75)return;
      // PDF readability: very light grey band on every second product row.
      // Draw it before the text so the product name and quantity remain crisp.
      if(rowIndex%2===1)lines.push(`q 0.965 g 50 ${y-4} 495 14 re f Q`);
      addText(r.name,62,y,8.5,false);
      addText(String(r.qty),500,y,9,true);
      y-=14;
    });
    y-=7;
  });
  addText("Yaowaret - Combined Suggested Delivery",50,38,7.5,false);

  // IMPORTANT: these are real LF newlines, not the literal characters "\\n".
  // iOS Preview/Print rejects malformed PDFs and may label them as protected.
  const content=lines.join("\n"),objs=[];
  objs[1]='<< /Type /Catalog /Pages 2 0 R >>';
  objs[2]='<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objs[3]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>';
  objs[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objs[5]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
  objs[6]=`<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`;
  let pdf='%PDF-1.4\n%MDPIN-COMBINED\n',offsets=[0];
  for(let i=1;i<=6;i++){
    offsets[i]=new TextEncoder().encode(pdf).length;
    pdf+=`${i} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xref=new TextEncoder().encode(pdf).length;
  pdf+='xref\n0 7\n0000000000 65535 f \n';
  for(let i=1;i<=6;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
  pdf+=`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
async function shareSingleCombinedPdf(file,blob,filename){
  // iPhone/iPad Lego block: share exactly ONE file and no title/text payload.
  // This avoids Safari exposing a second text item beside the PDF in Save to Files.
  if(file&&navigator.share){
    let can=true;
    try{if(navigator.canShare)can=navigator.canShare({files:[file]});}catch(_){can=false;}
    if(can){
      try{
        await navigator.share({files:[file]});
        return true;
      }catch(err){
        if(err?.name==='AbortError')return true;
        console.warn('Combined PDF native share failed; using direct PDF save',err);
      }
    }
  }
  docketPdfDownload(blob,filename);
  return true;
}
window.shareCombinedPackingPDF=async()=>{
  const group=latestActiveSuggestedPackingGroup();
  if(!group?.date)return alert("There is no current combined suggested delivery to share.");
  const btn=document.getElementById("combinedPackingPdfBtn"),old=btn?.textContent;
  if(btn){btn.disabled=true;btn.textContent="Preparing…";btn.setAttribute('aria-busy','true');}
  try{
    const bytes=buildCombinedPackingPdfBytes(group.date);
    const head=new TextDecoder().decode(bytes.slice(0,8)),tail=new TextDecoder().decode(bytes.slice(-16));
    if(!head.startsWith("%PDF-")||!tail.includes("%%EOF"))throw new Error("Combined PDF validation failed");
    const blob=new Blob([bytes],{type:"application/pdf"});
    const filename=`Combined Suggested Delivery - ${group.date}.pdf`;
    let file=null;
    try{file=new File([blob],filename,{type:"application/pdf",lastModified:Date.now()});}catch(_){ }

    // File preparation is complete before iOS opens its external share/print sheet.
    // Reset the button now so it never remains stuck on "Preparing…" while iOS owns the UI.
    if(btn){btn.disabled=false;btn.textContent=old||"Create / Share PDF";btn.removeAttribute('aria-busy');}
    await shareSingleCombinedPdf(file,blob,filename);
  }catch(err){
    console.error(err);
    alert("The combined suggested delivery PDF could not be created. Please try again.");
  }finally{
    if(btn){btn.disabled=false;btn.textContent=old||"Create / Share PDF";btn.removeAttribute('aria-busy');}
  }
};

window.closeCombinedPackingView=()=>{
  const overlay=document.getElementById("combinedPackingOverlay");
  if(overlay){overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true");}
  document.body.style.overflow="";
};

window.openAddProductForm=(fromDelivery=false)=>{
  addProductReturnToDelivery=!!fromDelivery&&document.body.classList.contains("deliveryMode");
  ensureProductFamilyStructure();
  const overlay=document.getElementById("addProductOverlay");
  const name=document.getElementById("newProductName");
  if(!overlay)return;
  if(name)name.value="";
  const v1=document.getElementById("newVar1g"),v5=document.getElementById("newVar5g"),vpr=document.getElementById("newVarPreRoll"),vc=document.getElementById("newVarCustom");
  if(v1)v1.checked=true;if(v5)v5.checked=false;if(vpr)vpr.checked=false;if(vc)vc.checked=false;
  ["newCustomVariantLabel","newProductCost","newProductRetail","newCustomWeight","newBarcode1g","newBarcode5g","newBarcodePreRoll","newBarcodeCustom"].forEach(id=>{const el=document.getElementById(id);if(el)el.value=""});
  const type=document.getElementById("newCustomType");if(type)type.value="hash";
  toggleNewProductCustomVariant();
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  setTimeout(()=>name?.focus(),120);
};
window.closeAddProductForm=()=>{
  const overlay=document.getElementById("addProductOverlay");
  if(overlay){overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true");}
  document.body.style.overflow="";
  addProductReturnToDelivery=false;
};
window.toggleNewProductCustomVariant=()=>{
  const box=document.getElementById("newProductCustomFields");
  box?.classList.toggle("open",!!document.getElementById("newVarCustom")?.checked);
};
function nextProductId(){
  let id="P"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();
  while((db.products||[]).some(p=>p.id===id))
    id="P"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();
  return id;
}
function buildNewVariantRecord(parentName,spec){
  const legacyName=
    spec.variantKey==="1g" ? parentName :
    spec.variantKey==="5g" ? `${parentName} 5g` :
    spec.variantKey==="preroll" ? `${parentName} Pre-Roll` :
    `${parentName}${spec.customLabel?` ${spec.customLabel}`:""}`;
  return {
    id:nextProductId(),name:cleanProductDisplayName(legacyName),parentName:cleanProductDisplayName(parentName),
    variantKey:spec.variantKey,variantLabel:spec.variantLabel,unitWeightGrams:spec.unitWeightGrams,
    catalogueException:!!spec.catalogueException,type:spec.type,cost:Number(spec.cost||0),retail:Number(spec.retail||0),
    unit:"each",pricingConvention:spec.pricingConvention,barcode:normalizeBarcode(spec.barcode)||undefined,createdAt:new Date().toISOString(),addedManually:true
  };
}
window.saveNewMasterProduct=()=>{
  const parentName=cleanProductDisplayName(document.getElementById("newProductName")?.value||"");
  if(!parentName)return alert("Enter the product name.");
  const specs=[];
  if(document.getElementById("newVar1g")?.checked)specs.push({variantKey:"1g",variantLabel:"1g",unitWeightGrams:1,type:"kanja",cost:60,retail:150,pricingConvention:"flower",barcode:document.getElementById("newBarcode1g")?.value||""});
  if(document.getElementById("newVar5g")?.checked)specs.push({variantKey:"5g",variantLabel:"5g",unitWeightGrams:5,type:"5g",cost:300,retail:600,pricingConvention:"5g",barcode:document.getElementById("newBarcode5g")?.value||""});
  if(document.getElementById("newVarPreRoll")?.checked)specs.push({variantKey:"preroll",variantLabel:"Pre-Roll",unitWeightGrams:1,type:"preroll",cost:75,retail:150,pricingConvention:"preroll",barcode:document.getElementById("newBarcodePreRoll")?.value||""});
  if(document.getElementById("newVarCustom")?.checked){
    const label=cleanProductDisplayName(document.getElementById("newCustomVariantLabel")?.value||"");
    const type=document.getElementById("newCustomType")?.value||"other";
    const cost=Number(document.getElementById("newProductCost")?.value||0);
    const retail=Number(document.getElementById("newProductRetail")?.value||0);
    const raw=document.getElementById("newCustomWeight")?.value;
    const weight=raw===""?null:Number(raw);
    if(!label)return alert("Enter a name for the special/custom variant.");
    if(!(cost>0))return alert("Enter the custom cost price.");
    if(!(retail>0))return alert("Enter the custom retail price.");
    specs.push({variantKey:"special",variantLabel:label,customLabel:label,unitWeightGrams:Number.isFinite(weight)&&weight>0?weight:null,catalogueException:true,type,cost,retail,pricingConvention:"custom",barcode:document.getElementById("newBarcodeCustom")?.value||""});
  }
  if(!specs.length)return alert("Choose at least one packaged variant.");

  const enteredBarcodes=specs.map(s=>normalizeBarcode(s.barcode)).filter(Boolean);
  if(new Set(enteredBarcodes).size!==enteredBarcodes.length)return alert("Two selected variants have the same barcode. Each sellable variant needs its own barcode.");
  for(const code of enteredBarcodes){
    const owner=barcodeOwner(code);
    if(owner)return alert(`Barcode ${code} is already assigned to ${productParentName(owner)} · ${productVariantLabel(owner)}.`);
  }

  ensureProductAliases();ensureProductFamilyStructure();
  const family=(db.products||[]).filter(p=>normalizeProductKey(productParentName(p))===normalizeProductKey(parentName));
  const keys=new Set(family.map(p=>p.variantKey));
  for(const spec of specs){
    if(spec.variantKey!=="special" && keys.has(spec.variantKey)){
      const existing=family.find(p=>p.variantKey===spec.variantKey);
      return alert(existing&&isProductArchived(existing)
        ? `${parentName} already has an archived ${spec.variantLabel} variant. Restore it from Product Catalogue instead of creating a duplicate.`
        : `${parentName} already has a ${spec.variantLabel} variant.`);
    }
    if(spec.variantKey==="special" && family.some(p=>normalizeProductKey(productVariantLabel(p))===normalizeProductKey(spec.variantLabel)))
      return alert(`${parentName} already has a “${spec.variantLabel}” variant.`);
  }
  const created=specs.map(spec=>buildNewVariantRecord(parentName,spec));
  created.forEach(p=>{db.products.push(p);db.productAliases[normalizeProductKey(p.name)]=p.id});
  localStorage.setItem("mdpin-db",JSON.stringify(db));

  const returnToDelivery=addProductReturnToDelivery&&document.body.classList.contains("deliveryMode");
  const firstCreatedId=created[0]?.id||"";
  closeAddProductForm();
  renderAll();

  if(returnToDelivery){
    // A product created from inside a docket should be immediately available
    // without sending Pin to Settings and back.
    deliveryShowAllProducts=true;
    fillProducts();
    const firstCreated=created[0]||null;
    const parentPicker=document.getElementById("delParent");
    if(firstCreated&&parentPicker){const key=deliveryParentKey(firstCreated);if([...parentPicker.options].some(o=>o.value===key)){parentPicker.value=key;fillDeliveryVariants(firstCreatedId);}}
    syncDeliveryQuickActions();
  }

  alert(`${parentName}: ${created.length} variant${created.length===1?"":"s"} added to Pin's master catalogue.${returnToDelivery?" It is ready in this delivery docket.":""}`);
};



function mdNowStamp(){
  const d=new Date();
  const pad=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}
function mdSafeFilenamePart(v){
  return String(v||"").trim().replace(/[^a-z0-9_-]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,40);
}
function buildFullBackupPayload(kind="SUPPORT",note=""){
  return {
    magicDragonBackup:true,
    app:"Magic Dragon Pin",
    appVersion:"0.10.131",
    backupKind:String(kind||"SUPPORT").toUpperCase(),
    createdAt:new Date().toISOString(),
    note:String(note||""),
    db:JSON.parse(JSON.stringify(db))
  };
}
async function shareBackupPayload(payload,filenameBase){
  const json=JSON.stringify(payload,null,2);
  const file=new File([json],`${filenameBase}.json`,{type:"application/json"});
  try{
    if(navigator.share && navigator.canShare?.({files:[file]})){
      await navigator.share({files:[file]});
      return {shared:true,file};
    }
  }catch(err){
    if(err?.name==="AbortError")return {shared:false,cancelled:true,file};
    console.warn("Share failed",err);
  }
  try{
    const url=URL.createObjectURL(file);
    const a=document.createElement("a");
    a.href=url;a.download=file.name;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    return {shared:false,downloaded:true,file};
  }catch(err){
    console.error(err);
    alert("Backup created, but this device could not open Share or Download.");
    return {shared:false,error:true,file};
  }
}
window.createBaselineSnapshot=async()=>{
  const payload=buildFullBackupPayload("BASELINE","Known-good restore point before Sunday operation");
  const stamp=mdNowStamp();
  try{
    localStorage.setItem("mdpin-baseline-snapshot",JSON.stringify(payload));
    localStorage.setItem("mdpin-baseline-createdAt",payload.createdAt);
  }catch(err){
    console.warn("Could not store baseline locally",err);
  }
  const status=document.getElementById("baselineSnapshotStatus");
  if(status)status.textContent=`Baseline saved locally: ${new Date(payload.createdAt).toLocaleString()}`;
  await shareBackupPayload(payload,`Magic-Pin-BASELINE_${stamp}`);
};
window.createSupportBackup=()=>{
  const overlay=document.getElementById("supportBackupModal");
  const note=document.getElementById("supportBackupNote");
  if(note)note.value="";
  if(overlay){
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  }
};
window.closeSupportBackup=()=>{
  const overlay=document.getElementById("supportBackupModal");
  if(overlay){
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden","true");
  }
  document.body.style.overflow="";
};
window.shareSupportBackupNow=async()=>{
  const note=document.getElementById("supportBackupNote")?.value||"";
  const payload=buildFullBackupPayload("SUPPORT",note);
  const suffix=mdSafeFilenamePart(note);
  const name=`Magic-Pin-SUPPORT_${mdNowStamp()}${suffix?`_${suffix}`:""}`;
  closeSupportBackup();
  await shareBackupPayload(payload,name);
};
function refreshBaselineSnapshotStatus(){
  const status=document.getElementById("baselineSnapshotStatus");
  if(!status)return;
  const created=localStorage.getItem("mdpin-baseline-createdAt");
  status.textContent=created
    ? `Baseline on this device: ${new Date(created).toLocaleString()}`
    : "No baseline snapshot stored on this device yet.";
}
window.restoreLocalBaselineSnapshot=()=>{
  const raw=localStorage.getItem("mdpin-baseline-snapshot");
  if(!raw){
    alert("No local safety snapshot is stored on this device yet.");
    return;
  }
  try{
    const payload=JSON.parse(raw);
    if(!payload?.db||typeof payload.db!=="object")throw new Error("The local snapshot is invalid.");
    const created=payload.createdAt?new Date(payload.createdAt).toLocaleString():"unknown time";
    const counts=backupCounts(payload.db);
    const ok=confirm(`Restore the local safety snapshot?\n\nCreated: ${created}\nProducts: ${counts.products}\nDeliveries: ${counts.deliveries}\nSunday reports: ${counts.sundayReports}\nInvoices: ${counts.invoices}\n\nThis restores the app database only. Archived Sunday source workbooks are not changed.`);
    if(!ok)return;
    Object.keys(db).forEach(k=>delete db[k]);
    Object.assign(db,JSON.parse(JSON.stringify(payload.db)));
    localStorage.setItem("mdpin-db",JSON.stringify(db));
    alert("Local safety snapshot restored. Magic Dragon will now reload.");
    location.reload();
  }catch(err){
    console.error(err);
    alert(err?.message||"The local safety snapshot could not be restored.");
  }
};
function offerSundayCompletionBackup(){
  setTimeout(()=>{
    const ok=confirm("Sunday workflow complete.\n\nCreate / share a full support backup now?");
    if(ok)createSupportBackup();
  },150);
}

window.testSundayBackupPrompt=()=>{
  const ok=confirm("TEST ONLY — no Sunday data will be changed.\n\nThis is the same backup prompt Pin will see after Sunday completion.\n\nCreate / share a full support backup now?");
  if(ok)createSupportBackup();
};


function renderPinDashboard(){
  const barcodeHost=document.getElementById("dashboardBarcodeTask");
  if(barcodeHost){
    const missing=activeVariantsMissingBarcode();
    barcodeHost.innerHTML=missing.length?`<button class="dashboardBarcodeTask" type="button" onclick="openMissingBarcodes()"><b>Barcode needed — ${missing.length} variant${missing.length===1?"":"s"}</b><small>Tap to review active products still waiting for shop barcodes.</small></button>`:"";
  }
  const badge=document.getElementById("pinDashboardState");
  const title=document.getElementById("pinSundayPrimaryTitle");
  const copy=document.getElementById("pinSundayPrimaryText");
  const button=document.getElementById("pinSundayPrimary");
  if(!badge||!title||!copy||!button)return;

  ensureCompletedSundayCycles();
  const activeDate=normalizeActiveSundayCycle();

  if(activeDate){
    badge.textContent="IN PROGRESS";
    badge.classList.add("active");
    title.textContent="Continue Sunday Workflow";
    copy.textContent=`Continue ${recordDateLabel(activeDate)} from where you left off.`;
    button.setAttribute("aria-label",`Continue Sunday workflow for ${recordDateLabel(activeDate)}`);
  }else{
    badge.textContent="READY";
    badge.classList.remove("active");
    title.textContent="Start Sunday Workflow";
    copy.textContent="Import reports, reconcile, invoice and record payment.";
    button.setAttribute("aria-label","Start Sunday workflow");
  }

  const draftsBox=document.getElementById("pinSuggestedDrafts");
  if(draftsBox){
    migrateLegacyDeliverySuggestions();
    const drafts=[...(db.deliveries||[])]
      .filter(isSuggestedDraftDocket)
      .sort((a,b)=>String(a.branch||"").localeCompare(String(b.branch||"")));
    if(!drafts.length){
      draftsBox.style.display="none";
      draftsBox.innerHTML="";
    }else{
      draftsBox.style.display="grid";
      const packingGroup=latestActiveSuggestedPackingGroup();
      const packingRows=packingGroup?combinedSuggestedPackingRows(packingGroup.date):[];
      const packingQty=packingRows.reduce((n,r)=>n+Number(r.qty||0),0);
      draftsBox.innerHTML=`<div class="pinSuggestedTitle">Suggested delivery dockets</div>`+
        drafts.map(d=>{
          const ref=d.suggestedRef||suggestedDraftRef(d.sourceSundayDate||d.date,d.branch);
          const qty=(d.lines||[]).reduce((n,l)=>n+Number(l.qty||0),0);
          return `<button class="pinSuggestedCard" type="button" onclick='openSuggestedDraftFromDashboard("${d.id}")'>
            <span><b>${escapeHtml(displayBranchName(d.branch))}</b><small>${escapeHtml(recordDateLabel(d.date||d.sourceSundayDate))} · ${escapeHtml(ref)}</small></span>
            <span class="pinSuggestedQty">${qty} units ›</span>
          </button>`;
        }).join("")+
        (packingGroup&&packingRows.length?`<button class="pinSuggestedCard pinCombinedPacking" type="button" onclick='openCombinedPackingView("${packingGroup.date}")'>
          <span><b>Combined Suggested Delivery</b><small>A–Z packing quick view · ${escapeHtml(recordDateLabel(packingGroup.date))}</small></span>
          <span class="pinSuggestedQty">${packingQty} units ›</span>
        </button>`:"");
    }
  }
}

function renderMetrics(){
 renderPinDashboard();
 const ds=db.deliveries.reduce((s,d)=>s+d.lines.reduce((a,l)=>{const p=db.products.find(x=>x.id===l.productId);return a+l.qty*(p?.cost||0)},0),0);
 const ws=db.weeks.reduce((s,w)=>s+(w.totals?.sales||0),0);
 const latestByDate={};(db.invoices||[]).filter(i=>i&&i.status!=="void").forEach(i=>{const d=i.reportDate;if(!d)return;if(!latestByDate[d]||Number(i.version||1)>Number(latestByDate[d].version||1))latestByDate[d]=i;});
 const currentInvoices=Object.values(latestByDate).filter(i=>!i.supersededBy);
 const unpaid=currentInvoices.filter(i=>i.payment?.status!=="paid");
 const unpaidTotal=unpaid.reduce((n,i)=>n+Number(i.totals?.payPin||0),0);
 const activeDate=normalizeActiveSundayCycle();
 const sundayLabel=activeDate?`In progress · ${recordDateLabel(activeDate)}`:"Ready for next Sunday";
 const am=document.getElementById("dashboardActionMetrics");if(am)am.innerHTML=`<div class="dashboardActionCard ${unpaid.length?'warn':'ok'}"><div class="k">Unpaid invoices</div><div class="v">${unpaid.length?`${unpaid.length} · ${baht(unpaidTotal)}`:"None"}</div></div><div class="dashboardActionCard ${activeDate?'warn':'ok'}"><div class="k">Sunday status</div><div class="v smallStatus">${escapeHtml(sundayLabel)}</div></div>`;
 const legacyMetrics=document.getElementById("metrics");
 if(legacyMetrics){legacyMetrics.innerHTML="";legacyMetrics.style.display="none";}
 const trend=document.getElementById("payPinTrend");
 if(trend){
   const paid=currentInvoices.filter(i=>i.payment?.status==='paid').sort((a,b)=>String(b.reportDate||b.payment?.date||'').localeCompare(String(a.reportDate||a.payment?.date||'')));
   const recentPaid=paid.slice(0,3).reverse();
   const cells=[];
   for(let i=0;i<3;i++){
     const inv=recentPaid[i-(3-recentPaid.length)];
     if(inv){cells.push(`<div class="payPinTrendCell"><div class="d">${escapeHtml(recordDateLabel(inv.reportDate||inv.payment?.date))}</div><div class="a">${baht(inv.totals?.payPin||0)}</div></div>`)}
     else cells.push(`<div class="payPinTrendCell"><div class="d">Earlier week</div><div class="a">—</div></div>`);
   }
   cells.push(`<div class="payPinTrendCell current ${unpaidTotal>0?'due':''}"><div class="d">CURRENT DUE</div><div class="a">${baht(unpaidTotal)}</div></div>`);
   let arrow='';
   if(recentPaid.length>=2){const prev=Number(recentPaid[recentPaid.length-2].totals?.payPin||0),last=Number(recentPaid[recentPaid.length-1].totals?.payPin||0);if(prev>0){const pct=Math.round(((last-prev)/prev)*100);arrow=`<span class="payPinTrendArrow ${pct>0?'up':pct<0?'down':'flat'}">${pct>0?'↑':pct<0?'↓':'→'} ${Math.abs(pct)}%</span>`;}}
   trend.innerHTML=`<div class="payPinTrendTitle"><span>Pay Pin · recent weeks</span>${arrow}</div><div class="payPinTrendGrid">${cells.join('')}</div>`;
 }
 const recent=document.getElementById("dashboardRecent");
 if(recent){
   const latestDelivery=[...(db.deliveries||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0];
   ensureCompletedSundayCycles();
   const latestCycle=[...(db.completedSundayCycles||[])].filter(x=>x?.status==='complete').sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0];
   const paidInvoices=currentInvoices.filter(i=>i.payment?.status==='paid').sort((a,b)=>String(b.payment?.date||b.reportDate||'').localeCompare(String(a.payment?.date||a.reportDate||'')));
   const latestPaid=paidInvoices[0];
   const rows=[];
   if(latestDelivery)rows.push(`<div><span>Last delivery</span><b>${escapeHtml(recordDateLabel(latestDelivery.date))} · ${escapeHtml(displayBranchName(latestDelivery.branch))}</b></div>`);
   if(latestCycle)rows.push(`<div><span>Last Sunday completed</span><b>${escapeHtml(recordDateLabel(latestCycle.date))}</b></div>`);
   if(latestPaid)rows.push(`<div><span>Last payment</span><b>${escapeHtml(recordDateLabel(latestPaid.payment?.date||latestPaid.reportDate))} · ${baht(latestPaid.totals?.payPin||0)}</b></div>`);
   recent.innerHTML=rows.length?`<div class="dashboardRecentTitle">Recent activity</div>${rows.join('')}`:'';
   recent.style.display=rows.length?'block':'none';
 }
}

function auditData(){
 let issues=[], checked=0, pending=0;
 db.weeks.forEach(w=>{
   w.rows.forEach(r=>{
     const p=db.products.find(x=>x.id===r.productId);
     const productName=p?.name||r.sourceProductName||"Unknown product";
     if(r.opening==null || r.closing==null) return;
     const available=(Number(r.opening)||0)+(Number(r.delivered)||0)-(Number(r.takeout)||0), sold=available-(Number(r.closing)||0); checked++;
     if(sold<0) issues.push({date:w.date,branch:w.branch,product:productName,msg:`Closing stock ${r.closing} exceeds available stock ${available} by ${Math.abs(sold)}.`});
     if(r.reportedSold!=null && Math.abs(sold-Number(r.reportedSold))>0.001) issues.push({date:w.date,branch:w.branch,product:productName,msg:`Calculated sold ${sold} does not match shop-reported sold ${r.reportedSold}.`});
   });
 });
 db.deliveries.forEach(d=>{
   const covered=db.weeks.some(w=>w.branch===d.branch && w.date>=d.date);
   if(!covered){pending++; issues.push({date:d.date,branch:d.branch,product:"Delivery",msg:`Delivery ${d.id} has not yet been covered by a saved weekly check.`})}
 });
 return {issues,checked,pending};
}
function renderAudit(){
 const a=auditData(), branch=document.getElementById("auditBranch")?.value||"All branches", q=(document.getElementById("auditSearch")?.value||"").toLowerCase();
 let rows=a.issues.filter(i=>(branch==="All branches"||i.branch===branch)&&(!q||`${i.date} ${i.branch} ${i.product} ${i.msg}`.toLowerCase().includes(q)));
 document.getElementById("auditSummary").innerHTML=[
  ["Checks reviewed",a.checked],["Issues found",a.issues.length],["Pending deliveries",a.pending],["Saved weeks",db.weeks.length]
 ].map(x=>`<div class="card metric"><div class="k">${x[0]}</div><div class="v">${x[1]}</div></div>`).join("");
 document.getElementById("auditList").innerHTML=rows.length?rows.map(i=>`<div class="auditrow"><span class="status bad">Review</span> <b>${i.product}</b> · ${i.branch}<div class="small">${i.date}</div><div>${i.msg}</div></div>`).join(""):`<div class="notice"><b>No matching discrepancies.</b> The saved records currently reconcile under the checks available in this build.</div>`;
 const log=document.getElementById("docketAuditLog");
 if(log){
   const entries=[...(db.docketAudit||[])].sort((a,b)=>String(b.at||"").localeCompare(String(a.at||"")));
   log.innerHTML=entries.length?entries.map(e=>{
     const snap=e.deletedSnapshot||e.beforeSnapshot||{};
     const count=(snap.lines||e.lines||[]).length;
     const when=e.at?new Date(e.at).toLocaleString():"";
     const edited=e.action==="edited";
     return `<div class="auditrow"><span class="status ${edited?"warn":"bad"}">${edited?"Edited":"Deleted"}</span> <b>${escapeHtml(e.date||snap.date||"No date")} — ${escapeHtml(e.branch||snap.branch||"No branch")}</b><div class="small">${escapeHtml(when)} · ${count} line${count===1?"":"s"} · Original docket ID ${escapeHtml(e.docketId||snap.id||"—")}</div></div>`;
   }).join(""):`<div class="small">No delivery docket changes recorded yet.</div>`;
 }
}


const historicalData={"weekly_reports": [{"branch": "Lamai", "old_stock_from": "2026-07-18", "check_date": "2026-07-25", "totals": {"sales": 1050, "cost": 450, "profit": 600, "bm": 240, "alix": 180, "pin_profit": 180, "pay_pin": 630}}, {"branch": "Lamai", "old_stock_from": "2026-07-25", "check_date": "2026-08-02", "totals": {"sales": 2100, "cost": 930, "profit": 1170, "bm": 468, "alix": 351, "pin_profit": 351, "pay_pin": 1281}}, {"branch": "Lamai", "old_stock_from": "2026-08-02", "check_date": "2026-08-09", "totals": {"sales": 1950, "cost": 870, "profit": 1080, "bm": 432, "alix": 324, "pin_profit": 324, "pay_pin": 1194}}], "dockets": [{"branch": "BM Bangrak", "date": "2026-08-05", "lines": [["Gummy 4 Leaf", 15, 100]], "total": 1500, "calculated_total": 1500, "total_check": true}, {"branch": "BM Bangrak", "date": "2026-08-06", "lines": [["Super Boof Pre-roll", 20, 75], ["Permanent Marker Pre-roll", 20, 75], ["Super Lemon Haze Pre-roll", 15, 75], ["Miami Pre-roll", 15, 75], ["Tropicana Cookies Pre-roll", 15, 75], ["Black Cherry Punch Pre-roll", 10, 75]], "total": 7125, "calculated_total": 7125, "total_check": true}, {"branch": "BM Bangrak", "date": "2026-08-06", "lines": [["Super Lemon Haze 1g", 30, 60], ["Permanent Marker 1g", 30, 60], ["Tropicana Cookies 1g", 30, 60], ["Miami 1g", 15, 60], ["Super Lemon Haze 5g", 5, 300], ["Permanent Marker 5g", 3, 300], ["Tropicana Cookies 5g", 3, 300], ["Miami 5g", 2, 300]], "total": 10200, "calculated_total": 10200, "total_check": true}, {"branch": "Lamai", "date": "2026-08-06", "lines": [["Super Lemon Haze 1g", 6, 60], ["Tropicana Cookies 1g", 6, 60], ["Permanent Marker 1g", 6, 60], ["Super Lemon Haze Pre-roll", 6, 75], ["Tropicana Cookies Pre-roll", 6, 75], ["Permanent Marker Pre-roll", 6, 75], ["Black Cherry Punch Pre-roll", 4, 75]], "total": 2730, "calculated_total": 2730, "total_check": true}, {"branch": "Lamai", "date": null, "lines": [["Super Lemon Haze 1g", 6, 60], ["Tropicana Cookies 1g", 6, 60], ["Super Lemon Haze Pre-roll", 6, 75], ["Tropicana Cookies Pre-roll", 6, 75], ["Black Cherry Punch Pre-roll", 4, 75]], "total": 1920, "calculated_total": 1920, "total_check": true}, {"branch": "BM Bangrak", "date": "2026-08-14", "lines": [["Gummy 4 Leaf", 10, 100]], "total": 1000, "calculated_total": 1000, "total_check": true}, {"branch": "BM Bangrak", "date": "2026-08-24", "lines": [["Cali Mousse 1g", 10, 350], ["Super Boof 1g", 7, 60], ["Tropicana Cookies Pre-roll", 5, 75], ["Miami Pre-roll", 10, 75], ["Super Lemon Haze Pre-roll", 12, 75], ["Permanent Marker Pre-roll", 11, 75], ["Gummy 4 Leaf", 15, 100]], "total": 8270, "calculated_total": 8270, "total_check": true}, {"branch": "BM Bangrak", "date": "2026-09-02", "lines": [["Super Lemon Haze 1g", 15, 60], ["Permanent Marker 5g", 1, 300], ["Super Lemon Haze Pre-roll", 18, 75], ["Permanent Marker Pre-roll", 12, 75], ["Miami Pre-roll", 10, 75], ["Tropicana Cookies Pre-roll", 5, 75]], "total": 4575, "calculated_total": 4575, "total_check": true}, {"branch": "Lamai", "date": "2026-09-02", "lines": [["King's Tars 1g", 2, 60], ["Super Boof 1g", 4, 60], ["Black Cherry Punch 1g", 6, 60], ["Super Boof Pre-roll", 5, 75], ["Tropicana Cookies Pre-roll", 3, 75], ["Super Lemon Haze Pre-roll", 3, 75]], "total": 1545, "calculated_total": 1545, "total_check": true}, {"branch": "BM Bangrak", "date": "2026-09-07", "lines": [["Gummy 4 Leaf", 20, 100]], "total": 2000, "calculated_total": 2000, "total_check": true}]};
function renderHistorical(){
 const ws=historicalData.weekly_reports;
 const ds=historicalData.dockets;
 const docketValue=ds.reduce((a,d)=>a+d.total,0);
 const knownDates=ds.filter(d=>d.date).length;
 document.getElementById("histMetrics").innerHTML=[
  ["Weekly reports",ws.length],["Delivery dockets",ds.length],["Docket value",baht(docketValue)],["Dated dockets",knownDates+"/"+ds.length]
 ].map(x=>`<div class="card metric"><div class="k">${x[0]}</div><div class="v">${x[1]}</div></div>`).join("");
 document.getElementById("histWeeks").innerHTML=ws.map(w=>{
   const t=w.totals, splitOK=Math.abs((t.bm+t.alix+t.pin_profit)-t.profit)<0.01, pinOK=Math.abs((t.cost+t.pin_profit)-t.pay_pin)<0.01;
   return `<tr><td>${w.old_stock_from} → ${w.check_date}</td><td>${baht(t.sales)}</td><td>${baht(t.cost)}</td><td>${baht(t.profit)}</td><td>${baht(t.bm)}</td><td>${baht(t.alix)}</td><td>${baht(t.pin_profit)}</td><td>${baht(t.pay_pin)}</td><td>${splitOK&&pinOK?'<span class="status ok">Matches</span>':'<span class="status bad">Review</span>'}</td></tr>`;
 }).join("");
 const branch=document.getElementById("histBranch")?.value||"All branches";
 const filt=ds.filter(d=>branch==="All branches"||d.branch===branch);
 document.getElementById("histDockets").innerHTML=filt.map((d,i)=>`<div class="auditrow"><div style="display:flex;justify-content:space-between;gap:10px"><div><b>${d.branch}</b><div class="small">${d.date||'<span class="status warn">Date not visible</span>'}</div></div><div><b>${baht(d.total)}</b> ${d.total_check?'<span class="status ok">Arithmetic OK</span>':'<span class="status bad">Total mismatch</span>'}</div></div><div class="small" style="margin-top:6px">${d.lines.map(l=>`${l[1]} × ${l[0]} @ ฿${l[2]}`).join(" · ")}</div></div>`).join("");
}



let selectedXlsxFiles=[];

function loadSheetJS(){
  if(window.XLSX) return Promise.resolve(true);
  return new Promise(resolve=>{
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    s.onload=()=>resolve(true);
    s.onerror=()=>resolve(false);
    document.head.appendChild(s);
  });
}

function sanitizeArchivePart(s){
  return String(s||"").trim().replace(/[^\w\- ]+/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");
}

function parseDateFromText(s){
  const m=String(s||"").match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if(!m) return null;
  const dd=m[1].padStart(2,"0"), mm=m[2].padStart(2,"0"), yyyy=m[3];
  return `${yyyy}-${mm}-${dd}`;
}

function detectBranchFromWorkbook(rows, filename){
  const hay=[filename, ...(rows.slice(0,4).flat().filter(Boolean))].join(" ").toLowerCase();
  if(hay.includes("lamai")) return "Lamai";
  if(hay.includes("k.pual") || hay.includes("k.paul") || hay.includes("bangrak") || hay.includes("mini mart") || hay.includes("minimart")) return "BM Bangrak";
  return null;
}

function findHeaderRow(rows){
  for(let i=0;i<Math.min(rows.length,12);i++){
    const vals=(rows[i]||[]).map(v=>String(v||"").toLowerCase());
    if(vals.some(v=>v.includes("products")) && vals.some(v=>v.includes("old stock"))) return i;
  }
  return 2; // current BM format fallback
}



function findWeeklyBlockStarts(rows){
  const starts=[];
  for(let i=0;i<rows.length;i++){
    const vals=(rows[i]||[]).map(v=>String(v??"").trim());
    const hay=vals.join(" | ").toLowerCase();

    // Strong marker used by both real BM and Lamai sheets:
    // report title row contains BOTH "Old Stock from" and "Check Date".
    const titleMarker=hay.includes("old stock from") && hay.includes("check date");

    // Secondary structural check: a No./Products row followed shortly by
    // Old stock/New Deliver/Take out headings.
    let tableMarker=false;
    if(!titleMarker){
      const lower=vals.map(v=>v.toLowerCase());
      const rowHasNo=lower.some(v=>v==="no."||v==="no");
      const rowHasProducts=lower.some(v=>v.includes("product"));
      if(rowHasNo&&rowHasProducts){
        for(let j=i+1;j<=Math.min(i+2,rows.length-1);j++){
          const h=(rows[j]||[]).map(v=>String(v??"").toLowerCase()).join(" | ");
          if(h.includes("old stock")&&h.includes("new deliver")&&h.includes("take out")){
            tableMarker=true;
            break;
          }
        }
      }
    }

    // Prefer title rows. Table-marker rows are shifted upward if possible
    // to the nearest title row, otherwise used as a fallback.
    if(titleMarker){
      starts.push(i);
    }else if(tableMarker){
      let title=i;
      for(let k=Math.max(0,i-3);k<i;k++){
        const h=(rows[k]||[]).map(v=>String(v??"").toLowerCase()).join(" | ");
        if(h.includes("old stock from")&&h.includes("check date")) title=k;
      }
      if(!starts.includes(title)) starts.push(title);
    }
  }

  // Last-resort fallback for a single known-format report.
  if(!starts.length && rows.length>4) starts.push(0);

  return [...new Set(starts)].sort((a,b)=>a-b);
}


function parseFlexibleDateText(s){
  if(s instanceof Date&&!Number.isNaN(s.getTime()))return s.toISOString().slice(0,10);
  if(typeof s==="number"&&Number.isFinite(s)&&s>30000&&s<80000){
    const d=new Date(Date.UTC(1899,11,30)+Math.floor(s)*86400000);
    return Number.isNaN(d.getTime())?null:d.toISOString().slice(0,10);
  }
  const text=String(s||"");
  let iso=text.match(/\b(20\d{2})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/);
  if(iso)return `${iso[1]}-${iso[2].padStart(2,"0")}-${iso[3].padStart(2,"0")}`;
  let m=text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if(m){
    return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  }
  m=text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})(?!\d)/);
  if(m){
    return `20${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  }
  return null;
}

function findLabelDate(rows,start,to,labelPattern){
 for(let i=start;i<=to;i++){
  const row=rows[i]||[];
  for(let c=0;c<row.length;c++){
   const labelCell=String(row[c]??""),match=labelCell.match(labelPattern);if(!match)continue;
   const candidates=[labelCell.slice((match.index||0)+match[0].length),...row.slice(c+1,c+4)];
   for(let r=i+1;r<=Math.min(to,i+2);r++)candidates.push(...(rows[r]||[]).slice(Math.max(0,c-1),c+4));
   for(const value of candidates){const parsed=parseFlexibleDateText(value);if(parsed)return parsed;}
  }
 }
 return null;
}

function findDateNearBlock(rows,start){
  const to=Math.min(rows.length-1,start+8);
  return {checkDate:findLabelDate(rows,start,to,/check\s*date/i),oldDate:findLabelDate(rows,start,to,/old\s*stock\s*from/i)};
}

function spreadsheetFinancialTotalsNearBlock(rows,start,end){
 const from=Math.max(start+1,0),to=Math.min(rows.length,end+4);
 for(let r=from;r<to;r++){
  const row=rows[r]||[];
  const label=String(row[10]??"").trim().toLowerCase();
  if(label!=="total")continue;
  const vals={sales:numOrNull(row[11]),cost:numOrNull(row[12]),profit:numOrNull(row[13]),bm:numOrNull(row[14]),alix:numOrNull(row[15]),pinProfit:numOrNull(row[16]),payPin:numOrNull(row[17]),rowNumber:r+1};
  if(Object.values(vals).some(v=>typeof v==="number"&&Number.isFinite(v)))return vals;
 }
 return null;
}

function workbookFinancialIntegrity(rep){
 const sheet=rep?.sheetTotals;if(!sheet)return {status:"unknown",mismatches:[]};
 const calc={sales:0,cost:0,profit:0,bm:0,alix:0,pinProfit:0,payPin:0};
 (rep.rows||[]).forEach(r=>{calc.sales+=Number(r.totalSales)||0;calc.cost+=Number(r.totalCost)||0;calc.profit+=Number(r.totalProfit)||0;calc.bm+=Number(r.bmShare)||0;calc.alix+=Number(r.alixShare)||0;calc.pinProfit+=Number(r.pinShare)||0;calc.payPin+=(Number(r.totalCost)||0)+(Number(r.pinShare)||0)});
 const labels={sales:"Sales",cost:"Cost",profit:"Profit",bm:"BM share",alix:"Alix share",pinProfit:"Pin profit",payPin:"Pay Pin"};
 const mismatches=[];
 Object.keys(labels).forEach(k=>{if(sheet[k]!=null&&Math.abs(Number(sheet[k])-Number(calc[k]))>0.011)mismatches.push({key:k,label:labels[k],sheet:Number(sheet[k]),calculated:Number(calc[k]),difference:+(Number(calc[k])-Number(sheet[k])).toFixed(2)})});
 return {status:mismatches.length?"mismatch":"ok",mismatches,sheet,calculated:calc};
}

// v0.10.130: financial-integrity mismatches are resolved inside the Sunday
// workflow. The resolution is bound to the exact mismatch signature so any
// later change to the workbook/report automatically reopens the warning.
function financialIntegritySignature(integrity){
  return JSON.stringify((integrity?.mismatches||[]).map(m=>[m.key,+Number(m.sheet||0).toFixed(2),+Number(m.calculated||0).toFixed(2)]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));
}
function financialIntegrityResolutionValid(rep,integrity){
  return !!(rep?.financialIntegrityResolution&&rep.financialIntegrityResolution.mode==="line_items"&&rep.financialIntegrityResolution.signature===financialIntegritySignature(integrity));
}
window.resolveFinancialIntegrity=function(reportId){
  ensureSundayArchive();
  const rep=(db.sundayImports||[]).find(r=>r&&r.id===reportId);
  if(!rep)return alert("Sunday report not found.");
  const integrity=workbookFinancialIntegrity(rep);
  if(integrity.status!=="mismatch"){
    alert("This report no longer has a spreadsheet-total mismatch.");
    renderSundayWizard();
    return;
  }
  const pay=integrity.mismatches.find(m=>m.key==="payPin");
  const message=`Spreadsheet total mismatch — ${displayBranchName(rep.branch)} ${recordDateLabel(rep.date)}\n\n`+
    (pay?`Spreadsheet Pay Pin: ${baht(pay.sheet)}\nAll product lines: ${baht(pay.calculated)}\nDifference: ${pay.difference>=0?"+":""}${baht(pay.difference)}\n\n`:"")+
    `The product-line calculation includes every imported product row.\n\nTap OK to acknowledge the spreadsheet formula problem and use ALL PRODUCT LINES for this Sunday calculation. The original spreadsheet remains unchanged and the acknowledgement is saved in the audit data.\n\nTap Cancel to keep Invoice blocked.`;
  if(!confirm(message))return;
  rep.financialIntegrity=integrity;
  rep.financialIntegrityResolution={
    mode:"line_items",
    signature:financialIntegritySignature(integrity),
    acknowledgedAt:new Date().toISOString(),
    sheetPayPin:pay?.sheet??null,
    calculatedPayPin:pay?.calculated??null,
    mismatchKeys:(integrity.mismatches||[]).map(m=>m.key)
  };
  save();
  renderSundayWizard();
};

function parseWeeklyBlock(rows,start,end,branch,filename,sheetName,idx){
 const parsed=[];
 for(let r=start+1;r<end;r++){
  const row=rows[r]||[],no=row[0],product=row[1];
  if(typeof no!=="number"||!product||typeof product!=="string")continue;
  parsed.push({no,product:String(product).trim(),oldStock:numOrNull(row[2]),newDeliver:numOrNull(row[3]),takeOut:numOrNull(row[4]),total:numOrNull(row[5]),inStock:numOrNull(row[6]),sold:numOrNull(row[7]),sellPrice:numOrNull(row[8]),cost:numOrNull(row[9]),totalSales:numOrNull(row[11]),totalCost:numOrNull(row[12]),totalProfit:numOrNull(row[13]),bmShare:numOrNull(row[14]),alixShare:numOrNull(row[15]),pinShare:numOrNull(row[16])});
 }
 if(!parsed.length)return null;
 const dates=findDateNearBlock(rows,start),date=dates.checkDate||null,branchLabel=displayBranchName(branch||"Unknown-Branch"),importable=!!branch&&!!date;
 const sheetTotals=spreadsheetFinancialTotalsNearBlock(rows,start,end);
 return {sheetName,branch,date,oldDate:dates.oldDate,rows:parsed,sheetTotals,financialIntegrity:workbookFinancialIntegrity({rows:parsed,sheetTotals}),importable,detectionIssue:!branch&&!date?"Shop and check date could not be detected":!branch?"Shop could not be detected":!date?"Check date could not be detected":"",archiveName:`${date||"DATE-NEEDED"}_${sanitizeArchivePart(branchLabel)}_Sunday-Stock.xlsx`,originalFilename:filename,blockIndex:idx,startRow:start+1,endRow:end};
}
function parseSundayWorkbook(arrayBuffer,filename){
 const wb=XLSX.read(arrayBuffer,{type:"array",cellDates:false,cellFormula:true,cellNF:false}); if(!wb.SheetNames.length)throw new Error("Workbook contains no worksheets.");
 const reports=[];
 for(const sheetName of wb.SheetNames){
  const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,raw:true,defval:null});
  const branch=detectBranchFromWorkbook(rows,filename),starts=findWeeklyBlockStarts(rows);
  starts.forEach((start,i)=>{const rep=parseWeeklyBlock(rows,start,i+1<starts.length?starts[i+1]:rows.length,branch,filename,sheetName,i);if(rep)reports.push(rep)});
 }
 if(!reports.length)throw new Error("No weekly stock report blocks were found."); return reports;
}

function runSundayMultiWeekDetectorSelfCheck(){
 const rows=[],add=(oldDate,checkDate,name)=>{
  rows.push([`Old Stock from ${oldDate}`,null,`Check Date`,checkDate]);
  rows.push(["No.","Products","Old Stock","New Deliver","Take out"]);
  rows.push([1,name,3,2,0,5,4,1,150,60,null,150,60,90,36,27,27]);
  rows.push([]);
 };
 add("30/08/2026","06/09/2026","Week one");
 add("06/09/2026","13/09/2026","Week two");
 const serial=Math.floor((Date.UTC(2026,8,20)-Date.UTC(1899,11,30))/86400000);
 add("13/09/2026",serial,"Week three");
 const starts=findWeeklyBlockStarts(rows),reports=starts.map((start,i)=>parseWeeklyBlock(rows,start,i+1<starts.length?starts[i+1]:rows.length,"BM Bangrak","self-check.xlsx","Three weeks",i)).filter(Boolean);
 const dates=reports.map(r=>r.date),ok=starts.length===3&&reports.length===3&&dates.join("|")==="2026-09-06|2026-09-13|2026-09-20"&&reports.every(r=>r.rows.length===1&&r.importable);
 const box=document.getElementById("sundayDetectorSelfCheck");
 if(box){box.classList.toggle("bad",!ok);box.textContent=ok?"✓ Multi-week detector self-check passed — 3 blocks and 3 dates separated correctly.":`⚠ Multi-week detector self-check failed — found ${reports.length} block${reports.length===1?"":"s"}: ${dates.join(", ")||"no dates"}.`;}
 return {ok,blocks:reports.length,dates};
}



function numOrNull(v){
  if(v===null || v===undefined || v==="") return null;
  if(typeof v==="number") return Number.isFinite(v)?v:null;

  const s=String(v).trim();
  const direct=Number(s);
  if(Number.isFinite(direct)) return direct;

  // Safely evaluate only very simple numeric formula strings such as
  // =2, =4+2, =10-3. Cell-reference formulas normally arrive with
  // cached numeric values from Excel and do not use this fallback.
  if(/^=\s*[\d.\s+\-*/()]+$/.test(s)){
    try{
      const n=Function(`"use strict";return (${s.slice(1)})`)();
      return Number.isFinite(n)?n:null;
    }catch(e){}
  }
  return null;
}



function daysBetween(a,b){
  if(!a||!b) return null;
  const da=new Date(a+"T00:00:00"), dbb=new Date(b+"T00:00:00");
  return Math.round((dbb-da)/86400000);
}

function cleanProductDisplayName(s){
  return String(s||"").trim().replace(/\s+/g," ");
}
function hasWhitespaceNoise(s){
  const raw=String(s||"");
  return raw!==raw.trim() || /\s{2,}/.test(raw);
}

function normalizeProductKey(s){
  return norm(String(s||"")
    .replace(/pre[\s\-]?roll/gi,"preroll")
    .replace(/pre[\s\-]?oll/gi,"preroll")
    .replace(/\b1\s*g(?:ram)?\.?/gi,"1g")
    .replace(/\b5\s*g(?:ram)?\.?/gi,"5g")
    .replace(/[’']/g,""));
}
function productFamilyKey(name){
  return normalizeProductKey(correctedCanonicalProductName(name))
    .replace(/\s+(?:1g|5g|preroll)$/,'')
    .trim();
}

function inferProductVariantFromPrices(p){
  const cost=Number(p?.cost||0), retail=Number(p?.retail||0);
  if(Math.abs(cost-60)<0.001 && Math.abs(retail-150)<0.001)
    return {variantKey:"1g",variantLabel:"1g",unitWeightGrams:1,exception:false};
  if(Math.abs(cost-300)<0.001 && Math.abs(retail-600)<0.001)
    return {variantKey:"5g",variantLabel:"5g",unitWeightGrams:5,exception:false};
  if(Math.abs(cost-75)<0.001 && Math.abs(retail-150)<0.001)
    return {variantKey:"preroll",variantLabel:"Pre-Roll",unitWeightGrams:1,exception:false};

  const n=String(p?.name||"");
  if(/gummy|edible/i.test(n) || p?.type==="edible")
    return {variantKey:"special",variantLabel:"Gummy / Edible",unitWeightGrams:null,exception:true};
  if(/hash|mousse|concentrate/i.test(n) || p?.type==="hash")
    return {variantKey:"special",variantLabel:"Hash / Special",unitWeightGrams:null,exception:true};
  return {variantKey:"special",variantLabel:"Special",unitWeightGrams:null,exception:true};
}

function inferParentProductName(p,variant){
  let n=cleanProductDisplayName(correctedCanonicalProductName(p?.name||""));
  if(variant?.variantKey==="5g") n=n.replace(/\s+5\s*g\.?$/i,"").trim();
  if(variant?.variantKey==="preroll") n=n.replace(/\s+Pre[\s-]?Roll$/i,"").trim();
  if(variant?.variantKey==="1g") n=n.replace(/\s+1\s*g\.?$/i,"").trim();
  return cleanProductDisplayName(n);
}

function ensureProductFamilyStructure(){
  let changed=false;
  (db.products||[]).forEach(p=>{
    if(!p||!p.id)return;
    const inferred=inferProductVariantFromPrices(p);
    const parent=inferParentProductName(p,inferred);
    if(!p.parentName){p.parentName=parent;changed=true}
    if(!p.variantKey){p.variantKey=inferred.variantKey;changed=true}
    if(!p.variantLabel){p.variantLabel=inferred.variantLabel;changed=true}
    if(p.unitWeightGrams===undefined){p.unitWeightGrams=inferred.unitWeightGrams;changed=true}
    if(p.catalogueException===undefined){p.catalogueException=!!inferred.exception;changed=true}
  });
  if(changed)localStorage.setItem("mdpin-db",JSON.stringify(db));
  return changed;
}
function productParentName(p){
  if(!p)return "";
  return cleanProductDisplayName(p.parentName||inferParentProductName(p,inferProductVariantFromPrices(p)));
}
function productVariantLabel(p){
  if(!p)return "";
  return p.variantLabel||inferProductVariantFromPrices(p).variantLabel;
}
function effectiveDeliveryVariant(p){
  if(!p)return {variantKey:"special",variantLabel:"Special"};
  const raw=cleanProductDisplayName(correctedCanonicalProductName(p.name||""));
  if(/\bpre[\s-]?roll\b/i.test(raw))return {variantKey:"preroll",variantLabel:"Pre-Roll"};
  if(/\b5\s*g\b/i.test(raw))return {variantKey:"5g",variantLabel:"5g"};
  if(/\b1\s*g\b/i.test(raw))return {variantKey:"1g",variantLabel:"1g"};

  // Known price signatures are more reliable than stale metadata saved by
  // older production versions.
  const inferred=inferProductVariantFromPrices(p);
  if(["1g","5g","preroll"].includes(String(inferred?.variantKey||"").toLowerCase()))return inferred;

  const stored=String(p.variantKey||"").toLowerCase();
  if(stored==="1g")return {variantKey:"1g",variantLabel:"1g"};
  if(stored==="5g")return {variantKey:"5g",variantLabel:"5g"};
  if(stored==="preroll")return {variantKey:"preroll",variantLabel:"Pre-Roll"};
  return inferred||{variantKey:"special",variantLabel:p.variantLabel||"Special"};
}
function deliveryProductDisplayName(p){
  if(!p)return "Unknown product";
  const raw=cleanProductDisplayName(correctedCanonicalProductName(p.name||""));
  const variant=effectiveDeliveryVariant(p);
  let parent=productParentName(p)||raw;

  // Parent metadata can itself be stale. Strip any variant suffix before
  // appending the authoritative delivery variant label.
  parent=parent
    .replace(/\s+Pre[\s-]?Roll$/i,"")
    .replace(/\s+5\s*g\.?$/i,"")
    .replace(/\s+1\s*g\.?$/i,"")
    .trim();

  if(variant.variantKey==="1g")return cleanProductDisplayName(`${parent} 1g`);
  if(variant.variantKey==="5g")return cleanProductDisplayName(`${parent} 5g`);
  if(variant.variantKey==="preroll")return cleanProductDisplayName(`${parent} Pre-Roll`);
  return raw||parent;
}


function productHintMatches(p,hint={}){
  if(!p)return false;
  const hc=Number(hint.cost), hr=Number(hint.retail);
  const hasC=Number.isFinite(hc)&&hc>0, hasR=Number.isFinite(hr)&&hr>0;
  if(!hasC&&!hasR)return true;
  const pc=Number(p.cost), pr=Number(p.retail);
  if(hasC && (!(pc>0)||Math.abs(pc-hc)>0.001))return false;
  if(hasR && (!(pr>0)||Math.abs(pr-hr)>0.001))return false;
  return true;
}
function contextualFamilyMatch(name,hint={}){
  const family=productFamilyKey(name);
  if(!family)return null;
  const candidates=(db.products||[]).filter(p=>productFamilyKey(p.name)===family && productHintMatches(p,hint));
  if(candidates.length===1)return candidates[0];
  return null;
}

function basePriceReferenceForName(name){
  const corrected=correctedCanonicalProductName(name);
  const key=normalizeProductKey(corrected);
  let ref=BASE_PRODUCTS.find(p=>normalizeProductKey(p.name)===key);
  if(ref)return ref;
  // The original catalogue omitted the visible "1g" suffix on standard 1g flower.
  // Treat an otherwise exact "... 1g" name as the same product, but never fuzzy-match prices.
  const without1g=key.replace(/\s+1g$/,'').trim();
  if(without1g!==key){
    ref=BASE_PRODUCTS.find(p=>p.type==='kanja' && normalizeProductKey(p.name)===without1g);
    if(ref)return ref;
  }
  return null;
}
function repairKnownProductPrices(){
  let repaired=0;
  (db.products||[]).forEach(p=>{
    if(Number(p.cost)>0 && Number(p.retail)>0)return;
    let ref=basePriceReferenceForName(p.name);
    if(!ref){
      // If the master product was renamed, one of its saved aliases may still be a known base name.
      const aliasKey=Object.keys(db.productAliases||{}).find(k=>db.productAliases[k]===p.id && basePriceReferenceForName(k));
      if(aliasKey)ref=basePriceReferenceForName(aliasKey);
    }
    if(!ref)return;
    if(!(Number(p.cost)>0) && Number(ref.cost)>0){p.cost=Number(ref.cost);repaired++}
    if(!(Number(p.retail)>0) && Number(ref.retail)>0){p.retail=Number(ref.retail);repaired++}
    if(!p.type)p.type=ref.type;
  });
  if(repaired)localStorage.setItem("mdpin-db",JSON.stringify(db));
  return repaired;
}
function resolvedProductById(id){
  return (db.products||[]).find(p=>p.id===id)||null;
}
function validatedProductPrices(p){
  if(!p)return null;
  let cost=Number(p.cost)||0, retail=Number(p.retail)||0;
  if(cost>0 && retail>0)return {cost,retail};
  const ref=basePriceReferenceForName(p.name);
  if(ref){
    if(cost<=0)cost=Number(ref.cost)||0;
    if(retail<=0)retail=Number(ref.retail)||0;
  }
  return {cost,retail};
}


function ensureProductAliases(){if(!db.productAliases)db.productAliases={};if(!db.deferredMappings)db.deferredMappings={}}
function canonicalProductMatch(name,hint={}){
 ensureProductAliases();
 const corrected=correctedCanonicalProductName(name),n=normalizeProductKey(corrected);
 const aid=db.productAliases[n];
 if(aid){
   const p=db.products.find(x=>x.id===aid);
   if(p){
     // A saved alias is authoritative unless the shop row carries a strong price signature
     // proving it is a different size/form of the same product family.
     if(productHintMatches(p,hint))return {product:p,score:1,viaAlias:true,suggestion:p};
     const contextual=contextualFamilyMatch(corrected,hint);
     if(contextual)return {product:contextual,score:1,viaAlias:false,contextual:true,suggestion:contextual};
     return {product:p,score:1,viaAlias:true,suggestion:p};
   }
 }
 let exact=db.products.find(p=>normalizeProductKey(correctedCanonicalProductName(p.name))===n);
 if(exact){
   if(productHintMatches(exact,hint))return {product:exact,score:1,viaAlias:false,suggestion:exact};
   const contextual=contextualFamilyMatch(corrected,hint);
   if(contextual)return {product:contextual,score:1,viaAlias:false,contextual:true,suggestion:contextual};
   return {product:exact,score:1,viaAlias:false,suggestion:exact};
 }
 // Exact standard-flower identity when the shop includes a redundant 1g suffix.
 const without1g=n.replace(/\s+1g$/,'').trim();
 if(without1g!==n){
   const oneGram=db.products.filter(p=>p.type==='kanja' && normalizeProductKey(correctedCanonicalProductName(p.name))===without1g);
   if(oneGram.length===1 && productHintMatches(oneGram[0],hint))return {product:oneGram[0],score:1,viaAlias:false,contextual:true,suggestion:oneGram[0]};
 }
 const contextual=contextualFamilyMatch(corrected,hint);
 if(contextual)return {product:contextual,score:1,viaAlias:false,contextual:true,suggestion:contextual};
 let best=null,bestScore=0;db.products.forEach(p=>{const sc=similarity(n,normalizeProductKey(correctedCanonicalProductName(p.name)));if(sc>bestScore){bestScore=sc;best=p}});
 // Fuzzy matches are suggestions only. Unknown shop spellings must be reviewed before they become canonical.
 return {product:null,score:bestScore,viaAlias:false,suggestion:best};
}
function canonicalProductMatchRow(rr){
 return canonicalProductMatch(rr?.product||rr?.sourceProductName||"",{cost:rr?.cost,retail:rr?.sellPrice});
}

function saveProductAlias(sourceName,productId){ensureProductAliases();db.productAliases[normalizeProductKey(sourceName)]=productId;save()}


function isExcelSourceRecord(r){
  return /excel/i.test(String(r?.source||"")) || r?.importAudit?.type==="xlsx";
}

function cleanupDataIntegrity(){
  if(!db.weeks) db.weeks=[];
  ensureSundayArchive();

  let removedWeeks=0, removedArchives=0, supersededLowerQuality=0;

  const grouped=new Map();
  db.weeks.forEach((w,idx)=>{
    const key=`${w.branch||""}|${w.date||""}`;
    if(!grouped.has(key)) grouped.set(key,[]);
    grouped.get(key).push({w,idx});
  });
  const keepWeekIds=new Set();
  for(const entries of grouped.values()){
    entries.sort((a,b)=>{
      const ae=isExcelSourceRecord(a.w)?1:0, be=isExcelSourceRecord(b.w)?1:0;
      if(ae!==be) return be-ae;
      return b.idx-a.idx;
    });
    keepWeekIds.add(entries[0].w.id);
    if(entries.length>1){
      removedWeeks += entries.length-1;
      supersededLowerQuality += entries.slice(1).filter(e=>!isExcelSourceRecord(e.w)&&isExcelSourceRecord(entries[0].w)).length;
    }
  }
  db.weeks=db.weeks.filter(w=>keepWeekIds.has(w.id));

  const ag=new Map();
  db.sundayImports.forEach((r,idx)=>{
    const key=`${r.branch||""}|${r.date||""}`;
    if(!ag.has(key)) ag.set(key,[]);
    ag.get(key).push({r,idx});
  });
  const keepArchiveIds=new Set();
  for(const entries of ag.values()){
    entries.sort((a,b)=>{
      const at=new Date(a.r.importedAt||0).getTime(), bt=new Date(b.r.importedAt||0).getTime();
      return bt-at || b.idx-a.idx;
    });
    keepArchiveIds.add(entries[0].r.id);
    removedArchives += Math.max(0,entries.length-1);
  }
  db.sundayImports=db.sundayImports.filter(r=>keepArchiveIds.has(r.id));

  save();
  const box=document.getElementById("cleanupStatus");
  if(box){
    box.innerHTML=`<b>Data cleaned.</b> ${removedWeeks} duplicate/superseded weekly record${removedWeeks===1?"":"s"} removed, ${removedArchives} duplicate archive record${removedArchives===1?"":"s"} removed${supersededLowerQuality?`, including ${supersededLowerQuality} lower-quality OCR/manual record${supersededLowerQuality===1?"":"s"}`:""}.`;
  }
  const integrity=document.getElementById("integrityDetails");
  if(integrity)integrity.classList.toggle("hasIssue",(removedWeeks+removedArchives+supersededLowerQuality)>0);
  return {removedWeeks,removedArchives,supersededLowerQuality};
}

function ensureSundayArchive(){
  if(!db.sundayImports) db.sundayImports=[];
}

function mapProductByName(name){
  return canonicalProductMatch(name).product;
}

function validateWorkbookMath(rep){
  let mismatches=[];
  rep.rows.forEach(r=>{
    if(r.oldStock!=null || r.newDeliver!=null || r.takeOut!=null || r.inStock!=null){
      const old=r.oldStock||0, del=r.newDeliver||0, take=r.takeOut||0;
      const expectedTotal=old+del-take;
      if(r.total!=null && Math.abs(expectedTotal-r.total)>0.001) mismatches.push(`${r.product}: total`);
      if(r.inStock!=null && r.sold!=null && Math.abs((expectedTotal-r.inStock)-r.sold)>0.001) mismatches.push(`${r.product}: sold`);
      if(r.sold!=null && r.sellPrice!=null && r.totalSales!=null && Math.abs((r.sold*r.sellPrice)-r.totalSales)>0.01) mismatches.push(`${r.product}: sales`);
    }
  });
  return mismatches;
}


function canonicalBranchName(value){
  const raw=cleanProductDisplayName(value);
  const n=raw.toLowerCase();
  if(n.includes("lamai")) return "Lamai";
  if(n.includes("bangrak") || n.includes("k.paul") || n.includes("k.pual") || n.includes("mini mart")) return "BM Bangrak";
  return raw;
}

function rebuildSundayReportChain(){
  ensureSundayArchive();
  const groups=new Map();
  db.sundayImports.forEach(r=>{
    r.branch=canonicalBranchName(r.branch);
    r.chainPreviousId=null;
    r.chainPreviousDate=null;
    r.chainGapDays=null;
    const key=canonicalBranchName(r.branch);
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(r);
  });
  groups.forEach(rows=>{
    rows.sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
    for(let i=1;i<rows.length;i++){
      const prev=rows[i-1], cur=rows[i];
      const gap=daysBetween(prev.date,cur.date);
      cur.chainGapDays=gap;
      if(gap!=null && gap>=5 && gap<=9){
        cur.chainPreviousId=prev.id;
        cur.chainPreviousDate=prev.date;
      }
    }
  });
}

function getPreviousSundayReport(branch,date,currentId=null){
  ensureSundayArchive();
  const branchKey=canonicalBranchName(branch);
  const current=currentId ? db.sundayImports.find(r=>r.id===currentId) : db.sundayImports.find(r=>canonicalBranchName(r.branch)===branchKey && r.date===date);
  if(current?.chainPreviousId){
    const linked=db.sundayImports.find(r=>r.id===current.chainPreviousId);
    if(linked) return linked;
  }
  const prev=[...db.sundayImports]
    .filter(r=>canonicalBranchName(r.branch)===branchKey && r.date<date && (!currentId || r.id!==currentId))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))
    .at(-1) || null;
  if(!prev) return null;
  const gap=daysBetween(prev.date,date);
  return gap!=null && gap>=5 && gap<=9 ? prev : null;
}

function getNearestEarlierSundayReport(branch,date,currentId=null){
  ensureSundayArchive();
  const branchKey=canonicalBranchName(branch);
  return [...db.sundayImports]
    .filter(r=>canonicalBranchName(r.branch)===branchKey && r.date<date && (!currentId || r.id!==currentId))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))
    .at(-1) || null;
}

function rowByProductName(report,name){
  if(!report) return null;
  const n=norm(name);
  let exact=(report.rows||[]).find(r=>norm(r.product)===n);
  if(exact) return exact;
  let best=null,bestScore=0;
  (report.rows||[]).forEach(r=>{
    const s=similarity(n,norm(r.product));
    if(s>bestScore){bestScore=s;best=r}
  });
  return bestScore>=0.72?best:null;
}

// v0.10.119: test copies are visible in Records but never enter real stock arithmetic.
// The older conflict helper could edit a genuine docket in place. For that case
// use its saved pre-test snapshot, preserving its original delivered quantities.
function businessDeliverySource(d){
  if(!d)return null;
  if(d.testOnlySuggestedCopy||/^DTESTCONFLICT/.test(String(d.id||"")))return null;
  if(d.testConflictSeed){
    const audit=[...(db.docketAudit||[])].reverse().find(a=>a.docketId===d.id&&a.testOnlyConflictSeed&&a.beforeSnapshot);
    if(audit?.beforeSnapshot)return audit.beforeSnapshot;
    // Unknown original state: keep the record visible for review, never guess its old quantity.
  }
  return d;
}
// A top-up calculated from Sunday's closing stock is for a subsequent period.
// A stale/incorrect delivered date cannot feed that top-up back into its source report.
function deliveryFromReportBeingChecked(d,reportDate){
  return !!(d?.generatedFromSundaySuggestion&&d.sourceSundayDate&&String(d.sourceSundayDate)>=String(reportDate||""));
}
function appDeliveryQty(branch,startDate,endDate,productId){
  if(!productId) return null;
  return db.deliveries
    .map(businessDeliverySource).filter(d=>d&&!deliveryFromReportBeingChecked(d,endDate)&&d.branch===branch && !!d.deliveredAt && d.date && d.date>startDate && d.date<=endDate)
    .reduce((sum,d)=>sum+(d.lines||[])
      .filter(l=>l.productId===productId)
      .reduce((a,l)=>a+(Number(l.qty)||0),0),0);
}

function previousRowForProduct(report,currentName,currentProduct){
  if(!report) return null;
  const exact=(report.rows||[]).find(r=>normalizeProductKey(r.product)===normalizeProductKey(currentName));
  if(exact) return exact;
  if(currentProduct){
    const byCanonical=(report.rows||[]).find(r=>{
      const m=canonicalProductMatchRow(r);
      return m.product && m.product.id===currentProduct.id;
    });
    if(byCanonical) return byCanonical;
  }
  return rowByProductName(report,currentName);
}

function reconcileExcelReport(rep){
  const previous=getPreviousSundayReport(rep.branch,rep.date,rep.id||null);
  const nearestEarlier=getNearestEarlierSundayReport(rep.branch,rep.date,rep.id||null);
  const previousGap=nearestEarlier?daysBetween(nearestEarlier.date,rep.date):null;
  const periodStart=previous?.date || rep.oldDate || null;
  let verified=0, stockErrorRows=0, deliveryIssueRows=0, historyPendingRows=0, mappingRows=0;
  const details=[];
  const flowRows=[];

  rep.rows.forEach(rr=>{
    const pm=canonicalProductMatchRow(rr);
    const p=pm.product;
    const prev=previousRowForProduct(previous,rr.product,p);
    const rowIssues=[];
    let rowVerified=true;
    let rowHasStockError=false, rowHasDeliveryIssue=false, rowHasHistoryPending=false, rowHasMapping=false;

    // Workbook self arithmetic.
    const old=rr.oldStock||0, del=rr.newDeliver||0, take=rr.takeOut||0;
    const expectedTotal=old+del-take;
    if(rr.total!=null && Math.abs(expectedTotal-rr.total)>0.001){
      rowIssues.push({type:"bad",msg:`Workbook total mismatch: ${old} + ${del} − ${take} = ${expectedTotal}, sheet says ${rr.total}.`});
      rowVerified=false; rowHasStockError=true;
    }
    if(rr.inStock!=null && rr.sold!=null && Math.abs((expectedTotal-rr.inStock)-rr.sold)>0.001){
      rowIssues.push({type:"bad",msg:`Workbook sold mismatch: calculated ${expectedTotal-rr.inStock}, sheet says ${rr.sold}.`});
      rowVerified=false; rowHasStockError=true;
    }

    // Previous Sunday closing -> this Sunday opening.
    // In the shop Excel sheets, a blank stock quantity in an existing product row means zero.
    // Treat it as zero only when the product row itself exists; an absent product row remains unknown.
    if(previous){
      if(prev){
        const prevCloseForOpening=Number(prev.inStock ?? 0);
        const currentOpeningForCheck=Number(rr.oldStock ?? 0);
        if(Math.abs(prevCloseForOpening-currentOpeningForCheck)>0.001){
          rowIssues.push({type:"bad",msg:`Opening stock differs from previous Sunday: previous closing ${prevCloseForOpening}, this sheet opening ${currentOpeningForCheck}.`});
          rowVerified=false; rowHasStockError=true;
        }
      }else if(Math.abs(Number(rr.oldStock ?? 0))<0.001){
        // A genuinely new product line opening at zero is valid.
      }else{
        rowIssues.push({type:"unknown",msg:"This product is not on the previous Sunday report and its opening stock is not zero. Review its product mapping/history."});
        rowVerified=false; rowHasHistoryPending=true;
      }
    }else{
      rowIssues.push({type:"unknown",msg: nearestEarlier && previousGap>9 ? `Earlier report exists (${nearestEarlier.date}) but there is a ${previousGap}-day gap, so it is not valid for week-to-week reconciliation.` : "Baseline report — no earlier imported Sunday report exists yet."});
      rowVerified=false; rowHasHistoryPending=true;
    }

    // Shop deliveries -> Yaowaret's independently recorded delivery dockets.
    let appQty=null;
    const shopQty=Number(rr.newDeliver)||0;
    if(previous && p){
      appQty=appDeliveryQty(rep.branch,previous.date,rep.date,p.id);
      if(appQty!==shopQty){
        rowIssues.push({
          type:"data",
          msg:`Delivery records differ: shop sheet ${shopQty}, saved delivery dockets ${appQty}. Difference ${shopQty-appQty>0?"+":""}${shopQty-appQty}.`
        });
        rowVerified=false; rowHasDeliveryIssue=true;
      }
    }else if(!p){
      rowIssues.push({type:"warn",msg:`Product name needs catalogue mapping review${pm.score?` (match score ${Math.round(pm.score*100)}%)`:""}.`});
      rowVerified=false; rowHasMapping=true;
    }

    const previousClose=prev?Number(prev.inStock ?? 0):(previous && Math.abs(Number(rr.oldStock ?? 0))<0.001 ? 0 : null);
    const sheetOpening=previous?Number(rr.oldStock ?? 0):(rr.oldStock!=null?Number(rr.oldStock):null);
    const sheetClosing=Number(rr.inStock ?? 0);
    const sheetSold=Number(rr.sold ?? 0);
    const takeOut=Number(rr.takeOut)||0;
    const openingDifference=(previousClose!=null&&sheetOpening!=null)?sheetOpening-previousClose:null;
    const deliveryDifference=(appQty!=null)?shopQty-appQty:null;
    const expectedClosing=(previousClose!=null&&appQty!=null&&sheetSold!=null)?previousClose+appQty-takeOut-sheetSold:null;
    const closingDifference=(expectedClosing!=null&&sheetClosing!=null)?sheetClosing-expectedClosing:null;
    let flowStatus="unknown",flowLabel="History pending";
    if(!p){flowStatus="warn";flowLabel="Mapping review";}
    else if(previousClose!=null&&appQty!=null){
      if(Math.abs(openingDifference||0)<0.001 && Math.abs(deliveryDifference||0)<0.001 && Math.abs(closingDifference||0)<0.001 && !rowHasStockError){flowStatus="ok";flowLabel="Reconciles";}
      else{flowStatus=(rowHasStockError?"bad":"data");flowLabel="Check difference";}
    }
    flowRows.push({
      product:p?.name||rr.product, previousClose,sheetOpening,ledgerDeliveries:appQty,shopDeliveries:shopQty,
      sheetClosing,sheetSold,takeOut,expectedClosing,openingDifference,deliveryDifference,closingDifference,
      status:flowStatus,label:flowLabel
    });

    if(rowVerified) verified++;
    if(rowHasStockError) stockErrorRows++;
    if(rowHasDeliveryIssue) deliveryIssueRows++;
    if(rowHasHistoryPending) historyPendingRows++;
    if(rowHasMapping) mappingRows++;
    if(rowIssues.length) details.push({
      product:rr.product,
      inStock:rr.inStock,
      sold:rr.sold,
      delivered:rr.newDeliver,
      sellPrice:rr.sellPrice,
      issues:rowIssues,
      flags:{rowHasStockError,rowHasDeliveryIssue,rowHasHistoryPending,rowHasMapping},
      flow:flowRows[flowRows.length-1]
    });
  });

  const status = stockErrorRows>0 ? "bad" : deliveryIssueRows>0 ? "data" : (historyPendingRows>0 || mappingRows>0) ? "unknown" : "ok";
  return {
    branch:rep.branch,date:rep.date,previousDate:previous?.date||null,
    verified,stockErrorRows,deliveryIssueRows,historyPendingRows,mappingRows,
    totalRows:rep.rows.length,status,details,flowRows
  };
}

function reconStatusLabel(r){
  if(r.status==="ok") return ["ok","Fully reconciled"];
  if(r.status==="bad") return ["bad","Arithmetic / stock error"];
  if(r.status==="data") return ["data","Delivery data check"];
  if(r.previousDate && r.mappingRows>0) return ["unknown","Mapping review"];
  if(r.previousDate) return ["unknown","Incomplete product history"];
  return ["unknown","Baseline / incomplete history"];
}


function summarizeUniqueMappingNames(reports){
  const map=new Map();
  (reports||[]).forEach(r=>{
    (r.details||[]).forEach(d=>{
      if(!d.flags?.rowHasMapping) return;
      const key=normalizeProductKey(d.product);
      if(!map.has(key)) map.set(key,{name:d.product,reports:[]});
      map.get(key).reports.push(`${r.branch} ${r.date}`);
    });
  });
  return [...map.values()];
}

function fmtSigned(n){
  if(n==null || Number.isNaN(Number(n))) return "—";
  const v=Number(n);
  return `${v>0?"+":""}${v}`;
}
function stockFlowHtml(r){
  const rows=r.flowRows||[];
  if(!rows.length) return "";
  const ordered=[...rows].sort((a,b)=>(a.status==="ok")-(b.status==="ok") || String(a.product||"").localeCompare(String(b.product||""),undefined,{sensitivity:"base"}));
  const need=rows.filter(x=>x.status!=="ok").length;
  const rowHtml=ordered.map(x=>{
    const diffs=[];
    if(x.openingDifference!=null&&Math.abs(x.openingDifference)>0.001) diffs.push(`Opening difference ${fmtSigned(x.openingDifference)}`);
    if(x.deliveryDifference!=null&&Math.abs(x.deliveryDifference)>0.001) diffs.push(`Delivery difference ${fmtSigned(x.deliveryDifference)}`);
    if(x.closingDifference!=null&&Math.abs(x.closingDifference)>0.001) diffs.push(`Closing difference ${fmtSigned(x.closingDifference)}`);
    if(!diffs.length&&x.status==="ok") diffs.push("Previous stock + saved deliveries − shop sold/take-out agrees with this Sunday closing stock.");
    if(x.status==="unknown") diffs.push("A contiguous previous Sunday report is required before this product can be reconciled.");
    if(x.status==="warn") diffs.push("Map this shop product name before delivery reconciliation can be completed.");
    const mini=`Prev ${x.previousClose??"—"} · Del ${x.ledgerDeliveries??"—"} · Close ${x.sheetClosing??"—"}`;
    return `<details class="stockFlowItem">
      <summary>
        <div class="stockFlowName">${escapeHtml(x.product)}</div>
        <div class="stockFlowMini">${escapeHtml(mini)}</div>
        <span class="reconStatus ${x.status}">${escapeHtml(x.label)}</span>
        <span class="stockFlowChevron">⌄</span>
      </summary>
      <div class="stockFlowDetail">
        <div class="stockFlowNumbers">
          <div class="stockFlowCell"><div class="k">Previous close</div><div class="v">${x.previousClose??"—"}</div></div>
          <div class="stockFlowCell"><div class="k">Saved deliveries</div><div class="v">${x.ledgerDeliveries??"—"}</div></div>
          <div class="stockFlowCell"><div class="k">Sunday close</div><div class="v">${x.sheetClosing??"—"}</div></div>
          <div class="stockFlowCell"><div class="k">Difference</div><div class="v">${x.closingDifference==null?"—":fmtSigned(x.closingDifference)}</div></div>
        </div>
        <div class="stockFlowDiff">Shop opening ${x.sheetOpening??"—"} • Shop delivery ${x.shopDeliveries??"—"} • Shop sold ${x.sheetSold??"—"}${x.takeOut?` • Take-out ${x.takeOut}`:""}${diffs.length?`<br>${diffs.map(escapeHtml).join(" • ")}`:""}</div>
      </div>
    </details>`;
  }).join("");
  return `<details class="stockFlowBlock">
    <summary><b>Stock flow check</b><span>${rows.length-need} OK • ${need} review</span><span class="chev">⌄</span></summary>
    <div class="stockFlowList">${rowHtml}</div>
  </details>`;
}

function renderExcelReconciliation(reports){
  const panel=document.getElementById("excelReconPanel");
  const summary=document.getElementById("excelReconSummary");
  const box=document.getElementById("excelReconReports");
  if(!reports?.length){
    panel.style.display="none"; summary.innerHTML=""; box.innerHTML=""; return;
  }
  panel.style.display="block";

  const totals=reports.reduce((a,r)=>{
    a.rows+=r.totalRows||0;
    a.verified+=r.verified||0;
    a.errors+=r.stockErrorRows||0;
    a.delivery+=r.deliveryIssueRows||0;
    a.history+=r.historyPendingRows||0;
    a.mapping+=r.mappingRows||0;
    return a;
  },{rows:0,verified:0,errors:0,delivery:0,history:0,mapping:0});

  summary.innerHTML=[
    ["Rows checked",totals.rows],
    ["Verified",totals.verified],
    ["Stock errors",totals.errors],
    ["Delivery checks",totals.delivery],
    ["History pending",totals.history],
    ["Mapping",totals.mapping]
  ].map(x=>`<div class="card metric reconMetric"><div class="k">${x[0]}</div><div class="v">${x[1]}</div></div>`).join("");

  const uniqueMappings=summarizeUniqueMappingNames(reports);
  const mappingBlock=uniqueMappings.length ? `
    <details class="reconGroup mappingGroup">
      <summary><b>Mapping review</b><span>${uniqueMappings.length} unique product name${uniqueMappings.length===1?"":"s"}</span><span class="chev">⌄</span></summary>
      <div class="reconGroupBody">
        ${uniqueMappings.map(m=>`<div class="mappingItem"><b>${m.name}</b><div class="small">${[...new Set(m.reports)].join(" • ")}</div></div>`).join("")}
      </div>
    </details>` : "";

  box.innerHTML=mappingBlock + reports.map(r=>{
    const [cls,label]=reconStatusLabel(r);
    const serious=(r.details||[]).filter(d=>d.flags?.rowHasStockError||d.flags?.rowHasDeliveryIssue);
    const mapping=(r.details||[]).filter(d=>d.flags?.rowHasMapping);
    const history=(r.details||[]).filter(d=>d.flags?.rowHasHistoryPending);

    const seriousBlock=serious.length?`
      <details class="reconGroup" open>
        <summary><b>Needs attention</b><span>${serious.length}</span><span class="chev">⌄</span></summary>
        <div class="reconGroupBody">${serious.map(d=>{
          const primary=d.flags?.rowHasStockError?["bad","Stock error"]:["data","Delivery check"];
          return `<details class="productRecon">
            <summary>
              <div class="productReconMain">
                <div class="productReconName">${d.product}</div>
                <div class="productReconMini">${[
                  d.inStock!=null?`Stock ${d.inStock}`:null,
                  d.sold!=null?`Sold ${d.sold}`:null,
                  d.delivered!=null?`Delivered ${d.delivered}`:null
                ].filter(Boolean).join(" • ")}</div>
              </div>
              <span class="reconStatus ${primary[0]}">${primary[1]}</span><span class="chev">⌄</span>
            </summary>
            <div class="productReconBody">${d.issues.map(i=>`<div class="reconLine"><div class="small">${i.msg}</div><span class="reconStatus ${i.type}">${i.type==="data"?"Delivery":i.type==="bad"?"Error":i.type==="warn"?"Mapping":"Info"}</span></div>`).join("")}</div>
          </details>`;
        }).join("")}</div>
      </details>`:"";

    const mapBlock=mapping.length?`
      <details class="reconGroup">
        <summary><b>Mapping review</b><span>${mapping.length}</span><span class="chev">⌄</span></summary>
        <div class="reconGroupBody">${mapping.map(d=>`<div class="mappingItem"><b>${d.product}</b><div class="small">${d.issues.filter(i=>i.type==="warn").map(i=>i.msg).join(" ")}</div></div>`).join("")}</div>
      </details>`:"";

    const histBlock=history.length?`
      <details class="reconGroup historyGroup">
        <summary><b>History pending</b><span>${history.length} product${history.length===1?"":"s"}</span><span class="chev">⌄</span></summary>
        <div class="reconGroupBody compactNames">${history.map(d=>`<span>${d.product}</span>`).join("")}</div>
      </details>`:"";

    return `<details class="reconReport compactReconReport">
      <summary class="reconReportHead">
        <div><b>${r.branch} · ${r.date}</b><div class="small">${r.previousDate?`Previous Sunday: ${r.previousDate}`:"Baseline / incomplete history"}</div></div>
        <span class="reconStatus ${cls}">${label}</span><span class="chev">⌄</span>
      </summary>
      <div class="reconIssues">
        ${stockFlowHtml(r)}
        ${seriousBlock}${mapBlock}${histBlock}
        ${!serious.length&&!mapping.length&&!history.length?`<div class="notice" style="margin:10px 0"><b>Fully reconciled.</b> No issues found.</div>`:""}
      </div>
    </details>`;
  }).join("");
}


function escapeHtml(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function escapeHtmlAttr(s){return String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function collectShopProductNames(){
 ensureSundayArchive();ensureProductAliases();
 const seen=new Map();
 db.sundayImports.forEach(r=>(r.rows||[]).forEach(rr=>{
   const name=String(rr.product||"").trim();if(!name)return;
   const key=normalizeProductKey(name);
   if(!seen.has(key))seen.set(key,{key,sourceName:name,examples:[]});
   const it=seen.get(key);it.examples.push(`${r.branch} ${r.date}`);
 }));
 return [...seen.values()].sort((a,b)=>a.sourceName.localeCompare(b.sourceName));
}
function currentMasterNameForSource(sourceName){
 ensureProductAliases();const key=normalizeProductKey(sourceName),aid=db.productAliases[key];
 const aliased=aid?db.products.find(p=>p.id===aid):null;if(aliased)return aliased.name;
 const exact=db.products.find(p=>normalizeProductKey(p.name)===key);return exact?.name||sourceName;
}
let recentlySavedMasterKeys=new Set();
function masterTargetForSource(sourceName){
 ensureProductAliases();const key=normalizeProductKey(sourceName),aid=db.productAliases[key];
 const aliased=aid?db.products.find(p=>p.id===aid):null;if(aliased)return aliased;
 return db.products.find(p=>normalizeProductKey(p.name)===key)||null;
}
function collectMasterDisplayGroups(){
 const items=collectShopProductNames();
 if(!db.masterCatalogueConfirmedAt)return items.map(it=>({groupKey:it.key,productId:masterTargetForSource(it.sourceName)?.id||"",masterName:currentMasterNameForSource(it.sourceName),sources:[it.sourceName],examples:it.examples,sourceKeys:[it.key]}));
 const groups=new Map();
 items.forEach(it=>{
   const target=masterTargetForSource(it.sourceName),masterName=target?.name||currentMasterNameForSource(it.sourceName),gk=target?.id||`name:${normalizeProductKey(masterName)}`;
   if(!groups.has(gk))groups.set(gk,{groupKey:gk,productId:target?.id||"",masterName,sources:[],examples:[],sourceKeys:[]});
   const g=groups.get(gk);g.sources.push(it.sourceName);g.examples.push(...it.examples);g.sourceKeys.push(it.key);
 });
 return [...groups.values()].sort((a,b)=>a.masterName.localeCompare(b.masterName));
}
function renderMasterProductSetup(resetFields=false){
 const box=document.getElementById("masterProductSetup"),status=document.getElementById("masterSetupStatus");if(!box||!status)return;
 const rawItems=collectShopProductNames();
 if(!rawItems.length){status.textContent="Import the shop Excel files first. The complete one-time setup list will appear here.";box.innerHTML="";return}
 const groups=collectMasterDisplayGroups();
 const confirmed=db.masterCatalogueConfirmedAt?` <span class="reconStatus ok">Master list saved</span>`:"";
 status.innerHTML=`<b>${rawItems.length} unique shop product names found.</b>${confirmed} ${db.masterCatalogueConfirmedAt?`Now showing Pin's saved master names. Shop spellings are retained underneath as aliases.`:`Review each once. Unchanged names are still explicitly confirmed as Pin's master names when you save.`}`;
 const prior={};if(!resetFields)document.querySelectorAll(".masterSetupRow").forEach(r=>{prior[r.dataset.groupKey]=r.querySelector(".masterNameInput")?.value||""});
 box.innerHTML=`<div class="masterSetupHead"><b>${db.masterCatalogueConfirmedAt?"Pin's saved master product":"Shop spreadsheet name"}</b><b>Pin's correct product name</b></div>`+groups.map(g=>{
   const value=prior[g.groupKey]||g.masterName;
   const changed=g.sourceKeys.some(k=>recentlySavedMasterKeys.has(k));
   const aliases=[...new Set(g.sources)].filter(x=>normalizeProductKey(x)!==normalizeProductKey(g.masterName));
   const noisySources=[...new Set(g.sources)].filter(hasWhitespaceNoise);
   const sourceText=db.masterCatalogueConfirmedAt?(aliases.length?`Received as: ${aliases.join(" • ")}`:`Shop name matches master name`):[...new Set(g.examples)].join(" • ");
   const whitespaceNote=noisySources.length?`<div class="small" style="color:#92400e;font-weight:700">Whitespace cleaned automatically from shop text.</div>`:"";
   const dates=db.masterCatalogueConfirmedAt?[...new Set(g.examples)].join(" • "):"";
   return `<div class="masterSetupRow ${changed?"savedChange":""}" data-group-key="${escapeHtmlAttr(g.groupKey)}" data-product-id="${escapeHtmlAttr(g.productId)}" data-sources="${escapeHtmlAttr(JSON.stringify(g.sources))}"><div><b>${escapeHtmlAttr(g.masterName)}</b><div class="masterAliasLine">${escapeHtmlAttr(sourceText)}</div>${whitespaceNote}${dates?`<div class="small">${escapeHtmlAttr(dates)}</div>`:""}${changed?`<span class="savedBadge">✓ Saved just now</span>`:""}</div><input class="masterNameInput" value="${escapeHtmlAttr(value)}" autocomplete="off"></div>`;
 }).join("");
 filterMasterProductSetup();
}
function filterMasterProductSetup(){
 const q=norm(document.getElementById("masterProductSearch")?.value||"");
 document.querySelectorAll(".masterSetupRow").forEach(r=>{const txt=norm(`${r.textContent||""} ${r.querySelector(".masterNameInput")?.value||""}`);r.hidden=!!q&&!txt.includes(q)});
}
function reassignProductReferences(fromId,toId){
 if(!fromId||!toId||fromId===toId)return;
 db.deliveries.forEach(d=>(d.lines||[]).forEach(l=>{if(l.productId===fromId)l.productId=toId}));
 db.weeks.forEach(w=>(w.rows||[]).forEach(r=>{if(r.productId===fromId)r.productId=toId}));
 Object.values(db.stock||{}).forEach(st=>{if(st&&Object.prototype.hasOwnProperty.call(st,fromId)){st[toId]=(Number(st[toId])||0)+(Number(st[fromId])||0);delete st[fromId]}});
 Object.keys(db.productAliases||{}).forEach(k=>{if(db.productAliases[k]===fromId)db.productAliases[k]=toId});
 db.sundayImports.forEach(r=>(r.rows||[]).forEach(rr=>{if(rr.productId===fromId)rr.productId=toId}));
 Object.values(db.branchProductAssignments||{}).forEach(assignments=>{
   if(!assignments||!Object.prototype.hasOwnProperty.call(assignments,fromId))return;
   if(!Object.prototype.hasOwnProperty.call(assignments,toId))assignments[toId]=!!assignments[fromId];
   delete assignments[fromId];
 });
}
function createMasterProduct(name,sourceName){
 const srcMatch=db.products.find(p=>normalizeProductKey(p.name)===normalizeProductKey(sourceName));
 const ref=srcMatch||canonicalProductMatch(sourceName).product;
 const id="P"+Date.now()+Math.random().toString(36).slice(2,7);
 const p={id,name,type:ref?.type||"kanja",cost:Number(ref?.cost)||0,retail:Number(ref?.retail)||0,branches:ref?.branches||["BM Bangrak","Lamai"]};
 db.products.push(p);return p;
}
function applyMasterProductSetup(){
 const rows=[...document.querySelectorAll(".masterSetupRow")];if(!rows.length)return alert("Import the shop Excel files first.");
 const entries=[];
 rows.forEach(r=>{
   let sources=[];try{sources=JSON.parse(r.dataset.sources||"[]")}catch{}
   const desired=cleanProductDisplayName(r.querySelector(".masterNameInput")?.value||""),currentProductId=r.dataset.productId||"";
   if(r.querySelector(".masterNameInput"))r.querySelector(".masterNameInput").value=desired;
   sources.forEach(sourceName=>entries.push({sourceName,desired,currentProductId,groupKey:r.dataset.groupKey||""}));
 });
 if(entries.some(x=>!x.desired))return alert("Every Pin product name must contain a name. Please fill the blank field(s).");
 const changedGroupKeys=new Set();
 rows.forEach(r=>{
   const desired=cleanProductDisplayName(r.querySelector(".masterNameInput")?.value||"");
   const currentProductId=r.dataset.productId||"";
   const current=db.products.find(p=>p.id===currentProductId)?.name || r.querySelector("div > b")?.textContent || "";
   if(desired!==cleanProductDisplayName(current))changedGroupKeys.add(r.dataset.groupKey||desired);
 });
 const changedKeys=entries.filter(e=>changedGroupKeys.has(e.groupKey)).map(e=>normalizeProductKey(e.sourceName));
 const desiredGroups=new Map();entries.forEach(e=>{const k=normalizeProductKey(e.desired);if(!desiredGroups.has(k))desiredGroups.set(k,[]);desiredGroups.get(k).push(e)});
 ensureProductAliases();
 desiredGroups.forEach((group,desiredKey)=>{
   const desiredName=cleanProductDisplayName(group[0].desired);
   let target=db.products.find(p=>normalizeProductKey(p.name)===desiredKey);
   if(!target){
     const currentIds=[...new Set(group.map(e=>e.currentProductId).filter(Boolean))];
     if(currentIds.length===1){target=db.products.find(p=>p.id===currentIds[0])||null;if(target){const old=target.name;target.name=desiredName;db.productAliases[normalizeProductKey(old)]=target.id}}
   }
   if(!target){
     const firstExact=db.products.find(p=>normalizeProductKey(p.name)===normalizeProductKey(group[0].sourceName));
     if(firstExact){target=firstExact;const old=target.name;target.name=desiredName;db.productAliases[normalizeProductKey(old)]=target.id}
     else target=createMasterProduct(desiredName,group[0].sourceName);
   }
   // Pin's typed spelling/capitalisation/punctuation is authoritative, even when
   // the normalized lookup key is unchanged (for example "1 g." -> "1g").
   if(target&&cleanProductDisplayName(target.name)!==cleanProductDisplayName(desiredName)){
     const oldMasterName=target.name;
     if(oldMasterName)db.productAliases[normalizeProductKey(oldMasterName)]=target.id;
     target.name=desiredName;
   }
   const currentIds=[...new Set(group.map(e=>e.currentProductId).filter(Boolean))];
   currentIds.forEach(pid=>{if(pid!==target.id){reassignProductReferences(pid,target.id);db.products=db.products.filter(p=>p.id!==pid)}});
   group.forEach(e=>{
     const sourceKey=normalizeProductKey(e.sourceName);
     const sourceProduct=db.products.find(p=>p.id!==target.id&&normalizeProductKey(p.name)===sourceKey);
     if(sourceProduct){reassignProductReferences(sourceProduct.id,target.id);db.products=db.products.filter(p=>p.id!==sourceProduct.id)}
     db.productAliases[sourceKey]=target.id;
     delete db.deferredMappings?.[sourceKey];
   });
 });
 db.masterCatalogueConfirmedAt=new Date().toISOString();
 recentlySavedMasterKeys=new Set(changedKeys);
 retroactivelyRemapAllImports(false);save();renderAll();renderMappingReview();renderMappingManager();
 const count=changedGroupKeys.size;
 alert(count?`${count} corrected product name${count===1?"":"s"} saved. The green rows show the changes just applied.`:"Pin's master product list has been saved. No product names changed this time.");
}

function renderCatalogueIntegrity(){
 const box=document.getElementById("catalogueIntegrity");if(!box)return;
 ensureSundayArchive();
 renderBranchCatalogueSelfCheck();
 const branches=["BM Bangrak","Lamai"];
 const html=branches.map(branch=>{
   const reports=(db.sundayImports||[]).filter(r=>canonicalBranchKey(r.branch)===branch).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
   if(!reports.length)return `<div class="integrityCard"><b>${branch}</b><div class="small" style="margin-top:5px">No Sunday reports imported yet.</div></div>`;
   const latest=reports.at(-1);
   const c=branchReportComparison(latest);
   const issueCount=c.missing.length+c.newOrReturned.length+c.outsideCurrentList.length+c.unknownNames.length;
   const cls=issueCount?"integrityCard warn":"integrityCard";
   const status=!c.contiguous?`<span class="status">Baseline</span>`:issueCount?`<span class="status warn">Review ${issueCount}</span>`:`<span class="status ok">Aligned</span>`;
   const detail=[];
   if(!c.contiguous)detail.push(`<b>Continuity baseline:</b> no immediately prior Sunday report is available, so no missing/new judgment was made.`);
   if(c.missing.length)detail.push(`<b>Missing since previous Sunday:</b> ${catalogueNamesHtml(c.missing)}`);
   if(c.newOrReturned.length)detail.push(`<b>New or returned this week:</b> ${catalogueNamesHtml(c.newOrReturned)}`);
   if(c.outsideCurrentList.length)detail.push(`<b>On sheet but outside current branch delivery list:</b> ${catalogueNamesHtml(c.outsideCurrentList)}`);
   if(c.unknownNames.length)detail.push(`<b>Unmapped/new spreadsheet names:</b> ${catalogueNamesHtml(c.unknownNames)}`);
   return `<div class="${cls}"><div class="integrityTop"><div><b>${escapeHtml(displayBranchName(branch))}</b><div class="small">Latest: ${escapeHtml(latest.date||"—")}${c.contiguous?` • Previous: ${escapeHtml(c.previousDate)}`:""}</div></div>${status}</div><div class="integrityNums"><span><b>${c.currentCount}</b><br><span class="small">on latest</span></span><span><b>${c.missing.length}</b><br><span class="small">missing</span></span><span><b>${c.newOrReturned.length}</b><br><span class="small">new / returned</span></span><span><b>${c.outsideCurrentList.length}</b><br><span class="small">outside list</span></span></div>${detail.length?`<div class="integrityMissing">${detail.join("<br>")}</div>`:""}</div>`;
 }).join("");
 box.innerHTML=html;
}

let branchAssignmentDirty=false;
let branchAssignmentRenderedBranch="BM Bangrak";
function latestSundayForBranch(branch){
  const key=canonicalBranchKey(branch);
  return (db.sundayImports||[]).filter(r=>canonicalBranchKey(r.branch)===key).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0]||null;
}
function renderBranchAssignmentSummary(){
  const box=document.getElementById("branchAssignmentSummary");if(!box)return;
  const checks=[...document.querySelectorAll("#branchAssignmentList input[type=checkbox]")];
  const assigned=checks.filter(x=>x.checked).length;
  const latest=checks.filter(x=>x.dataset.latest==="1").length;
  const outside=checks.filter(x=>x.dataset.latest==="1"&&!x.checked).length;
  box.innerHTML=`<span>${assigned} assigned</span><span>${latest} on latest Sunday</span><span class="${outside?"warn":""}">${outside} latest not assigned</span>${branchAssignmentDirty?`<span class="warn">Unsaved changes</span>`:""}`;
}
function filterBranchAssignmentList(){
  const q=norm(document.getElementById("branchAssignmentSearch")?.value||"");
  document.querySelectorAll(".branchAssignRow").forEach(row=>{row.hidden=!!q&&!norm(row.dataset.search||"").includes(q)});
}
function renderBranchProductAssignments(){
  const list=document.getElementById("branchAssignmentList"),select=document.getElementById("branchAssignmentBranch");if(!list||!select)return;
  const selfCheck=document.getElementById("branchAssignmentSelfCheck");
  const checkOk=canonicalBranchKey("The Grocery by BM")==="BM Bangrak"&&canonicalBranchKey("BM Lamai")==="Lamai"&&defaultProductAssignedToBranch({name:"Colombiana 5g"},"Lamai")===false&&defaultProductAssignedToBranch({name:"Super Boof"},"Lamai")===true;
  if(selfCheck){selfCheck.className=`catalogueSelfCheck${checkOk?"":" bad"}`;selfCheck.textContent=checkOk?"✓ Branch-list self-check passed — shop names and default product rules resolve correctly.":"Branch-list self-check failed — do not save branch assignments in this build.";}
  const branch=canonicalBranchKey(select.value||branchAssignmentRenderedBranch||"BM Bangrak");
  select.value=branch;branchAssignmentRenderedBranch=branch;branchAssignmentDirty=false;
  const latest=latestSundayForBranch(branch),latestIdentity=latest?reportCatalogueIdentity(latest):{ids:[]};
  const latestIds=new Set(latestIdentity.ids.map(canonicalProductId));
  const products=canonicalDeliveryProducts().sort((a,b)=>{
    const al=latestIds.has(canonicalProductId(a))?0:1,bl=latestIds.has(canonicalProductId(b))?0:1;
    return al-bl||a.name.localeCompare(b.name,"en",{sensitivity:"base",numeric:true});
  });
  list.innerHTML=products.map(p=>{
    const id=canonicalProductId(p),onLatest=latestIds.has(id),assigned=productAssignedToBranch(p,branch);
    const badge=onLatest?`<span class="branchAssignBadge ${assigned?"":"out"}">${assigned?"Latest Sunday":"Needs review"}</span>`:"";
    return `<label class="branchAssignRow ${onLatest&&!assigned?"latestOutside":""}" data-search="${escapeHtmlAttr(p.name)}"><input type="checkbox" data-product-id="${escapeHtmlAttr(id)}" data-latest="${onLatest?"1":"0"}" ${assigned?"checked":""}><span><span class="branchAssignName">${escapeHtml(p.name)}</span><span class="branchAssignMeta">${escapeHtml(productVariantLabel(p)||p.type||"Product")}</span></span>${badge}</label>`;
  }).join("")||`<div class="small" style="padding:12px">No active products.</div>`;
  list.querySelectorAll("input[type=checkbox]").forEach(input=>input.addEventListener("change",()=>{
    branchAssignmentDirty=true;
    input.closest(".branchAssignRow")?.classList.toggle("latestOutside",input.dataset.latest==="1"&&!input.checked);
    const badge=input.closest(".branchAssignRow")?.querySelector(".branchAssignBadge");
    if(badge){badge.textContent=input.checked?"Latest Sunday":"Needs review";badge.classList.toggle("out",!input.checked)}
    renderBranchAssignmentSummary();
  }));
  renderBranchAssignmentSummary();filterBranchAssignmentList();
}
window.tickLatestSundayProducts=()=>{
  let changed=0;
  document.querySelectorAll('#branchAssignmentList input[data-latest="1"]').forEach(input=>{if(!input.checked){input.checked=true;input.dispatchEvent(new Event("change"));changed++}});
  if(!changed)alert("Every product on the latest Sunday report is already ticked for this shop.");
};
window.saveBranchProductAssignments=()=>{
  const branch=canonicalBranchKey(document.getElementById("branchAssignmentBranch")?.value||"BM Bangrak");
  const checks=[...document.querySelectorAll("#branchAssignmentList input[type=checkbox]")];
  const changes=checks.filter(input=>{
    const p=(db.products||[]).find(x=>canonicalProductId(x)===input.dataset.productId);
    return p&&productAssignedToBranch(p,branch)!==input.checked;
  }).length;
  if(!changes)return alert("No branch-list changes to save.");
  const assigned=checks.filter(x=>x.checked).length;
  if(!confirm(`Save ${displayBranchName(branch)} product list?\n\n${assigned} products will be available for new deliveries.\n${changes} assignment${changes===1?"":"s"} changed.\n\nExisting dockets, reports, stock history and invoices will not be altered.`))return;
  if(!db.branchProductAssignments||typeof db.branchProductAssignments!=="object")db.branchProductAssignments={};
  db.branchProductAssignments[branch]={};
  checks.forEach(input=>db.branchProductAssignments[branch][input.dataset.productId]=!!input.checked);
  branchAssignmentDirty=false;save();
  alert(`${displayBranchName(branch)} product list saved. ${assigned} products are available for future deliveries.`);
};

let sundayImportAutoAdvance=false;
function currentActiveSundayReconciliations(){
  const date=db.activeSundayCycleDate||null;
  if(!date)return [];
  ensureSundayArchive();
  return (db.sundayImports||[]).filter(r=>r.date===date).map(r=>reconcileExcelReport(r));
}
function refreshCurrentSundayImportReconciliation(){
  const reports=currentActiveSundayReconciliations();
  if(reports.length)renderExcelReconciliation(reports);
}
function scrollSundayImportToNextStep(){
  if(!sundayImportAutoAdvance)return;
  renderMappingReview();
  refreshCurrentSundayImportReconciliation();
  const pending=collectUnmappedProductNames();
  const target=pending.length?document.getElementById("mappingReviewPanel"):document.getElementById("excelReconPanel");
  if(pending.length){
    const n=document.getElementById("mappingActionNotice");
    if(n&&!String(n.textContent||"").trim())setMappingActionNotice(`Import complete — next, review ${pending.length} new or changed product name${pending.length===1?"":"s"}.`,"defer");
  }
  setTimeout(()=>target?.scrollIntoView({block:"start",behavior:"smooth"}),180);
}
function continueSundayImportAfterMapping(){
  if(!sundayImportAutoAdvance)return;
  refreshCurrentSundayImportReconciliation();
  const pending=collectUnmappedProductNames();
  if(pending.length){
    setTimeout(()=>document.querySelector(".mappingReviewItem")?.scrollIntoView({block:"center",behavior:"smooth"}),160);
    return;
  }
  sundayImportAutoAdvance=false;
  const n=document.getElementById("mappingActionNotice");
  if(n){n.textContent="Mapping complete — continuing to stock reconciliation.";n.className="mappingActionNotice ok";}
  setTimeout(()=>document.getElementById("excelReconPanel")?.scrollIntoView({block:"start",behavior:"smooth"}),650);
}

function collectUnmappedProductNames(){
 const seen=new Map();ensureSundayArchive();
 db.sundayImports.forEach(r=>(r.rows||[]).forEach(rr=>{const pm=canonicalProductMatchRow(rr);if(pm.product)return;const key=normalizeProductKey(rr.product);if(db.deferredMappings?.[key])return;if(!seen.has(key))seen.set(key,{key,name:rr.product,examples:[],best:null,bestScore:0});const it=seen.get(key);it.examples.push(`${r.branch} ${r.date}`);db.products.forEach(p=>{const s=similarity(key,normalizeProductKey(p.name));if(s>it.bestScore){it.bestScore=s;it.best=p}})}));
 return [...seen.values()].sort((a,b)=>b.bestScore-a.bestScore);
}
function setMappingActionNotice(message,type="ok"){
 const n=document.getElementById("mappingActionNotice");
 if(!n)return;
 n.textContent=message||"";
 n.className=`mappingActionNotice ${message?(type||"ok"):""}`.trim();
}
function renderMappingReview(){
 const panel=document.getElementById("mappingReviewPanel"),box=document.getElementById("mappingReviewList"),notice=document.getElementById("mappingActionNotice");if(!panel||!box)return;
 const items=collectUnmappedProductNames();
 const hasNotice=!!String(notice?.textContent||"").trim();
 if(!items.length){
   if(!hasNotice){panel.style.display="none";box.innerHTML="";return}
   panel.style.display="block";
   box.innerHTML='<div class="small" style="margin-top:9px"><b>No new or changed product names are waiting for mapping.</b></div>';
   return;
 }
 panel.style.display="block";
 box.innerHTML=`<div class="small" style="margin:8px 0"><b>${items.length} new/changed name${items.length===1?"":"s"} to review</b></div>`+items.map(it=>`<div class="mappingReviewItem" data-mapkey="${it.key}"><b>${it.name}</b><div class="small">${[...new Set(it.examples)].join(" • ")}</div><div class="mappingSuggestion"><select class="mappingTarget">${db.products.map(p=>`<option value="${p.id}" ${it.best?.id===p.id?"selected":""}>${p.name}</option>`).join("")}</select><span class="reconStatus warn">${Math.round(it.bestScore*100)}% suggestion</span></div><div class="mappingActions"><button class="btn" onclick="confirmMapping('${it.key.replace(/'/g,"\\'")}')">Merge as same product</button><button class="btn alt" onclick="keepMappingSeparate('${it.key.replace(/'/g,"\\'")}')">Keep separate</button><button class="btn alt mappingLaterBtn" onclick="deferMapping('${it.key.replace(/'/g,"\\'")}')">Unsure — Check Later</button></div></div>`).join("");
}
window.confirmMapping=key=>{
 const row=[...document.querySelectorAll(".mappingReviewItem")].find(x=>x.dataset.mapkey===key),pid=row?.querySelector(".mappingTarget")?.value,name=row?.querySelector("b")?.textContent;if(!pid||!name)return;
 const p=db.products.find(x=>x.id===pid);if(!p)return;
 if(!confirm(`Merge "${name}" with "${p.name}"?\n\nThis will apply to previous and future imports.`))return;
 ensureProductAliases();db.productAliases[normalizeProductKey(name)]=pid;delete db.deferredMappings?.[normalizeProductKey(name)];
 const result=retroactivelyRemapAllImports(false);save();
 setMappingActionNotice(`Saved — “${name}” will always map to “${p.name}”. ${result.changed} historical row${result.changed===1?" was":"s were"} updated; ${result.linked} imported row${result.linked===1?" is":"s are"} now linked to catalogue products.`,"ok");
 renderMappingReview();renderMappingManager();renderAll();continueSundayImportAfterMapping();
};

window.deferMapping=key=>{
  ensureProductAliases();
  const row=[...document.querySelectorAll(".mappingReviewItem")].find(x=>x.dataset.mapkey===key);
  const name=row?.querySelector("b")?.textContent||key;
  db.deferredMappings[key]={name,deferredAt:new Date().toISOString()};
  save();
  setMappingActionNotice(`Saved for later — “${name}” has been removed from the active review list and can be reopened from Product mappings.`,"defer");
  renderMappingReview();
  renderMappingManager();
  continueSundayImportAfterMapping();
};
window.keepMappingSeparate=key=>{
 const row=[...document.querySelectorAll(".mappingReviewItem")].find(x=>x.dataset.mapkey===key),name=row?.querySelector("b")?.textContent;if(!name)return;
 const id="P"+Date.now()+Math.random().toString(36).slice(2,5);db.products.push({id,name,type:"flower",cost:0,retail:0,branches:["BM Bangrak","Lamai"]});
 ensureProductAliases();db.productAliases[normalizeProductKey(name)]=id;delete db.deferredMappings?.[normalizeProductKey(name)];
 const result=retroactivelyRemapAllImports(false);save();
 setMappingActionNotice(`Saved — “${name}” is now its own catalogue product. ${result.changed} historical row${result.changed===1?" was":"s were"} updated and this name will not be suggested as an alias again.`,"ok");
 renderMappingReview();renderMappingManager();renderCatalogue();continueSundayImportAfterMapping();
};
function retroactivelyRemapAllImports(doSave=true){
 ensureSundayArchive();let sundayChanged=0,weeklyChanged=0,sundayLinked=0,weeklyLinked=0;
 db.sundayImports.forEach(r=>(r.rows||[]).forEach(rr=>{const before=rr.productId||null,pm=canonicalProductMatchRow(rr),after=pm.product?.id||null;if(before!==after)sundayChanged++;rr.productId=after;if(after)sundayLinked++}));
 db.weeks.forEach(w=>{if(!/Excel/i.test(String(w.source||"")))return;(w.rows||[]).forEach(rr=>{const before=rr.productId||null,pm=canonicalProductMatch(rr.sourceProductName||"",{cost:rr.cost,retail:rr.sellPrice}),after=pm.product?.id||null;if(before!==after)weeklyChanged++;rr.productId=after;if(after)weeklyLinked++})});
 refreshStoredReconciliations(false);if(doSave)save();
 return {sundayChanged,weeklyChanged,changed:sundayChanged+weeklyChanged,sundayLinked,weeklyLinked,linked:sundayLinked+weeklyLinked};
}

window.reopenDeferredMapping=key=>{
  ensureProductAliases();
  const name=db.deferredMappings?.[key]?.name||key;
  delete db.deferredMappings[key];
  save();
  setMappingActionNotice(`Reopened — “${name}” is back in the active mapping review.`,"defer");
  renderMappingManager();
  renderMappingReview();
};

function mappingIntegrityStats(){
 ensureProductAliases();const sources=collectShopProductNames();let resolved=0,pending=0,deferred=0,sundayRows=0,sundayLinked=0,weeklyRows=0,weeklyLinked=0;
 sources.forEach(it=>{const matched=canonicalProductMatch(it.sourceName).product;if(matched)resolved++;else if(db.deferredMappings?.[it.key])deferred++;else pending++;});
 db.sundayImports.forEach(r=>(r.rows||[]).forEach(rr=>{sundayRows++;if(canonicalProductMatchRow(rr).product)sundayLinked++}));
 db.weeks.forEach(w=>{if(!/Excel/i.test(String(w.source||"")))return;(w.rows||[]).forEach(rr=>{weeklyRows++;if(canonicalProductMatch(rr.sourceProductName||"",{cost:rr.cost,retail:rr.sellPrice}).product)weeklyLinked++})});
 const aliases=Object.entries(db.productAliases||{}),brokenAliases=aliases.filter(([,pid])=>!db.products.some(p=>p.id===pid)).length;
 const accounted=resolved+pending+deferred,checkPassed=accounted===sources.length&&brokenAliases===0;
 return {sources:sources.length,resolved,pending,deferred,aliases:aliases.length,brokenAliases,sundayRows,sundayLinked,weeklyRows,weeklyLinked,linked:sundayLinked+weeklyLinked,totalRows:sundayRows+weeklyRows,checkPassed};
}

function renderMappingManager(){
  ensureProductAliases();
  const box=document.getElementById("mappingManager");
  if(!box)return;

  const aliases=Object.entries(db.productAliases||{});
  const deferred=Object.entries(db.deferredMappings||{});
  const health=mappingIntegrityStats();

  let out=`<div class="mappingHealthGrid"><div><span>Source names</span><b>${health.sources}</b></div><div><span>Resolved</span><b>${health.resolved}</b></div><div><span>New / changed</span><b>${health.pending}</b></div><div><span>Check later</span><b>${health.deferred}</b></div></div>`;
  const healthClass=!health.checkPassed?"bad":health.pending||health.deferred?"warn":"";
  const healthText=!health.checkPassed
   ?`⚠ Mapping integrity needs attention — ${health.brokenAliases} confirmed alias${health.brokenAliases===1?" points":"es point"} to a missing catalogue product.`
   :health.pending||health.deferred
     ?`Mapping check passed, with ${health.pending} new/changed name${health.pending===1?"":"s"} awaiting review and ${health.deferred} saved for later. ${health.linked} of ${health.totalRows} imported historical rows currently link to catalogue products.`
     :`✓ Mapping integrity check passed — every source name is resolved. ${health.linked} of ${health.totalRows} imported historical rows link to catalogue products.`;
  out+=`<div class="mappingHealthStatus ${healthClass}">${healthText}</div>`;
  if(aliases.length){
    out+=`<div class="small" style="margin-bottom:6px"><b>Confirmed aliases</b></div>`;
    out+=aliases.map(([k,pid])=>{
      const p=db.products.find(x=>x.id===pid);
      return `<span class="mappingAliasTag">${k} → <b>${p?.name||"Missing"}</b></span>`;
    }).join("");
  }else{
    out+='<div class="small">No confirmed product aliases yet.</div>';
  }

  if(deferred.length){
    out+=`<div class="small" style="margin:12px 0 6px"><b>Check later (${deferred.length})</b></div>`;
    out+=deferred.map(([k,v])=>`<div class="deferredMapRow"><span>${v.name||k}</span><button class="btn alt" onclick="reopenDeferredMapping('${k.replace(/'/g,"\\'")}')">Review now</button></div>`).join("");
  }
  box.innerHTML=out;
}

async function openFileDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open("MagicDragonPinFiles",1);
    req.onupgradeneeded=()=>{const dbi=req.result;if(!dbi.objectStoreNames.contains("sourceFiles"))dbi.createObjectStore("sourceFiles",{keyPath:"id"})};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function storeOriginalWorkbook(id,file,archiveName){
  try{
    const idb=await openFileDb();
    await new Promise((resolve,reject)=>{
      const tx=idb.transaction("sourceFiles","readwrite");
      tx.objectStore("sourceFiles").put({id,archiveName,blob:file,storedAt:new Date().toISOString()});
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error);
    });
    idb.close();
    return true;
  }catch(e){ return false; }
}

async function getArchivedSourceRecord(id){
 try{const idb=await openFileDb();const rec=await new Promise((resolve,reject)=>{const tx=idb.transaction("sourceFiles","readonly"),rq=tx.objectStore("sourceFiles").get(id);rq.onsuccess=()=>resolve(rq.result||null);rq.onerror=()=>reject(rq.error)});idb.close();return rec}catch(e){return null}
}
async function hydrateWorkbookFinancialIntegrityFromArchive(){
 if(!window.XLSX) return false;
 let changed=false;
 for(const imp of (db.sundayImports||[])){
  if(imp?.sheetTotals&&imp?.financialIntegrity)continue;
  if(!imp?.id)continue;
  const rec=await getArchivedSourceRecord(imp.id);if(!rec?.blob)continue;
  try{const reps=parseSundayWorkbook(await rec.blob.arrayBuffer(),rec.archiveName||imp.originalFilename||imp.archiveName||"Sunday-Report.xlsx");const match=reps.find(r=>canonicalBranchName(r.branch)===canonicalBranchName(imp.branch)&&String(r.date||"")===String(imp.date||""));if(!match?.sheetTotals)continue;imp.sheetTotals=match.sheetTotals;imp.financialIntegrity=workbookFinancialIntegrity({...imp,rows:match.rows,sheetTotals:match.sheetTotals});const w=(db.weeks||[]).find(w=>w.sourceArchiveId===imp.id);if(w){w.importAudit=w.importAudit||{};w.importAudit.sheetTotals=match.sheetTotals;w.importAudit.financialIntegrity=imp.financialIntegrity;}changed=true}catch(e){}
 }
 if(changed){localStorage.setItem("mdpin-db",JSON.stringify(db));renderAll();}
 return changed;
}

async function downloadArchivedSource(id,archiveName){
  try{
    const idb=await openFileDb();
    const rec=await new Promise((resolve,reject)=>{
      const tx=idb.transaction("sourceFiles","readonly");
      const rq=tx.objectStore("sourceFiles").get(id);
      rq.onsuccess=()=>resolve(rq.result);
      rq.onerror=()=>reject(rq.error);
    });
    idb.close();
    if(!rec?.blob) return alert("Original source file is not available on this device.");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(rec.blob);
    a.download=archiveName||rec.archiveName||"Sunday-Report.xlsx";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }catch(e){alert("Could not open the archived source file.");}
}


async function deleteArchivedSourceFile(id){
  try{
    const idb=await openFileDb();
    await new Promise((resolve,reject)=>{
      const tx=idb.transaction("sourceFiles","readwrite");
      tx.objectStore("sourceFiles").delete(id);
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error);
    });
    idb.close();
  }catch(e){}
}

function refreshStoredReconciliations(doSave=true){
  ensureSundayArchive();
  rebuildSundayReportChain();
  const ordered=[...db.sundayImports].sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.branch||"").localeCompare(b.branch||""));
  ordered.forEach(r=>{
    r.reconciliation=reconcileExcelReport(r);
    const w=db.weeks.find(w=>w.sourceArchiveId===r.id || (w.branch===r.branch&&w.date===r.date&&/Excel/i.test(w.source||"")));
    if(w){
      w.sourceArchiveId=r.id;
      w.importAudit=w.importAudit||{};
      w.importAudit.reconciliation=r.reconciliation;
    }
  });
  if(doSave)save();
  return ordered.map(r=>r.reconciliation);
}

function sundayReportDeleteDependencies(r){
  const date=String(r?.date||"");
  const branch=canonicalBranchName(r?.branch||"");
  ensureCompletedSundayCycles();
  const invoices=(db.invoices||[]).filter(i=>i&&i.status!=="void"&&!i.supersededBy&&String(i.reportDate||"")===date);
  const completed=(db.completedSundayCycles||[]).filter(x=>x&&x.status==="complete"&&String(x.date||"")===date);
  const adjustments=(db.adjustments||[]).filter(a=>a&&a.status!=="resolved"&&String(a.sourceDate||"")===date);
  const corrections=(db.pendingCorrections||[]).filter(c=>c&&c.status!=="resolved"&&String(c.sourceDate||"")===date);
  const calculatedSuggestions=(db.deliveries||[]).filter(d=>
    d&&d.generatedFromSundaySuggestion&&!d.deliveredAt&&!d.userEditedSuggestedDraft&&
    String(d.sourceSundayDate||"")===date&&canonicalBranchName(d.branch||"")===branch
  );
  const protectedDockets=(db.deliveries||[]).filter(d=>
    d&&String(d.sourceSundayDate||"")===date&&canonicalBranchName(d.branch||"")===branch&&
    (d.deliveredAt||d.userEditedSuggestedDraft)
  );
  return {invoices,completed,adjustments,corrections,calculatedSuggestions,protectedDockets};
}

window.deleteSundayReport=async id=>{
  ensureSundayArchive();
  const r=db.sundayImports.find(x=>x.id===id);
  if(!r) return;
  const dep=sundayReportDeleteDependencies(r);
  if(dep.invoices.length||dep.completed.length||dep.adjustments.length||dep.corrections.length){
    const why=[];
    if(dep.completed.length)why.push("the Sunday workflow for this date has been completed");
    if(dep.invoices.length)why.push(`${dep.invoices.length} saved invoice${dep.invoices.length===1?" is":"s are"} linked to this week`);
    if(dep.adjustments.length||dep.corrections.length)why.push("there are unresolved financial corrections linked to this week");
    alert(`This Sunday report cannot be deleted safely.\n\n${displayBranchName(r.branch)} • ${r.date}\n\n${why.join("\n")}\n\nNothing was deleted. If the worksheet itself is wrong, use Import Sunday Worksheet and choose Replace existing instead.`);
    return;
  }
  const linkedWeeks=(db.weeks||[]).filter(w=>w.sourceArchiveId===id || (w.branch===r.branch&&w.date===r.date&&/Excel/i.test(w.source||""))).length;
  const derived=dep.calculatedSuggestions.length;
  const protectedNote=dep.protectedDockets.length?`\n\n${dep.protectedDockets.length} delivered or manually edited docket${dep.protectedDockets.length===1?"":"s"} will be preserved.`:"";
  const ok=confirm(`Delete this Sunday report?\n\n${displayBranchName(r.branch)} • ${r.date}\n${r.archiveName||"Sunday worksheet"}\n\nThis will remove:\n• the Sunday report\n• ${linkedWeeks} linked weekly record${linkedWeeks===1?"":"s"}\n• the locally archived source workbook${derived?`\n• ${derived} unedited calculated suggested docket${derived===1?"":"s"} generated from this report`:""}${protectedNote}\n\nThis cannot be undone unless you import the worksheet again.`);
  if(!ok) return;
  db.sundayImports=db.sundayImports.filter(x=>x.id!==id);
  db.weeks=db.weeks.filter(w=>w.sourceArchiveId!==id && !(w.branch===r.branch&&w.date===r.date&&/Excel/i.test(w.source||"")));
  const removedSuggestionIds=new Set(dep.calculatedSuggestions.map(d=>d.id));
  if(removedSuggestionIds.size)db.deliveries=(db.deliveries||[]).filter(d=>!removedSuggestionIds.has(d.id));
  await deleteArchivedSourceFile(id);
  cleanupDataIntegrity();
  const recs=refreshStoredReconciliations();
  if(activeSundayArchiveId===id)activeSundayArchiveId=null;
  renderArchive();
  renderExcelReconciliation(recs.slice(-4));
  renderAll();
  alert(`Sunday report deleted safely.\n\n${displayBranchName(r.branch)} • ${r.date}\n${linkedWeeks} linked weekly record${linkedWeeks===1?"":"s"} removed${derived?`\n${derived} unedited suggested docket${derived===1?"":"s"} removed`:""}.`);
};

window.toggleSundayImportPanel=()=>{
  const panel=document.getElementById("importWorkPanel"),btn=document.getElementById("toggleSundayImport");
  if(!panel)return;
  const open=!panel.classList.contains("open");
  panel.classList.toggle("open",open);
  if(btn)btn.textContent=open?"Close Import":"+ Import Reports";
};

let activeSundayArchiveId=null;
function renderArchive(openId){
  ensureSundayArchive();
  const box=document.getElementById("archiveList");
  if(!box) return;
  const list=[...db.sundayImports].sort((a,b)=>(b.date||"").localeCompare(a.date||"") || (a.branch||"").localeCompare(b.branch||""));
  if(!list.length){activeSundayArchiveId=null;box.innerHTML='<div class="small">No Excel Sunday reports imported yet.</div>';return}
  if(openId!==undefined) activeSundayArchiveId=list.some(r=>r.id===openId)?openId:null;
  else if(activeSundayArchiveId&&!list.some(r=>r.id===activeSundayArchiveId)) activeSundayArchiveId=null;
  const active=list.find(r=>r.id===activeSundayArchiveId)||null;
  const selectors=list.map(r=>{
    const rec=r.reconciliation;
    const status=rec?reconStatusLabel(rec):["unknown","Not checked"];
    const flow=rec?.flowRows||[];
    const review=flow.filter(x=>x.status!=="ok").length;
    const okCount=flow.length-review;
    const summaryText=flow.length?`${okCount} OK • ${review} review`:status[1];
    return `<button type="button" class="sundaySelector ${active&&active.id===r.id?'active':''}" onclick='selectSundayArchive("${r.id}")'><span class="sundaySelectorMain"><div class="sundaySelectorTitle">${escapeHtml(r.date||"No date")}</div><div class="sundaySelectorBranch">${escapeHtml(displayBranchName(r.branch))}</div><div class="sundaySelectorMeta">${r.rows?.length||0} products • ${escapeHtml(summaryText)}</div></span><span class="reconStatus ${status[0]}">${escapeHtml(status[1])}</span><span class="sundaySelectorChevron">${active&&active.id===r.id?'⌃':'⌄'}</span></button>`;
  }).join("");
  let viewer='<div class="sundayEmptyState">Tap a Sunday report above to view it.</div>';
  if(active){
    const rec=active.reconciliation;
    const status=rec?reconStatusLabel(rec):["unknown","Not checked"];
    viewer=`<div class="sundayActivePanel" data-report-id="${active.id}"><div class="sundayActiveScroll"><div class="sundayActiveHead"><div><div class="sundayActiveTitle">${escapeHtml(active.date||"No date")} — ${escapeHtml(displayBranchName(active.branch))}</div><div class="sundayActiveMeta">${escapeHtml(active.archiveName||"")}<br>Imported ${escapeHtml(new Date(active.importedAt).toLocaleString())}${rec?.previousDate?` • Previous Sunday: ${escapeHtml(rec.previousDate)}`:""}</div></div><span class="reconStatus ${status[0]}">${escapeHtml(status[1])}</span></div>${rec?stockFlowHtml(rec):'<div class="small">This report has not been reconciled yet.</div>'}</div><div class="sundayActiveActions"><button class="btn alt" onclick="downloadArchivedSource('${active.id}','${String(active.archiveName||'Sunday-report.xlsx').replace(/'/g,"\\'")}')">Source</button><button class="btn dangerBtn" onclick="deleteSundayReport('${active.id}')">Delete</button></div></div>`;
  }
  box.innerHTML=`<div class="sundayArchiveUnified"><div class="sundaySelectorList">${selectors}</div>${viewer}</div>`;
  const listBox=box.querySelector(".sundaySelectorList"),activeButton=box.querySelector(".sundaySelector.active");
  if(listBox&&activeButton){
    const top=activeButton.offsetTop-listBox.offsetTop, bottom=top+activeButton.offsetHeight;
    if(top<listBox.scrollTop)listBox.scrollTop=top;
    else if(bottom>listBox.scrollTop+listBox.clientHeight)listBox.scrollTop=bottom-listBox.clientHeight;
  }
}
window.selectSundayArchive=id=>{
  activeSundayArchiveId=(activeSundayArchiveId===id)?null:id;
  renderArchive(activeSundayArchiveId===null?null:activeSundayArchiveId);
};

window.createSundayTestSuggestedDocket=id=>{
  ensureSundayArchive();
  const report=(db.sundayImports||[]).find(r=>r&&r.id===id);
  if(!report)return alert("Sunday report not found.");

  const branch=canonicalBranchName(report.branch);
  const sourceDate=String(report.date||"");

  // For regression testing, prefer the exact lines from the most recent
  // suggested docket that was already created from this Sunday report.
  // This faithfully recreates the consumed suggestion without changing
  // the archived Sunday report or invoice itself.
  const prior=[...(db.deliveries||[])]
    .filter(d=>d&&d.generatedFromSundaySuggestion&&String(d.sourceSundayDate||"")===sourceDate&&canonicalBranchName(d.branch)===branch&&(d.lines||[]).length)
    .sort((a,b)=>String(b.updatedAt||b.createdAt||b.deliveredAt||"").localeCompare(String(a.updatedAt||a.createdAt||a.deliveredAt||"")))[0]||null;

  let lines=[],stockReviewLines=[];
  if(prior){
    lines=(prior.lines||[]).map(l=>({...l}));
    stockReviewLines=(prior.stockReviewLines||[]).map(l=>({...l}));
  }else{
    const bundle=sundaySuggestedBundle(report);
    lines=(bundle.lines||[]).map(l=>({...l}));
    stockReviewLines=(bundle.reviews||[]).map(l=>({...l}));
  }

  if(!lines.length){
    alert("This Sunday report does not currently produce any suggested delivery quantities, so a TEST docket could not be created.");
    return;
  }

  const qty=lines.reduce((n,l)=>n+Number(l.qty||0),0);
  const ok=confirm(`Create a disposable TEST suggested docket?\n\n${displayBranchName(branch)} • Sunday ${recordDateLabel(sourceDate)}\n${lines.length} products • ${qty} units\n\nThis duplicates the previous suggested-delivery quantities for testing only. It does not alter the Sunday report or existing invoice.`);
  if(!ok)return;

  const now=new Date().toISOString();
  const token=Math.random().toString(36).slice(2,6).toUpperCase();
  const docket={
    id:"D"+Date.now()+Math.random().toString(36).slice(2,5),
    branch,
    date:today(),
    note:`TEST COPY — suggested delivery recreated from Sunday ${sourceDate}`,
    lines,
    stockReviewLines,
    deliveredAt:null,
    lineChanges:[],
    generatedFromSundaySuggestion:true,
    sourceSundayDate:sourceDate,
    suggestedRef:`${suggestedDraftRef(sourceDate,branch)}-TEST-${token}`,
    suggestionMethod:"test-regression-copy-v1",
    testOnlySuggestedCopy:true,
    userEditedSuggestedDraft:true,
    createdAt:now,
    updatedAt:now
  };

  db.deliveries.push(docket);
  db.docketAudit=db.docketAudit||[];
  db.docketAudit.push({id:"DA"+Date.now(),action:"test-suggested-copy-created",at:now,docketId:docket.id,date:docket.date,sourceSundayDate:sourceDate,branch});
  localStorage.setItem("mdpin-db",JSON.stringify(db));
  renderAll();
  renderDashboardAlerts();
  alert(`TEST suggested docket created.\n\n${displayBranchName(branch)} • ${lines.length} products • ${qty} units\n\nOpen it from the Dashboard, mark it Delivered using 13 Sep 2026, then edit one quantity to recreate the invoice-conflict test.`);
  switchTab("home");
};


let detectedWorkbookBlocks=[];
function sundayReportKey(rep){return `${String(rep?.branch||"").trim()}||${String(rep?.date||"").trim()}`;}
function existingSundayMatches(rep){
  ensureSundayArchive();
  return db.sundayImports.filter(x=>x.branch===rep.branch&&x.date===rep.date);
}
function classifyBranchCatalogueIds(previousIds,currentIds,activeIds){
  const previous=new Set(previousIds||[]),current=new Set(currentIds||[]),active=new Set(activeIds||[]);
  return {
    missing:[...previous].filter(id=>!current.has(id)),
    newOrReturned:[...current].filter(id=>!previous.has(id)),
    outsideCurrentList:[...current].filter(id=>!active.has(id))
  };
}
function reportCatalogueIdentity(rep){
  const ids=new Set(),unknownNames=[];
  (rep?.rows||[]).forEach(rr=>{
    const pm=canonicalProductMatchRow(rr);
    if(pm.product)ids.add(canonicalProductId(pm.product));
    else if(rr?.product)unknownNames.push(String(rr.product));
  });
  return {ids:[...ids],unknownNames:[...new Set(unknownNames)]};
}
function branchReportComparison(rep){
  ensureSundayArchive();
  const current=reportCatalogueIdentity(rep);
  const prior=(db.sundayImports||[])
    .filter(r=>canonicalBranchKey(r.branch)===canonicalBranchKey(rep.branch)&&String(r.date||"")<String(rep.date||""))
    .sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||null;
  const latestMs=Date.parse(rep?.date),priorMs=Date.parse(prior?.date);
  const gapDays=Number.isFinite(latestMs)&&Number.isFinite(priorMs)?Math.round((latestMs-priorMs)/86400000):null;
  const contiguous=!!prior&&gapDays>=5&&gapDays<=9;
  const previous=contiguous?reportCatalogueIdentity(prior):{ids:[],unknownNames:[]};
  const activeIds=branchProducts(rep.branch).map(canonicalProductId);
  const classified=classifyBranchCatalogueIds(contiguous?previous.ids:current.ids,current.ids,activeIds);
  const productNames=new Map((db.products||[]).map(p=>[p.id,p.name]));
  const names=ids=>ids.map(id=>productNames.get(id)||String(id));
  return {
    previousDate:contiguous?prior.date:null,gapDays,contiguous,
    currentCount:current.ids.length+current.unknownNames.length,
    missing:contiguous?names(classified.missing):[],
    newOrReturned:contiguous?names(classified.newOrReturned):[],
    outsideCurrentList:names(classified.outsideCurrentList),
    unknownNames:current.unknownNames
  };
}
function runBranchCatalogueSelfCheck(){
  const r=classifyBranchCatalogueIds(["A","B"],["B","C"],["A","B"]);
  return r.missing.join()==="A"&&r.newOrReturned.join()==="C"&&r.outsideCurrentList.join()==="C";
}
function renderBranchCatalogueSelfCheck(){
  const box=document.getElementById("catalogueIntegritySelfCheck");if(!box)return;
  const ok=runBranchCatalogueSelfCheck();
  box.className=`catalogueSelfCheck${ok?"":" bad"}`;
  box.textContent=ok?"✓ Classification self-check passed — missing, new/returned and outside-list groups separated correctly.":"Classification self-check failed — do not rely on catalogue comparisons in this build.";
}
function catalogueNamesHtml(names,limit=7){
  return names.slice(0,limit).map(escapeHtml).join(" • ")+(names.length>limit?` • +${names.length-limit} more`:"");
}
function sundayCatalogueCoverage(rep){
  return branchReportComparison(rep);
}
function sundayCatalogueCoverageHtml(rep){
  const c=sundayCatalogueCoverage(rep);
  const issueCount=c.missing.length+c.newOrReturned.length+c.unknownNames.length+c.outsideCurrentList.length;
  if(c.contiguous&&!issueCount)return `<div class="catalogueCoverageOk">✓ Aligned with previous Sunday ${escapeHtml(c.previousDate)} — no product-list changes detected.</div>`;
  if(!c.contiguous&&!c.unknownNames.length&&!c.outsideCurrentList.length)return `<div class="catalogueCoverageOk">✓ Branch continuity baseline — no immediately prior Sunday report is available. Names are mapped; no missing-product judgment was made.</div>`;
  const parts=[c.contiguous?`<b>Catalogue continuity check — review before import.</b> Compared with previous Sunday ${escapeHtml(c.previousDate)}.`:`<b>Branch continuity baseline.</b> No immediately prior Sunday report is available, so no missing/new judgment was made.`];
  if(c.missing.length)parts.push(`<b>${c.missing.length} missing since previous Sunday:</b> ${catalogueNamesHtml(c.missing,6)}`);
  if(c.newOrReturned.length)parts.push(`<b>${c.newOrReturned.length} new or returned this week:</b> ${catalogueNamesHtml(c.newOrReturned,6)}`);
  if(c.outsideCurrentList.length)parts.push(`<b>${c.outsideCurrentList.length} present on sheet but outside the current ${escapeHtml(displayBranchName(rep.branch))} delivery list:</b> ${catalogueNamesHtml(c.outsideCurrentList,6)}`);
  if(c.unknownNames.length)parts.push(`<b>${c.unknownNames.length} unmapped/new spreadsheet name${c.unknownNames.length===1?'':'s'}:</b> ${catalogueNamesHtml(c.unknownNames,5)}`);
  parts.push('Review only — no products, branch assignments, stock or imports are changed automatically.');
  return `<div class="catalogueCoverageWarn">${parts.join('<br>')}</div>`;
}

function normalizeSundayDuplicateText(v){
 return String(v??"").trim().replace(/\s+/g," ").toLowerCase();
}
function sundayReportContentSignature(rep){
 const rows=(rep?.rows||[]).map(r=>[
  Number(r.no)||0,normalizeSundayDuplicateText(r.product),
  r.oldStock??null,r.newDeliver??null,r.takeOut??null,r.total??null,r.inStock??null,r.sold??null,
  r.sellPrice??null,r.cost??null,r.totalSales??null,r.totalCost??null,r.totalProfit??null,r.bmShare??null,r.alixShare??null,r.pinShare??null
 ]);
 return JSON.stringify({branch:rep?.branch||"",date:rep?.date||"",oldDate:rep?.oldDate||"",rows});
}
function classifySundayBatchDuplicates(blocks){
 const groups={};
 blocks.filter(b=>b.rep&&b.rep.importable!==false).forEach(b=>{
  const k=sundayReportKey(b.rep);(groups[k]||(groups[k]=[])).push(b);
 });
 Object.values(groups).forEach(group=>{
  if(group.length<2)return;
  const first=sundayReportContentSignature(group[0].rep);
  const identical=group.every(b=>sundayReportContentSignature(b.rep)===first);
  group.forEach((b,i)=>{
   b.duplicateBatch=true;
   b.batchDuplicateKind=identical?(i===0?"identical-primary":"identical-extra"):"conflict";
   b.selected=identical?i===0:false;
  });
 });
 return groups;
}

async function preflightSelectedXlsxFiles(){
 detectedWorkbookBlocks=[];const panel=document.getElementById("detectedBlocksPanel"),list=document.getElementById("detectedBlocksList");
 if(!selectedXlsxFiles.length){panel.style.display="none";list.innerHTML="";const split=document.getElementById("multiWeekSplitSummary");if(split)split.innerHTML="";return}
 const ok=await loadSheetJS();if(!ok)return;
 let n=0;
 for(const file of selectedXlsxFiles){
  try{const reps=parseSundayWorkbook(await file.arrayBuffer(),file.name);reps.forEach(rep=>detectedWorkbookBlocks.push({id:`B${n++}`,file,rep,selected:rep.importable!==false,duplicateAction:"keep"}))}
  catch(err){detectedWorkbookBlocks.push({id:`B${n++}`,file,rep:null,selected:false,error:err.message})}
 }
 ensureSundayArchive();
 const counts={};
 detectedWorkbookBlocks.filter(b=>b.rep&&b.rep.importable!==false).forEach(b=>{const k=sundayReportKey(b.rep);counts[k]=(counts[k]||0)+1;});
 detectedWorkbookBlocks.forEach(b=>{
   if(!b.rep)return;
   b.existingMatches=b.rep.importable===false?[]:existingSundayMatches(b.rep);
   b.duplicateExisting=b.existingMatches.length>0;
   b.duplicateBatch=false;b.batchDuplicateKind="";
 });
 classifySundayBatchDuplicates(detectedWorkbookBlocks);
 panel.style.display="block";
 const splitSummary=document.getElementById("multiWeekSplitSummary"),splitGroups={};
 detectedWorkbookBlocks.filter(b=>b.rep).forEach(b=>{const k=`${b.file.name}||${b.rep.sheetName}`;(splitGroups[k]||(splitGroups[k]={file:b.file.name,sheet:b.rep.sheetName,count:0})).count++;});
 const splits=Object.values(splitGroups).filter(x=>x.count>1);
 if(splitSummary)splitSummary.innerHTML=splits.map(x=>`<div class="multiWeekSplitNotice">✓ ${x.count} separate weekly reports detected in ${escapeHtml(x.file)} · ${escapeHtml(x.sheet)}. Each week will be imported as its own report.</div>`).join("");
 list.innerHTML=detectedWorkbookBlocks.map(b=>{
   if(!b.rep)return `<div class="detectedBlock"><input type="checkbox" disabled><div><b>${escapeHtml(b.file.name)}</b><div class="detectedBlockMeta">${escapeHtml(b.error)}</div></div><span class="reconStatus bad">Unreadable</span></div>`;
   const cls=b.rep.importable===false?' notImportable':b.batchDuplicateKind==='conflict'?' duplicateBatch':(b.batchDuplicateKind==='identical-extra'?' duplicateExisting':(b.duplicateExisting?' duplicateExisting':''));
   let meta=`${escapeHtml(b.file.name)} • ${escapeHtml(b.rep.sheetName)} • ${b.rep.rows.length} products`;
   let status=`<span class="reconStatus ok">${b.rep.rows.length} rows</span>`;
   let conflict='';
   if(b.rep.importable===false){
     status='<span class="reconStatus bad">Needs review</span>';
     conflict=`<div class="small" style="grid-column:2/-1;color:#991b1b"><b>${escapeHtml(b.rep.detectionIssue||"Report identity could not be detected")}.</b> This block is safely excluded so it cannot be filed under the wrong week or shop.</div>`;
   }else if(b.batchDuplicateKind==='identical-extra'){
     status='<span class="reconStatus warn">Duplicate copy</span>';
     conflict='<div class="small" style="grid-column:2/-1;color:#92400e"><b>Identical copy of the same branch/date report.</b> This redundant copy has been safely left unchecked.</div>';
   }else if(b.batchDuplicateKind==='identical-primary'){
     status='<span class="reconStatus ok">Unique copy chosen</span>';
     conflict='<div class="small" style="grid-column:2/-1;color:#166534">✓ Identical duplicate copies were detected. This copy is selected; redundant copies are left unchecked.</div>';
   }else if(b.batchDuplicateKind==='conflict'){
     status='<span class="reconStatus bad">Choose one copy</span>';
     conflict='<div class="small" style="grid-column:2/-1;color:#9a3412"><b>Same branch/date appears more than once, but the contents differ.</b> Nothing is preselected. Choose the one report you intend to use.</div>';
   }else if(b.duplicateExisting){
     const old=b.existingMatches[0];
     status='<span class="reconStatus warn">Already imported</span>';
     const when=old?.importedAt?new Date(old.importedAt).toLocaleString():'earlier';
     conflict=`<div class="duplicateWeek"><b>Existing Sunday report found</b><div class="small">Imported ${escapeHtml(when)} • ${old?.rows?.length||0} product rows</div><select data-duplicate-action="${b.id}"><option value="keep" selected>Keep existing — do not import this copy</option><option value="replace">Replace existing with this selected report</option></select></div>`;
   }
   const coverage=b.rep.importable===false?"":sundayCatalogueCoverageHtml(b.rep);
   return `<div class="detectedBlock${cls}"><input type="checkbox" data-blockid="${b.id}" ${b.selected?'checked':''} ${b.rep.importable===false?'disabled':''}><div><b>${escapeHtml(b.rep.branch||"Shop not detected")} · ${escapeHtml(b.rep.date||"Date not detected")}</b><div class="detectedBlockMeta">${meta} • source rows ${b.rep.startRow}–${b.rep.endRow}</div></div>${status}${conflict}${coverage}</div>`;
 }).join("");
 updateDetectedBlockSelectionUI();
 list.querySelectorAll("[data-blockid]").forEach(cb=>cb.onchange=()=>{
   const b=detectedWorkbookBlocks.find(x=>x.id===cb.dataset.blockid);
   if(b){
     b.selected=cb.checked;
     if(cb.checked&&b.rep){
       const key=sundayReportKey(b.rep);
       detectedWorkbookBlocks.forEach(other=>{
         if(other.id!==b.id&&other.rep&&sundayReportKey(other.rep)===key){
           other.selected=false;
           const otherCb=list.querySelector(`[data-blockid="${other.id}"]`);if(otherCb)otherCb.checked=false;
         }
       });
     }
   }
   updateDetectedBlockSelectionUI();
 });
 list.querySelectorAll("[data-duplicate-action]").forEach(sel=>sel.onchange=()=>{const b=detectedWorkbookBlocks.find(x=>x.id===sel.dataset.duplicateAction);if(b)b.duplicateAction=sel.value;updateDetectedBlockSelectionUI()});
}

function updateDetectedBlockSelectionUI(){
  const valid=detectedWorkbookBlocks.filter(b=>b.rep&&b.rep.importable!==false);
  const selected=valid.filter(b=>b.selected);
  const title=document.getElementById("detectedBlocksTitle");
  const btn=document.getElementById("importXlsx");
  if(title) title.textContent=`${valid.length} weekly report${valid.length===1?"":"s"} detected`;
  if(btn){
    const keepOnly=selected.length&&selected.every(b=>b.duplicateExisting&&b.duplicateAction!=="replace");
    const replaceCount=selected.filter(b=>b.duplicateExisting&&b.duplicateAction==="replace").length;
    btn.disabled=!selected.length;
    btn.textContent=keepOnly?"Keep Existing — No Import Needed":(replaceCount?`Replace / Import ${selected.length} Selected Report${selected.length===1?"":"s"}`:`Import ${selected.length} Selected Report${selected.length===1?"":"s"}`);
  }
}

function resetSundayImportSelection(message,type="info"){
  selectedXlsxFiles=[];detectedWorkbookBlocks=[];
  const input=document.getElementById("xlsxFiles");if(input)input.value="";
  const card=document.getElementById("xlsxSelectionCard");if(card){card.className="selectionCard empty";card.innerHTML="<b>No Excel files selected</b><div class=\"small\">Choose Excel file(s) when you want to import another Sunday report.</div>";}
  const panel=document.getElementById("detectedBlocksPanel");if(panel)panel.style.display="none";
  const list=document.getElementById("detectedBlocksList");if(list)list.innerHTML="";
  const split=document.getElementById("multiWeekSplitSummary");if(split)split.innerHTML="";
  const results=document.getElementById("xlsxResults");if(results)results.innerHTML="";
  const btn=document.getElementById("importXlsx");if(btn){btn.disabled=true;btn.textContent="Choose Excel file(s) first";}
  const clear=document.getElementById("clearXlsxSelection");if(clear)clear.disabled=true;
  const notice=document.getElementById("xlsxActionNotice");
  if(notice){notice.className=`xlsxActionNotice ${type}`;notice.textContent=message||"";}
}

document.getElementById("xlsxFiles").onchange=e=>{
  selectedXlsxFiles=[...e.target.files];
  const notice=document.getElementById("xlsxActionNotice");if(notice){notice.className="xlsxActionNotice";notice.textContent="";}
  const box=document.getElementById("xlsxSelectionCard");
  if(!selectedXlsxFiles.length){
    box.className="selectionCard empty";
    box.innerHTML="<b>No Excel files selected</b><div class=\"small\">Choose one or both Sunday report files.</div>";
    return;
  }
  box.className="selectionCard ready";
  box.innerHTML=`<b>✓ ${selectedXlsxFiles.length} Excel file${selectedXlsxFiles.length===1?"":"s"} selected</b>`+
    selectedXlsxFiles.map(f=>`<div class="selectionFile">${escapeHtml(f.name)}</div>`).join("");
  const clear=document.getElementById("clearXlsxSelection");if(clear)clear.disabled=false;

  preflightSelectedXlsxFiles().then(()=>{if(document.body.classList.contains("workflowMode"))renderSundayWizard();});
  if(document.body.classList.contains("workflowMode"))renderSundayWizard();
};

document.getElementById("clearXlsxSelection").onclick=()=>resetSundayImportSelection("","");


function sundayImportCycleDateForReport(rep,chosenBlocks=[]){
  const repDate=String(rep?.date||"");
  if(!repDate)return repDate;
  const active=String(db.activeSundayCycleDate||"");
  if(active&&!isSundayCycleComplete(active)){
    const gap=Math.abs(Number(daysBetween(repDate,active)));
    if(Number.isFinite(gap)&&gap<=1)return active;
  }
  const nearby=(chosenBlocks||[]).filter(b=>b?.rep&&b.rep.importable!==false&&Math.abs(Number(daysBetween(repDate,String(b.rep.date||""))))<=1);
  const branches=new Set(nearby.map(b=>canonicalBranchName(b.rep.branch)).filter(Boolean));
  if(branches.size>=2){
    const dates=nearby.map(b=>String(b.rep.date||"")).filter(Boolean).sort();
    if(dates.length)return dates[dates.length-1];
  }
  return repDate;
}

document.getElementById("importXlsx").onclick=async()=>{
 if(!selectedXlsxFiles.length)return alert("Choose one or more Excel files first.");
 const ok=await loadSheetJS();if(!ok)return alert("The Excel reader could not load.");
 if(!detectedWorkbookBlocks.length)await preflightSelectedXlsxFiles();
 const chosen=detectedWorkbookBlocks.filter(b=>b.selected&&b.rep);if(!chosen.length)return alert("No weekly report blocks selected.");
 const keyCounts={};chosen.forEach(b=>{const k=sundayReportKey(b.rep);keyCounts[k]=(keyCounts[k]||0)+1;});
 const batchConflicts=Object.entries(keyCounts).filter(([,n])=>n>1);
 if(batchConflicts.length)return alert("Duplicate Sunday weeks are selected in this batch.\n\nUncheck all but one copy for each branch/date, then import again. Nothing has been changed.");
 ensureSundayArchive();const results=document.getElementById("xlsxResults");results.innerHTML="";const notice=document.getElementById("xlsxActionNotice");if(notice){notice.className="xlsxActionNotice";notice.textContent="";}const reconReports=[],importedDates=[];let keptExisting=0,replacedExistingCount=0,newImportedCount=0;
 for(const block of chosen){
  const file=block.file,rep=block.rep;
  try{
   const same=existingSundayMatches(rep);
   const replaceExisting=same.length && block.duplicateAction==="replace";
   if(same.length&&!replaceExisting){
     keptExisting++;
     results.insertAdjacentHTML("beforeend",`<div class="xlsxResult warn"><b>${escapeHtml(rep.archiveName)}</b><br><span class="small">${escapeHtml(displayBranchName(rep.branch))} • ${escapeHtml(rep.date)} — existing report kept. No data changed.</span></div>`);
     continue;
   }
   const mathErrors=validateWorkbookMath(rep),financialIntegrity=workbookFinancialIntegrity(rep),reconciliation=reconcileExcelReport(rep),id="X"+Date.now()+Math.random().toString(36).slice(2,7),stored=await storeOriginalWorkbook(id,file,rep.archiveName);
   const cycleDate=sundayImportCycleDateForReport(rep,chosen);
   const record={...rep,cycleDate,id,importedAt:new Date().toISOString(),sourceStored:stored,mathErrors,financialIntegrity,reconciliation};
   if(replaceExisting){
     for(const old of same)await deleteArchivedSourceFile(old.id);
     db.sundayImports=db.sundayImports.filter(x=>!(x.branch===rep.branch&&x.date===rep.date));
     db.weeks=db.weeks.filter(w=>!(w.branch===rep.branch&&w.date===rep.date&&/Excel/i.test(String(w.source||""))));
   }
   db.sundayImports.push(record);reconReports.push(reconciliation);if(!replaceExisting)importedDates.push(cycleDate||rep.date);if(replaceExisting)replacedExistingCount++;else newImportedCount++;
   const weeklyRows=rep.rows.map(rr=>{const pm=canonicalProductMatchRow(rr),p=pm.product;return {productId:p?.id||null,sourceProductName:rr.product,opening:rr.oldStock,delivered:rr.newDeliver||0,takeout:rr.takeOut||0,closing:rr.inStock,reportedSold:rr.sold,sellPrice:rr.sellPrice,cost:rr.cost,historyKnown:rr.oldStock!=null,source:"Excel"}});
   db.weeks.push({id:"W"+Date.now()+Math.random().toString(36).slice(2,5),branch:rep.branch,date:rep.date,source:"Excel Sunday import",sourceArchiveId:id,rows:weeklyRows,totals:{sales:rep.rows.reduce((s,r)=>s+(r.totalSales||0),0),cost:rep.rows.reduce((s,r)=>s+(r.totalCost||0),0),profit:rep.rows.reduce((s,r)=>s+(r.totalProfit||0),0),bm:rep.rows.reduce((s,r)=>s+(r.bmShare||0),0),alix:rep.rows.reduce((s,r)=>s+(r.alixShare||0),0),pin:rep.rows.reduce((s,r)=>s+(r.pinShare||0),0)},importAudit:{type:"xlsx",archiveName:rep.archiveName,mathErrors,financialIntegrity,sheetTotals:rep.sheetTotals||null,reconciliation,replacedExisting:!!replaceExisting}});
   save();
   const integrityBad=financialIntegrity.status==="mismatch";
   const integrityMsg=integrityBad?`<div class="small" style="margin-top:5px;color:#991b1b;font-weight:850">⚠ FINANCIAL TOTAL MISMATCH — spreadsheet Pay Pin ${baht(financialIntegrity.sheet?.payPin)}; product-line calculation ${baht(financialIntegrity.calculated?.payPin)}. Review before invoicing.</div>`:"";
   results.insertAdjacentHTML("beforeend",`<div class="xlsxResult ${(mathErrors.length||integrityBad)?"bad":"ok"}"><b>${escapeHtml(rep.archiveName)}</b><br><span class="small">${escapeHtml(displayBranchName(rep.branch))} • ${escapeHtml(rep.date)}${cycleDate&&cycleDate!==rep.date?` • billing cycle ${escapeHtml(cycleDate)}`:""} • ${rep.rows.length} product rows${replaceExisting?' • replaced previous report':''}</span>${integrityMsg}</div>`);
  }catch(err){results.insertAdjacentHTML("beforeend",`<div class="xlsxResult bad"><b>${escapeHtml(file.name)}</b><br><span class="small">${escapeHtml(err.message)}</span></div>`)}
 }
 // v0.10.128: if one branch was already present from a restored backup without
 // cycleDate metadata, attach it to the same Saturday/Sunday cycle now.
 if(importedDates.length){
   const proposed=[...new Set(importedDates.filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a)))[0];
   if(proposed)db.activeSundayCycleDate=proposed;
   alignActiveSundayCycleReports();
 }
 if(importedDates.length){
   const newest=[...new Set(importedDates.filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a)))[0];
   if(newest&&!isSundayCycleComplete(newest))db.activeSundayCycleDate=newest;
   localStorage.setItem("mdpin-db",JSON.stringify(db));
 }
 cleanupDataIntegrity();refreshStoredReconciliations();retroactivelyRemapAllImports();renderArchive();renderExcelReconciliation(reconReports);renderMappingReview();renderMappingManager();renderAll();
 if(notice){
   if(replacedExistingCount){notice.className="xlsxActionNotice ok";notice.textContent=`Replacement complete — ${replacedExistingCount} existing Sunday report${replacedExistingCount===1?"":"s"} replaced successfully${newImportedCount?` and ${newImportedCount} new report${newImportedCount===1?"":"s"} imported`:""}.`; }
   else if(newImportedCount){notice.className="xlsxActionNotice ok";notice.textContent=`Import complete — ${newImportedCount} Sunday report${newImportedCount===1?"":"s"} imported successfully.`;}
   else if(keptExisting){notice.className="xlsxActionNotice info";notice.textContent=`No import made — ${keptExisting} existing Sunday report${keptExisting===1?" was":"s were"} kept exactly as-is.`;}
 }
 const finalMessage=replacedExistingCount
   ?`Replacement complete — ${replacedExistingCount} existing Sunday report${replacedExistingCount===1?"":"s"} replaced successfully${newImportedCount?` and ${newImportedCount} new report${newImportedCount===1?"":"s"} imported`:""}.`
   :newImportedCount
     ?`Import complete — ${newImportedCount} Sunday report${newImportedCount===1?"":"s"} imported successfully.`
     :`Nothing was imported — ${keptExisting} existing Sunday report${keptExisting===1?" was":"s were"} kept exactly as-is.`;
 const finalType=(replacedExistingCount||newImportedCount)?"ok":"info";
 resetSundayImportSelection(finalMessage,finalType);
 if(replacedExistingCount||newImportedCount){
   sundayImportAutoAdvance=true;
   scrollSundayImportToNextStep();
 }else{
   sundayImportAutoAdvance=false;
   const finalNotice=document.getElementById("xlsxActionNotice");if(finalNotice&&finalNotice.textContent)finalNotice.scrollIntoView({block:"nearest",behavior:"smooth"});
 }
 if(document.body.classList.contains("workflowMode")){sundayWizardStep=1;renderSundayWizard();}
};

document.getElementById("exportMaster").onclick=async()=>{
  ensureSundayArchive();
  if(!db.sundayImports.length) return alert("There are no imported Excel reports to export yet.");
  const ok=await loadSheetJS();
  if(!ok) return alert("The Excel export library could not load.");

  const out=XLSX.utils.book_new();
  const sorted=[...db.sundayImports].sort((a,b)=>(a.date||"").localeCompare(b.date||"") || (a.branch||"").localeCompare(b.branch||""));
  const indexRows=[["Check Date","Branch","Archived Source Name","Old Stock From","Products","Spreadsheet Check","Independent Reconciliation"]];
  sorted.forEach(r=>indexRows.push([r.date,r.branch,r.archiveName,r.oldDate||"",r.rows.length,(r.mathErrors?.length||0)?"Review":"OK",r.reconciliation?reconStatusLabel(r.reconciliation)[1]:"Not checked"]));
  XLSX.utils.book_append_sheet(out,XLSX.utils.aoa_to_sheet(indexRows),"Index");

  sorted.forEach((r,idx)=>{
    const rows=[["No.","Product","Old Stock","New Deliver","Take Out","Total","In Stock","Sold","Sell Price","Cost","Total Sales","Total Cost","Total Profit","BM Share","Alix Share","Pin Share"]];
    r.rows.forEach(x=>rows.push([x.no,x.product,x.oldStock,x.newDeliver,x.takeOut,x.total,x.inStock,x.sold,x.sellPrice,x.cost,x.totalSales,x.totalCost,x.totalProfit,x.bmShare,x.alixShare,x.pinShare]));
    let name=`${r.date} ${r.branch==="BM Bangrak"?"Bangrak":"Lamai"}`.slice(0,31);
    if(out.SheetNames.includes(name)) name=(name.slice(0,27)+" "+(idx+1)).slice(0,31);
    XLSX.utils.book_append_sheet(out,XLSX.utils.aoa_to_sheet(rows),name);
  });

  const filename=`Magic-Dragon-Sunday-Archive_${sorted[0].date}_to_${sorted.at(-1).date}.xlsx`;
  XLSX.writeFile(out,filename,{compression:true});
};


let importFiles=[], importRows=[];
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function editDistance(a,b){const m=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)m[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return m[a.length][b.length]}
function similarity(a,b){a=norm(a);b=norm(b);if(!a||!b)return 0;return 1-editDistance(a,b)/Math.max(a.length,b.length)}
function importBaseRows(){
 const b=document.getElementById("impBranch").value,date=document.getElementById("impDate").value||today(),dels=deliveriesSinceLastWeek(b,date);
 const last=db.weeks.filter(w=>w.branch===b&&w.date<date).sort((a,c)=>a.date.localeCompare(c.date)).at(-1);
 return branchProducts(b).map(p=>{
   const prev=last?.rows?.find(r=>r.productId===p.id);
   return {
     productId:p.id,name:p.name,confidence:null,
     historyKnown:!!last && !!prev,
     opening:prev?prev.closing:null,
     delivered:dels[p.id]||0,
     closing:"",reportedSold:"",sourceText:""
   };
 });
}
function renderImport(){
 const tb=document.getElementById("impRows"); if(!importRows.length)importRows=importBaseRows();
 tb.innerHTML=importRows.map((r,i)=>{
   const conf=r.confidence==null?"—":Math.round(r.confidence)+"%";
   const cc=r.confidence==null?"":r.confidence>=90?"confHigh":r.confidence>=75?"confMed":"confLow";
   const opening=r.historyKnown?r.opening:"Unknown";
   return `<tr data-i="${i}">
     <td data-label="Product">${r.name}<div class="small">${r.sourceText?`OCR: ${r.sourceText}`:""}</div><div class="passSummary">${r.passSummary||""}</div></td>
     <td data-label="OCR" class="${cc}">${conf}</td>
     <td data-label="Opening" class="${r.historyKnown?"":"histUnknown"}">${opening}</td>
     <td data-label="Deliveries">${r.delivered}</td>
     <td data-label="Closing"><input class="impClosing" type="number" min="0" value="${r.closing}" style="width:65px"></td>
     <td data-label="Reported sold"><input class="impSold" type="number" min="0" value="${r.reportedSold}" placeholder="—" style="width:65px"></td>
     <td data-label="Difference" class="impDiff">—</td>
     <td data-label="Status" class="impState"><span class="status warn">Review</span></td>
   </tr>`;
 }).join("");
 tb.querySelectorAll("input").forEach(x=>x.oninput=e=>{const tr=e.target.closest("tr"),r=importRows[+tr.dataset.i];r.closing=tr.querySelector(".impClosing").value;r.reportedSold=tr.querySelector(".impSold").value;calcImport()});
 calcImport();
}
function calcImport(){
 let exact=0,amber=0,bad=0,purple=0,entered=0,unknown=0;
 document.querySelectorAll("#impRows tr").forEach(tr=>{
  const r=importRows[+tr.dataset.i], c=r.closing, rs=r.reportedSold;
  tr.classList.remove("recBad","recData");
  if(c===""){tr.querySelector(".impDiff").textContent="—";tr.querySelector(".impState").innerHTML='<span class="status warn">Waiting</span>';return}
  entered++;
  if(!r.historyKnown){
    unknown++;
    tr.querySelector(".impDiff").textContent="—";
    tr.querySelector(".impState").innerHTML='<span class="status unknown">No history yet</span>';
    return;
  }
  const calcSold=r.opening+r.delivered-(+c);
  let diff=rs===""?null:calcSold-(+rs);
  tr.querySelector(".impDiff").textContent=diff==null?"—":(diff===0?"0":(diff>0?"+":"")+diff);
  if(diff!==null&&diff!==0){
    bad++; tr.classList.add("recBad");
    const likelyData=(r.confidence??100)>=90;
    if(likelyData){purple++;tr.classList.add("recData");tr.querySelector(".impState").innerHTML='<span class="status" style="background:#ede9fe;color:#6d28d9">Data error?</span>'}
    else tr.querySelector(".impState").innerHTML='<span class="status bad">Mismatch</span>';
  }else if((r.confidence??100)<75){amber++;tr.querySelector(".impState").innerHTML='<span class="status warn">OCR check</span>'}
  else {exact++;tr.querySelector(".impState").innerHTML='<span class="status ok">Verified</span>'}
 });
 document.getElementById("impSummary").innerHTML=`<span>Entered ${entered}</span><span>Verified ${exact}</span><span>OCR checks ${amber}</span><span>Errors ${bad}</span><span>No history ${unknown}</span>`;
 return {entered,exact,amber,bad,purple,unknown};
}



const DELIVERY_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function clearDeliveryAlphabetVisual(){
  const el=document.getElementById("deliveryAlphabetScrubber");
  const thumb=document.getElementById("deliveryAlphabetThumb");
  if(el)el.classList.remove("active");
  if(thumb)thumb.style.display="none";
}
function setDeliveryAlphabetLetter(letter, clientX=null){
  if(!letter)return;
  activeDeliveryLetter=letter;
  const search=document.getElementById("deliveryProductSearch");
  if(search)search.value="";
  const el=document.getElementById("deliveryAlphabetScrubber");
  const thumb=document.getElementById("deliveryAlphabetThumb");
  if(el){
    const pos=DELIVERY_ALPHA.indexOf(letter);
    el.classList.add("active");
    el.setAttribute("aria-valuenow",String(pos+1));
    el.setAttribute("aria-valuetext",letter);
    if(thumb){
      thumb.textContent=letter;
      thumb.style.display="grid";
      const rect=el.getBoundingClientRect();
      const x=clientX==null?((pos+.5)/26)*rect.width:Math.max(0,Math.min(rect.width,clientX-rect.left));
      thumb.style.left=`${x}px`;
    }
  }
  fillProducts();
}
function deliveryLetterFromPointer(ev){
  const el=document.getElementById("deliveryAlphabetScrubber");
  if(!el)return "";
  const rect=el.getBoundingClientRect();
  const x=Math.max(0,Math.min(rect.width-0.01,ev.clientX-rect.left));
  return DELIVERY_ALPHA[Math.floor((x/rect.width)*26)]||"A";
}
function setupDeliveryAlphabetScrubber(){
  const el=document.getElementById("deliveryAlphabetScrubber");
  if(!el||el.dataset.ready==="1")return;
  el.dataset.ready="1";
  let dragging=false;
  const update=ev=>{
    const letter=deliveryLetterFromPointer(ev);
    if(letter)setDeliveryAlphabetLetter(letter,ev.clientX);
  };
  el.addEventListener("pointerdown",ev=>{
    dragging=true;
    try{el.setPointerCapture(ev.pointerId)}catch(_){}
    update(ev);
    ev.preventDefault();
  });
  el.addEventListener("pointermove",ev=>{
    if(!dragging)return;
    update(ev);
    ev.preventDefault();
  });
  el.addEventListener("pointerup",ev=>{
    if(dragging)update(ev);
    dragging=false;
    try{el.releasePointerCapture(ev.pointerId)}catch(_){}
    ev.preventDefault();
  });
  el.addEventListener("pointercancel",()=>{dragging=false});
}
setupDeliveryAlphabetScrubber();

const deliverySearch=document.getElementById("deliveryProductSearch");
if(deliverySearch)deliverySearch.oninput=()=>{activeDeliveryLetter="";clearDeliveryAlphabetVisual();fillProducts();};

document.getElementById("impFiles").onchange=e=>{
 importFiles=[...e.target.files]; const box=document.getElementById("shotPreview");box.innerHTML="";
 importFiles.forEach(f=>{const img=document.createElement("img");img.src=URL.createObjectURL(f);img.title=f.name;box.appendChild(img)});
 document.getElementById("ocrProgress").textContent=`${importFiles.length} screenshot${importFiles.length===1?"":"s"} selected. Tap Run Multi-Pass OCR.`;
 importRows=importBaseRows();renderImport();
};
document.getElementById("impBranch").onchange=()=>{importRows=importBaseRows();renderImport()}
document.getElementById("impDate").onchange=()=>{importRows=importBaseRows();renderImport()}
document.getElementById("clearImport").onclick=()=>{importFiles=[];importRows=[];document.getElementById("impFiles").value="";document.getElementById("shotPreview").innerHTML="";document.getElementById("ocrProgress").textContent="Import cleared.";renderImport()}
async function ensureTesseract(){
 if(window.Tesseract)return true;
 document.getElementById("ocrProgress").textContent="Loading OCR reader…";
 return new Promise(resolve=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.head.appendChild(s)});
}

async function makeOCRVariant(file, mode){
  const bmp=await createImageBitmap(file);
  const scale=Math.max(2.5,Math.min(5,3200/Math.max(bmp.width,bmp.height)));
  const c=document.createElement("canvas");
  c.width=Math.round(bmp.width*scale);
  c.height=Math.round(bmp.height*scale);
  const x=c.getContext("2d",{willReadFrequently:true});
  x.imageSmoothingEnabled=true;
  x.imageSmoothingQuality="high";
  x.drawImage(bmp,0,0,c.width,c.height);

  if(mode==="color") return c;

  const img=x.getImageData(0,0,c.width,c.height),d=img.data;
  for(let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2];
    const lum=0.299*r+0.587*g+0.114*b;
    let v=lum;
    if(mode==="gray") v=Math.max(0,Math.min(255,(lum-128)*1.35+128));
    if(mode==="light") v=lum>225?255:lum<145?0:Math.round((lum-145)*3.19);
    if(mode==="dark") v=lum>195?255:lum<95?0:Math.round((lum-95)*2.55);
    if(mode==="green"){
      v=g;
      v=Math.max(0,Math.min(255,(v-128)*1.45+128));
    }
    d[i]=d[i+1]=d[i+2]=v;
  }
  x.putImageData(img,0,0);
  return c;
}

function extractNumericCandidates(text){
  return (String(text||"").match(/\b\d+(?:\.\d+)?\b/g)||[]).map(Number);
}

function chooseConsensus(reads){
  if(!reads.length) return null;
  const buckets=new Map();
  reads.forEach(r=>{
    const nums=extractNumericCandidates(r.text);
    if(!nums.length) return;
    const val=nums[nums.length-1];
    const key=String(val);
    if(!buckets.has(key)) buckets.set(key,{value:val,count:0,weight:0,sources:[]});
    const b=buckets.get(key);
    b.count++;
    b.weight += Math.max(1,r.confidence||0);
    b.sources.push(r.mode);
  });
  const ranked=[...buckets.values()].sort((a,b)=>(b.count-a.count)||(b.weight-a.weight));
  return ranked[0]||null;
}


document.getElementById("runOCR").onclick=async()=>{
 if(!importFiles.length)return alert("Choose at least one screenshot first.");
 const ok=await ensureTesseract();
 if(!ok){
   document.getElementById("ocrProgress").innerHTML="<b>OCR reader could not load.</b> Check internet connection, then try again.";
   return;
 }
 document.getElementById("runOCR").disabled=true;
 try{
   const modes=[
     {id:"color",label:"Original colour"},
     {id:"gray",label:"Grayscale contrast"},
     {id:"light",label:"Light threshold"},
     {id:"dark",label:"Dark threshold"},
     {id:"green",label:"Green-channel contrast"}
   ];
   let allPassLines=[];
   const totalPasses=importFiles.length*modes.length;
   let passNo=0;

   for(let fi=0;fi<importFiles.length;fi++){
     for(const mode of modes){
       passNo++;
       document.getElementById("ocrProgress").textContent=`OCR pass ${passNo} of ${totalPasses}: ${mode.label}…`;
       const prepared=await makeOCRVariant(importFiles[fi],mode.id);
       const out=await Tesseract.recognize(prepared,"eng",{
         logger:m=>{
           if(m.status==="recognizing text"){
             document.getElementById("ocrProgress").textContent=
               `OCR pass ${passNo}/${totalPasses}: ${mode.label} — ${Math.round((m.progress||0)*100)}%`;
           }
         }
       });
       const lines=(out.data.lines||[])
         .map(l=>({
           text:l.text.trim(),
           confidence:l.confidence||out.data.confidence||0,
           mode:mode.id,
           modeLabel:mode.label
         }))
         .filter(l=>l.text);
       allPassLines.push(...lines);
     }
   }

   importRows=importBaseRows();
   importRows.forEach(r=>{
     let candidateReads=[];
     allPassLines.forEach(l=>{
       const txt=norm(l.text),pn=norm(r.name);
       const score=txt.includes(pn)?1:Math.max(
         similarity(txt,pn),
         similarity(txt.split(/\s+\d/)[0],pn)
       );
       if(score>.38){
         candidateReads.push({
           ...l,
           matchScore:score,
           effectiveConfidence:Math.max(0,Math.min(100,(l.confidence||0)*score))
         });
       }
     });

     candidateReads.sort((a,b)=>b.effectiveConfidence-a.effectiveConfidence);
     const best=candidateReads[0];

     if(best){
       const consensus=chooseConsensus(candidateReads.slice(0,12));
       const agreement=consensus?Math.min(1,consensus.count/3):0;
       const boost=agreement*18;
       r.confidence=Math.max(0,Math.min(100,best.effectiveConfidence+boost));
       r.sourceText=best.text;
       r.passSummary=candidateReads.slice(0,5)
         .map(x=>`${x.modeLabel}: ${Math.round(x.effectiveConfidence)}%`)
         .join(" • ");
       if(consensus){
         r.closing=String(consensus.value);
         r.consensusCount=consensus.count;
         r.consensusSources=consensus.sources;
       }
     }
   });

   document.getElementById("ocrProgress").innerHTML=
     "<b>Multi-pass OCR complete.</b> Five image treatments were compared. Agreement between independent passes increases confidence; disagreements remain highlighted for checking.";
   renderImport();
 }catch(err){
   document.getElementById("ocrProgress").innerHTML="<b>OCR failed:</b> "+err.message;
 }finally{
   document.getElementById("runOCR").disabled=false;
 }
};

document.getElementById("commitImport").onclick=()=>{
 const s=calcImport(); if(!s.entered)return alert("No closing-stock figures have been entered.");
 if(s.bad&&!confirm(`${s.bad} reconciliation error(s) remain. Save anyway for investigation?`))return;
 if(s.unknown&&!confirm(`${s.unknown} row(s) cannot yet be reconciled because historical opening stock is missing. Save this as a baseline Sunday check?`))return;
 const b=document.getElementById("impBranch").value,date=document.getElementById("impDate").value||today();
 const rows=importRows.filter(r=>r.closing!=="").map(r=>({productId:r.productId,opening:r.historyKnown?r.opening:null,delivered:r.delivered,takeout:0,closing:+r.closing,reportedSold:r.reportedSold===""?null:+r.reportedSold,ocrConfidence:r.confidence,sourceText:r.sourceText,historyKnown:r.historyKnown}));
 let sales=0,cost=0,profit=0,pin=0,alix=0,bm=0;
 rows.filter(r=>r.historyKnown).forEach(r=>{const p=db.products.find(x=>x.id===r.productId),sold=r.opening+r.delivered-r.closing,s=sold*p.retail,c=sold*p.cost,pr=s-c,isEd=p.type==="edible";sales+=s;cost+=c;profit+=pr;pin+=c+pr*(isEd?.40:.30);alix+=pr*(isEd?.20:.30);bm+=pr*.40});
 db.weeks.push({id:"W"+Date.now(),branch:b,date,source:"Sunday screenshot import",rows,totals:{sales,cost,profit,pin,alix,bm},importAudit:{files:importFiles.map(f=>f.name),summary:s}});
 save();alert("Sunday check saved with OCR/reconciliation audit information.");switchTab("audit");
};

function renderAll(){
 inferLegacyDeliveredDockets();
 processPendingDocketCorrections();
 fillProducts();
 renderDelivery();
 renderHistory();
 renderCatalogue();
 renderMetrics();
 renderAudit();
 renderHistorical();
 renderMasterProductSetup();
 renderCatalogueIntegrity();
 renderBranchProductAssignments();
 renderMappingManager();
 renderMappingReview();
 if(!document.body.classList.contains("deliveryMode"))renderDocketArchive();
 renderDashboardAlerts();
}
ensureProductAliases();
migrateKnownCanonicalDuplicates();
ensureKnownCatalogueAdditions();
repairKnownProductPrices();
ensureProductFamilyStructure();
let sundayWizardStep=2;
let sundayWizardTargetDate=null;
let sundayConflictFocus=null; // v0.10.115: exact conflict reconciliation focus {branch,product}
const SUNDAY_STEPS=["Import","Reconcile","Financial","Invoice","Payment"];
function ensureCompletedSundayCycles(){if(!Array.isArray(db.completedSundayCycles))db.completedSundayCycles=[];}
function isSundayCycleComplete(date){ensureCompletedSundayCycles();return db.completedSundayCycles.some(x=>x&&x.date===date&&x.status==="complete");}
function normalizeActiveSundayCycle(){
  ensureCompletedSundayCycles();
  const active=db.activeSundayCycleDate||null;
  if(!active)return null;
  const hasReport=(db.sundayImports||[]).some(r=>r&&sundayCycleDateOfReport(r)===active);
  const latestCompleted=(db.completedSundayCycles||[])
    .filter(x=>x&&x.status==="complete"&&x.date)
    .map(x=>String(x.date))
    .sort((a,b)=>b.localeCompare(a))[0]||null;
  // An active Sunday must still exist, must not already be complete, and can never
  // sit behind a newer completed Sunday. Historical report replacement/mapping
  // work must not resurrect an old workflow on the dashboard.
  const stale=!hasReport||isSundayCycleComplete(active)||(latestCompleted&&String(active)<latestCompleted);
  if(stale){
    db.activeSundayCycleDate=null;
    localStorage.setItem("mdpin-db",JSON.stringify(db));
    return null;
  }
  return active;
}
function completeSundayCycle(state){
  const date=wizardCycleDate(state);if(!date||!state.paymentSaved)return false;
  ensureCompletedSundayCycles();
  const inv=state.invoice;
  const rec={date,status:"complete",completedAt:new Date().toISOString(),invoiceId:inv?.id||null,invoiceNumber:inv?.number||null};
  const i=db.completedSundayCycles.findIndex(x=>x&&x.date===date);if(i>=0)db.completedSundayCycles[i]=rec;else db.completedSundayCycles.push(rec);
  // A completed cycle is historical. Never let normal Sunday Wizard discovery resurrect older imports.
  if(db.activeSundayCycleDate===date)db.activeSundayCycleDate=null;
  localStorage.setItem("mdpin-db",JSON.stringify(db));
  return true;
 refreshBaselineSnapshotStatus();
}
function openSundayWizard(targetDate=null,focus=null){
  sundayWizardTargetDate=targetDate||null;
  sundayConflictFocus=focus||null;
  const items=latestWizardReports();
  sundayWizardStep=items.length?2:1;
  switchTab("sundayWizard");
  document.body.classList.add("workflowMode");
  if(window.syncShellGeometry) requestAnimationFrame(()=>window.syncShellGeometry());
  renderSundayWizard();
  window.scrollTo({top:0,behavior:"smooth"});
}
function exitSundayWorkflow(){
  sundayWizardTargetDate=null;
  sundayConflictFocus=null;
  document.body.classList.remove("workflowMode");
  switchTab("home");
  const resetHomeScroll=()=>{
    const home=document.getElementById("home");
    const viewport=document.querySelector(".contentViewport");
    if(home) home.scrollTop=0;
    if(viewport) viewport.scrollTop=0;
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    window.scrollTo(0,0);
  };
  const settle=()=>{resetHomeScroll();if(window.syncShellGeometry)window.syncShellGeometry();};
  settle();
  requestAnimationFrame(()=>{settle();requestAnimationFrame(settle)});
  setTimeout(settle,80);
  setTimeout(settle,220);
}
function wizardAction(type){
  if(type==="import"){
    document.body.classList.remove("workflowMode");
    switchTab("import");
    return;
  }
  document.body.classList.remove("workflowMode");
  if(type==="delivery") openDeliveryArchive();
  else if(type==="mapping") switchTab("settings");
  else if(type==="weekly") switchTab("weekly");
}
// v0.10.117: source choices link to the exact records; neither changes business data.
function wizardOpenDeliveryDocket(id){
  document.body.classList.remove("workflowMode");
  openDeliveryArchive(id);
}
function wizardOpenSundayReport(id){
  document.body.classList.remove("workflowMode");
  switchTab("import");
  renderArchive(id);
}
function wizardForensicFinding(report,rec,detail,candidates){
  const f=detail.flow||{},shop=Number(f.shopDeliveries),saved=Number(f.ledgerDeliveries);
  const excluded=candidates.filter(x=>businessDeliverySource(x.d)===null);
  const sourceTopups=candidates.filter(x=>businessDeliverySource(x.d)!==null&&deliveryFromReportBeingChecked(x.d,report.date));
  const restored=candidates.filter(x=>x.d.testConflictSeed&&businessDeliverySource(x.d)!==null&&businessDeliverySource(x.d)!==x.d);
  const unknownTest=candidates.filter(x=>x.d.testConflictSeed&&businessDeliverySource(x.d)===x.d);
  const inferred=candidates.filter(x=>x.d.deliveryStatusInferred);
  const dateMismatch=candidates.filter(x=>x.d.deliveredAt&&String(x.d.deliveredAt).slice(0,10)!==String(x.d.date||""));
  const open=Number(f.sheetOpening),sold=Number(f.sheetSold),take=Number(f.takeOut||0),close=Number(f.sheetClosing);
  const shopMath=[f.sheetOpening,f.shopDeliveries,f.sheetSold,f.sheetClosing].every(x=>x!=null)&&Math.abs(open+shop-take-sold-close)<.001;
  const actualMath=[f.sheetOpening,f.ledgerDeliveries,f.sheetSold,f.sheetClosing].every(x=>x!=null)&&Math.abs(open+saved-take-sold-close)<.001;
  const fmt=n=>String(Number(n));
  let conclusion='The two records disagree. The app cannot establish which quantity was physically delivered from saved figures alone.';
  let evidence=`The shop says ${fmt(shop)} delivered; delivered dockets dated this week total ${fmt(saved)}.`;
  if(excluded.length||sourceTopups.length||restored.length){
    const testUnits=excluded.reduce((n,x)=>n+x.qty,0),topupUnits=sourceTopups.reduce((n,x)=>n+x.qty,0);
    conclusion=`${excluded.length?`${excluded.length} TEST copy excluded (${fmt(testUnits)} units). `:''}${sourceTopups.length?`${sourceTopups.length} suggested top-up from this Sunday report excluded (${fmt(topupUnits)} units): it was calculated from this report’s closing stock, so it cannot also be a delivery into the same report. `:''}${restored.length?`${restored.length} original docket snapshot${restored.length===1?'':'s'} restored. `:''}Counted deliveries for this week: ${fmt(saved)}; shop report: ${fmt(shop)}.`;
    evidence=sourceTopups.length?'The suggestion is still saved and marked Delivered. Its physical delivery date or status needs review; the completed invoice is untouched.':(shopMath&&!actualMath?'The shop stock figures balance with its delivery quantity. Check the remaining real docket.':'TEST copies do not affect business reconciliation.');
  }else if(shopMath&&!actualMath){
    conclusion=`The shop’s stock figures support ${fmt(shop)} deliveries: ${fmt(open)} opening + ${fmt(shop)} delivered − ${fmt(take)} taken out − ${fmt(sold)} sold = ${fmt(close)} closing. Counting the saved dockets would give ${fmt(open+saved-take-sold)} closing instead.`;
    evidence='The saved dockets need a date, status, branch and source check. This arithmetic does not prove whether stock was physically received.';
  }else if(actualMath&&!shopMath){
    conclusion=`The closing stock agrees with ${fmt(saved)} units from saved dockets, while the shop’s reported delivery ${fmt(shop)} does not balance.`;
    evidence='Check the original shop workbook’s delivery entry before changing the saved dockets.';
  }else if(shopMath&&actualMath){
    conclusion='Both totals balance within the saved figures; check for a duplicate or offsetting stock adjustment.';
  }
  if(unknownTest.length)evidence+=` ${unknownTest.length} TEST-edited docket${unknownTest.length===1?' has':'s have'} no original snapshot; its original quantity needs manual review.`;
  if(dateMismatch.length)evidence+=` ${dateMismatch.length} docket${dateMismatch.length===1?' has':'s have'} a delivered timestamp on a different date from the docket date used for this week.`;
  if(inferred.length)evidence+=` ${inferred.length} delivered status${inferred.length===1?' was':'es were'} inferred from an invoice, not marked directly on the docket.`;
  return `<div class="wizardForensic" role="status"><b>What the app found</b><div>${escapeHtml(conclusion)}</div><small>${escapeHtml(evidence)}</small></div>`;
}
function wizardMatchingDockets(branch,startDate,endDate,productId){
  if(!productId)return [];
  return (db.deliveries||[]).map(d=>({d,qty:(d.lines||[]).filter(l=>l.productId===productId).reduce((n,l)=>n+(Number(l.qty)||0),0)}))
    .filter(({d,qty})=>d.branch===branch&&!!d.deliveredAt&&d.date&&d.date>startDate&&d.date<=endDate&&qty);
}
function wizardChooseExcel(){
  const input=document.getElementById("xlsxFiles");if(input)input.click();
}
function wizardImportSelected(){
  const btn=document.getElementById("importXlsx");if(btn)btn.click();
}
function wizardImportMarkup(){
  if(!selectedXlsxFiles.length)return `<div class="wizardLocked">No Sunday report has been imported yet.</div><div class="wizardActions"><button class="btn gold" onclick="wizardChooseExcel()">Choose Excel files</button></div>`;
  const detected=detectedWorkbookBlocks.filter(b=>b.rep);
  return `<div class="wizardImportBox"><div class="wizardImportFiles"><b>Selected Excel files</b>${selectedXlsxFiles.map(f=>`<div class="wizardImportFile">${escapeHtml(f.name)}</div>`).join('')}</div>${detected.length?`<div class="wizardImportDetected">${detected.map(b=>`<div><span>${escapeHtml(displayBranchName(b.rep.branch))} · ${escapeHtml(b.rep.date)}</span><b>${b.rep.rows.length} rows</b></div>`).join('')}</div>`:`<div class="wizardLocked">Reading the selected workbook…</div>`}<div class="wizardActions"><button class="btn alt" onclick="wizardChooseExcel()">Change files</button><button class="btn gold" ${detected.length?'':'disabled'} onclick="wizardImportSelected()">Import ${detected.length||''} report${detected.length===1?'':'s'}</button></div></div>`;
}
function sundayCycleDateOfReport(r){
  return String(r?.cycleDate||r?.date||"");
}
function alignActiveSundayCycleReports(){
  ensureSundayArchive();ensureCompletedSundayCycles();
  let active=String(db.activeSundayCycleDate||"");
  if(!active)return active;
  // v0.10.128: an older backup can contain one branch on Saturday and the other
  // on Sunday with no cycleDate metadata. Re-bind adjacent cross-branch reports
  // to one billing cycle before counting/rendering the Sunday workflow.
  let candidates=(db.sundayImports||[]).filter(r=>r?.date&&Math.abs(Number(daysBetween(String(r.date),active)))<=1);
  const branches=new Set(candidates.map(r=>canonicalBranchName(r.branch)).filter(Boolean));
  if(branches.size<2)return active;
  const dates=candidates.map(r=>String(r.date)).filter(Boolean).sort();
  const cycle=dates[dates.length-1]||active;
  let changed=false;
  candidates.forEach(r=>{
    if(sundayCycleDateOfReport(r)!==cycle){r.cycleDate=cycle;changed=true;}
  });
  if(active!==cycle){db.activeSundayCycleDate=cycle;active=cycle;changed=true;}
  if(changed)localStorage.setItem("mdpin-db",JSON.stringify(db));
  return active;
}
function wizardCycleDate(state=null){
  const active=String(db.activeSundayCycleDate||"");
  if(active)return active;
  const items=state?.items||[];
  const dates=items.map(x=>sundayCycleDateOfReport(x.report)).filter(Boolean).sort();
  return dates[dates.length-1]||null;
}
function wizardReportsForDate(date){
  ensureSundayArchive(); rebuildSundayReportChain();
  // v0.10.128: a shop may prepare its Sunday stock report one day early.
  // Preserve the report's true date, but group it into the same billing cycle via cycleDate.
  return [...(db.sundayImports||[])].filter(r=>(r.cycleDate||r.date)===date).map(r=>({report:r,rec:reconcileExcelReport(r)}));
}
function latestWizardReports(){
  ensureSundayArchive(); rebuildSundayReportChain();ensureCompletedSundayCycles();
  // Explicit historical/review mode may open any requested date.
  if(sundayWizardTargetDate)return wizardReportsForDate(sundayWizardTargetDate);
  // Normal Sunday Wizard resumes ONLY a cycle that was explicitly started by an import.
  // Historical unresolved reports are never auto-selected as current work.
  alignActiveSundayCycleReports();
  const activeDate=normalizeActiveSundayCycle();
  if(!activeDate)return [];
  if(isSundayCycleComplete(activeDate)){db.activeSundayCycleDate=null;localStorage.setItem("mdpin-db",JSON.stringify(db));return [];}
  const items=wizardReportsForDate(activeDate);
  if(!items.length){db.activeSundayCycleDate=null;localStorage.setItem("mdpin-db",JSON.stringify(db));return [];}
  return items;
}
function financialReconcileReport(rep){
  const stock=reconcileExcelReport(rep);
  const issues=[];
  const totals={sales:0,cost:0,profit:0,bm:0,alix:0,pinProfit:0,payPin:0,sheetSales:0,sheetCost:0,sheetProfit:0,sheetBm:0,sheetAlix:0,sheetPinProfit:0};
  const tol=.011;
  if(stock.status!=="ok") return {status:"locked",issues,totals,stock};
  (rep.rows||[]).forEach(rr=>{
    const pm=canonicalProductMatchRow(rr),p=pm.product;
    if(!p){issues.push({product:rr.product,reason:"Product is not linked to the master catalogue.",action:"mapping"});return;}
    const sold=Number(rr.sold ?? ((Number(rr.oldStock)||0)+(Number(rr.newDeliver)||0)-(Number(rr.takeOut)||0)-(Number(rr.inStock)||0)))||0;
    const expectedSales=sold*Number(p.retail||0), expectedCost=sold*Number(p.cost||0), expectedProfit=expectedSales-expectedCost;
    const edible=p.type==="edible", expectedBm=expectedProfit*.40, expectedAlix=expectedProfit*(edible?.20:.30), expectedPin=expectedProfit*(edible?.40:.30);
    const checks=[];
    const add=(label,sheet,expected)=>{if(sheet==null){if(Math.abs(expected)>tol)checks.push(`${label}: missing on sheet, expected ${baht(expected)}`)}else if(Math.abs(Number(sheet)-expected)>tol)checks.push(`${label}: sheet ${baht(sheet)}, expected ${baht(expected)}`)};
    if(rr.sellPrice==null){if(sold>0)checks.push(`Retail price: missing on sheet, master ${baht(p.retail)}`)}else if(Math.abs(Number(rr.sellPrice)-Number(p.retail||0))>tol)checks.push(`Retail price: sheet ${baht(rr.sellPrice)}, master ${baht(p.retail)}`);
    if(rr.cost==null){if(sold>0)checks.push(`Cost price: missing on sheet, master ${baht(p.cost)}`)}else if(Math.abs(Number(rr.cost)-Number(p.cost||0))>tol)checks.push(`Cost price: sheet ${baht(rr.cost)}, master ${baht(p.cost)}`);
    add("Sales",rr.totalSales,expectedSales); add("Cost",rr.totalCost,expectedCost); add("Profit",rr.totalProfit,expectedProfit); add("BM share",rr.bmShare,expectedBm); add("Alix share",rr.alixShare,expectedAlix); add("Pin profit",rr.pinShare,expectedPin);
    if(checks.length)issues.push({product:p.name,reason:checks.join(" • "),action:(checks.some(x=>x.startsWith("Retail price")||x.startsWith("Cost price"))?"mapping":"import")});
    totals.sales+=expectedSales;totals.cost+=expectedCost;totals.profit+=expectedProfit;totals.bm+=expectedBm;totals.alix+=expectedAlix;totals.pinProfit+=expectedPin;totals.payPin+=expectedCost+expectedPin;
    totals.sheetSales+=Number(rr.totalSales)||0;totals.sheetCost+=Number(rr.totalCost)||0;totals.sheetProfit+=Number(rr.totalProfit)||0;totals.sheetBm+=Number(rr.bmShare)||0;totals.sheetAlix+=Number(rr.alixShare)||0;totals.sheetPinProfit+=Number(rr.pinShare)||0;
  });
  const integrity=rep.financialIntegrity||workbookFinancialIntegrity(rep);
  const integrityResolved=financialIntegrityResolutionValid(rep,integrity);
  if(integrity?.status==="mismatch"&&!integrityResolved) {
    const pay=integrity.mismatches?.find(x=>x.key==="payPin");
    issues.unshift({product:"Spreadsheet totals",reason:`Spreadsheet total does not match the product lines${pay?`: Pay Pin ${baht(pay.sheet)} on sheet vs ${baht(pay.calculated)} from all product rows (difference ${pay.difference>=0?"+":""}${baht(pay.difference)})`:""}.`,action:"integrity",financialIntegrity:true});
  }
  return {status:issues.length?"review":"ok",issues,totals,stock,financialIntegrity:integrity,financialIntegrityResolved:integrityResolved};
}
function invoiceFinancialSummary(financial){
  const branches=financial.filter(x=>x.result.status==="ok").map(x=>({branch:x.report.branch,...x.result.totals}));
  const combined={sales:0,cost:0,profit:0,bm:0,alix:0,pinProfit:0,payPin:0};
  branches.forEach(b=>Object.keys(combined).forEach(k=>combined[k]+=Number(b[k]||0)));
  return {branches,combined};
}
function invoiceSignature(date,summary){
  return JSON.stringify({date,branches:summary.branches.map(b=>[b.branch,+b.sales.toFixed(2),+b.cost.toFixed(2),+b.pinProfit.toFixed(2),+b.payPin.toFixed(2)])});
}
function adjustmentDecisionForDate(adj,date){
  if(adj.status==="applied"&&adj.appliedToDate===date)return "apply";
  return adj.workflowDecisions?.[date]||"";
}
function adjustmentCandidatesForDate(date){
  if(!date)return [];
  return (db.adjustments||[]).filter(a=>(a.status==="pending"&&String(a.sourceDate||"")<String(date))||(a.status==="applied"&&a.appliedToDate===date));
}
function appliedAdjustmentsForDate(date,candidates=adjustmentCandidatesForDate(date)){return candidates.filter(a=>adjustmentDecisionForDate(a,date)==="apply");}
function settlementAdjustmentSignature(adjs){return JSON.stringify((adjs||[]).map(a=>[a.id,+Number(a.amount||0).toFixed(2)]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));}
function getValidSundayInvoice(date,financial,appliedAdjustments=[]){
  const summary=invoiceFinancialSummary(financial),sig=invoiceSignature(date,summary),adjSig=settlementAdjustmentSignature(appliedAdjustments);
  const inv=latestInvoiceForDate(date);
  if(!inv||inv.signature!==sig)return null;
  const savedAdjSig=inv.adjustmentSignature||settlementAdjustmentSignature(inv.adjustmentsApplied||[]);
  return savedAdjSig===adjSig?inv:null;
}
function currentWizardState(){
  const items=latestWizardReports();
  const stockGreen=items.length>0&&items.every(x=>x.rec.status==="ok");
  const financial=items.map(x=>({report:x.report,result:financialReconcileReport(x.report)}));
  const financialGreen=stockGreen&&financial.length>0&&financial.every(x=>x.result.status==="ok");
  const latestDate=wizardCycleDate({items});
  const adjustmentCandidates=latestDate?adjustmentCandidatesForDate(latestDate):[];
  const pendingForDecision=adjustmentCandidates.filter(a=>a.status==="pending"&&a.resolution!=="next_sunday_auto");
  const autoAdjustments=adjustmentCandidates.filter(a=>a.status==="pending"&&a.resolution==="next_sunday_auto");
  const adjustmentsReady=pendingForDecision.every(a=>["apply","defer"].includes(adjustmentDecisionForDate(a,latestDate)));
  const appliedAdjustments=[...(latestDate?appliedAdjustmentsForDate(latestDate,adjustmentCandidates):[]),...autoAdjustments.filter(a=>!appliedAdjustmentsForDate(latestDate,adjustmentCandidates).some(x=>x.id===a.id))];
  const financialReady=financialGreen&&adjustmentsReady;
  const invoice=financialReady&&latestDate?getValidSundayInvoice(latestDate,financial,appliedAdjustments):null;
  return {items,stockGreen,financial,financialGreen,financialReady,adjustmentCandidates,pendingForDecision,adjustmentsReady,appliedAdjustments,invoice,invoiceSaved:!!invoice,paymentSaved:!!paymentForInvoice(invoice)};
}
function renderWizardChrome(state){
  const prog=document.getElementById("wizardProgress"),dots=document.getElementById("wizardDots"),prev=document.getElementById("wizardPrev"),next=document.getElementById("wizardNext");
  if(prog)prog.innerHTML=SUNDAY_STEPS.map((n,i)=>`<div class="wizardStep ${i+1<sundayWizardStep?'done':i+1===sundayWizardStep?'active':''}">${i+1} ${n}</div>`).join("");
  if(dots)dots.innerHTML=SUNDAY_STEPS.map((n,i)=>`<span class="workflowDot ${i+1<sundayWizardStep?'done':i+1===sundayWizardStep?'active':''}" title="${n}"></span>`).join("");
  if(prev){prev.style.visibility=sundayWizardStep<=1?"hidden":"visible";prev.disabled=sundayWizardStep<=1;prev.onclick=()=>{if(sundayWizardStep>1){sundayWizardStep--;renderSundayWizard();window.scrollTo({top:0,behavior:"smooth"})}}}
  let canNext=false;
  if(sundayWizardStep===1)canNext=state.items.length>0;
  else if(sundayWizardStep===2)canNext=state.stockGreen;
  else if(sundayWizardStep===3)canNext=state.financialReady;
  else if(sundayWizardStep===4)canNext=state.invoiceSaved;
  else if(sundayWizardStep===5)canNext=state.paymentSaved;
  if(next){next.disabled=!canNext;next.textContent=sundayWizardStep>=5?'Complete':'Next ›';next.onclick=()=>{if(sundayWizardStep<5&&canNext){sundayWizardStep++;renderSundayWizard();window.scrollTo({top:0,behavior:"smooth"})}else if(sundayWizardStep===5&&canNext){const fresh=currentWizardState();if(completeSundayCycle(fresh)){exitSundayWorkflow();renderDashboardAlerts();}else alert("This Sunday cycle is not ready to complete yet.");}}}
}
function renderStockWizard(items){
  let allGreen=true;
  const focus=sundayConflictFocus;
  const sourceItems=focus?.branch?items.filter(x=>canonicalBranchName(x.report?.branch||"")===canonicalBranchName(focus.branch||"")):items;
  const html=sourceItems.map(({report:r,rec})=>{
    let issues=(rec.details||[]).filter(d=>d.flags?.rowHasStockError||d.flags?.rowHasDeliveryIssue||d.flags?.rowHasMapping||d.flags?.rowHasHistoryPending);
    if(focus?.product){
      const exact=issues.filter(d=>String(d.product||"").trim().toLowerCase()===String(focus.product||"").trim().toLowerCase());
      if(exact.length)issues=exact;
    }
    if(rec.status!=="ok")allGreen=false;
    if(rec.status==="ok"){
      const excludedTopups=(db.deliveries||[]).filter(d=>d.branch===r.branch&&!!d.deliveredAt&&d.date>rec.previousDate&&d.date<=r.date&&businessDeliverySource(d)!==null&&deliveryFromReportBeingChecked(d,r.date));
      const note=excludedTopups.length?`<div class="wizardForensic"><b>Suggested top-up date needs review</b><div>${excludedTopups.length} saved top-up docket${excludedTopups.length===1?' is':'s are'} marked Delivered in the period used to calculate it. ${escapeHtml(r.date)} stock checks exclude those suggested quantities. The completed invoice and docket records are unchanged.</div><div class="wizardActions">${excludedTopups.map(d=>`<button class="btn" type="button" onclick='wizardOpenDeliveryDocket(${JSON.stringify(String(d.id))})'>Review ${escapeHtml(d.date)}</button>`).join('')}</div></div>`:'';
      return `<div class="wizardBranch"><div class="wizardBranchHead"><b>${escapeHtml(r.branch)}</b><span class="reconStatus ok">RECONCILED</span></div><div class="wizardBranchBody"><div class="wizardGood">✓ All ${rec.totalRows} products reconcile with the prior week.</div>${note}</div></div>`;
    }
    const visible=issues.slice(0,12).map(d=>{
      const reason=(d.issues||[])[0]?.msg||"Review this product.";
      const action=d.flags?.rowHasDeliveryIssue?['delivery','Open Delivery Dockets']:d.flags?.rowHasMapping?['mapping','Fix Product Mapping']:d.flags?.rowHasStockError?['import','Open Sunday Report']:['import','Open Sunday Report'];
      const f=d.flow||{};
      const evidence=[['Prior close',f.previousClose],['This opening',f.sheetOpening],['Saved delivery',f.ledgerDeliveries],['Shop delivery',f.shopDeliveries],['Shop sold',f.sheetSold],['This close',f.sheetClosing]].map(([k,v])=>`<div class="wizardEvidenceCell"><div class="k">${k}</div><div class="v">${v==null?'—':escapeHtml(String(v))}</div></div>`).join('');
      let hint='Compare the figures below. The highlighted reason tells you which source needs correcting.';
      if(d.flags?.rowHasDeliveryIssue)hint='Choose which source to check. These buttons open records; they do not alter quantities or delivery status.';
      else if(d.flags?.rowHasStockError)hint='The opening stock should equal the prior Sunday closing stock. Open the Sunday report and verify the shop figures.';
      else if(d.flags?.rowHasMapping)hint='This shop product name is not linked confidently to Pin’s master product. Fix the mapping once, then return here.';
      else if(d.flags?.rowHasHistoryPending)hint='The app cannot prove the prior-week stock chain for this product. Open the Sunday report to check its prior-week row.';
      let actionButtons=`<button class="btn" onclick="event.preventDefault();event.stopPropagation();wizardAction('${action[0]}')">${action[1]}</button>`;
      let finding='';
      if(d.flags?.rowHasDeliveryIssue){
        const candidates=wizardMatchingDockets(r.branch,rec.previousDate,r.date,d.productId||d.flow?.productId||canonicalProductMatchRow((r.rows||[]).find(x=>x.product===d.product)||{}).product?.id);
        finding=wizardForensicFinding(r,rec,d,candidates);
        const docketButtons=candidates.map(({d:source,qty})=>`<button class="btn ${businessDeliverySource(source)===null?'alt':''}" type="button" onclick='wizardOpenDeliveryDocket(${JSON.stringify(String(source.id))})'>${businessDeliverySource(source)===null?'Excluded TEST · ':deliveryFromReportBeingChecked(source,r.date)?'Excluded source top-up · ':''}Docket ${escapeHtml(source.date)} · ${escapeHtml(String(qty))}</button>`).join('');
        actionButtons=`<div class="wizardSourceChoice"><b>1. Check saved delivery${candidates.length===1?'':' dockets'}</b><div class="wizardMinimal">${candidates.length?`${candidates.length} matching delivered docket${candidates.length===1?'':'s'} for this week.`:'No matching delivered docket found; review the archive.'}</div><div class="wizardActions">${docketButtons||`<button class="btn" type="button" onclick="wizardAction('delivery')">Open Delivery Dockets</button>`}</div></div><div class="wizardSourceChoice"><b>2. Check the shop Sunday report</b><div class="wizardMinimal">Verify the delivery column against the shop’s original workbook.</div><div class="wizardActions"><button class="btn" type="button" onclick='wizardOpenSundayReport(${JSON.stringify(String(r.id))})'>Open ${escapeHtml(displayBranchName(r.branch))} · ${escapeHtml(r.date)}</button></div></div>`;
      }
      return `<details class="wizardIssue"><summary><div><div class="wizardIssueTitle">${escapeHtml(d.product)}</div><div class="wizardIssueReason">${escapeHtml(reason)}</div></div><span class="wizardIssueChevron">⌄</span></summary>${finding}<div class="wizardEvidence">${evidence}</div><div class="wizardEvidenceNote">${escapeHtml(hint)}</div><div class="wizardActions wizardSourceActions">${actionButtons}</div></details>`;
    }).join("");
    return `<div class="wizardBranch"><div class="wizardBranchHead"><b>${escapeHtml(r.branch)}</b><span class="reconStatus bad">ACTION REQUIRED</span></div><div class="wizardBranchBody">${visible}${issues.length>12?`<div class="wizardMinimal">+ ${issues.length-12} more items. Resolve the first issues, then return here.</div>`:""}</div></div>`;
  }).join("");
  const focusNote=focus?`<div class="wizardGood" style="margin-bottom:10px;background:#eff6ff;color:#1e3a8a">Conflict focus: ${escapeHtml(displayBranchName(focus.branch||""))}${focus.product?` · ${escapeHtml(focus.product)}`:""}. Only the affected reconciliation item is shown here. Exit or reopen Sunday Workflow normally to see the full week.</div>`:"";
  return focusNote+html+(allGreen?'<div class="wizardGood" style="margin-top:12px">✓ Stock reconciliation complete. Tap Next for the financial check.</div>':'<div class="wizardLocked" style="margin-top:12px">Next stays locked until the stock exception above is resolved.</div>');
}
function renderFinancialWizard(state){
  const financial=state.financial;
  let combined={sales:0,cost:0,profit:0,bm:0,alix:0,pinProfit:0,payPin:0},allGreen=true;
  const html=financial.map(({report:r,result:x})=>{
    if(x.status!=="ok")allGreen=false;
    Object.keys(combined).forEach(k=>combined[k]+=Number(x.totals[k]||0));
    if(x.status==="locked")return `<div class="wizardBranch"><div class="wizardBranchHead"><b>${escapeHtml(r.branch)}</b><span class="reconStatus bad">LOCKED</span></div><div class="wizardBranchBody"><div class="wizardLocked">Complete stock reconciliation first.</div></div></div>`;
    if(x.status==="review"){
      const issues=x.issues.slice(0,10).map(i=>{
        const actions=i.financialIntegrity
          ? `<div class="wizardActions"><button class="btn gold" onclick="resolveFinancialIntegrity('${r.id}')">Resolve mismatch</button><button class="btn alt" onclick="wizardOpenSundayReport('${r.id}')">Open saved report</button></div>`
          : `<div class="wizardActions"><button class="btn" onclick="wizardAction('${i.action}')">${i.action==='mapping'?'Review Product Price':'Review Sunday Report'}</button></div>`;
        return `<div class="financeIssue"><b>${escapeHtml(i.product)}</b><div class="small">${escapeHtml(i.reason)}</div>${actions}</div>`;
      }).join('');
      return `<div class="wizardBranch"><div class="wizardBranchHead"><b>${escapeHtml(r.branch)}</b><span class="reconStatus bad">ACTION REQUIRED</span></div><div class="wizardBranchBody">${issues}${x.issues.length>10?`<div class="wizardMinimal">+ ${x.issues.length-10} more financial issue(s).</div>`:''}</div></div>`;
    }
    const t=x.totals;
    const integrityNote=x.financialIntegrityResolved&&x.financialIntegrity?.status==="mismatch"?`<div class="notice warn" style="margin:8px 0"><b>Spreadsheet total mismatch acknowledged.</b><br><span class="small">Using the calculation from all imported product lines. The original spreadsheet total is preserved for audit.</span></div>`:"";
    return `<div class="wizardBranch"><div class="wizardBranchHead"><b>${escapeHtml(r.branch)}</b><span class="reconStatus ok">FINANCIAL OK</span></div><div class="wizardBranchBody"><div class="wizardGood">✓ Sales, costs and profit shares agree.</div>${integrityNote}<div class="financeSummary"><div class="financeCell"><div class="k">Sales</div><div class="v">${baht(t.sales)}</div></div><div class="financeCell"><div class="k">Pay Pin</div><div class="v">${baht(t.payPin)}</div></div></div><details class="financeDetails"><summary>View calculation</summary><div class="financeSummary"><div class="financeCell"><div class="k">Cost recovery</div><div class="v">${baht(t.cost)}</div></div><div class="financeCell"><div class="k">Profit</div><div class="v">${baht(t.profit)}</div></div><div class="financeCell"><div class="k">BM share</div><div class="v">${baht(t.bm)}</div></div><div class="financeCell"><div class="k">Alix share</div><div class="v">${baht(t.alix)}</div></div><div class="financeCell"><div class="k">Pin profit</div><div class="v">${baht(t.pinProfit)}</div></div></div></details></div></div>`;
  }).join('');
  let adjustmentHtml="";
  const autoCorrections=(state.appliedAdjustments||[]).filter(a=>a.resolution==="next_sunday_auto");
  if(allGreen&&autoCorrections.length){adjustmentHtml+=`<div class="adjustmentPanel"><h3>Correction from previous week</h3>${autoCorrections.map(a=>`<div class="adjustmentRow"><div class="adjustmentTop"><div><b>${escapeHtml(a.description||"Delivery docket correction")}</b><div class="wizardMinimal">From week ending ${escapeHtml(invoiceDateLabel(a.sourceDate))}</div></div><div class="adjustmentAmt ${Number(a.amount)>=0?'pos':'neg'}">${Number(a.amount)>=0?'+':''}${baht(a.amount)}</div></div><div class="adjustmentDecision">This correction is added automatically to this Sunday’s invoice.</div></div>`).join('')}</div>`;}
  if(allGreen&&state.pendingForDecision?.length){
    adjustmentHtml+=`<div class="adjustmentPanel"><h3>Prior adjustment${state.pendingForDecision.length>1?'s':''}</h3><div class="adjustmentIntro">A previous invoice changed after it was saved. Choose what to do this Sunday. This does not change this week's trading figures.</div>${state.pendingForDecision.map(a=>{const d=adjustmentDecisionForDate(a,wizardCycleDate(state));return `<div class="adjustmentRow"><div class="adjustmentTop"><div><b>${escapeHtml(a.oldNumber||'Prior invoice')} adjustment</b><div class="wizardMinimal">From ${escapeHtml(invoiceDateLabel(a.sourceDate))}</div></div><div class="adjustmentAmt ${Number(a.amount)>=0?'pos':'neg'}">${Number(a.amount)>=0?'+':''}${baht(a.amount)}</div></div><div class="adjustmentActions"><button class="${d==='apply'?'selected':''}" onclick="setSundayAdjustmentDecision('${a.id}','apply')">Apply this Sunday</button><button class="${d==='defer'?'selected':''}" onclick="setSundayAdjustmentDecision('${a.id}','defer')">Leave for later</button></div><div class="adjustmentDecision">${d==='apply'?'Will be shown separately on this invoice.':d==='defer'?'Will remain as an alert for a future Sunday.':'Choose one option before continuing.'}</div></div>`}).join('')}</div>`;
  }
  const adjTotal=(state.appliedAdjustments||[]).reduce((n,a)=>n+Number(a.amount||0),0);
  const total=allGreen?`<div class="financeTotal"><b>✓ Financial reconciliation complete</b><div class="wizardMinimal" style="color:#166534;margin-top:3px">Both shops combined</div><div class="big">Pay Pin ${baht(combined.payPin)}</div>${adjTotal?`<div class="wizardMinimal" style="color:#166534">Prior adjustment selected: ${adjTotal>=0?'+':''}${baht(adjTotal)} · Settlement total ${baht(combined.payPin+adjTotal)}</div>`:`<div class="wizardMinimal" style="color:#166534">Sales ${baht(combined.sales)} · Cost recovery ${baht(combined.cost)} · Pin profit ${baht(combined.pinProfit)}</div>`}</div>`:`<div class="wizardLocked">Next stays locked until every financial exception above is resolved.</div>`;
  const gate=allGreen&&!state.adjustmentsReady?`<div class="wizardLocked" style="margin-top:8px">Choose Apply this Sunday or Leave for later for each prior adjustment before continuing.</div>`:"";
  return html+adjustmentHtml+total+gate;
}
function setSundayAdjustmentDecision(id,decision){
  const state=currentWizardState(),date=wizardCycleDate(state),adj=(db.adjustments||[]).find(a=>a.id===id);if(!adj||!date)return;
  if(!adj.workflowDecisions||typeof adj.workflowDecisions!=="object")adj.workflowDecisions={};
  adj.workflowDecisions[date]=decision;localStorage.setItem("mdpin-db",JSON.stringify(db));renderSundayWizard();renderDashboardAlerts();
}
window.setSundayAdjustmentDecision=setSundayAdjustmentDecision;

function sundayInvoiceNumber(date){return "MD-"+String(date||today()).replace(/-/g,"");}
function invoiceDateLabel(date){
  try{return new Date(String(date)+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}catch(e){return date||""}
}
function buildInvoiceCard(state,printMode=false){
  const date=wizardCycleDate(state)||today(),summary=invoiceFinancialSummary(state.financial),saved=state.invoice;
  const number=saved?.number||sundayInvoiceNumber(date);
  if(printMode){
    const branches=summary.branches.map(b=>`<div class="invoiceBranch"><div class="invoiceBranchName">${escapeHtml(displayBranchName(b.branch))}</div><div class="invoiceNums"><div class="invoiceNum"><div class="k">Sales</div><div class="v">${baht(b.sales)}</div></div><div class="invoiceNum"><div class="k">Cost recovery</div><div class="v">${baht(b.cost)}</div></div><div class="invoiceNum"><div class="k">Pin profit share</div><div class="v">${baht(b.pinProfit)}</div></div><div class="invoiceNum"><div class="k">Amount due</div><div class="v">${baht(b.payPin)}</div></div></div></div>`).join("");
    return `<div class="invoiceCard"><div class="invoiceHead"><div><div class="invoiceTitle">Weekly Settlement Invoice</div><div class="wizardMinimal">Week ending ${escapeHtml(invoiceDateLabel(date))}</div></div><div class="invoiceMeta"><b>${escapeHtml(number)}</b><br>${saved?"Saved "+escapeHtml(invoiceDateLabel(saved.createdDate)):"Draft"}</div></div><div class="invoiceFrom"><b>Issued by Yaowaret</b><br>The Grocery by BM + BM Lamai weekly settlement</div><div class="invoiceBranches">${branches}</div><div class="invoiceTotal"><div class="k">Total payable to Pin</div><div class="v">${baht(summary.combined.payPin)}</div></div><div class="invoiceExplain">Verified product cost recovery plus Pin’s profit share. Normal profit split: BM 40% · Alix 30% · Pin 30%. Edibles: BM 40% · Alix 20% · Pin 40%.</div></div>`;
  }
  const branches=summary.branches.map(b=>`<div class="invoiceScreenBranch"><div class="name">${escapeHtml(displayBranchName(b.branch))}</div><div class="mini">Sales ${baht(b.sales)}</div><div class="amt">Due ${baht(b.payPin)}</div></div>`).join("");
  const breakdown=summary.branches.map(b=>`<div class="invoiceNum"><div class="k">${escapeHtml(b.branch)} cost + Pin profit</div><div class="v">${baht(b.cost)} + ${baht(b.pinProfit)}</div></div>`).join("");
  const savedNote=saved?.shopNote?`<div class="invoiceNoteSaved"><b>Note to shop:</b> ${escapeHtml(saved.shopNote)}</div>`:"";
  return `<div class="invoiceCard compactInvoice"><div class="invoiceHead"><div><div class="invoiceTitle">Weekly Settlement Invoice</div><div class="wizardMinimal">Week ending ${escapeHtml(invoiceDateLabel(date))}</div></div><div class="invoiceMeta"><b>${escapeHtml(number)}</b><br>${saved?"Saved":"Draft"}</div></div><div class="invoiceFrom"><b>Issued by Yaowaret</b></div>${branches}<div class="invoiceTotal"><div class="k">Total payable to Pin</div><div class="v">${baht(saved?.totals?.payPin ?? (summary.combined.payPin + (state.appliedAdjustments||[]).reduce((n,a)=>n+Number(a.amount||0),0)))}</div></div>${((saved?.adjustmentsApplied||state.appliedAdjustments||[]).length)?`<div class="invoiceAdjustment"><b>Correction from previous week</b>${(saved?.adjustmentsApplied||state.appliedAdjustments||[]).map(a=>`<div class="invoiceAdjustmentLine"><span>${escapeHtml(a.description||('Week ending '+invoiceDateLabel(a.sourceDate)))}</span><b>${Number(a.amount)>=0?'+':''}${baht(a.amount)}</b></div>`).join('')}</div>`:''}<details class="invoiceScreenDetails"><summary>View invoice breakdown</summary><div class="invoiceNums" style="margin-top:7px">${breakdown}</div><div class="invoiceExplain">Normal profit split: BM 40% · Alix 30% · Pin 30%. Edibles: BM 40% · Alix 20% · Pin 40%.</div></details>${savedNote}<div class="invoiceState"><span class="${saved?'invoiceSaved':'invoiceDraft'}">${saved?'✓ INVOICE SAVED':'DRAFT — NOT SAVED'}</span><span class="wizardMinimal">Sales ${baht(summary.combined.sales)}</span></div></div>`;
}
function latestInvoiceForDate(date){
  return [...(db.invoices||[])].filter(x=>x&&x.reportDate===date&&x.status!=="void").sort((a,b)=>Number(b.version||1)-Number(a.version||1)||String(b.createdAt||"").localeCompare(String(a.createdAt||"")))[0]||null;
}
function postInvoiceDocketEdits(inv){
  if(!inv)return [];
  const created=Date.parse(inv.createdAt||inv.createdDate||"")||0;
  const items=wizardReportsForDate(inv.reportDate);
  const prevDates=items.map(x=>x?.rec?.previousDate).filter(Boolean).sort();
  const prev=prevDates.length?prevDates[0]:"";
  const branches=new Set((inv.branches||[]).map(b=>canonicalBranchName(b.branch)));
  return (db.docketAudit||[]).filter(e=>{
    if(e.action!=="edited")return false;
    const at=Date.parse(e.at||"")||0;if(at<=created)return false;
    const d=String(e.date||e.beforeSnapshot?.date||"");
    if(!d||d>String(inv.reportDate||"")||(prev&&d<=prev))return false;
    const b=canonicalBranchName(e.branch||e.beforeSnapshot?.branch||"");
    return !branches.size||branches.has(b);
  }).sort((a,b)=>String(b.at||"").localeCompare(String(a.at||"")));
}
function invoiceSourceEditAckKey(inv,events){return `${inv.id}:${events.map(e=>e.id).sort().join(",")}`;}
function acknowledgeInvoiceSourceEdits(id){
  const inv=(db.invoices||[]).find(x=>x.id===id);if(!inv)return;
  const events=postInvoiceDocketEdits(inv);
  if(!db.alertAcknowledgements||typeof db.alertAcknowledgements!=="object")db.alertAcknowledgements={};
  db.alertAcknowledgements[invoiceSourceEditAckKey(inv,events)]=new Date().toISOString();
  // v0.10.123 — acknowledgement is also the safe closing action when the
  // edited week is reconciled and the verified invoice difference is exactly zero.
  // This covers older correction records that pre-date pendingCorrections.
  finalizeAcknowledgedZeroDifferenceSourceCorrections(inv.id);
  localStorage.setItem("mdpin-db",JSON.stringify(db));renderDashboardAlerts();renderInvoiceRecord(id);
}
window.acknowledgeInvoiceSourceEdits=acknowledgeInvoiceSourceEdits;

function correctionChangeDescription(c){
 const parts=(c.changes||[]).map(ch=>{
  const before=ch.before?productLineLabel(ch.before):"",after=ch.after?productLineLabel(ch.after):"";
  if(before&&after)return `${before} → ${after}`;
  if(before)return `${before} removed`;
  return after?`${after} added`:"Docket corrected";
 });
 return parts.slice(0,3).join("; ")+(parts.length>3?` +${parts.length-3} more`:"");
}
function makeAutomaticInvoiceRevision(inv,live,correction){
 if(!inv||!live?.financialGreen)return null;
 const summary=live.summary,version=Number(inv.version||1)+1,id="INV"+Date.now(),adjustmentsApplied=(inv.adjustmentsApplied||[]).map(a=>({...a})),adjustmentTotal=adjustmentsApplied.reduce((n,a)=>n+Number(a.amount||0),0),basePayPin=Number(summary.combined.payPin||0);
 const record={...JSON.parse(JSON.stringify(inv)),id,version,createdDate:today(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),signature:live.signature,adjustmentSignature:settlementAdjustmentSignature(adjustmentsApplied),adjustmentsApplied,branches:summary.branches.map(b=>({branch:b.branch,sales:b.sales,cost:b.cost,profit:b.profit,bm:b.bm,alix:b.alix,pinProfit:b.pinProfit,payPin:b.payPin})),totals:{...summary.combined,basePayPin,adjustmentTotal,payPin:basePayPin+adjustmentTotal},supersededBy:null,supersededAt:null,revisionReason:"Delivery docket correction",revisionCorrectionId:correction.id};
 if(inv.sent?.status==="sent")record.sent={status:"not_sent",date:null,note:"Corrected invoice revision — resend to customer"};
 if(inv.payment?.status==="paid")record.payment={...inv.payment,reviewRequired:true,note:[inv.payment.note,"Invoice corrected after payment; review revised amount."].filter(Boolean).join(" · ")};
 inv.supersededBy=id;inv.supersededAt=new Date().toISOString();db.invoices.push(record);return record;
}
function finalizeAcknowledgedZeroDifferenceSourceCorrections(onlyInvoiceId=null){
  if(!Array.isArray(db.pendingCorrections))db.pendingCorrections=[];
  let changed=false;
  (db.invoices||[]).forEach(inv=>{
    if(!inv||inv.supersededBy||(onlyInvoiceId&&inv.id!==onlyInvoiceId))return;
    const events=postInvoiceDocketEdits(inv);
    if(!events.length)return;
    const ackKey=invoiceSourceEditAckKey(inv,events);
    if(!db.alertAcknowledgements?.[ackKey])return;
    const live=currentWizardStateSafeForInvoice(inv.reportDate);
    if(!live?.financialGreen)return;
    const oldBase=Number(inv.totals?.basePayPin ?? (Number(inv.totals?.payPin||0)-Number(inv.totals?.adjustmentTotal||0)));
    const newBase=Number(live.summary?.combined?.payPin||0);
    const delta=+(newBase-oldBase).toFixed(2);
    if(Math.abs(delta)>=0.005)return;
    const all=(db.pendingCorrections||[]).filter(c=>c.invoiceId===inv.id).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
    let c=all.find(c=>['pending','waiting_reconciliation'].includes(c.status))||all.find(c=>c.status==='resolved'&&Math.abs(Number(c.amount||0))<0.005)||null;
    if(!c){
      const latest=events.slice().sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')))[0]||null;
      c={id:'COR'+Date.now()+Math.floor(Math.random()*1000),status:'resolved',docketId:latest?.docketId||null,invoiceId:inv.id,sourceDate:inv.reportDate,choice:'no_financial_change',createdAt:latest?.at||new Date().toISOString(),changes:(latest?.changes||[]).map(ch=>({before:ch.before?{...ch.before}:null,after:ch.after?{...ch.after}:null}))};
      db.pendingCorrections.push(c);
    }
    if(c.status!=='resolved'||Number(c.amount||0)!==0||c.resolvedSignature!==live.signature||c.message!=='No financial change was required.'){
      c.status='resolved';c.amount=0;c.resolvedSignature=live.signature;c.resolvedAt=c.resolvedAt||new Date().toISOString();c.message='No financial change was required.';changed=true;
    }
  });
  return changed;
}

function cleanupKnownRestoredTestSundayCorrection(){
 // v0.10.129: forensic cleanup for the exact Lamai 23-Aug test residue identified
 // from Pin's authoritative 24-Sep backup. This is deliberately ID + amount + source scoped
 // so legitimate Sunday-report corrections are never auto-deleted.
 const correctionId="SRC1789278494941jex",adjustmentId="ADJ1789278494941xi";
 const a=(db.adjustments||[]).find(x=>x?.id===adjustmentId&&x.sourceCorrectionId===correctionId&&x.sourceType==="sunday_report_correction"&&x.branch==="Lamai"&&x.sourceDate==="2026-08-23"&&Math.abs(Number(x.amount||0)+87)<0.005);
 const c=(db.sundaySourceCorrections||[]).find(x=>x?.id===correctionId&&x.adjustmentId===adjustmentId);
 if(!a&&!c)return false;
 if(a)db.adjustments=(db.adjustments||[]).filter(x=>x.id!==adjustmentId);
 if(c){c.status="voided_test_residue";c.voidedAt=c.voidedAt||new Date().toISOString();c.voidReason="Confirmed historical test residue; must not carry into live settlement.";c.adjustmentId=null;}
 return true;
}

function processPendingDocketCorrections(){
 let changed=cleanupKnownRestoredTestSundayCorrection();
 if(!Array.isArray(db.pendingCorrections)||!db.pendingCorrections.length){if(changed)localStorage.setItem("mdpin-db",JSON.stringify(db));return changed;}

 db.pendingCorrections.forEach(c=>{
  const inv=(db.invoices||[]).find(x=>x.id===c.invoiceId);
  // v0.10.128: backups from older builds can resurrect a queued carry-forward even after
  // the source week later reconciles to zero. Revalidate queued auto-corrections before
  // offering them in a new Sunday invoice.
  if(c.status==="queued"&&c.choice==="next_sunday"){
    if(!inv){c.status="error";c.message="Affected invoice could not be found.";changed=true;return;}
    const live=currentWizardStateSafeForInvoice(inv.reportDate);
    if(!live?.financialGreen)return;
    const oldBase=Number(inv.totals?.basePayPin ?? (Number(inv.totals?.payPin||0)-Number(inv.totals?.adjustmentTotal||0)));
    const newBase=Number(live.summary?.combined?.payPin||0);
    const delta=+(newBase-oldBase).toFixed(2);
    c.amount=delta;
    const a=(db.adjustments||[]).find(a=>a.id===c.adjustmentId||a.correctionId===c.id);
    if(Math.abs(delta)<0.005){
      if(a&&a.status==="pending")db.adjustments=db.adjustments.filter(x=>x.id!==a.id);
      c.status="resolved";c.amount=0;c.adjustmentId=null;c.resolvedSignature=live.signature;c.resolvedAt=new Date().toISOString();c.message="No financial difference to carry forward.";changed=true;
    }else if(a&&a.status==="pending"&&Math.abs(Number(a.amount||0)-delta)>=0.005){a.amount=delta;changed=true;}
    return;
  }
  if(!["pending","waiting_reconciliation"].includes(c.status))return;
  if(!inv){c.status="error";c.message="Affected invoice could not be found.";changed=true;return;}
  const live=currentWizardStateSafeForInvoice(inv.reportDate);
  if(!live?.financialGreen){if(c.status!=="waiting_reconciliation"){c.status="waiting_reconciliation";changed=true;}c.message="Waiting for the edited week to reconcile.";return;}
  const oldBase=Number(inv.totals?.basePayPin ?? (Number(inv.totals?.payPin||0)-Number(inv.totals?.adjustmentTotal||0))),newBase=Number(live.summary?.combined?.payPin||0),delta=+(newBase-oldBase).toFixed(2);c.amount=delta;c.description=correctionChangeDescription(c);
  if(c.choice==="update_current"){
    if(Math.abs(delta)<0.005){c.status="resolved";c.amount=0;c.resolvedSignature=live.signature;c.resolvedAt=new Date().toISOString();c.message="No financial change was required.";changed=true;return;}
    const revision=makeAutomaticInvoiceRevision(inv,live,c);if(revision){c.status="resolved";c.revisedInvoiceId=revision.id;c.message=`Updated ${revision.number} v${revision.version}.`;changed=true;}
  }else if(c.choice==="next_sunday"){
    if(Math.abs(delta)<0.005){c.status="resolved";c.amount=0;c.resolvedSignature=live.signature;c.resolvedAt=new Date().toISOString();c.message="No financial difference to carry forward.";changed=true;return;}
    if(!Array.isArray(db.adjustments))db.adjustments=[];
    let a=db.adjustments.find(a=>a.correctionId===c.id);
    if(!a){a={id:"ADJ"+Date.now()+Math.floor(Math.random()*1000),status:"pending",amount:delta,sourceDate:inv.reportDate,oldInvoiceId:inv.id,newInvoiceId:null,oldNumber:inv.number,newNumber:"",createdAt:new Date().toISOString(),resolution:"next_sunday_auto",correctionId:c.id,description:c.description||"Delivery docket correction"};db.adjustments.push(a);}
    c.status="queued";c.adjustmentId=a.id;c.message="Will be added automatically to the next Sunday invoice.";changed=true;
  }
 });
 if(finalizeAcknowledgedZeroDifferenceSourceCorrections())changed=true;
 if(changed)localStorage.setItem("mdpin-db",JSON.stringify(db));return changed;
}
function invoiceRecordState(inv){
  if(!inv)return {label:"UNKNOWN",cls:""};
  if(inv.supersededBy)return {label:"SUPERSEDED",cls:"warn"};
  const tracked=(db.pendingCorrections||[]).find(c=>c.invoiceId===inv.id&&["pending","waiting_reconciliation","queued"].includes(c.status));
  // A saved next-Sunday choice does not make an unreconciled source week current.
  // Only an already-queued adjustment can leave this invoice unchanged.
  if(tracked?.status==="queued"&&tracked.choice==="next_sunday")return {label:"CURRENT",cls:"ok"};
  const state=currentWizardStateSafeForInvoice(inv.reportDate);
  if(state&&state.financialGreen===false)return {label:"UPDATE REQUIRED",cls:"warn"};
  if(state&&state.signature&&inv.signature!==state.signature){
    const zeroResolved=(db.pendingCorrections||[]).find(c=>c.invoiceId===inv.id&&c.status==="resolved"&&Math.abs(Number(c.amount||0))<0.005&&c.resolvedSignature===state.signature);
    if(!zeroResolved)return {label:"UPDATE REQUIRED",cls:"warn"};
  }
  if(inv.payment?.status==="paid")return {label:"PAID",cls:"paid"};
  return {label:"CURRENT",cls:"ok"};
}
function currentWizardStateSafeForInvoice(date){
  try{
    const items=wizardReportsForDate(date);
    if(!items.length)return null;
    const stockGreen=items.every(x=>x.rec.status==="ok");
    const financial=items.map(x=>({report:x.report,result:financialReconcileReport(x.report)}));
    const financialGreen=stockGreen&&financial.length>0&&financial.every(x=>x.result.status==="ok");
    const summary=invoiceFinancialSummary(financial);
    if(!financialGreen)return {signature:null,financialGreen:false,stockGreen,financial,items,summary:null};
    return {signature:invoiceSignature(date,summary),summary,financialGreen:true,financial,items};
  }catch(e){return null;}
}
function addRevisionAdjustment(oldInv,newInv){
  const delta=Number(newInv.totals?.payPin||0)-Number(oldInv.totals?.payPin||0);
  if(Math.abs(delta)<0.005)return;
  if(oldInv.sent?.status!=="sent"&&!oldInv.payment)return;
  if(!Array.isArray(db.adjustments))db.adjustments=[];
  if(db.adjustments.some(a=>a.oldInvoiceId===oldInv.id&&a.newInvoiceId===newInv.id))return;
  db.adjustments.push({id:"ADJ"+Date.now(),status:"pending",amount:+delta.toFixed(2),sourceDate:newInv.reportDate,oldInvoiceId:oldInv.id,newInvoiceId:newInv.id,oldNumber:oldInv.number,newNumber:newInv.number,createdAt:new Date().toISOString(),resolution:null});
}
function ensureDeliverySuggestions(){
  // Legacy compatibility only. v0.10.14 stores suggested deliveries as normal unsent dockets.
  if(!Array.isArray(db.deliverySuggestions))db.deliverySuggestions=[];
}
const SUNDAY_TOPUP_TARGETS={
  "BM Bangrak":{"1g":30,"5g":3,"preroll":15,"hash":10,"gummy":15},
  "Lamai":{"1g":6,"5g":0,"preroll":6,"hash":0,"gummy":0}
};
const SUNDAY_PRODUCT_TARGET_OVERRIDES={
  "BM Bangrak":{"cali mousse 1g":10}
};
function sundaySuggestionProductClass(p){
  const v=effectiveDeliveryVariant(p);
  const n=String((p?.name||"")+" "+(p?.type||"")+" "+(p?.variantLabel||"")).toLowerCase();
  if(v.variantKey==="1g"||v.variantKey==="5g"||v.variantKey==="preroll")return v.variantKey;
  if(n.includes("gummy")||n.includes("edible"))return "gummy";
  if(n.includes("hash")||n.includes("mousse"))return "hash";
  return "other";
}
function sundayTargetForProduct(branch,p,kind,cfg){
  const key=normalizeProductKey(p?.name||"");
  const overrides=SUNDAY_PRODUCT_TARGET_OVERRIDES[branch]||{};
  if(Object.prototype.hasOwnProperty.call(overrides,key))return Number(overrides[key]);
  return Number(cfg[kind]);
}
function productIsOutOfStock(p){return String(p?.stockStatus||"").toLowerCase()==="out_of_stock";}
function sundayStockRisk(report,rr,p,target){
  if(productIsOutOfStock(p))return {explicit:true,reason:"Marked out of stock in Master Products."};
  if(String(p?.stockReviewKeepActiveDate||"")===String(report?.date||""))return null;
  const previous=getPreviousSundayReport(report.branch,report.date,report.id||null);
  if(!previous)return null;
  const prev=previousRowForProduct(previous,rr.product,p);
  if(!prev)return null;
  const closing=Math.max(0,Number(rr.inStock ?? rr.closing ?? 0)||0);
  const prevClosing=Math.max(0,Number(prev.inStock ?? prev.closing ?? 0)||0);
  const sold=Math.max(0,Number(rr.sold ?? 0)||0);
  const deliveredNow=Math.max(0,Number(rr.newDeliver ?? 0)||0);
  const deliveredPrev=Math.max(0,Number(prev.newDeliver ?? 0)||0);
  if(deliveredNow===0 && prevClosing===0 && closing===0 && sold===0){
    return {reason:"Zero stock on consecutive Sundays with no delivery — likely out of stock.",previousStock:prevClosing,currentStock:closing};
  }
  if(deliveredNow===0 && deliveredPrev===0 && closing<prevClosing){
    return {reason:"Shop stock is running down and no delivery is recorded across two Sunday cycles.",previousStock:prevClosing,currentStock:closing};
  }
  return null;
}
function sundaySuggestedBundle(report){
  const branch=canonicalBranchName(report?.branch||"");
  const cfg=SUNDAY_TOPUP_TARGETS[branch]||{};
  const combined=new Map(),reviews=new Map();
  (report?.rows||[]).forEach(rr=>{
    const pm=canonicalProductMatchRow(rr),p=pm.product;
    if(!p)return;
    const kind=sundaySuggestionProductClass(p);
    if(!Object.prototype.hasOwnProperty.call(cfg,kind))return;
    const target=sundayTargetForProduct(branch,p,kind,cfg);
    if(!(target>0))return;
    const closing=Math.max(0,Number(rr.inStock ?? rr.closing ?? 0)||0);
    const qty=Math.max(0,target-closing);
    if(qty<=0)return;
    const risk=sundayStockRisk(report,rr,p,target);
    if(risk?.explicit)return;
    const prices=validatedProductPrices(p)||{cost:Number(p.cost||0),retail:Number(p.retail||0)};
    const base={productId:p.id,productName:p.name,cost:Number(prices.cost||0),retail:Number(prices.retail||0),suggestedTarget:target,sundayClosing:closing,suggestionClass:kind};
    if(risk){
      reviews.set(p.id,{...base,proposedQty:qty,previousStock:Number(risk.previousStock ?? closing),reason:risk.reason});
      return;
    }
    combined.set(p.id,{...base,qty});
  });
  return {
    lines:[...combined.values()].filter(l=>l.qty>0).sort((a,b)=>String(a.productName).localeCompare(String(b.productName),"en",{sensitivity:"base",numeric:true})),
    reviews:[...reviews.values()].sort((a,b)=>String(a.productName).localeCompare(String(b.productName),"en",{sensitivity:"base",numeric:true}))
  };
}
function sundaySuggestedLines(report){return sundaySuggestedBundle(report).lines;}
function suggestedDraftRef(date,branch){
  const d=String(date||today()).replaceAll("-","").slice(2);
  const b=canonicalBranchName(branch)==="Lamai"?"LAM":"BAN";
  return `SD-${d}-${b}`;
}
function isSuggestedDraftDocket(d){
  return !!d &&
    !!d.generatedFromSundaySuggestion &&
    !d.deliveredAt &&
    !d.suggestedSupersededAt;
}
function migrateLegacyDeliverySuggestions(){
  ensureDeliverySuggestions();
  if(!db.deliverySuggestions.length)return false;
  let changed=false;
  db.deliverySuggestions.forEach(s=>{
    if(!s?.branch||!s?.sourceSundayDate||!(s.lines||[]).length)return;
    const existing=(db.deliveries||[]).find(d=>
      d.generatedFromSundaySuggestion &&
      d.sourceSundayDate===s.sourceSundayDate &&
      canonicalBranchName(d.branch)===canonicalBranchName(s.branch)
    );
    if(existing)return;
    const d={
      id:"D"+Date.now()+Math.random().toString(36).slice(2,5),
      branch:s.branch,
      date:s.date||today(),
      note:s.note||`Suggested from sales for week ending ${s.sourceSundayDate}`,
      lines:(s.lines||[]).map(l=>({...l})),
      deliveredAt:null,
      lineChanges:[],
      generatedFromSundaySuggestion:true,
      sourceSundayDate:s.sourceSundayDate,
      suggestedRef:suggestedDraftRef(s.sourceSundayDate,s.branch),
      createdAt:s.createdAt||new Date().toISOString()
    };
    db.deliveries.push(d);
    changed=true;
  });
  if(db.deliverySuggestions.length){
    db.deliverySuggestions=[];
    changed=true;
  }
  if(changed)localStorage.setItem("mdpin-db",JSON.stringify(db));
  return changed;
}
function refreshSundayDeliverySuggestions(state,date){
  if(!date||!state?.items?.length)return;
  migrateLegacyDeliverySuggestions();

  const nowIso=new Date().toISOString();

  // First retire/remove prior-week generated drafts.
  db.deliveries=(db.deliveries||[]).filter(d=>{
    if(!d?.generatedFromSundaySuggestion || d.deliveredAt)return true;
    const source=String(d.sourceSundayDate||d.date||"");
    if(source===String(date))return true;

    if(d.userEditedSuggestedDraft){
      d.suggestedSupersededAt=d.suggestedSupersededAt||nowIso;
      d.suggestedSupersededByDate=String(date);
      return true;
    }
    return false;
  });

  state.items.forEach(({report})=>{
    const branch=canonicalBranchName(report.branch);
    const bundle=sundaySuggestedBundle(report),lines=bundle.lines,reviews=bundle.reviews;

    const sameBranch=(db.deliveries||[]).filter(d=>
      d.generatedFromSundaySuggestion &&
      String(d.sourceSundayDate||"")===String(date) &&
      canonicalBranchName(d.branch)===branch &&
      !d.deliveredAt
    );

    // A manually edited current suggestion is history, not the calculated source of truth.
    // Preserve it, mark it superseded, and create a fresh calculated suggestion.
    sameBranch.forEach(d=>{
      if(d.userEditedSuggestedDraft){
        d.suggestedSupersededAt=d.suggestedSupersededAt||nowIso;
        d.suggestedSupersededByDate=String(date);
      }
    });

    const activeExisting=sameBranch.find(d=>!d.userEditedSuggestedDraft && !d.suggestedSupersededAt);

    if(activeExisting){
      activeExisting.lines=lines.map(l=>({...l}));
      activeExisting.stockReviewLines=reviews.map(l=>({...l}));
      activeExisting.updatedAt=nowIso;
      activeExisting.note=`Sunday top-up to configured target stock for week ending ${date}`;
      activeExisting.suggestedRef=activeExisting.suggestedRef||suggestedDraftRef(date,branch);
      activeExisting.generatedFromSundaySuggestion=true;
      activeExisting.suggestionMethod="target-stock-topup-v3";
      return;
    }

    db.deliveries.push({
      id:"D"+Date.now()+Math.random().toString(36).slice(2,5),
      branch,
      date:today(),
      note:`Sunday top-up to configured target stock for week ending ${date}`,
      lines:lines.map(l=>({...l})),
      stockReviewLines:reviews.map(l=>({...l})),
      deliveredAt:null,
      lineChanges:[],
      generatedFromSundaySuggestion:true,
      sourceSundayDate:date,
      suggestedRef:suggestedDraftRef(date,branch),
      suggestionMethod:"target-stock-topup-v3",
      createdAt:nowIso,
      updatedAt:nowIso
    });
  });

  // Safety reconciliation: at most one active calculated suggestion per branch/date.
  const seen=new Set();
  (db.deliveries||[]).forEach(d=>{
    if(!isSuggestedDraftDocket(d))return;
    const key=`${String(d.sourceSundayDate||"")}|${canonicalBranchName(d.branch)}`;
    if(seen.has(key)){
      d.suggestedSupersededAt=d.suggestedSupersededAt||nowIso;
      d.suggestedSupersededByDate=String(date);
    }else{
      seen.add(key);
    }
  });
}
function bootstrapLatestSavedInvoiceSuggestions(){
  migrateLegacyDeliverySuggestions();
  if(db.deliverySuggestionBootstrapVersion==="0.10.21")return;

  const latest=[...(db.invoices||[])]
    .filter(i=>i&&!i.supersededBy&&i.status!=="void"&&i.reportDate)
    .sort((a,b)=>String(b.reportDate).localeCompare(String(a.reportDate))||Number(b.version||1)-Number(a.version||1))[0];
  if(!latest)return;

  const items=wizardReportsForDate(latest.reportDate);
  if(items.length){
    refreshSundayDeliverySuggestions({items},latest.reportDate);
    db.deliverySuggestionBootstrapDoneV2=true;
    db.deliverySuggestionBootstrapVersion="0.10.21";
    localStorage.setItem("mdpin-db",JSON.stringify(db));
  }
}
window.openSuggestedDraftFromDashboard=id=>{
  const d=(db.deliveries||[]).find(x=>x.id===id);
  if(!d)return alert("Suggested delivery docket not found.");

  // Clear any create/edit state first so Dashboard routing is deterministic.
  try{
    if(typeof setDeliveryView==="function")setDeliveryView("archive");
  }catch(err){console.warn("Delivery view reset failed",err)}

  try{
    if(typeof switchTab==="function")switchTab("docket");
  }catch(err){console.warn("Delivery tab switch failed",err)}

  // Let the DOM/view state settle before expanding the requested saved docket.
  requestAnimationFrame(()=>{
    setTimeout(()=>{
      try{
        if(typeof renderDocketArchive==="function")renderDocketArchive(id);
        else openDeliveryArchive(id);
      }catch(err){
        console.error("Suggested docket open failed",err);
        openDeliveryArchive(id);
      }
    },40);
  });
};

function saveSundayInvoice(){
  const state=currentWizardState();
  if(!state.financialGreen||!state.items.length)return alert("Financial reconciliation must be complete before saving the invoice.");
  if(!state.adjustmentsReady)return alert("Choose what to do with each prior adjustment before saving the invoice.");
  const date=wizardCycleDate(state),summary=invoiceFinancialSummary(state.financial),sig=invoiceSignature(date,summary),baseNumber=sundayInvoiceNumber(date);
  if(!Array.isArray(db.invoices))db.invoices=[];
  const latest=latestInvoiceForDate(date),adjSig=settlementAdjustmentSignature(state.appliedAdjustments||[]);
  const latestAdjSig=latest?(latest.adjustmentSignature||settlementAdjustmentSignature(latest.adjustmentsApplied||[])):"";
  if(latest&&latest.signature===sig&&latestAdjSig===adjSig){
    refreshSundayDeliverySuggestions(state,date);
    localStorage.setItem("mdpin-db",JSON.stringify(db));
    renderSundayWizard();renderDocketArchive();return;
  }
  const noteEl=document.getElementById("invoiceShopNote"),shopNote=(noteEl?noteEl.value:(latest?.shopNote||"")).trim();
  const version=latest?Number(latest.version||1)+1:1,id="INV"+Date.now();
  const adjustmentTotal=(state.appliedAdjustments||[]).reduce((n,a)=>n+Number(a.amount||0),0);
  const adjustmentSnapshots=(state.appliedAdjustments||[]).map(a=>({id:a.id,amount:Number(a.amount||0),sourceDate:a.sourceDate,oldNumber:a.oldNumber||"",newNumber:a.newNumber||"",description:a.description||"",resolution:a.resolution||""}));
  const totals={...summary.combined,basePayPin:summary.combined.payPin,adjustmentTotal,payPin:summary.combined.payPin+adjustmentTotal};
  const record={id,number:baseNumber,version,reportDate:date,createdDate:today(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:"unpaid",signature:sig,adjustmentSignature:adjSig,adjustmentsApplied:adjustmentSnapshots,shopNote,sent:{status:"not_sent",date:null,note:""},branches:summary.branches.map(b=>({branch:b.branch,sales:b.sales,cost:b.cost,profit:b.profit,bm:b.bm,alix:b.alix,pinProfit:b.pinProfit,payPin:b.payPin})),totals};
  if(latest&&(latest.signature!==sig||latestAdjSig!==adjSig)){latest.supersededBy=id;latest.supersededAt=new Date().toISOString();addRevisionAdjustment(latest,record);}
  db.invoices.push(record);
  refreshSundayDeliverySuggestions(state,date);
  (state.appliedAdjustments||[]).forEach(a=>{if(!Array.isArray(a.appliedHistory))a.appliedHistory=[];if(a.appliedToInvoiceId&&a.appliedToInvoiceId!==id)a.appliedHistory.push({invoiceId:a.appliedToInvoiceId,date:a.appliedToDate,at:a.resolvedAt||new Date().toISOString()});a.status="applied";if(a.resolution!=="next_sunday_auto")a.resolution="carry_forward";a.appliedToInvoiceId=id;a.appliedToDate=date;a.resolvedAt=new Date().toISOString();});
  localStorage.setItem("mdpin-db",JSON.stringify(db));renderSundayWizard();renderHistory();renderDashboardAlerts();
  offerSundayCompletionBackup();
}
function pdfEscapeText(v){return String(v??"").replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)").replace(/[\r\n]+/g," ");}
function pdfAscii(v){
  return String(v??"").normalize?String(v??"").normalize("NFKD").replace(/[^\x20-\x7E]/g," "):String(v??"").replace(/[^\x20-\x7E]/g," ");
}
function pdfMoney(v){
  const n=Number(v||0);return "THB "+n.toLocaleString("en-US",{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2});
}
function pdfWrap(text,maxChars=78){
  const words=pdfAscii(text).trim().split(/\s+/).filter(Boolean),out=[];let line="";
  words.forEach(w=>{const next=line?line+" "+w:w;if(next.length>maxChars&&line){out.push(line);line=w}else line=next;});
  if(line)out.push(line);return out.length?out:[""];
}
function buildSundayInvoicePdfBytes(invoice){
  const c=[];
  const esc=t=>pdfEscapeText(pdfAscii(t));
  const txt=(text,x,y,size=11,bold=false,r=0.09,g=0.13,b=0.20)=>{
    c.push(`${r} ${g} ${b} rg BT /F${bold?2:1} ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET`);
  };
  const rect=(x,y,w,h,fillR,fillG,fillB,strokeR=null,strokeG=null,strokeB=null,line=1)=>{
    c.push('q');
    if(fillR!==null)c.push(`${fillR} ${fillG} ${fillB} rg`);
    if(strokeR!==null)c.push(`${strokeR} ${strokeG} ${strokeB} RG ${line} w`);
    c.push(`${x} ${y} ${w} ${h} re ${fillR!==null?(strokeR!==null?'B':'f'):'S'}`);
    c.push('Q');
  };
  const line=(x1,y1,x2,y2,r=.86,g=.88,b=.91,w=.8)=>c.push(`q ${r} ${g} ${b} RG ${w} w ${x1} ${y1} m ${x2} ${y2} l S Q`);
  const money=v=>pdfMoney(v);
  const pageLeft=42,pageRight=553,pageWidth=511;

  // Header
  txt('WEEKLY SETTLEMENT INVOICE',pageLeft,785,22,true);
  txt('Week ending '+invoiceDateLabel(invoice.reportDate),pageLeft,762,11,false,.38,.42,.50);
  txt((invoice.number||'')+(Number(invoice.version||1)>1?' v'+Number(invoice.version||1):''),455,786,10,true,.38,.42,.50);
  txt('Saved '+invoiceDateLabel(invoice.createdDate||invoice.reportDate),455,769,9,false,.38,.42,.50);
  line(pageLeft,747,pageRight,747);
  txt('Issued by Yaowaret',pageLeft,726,11,true);
  txt('The Grocery by BM + BM Lamai weekly settlement',pageLeft,708,10,false,.28,.32,.40);

  // Branch cards styled to match the on-screen v0.9.30 invoice.
  let top=679;
  (invoice.branches||[]).forEach((b,idx)=>{
    const h=116,y=top-h;
    rect(pageLeft,y,pageWidth,h,.995,.997,1,.87,.89,.92,.9);
    txt(displayBranchName(b.branch),pageLeft+16,top-24,14,true);

    const gap=10,innerX=pageLeft+16,innerW=pageWidth-32,cellW=(innerW-gap)/2,cellH=31;
    const row1Y=top-67,row2Y=top-104;
    const drawCell=(x,y,label,value)=>{
      rect(x,y,cellW,cellH,.972,.978,.986,null,null,null);
      txt(label.toUpperCase(),x+10,y+18,7.5,true,.38,.42,.50);
      txt(value,x+10,y+5,11.5,true);
    };
    drawCell(innerX,row1Y,'Sales',money(b.sales));
    drawCell(innerX+cellW+gap,row1Y,'Cost recovery',money(b.cost));
    drawCell(innerX,row2Y,'Pin profit share',money(b.pinProfit));
    drawCell(innerX+cellW+gap,row2Y,'Amount due',money(b.payPin));
    top=y-14;
  });

  // Carry-forward adjustments stay separate from current-week trading.
  const pdfAdjustments=invoice.adjustmentsApplied||[];
  if(pdfAdjustments.length){
    txt('CORRECTION FROM PREVIOUS WEEK',pageLeft,top-18,8.5,true,.55,.25,.08);
    pdfAdjustments.forEach((a,idx)=>txt((a.description||invoiceDateLabel(a.sourceDate))+'  '+(Number(a.amount)>=0?'+':'')+money(a.amount),pageLeft+145,top-18-(idx*12),8.5,true,.20,.24,.31));
    top-=Math.max(26,pdfAdjustments.length*12+12);
  }
  // Prominent total panel.
  const totalY=top-67;
  rect(pageLeft,totalY,pageWidth,58,.09,.13,.20,null,null,null);
  txt('TOTAL PAYABLE TO PIN',pageLeft+16,totalY+38,9.5,true,.78,.81,.86);
  txt(money(invoice.totals?.payPin||0),pageLeft+16,totalY+13,22,true,1,1,1);
  txt('Total sales '+money(invoice.totals?.sales||0),418,totalY+20,8.5,false,.78,.81,.86);

  let bodyY=totalY-24;
  txt("Verified product cost recovery plus Pin's profit share.",pageLeft,bodyY,9.5,false,.38,.42,.50); bodyY-=15;
  txt('Normal profit split: BM 40% / Alix 30% / Pin 30%.  Edibles: BM 40% / Alix 20% / Pin 40%.',pageLeft,bodyY,8.8,false,.38,.42,.50); bodyY-=23;

  if(invoice.shopNote){
    line(pageLeft,bodyY+9,pageRight,bodyY+9); bodyY-=8;
    txt('NOTE TO SHOP',pageLeft,bodyY,9,true,.55,.25,.08); bodyY-=16;
    for(const row of pdfWrap(invoice.shopNote,94).slice(0,7)){
      txt(row,pageLeft,bodyY,9.5,false,.20,.24,.31); bodyY-=14;
    }
  }

  // Footer kept subtle; no extra attachment or helper document is generated.
  line(pageLeft,53,pageRight,53,.90,.91,.93,.7);
  txt('Verified and saved by Yaowaret',pageLeft,37,7.5,false,.48,.51,.57);
  txt((invoice.number||'')+(Number(invoice.version||1)>1?' v'+Number(invoice.version||1):'')+'  •  Page 1 of 1',445,37,7.5,false,.48,.51,.57);

  const content=c.join('\n');
  const objs=[];
  objs[1]='<< /Type /Catalog /Pages 2 0 R >>';
  objs[2]='<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objs[3]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>';
  objs[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objs[5]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
  objs[6]=`<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`;
  let pdf='%PDF-1.4\n%MDPIN\n',offsets=[0];
  for(let i=1;i<=6;i++){offsets[i]=new TextEncoder().encode(pdf).length;pdf+=`${i} 0 obj\n${objs[i]}\nendobj\n`;}
  const xref=new TextEncoder().encode(pdf).length;
  pdf+='xref\n0 7\n0000000000 65535 f \n';
  for(let i=1;i<=6;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
  pdf+=`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
async function shareInvoicePDF(inv){
  if(!inv)return alert("Invoice record not found.");
  try{
    const bytes=buildSundayInvoicePdfBytes(inv);
    const blob=new Blob([bytes],{type:"application/pdf"});
    const v=Number(inv.version||1)>1?` v${Number(inv.version||1)}`:"";
    const filename=`Invoice - The Grocery by BM + BM Lamai - ${invoiceDateLabel(inv.reportDate).replace(/\s+/g," ")}${v}.pdf`;
    const file=new File([blob],filename,{type:"application/pdf"});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file]});return;}
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.rel="noopener";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(err){if(err&&err.name==="AbortError")return;console.error(err);alert("The PDF could not be created. Please try again.");}
}
async function createSundayInvoicePDF(){const state=currentWizardState();if(!state.invoiceSaved||!state.invoice)return alert("Save the verified invoice first.");return shareInvoicePDF(state.invoice);}
function markInvoiceSent(id,status){
  const inv=(db.invoices||[]).find(x=>x.id===id);if(!inv)return;
  const date=document.getElementById("invoiceSentDate")?.value||today();
  const note=(document.getElementById("invoiceSentNote")?.value||"").trim();
  inv.sent=status==="sent"?{status:"sent",date,note,savedAt:new Date().toISOString()}:{status:"not_sent",date:null,note:"",savedAt:new Date().toISOString()};
  localStorage.setItem("mdpin-db",JSON.stringify(db));renderInvoiceRecord(id);renderHistory();renderDashboardAlerts();
}
function invoiceViewerPaymentStatus(id,status){
  const paid=status==="paid";
  const paidBtn=document.getElementById("viewerPaidBtn"),unpaidBtn=document.getElementById("viewerUnpaidBtn"),fields=document.getElementById("viewerPaidFields");
  if(paidBtn){paidBtn.classList.toggle("activePaid",paid);paidBtn.setAttribute("aria-pressed",paid?"true":"false");}
  if(unpaidBtn){unpaidBtn.classList.toggle("activeUnpaid",!paid);unpaidBtn.setAttribute("aria-pressed",paid?"false":"true");}
  const statusEl=document.getElementById("viewerPaymentStatus");if(statusEl)statusEl.value=paid?"paid":"unpaid";
  if(fields)fields.style.display=paid?"grid":"none";
}
function invoiceViewerPaymentMethodChanged(){
  const method=document.getElementById("viewerPaymentMethod")?.value||"";
  const wrap=document.getElementById("viewerPaymentOtherWrap");if(wrap)wrap.style.display=method==="other"?"block":"none";
}
function saveInvoiceViewerPayment(id){
  const inv=(db.invoices||[]).find(x=>x.id===id);if(!inv)return alert("Invoice record not found.");
  const status=document.getElementById("viewerPaymentStatus")?.value||"unpaid";
  const paid=status==="paid";
  const date=document.getElementById("viewerPaymentDate")?.value||"";
  const method=document.getElementById("viewerPaymentMethod")?.value||"";
  const other=(document.getElementById("viewerPaymentOther")?.value||"").trim();
  const note=(document.getElementById("viewerPaymentNote")?.value||"").trim();
  if(paid&&!date)return alert("Choose the payment date before marking this invoice paid.");
  if(paid&&!method)return alert("Choose the payment method before marking this invoice paid.");
  if(paid&&method==="other"&&!other)return alert("Enter the payment method.");
  inv.status=paid?"paid":"unpaid";
  inv.payment={status:paid?"paid":"unpaid",date:paid?date:null,method:paid?method:null,methodOther:paid&&method==="other"?other:"",note,savedAt:new Date().toISOString()};
  localStorage.setItem("mdpin-db",JSON.stringify(db));
  renderInvoiceRecord(id);renderHistory();renderDashboardAlerts();
}
window.invoiceViewerPaymentStatus=invoiceViewerPaymentStatus;
window.invoiceViewerPaymentMethodChanged=invoiceViewerPaymentMethodChanged;
window.saveInvoiceViewerPayment=saveInvoiceViewerPayment;




let conflictWizardInvoiceId=null;
const CONFLICT_WIZARD_RESUME_KEY="mdpin-conflict-wizard-resume";
function conflictWizardInvoice(){return (db.invoices||[]).find(x=>x.id===conflictWizardInvoiceId)||null;}
function conflictWizardCorrection(inv){return [...(db.pendingCorrections||[])].filter(c=>c.invoiceId===inv?.id).sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")))[0]||null;}
function conflictWizardEnsure(){let o=document.getElementById('conflictWizardOverlay');if(o)return o;o=document.createElement('div');o.id='conflictWizardOverlay';o.className='conflictWizardOverlay';o.innerHTML=`<div class="conflictWizardTop"><div class="conflictWizardTopTitle"><b>Conflict Resolution Workflow</b><span id="conflictWizardSubtitle">Guided repair</span></div><button class="conflictWizardClose" type="button" onclick="closeConflictResolutionWizard()">×</button></div><div class="conflictWizardProgress" id="conflictWizardProgress"></div><div class="conflictWizardBody" id="conflictWizardBody"></div>`;document.body.appendChild(o);return o;}
function conflictWizardFinalText(inv,c){if(!c)return 'No active correction record was found.';if(c.status==='queued')return c.amount!=null?`Resolved for this invoice. The current invoice stays unchanged and ${c.amount>=0?'+':''}${baht(c.amount)} is queued for the next Sunday cycle.`:'Resolved for this invoice. The correction is queued for the next Sunday cycle.';if(c.status==='resolved'){if(c.revisedInvoiceId){const r=(db.invoices||[]).find(x=>x.id===c.revisedInvoiceId);return r?`Resolved. Corrected invoice ${r.number} v${Number(r.version||1)} was created.`:'Resolved. A corrected invoice revision was created.';}return c.message||'Resolved. No further action is required.';}return c.message||'Correction is still in progress.';}
function renderConflictResolutionWizard(){
 const o=conflictWizardEnsure(),b=document.getElementById('conflictWizardBody'),p=document.getElementById('conflictWizardProgress'),inv=conflictWizardInvoice();if(!inv){b.innerHTML='<div class="conflictWizardCard danger"><div class="conflictWizardTitle">Invoice not found</div></div>';return;}
 processPendingDocketCorrections();
 const live=currentWizardStateSafeForInvoice(inv.reportDate),ctx=invoiceReviewContext(inv),c=conflictWizardCorrection(inv),resolved=!!c&&['resolved','queued'].includes(c.status),sourceDocket=ctx.latestEdit?.docketId?(db.deliveries||[]).find(d=>d.id===ctx.latestEdit.docketId):null;
 const step=resolved?4:(!live?.financialGreen?2:3);const names=['Understand','Fix source','Decision','Result'];p.innerHTML=names.map((n,i)=>`<div class="conflictWizardStep ${i+1<step?'done':i+1===step?'active':''}">${i+1}<br>${n}</div>`).join('');document.getElementById('conflictWizardSubtitle').textContent=`${inv.number||'Invoice'} · week ending ${invoiceDateLabel(inv.reportDate)}`;
 let html=`<div class="conflictWizardCard ${resolved?'good':'caution'}"><div class="conflictWizardStatus">${resolved?'✓ RESOLVED':'GUIDED REVIEW'}</div><div class="conflictWizardTitle">${resolved?'Correction completed':'What happened'}</div><div class="conflictWizardText">${resolved?escapeHtml(conflictWizardFinalText(inv,c)):escapeHtml(ctx.changeText||'A linked delivery docket was edited after this invoice was saved.')}</div><div class="conflictWizardFacts"><div class="conflictWizardFact"><div class="k">Invoice</div><div class="v">${escapeHtml(inv.number||'—')}</div></div><div class="conflictWizardFact"><div class="k">Week ending</div><div class="v">${escapeHtml(invoiceDateLabel(inv.reportDate))}</div></div><div class="conflictWizardFact"><div class="k">Affected docket</div><div class="v">${escapeHtml(sourceDocket?`${invoiceDateLabel(sourceDocket.date)} · ${displayBranchName(sourceDocket.branch)}`:(ctx.date?`${invoiceDateLabel(ctx.date)} · ${ctx.branch}`:'—'))}</div></div><div class="conflictWizardFact"><div class="k">Status</div><div class="v">${resolved?'Resolved':live?.financialGreen?'Ready for final handling':'Needs reconciliation'}</div></div></div>${sourceDocket&&!resolved?`<div class="conflictWizardActions"><button class="btn alt" onclick="conflictWizardOpenDocket('${sourceDocket.id}')">Open affected docket</button></div>`:''}</div>`;
 if(resolved){html+=`<div class="conflictWizardCard good"><div class="conflictWizardTitle">Final result</div><div class="conflictWizardResult">${escapeHtml(conflictWizardFinalText(inv,c))}</div><div class="conflictWizardActions"><button class="btn gold" onclick="closeConflictResolutionWizard();renderInvoiceRecord('${inv.id}')">Return to invoice</button><button class="btn alt" onclick="closeConflictResolutionWizard();switchTab('home');renderDashboardAlerts()">Dashboard</button></div></div>`;b.innerHTML=html;return;}
 if(!live?.financialGreen){html+=`<div class="conflictWizardCard danger"><div class="conflictWizardStatus">ACTION REQUIRED</div><div class="conflictWizardTitle">Fix the reconciliation first</div><div class="conflictWizardText">The edited week is out of balance. Open the affected source, correct it, then return here and recheck. The app will not calculate a money difference until the week reconciles.</div><div class="conflictWizardActions">${sourceDocket?`<button class="btn gold" onclick="conflictWizardOpenDocket('${sourceDocket.id}')">Open affected docket</button>`:''}<button class="btn gold" onclick="conflictWizardOpenSunday('${inv.id}')">Open Sunday reconciliation</button><button class="btn" onclick="conflictWizardRecheck()">Recheck now</button><button class="btn alt" onclick="closeConflictResolutionWizard()">Leave unresolved</button></div></div>`;b.innerHTML=html;return;}
 if(c&&['pending','waiting_reconciliation'].includes(c.status)){if(invoiceIsPaid(inv))c.choice='next_sunday';html+=`<div class="conflictWizardCard caution"><div class="conflictWizardStatus">READY TO RESOLVE</div><div class="conflictWizardTitle">Choose the final handling</div><div class="conflictWizardText">The week reconciles again. ${invoiceIsPaid(inv)?'This invoice is already paid, so it must stay unchanged and any verified difference will carry forward.':'Choose whether the verified correction belongs in this invoice or the next Sunday cycle.'}</div>${invoiceIsPaid(inv)?'<div class="conflictWizardResult">Paid invoice protected — carry forward to next Sunday.</div>':`<div class="conflictWizardActions"><button class="btn ${c.choice==='update_current'?'gold':'alt'}" onclick="conflictWizardChoose('${c.id}','update_current')">Update this invoice</button><button class="btn ${c.choice==='next_sunday'?'gold':'alt'}" onclick="conflictWizardChoose('${c.id}','next_sunday')">Add to next Sunday</button></div>`}<div class="conflictWizardActions"><button class="btn gold" ${c.choice?'':'disabled'} onclick="conflictWizardApply('${c.id}')">Apply resolution</button><button class="btn alt" onclick="closeConflictResolutionWizard()">Decide later</button></div></div>`;}else{html+=`<div class="conflictWizardCard caution"><div class="conflictWizardTitle">Recheck the correction</div><div class="conflictWizardText">The week is balanced but there is no active correction decision. Open the affected docket and save the required correction choice.</div>${sourceDocket?`<div class="conflictWizardActions"><button class="btn gold" onclick="conflictWizardOpenDocket('${sourceDocket.id}')">Open affected docket</button></div>`:''}</div>`;}b.innerHTML=html;
}
function openConflictResolutionWizard(id){conflictWizardInvoiceId=id;sessionStorage.setItem(CONFLICT_WIZARD_RESUME_KEY,id);conflictWizardEnsure().style.display='flex';renderConflictResolutionWizard();}
function closeConflictResolutionWizard(){const o=document.getElementById('conflictWizardOverlay');if(o)o.style.display='none';renderConflictResumeChip();}
function renderConflictResumeChip(){
 let c=document.getElementById('conflictResumeChip'),id=sessionStorage.getItem(CONFLICT_WIZARD_RESUME_KEY);
 const inv=(db.invoices||[]).find(x=>x.id===id);
 const correction=inv?conflictWizardCorrection(inv):null;
 if(id&&(!inv||correction&&['resolved','queued'].includes(correction.status))){
   sessionStorage.removeItem(CONFLICT_WIZARD_RESUME_KEY);
   id=null;
 }
 const editing=!!editingDocketId||document.body.classList.contains('deliveryMode');
 const onDashboard=!!document.getElementById('home')?.classList.contains('active');
 const inSundayWorkflow=document.body.classList.contains('workflowMode')||!!document.getElementById('sundayWizard')?.classList.contains('active');
 // Never cover delivery-editor or Sunday-workflow controls. Dashboard already has its own Resume button.
 if(!id||editing||onDashboard||inSundayWorkflow){if(c)c.remove();return;}
 if(!c){c=document.createElement('button');c.id='conflictResumeChip';c.className='conflictResumeChip';c.type='button';document.body.appendChild(c);}
 c.textContent='Resume conflict resolution';c.onclick=()=>openConflictResolutionWizard(id);
}
function conflictWizardOpenDocket(id){closeConflictResolutionWizard();editDocket(id);}
function conflictWizardOpenSunday(id){
 const inv=(db.invoices||[]).find(x=>x.id===id);if(!inv)return;
 const c=conflictWizardCorrection(inv),ctx=invoiceReviewContext(inv);
 const docketId=c?.docketId||ctx.latestEdit?.docketId||null;
 const d=docketId?(db.deliveries||[]).find(x=>x.id===docketId):null;
 const ch=(c?.changes||ctx.latestEdit?.changes||[])[0]||null;
 const line=ch?.after||ch?.before||null;
 const prod=line?.productId?(resolvedProductById(line.productId)||db.products.find(x=>x.id===line.productId)):null;
 const focus={branch:d?.branch||ctx.branch||"",product:prod?deliveryProductDisplayName(prod):(line?.productName||"")};
 closeConflictResolutionWizard();
 openSundayWizard(inv.reportDate,focus);sundayWizardStep=2;renderSundayWizard();
 setTimeout(()=>{const wc=document.getElementById('wizardContent');if(wc)wc.scrollTop=0;},60);
}
function conflictWizardChoose(id,choice){const c=(db.pendingCorrections||[]).find(x=>x.id===id);if(!c)return;c.choice=choice;localStorage.setItem('mdpin-db',JSON.stringify(db));renderConflictResolutionWizard();}
function conflictWizardApply(id){const c=(db.pendingCorrections||[]).find(x=>x.id===id);if(!c)return;const inv=(db.invoices||[]).find(x=>x.id===c.invoiceId);if(invoiceIsPaid(inv))c.choice='next_sunday';if(!c.choice)return alert('Choose how the correction should be handled first.');localStorage.setItem('mdpin-db',JSON.stringify(db));processPendingDocketCorrections();renderDashboardAlerts();renderConflictResolutionWizard();}
function conflictWizardRecheck(){
  const inv=conflictWizardInvoice();if(!inv)return;
  try{refreshReconciliationViews();}catch(e){console.warn('Conflict recheck refresh',e)}
  processPendingDocketCorrections();
  const live=currentWizardStateSafeForInvoice(inv.reportDate);
  if(live?.financialGreen){
    renderConflictResolutionWizard();
    const body=document.getElementById('conflictWizardBody');
    if(body)body.insertAdjacentHTML('afterbegin','<div class="conflictWizardCard good"><div class="conflictWizardStatus">✓ RECHECK PASSED</div><div class="conflictWizardTitle">The week reconciles again</div><div class="conflictWizardText">Step 2 is complete. Continue to the Decision step below.</div></div>');
    return;
  }
  const badStock=(live?.items||[]).filter(x=>x?.rec?.status!=="ok");
  const badFin=(live?.financial||[]).filter(x=>x?.result?.status!=="ok");
  const labels=[...new Set([...badStock.map(x=>displayBranchName(x.report?.branch||'')),...badFin.map(x=>displayBranchName(x.report?.branch||''))].filter(Boolean))];
  renderConflictResolutionWizard();
  const body=document.getElementById('conflictWizardBody');
  if(body)body.insertAdjacentHTML('afterbegin',`<div class="conflictWizardCard danger"><div class="conflictWizardStatus">RECHECKED — STILL UNRESOLVED</div><div class="conflictWizardTitle">There are still reconciliation issues</div><div class="conflictWizardText">${labels.length?`Still affected: ${escapeHtml(labels.join(', '))}. `:''}${badStock.length} stock-flow report${badStock.length===1?'':'s'} and ${badFin.length} financial check${badFin.length===1?'':'s'} are not green yet. Open Sunday reconciliation to see the remaining discrepancies.</div></div>`);
}
window.openConflictResolutionWizard=openConflictResolutionWizard;window.closeConflictResolutionWizard=closeConflictResolutionWizard;window.renderConflictResolutionWizard=renderConflictResolutionWizard;window.conflictWizardOpenDocket=conflictWizardOpenDocket;window.conflictWizardOpenSunday=conflictWizardOpenSunday;window.conflictWizardChoose=conflictWizardChoose;window.conflictWizardApply=conflictWizardApply;window.conflictWizardRecheck=conflictWizardRecheck;

function invoiceReviewContext(inv){
  const sourceEdits=postInvoiceDocketEdits(inv);
  const latestEdit=sourceEdits[0]||null;
  const d=latestEdit?(db.deliveries||[]).find(x=>x.id===latestEdit.docketId):null;
  const branch=displayBranchName(latestEdit?.branch||latestEdit?.beforeSnapshot?.branch||d?.branch||"");
  const date=latestEdit?.date||latestEdit?.beforeSnapshot?.date||d?.date||"";
  const changeText=latestEdit?.changes?.length
    ? latestEdit.changes.slice(0,2).map(ch=>{
        const before=ch.before?productLineLabel(ch.before):"",after=ch.after?productLineLabel(ch.after):"";
        if(before&&after)return `${before} → ${after}`;
        if(before)return `${before} removed`;
        return after?`${after} added`:"Delivery docket edited";
      }).join("; ")+(latestEdit.changes.length>2?` +${latestEdit.changes.length-2} more`:"")
    : "A linked delivery docket was edited.";
  return {sourceEdits,latestEdit,branch,date,changeText};
}
function correctionWorkflowMarkup(inv,live,oldBase,livePay,liveDelta){
  const pending=(db.pendingCorrections||[]).filter(c=>c.invoiceId===inv.id&&["pending","waiting_reconciliation"].includes(c.status));
  const ctx=invoiceReviewContext(inv);
  const ackKey=ctx.sourceEdits.length?invoiceSourceEditAckKey(inv,ctx.sourceEdits):"";
  const acknowledged=!!(ackKey&&db.alertAcknowledgements?.[ackKey]);
  const whatHappened=[
    ctx.date?`${invoiceDateLabel(ctx.date)}${ctx.branch?` · ${ctx.branch}`:""}`:"",
    ctx.changeText
  ].filter(Boolean).join(" — ");
  const stateLabel=acknowledged?"REVIEWED — STILL UNRESOLVED":"NOT RESOLVED";
  const reviewButton=acknowledged
    ? `<div class="invoiceReviewState amber">✓ Reviewed. The dashboard alert is cleared, but the accounting issue is not resolved yet.</div>`
    : `<button class="btn" onclick="acknowledgeInvoiceSourceEdits('${inv.id}')">Acknowledge review</button>`;
  if(live?.financialGreen){
    const delta=Number(live.summary?.combined?.payPin||0)-oldBase;
    return `<div class="invoiceReviewCard caution">
      <div class="invoiceReviewStatus">${stateLabel}</div>
      <div class="invoiceReviewTitle">Source correction detected</div>
      <div class="invoiceReviewSection"><b>What happened</b><span>${escapeHtml(whatHappened||"A linked delivery docket was edited after this invoice was saved.")}</span></div>
      <div class="invoiceReviewSection"><b>Current result</b><span>The week now reconciles. Verified invoice difference: <strong>${delta>=0?'+':''}${baht(delta)}</strong>.</span></div>
      <div class="invoiceReviewSection"><b>What happens next</b><span>The saved correction choice will be applied automatically. If the current invoice must change, a corrected invoice revision will be created; otherwise the final outcome will be recorded without changing this invoice.</span></div>
      <div class="invoiceWarningActions">${reviewButton}<button class="btn alt" onclick="switchTab('home');renderDashboardAlerts();window.scrollTo({top:0,behavior:'smooth'})">Back to Dashboard</button></div>
    </div>`;
  }
  return `<div class="invoiceReviewCard danger">
    <div class="invoiceReviewStatus">${stateLabel}</div>
    <div class="invoiceReviewTitle">This invoice cannot be resolved yet</div>
    <div class="invoiceReviewSection"><b>What happened</b><span>${escapeHtml(whatHappened||"A linked delivery docket was edited after this invoice was saved.")}</span></div>
    <div class="invoiceReviewSection"><b>Why it is not resolved</b><span>The edited week no longer fully reconciles, so the app will not calculate or apply a money difference yet.</span></div>
    <div class="invoiceReviewSection"><b>What you need to do</b><span>Open the week-ending ${escapeHtml(invoiceDateLabel(inv.reportDate))} reconciliation and fix the highlighted stock discrepancy. When the week reconciles, the app will automatically apply the saved correction choice and show the final result.</span></div>
    ${pending.length?`<div class="invoiceReviewNote">${escapeHtml(pending[0].message||"Waiting for the edited week to reconcile.")}</div>`:""}
    <div class="invoiceWarningActions"><button class="btn gold" onclick="openConflictResolutionWizard('${inv.id}')">Resolve step by step</button>${reviewButton}<button class="btn alt" onclick="switchTab('home');renderDashboardAlerts();window.scrollTo({top:0,behavior:'smooth'})">Back to Dashboard</button></div>
  </div>`;
}
function resolvedInvoiceCorrectionMarkup(inv){
  const corrections=(db.pendingCorrections||[]).filter(c=>c.invoiceId===inv.id&&["resolved","queued"].includes(c.status)).sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
  const c=corrections[0]||null;
  if(!c)return "";
  let result=c.message||"Correction completed.";
  if(c.status==="queued"){
    result=c.amount!=null
      ? `Resolved for this invoice. The current invoice stays unchanged and ${c.amount>=0?'+':''}${baht(c.amount)} is queued for the next Sunday cycle.`
      : "Resolved for this invoice. The current invoice stays unchanged and the correction is queued for the next Sunday cycle.";
  }else if(c.revisedInvoiceId){
    const revised=(db.invoices||[]).find(x=>x.id===c.revisedInvoiceId);
    result=revised?`Resolved. Corrected invoice ${revised.number} v${Number(revised.version||1)} was created.`:"Resolved. A corrected invoice revision was created.";
  }else if(c.amount!=null&&Math.abs(Number(c.amount))<0.005){
    result="Resolved. The week reconciled and no financial change was required.";
  }
  return `<div class="invoiceReviewCard resolved">
    <div class="invoiceReviewStatus">✓ RESOLVED</div>
    <div class="invoiceReviewTitle">Correction completed</div>
    <div class="invoiceReviewSection"><b>Final result</b><span>${escapeHtml(result)}</span></div>
  </div>`;
}
function continueInvoiceCorrection(id){
  const inv=(db.invoices||[]).find(x=>x.id===id);if(!inv)return;
  openSundayWizard(inv.reportDate);sundayWizardStep=2;renderSundayWizard();
}
function createRevisionFromInvoice(id){
  const inv=(db.invoices||[]).find(x=>x.id===id);if(!inv)return;
  const live=currentWizardStateSafeForInvoice(inv.reportDate);
  if(!live?.financialGreen)return alert('Complete the correction reconciliation first.');
  openSundayWizard(inv.reportDate);sundayWizardStep=4;renderSundayWizard();
}
function queueCorrectionForNextSunday(id){
  const inv=(db.invoices||[]).find(x=>x.id===id);if(!inv)return;
  const live=currentWizardStateSafeForInvoice(inv.reportDate);if(!live?.financialGreen)return alert('Complete the correction reconciliation first so the adjustment amount is verified.');
  const oldBase=Number(inv.totals?.basePayPin ?? (Number(inv.totals?.payPin||0)-Number(inv.totals?.adjustmentTotal||0)));
  const next=Number(live.summary?.combined?.payPin||0),delta=+(next-oldBase).toFixed(2);
  if(Math.abs(delta)<0.005)return alert('There is no financial difference to carry forward.');
  if(!Array.isArray(db.adjustments))db.adjustments=[];
  let a=db.adjustments.find(a=>a.oldInvoiceId===inv.id&&a.status==='pending'&&a.resolution==='carry_forward_pending');
  if(!a){a={id:'ADJ'+Date.now(),status:'pending',amount:delta,sourceDate:inv.reportDate,oldInvoiceId:inv.id,newInvoiceId:null,oldNumber:inv.number,newNumber:'',createdAt:new Date().toISOString(),resolution:'carry_forward_pending'};db.adjustments.push(a);}
  localStorage.setItem('mdpin-db',JSON.stringify(db));renderDashboardAlerts();renderInvoiceRecord(id);alert(`Adjustment ${delta>=0?'+':''}${baht(delta)} is queued for the next eligible Sunday.`);
}
function deferInvoiceCorrection(id){
  switchTab('home');renderDashboardAlerts();window.scrollTo({top:0,behavior:'smooth'});
}
window.continueInvoiceCorrection=continueInvoiceCorrection;window.createRevisionFromInvoice=createRevisionFromInvoice;window.queueCorrectionForNextSunday=queueCorrectionForNextSunday;window.deferInvoiceCorrection=deferInvoiceCorrection;
function renderInvoiceRecord(id){
  const box=document.getElementById("invoiceViewerBody"),inv=(db.invoices||[]).find(x=>x.id===id);if(!box||!inv)return;
  const st=invoiceRecordState(inv),sent=inv.sent?.status==="sent",latest=latestInvoiceForDate(inv.reportDate),isLatest=latest?.id===inv.id;
  const live=currentWizardStateSafeForInvoice(inv.reportDate);
  const livePay=live?.summary?.combined?.payPin;
  const oldBase=Number(inv.totals?.basePayPin ?? (Number(inv.totals?.payPin||0)-Number(inv.totals?.adjustmentTotal||0)));
  const liveDelta=livePay==null?null:Number(livePay)-oldBase;
  const sourceEdits=postInvoiceDocketEdits(inv);
  const sourceAck=sourceEdits.length&&db.alertAcknowledgements?.[invoiceSourceEditAckKey(inv,sourceEdits)];
  const resolvedCorrection=resolvedInvoiceCorrectionMarkup(inv);
  const warning=inv.supersededBy?`<div class="invoiceWarning"><b>This is the original / earlier invoice version.</b><br>A newer version is available. Nothing has been overwritten.<div class="recordActions"><button class="btn" onclick="openInvoiceRecord('${inv.supersededBy}')">Open newer version</button></div></div>`:st.label==="UPDATE REQUIRED"?correctionWorkflowMarkup(inv,live,oldBase,livePay,liveDelta):resolvedCorrection||sourceEdits.length&&!sourceAck?`<div class="invoiceReviewCard caution"><div class="invoiceReviewStatus">REVIEW NEEDED</div><div class="invoiceReviewTitle">Linked delivery docket was edited</div><div class="invoiceReviewSection"><b>What happened</b><span>${sourceEdits.length} delivery docket edit${sourceEdits.length===1?' was':'s were'} made after this invoice was saved.</span></div><div class="invoiceReviewSection"><b>Current result</b><span>The week still reconciles and the saved invoice amount is currently unchanged.</span></div><div class="invoiceWarningActions"><button class="btn" onclick="acknowledgeInvoiceSourceEdits('${inv.id}')">Acknowledge review</button><button class="btn alt" onclick="switchTab('home');renderDashboardAlerts();window.scrollTo({top:0,behavior:'smooth'})">Back to Dashboard</button></div></div>`:"";
  const branchRows=(inv.branches||[]).map(b=>`<tr><td class="branchNameCell">${escapeHtml(displayBranchName(b.branch))}</td><td>${baht(b.sales)}</td><td>${baht(b.cost)}</td><td>${baht(b.pinProfit)}</td><td class="amountDueCell">${baht(b.payPin)}</td></tr>`).join("");
  const pending=(db.adjustments||[]).filter(a=>a.status==="pending"&&(a.oldInvoiceId===inv.id||a.newInvoiceId===inv.id));
  const adjustmentTotal=Number(inv.totals?.adjustmentTotal||0);
  const basePay=Number(inv.totals?.basePayPin ?? (Number(inv.totals?.payPin||0)-adjustmentTotal));
  const adjustmentRows=(inv.adjustmentsApplied||[]).map(a=>`<div class="invoiceAdjustmentLine"><span>${escapeHtml(a.description||invoiceDateLabel(a.sourceDate))}</span><b>${Number(a.amount)>=0?'+':''}${baht(a.amount)}</b></div>`).join('');
  box.innerHTML=`${warning}
  <div class="invoiceDocument">
    <div class="invoiceDocHeader">
      <div>
        <div class="invoiceDocTitle">WEEKLY SETTLEMENT INVOICE</div>
        <div class="invoiceDocPeriod">Week ending ${escapeHtml(invoiceDateLabel(inv.reportDate))}</div>
      </div>
      <div class="invoiceDocRef">
        <div><span>Invoice</span><b>${escapeHtml(inv.number||"")} v${Number(inv.version||1)}</b></div>
        <div><span>Issued</span><b>${escapeHtml(invoiceDateLabel(inv.createdDate||inv.reportDate))}</b></div>
      </div>
    </div>
    <div class="invoiceDocParties">
      <div><span class="invoiceDocLabel">Issued by</span><b>Yaowaret</b></div>
      <div><span class="invoiceDocLabel">Settlement for</span><b>The Grocery by BM + BM Lamai</b></div>
    </div>
    <div class="invoiceTableWrap">
      <table class="invoiceTable">
        <thead><tr><th>Branch</th><th>Sales</th><th>Cost</th><th>Pin share</th><th>Due</th></tr></thead>
        <tbody>${branchRows}</tbody>
      </table>
    </div>
    ${(inv.adjustmentsApplied||[]).length?`<div class="invoiceAdjustments"><div class="invoiceAdjustmentsTitle">Previous-week correction${inv.adjustmentsApplied.length>1?'s':''}</div>${adjustmentRows}<div class="invoiceAdjustmentLine subtotal"><span>Current week before adjustment</span><b>${baht(basePay)}</b></div></div>`:''}
    <div class="invoiceDocTotalRow"><div><span>Total payable to Pin</span><small>Verified cost recovery + Pin profit share${adjustmentTotal?` including ${adjustmentTotal>=0?'+':''}${baht(adjustmentTotal)} adjustment`:''}</small></div><strong>${baht(inv.totals?.payPin||0)}</strong></div>
    ${inv.shopNote?`<div class="invoiceDocNote"><span class="invoiceDocLabel">Note to shop</span>${escapeHtml(inv.shopNote)}</div>`:""}
    <div class="invoiceDocFooter"><span class="invoiceViewerStatus ${st.cls==='warn'?'warn':''}">${escapeHtml(st.label)}</span><span>Saved invoice record · v${Number(inv.version||1)}</span></div>
    ${pending.length?`<div class="invoiceWarning"><b>${pending.length} unresolved adjustment${pending.length>1?'s':''}</b><br>${pending.map(a=>`${escapeHtml(invoiceDateLabel(a.sourceDate))}: ${Number(a.amount)>=0?'+':''}${baht(a.amount)}`).join('<br>')}<br><span class="wizardMinimal">It will be offered in the next eligible Sunday workflow, or you can mark it handled separately.</span>${pending.map(a=>`<div class="adjustmentResolve"><button class="btn" onclick="resolveAdjustmentSeparately('${a.id}')">Mark ${Number(a.amount)>=0?'+':''}${baht(a.amount)} handled separately</button></div>`).join('')}</div>`:""}
  </div>
  <div class="invoiceManagementTitle">
    <div><b>Invoice management</b><span>Send, payment and PDF controls</span></div>
  </div>
  <div class="invoiceQuickActions">
    <button class="btn gold invoicePdfPrimary" onclick="shareInvoicePDFById('${inv.id}')">
      <span class="invoiceActionIcon">↗</span><span><b>Create / Share PDF</b><small>Customer invoice copy</small></span>
    </button>
  </div>

  <details class="invoiceManageCard invoiceSentBox" ${sent?'':'open'}>
    <summary>
      <div class="manageSummaryMain">
        <span class="manageIcon">✉</span>
        <div><b>Customer copy</b><small>${sent?`Sent ${escapeHtml(invoiceDateLabel(inv.sent.date))}${inv.sent.note?` · ${escapeHtml(inv.sent.note)}`:''}`:'Not marked as sent'}</small></div>
      </div>
      <span class="recordStatus ${sent?'ok':'unpaid'}">${sent?'SENT':'NOT SENT'}</span>
      <span class="manageChevron">⌄</span>
    </summary>
    <div class="manageEditor">
      <div class="manageFieldGrid">
        <label><span>Sent date</span><input id="invoiceSentDate" type="date" value="${escapeHtml(inv.sent?.date||today())}"></label>
        <label><span>How sent <em>optional</em></span><input id="invoiceSentNote" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="LINE, email…" value="${escapeHtml(inv.sent?.note||'')}"></label>
      </div>
      <div class="manageButtonRow">
        <button class="btn gold" onclick="markInvoiceSent('${inv.id}','sent')">Save as Sent</button>
        <button class="btn subtleDanger" onclick="markInvoiceSent('${inv.id}','not_sent')">Mark Not Sent</button>
      </div>
    </div>
  </details>

  <details class="invoiceManageCard invoicePaymentBox" ${inv.payment?.status==='paid'?'':'open'}>
    <summary>
      <div class="manageSummaryMain">
        <span class="manageIcon">฿</span>
        <div><b>Payment</b><small>${inv.payment?.status==='paid'?`Paid ${escapeHtml(invoiceDateLabel(inv.payment.date))}${inv.payment.method?` · ${escapeHtml(inv.payment.method==='bank_transfer'?'Bank transfer':inv.payment.method==='promptpay'?'PromptPay':inv.payment.method==='cash'?'Cash':inv.payment.methodOther||'Other')}`:''}`:'Awaiting payment'}</small></div>
      </div>
      <span class="recordStatus ${inv.payment?.status==='paid'?'ok':'unpaid'}">${inv.payment?.status==='paid'?'PAID':'UNPAID'}</span>
      <span class="manageChevron">⌄</span>
    </summary>
    <div class="manageEditor">
      <input id="viewerPaymentStatus" type="hidden" value="${inv.payment?.status==='paid'?'paid':'unpaid'}">
      <div class="invoicePaymentToggle compactToggle">
        <button id="viewerUnpaidBtn" type="button" class="${inv.payment?.status==='paid'?'':'activeUnpaid'}" aria-pressed="${inv.payment?.status==='paid'?'false':'true'}" onclick="invoiceViewerPaymentStatus('${inv.id}','unpaid')">UNPAID</button>
        <button id="viewerPaidBtn" type="button" class="${inv.payment?.status==='paid'?'activePaid':''}" aria-pressed="${inv.payment?.status==='paid'?'true':'false'}" onclick="invoiceViewerPaymentStatus('${inv.id}','paid')">PAID</button>
      </div>
      <div id="viewerPaidFields" class="invoicePaymentFields" style="display:${inv.payment?.status==='paid'?'grid':'none'}">
        <div><label>Payment date</label><input id="viewerPaymentDate" type="date" value="${escapeHtml(inv.payment?.date||today())}"></div>
        <div><label>Method</label><select id="viewerPaymentMethod" onchange="invoiceViewerPaymentMethodChanged()"><option value="">Choose…</option><option value="cash" ${inv.payment?.method==='cash'?'selected':''}>Cash</option><option value="bank_transfer" ${inv.payment?.method==='bank_transfer'?'selected':''}>Bank transfer</option><option value="promptpay" ${inv.payment?.method==='promptpay'?'selected':''}>PromptPay</option><option value="other" ${inv.payment?.method==='other'?'selected':''}>Other</option></select></div>
        <div id="viewerPaymentOtherWrap" class="full" style="display:${inv.payment?.method==='other'?'block':'none'}"><label>Other payment method</label><input id="viewerPaymentOther" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="words" spellcheck="false" placeholder="Enter payment method" value="${escapeHtml(inv.payment?.methodOther||'')}"></div>
      </div>
      <div class="invoicePaymentFields compactNote"><div class="full"><label>Payment note <em>optional</em></label><input id="viewerPaymentNote" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="Reference or note" value="${escapeHtml(inv.payment?.note||'')}"></div></div>
      <button class="btn gold invoicePaymentSave" type="button" onclick="saveInvoiceViewerPayment('${inv.id}')">Save Payment</button>
      ${inv.payment?`<div class="invoicePaymentSummary ${inv.payment.status==='paid'?'paid':''}">${inv.payment.status==='paid'?`✓ Paid ${escapeHtml(invoiceDateLabel(inv.payment.date))}${inv.payment.method?` · ${escapeHtml(inv.payment.method==='bank_transfer'?'Bank transfer':inv.payment.method==='promptpay'?'PromptPay':inv.payment.method==='cash'?'Cash':inv.payment.methodOther||'Other')}`:''}`:'Saved as UNPAID'}${inv.payment.note?` · ${escapeHtml(inv.payment.note)}`:''}</div>`:''}
    </div>
  </details>`;
}
function resolveAdjustmentSeparately(id){
  const a=(db.adjustments||[]).find(x=>x.id===id);if(!a)return;
  if(!confirm(`Mark this ${Number(a.amount)>=0?'+':''}${baht(a.amount)} adjustment as handled separately? It will not be carried into a future Sunday invoice.`))return;
  a.status="resolved";a.resolution="handled_separately";a.resolvedAt=new Date().toISOString();localStorage.setItem("mdpin-db",JSON.stringify(db));renderHistory();renderDashboardAlerts();
  const inv=(db.invoices||[]).find(x=>x.id===a.oldInvoiceId||x.id===a.newInvoiceId);if(inv)renderInvoiceRecord(inv.id);
}
window.resolveAdjustmentSeparately=resolveAdjustmentSeparately;
window.shareInvoicePDFById=id=>shareInvoicePDF((db.invoices||[]).find(x=>x.id===id));
window.openInvoiceRecord=id=>{switchTab('invoiceViewer');renderInvoiceRecord(id);window.scrollTo({top:0,behavior:"smooth"});};

function renderInvoiceWizard(state){
  if(!state.financialGreen)return '<div class="wizardLocked">Financial reconciliation must be complete before an invoice can be produced.</div>';
  const card=buildInvoiceCard(state,false);
  const note=state.invoice?.shopNote||"";
  const noteField=state.invoiceSaved?"":`<div class="invoiceNote"><label for="invoiceShopNote">Note to shop (optional)</label><textarea id="invoiceShopNote" placeholder="Add an explanation or message that should appear on the invoice…">${escapeHtml(note)}</textarea></div>`;
  const actions=state.invoiceSaved?`<div class="invoiceConfirmActions"><button class="btn gold primary" type="button" onclick="createSundayInvoicePDF()">Create / Share PDF</button><button class="btn" type="button" onclick="saveSundayInvoice()">Refresh Invoice</button></div><div class="pdfHint">Creates the PDF first. On iPhone you can then Share it, Save to Files, send it, or open it later to print.</div><div class="wizardGood" style="margin-top:7px;padding:8px">✓ Invoice saved. Next is ready.</div>`:`${noteField}<div class="invoiceConfirmActions"><button class="btn gold primary" type="button" onclick="saveSundayInvoice()">Save Verified Invoice</button></div>`;
  return card+actions;
}

function paymentForInvoice(invoice){
  return invoice&&invoice.payment&&typeof invoice.payment==="object"?invoice.payment:null;
}
function saveSundayPayment(){
  const state=currentWizardState();
  if(!state.invoiceSaved||!state.invoice)return alert("Save the verified invoice first.");
  const paid=document.querySelector('input[name="payStatus"]:checked')?.value==="paid";
  const date=document.getElementById("paymentDate")?.value||"";
  const method=document.getElementById("paymentMethod")?.value||"";
  const other=(document.getElementById("paymentMethodOther")?.value||"").trim();
  const note=(document.getElementById("paymentNote")?.value||"").trim();
  if(paid&&!date)return alert("Choose the payment date before marking the invoice paid.");
  if(paid&&!method)return alert("Choose the payment method before marking the invoice paid.");
  if(paid&&method==="other"&&!other)return alert("Enter the payment method.");
  const inv=(db.invoices||[]).find(x=>x.id===state.invoice.id);if(!inv)return alert("Invoice record not found.");
  inv.status=paid?"paid":"unpaid";
  inv.payment={status:paid?"paid":"unpaid",date:paid?date:null,method:paid?method:null,methodOther:paid&&method==="other"?other:"",note,savedAt:new Date().toISOString()};
  localStorage.setItem("mdpin-db",JSON.stringify(db));
  renderSundayWizard();
}
function setPaymentStatus(v){
  const paid=v==="paid";
  const p=document.getElementById("payPaid"),u=document.getElementById("payUnpaid"),wrap=document.getElementById("paymentPaidFields");
  if(p)p.checked=paid;if(u)u.checked=!paid;if(wrap)wrap.style.display=paid?"grid":"none";
  document.querySelectorAll(".paymentStatusBtn").forEach(b=>b.classList.remove("activePaid","activeUnpaid"));
  const btn=document.getElementById(paid?"paidStatusBtn":"unpaidStatusBtn");if(btn)btn.classList.add(paid?"activePaid":"activeUnpaid");
}
function paymentMethodLabel(p){
  if(!p||!p.method)return "";
  if(p.method==="cash")return "Cash";
  if(p.method==="bank_transfer")return "Bank transfer";
  if(p.method==="promptpay")return "PromptPay";
  return p.methodOther||"Other";
}
function paymentMethodChanged(){
  const method=document.getElementById("paymentMethod")?.value||"";
  const wrap=document.getElementById("paymentMethodOtherWrap");if(wrap)wrap.style.display=method==="other"?"block":"none";
}
function renderPaymentWizard(state){
  if(!state.invoiceSaved||!state.invoice)return '<div class="wizardLocked">Save the verified invoice before recording payment.</div>';
  const p=paymentForInvoice(state.invoice),paid=p?.status==="paid",date=p?.date||today(),note=p?.note||"",method=p?.method||"",other=p?.methodOther||"";
  return `<div class="paymentCard"><div class="paymentTop"><div><div class="wizardMinimal">${escapeHtml(state.invoice.number)}</div><b>Payment status</b></div><div style="text-align:right"><div class="wizardMinimal">Amount due</div><div class="paymentAmount">${baht(state.invoice.totals?.payPin||0)}</div></div></div><div class="paymentStatusBtns"><label id="unpaidStatusBtn" class="paymentStatusBtn ${paid?'':'activeUnpaid'}" onclick="setPaymentStatus('unpaid')"><input id="payUnpaid" type="radio" name="payStatus" value="unpaid" ${paid?'':'checked'} style="display:none">UNPAID</label><label id="paidStatusBtn" class="paymentStatusBtn ${paid?'activePaid':''}" onclick="setPaymentStatus('paid')"><input id="payPaid" type="radio" name="payStatus" value="paid" ${paid?'checked':''} style="display:none">PAID</label></div><div class="paymentFields"><div id="paymentPaidFields" style="display:${paid?'grid':'none'};grid-template-columns:1fr 1fr;gap:9px"><div><label>Payment date</label><input id="paymentDate" type="date" value="${escapeHtml(date)}"></div><div><label>Method</label><select id="paymentMethod" onchange="paymentMethodChanged()"><option value="">Choose…</option><option value="cash" ${method==='cash'?'selected':''}>Cash</option><option value="bank_transfer" ${method==='bank_transfer'?'selected':''}>Bank transfer</option><option value="promptpay" ${method==='promptpay'?'selected':''}>PromptPay</option><option value="other" ${method==='other'?'selected':''}>Other</option></select></div><div id="paymentMethodOtherWrap" style="display:${method==='other'?'block':'none'};grid-column:1/-1"><label>Other payment method</label><input id="paymentMethodOther" placeholder="Enter payment method" value="${escapeHtml(other)}"></div></div><div><label>Note (optional)</label><textarea id="paymentNote" placeholder="Reference or other payment note…">${escapeHtml(note)}</textarea></div></div><button class="btn gold paymentSave" type="button" onclick="saveSundayPayment()">Save Payment Status</button>${p?`<div class="paymentSaved">✓ ${paid?'Paid '+escapeHtml(invoiceDateLabel(p.date))+(paymentMethodLabel(p)?' · '+escapeHtml(paymentMethodLabel(p)):''):'Saved as unpaid'}${p.note?` · ${escapeHtml(p.note)}`:''}</div>`:'<div class="paymentHint">Choose Paid or Unpaid. Paid invoices require a date and payment method.</div>'}</div>`;
}

function renderDashboardAlerts(){
  const box=document.getElementById("dashboardAlerts");if(!box)return;
  // Resolve any already-acknowledged zero-difference correction before building alerts,
  // so an old UPDATE REQUIRED warning cannot survive one extra render.
  processPendingDocketCorrections();
  const alerts=[];
  try{
    const latestByDate={};
    (db.invoices||[]).filter(i=>i&&i.status!=="void").forEach(i=>{const d=i.reportDate;if(!latestByDate[d]||Number(i.version||1)>Number(latestByDate[d].version||1))latestByDate[d]=i;});
    Object.values(latestByDate).forEach(inv=>{
      if(inv.supersededBy)return;
      const trackedCorrection=(db.pendingCorrections||[]).find(c=>c.invoiceId===inv.id&&["pending","waiting_reconciliation","queued","resolved"].includes(c.status));
      if(trackedCorrection)return;
      const live=currentWizardStateSafeForInvoice(inv.reportDate);
      const sourceEdits=postInvoiceDocketEdits(inv);
      if(live&&live.financialGreen===false){
        const reviewKey=sourceEdits.length?invoiceSourceEditAckKey(inv,sourceEdits):"";
        const reviewAcknowledged=!!(reviewKey&&db.alertAcknowledgements?.[reviewKey]);
        if(!reviewAcknowledged){
          alerts.push(`<div class="dashboardAlert"><div class="dashboardAlertHead"><div class="dashboardAlertTitle">⚠ Invoice needs review</div></div><div class="dashboardAlertText">${escapeHtml(inv.number||'Invoice')} v${Number(inv.version||1)} has source records edited after it was saved, and the week no longer fully reconciles.</div><button class="btn" onclick="openInvoiceRecord('${inv.id}');setTimeout(()=>openConflictResolutionWizard('${inv.id}'),80)">Resolve step by step</button></div>`);
        }
        return;
      }
      if(live?.signature&&live.signature!==inv.signature){
        const oldBase=Number(inv.totals?.basePayPin ?? (Number(inv.totals?.payPin||0)-Number(inv.totals?.adjustmentTotal||0))),next=Number(live.summary?.combined?.payPin||0),delta=next-oldBase;
        alerts.push(`<div class="dashboardAlert"><div class="dashboardAlertHead"><div class="dashboardAlertTitle">⚠ Invoice update required</div></div><div class="dashboardAlertText">${escapeHtml(inv.number||'Invoice')} v${Number(inv.version||1)} changed after source records were edited. Difference: ${delta>=0?'+':''}${baht(delta)}.</div><button class="btn" onclick="openInvoiceRecord('${inv.id}');setTimeout(()=>openConflictResolutionWizard('${inv.id}'),80)">Resolve step by step</button></div>`);
        return;
      }
      if(sourceEdits.length){
        if(!db.alertAcknowledgements||typeof db.alertAcknowledgements!=="object")db.alertAcknowledgements={};
        const key=invoiceSourceEditAckKey(inv,sourceEdits);
        if(!db.alertAcknowledgements[key])alerts.push(`<div class="dashboardAlert info"><div class="dashboardAlertTitle">Delivery docket edited</div><div class="dashboardAlertText">A docket linked to ${escapeHtml(inv.number||'this invoice')} was edited after the invoice was saved. Reconciliation and invoice amount are still unchanged.</div><button class="btn" onclick="openInvoiceRecord('${inv.id}')">Review</button><button class="btn" onclick="acknowledgeInvoiceSourceEdits('${inv.id}')">Acknowledge</button></div>`);
      }
    });
  }catch(e){console.warn("Could not build invoice alerts",e)}
  const corrections=(db.pendingCorrections||[]).filter(c=>["pending","waiting_reconciliation"].includes(c.status));
  corrections.forEach(c=>{
    const d=(db.deliveries||[]).find(x=>x.id===c.docketId),label=d?`${invoiceDateLabel(d.date)} — ${displayBranchName(d.branch)}`:"Edited delivery docket";
    if(c.choice==="next_sunday"){
      const inv=(db.invoices||[]).find(x=>x.id===c.invoiceId);
      const week=inv?.reportDate?invoiceDateLabel(inv.reportDate):"the affected week";
      const open=inv?`<button class="btn" onclick="openConflictResolutionWizard('${inv.id}')">Review correction</button>`:"";
      alerts.push(`<div class="dashboardAlert"><div class="dashboardAlertTitle">⚠ Correction waiting for reconciliation</div><div class="dashboardAlertText">${escapeHtml(label)} was edited for the week ending ${escapeHtml(week)}. No amount is queued for the next invoice yet. Review why that week does not reconcile before any financial adjustment is made.</div>${open}</div>`);
    }
    else {
      const inv=(db.invoices||[]).find(x=>x.id===c.invoiceId);
      const resumeBtn=inv?`<button class="btn" onclick="openConflictResolutionWizard('${inv.id}')">Resume conflict resolution</button>`:`<button class="btn" onclick="continueInvoiceCorrection('${escapeHtml(c.invoiceId||'')}')">Open reconciliation</button>`;
      alerts.push(`<div class="dashboardAlert"><div class="dashboardAlertTitle">⚠ Docket correction waiting</div><div class="dashboardAlertText">${escapeHtml(label)} has a correction waiting for the edited week to reconcile. Open the guided workflow to continue from the exact unresolved conflict.</div>${resumeBtn}</div>`);
    }
  });
  const pending=(db.adjustments||[]).filter(a=>a.status==="pending"&&a.resolution!=="next_sunday_auto");
  if(pending.length){const total=pending.reduce((n,a)=>n+Number(a.amount||0),0);alerts.push(`<div class="dashboardAlert info"><div class="dashboardAlertTitle">Adjustment waiting</div><div class="dashboardAlertText">${pending.length} unresolved adjustment${pending.length>1?'s':''} (${total>=0?'+':''}${baht(total)}) is waiting for Pin's decision. It will be offered automatically in the next eligible Sunday workflow.</div><button class="btn" onclick="switchTab('history');document.getElementById('recordsType').value='invoice';renderHistory()">Open Records</button></div>`);}
  box.innerHTML=alerts.join("");box.style.display=alerts.length?"block":"none";
  renderConflictResumeChip();
}

function renderSundayWizard(){
  // v0.10.75 shell invariant: workflowMode belongs ONLY to the active Sunday Wizard.
  // Async/re-render calls can arrive after the user has already navigated away; those
  // stale calls must never hide the branded header on Settings or any normal screen.
  const wizard=document.getElementById("sundayWizard");
  if(!wizard || !wizard.classList.contains("active")){
    document.body.classList.remove("workflowMode");
    return;
  }
  document.body.classList.add("workflowMode");
  const box=document.getElementById("wizardContent"),period=document.getElementById("wizardPeriod");if(!box)return;
  const state=currentWizardState(),items=state.items;
  if(!items.length){sundayWizardStep=1;period.textContent="Start by importing this Sunday's Excel reports.";box.innerHTML=wizardImportMarkup();renderWizardChrome(state);return;}
  const latest=wizardCycleDate(state)||items[0].report.date,prevDates=[...new Set(items.map(x=>x.rec.previousDate).filter(Boolean))];
  period.textContent=`${latest}${prevDates.length?` compared with ${prevDates.join(" / ")}`:" — prior Sunday required"}`;
  if(sundayWizardStep===1){
    const existingSummary=`<div class="wizardGood">✓ ${items.length} Sunday report${items.length===1?'':'s'} imported for ${escapeHtml(latest)}.</div>`;
    // v0.10.126: when a Sunday cycle already contains one report, choosing another file
    // must keep the pending selection/import controls visible. Previously the onchange
    // re-render collapsed back to the existing-report summary, so iPhone users could
    // select the second branch file but had no Import button and nothing changed.
    box.innerHTML=existingSummary+(selectedXlsxFiles.length
      ? wizardImportMarkup()
      : `<div class="wizardActions"><button class="btn alt" onclick="wizardAction('import')">Add / review Excel reports</button></div>`);
  }
  else if(sundayWizardStep===2){box.innerHTML=renderStockWizard(items);}
  else if(sundayWizardStep===3){box.innerHTML=renderFinancialWizard(state);}
  else if(sundayWizardStep===4){box.innerHTML=renderInvoiceWizard(state);}
  else{box.innerHTML=renderPaymentWizard(state);}
  renderWizardChrome(state);
}

document.getElementById("recordsSearch")?.addEventListener("input",renderHistory);
document.getElementById("recordsType")?.addEventListener("change",renderHistory);
function setDeliveryView(mode){
  if(mode!=="create"){
    deliveryKeyboardActiveInput=null;
    clearNewDeliveryQtyVisualViewport?.();
    document.getElementById("qtyViewportTestFlag")?.remove();
  }
  const archive=document.getElementById("deliveryArchivePane");
  const create=document.getElementById("deliveryCreatePane");
  const isCreate=mode==="create";
  if(isCreate)removeDocketViewportActions();
  const isEdit=isCreate&&!!(editingDocketId||editingSuggestionId);

  if(archive)archive.style.display=isCreate?"none":"block";
  if(create)create.style.display=isCreate?"block":"none";
  const backButton=document.getElementById("deliveryModuleBack");
  if(backButton)backButton.style.display=isCreate?"inline-flex":"none";
  const archiveHome=document.getElementById("deliveryArchiveHome");
  if(archiveHome)archiveHome.style.display=isCreate?"none":"inline-flex";

  // Create and Archive are deliberately mutually exclusive.
  document.body.classList.toggle("deliveryMode",isCreate);
  document.body.classList.toggle("docketMode",!isCreate);
  document.body.classList.toggle("deliveryEditMode",isEdit);

  const t=document.getElementById("deliveryEditorTitle");
  if(t&&isCreate)t.childNodes[0].nodeValue=isEdit?"Edit delivery docket ":"Create delivery ";
}
function openDeliveryCreate(preserveEdit=false){
  if(!preserveEdit){
    deliveryShowAllProducts=false;
    if(editingDocketId||editingSuggestionId)resetDeliveryEditor();
  }
  setDeliveryView("create");
  switchTab("docket");
  if(!preserveEdit && !editingDocketId){
    const d=document.getElementById("delDate");
    if(d&&!d.value)d.value=today();
  }
  fillProducts();
  if(editingDocketId||editingSuggestionId)setDeliveryEditAddTools(false);
  else setDeliveryEditAddTools(true);
  renderDelivery();
  window.scrollTo({top:0,left:0,behavior:"auto"});
}
function openDeliveryArchive(openId){
  document.body.classList.remove("deliveryEditMode","deliveryKeyboardOpen");
  document.documentElement.style.removeProperty("--md-keyboard-height");
  deliveryKeyboardActiveInput=null;
  setDeliveryView("archive");
  switchTab("docket");
  if(openId!==undefined)renderDocketArchive(openId);
  else renderDocketArchive();
}
window.openDeliveryCreate=openDeliveryCreate;window.openDeliveryArchive=openDeliveryArchive;
function returnToDashboardFromHeader(){
  closeMainMenu();
  document.body.classList.remove("workflowMode","deliveryMode","docketMode","deliveryKeyboardOpen");
  switchTab("home");
  window.scrollTo({top:0,left:0,behavior:"auto"});
  const home=document.getElementById("home");
  if(home){home.scrollTop=0}
}

function switchTab(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===id));

  // Delivery view mode is owned only by setDeliveryView().
  // Leaving Delivery Dockets clears both special modes.
  if(id!=="docket"){
    removeDocketViewportActions();
    document.body.classList.remove("deliveryMode","docketMode");
  }else if(!document.body.classList.contains("deliveryMode")&&!document.body.classList.contains("docketMode")){
    setDeliveryView("archive");
  }

  if(id!=="sundayWizard")document.body.classList.remove("workflowMode");
  closeMainMenu();
  const active=document.getElementById(id);
  if(active){
    active.scrollTop=0;
    requestAnimationFrame(()=>{active.scrollTop=0});
  }
  if(id==="weekly"&&!document.querySelector("#weekRows tr"))loadWeek();
  if(id==="sundayWizard")renderSundayWizard();
  if(id==="home"){renderPinDashboard();renderMetrics();renderDashboardAlerts()}

  // v0.10.75 header invariant: every normal screen must leave workflowMode off.
  // This protects the iPad shell even if a delayed Sunday-workflow callback fires.
  if(id!=="sundayWizard") document.body.classList.remove("workflowMode");
}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{if(t.dataset.tab==="docket")openDeliveryArchive();else switchTab(t.dataset.tab)});

const MD_TEST_SUPABASE_URL="https://bzgkeshxbnhnlrpdgbtb.supabase.co";
const MD_TEST_SUPABASE_KEY="sb_publishable_8EReyQFUFSe6SPHCBLhU7g_zp8j18_D";
const MD_TEST_WORKSPACE="magic-dragon-pin-test";
const MD_TEST_STATE_TABLE="md_test_device_state";
const MD_TEST_DELIVERY_TABLE="md_test_delivery_record";
let mdCloudSession=null;
function cloudEl(id){return document.getElementById(id)}
function cloudStatus(msg,state="info"){const el=cloudEl("cloudStatus");if(el){el.textContent=msg;el.classList.remove("good","bad","warn","info");el.classList.add(state==="bad"?"bad":state==="good"?"good":state==="warn"?"warn":"info")}}
function renderCloudOverview(meta=null,state="idle"){
 const cloud=cloudEl("cloudOverviewCloud"),baseEl=cloudEl("cloudOverviewBase"),stateEl=cloudEl("cloudOverviewState");
 const base=cloudNumStorage(MD_CLOUD_BASE_REV_KEY);
 const wrap=cloudEl("cloudOverview");if(!cloud||!baseEl||!stateEl||!wrap)return;
 cloud.textContent=meta?`Rev ${meta.revision} · ${meta.updated_by_device||"device"}`:"Not checked";
 baseEl.textContent=base?`Base rev ${base}`:"No sync base";
 let txt="Sign in / check",cls="";
 if(state==="good"){txt=meta&&base===Number(meta.revision)?"UP TO DATE":"CONNECTED";cls="good"}
 else if(state==="warn"){txt="CLOUD NEWER — REVIEW";cls="warn"}
 else if(state==="bad"){txt="ACTION NEEDED";cls="bad"}
 else if(state==="preview"){txt="SNAPSHOT DIFFERS";cls="warn"}
 stateEl.textContent=txt;
 [...wrap.querySelectorAll(".cloudOverviewCard")].forEach(x=>x.classList.remove("good","warn","bad"));
 if(cls)wrap.querySelectorAll(".cloudOverviewCard").forEach(x=>x.classList.add(cls));
}
function detectCloudDeviceLabel(){const ua=navigator.userAgent||"";if(/iPhone/i.test(ua))return "iPhone";if(/iPad/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1))return "iPad";return "Test device"}
function initCloudFields(){const e=cloudEl("cloudEmail"),d=cloudEl("cloudDeviceLabel");if(e)e.value=localStorage.getItem("mdpin-cloud-email")||"";if(d)d.value=localStorage.getItem("mdpin-cloud-device")||detectCloudDeviceLabel();try{const raw=sessionStorage.getItem("mdpin-cloud-session");if(raw)mdCloudSession=JSON.parse(raw)}catch(e){}syncCloudAuthUi();if(mdCloudSession?.access_token)cloudStatus(`Signed in as ${mdCloudSession.user?.email||"test user"}.`,"good")}
function renderCloudTestMarker(){
 const input=cloudEl("cloudTestMarker"),status=cloudEl("cloudTestMarkerStatus");
 const value=String(db.testSyncMarker||"");
 if(input&&document.activeElement!==input)input.value=value;
 if(status)status.textContent=value?`Current local marker: ${value}`:"No TEST marker saved on this device yet.";
}
function saveCloudTestMarker(){
 const input=cloudEl("cloudTestMarker"),status=cloudEl("cloudTestMarkerStatus");
 if(!input)return;
 db.testSyncMarker=String(input.value||"").trim();
 localStorage.setItem("mdpin-db",JSON.stringify(db));
 if(status)status.textContent=db.testSyncMarker?`Saved locally: ${db.testSyncMarker}`:"Marker cleared locally.";
 cloudStatus("Local TEST change saved — ready to upload when cloud is current.","info");
 const metaRev=cloudNumStorage(MD_CLOUD_SEEN_REV_KEY),base=cloudNumStorage(MD_CLOUD_BASE_REV_KEY);
 if(metaRev&&base===metaRev){
   const meta={revision:metaRev,updated_by_device:"cloud",app_version:"0.10.109"};
   const cloud=cloudEl("cloudOverviewCloud"),baseEl=cloudEl("cloudOverviewBase"),stateEl=cloudEl("cloudOverviewState"),wrap=cloudEl("cloudOverview");
   if(cloud)cloud.textContent=`Rev ${metaRev}`;if(baseEl)baseEl.textContent=`Base rev ${base}`;if(stateEl)stateEl.textContent="LOCAL CHANGE — UPLOAD";
   if(wrap){[...wrap.querySelectorAll(".cloudOverviewCard")].forEach(x=>{x.classList.remove("good","bad","warn");x.classList.add("warn")})}
 }
}
async function cloudTryRefreshSession(){
 const refreshToken=mdCloudSession?.refresh_token;if(!refreshToken)return false;
 try{
  const r=await fetch(MD_TEST_SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:MD_TEST_SUPABASE_KEY,"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({refresh_token:refreshToken})});
  if(!r.ok)return false;
  const data=await r.json();if(!data?.access_token)return false;
  mdCloudSession=data;sessionStorage.setItem("mdpin-cloud-session",JSON.stringify(data));return true;
 }catch(e){console.warn("TEST Cloud session refresh failed",e);return false}
}
/* v0.10.92 TEST — Supabase requests must bypass the service-worker cache; sw.js now passes all cross-origin traffic straight to network. */
async function mdCloudFetch(path,{method="GET",body=null,auth=true,headers={},retryAuth=true}={}){
 const h={apikey:MD_TEST_SUPABASE_KEY,...headers};
 if(auth&&mdCloudSession?.access_token)h.Authorization=`Bearer ${mdCloudSession.access_token}`;
 if(body!=null&&!h["Content-Type"])h["Content-Type"]="application/json";
 const opts={method,headers:h,cache:"no-store",body:body==null?undefined:(typeof body==="string"?body:JSON.stringify(body))};
 let r=await fetch(MD_TEST_SUPABASE_URL+path,opts);
 if(auth&&retryAuth&&r.status===401){
  if(await cloudTryRefreshSession())return mdCloudFetch(path,{method,body,auth,headers,retryAuth:false});
  mdCloudSession=null;sessionStorage.removeItem("mdpin-cloud-session");
  throw new Error("Session expired — please sign in again.");
 }
 const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
 if(!r.ok){
  const msg=data?.message||data?.error_description||data?.hint||data?.error||`${r.status} ${r.statusText}`;
  if(auth&&(/jwt.*expired|token.*expired|invalid.*jwt/i.test(String(msg)))){mdCloudSession=null;sessionStorage.removeItem("mdpin-cloud-session");throw new Error("Session expired — please sign in again.")}
  throw new Error(msg);
 }
 return data;
}
function syncCloudAuthUi(){
 const fields=cloudEl("cloudAuthFields"),btn=cloudEl("cloudSignIn");
 const signed=!!mdCloudSession?.access_token;
 if(fields)fields.hidden=signed||!fields.dataset.open;
 if(btn){
   btn.classList.toggle("signedIn",signed);
   btn.textContent=signed?"✓ Signed in":"Sign in";
 }
}
async function cloudSignIn(){
 if(mdCloudSession?.access_token){syncCloudAuthUi();return;}
 const fields=cloudEl("cloudAuthFields");
 if(fields&&fields.hidden){
   fields.dataset.open="1";fields.hidden=false;
   cloudEl("cloudEmail")?.focus();
   return;
 }
 const email=(cloudEl("cloudEmail")?.value||"").trim(),password=cloudEl("cloudPassword")?.value||"";
 if(!email||!password)return alert("Enter the TEST Supabase email and password.");
 cloudStatus("Signing in…","info");
 try{
   const data=await mdCloudFetch('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},auth:false});
   mdCloudSession=data;sessionStorage.setItem("mdpin-cloud-session",JSON.stringify(data));localStorage.setItem("mdpin-cloud-email",email);
   const label=(cloudEl("cloudDeviceLabel")?.value||detectCloudDeviceLabel()).trim();localStorage.setItem("mdpin-cloud-device",label);
   cloudEl("cloudPassword").value="";
   if(fields){fields.dataset.open="";fields.hidden=true;}
   syncCloudAuthUi();
   await Promise.all([cloudRefresh(),renderDeliverySyncOverview(true)]);
 }catch(e){console.error(e);cloudStatus(`Sign-in failed — ${e.message}`,"bad");if(fields){fields.dataset.open="1";fields.hidden=false;}syncCloudAuthUi()}
}
function cloudSignOut(){
 mdCloudSession=null;sessionStorage.removeItem("mdpin-cloud-session");
 const fields=cloudEl("cloudAuthFields");if(fields){fields.dataset.open="";fields.hidden=true;}
 syncCloudAuthUi();
 const syncState=cloudEl("deliverySyncState");if(syncState){syncState.textContent="Sign in to check delivery sync.";syncState.className="deliverySyncState";}
 cloudStatus("Signed out of TEST Cloud.","info");const m=cloudEl("cloudMeta");if(m)m.textContent="";
}
const MD_CLOUD_SEEN_REV_KEY="mdpin-cloud-seen-revision";
const MD_CLOUD_BASE_REV_KEY="mdpin-cloud-base-revision";
const MD_CLOUD_BASE_FP_KEY="mdpin-cloud-base-fingerprint";
function cloudNumStorage(key){const n=Number(localStorage.getItem(key));return Number.isFinite(n)&&n>0?n:null}
function cloudRememberSeen(meta){if(meta?.revision)localStorage.setItem(MD_CLOUD_SEEN_REV_KEY,String(meta.revision))}
function cloudRememberBase(meta,fingerprint){if(meta?.revision)localStorage.setItem(MD_CLOUD_BASE_REV_KEY,String(meta.revision));if(fingerprint)localStorage.setItem(MD_CLOUD_BASE_FP_KEY,fingerprint);cloudRememberSeen(meta)}
async function cloudGetMeta(){const rows=await mdCloudFetch(`/rest/v1/${MD_TEST_STATE_TABLE}?workspace_id=eq.${encodeURIComponent(MD_TEST_WORKSPACE)}&select=workspace_id,revision,updated_at,updated_by_device,app_version,payload_hash&limit=1`);return Array.isArray(rows)&&rows.length?rows[0]:null}
async function cloudGetState(){const rows=await mdCloudFetch(`/rest/v1/${MD_TEST_STATE_TABLE}?workspace_id=eq.${encodeURIComponent(MD_TEST_WORKSPACE)}&select=workspace_id,revision,updated_at,updated_by_device,app_version,payload_hash,payload&limit=1`);return Array.isArray(rows)&&rows.length?rows[0]:null}
function stableJson(value){
 if(value===null||typeof value!=="object")return JSON.stringify(value);
 if(Array.isArray(value))return "["+value.map(stableJson).join(",")+"]";
 return "{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+stableJson(value[k])).join(",")+"}";
}
async function sha256Text(text){const bytes=new TextEncoder().encode(text),hash=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("")}
async function cloudStateFingerprint(pkg){const files=(pkg?.sourceFiles||[]).map(f=>({...f})).sort((a,b)=>String(a.id||a.archiveName||"").localeCompare(String(b.id||b.archiveName||"")));return sha256Text(stableJson({data:pkg?.data||{},sourceFiles:files}))}
function cloudMetaHtml(meta,extra=""){const base=cloudNumStorage(MD_CLOUD_BASE_REV_KEY);return meta?`<b>Shared revision ${meta.revision}</b> · ${escapeHtml(meta.updated_by_device||"unknown device")} · app v${escapeHtml(meta.app_version||"?")}<br>${escapeHtml(new Date(meta.updated_at).toLocaleString())}${base?`<br><b>This device sync base:</b> revision ${base}`:""}${extra?`<br>${extra}`:""}`:'No shared TEST snapshot uploaded yet.'}
async function cloudRefresh(){
 if(!mdCloudSession?.access_token){cloudStatus("Sign in to TEST Cloud first.","bad");return null}
 cloudStatus("Checking TEST Cloud…","info");
 try{
  const shops=await mdCloudFetch('/rest/v1/shops?select=name&order=name.asc&limit=5');
  const state=await cloudGetState();
  const m=cloudEl("cloudMeta");
  if(!state){cloudStatus(`Cloud connection OK • ${Array.isArray(shops)?shops.length:0} shops visible. No shared snapshot yet.`,"good");if(m)m.textContent='No shared TEST snapshot uploaded yet.';renderCloudOverview(null,"good");return null}
  cloudRememberSeen(state);
  let extra="";
  try{
   validateBackupPackage(state.payload);
   const remoteFp=await cloudStateFingerprint(state.payload);
   const localPkg=await createCompleteTransferPackage("TEST_CLOUD_COMPARE");
   const localFp=await cloudStateFingerprint(localPkg);
   if(remoteFp===localFp){
    cloudRememberBase(state,localFp);
    cloudStatus(`Whole-app snapshot matches revision ${state.revision}.`,"good");
    extra='<span style="color:#166534;font-weight:800">Local data matches this cloud revision.</span>';
    renderCloudOverview(state,"good");
   }else{
    const base=cloudNumStorage(MD_CLOUD_BASE_REV_KEY);
    cloudStatus(base&&Number(state.revision)>base?`Cloud revision ${state.revision} is newer than this device\'s sync base ${base}. Preview cloud before uploading.`:`Whole-app snapshot differs from this device. This can be normal after record-level delivery sync.`,"warn");
    extra='<span style="color:#9a3412;font-weight:800">Whole-app snapshot differs. Delivery Sync is separate.</span>';
    renderCloudOverview(state,base&&Number(state.revision)>base?"warn":"preview");
   }
  }catch(compareErr){console.warn("Cloud comparison unavailable",compareErr);cloudStatus(`Cloud connection OK • ${Array.isArray(shops)?shops.length:0} shops visible.`,"good")}
  if(m)m.innerHTML=cloudMetaHtml(state,extra);
  return state;
 }catch(e){console.error(e);const msg=String(e?.message||e||"");if(msg.includes("Session expired")){cloudStatus("Session expired — please sign in again.","bad");renderCloudOverview(null,"bad");const pw=cloudEl("cloudPassword");if(pw)setTimeout(()=>pw.focus(),80);}else cloudStatus(`Cloud check failed — ${msg}`,"bad");return null}
}
async function cloudPush(){
 if(!mdCloudSession?.access_token)return cloudStatus("Sign in to TEST Cloud first.","bad");
 const label=(cloudEl("cloudDeviceLabel")?.value||detectCloudDeviceLabel()).trim()||"Test device";
 localStorage.setItem("mdpin-cloud-device",label);
 cloudStatus("Checking cloud revision before upload…","info");
 try{
  const before=await cloudGetMeta();
  const currentRevision=Number(before?.revision)||0;
  const baseRevision=cloudNumStorage(MD_CLOUD_BASE_REV_KEY);
  if(currentRevision>0&&baseRevision!==currentRevision){
   const known=baseRevision?`revision ${baseRevision}`:"no established sync base";
   cloudRememberSeen(before);
   const m=cloudEl("cloudMeta");if(m)m.innerHTML=cloudMetaHtml(before,'<span style="color:#9a3412;font-weight:800">Upload blocked until this device is brought up to date.</span>');
   cloudStatus(`Upload blocked — cloud is revision ${currentRevision} from ${before.updated_by_device||"another device"}, while this device has ${known}.`,"warn");
   const resolveNow=confirm(`This device cannot upload yet because TEST Cloud has newer data.\n\nCloud: revision ${currentRevision} from ${before.updated_by_device||"another device"}\nThis device: ${known}\n\nTap OK to preview the newer cloud data now. Nothing on this device changes until you approve Replace This Device's Data.\n\nTap Cancel to leave this device unchanged.`);
   if(resolveNow){await cloudPull();}
   else{cloudStatus(`Conflict left unresolved — this device is unchanged and upload remains blocked until revision ${currentRevision} is reviewed.`,"warn");}
   return;
  }
  const pkg=await createCompleteTransferPackage("TEST_CLOUD_STATE");
  const hash=await sha256Text(stableJson(pkg)),fingerprint=await cloudStateFingerprint(pkg),revision=currentRevision+1;
  const c=pkg.counts;
  if(!confirm(`Upload this device to TEST Cloud?\n\nRevision ${revision}\n${c.products} products · ${c.aliases} aliases · ${c.sundayReports} Sunday reports · ${c.deliveries} deliveries · ${c.invoices} invoices\n\nTEST workspace only.`)){cloudStatus("Upload cancelled — nothing changed.","info");return}
  const row={workspace_id:MD_TEST_WORKSPACE,revision,app_version:"0.10.109",payload:pkg,payload_hash:hash,updated_by:mdCloudSession.user?.id||null,updated_by_device:label,updated_at:new Date().toISOString()};
  let saved;
  if(currentRevision===0){
   saved=await mdCloudFetch(`/rest/v1/${MD_TEST_STATE_TABLE}`,{method:"POST",body:row,headers:{Prefer:"return=representation"}});
  }else{
   saved=await mdCloudFetch(`/rest/v1/${MD_TEST_STATE_TABLE}?workspace_id=eq.${encodeURIComponent(MD_TEST_WORKSPACE)}&revision=eq.${currentRevision}`,{method:"PATCH",body:row,headers:{Prefer:"return=representation"}});
  }
  const written=Array.isArray(saved)&&saved.length?saved[0]:null;
  if(!written)throw new Error(`Revision conflict — cloud changed after this device checked revision ${currentRevision}. Nothing was overwritten.`);
  if(Number(written.revision)!==revision||written.payload_hash!==hash)throw new Error("Database did not confirm the uploaded revision.");
  let after=null;
  for(let i=0;i<3;i++){after=await cloudGetMeta();if(after&&Number(after.revision)===revision&&after.payload_hash===hash)break;await new Promise(r=>setTimeout(r,200));}
  if(!after||Number(after.revision)!==revision||after.payload_hash!==hash)throw new Error("Upload saved, but read-back verification did not match. Please retry Check TEST Cloud.");
  cloudRememberBase(after,fingerprint);
  cloudStatus(`Upload successful — revision ${revision} saved from ${label}.`,"good");
  const m=cloudEl("cloudMeta");if(m)m.innerHTML=cloudMetaHtml(after,'<span style="color:#166534;font-weight:800">This device is now based on the latest cloud revision.</span>');
  renderCloudOverview(after,"good");renderCloudTestMarker();
 }catch(e){
  console.error(e);
  const msg=String(e?.message||e||"");
  cloudStatus(msg.includes("Revision conflict")?msg:`Upload failed — ${msg}`,msg.includes("Revision conflict")?"warn":"bad");
 }
}
async function cloudPull(){
 if(!mdCloudSession?.access_token)return cloudStatus("Sign in to TEST Cloud first.","bad");
 cloudStatus("Downloading shared TEST data…","info");
 try{
  const row=await cloudGetState();
  if(!row)throw new Error("No TEST cloud snapshot exists yet.");
  const pkg=row.payload;validateBackupPackage(pkg);
  const hash=await sha256Text(stableJson(pkg));if(row.payload_hash&&hash!==row.payload_hash)throw new Error("Cloud snapshot integrity check failed.");
  cloudRememberSeen(row);
  Object.defineProperty(pkg,"_mdCloudMeta",{value:{revision:Number(row.revision),updated_by_device:row.updated_by_device||"",updated_at:row.updated_at||"",payload_hash:row.payload_hash||""},enumerable:false,configurable:true});
  showTransferPreview(pkg);
  cloudStatus(`Revision ${row.revision} downloaded from ${row.updated_by_device||"another test device"}. Preview only — this device has not changed.`,"good");
  renderCloudOverview(row,"preview");
 }catch(e){console.error(e);cloudStatus(`Download failed — ${e.message}`,"bad")}
}
const BACKUP_FORMAT="magic-dragon-pin-full-backup";
const BACKUP_SCHEMA=1;
let pendingTransferPackage=null;
function backupStatus(msg,bad=false){const el=document.getElementById("backupStatus");if(el){el.textContent=msg;el.classList.toggle("transferResultStatus",true);el.classList.toggle("good",!bad);el.classList.toggle("bad",!!bad)}}
function backupCounts(data=db){
 const products=Array.isArray(data?.products)?data.products.length:0;
 const variants=products;
 const aliases=data?.productAliases&&typeof data.productAliases==="object"?Object.keys(data.productAliases).length:0;
 return {
  products,variants,aliases,
  deliveries:Array.isArray(data?.deliveries)?data.deliveries.length:0,
  sundayReports:Array.isArray(data?.sundayImports)?data.sundayImports.length:0,
  invoices:Array.isArray(data?.invoices)?data.invoices.length:0,
  payments:Array.isArray(data?.invoices)?data.invoices.filter(i=>i?.payment?.status==="paid"||i?.status==="paid").length:(Array.isArray(data?.payments)?data.payments.length:0)
 };
}
function bytesToBase64(bytes){let out="";const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)out+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(out)}
function base64ToBytes(text){const raw=atob(text),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
async function exportArchivedSourceFiles(){
 try{
  const idb=await openFileDb();
  const rows=await new Promise((resolve,reject)=>{const tx=idb.transaction("sourceFiles","readonly"),rq=tx.objectStore("sourceFiles").getAll();rq.onsuccess=()=>resolve(rq.result||[]);rq.onerror=()=>reject(rq.error)});
  idb.close();
  const out=[];
  for(const rec of rows){
   if(!rec?.blob)continue;
   const bytes=new Uint8Array(await rec.blob.arrayBuffer());
   out.push({id:rec.id,archiveName:rec.archiveName||"Sunday-Report.xlsx",storedAt:rec.storedAt||null,type:rec.blob.type||"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",data:bytesToBase64(bytes)});
  }
  return out;
 }catch(e){console.warn("Backup could not read archived source files",e);return []}
}
async function countArchivedSourceFiles(){
 try{const idb=await openFileDb();const n=await new Promise((resolve,reject)=>{const tx=idb.transaction("sourceFiles","readonly"),rq=tx.objectStore("sourceFiles").count();rq.onsuccess=()=>resolve(rq.result||0);rq.onerror=()=>reject(rq.error)});idb.close();return n}catch(e){return -1}
}
async function replaceArchivedSourceFiles(files){
 const idb=await openFileDb();
 await new Promise((resolve,reject)=>{const tx=idb.transaction("sourceFiles","readwrite"),store=tx.objectStore("sourceFiles");store.clear();for(const f of files||[]){if(!f?.id||!f?.data)continue;const bytes=base64ToBytes(f.data);store.put({id:f.id,archiveName:f.archiveName||"Sunday-Report.xlsx",storedAt:f.storedAt||new Date().toISOString(),blob:new Blob([bytes],{type:f.type||"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})})}tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});
 idb.close();
}
function validateBackupPackage(pkg){
 if(!pkg||typeof pkg!=="object")throw new Error("This is not a Magic Dragon backup file.");
 if(pkg.format!==BACKUP_FORMAT||Number(pkg.schema)!==BACKUP_SCHEMA)throw new Error("This backup format is not supported by this version of Magic Dragon.");
 if(!pkg.data||typeof pkg.data!=="object")throw new Error("The backup does not contain app data.");
 ["products","deliveries"].forEach(k=>{if(!Array.isArray(pkg.data[k]))throw new Error(`Backup is missing ${k}.`)});
 if(pkg.sourceFiles!=null&&!Array.isArray(pkg.sourceFiles))throw new Error("Archived source files are invalid.");
 return true;
}
async function createCompleteTransferPackage(kind="FULL_TRANSFER"){
 const sourceFiles=await exportArchivedSourceFiles(),counts=backupCounts();
 return {format:BACKUP_FORMAT,schema:BACKUP_SCHEMA,appVersion:"0.10.131",backupKind:kind,createdAt:new Date().toISOString(),counts,sourceFilesCount:sourceFiles.length,data:JSON.parse(JSON.stringify(db)),sourceFiles};
}
async function savePackageFile(pkg,prefix="Magic-Pin-Data"){
 const blob=new Blob([JSON.stringify(pkg)],{type:"application/json"});
 const stamp=mdNowStamp();
 const fileName=`${prefix}-${stamp}.json`;
 const file=new File([blob],fileName,{type:"application/json"});
 if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
  try{await navigator.share({files:[file]});return {saved:true,method:"share",fileName}}catch(e){if(e?.name==="AbortError")return {saved:false,cancelled:true,fileName}}
 }
 try{const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);return {saved:true,method:"download",fileName}}catch(e){console.error(e);return {saved:false,error:true,fileName}}
}
function showTransferPreview(pkg){
 pendingTransferPackage=pkg;
 const c=backupCounts(pkg.data),overlay=document.getElementById("transferPreviewOverlay"),meta=document.getElementById("transferPreviewMeta"),grid=document.getElementById("transferPreviewGrid");
 const when=pkg.createdAt?new Date(pkg.createdAt).toLocaleString():"Unknown";
 if(meta)meta.innerHTML=`<b>Source app:</b> v${escapeHtml(pkg.appVersion||"unknown")}<br><b>Created:</b> ${escapeHtml(when)}<br><b>Archived Sunday source files:</b> ${(pkg.sourceFiles||[]).length}`;
 const items=[["Products / variants",c.products],["Aliases / mappings",c.aliases],["Sunday reports",c.sundayReports],["Delivery dockets",c.deliveries],["Invoices",c.invoices],["Paid invoices",c.payments]];
 if(grid)grid.innerHTML=items.map(([label,n])=>`<div class="transferPreviewStat"><b>${n}</b><span>${label}</span></div>`).join("");
 if(overlay){overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
}
function closeTransferPreview(){const overlay=document.getElementById("transferPreviewOverlay");if(overlay){overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true")}document.body.style.overflow="";pendingTransferPackage=null}
async function verifyImportedTransfer(pkg){
 const expected=backupCounts(pkg.data),actual=backupCounts(db),expectedSources=(pkg.sourceFiles||[]).length,actualSources=await countArchivedSourceFiles();
 const keys=["products","aliases","sundayReports","deliveries","invoices","payments"];
 const mismatches=keys.filter(k=>Number(expected[k])!==Number(actual[k]));
 if(actualSources>=0&&actualSources!==expectedSources)mismatches.push("sourceFiles");
 return {ok:mismatches.length===0,expected,actual,expectedSources,actualSources,mismatches};
}
document.getElementById("exportData").onclick=async()=>{
 const btn=document.getElementById("exportData");if(btn.disabled)return;btn.disabled=true;backupStatus("Preparing complete app-data transfer package…");
 try{
  const pkg=await createCompleteTransferPackage("COMPLETE_APP_DATA");
  const result=await savePackageFile(pkg);
  if(result.cancelled){backupStatus("Export cancelled. No app data was changed.");return}
  if(!result.saved)throw new Error("The transfer file could not be saved or shared.");
  const c=pkg.counts;backupStatus(`Complete app data exported: ${c.products} products, ${c.aliases} aliases, ${c.sundayReports} Sunday reports, ${c.deliveries} deliveries, ${c.invoices} invoices, ${pkg.sourceFilesCount} archived source files.`);
 }catch(e){console.error(e);backupStatus("Complete app-data export could not be created. No app data was changed.",true);alert(e?.message||"The complete app-data export could not be created.")}
 finally{btn.disabled=false}
};
document.getElementById("importData").onchange=e=>{
 const input=e.target,f=input.files?.[0];if(!f)return;backupStatus("Checking complete app-data file…");
 const r=new FileReader();
 r.onload=()=>{
  try{const pkg=JSON.parse(r.result);validateBackupPackage(pkg);showTransferPreview(pkg);backupStatus("Preview ready. Nothing has changed on this device.")}
  catch(err){console.error(err);backupStatus(err?.message||"Invalid backup file.",true);alert(err?.message||"This backup file could not be opened.");input.value=""}
 };
 r.onerror=()=>{backupStatus("The selected backup file could not be read.",true);input.value=""};
 r.readAsText(f);
};
document.getElementById("transferPreviewCancel").onclick=()=>{closeTransferPreview();const input=document.getElementById("importData");if(input)input.value="";backupStatus("Import cancelled. Nothing on this device was changed.")};
document.getElementById("transferPreviewCommit").onclick=async()=>{
 const pkg=pendingTransferPackage;if(!pkg)return;
 const commit=document.getElementById("transferPreviewCommit");commit.disabled=true;
 let safety=null,changed=false;
 try{
  const continueSafety=confirm(
   "Safety backup required before replacing this device's data.\n\n"+
   "Magic Dragon will first create a copy of the CURRENT app data on this device.\n\n"+
   "On iPhone, the backup may either open the Share / Save sheet OR save automatically to Downloads, depending on Safari.\n\n"+
   "The replacement will not begin until the safety-backup step has completed.\n\n"+
   "Tap OK to create the safety backup."
  );
  if(!continueSafety){backupStatus("Import paused before safety backup. Nothing on this device was changed.");return}
  backupStatus("Creating pre-import safety backup…");
  safety=await createCompleteTransferPackage("PRE_IMPORT_SAFETY");
  const saved=await savePackageFile(safety,"Magic-Pin-SAFETY");
  if(saved.cancelled||!saved.saved){backupStatus("Import stopped because the pre-import safety backup was not saved. Nothing changed.",true);return}
  const safetyWhere=saved.method==="download"
   ? `Safety backup created successfully and saved automatically to your iPhone Downloads as:

${saved.fileName}`
   : `Safety backup step completed successfully:

${saved.fileName}`;
  const continueReplace=confirm(
   `${safetyWhere}\n\nYour CURRENT app data is now protected.\n\nTap OK to replace this device with the selected backup, or Cancel to stop here without changing the app data.`
  );
  if(!continueReplace){backupStatus(`Safety backup created (${saved.fileName}), but the data replacement was cancelled. Nothing on this device was changed.`);return}
  backupStatus("Safety backup confirmed. Replacing this device's data…");
  await replaceArchivedSourceFiles(pkg.sourceFiles||[]);
  changed=true;
  Object.keys(db).forEach(k=>delete db[k]);Object.assign(db,JSON.parse(JSON.stringify(pkg.data)));
  localStorage.setItem("mdpin-db",JSON.stringify(db));
  const check=await verifyImportedTransfer(pkg);
  if(!check.ok)throw new Error(`Import verification failed: ${check.mismatches.join(", ")}. The pre-import safety backup is available for recovery.`);
  if(pkg._mdCloudMeta?.revision){
   const fp=await cloudStateFingerprint(pkg);
   cloudRememberBase(pkg._mdCloudMeta,fp);
  }
  sessionStorage.setItem("mdpin-transfer-result",JSON.stringify({at:new Date().toISOString(),sourceVersion:pkg.appVersion||"unknown",counts:check.actual,sourceFiles:check.actualSources,safetyFile:saved?.fileName||"",cloudRevision:pkg._mdCloudMeta?.revision||null}));
  closeTransferPreview();
  backupStatus("Import verified successfully. Reloading to finish…");
  location.reload();
 }catch(err){
  console.error(err);
  if(changed&&safety){
   try{
    await replaceArchivedSourceFiles(safety.sourceFiles||[]);
    Object.keys(db).forEach(k=>delete db[k]);Object.assign(db,JSON.parse(JSON.stringify(safety.data)));
    localStorage.setItem("mdpin-db",JSON.stringify(db));
    backupStatus(`Import failed verification and this device was automatically restored to its pre-import state. ${err?.message||""}`,true);
    alert(`Import was not accepted. This device has been automatically rolled back to its pre-import state.\n\n${err?.message||"Verification failed."}`);
   }catch(rollbackErr){
    console.error("Automatic rollback failed",rollbackErr);
    backupStatus("Import failed and automatic rollback could not be verified. Use the saved PRE-IMPORT-SAFETY file to restore this device.",true);
    alert("Import failed and automatic rollback could not be verified. Use the PRE-IMPORT-SAFETY file that was saved before the import.");
   }
  }else{
   backupStatus(err?.message||"Import failed. Nothing was changed.",true);alert(err?.message||"The import could not be completed.");
  }
 }
 finally{commit.disabled=false;const input=document.getElementById("importData");if(input)input.value=""}
};
function showLastTransferResult(){
 try{
  const raw=sessionStorage.getItem("mdpin-transfer-result");if(!raw)return;
  sessionStorage.removeItem("mdpin-transfer-result");
  const r=JSON.parse(raw),c=r.counts||{};
  const summary=`Restore complete and verified.${r.cloudRevision?`\nCloud revision ${r.cloudRevision} is now this device's sync base.`:""}\n\n${c.products||0} products · ${c.aliases||0} aliases · ${c.sundayReports||0} Sunday reports · ${c.deliveries||0} deliveries · ${c.invoices||0} invoices.${r.safetyFile?`\n\nSafety backup: ${r.safetyFile}`:""}`;
  backupStatus(`Restore complete and verified — ${c.products||0} products, ${c.aliases||0} aliases, ${c.sundayReports||0} Sunday reports, ${c.deliveries||0} deliveries, ${c.invoices||0} invoices, ${r.sourceFiles>=0?r.sourceFiles:"?"} archived source files.`);
  if(r.cloudRevision){
    const tc=document.getElementById("testCloudDetails"),br=document.getElementById("backupRecoveryDetails");if(tc)tc.open=true;if(br)br.open=false;
    const meta={revision:Number(r.cloudRevision),updated_by_device:"cloud",app_version:r.sourceVersion||"",updated_at:r.at||new Date().toISOString()};
    cloudStatus(`Device updated successfully — now based on cloud revision ${r.cloudRevision}.`,"good");renderCloudOverview(meta,"good");
    setTimeout(async()=>{tc?.scrollIntoView({behavior:"smooth",block:"start"});if(mdCloudSession?.access_token)await cloudRefresh();},180);
  }
  setTimeout(()=>alert(summary),150);
 }catch(e){}
}
if(cloudEl("cloudInfoToggle"))cloudEl("cloudInfoToggle").onclick=()=>{const panel=cloudEl("cloudInfoPanel"),btn=cloudEl("cloudInfoToggle");if(!panel||!btn)return;panel.hidden=!panel.hidden;btn.setAttribute("aria-expanded",panel.hidden?"false":"true");btn.textContent=panel.hidden?"ⓘ TEST info":"ⓘ Hide info";};
if(cloudEl("cloudSignIn"))cloudEl("cloudSignIn").onclick=cloudSignIn;
if(cloudEl("cloudSignOut"))cloudEl("cloudSignOut").onclick=cloudSignOut;
if(cloudEl("cloudRefresh"))cloudEl("cloudRefresh").onclick=cloudRefresh;
if(cloudEl("cloudPush"))cloudEl("cloudPush").onclick=cloudPush;
if(cloudEl("cloudPull"))cloudEl("cloudPull").onclick=cloudPull;

/* v0.10.70 — first record-level sync Lego block: delivery dockets only. */
const MD_DELIVERY_SYNC_META_KEY="mdpin-cloud-delivery-sync-meta";
function deliverySyncMeta(){try{return JSON.parse(localStorage.getItem(MD_DELIVERY_SYNC_META_KEY)||"{}")||{}}catch(e){return {}}}
function saveDeliverySyncMeta(meta){localStorage.setItem(MD_DELIVERY_SYNC_META_KEY,JSON.stringify(meta||{}))}
function deliveryRecordStatus(msg,state="info"){
 const el=cloudEl("cloudDeliveryRecordStatus");if(!el)return;
 el.textContent=msg;el.classList.remove("good","warn","bad");if(state==="good")el.classList.add("good");else if(state==="warn")el.classList.add("warn");else if(state==="bad")el.classList.add("bad");
}
function eligibleDeliveryRecords(){
 // v0.10.109: untouched auto-generated Sunday suggestions stay local-only,
 // but once Pin edits one or marks it delivered it becomes a real docket
 // and must participate in record-level cloud sync.
 return [...(db.deliveries||[])].filter(d=>{
  if(!d||!d.id)return false;
  if(!d.generatedFromSundaySuggestion)return true;
  return !!(d.userEditedSuggestedDraft||d.deliveredAt);
 }).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||String(b.id).localeCompare(String(a.id)));
}
function deliveryRecordLabel(d){return `${d.date||"No date"} · ${displayBranchName(d.branch||"")} · ${d.id}`}
function deliveryTestMarkerText(d){
 const m=d?.syncTestMarker;if(!m)return "";
 if(typeof m==="string")return m;
 const label=String(m.label||"Test device"),stamp=String(m.createdAt||"");
 return `${label}${stamp?` · ${new Date(stamp).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}`:""}`;
}
function renderDeliveryTestMarker(){
 const sel=cloudEl("cloudDeliveryRecordSelect"),box=cloudEl("cloudDeliveryTestMarker");if(!box)return;
 const d=(db.deliveries||[]).find(x=>x.id===sel?.value),marker=deliveryTestMarkerText(d);
 box.textContent=marker?`Current marker: ${marker}`:"No test marker on this docket.";
 box.classList.toggle("empty",!marker);
}
function renderCloudDeliveryRecordUi(preferredId=""){
 const sel=cloudEl("cloudDeliveryRecordSelect");
 const current=sel?(preferredId||sel.value):"";const rows=eligibleDeliveryRecords();
 if(sel){sel.innerHTML=rows.length?rows.map(d=>`<option value="${escapeHtml(d.id)}">${escapeHtml(deliveryRecordLabel(d))}</option>`).join(""):'<option value="">No local delivery dockets</option>';if(current&&rows.some(d=>d.id===current))sel.value=current;renderDeliveryTestMarker();}
 const local=cloudEl("deliveryLocalCount");if(local)local.textContent=String(rows.length);
 renderDeliverySyncOverview(false).catch(()=>{});
}
let deliverySyncStatusRun=0;
function setDeliverySyncState(message,state=""){
 const el=cloudEl("deliverySyncState");if(!el)return;
 el.textContent=message;el.className=`deliverySyncState${state?` ${state}`:""}`;
}
async function renderDeliverySyncOverview(announce=false){
 const run=++deliverySyncStatusRun,localRows=eligibleDeliveryRecords(),meta=deliverySyncMeta();
 const l=cloudEl("deliveryLocalCount"),p=cloudEl("deliveryPendingCount"),c=cloudEl("deliveryCloudCount");
 if(l)l.textContent=String(localRows.length);
 if(!mdCloudSession?.access_token){if(p)p.textContent="—";if(c)c.textContent="—";setDeliverySyncState("Sign in to check delivery sync.");return null;}
 setDeliverySyncState("Checking delivery sync…");
 try{
  const remoteRows=await cloudGetDeliveryRecords();if(run!==deliverySyncStatusRun)return null;
  const localMap=Object.fromEntries(localRows.map(d=>[d.id,d])),remoteMap=Object.fromEntries(remoteRows.map(r=>[r.record_id,r]));
  let upload=0,download=0,conflict=0,current=0;
  for(const id of new Set([...Object.keys(localMap),...Object.keys(remoteMap)])){
   const local=localMap[id],remote=remoteMap[id],base=meta[id]||null;
   if(local&&!remote){upload++;continue}
   if(!local&&remote){download++;continue}
   const localFp=await deliveryPayloadFingerprint(local),remoteFp=remote.payload_hash||await deliveryPayloadFingerprint(remote.payload);
   if(localFp===remoteFp){current++;continue}
   if(!base){conflict++;continue}
   const localChanged=localFp!==base.fingerprint;
   const cloudChanged=Number(remote.revision)!==Number(base.revision)||remoteFp!==base.fingerprint;
   if(localChanged&&cloudChanged)conflict++;
   else if(cloudChanged)download++;
   else if(localChanged)upload++;
   else conflict++;
  }
  if(run!==deliverySyncStatusRun)return null;
  if(c)c.textContent=String(remoteRows.length);if(p)p.textContent=String(upload);
  let message,state;
  if(conflict){message=`Review needed · ${conflict} delivery conflict${conflict===1?"":"s"}`;state="bad";}
  else if(download){message=`Cloud newer · ${download} docket${download===1?"":"s"} ready to pull${upload?` · ${upload} local change${upload===1?"":"s"} waiting`:""}`;state="warn";}
  else if(upload){message=`Changes to upload · ${upload} docket${upload===1?"":"s"}`;state="warn";}
  else{message=`Up to date · ${current} cloud-linked docket${current===1?"":"s"} match`;state="good";}
  setDeliverySyncState(message,state);
  if(announce)deliveryRecordStatus(`${message}. Automatic check only — no data was changed.`,state==="bad"?"warn":state);
  return {upload,download,conflict,current,local:localRows.length,cloud:remoteRows.length};
 }catch(e){
  if(run!==deliverySyncStatusRun)return null;
  if(c)c.textContent="?";if(p)p.textContent="?";setDeliverySyncState(`Check failed · ${e.message||e}`,"bad");
  if(announce)deliveryRecordStatus(`Automatic delivery check failed — ${e.message||e}`,"bad");
  return null;
 }
}
async function deliveryPayloadFingerprint(d){return sha256Text(stableJson(d||{}))}
async function purgeCachedSupabaseRequests(){
 try{
  if(!("caches" in window))return;
  const names=await caches.keys();
  for(const name of names){
   const cache=await caches.open(name);
   const reqs=await cache.keys();
   for(const req of reqs){
    if(String(req.url||"").startsWith(MD_TEST_SUPABASE_URL))await cache.delete(req);
   }
  }
 }catch(e){console.warn("Could not purge cached Supabase requests",e)}
}
async function cloudGetDeliveryRecord(id){
 await purgeCachedSupabaseRequests();
 const rows=await mdCloudFetch(`/rest/v1/${MD_TEST_DELIVERY_TABLE}?workspace_id=eq.${encodeURIComponent(MD_TEST_WORKSPACE)}&record_id=eq.${encodeURIComponent(id)}&select=workspace_id,record_id,revision,payload,payload_hash,updated_by_device,updated_at,app_version&limit=1`);
 return Array.isArray(rows)&&rows.length?rows[0]:null;
}
async function cloudGetDeliveryRecords(){
 await purgeCachedSupabaseRequests();
 const rows=await mdCloudFetch(`/rest/v1/${MD_TEST_DELIVERY_TABLE}?workspace_id=eq.${encodeURIComponent(MD_TEST_WORKSPACE)}&deleted=eq.false&select=workspace_id,record_id,revision,payload,payload_hash,updated_by_device,updated_at,app_version&order=updated_at.asc`);
 return Array.isArray(rows)?rows:[];
}
let deliveryConflictCache=[];
function deliveryConflictFieldRows(local,remote){
 const rows=[];
 const push=(label,a,b)=>{if(String(a??"")!==String(b??""))rows.push([label,String(a??"—"),String(b??"—")]);};
 push("Shop",displayBranchName(local?.branch||""),displayBranchName(remote?.branch||""));
 push("Date",local?.date||"",remote?.date||"");
 push("Note",local?.note||"",remote?.note||"");
 push("Delivered",local?.deliveredAt?"Yes":"No",remote?.deliveredAt?"Yes":"No");
 push("TEST marker",deliveryTestMarkerText(local),deliveryTestMarkerText(remote));
 const lm=Object.fromEntries((local?.lines||[]).map(l=>[String(l.productId||l.productName||""),l]));
 const rm=Object.fromEntries((remote?.lines||[]).map(l=>[String(l.productId||l.productName||""),l]));
 [...new Set([...Object.keys(lm),...Object.keys(rm)])].forEach(k=>{const a=lm[k],b=rm[k];if(Number(a?.qty||0)!==Number(b?.qty||0)){const p=resolvedProductById(k)||db.products.find(x=>x.id===k);push(p?deliveryProductDisplayName(p):k,Number(a?.qty||0),Number(b?.qty||0));}});
 return rows;
}
function renderDeliveryConflictPanel(conflicts=deliveryConflictCache){
 deliveryConflictCache=Array.isArray(conflicts)?conflicts:[];
 const box=cloudEl("cloudDeliveryConflictPanel");if(!box)return;
 if(!deliveryConflictCache.length){box.classList.remove("show");box.innerHTML="";return;}
 box.classList.add("show");
 box.innerHTML=`<div class="cloudConflictHeader"><div><b>${deliveryConflictCache.length} delivery conflict${deliveryConflictCache.length===1?"":"s"} need review</b><div class="cloudConflictMeta">Nothing has been overwritten.</div></div><span>REVIEW</span></div>`+deliveryConflictCache.map(c=>{const local=c.local,remote=c.remote?.payload||{};const diffs=deliveryConflictFieldRows(local,remote);return `<div class="cloudConflictCard"><div class="cloudConflictTitle">${escapeHtml(c.id)} · ${escapeHtml(displayBranchName(local?.branch||remote?.branch||""))}</div><div class="cloudConflictMeta">Cloud rev ${Number(c.remote?.revision||0)}${c.remote?.updated_by_device?` · changed on ${escapeHtml(c.remote.updated_by_device)}`:""}</div><div class="cloudConflictDiff"><div class="cloudConflictDiffRow head"><span>Difference</span><b>This device</b><b>Cloud</b></div>${(diffs.length?diffs:[["Record","Different","Different"]]).slice(0,10).map(r=>`<div class="cloudConflictDiffRow"><span>${escapeHtml(r[0])}</span><b>${escapeHtml(r[1])}</b><b>${escapeHtml(r[2])}</b></div>`).join("")}</div><div class="cloudConflictActions"><button class="btn alt" type="button" onclick="resolveDeliveryConflictUseCloud('${escapeHtmlAttr(c.id)}')">Use cloud version</button><button class="btn primary" type="button" onclick="resolveDeliveryConflictKeepLocal('${escapeHtmlAttr(c.id)}')">Keep this device</button></div><div class="cloudConflictLater">Or leave it unresolved and decide later.</div></div>`;}).join("");
}
window.resolveDeliveryConflictUseCloud=async id=>{
 const c=deliveryConflictCache.find(x=>x.id===id);if(!c)return;
 const remote=c.remote;if(!remote?.payload)return deliveryRecordStatus("Cloud copy is no longer available. Check / Pull again.","warn");
 if(!confirm(`Use the cloud version of ${id} on this device?\n\nYour unsynced local edit will be replaced.`))return;
 const i=(db.deliveries||[]).findIndex(d=>d.id===id);if(i<0)return;
 db.deliveries[i]=JSON.parse(JSON.stringify(remote.payload));
 const fp=remote.payload_hash||await deliveryPayloadFingerprint(remote.payload),meta=deliverySyncMeta();meta[id]={revision:Number(remote.revision),fingerprint:fp};saveDeliverySyncMeta(meta);save();
 deliveryConflictCache=deliveryConflictCache.filter(x=>x.id!==id);renderDeliveryConflictPanel();renderCloudDeliveryRecordUi();renderDocketArchive();renderHistory();deliveryRecordStatus(`✓ Conflict resolved — ${id} now uses cloud revision ${remote.revision}.`,"good");
};
window.resolveDeliveryConflictKeepLocal=async id=>{
 const c=deliveryConflictCache.find(x=>x.id===id);if(!c)return;
 if(!mdCloudSession?.access_token)return deliveryRecordStatus("Sign in to TEST Cloud first.","bad");
 const local=(db.deliveries||[]).find(d=>d.id===id),remote=c.remote;if(!local||!remote)return;
 if(!confirm(`Keep this device's version of ${id}?\n\nIt will replace cloud revision ${remote.revision} as a new revision.`))return;
 try{
  const label=(cloudEl("cloudDeviceLabel")?.value||localStorage.getItem("mdpin-cloud-device")||detectCloudDeviceLabel()).trim()||"Test device";
  const fp=await deliveryPayloadFingerprint(local),next=Number(remote.revision)+1;
  const row={revision:next,payload:JSON.parse(JSON.stringify(local)),payload_hash:fp,updated_by:mdCloudSession.user?.id||null,updated_by_device:label,updated_at:new Date().toISOString(),app_version:"0.10.109",deleted:false};
  const saved=await mdCloudFetch(`/rest/v1/${MD_TEST_DELIVERY_TABLE}?workspace_id=eq.${encodeURIComponent(MD_TEST_WORKSPACE)}&record_id=eq.${encodeURIComponent(id)}&revision=eq.${remote.revision}`,{method:"PATCH",body:row,headers:{Prefer:"return=representation"}});
  const written=Array.isArray(saved)&&saved.length?saved[0]:null;if(!written)throw new Error("Cloud changed again while you were reviewing. Check / Pull again.");
  const meta=deliverySyncMeta();meta[id]={revision:next,fingerprint:fp};saveDeliverySyncMeta(meta);deliveryConflictCache=deliveryConflictCache.filter(x=>x.id!==id);renderDeliveryConflictPanel();renderCloudDeliveryRecordUi();deliveryRecordStatus(`✓ Conflict resolved — this device is now cloud revision ${next}.`,"good");
 }catch(e){deliveryRecordStatus(`Could not resolve conflict — ${e.message||e}`,"bad")}
};
async function cloudSyncDeliveryChanges(){
 if(!mdCloudSession?.access_token)return deliveryRecordStatus("Sign in to TEST Cloud first.","bad");
 const label=(cloudEl("cloudDeviceLabel")?.value||localStorage.getItem("mdpin-cloud-device")||detectCloudDeviceLabel()).trim()||"Test device";
 deliveryRecordStatus("Checking all local delivery changes…");
 try{
  const localRows=eligibleDeliveryRecords(),remoteRows=await cloudGetDeliveryRecords(),remoteMap=Object.fromEntries(remoteRows.map(r=>[r.record_id,r])),meta=deliverySyncMeta();
  let added=0,updated=0,current=0,conflicts=[];
  for(const d of localRows){
   const id=d.id,localFp=await deliveryPayloadFingerprint(d),remote=remoteMap[id],base=meta[id]||null;
   if(!remote){
    const row={workspace_id:MD_TEST_WORKSPACE,record_id:id,revision:1,payload:JSON.parse(JSON.stringify(d)),payload_hash:localFp,updated_by:mdCloudSession.user?.id||null,updated_by_device:label,updated_at:new Date().toISOString(),app_version:"0.10.109",deleted:false};
    const saved=await mdCloudFetch(`/rest/v1/${MD_TEST_DELIVERY_TABLE}`,{method:"POST",body:row,headers:{Prefer:"return=representation"}});const written=Array.isArray(saved)&&saved.length?saved[0]:null;
    if(!written){conflicts.push({id,reason:"cloud did not confirm new record",local:d,remote:null});continue;}meta[id]={revision:1,fingerprint:localFp};added++;continue;
   }
   const remoteFp=remote.payload_hash||await deliveryPayloadFingerprint(remote.payload);
   if(localFp===remoteFp){meta[id]={revision:Number(remote.revision),fingerprint:remoteFp};current++;continue;}
   if(!base){conflicts.push({id,reason:"cloud copy already exists — pull first",local:d,remote});continue;}
   if(Number(base.revision)!==Number(remote.revision)){conflicts.push({id,reason:"cloud changed on another device — pull first",local:d,remote});continue;}
   if(localFp===base.fingerprint){conflicts.push({id,reason:"cloud has a newer change — pull first",local:d,remote});continue;}
   const next=Number(remote.revision)+1,row={revision:next,payload:JSON.parse(JSON.stringify(d)),payload_hash:localFp,updated_by:mdCloudSession.user?.id||null,updated_by_device:label,updated_at:new Date().toISOString(),app_version:"0.10.109",deleted:false};
   const saved=await mdCloudFetch(`/rest/v1/${MD_TEST_DELIVERY_TABLE}?workspace_id=eq.${encodeURIComponent(MD_TEST_WORKSPACE)}&record_id=eq.${encodeURIComponent(id)}&revision=eq.${remote.revision}`,{method:"PATCH",body:row,headers:{Prefer:"return=representation"}});const written=Array.isArray(saved)&&saved.length?saved[0]:null;
   if(!written){conflicts.push({id,reason:"revision conflict",local:d,remote});continue;}meta[id]={revision:next,fingerprint:localFp};updated++;
  }
  saveDeliverySyncMeta(meta);renderCloudDeliveryRecordUi();
  const result={at:new Date().toISOString(),added,updated,same:current,conflicts:conflicts.map(c=>`${c.id}: ${c.reason}`)};if(added||updated)saveDeliveryLastChange({...result,addedIds:[],updatedIds:[]});renderDeliveryTransferSummary(result);
  renderDeliveryConflictPanel(conflicts);
  if(conflicts.length)deliveryRecordStatus(`Sync finished — ${added} new sent, ${updated} updated, ${current} already current, ${conflicts.length} need review. Open the conflict review below.`,"warn");
  else if(added||updated)deliveryRecordStatus(`✓ Sync complete — ${added} new sent, ${updated} updated, ${current} already current.`,"good");
  else deliveryRecordStatus(`✓ Everything current — all ${current} local cloud-linked dockets already match.`,"good");
 }catch(e){console.error(e);const msg=String(e?.message||e||"");deliveryRecordStatus(msg.includes("Session expired")?"Session expired — please sign in again.":`Delivery sync failed — ${msg}`,"bad")}
}

async function cloudPushSelectedDeliveryRecord(){
 if(!mdCloudSession?.access_token)return deliveryRecordStatus("Sign in to TEST Cloud first.","bad");
 const id=cloudEl("cloudDeliveryRecordSelect")?.value;const d=(db.deliveries||[]).find(x=>x.id===id);
 if(!d)return deliveryRecordStatus("Choose a local delivery docket first.","bad");
 const label=(cloudEl("cloudDeviceLabel")?.value||localStorage.getItem("mdpin-cloud-device")||detectCloudDeviceLabel()).trim()||"Test device";
 deliveryRecordStatus("Checking this delivery record in TEST Cloud…");
 try{
   const remote=await cloudGetDeliveryRecord(id);const meta=deliverySyncMeta();const base=meta[id]||null;const localFp=await deliveryPayloadFingerprint(d);
   if(remote){
     if(!base||Number(base.revision)!==Number(remote.revision)){
       return deliveryRecordStatus(`Upload blocked — ${id} is cloud revision ${remote.revision}${remote.updated_by_device?` from ${remote.updated_by_device}`:""}. Pull delivery records first.`,"warn");
     }
     const next=Number(remote.revision)+1;const row={revision:next,payload:JSON.parse(JSON.stringify(d)),payload_hash:localFp,updated_by:mdCloudSession.user?.id||null,updated_by_device:label,updated_at:new Date().toISOString(),app_version:"0.10.109",deleted:false};
     const saved=await mdCloudFetch(`/rest/v1/${MD_TEST_DELIVERY_TABLE}?workspace_id=eq.${encodeURIComponent(MD_TEST_WORKSPACE)}&record_id=eq.${encodeURIComponent(id)}&revision=eq.${remote.revision}`,{method:"PATCH",body:row,headers:{Prefer:"return=representation"}});
     const written=Array.isArray(saved)&&saved.length?saved[0]:null;if(!written)throw new Error("Record revision conflict — another device changed this docket first.");
     meta[id]={revision:next,fingerprint:localFp};saveDeliverySyncMeta(meta);deliveryRecordStatus(`✓ Docket ${id} uploaded as record revision ${next} from ${label}.`,"good");
   }else{
     const row={workspace_id:MD_TEST_WORKSPACE,record_id:id,revision:1,payload:JSON.parse(JSON.stringify(d)),payload_hash:localFp,updated_by:mdCloudSession.user?.id||null,updated_by_device:label,updated_at:new Date().toISOString(),app_version:"0.10.109",deleted:false};
     const saved=await mdCloudFetch(`/rest/v1/${MD_TEST_DELIVERY_TABLE}`,{method:"POST",body:row,headers:{Prefer:"return=representation"}});
     const written=Array.isArray(saved)&&saved.length?saved[0]:null;if(!written)throw new Error("The cloud did not confirm the new delivery record.");
     meta[id]={revision:1,fingerprint:localFp};saveDeliverySyncMeta(meta);deliveryRecordStatus(`✓ Docket ${id} uploaded as new record revision 1 from ${label}.`,"good");
   }
 }catch(e){console.error(e);const msg=String(e?.message||e||"");deliveryRecordStatus(msg.includes("Session expired")?"Session expired — please sign in again.":`Delivery upload failed — ${msg}`,"bad")}
}
function createDeliveryTestMarker(){
 const id=cloudEl("cloudDeliveryRecordSelect")?.value,d=(db.deliveries||[]).find(x=>x.id===id);
 if(!d)return deliveryRecordStatus("Choose a normal cloud-linked delivery docket first.","bad");
 const label=(cloudEl("cloudDeviceLabel")?.value||localStorage.getItem("mdpin-cloud-device")||detectCloudDeviceLabel()).trim()||"Test device";
 d.syncTestMarker={label:`Harmless test from ${label}`,createdAt:new Date().toISOString()};
 localStorage.setItem("mdpin-db",JSON.stringify(db));renderDeliveryTestMarker();renderDeliverySyncOverview(false);
 deliveryRecordStatus(`Harmless test change created on ${id}. Tap Sync Delivery Changes to send it to the cloud.`,"warn");
}
function clearDeliveryTestMarker(){
 const id=cloudEl("cloudDeliveryRecordSelect")?.value,d=(db.deliveries||[]).find(x=>x.id===id);
 if(!d)return deliveryRecordStatus("Choose a normal cloud-linked delivery docket first.","bad");
 if(!d.syncTestMarker){renderDeliveryTestMarker();return deliveryRecordStatus("This docket has no test marker to clear.");}
 delete d.syncTestMarker;localStorage.setItem("mdpin-db",JSON.stringify(db));renderDeliveryTestMarker();renderDeliverySyncOverview(false);
 deliveryRecordStatus(`Test marker cleared from ${id}. Sync Delivery Changes if you also want it removed from the cloud.`,"warn");
}
async function cloudPullDeliveryRecordUpdates(){
 if(!mdCloudSession?.access_token)return deliveryRecordStatus("Sign in to TEST Cloud first.","bad");
 deliveryRecordStatus("Checking cloud delivery records…");
 try{
   const rows=await cloudGetDeliveryRecords();const meta=deliverySyncMeta();let added=0,updated=0,same=0,conflicts=[],addedIds=[],updatedIds=[];
   for(const row of rows){
     const incoming=row.payload;if(!incoming||String(incoming.id||"")!==String(row.record_id||"")){conflicts.push({id:row.record_id,reason:"invalid payload",local:null,remote:row});continue}
     const remoteFp=row.payload_hash||await deliveryPayloadFingerprint(incoming);const i=(db.deliveries||[]).findIndex(d=>d.id===row.record_id);const base=meta[row.record_id]||null;
     if(i<0){db.deliveries.push(JSON.parse(JSON.stringify(incoming)));meta[row.record_id]={revision:Number(row.revision),fingerprint:remoteFp};added++;addedIds.push(row.record_id);continue}
     const local=db.deliveries[i],localFp=await deliveryPayloadFingerprint(local);
     if(localFp===remoteFp){meta[row.record_id]={revision:Number(row.revision),fingerprint:remoteFp};same++;continue}
     if(base&&localFp===base.fingerprint&&Number(row.revision)>=Number(base.revision)){
       db.deliveries[i]=JSON.parse(JSON.stringify(incoming));meta[row.record_id]={revision:Number(row.revision),fingerprint:remoteFp};updated++;updatedIds.push(row.record_id);continue
     }
     if(base&&Number(row.revision)===Number(base.revision)&&localFp!==base.fingerprint){conflicts.push({id:row.record_id,reason:"local unsynced edit",local,remote:row});continue}
     conflicts.push({id:row.record_id,reason:"both cloud and local differ",local,remote:row});
   }
   if(added||updated){save();refreshReconciliationViews();renderDocketArchive();renderMetrics();renderHistory();renderAudit();renderDashboardAlerts()}
   saveDeliverySyncMeta(meta);
   const pullResult={at:new Date().toISOString(),addedIds,updatedIds,added,updated,same,conflicts:conflicts.map(c=>`${c.id}: ${c.reason}`)};
   renderDeliveryConflictPanel(conflicts);
   saveDeliveryLastPull(pullResult);
   if(added||updated)saveDeliveryLastChange(pullResult);
   renderCloudDeliveryRecordUi();renderHistory();renderDeliveryTransferSummary(pullResult);
   if(conflicts.length)deliveryRecordStatus(`This pull: ${added} new, ${updated} updated, ${same} already the same. ${conflicts.length} conflict${conflicts.length===1?"":"s"} left unchanged.`,"warn");
   else if(added||updated)deliveryRecordStatus(`✓ This pull changed this device — ${added} new docket${added===1?"":"s"}, ${updated} updated, ${same} already the same. Check Records for NEW / UPDATED FROM CLOUD badges.`,"good");
   else deliveryRecordStatus(`✓ No changes needed — all ${same} cloud docket${same===1?" was":"s were"} already identical on this device.`,"good");
 }catch(e){console.error(e);const msg=String(e?.message||e||"");deliveryRecordStatus(msg.includes("Session expired")?"Session expired — please sign in again.":`Delivery pull failed — ${msg}`,"bad")}
}

if(cloudEl("saveCloudTestMarker"))cloudEl("saveCloudTestMarker").onclick=saveCloudTestMarker;
if(cloudEl("cloudDeliveryRecordSelect"))cloudEl("cloudDeliveryRecordSelect").onchange=renderDeliveryTestMarker;
if(cloudEl("cloudCreateDeliveryTestMarker"))cloudEl("cloudCreateDeliveryTestMarker").onclick=createDeliveryTestMarker;
if(cloudEl("cloudClearDeliveryTestMarker"))cloudEl("cloudClearDeliveryTestMarker").onclick=clearDeliveryTestMarker;
if(cloudEl("cloudPushDeliveryRecord"))cloudEl("cloudPushDeliveryRecord").onclick=cloudPushSelectedDeliveryRecord;
if(cloudEl("cloudSyncDeliveryChanges"))cloudEl("cloudSyncDeliveryChanges").onclick=cloudSyncDeliveryChanges;
if(cloudEl("cloudPullDeliveryRecords"))cloudEl("cloudPullDeliveryRecords").onclick=cloudPullDeliveryRecordUpdates;
renderDeliveryTransferSummary();
renderDeliveryConflictPanel();

/* v0.10.67 Settings focus accordion. Opening one settings group temporarily hides the other chevrons. Collapsing it restores the full menu. */
(()=>{
 const card=document.querySelector("#settings>.card");
 const groups=[...document.querySelectorAll("#settings>.card>.settingGroup")];
 if(!card||!groups.length)return;
 const sync=()=>{
   const open=groups.find(g=>g.open);
   card.classList.toggle("settingsFocusMode",!!open);
 };
 groups.forEach(g=>g.addEventListener("toggle",()=>{
   if(g.open){groups.forEach(other=>{if(other!==g&&other.open)other.open=false;});}
   requestAnimationFrame(sync);
 }));
 sync();
})();

/* v0.10.92 TEST Cloud freshness: whenever the cloud panel opens, refresh live metadata so stale revision labels cannot survive a device switch or restore. */
(()=>{
 const tc=document.getElementById("testCloudDetails");if(!tc)return;
 tc.addEventListener("toggle",()=>{
  if(!tc.open)return;
  renderCloudDeliveryRecordUi();
  setTimeout(()=>{
   if(mdCloudSession?.access_token)Promise.all([cloudRefresh(),renderDeliverySyncOverview(true)]);
   else{cloudStatus("Sign in to TEST Cloud to check the latest revision.","info");renderCloudOverview(null,"idle");}
  },100);
 });
})();

initCloudFields();renderCloudOverview(null,"idle");renderCloudTestMarker();renderCloudDeliveryRecordUi();runSundayMultiWeekDetectorSelfCheck();
document.getElementById("masterProductSearch").oninput=filterMasterProductSetup;
document.getElementById("fillMasterCurrent").onclick=()=>renderMasterProductSetup(true);
document.getElementById("saveMasterProducts").onclick=applyMasterProductSetup;
document.getElementById("branchAssignmentSearch").oninput=filterBranchAssignmentList;
document.getElementById("branchAssignmentBranch").onchange=e=>{
 const next=canonicalBranchKey(e.target.value);
 if(branchAssignmentDirty&&!confirm("Discard the unsaved branch-list changes and switch shops?")){e.target.value=branchAssignmentRenderedBranch;return}
 branchAssignmentRenderedBranch=next;renderBranchProductAssignments();
};
document.getElementById("branchProductDetails").addEventListener("toggle",e=>{if(e.target.open)renderBranchProductAssignments()});
document.getElementById("resetData").onclick=()=>{if(confirm("Delete all local Magic Dragon Pin data on this browser?")){localStorage.removeItem("mdpin-db");location.reload()}}
cleanupDataIntegrity();refreshStoredReconciliations();renderImport();renderArchive();migrateLegacyDeliverySuggestions();bootstrapLatestSavedInvoiceSuggestions();processPendingDocketCorrections();renderAll();renderDashboardAlerts();refreshBaselineSnapshotStatus();showLastTransferResult();
loadSheetJS().then(ok=>{if(ok)hydrateWorkbookFinancialIntegrityFromArchive().then(()=>{processPendingDocketCorrections();renderAll();renderDashboardAlerts();});});
// v0.9.25 contextual Sunday help and compact selection controls
const sundayHelpButton=document.getElementById("sundayHelpButton");
const sundayHelp=document.getElementById("sundayHelp");
if(sundayHelpButton&&sundayHelp){sundayHelpButton.addEventListener("click",()=>{const show=sundayHelp.style.display==="none";sundayHelp.style.display=show?"block":"none";sundayHelp.open=show;sundayHelpButton.setAttribute("aria-expanded",show?"true":"false");});}
const importWork=document.querySelector(".importWork");
const xlsxFilesInput=document.getElementById("xlsxFiles");
function syncImportCompactState(){if(!importWork||!xlsxFilesInput)return;importWork.classList.toggle("hasSelection",!!(xlsxFilesInput.files&&xlsxFilesInput.files.length));}
if(xlsxFilesInput)xlsxFilesInput.addEventListener("change",()=>setTimeout(syncImportCompactState,0));
const clearXlsxBtn=document.getElementById("clearXlsxSelection");if(clearXlsxBtn)clearXlsxBtn.addEventListener("click",()=>setTimeout(syncImportCompactState,0));
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  // Fixed branded shell. Keep Menu attached directly beneath the visible header.
  (()=>{
    const tabs=document.querySelector(".tabs"),btn=document.getElementById("heroMenuButton"),hero=document.querySelector(".hero"),app=document.querySelector(".app"),spacer=document.getElementById("navSpacer");
    if(!tabs||!btn||!hero||!app)return;
    const syncGeometry=()=>{
      const a=app.getBoundingClientRect(),cs=getComputedStyle(app),pl=parseFloat(cs.paddingLeft)||0,pr=parseFloat(cs.paddingRight)||0;
      const left=Math.max(8,Math.round(a.left+pl)),width=Math.max(0,Math.round(a.width-pl-pr));
      document.documentElement.style.setProperty("--shell-left",left+"px");
      document.documentElement.style.setProperty("--shell-width",width+"px");
      requestAnimationFrame(()=>{
        const h=hero.getBoundingClientRect(),space=Math.ceil(hero.offsetHeight+16),menuTop=Math.ceil(h.bottom+6);
        document.documentElement.style.setProperty("--hero-space",space+"px");
        document.documentElement.style.setProperty("--menu-top",menuTop+"px");
        document.documentElement.style.setProperty("--content-top",Math.ceil(h.bottom+6)+"px");
        if(spacer&&!document.body.classList.contains("workflowMode"))spacer.style.height=space+"px";
      });
    };
    window.syncShellGeometry=syncGeometry;
    let menuTimer=null;
    const armMenuTimer=()=>{clearTimeout(menuTimer);if(tabs.classList.contains("menuOpen"))menuTimer=setTimeout(()=>window.closeMainMenu(),5000);};
    window.closeMainMenu=()=>{clearTimeout(menuTimer);menuTimer=null;tabs.classList.remove("menuOpen");btn.setAttribute("aria-expanded","false");};
    btn.addEventListener("click",()=>{syncGeometry();const open=!tabs.classList.contains("menuOpen");if(open){tabs.classList.add("menuOpen");btn.setAttribute("aria-expanded","true");armMenuTimer();}else closeMainMenu();});
    ["pointerdown","touchstart","keydown","focusin"].forEach(evt=>tabs.addEventListener(evt,armMenuTimer,{passive:true}));
    tabs.addEventListener("click",()=>{if(tabs.classList.contains("menuOpen"))armMenuTimer();});
    document.addEventListener("click",e=>{if(tabs.classList.contains("menuOpen")&&!tabs.contains(e.target)&&!btn.contains(e.target))closeMainMenu();});
    const resync=()=>{syncGeometry();};
    window.addEventListener("resize",resync);
    window.addEventListener("orientationchange",()=>setTimeout(resync,150));
    if(window.visualViewport){visualViewport.addEventListener("resize",resync);visualViewport.addEventListener("scroll",resync);}
    requestAnimationFrame(syncGeometry);
    window.addEventListener("load",syncGeometry,{once:true});
  })();

  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=1090", {updateViaCache:"none"}).catch(()=>{}));
}

/* v0.10.44 deterministic regression check.
   Run with ?mdselftest=qtyviewport in any browser. It simulates an iPhone
   visual viewport panned 92px with a 461px visible height. The assertion verifies that the Qty field remains inside the safe visual-viewport
   interval without mixing layout-viewport offsetTop with rect coordinates. */
if(new URLSearchParams(location.search).get("mdselftest")==="qtyviewport") {
  window.addEventListener("load",()=>setTimeout(()=>{
    try{
      openDeliveryCreate();
      const syntheticTop=92,syntheticHeight=461;
      deliveryKeyboardActiveInput=document.getElementById("delQty");
      document.body.classList.add("deliveryNewQtyFocus");
      applyNewDeliveryQtyVisualViewport(syntheticTop,syntheticHeight);
      setTimeout(()=>{
        const metrics=newDeliveryQtyViewportInvariant(syntheticTop,syntheticHeight);
        const focusMode=document.body.classList.contains("deliveryNewQtyFocus");
        const moduleHeadVisible=getComputedStyle(document.querySelector(".deliveryModuleHead")).display!=="none";
        const pickerVisible=getComputedStyle(document.querySelector(".deliveryPickerFlow")).display!=="none";
        const titleVisible=getComputedStyle(document.querySelector(".deliveryTitleRow")).display!=="none";
        const metaVisible=getComputedStyle(document.querySelector(".deliveryMetaRow")).display!=="none";
        const noteVisible=getComputedStyle(document.querySelector(".deliveryNoteToggle")).display!=="none";
        const ok=!!metrics.ok && focusMode && moduleHeadVisible && titleVisible && metaVisible && pickerVisible && noteVisible;
        const out=document.createElement("pre");
        out.id="mdSelfTestResult";
        out.dataset.status=ok?"PASS":"FAIL";
        out.textContent=JSON.stringify({status:ok?"PASS":"FAIL",syntheticTop,syntheticHeight,coordinateSpace:"layout-css-pixels",focusMode,moduleHeadVisible,titleVisible,metaVisible,pickerVisible,noteVisible,metrics},null,2);
        document.body.appendChild(out);
        document.documentElement.dataset.mdSelfTest=ok?"PASS":"FAIL";
      },350);
    }catch(err){
      document.documentElement.dataset.mdSelfTest="FAIL";
      const out=document.createElement("pre");out.id="mdSelfTestResult";out.dataset.status="FAIL";out.textContent=String(err?.stack||err);document.body.appendChild(out);
    }
  },250),{once:true});
}

document.getElementById("auditBranch").onchange=renderAudit;
document.getElementById("auditSearch").oninput=renderAudit;
document.getElementById("histBranch").onchange=renderHistorical;
document.getElementById("exportHistorical").onclick=()=>{
 const blob=new Blob([JSON.stringify(historicalData,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Magic-Pin-History.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
