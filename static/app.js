'use strict';

// ── STATE ────────────────────────────────────────────────────────────
const state = {
    dict: 'bands',
    bands: [],
    songs: [],
    sortCol: '',
    sortDir: 'asc',
    editingId: null,
};

// ── COLUMN CONFIG ─────────────────────────────────────────────────────
const COLS = {
    bands: [
        { key: 'name', label: 'Название', sortable: true },
        { key: 'genre', label: 'Жанр', sortable: true, badge: 'badge-genre' },
        { key: 'country', label: 'Страна', sortable: true, badge: 'badge-country' },
        { key: 'founded_date', label: 'Основана', sortable: true, type: 'date' },
        { key: 'members_count', label: 'Участников', sortable: true, type: 'number' },
        { key: 'description', label: 'Описание', sortable: false, truncate: true },
    ],
    songs: [
        { key: 'title', label: 'Название', sortable: true },
        { key: 'band_name', label: 'Группа', sortable: true, badge: 'badge-genre' },
        { key: 'duration_sec', label: 'Длительность', sortable: true, type: 'duration' },
        { key: 'release_date', label: 'Дата выхода', sortable: true, type: 'date' },
    ],
};

// ── FORM CONFIG ───────────────────────────────────────────────────────
function getBandsForm(data = {}) {
    return `
    <div class="form-group">
      <label class="form-label">Название группы</label>
      <input class="form-input" type="text" id="f-name" placeholder="Например: Metallica" value="${esc(data.name || '')}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Жанр</label>
        <input class="form-input" type="text" id="f-genre" placeholder="Heavy Metal" value="${esc(data.genre || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Страна</label>
        <input class="form-input" type="text" id="f-country" placeholder="США" value="${esc(data.country || '')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Дата основания</label>
        <input class="form-input" type="date" id="f-founded_date" value="${esc(data.founded_date ? isoDate(data.founded_date) : '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Кол-во участников</label>
        <input class="form-input" type="number" id="f-members_count" min="1" max="99" placeholder="4" value="${data.members_count || ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Описание</label>
      <textarea class="form-textarea" id="f-description" placeholder="Краткое описание группы...">${esc(data.description || '')}</textarea>
    </div>`;
}

function getSongsForm(data = {}) {
    const bandsOptions = state.bands
        .map(b => `<option value="${b.id}" ${b.id === (data.band_id) ? 'selected' : ''}>${esc(b.name)}</option>`)
        .join('');
    return `
    <div class="form-group">
      <label class="form-label">Название песни</label>
      <input class="form-input" type="text" id="f-title" placeholder="Например: Enter Sandman" value="${esc(data.title || '')}">
    </div>
    <div class="form-group">
      <label class="form-label">Группа</label>
      <select class="form-select" id="f-band_id">
        <option value="">— выберите группу —</option>
        ${bandsOptions}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Длительность (сек)</label>
        <input class="form-input" type="number" id="f-duration_sec" min="1" max="3600" placeholder="240" value="${data.duration_sec || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Дата выхода</label>
        <input class="form-input" type="date" id="f-release_date" value="${esc(data.release_date ? isoDate(data.release_date) : '')}">
      </div>
    </div>`;
}

// ── API ───────────────────────────────────────────────────────────────
async function api(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
}

async function loadBands() {
    state.bands = await api('GET', '/api/bands');
}

async function loadSongs() {
    state.songs = await api('GET', '/api/songs');
}

