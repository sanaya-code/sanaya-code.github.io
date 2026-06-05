// editor/components/question_forms/compare_quantities_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class CQFormUtils {

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

}

// ── Question Widget ───────────────────────────────────────────────────────────
// Owns: question textarea + focus preview

class CQQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-cq-field">
        <label class="ef-cq-label">Question Text</label>
        <textarea class="ef-cq-textarea" id="ef-cq-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${CQFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-cq-render-preview" id="ef-cq-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    CQFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-cq-question'),
      this._root.querySelector('#ef-cq-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-cq-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class CQMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${CQFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-cq-img-preview visible' : 'ef-cq-img-preview';

    return `
      <div class="ef-cq-collapsible" id="ef-cq-svg-section">
        <div class="ef-cq-collapsible-header" id="ef-cq-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-cq-collapsible-arrow">▼</span>
        </div>
        <div class="ef-cq-collapsible-body">
          <textarea class="ef-cq-textarea" id="ef-cq-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${CQFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-cq-svg-preview" id="ef-cq-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-cq-remove-btn" id="ef-cq-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-cq-collapsible" id="ef-cq-img-section">
        <div class="ef-cq-collapsible-header" id="ef-cq-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-cq-collapsible-arrow">▼</span>
        </div>
        <div class="ef-cq-collapsible-body">
          <input class="ef-cq-input" id="ef-cq-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${CQFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-cq-img-preview">${imgThumb}</div>
          <button class="ef-cq-remove-btn" id="ef-cq-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    CQFormUtils.bindCollapsible(
      this._root.querySelector('#ef-cq-svg-toggle'),
      this._root.querySelector('#ef-cq-svg-section')
    );
    this._root.querySelector('#ef-cq-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-cq-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-cq-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-cq-svg').value = '';
      this._root.querySelector('#ef-cq-svg-preview').innerHTML = '';
    });

    CQFormUtils.bindCollapsible(
      this._root.querySelector('#ef-cq-img-toggle'),
      this._root.querySelector('#ef-cq-img-section')
    );
    this._root.querySelector('#ef-cq-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-cq-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-cq-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-cq-svg')?.value.trim()     || ''; }
  getImgUrl() { return this._root.querySelector('#ef-cq-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-cq-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${CQFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: quantity A + B side by side with label/value/preview,
//       symbol options list (add/delete/refresh), correct answer click-to-select
// Unique to compare_quantities form

class CQAnswerWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const qA            = q.quantity_a || { label: 'A', value: '' };
    const qB            = q.quantity_b || { label: 'B', value: '' };
    const symbols       = Array.isArray(q.symbol_options) ? q.symbol_options : [' ', '>', '<', '='];
    const correctAnswer = q.correct_answer || '';

    return `
      <div class="ef-cq-field">
        <label class="ef-cq-label">Quantities</label>
        <div class="ef-cq-quantities">

          <div class="ef-cq-quantity-card">
            <div class="ef-cq-quantity-title">Quantity A</div>
            <div class="ef-cq-field">
              <label class="ef-cq-label" style="font-size:10px">Label</label>
              <input class="ef-cq-input" id="ef-cq-label-a" type="text"
                placeholder="e.g. A"
                value="${CQFormUtils.escHtml(qA.label || 'A')}"
              />
            </div>
            <div class="ef-cq-field">
              <label class="ef-cq-label" style="font-size:10px">
                Value (HTML/MathML supported)
              </label>
              <textarea class="ef-cq-textarea" id="ef-cq-value-a"
                rows="2" placeholder="e.g. 3x+2"
              >${CQFormUtils.escHtml(qA.value || '')}</textarea>
              <div class="ef-cq-render-preview" id="ef-cq-value-a-preview"></div>
            </div>
          </div>

          <div class="ef-cq-vs">?</div>

          <div class="ef-cq-quantity-card">
            <div class="ef-cq-quantity-title">Quantity B</div>
            <div class="ef-cq-field">
              <label class="ef-cq-label" style="font-size:10px">Label</label>
              <input class="ef-cq-input" id="ef-cq-label-b" type="text"
                placeholder="e.g. B"
                value="${CQFormUtils.escHtml(qB.label || 'B')}"
              />
            </div>
            <div class="ef-cq-field">
              <label class="ef-cq-label" style="font-size:10px">
                Value (HTML/MathML supported)
              </label>
              <textarea class="ef-cq-textarea" id="ef-cq-value-b"
                rows="2" placeholder="e.g. 2x+5"
              >${CQFormUtils.escHtml(qB.value || '')}</textarea>
              <div class="ef-cq-render-preview" id="ef-cq-value-b-preview"></div>
            </div>
          </div>

        </div>
      </div>

      <div class="ef-cq-field">
        <div class="ef-cq-options-header">
          <label class="ef-cq-label">Symbol Options</label>
          <button class="ef-cq-add-option-btn" id="ef-cq-add-symbol">+ Add Symbol</button>
        </div>
        <div class="ef-cq-symbols-wrap" id="ef-cq-symbols-wrap">
          ${symbols.map((s, i) => this._symbolRowHTML(s, i)).join('')}
        </div>
      </div>

      <div class="ef-cq-field">
        <label class="ef-cq-label">Correct Answer</label>
        <div class="ef-cq-correct-answer-display" id="ef-cq-correct-display">
          ${symbols.map(s => `
            <div class="ef-cq-answer-option ${s === correctAnswer ? 'selected' : ''}"
                 data-symbol="${CQFormUtils.escHtml(s)}">
              ${CQFormUtils.escHtml(s) || '&nbsp;&nbsp;'}
            </div>`).join('')}
        </div>
        <input type="hidden" id="ef-cq-correct-answer"
               value="${CQFormUtils.escHtml(correctAnswer)}" />
        <div class="ef-cq-error" id="ef-cq-error"></div>
      </div>
    `;
  }

  bindEvents() {
    CQFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-cq-value-a'),
      this._root.querySelector('#ef-cq-value-a-preview')
    );
    CQFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-cq-value-b'),
      this._root.querySelector('#ef-cq-value-b-preview')
    );

    this._root.querySelector('#ef-cq-add-symbol')?.addEventListener('click', () => {
      const wrap  = this._root.querySelector('#ef-cq-symbols-wrap');
      const count = wrap.querySelectorAll('.ef-cq-symbol-row').length;
      const div   = document.createElement('div');
      div.innerHTML = this._symbolRowHTML('', count);
      wrap.appendChild(div.firstElementChild);
      this._bindSymbolEvents();
      this._refreshCorrectDisplay();
      wrap.querySelector('.ef-cq-symbol-row:last-child .ef-cq-symbol-input')?.focus();
    });

    this._bindSymbolEvents();
    this._bindCorrectDisplayEvents();
  }

  getQuantityA() {
    return {
      label: this._root.querySelector('#ef-cq-label-a')?.value.trim() || 'A',
      value: this._root.querySelector('#ef-cq-value-a')?.value.trim() || '',
    };
  }

  getQuantityB() {
    return {
      label: this._root.querySelector('#ef-cq-label-b')?.value.trim() || 'B',
      value: this._root.querySelector('#ef-cq-value-b')?.value.trim() || '',
    };
  }

  getSymbols() {
    return Array.from(this._root.querySelectorAll('.ef-cq-symbol-input'))
      .map(inp => inp.value)
      .filter(s => s.length > 0 || s === ' ');
  }

  getCorrectAnswer() {
    return this._root.querySelector('#ef-cq-correct-answer')?.value || '';
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-cq-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private ──────────────────────────────────────────

  _symbolRowHTML(val, index) {
    return `
      <div class="ef-cq-symbol-row" data-sym-index="${index}">
        <input type="text" class="ef-cq-symbol-input"
               value="${CQFormUtils.escHtml(val)}"
               data-sym-index="${index}"
               maxlength="3"
        />
        <button class="ef-cq-symbol-delete" title="Remove">✕</button>
      </div>`;
  }

  _bindSymbolEvents() {
    const wrap = this._root.querySelector('#ef-cq-symbols-wrap');
    if (!wrap) return;
    wrap.querySelectorAll('.ef-cq-symbol-delete').forEach(btn => {
      const fresh = btn.cloneNode(true);
      btn.replaceWith(fresh);
      fresh.addEventListener('click', () => {
        fresh.closest('.ef-cq-symbol-row').remove();
        this._reindexSymbols();
        this._refreshCorrectDisplay();
      });
    });
    wrap.querySelectorAll('.ef-cq-symbol-input').forEach(inp => {
      const fresh = inp.cloneNode(true);
      inp.replaceWith(fresh);
      fresh.addEventListener('input', () => this._refreshCorrectDisplay());
    });
  }

  _reindexSymbols() {
    this._root.querySelectorAll('.ef-cq-symbol-row').forEach((row, i) => {
      row.dataset.symIndex = i;
      const inp = row.querySelector('.ef-cq-symbol-input');
      if (inp) inp.dataset.symIndex = i;
    });
  }

  _refreshCorrectDisplay() {
    const display = this._root.querySelector('#ef-cq-correct-display');
    const current = this._root.querySelector('#ef-cq-correct-answer')?.value || '';
    if (!display) return;

    const symbols = Array.from(this._root.querySelectorAll('.ef-cq-symbol-input'))
      .map(inp => inp.value);

    display.innerHTML = symbols.map(s => `
      <div class="ef-cq-answer-option ${s === current ? 'selected' : ''}"
           data-symbol="${CQFormUtils.escHtml(s)}">
        ${CQFormUtils.escHtml(s) || '&nbsp;&nbsp;'}
      </div>`).join('');

    this._bindCorrectDisplayEvents();
  }

  _bindCorrectDisplayEvents() {
    const display = this._root.querySelector('#ef-cq-correct-display');
    if (!display) return;
    display.querySelectorAll('.ef-cq-answer-option').forEach(opt => {
      opt.addEventListener('click', () => {
        display.querySelectorAll('.ef-cq-answer-option')
          .forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const hidden = this._root.querySelector('#ef-cq-correct-answer');
        if (hidden) hidden.value = opt.dataset.symbol;
      });
    });
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class CQMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-cq-field">
        <label class="ef-cq-label">
          Explanation <span class="ef-cq-optional">(optional)</span>
        </label>
        <textarea class="ef-cq-textarea" id="ef-cq-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${CQFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-cq-render-preview" id="ef-cq-explanation-preview"></div>
      </div>

      <div class="ef-cq-field">
        <label class="ef-cq-label">Difficulty</label>
        <select class="ef-cq-select" id="ef-cq-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-cq-row-2">
        <div class="ef-cq-field">
          <label class="ef-cq-label">
            Points <span class="ef-cq-optional">(optional)</span>
          </label>
          <input class="ef-cq-input" id="ef-cq-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-cq-field">
          <label class="ef-cq-label">
            Time Limit (sec) <span class="ef-cq-optional">(optional)</span>
          </label>
          <input class="ef-cq-input" id="ef-cq-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-cq-field">
        <label class="ef-cq-label">
          Tags <span class="ef-cq-optional">(comma separated)</span>
        </label>
        <input class="ef-cq-input" id="ef-cq-tags" type="text"
          placeholder="e.g. algebra, comparison"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    CQFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-cq-explanation'),
      this._root.querySelector('#ef-cq-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-cq-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-cq-difficulty')?.value || 'easy',
      points:      CQFormUtils.parseOptionalNumber(this._root.querySelector('#ef-cq-points')),
      time_limit:  CQFormUtils.parseOptionalNumber(this._root.querySelector('#ef-cq-time-limit')),
      tags:        CQFormUtils.parseTags(this._root.querySelector('#ef-cq-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class CompareQuantitiesFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('compare_quantities');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'compare_quantities') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Compare Quantities';
    const bodyClass    = isSkip ? 'ef-cq-body ef-cq-is-skip' : 'ef-cq-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new CQQuestionWidget(this);
    const mediaWidget = new CQMediaWidget(this);
    const ansWidget   = new CQAnswerWidget(this);
    const metaWidget  = new CQMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-cq-form">
        <div class="${bodyClass}" id="ef-cq-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-cq-footer">
          <button class="ef-cq-btn-save" id="ef-cq-btn-save">Save</button>
          <button class="ef-cq-btn-skip" id="ef-cq-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new CQQuestionWidget(this);
    this._mediaWidget = new CQMediaWidget(this);
    this._ansWidget   = new CQAnswerWidget(this);
    this._metaWidget  = new CQMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-cq-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-cq-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'compare_quantities') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Compare Quantities';
    const body      = this.querySelector('#ef-cq-body');
    const btn       = this.querySelector('#ef-cq-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'compare_quantities';
      delete this._question.original_type;
      body.classList.remove('ef-cq-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-cq-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-cq-question')?.focus();
      return;
    }

    const saved = {
      type:           this._question?.type || 'compare_quantities',
      question:       questionText,
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      quantity_a:     this._ansWidget.getQuantityA(),
      quantity_b:     this._ansWidget.getQuantityB(),
      symbol_options: this._ansWidget.getSymbols(),
      correct_answer: this._ansWidget.getCorrectAnswer(),
      user_response:  '',
      ...this._metaWidget.getData(),
    };

    if (this._question?.original_type) {
      saved.original_type = this._question.original_type;
    }

    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved },
    }));
  }

  // ── Collect all data ─────────────────────────────────

  _collectData() {
    return {
      type:           this._question?.type || 'compare_quantities',
      question:       this._qWidget.getValue(),
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      quantity_a:     this._ansWidget.getQuantityA(),
      quantity_b:     this._ansWidget.getQuantityB(),
      symbol_options: this._ansWidget.getSymbols(),
      correct_answer: this._ansWidget.getCorrectAnswer(),
      user_response:  '',
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('compare-quantities-form', CompareQuantitiesFormComponent);