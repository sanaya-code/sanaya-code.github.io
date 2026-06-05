// editor/components/question_forms/multi_select_two_form/component.js

// ── Utilities ────────────────────────────────────────────────────────────────

class STQFormUtils {

  static escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  static parseOptionalNumber(el) {
    const val = el?.value.trim();
    if (!val) return '';
    const n = parseFloat(val);
    return isNaN(n) ? '' : n;
  }

  static parseTags(el) {
    const raw = el?.value || '';
    return raw.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  static bindFocusPreview(input, preview) {
    if (!input || !preview) return;
    input.addEventListener('focus', () => {
      preview.innerHTML = input.value;
      preview.classList.add('visible');
    });
    input.addEventListener('input', () => {
      preview.innerHTML = input.value;
    });
  }

  static bindCollapsible(header, section) {
    if (!header || !section) return;
    header.addEventListener('click', () => section.classList.toggle('open'));
  }

  // Auto-generate a key from type + value e.g. "color_red", "shape_circle"
  static makeKey(type, value) {
    if (!type || !value) return '';
    return `${type}_${value}`;
  }

}

// Cascading map: type → array of { value, description }
STQFormUtils.HIGHLIGHT_VALUES_BY_TYPE = {
  shape: [
    { value: 'circle',   description: 'Encircle the selection' },
    { value: 'square',   description: 'Square border around selection' },
    { value: 'triangle', description: 'Triangle border around selection' },
  ],
  color: [
    { value: 'red',    description: 'Fill background with red' },
    { value: 'green',  description: 'Fill background with green' },
    { value: 'blue',   description: 'Fill background with blue' },
    { value: 'yellow', description: 'Fill background with yellow' },
    { value: 'orange', description: 'Fill background with orange' },
    { value: 'purple', description: 'Fill background with purple' },
    { value: 'pink',   description: 'Fill background with pink' },
    { value: 'cyan',   description: 'Fill background with cyan' },
  ],
  mark: [
    { value: 'tick',  description: 'Place a tick mark next to the selection' },
    { value: 'cross', description: 'Place a cross mark next to the selection' },
    { value: 'star',  description: 'Place a star next to the selection' },
  ],
};

// ── Question Widget ───────────────────────────────────────────────────────────
// Owns: question textarea + focus preview

class STQQuestionWidget {

  constructor(root) { this._root = root; }

