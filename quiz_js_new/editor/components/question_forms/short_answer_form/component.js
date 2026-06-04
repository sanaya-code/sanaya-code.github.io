// editor/components/question_forms/short_answer_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class SAFormUtils {

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

class SAQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-sa-field">
        <label class="ef-sa-label">Question Text</label>
        <textarea class="ef-sa-textarea" id="ef-sa-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${SAFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-sa-render-preview" id="ef-sa-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    SAFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-sa-question'),
      this._root.querySelector('#ef-sa-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-sa-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class SAMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${SAFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-sa-img-preview visible' : 'ef-sa-img-preview';

    return `
      <div class="ef-sa-collapsible" id="ef-sa-svg-section">
        <div class="ef-sa-collapsible-header" id="ef-sa-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-sa-collapsible-arrow">▼</span>
        </div>
        <div class="ef-sa-collapsible-body">
          <textarea class="ef-sa-textarea" id="ef-sa-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${SAFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-sa-svg-preview" id="ef-sa-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-sa-remove-btn" id="ef-sa-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-sa-collapsible" id="ef-sa-img-section">
        <div class="ef-sa-collapsible-header" id="ef-sa-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-sa-collapsible-arrow">▼</span>
        </div>
        <div class="ef-sa-collapsible-body">
          <input class="ef-sa-input" id="ef-sa-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${SAFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-sa-img-preview">${imgThumb}</div>
          <button class="ef-sa-remove-btn" id="ef-sa-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    SAFormUtils.bindCollapsible(
      this._root.querySelector('#ef-sa-svg-toggle'),
      this._root.querySelector('#ef-sa-svg-section')
    );
    this._root.querySelector('#ef-sa-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-sa-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-sa-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-sa-svg').value = '';
      this._root.querySelector('#ef-sa-svg-preview').innerHTML = '';
    });

    SAFormUtils.bindCollapsible(
      this._root.querySelector('#ef-sa-img-toggle'),
      this._root.querySelector('#ef-sa-img-section')
    );
    this._root.querySelector('#ef-sa-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-sa-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-sa-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-sa-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-sa-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-sa-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${SAFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: correct answer input + acceptable variations list (add / delete)
// Unique to short_answer — no options list, no drag, no checkboxes/radios

class SAAnswerWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const variations = Array.isArray(q.acceptable_variations)
      ? q.acceptable_variations : [];

    return `
      <div class="ef-sa-field">
        <label class="ef-sa-label">Correct Answer</label>
        <div class="ef-sa-correct-wrap">
          <input class="ef-sa-correct-input" id="ef-sa-correct-answer"
            type="text"
            placeholder="Enter the canonical correct answer..."
            value="${SAFormUtils.escHtml(q.correct_answer || '')}"
          />
        </div>
      </div>

      <div class="ef-sa-field">
        <div class="ef-sa-options-header">
          <label class="ef-sa-label">
            Acceptable Variations
            <span class="ef-sa-optional">(optional)</span>
          </label>
          <button class="ef-sa-add-variation-btn" id="ef-sa-add-variation">
            + Add Variation
          </button>
        </div>
        <div class="ef-sa-variations-hint">
          Other answers that will be accepted as correct
          (e.g. alternate spellings, abbreviations)
        </div>
        <div class="ef-sa-variations-list" id="ef-sa-variations-list">
          ${variations.map((v, i) => this._variationRowHTML(v, i)).join('')}
        </div>
        <div class="ef-sa-error" id="ef-sa-error"></div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-sa-add-variation')
      ?.addEventListener('click', () => this.addVariationRow());

    const varList = this._root.querySelector('#ef-sa-variations-list');
    if (varList) {
      varList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ef-sa-variation-delete')) return;
        e.target.closest('.ef-sa-variation-row').remove();
        this._reindexVariations();
      });
    }
  }

  addVariationRow() {
    const list  = this._root.querySelector('#ef-sa-variations-list');
    const count = list.querySelectorAll('.ef-sa-variation-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._variationRowHTML('', count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexVariations();
    row.querySelector('.ef-sa-variation-input')?.focus();
  }

  getCorrectAnswer() {
    return this._root.querySelector('#ef-sa-correct-answer')?.value.trim() || '';
  }

  getVariations() {
    return Array.from(this._root.querySelectorAll('.ef-sa-variation-input'))
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-sa-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private ──────────────────────────────────────────

  _variationRowHTML(text, index) {
    return `
      <div class="ef-sa-variation-row" data-var-index="${index}">
        <span class="ef-sa-variation-bullet">◦</span>
        <input type="text"
               class="ef-sa-variation-input"
               placeholder="Acceptable variation..."
               value="${SAFormUtils.escHtml(text)}"
               data-var-index="${index}"
        />
        <button class="ef-sa-variation-delete" title="Remove variation">✕</button>
      </div>
    `;
  }

  _reindexVariations() {
    this._root.querySelectorAll('.ef-sa-variation-row').forEach((row, i) => {
      row.dataset.varIndex = i;
      const inp = row.querySelector('.ef-sa-variation-input');
      if (inp) inp.dataset.varIndex = i;
    });
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class SAMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-sa-field">
        <label class="ef-sa-label">
          Explanation <span class="ef-sa-optional">(optional)</span>
        </label>
        <textarea class="ef-sa-textarea" id="ef-sa-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${SAFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-sa-render-preview" id="ef-sa-explanation-preview"></div>
      </div>

      <div class="ef-sa-field">
        <label class="ef-sa-label">Difficulty</label>
        <select class="ef-sa-select" id="ef-sa-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-sa-row-2">
        <div class="ef-sa-field">
          <label class="ef-sa-label">
            Points <span class="ef-sa-optional">(optional)</span>
          </label>
          <input class="ef-sa-input" id="ef-sa-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-sa-field">
          <label class="ef-sa-label">
            Time Limit (sec) <span class="ef-sa-optional">(optional)</span>
          </label>
          <input class="ef-sa-input" id="ef-sa-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-sa-field">
        <label class="ef-sa-label">
          Tags <span class="ef-sa-optional">(comma separated)</span>
        </label>
        <input class="ef-sa-input" id="ef-sa-tags" type="text"
          placeholder="e.g. geography, capitals"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    SAFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-sa-explanation'),
      this._root.querySelector('#ef-sa-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-sa-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-sa-difficulty')?.value || 'easy',
      points:      SAFormUtils.parseOptionalNumber(this._root.querySelector('#ef-sa-points')),
      time_limit:  SAFormUtils.parseOptionalNumber(this._root.querySelector('#ef-sa-time-limit')),
      tags:        SAFormUtils.parseTags(this._root.querySelector('#ef-sa-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class ShortAnswerFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('short_answer');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'short_answer') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Short Answer';
    const bodyClass    = isSkip ? 'ef-sa-body ef-sa-is-skip' : 'ef-sa-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new SAQuestionWidget(this);
    const mediaWidget = new SAMediaWidget(this);
    const ansWidget   = new SAAnswerWidget(this);
    const metaWidget  = new SAMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-sa-form">
        <div class="${bodyClass}" id="ef-sa-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-sa-footer">
          <button class="ef-sa-btn-save" id="ef-sa-btn-save">Save</button>
          <button class="ef-sa-btn-skip" id="ef-sa-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new SAQuestionWidget(this);
    this._mediaWidget = new SAMediaWidget(this);
    this._ansWidget   = new SAAnswerWidget(this);
    this._metaWidget  = new SAMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-sa-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-sa-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'short_answer') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Short Answer';
    const body      = this.querySelector('#ef-sa-body');
    const btn       = this.querySelector('#ef-sa-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'short_answer';
      delete this._question.original_type;
      body.classList.remove('ef-sa-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-sa-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-sa-question')?.focus();
      return;
    }

    const saved = {
      type:                  this._question?.type || 'short_answer',
      question:              questionText,
      svg_content:           this._mediaWidget.getSvg(),
      img_url:               this._mediaWidget.getImgUrl(),
      correct_answer:        this._ansWidget.getCorrectAnswer(),
      acceptable_variations: this._ansWidget.getVariations(),
      user_response:         '',
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
      type:                  this._question?.type || 'short_answer',
      question:              this._qWidget.getValue(),
      svg_content:           this._mediaWidget.getSvg(),
      img_url:               this._mediaWidget.getImgUrl(),
      correct_answer:        this._ansWidget.getCorrectAnswer(),
      acceptable_variations: this._ansWidget.getVariations(),
      user_response:         '',
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('short-answer-form', ShortAnswerFormComponent);