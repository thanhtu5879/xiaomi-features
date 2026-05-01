/* ══════════════════════════════════════════
   XIAOMI FEATURE HUB v5 — app.js
   Tác giả: Trần Thanh Tú · Regional Trainer
══════════════════════════════════════════ */

/* ── CẤU HÌNH ── */
const SHEET_ID       = '1_BpsY4izWhR9xyKww9vRviUIs7icMIfVxeXXZEZePMA';
const GAS_URL        = 'https://script.google.com/macros/s/AKfycby3hM3BcB1vd1tSuSte2He3Qgm52NhxciYN8liP_O8-zcf6mwJygXVE3XSbcRFH1P1V/exec';
const ITEMS_PER_PAGE = 6;
const API = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=`;

/* ── STATE ── */
let features     = [];
let steps        = [];
let trainerData  = {};
let activeFilter = 'all';
let activeDevice = 'all';
let searchQ      = '';
let currentPage  = 1;
let usingDemo    = false;
let currentReportFeature = '';

/* ── CATEGORY MAP ── */
const catMap = {
  'Màn hình' :{ cls:'man-hinh',  icon:'📱' },
  'Camera'   :{ cls:'camera',    icon:'📷' },
  'Pin'      :{ cls:'pin',       icon:'🔋' },
  'Cài đặt'  :{ cls:'cai-dat',   icon:'⚙️'  },
  'Kết nối'  :{ cls:'ket-noi',   icon:'📶' },
  'Hệ thống' :{ cls:'he-thong',  icon:'🖥️'  },
  'Hiệu năng':{ cls:'hieu-nang', icon:'⚡' },
  'Tiện ích' :{ cls:'tien-ich',  icon:'🛠️'  },
  'Khác'     :{ cls:'khac',      icon:'✨' },
};
function getCat(name){ return catMap[name] || { cls:'khac', icon:'✨' }; }

/* ── DỮ LIỆU MẪU ── */
const SAMPLE_FEATURES = [
  { feature_id:'F0001','Tính năng':'Chia đôi màn hình','Danh mục':'Màn hình','Công dụng':'Giúp mở và tương tác 2 ứng dụng cùng lúc.','Lượt tìm kiếm':'21','Dòng sản phẩm áp dụng':'Tất cả','Lưu ý':'RAM > 6GB mới sử dụng được','Status':'active','Created_By':'Tú','Updated_Date':'' },
  { feature_id:'F0002','Tính năng':'Chụp màn hình 3 ngón tay','Danh mục':'Màn hình','Công dụng':'Vuốt 3 ngón tay từ trên xuống để chụp màn hình.','Lượt tìm kiếm':'8','Dòng sản phẩm áp dụng':'Tất cả','Lưu ý':'','Status':'active','Created_By':'','Updated_Date':'' },
  { feature_id:'F0003','Tính năng':'Chụp tài liệu','Danh mục':'Camera','Công dụng':'Chụp ảnh tài liệu, tự động cắt và căn chỉnh gọn.','Lượt tìm kiếm':'16','Dòng sản phẩm áp dụng':'Tất cả','Lưu ý':'','Status':'active','Created_By':'Xuân Đạt','Updated_Date':'' },
  { feature_id:'F0004','Tính năng':'Hiển thị % pin','Danh mục':'Màn hình','Công dụng':'Dễ dàng xem % pin còn lại ở thanh thông báo.','Lượt tìm kiếm':'6','Dòng sản phẩm áp dụng':'Tất cả','Lưu ý':'','Status':'active','Created_By':'','Updated_Date':'' },
  { feature_id:'F0005','Tính năng':'Chạm 2 lần bật tắt màn hình','Danh mục':'Màn hình','Công dụng':'Bật tắt màn hình không cần nút nguồn.','Lượt tìm kiếm':'4','Dòng sản phẩm áp dụng':'Tất cả','Lưu ý':'','Status':'active','Created_By':'','Updated_Date':'' },
  { feature_id:'F0006','Tính năng':'Điều khiển hồng ngoại','Danh mục':'Tiện ích','Công dụng':'Điều khiển TV, máy lạnh qua điện thoại.','Lượt tìm kiếm':'7','Dòng sản phẩm áp dụng':'Tất cả thiết bị Xiaomi có IR','Lưu ý':'Rất hữu ích khi lạc mất remote gốc','Status':'active','Created_By':'','Updated_Date':'' },
];
const SAMPLE_STEPS = [
  { feature_id:'F0001',step_order:'Bước 1','Nội dung':'Nhấn vào giao diện đa nhiệm' },
  { feature_id:'F0001',step_order:'Bước 2','Nội dung':'Nhấn giữ ứng dụng' },
  { feature_id:'F0001',step_order:'Bước 3','Nội dung':'Chọn chia đôi màn hình' },
  { feature_id:'F0001',step_order:'Bước 4','Nội dung':'Chọn ứng dụng thứ 2 muốn mở' },
  { feature_id:'F0002',step_order:'Bước 1','Nội dung':'Vào Cài đặt → Trợ năng' },
  { feature_id:'F0002',step_order:'Bước 2','Nội dung':'Chọn Phím tắt cử chỉ' },
  { feature_id:'F0002',step_order:'Bước 3','Nội dung':'Bật "Chụp màn hình bằng 3 ngón tay"' },
  { feature_id:'F0003',step_order:'Bước 1','Nội dung':'Mở ứng dụng Camera' },
  { feature_id:'F0003',step_order:'Bước 2','Nội dung':'Chọn chế độ Tài liệu' },
  { feature_id:'F0003',step_order:'Bước 3','Nội dung':'Đặt tài liệu phẳng rồi chụp' },
];
const TRAINER_FALLBACK = {
  "Central": { "Central 1": ["Lê Thị Mỹ Hạnh","Nguyễn Đào Như Ngọc"], "Central 2": ["Hồ Vũ Trường","Nguyễn Đào Như Ngọc"] },
  "Central Highland": { "Central Highland 1": ["Nguyễn Thanh Nam","Nguyễn Văn Anh Thiên"], "Central Highland 2": ["Huỳnh Hiếu Tiến","Ngô Hoàng Vương"], "South Central Coast": ["Phan Đăng Bảo","Võ Dương Anh Phúc"] },
  "Ha Noi": { "Ha Noi 1": ["Hồ Xuân Hương","Nguyễn Văn Thành","Nguyễn Xuân Cảnh","Phạm Minh Đại"], "Ha Noi 2": ["Nguyễn Xuân Cảnh","Phạm Minh Đại"], "Ha Noi 3": ["Nguyễn Mạnh Hùng","Nguyễn Văn Thành"] },
  "HCM": { "HCM 1": ["Bùi Huy Hoàng","Nguyễn Văn Nhẩn"], "HCM 2": ["Lê Văn Quốc","Nguyễn Chánh Tâm"], "HCM 3": ["Hoàng Thị Quỳnh Như","Trương Tố Trân"], "HCM 4": ["Hoàng Gia Long","Phạm Chí Phong"] },
  "Mekong North": { "Mekong North 1": ["Lê Tiến Đạt","Phan Thị Hằng","Trần Quốc Trí","Trần Thị Cẩm Tú"], "Mekong North 2": ["Nguyễn Nhật Trường","Trần Thị Cẩm Tú","Trần Thị Mỹ Duyên"] },
  "Mekong South": { "Mekong South 1": ["Lê Đức Huy","Lê Hoàng Phúc","Tô Văn Chông"], "Mekong South 2": ["Hoàng Kim Quy","Nguyễn Thanh Trúc","Phan Thanh Phong"] },
  "North Central Coast": { "North Central Coast 1": ["Đinh Phi Hùng","Lê Thị Trâm"], "North Central Coast 2": ["Tạ Văn Minh","Trịnh Thị Nhung"] },
  "North East": { "North East 1": ["Chu Ngọc Linh","Nguyễn Đăng Lâm"], "North East 2": ["Đỗ Văn Giang","Lê Vũ Đức Thịnh"] },
  "Red River Delta": { "Red River Delta 1": ["Mai Quốc Anh","Phạm Ngọc Khánh"], "Red River Delta 2": ["Bùi Văn Tùng","Lê Thị Giang"] },
  "South East": { "South East 1": ["Mai Thị Gái","Võ Thị Dáng My"], "South East 2": ["Nguyễn Hữu Đức","Nguyễn Khắc Toàn"], "South East 3": ["Nguyễn Tấn Toàn","Nguyễn Thị Minh Thu"], "South East 4": ["Trần Thanh Tú","Võ Thị Dáng My"] }
};

/* ══════════════════════════════════════════
   MODULE 1 — DATA LAYER (fetch sheet)
══════════════════════════════════════════ */
async function fetchSheet(sheetName) {
  const res  = await fetch(API + encodeURIComponent(sheetName));
  const text = await res.text();
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Invalid response');
  const json = JSON.parse(text.substring(start, end + 1));
  if (!json.table) throw new Error('No table');

  const rawCols = (json.table.cols || []).map(c => (c && c.label) ? String(c.label).trim() : '');
  const rows    = json.table.rows || [];
  if (!rows.length) return [];

  const hasRealHeader = rawCols.some(c => c.length > 0);
  let headers, dataRows;

  if (hasRealHeader) {
    headers  = rawCols;
    dataRows = rows;
  } else {
    const seenHeaders = new Set();
    headers = (rows[0].c || []).map(cell => {
      if (!cell || cell.v == null) return '';
      const h = String(cell.v).trim();
      if (seenHeaders.has(h)) return '';
      seenHeaders.add(h);
      return h;
    });
    dataRows = rows.slice(1);
  }

  return dataRows.map(row => {
    const obj = {};
    (row.c || []).forEach((cell, i) => {
      const h = headers[i];
      if (!h) return;
      let val = '';
      if (cell != null) {
        if (cell.v != null) val = cell.v;
        else if (cell.f != null) val = cell.f;
      }
      obj[h] = String(val).trim();
    });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ''));
}

/* ══════════════════════════════════════════
   MODULE 2 — TRAINER
══════════════════════════════════════════ */
async function loadTrainerData() {
  try {
    const rows = await fetchSheet('Trainers');
    if (!rows.length) throw new Error('empty');
    const data = {};
    rows.forEach(r => {
      const region  = r['Region'] || '';
      const sub     = r['Sub_Region'] || r['Sub Regions'] || r['SubRegion'] || '';
      const name    = r['Trainer_Name'] || r['Trainer'] || '';
      const active  = r['Is_Active'] || r['Active'] || 'TRUE';
      if (!region || !sub || !name) return;
      if (active === 'FALSE' || active === 'false' || active === '✗' || active === '0') return;
      if (!data[region]) data[region] = {};
      if (!data[region][sub]) data[region][sub] = [];
      if (!data[region][sub].includes(name)) data[region][sub].push(name);
    });
    if (Object.keys(data).length === 0) throw new Error('no data');
    trainerData = data;
  } catch(e) {
    trainerData = TRAINER_FALLBACK;
  }
  buildRegionDropdown();
}

function buildRegionDropdown() {
  const sel = document.getElementById('modal-region');
  while (sel.options.length > 1) sel.remove(1);
  Object.keys(trainerData).sort().forEach(region => {
    const opt = document.createElement('option');
    opt.value = region; opt.textContent = region;
    sel.appendChild(opt);
  });
}

function onRegionChange() {
  const region = document.getElementById('modal-region').value;
  const subSel = document.getElementById('modal-subregion');
  const trSel  = document.getElementById('modal-trainer');
  subSel.innerHTML = '<option value="">-- Chọn Sub Region --</option>';
  subSel.disabled = !region;
  trSel.innerHTML = '<option value="">-- Chọn Trainer --</option>';
  trSel.disabled = true;
  if (!region) return;
  Object.keys(trainerData[region] || {}).sort().forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub; opt.textContent = sub;
    subSel.appendChild(opt);
  });
}

function onSubRegionChange() {
  const region = document.getElementById('modal-region').value;
  const sub    = document.getElementById('modal-subregion').value;
  const trSel  = document.getElementById('modal-trainer');
  trSel.innerHTML = '<option value="">-- Chọn Trainer --</option>';
  trSel.disabled = !sub;
  if (!region || !sub) return;
  ((trainerData[region] || {})[sub] || []).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    trSel.appendChild(opt);
  });
}

/* ══════════════════════════════════════════
   MODULE 3 — UI RENDER
══════════════════════════════════════════ */
// Chuẩn hoá tiếng Việt — bỏ dấu để tìm kiếm không dấu
function normalize(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim();
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escJS(str) {
  return String(str||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,' ');
}
function fmtDate(val) {
  if (!val || val === 'null' || val === '') return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
  } catch(e) { return ''; }
}

function getSteps(featureId) {
  return steps
    .filter(s => s['feature_id'] === featureId)
    .sort((a,b) => {
      const an = parseInt(String(a['step_order']||'').replace(/\D/g,'')) || 0;
      const bn = parseInt(String(b['step_order']||'').replace(/\D/g,'')) || 0;
      return an - bn;
    });
}

function renderTrending() {
  const container = document.getElementById('trending-tags');
  container.innerHTML = '';
  const withCount = features
    .filter(f => parseInt(f['Lượt tìm kiếm'] || 0) > 0)
    .sort((a,b) => parseInt(b['Lượt tìm kiếm']||0) - parseInt(a['Lượt tìm kiếm']||0))
    .slice(0, 5);
  const list = withCount.length ? withCount : features.slice(0, 5);
  list.forEach(f => {
    const btn = document.createElement('button');
    btn.className   = 'trend-tag';
    btn.textContent = f['Tính năng'];
    btn.onclick = () => applySearch(f['Tính năng']);
    container.appendChild(btn);
  });
}

function render() {
  const q    = searchQ.toLowerCase().trim();
  const nq   = normalize(searchQ);
  const list = features.filter(f => {
    const status = String(f['Status'] || '').toLowerCase().trim();
    if (status === 'archived' || status === 'draft') return false;
    const ten      = String(f['Tính năng'] ||'');
    const congDung = String(f['Công dụng']  ||'');
    const danhMuc  = String(f['Danh mục']   ||'');
    const dongMay  = String(f['Dòng sản phẩm áp dụng'] ||'').toLowerCase();
    const matchQ   = !nq
      || normalize(ten).includes(nq)
      || normalize(congDung).includes(nq)
      || normalize(danhMuc).includes(nq);
    const matchF   = activeFilter === 'all' || f['Danh mục'] === activeFilter;
    const matchD   = activeDevice === 'all' || dongMay.includes('tất cả') || dongMay.includes(activeDevice.toLowerCase());
    return matchQ && matchF && matchD;
  });

  const totalItems = list.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const pageList = list.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);

  const label = (q || activeFilter !== 'all')
    ? `Tìm thấy <strong>${totalItems}</strong> tính năng`
    : `Tổng cộng <strong>${totalItems}</strong> tính năng đang hoạt động`;
  const pageTag = totalPages > 1 ? `<span>Trang ${currentPage} / ${totalPages}</span>` : '';
  document.getElementById('results-info').innerHTML = `<span>${label}</span>${pageTag}`;

  if (!pageList.length) {
    document.getElementById('results').innerHTML =
      `<div class="state-box"><div class="icon">🔍</div><p>Không tìm thấy tính năng phù hợp.<br>Thử từ khoá khác nhé.</p></div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  document.getElementById('results').innerHTML = pageList.map(f => {
    const cat    = getCat(f['Danh mục']);
    const fid    = f['feature_id'] || '';
    const fSteps = getSteps(fid);

    const stepsHTML = fSteps.map((s,i) => {
      const nd = s['Nội dung'] || '';
      return `<div class="step">
        <div class="step-num">${i+1}</div>
        <div class="step-text">${escHtml(nd)}</div>
      </div>`;
    }).join('');

    const noteVal = f['Lưu ý'] || f['Lưu ý/Tên người đóng góp tính năng'] || '';
    const noteHTML = noteVal
      ? `<div class="note-box"><strong style="font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#4A90D9;">Lưu ý</strong><br>${escHtml(noteVal)}</div>` : '';

    const productVal  = f['Dòng sản phẩm áp dụng'] || '';
    const productHTML = (productVal && productVal !== 'Tất cả')
      ? `<div class="product-box">
           <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="#888" stroke-width="1.2"/><path d="M4 6h4M6 4v4" stroke="#888" stroke-width="1.2" stroke-linecap="round"/></svg>
           Áp dụng: <strong>${escHtml(productVal)}</strong>
         </div>` : '';

    const tenTN  = f['Tính năng']  || '';
    const danhMC = f['Danh mục']   || '';
    const congD  = f['Công dụng']  || '';
    const creator = f['Created_By'] || '';
    const creatorBadge = creator ? `<span class="badge-creator">✏️ ${escHtml(creator)}</span>` : '';
    const updatedStr = fmtDate(f['Updated_Date'] || '');
    const updatedBadge = updatedStr ? `<span class="badge-updated">🕐 ${escHtml(updatedStr)}</span>` : '';
    const metaFooterHTML = (creator || updatedStr)
      ? `<div class="meta-footer">
           ${creator ? `<span class="meta-item">✏️ Đóng góp: <strong>${escHtml(creator)}</strong></span>` : ''}
           ${updatedStr ? `<span class="meta-item">🕐 Cập nhật: ${escHtml(updatedStr)}</span>` : ''}
         </div>` : '';

    return `<div class="card" id="card-${escHtml(fid)}">
      <div class="card-header" onclick="toggleCard('${escJS(fid)}','${escJS(tenTN)}')">
        <div class="cat-dot cat-${cat.cls}">${cat.icon}</div>
        <div class="card-info">
          <div class="card-title">${escHtml(tenTN)}</div>
          <div class="card-meta">
            ${danhMC ? `<span class="badge badge-${cat.cls}">${escHtml(danhMC)}</span>` : ''}
            ${creatorBadge}${updatedBadge}
          </div>
          <div class="card-desc">${escHtml(congD)}</div>
        </div>
        <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6l4 4 4-4"/></svg>
      </div>
      <div class="card-body">
        <div class="card-body-inner">
          ${fSteps.length
            ? `<div class="steps-title">Các bước thực hiện</div>${stepsHTML}`
            : '<div style="padding:14px 0 4px;color:#bbb;font-size:13px;">Chưa có hướng dẫn chi tiết.</div>'}
          ${noteHTML}${productHTML}${metaFooterHTML}
          <button class="report-btn" onclick="openModal('${escJS(tenTN)}')">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="6.5" cy="6.5" r="5.5"/><line x1="6.5" y1="4" x2="6.5" y2="7"/><circle cx="6.5" cy="9" r="0.6" fill="currentColor"/>
            </svg>
            Báo lỗi / Góp ý
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const el = document.getElementById('pagination');
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  let html = `<button class="page-btn" ${currentPage===1?'disabled':''} onclick="changePage(${currentPage-1})">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i===1 || i===totalPages || (i>=currentPage-1 && i<=currentPage+1)) {
      html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="changePage(${i})">${i}</button>`;
    } else if (i===currentPage-2 || i===currentPage+2) {
      html += `<span class="page-ellipsis">…</span>`;
    }
  }
  html += `<button class="page-btn" ${currentPage===totalPages?'disabled':''} onclick="changePage(${currentPage+1})">›</button>`;
  el.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  render();
  document.getElementById('filter-bar').scrollIntoView({ behavior:'smooth', block:'start' });
}

function toggleCard(fid, featureName) {
  const card = document.getElementById('card-' + fid);
  if (!card) return;
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.card.open').forEach(c => c.classList.remove('open'));
  if (!wasOpen) {
    card.classList.add('open');
    trackView(featureName);
  }
}

/* ══════════════════════════════════════════
   MODULE 4 — EVENTS & TRACKING
══════════════════════════════════════════ */
function trackView(featureName) {
  if (!featureName || usingDemo || !GAS_URL || GAS_URL.includes('YOUR_')) return;
  fetch(`${GAS_URL}?featureName=${encodeURIComponent(featureName)}`, { method:'GET', mode:'no-cors' }).catch(() => {});
}

function applySearch(val) {
  searchQ = val;
  const heroInput   = document.getElementById('search-input');
  const stickyInput = document.getElementById('sticky-input');
  if (heroInput.value   !== val) heroInput.value   = val;
  if (stickyInput.value !== val) stickyInput.value = val;
  document.getElementById('clear-btn').style.display    = val ? 'block' : 'none';
  document.getElementById('sticky-clear').style.display = val ? 'block' : 'none';
  currentPage = 1;
  render();
}
function clearSearch()       { applySearch(''); }
function clearStickySearch() { applySearch(''); }

function setFilter(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPage = 1;
  render();
}

function setDevice(device, btn) {
  activeDevice = device;
  document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPage = 1;
  render();
}

/* ── MODAL BÁO LỖI ── */
function openModal(featureName) {
  currentReportFeature = featureName;
  document.getElementById('modal-feature-name').textContent = featureName;
  document.getElementById('modal-note').value  = '';
  document.getElementById('modal-model').value = '';
  document.getElementById('modal-pc').value    = '';
  document.getElementById('modal-region').value = '';
  onRegionChange();
  document.getElementById('chk-wrong').checked   = false;
  document.getElementById('chk-notwork').checked = false;
  document.getElementById('modal-form-content').style.display    = 'block';
  document.getElementById('modal-success-content').style.display = 'none';
  document.getElementById('btn-submit-report').disabled = false;
  document.getElementById('btn-submit-report').textContent = 'Gửi báo cáo';
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function submitReport() {
  const wrong   = document.getElementById('chk-wrong').checked;
  const notwork = document.getElementById('chk-notwork').checked;
  const note    = document.getElementById('modal-note').value.trim();
  const model   = document.getElementById('modal-model').value.trim();
  const pc      = document.getElementById('modal-pc').value.trim();
  const region  = document.getElementById('modal-region').value.trim();
  const sub     = document.getElementById('modal-subregion').value.trim();
  const trainer = document.getElementById('modal-trainer').value.trim();

  let hasError = false;
  ['modal-model','modal-pc'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.style.borderColor = '#E53935'; hasError = true; setTimeout(() => el.style.borderColor = '', 2500); }
  });
  ['modal-region','modal-subregion','modal-trainer'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value) { el.style.outline = '2px solid #E53935'; hasError = true; setTimeout(() => el.style.outline = '', 2500); }
  });
  if (!wrong && !notwork && !note) {
    const el = document.getElementById('modal-note');
    el.style.borderColor = '#E53935'; hasError = true;
    setTimeout(() => el.style.borderColor = '', 2500);
  }
  if (hasError) return;

  const btn = document.getElementById('btn-submit-report');
  btn.disabled = true; btn.textContent = 'Đang gửi...';

  const issues = [];
  if (wrong)   issues.push('Thông tin sai hoặc thiếu bước');
  if (notwork) issues.push('Tính năng không hoạt động');

  const params = new URLSearchParams({
    type:'report', featureName:currentReportFeature,
    issues:issues.join('; '), model, pc, region, subregion:sub, trainer, note
  });

  fetch(`${GAS_URL}?${params.toString()}`, { method:'GET', mode:'no-cors' })
    .catch(() => {})
    .finally(() => {
      document.getElementById('modal-form-content').style.display    = 'none';
      document.getElementById('modal-success-content').style.display = 'block';
    });
}

/* ── STICKY SEARCH SETUP ── */
(function setupSticky() {
  const stickyEl = document.getElementById('sticky-search');
  const heroEl   = document.getElementById('hero-section');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => stickyEl.classList.toggle('visible', !entry.isIntersecting),
      { threshold:0, rootMargin:'-56px 0px 0px 0px' }
    ).observe(heroEl);
  } else {
    window.addEventListener('scroll', () => {
      stickyEl.classList.toggle('visible', heroEl.getBoundingClientRect().bottom < 56);
    }, { passive:true });
  }
  document.getElementById('sticky-input').addEventListener('input',   e => applySearch(e.target.value));
  document.getElementById('sticky-input').addEventListener('keydown', e => { if(e.key==='Escape') clearStickySearch(); });
  document.getElementById('sticky-clear').addEventListener('click', clearStickySearch);
})();

document.getElementById('search-input').addEventListener('input',   e => applySearch(e.target.value));
document.getElementById('search-input').addEventListener('keydown', e => { if(e.key==='Escape') clearSearch(); });
document.getElementById('clear-btn').addEventListener('click', clearSearch);

/* ── INIT ── */
async function init() {
  try {
    const [featRes, stepsRes] = await Promise.allSettled([
      fetchSheet('Feature'),
      fetchSheet('Steps')
    ]);
    if (featRes.status === 'fulfilled' && featRes.value.length) {
      features = featRes.value; usingDemo = false;
    } else {
      throw new Error('Feature sheet empty or failed');
    }
    steps = (stepsRes.status === 'fulfilled') ? stepsRes.value : [];
  } catch(e) {
    features = SAMPLE_FEATURES; steps = SAMPLE_STEPS; usingDemo = true;
  }

  if (usingDemo) document.getElementById('demo-banner').classList.add('visible');

  features.forEach((f,i) => {
    if (!f['feature_id'] || !f['feature_id'].trim()) f['feature_id'] = 'AUTO_' + i;
  });

  const activeCount = features.filter(f => {
    const s = String(f['Status'] || '').toLowerCase().trim();
    return s !== 'archived' && s !== 'draft';
  }).length;

  document.getElementById('count-display').textContent =
    activeCount + ' tính năng' + (usingDemo ? ' (mẫu)' : '');

  loadTrainerData();
  renderTrending();
  render();
}

init();
