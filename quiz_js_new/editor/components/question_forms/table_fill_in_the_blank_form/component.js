// editor/components/question_forms/table_fill_in_the_blank_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class TabFibFormUtils {
  static escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  static parseOptionalNumber(el) {
    const val = el?.value.trim(); if (!val) return '';
    const n = parseFloat(val); return isNaN(n) ? '' : n;
  }
  static parseTags(el) {
    return (el?.value||'').split(',').map(t=>t.trim()).filter(Boolean);
  }
  static parseAcceptable(str) {
    return (str||'').split(',').map(s=>s.trim()).filter(Boolean);
  }
  static bindFocusPreview(input, preview) {
    if (!input||!preview) return;
    input.addEventListener('focus', ()=>{ preview.innerHTML=input.value; preview.classList.add('visible'); });
    input.addEventListener('input', ()=>{ preview.innerHTML=input.value; });
  }
  static bindCollapsible(header, section) {
    if (!header||!section) return;
    header.addEventListener('click', ()=>section.classList.toggle('open'));
  }
  static uid() { return Math.random().toString(36).slice(2,9); }
}

// ── Question Widget ───────────────────────────────────────────────────────────

class TabFibQuestionWidget {
  constructor(root) { this._root = root; }
  render(q) {
    return `
      <div class="ef-tabfib-field">
        <label class="ef-tabfib-label">Question Text</label>
        <textarea class="ef-tabfib-textarea" id="ef-tabfib-question" rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${TabFibFormUtils.escHtml(q.question||'')}</textarea>
        <div class="ef-tabfib-render-preview" id="ef-tabfib-question-preview"></div>
      </div>`;
  }
  bindEvents() {
    TabFibFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-tabfib-question'),
      this._root.querySelector('#ef-tabfib-question-preview')
    );
  }
  getValue() { return this._root.querySelector('#ef-tabfib-question')?.value.trim()||''; }
}

// ── Media Widget ──────────────────────────────────────────────────────────────

class TabFibMediaWidget {
  constructor(root) { this._root = root; }
  render(q) {
    const imgThumb   = q.img_url ? `<img src="${TabFibFormUtils.escHtml(q.img_url)}" alt="preview" />` : '';
    const imgVisible = q.img_url ? 'ef-tabfib-img-preview visible' : 'ef-tabfib-img-preview';
    return `
      <div class="ef-tabfib-collapsible" id="ef-tabfib-svg-section">
        <div class="ef-tabfib-collapsible-header" id="ef-tabfib-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-tabfib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-tabfib-collapsible-body">
          <textarea class="ef-tabfib-textarea" id="ef-tabfib-svg" rows="3"
            placeholder="Paste SVG code here..."
          >${TabFibFormUtils.escHtml(q.svg_content||'')}</textarea>
          <div class="ef-tabfib-svg-preview" id="ef-tabfib-svg-preview">${q.svg_content||''}</div>
          <button class="ef-tabfib-remove-btn" id="ef-tabfib-svg-remove">Remove SVG</button>
        </div>
      </div>
      <div class="ef-tabfib-collapsible" id="ef-tabfib-img-section">
        <div class="ef-tabfib-collapsible-header" id="ef-tabfib-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-tabfib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-tabfib-collapsible-body">
          <input class="ef-tabfib-input" id="ef-tabfib-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${TabFibFormUtils.escHtml(q.img_url||'')}" />
          <div class="${imgVisible}" id="ef-tabfib-img-preview">${imgThumb}</div>
          <button class="ef-tabfib-remove-btn" id="ef-tabfib-img-remove">Remove Image</button>
        </div>
      </div>`;
  }
  bindEvents() {
    TabFibFormUtils.bindCollapsible(
      this._root.querySelector('#ef-tabfib-svg-toggle'),
      this._root.querySelector('#ef-tabfib-svg-section')
    );
    this._root.querySelector('#ef-tabfib-svg')?.addEventListener('input', e => {
      this._root.querySelector('#ef-tabfib-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-tabfib-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-tabfib-svg').value = '';
      this._root.querySelector('#ef-tabfib-svg-preview').innerHTML = '';
    });
    TabFibFormUtils.bindCollapsible(
      this._root.querySelector('#ef-tabfib-img-toggle'),
      this._root.querySelector('#ef-tabfib-img-section')
    );
    this._root.querySelector('#ef-tabfib-img-url')?.addEventListener('input', e => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-tabfib-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-tabfib-img-url').value = '';
      this._updateImgPreview('');
    });
  }
  getSvg()    { return this._root.querySelector('#ef-tabfib-svg')?.value.trim()||''; }
  getImgUrl() { return this._root.querySelector('#ef-tabfib-img-url')?.value.trim()||''; }
  _updateImgPreview(url) {
    const p = this._root.querySelector('#ef-tabfib-img-preview');
    if (!p) return;
    if (url) { p.innerHTML=`<img src="${TabFibFormUtils.escHtml(url)}" alt="preview" />`; p.classList.add('visible'); }
    else     { p.innerHTML=''; p.classList.remove('visible'); }
  }
}

