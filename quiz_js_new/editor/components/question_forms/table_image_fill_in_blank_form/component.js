// editor/components/question_forms/table_image_fill_in_blank_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class TIFibFormUtils {
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
  static parseAnswers(str) {
    return (str||'').split(',').map(s=>s.trim()).filter(Boolean);
  }
}

// ── Question Widget ───────────────────────────────────────────────────────────

class TIFibQuestionWidget {
  constructor(root) { this._root = root; }
  render(q) {
    return `
      <div class="ef-tifib-field">
        <label class="ef-tifib-label">Question Text</label>
        <textarea class="ef-tifib-textarea" id="ef-tifib-question" rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${TIFibFormUtils.escHtml(q.question||'')}</textarea>
        <div class="ef-tifib-render-preview" id="ef-tifib-question-preview"></div>
      </div>`;
  }
  bindEvents() {
    TIFibFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-tifib-question'),
      this._root.querySelector('#ef-tifib-question-preview')
    );
  }
  getValue() { return this._root.querySelector('#ef-tifib-question')?.value.trim()||''; }
}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Image URL is the PRIMARY field (first, always visible). SVG is collapsible.

class TIFibMediaWidget {
  constructor(root) { this._root = root; }

  render(q) {
    const imgThumb   = q.img_url ? `<img src="${TIFibFormUtils.escHtml(q.img_url)}" alt="preview" />` : '';
    const imgVisible = q.img_url ? 'ef-tifib-img-preview visible' : 'ef-tifib-img-preview';
    return `
      <div class="ef-tifib-collapsible" id="ef-tifib-img-section">
        <div class="ef-tifib-collapsible-header" id="ef-tifib-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-tifib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-tifib-collapsible-body">
          <input class="ef-tifib-input" id="ef-tifib-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${TIFibFormUtils.escHtml(q.img_url||'')}" />
          <div class="${imgVisible}" id="ef-tifib-img-preview">${imgThumb}</div>
          <button class="ef-tifib-remove-btn" id="ef-tifib-img-remove">Remove Image</button>
        </div>
      </div>

      <div class="ef-tifib-collapsible" id="ef-tifib-svg-section">
        <div class="ef-tifib-collapsible-header" id="ef-tifib-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-tifib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-tifib-collapsible-body">
          <textarea class="ef-tifib-textarea" id="ef-tifib-svg" rows="3"
            placeholder="Paste SVG code here..."
          >${TIFibFormUtils.escHtml(q.svg_content||'')}</textarea>
          <div class="ef-tifib-svg-preview" id="ef-tifib-svg-preview">${q.svg_content||''}</div>
          <button class="ef-tifib-remove-btn" id="ef-tifib-svg-remove">Remove SVG</button>
        </div>
      </div>`;
  }

  bindEvents() {
    TIFibFormUtils.bindCollapsible(
      this._root.querySelector('#ef-tifib-img-toggle'),
      this._root.querySelector('#ef-tifib-img-section')
    );
    this._root.querySelector('#ef-tifib-img-url')?.addEventListener('input', e => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-tifib-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-tifib-img-url').value = '';
      this._updateImgPreview('');
    });
    TIFibFormUtils.bindCollapsible(
      this._root.querySelector('#ef-tifib-svg-toggle'),
      this._root.querySelector('#ef-tifib-svg-section')
    );
    this._root.querySelector('#ef-tifib-svg')?.addEventListener('input', e => {
      this._root.querySelector('#ef-tifib-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-tifib-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-tifib-svg').value = '';
      this._root.querySelector('#ef-tifib-svg-preview').innerHTML = '';
    });
  }

  getSvg()    { return this._root.querySelector('#ef-tifib-svg')?.value.trim()||''; }
  getImgUrl() { return this._root.querySelector('#ef-tifib-img-url')?.value.trim()||''; }

  _updateImgPreview(url) {
    const p = this._root.querySelector('#ef-tifib-img-preview');
    if (!p) return;
    if (url) { p.innerHTML=`<img src="${TIFibFormUtils.escHtml(url)}" alt="preview" />`; p.classList.add('visible'); }
    else     { p.innerHTML=''; p.classList.remove('visible'); }
  }
}

// ── Row Editor ────────────────────────────────────────────────────────────────
// Edits one row: svg_content, alt_text, and N field tabs (one per field column).
// Fires 'tifib-apply' and 'tifib-cancel' on its element.
// Fully dynamic — tabs and buffer keys are built from fieldsCount.

