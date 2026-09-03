/* BAS SHOP - Authentication */

function showMessage(id, text, success = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = success ? "#57d68a" : "#ff5b78";
}

function makeMemberCode(userId) {
  const hex = userId.replaceAll("-", "").substring(0, 8);
  const n = parseInt(hex, 16) % 999999;
  return "#" + String(n).padStart(6, "0");
}

async function usernameToEmail(username) {
  const { data, error } = await window.sb.rpc("get_email_by_username", {
    p_username: username
  });
  if (error) throw error;
  return data;
}

async function handleLogin(e) {
  e.preventDefault();
  showMessage("login-message", "กำลังเข้าสู่ระบบ...", true);

  try {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
      showMessage("login-message", "กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const email = await usernameToEmail(username);
    if (!email) {
      showMessage("login-message", "ไม่พบชื่อผู้ใช้นี้");
      return;
    }

    const { error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    showMessage("login-message", "เข้าสู่ระบบสำเร็จ กำลังเข้าสู่ร้าน...", true);
    setTimeout(() => { window.location.href = "index.html"; }, 700);
  } catch (err) {
    console.error(err);
    showMessage("login-message", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim().toLowerCase();
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("register-confirm").value;

  if (username.length < 3) {
    showMessage("register-message", "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
    return;
  }

  if (!/^[a-zA-Z0-9_ก-๙.-]+$/.test(username)) {
    showMessage("register-message", "ชื่อผู้ใช้มีอักขระที่ไม่รองรับ");
    return;
  }

  if (password.length < 6) {
    showMessage("register-message", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    return;
  }

  if (password !== confirm) {
    showMessage("register-message", "รหัสผ่านไม่ตรงกัน");
    return;
  }

  showMessage("register-message", "กำลังสมัครสมาชิก...", true);

  try {
    const { data: exists, error: existsError } = await window.sb.rpc("username_exists", {
      p_username: username
    });

    if (existsError) throw existsError;
    if (exists) {
      showMessage("register-message", "ชื่อผู้ใช้นี้ถูกใช้แล้ว");
      return;
    }

    const { data, error } = await window.sb.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("ไม่สามารถสร้างบัญชีได้");

    // Confirm email ต้องปิดไว้ใน Supabase เพื่อให้มี session ทันที
    if (!data.session) {
      showMessage("register-message", "กรุณาปิด Confirm email ใน Supabase ก่อน");
      return;
    }

    const memberId = makeMemberCode(data.user.id);

    // ส่งแจ้งเตือน Discord ผ่าน Edge Function (Webhook ไม่อยู่ใน GitHub)
    const { error: discordError } = await window.sb.functions.invoke("quick-handler", {
      body: {
        username,
        email,
        memberId
      }
    });

    if (discordError) {
      console.error("Discord notification error:", discordError);
      showMessage("register-message", "สมัครสมาชิกสำเร็จ แต่ส่ง Discord ไม่สำเร็จ", true);
    } else {
      showMessage("register-message", "สมัครสมาชิกสำเร็จ กำลังเข้าสู่ร้าน...", true);
    }

    setTimeout(() => { window.location.href = "index.html"; }, 1200);
  } catch (err) {
    console.error("Register error:", err);
    showMessage("register-message", "สมัครสมาชิกไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const registerForm = document.getElementById("register-form");
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
});
