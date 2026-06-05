// editor/components/question_forms/image_compare_quantities_tick_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class ICTFormUtils {

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

class ICTQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-ict-field">
        <label class="ef-ict-label">Question Text</label>
        <textarea class="ef-ict-textarea" id="ef-ict-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${ICTFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-ict-render-preview" id="ef-ict-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    ICTFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ict-question'),
      this._root.querySelector('#ef-ict-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-ict-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class ICTMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${ICTFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-ict-img-preview visible' : 'ef-ict-img-preview';

    return `
      <div class="ef-ict-collapsible" id="ef-ict-svg-section">
        <div class="ef-ict-collapsible-header" id="ef-ict-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-ict-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ict-collapsible-body">
          <textarea class="ef-ict-textarea" id="ef-ict-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${ICTFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-ict-svg-preview" id="ef-ict-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-ict-remove-btn" id="ef-ict-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-ict-collapsible" id="ef-ict-img-section">
        <div class="ef-ict-collapsible-header" id="ef-ict-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-ict-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ict-collapsible-body">
          <input class="ef-ict-input" id="ef-ict-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${ICTFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-ict-img-preview">${imgThumb}</div>
          <button class="ef-ict-remove-btn" id="ef-ict-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    ICTFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ict-svg-toggle'),
      this._root.querySelector('#ef-ict-svg-section')
    );
    this._root.querySelector('#ef-ict-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-ict-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-ict-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ict-svg').value = '';
      this._root.querySelector('#ef-ict-svg-preview').innerHTML = '';
    });

    ICTFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ict-img-toggle'),
      this._root.querySelector('#ef-ict-img-section')
    );
    this._root.querySelector('#ef-ict-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-ict-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ict-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-ict-svg')?.value.trim()     || ''; }
  getImgUrl() { return this._root.querySelector('#ef-ict-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-ict-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${ICTFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: partition direction, tick zones grid, correct answer Left/Right radios,
//       feedback grid (correct / incorrect)
// Unique to image_compare_quantities_tick form

class ICTAnswerWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const dir      = q.partition_direction || 'vertical';
    const zones    = q.tick_zones          || { left: 'top_left', right: 'top_right' };
    const feedback = q.feedback            || { correct: '', incorrect: '' };
    const ca       = q.correct_answer      || '';

    const ZONE_OPTIONS = ['top_left', 'top_right', 'bottom_left', 'bottom_right'];
    const zoneSelect = (id, current) => `
      <select class="ef-ict-select" id="${id}">
        ${ZONE_OPTIONS.map(z => `
          <option value="${z}" ${current === z ? 'selected' : ''}>
            ${z.replace(/_/g, ' ')}
          </option>`).join('')}
      </select>`;

    return `
      <div class="ef-ict-field">
        <label class="ef-ict-label">Partition Direction</label>
        <select class="ef-ict-select" id="ef-ict-partition-dir">
          <option value="vertical"   ${dir === 'vertical'   ? 'selected' : ''}>
            Vertical (left / right)
          </option>
          <option value="horizontal" ${dir === 'horizontal' ? 'selected' : ''}>
            Horizontal (top / bottom)
          </option>
        </select>
      </div>

      <div class="ef-ict-field">
        <label class="ef-ict-label">Tick Zones</label>
        <div class="ef-ict-zones-grid">
          <div class="ef-ict-field">
            <label class="ef-ict-label" style="font-size:10px">Left Zone</label>
            ${zoneSelect('ef-ict-zone-left', zones.left)}
          </div>
          <div class="ef-ict-field">
            <label class="ef-ict-label" style="font-size:10px">Right Zone</label>
            ${zoneSelect('ef-ict-zone-right', zones.right)}
          </div>
        </div>
      </div>

      <div class="ef-ict-field">
        <label class="ef-ict-label">Correct Answer</label>
        <div class="ef-ict-answer-group">
          <label class="ef-ict-answer-option ${ca === 'left' ? 'selected-left' : ''}"
                 id="ef-ict-opt-left">
            <input type="radio" name="ef-ict-correct" value="left"
                   ${ca === 'left' ? 'checked' : ''} />
            ← Left
          </label>
          <label class="ef-ict-answer-option ${ca === 'right' ? 'selected-right' : ''}"
                 id="ef-ict-opt-right">
            <input type="radio" name="ef-ict-correct" value="right"
                   ${ca === 'right' ? 'checked' : ''} />
            Right →
          </label>
        </div>
      </div>

      <div class="ef-ict-field">
        <label class="ef-ict-label">
          Feedback <span class="ef-ict-optional">(optional)</span>
        </label>
        <div class="ef-ict-feedback-grid">
          <div class="ef-ict-field">
            <label class="ef-ict-label" style="font-size:10px">✓ Correct</label>
            <input class="ef-ict-input" id="ef-ict-feedback-correct" type="text"
              placeholder="e.g. Correct! You picked the right side."
              value="${ICTFormUtils.escHtml(feedback.correct || '')}"
            />
          </div>
          <div class="ef-ict-field">
            <label class="ef-ict-label" style="font-size:10px">✗ Incorrect</label>
            <input class="ef-ict-input" id="ef-ict-feedback-incorrect" type="text"
              placeholder="e.g. Try again. Count carefully."
              value="${ICTFormUtils.escHtml(feedback.incorrect || '')}"
            />
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelectorAll('input[name="ef-ict-correct"]').forEach(radio => {
      radio.addEventListener('change', () => this._updateAnswerHighlight());
    });
  }

  getPartitionDirection() {
    return this._root.querySelector('#ef-ict-partition-dir')?.value || 'vertical';
  }

  getTickZones() {
    return {
      left:  this._root.querySelector('#ef-ict-zone-left')?.value  || 'top_left',
      right: this._root.querySelector('#ef-ict-zone-right')?.value || 'top_right',
    };
  }

  getCorrectAnswer() {
    return this._root.querySelector('input[name="ef-ict-correct"]:checked')?.value || '';
  }

  getFeedback() {
    return {
      correct:   this._root.querySelector('#ef-ict-feedback-correct')?.value.trim()   || '',
      incorrect: this._root.querySelector('#ef-ict-feedback-incorrect')?.value.trim() || '',
    };
  }

  // ── Private ──────────────────────────────────────────

  _updateAnswerHighlight() {
    const val      = this._root.querySelector('input[name="ef-ict-correct"]:checked')?.value;
    const leftOpt  = this._root.querySelector('#ef-ict-opt-left');
    const rightOpt = this._root.querySelector('#ef-ict-opt-right');
    leftOpt?.classList.toggle('selected-left',   val === 'left');
    rightOpt?.classList.toggle('selected-right', val === 'right');
    if (val === 'left')  rightOpt?.classList.remove('selected-right');
    if (val === 'right') leftOpt?.classList.remove('selected-left');
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class ICTMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-ict-field">
        <label class="ef-ict-label">
          Explanation <span class="ef-ict-optional">(optional)</span>
        </label>
        <textarea class="ef-ict-textarea" id="ef-ict-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${ICTFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-ict-render-preview" id="ef-ict-explanation-preview"></div>
      </div>

      <div class="ef-ict-field">
        <label class="ef-ict-label">Difficulty</label>
        <select class="ef-ict-select" id="ef-ict-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-ict-row-2">
        <div class="ef-ict-field">
          <label class="ef-ict-label">
            Points <span class="ef-ict-optional">(optional)</span>
          </label>
          <input class="ef-ict-input" id="ef-ict-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-ict-field">
          <label class="ef-ict-label">
            Time Limit (sec) <span class="ef-ict-optional">(optional)</span>
          </label>
          <input class="ef-ict-input" id="ef-ict-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-ict-field">
        <label class="ef-ict-label">
          Tags <span class="ef-ict-optional">(comma separated)</span>
        </label>
        <input class="ef-ict-input" id="ef-ict-tags" type="text"
          placeholder="e.g. counting, visual reasoning"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    ICTFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ict-explanation'),
      this._root.querySelector('#ef-ict-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-ict-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-ict-difficulty')?.value || 'easy',
      points:      ICTFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ict-points')),
      time_limit:  ICTFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ict-time-limit')),
      tags:        ICTFormUtils.parseTags(this._root.querySelector('#ef-ict-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class ImageCompareQuantitiesTickFormComponent extends HTMLElement {

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
    const q          = this._question ||
      EditorFormRegistry.getDefault('image_compare_quantities_tick');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'image_compare_quantities_tick') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Image Compare Tick';
    const bodyClass    = isSkip ? 'ef-ict-body ef-ict-is-skip' : 'ef-ict-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new ICTQuestionWidget(this);
    const mediaWidget = new ICTMediaWidget(this);
    const ansWidget   = new ICTAnswerWidget(this);
    const metaWidget  = new ICTMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-ict-form">
        <div class="${bodyClass}" id="ef-ict-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-ict-footer">
          <button class="ef-ict-btn-save" id="ef-ict-btn-save">Save</button>
          <button class="ef-ict-btn-skip" id="ef-ict-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new ICTQuestionWidget(this);
    this._mediaWidget = new ICTMediaWidget(this);
    this._ansWidget   = new ICTAnswerWidget(this);
    this._metaWidget  = new ICTMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-ict-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-ict-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'image_compare_quantities_tick') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Image Compare Tick';
    const body      = this.querySelector('#ef-ict-body');
    const btn       = this.querySelector('#ef-ict-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'image_compare_quantities_tick';
      delete this._question.original_type;
      body.classList.remove('ef-ict-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-ict-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const saved = {
      type:                this._question?.type || 'image_compare_quantities_tick',
      question:            this._qWidget.getValue(),
      svg_content:         this._mediaWidget.getSvg(),
      img_url:             this._mediaWidget.getImgUrl(),
      partition_direction: this._ansWidget.getPartitionDirection(),
      tick_zones:          this._ansWidget.getTickZones(),
      correct_answer:      this._ansWidget.getCorrectAnswer(),
      user_response:       null,
      feedback:            this._ansWidget.getFeedback(),
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
      type:                this._question?.type || 'image_compare_quantities_tick',
      question:            this._qWidget.getValue(),
      svg_content:         this._mediaWidget.getSvg(),
      img_url:             this._mediaWidget.getImgUrl(),
      partition_direction: this._ansWidget.getPartitionDirection(),
      tick_zones:          this._ansWidget.getTickZones(),
      correct_answer:      this._ansWidget.getCorrectAnswer(),
      user_response:       null,
      feedback:            this._ansWidget.getFeedback(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('compare-image-objects-form', ImageCompareQuantitiesTickFormComponent);