class TIFibRowEditor {

  constructor(el) {
    this._el          = el;
    this._tab         = 'svg';
    this._buffer      = {};
    this._row         = null;
    this._fieldsCount = 2;
    this._headings    = {};
    this._bindEvents();
  }

  open(row, fieldsCount, headings) {
    this._row         = row;
    this._fieldsCount = fieldsCount;
    this._headings    = headings || {};

    // Build buffer: svg, alt_text, field1...fieldN
    this._buffer = {
      svg:      row.svg_content || '',
      alt_text: row.alt_text    || '',
    };
    for (let i = 1; i <= fieldsCount; i++) {
      const key = `field${i}`;
      const ans = row[key]?.acceptable_answers;
      this._buffer[key] = Array.isArray(ans) ? ans.join(', ') : (ans || '');
    }

    this._tab = 'svg';
    this._render();
    this._el.classList.remove('hidden');
    this._el.querySelector('.ef-tifib-ed-input')?.focus();
  }

  close() {
    this._row = null;
    this._el.innerHTML = '';
    this._el.classList.add('hidden');
  }

  isOpen()   { return !this._el.classList.contains('hidden'); }
  getRowId() { return this._row?.id || null; }

  _render() {
    const row = this._row;

    // Build tabs: svg, alt, then field1...fieldN
    const TABS = [
      { key:'svg', label:'SVG / Image' },
      { key:'alt', label:'Alt Text' },
    ];
    for (let i = 1; i <= this._fieldsCount; i++) {
      const key   = `field${i}`;
      const label = this._headings[key]
        || (i === 1 ? this._headings.count : null)
        || (i === 2 ? this._headings.word  : null)
        || `Field ${i}`;
      TABS.push({ key, label });
    }

    const tabsHTML = TABS.map(t => `
      <button class="ef-tifib-ed-tab${this._tab===t.key?' active':''}" data-tab="${t.key}">${t.label}</button>
    `).join('');

    const buf = this._buffer;
    let fieldHTML = '';

    if (this._tab === 'svg') {
      fieldHTML = `
        <textarea class="ef-tifib-ed-textarea ef-tifib-ed-input" rows="4"
          placeholder="Paste SVG code for this row's image..."
        >${TIFibFormUtils.escHtml(buf.svg)}</textarea>
        <div class="ef-tifib-ed-svg-preview">${buf.svg}</div>`;
    } else if (this._tab === 'alt') {
      fieldHTML = `
        <input class="ef-tifib-ed-input-text ef-tifib-ed-input" type="text"
          placeholder="Alt text for screen readers (e.g. Five apples)"
          value="${TIFibFormUtils.escHtml(buf.alt_text)}" />`;
    } else {
      // field1...fieldN
      const tabIdx  = parseInt(this._tab.replace('field',''));
      const label   = this._headings[this._tab]
        || (tabIdx === 1 ? this._headings.count : null)
        || (tabIdx === 2 ? this._headings.word  : null)
        || `Field ${tabIdx}`;
      fieldHTML = `
        <label class="ef-tifib-ed-hint">Comma-separated acceptable answers for <strong>${label}</strong></label>
        <input class="ef-tifib-ed-input-text ef-tifib-ed-input" type="text"
          placeholder="e.g. 5, five, 5.0"
          value="${TIFibFormUtils.escHtml(buf[this._tab]||'')}" />`;
    }

    this._el.innerHTML = `
      <div class="ef-tifib-ed-header">
        <span class="ef-tifib-ed-title">Editing Row ${row._displayIndex + 1}</span>
        <button class="ef-tifib-ed-close" data-action="cancel" title="Cancel">✕</button>
      </div>
      <div class="ef-tifib-ed-tabs">${tabsHTML}</div>
      <div class="ef-tifib-ed-body">${fieldHTML}</div>
      <div class="ef-tifib-ed-footer">
        <button class="ef-tifib-ed-apply" data-action="apply">Apply</button>
        <button class="ef-tifib-ed-cancel-btn" data-action="cancel">Cancel</button>
      </div>`;
  }

  _bufferKey() {
    if (this._tab === 'alt') return 'alt_text';
    return this._tab; // 'svg', 'field1', 'field2', ...
  }

