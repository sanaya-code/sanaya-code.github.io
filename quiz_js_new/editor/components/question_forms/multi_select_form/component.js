// editor/components/question_forms/multi_select_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class MSFormUtils {

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

class MSQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-ms-field">
        <label class="ef-ms-label">Question Text</label>
        <textarea class="ef-ms-textarea" id="ef-ms-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${MSFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-ms-render-preview" id="ef-ms-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    MSFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ms-question'),
      this._root.querySelector('#ef-ms-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-ms-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class MSMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${MSFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-ms-img-preview visible' : 'ef-ms-img-preview';

    return `
      <div class="ef-ms-collapsible" id="ef-ms-svg-section">
        <div class="ef-ms-collapsible-header" id="ef-ms-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-ms-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ms-collapsible-body">
          <textarea class="ef-ms-textarea" id="ef-ms-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${MSFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-ms-svg-preview" id="ef-ms-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-ms-remove-btn" id="ef-ms-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-ms-collapsible" id="ef-ms-img-section">
        <div class="ef-ms-collapsible-header" id="ef-ms-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-ms-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ms-collapsible-body">
          <input class="ef-ms-input" id="ef-ms-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${MSFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-ms-img-preview">${imgThumb}</div>
          <button class="ef-ms-remove-btn" id="ef-ms-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    MSFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ms-svg-toggle'),
      this._root.querySelector('#ef-ms-svg-section')
    );
    this._root.querySelector('#ef-ms-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-ms-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-ms-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ms-svg').value = '';
      this._root.querySelector('#ef-ms-svg-preview').innerHTML = '';
    });

    MSFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ms-img-toggle'),
      this._root.querySelector('#ef-ms-img-section')
    );
    this._root.querySelector('#ef-ms-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-ms-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ms-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-ms-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-ms-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-ms-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${MSFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: options list with checkboxes (drag-reorder, delete, shared preview,
//       correct count hint, error display)
// Difference from MCQ: checkboxes instead of radios, multiple correct allowed

class MSAnswerWidget {

  constructor(root) {
    this._root    = root;
    this._dragSrc = null;
  }

  render(options) {
    const count     = options.filter(o => o.correct).length;
    const hintClass = count > 0 ? 'ef-ms-correct-hint has-correct' : 'ef-ms-correct-hint';
    const hintText  = this._hintText(count);

    return `
      <div class="ef-ms-field">
        <div class="ef-ms-options-header">
          <label class="ef-ms-label">Options</label>
          <button class="ef-ms-add-option-btn" id="ef-ms-add-option">+ Add Option</button>
        </div>
        <div class="ef-ms-options-list" id="ef-ms-options-list">
          ${options.map((opt, i) =>
            this._optionRowHTML(opt.text || '', !!opt.correct, i)
          ).join('')}
        </div>
        <div class="${hintClass}" id="ef-ms-correct-hint">${hintText}</div>
        <div class="ef-ms-option-preview-box" id="ef-ms-option-preview-box">
          <div class="ef-ms-option-preview-label" id="ef-ms-option-preview-label">
            Previewing option 1
          </div>
          <div class="ef-ms-option-preview-content"
               id="ef-ms-option-preview-content"></div>
        </div>
        <div class="ef-ms-error" id="ef-ms-options-error"></div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-ms-add-option')
      ?.addEventListener('click', () => this.addOptionRow());

    const optList = this._root.querySelector('#ef-ms-options-list');
    if (optList) this._bindOptionListEvents(optList);
  }

  addOptionRow() {
    const list  = this._root.querySelector('#ef-ms-options-list');
    const count = list.querySelectorAll('.ef-ms-option-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._optionRowHTML('', false, count);
    list.appendChild(div.firstElementChild);
    this._reindexOptions();
    list.querySelector('.ef-ms-option-row:last-child .ef-ms-option-text')?.focus();
  }

  getOptions() {
    return Array.from(this._root.querySelectorAll('.ef-ms-option-row')).map((row, i) => ({
      id:      String.fromCharCode(65 + i),
      text:    row.querySelector('.ef-ms-option-text')?.value.trim() || '',
      correct: row.querySelector('.ef-ms-correct-checkbox')?.checked || false,
    }));
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-ms-options-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private ──────────────────────────────────────────

  _optionRowHTML(text, isCorrect, index) {
    return `
      <div class="ef-ms-option-row ${isCorrect ? 'ef-ms-is-correct' : ''}"
           draggable="true" data-opt-index="${index}">
        <span class="ef-ms-drag-handle">⠿</span>
        <input type="checkbox" class="ef-ms-correct-checkbox"
               data-opt-index="${index}"
               title="Mark as correct answer"
               ${isCorrect ? 'checked' : ''} />
        <input type="text" class="ef-ms-option-text"
               placeholder="Option text (HTML/MathML supported)"
               value="${MSFormUtils.escHtml(text)}"
               data-opt-index="${index}" />
        <button class="ef-ms-option-delete" title="Delete option">✕</button>
      </div>
    `;
  }

  _hintText(count) {
    if (count === 0) return 'No correct answers marked yet — can be saved as draft.';
    return count === 1 ? '1 correct answer marked' : `${count} correct answers marked`;
  }

  _updateCorrectHint() {
    const hint    = this._root.querySelector('#ef-ms-correct-hint');
    if (!hint) return;
    const checked = this._root.querySelectorAll('.ef-ms-correct-checkbox:checked').length;
    hint.textContent = this._hintText(checked);
    hint.classList.toggle('has-correct', checked > 0);
  }

  _reindexOptions() {
    this._root.querySelectorAll('.ef-ms-option-row').forEach((row, i) => {
      row.dataset.optIndex = i;
      const cb  = row.querySelector('.ef-ms-correct-checkbox');
      if (cb)  cb.dataset.optIndex  = i;
      const inp = row.querySelector('.ef-ms-option-text');
      if (inp) inp.dataset.optIndex = i;
    });
  }

  _reorderOptionRows(from, to) {
    const list = this._root.querySelector('#ef-ms-options-list');
    const rows = Array.from(list.querySelectorAll('.ef-ms-option-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexOptions();
  }

  _bindOptionListEvents(optList) {

    // Focus → show shared preview
    optList.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ef-ms-option-text')) return;
      const row   = e.target.closest('.ef-ms-option-row');
      const index = parseInt(row.dataset.optIndex);
      optList.querySelectorAll('.ef-ms-option-row')
        .forEach(r => r.classList.remove('ef-ms-focused-row'));
      row.classList.add('ef-ms-focused-row');
      const box     = this._root.querySelector('#ef-ms-option-preview-box');
      const label   = this._root.querySelector('#ef-ms-option-preview-label');
      const content = this._root.querySelector('#ef-ms-option-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing option ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    // Input → update shared preview live
    optList.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ef-ms-option-text')) return;
      const row     = e.target.closest('.ef-ms-option-row');
      const index   = parseInt(row.dataset.optIndex);
      const content = this._root.querySelector('#ef-ms-option-preview-content');
      const label   = this._root.querySelector('#ef-ms-option-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing option ${index + 1}`;
      }
    });

    // Checkbox → update correct hint
    optList.addEventListener('change', (e) => {
      if (!e.target.classList.contains('ef-ms-correct-checkbox')) return;
      e.target.closest('.ef-ms-option-row')
        .classList.toggle('ef-ms-is-correct', e.target.checked);
      this._updateCorrectHint();
    });

    // Delete option
    optList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-ms-option-delete')) return;
      e.target.closest('.ef-ms-option-row').remove();
      this._reindexOptions();
      this._updateCorrectHint();
      if (!optList.querySelectorAll('.ef-ms-option-row').length) {
        this._root.querySelector('#ef-ms-option-preview-box')
          ?.classList.remove('visible');
      }
    });

    // Drag reorder
    optList.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-ms-option-row');
      if (!row) return;
      this._dragSrc = parseInt(row.dataset.optIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    optList.addEventListener('dragend', () => {
      optList.querySelectorAll('.ef-ms-option-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    optList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-ms-option-row');
      if (row && parseInt(row.dataset.optIndex) !== this._dragSrc) {
        optList.querySelectorAll('.ef-ms-option-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    optList.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-ms-option-row');
      if (!target) return;
      const to   = parseInt(target.dataset.optIndex);
      const from = this._dragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      this._reorderOptionRows(from, to);
    });
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class MSMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-ms-field">
        <label class="ef-ms-label">
          Explanation <span class="ef-ms-optional">(optional)</span>
        </label>
        <textarea class="ef-ms-textarea" id="ef-ms-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${MSFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-ms-render-preview" id="ef-ms-explanation-preview"></div>
      </div>

      <div class="ef-ms-field">
        <label class="ef-ms-label">Difficulty</label>
        <select class="ef-ms-select" id="ef-ms-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-ms-row-2">
        <div class="ef-ms-field">
          <label class="ef-ms-label">
            Points <span class="ef-ms-optional">(optional)</span>
          </label>
          <input class="ef-ms-input" id="ef-ms-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-ms-field">
          <label class="ef-ms-label">
            Time Limit (sec) <span class="ef-ms-optional">(optional)</span>
          </label>
          <input class="ef-ms-input" id="ef-ms-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-ms-field">
        <label class="ef-ms-label">
          Tags <span class="ef-ms-optional">(comma separated)</span>
        </label>
        <input class="ef-ms-input" id="ef-ms-tags" type="text"
          placeholder="e.g. science, math"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    MSFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ms-explanation'),
      this._root.querySelector('#ef-ms-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-ms-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-ms-difficulty')?.value || 'easy',
      points:      MSFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ms-points')),
      time_limit:  MSFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ms-time-limit')),
      tags:        MSFormUtils.parseTags(this._root.querySelector('#ef-ms-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class MultiSelectFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('multi_select');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'multi_select') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Multi Select';
    const bodyClass    = isSkip ? 'ef-ms-body ef-ms-is-skip' : 'ef-ms-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new MSQuestionWidget(this);
    const mediaWidget = new MSMediaWidget(this);
    const ansWidget   = new MSAnswerWidget(this);
    const metaWidget  = new MSMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-ms-form">
        <div class="${bodyClass}" id="ef-ms-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q.options || [])}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-ms-footer">
          <button class="ef-ms-btn-save" id="ef-ms-btn-save">Save</button>
          <button class="ef-ms-btn-skip" id="ef-ms-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new MSQuestionWidget(this);
    this._mediaWidget = new MSMediaWidget(this);
    this._ansWidget   = new MSAnswerWidget(this);
    this._metaWidget  = new MSMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-ms-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-ms-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'multi_select') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Multi Select';
    const body      = this.querySelector('#ef-ms-body');
    const btn       = this.querySelector('#ef-ms-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'multi_select';
      delete this._question.original_type;
      body.classList.remove('ef-ms-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-ms-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-ms-question')?.focus();
      return;
    }

    const options = this._ansWidget.getOptions();
    if (options.length < 2) {
      this._ansWidget.showError('At least 2 options are required.');
      return;
    }

    const saved = {
      type:          this._question?.type || 'multi_select',
      question:      questionText,
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      options,
      user_response: [],
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
      type:          this._question?.type || 'multi_select',
      question:      this._qWidget.getValue(),
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      options:       this._ansWidget.getOptions(),
      user_response: [],
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('multi-select-form', MultiSelectFormComponent);