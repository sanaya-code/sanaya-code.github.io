// editor/components/question_forms/true_false_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class TFFormUtils {

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

class TFQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-tf-field">
        <label class="ef-tf-label">Question Text</label>
        <textarea class="ef-tf-textarea" id="ef-tf-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${TFFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-tf-render-preview" id="ef-tf-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    TFFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-tf-question'),
      this._root.querySelector('#ef-tf-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-tf-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class TFMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${TFFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-tf-img-preview visible' : 'ef-tf-img-preview';

    return `
      <div class="ef-tf-collapsible" id="ef-tf-svg-section">
        <div class="ef-tf-collapsible-header" id="ef-tf-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-tf-collapsible-arrow">▼</span>
        </div>
        <div class="ef-tf-collapsible-body">
          <textarea class="ef-tf-textarea" id="ef-tf-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${TFFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-tf-svg-preview" id="ef-tf-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-tf-remove-btn" id="ef-tf-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-tf-collapsible" id="ef-tf-img-section">
        <div class="ef-tf-collapsible-header" id="ef-tf-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-tf-collapsible-arrow">▼</span>
        </div>
        <div class="ef-tf-collapsible-body">
          <input class="ef-tf-input" id="ef-tf-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${TFFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-tf-img-preview">${imgThumb}</div>
          <button class="ef-tf-remove-btn" id="ef-tf-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    TFFormUtils.bindCollapsible(
      this._root.querySelector('#ef-tf-svg-toggle'),
      this._root.querySelector('#ef-tf-svg-section')
    );
    this._root.querySelector('#ef-tf-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-tf-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-tf-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-tf-svg').value = '';
      this._root.querySelector('#ef-tf-svg-preview').innerHTML = '';
    });

    TFFormUtils.bindCollapsible(
      this._root.querySelector('#ef-tf-img-toggle'),
      this._root.querySelector('#ef-tf-img-section')
    );
    this._root.querySelector('#ef-tf-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-tf-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-tf-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-tf-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-tf-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-tf-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${TFFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: True / False radio buttons + selection highlight + error

class TFAnswerWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const ca            = q.correct_answer;
    const trueSelected  = ca === true  || ca === 'true';
    const falseSelected = ca === false || ca === 'false';
    const unsetHint     = (!trueSelected && !falseSelected)
      ? `<div class="ef-tf-unset-hint">No answer selected — question can be saved as draft.</div>`
      : '';

    return `
      <div class="ef-tf-field">
        <label class="ef-tf-label">Correct Answer</label>
        <div class="ef-tf-answer-group">
          <label class="ef-tf-answer-option ${trueSelected ? 'selected-true' : ''}"
                 id="ef-tf-opt-true">
            <input type="radio" name="ef-tf-correct" value="true"
                   ${trueSelected ? 'checked' : ''} />
            <span class="ef-tf-answer-icon">✓</span>
            <span class="ef-tf-answer-label">True</span>
          </label>
          <label class="ef-tf-answer-option ${falseSelected ? 'selected-false' : ''}"
                 id="ef-tf-opt-false">
            <input type="radio" name="ef-tf-correct" value="false"
                   ${falseSelected ? 'checked' : ''} />
            <span class="ef-tf-answer-icon">✗</span>
            <span class="ef-tf-answer-label">False</span>
          </label>
        </div>
        ${unsetHint}
        <div class="ef-tf-error" id="ef-tf-error"></div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelectorAll('input[name="ef-tf-correct"]').forEach(radio => {
      radio.addEventListener('change', () => this._updateHighlight());
    });
  }

  getCorrectAnswer() {
    const val = this._root.querySelector('input[name="ef-tf-correct"]:checked')?.value;
    if (val === 'true')  return true;
    if (val === 'false') return false;
    return '';
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-tf-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private ──────────────────────────────────────────

  _updateHighlight() {
    const trueOpt  = this._root.querySelector('#ef-tf-opt-true');
    const falseOpt = this._root.querySelector('#ef-tf-opt-false');
    const val      = this._root.querySelector('input[name="ef-tf-correct"]:checked')?.value;
    trueOpt.classList.toggle('selected-true',   val === 'true');
    trueOpt.classList.toggle('selected-true',   val === 'true');
    falseOpt.classList.toggle('selected-false', val === 'false');
    if (val === 'true')  falseOpt.classList.remove('selected-false');
    if (val === 'false') trueOpt.classList.remove('selected-true');
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class TFMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-tf-field">
        <label class="ef-tf-label">
          Explanation <span class="ef-tf-optional">(optional)</span>
        </label>
        <textarea class="ef-tf-textarea" id="ef-tf-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${TFFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-tf-render-preview" id="ef-tf-explanation-preview"></div>
      </div>

      <div class="ef-tf-field">
        <label class="ef-tf-label">Difficulty</label>
        <select class="ef-tf-select" id="ef-tf-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-tf-row-2">
        <div class="ef-tf-field">
          <label class="ef-tf-label">
            Points <span class="ef-tf-optional">(optional)</span>
          </label>
          <input class="ef-tf-input" id="ef-tf-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-tf-field">
          <label class="ef-tf-label">
            Time Limit (sec) <span class="ef-tf-optional">(optional)</span>
          </label>
          <input class="ef-tf-input" id="ef-tf-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-tf-field">
        <label class="ef-tf-label">
          Tags <span class="ef-tf-optional">(comma separated)</span>
        </label>
        <input class="ef-tf-input" id="ef-tf-tags" type="text"
          placeholder="e.g. science, biology"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    TFFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-tf-explanation'),
      this._root.querySelector('#ef-tf-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-tf-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-tf-difficulty')?.value || 'easy',
      points:      TFFormUtils.parseOptionalNumber(this._root.querySelector('#ef-tf-points')),
      time_limit:  TFFormUtils.parseOptionalNumber(this._root.querySelector('#ef-tf-time-limit')),
      tags:        TFFormUtils.parseTags(this._root.querySelector('#ef-tf-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class TrueFalseFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('true_false');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'true_false') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'True / False';
    const bodyClass    = isSkip ? 'ef-tf-body ef-tf-is-skip' : 'ef-tf-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new TFQuestionWidget(this);
    const mediaWidget = new TFMediaWidget(this);
    const ansWidget   = new TFAnswerWidget(this);
    const metaWidget  = new TFMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-tf-form">
        <div class="${bodyClass}" id="ef-tf-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-tf-footer">
          <button class="ef-tf-btn-save" id="ef-tf-btn-save">Save</button>
          <button class="ef-tf-btn-skip" id="ef-tf-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new TFQuestionWidget(this);
    this._mediaWidget = new TFMediaWidget(this);
    this._ansWidget   = new TFAnswerWidget(this);
    this._metaWidget  = new TFMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-tf-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-tf-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'true_false') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'True / False';
    const body      = this.querySelector('#ef-tf-body');
    const btn       = this.querySelector('#ef-tf-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'true_false';
      delete this._question.original_type;
      body.classList.remove('ef-tf-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-tf-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-tf-question')?.focus();
      return;
    }

    const saved = {
      type:           this._question?.type || 'true_false',
      question:       questionText,
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
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
      type:           this._question?.type || 'true_false',
      question:       this._qWidget.getValue(),
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      correct_answer: this._ansWidget.getCorrectAnswer(),
      user_response:  '',
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('true-false-form', TrueFalseFormComponent);