  _flush() {
    const input = this._el.querySelector('.ef-tifib-ed-input');
    if (!input) return;
    this._buffer[this._bufferKey()] = input.value;
  }

  _bindEvents() {
    this._el.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab]');
      if (tab) { this._switchTab(tab.dataset.tab); return; }
      const action = e.target.closest('[data-action]')?.dataset?.action;
      if (action === 'apply')  { this._doApply();  return; }
      if (action === 'cancel') { this._doCancel(); return; }
    });

    this._el.addEventListener('input', e => {
      const input = e.target.closest('.ef-tifib-ed-input');
      if (!input) return;
      this._buffer[this._bufferKey()] = input.value;
      if (this._tab === 'svg') {
        const preview = this._el.querySelector('.ef-tifib-ed-svg-preview');
        if (preview) preview.innerHTML = input.value;
      }
    });
  }

  _switchTab(tab) {
    this._flush();
    this._tab = tab;
    this._render();
    this._el.querySelector('.ef-tifib-ed-input')?.focus();
  }

  _doApply() {
    this._flush();
    const detail = {
      rowId:    this._row.id,
      svg:      this._buffer.svg,
      alt_text: this._buffer.alt_text,
    };
    // Pack field1...fieldN
    for (let i = 1; i <= this._fieldsCount; i++) {
      const key = `field${i}`;
      detail[key] = TIFibFormUtils.parseAnswers(this._buffer[key]);
    }
    this._el.dispatchEvent(new CustomEvent('tifib-apply', { bubbles: true, detail }));
  }

  _doCancel() {
    this._el.dispatchEvent(new CustomEvent('tifib-cancel', { bubbles: true }));
  }
}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: column count, column headings, rows list, scoring, case_sensitive.

class TIFibAnswerWidget {

  constructor(root) {
    this._root        = root;
    this._rows        = [];
    this._fieldsCount = 2; // columns - 1 (image column not counted)
    this._editor      = null;
  }

  init(q) {
    // Derive fieldsCount from columns or existing row data
    const columns = q.columns || this._deriveColumns(q);
    this._fieldsCount = Math.max(1, columns - 1); // minimum 1 field column = 2 total columns

    const rows = q.rows || [];
    this._rows = rows.map((r, i) => {
      const row = {
        id:            TIFibFormUtils.uid(),
        _displayIndex: i,
        svg_content:   r.svg_content || '',
        alt_text:      r.alt_text    || '',
      };
      for (let fi = 1; fi <= this._fieldsCount; fi++) {
        const key = `field${fi}`;
        row[key] = r[key] || { acceptable_answers: [] };
      }
      return row;
    });
  }

