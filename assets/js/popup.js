// ================== SUPABASE CRUD =======================
async function fetchVendas(empreendimentoId) {
  const { data, error } = await window.client
    .from('vendas')
    .select('*')
    .eq('empreendimento_id', empreendimentoId);
  if (error) {
    console.warn("Error fetching sales:", error);
    return [];
  }
  return data;
}

async function fetchEmpreendimentos() {
  const client = window.client;
  const userId = window.userId;
  const { data, error } = await client
    .from('empreendimentos')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: true });
  if (error && error.message && error.message.includes('does not exist')) {
    console.warn("Table 'empreendimentos' does not exist yet.");
    return [];
  }
  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
  return (data || []).map(e => ({
    ...e,
    config: typeof e.config === 'string' ? JSON.parse(e.config) : e.config
  }));
}

async function addEmpreendimento(empreendimento) {
  const client = window.client;
  const userId = window.userId;
  const { error } = await client
    .from('empreendimentos')
    .insert([{
      nome: empreendimento.nome,
      config: typeof empreendimento.config === "string" ? JSON.parse(empreendimento.config) : empreendimento.config,
      user_id: userId
    }]);
  if (error) alert("Error adding project: " + (error.message || "Unknown error."));
}

async function updateEmpreendimento(id, empreendimento) {
  const client = window.client;
  const userId = window.userId;
  let config = empreendimento.config;
  if (typeof config === "string") {
    try { config = JSON.parse(config); } catch { config = {}; }
  }
  const { error } = await client
    .from('empreendimentos')
    .update({
      nome: empreendimento.nome,
      config
    })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) alert("Error updating: " + error.message);
}

async function deleteEmpreendimento(id) {
  const client = window.client;
  const userId = window.userId;
  const { error } = await client
    .from('empreendimentos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) alert("Error removing: " + error.message);
}

async function registrarVenda(empreendimento, aptNumber, floor, porcentagem) {
  const client = window.client;
  await client
    .from('vendas')
    .insert([{
      empreendimento_id: empreendimento.id,
      numero_apartamento: aptNumber,
      andar: floor,
      porcentagem: porcentagem
    }]);
}

// =========== TEAM EMAILS CRUD =============
async function fetchEmailsEquipe(empreendimentoId) {
  const { data, error } = await window.client
    .from('emails_equipe')
    .select('*')
    .eq('empreendimento_id', empreendimentoId);
  if (error) return [];
  return data;
}

async function addEmailEquipe(empreendimentoId, email) {
  await window.client
    .from('emails_equipe')
    .insert([{ empreendimento_id: empreendimentoId, email }]);
}

async function deleteEmailEquipe(emailId) {
  await window.client
    .from('emails_equipe')
    .delete()
    .eq('id', emailId);
}

// ========== MODALS AND UI =============
async function showManageEmailsModal(empreendimentoId, onClose) {
  const prev = document.getElementById('manage-emails-modal');
  if (prev) prev.remove();

  const emails = await fetchEmailsEquipe(empreendimentoId);
  const modal = document.createElement('div');
  modal.id = 'manage-emails-modal';
  modal.className = 'modal';
  modal.style.display = 'flex';

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Manage Team Emails</h3>
      <ul id="emailsList" style="margin-bottom:16px;">
        ${emails.map(e => `
          <li style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding-left: 10px">
            <span>${e.email}</span>
            <button data-id="${e.id}" class="remove-email-btn" style="margin-top: 0;display:flex;align-items:center;gap:5px">
              <img style="width:15px" src="./assets/icons/icon-delete.svg">
              <span style="color:#f44336;">Remove</span>
            </button>
          </li>
        `).join('')}
      </ul>
      <div>
        <input id="newEmailInput" type="email" placeholder="New email" style="width:65%">
        <button id="addEmailBtn">Add</button>
      </div>
      <div class="modal-actions" style="margin-top:20px;">
        <button id="closeEmailsModal">
          <img style="width:30px" src="./assets/icons/icon-close.svg">
        </button>
      </div>
      <div class="colors" style="position: absolute;bottom:-15px">
        <div class="color color-1"></div>
        <div class="color color-2"></div>
        <div class="color color-3"></div>
        <div class="color color-4"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Remove email
  modal.querySelectorAll('.remove-email-btn').forEach(btn => {
    btn.onclick = async () => {
      await deleteEmailEquipe(btn.dataset.id);
      showManageEmailsModal(empreendimentoId, onClose);
      if (onClose) onClose();
    };
  });

  // Add email
  document.getElementById('addEmailBtn').onclick = async () => {
    const input = document.getElementById('newEmailInput');
    const email = input.value.trim();
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      input.style.border = '1px solid red';
      return;
    }
    await addEmailEquipe(empreendimentoId, email);
    input.value = '';
    showManageEmailsModal(empreendimentoId, onClose);
    if (onClose) onClose();
  };

  // Close modal
  document.getElementById('closeEmailsModal').onclick = () => {
    modal.remove();
    if (onClose) onClose();
  };
}

