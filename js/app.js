async function loadProducts(){
  const el=document.getElementById("product-list"); if(!el)return;
  el.innerHTML='<div class="loading">กำลังโหลดสินค้า...</div>';
  const {data,error}=await window.sb.from("products").select("*").order("id",{ascending:false});
  if(error){console.error(error);el.innerHTML='<div class="loading">โหลดสินค้าไม่สำเร็จ</div>';return;}
  if(!data?.length){el.innerHTML='<div class="loading">ยังไม่มีสินค้า</div>';return;}
  el.innerHTML="";
  for(const p of data){
    const img=p.image||"ghost.png";
    const card=document.createElement("article"); card.className="card";
    card.innerHTML=`<img src="${escapeHtml(img)}" alt="${escapeHtml(p.name||"สินค้า")}" onerror="this.style.display='none'">
      <div class="card-body"><h3>${escapeHtml(p.name||"ไม่มีชื่อ")}</h3>
      <div class="desc">${escapeHtml(p.description||"")}</div>
      <div class="card-foot"><div class="price">฿${Number(p.price||0).toLocaleString()}</div><div class="stock">เหลือ ${Number(p.stock||0)} ชิ้น</div></div>
      <button class="buy" ${Number(p.stock)<=0?"disabled":""}>${Number(p.stock)<=0?"สินค้าหมด":"เพิ่มลงตะกร้า"}</button></div>`;
    card.querySelector(".buy").addEventListener("click",()=>alert("ระบบตะกร้าจะเชื่อมต่อในขั้นถัดไป"));
    el.appendChild(card);
  }
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
document.addEventListener("DOMContentLoaded",loadProducts);