  render(q) {
    const headings       = q.column_headings || {};
    const validation     = q.validation      || {};
    const scoringMethod  = validation.scoring_method    || q.scoring_method   || 'exact';
    const scoringMethod01= validation.scoring_method_01 || q.scoring_method_01 || '';
    const caseSensitive  = validation.case_sensitive != null
                            ? validation.case_sensitive
                            : (q.case_sensitive || false);

    return `
      <div class="ef-tifib-field">
        <label class="ef-tifib-label">Number of Columns <span class="ef-tifib-optional">(min 2 — includes image column)</span></label>
        <div class="ef-tifib-cols-row">
          <input class="ef-tifib-input ef-tifib-cols-input" id="ef-tifib-field-count"
            type="number" min="2" max="9" step="1" value="${this._fieldsCount + 1}" />
          <button class="ef-tifib-apply-btn" id="ef-tifib-apply-cols">Apply</button>
        </div>
        <div class="ef-tifib-cols-warning hidden" id="ef-tifib-cols-warning">
          ⚠ Changing columns will reset all row field data. Continue?
          <button class="ef-tifib-warn-yes" id="ef-tifib-cols-yes">Yes, reset</button>
          <button class="ef-tifib-warn-no"  id="ef-tifib-cols-no">Cancel</button>
        </div>
      </div>

      <div class="ef-tifib-field">
        <label class="ef-tifib-label">Column Headings</label>
        <div class="ef-tifib-col-headings-wrap" id="ef-tifib-col-headings">
          ${this._colHeadingsHTML(headings)}
        </div>
      </div>

      <div class="ef-tifib-field">
        <div class="ef-tifib-rows-header">
          <label class="ef-tifib-label">Rows</label>
          <button class="ef-tifib-add-row-btn" id="ef-tifib-add-row">+ Add Row</button>
        </div>
        <div class="ef-tifib-rows-list" id="ef-tifib-rows-list">
          ${this._rows.map((r, i) => this._rowCardHTML(r, i)).join('')}
        </div>
        <div class="ef-tifib-error" id="ef-tifib-error"></div>
      </div>

      <div class="ef-tifib-row-editor hidden" id="ef-tifib-row-editor"></div>

      <div class="ef-tifib-field">
        <label class="ef-tifib-label">Scoring Method</label>
        <select class="ef-tifib-select" id="ef-tifib-scoring-method">
          <option value="exact"   ${scoringMethod==='exact'  ?'selected':''}>Exact — all blanks must be correct</option>
          <option value="partial" ${scoringMethod==='partial'?'selected':''}>Partial — credit per correct blank</option>
        </select>
      </div>

      <div class="ef-tifib-field">
        <label class="ef-tifib-label">
          Scoring Method 01
          <span class="ef-tifib-optional">(optional — secondary scoring)</span>
        </label>
        <select class="ef-tifib-select" id="ef-tifib-scoring-method-01">
          <option value=""        ${!scoringMethod01             ?'selected':''}>— None —</option>
          <option value="exact"   ${scoringMethod01==='exact'    ?'selected':''}>Exact</option>
          <option value="partial" ${scoringMethod01==='partial'  ?'selected':''}>Partial</option>
        </select>
      </div>

      <div class="ef-tifib-field">
        <label class="ef-tifib-checkbox-label">
          <input type="checkbox" class="ef-tifib-checkbox" id="ef-tifib-case-sensitive"
            ${caseSensitive?'checked':''} />
          Case sensitive answers
        </label>
      </div>`;
  }

  bindEvents() {
    const editorEl = this._root.querySelector('#ef-tifib-row-editor');
    this._editor   = new TIFibRowEditor(editorEl);

    this._root.addEventListener('tifib-apply',  e => this._onEditorApply(e.detail));
    this._root.addEventListener('tifib-cancel', () => this._onEditorCancel());

    // Column count apply — input is total columns (including image), min 2
    this._root.querySelector('#ef-tifib-apply-cols')?.addEventListener('click', () => {
      const total   = parseInt(this._root.querySelector('#ef-tifib-field-count')?.value) || 2;
      const n       = Math.max(2, total) - 1; // fieldsCount = total - 1
      const warning = this._root.querySelector('#ef-tifib-cols-warning');
      if (n === this._fieldsCount) return;
      if (this._rows.length > 0) {
        warning._pending = n;
        warning.classList.remove('hidden');
      } else {
        this._applyFieldCount(n);
      }
    });
    this._root.querySelector('#ef-tifib-cols-yes')?.addEventListener('click', () => {
      const warning = this._root.querySelector('#ef-tifib-cols-warning');
      const n = warning?._pending || 1;
      warning?.classList.add('hidden');
      this._applyFieldCount(n);
    });
    this._root.querySelector('#ef-tifib-cols-no')?.addEventListener('click', () => {
      this._root.querySelector('#ef-tifib-cols-warning')?.classList.add('hidden');
      const inp = this._root.querySelector('#ef-tifib-field-count');
      if (inp) inp.value = this._fieldsCount + 1; // restore total columns display
    });

    // Add row
    this._root.querySelector('#ef-tifib-add-row')?.addEventListener('click', () => {
      this._addRow();
    });

    // Row list clicks (delete + select)
    const list = this._root.querySelector('#ef-tifib-rows-list');
    if (list) {
      list.addEventListener('click', e => {
        const delBtn = e.target.closest('.ef-tifib-row-delete');
        if (delBtn) {
          e.stopPropagation();
          const id = delBtn.dataset.rowId;
          this._rows = this._rows.filter(r => r.id !== id);
          this._reindex();
          if (this._editor?.getRowId() === id) this._editor.close();
          this._rerenderList();
          return;
        }
        const card = e.target.closest('.ef-tifib-row-card');
        if (card) this._openRow(card.dataset.rowId);
      });
    }
  }

  // ── Public getters ────────────────────────────────────

  getRows()         { return this._rows; }
  getFieldsCount()  { return this._fieldsCount; }