// ── Cell Editor ───────────────────────────────────────────────────────────────
// Owns the editor panel DOM node completely.
// Constructor receives the stable <div id="ef-tabfib-cell-editor"> element.
// TabFibTableWidget calls open(cell, colLabels, rowLabels) / close().
// Fires custom events 'tabfib-apply' and 'tabfib-cancel' on the el.

class TabFibCellEditor {

  constructor(el) {
    this._el     = el;   // the stable #ef-tabfib-cell-editor div
    this._tab    = 'correct_answer';
    this._buffer = { value:'', correct_answer:'', acceptable_answers:'', hint:'' };
    this._cell   = null;
    this._bindEvents();
  }

  // ── Public API ───────────────────────────────────────

  open(cell, colLabels, rowLabels) {
    this._cell   = cell;
    this._buffer = {
      value:              cell.value              || '',
      correct_answer:     cell.correct_answer     || '',
      acceptable_answers: cell.acceptable_answers || '',
      hint:               cell.hint               || '',
    };
    this._tab    = cell.value ? 'value' : 'correct_answer';
    this._colLabels = colLabels;
    this._rowLabels = rowLabels;
    this._render();
    this._el.classList.remove('hidden');
    this._el.querySelector('.ef-tabfib-ed-input')?.focus();
  }

  close() {
    this._cell = null;
    this._el.innerHTML = '';
    this._el.classList.add('hidden');
  }

  isOpen() { return !this._el.classList.contains('hidden'); }

  getCellId() { return this._cell?.id || null; }

  // ── Render ───────────────────────────────────────────

  _render() {
    const cell     = this._cell;
    const rowLabel = this._rowLabels[cell.row] || `R${cell.row+1}`;
    const colLabel = this._colLabels[cell.col] || `C${cell.col+1}`;
    const hasValue = !!this._buffer.value;

    const TABS = [
      { key:'value',              label:'Value' },
      { key:'correct_answer',     label:'Correct Answer',     dim: hasValue },
      { key:'acceptable_answers', label:'Acceptable Answers', dim: hasValue },
      { key:'hint',               label:'Hint',               dim: hasValue },
    ];

    const tabsHTML = TABS.map(t => `
      <button class="ef-tabfib-ed-tab${this._tab===t.key?' active':''}${t.dim?' dimmed':''}"
              data-tab="${t.key}">${t.label}</button>`).join('');

    const buf = this._buffer;
    let fieldHTML = '';

    if (this._tab === 'value') {
      fieldHTML = `
        <textarea class="ef-tabfib-ed-textarea ef-tabfib-ed-input" rows="3"
          placeholder="Static value (HTML/MathML) — leave empty to make a blank"
        >${TabFibFormUtils.escHtml(buf.value)}</textarea>
        <div class="ef-tabfib-render-preview ef-tabfib-ed-preview${buf.value?' visible':''}">${buf.value}</div>`;
    } else if (this._tab === 'correct_answer') {
      fieldHTML = `
        ${hasValue?'<div class="ef-tabfib-ed-dim-note">Applies only when Value is empty (blank cell).</div>':''}
        <input class="ef-tabfib-ed-input-text ef-tabfib-ed-input" type="text"
          placeholder="Correct answer"
          value="${TabFibFormUtils.escHtml(buf.correct_answer)}" />
        <div class="ef-tabfib-render-preview ef-tabfib-ed-preview${buf.correct_answer?' visible':''}">${buf.correct_answer}</div>`;
    } else if (this._tab === 'acceptable_answers') {
      fieldHTML = `
        ${hasValue?'<div class="ef-tabfib-ed-dim-note">Applies only when Value is empty (blank cell).</div>':''}
        <input class="ef-tabfib-ed-input-text ef-tabfib-ed-input" type="text"
          placeholder="e.g. two, 2, deux"
          value="${TabFibFormUtils.escHtml(buf.acceptable_answers)}" />
        <div class="ef-tabfib-ed-hint">Comma-separated. Each treated as exact match.</div>`;
    } else {
      fieldHTML = `
        ${hasValue?'<div class="ef-tabfib-ed-dim-note">Applies only when Value is empty (blank cell).</div>':''}
        <input class="ef-tabfib-ed-input-text ef-tabfib-ed-input" type="text"
          placeholder="Hint shown to student (HTML/MathML supported)"
          value="${TabFibFormUtils.escHtml(buf.hint)}" />
        <div class="ef-tabfib-render-preview ef-tabfib-ed-preview${buf.hint?' visible':''}">${buf.hint}</div>`;
    }

    this._el.innerHTML = `
      <div class="ef-tabfib-ed-header">
        <span class="ef-tabfib-ed-title">Editing: ${rowLabel} / ${colLabel}</span>
        <button class="ef-tabfib-ed-close" data-action="cancel" title="Cancel">✕</button>
      </div>
      <div class="ef-tabfib-ed-tabs">${tabsHTML}</div>
      <div class="ef-tabfib-ed-body">${fieldHTML}</div>
      <div class="ef-tabfib-ed-footer">
        <button class="ef-tabfib-ed-apply" data-action="apply">Apply</button>
        <button class="ef-tabfib-ed-cancel-btn" data-action="cancel">Cancel</button>
      </div>`;
  }

