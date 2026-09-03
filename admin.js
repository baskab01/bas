async function requireAdmin(){
  const {data:{user}}=await window.sb.auth.getUser();
  if(!user){location.href="login.html";return null;}
  const {data,error}=await window.sb.from("profiles").select("username,role").eq("id",user.id).single();
  if(error||data?.role!=="admin"){alert("บัญชีนี้ไม่มีสิทธิ์ Admin");location.href="index.html";return null;}
  return data;
}
function setMsg(text,ok=false){const e=document.getElementById("admin-message");e.textContent=text;e.style.color=ok?"#57d68a":"#ff5b78";}
async function loadAdminProducts(){
  const el=document.getElementById("admin-products");el.innerHTML='<div class="loading">กำลังโหลด...</div>';
  const {data,error}=await window.sb.from("products").select("*").order("id",{ascending:false});
  if(error){el.innerHTML="โหลดไม่สำเร็จ";return;}
  el.innerHTML="";
  (data||[]).forEach(p=>{
    const d=document.createElement("div");d.className="admin-item";
    d.innerHTML=`<img src="${escapeHtml(p.image||"ghost.png")}" onerror="this.style.display='none'">
      <div><h3>${escapeHtml(p.name||"")}</h3><div>฿${Number(p.price||0).toLocaleString()} · Stock ${Number(p.stock||0)}</div></div>
      <div class="admin-actions"><button class="ghost-btn edit">แก้ไข</button><button class="ghost-btn danger del">ลบ</button></div>`;
    d.querySelector(".edit").onclick=()=>fillForm(p);
    d.querySelector(".del").onclick=()=>deleteProduct(p.id);
    el.appendChild(d);
  });
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function fillForm(p){
  document.getElementById("product-id").value=p.id;
  document.getElementById("p-name").value=p.name||"";
  document.getElementById("p-price").value=p.price??0;
  document.getElementById("p-stock").value=p.stock??0;
  document.getElementById("p-image").value=p.image||"";
  document.getElementById("p-description").value=p.description||"";
  document.getElementById("form-title").textContent="แก้ไขสินค้า";
  scrollTo({top:0,behavior:"smooth"});
}
function clearForm(){document.getElementById("product-form").reset();document.getElementById("product-id").value="";document.getElementById("form-title").textContent="เพิ่มสินค้า";}
async function deleteProduct(id){
  if(!confirm("ลบสินค้านี้ใช่หรือไม่?"))return;
  const {error}=await window.sb.from("products").delete().eq("id",id);
  if(error){setMsg("ลบไม่สำเร็จ");return;}
  await loadAdminProducts();
}
document.addEventListener("DOMContentLoaded",async()=>{
  const ok=await requireAdmin();if(!ok)return;
  await loadAdminProducts();
  document.getElementById("logout").onclick=async()=>{await window.sb.auth.signOut();location.href="index.html";};
  document.getElementById("cancel-edit").onclick=clearForm;
  document.getElementById("product-form").onsubmit=async e=>{
    e.preventDefault();
    const id=document.getElementById("product-id").value;
    const payload={
      name:document.getElementById("p-name").value.trim(),
      price:Number(document.getElementById("p-price").value),
      stock:Number(document.getElementById("p-stock").value),
      image:document.getElementById("p-image").value.trim(),
      description:document.getElementById("p-description").value.trim()
    };
    const q=id?window.sb.from("products").update(payload).eq("id",id):window.sb.from("products").insert(payload);
    const {error}=await q;
    if(error){setMsg(error.message);return;}
    setMsg("บันทึกสินค้าแล้ว",true);clearForm();await loadAdminProducts();
  };
});