  getColumnHeadings() {
    const headings = {
      image: this._root.querySelector('#ef-tifib-col-image')?.value.trim() || 'Visual',
    };
    for (let i = 1; i <= this._fieldsCount; i++) {
      const key = `field${i}`;
      headings[key] = this._root.querySelector(`#ef-tifib-col-${key}`)?.value.trim() || `Field ${i}`;
    }
    return headings;
  }

  getValidation() {
    return {
      case_sensitive:    this._root.querySelector('#ef-tifib-case-sensitive')?.checked || false,
      scoring_method:    this._root.querySelector('#ef-tifib-scoring-method')?.value   || 'exact',
      scoring_method_01: this._root.querySelector('#ef-tifib-scoring-method-01')?.value || '',
    };
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-tifib-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private ──────────────────────────────────────────

  _colHeadingsHTML(headings) {
    let html = `
      <div class="ef-tifib-field" style="margin-bottom:6px">
        <label class="ef-tifib-label" style="font-size:10px">Image Column</label>
        <input class="ef-tifib-input" id="ef-tifib-col-image" type="text"
          placeholder="e.g. Visual"
          value="${TIFibFormUtils.escHtml(headings.image||'')}" />
      </div>`;
    for (let i = 1; i <= this._fieldsCount; i++) {
      const key   = `field${i}`;
      const val   = headings[key]
        || (i === 1 ? headings.count : null)
        || (i === 2 ? headings.word  : null)
        || '';
      html += `
      <div class="ef-tifib-field" style="margin-bottom:6px">
        <label class="ef-tifib-label" style="font-size:10px">Field ${i} Column</label>
        <input class="ef-tifib-input" id="ef-tifib-col-${key}" type="text"
          placeholder="e.g. Field ${i}"
          value="${TIFibFormUtils.escHtml(val)}" />
      </div>`;
    }
    return html;
  }

  _rowCardHTML(row, index) {
    const hasSvg   = !!row.svg_content;
    const svgThumb = hasSvg
      ? `<div class="ef-tifib-row-svg-thumb">${row.svg_content}</div>`
      : `<div class="ef-tifib-row-svg-placeholder">No SVG</div>`;

    let fieldsHTML = '';
    for (let i = 1; i <= this._fieldsCount; i++) {
      const key     = `field${i}`;
      const answers = Array.isArray(row[key]?.acceptable_answers)
        ? row[key].acceptable_answers.join(', ')
        : (row[key]?.acceptable_answers || '');
      fieldsHTML += `
        <div class="ef-tifib-row-field-line">
          <span class="ef-tifib-row-field-label">F${i}:</span>
          <span class="ef-tifib-row-field-val ${!answers?'empty':''}">${answers||'—'}</span>
        </div>`;
    }
    if (row.alt_text) {
      fieldsHTML += `<div class="ef-tifib-row-alt-text">${TIFibFormUtils.escHtml(row.alt_text)}</div>`;
    }

    return `
      <div class="ef-tifib-row-card" data-row-id="${row.id}">
        <div class="ef-tifib-row-card-left">
          <span class="ef-tifib-row-num">#${index+1}</span>
          ${svgThumb}
        </div>
        <div class="ef-tifib-row-card-fields">${fieldsHTML}</div>
        <button class="ef-tifib-row-delete" data-row-id="${row.id}" title="Delete row">✕</button>
      </div>`;
  }

  _addRow() {
    const row = {
      id:            TIFibFormUtils.uid(),
      _displayIndex: this._rows.length,
      svg_content:   '',
      alt_text:      '',
    };
    for (let i = 1; i <= this._fieldsCount; i++) {
      row[`field${i}`] = { acceptable_answers: [] };
    }
    this._rows.push(row);
    this._rerenderList();
    this._openRow(row.id);
  }

  _applyFieldCount(n) {
    this._fieldsCount = Math.max(1, Math.min(8, n)); // n = fieldsCount (total - 1), min 1 field = 2 total cols
    // Reset all row field data to match new count
    this._rows.forEach(r => {
      for (let i = 1; i <= 8; i++) delete r[`field${i}`];
      for (let i = 1; i <= this._fieldsCount; i++) {
        r[`field${i}`] = { acceptable_answers: [] };
      }
    });
    if (this._editor) this._editor.close();
    // Re-render headings + rows
    const headingsWrap = this._root.querySelector('#ef-tifib-col-headings');
    if (headingsWrap) headingsWrap.innerHTML = this._colHeadingsHTML({});
    this._rerenderList();
  }

  _reindex() {
    this._rows.forEach((r, i) => { r._displayIndex = i; });
  }

  _openRow(rowId) {
    const row = this._rows.find(r => r.id === rowId);
    if (!row) return;
    const headings = this.getColumnHeadings();
    this._editor.open(row, this._fieldsCount, headings);
    this._root.querySelectorAll('.ef-tifib-row-card')
      .forEach(c => c.classList.toggle('ef-tifib-row-editing', c.dataset.rowId === rowId));
  }

  _onEditorApply(detail) {
    const row = this._rows.find(r => r.id === detail.rowId);
    if (row) {
      row.svg_content = detail.svg;
      row.alt_text    = detail.alt_text;
      for (let i = 1; i <= this._fieldsCount; i++) {
        const key = `field${i}`;
        row[key] = { acceptable_answers: detail[key] || [] };
      }
    }
    this._editor.close();
    this._rerenderList();
  }

  _onEditorCancel() {
    this._editor.close();
    this._rerenderList();
  }

  _rerenderList() {
    const list = this._root.querySelector('#ef-tifib-rows-list');
    if (list) list.innerHTML = this._rows.map((r, i) => this._rowCardHTML(r, i)).join('');
  }

  // Derive fieldsCount from first row keys if columns not set
  _deriveColumns(q) {
    const firstRow = (q.rows||[])[0];
    if (!firstRow) return 3; // default: image + 2 fields
    let count = 1; // image column
    let i = 1;
    while (firstRow[`field${i}`] !== undefined) { count++; i++; }
    return count > 1 ? count : 3;
  }
}

// ── Metadata Widget ───────────────────────────────────────────────────────────

class TIFibMetadataWidget {
  constructor(root) { this._root = root; }
  render(q) {
    const diff = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty===d?'selected':''}>${d}</option>`).join('');
    return `
      <div class="ef-tifib-field">
        <label class="ef-tifib-label">Explanation <span class="ef-tifib-optional">(optional)</span></label>
        <textarea class="ef-tifib-textarea" id="ef-tifib-explanation" rows="2"
          placeholder="Explanation (HTML/MathML supported)"
        >${TIFibFormUtils.escHtml(q.explanation||'')}</textarea>
        <div class="ef-tifib-render-preview" id="ef-tifib-explanation-preview"></div>
      </div>
      <div class="ef-tifib-field">
        <label class="ef-tifib-label">Difficulty</label>
        <select class="ef-tifib-select" id="ef-tifib-difficulty">${diff}</select>
      </div>
      <div class="ef-tifib-row-2">
        <div class="ef-tifib-field">
          <label class="ef-tifib-label">Points <span class="ef-tifib-optional">(optional)</span></label>
          <input class="ef-tifib-input" id="ef-tifib-points" type="number" min="0" step="0.5"
            placeholder="e.g. 1" value="${q.points!=null&&q.points!==''?q.points:''}" />
        </div>
        <div class="ef-tifib-field">
          <label class="ef-tifib-label">Time Limit (sec) <span class="ef-tifib-optional">(optional)</span></label>
          <input class="ef-tifib-input" id="ef-tifib-time-limit" type="number" min="0" step="1"
            placeholder="e.g. 30" value="${q.time_limit!=null&&q.time_limit!==''?q.time_limit:''}" />
        </div>
      </div>
      <div class="ef-tifib-field">
        <label class="ef-tifib-label">Tags <span class="ef-tifib-optional">(comma separated)</span></label>
        <input class="ef-tifib-input" id="ef-tifib-tags" type="text"
          placeholder="e.g. math, counting"
          value="${Array.isArray(q.tags)?q.tags.join(', '):(q.tags||'')}" />
      </div>`;
  }
  bindEvents() {
    TIFibFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-tifib-explanation'),
      this._root.querySelector('#ef-tifib-explanation-preview')
    );
  }
  getData() {
    return {
      explanation: this._root.querySelector('#ef-tifib-explanation')?.value.trim()||'',
      difficulty:  this._root.querySelector('#ef-tifib-difficulty')?.value||'easy',
      points:      TIFibFormUtils.parseOptionalNumber(this._root.querySelector('#ef-tifib-points')),
      time_limit:  TIFibFormUtils.parseOptionalNumber(this._root.querySelector('#ef-tifib-time-limit')),
      tags:        TIFibFormUtils.parseTags(this._root.querySelector('#ef-tifib-tags')),
    };
  }
}

// ── Form Component ────────────────────────────────────────────────────────────

class TIFibFormComponent extends HTMLElement {

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
    const q         = this._question || EditorFormRegistry.getDefault('table_image_fill_in_the_blank');
    const isSkip    = q.type === EditorConfig.SKIP_TYPE;
    const typeConf  = EditorFormRegistry.getType(isSkip ? (q.original_type||'table_image_fill_in_the_blank') : q.type);
    const typeLabel = typeConf ? typeConf.label : 'Table Image Fill';
    const bodyClass = isSkip ? 'ef-tifib-body ef-tifib-is-skip' : 'ef-tifib-body';
    const skipLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    this._ansWidget = new TIFibAnswerWidget(this);
    this._ansWidget.init(q);

    const qW    = new TIFibQuestionWidget(this);
    const mW    = new TIFibMediaWidget(this);
    const metaW = new TIFibMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-tifib-form">
        <div class="${bodyClass}" id="ef-tifib-body">
          ${qW.render(q)}
          ${mW.render(q)}
          ${this._ansWidget.render(q)}
          ${metaW.render(q)}
        </div>
        <div class="ef-tifib-footer">
          <button class="ef-tifib-btn-save" id="ef-tifib-btn-save">Save</button>
          <button class="ef-tifib-btn-skip" id="ef-tifib-btn-skip">${skipLabel}</button>
        </div>
      </div>`;
  }