  // ── Flush active input to buffer ──────────────────────

  _flush() {
    const input = this._el.querySelector('.ef-tabfib-ed-input');
    if (!input) return;
    this._buffer[this._tab] = input.value;
  }

  // ── Events — bound once on this._el ──────────────────

  _bindEvents() {
    this._el.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab]');
      if (tab) { this._switchTab(tab.dataset.tab); return; }
      const action = e.target.closest('[data-action]')?.dataset?.action;
      if (action === 'apply')  { this._doApply();  return; }
      if (action === 'cancel') { this._doCancel(); return; }
    });

    this._el.addEventListener('input', e => {
      const input = e.target.closest('.ef-tabfib-ed-input');
      if (!input) return;
      const val = input.value;
      this._buffer[this._tab] = val;
      if (this._tab !== 'acceptable_answers') {
        const preview = this._el.querySelector('.ef-tabfib-ed-preview');
        if (preview) { preview.innerHTML = val; preview.classList.toggle('visible', val.length > 0); }
      }
    });
  }

  _switchTab(tab) {
    this._flush();
    this._tab = tab;
    this._render();
    this._el.querySelector('.ef-tabfib-ed-input')?.focus();
  }

  _doApply() {
    this._flush();
    this._el.dispatchEvent(new CustomEvent('tabfib-apply', {
      bubbles: true,
      detail: {
        cellId:             this._cell.id,
        value:              this._buffer.value,
        correct_answer:     this._buffer.correct_answer,
        acceptable_answers: this._buffer.acceptable_answers,
        hint:               this._buffer.hint,
      }
    }));
  }

  _doCancel() {
    this._el.dispatchEvent(new CustomEvent('tabfib-cancel', { bubbles: true }));
  }

}

// ── Table Widget ──────────────────────────────────────────────────────────────
// Owns: column count, table HTML, + Add Cell, cell list, drag-swap.
// Has a TabFibCellEditor instance for the editor panel.
// All rendering is DOM-direct — no innerHTML on stable containers.

class TabFibTableWidget {

  constructor(root) {
    this._root      = root;
    this._cols      = 3;
    this._colLabels = ['C1','C2','C3'];
    this._rowLabels = [];
    this._cells     = [];
    this._dragSrcId = null;
    this._editor    = null; // set in bindEvents after DOM exists
  }

  // ── Init from question ────────────────────────────────

