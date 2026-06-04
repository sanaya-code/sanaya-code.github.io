// editor/components/question_forms/mcq_form/component.js

// ── Utilities ────────────────────────────────────────────────────────────────

class MCQFormUtils {

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

class MCQQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-mcq-field">
        <label class="ef-mcq-label">Question Text</label>
        <textarea class="ef-mcq-textarea" id="ef-mcq-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${MCQFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-mcq-render-preview" id="ef-mcq-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    MCQFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-mcq-question'),
      this._root.querySelector('#ef-mcq-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-mcq-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class MCQMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${MCQFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-mcq-img-preview visible' : 'ef-mcq-img-preview';

    return `
      <div class="ef-mcq-collapsible" id="ef-mcq-svg-section">
        <div class="ef-mcq-collapsible-header" id="ef-mcq-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-mcq-collapsible-arrow">▼</span>
        </div>
        <div class="ef-mcq-collapsible-body">
          <textarea class="ef-mcq-textarea" id="ef-mcq-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${MCQFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-mcq-svg-preview" id="ef-mcq-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-mcq-remove-btn" id="ef-mcq-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-mcq-collapsible" id="ef-mcq-img-section">
        <div class="ef-mcq-collapsible-header" id="ef-mcq-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-mcq-collapsible-arrow">▼</span>
        </div>
        <div class="ef-mcq-collapsible-body">
          <input class="ef-mcq-input" id="ef-mcq-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${MCQFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-mcq-img-preview">${imgThumb}</div>
          <button class="ef-mcq-remove-btn" id="ef-mcq-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    MCQFormUtils.bindCollapsible(
      this._root.querySelector('#ef-mcq-svg-toggle'),
      this._root.querySelector('#ef-mcq-svg-section')
    );
    this._root.querySelector('#ef-mcq-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-mcq-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-mcq-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-mcq-svg').value = '';
      this._root.querySelector('#ef-mcq-svg-preview').innerHTML = '';
    });

    MCQFormUtils.bindCollapsible(
      this._root.querySelector('#ef-mcq-img-toggle'),
      this._root.querySelector('#ef-mcq-img-section')
    );
    this._root.querySelector('#ef-mcq-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-mcq-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-mcq-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-mcq-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-mcq-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-mcq-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${MCQFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: options list (add / delete / drag-reorder) + shared preview box

class MCQAnswerWidget {

  constructor(root) {
    this._root      = root;
    this._dragSrc   = null;
  }

  render(options, correctAnswer) {
    return `
      <div class="ef-mcq-field">
        <div class="ef-mcq-options-header">
          <label class="ef-mcq-label">Options</label>
          <button class="ef-mcq-add-option-btn" id="ef-mcq-add-option">+ Add Option</button>
        </div>
        <div class="ef-mcq-options-list" id="ef-mcq-options-list">
          ${options.map((opt, i) =>
            this._optionRowHTML(opt.text || '', correctAnswer === opt.id, i)
          ).join('')}
        </div>
        <div class="ef-mcq-option-preview-box" id="ef-mcq-option-preview-box">
          <div class="ef-mcq-option-preview-label" id="ef-mcq-option-preview-label">
            Previewing option 1
          </div>
          <div class="ef-mcq-option-preview-content"
               id="ef-mcq-option-preview-content"></div>
        </div>
        <div class="ef-mcq-error" id="ef-mcq-options-error"></div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-mcq-add-option')
      ?.addEventListener('click', () => this.addOptionRow());

    const optList = this._root.querySelector('#ef-mcq-options-list');
    if (optList) this._bindOptionListEvents(optList);
  }

