const USERS_KEY = "masroufy_users";
const CURRENT_KEY = "masroufy_current_user";

const getUsers = () => {
  return JSON.parse(
    localStorage.getItem(USERS_KEY) || "[]"
  );
};

const saveUsers = users => {
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );
};

const setCurrentUser = id => {
  localStorage.setItem(
    CURRENT_KEY,
    id
  );
};

const getCurrentUserId = () => {
  return localStorage.getItem(CURRENT_KEY);
};

async function hashPassword(password) {

  const data = new TextEncoder().encode(password);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return [...new Uint8Array(hash)]
    .map(byte =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

if (getCurrentUserId()) {
  location.href = "index.html";
}

const loginTab = document.getElementById(
  "loginTab"
);

const registerTab = document.getElementById(
  "registerTab"
);

const loginForm = document.getElementById(
  "loginForm"
);

const registerForm = document.getElementById(
  "registerForm"
);

function showLogin() {

  loginTab.classList.add("active");
  registerTab.classList.remove("active");

  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
}

function showRegister() {

  registerTab.classList.add("active");
  loginTab.classList.remove("active");

  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
}

loginTab.onclick = showLogin;
registerTab.onclick = showRegister;

registerForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const name =
      document
        .getElementById("registerName")
        .value
        .trim();

    const email =
      document
        .getElementById("registerEmail")
        .value
        .trim()
        .toLowerCase();

    const password =
      document.getElementById(
        "registerPassword"
      ).value;

    const confirm =
      document.getElementById(
        "registerConfirm"
      ).value;

    const message =
      document.getElementById(
        "registerMessage"
      );

    const users = getUsers();

    if (password !== confirm) {

      message.textContent =
        "كلمتا المرور غير متطابقتين.";

      return;
    }

    if (
      users.some(
        user => user.email === email
      )
    ) {

      message.textContent =
        "البريد الإلكتروني مستخدم بالفعل.";

      return;
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash:
        await hashPassword(password),
      createdAt:
        new Date().toISOString()
    };

    users.push(user);

    saveUsers(users);

    setCurrentUser(user.id);

    location.href = "index.html";
  }
);

loginForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const email =
      document
        .getElementById("loginEmail")
        .value
        .trim()
        .toLowerCase();

    const password =
      document.getElementById(
        "loginPassword"
      ).value;

    const message =
      document.getElementById(
        "loginMessage"
      );

    const users = getUsers();

    const user = users.find(
      item => item.email === email
    );

    if (!user) {

      message.textContent =
        "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

      return;
    }

    const hash =
      await hashPassword(password);

    if (hash !== user.passwordHash) {

      message.textContent =
        "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

      return;
    }

    setCurrentUser(user.id);

    location.href = "index.html";
  }
);