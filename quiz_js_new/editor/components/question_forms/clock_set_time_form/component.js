// editor/components/question_forms/clock_set_time_form/component.js

// ── Utilities ────────────────────────────────────────────────────────────────

class CSTFormUtils {

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

  // Parse numbers array from comma-separated string — keeps raw strings
  static parseNumbersList(el) {
    const raw = el?.value || '';
    return raw.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

}

// ── Question Widget ───────────────────────────────────────────────────────────
// Owns: question textarea + focus render preview

class CSTQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-cst-field">
        <label class="ef-cst-label">Question Text</label>
        <textarea class="ef-cst-textarea" id="ef-cst-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${CSTFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-cst-render-preview" id="ef-cst-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    CSTFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-cst-question'),
      this._root.querySelector('#ef-cst-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-cst-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class CSTMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${CSTFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-cst-img-preview visible' : 'ef-cst-img-preview';

    return `
      <div class="ef-cst-collapsible" id="ef-cst-svg-section">
        <div class="ef-cst-collapsible-header" id="ef-cst-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-cst-collapsible-arrow">▼</span>
        </div>
        <div class="ef-cst-collapsible-body">
          <textarea class="ef-cst-textarea" id="ef-cst-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${CSTFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-cst-svg-preview" id="ef-cst-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-cst-remove-btn" id="ef-cst-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-cst-collapsible" id="ef-cst-img-section">
        <div class="ef-cst-collapsible-header" id="ef-cst-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-cst-collapsible-arrow">▼</span>
        </div>
        <div class="ef-cst-collapsible-body">
          <input class="ef-cst-input" id="ef-cst-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${CSTFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-cst-img-preview">${imgThumb}</div>
          <button class="ef-cst-remove-btn" id="ef-cst-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    CSTFormUtils.bindCollapsible(
      this._root.querySelector('#ef-cst-svg-toggle'),
      this._root.querySelector('#ef-cst-svg-section')
    );
    this._root.querySelector('#ef-cst-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-cst-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-cst-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-cst-svg').value = '';
      this._root.querySelector('#ef-cst-svg-preview').innerHTML = '';
    });

    CSTFormUtils.bindCollapsible(
      this._root.querySelector('#ef-cst-img-toggle'),
      this._root.querySelector('#ef-cst-img-section')
    );
    this._root.querySelector('#ef-cst-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-cst-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-cst-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-cst-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-cst-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-cst-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${CSTFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: correct answer (hour + minute), clock config (radius, numbers,
//       hour/minute hand color + length ratio), scoring method, description

class CSTAnswerWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const clock         = q.clock || {};
    const hourHand      = clock.hour_hand   || {};
    const minuteHand    = clock.minute_hand || {};
    const correctAnswer = q.correct_answer  || {};
    const scoringMethod = q.scoring_method  || 'exact';

    const hourVal   = correctAnswer.hour   != null ? correctAnswer.hour   : 4;
    const minuteVal = correctAnswer.minute != null ? correctAnswer.minute : 6;

    const radius      = clock.radius     != null ? clock.radius     : 120;
    const numbers     = Array.isArray(clock.numbers)
      ? clock.numbers.join(', ')
      : '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12';

    const hourColor    = hourHand.color        || 'red';
    const hourRatio    = hourHand.length_ratio  != null ? hourHand.length_ratio  : 0.65;
    const minuteColor  = minuteHand.color       || 'black';
    const minuteRatio  = minuteHand.length_ratio != null ? minuteHand.length_ratio : 0.9;

    return `
      <div class="ef-cst-section-divider">Correct Answer</div>

      <div class="ef-cst-row-2">
        <div class="ef-cst-field">
          <label class="ef-cst-label">Hour</label>
          <input class="ef-cst-input" id="ef-cst-answer-hour" type="text"
            placeholder="e.g. 4"
            value="${CSTFormUtils.escHtml(String(hourVal))}"
          />
        </div>
        <div class="ef-cst-field">
          <label class="ef-cst-label">Minute</label>
          <input class="ef-cst-input" id="ef-cst-answer-minute" type="text"
            placeholder="e.g. 6"
            value="${CSTFormUtils.escHtml(String(minuteVal))}"
          />
        </div>
      </div>

      <div class="ef-cst-section-divider">Clock Config</div>

      <div class="ef-cst-field">
        <label class="ef-cst-label">Radius</label>
        <input class="ef-cst-input ef-cst-input-short" id="ef-cst-radius" type="text"
          placeholder="e.g. 120"
          value="${CSTFormUtils.escHtml(String(radius))}"
        />
      </div>

      <div class="ef-cst-field">
        <label class="ef-cst-label">
          Numbers
          <span class="ef-cst-optional">(comma separated)</span>
        </label>
        <input class="ef-cst-input" id="ef-cst-numbers" type="text"
          placeholder="e.g. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12"
          value="${CSTFormUtils.escHtml(numbers)}"
        />
      </div>

      <div class="ef-cst-hand-grid">
        <div class="ef-cst-hand-card">
          <div class="ef-cst-hand-title">Hour Hand</div>
          <div class="ef-cst-field">
            <label class="ef-cst-label">Color</label>
            <input class="ef-cst-input" id="ef-cst-hour-color" type="text"
              placeholder="e.g. red"
              value="${CSTFormUtils.escHtml(hourColor)}"
            />
          </div>
          <div class="ef-cst-field">
            <label class="ef-cst-label">Length Ratio</label>
            <input class="ef-cst-input" id="ef-cst-hour-ratio" type="text"
              placeholder="e.g. 0.65"
              value="${CSTFormUtils.escHtml(String(hourRatio))}"
            />
          </div>
        </div>
        <div class="ef-cst-hand-card">
          <div class="ef-cst-hand-title">Minute Hand</div>
          <div class="ef-cst-field">
            <label class="ef-cst-label">Color</label>
            <input class="ef-cst-input" id="ef-cst-minute-color" type="text"
              placeholder="e.g. black"
              value="${CSTFormUtils.escHtml(minuteColor)}"
            />
          </div>
          <div class="ef-cst-field">
            <label class="ef-cst-label">Length Ratio</label>
            <input class="ef-cst-input" id="ef-cst-minute-ratio" type="text"
              placeholder="e.g. 0.9"
              value="${CSTFormUtils.escHtml(String(minuteRatio))}"
            />
          </div>
        </div>
      </div>

      <div class="ef-cst-section-divider">Scoring &amp; Description</div>

      <div class="ef-cst-field">
        <label class="ef-cst-label">Scoring Method</label>
        <select class="ef-cst-select" id="ef-cst-scoring-method">
          <option value="exact"   ${scoringMethod === 'exact'   ? 'selected' : ''}>Exact — full marks only if both hands correct</option>
          <option value="partial" ${scoringMethod === 'partial' ? 'selected' : ''}>Partial — credit per correct hand</option>
        </select>
      </div>

      <div class="ef-cst-field">
        <label class="ef-cst-label">
          Description
          <span class="ef-cst-optional">(optional)</span>
        </label>
        <textarea class="ef-cst-textarea" id="ef-cst-description"
          rows="2"
          placeholder="Additional instruction for this question..."
        >${CSTFormUtils.escHtml(q.description || '')}</textarea>
      </div>

      <div class="ef-cst-error" id="ef-cst-error"></div>
    `;
  }

  bindEvents() {
    // No complex interactions needed — all plain inputs
  }

  getCorrectAnswer() {
    const hour   = this._root.querySelector('#ef-cst-answer-hour')?.value.trim()   || '';
    const minute = this._root.querySelector('#ef-cst-answer-minute')?.value.trim() || '';
    return {
      hour:   hour   !== '' ? hour   : null,
      minute: minute !== '' ? minute : null,
    };
  }

  getClock() {
    const radius      = this._root.querySelector('#ef-cst-radius')?.value.trim()       || '120';
    const numbersRaw  = this._root.querySelector('#ef-cst-numbers')?.value             || '';
    const hourColor   = this._root.querySelector('#ef-cst-hour-color')?.value.trim()   || 'red';
    const hourRatio   = this._root.querySelector('#ef-cst-hour-ratio')?.value.trim()   || '0.65';
    const minuteColor = this._root.querySelector('#ef-cst-minute-color')?.value.trim() || 'black';
    const minuteRatio = this._root.querySelector('#ef-cst-minute-ratio')?.value.trim() || '0.9';

    const numbers = numbersRaw
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    return {
      radius:       radius,
      numbers,
      hour_hand:    { color: hourColor,   length_ratio: hourRatio   },
      minute_hand:  { color: minuteColor, length_ratio: minuteRatio },
    };
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-cst-scoring-method')?.value || 'exact';
  }

  getDescription() {
    return this._root.querySelector('#ef-cst-description')?.value.trim() || '';
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-cst-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class CSTMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-cst-field">
        <label class="ef-cst-label">
          Explanation
          <span class="ef-cst-optional">(optional)</span>
        </label>
        <textarea class="ef-cst-textarea" id="ef-cst-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${CSTFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-cst-render-preview" id="ef-cst-explanation-preview"></div>
      </div>

      <div class="ef-cst-field">
        <label class="ef-cst-label">Difficulty</label>
        <select class="ef-cst-select" id="ef-cst-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-cst-row-2">
        <div class="ef-cst-field">
          <label class="ef-cst-label">
            Points <span class="ef-cst-optional">(optional)</span>
          </label>
          <input class="ef-cst-input" id="ef-cst-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-cst-field">
          <label class="ef-cst-label">
            Time Limit (sec) <span class="ef-cst-optional">(optional)</span>
          </label>
          <input class="ef-cst-input" id="ef-cst-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-cst-field">
        <label class="ef-cst-label">
          Tags <span class="ef-cst-optional">(comma separated)</span>
        </label>
        <input class="ef-cst-input" id="ef-cst-tags" type="text"
          placeholder="e.g. math, time"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    CSTFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-cst-explanation'),
      this._root.querySelector('#ef-cst-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-cst-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-cst-difficulty')?.value || 'easy',
      points:      CSTFormUtils.parseOptionalNumber(this._root.querySelector('#ef-cst-points')),
      time_limit:  CSTFormUtils.parseOptionalNumber(this._root.querySelector('#ef-cst-time-limit')),
      tags:        CSTFormUtils.parseTags(this._root.querySelector('#ef-cst-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class CSTFormComponent extends HTMLElement {

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
    const q        = this._question || EditorFormRegistry.getDefault('clock_set_time');
    const isSkip   = q.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'clock_set_time') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Clock';
    const bodyClass    = isSkip ? 'ef-cst-body ef-cst-is-skip' : 'ef-cst-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new CSTQuestionWidget(this);
    const mediaWidget = new CSTMediaWidget(this);
    const ansWidget   = new CSTAnswerWidget(this);
    const metaWidget  = new CSTMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-cst-form">
        <div class="${bodyClass}" id="ef-cst-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-cst-footer">
          <button class="ef-cst-btn-save" id="ef-cst-btn-save">Save</button>
          <button class="ef-cst-btn-skip" id="ef-cst-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new CSTQuestionWidget(this);
    this._mediaWidget = new CSTMediaWidget(this);
    this._ansWidget   = new CSTAnswerWidget(this);
    this._metaWidget  = new CSTMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-cst-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-cst-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'clock_set_time') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Clock';
    const body      = this.querySelector('#ef-cst-body');
    const btn       = this.querySelector('#ef-cst-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'clock_set_time';
      delete this._question.original_type;
      body.classList.remove('ef-cst-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-cst-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-cst-question')?.focus();
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

  // ── Collect all data ─────────────────────────────────

  _collectData() {
    return {
      type:           this._question?.type || 'clock_set_time',
      question:       this._qWidget.getValue(),
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      clock:          this._ansWidget.getClock(),
      correct_answer: this._ansWidget.getCorrectAnswer(),
      user_response:  { hour: null, minute: null },
      description:    this._ansWidget.getDescription(),
      scoring_method: this._ansWidget.getScoringMethod(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('clock-set-time-form', CSTFormComponent);