const products = window.SEEMATTI_PRODUCTS || [];
const WA_NUMBER = "919342896913";
let cart = JSON.parse(localStorage.getItem("seematti_cart") || "[]");
let activeCategory = "All";
let latestBill = null;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => Number.isFinite(n) ? `₹${n.toFixed(2)}` : "Price on Request";
const validPrice = p => typeof p.price === "number" && Number.isFinite(p.price) && p.price > 0;

function productById(id){ return products.find(p=>p.id===id); }
function saveCart(){ localStorage.setItem("seematti_cart", JSON.stringify(cart)); renderCart(); }
function cartDetailed(){ return cart.map(x=>({...x, product:productById(x.id)})).filter(x=>x.product); }
function subtotal(){ return cartDetailed().reduce((s,x)=>s + (validPrice(x.product)?x.product.price*x.qty:0),0); }
function hasInvalidPrice(){ return cartDetailed().some(x=>!validPrice(x.product)); }

const categories = [
  ["Rice & Flour","🍚"],["Masala","🌶️"],["Dal & Pulses","🫘"],["Oil","🫗"],["Personal Care","🧼"],
  ["Hair Care","🧴"],["Pooja","🪔"],["Snacks","🍿"],["Chocolates","🍫"],["Drinks","🥤"]
];
function renderCategories(){
  $("#categoryGrid").innerHTML = categories.map(([c,e])=>`<button class="category-card reveal" data-cat="${c}"><div class="cat-icon">${e}</div><b>${c}</b><small>${products.filter(p=>p.category===c).length} products</small></button>`).join("");
  $$(".category-card").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderFilters();renderProducts();document.querySelector("#products").scrollIntoView({behavior:"smooth"});});
  observeReveals();
}
function renderFilters(){
  $("#filters").innerHTML = ["All",...categories.map(x=>x[0])].map(c=>`<button class="filter ${activeCategory===c?"active":""}" data-cat="${c}">${c}</button>`).join("");
  $$(".filter").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderFilters();renderProducts()});
}
function renderProducts(){
  const q=$("#searchInput").value.trim().toLowerCase();
  const list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&(!q||p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)));
  $("#productGrid").innerHTML=list.map(p=>`
    <article class="product-card">
      <div class="product-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <div class="product-info"><span class="cat">${p.category}</span><h3>${p.name}</h3><div class="price">${money(p.price)}</div>
      <div class="product-actions"><button class="mini-btn add" data-add="${p.id}">Add to Cart</button><button class="mini-btn wa" data-wa="${p.id}">WhatsApp</button></div></div>
    </article>`).join("");
  $("#emptyState").hidden=!!list.length;
  $$("[data-add]").forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.add)));
  $$("[data-wa]").forEach(b=>b.onclick=()=>quickWhatsApp(Number(b.dataset.wa)));
}
function addToCart(id){
  const item=cart.find(x=>x.id===id);
  if(item)item.qty++;else cart.push({id,qty:1});
  saveCart(); openCart(); bounceCart();
}
function quickWhatsApp(id){
  const p=productById(id);
  const text=`Hello Seematti Grocery Shop,\nI am interested in ${p.name}.\nPlease share availability and current price.`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,"_blank");
}
function bounceCart(){ $("#cartTop").animate?.([{transform:"scale(1)"},{transform:"scale(1.15)"},{transform:"scale(1)"}],{duration:350}); }
function renderCart(){
  const details=cartDetailed();
  $("#cartCount").textContent=details.reduce((s,x)=>s+x.qty,0);
  $("#cartItems").innerHTML=details.length?details.map(x=>`
    <div class="cart-line"><img src="${x.product.image}" alt=""><div><h4>${x.product.name}</h4><small>${money(x.product.price)}</small>
      <div class="qty"><button data-dec="${x.id}">−</button><b>${x.qty}</b><button data-inc="${x.id}">+</button><button class="remove" data-rem="${x.id}">Remove</button></div></div>
      <b>${validPrice(x.product)?money(x.product.price*x.qty):"—"}</b></div>`).join(""):`<div class="empty-state"><div>🛒</div><h3>Your cart is empty</h3><p>Add products to get started.</p></div>`;
  const sub=subtotal();
  $("#cartSummary").innerHTML=`<div class="summary-row"><span>Subtotal</span><b>${money(sub)}</b></div><div class="summary-row"><span>Delivery</span><b>${sub>0?"₹0.00":"—"}</b></div><div class="summary-row total"><span>Grand Total</span><b>${sub>0?money(sub):"—"}</b></div>`;
  $$("[data-inc]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.inc),1));
  $$("[data-dec]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.dec),-1));
  $$("[data-rem]").forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.id!==Number(b.dataset.rem));saveCart()});
  $("#checkoutBtn").disabled=!details.length||hasInvalidPrice();
  $("#checkoutBtn").title=hasInvalidPrice()?"Enter valid prices in script.js before checkout.":"Proceed to checkout";
}
function changeQty(id,d){const x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<1)cart=cart.filter(i=>i.id!==id);saveCart()}
function openCart(){ $("#cartDrawer").classList.add("open");$("#overlay").classList.add("open");document.body.classList.add("lock");}
function closeCart(){ $("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("open");document.body.classList.remove("lock");}
function openModal(id){$("#"+id).classList.add("open");$("#"+id).setAttribute("aria-hidden","false");document.body.classList.add("lock")}
function closeModal(id){$("#"+id).classList.remove("open");$("#"+id).setAttribute("aria-hidden","true");document.body.classList.remove("lock")}
function checkoutPreview(){
  $("#checkoutPreview").innerHTML=cartDetailed().map(x=>`<div style="display:flex;justify-content:space-between;padding:4px 0"><span>${x.product.name} × ${x.qty}</span><b>${money(x.product.price*x.qty)}</b></div>`).join("")+
  `<hr><div style="display:flex;justify-content:space-between"><b>Grand Total</b><b>${money(subtotal())}</b></div>`;
}
function makeBillNo(){const d=new Date(), pad=n=>String(n).padStart(2,"0");const day=`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;let seq=Number(localStorage.getItem("seematti_bill_seq")||0)+1;localStorage.setItem("seematti_bill_seq",seq);return `SG-${day}-${String(seq).padStart(3,"0")}`;}
function buildInvoice(data){
  const rows=data.items.map((x,i)=>`<tr><td>${i+1}</td><td>${x.name}</td><td>${x.qty}</td><td>${money(x.price)}</td><td>${money(x.price*x.qty)}</td></tr>`).join("");
  $("#invoice").innerHTML=`<div class="invoice-head"><h1>SEEMATTI GROCERY SHOP</h1><p>Thiruppayathangudi, Tamil Nadu</p><p>WhatsApp / Phone: 9342896913</p></div>
  <div class="invoice-meta"><span><b>Bill No:</b> ${data.billNo}<br><b>Date:</b> ${data.date}</span><span><b>Order:</b> WhatsApp / Online</span></div>
  <div class="invoice-customer"><b>Customer:</b> ${escapeHtml(data.customer)}<br><b>Mobile:</b> ${escapeHtml(data.mobile)}<br><b>Address:</b> ${escapeHtml(data.address)}${data.notes?`<br><b>Notes:</b> ${escapeHtml(data.notes)}`:""}</div>
  <table><thead><tr><th>S.No</th><th>Product Name</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="invoice-total"><div><span>Subtotal</span><b>${money(data.subtotal)}</b></div><div><span>Discount</span><b>${money(data.discount)}</b></div><div><span>Delivery Charge</span><b>${money(data.delivery)}</b></div><div class="grand"><span>GRAND TOTAL</span><b>${money(data.total)}</b></div></div>
  <div class="invoice-thanks">Thank You!<br>Visit Seematti Grocery Shop Again</div>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function whatsappBill(){
  if(!latestBill)return;
  const lines=latestBill.items.map((x,i)=>`${i+1}. ${x.name} × ${x.qty} = ${money(x.price*x.qty)}`).join("\n");
  const text=`SEEMATTI GROCERY SHOP\nBill No: ${latestBill.billNo}\n\nCustomer Name: ${latestBill.customer}\nMobile: ${latestBill.mobile}\nAddress: ${latestBill.address}\n\nProducts:\n${lines}\n\nSubtotal: ${money(latestBill.subtotal)}\nDiscount: ${money(latestBill.discount)}\nDelivery: ${money(latestBill.delivery)}\nGrand Total: ${money(latestBill.total)}${latestBill.notes?`\nOrder Notes: ${latestBill.notes}`:""}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,"_blank");
}
function downloadPDF(){
  // Uses the browser's native print-to-PDF flow, which works without a server or API key.
  window.print();
}

$("#searchInput").addEventListener("input",renderProducts);
$("#cartTop").onclick=openCart;$("#closeCart").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#checkoutBtn").onclick=()=>{if(hasInvalidPrice()){alert("Some products do not have valid prices. Please enter valid prices in script.js before checkout.");return}closeCart();checkoutPreview();openModal("checkoutModal")};
$$("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
$("#checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  const d=new Date();
  const data={billNo:makeBillNo(),date:d.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}),customer:$("#customerName").value.trim(),mobile:$("#customerMobile").value.trim(),address:$("#customerAddress").value.trim(),notes:$("#orderNotes").value.trim(),items:cartDetailed().map(x=>({name:x.product.name,qty:x.qty,price:x.product.price})),subtotal:subtotal(),discount:0,delivery:0,total:subtotal()};
  latestBill=data;buildInvoice(data);closeModal("checkoutModal");openModal("billModal");
});
$("#printBill").onclick=()=>window.print();
$("#downloadBill").onclick=downloadPDF;
$("#billWhatsApp").onclick=whatsappBill;
$("#menuBtn").onclick=()=>$("#navLinks").classList.toggle("open");
$$("nav a").forEach(a=>a.onclick=()=>$("#navLinks").classList.remove("open"));
$("#year").textContent=new Date().getFullYear();

function observeReveals(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.1});
  $$(".reveal").forEach(el=>{if(!el.dataset.observed){io.observe(el);el.dataset.observed="1"}});
}
window.addEventListener("load",()=>{setTimeout(()=>$("#loading").style.display="none",500);renderCategories();renderFilters();renderProducts();renderCart();observeReveals()});