  init(q) {
    const colLabels = q.column_labels || [];
    const rowLabels = q.row_labels    || [];
    const data      = q.data          || [];

    this._cols      = colLabels.length || 3;
    this._colLabels = colLabels.length ? [...colLabels] : Array.from({length:this._cols},(_,i)=>`C${i+1}`);
    this._rowLabels = [...rowLabels];
    this._cells     = [];

    data.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (ci >= this._cols) return;
        this._cells.push({
          id:                 TabFibFormUtils.uid(),
          row:                ri,
          col:                ci,
          value:              cell.value === '____' ? '' : (cell.value||''),
          correct_answer:     cell.correct_answer     || '',
          acceptable_answers: Array.isArray(cell.acceptable_answers)
                                ? cell.acceptable_answers.join(', ')
                                : (cell.acceptable_answers||''),
          hint:               cell.hint || '',
        });
      });
    });
  }

  // ── Render (returns HTML string for initial mount) ────

  render(q, scoringMethod, caseSensitive) {
    return `
      <div class="ef-tabfib-field">
        <label class="ef-tabfib-label">Table Title <span class="ef-tabfib-optional">(optional)</span></label>
        <input class="ef-tabfib-input" id="ef-tabfib-title" type="text"
          placeholder="e.g. Complete the Multiplication Table"
          value="${TabFibFormUtils.escHtml(q.title||'')}" />
      </div>

      <div class="ef-tabfib-field">
        <label class="ef-tabfib-label">Number of Columns</label>
        <div class="ef-tabfib-cols-row">
          <input class="ef-tabfib-input ef-tabfib-cols-input" id="ef-tabfib-col-count"
            type="number" min="1" max="10" step="1" value="${this._cols}" />
          <button class="ef-tabfib-apply-btn" id="ef-tabfib-apply-cols">Apply</button>
        </div>
        <div class="ef-tabfib-cols-warning hidden" id="ef-tabfib-cols-warning">
          ⚠ Changing columns will remove all cells. Continue?
          <button class="ef-tabfib-warn-yes" id="ef-tabfib-cols-yes">Yes, reset</button>
          <button class="ef-tabfib-warn-no"  id="ef-tabfib-cols-no">Cancel</button>
        </div>
      </div>

      <div class="ef-tabfib-field" id="ef-tabfib-table-section">
        <label class="ef-tabfib-label">Table</label>
        <div id="ef-tabfib-table-host">${this._tableHTML()}</div>
        <button class="ef-tabfib-add-cell-btn" id="ef-tabfib-add-cell">+ Add Cell</button>
      </div>

      <div class="ef-tabfib-cell-editor hidden" id="ef-tabfib-cell-editor"></div>

      <div class="ef-tabfib-field">
        <label class="ef-tabfib-label">Scoring Method</label>
        <select class="ef-tabfib-select" id="ef-tabfib-scoring-method">
          <option value="exact"   ${scoringMethod==='exact'  ?'selected':''}>Exact — all blanks must be correct</option>
          <option value="partial" ${scoringMethod==='partial'?'selected':''}>Partial — credit per correct blank</option>
        </select>
      </div>

      <div class="ef-tabfib-field">
        <label class="ef-tabfib-checkbox-label">
          <input type="checkbox" class="ef-tabfib-checkbox" id="ef-tabfib-case-sensitive"
            ${caseSensitive?'checked':''} />
          Case sensitive answers
        </label>
      </div>

      <div class="ef-tabfib-error" id="ef-tabfib-error"></div>`;
  }

  // ── Table HTML ────────────────────────────────────────

  _tableHTML() {
    if (!this._cols) return '<div class="ef-tabfib-no-cols">Set number of columns first.</div>';

    const total   = this._cells.length;
    const lastCell = this._cells[total-1] || null;
    const nextRow  = Math.floor(total / this._cols);
    const nextCol  = total % this._cols;
    const totalRows = nextRow + 1; // always show at least one data row

    let h = `<div class="ef-tabfib-table-wrap"><table class="ef-tabfib-table">`;

    // thead
    h += `<thead><tr><th class="ef-tabfib-th ef-tabfib-corner"></th>`;
    for (let ci = 0; ci < this._cols; ci++) {
      h += `<th class="ef-tabfib-th">
        <input class="ef-tabfib-col-label-input" type="text"
          data-col="${ci}" placeholder="C${ci+1}"
          value="${TabFibFormUtils.escHtml(this._colLabels[ci]||`C${ci+1}`)}" />
      </th>`;
    }
    h += `</tr></thead><tbody>`;

    // tbody
    for (let ri = 0; ri < totalRows; ri++) {
      h += `<tr>
        <td class="ef-tabfib-th">
          <input class="ef-tabfib-row-label-input" type="text"
            data-row="${ri}" placeholder="R${ri+1}"
            value="${TabFibFormUtils.escHtml(this._rowLabels[ri]||`R${ri+1}`)}" />
        </td>`;
      for (let ci = 0; ci < this._cols; ci++) {
        const cell = this._cells.find(c => c.row===ri && c.col===ci);
        if (cell) {
          const isLast    = cell.id === lastCell?.id;
          const isEditing = this._editor?.getCellId() === cell.id;
          const isBlank   = !cell.value;
          const preview   = cell.value
            ? `<span class="ef-tabfib-cell-val">${cell.value}</span>`
            : `<span class="ef-tabfib-cell-blank-indicator">____</span>`;
          h += `<td class="ef-tabfib-td${isBlank?' ef-tabfib-td-blank':''}${isEditing?' ef-tabfib-td-editing':''}"
                    data-cell-id="${cell.id}" draggable="true">
            <div class="ef-tabfib-td-inner">
              ${preview}
              ${isLast?`<button class="ef-tabfib-cell-del" title="Delete">✕</button>`:''}
            </div>
          </td>`;
        } else if (ri === nextRow && ci === nextCol) {
          h += `<td class="ef-tabfib-td ef-tabfib-td-add-slot"><span>+</span></td>`;
        } else {
          h += `<td class="ef-tabfib-td ef-tabfib-td-empty"></td>`;
        }
      }
      h += `</tr>`;
    }
    h += `</tbody></table></div>`;
    return h;
  }

  // ── Bind events — called ONCE after DOM mount ─────────

  bindEvents() {
    // Create editor instance pointing at its stable DOM node
    const editorEl = this._root.querySelector('#ef-tabfib-cell-editor');
    this._editor   = new TabFibCellEditor(editorEl);

    // Listen for editor events (bubble up from editorEl through root)
    this._root.addEventListener('tabfib-apply',  e => this._onEditorApply(e.detail));
    this._root.addEventListener('tabfib-cancel', () => this._onEditorCancel());

    // Column count
    this._root.querySelector('#ef-tabfib-apply-cols')?.addEventListener('click', () => {
      const n       = parseInt(this._root.querySelector('#ef-tabfib-col-count')?.value)||1;
      const warning = this._root.querySelector('#ef-tabfib-cols-warning');
      if (n === this._cols) return;
      if (this._cells.length > 0) {
        if (warning) { warning.classList.remove('hidden'); warning._pending = n; }
      } else {
        this._applyCols(n);
      }
    });
    this._root.querySelector('#ef-tabfib-cols-yes')?.addEventListener('click', () => {
      const warning = this._root.querySelector('#ef-tabfib-cols-warning');
      const n = warning?._pending || 1;
      warning?.classList.add('hidden');
      this._applyCols(n);
    });
    this._root.querySelector('#ef-tabfib-cols-no')?.addEventListener('click', () => {
      this._root.querySelector('#ef-tabfib-cols-warning')?.classList.add('hidden');
      const inp = this._root.querySelector('#ef-tabfib-col-count');
      if (inp) inp.value = this._cols;
    });

    // Add cell button
    this._root.querySelector('#ef-tabfib-add-cell')?.addEventListener('click', () => {
      this._addCell();
    });

    // Table host — delegated clicks + drag
    const host = this._root.querySelector('#ef-tabfib-table-host');
    if (!host) return;

    host.addEventListener('click', e => {
      if (e.target.closest('.ef-tabfib-cell-del')) { this._deleteLastCell(); return; }
      const td = e.target.closest('td[data-cell-id]');
      if (td) { this._openCell(td.dataset.cellId); return; }
    });

    host.addEventListener('input', e => {
      if (e.target.classList.contains('ef-tabfib-col-label-input')) {
        this._colLabels[parseInt(e.target.dataset.col)] = e.target.value;
        if (this._editor?.isOpen()) this._refreshEditorTitle();
      }
      if (e.target.classList.contains('ef-tabfib-row-label-input')) {
        this._rowLabels[parseInt(e.target.dataset.row)] = e.target.value;
        if (this._editor?.isOpen()) this._refreshEditorTitle();
      }
    });

    host.addEventListener('dragstart', e => {
      const td = e.target.closest('td[data-cell-id]');
      if (!td) return;
      this._dragSrcId = td.dataset.cellId;
      td.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    host.addEventListener('dragend', () => {
      host.querySelectorAll('td[data-cell-id]')
        .forEach(td => td.classList.remove('dragging','drag-over'));
      this._dragSrcId = null;
    });
    host.addEventListener('dragover', e => {
      e.preventDefault();
      const td = e.target.closest('td[data-cell-id]');
      if (td && td.dataset.cellId !== this._dragSrcId) {
        host.querySelectorAll('td[data-cell-id]').forEach(t => t.classList.remove('drag-over'));
        td.classList.add('drag-over');
      }
    });
    host.addEventListener('drop', e => {
      e.preventDefault();
      const td = e.target.closest('td[data-cell-id]');
      if (!td) return;
      td.classList.remove('drag-over');
      if (this._dragSrcId && this._dragSrcId !== td.dataset.cellId)
        this._swapCells(this._dragSrcId, td.dataset.cellId);
    });
  }

  // ── Editor events ─────────────────────────────────────

  _onEditorApply(detail) {
    const cell = this._cells.find(c => c.id === detail.cellId);
    if (cell) {
      cell.value              = detail.value;
      cell.correct_answer     = detail.correct_answer;
      cell.acceptable_answers = detail.acceptable_answers;
      cell.hint               = detail.hint;
    }
    this._editor.close();
    this._rerenderTable();
  }

  _onEditorCancel() {
    this._editor.close();
    this._rerenderTable();
  }

  // ── Open cell in editor ───────────────────────────────

  _openCell(cellId) {
    const cell = this._cells.find(c => c.id === cellId);
    if (!cell) return;
    // auto-apply any open edit first
    if (this._editor.isOpen()) {
      const prev = this._cells.find(c => c.id === this._editor.getCellId());
      // just close without applying — user clicked a different cell
      this._editor.close();
    }
    this._editor.open(cell, this._colLabels, this._rowLabels);
    // highlight selected cell
    this._root.querySelectorAll('td[data-cell-id]')
      .forEach(td => td.classList.toggle('ef-tabfib-td-editing', td.dataset.cellId === cellId));
  }

  _refreshEditorTitle() {
    const id   = this._editor.getCellId();
    const cell = this._cells.find(c => c.id === id);
    if (!cell) return;
    const title = this._root.querySelector('.ef-tabfib-ed-title');
    if (title) {
      title.textContent = `Editing: ${this._rowLabels[cell.row]||`R${cell.row+1}`} / ${this._colLabels[cell.col]||`C${cell.col+1}`}`;
    }
  }

  // ── Add / delete cells ────────────────────────────────

  _addCell() {
    const total = this._cells.length;
    const row   = Math.floor(total / this._cols);
    const col   = total % this._cols;
    if (!this._rowLabels[row]) this._rowLabels[row] = `R${row+1}`;
    const cell = { id: TabFibFormUtils.uid(), row, col, value:'', correct_answer:'', acceptable_answers:'', hint:'' };
    this._cells.push(cell);
    this._rerenderTable();
    this._openCell(cell.id);
  }

  _deleteLastCell() {
    if (!this._cells.length) return;
    const last = this._cells[this._cells.length-1];
    if (this._editor.getCellId() === last.id) this._editor.close();
    if (last.col === 0) this._rowLabels.splice(last.row, 1);
    this._cells.pop();
    this._rerenderTable();
  }

  // ── Swap cells ────────────────────────────────────────

  _swapCells(fromId, toId) {
    const a = this._cells.find(c => c.id===fromId);
    const b = this._cells.find(c => c.id===toId);
    if (!a||!b) return;
    const tmp = { value:a.value, correct_answer:a.correct_answer, acceptable_answers:a.acceptable_answers, hint:a.hint };
    a.value=b.value; a.correct_answer=b.correct_answer; a.acceptable_answers=b.acceptable_answers; a.hint=b.hint;
    b.value=tmp.value; b.correct_answer=tmp.correct_answer; b.acceptable_answers=tmp.acceptable_answers; b.hint=tmp.hint;
    this._rerenderTable();
  }

  // ── Apply cols reset ──────────────────────────────────

  _applyCols(n) {
    this._cols      = Math.max(1, Math.min(10, n));
    this._colLabels = Array.from({length:this._cols}, (_,i) => `C${i+1}`);
    this._rowLabels = [];
    this._cells     = [];
    if (this._editor) this._editor.close();
    this._rerenderTable();
  }

  // ── Re-render table — replaces only #ef-tabfib-table-host innerHTML ──

  _rerenderTable() {
    const host = this._root.querySelector('#ef-tabfib-table-host');
    if (host) host.innerHTML = this._tableHTML();
  }

  // ── Serialise ─────────────────────────────────────────

  getData() {
    if (this._editor?.isOpen()) {
      // flush editor silently
      const cellId = this._editor.getCellId();
      this._editor.close();
      this._rerenderTable();
    }
    const rowCount      = this._rowLabels.length;
    const column_labels = this._colLabels.slice(0, this._cols);
    const row_labels    = this._rowLabels.slice(0, rowCount);
    const data          = [];
    for (let ri = 0; ri < rowCount; ri++) {
      data[ri] = [];
      for (let ci = 0; ci < this._cols; ci++) {
        const cell = this._cells.find(c => c.row===ri && c.col===ci);
        if (!cell || (!cell.value && !cell.correct_answer)) {
          data[ri][ci] = { value:'' };
        } else if (!cell.value) {
          const out = { value:'____', correct_answer: cell.correct_answer,
            acceptable_answers: TabFibFormUtils.parseAcceptable(cell.acceptable_answers) };
          if (cell.hint) out.hint = cell.hint;
          data[ri][ci] = out;
        } else {
          data[ri][ci] = { value: cell.value };
        }
      }
    }
    return {
      title:          this._root.querySelector('#ef-tabfib-title')?.value.trim()||'',
      column_labels, row_labels, data,
      scoring_method: this._root.querySelector('#ef-tabfib-scoring-method')?.value||'exact',
      case_sensitive: this._root.querySelector('#ef-tabfib-case-sensitive')?.checked||false,
    };
  }

  getBlankCount() { return this._cells.filter(c => !c.value).length; }

  showError(msg) {
    const el = this._root.querySelector('#ef-tabfib-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────

class TabFibMetadataWidget {
  constructor(root) { this._root = root; }
  render(q) {
    const diff = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty===d?'selected':''}>${d}</option>`).join('');
    return `
      <div class="ef-tabfib-field">
        <label class="ef-tabfib-label">Explanation <span class="ef-tabfib-optional">(optional)</span></label>
        <textarea class="ef-tabfib-textarea" id="ef-tabfib-explanation" rows="2"
          placeholder="Explanation (HTML/MathML supported)"
        >${TabFibFormUtils.escHtml(q.explanation||'')}</textarea>
        <div class="ef-tabfib-render-preview" id="ef-tabfib-explanation-preview"></div>
      </div>
      <div class="ef-tabfib-field">
        <label class="ef-tabfib-label">Difficulty</label>
        <select class="ef-tabfib-select" id="ef-tabfib-difficulty">${diff}</select>
      </div>
      <div class="ef-tabfib-row-2">
        <div class="ef-tabfib-field">
          <label class="ef-tabfib-label">Points <span class="ef-tabfib-optional">(optional)</span></label>
          <input class="ef-tabfib-input" id="ef-tabfib-points" type="number" min="0" step="0.5"
            placeholder="e.g. 1" value="${q.points!=null&&q.points!==''?q.points:''}" />
        </div>
        <div class="ef-tabfib-field">
          <label class="ef-tabfib-label">Time Limit (sec) <span class="ef-tabfib-optional">(optional)</span></label>
          <input class="ef-tabfib-input" id="ef-tabfib-time-limit" type="number" min="0" step="1"
            placeholder="e.g. 30" value="${q.time_limit!=null&&q.time_limit!==''?q.time_limit:''}" />
        </div>
      </div>
      <div class="ef-tabfib-field">
        <label class="ef-tabfib-label">Tags <span class="ef-tabfib-optional">(comma separated)</span></label>
        <input class="ef-tabfib-input" id="ef-tabfib-tags" type="text"
          placeholder="e.g. math, multiplication"
          value="${Array.isArray(q.tags)?q.tags.join(', '):(q.tags||'')}" />
      </div>`;
  }
  bindEvents() {
    TabFibFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-tabfib-explanation'),
      this._root.querySelector('#ef-tabfib-explanation-preview')
    );
  }
  getData() {
    return {
      explanation: this._root.querySelector('#ef-tabfib-explanation')?.value.trim()||'',
      difficulty:  this._root.querySelector('#ef-tabfib-difficulty')?.value||'easy',
      points:      TabFibFormUtils.parseOptionalNumber(this._root.querySelector('#ef-tabfib-points')),
      time_limit:  TabFibFormUtils.parseOptionalNumber(this._root.querySelector('#ef-tabfib-time-limit')),
      tags:        TabFibFormUtils.parseTags(this._root.querySelector('#ef-tabfib-tags')),
    };
  }
}

// ── Form Component ────────────────────────────────────────────────────────────

class TabFibFormComponent extends HTMLElement {

  connectedCallback() {
    this._question = null;
    this._index    = -1;
    this._render();
    this._bindAll();
  }

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._render();
    this._bindAll();
  }

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('table_fill_in_the_blank');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(isSkip ? (q.original_type||'table_fill_in_the_blank') : q.type);
    const typeLabel  = typeConf ? typeConf.label : 'Table Fill Blank';
    const bodyClass  = isSkip ? 'ef-tabfib-body ef-tabfib-is-skip' : 'ef-tabfib-body';
    const skipLabel  = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    // build widget models before innerHTML (they only store data)
    this._tableWidget = new TabFibTableWidget(this);
    this._tableWidget.init(q);

    const qW     = new TabFibQuestionWidget(this);
    const mW     = new TabFibMediaWidget(this);
    const metaW  = new TabFibMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-tabfib-form">
        <div class="${bodyClass}" id="ef-tabfib-body">
          ${qW.render(q)}
          ${mW.render(q)}
          ${this._tableWidget.render(q, q.scoring_method||'exact', !!q.case_sensitive)}
          ${metaW.render(q)}
        </div>
        <div class="ef-tabfib-footer">
          <button class="ef-tabfib-btn-save" id="ef-tabfib-btn-save">Save</button>
          <button class="ef-tabfib-btn-skip" id="ef-tabfib-btn-skip">${skipLabel}</button>
        </div>
      </div>`;
  }

  _bindAll() {
    this._qWidget     = new TabFibQuestionWidget(this);
    this._mediaWidget = new TabFibMediaWidget(this);
    this._metaWidget  = new TabFibMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._tableWidget.bindEvents();  // creates TabFibCellEditor, wires all table events
    this._metaWidget.bindEvents();
    this._bindFooter();
  }

  _bindFooter() {
    this.querySelector('#ef-tabfib-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-tabfib-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const q        = this._question;
    const isSkip   = q.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(isSkip ? (q.original_type||'table_fill_in_the_blank') : q.type);
    const typeLabel = typeConf ? typeConf.label : 'Table Fill Blank';
    const body = this.querySelector('#ef-tabfib-body');
    const btn  = this.querySelector('#ef-tabfib-btn-skip');
    if (isSkip) {
      q.type = q.original_type || 'table_fill_in_the_blank';
      delete q.original_type;
      body.classList.remove('ef-tabfib-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      q.original_type = q.type;
      q.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-tabfib-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  _handleSave() {
    this._tableWidget.showError('');
    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._tableWidget.showError('Question text is required.');
      this.querySelector('#ef-tabfib-question')?.focus();
      return;
    }
    if (this._tableWidget._cells.length === 0) {
      this._tableWidget.showError('Add at least one cell.');
      return;
    }
    if (this._tableWidget.getBlankCount() === 0) {
      this._tableWidget.showError('At least one blank cell (empty value) with a correct answer is required.');
      return;
    }
    const tableData = this._tableWidget.getData();
    const saved = {
      type:           this._question?.type || 'table_fill_in_the_blank',
      question:       questionText,
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      title:          tableData.title,
      column_labels:  tableData.column_labels,
      row_labels:     tableData.row_labels,
      data:           tableData.data,
      user_response:  tableData.data.map(row => row.map(cell => cell.value === '____' ? '' : (cell.value || ''))),
      scoring_method: tableData.scoring_method,
      case_sensitive: tableData.case_sensitive,
      ...this._metaWidget.getData(),
    };
    if (this._question?.original_type) saved.original_type = this._question.original_type;
    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved },
    }));
  }

}

customElements.define('table-fill-in-the-blank-form', TabFibFormComponent);