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

  // Build a label for a highlight style object
  static styleLabel(style) {
    if (!style) return '— None —';
    return `${style.type}: ${style.value}`;
  }

}

// All available highlight styles — full list used to build cascading dropdowns
STQFormUtils.DEFAULT_HIGHLIGHT_STYLES = [
  { type: 'shape', value: 'circle',   description: 'Encircle the selection' },
  { type: 'shape', value: 'square',   description: 'Square border around selection' },
  { type: 'color', value: 'red',      description: 'Fill background with red' },
  { type: 'color', value: 'green',    description: 'Fill background with green' },
  { type: 'mark',  value: 'tick',     description: 'Place a tick mark next to the selection' }
];

// Cascading map: type → array of { value, description }
STQFormUtils.HIGHLIGHT_VALUES_BY_TYPE = {
  shape: [
    { value: 'circle',   description: 'Encircle the selection' },
    { value: 'square',   description: 'Square border around selection' }
  ],
  color: [
    { value: 'red',    description: 'Fill background with red' },
    { value: 'green',  description: 'Fill background with green' }
  ],
  mark: [
    { value: 'tick',  description: 'Place a tick mark next to the selection' }
  ],
};

// ── Question Widget ───────────────────────────────────────────────────────────
// Owns: question textarea + focus preview

class STQQuestionWidget {

  constructor(root) {
    this._root = root;
  }

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

  constructor(root) {
    this._root = root;
  }

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
//   • Quantities list (id + value, add/delete)
//   • Required Selections list (label, key, highlight_style picked from
//     available_highlight_styles, id picked from quantities, add/delete)
//   • Correct Answer — auto-derived from required_selections + quantities
//     (user picks which quantity id answers each required_selection key)
//   • Scoring Method dropdown
//   • Case Sensitive checkbox

class STQAnswerWidget {

  constructor(root) {
    this._root = root;
    // Kept in memory — not stored in DOM, built fresh on render
    this._availableStyles = [];
  }

  render(q) {
    const fromQuestion = q.available_highlight_styles;
    this._availableStyles = (fromQuestion && fromQuestion.length)
      ? fromQuestion
      : STQFormUtils.DEFAULT_HIGHLIGHT_STYLES;

    const quantities         = q.quantities         || [];
    const requiredSelections = q.required_selections || [];
    const correctAnswer      = q.correct_answer      || {};
    const scoringMethod      = q.scoring_method      || 'exact';
    const caseSensitive      = !!q.case_sensitive;

    return `
      ${this._renderQuantities(quantities)}
      ${this._renderRequiredSelections(requiredSelections, quantities)}
      ${this._renderCorrectAnswer(requiredSelections, quantities, correctAnswer)}
      ${this._renderScoringMethod(scoringMethod)}
      ${this._renderCaseSensitive(caseSensitive)}
      <div class="ef-stq-error" id="ef-stq-answer-error"></div>
    `;
  }

  // ── Quantities ────────────────────────────────────────

  _renderQuantities(quantities) {
    return `
      <div class="ef-stq-field">
        <div class="ef-stq-section-header">
          <label class="ef-stq-label">Quantities</label>
          <button class="ef-stq-add-btn" id="ef-stq-add-quantity">+ Add Quantity</button>
        </div>
        <div class="ef-stq-qty-list" id="ef-stq-qty-list">
          ${quantities.map((qt, i) => this._quantityRowHTML(qt.id || String(i + 1), qt.value ?? '', i)).join('')}
        </div>
      </div>
    `;
  }

  _quantityRowHTML(id, value, index) {
    return `
      <div class="ef-stq-qty-row" data-qty-index="${index}">
        <span class="ef-stq-qty-id-badge">${STQFormUtils.escHtml(String(id))}</span>
        <input type="text"
               class="ef-stq-qty-value"
               placeholder="Value (number or text)"
               value="${STQFormUtils.escHtml(String(value))}"
               data-qty-index="${index}"
        />
        <button class="ef-stq-row-delete" title="Delete quantity">✕</button>
      </div>
    `;
  }

  // ── Required Selections ───────────────────────────────