  _bindAll() {
    this._qWidget     = new TIFibQuestionWidget(this);
    this._mediaWidget = new TIFibMediaWidget(this);
    this._metaWidget  = new TIFibMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();
    this._bindFooter();
  }

  _bindFooter() {
    this.querySelector('#ef-tifib-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-tifib-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const q         = this._question;
    const isSkip    = q.type === EditorConfig.SKIP_TYPE;
    const typeConf  = EditorFormRegistry.getType(isSkip ? (q.original_type||'table_image_fill_in_the_blank') : q.type);
    const typeLabel = typeConf ? typeConf.label : 'Table Image Fill';
    const body = this.querySelector('#ef-tifib-body');
    const btn  = this.querySelector('#ef-tifib-btn-skip');
    if (isSkip) {
      q.type = q.original_type || 'table_image_fill_in_the_blank';
      delete q.original_type;
      body.classList.remove('ef-tifib-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      q.original_type = q.type;
      q.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-tifib-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  _handleSave() {
    this._ansWidget.showError('');
    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-tifib-question')?.focus();
      return;
    }
    const rows = this._ansWidget.getRows();
    if (rows.length === 0) {
      this._ansWidget.showError('At least one row is required.');
      return;
    }
    const saved = this._collectData();
    if (this._question?.original_type) saved.original_type = this._question.original_type;
    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved },
    }));
  }

  _collectData() {
    const rows        = this._ansWidget.getRows();
    const fieldsCount = this._ansWidget.getFieldsCount();
    const validation  = this._ansWidget.getValidation();
    const headings    = this._ansWidget.getColumnHeadings();
    const meta        = this._metaWidget.getData();

    const cleanRows = rows.map(r => {
      const row = {
        svg_content: r.svg_content,
        alt_text:    r.alt_text,
      };
      for (let i = 1; i <= fieldsCount; i++) {
        const key = `field${i}`;
        row[key] = { acceptable_answers: r[key]?.acceptable_answers || [] };
      }
      return row;
    });

    return {
      type:            this._question?.type || 'table_image_fill_in_the_blank',
      question:        this._qWidget.getValue(),
      svg_content:     this._mediaWidget.getSvg(),
      img_url:         this._mediaWidget.getImgUrl(),
      columns:         fieldsCount + 1,  // derived — not hardcoded
      column_headings: headings,
      rows:            cleanRows,
      user_response:   cleanRows.map(() => Array(fieldsCount).fill('')),
      validation: {
        case_sensitive:    validation.case_sensitive,
        scoring_method:    validation.scoring_method,
        ...(validation.scoring_method_01 ? { scoring_method_01: validation.scoring_method_01 } : {}),
      },
      ...meta,
    };
  }
}

customElements.define('table-image-fill-in-blank-form', TIFibFormComponent);