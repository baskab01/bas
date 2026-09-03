async function usernameToEmail(username){
  const {data,error}=await window.sb.rpc("get_email_by_username",{p_username:username});
  if(error) throw error;
  return data;
}
function msg(id,text,ok=false){const e=document.getElementById(id);if(e){e.textContent=text;e.style.color=ok?"#57d68a":"#ff5b78";}}
function makeMemberCode(userId){
  const hex=userId.replaceAll("-","").substring(0,8);
  const n=parseInt(hex,16)%999999;
  return "#"+String(n).padStart(6,"0");
}
document.addEventListener("DOMContentLoaded",()=>{
  const lf=document.getElementById("login-form");
  if(lf)lf.addEventListener("submit",async e=>{
    e.preventDefault();
    msg("login-message","กำลังเข้าสู่ระบบ...",true);
    try{
      const username=document.getElementById("login-username").value.trim();
      const password=document.getElementById("login-password").value;
      const email=await usernameToEmail(username);
      if(!email)throw new Error("ไม่พบชื่อผู้ใช้นี้");
      const {error}=await window.sb.auth.signInWithPassword({email,password});
      if(error)throw error;
      msg("login-message","เข้าสู่ระบบสำเร็จ",true);
      setTimeout(()=>location.href="index.html",500);
    }catch(err){console.error(err);msg("login-message","ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");}
  });
  const rf=document.getElementById("register-form");
  if(rf)rf.addEventListener("submit",async e=>{
    e.preventDefault();
    const username=document.getElementById("register-username").value.trim();
    const email=document.getElementById("register-email").value.trim();
    const password=document.getElementById("register-password").value;
    const confirm=document.getElementById("register-confirm").value;
    if(!/^[a-zA-Z0-9_ก-๙.-]+$/.test(username)){msg("register-message","ชื่อผู้ใช้มีอักขระที่ไม่รองรับ");return;}
    if(password!==confirm){msg("register-message","รหัสผ่านไม่ตรงกัน");return;}
    msg("register-message","กำลังสมัครสมาชิก...",true);
    try{
      const {data:existing}=await window.sb.rpc("username_exists",{p_username:username});
      if(existing){msg("register-message","ชื่อผู้ใช้นี้ถูกใช้แล้ว");return;}

      const {data,error}=await window.sb.auth.signUp({email,password,options:{data:{username}}});
      if(error)throw error;
      if(!data.session)throw new Error("CONFIRM_EMAIL_ON");

      const memberCode=makeMemberCode(data.user.id);
      const { error: discordError } =
  await window.sb.functions.invoke("quick-handler", {
    body: {
      username: username,
      email: email,
      memberId: memberCode
    }
  });

      if(discordError){
        console.error("Discord notification error:",discordError);
        msg("register-message","สมัครสมาชิกสำเร็จ แต่ส่งแจ้งเตือน Discord ไม่สำเร็จ",true);
      }else{
        msg("register-message","สมัครสมาชิกสำเร็จ กำลังเข้าสู่ร้าน...",true);
      }

      setTimeout(()=>location.href="index.html",1000);
    }catch(err){
      console.error(err);
      msg("register-message",err.message==="CONFIRM_EMAIL_ON"?"กรุณาปิด Confirm email ใน Supabase ก่อน":"สมัครสมาชิกไม่สำเร็จ");
    }
  });
});