  addOptionRow() {
    const list  = this._root.querySelector('#ef-mcq-options-list');
    const count = list.querySelectorAll('.ef-mcq-option-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._optionRowHTML('', false, count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexOptions();
    row.querySelector('.ef-mcq-option-text')?.focus();
  }

  getOptions() {
    const rows    = this._root.querySelectorAll('.ef-mcq-option-row');
    const options = [];
    let correctIndex = -1;
    rows.forEach((row, i) => {
      const text  = row.querySelector('.ef-mcq-option-text')?.value.trim() || '';
      const radio = row.querySelector('.ef-mcq-correct-radio');
      options.push({ id: String.fromCharCode(65 + i), text });
      if (radio?.checked) correctIndex = i;
    });
    return { options, correctIndex };
  }

  getCorrectAnswer() {
    const { correctIndex } = this.getOptions();
    return correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '';
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-mcq-options-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private ──────────────────────────────────────────

  _optionRowHTML(text, isCorrect, index) {
    return `
      <div class="ef-mcq-option-row" draggable="true" data-opt-index="${index}">
        <span class="ef-mcq-drag-handle">⠿</span>
        <input type="radio" name="ef-mcq-correct"
               class="ef-mcq-correct-radio"
               data-opt-index="${index}"
               title="Mark as correct answer"
               ${isCorrect ? 'checked' : ''}
        />
        <input type="text"
               class="ef-mcq-option-text"
               placeholder="Option text (HTML/MathML supported)"
               value="${MCQFormUtils.escHtml(text)}"
               data-opt-index="${index}"
        />
        <button class="ef-mcq-option-delete" title="Delete option">✕</button>
      </div>
    `;
  }

  _reindexOptions() {
    this._root.querySelectorAll('.ef-mcq-option-row').forEach((row, i) => {
      row.dataset.optIndex = i;
      const radio = row.querySelector('.ef-mcq-correct-radio');
      if (radio) radio.dataset.optIndex = i;
      const input = row.querySelector('.ef-mcq-option-text');
      if (input) input.dataset.optIndex = i;
    });
  }

  _reorderOptionRows(from, to) {
    const list = this._root.querySelector('#ef-mcq-options-list');
    const rows = Array.from(list.querySelectorAll('.ef-mcq-option-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexOptions();
  }

  _bindOptionListEvents(optList) {

    // Focus → show shared preview
    optList.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ef-mcq-option-text')) return;
      const row   = e.target.closest('.ef-mcq-option-row');
      const index = parseInt(row.dataset.optIndex);
      optList.querySelectorAll('.ef-mcq-option-row')
        .forEach(r => r.classList.remove('ef-mcq-focused-row'));
      row.classList.add('ef-mcq-focused-row');
      const box     = this._root.querySelector('#ef-mcq-option-preview-box');
      const label   = this._root.querySelector('#ef-mcq-option-preview-label');
      const content = this._root.querySelector('#ef-mcq-option-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing option ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    // Input → update shared preview live
    optList.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ef-mcq-option-text')) return;
      const row     = e.target.closest('.ef-mcq-option-row');
      const index   = parseInt(row.dataset.optIndex);
      const content = this._root.querySelector('#ef-mcq-option-preview-content');
      const label   = this._root.querySelector('#ef-mcq-option-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing option ${index + 1}`;
      }
    });

    // Delete option
    optList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-mcq-option-delete')) return;
      e.target.closest('.ef-mcq-option-row').remove();
      this._reindexOptions();
      if (!optList.querySelectorAll('.ef-mcq-option-row').length) {
        this._root.querySelector('#ef-mcq-option-preview-box')
          ?.classList.remove('visible');
      }
    });

    // Drag reorder
    optList.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-mcq-option-row');
      if (!row) return;
      this._dragSrc = parseInt(row.dataset.optIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    optList.addEventListener('dragend', () => {
      optList.querySelectorAll('.ef-mcq-option-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    optList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-mcq-option-row');
      if (row && parseInt(row.dataset.optIndex) !== this._dragSrc) {
        optList.querySelectorAll('.ef-mcq-option-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    optList.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetRow = e.target.closest('.ef-mcq-option-row');
      if (!targetRow) return;
      const to   = parseInt(targetRow.dataset.optIndex);
      const from = this._dragSrc;
      if (from === null || from === to) return;
      targetRow.classList.remove('drag-over');
      this._reorderOptionRows(from, to);
    });
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class MCQMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-mcq-field">
        <label class="ef-mcq-label">
          Explanation
          <span class="ef-mcq-optional">(optional)</span>
        </label>
        <textarea class="ef-mcq-textarea" id="ef-mcq-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${MCQFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-mcq-render-preview" id="ef-mcq-explanation-preview"></div>
      </div>

      <div class="ef-mcq-field">
        <label class="ef-mcq-label">Difficulty</label>
        <select class="ef-mcq-select" id="ef-mcq-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-mcq-row-2">
        <div class="ef-mcq-field">
          <label class="ef-mcq-label">
            Points <span class="ef-mcq-optional">(optional)</span>
          </label>
          <input class="ef-mcq-input" id="ef-mcq-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-mcq-field">
          <label class="ef-mcq-label">
            Time Limit (sec) <span class="ef-mcq-optional">(optional)</span>
          </label>
          <input class="ef-mcq-input" id="ef-mcq-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-mcq-field">
        <label class="ef-mcq-label">
          Tags <span class="ef-mcq-optional">(comma separated)</span>
        </label>
        <input class="ef-mcq-input" id="ef-mcq-tags" type="text"
          placeholder="e.g. science, astronomy, solar-system"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    MCQFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-mcq-explanation'),
      this._root.querySelector('#ef-mcq-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-mcq-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-mcq-difficulty')?.value || 'easy',
      points:      MCQFormUtils.parseOptionalNumber(this._root.querySelector('#ef-mcq-points')),
      time_limit:  MCQFormUtils.parseOptionalNumber(this._root.querySelector('#ef-mcq-time-limit')),
      tags:        MCQFormUtils.parseTags(this._root.querySelector('#ef-mcq-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class MCQFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('mcq');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'mcq') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'MCQ';
    const bodyClass    = isSkip ? 'ef-mcq-body ef-mcq-is-skip' : 'ef-mcq-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    // Instantiate widgets (render-time only — no root needed yet)
    const qWidget    = new MCQQuestionWidget(this);
    const mediaWidget = new MCQMediaWidget(this);
    const ansWidget  = new MCQAnswerWidget(this);
    const metaWidget = new MCQMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-mcq-form">
        <div class="${bodyClass}" id="ef-mcq-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q.options || [], q.correct_answer)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-mcq-footer">
          <button class="ef-mcq-btn-save" id="ef-mcq-btn-save">Save</button>
          <button class="ef-mcq-btn-skip" id="ef-mcq-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    // Re-instantiate widgets pointing at the live DOM
    this._qWidget    = new MCQQuestionWidget(this);
    this._mediaWidget = new MCQMediaWidget(this);
    this._ansWidget  = new MCQAnswerWidget(this);
    this._metaWidget = new MCQMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-mcq-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-mcq-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'mcq') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'MCQ';
    const body      = this.querySelector('#ef-mcq-body');
    const btn       = this.querySelector('#ef-mcq-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'mcq';
      delete this._question.original_type;
      body.classList.remove('ef-mcq-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-mcq-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-mcq-question')?.focus();
      return;
    }

    const { options } = this._ansWidget.getOptions();
    if (options.length < 2) {
      this._ansWidget.showError('At least 2 options are required.');
      return;
    }

    const saved = {
      type:           this._question?.type || 'mcq',
      question:       questionText,
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      options:        options,
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
    const { options } = this._ansWidget.getOptions();
    return {
      type:           this._question?.type || 'mcq',
      question:       this._qWidget.getValue(),
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      options:        options,
      correct_answer: this._ansWidget.getCorrectAnswer(),
      user_response:  '',
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('mcq-form', MCQFormComponent);