// ========== PROJECTS ============
// Show modal for managing projects
async function showEmpreendimentoConfig() {
  const prev = document.getElementById('empreendimento-config-modal');
  if (prev) prev.remove();

  const empreendimentos = await fetchEmpreendimentos();
  const modal = document.createElement('div');
  modal.id = 'empreendimento-config-modal';
  modal.className = 'modal';
  modal.style.display = 'flex';

  const rows = empreendimentos.map(e => `
    <tr>
      <td>${e.nome}</td>
      <td style="display: flex;justify-content: center;">
        <button data-id="${e.id}" class="edit-project-btn">
          <img style="width:15px" src="./assets/icons/icon-edit.svg">
          <span>Edit</span>
        </button>
        <button data-id="${e.id}" class="remove-project-btn" style="color:#f44336;">
         <img style="width:15px" src="./assets/icons/icon-delete.svg">
         <span>Remove</span>
        </button>
      </td>
    </tr>
  `).join('');

  modal.innerHTML = `
    <div class="modal-content" style="min-width:340px;">
      <h3>Manage Projects</h3>
      <table style="width:100%;margin-bottom:12px;">
        <thead><tr><th>Name</th><th>Actions</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="2">No projects</td></tr>'}</tbody>
      </table>
      <div style="margin-bottom:12px;">
        <input id="newProjectInput" type="text" placeholder="New project name" style="width:65%">
        <button id="addProjectBtn">Add</button>
      </div>
      <div class="modal-actions">
        <button id="closeEmpConfig">
          <img style="width:30px" src="./assets/icons/icon-close.svg">
        </button>
      </div>
      <div class="colors" style="position: absolute;bottom:-15px">
        <div class="color color-1"></div>
        <div class="color color-2"></div>
        <div class="color color-3"></div>
        <div class="color color-4"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Add project
  document.getElementById('addProjectBtn').onclick = async () => {
    const input = document.getElementById('newProjectInput');
    const name = input.value.trim();
    if (!name) {
      input.style.border = '1px solid red';
      return;
    }
    await addEmpreendimento({ nome: name, config: { total: 30, perFloor: 6, base: 101, increment: 100 } });
    showEmpreendimentoConfig();
  };

  // Remove project
  modal.querySelectorAll('.remove-project-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Are you sure you want to remove this project?')) return;
      await deleteEmpreendimento(btn.dataset.id);
      showEmpreendimentoConfig();
    };
  });

  // Edit project
  modal.querySelectorAll('.edit-project-btn').forEach(btn => {
    btn.onclick = async () => {
      const emp = empreendimentos.find(e => e.id == btn.dataset.id);
      const newName = prompt('Edit project name:', emp.nome);
      if (newName && newName !== emp.nome) {
        await updateEmpreendimento(emp.id, { ...emp, nome: newName });
        showEmpreendimentoConfig();
      }
    };
  });

  document.getElementById('closeEmpConfig').onclick = () => {
    modal.remove();
    showEmpreendimentoModal();
  };
}

// ========== PROJECT SELECTION ===========
async function showEmpreendimentoModal() {
  while (!window.client || !window.userId) {
    await new Promise(res => setTimeout(res, 50));
  }
  let empreendimentos = await fetchEmpreendimentos();

  if (document.getElementById('empreendimento-modal')) {
    document.getElementById('empreendimento-modal').remove();
  }
  const empreendimentoModal = document.createElement('div');
  empreendimentoModal.id = 'empreendimento-modal';
  empreendimentoModal.classList.add('modal');
  empreendimentoModal.style.display = 'flex';

  function getProgressoEmpreendimento(emp) {
    const soldList = JSON.parse(localStorage.getItem('soldApts_' + emp.id) || '[]');
    let vendidos = soldList.length;
    return Math.round((vendidos / emp.config.total) * 100);
  }

  empreendimentoModal.innerHTML = `
    <div class="modal-content">
      <h3>Select Project</h3>
      <div id="empreendimentos-list">
        ${empreendimentos.map(e => {
          const percent = getProgressoEmpreendimento(e);
          return `
            <button class="empreendimento-btn" data-id="${e.id}">
              <span class="emp-nome">${e.nome}</span>
              <div class="emp-progress-bar-outer">
                <div class="emp-progress-bar-inner" style="width:${percent}%;"></div>
              </div>
              <span class="emp-percent">${percent}% sold</span>
            </button>
          `;
        }).join('')}
      </div>
      <div class="field" style="margin-top:14px;">
        <label style="color:#333">Projects:</label>
        <div class="group-projects">
          <button type="button" id="abrirConfigEmpreendimentos" class="btn-gerenciar-empreendimentos" style="display:flex;align-items:center;justify-content:center;gap:5px">
            <img style="width:17px" src="./assets/icons/icon-build.svg">
            <span style="color:#333">Manage projects</span>
          </button>
          <span id="projectsCount"></span>
        </div>
      </div>
      <div class="colors" style="position: absolute;bottom:-15px">
        <div class="color color-1"></div>
        <div class="color color-2"></div>
        <div class="color color-3"></div>
        <div class="color color-4"></div>
      </div>
    </div>
    <style>
      #empreendimentos-list {
        display: grid;
        gap: 14px;
        margin: 18px 0;
      }
      .empreendimento-btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 16px;
        width: 100%;
        font-size: 18px;
        border: 2px solid #e2e2e2;
        background: #fafafa;
        cursor: pointer;
        transition: background 0.2s;
        position: relative;
      }
      .emp-nome {
        font-weight: 600;
        margin-bottom: 4px;
      }
      .emp-progress-bar-outer {
        width: 100%;
        height: 8px;
        background: #eee;
        margin: 4px 0 4px 0;
        overflow: hidden;
      }
      .emp-progress-bar-inner {
        height: 100%;
        background: #47c768;
        border-radius: 4px;
        transition: width .5s;
      }
      .emp-percent {
        font-size: 13px;
        color: #666;
        margin-top: 2px;
      }
    </style>
  `;
  document.body.appendChild(empreendimentoModal);
  document.body.style.overflow = 'hidden';
  empreendimentoModal.classList.remove('hidden');
  empreendimentoModal.querySelectorAll('.empreendimento-btn').forEach(btn => {
    btn.onclick = () => {
      let selectedEmpreendimento = empreendimentos.find(e => e.id == btn.dataset.id);
      localStorage.setItem('selectedEmpreendimento', selectedEmpreendimento.id);
      empreendimentoModal.remove();
      document.body.style.overflow = '';
      startPredio(selectedEmpreendimento);
    };
  });
  empreendimentoModal.querySelector('#abrirConfigEmpreendimentos').onclick = () => {
    empreendimentoModal.remove();
    showEmpreendimentoConfig();
  };

  // Update projects count in selection modal
  const projectsCount = empreendimentos.length;
  document.getElementById('projectsCount').textContent = projectsCount
    ? `(${projectsCount} registered)`
    : '(none registered)';

  hideLoader();
}

// ========== SWITCH PROJECT BUTTON =========
function createTrocarEmpreendimentoBtn() {
  const btnExistente = document.getElementById('trocarEmpreendimentoBtn');
  if (btnExistente) btnExistente.remove();

  const trocarBtn = document.createElement('button');
  trocarBtn.textContent = 'Switch Project';
  trocarBtn.id = 'trocarEmpreendimentoBtn';
  trocarBtn.innerHTML = `<img src="./assets/icons/icon-switch.svg" alt="Settings" style="width:22px;height:22px;vertical-align:middle;" />`;
  trocarBtn.className = 'btn-trocar-empreendimento';
  trocarBtn.onclick = () => {
    localStorage.removeItem('selectedEmpreendimento');
    window.location.reload();
  };
  document.body.appendChild(trocarBtn);
}

// ========== MAIN FUNCTION ==========
async function startPredio(emp) {
  const building = document.getElementById('building');
  building.innerHTML = '';
  document.getElementById('projectTitle').innerHTML = '<img src="./assets/icons/icon-build-2.svg" alt="" style="height:25px;vertical-align:middle;margin-right:0.3em;"> ' + (emp?.nome || 'Light Estate');

  let btn = document.getElementById('trocarEmpreendimentoBtn');
  if (btn) btn.remove();

  let settingsBtnOld = document.getElementById('open-settings');
  if (settingsBtnOld) settingsBtnOld.remove();

  createTrocarEmpreendimentoBtn();

  if (!document.querySelector('script[src="assets/confetti.js"]')) {
    const script = document.createElement('script');
    script.src = 'assets/confetti.js';
    document.head.appendChild(script);
  }

  const config = emp.config;
  const modal = document.getElementById('confirmModal');
  const modalMessage = document.getElementById('modalMessage');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');
  const resumoBtn = document.getElementById('resumoBtn');
  const toast = document.getElementById('statusToast');

  let soldCount = 0;
  let pendingWindow = null;
  let pendingProperty = '';
  const vendas = await fetchVendas(emp.id);
  const vendidos = new Set(vendas.map(v => `Apt ${v.numero_apartamento} - Floor ${v.andar}`));
  let aptConfig = config;

  const perFloor = aptConfig.perFloor;
  const base = aptConfig.base;
  const increment = aptConfig.increment;
  const total = aptConfig.total;

  const wrapperPadding = 12 * 2;
  const wrapperBorder = 4 * 2;
  const wrapperExtras = wrapperPadding + wrapperBorder;

  const popupWidth = 350 - wrapperExtras;
  const windowGap = 6;
  const totalGaps = (perFloor - 1) * windowGap;
  const windowWidth = Math.floor((popupWidth - totalGaps) / perFloor);

  // Window styles
  const winStyle = document.createElement('style');
  winStyle.textContent = `
    .window { width: ${windowWidth}px; height: ${windowWidth}px; }
  `;
  document.head.appendChild(winStyle);

  building.style.gridTemplateColumns = `repeat(${perFloor}, ${windowWidth}px)`;
  building.style.gridGap = `${windowGap}px`;
  building.style.width = `${popupWidth}px`;

  // Update summary button
  updateResumoBtn();

  let settingsBtn = document.createElement('button');
  settingsBtn.innerHTML = `<img src="./assets/icons/icon-config.svg" alt="Settings" style="width:22px;height:22px;vertical-align:middle;" />`;
  settingsBtn.id = 'open-settings';
  document.body.appendChild(settingsBtn);

  let settingsPanel = document.getElementById('settings-modal');
  if (settingsPanel) settingsPanel.remove();
  settingsPanel = document.createElement('div');
  settingsPanel.id = 'settings-modal';
  settingsPanel.classList.add('modal', 'hidden');
  settingsPanel.innerHTML = `
    <div class="modal-content">
      <h3 style="color: #fff">Settings</h3>
      <div class="group-fields">
        <div class="field">
          <label>Total <br>apartments:<br>
            <input id="aptTotal" type="number" min="1" value="${aptConfig.total}">
          </label>
        </div>
        <div class="field">
          <label>Apartments <br>per floor:<br>
            <input id="aptPerFloor" type="number" min="1" value="${aptConfig.perFloor}">
          </label>
        </div>
        <div class="field">
          <label>Starting <br>number (e.g. 101):<br>
            <input id="aptBase" type="number" min="1" value="${aptConfig.base}">
          </label>
        </div>
        <div class="field">
          <label>Increment <br>per floor (e.g. 100):<br>
            <input id="aptIncrement" type="number" min="1" value="${aptConfig.increment}">
          </label>
        </div>
        <div class="field">
          <label>Team emails:</label>
          <div class="group-emails">
            <button type="button" id="manageTeamEmailsBtn" style="display:flex;align-items:center;justify-content:center;gap:5px">
              <img style="width:15px" src="./assets/icons/icon-email.svg">
              <span style="color:#333">Manage emails</span>
            </button>
            <span id="teamEmailsCount"></span>
          </div>
        </div>
        <div class="field">
          <label>Projects:</label>
          <div class="group-projects">
            <button type="button" id="abrirConfigEmpreendimentosSettings" class="btn-gerenciar-empreendimentos" style="display:flex;align-items:center;justify-content:center;gap:5px">
               <img style="width:15px" src="./assets/icons/icon-build.svg">
               <span style="color:#333">Manage projects</span>
            </button>
            <span id="projectsCount"></span>
          </div>
        </div>
        <div class="field">
          <label><input type="checkbox" id="soundEnabled" ${localStorage.getItem('soundEnabled_' + emp.id) === 'false' ? '' : 'checked'}>
          Enable sale sound
          </label>
        </div>
        <div class="field">
          <label><input type="checkbox" id="emailEnabled" ${localStorage.getItem('emailEnabled_' + emp.id) === 'false' ? '' : 'checked'}>
            Enable email notification
          </label>
        </div>
      </div>
      <div class="field-line">
        <div class="modal-actions">
          <button id="saveSettings" style="display:flex;align-items: center;gap:5px">
            <img style="width:15px" src="./assets/icons/icon-save.svg">
            <span>Save</span>
          </button>
          <button id="exportCSV" style="display:flex;align-items: center;gap:5px">
            <img style="width:15px" src="./assets/icons/icon-export.svg">
            <span>Export CSV</span>
          </button>
          <button id="closeSettings">
            <img style="width:30px" src="./assets/icons/icon-close-white.svg">
          </button>
        </div>
      </div>
      <div class="colors" style="bottom:-15px;position:absolute">
        <div class="color color-1"></div>
        <div class="color color-2"></div>
        <div class="color color-3"></div>
        <div class="color color-4"></div>
      </div>
    </div>
  `;
  document.body.appendChild(settingsPanel);

  async function updateTeamEmailsCount() {
    const emails = await fetchEmailsEquipe(emp.id);
    document.getElementById('teamEmailsCount').textContent = emails.length
      ? `(${emails.length} registered)`
      : '(none registered)';
  }
  updateTeamEmailsCount();

  async function updateProjectsCount() {
    const projects = await fetchEmpreendimentos();
    document.getElementById('projectsCount').textContent = projects.length
      ? `(${projects.length} registered)`
      : '(none registered)';
  }
  updateProjectsCount();

  document.getElementById('manageTeamEmailsBtn').onclick = () => {
    settingsPanel.classList.add('hidden');
    showManageEmailsModal(emp.id, function() {
      settingsPanel.classList.remove('hidden');
      updateTeamEmailsCount();
    });
  };

  document.getElementById('abrirConfigEmpreendimentosSettings').onclick = () => {
    settingsPanel.classList.add('hidden');
    showEmpreendimentoConfig();
    updateProjectsCount();
  };

  settingsBtn.onclick = () => {
    settingsPanel.classList.remove('hidden');
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#closeSettings');
    if (btn) {
      settingsPanel.classList.add('hidden');
    }
  });

  document.getElementById('saveSettings').onclick = async () => {
    const total = parseInt(document.getElementById('aptTotal').value);
    const perFloor = parseInt(document.getElementById('aptPerFloor').value);
    const base = parseInt(document.getElementById('aptBase').value);
    const increment = parseInt(document.getElementById('aptIncrement').value);
    const emailEnabled = document.getElementById('emailEnabled').checked;
    const soundEnabled = document.getElementById('soundEnabled').checked;

    localStorage.setItem('emailEnabled_' + emp.id, emailEnabled);
    localStorage.setItem('soundEnabled_' + emp.id, soundEnabled);
    localStorage.removeItem('soldApts_' + emp.id);

    await updateEmpreendimento(emp.id, {
      ...emp,
      config: { total, perFloor, base, increment }
    });

    showToast('Settings saved');
    setTimeout(() => location.reload(), 1000);
  };

  document.getElementById('exportCSV').onclick = () => {
    if (soldList.length === 0) return alert('Nothing to export');
    const csv = 'Apartment,Sold\n' + soldList.map(apt => `${apt},Yes`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sales.csv';
    link.click();
  };

  const floorMap = {};

  for (let i = 0; i < total; i++) {
    const floor = Math.floor(i / perFloor) + 1;
    const apt = (i % perFloor) + 1;
    const aptNumber = base + (floor - 1) * increment + (apt - 1);
    const aptName = `Apt ${aptNumber} - Floor ${floor}`;

    const windowEl = document.createElement('div');
    windowEl.classList.add('window');
    windowEl.title = aptName;

    const leftPane = document.createElement('div');
    leftPane.classList.add('pane', 'left');

    const rightPane = document.createElement('div');
    rightPane.classList.add('pane', 'right');

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `${aptNumber}`;

    windowEl.appendChild(leftPane);
    windowEl.appendChild(rightPane);
    windowEl.appendChild(label);

    if (vendidos.has(aptName)) {
      windowEl.classList.add('sold');
      soldCount++;
    }

    windowEl.onclick = () => {
      if (windowEl.classList.contains('sold')) return;
      pendingWindow = windowEl;
      pendingProperty = aptName;
      modalMessage.textContent = `Do you want to register the sale of ${aptName} and notify the team?`;
      modal.classList.remove('hidden');
    };

    if (!floorMap[floor]) floorMap[floor] = [];
    floorMap[floor].push(windowEl);
  }

  const sortedFloors = Object.keys(floorMap).sort((a, b) => b - a);
  for (const floor of sortedFloors) {
    for (const el of floorMap[floor]) {
      building.appendChild(el);
    }
  }

  function updateResumoBtn() {
    const sold = vendas.length;
    const available = total - sold;
    resumoBtn.className = "summary-btn";
    resumoBtn.innerHTML = `
      <span class="icon"><img style="width:18px;position: relative;top: 2px;" src="./assets/icons/icon-build.svg"></span>
      <span class="sold"><b>${sold}</b> sold</span>
      <span class="divider">|</span>
      <span class="available"><b>${available}</b> available</span>
      <div class="colors" style="position: absolute;bottom:-6px;height:6px">
        <div class="color color-1"></div>
        <div class="color color-2"></div>
        <div class="color color-3"></div>
        <div class="color color-4"></div>
      </div>
    `;
  }
  updateResumoBtn();

  confirmYes.onclick = null;
  confirmYes.onclick = async () => {
    if (!pendingWindow) return;

    showToast('Sending data...');
    const emailEnabled = localStorage.getItem('emailEnabled_' + emp.id) !== 'false';
    const soundEnabled = localStorage.getItem('soundEnabled_' + emp.id) !== 'false';

    try {
      soldList = JSON.parse(localStorage.getItem('soldApts_' + emp.id) || '[]');
      const aptMatch = pendingProperty.match(/Apt (\d+) - Floor (\d+)/);
      const aptNumber = aptMatch ? parseInt(aptMatch[1], 10) : 0;
      const floor = aptMatch ? parseInt(aptMatch[2], 10) : 0;
      const vendas = soldList.length + 1;
      const porcentagem = Math.round((vendas / aptConfig.total) * 100);

      // Check emails before
      if (emailEnabled) {
        const emailsEquipe = await fetchEmailsEquipe(emp.id);
        const emails = emailsEquipe.map(e => e.email);
        if (emails.length === 0) {
          showToast('⚠️ Please add at least one team email before notifying!');
          closeModal();
          return;
        }
      }

      await registrarVenda(emp, aptNumber, floor, porcentagem);
      await startPredio(emp);

      // Always send push notification
      await fetch('https://lightestate-backend.vercel.app/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Sale registered!',
          body: `${pendingProperty} has been sold!`
        })
      });

      // Send email to team (if enabled)
      if (emailEnabled) {
        const emailsEquipe = await fetchEmailsEquipe(emp.id);
        const emails = emailsEquipe.map(e => e.email);
        if (emails.length > 0) {
          await fetch('https://lightestate-backend.vercel.app/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property: pendingProperty, emails })
          });
        }
      }

      soldCount++;
      updateResumoBtn();

      showToast('Sale successfully registered ✅');

      if (soundEnabled) {
        const audio = new Audio('assets/confeti.mp3');
        audio.volume = 0.6;
        audio.play().catch(e => console.warn('🔇 Sound blocked by browser:', e));
      }

      const duration = 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        confetti({
          ...defaults,
          particleCount: 50,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2
          }
        });
      }, 20);

    } catch (error) {
      console.error(error);
      showToast('Connection error ⚠️');
    }

    closeModal();
  };

  confirmNo.onclick = () => {
    closeModal();
  };

  function closeModal() {
    modal.classList.add('hidden');
    pendingWindow = null;
    pendingProperty = '';
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
  }

  let resumoModal = document.getElementById('resumo-modal');
  if (resumoModal) resumoModal.remove();
  resumoModal = document.createElement('div');
  resumoModal.id = 'resumo-modal';
  resumoModal.classList.add('modal', 'hidden');
  document.body.appendChild(resumoModal);

  resumoBtn.onclick = async () => {
    const resumoPorAndar = {};

    const vendas = await fetchVendas(emp.id);
    vendas.forEach(v => {
      const floor = v.andar;
      resumoPorAndar[floor] = (resumoPorAndar[floor] || 0) + 1;
    });
    resumoModal.innerHTML = `
    <div class="modal-content">
      <h3>Summary by Floor</h3>
      <ul class="list-floor">
        ${
          Object.keys(resumoPorAndar)
            .sort((a, b) => a - b)
            .map(floor => {
              const total = resumoPorAndar[floor];
              return `<li>Floor ${floor}: <b>${total}</b> sold</li>`;
            })
            .join('')
        }
      </ul>
      <div class="modal-actions">
        <button id="closeResumo">
          <img style="width:30px" src="./assets/icons/icon-close.svg">
        </button>
      </div>
      <div class="colors" style="position: absolute;bottom:-15px">
        <div class="color color-1"></div>
        <div class="color color-2"></div>
        <div class="color color-3"></div>
        <div class="color color-4"></div>
      </div>
    </div>
  `;
    resumoModal.classList.remove('hidden');
  };

  document.addEventListener('click', (e) => {
    const btnClose = e.target.closest('#closeResumo');
    if (btnClose) {
      resumoModal.classList.add('hidden');
    }
  });

  hideLoader();
}

// ========== LOADER ==========
function hideLoader() {
  const loader = document.getElementById('loader-overlay');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => loader && loader.remove(), 500);
  }
}

// ========== FLOW ==========
(async function main() {
  while (!window.client || !window.userId) {
    await new Promise(res => setTimeout(res, 50));
  }
  let storedEmpreendimentoId = localStorage.getItem('selectedEmpreendimento');
  let empreendimentos = await fetchEmpreendimentos();
  let emp = storedEmpreendimentoId ? empreendimentos.find(e => e.id == storedEmpreendimentoId) : null;
  if (emp) {
    startPredio(emp);
  } else {
    showEmpreendimentoModal();
  }
})();