  _renderRequiredSelections(requiredSelections, quantities) {
    return `
      <div class="ef-stq-field">
        <div class="ef-stq-section-header">
          <label class="ef-stq-label">Required Selections</label>
          <button class="ef-stq-add-btn" id="ef-stq-add-selection">+ Add Selection</button>
        </div>
        <div class="ef-stq-sel-list" id="ef-stq-sel-list">
          ${requiredSelections.map((sel, i) =>
            this._selectionRowHTML(sel, i, quantities)
          ).join('')}
        </div>
      </div>
    `;
  }

  _selectionRowHTML(sel, index, quantities) {
    const selectedType  = sel.highlight_style?.type  || '';
    const selectedValue = sel.highlight_style?.value || '';

    // Type dropdown — always shape / color / mark
    const typeOptions = ['', 'shape', 'color', 'mark'].map(t => {
      const label = t === '' ? '— Type —' : t.charAt(0).toUpperCase() + t.slice(1);
      return `<option value="${t}" ${selectedType === t ? 'selected' : ''}>${label}</option>`;
    }).join('');

    // Value dropdown — populated based on selectedType
    const valueOptions = this._valueOptionsHTML(selectedType, selectedValue);

    return `
      <div class="ef-stq-sel-row" data-sel-index="${index}">
        <div class="ef-stq-sel-fields">
          <input type="text"
                 class="ef-stq-sel-label"
                 placeholder="Label (e.g. Smallest)"
                 value="${STQFormUtils.escHtml(sel.label || '')}"
                 data-sel-index="${index}"
          />
          <input type="text"
                 class="ef-stq-sel-key"
                 placeholder="Key (e.g. smallest)"
                 value="${STQFormUtils.escHtml(sel.key || '')}"
                 data-sel-index="${index}"
          />
          <div class="ef-stq-style-row">
            <select class="ef-stq-sel-type ef-stq-select" data-sel-index="${index}">
              ${typeOptions}
            </select>
            <select class="ef-stq-sel-value ef-stq-select" data-sel-index="${index}">
              ${valueOptions}
            </select>
          </div>
        </div>
        <button class="ef-stq-row-delete" title="Delete selection">✕</button>
      </div>
    `;
  }

  // Build value <option> list for a given type
  _valueOptionsHTML(type, selectedValue) {
    const values = STQFormUtils.HIGHLIGHT_VALUES_BY_TYPE[type] || [];
    const placeholder = `<option value="">— Value —</option>`;
    if (!values.length) return placeholder;
    return placeholder + values.map(v =>
      `<option value="${STQFormUtils.escHtml(v.value)}"
        ${selectedValue === v.value ? 'selected' : ''}>
        ${STQFormUtils.escHtml(v.description || v.value)}
      </option>`
    ).join('');
  }

  // ── Correct Answer ────────────────────────────────────
  // For each required_selection key, user picks which quantity id is the answer

  _renderCorrectAnswer(requiredSelections, quantities, correctAnswer) {
    if (!requiredSelections.length) {
      return `
        <div class="ef-stq-field">
          <label class="ef-stq-label">Correct Answer</label>
          <div class="ef-stq-hint">Add required selections above to set correct answers.</div>
        </div>
      `;
    }

    const qtyOptions = quantities.map((qt, i) => {
      const id = qt.id || String(i + 1);
      return `<option value="${STQFormUtils.escHtml(id)}">
        ID ${STQFormUtils.escHtml(id)}: ${STQFormUtils.escHtml(String(qt.value ?? ''))}
      </option>`;
    }).join('');

    const rows = requiredSelections.map((sel, i) => {
      const key      = sel.key || `sel_${i}`;
      const label    = sel.label || key;
      const current  = correctAnswer[key] || '';
      return `
        <div class="ef-stq-ca-row">
          <span class="ef-stq-ca-key-label">${STQFormUtils.escHtml(label)}</span>
          <select class="ef-stq-select ef-stq-ca-select" data-key="${STQFormUtils.escHtml(key)}">
            <option value="">— Select Quantity —</option>
            ${quantities.map((qt, qi) => {
              const id = qt.id || String(qi + 1);
              return `<option value="${STQFormUtils.escHtml(id)}"
                ${current === id ? 'selected' : ''}>
                ID ${STQFormUtils.escHtml(id)}: ${STQFormUtils.escHtml(String(qt.value ?? ''))}
              </option>`;
            }).join('')}
          </select>
        </div>
      `;
    }).join('');

    return `
      <div class="ef-stq-field">
        <label class="ef-stq-label">Correct Answer</label>
        <div class="ef-stq-ca-list" id="ef-stq-ca-list">
          ${rows}
        </div>
      </div>
    `;
  }