// ── RENDER TABLE ──────────────────────────────────────────────────────
function renderTable() {
    const cols = COLS[state.dict];
    const items = sort([...(state.dict === 'bands' ? state.bands : state.songs)]);

    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');
    const empty = document.getElementById('empty-state');
    const loading = document.getElementById('loading');

    loading.style.display = 'none';

    // headers
    thead.innerHTML = '<tr>' +
        cols.map(c => {
            const isSorted = state.sortCol === c.key;
            const arrow = c.sortable ? `<span class="sort-arrow">${isSorted ? (state.sortDir === 'asc' ? '▲' : '▼') : '▲'}</span>` : '';
            return `<th class="${isSorted ? 'sorted' : ''}" data-key="${c.key}" data-sortable="${c.sortable}">${c.label}${arrow}</th>`;
        }).join('') +
        '<th>Действия</th></tr>';

    // rows
    if (!items.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = items.map(row => {
        const cells = cols.map(c => {
            let val = row[c.key];
            if (val === undefined || val === null || val === '') return `<td class="muted">—</td>`;

            if (c.type === 'date') val = formatDate(val);
            if (c.type === 'duration') val = `<span class="duration">${formatDuration(val)}</span>`;
            if (c.type === 'number') val = Number(val).toLocaleString('ru');
            if (c.badge) val = `<span class="badge ${c.badge}">${esc(val)}</span>`;
            if (c.truncate) val = `<span title="${esc(String(val))}">${esc(truncate(String(val), 45))}</span>`;

            return `<td>${val}</td>`;
        }).join('');

        return `<tr>
      ${cells}
      <td>
        <div class="row-actions">
          <button class="action-btn edit" data-id="${row.id}" title="Редактировать">✎</button>
          <button class="action-btn delete" data-id="${row.id}" title="Удалить">✕</button>
        </div>
      </td>
    </tr>`;
    }).join('');

    // sort click
    thead.querySelectorAll('th[data-sortable="true"]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.key;
            if (state.sortCol === key) {
                state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortCol = key;
                state.sortDir = 'asc';
            }
            renderTable();
        });
    });

    // row action clicks
    tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => openEdit(Number(btn.dataset.id)));
    });
    tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => openDelete(Number(btn.dataset.id)));
    });
}

// ── SORT ──────────────────────────────────────────────────────────────
function sort(items) {
    if (!state.sortCol) return items;
    const col = COLS[state.dict].find(c => c.key === state.sortCol);
    return items.sort((a, b) => {
        let va = a[state.sortCol];
        let vb = b[state.sortCol];

        if (col?.type === 'date') {
            va = va ? new Date(va).getTime() : 0;
            vb = vb ? new Date(vb).getTime() : 0;
        } else if (col?.type === 'number' || col?.type === 'duration') {
            va = Number(va) || 0;
            vb = Number(vb) || 0;
        } else {
            va = String(va || '').toLowerCase();
            vb = String(vb || '').toLowerCase();
        }

        if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
        if (va > vb) return state.sortDir === 'asc' ? 1 : -1;
        return 0;
    });
}

// ── MODAL OPEN/CLOSE ──────────────────────────────────────────────────
function openAdd() {
    state.editingId = null;
    document.getElementById('modal-title').textContent =
        state.dict === 'bands' ? 'Добавить группу' : 'Добавить песню';
    document.getElementById('modal-body').innerHTML =
        state.dict === 'bands' ? getBandsForm() : getSongsForm();
    showModal('modal-overlay');
}

function openEdit(id) {
    state.editingId = id;
    const items = state.dict === 'bands' ? state.bands : state.songs;
    const item = items.find(x => x.id === id);
    if (!item) return;

    document.getElementById('modal-title').textContent =
        state.dict === 'bands' ? 'Редактировать группу' : 'Редактировать песню';
    document.getElementById('modal-body').innerHTML =
        state.dict === 'bands' ? getBandsForm(item) : getSongsForm(item);
    showModal('modal-overlay');
}

function openDelete(id) {
    const items = state.dict === 'bands' ? state.bands : state.songs;
    const item = items.find(x => x.id === id);
    if (!item) return;
    const name = item.name || item.title;
    document.getElementById('confirm-text').textContent =
        `Вы уверены, что хотите удалить "${name}"? Это действие нельзя отменить.`;
    document.getElementById('confirm-ok').dataset.id = id;
    showModal('confirm-overlay');
}

function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }

