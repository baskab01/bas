/* =====================================================
   BAS SHOP - AUTH SYSTEM
   Login / Register / Discord Notification
===================================================== */


/* ================= MEMBER CODE ================= */

function makeMemberCode(userId) {

  const hex = userId
    .replaceAll("-", "")
    .substring(0, 8);

  const number =
    parseInt(hex, 16) % 999999;

  return "#" +
    String(number).padStart(6, "0");
}


/* ================= MESSAGE ================= */

function showMessage(id, text, success = false) {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.textContent = text;

  element.style.color =
    success ? "#57d68a" : "#ff5b78";
}


/* ================= USERNAME → EMAIL ================= */

async function usernameToEmail(username) {

  const { data, error } =
    await window.sb.rpc(
      "get_email_by_username",
      {
        p_username: username
      }
    );

  if (error) {

    console.error(
      "get_email_by_username error:",
      error
    );

    throw error;
  }

  return data;
}


/* ================= LOGIN ================= */

async function handleLogin(event) {

  event.preventDefault();

  showMessage(
    "login-message",
    "กำลังเข้าสู่ระบบ...",
    true
  );


  try {

    const username =
      document
        .getElementById("login-username")
        .value
        .trim();


    const password =
      document
        .getElementById("login-password")
        .value;


    if (!username || !password) {

      showMessage(
        "login-message",
        "กรุณากรอกข้อมูลให้ครบ"
      );

      return;
    }


    /* หา Email จาก Username */

    const email =
      await usernameToEmail(username);


    if (!email) {

      showMessage(
        "login-message",
        "ไม่พบชื่อผู้ใช้นี้"
      );

      return;
    }


    /* Login Supabase */

    const {
      data,
      error
    } =
      await window.sb.auth.signInWithPassword({

        email: email,

        password: password

      });


    if (error) {

      console.error(
        "Login error:",
        error
      );

      showMessage(
        "login-message",
        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
      );

      return;
    }


    if (!data.session) {

      showMessage(
        "login-message",
        "เข้าสู่ระบบไม่สำเร็จ"
      );

      return;
    }


    showMessage(
      "login-message",
      "เข้าสู่ระบบสำเร็จ กำลังเข้าสู่ร้าน...",
      true
    );


    setTimeout(() => {

      window.location.href =
        "index.html";

    }, 800);


  } catch (error) {

    console.error(
      "Login exception:",
      error
    );


    showMessage(
      "login-message",
      "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
    );

  }

}


/* ================= REGISTER ================= */

async function handleRegister(event) {

  event.preventDefault();


  const username =
    document
      .getElementById("register-username")
      .value
      .trim();


  const email =
    document
      .getElementById("register-email")
      .value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById("register-password")
      .value;


  const confirmPassword =
    document
      .getElementById("register-confirm")
      .value;


  /* ================= VALIDATION ================= */


  if (username.length < 3) {

    showMessage(
      "register-message",
      "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"
    );

    return;
  }


  if (
    !/^[a-zA-Z0-9_ก-๙.-]+$/.test(username)
  ) {

    showMessage(
      "register-message",
      "ชื่อผู้ใช้มีอักขระที่ไม่รองรับ"
    );

    return;
  }


  if (password.length < 6) {

    showMessage(
      "register-message",
      "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
    );

    return;
  }


  if (password !== confirmPassword) {

    showMessage(
      "register-message",
      "รหัสผ่านไม่ตรงกัน"
    );

    return;
  }


  showMessage(
    "register-message",
    "กำลังสมัครสมาชิก...",
    true
  );


  try {

    /* ================= CHECK USERNAME ================= */

    const {
      data: usernameExists,
      error: usernameCheckError
    } =
      await window.sb.rpc(
        "username_exists",
        {
          p_username: username
        }
      );


    if (usernameCheckError) {

      console.error(
        "Username check error:",
        usernameCheckError
      );

      showMessage(
        "register-message",
        "ไม่สามารถตรวจสอบชื่อผู้ใช้ได้"
      );

      return;
    }


    if (usernameExists === true) {

      showMessage(
        "register-message",
        "ชื่อผู้ใช้นี้ถูกใช้แล้ว"
      );

      return;
    }


    /* ================= SUPABASE SIGN UP ================= */

    const {
      data,
      error
    } =
      await window.sb.auth.signUp({

        email: email,

        password: password,

        options: {

          data: {

            username: username

          }

        }

      });


    if (error) {

      console.error(
        "Supabase signup error:",
        error
      );

      showMessage(
        "register-message",
        error.message
      );

      return;
    }


    if (!data.user) {

      showMessage(
        "register-message",
        "สมัครสมาชิกไม่สำเร็จ"
      );

      return;
    }


    /* ================= CHECK SESSION ================= */

    if (!data.session) {

      showMessage(
        "register-message",
        "กรุณาปิด Confirm email ใน Supabase"
      );

      return;
    }


    /* ================= MEMBER ID ================= */

    const memberCode =
      makeMemberCode(data.user.id);


    /* ================= DISCORD ================= */

    showMessage(
      "register-message",
      "สมัครสำเร็จ กำลังส่งข้อมูล...",
      true
    );


    const {
      data: discordData,
      error: discordError
    } =
      await window.sb.functions.invoke(
        "quick-handler",
        {

          body: {

            username: username,

            email: email,

            memberId: memberCode

          }

        }
      );


    if (discordError) {

      console.error(
        "Discord Function Error:",
        discordError
      );

      /*
       * สมัครสมาชิกสำเร็จแล้ว
       * แต่ Discord มีปัญหา
       */

      showMessage(
        "register-message",
        "สมัครสำเร็จ แต่ส่งข้อมูล Discord ไม่สำเร็จ",
        true
      );

    } else {

      console.log(
        "Discord notification:",
        discordData
      );


      showMessage(
        "register-message",
        "สมัครสมาชิกสำเร็จ กำลังเข้าสู่ร้าน...",
        true
      );

    }


    /* ================= GO HOME ================= */

    setTimeout(() => {

      window.location.href =
        "index.html";

    }, 1200);


  } catch (error) {

    console.error(
      "Register error:",
      error
    );


    showMessage(
      "register-message",
      "สมัครสมาชิกไม่สำเร็จ: " +
      (error.message || "เกิดข้อผิดพลาด")
    );

  }

}


/* ================= PAGE READY ================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* LOGIN FORM */

    const loginForm =
      document.getElementById(
        "login-form"
      );


    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        handleLogin
      );

    }


    /* REGISTER FORM */

    const registerForm =
      document.getElementById(
        "register-form"
      );


    if (registerForm) {

      registerForm.addEventListener(
        "submit",
        handleRegister
      );

    }

  }
);
