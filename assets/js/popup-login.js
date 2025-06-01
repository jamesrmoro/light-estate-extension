document.addEventListener('DOMContentLoaded', function() {
  // Troque pelos seus valores do painel
  const SUPABASE_URL = 'https://blesvyrzrlrxomlsxcen.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZXN2eXJ6cmxyeG9tbHN4Y2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzIwMTgsImV4cCI6MjA2MzYwODAxOH0.L23OpiYpOfkFUro8423-OoUN_A8_iub218JfPLu-0Og';

  const { createClient } = supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.client = client; // <- Global!

  // Login elements
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  // CRUD elements (pode ignorar se não usar)
  const empreendimentosSection = document.getElementById('empreendimentosSection');
  // ... outros elementos ...

  // ========== LOGIN ==========
  async function tryAutoLogin() {
    const res = await client.auth.getSession();
    const session = res.data.session;
    if (session && session.user) {
      onLoginSuccess(session.user);
    } else {
      showLogin();
    }
  }

  function showLogin() {
    loginModal.style.display = 'flex';
    empreendimentosSection && (empreendimentosSection.style.display = 'none');
    logoutBtn.style.display = 'none';
    loginForm.reset();
  }

  function onLoginSuccess(user) {
    window.userId = user.id; // <- Global!
    loginModal.style.display = 'none';
    empreendimentosSection && (empreendimentosSection.style.display = 'block');
    logoutBtn.style.display = 'block';
    // Pode chamar a função principal aqui ou deixar para popup.js
  }

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = loginEmail.value;
    const password = loginPassword.value;
    const { error, data } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      loginError.innerText = error.message || 'E-mail ou senha inválidos.';
      loginError.style.display = 'block';
    } else {
      onLoginSuccess(data.user);
    }
  });

  logoutBtn.addEventListener('click', async function() {
    await client.auth.signOut();
    showLogin();
  });

  tryAutoLogin();
});
