// ============================================================
// KONFIGURASI GOOGLE APPS SCRIPT
// ============================================================
const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwvpw79Gm8NGjW3EQhLUN3u3E9vIqGjPXb2DPSFF7RrM99963LL-ZvDXHLtusvhri9Fbw/exec';
const API_URL = GAS_WEBAPP_URL;

async function apiGet(action) {
  const r = await fetch(`${API_URL}?action=${action}`);
  return await r.json();
}

// ============================================================
// DATA PEGAWAI (diisi dari Google Apps Script)
// ============================================================
const DAFTAR_PEGAWAI = [];

// ============================================================
// ADMIN: KELOLA DAFTAR PEGAWAI
// ============================================================
function loadDaftarPegawai() {}
function saveDaftarPegawai() {}

function toggleAdminPegawai() {
  const body = document.getElementById('adminPegawaiBody');
  const icon = document.getElementById('adminPegawaiToggleIcon');
  body.classList.toggle('open');
  icon.textContent = body.classList.contains('open') ? '▲' : '▼';
  if (body.classList.contains('open')) renderPegawaiList();
}

function getPegawaiFiltered() {
  const q = (document.getElementById('pegawaiSearch')?.value || '').toLowerCase().trim();
  if (!q) return DAFTAR_PEGAWAI.map((p, i) => ({ ...p, _idx: i }));
  return DAFTAR_PEGAWAI
    .map((p, i) => ({ ...p, _idx: i }))
    .filter(p =>
      (p.nama || '').toLowerCase().includes(q) ||
      (p.nip || '').toLowerCase().includes(q) ||
      (p.jabatan || '').toLowerCase().includes(q) ||
      (p.satuan_kerja || '').toLowerCase().includes(q)
    );
}