  render(q) {
    return `
      <div class="ef-stq-field">
        <label class="ef-stq-label">Question Text</label>
        <textarea class="ef-stq-textarea" id="ef-stq-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${STQFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-stq-render-preview" id="ef-stq-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    STQFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-stq-question'),
      this._root.querySelector('#ef-stq-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-stq-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class STQMediaWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${STQFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-stq-img-preview visible' : 'ef-stq-img-preview';

    return `
      <div class="ef-stq-collapsible" id="ef-stq-svg-section">
        <div class="ef-stq-collapsible-header" id="ef-stq-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-stq-collapsible-arrow">▼</span>
        </div>
        <div class="ef-stq-collapsible-body">
          <textarea class="ef-stq-textarea" id="ef-stq-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${STQFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-stq-svg-preview" id="ef-stq-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-stq-remove-btn" id="ef-stq-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-stq-collapsible" id="ef-stq-img-section">
        <div class="ef-stq-collapsible-header" id="ef-stq-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-stq-collapsible-arrow">▼</span>
        </div>
        <div class="ef-stq-collapsible-body">
          <input class="ef-stq-input" id="ef-stq-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${STQFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-stq-img-preview">${imgThumb}</div>
          <button class="ef-stq-remove-btn" id="ef-stq-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    STQFormUtils.bindCollapsible(
      this._root.querySelector('#ef-stq-svg-toggle'),
      this._root.querySelector('#ef-stq-svg-section')
    );
    this._root.querySelector('#ef-stq-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-stq-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-stq-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-stq-svg').value = '';
      this._root.querySelector('#ef-stq-svg-preview').innerHTML = '';
    });

    STQFormUtils.bindCollapsible(
      this._root.querySelector('#ef-stq-img-toggle'),
      this._root.querySelector('#ef-stq-img-section')
    );
    this._root.querySelector('#ef-stq-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-stq-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-stq-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-stq-svg')?.value.trim() || ''; }
  getImgUrl() { return this._root.querySelector('#ef-stq-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-stq-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${STQFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns:
//   • Quantities list — each row: drag handle, id badge, value input,
//     optional type+value dropdowns + label input, delete button
//   • required_selections and correct_answer are AUTO-GENERATED on save
//     from quantities that have a highlight style assigned
//   • Scoring Method dropdown
//   • Case Sensitive checkbox

class STQAnswerWidget {

  constructor(root) {
    this._root    = root;
    this._dragSrc = null;
  }

  // ── Render ────────────────────────────────────────────

  render(q) {
    const quantities    = q.quantities         || [];
    const correctAnswer = q.correct_answer      || {};
    const scoringMethod = q.scoring_method      || 'exact';
    const caseSensitive = !!q.case_sensitive;

    // When loading an existing question, reconstruct highlight info from
    // required_selections + correct_answer back onto each quantity row
    const styleByQtyId = this._buildStyleByQtyId(
      q.required_selections || [],
      correctAnswer
    );

    return `
      <div class="ef-stq-field">
        <div class="ef-stq-section-header">
          <label class="ef-stq-label">Quantities</label>
          <button class="ef-stq-add-btn" id="ef-stq-add-quantity">+ Add Quantity</button>
        </div>
        <div class="ef-stq-qty-list" id="ef-stq-qty-list">
          ${quantities.map((qt, i) => {
            const id    = qt.id || String(i + 1);
            const style = styleByQtyId[id] || null;
            return this._quantityRowHTML(id, qt.value ?? '', i, style);
          }).join('')}
        </div>
        <div class="ef-stq-hint">
          Optionally assign a highlight style to a quantity to mark it as a correct selection.
          Each style can only be used once.
        </div>
      </div>

      ${this._renderScoringMethod(scoringMethod)}
      ${this._renderCaseSensitive(caseSensitive)}
      <div class="ef-stq-error" id="ef-stq-answer-error"></div>
    `;
  }

  // Build a map of { qtyId → { type, value, label } } from existing
  // required_selections + correct_answer so we can pre-fill rows on load
  _buildStyleByQtyId(requiredSelections, correctAnswer) {
    const map = {};
    requiredSelections.forEach(sel => {
      const key   = sel.key;
      const qtyId = correctAnswer[key];
      if (qtyId && sel.highlight_style) {
        map[qtyId] = {
          type:  sel.highlight_style.type  || '',
          value: sel.highlight_style.value || '',
          label: sel.label || '',
        };
      }
    });
    return map;
  }

  // ── Quantity row ──────────────────────────────────────
  // style = { type, value, label } or null

  _quantityRowHTML(id, value, index, style) {
    const selType    = style?.type  || '';
    const selValue   = style?.value || '';
    const selLabel   = style?.label || '';
    const hasStyle   = !!(selType && selValue);

    const typeOptions = ['', 'shape', 'color', 'mark'].map(t => {
      const lbl = t === '' ? '— Type —' : t.charAt(0).toUpperCase() + t.slice(1);
      return `<option value="${t}" ${selType === t ? 'selected' : ''}>${lbl}</option>`;
    }).join('');

    const valueOptions = this._valueOptionsHTML(selType, selValue);
    const panelClass   = hasStyle ? 'ef-stq-style-panel' : 'ef-stq-style-panel ef-stq-hidden';
    const labelClass   = (hasStyle && selValue) ? 'ef-stq-qty-label' : 'ef-stq-qty-label ef-stq-hidden';

    return `
      <div class="ef-stq-qty-row" draggable="true" data-qty-index="${index}">
        <div class="ef-stq-qty-main">
          <span class="ef-stq-qty-id-badge" title="Drag to reorder">${STQFormUtils.escHtml(String(id))}</span>
          <input type="text"
                 class="ef-stq-qty-value"
                 placeholder="Value (HTML/MathML supported)"
                 value="${STQFormUtils.escHtml(String(value))}"
                 data-qty-index="${index}"
          />
          <label class="ef-stq-style-toggle" title="Assign highlight style">
            <input type="checkbox"
                   class="ef-stq-style-check"
                   data-qty-index="${index}"
                   ${hasStyle ? 'checked' : ''}
            />
            <span class="ef-stq-style-check-label">Highlight</span>
          </label>
          <button class="ef-stq-row-delete" title="Delete quantity">✕</button>
        </div>
        <div class="ef-stq-qty-preview-wrap">
          <div class="ef-stq-qty-display-preview ef-stq-render-preview"></div>
        </div>
        <div class="${panelClass}" data-qty-index="${index}">
          <div class="ef-stq-style-dropdowns">
            <select class="ef-stq-qty-type ef-stq-select" data-qty-index="${index}">
              ${typeOptions}
            </select>
            <select class="ef-stq-qty-style-value ef-stq-select" data-qty-index="${index}">
              ${valueOptions}
            </select>
          </div>
          <input type="text"
                 class="${labelClass}"
                 placeholder="Label (e.g. Smallest)"
                 value="${STQFormUtils.escHtml(selLabel)}"
                 data-qty-index="${index}"
          />
        </div>
      </div>
    `;
  }

  // Build value <option> list for a given type
  _valueOptionsHTML(type, selectedValue) {
    const values      = STQFormUtils.HIGHLIGHT_VALUES_BY_TYPE[type] || [];
    const placeholder = `<option value="">— Value —</option>`;
    if (!values.length) return placeholder;
    return placeholder + values.map(v =>
      `<option value="${STQFormUtils.escHtml(v.value)}"
        ${selectedValue === v.value ? 'selected' : ''}>
        ${STQFormUtils.escHtml(v.description || v.value)}
      </option>`
    ).join('');
  }

  // ── Scoring + Case Sensitive ──────────────────────────

  _renderScoringMethod(scoringMethod) {
    return `
      <div class="ef-stq-field">
        <label class="ef-stq-label">Scoring Method</label>
        <select class="ef-stq-select" id="ef-stq-scoring-method">
          <option value="exact"   ${scoringMethod === 'exact'   ? 'selected' : ''}>Exact — all selections must be correct</option>
          <option value="partial" ${scoringMethod === 'partial' ? 'selected' : ''}>Partial — credit per correct selection</option>
        </select>
      </div>
    `;
  }

  _renderCaseSensitive(caseSensitive) {
    return `
      <div class="ef-stq-field">
        <label class="ef-stq-checkbox-label">
          <input type="checkbox" class="ef-stq-checkbox" id="ef-stq-case-sensitive"
            ${caseSensitive ? 'checked' : ''} />
          Case sensitive answers
        </label>
      </div>
    `;
  }

  // ── Bind Events ───────────────────────────────────────

  bindEvents() {
    this._bindAddDelete();
    this._bindDragReorder();
    this._bindStyleCascade();
    this._bindDisplayPreviews();
  }

  // Focus/input on ef-stq-qty-value → update its sibling preview
  _bindDisplayPreviews() {
    const list = this._root.querySelector('#ef-stq-qty-list');
    if (!list) return;
    list.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ef-stq-qty-value')) return;
      const preview = e.target.closest('.ef-stq-qty-row')
        ?.querySelector('.ef-stq-qty-display-preview');
      if (preview) {
        preview.innerHTML = e.target.value;
        preview.classList.add('visible');
      }
    });
    list.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ef-stq-qty-value')) return;
      const preview = e.target.closest('.ef-stq-qty-row')
        ?.querySelector('.ef-stq-qty-display-preview');
      if (preview) preview.innerHTML = e.target.value;
    });
  }

  _bindAddDelete() {
    this._root.querySelector('#ef-stq-add-quantity')
      ?.addEventListener('click', () => this._addQuantityRow());

    this._root.querySelector('#ef-stq-qty-list')
      ?.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ef-stq-row-delete')) return;
        e.target.closest('.ef-stq-qty-row').remove();
        this._reindexQuantities();
      });
  }

  _addQuantityRow() {
    const list  = this._root.querySelector('#ef-stq-qty-list');
    const count = list.querySelectorAll('.ef-stq-qty-row').length;
    const newId = String(count + 1);
    const div   = document.createElement('div');
    div.innerHTML = this._quantityRowHTML(newId, '', count, null);
    list.appendChild(div.firstElementChild);
    this._reindexQuantities();
    list.querySelector('.ef-stq-qty-row:last-child .ef-stq-qty-value')?.focus();
  }

  _reindexQuantities() {
    this._root.querySelectorAll('.ef-stq-qty-row').forEach((row, i) => {
      row.dataset.qtyIndex = i;
      const badge = row.querySelector('.ef-stq-qty-id-badge');
      if (badge) badge.textContent = String(i + 1);
      row.querySelectorAll('[data-qty-index]').forEach(el => {
        el.dataset.qtyIndex = i;
      });
    });
  }

  // ── Drag reorder ──────────────────────────────────────

  _bindDragReorder() {
    const list = this._root.querySelector('#ef-stq-qty-list');
    if (!list) return;

    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-stq-qty-row');
      if (!row) return;
      this._dragSrc = parseInt(row.dataset.qtyIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    list.addEventListener('dragend', () => {
      list.querySelectorAll('.ef-stq-qty-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });

    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-stq-qty-row');
      if (row && parseInt(row.dataset.qtyIndex) !== this._dragSrc) {
        list.querySelectorAll('.ef-stq-qty-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });

    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetRow = e.target.closest('.ef-stq-qty-row');
      if (!targetRow) return;
      const to   = parseInt(targetRow.dataset.qtyIndex);
      const from = this._dragSrc;
      if (from === null || from === undefined || from === to) return;
      targetRow.classList.remove('drag-over');
      this._reorderRows(from, to);
    });
  }

  _reorderRows(from, to) {
    const list = this._root.querySelector('#ef-stq-qty-list');
    const rows = Array.from(list.querySelectorAll('.ef-stq-qty-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexQuantities();
  }

  // ── Style cascade: checkbox → show panel, type → value, value → label ───

  _bindStyleCascade() {
    const list = this._root.querySelector('#ef-stq-qty-list');
    if (!list) return;

    list.addEventListener('change', (e) => {
      const row = e.target.closest('.ef-stq-qty-row');
      if (!row) return;

      // Checkbox toggled → show/hide the style panel, reset selections when hiding
      if (e.target.classList.contains('ef-stq-style-check')) {
        const panel   = row.querySelector('.ef-stq-style-panel');
        const typeEl  = row.querySelector('.ef-stq-qty-type');
        const valueEl = row.querySelector('.ef-stq-qty-style-value');
        const labelEl = row.querySelector('.ef-stq-qty-label');
        if (e.target.checked) {
          panel?.classList.remove('ef-stq-hidden');
        } else {
          panel?.classList.add('ef-stq-hidden');
          if (typeEl)  { typeEl.value  = ''; }
          if (valueEl) { valueEl.innerHTML = this._valueOptionsHTML('', ''); }
          if (labelEl) { labelEl.value = ''; labelEl.classList.add('ef-stq-hidden'); }
        }
        return;
      }

      // Type changed → repopulate value dropdown, hide label
      if (e.target.classList.contains('ef-stq-qty-type')) {
        const valueEl = row.querySelector('.ef-stq-qty-style-value');
        const labelEl = row.querySelector('.ef-stq-qty-label');
        if (valueEl) valueEl.innerHTML = this._valueOptionsHTML(e.target.value, '');
        if (labelEl) { labelEl.value = ''; labelEl.classList.add('ef-stq-hidden'); }
        return;
      }

      // Value changed → show label only when both type and value are set
      if (e.target.classList.contains('ef-stq-qty-style-value')) {
        const typeEl  = row.querySelector('.ef-stq-qty-type');
        const labelEl = row.querySelector('.ef-stq-qty-label');
        if (labelEl) {
          const hasStyle = !!(typeEl?.value && e.target.value);
          labelEl.classList.toggle('ef-stq-hidden', !hasStyle);
          if (!hasStyle) labelEl.value = '';
        }
      }
    });
  }

  // ── Getters ───────────────────────────────────────────

  getQuantities() {
    return Array.from(this._root.querySelectorAll('.ef-stq-qty-row')).map((row, i) => ({
      id:    String(i + 1),
      value: row.querySelector('.ef-stq-qty-value')?.value.trim() ?? '',
    }));
  }

  // Returns the highlight info for quantities that have a style assigned
  // { qtyId: { type, value, label } }
  getQuantityStyles() {
    const result = {};
    this._root.querySelectorAll('.ef-stq-qty-row').forEach((row, i) => {
      const type  = row.querySelector('.ef-stq-qty-type')?.value        || '';
      const value = row.querySelector('.ef-stq-qty-style-value')?.value || '';
      const label = row.querySelector('.ef-stq-qty-label')?.value.trim()|| '';
      if (type && value) {
        result[String(i + 1)] = { type, value, label };
      }
    });
    return result;
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-stq-scoring-method')?.value || 'exact';
  }

  getCaseSensitive() {
    return this._root.querySelector('#ef-stq-case-sensitive')?.checked || false;
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-stq-answer-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class STQMetadataWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-stq-field">
        <label class="ef-stq-label">
          Explanation
          <span class="ef-stq-optional">(optional)</span>
        </label>
        <textarea class="ef-stq-textarea" id="ef-stq-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${STQFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-stq-render-preview" id="ef-stq-explanation-preview"></div>
      </div>

      <div class="ef-stq-field">
        <label class="ef-stq-label">Difficulty</label>
        <select class="ef-stq-select" id="ef-stq-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-stq-row-2">
        <div class="ef-stq-field">
          <label class="ef-stq-label">
            Points <span class="ef-stq-optional">(optional)</span>
          </label>
          <input class="ef-stq-input" id="ef-stq-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-stq-field">
          <label class="ef-stq-label">
            Time Limit (sec) <span class="ef-stq-optional">(optional)</span>
          </label>
          <input class="ef-stq-input" id="ef-stq-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-stq-field">
        <label class="ef-stq-label">
          Tags <span class="ef-stq-optional">(comma separated)</span>
        </label>
        <input class="ef-stq-input" id="ef-stq-tags" type="text"
          placeholder="e.g. math, number_comparison"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    STQFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-stq-explanation'),
      this._root.querySelector('#ef-stq-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-stq-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-stq-difficulty')?.value || 'easy',
      points:      STQFormUtils.parseOptionalNumber(this._root.querySelector('#ef-stq-points')),
      time_limit:  STQFormUtils.parseOptionalNumber(this._root.querySelector('#ef-stq-time-limit')),
      tags:        STQFormUtils.parseTags(this._root.querySelector('#ef-stq-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class STQFormComponent extends HTMLElement {

  connectedCallback() {
    this._question = null;
    this._index    = -1;
    this._render();
    this._bindAll();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._render();
    this._bindAll();
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('multi_select_two');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'multi_select_two') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Multi Select Two';
    const bodyClass    = isSkip ? 'ef-stq-body ef-stq-is-skip' : 'ef-stq-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new STQQuestionWidget(this);
    const mediaWidget = new STQMediaWidget(this);
    const ansWidget   = new STQAnswerWidget(this);
    const metaWidget  = new STQMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-stq-form">
        <div class="${bodyClass}" id="ef-stq-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-stq-footer">
          <button class="ef-stq-btn-save" id="ef-stq-btn-save">Save</button>
          <button class="ef-stq-btn-skip" id="ef-stq-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind ─────────────────────────────────────────────

  _bindAll() {
    this._qWidget     = new STQQuestionWidget(this);
    this._mediaWidget = new STQMediaWidget(this);
    this._ansWidget   = new STQAnswerWidget(this);
    this._metaWidget  = new STQMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer ───────────────────────────────────────────

  _bindFooter() {
    this.querySelector('#ef-stq-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-stq-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'multi_select_two') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Multi Select Two';
    const body      = this.querySelector('#ef-stq-body');
    const btn       = this.querySelector('#ef-stq-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'multi_select_two';
      delete this._question.original_type;
      body.classList.remove('ef-stq-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-stq-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-stq-question')?.focus();
      return;
    }

    const quantities = this._ansWidget.getQuantities();
    if (quantities.length < 2) {
      this._ansWidget.showError('At least 2 quantities are required.');
      return;
    }

    // Validate: no duplicate highlight styles
    const styles     = this._ansWidget.getQuantityStyles();
    const styleKeys  = Object.values(styles).map(s => STQFormUtils.makeKey(s.type, s.value));
    const uniqueKeys = new Set(styleKeys);
    if (styleKeys.length !== uniqueKeys.size) {
      this._ansWidget.showError('Each highlight style can only be assigned to one quantity.');
      return;
    }

    // Validate: label required for every style-assigned quantity
    const missingLabel = Object.values(styles).some(s => !s.label.trim());
    if (missingLabel) {
      this._ansWidget.showError('Please enter a label for every quantity with a highlight style.');
      return;
    }

    const saved = this._collectData();
    if (this._question?.original_type) {
      saved.original_type = this._question.original_type;
    }

    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved },
    }));
  }

  // ── Collect ──────────────────────────────────────────

  _collectData() {
    const quantities    = this._ansWidget.getQuantities();
    const stylesByQtyId = this._ansWidget.getQuantityStyles();

    // Auto-generate required_selections and correct_answer
    // from quantities that have a highlight style assigned
    const requiredSelections = [];
    const correctAnswer      = {};
    const userResponse       = {};

    Object.entries(stylesByQtyId).forEach(([qtyId, style]) => {
      const key = STQFormUtils.makeKey(style.type, style.value);
      requiredSelections.push({
        label:           style.label,
        key,
        highlight_style: { type: style.type, value: style.value },
      });
      correctAnswer[key] = qtyId;
      userResponse[key]  = '';
    });

    return {
      type:                this._question?.type || 'multi_select_two',
      question:            this._qWidget.getValue(),
      svg_content:         this._mediaWidget.getSvg(),
      img_url:             this._mediaWidget.getImgUrl(),
      quantities,
      required_selections: requiredSelections,
      correct_answer:      correctAnswer,
      user_response:       userResponse,
      scoring_method:      this._ansWidget.getScoringMethod(),
      case_sensitive:      this._ansWidget.getCaseSensitive(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('multi-select-two-form', STQFormComponent);