  // ── Scoring Method ────────────────────────────────────

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

  // ── Case Sensitive ────────────────────────────────────

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

  bindEvents(q) {
    this._bindQuantityEvents(q);
    this._bindSelectionEvents(q);
  }

  _bindQuantityEvents(q) {
    this._root.querySelector('#ef-stq-add-quantity')
      ?.addEventListener('click', () => this._addQuantityRow(q));

    this._root.querySelector('#ef-stq-qty-list')
      ?.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ef-stq-row-delete')) return;
        e.target.closest('.ef-stq-qty-row').remove();
        this._reindexQuantities();
        this._refreshCorrectAnswerDropdowns(q);
      });
  }

  _addQuantityRow(q) {
    const list  = this._root.querySelector('#ef-stq-qty-list');
    const count = list.querySelectorAll('.ef-stq-qty-row').length;
    const newId = String(count + 1);
    const div   = document.createElement('div');
    div.innerHTML = this._quantityRowHTML(newId, '', count);
    list.appendChild(div.firstElementChild);
    this._reindexQuantities();
    this._refreshCorrectAnswerDropdowns(q);
  }

  _reindexQuantities() {
    this._root.querySelectorAll('.ef-stq-qty-row').forEach((row, i) => {
      row.dataset.qtyIndex = i;
      const badge = row.querySelector('.ef-stq-qty-id-badge');
      if (badge) badge.textContent = String(i + 1);
      const inp = row.querySelector('.ef-stq-qty-value');
      if (inp) inp.dataset.qtyIndex = i;
    });
  }

  _bindSelectionEvents(q) {
    this._root.querySelector('#ef-stq-add-selection')
      ?.addEventListener('click', () => this._addSelectionRow(q));

    this._root.querySelector('#ef-stq-sel-list')
      ?.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ef-stq-row-delete')) return;
        e.target.closest('.ef-stq-sel-row').remove();
        this._reindexSelections();
        this._refreshCorrectAnswerDropdowns(q);
      });

    // Cascade: when type changes, repopulate the value dropdown
    this._root.querySelector('#ef-stq-sel-list')
      ?.addEventListener('change', (e) => {
        if (!e.target.classList.contains('ef-stq-sel-type')) return;
        const row       = e.target.closest('.ef-stq-sel-row');
        const valueEl   = row.querySelector('.ef-stq-sel-value');
        if (valueEl) valueEl.innerHTML = this._valueOptionsHTML(e.target.value, '');
      });

    // When key/label changes, update the correct answer row label live
    this._root.querySelector('#ef-stq-sel-list')
      ?.addEventListener('input', (e) => {
        if (e.target.classList.contains('ef-stq-sel-label') ||
            e.target.classList.contains('ef-stq-sel-key')) {
          this._refreshCorrectAnswerDropdowns(q);
        }
      });
  }

  _addSelectionRow(q) {
    const list  = this._root.querySelector('#ef-stq-sel-list');
    const count = list.querySelectorAll('.ef-stq-sel-row').length;
    const quantities = this.getQuantities();
    const div   = document.createElement('div');
    div.innerHTML = this._selectionRowHTML({}, count, quantities);
    list.appendChild(div.firstElementChild);
    this._reindexSelections();
    this._refreshCorrectAnswerDropdowns(q);
  }

  _reindexSelections() {
    this._root.querySelectorAll('.ef-stq-sel-row').forEach((row, i) => {
      row.dataset.selIndex = i;
      row.querySelectorAll('[data-sel-index]').forEach(el => {
        el.dataset.selIndex = i;
      });
    });
  }

  // Rebuild the correct answer section live when quantities or selections change
  _refreshCorrectAnswerDropdowns(q) {
    const caList = this._root.querySelector('#ef-stq-ca-list');
    if (!caList) return;

    // Capture current correct answer selections before rebuild
    const currentCA = this.getCorrectAnswer();
    const quantities = this.getQuantities();
    const selections = this.getRequiredSelections();

    if (!selections.length) {
      caList.innerHTML = '<div class="ef-stq-hint">Add required selections above to set correct answers.</div>';
      return;
    }

    caList.innerHTML = selections.map((sel) => {
      const key     = sel.key || '';
      const label   = sel.label || key || '(unnamed)';
      const current = currentCA[key] || '';
      return `
        <div class="ef-stq-ca-row">
          <span class="ef-stq-ca-key-label">${STQFormUtils.escHtml(label)}</span>
          <select class="ef-stq-select ef-stq-ca-select" data-key="${STQFormUtils.escHtml(key)}">
            <option value="">— Select Quantity —</option>
            ${quantities.map(qt => `
              <option value="${STQFormUtils.escHtml(qt.id)}"
                ${current === qt.id ? 'selected' : ''}>
                ID ${STQFormUtils.escHtml(qt.id)}: ${STQFormUtils.escHtml(String(qt.value ?? ''))}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    }).join('');
  }

  // ── Getters ───────────────────────────────────────────

  getQuantities() {
    return Array.from(this._root.querySelectorAll('.ef-stq-qty-row')).map((row, i) => ({
      id:    String(i + 1),
      value: row.querySelector('.ef-stq-qty-value')?.value.trim() ?? '',
    }));
  }

  getRequiredSelections() {
    return Array.from(this._root.querySelectorAll('.ef-stq-sel-row')).map(row => {
      const type  = row.querySelector('.ef-stq-sel-type')?.value  || '';
      const value = row.querySelector('.ef-stq-sel-value')?.value || '';
      const highlight_style = (type && value) ? { type, value } : null;
      return {
        label:           row.querySelector('.ef-stq-sel-label')?.value.trim() || '',
        key:             row.querySelector('.ef-stq-sel-key')?.value.trim()   || '',
        highlight_style,
      };
    });
  }

  getCorrectAnswer() {
    const result = {};
    this._root.querySelectorAll('.ef-stq-ca-select').forEach(sel => {
      const key = sel.dataset.key;
      if (key) result[key] = sel.value || '';
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

  constructor(root) {
    this._root = root;
  }

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
    const q = this._question || EditorFormRegistry.getDefault('multi_select_two');

    this._qWidget     = new STQQuestionWidget(this);
    this._mediaWidget = new STQMediaWidget(this);
    this._ansWidget   = new STQAnswerWidget(this);
    this._metaWidget  = new STQMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents(q);
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

    const requiredSelections = this._ansWidget.getRequiredSelections();
    if (requiredSelections.length < 1) {
      this._ansWidget.showError('At least 1 required selection is needed.');
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
    const quantities         = this._ansWidget.getQuantities();
    const requiredSelections = this._ansWidget.getRequiredSelections();
    const correctAnswer      = this._ansWidget.getCorrectAnswer();

    // Build user_response skeleton from required_selection keys
    const userResponse = {};
    requiredSelections.forEach(sel => {
      if (sel.key) userResponse[sel.key] = '';
    });

    // Preserve available_highlight_styles — fall back to defaults if original was empty
    const availableStyles = (this._question?.available_highlight_styles?.length)
      ? this._question.available_highlight_styles
      : STQFormUtils.DEFAULT_HIGHLIGHT_STYLES;

    return {
      type:                      this._question?.type || 'multi_select_two',
      question:                  this._qWidget.getValue(),
      svg_content:               this._mediaWidget.getSvg(),
      img_url:                   this._mediaWidget.getImgUrl(),
      quantities,
      required_selections:       requiredSelections,
      correct_answer:            correctAnswer,
      user_response:             userResponse,
      available_highlight_styles: availableStyles,
      scoring_method:            this._ansWidget.getScoringMethod(),
      case_sensitive:            this._ansWidget.getCaseSensitive(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('multi-select-two-form', STQFormComponent);