function renderPegawaiList() {
  const tbody = document.getElementById('pegawaiListBody');
  const badge = document.getElementById('pegawaiCountBadge');
  const emptyMsg = document.getElementById('pegawaiEmptyMsg');
  badge.textContent = DAFTAR_PEGAWAI.length;
  tbody.innerHTML = '';
  const rows = getPegawaiFiltered();
  if (rows.length === 0) {
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
    rows.forEach((p, rowNum) => {
      const idx = p._idx;
      const tr = document.createElement('tr');
      tr.id = 'pegawai-row-' + idx;
      tr.innerHTML = `
        <td style="color:var(--gray-400);font-size:12px;">${rowNum + 1}</td>
        <td>${escHtml(p.nama)}</td>
        <td style="font-size:12px;color:var(--gray-700);">${escHtml(p.nip || '')}</td>
        <td>${escHtml(p.jabatan || '')}</td>
        <td>${escHtml(p.satuan_kerja || '')}</td>
        <td>
          <button class="btn-icon btn-edit" onclick="editPegawai(${idx})">✏️</button>
          <button class="btn-icon btn-delete" onclick="hapusPegawai(${idx})">🗑️</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function editPegawai(idx) {
  const p = DAFTAR_PEGAWAI[idx];
  const rowEl = document.getElementById('pegawai-row-' + idx);
  if (!rowEl) return;
  rowEl.innerHTML = `
    <td style="color:var(--gray-400);font-size:12px;">${idx + 1}</td>
    <td><input class="pegawai-inline-input" id="edit-nama-${idx}" value="${escHtml(p.nama)}"></td>
    <td><input class="pegawai-inline-input" id="edit-nip-${idx}" value="${escHtml(p.nip || '')}"></td>
    <td><input class="pegawai-inline-input" id="edit-jabatan-${idx}" value="${escHtml(p.jabatan || '')}"></td>
    <td><input class="pegawai-inline-input" id="edit-satker-${idx}" value="${escHtml(p.satuan_kerja || '')}"></td>
    <td>
      <button class="btn-icon btn-save" onclick="simpanEditPegawai(${idx})">✔</button>
      <button class="btn-icon btn-cancel" onclick="renderPegawaiList()">✕</button>
    </td>`;
  document.getElementById('edit-nama-' + idx).focus();
}

function simpanEditPegawai(idx) {
  const nama   = document.getElementById('edit-nama-'    + idx).value.trim();
  const nip    = document.getElementById('edit-nip-'     + idx).value.trim();
  const jab    = document.getElementById('edit-jabatan-' + idx).value.trim();
  const satker = document.getElementById('edit-satker-'  + idx).value.trim();
  if (!nama) { alert('Nama pegawai tidak boleh kosong.'); return; }
  DAFTAR_PEGAWAI[idx] = { nama, nip, jabatan: jab, satuan_kerja: satker };
  renderPegawaiList();
  populatePegawaiDropdown();
  populatePenilaiDropdown();
  showAlert('Data pegawai berhasil diperbarui.', 'success');
}

function hapusPegawai(idx) {
  if (!confirm('Hapus pegawai "' + DAFTAR_PEGAWAI[idx].nama + '"?')) return;
  DAFTAR_PEGAWAI.splice(idx, 1);
  renderPegawaiList();
  populatePegawaiDropdown();
  populatePenilaiDropdown();
  showAlert('Pegawai berhasil dihapus.', 'success');
}

function tambahPegawai() {
  const nama   = document.getElementById('newPegawaiNama').value.trim();
  const nip    = document.getElementById('newPegawaiNip').value.trim();
  const jab    = document.getElementById('newPegawaiJabatan').value.trim();
  const satker = document.getElementById('newPegawaiSatker').value.trim();
  if (!nama) { showAlert('Nama pegawai wajib diisi.', 'error'); return; }
  DAFTAR_PEGAWAI.push({ nama, nip, jabatan: jab, satuan_kerja: satker });
  ['newPegawaiNama','newPegawaiNip','newPegawaiJabatan','newPegawaiSatker'].forEach(id => document.getElementById(id).value = '');
  renderPegawaiList();
  populatePegawaiDropdown();
  populatePenilaiDropdown();
  showAlert('Pegawai "' + nama + '" berhasil ditambahkan.', 'success');
}

// ---- IMPORT CSV ----
function triggerImportCsv() {
  document.getElementById('importGuide').style.display = 'block';
  document.getElementById('importCsvInput').value = '';
  document.getElementById('importCsvInput').click();
}

function importCsvFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { showAlert('File CSV kosong atau tidak memiliki data.', 'error'); return; }
      const dataLines = lines.slice(1);
      const imported = [];
      let errors = 0;
      dataLines.forEach((line) => {
        const cols = parseCsvLine(line);
        const nama   = (cols[0] || '').trim();
        const nip    = (cols[1] || '').trim();
        const jab    = (cols[2] || '').trim();
        const satker = (cols[3] || '').trim();
        if (!nama) { errors++; return; }
        imported.push({ nama, nip, jabatan: jab, satuan_kerja: satker });
      });
      if (imported.length === 0) { showAlert('Tidak ada data valid yang dapat diimpor.', 'error'); return; }
      const mode = confirm(
        'Ditemukan ' + imported.length + ' pegawai di file CSV.\n\n' +
        'Klik OK → Tambahkan ke daftar yang ada.\n' +
        'Klik Batal → Ganti seluruh daftar dengan data baru.'
      );
      if (mode) {
        imported.forEach(p => DAFTAR_PEGAWAI.push(p));
      } else {
        DAFTAR_PEGAWAI.length = 0;
        imported.forEach(p => DAFTAR_PEGAWAI.push(p));
      }
      renderPegawaiList();
      populatePegawaiDropdown();
      populatePenilaiDropdown();
      showAlert('Berhasil mengimpor ' + imported.length + ' pegawai' + (errors > 0 ? ` (${errors} baris dilewati)` : '') + '.', 'success');
    } catch (err) {
      showAlert('Gagal membaca CSV: ' + err.message, 'error');
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function parseCsvLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      result.push(cur); cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

function exportCsv() {
  if (DAFTAR_PEGAWAI.length === 0) { showAlert('Tidak ada data pegawai untuk diekspor.', 'error'); return; }
  const header = 'Nama,NIP/NIK,Jabatan,Satuan Kerja';
  const rows = DAFTAR_PEGAWAI.map(p =>
    [csvQuote(p.nama), csvQuote(p.nip||''), csvQuote(p.jabatan||''), csvQuote(p.satuan_kerja||'')].join(',')
  );
  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'daftar_pegawai_rsup_fatmawati.csv';
  link.click();
  URL.revokeObjectURL(url);
  showAlert('File CSV berhasil diunduh.', 'success');
}

function csvQuote(val) {
  val = String(val || '');
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

// ============================================================
// LOGIN TAB SWITCHER
// ============================================================
async function switchLoginTab(tab) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.login-panel').forEach(p => p.classList.remove('active'));
  if (tab === 'login') {
    document.getElementById('tabLoginBtn').classList.add('active');
    document.getElementById('panelLogin').classList.add('active');
  } else {
    document.getElementById('tabRegisterBtn').classList.add('active');
    document.getElementById('panelRegister').classList.add('active');
    await loadPegawaiFromGAS();
    regSdRenderList('');
  }
}

function regSdRenderList(q) {
  const list = document.getElementById('regSdList');
  const filtered = DAFTAR_PEGAWAI
    .map((p, i) => ({ ...p, _idx: i }))
    .filter(p =>
      !q ||
      (p.nama || '').toLowerCase().includes(q.toLowerCase()) ||
      (p.nip || '').toLowerCase().includes(q.toLowerCase()) ||
      (p.satuan_kerja || '').toLowerCase().includes(q.toLowerCase())
    );
  list.innerHTML = '';
  filtered.slice(0, 50).forEach(p => {
    const li = document.createElement('div');
    li.className = 'reg-sd-item';
    li.innerHTML = `<strong>${escHtml(p.nama)}</strong><span>${escHtml(p.satuan_kerja||'')} ${p.nip ? '· '+escHtml(p.nip) : ''}</span>`;
    li.onclick = () => regSdSelect(p._idx);
    list.appendChild(li);
  });
  if (filtered.length === 0) {
    list.innerHTML = '<div class="reg-sd-empty">Tidak ditemukan</div>';
  }
}

function regSdOpen() { document.getElementById('regSdList').classList.add('open'); regSdFilter(); }
function regSdClose() { document.getElementById('regSdList').classList.remove('open'); }
function regSdToggle() {
  const list = document.getElementById('regSdList');
  if (list.classList.contains('open')) regSdClose(); else regSdOpen();
}
function regSdFilter() {
  const q = document.getElementById('regSdInput').value;
  document.getElementById('regSdClear').style.display = q ? 'inline' : 'none';
  regSdRenderList(q);
  document.getElementById('regSdList').classList.add('open');
}
function regSdSelect(idx) {
  const p = DAFTAR_PEGAWAI[idx];
  if (!p) return;
  document.getElementById('regSdInput').value = p.nama;
  document.getElementById('regPegawaiIdx').value = idx;
  document.getElementById('regSatker').value = p.satuan_kerja || '';
  document.getElementById('regJabatan').value = p.jabatan || '';
  document.getElementById('regSdClear').style.display = 'inline';
  regSdClose();
}
function regSdClear() {
  document.getElementById('regSdInput').value = '';
  document.getElementById('regPegawaiIdx').value = '';
  document.getElementById('regSatker').value = '';
  document.getElementById('regJabatan').value = '';
  document.getElementById('regSdClear').style.display = 'none';
}
function regSdKeyNav(e) {
  const items = document.querySelectorAll('#regSdList .reg-sd-item');
  let focused = document.querySelector('#regSdList .reg-sd-item.focused');
  let idx = Array.from(items).indexOf(focused);
  if (e.key === 'ArrowDown') { idx = Math.min(idx + 1, items.length - 1); }
  else if (e.key === 'ArrowUp') { idx = Math.max(idx - 1, 0); }
  else if (e.key === 'Enter' && focused) { focused.click(); return; }
  else if (e.key === 'Escape') { regSdClose(); return; }
  else return;
  items.forEach(i => i.classList.remove('focused'));
  if (items[idx]) { items[idx].classList.add('focused'); items[idx].scrollIntoView({ block: 'nearest' }); }
}

// ============================================================
// REGISTER PENILAI
// ============================================================
async function doRegister() {
  const errEl  = document.getElementById('registerError');
  const succEl = document.getElementById('registerSuccess');
  errEl.classList.remove('show');
  succEl.classList.remove('show');

  const username   = document.getElementById('regUsername').value.trim().toLowerCase();
  const password   = document.getElementById('regPassword').value;
  const passConf   = document.getElementById('regPasswordConfirm').value;
  const pegawaiIdx = document.getElementById('regPegawaiIdx').value;

  if (!username || username.length < 4) { errEl.textContent = 'Username minimal 4 karakter'; errEl.classList.add('show'); return; }
  if (!password || password.length < 6) { errEl.textContent = 'Password minimal 6 karakter'; errEl.classList.add('show'); return; }
  if (password !== passConf) { errEl.textContent = 'Konfirmasi password tidak cocok'; errEl.classList.add('show'); return; }
  if (pegawaiIdx === '') { errEl.textContent = 'Pilih nama pegawai terlebih dahulu'; errEl.classList.add('show'); return; }

  const p = DAFTAR_PEGAWAI[parseInt(pegawaiIdx)];
  if (!p) { errEl.textContent = 'Pegawai tidak valid'; errEl.classList.add('show'); return; }

  try {
    const url = API_URL + '?action=register'
      + '&username=' + encodeURIComponent(username)
      + '&password=' + encodeURIComponent(password)
      + '&nama='     + encodeURIComponent(p.nama);
    const res    = await fetch(url);
    const result = await res.json();
    if (!result.success) {
      errEl.textContent = result.message || 'Registrasi gagal';
      errEl.classList.add('show');
      return;
    }
    succEl.textContent = 'Registrasi berhasil! Silakan masuk.';
    succEl.classList.add('show');
    setTimeout(() => switchLoginTab('login'), 2000);
  } catch (err) {
    errEl.textContent = 'Gagal menghubungi server: ' + err.message;
    errEl.classList.add('show');
  }
}

// ============================================================
// STATE GLOBAL
// ============================================================
let currentUser = null;

// ============================================================
// LOAD PEGAWAI DARI GOOGLE APPS SCRIPT
// ============================================================
async function loadPegawaiFromGAS() {
  try {
    const data = await fetch(API_URL + '?action=pegawai').then(r => r.json());
    DAFTAR_PEGAWAI.length = 0;
    data.forEach(row => DAFTAR_PEGAWAI.push({
      nama:        row.nama_pegawai || '',
      nip:         row.nip_nik      || '',
      jabatan:     row.jabatan_pegawai || row.jabatan || '',
      satuan_kerja: row.unit_kerja  || ''
    }));
    console.log('Pegawai loaded:', DAFTAR_PEGAWAI.length);
  } catch (err) {
    console.error('Gagal memuat pegawai dari GAS:', err);
  }
}

// ============================================================
// LOGIN / LOGOUT
// ============================================================
async function doLogin() {
  const username = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  errEl.classList.remove('show');

  if (!username || !password) {
    errEl.textContent = 'Isi username dan password';
    errEl.classList.add('show');
    return;
  }

  // Admin lokal
  if (username === 'admin' && password === 'admin123') {
    currentUser = { nama: 'Administrator Sistem', username: 'admin', role: 'admin' };
  } else {
    try {
      const url = API_URL + '?action=login'
        + '&username=' + encodeURIComponent(username)
        + '&password=' + encodeURIComponent(password);
      const res    = await fetch(url);
      const result = await res.json();

      if (!result.success) {
        errEl.textContent = result.message || 'Login gagal';
        errEl.classList.add('show');
        return;
      }
      currentUser = { nama: result.nama_lengkap, username: username, role: 'penilai' };
    } catch (err) {
      console.error(err);
      errEl.textContent = 'Gagal menghubungi server';
      errEl.classList.add('show');
      return;
    }
  }

  document.getElementById('loginOverlay').classList.add('hidden');
  document.getElementById('topbar').style.display        = 'flex';
  document.getElementById('mainContent').style.display   = 'block';
  document.getElementById('topbarName').textContent      = currentUser.nama;

  populatePegawaiDropdown();
  populatePenilaiDropdown();
}

function doLogout() {
  currentUser = null;
  document.getElementById('loginOverlay').classList.remove('hidden');
  document.getElementById('topbar').style.display      = 'none';
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}

// ============================================================
// POPULATE DROPDOWNS
// ============================================================
const SD = {
  pegawai: { id: 'sdPegawai', inputId: 'sdPegawaiInput', listId: 'sdPegawaiList', hiddenId: 'namaPegawaiSelect', onSelect: null, focusIdx: -1 },
  penilai: { id: 'sdPenilai', inputId: 'sdPenilaiInput', listId: 'sdPenilaiList', hiddenId: 'penilaiSelect',     onSelect: null, focusIdx: -1 }
};

function sdGetKey(wrapId) {
  return Object.keys(SD).find(k => SD[k].id === wrapId);
}

function sdHl(text, query) {
  if (!query) return escHtml(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return escHtml(text);
  return escHtml(text.slice(0, idx)) + '<mark>' + escHtml(text.slice(idx, idx + query.length)) + '</mark>' + escHtml(text.slice(idx + query.length));
}

function sdRenderList(wrapId, query) {
  const key  = sdGetKey(wrapId);
  const cfg  = SD[key];
  const list = document.getElementById(cfg.listId);
  const filtered = DAFTAR_PEGAWAI
    .map((p, i) => ({ ...p, _idx: i }))
    .filter(p =>
      !query ||
      (p.nama || '').toLowerCase().includes(query.toLowerCase()) ||
      (p.nip  || '').toLowerCase().includes(query.toLowerCase()) ||
      (p.satuan_kerja || '').toLowerCase().includes(query.toLowerCase())
    );
  list.innerHTML = '';
  cfg.focusIdx = -1;
  filtered.slice(0, 60).forEach(p => {
    const li = document.createElement('div');
    li.className = 'sd-item';
    li.innerHTML = `<strong>${sdHl(p.nama, query)}</strong><span>${escHtml(p.satuan_kerja||'')} ${p.nip ? '· '+escHtml(p.nip) : ''}</span>`;
    li.onclick = () => sdSelect(wrapId, p._idx);
    list.appendChild(li);
  });
  if (filtered.length === 0) list.innerHTML = '<div class="sd-empty">Tidak ditemukan</div>';
}

function sdOpen(wrapId) {
  document.querySelectorAll('.sd-list.open').forEach(l => l.classList.remove('open'));
  const key = sdGetKey(wrapId);
  sdRenderList(wrapId, document.getElementById(SD[key].inputId).value);
  document.getElementById(SD[key].listId).classList.add('open');
}
function sdClose(wrapId) {
  const key = sdGetKey(wrapId);
  if (key) document.getElementById(SD[key].listId).classList.remove('open');
}
function sdToggle(wrapId) {
  const key  = sdGetKey(wrapId);
  const list = document.getElementById(SD[key].listId);
  if (list.classList.contains('open')) sdClose(wrapId); else sdOpen(wrapId);
}
function sdFilter(wrapId) {
  const key = sdGetKey(wrapId);
  const q   = document.getElementById(SD[key].inputId).value;
  const clr = document.querySelector('#' + wrapId + ' .sd-clear');
  if (clr) clr.classList.toggle('visible', !!q);
  sdRenderList(wrapId, q);
  document.getElementById(SD[key].listId).classList.add('open');
}
function sdSelect(wrapId, idx) {
  const key = sdGetKey(wrapId);
  const cfg = SD[key];
  const p   = DAFTAR_PEGAWAI[idx];
  if (!p) return;
  document.getElementById(cfg.inputId).value = p.nama;
  document.getElementById(cfg.inputId).classList.add('sd-selected');
  document.getElementById(cfg.hiddenId).value = idx;
  const clr = document.querySelector('#' + wrapId + ' .sd-clear');
  if (clr) clr.classList.add('visible');
  sdClose(wrapId);
  if (cfg.onSelect) cfg.onSelect(idx);
}
function sdClear(wrapId, hiddenId, callback) {
  const key = sdGetKey(wrapId);
  const cfg = SD[key];
  document.getElementById(cfg.inputId).value = '';
  document.getElementById(cfg.inputId).classList.remove('sd-selected');
  document.getElementById(cfg.hiddenId).value = '';
  const clr = document.querySelector('#' + wrapId + ' .sd-clear');
  if (clr) clr.classList.remove('visible');
  sdClose(wrapId);
  if (callback) callback();
}
function sdKeyNav(event, wrapId) {
  const key   = sdGetKey(wrapId);
  const list  = document.getElementById(SD[key].listId);
  const items = list.querySelectorAll('.sd-item');
  const cfg   = SD[key];
  if (event.key === 'ArrowDown') { cfg.focusIdx = Math.min(cfg.focusIdx + 1, items.length - 1); }
  else if (event.key === 'ArrowUp') { cfg.focusIdx = Math.max(cfg.focusIdx - 1, 0); }
  else if (event.key === 'Enter' && cfg.focusIdx >= 0) { items[cfg.focusIdx].click(); return; }
  else if (event.key === 'Escape') { sdClose(wrapId); return; }
  else return;
  items.forEach(i => i.classList.remove('focused'));
  if (items[cfg.focusIdx]) { items[cfg.focusIdx].classList.add('focused'); items[cfg.focusIdx].scrollIntoView({ block: 'nearest' }); }
}

function populatePegawaiDropdown() { sdRenderList('sdPegawai', ''); }
function populatePenilaiDropdown() { sdRenderList('sdPenilai', ''); }

// ============================================================
// PILIH PEGAWAI
// ============================================================
function pilihPegawai() {
  const idx = document.getElementById('namaPegawaiSelect').value;
  if (idx === '') return;
  const p = DAFTAR_PEGAWAI[parseInt(idx)];
  if (!p) return;

  // Isi NIP
  document.getElementById('nipnik').value = p.nip || '';

  // Print display
  const pnp  = document.getElementById('printNamaPegawai');
  const pnip = document.getElementById('printNipPegawai');
  if (pnp)  pnp.textContent  = p.nama;
  if (pnip) pnip.textContent = p.nip || '';

  updateHasil();
}

SD.pegawai.onSelect = (idx) => {
  document.getElementById('namaPegawaiSelect').value = idx;
  pilihPegawai();
};

// ============================================================
// PILIH PENILAI
// ============================================================
function pilihPenilai() {
  const idx = document.getElementById('penilaiSelect').value;
  if (idx === '') return;
  const p = DAFTAR_PEGAWAI[parseInt(idx)];
  if (!p) return;

  document.getElementById('jabatanPenilai').value = p.jabatan || '';

  const pnpen = document.getElementById('printNamaPenilai');
  const pjpen = document.getElementById('printJabatanPenilai');
  if (pnpen) pnpen.textContent = p.nama;
  if (pjpen) pjpen.textContent = p.jabatan || '';

  updateHasil();
}

SD.penilai.onSelect = (idx) => {
  document.getElementById('penilaiSelect').value = idx;
  pilihPenilai();
};

// ============================================================
// DROPDOWN UNIT KERJA BARU
// ============================================================
(function() {
  const unitList = [];

  function buildUnitList() {
    unitList.length = 0;
    const seen = new Set();
    DAFTAR_PEGAWAI.forEach(p => {
      const u = (p.satuan_kerja || '').trim();
      if (u && !seen.has(u)) { seen.add(u); unitList.push(u); }
    });
    unitList.sort();
  }

  function renderList(q) {
    const list = document.getElementById('sdUnitBaruList');
    if (!list) return;
    const filtered = unitList.filter(u => !q || u.toLowerCase().includes(q.toLowerCase()));
    list.innerHTML = '';
    filtered.forEach(u => {
      const li = document.createElement('div');
      li.className = 'sd-item';
      li.textContent = u;
      li.onclick = () => selectUnit(u);
      list.appendChild(li);
    });
    if (filtered.length === 0) list.innerHTML = '<div class="sd-empty">Tidak ditemukan</div>';
  }

  function openList() {
    buildUnitList();
    renderList(document.getElementById('sdUnitBaruInput')?.value || '');
    document.getElementById('sdUnitBaruList')?.classList.add('open');
  }
  function closeList() {
    document.getElementById('sdUnitBaruList')?.classList.remove('open');
  }
  function selectUnit(unit) {
    const inp = document.getElementById('sdUnitBaruInput');
    const hid = document.getElementById('unitBaruHidden');
    if (inp) { inp.value = unit; inp.classList.add('sd-selected'); }
    if (hid) hid.value = unit;
    closeList();
    updateHasil();
  }

  window.sdUnitBaruOpen   = openList;
  window.sdUnitBaruClose  = closeList;
  window.sdUnitBaruToggle = () => {
    const list = document.getElementById('sdUnitBaruList');
    if (list?.classList.contains('open')) closeList(); else openList();
  };
  window.sdUnitBaruFilter = () => {
    const q   = document.getElementById('sdUnitBaruInput')?.value || '';
    const hid = document.getElementById('unitBaruHidden');
    if (hid) hid.value = '';
    const clr = document.getElementById('sdUnitBaruClear');
    if (clr) clr.style.display = q ? 'inline' : 'none';
    buildUnitList();
    renderList(q);
    document.getElementById('sdUnitBaruList')?.classList.add('open');
  };
  window.sdUnitBaruClear = () => {
    const inp = document.getElementById('sdUnitBaruInput');
    const hid = document.getElementById('unitBaruHidden');
    const clr = document.getElementById('sdUnitBaruClear');
    if (inp) { inp.value = ''; inp.classList.remove('sd-selected'); }
    if (hid) hid.value = '';
    if (clr) clr.style.display = 'none';
    closeList();
    updateHasil();
  };
  window.sdUnitBaruKeyNav = (e) => {
    const list  = document.getElementById('sdUnitBaruList');
    const items = list?.querySelectorAll('.sd-item') || [];
    if (e.key === 'Escape') { closeList(); }
    else if (e.key === 'Enter' && document.querySelector('#sdUnitBaruList .sd-item.focused')) {
      document.querySelector('#sdUnitBaruList .sd-item.focused').click();
    }
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#sdUnitBaru')) closeList();
  });
})();

// ============================================================
// TANGGAL & TRIWULAN
// ============================================================
function updateTanggalDisplay() {
  const val = document.getElementById('tanggalPenilaian').value;
  const el  = document.getElementById('tanggalPenilaianDisplay');
  if (!val || !el) return;
  const d = new Date(val + 'T00:00:00');
  el.textContent = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ============================================================
// INDIKATOR PENILAIAN
// ============================================================
const indikators = [
  "Kesesuaian kompetensi dengan unit kerja baru",
  "Pemahaman tugas dan tanggung jawab",
  "Kemampuan adaptasi di unit kerja baru",
  "Kemampuan komunikasi dan kerja sama",
  "Produktivitas kerja setelah mutasi",
  "Kedisiplinan pegawai",
  "Kepatuhan terhadap SPO dan kebijakan unit",
  "Dampak mutasi terhadap pelayanan",
  "Hubungan kerja dengan rekan kerja",
  "Kepuasan terhadap proses mutasi"
];

const tbody = document.getElementById('borangBody');
if (tbody) {
  indikators.forEach((ind, i) => {
    const n   = i + 1;
    const row = document.createElement('tr');
    row.className = `borang-row row-c${n}`;
    let radios = '';
    for (let v = 1; v <= 5; v++) {
      radios += `
        <td style="text-align:center;">
          <div class="radio-group">
            <input type="radio" name="ind${n}" id="ind${n}v${v}" value="${v}" onchange="updateHasil()">
            <label for="ind${n}v${v}">${v}</label>
          </div>
        </td>`;
    }
    row.innerHTML = `
      <td>${n}</td>
      <td><div class="indikator-text">${ind}</div></td>
      ${radios}
      <td><input class="keterangan-input" type="text" placeholder="opsional..." id="ket${n}"></td>`;
    tbody.appendChild(row);
  });
}

// ============================================================
// UPDATE TW
// ============================================================
function updateTW() {
  const sel  = document.getElementById('triwulan');
  const info = document.getElementById('twInfo');
  if (!sel || !info) return;
  const map = {
    'Triwulan I (Jan–Mar)'   : 'Periode Januari s/d Maret 2026',
    'Triwulan II (Apr–Jun)'  : 'Periode April s/d Juni 2026',
    'Triwulan III (Jul–Sep)' : 'Periode Juli s/d September 2026',
    'Triwulan IV (Okt–Des)'  : 'Periode Oktober s/d Desember 2026'
  };
  info.textContent = map[sel.value] || '';
}

// ============================================================
// UPDATE HASIL PENILAIAN
// ============================================================
function updateHasil() {
  let total = 0, count = 0;
  for (let i = 1; i <= 10; i++) {
    const sel = document.querySelector(`input[name="ind${i}"]:checked`);
    if (sel) { total += parseInt(sel.value); count++; }
  }
  const rata = count > 0 ? (total / count).toFixed(2) : null;

  document.getElementById('totalNilai').textContent = count > 0 ? total : '—';
  document.getElementById('nilaiRata').textContent  = rata ? rata.replace('.', ',') : '—';

  const kat = document.getElementById('kategoriHasil');
  if (rata) {
    const r = parseFloat(rata);
    let label, bg, color;
    if      (r >= 4.50) { label='Sangat Baik';   bg='#e8f8f0'; color='#1a7a4a'; }
    else if (r >= 3.50) { label='Baik';           bg='#eaf5fb'; color='#1a6b72'; }
    else if (r >= 2.50) { label='Cukup';          bg='#fef9e7'; color='#b7770d'; }
    else if (r >= 1.50) { label='Kurang';         bg='#fef0e7'; color='#c0692b'; }
    else                { label='Sangat Kurang';  bg='#fdf0ee'; color='#c0392b'; }
    kat.innerHTML = `<span class="kategori-badge" style="background:${bg};color:${color};">${label}</span>`;
  } else {
    kat.innerHTML = '<span style="color:var(--gray-400);font-size:14px;">Belum ada penilaian</span>';
  }

  // Progress bar
  const pegawaiOk    = document.getElementById('namaPegawaiSelect').value !== '';
  const fields       = ['unitAsal','tanggalMutasi','jabatan'];
  const filledFields = fields.filter(f => document.getElementById(f)?.value.trim()).length
                     + (document.getElementById('unitBaruHidden')?.value.trim() ? 1 : 0);
  const progress = Math.round(((filledFields + (pegawaiOk ? 1 : 0)) / (fields.length + 2) * 50) + (count / 10 * 50));
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = progress + '%';
}

['unitAsal','tanggalMutasi','jabatan'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateHasil);
});

// ============================================================
// ALERT
// ============================================================
function showAlert(msg, type = 'error') {
  const box = document.getElementById('alertBox');
  if (!box) return;
  box.textContent = '';
  box.className   = `alert show alert-${type}`;
  const icon = document.createElement('span');
  icon.textContent = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  const text = document.createElement('span');
  text.textContent = msg;
  box.appendChild(icon);
  box.appendChild(text);
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => box.classList.remove('show'), 5000);
}

// ============================================================
// VALIDASI
// ============================================================
function validateForm() {
  const tw = document.getElementById('triwulan');
  if (!tw.value) { showAlert('Mohon pilih Triwulan penilaian terlebih dahulu.', 'error'); tw.focus(); return false; }
  if (!document.getElementById('namaPegawaiSelect').value) { showAlert('Mohon pilih pegawai yang dinilai.', 'error'); return false; }
  if (!document.getElementById('penilaiSelect').value)     { showAlert('Mohon pilih penilai.', 'error'); return false; }

  const required = ['unitAsal','tanggalMutasi','jabatan','tanggalPenilaian'];
  for (const id of required) {
    if (!document.getElementById(id)?.value.trim()) {
      showAlert('Mohon lengkapi semua data identitas dan pengesahan terlebih dahulu.', 'error');
      document.getElementById(id)?.focus();
      return false;
    }
  }
  if (!document.getElementById('unitBaruHidden')?.value.trim()) {
    showAlert('Mohon pilih Unit Kerja Baru terlebih dahulu.', 'error');
    document.getElementById('sdUnitBaruInput')?.focus();
    return false;
  }
  let missing = 0;
  for (let i = 1; i <= 10; i++) {
    if (!document.querySelector(`input[name="ind${i}"]:checked`)) missing++;
  }
  if (missing > 0) { showAlert(`Masih ada ${missing} indikator yang belum diberi nilai.`, 'error'); return false; }
  return true;
}

// ============================================================
// KUMPULKAN DATA FORM
// ============================================================
function collectData() {
  const pegawaiIdx = document.getElementById('namaPegawaiSelect').value;
  const penilaiIdx = document.getElementById('penilaiSelect').value;
  const pegawai    = DAFTAR_PEGAWAI[parseInt(pegawaiIdx)];
  const penilai    = DAFTAR_PEGAWAI[parseInt(penilaiIdx)];

  let nilai = {}, totalNilai = 0;
  for (let i = 1; i <= 10; i++) {
    const el = document.querySelector(`input[name="ind${i}"]:checked`);
    const v  = el ? parseInt(el.value) : 0;
    nilai[`ind${i}`] = v;
    totalNilai += v;
  }
  const rataRata = (totalNilai / 10).toFixed(2);

  return {
    triwulan:         document.getElementById('triwulan').value,
    nama_pegawai:     pegawai ? pegawai.nama : '',
    nip_nik:          document.getElementById('nipnik').value,
    unit_kerja_asal:  document.getElementById('unitAsal').value,
    unit_kerja_baru:  document.getElementById('unitBaruHidden').value || document.getElementById('unitBaru')?.value || '',
    tanggal_mutasi:   document.getElementById('tanggalMutasi').value,
    jabatan_pegawai:  document.getElementById('jabatan').value,
    nama_penilai:     penilai ? penilai.nama : '',
    jabatan_penilai:  document.getElementById('jabatanPenilai').value,
    tanggal_penilaian: document.getElementById('tanggalPenilaian').value,
    nilai_indikator:  nilai,
    total_nilai:      totalNilai,
    rata_rata:        parseFloat(rataRata),
    kesimpulan:       document.getElementById('kesimpulan').value,
    rekomendasi:      document.getElementById('rekomendasi').value,
    penginput:        currentUser ? currentUser.nama : '',
    created_at:       new Date().toISOString()
  };
}

// ============================================================
// SIMPAN KE GOOGLE SHEET
// ============================================================
async function saveToGoogleSheet() {
  const data = collectData();
  console.log('KIRIM KE:', API_URL);
  console.log('DATA:', data);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const text   = await res.text();
    let   result = {};
    try { result = JSON.parse(text); } catch (e) { console.error('Bukan JSON:', text); }

    if (result.success) {
      showAlert('Data berhasil disimpan ke Google Sheet!', 'success');
    } else {
      showAlert('Gagal menyimpan: ' + (result.error || text), 'error');
    }
  } catch (err) {
    console.error('ERROR:', err);
    showAlert('Error saat menyimpan: ' + err.message, 'error');
  }
}

function submitForm() {
  if (!validateForm()) return;
  saveToGoogleSheet();
}

// ============================================================
// RESET FORM
// ============================================================
function resetForm(silent = false) {
  if (!silent && !confirm('Reset semua data? Tindakan ini tidak dapat dibatalkan.')) return;
  document.querySelectorAll('input, textarea').forEach(el => {
    if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
    else if (!el.readOnly) el.value = '';
  });
  document.querySelectorAll('select').forEach(sel => { sel.selectedIndex = 0; });

  // Reset searchable dropdowns
  ['sdPegawai','sdPenilai'].forEach(wrapId => {
    const key = sdGetKey(wrapId);
    if (!key) return;
    const cfg = SD[key];
    document.getElementById(cfg.inputId).value = '';
    document.getElementById(cfg.inputId).classList.remove('sd-selected');
    document.getElementById(cfg.hiddenId).value = '';
    const clr = document.querySelector('#' + wrapId + ' .sd-clear');
    if (clr) clr.classList.remove('visible');
    sdClose(wrapId);
  });

  if (typeof sdUnitBaruClear === 'function') sdUnitBaruClear();

  document.getElementById('nipnik').value        = '';
  document.getElementById('jabatanPenilai').value = '';
  document.getElementById('jabatan').value        = '';

  const pnp  = document.getElementById('printNamaPegawai');  if (pnp)  pnp.textContent  = '—';
  const pnip = document.getElementById('printNipPegawai');   if (pnip) pnip.textContent = '';
  const pnpen = document.getElementById('printNamaPenilai'); if (pnpen) pnpen.textContent = '—';
  const pjpen = document.getElementById('printJabatanPenilai'); if (pjpen) pjpen.textContent = '';

  document.getElementById('totalNilai').textContent  = '—';
  document.getElementById('nilaiRata').textContent   = '—';
  document.getElementById('kategoriHasil').innerHTML = '<span style="color:var(--gray-400);font-size:14px;">Belum ada penilaian</span>';
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = '0%';
  document.getElementById('alertBox')?.classList.remove('show');
  if (typeof clearSignature === 'function') clearSignature();
}

// ============================================================
// GENERATE PDF
// ============================================================
async function generatePDF() {
  if (!validateForm()) return;
  showAlert('Sedang membuat PDF, harap tunggu...', 'info');

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, margin = 15;

    // Header
    doc.setFillColor(21, 34, 64);
    doc.rect(0, 0, W, 28, 'F');
    doc.setTextColor(212, 168, 67);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EVALUASI MUTASI PEGAWAI', W / 2, 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 255);
    doc.text('RSUP FATMAWATI – TAHUN 2026', W / 2, 20, { align: 'center' });

    const data = collectData();
    let y = 38;

    function sectionTitle(title) {
      doc.setFillColor(240, 243, 250);
      doc.rect(margin, y - 4, W - 2 * margin, 10, 'F');
      doc.setTextColor(21, 34, 64);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 3, y + 3);
      y += 12;
    }

    function row(label, value) {
      doc.setTextColor(100, 110, 140);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(label, margin + 2, y);
      doc.setTextColor(21, 34, 64);
      doc.setFont('helvetica', 'bold');
      doc.text(': ' + (value || '-'), margin + 55, y);
      y += 7;
    }

    sectionTitle('A. IDENTITAS PEGAWAI');
    row('Triwulan',       data.triwulan);
    row('Nama Pegawai',   data.nama_pegawai);
    row('NIP / NIK',      data.nip_nik);
    row('Unit Kerja Asal', data.unit_kerja_asal);
    row('Unit Kerja Baru', data.unit_kerja_baru);
    row('Tanggal Mutasi', data.tanggal_mutasi);
    row('Jabatan',        data.jabatan_pegawai);

    y += 4;
    sectionTitle('B. HASIL PENILAIAN');

    doc.setFillColor(21, 34, 64);
    doc.rect(margin, y - 4, W - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('No', margin + 2, y + 1);
    doc.text('Indikator Penilaian', margin + 12, y + 1);
    doc.text('Nilai', margin + W - 2 * margin - 16, y + 1);
    y += 10;

    indikators.forEach((ind, i) => {
      const n = i + 1;
      const v = data.nilai_indikator[`ind${n}`] || 0;
      if (i % 2 === 0) {
        doc.setFillColor(245, 247, 252);
        doc.rect(margin, y - 4, W - 2 * margin, 7, 'F');
      }
      doc.setTextColor(21, 34, 64);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(String(n), margin + 3, y);
      doc.text(ind, margin + 12, y, { maxWidth: 130 });
      doc.setFont('helvetica', 'bold');
      doc.text(String(v), margin + W - 2 * margin - 12, y);
      y += 7;
    });

    y += 4;
    doc.setFillColor(21, 34, 64);
    doc.rect(margin, y, W - 2 * margin, 20, 'F');
    doc.setTextColor(212, 168, 67);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Nilai: ' + data.total_nilai + '   |   Rata-rata: ' + data.rata_rata.toFixed(2).replace('.', ','), margin + 5, y + 8);
    const r   = data.rata_rata;
    const kat = r >= 4.5 ? 'SANGAT BAIK' : r >= 3.5 ? 'BAIK' : r >= 2.5 ? 'CUKUP' : r >= 1.5 ? 'KURANG' : 'SANGAT KURANG';
    doc.setTextColor(240, 200, 74);
    doc.text('Kategori: ' + kat, margin + 5, y + 16);
    y += 28;

    sectionTitle('C. KESIMPULAN & REKOMENDASI');
    doc.setTextColor(100, 110, 140);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Kesimpulan:', margin + 2, y);
    y += 6;
    const kesLines = doc.splitTextToSize(data.kesimpulan || '-', W - 2 * margin - 4);
    doc.setTextColor(21, 34, 64);
    doc.text(kesLines, margin + 2, y);
    y += kesLines.length * 5 + 4;
    doc.setTextColor(100, 110, 140);
    doc.text('Rekomendasi:', margin + 2, y);
    y += 6;
    const rekLines = doc.splitTextToSize(data.rekomendasi || '-', W - 2 * margin - 4);
    doc.setTextColor(21, 34, 64);
    doc.text(rekLines, margin + 2, y);
    y += rekLines.length * 5 + 10;

    sectionTitle('D. PENGESAHAN');
    row('Penilai',  data.nama_penilai);
    row('Jabatan',  data.jabatan_penilai);
    row('Tanggal',  data.tanggal_penilaian);
    y += 10;
    doc.setDrawColor(200, 210, 230);
    doc.rect(W - margin - 60, y, 55, 25);
    doc.setTextColor(130, 150, 180);
    doc.setFontSize(7);
    doc.text('Tanda Tangan', W - margin - 60 + 14, y + 20);
    const ttdDataURL = window.getSignatureDataURL ? window.getSignatureDataURL() : null;
    if (ttdDataURL) doc.addImage(ttdDataURL, 'PNG', W - margin - 60, y, 55, 25);

    // Footer
    doc.setFillColor(240, 243, 250);
    doc.rect(0, 285, W, 12, 'F');
    doc.setTextColor(130, 150, 180);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('RSUP Fatmawati | Sistem Evaluasi Mutasi Pegawai 2026 | Dicetak: ' + new Date().toLocaleDateString('id-ID'), W / 2, 292, { align: 'center' });

    const filename = `Evaluasi_Mutasi_${(data.nama_pegawai || 'Pegawai').replace(/[^a-z0-9]/gi,'_')}_${data.triwulan.replace(/ /g,'')}_2026.pdf`;
    doc.save(filename);
    showAlert('PDF berhasil diunduh: ' + filename, 'success');
  } catch (err) {
    console.error(err);
    showAlert('Gagal membuat PDF: ' + err.message, 'error');
  }
}

// ============================================================
// TANDA TANGAN DIGITAL
// ============================================================
(function() {
  const canvas      = document.getElementById('ttdCanvas');
  const wrap        = document.getElementById('ttdWrap');
  const placeholder = document.getElementById('ttdPlaceholder');
  const status      = document.getElementById('ttdStatus');
  if (!canvas) return;

  let ctx, drawing = false, hasSig = false;
  let penColor = '#0d2340', penSize = 2;
  let lastX = 0, lastY = 0;

  function initCanvas() {
    const rect  = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const w     = Math.max(rect.width  || 300, 300);
    const h     = Math.max(rect.height || 140, 140);
    canvas.width  = w * ratio;
    canvas.height = h * ratio;
    ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth   = penSize;
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x; lastY = pos.y;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing) return;
    const pos = getPos(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth   = penSize;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastX = pos.x; lastY = pos.y;
    if (!hasSig) {
      hasSig = true;
      if (placeholder) placeholder.style.display = 'none';
      wrap?.classList.add('has-sig');
      if (status) { status.textContent = '✓ Sudah ditandatangani'; status.className = 'ttd-status signed'; }
    }
  }

  function stopDraw() { drawing = false; ctx?.beginPath(); }

  canvas.addEventListener('mousedown',  startDraw);
  canvas.addEventListener('mousemove',  draw);
  canvas.addEventListener('mouseup',    stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove',  draw,      { passive: false });
  canvas.addEventListener('touchend',   stopDraw);

  document.querySelectorAll('.ttd-color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.ttd-color-dot').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      penColor = dot.dataset.color;
    });
  });

  document.querySelectorAll('.ttd-thick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ttd-thick-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      penSize = parseInt(btn.dataset.size);
    });
  });

  window.clearSignature = function() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSig = false;
    if (placeholder) placeholder.style.display = 'flex';
    wrap?.classList.remove('has-sig');
    if (status) { status.textContent = 'Belum ditandatangani'; status.className = 'ttd-status'; }
  };

  window.saveSignature = function() {
    if (!hasSig) { alert('Silakan buat tanda tangan terlebih dahulu.'); return; }
    const link = document.createElement('a');
    link.download = 'tanda_tangan.png';
    link.href     = canvas.toDataURL('image/png');
    link.click();
  };

  window.getSignatureDataURL = function() {
    return hasSig ? canvas.toDataURL('image/png') : null;
  };

  window.addEventListener('load', () => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
  });
})();

// ============================================================
// INISIALISASI
// ============================================================
// Set default tanggal hari ini
const tglEl = document.getElementById('tanggalPenilaian');
if (tglEl) {
  tglEl.value = new Date().toISOString().split('T')[0];
  updateTanggalDisplay();
}

// Ekspos fungsi global
window.login         = window.doLogin = doLogin;
window.doLogout      = doLogout;
window.switchLoginTab = switchLoginTab;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('App initialized (Google Apps Script mode)');
  try {
    await loadPegawaiFromGAS();
    if (typeof populatePegawaiDropdown === 'function') populatePegawaiDropdown();
    if (typeof populatePenilaiDropdown === 'function') populatePenilaiDropdown();
    console.log('Pegawai loaded:', DAFTAR_PEGAWAI.length);
  } catch (e) {
    console.error('Init error:', e);
  }
});