// ── SAVE ──────────────────────────────────────────────────────────────
async function handleSave() {
    let body;
    try {
        body = state.dict === 'bands' ? collectBand() : collectSong();
    } catch (e) {
        showToast(e.message, 'error');
        return;
    }

    try {
        if (state.editingId) {
            await api('PUT', `/api/${state.dict}/${state.editingId}`, body);
            showToast('Изменения сохранены', 'success');
        } else {
            await api('POST', `/api/${state.dict}`, body);
            showToast('Запись добавлена', 'success');
        }
        hideModal('modal-overlay');
        await reload();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function collectBand() {
    const name = document.getElementById('f-name')?.value.trim();
    const genre = document.getElementById('f-genre')?.value.trim();
    const country = document.getElementById('f-country')?.value.trim();
    const founded = document.getElementById('f-founded_date')?.value;
    const members = document.getElementById('f-members_count')?.value;
    const desc = document.getElementById('f-description')?.value.trim();

    if (!name) throw new Error('Введите название группы');
    if (!genre) throw new Error('Введите жанр');
    if (!country) throw new Error('Введите страну');

    return {
        name, genre, country,
        founded_date: founded || null,
        members_count: members ? parseInt(members) : 1,
        description: desc || '',
    };
}

function collectSong() {
    const title = document.getElementById('f-title')?.value.trim();
    const band_id = document.getElementById('f-band_id')?.value;
    const duration = document.getElementById('f-duration_sec')?.value;
    const release = document.getElementById('f-release_date')?.value;

    if (!title) throw new Error('Введите название песни');
    if (!band_id) throw new Error('Выберите группу');

    return {
        title,
        band_id: parseInt(band_id),
        duration_sec: duration ? parseInt(duration) : 0,
        release_date: release || null,
    };
}

// ── DELETE ────────────────────────────────────────────────────────────
async function handleDelete(id) {
    try {
        await api('DELETE', `/api/${state.dict}/${id}`);
        hideModal('confirm-overlay');
        showToast('Запись удалена', 'success');
        await reload();
    } catch (e) {
        hideModal('confirm-overlay');
        showToast(e.message, 'error');
    }
}

// ── RELOAD ────────────────────────────────────────────────────────────
async function reload() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('table-head').innerHTML = '';
    document.getElementById('table-body').innerHTML = '';
    try {
        if (state.dict === 'bands') {
            await loadBands();
        } else {
            await Promise.all([loadBands(), loadSongs()]);
        }
        renderTable();
    } catch (e) {
        document.getElementById('loading').textContent = 'Ошибка загрузки: ' + e.message;
    }
}

// ── HELPERS ───────────────────────────────────────────────────────────
function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function truncate(s, n) {
    return s.length > n ? s.slice(0, n) + '…' : s;
}

function isoDate(val) {
    if (!val) return '';
    return val.slice(0, 10);
}

function formatDate(val) {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d)) return val;
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yy = d.getUTCFullYear();
    return `${dd}.${mm}.${yy}`;
}

function formatDuration(sec) {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ── EVENTS ────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.dict = btn.dataset.dict;
        state.sortCol = '';
        state.sortDir = 'asc';
        reload();
    });
});

document.getElementById('btn-add').addEventListener('click', openAdd);
document.getElementById('modal-close').addEventListener('click', () => hideModal('modal-overlay'));
document.getElementById('modal-cancel').addEventListener('click', () => hideModal('modal-overlay'));
document.getElementById('modal-save').addEventListener('click', handleSave);
document.getElementById('confirm-cancel').addEventListener('click', () => hideModal('confirm-overlay'));
document.getElementById('confirm-ok').addEventListener('click', (e) => handleDelete(Number(e.target.dataset.id)));

document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal('modal-overlay');
});
document.getElementById('confirm-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal('confirm-overlay');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideModal('modal-overlay');
        hideModal('confirm-overlay');
    }
});

// ── INIT ──────────────────────────────────────────────────────────────
reload();