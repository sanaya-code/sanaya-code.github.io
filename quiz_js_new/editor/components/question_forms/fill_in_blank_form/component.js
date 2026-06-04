// editor/components/question_forms/fill_in_blank_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class FIBFormUtils {

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
// Owns: question textarea + focus preview + live blank detector
// Unique to fill-in-blank: detects '____' and shows found/missing status

class FIBQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const hasBlank = (q.question || '').includes('____');
    return `
      <div class="ef-fib-field">
        <label class="ef-fib-label">Question Text</label>
        <textarea class="ef-fib-textarea" id="ef-fib-question"
          rows="3"
          placeholder="e.g. Solid state of water is called ____."
        >${FIBFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-fib-render-preview" id="ef-fib-question-preview"></div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div class="ef-fib-blank-hint">
            Type <code>____</code> (4 underscores) where the blank should appear
          </div>
          <span class="ef-fib-blank-status ${hasBlank ? 'found' : 'missing'}"
                id="ef-fib-blank-status">
            ${hasBlank ? '✓ Blank found' : '⚠ No blank detected'}
          </span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const input   = this._root.querySelector('#ef-fib-question');
    const preview = this._root.querySelector('#ef-fib-question-preview');
    const status  = this._root.querySelector('#ef-fib-blank-status');
    if (!input) return;

    input.addEventListener('focus', () => {
      preview.innerHTML = input.value;
      preview.classList.add('visible');
    });
    input.addEventListener('input', () => {
      preview.innerHTML = input.value;
      this._updateBlankStatus(input.value, status);
    });
  }

  getValue() {
    return this._root.querySelector('#ef-fib-question')?.value.trim() || '';
  }

  // ── Private ──────────────────────────────────────────

  _updateBlankStatus(text, statusEl) {
    if (!statusEl) return;
    const hasBlank = text.includes('____');
    statusEl.textContent = hasBlank ? '✓ Blank found' : '⚠ No blank detected';
    statusEl.className   = 'ef-fib-blank-status ' + (hasBlank ? 'found' : 'missing');
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class FIBMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${FIBFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-fib-img-preview visible' : 'ef-fib-img-preview';

    return `
      <div class="ef-fib-collapsible" id="ef-fib-svg-section">
        <div class="ef-fib-collapsible-header" id="ef-fib-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-fib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-fib-collapsible-body">
          <textarea class="ef-fib-textarea" id="ef-fib-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${FIBFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-fib-svg-preview" id="ef-fib-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-fib-remove-btn" id="ef-fib-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-fib-collapsible" id="ef-fib-img-section">
        <div class="ef-fib-collapsible-header" id="ef-fib-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-fib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-fib-collapsible-body">
          <input class="ef-fib-input" id="ef-fib-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${FIBFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-fib-img-preview">${imgThumb}</div>
          <button class="ef-fib-remove-btn" id="ef-fib-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    FIBFormUtils.bindCollapsible(
      this._root.querySelector('#ef-fib-svg-toggle'),
      this._root.querySelector('#ef-fib-svg-section')
    );
    this._root.querySelector('#ef-fib-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-fib-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-fib-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-fib-svg').value = '';
      this._root.querySelector('#ef-fib-svg-preview').innerHTML = '';
    });

    FIBFormUtils.bindCollapsible(
      this._root.querySelector('#ef-fib-img-toggle'),
      this._root.querySelector('#ef-fib-img-section')
    );
    this._root.querySelector('#ef-fib-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-fib-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-fib-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-fib-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-fib-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-fib-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${FIBFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: correct answer input (green) + acceptable answers list (add / delete)
// Unique to fill-in-blank — no options list, no drag, no radios/checkboxes

class FIBAnswerWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const answers = Array.isArray(q.acceptable_answers) ? q.acceptable_answers : [];
    return `
      <div class="ef-fib-field">
        <label class="ef-fib-label">Correct Answer</label>
        <input class="ef-fib-correct-input" id="ef-fib-correct-answer"
          type="text"
          placeholder="The primary correct answer e.g. ice"
          value="${FIBFormUtils.escHtml(q.correct_answer || '')}"
        />
      </div>

      <div class="ef-fib-field">
        <div class="ef-fib-options-header">
          <label class="ef-fib-label">
            Acceptable Answers
            <span class="ef-fib-optional">(optional)</span>
          </label>
          <button class="ef-fib-add-answer-btn" id="ef-fib-add-answer">
            + Add Answer
          </button>
        </div>
        <div class="ef-fib-answers-hint">
          All answers that will be accepted as correct
          (including the canonical answer above)
        </div>
        <div class="ef-fib-answers-list-wrap" id="ef-fib-answers-list">
          ${answers.map((a, i) => this._answerRowHTML(a, i)).join('')}
        </div>
        <div class="ef-fib-error" id="ef-fib-error"></div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-fib-add-answer')
      ?.addEventListener('click', () => this.addAnswerRow());

    const ansList = this._root.querySelector('#ef-fib-answers-list');
    if (ansList) {
      ansList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ef-fib-answer-delete')) return;
        e.target.closest('.ef-fib-answer-row').remove();
        this._reindexAnswers();
      });
    }
  }

  addAnswerRow() {
    const list  = this._root.querySelector('#ef-fib-answers-list');
    const count = list.querySelectorAll('.ef-fib-answer-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._answerRowHTML('', count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexAnswers();
    row.querySelector('.ef-fib-answer-input')?.focus();
  }

  getCorrectAnswer() {
    return this._root.querySelector('#ef-fib-correct-answer')?.value.trim() || '';
  }

  getAcceptableAnswers() {
    return Array.from(this._root.querySelectorAll('.ef-fib-answer-input'))
      .map(inp => inp.value.trim())
      .filter(a => a.length > 0);
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-fib-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private ──────────────────────────────────────────

  _answerRowHTML(text, index) {
    return `
      <div class="ef-fib-answer-row" data-ans-index="${index}">
        <span class="ef-fib-answer-bullet">◦</span>
        <input type="text"
               class="ef-fib-answer-input"
               placeholder="Acceptable answer..."
               value="${FIBFormUtils.escHtml(text)}"
               data-ans-index="${index}"
        />
        <button class="ef-fib-answer-delete" title="Remove answer">✕</button>
      </div>
    `;
  }

  _reindexAnswers() {
    this._root.querySelectorAll('#ef-fib-answers-list .ef-fib-answer-row')
      .forEach((row, i) => {
        row.dataset.ansIndex = i;
        const inp = row.querySelector('.ef-fib-answer-input');
        if (inp) inp.dataset.ansIndex = i;
      });
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class FIBMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-fib-field">
        <label class="ef-fib-label">
          Explanation <span class="ef-fib-optional">(optional)</span>
        </label>
        <textarea class="ef-fib-textarea" id="ef-fib-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${FIBFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-fib-render-preview" id="ef-fib-explanation-preview"></div>
      </div>

      <div class="ef-fib-field">
        <label class="ef-fib-label">Difficulty</label>
        <select class="ef-fib-select" id="ef-fib-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-fib-row-2">
        <div class="ef-fib-field">
          <label class="ef-fib-label">
            Points <span class="ef-fib-optional">(optional)</span>
          </label>
          <input class="ef-fib-input" id="ef-fib-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-fib-field">
          <label class="ef-fib-label">
            Time Limit (sec) <span class="ef-fib-optional">(optional)</span>
          </label>
          <input class="ef-fib-input" id="ef-fib-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-fib-field">
        <label class="ef-fib-label">
          Tags <span class="ef-fib-optional">(comma separated)</span>
        </label>
        <input class="ef-fib-input" id="ef-fib-tags" type="text"
          placeholder="e.g. science, states-of-matter"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    FIBFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-fib-explanation'),
      this._root.querySelector('#ef-fib-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-fib-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-fib-difficulty')?.value || 'easy',
      points:      FIBFormUtils.parseOptionalNumber(this._root.querySelector('#ef-fib-points')),
      time_limit:  FIBFormUtils.parseOptionalNumber(this._root.querySelector('#ef-fib-time-limit')),
      tags:        FIBFormUtils.parseTags(this._root.querySelector('#ef-fib-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class FillInBlankFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('fill_in_blank');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'fill_in_blank') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Fill in Blank';
    const bodyClass    = isSkip ? 'ef-fib-body ef-fib-is-skip' : 'ef-fib-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new FIBQuestionWidget(this);
    const mediaWidget = new FIBMediaWidget(this);
    const ansWidget   = new FIBAnswerWidget(this);
    const metaWidget  = new FIBMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-fib-form">
        <div class="${bodyClass}" id="ef-fib-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-fib-footer">
          <button class="ef-fib-btn-save" id="ef-fib-btn-save">Save</button>
          <button class="ef-fib-btn-skip" id="ef-fib-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new FIBQuestionWidget(this);
    this._mediaWidget = new FIBMediaWidget(this);
    this._ansWidget   = new FIBAnswerWidget(this);
    this._metaWidget  = new FIBMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-fib-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-fib-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'fill_in_blank') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Fill in Blank';
    const body      = this.querySelector('#ef-fib-body');
    const btn       = this.querySelector('#ef-fib-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'fill_in_blank';
      delete this._question.original_type;
      body.classList.remove('ef-fib-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-fib-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-fib-question')?.focus();
      return;
    }

    const saved = {
      type:               this._question?.type || 'fill_in_blank',
      question:           questionText,
      svg_content:        this._mediaWidget.getSvg(),
      img_url:            this._mediaWidget.getImgUrl(),
      correct_answer:     this._ansWidget.getCorrectAnswer(),
      acceptable_answers: this._ansWidget.getAcceptableAnswers(),
      user_response:      '',
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
      type:               this._question?.type || 'fill_in_blank',
      question:           this._qWidget.getValue(),
      svg_content:        this._mediaWidget.getSvg(),
      img_url:            this._mediaWidget.getImgUrl(),
      correct_answer:     this._ansWidget.getCorrectAnswer(),
      acceptable_answers: this._ansWidget.getAcceptableAnswers(),
      user_response:      '',
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('fill-in-blank-form', FillInBlankFormComponent);