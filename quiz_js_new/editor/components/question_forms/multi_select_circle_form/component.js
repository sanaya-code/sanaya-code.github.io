// editor/components/question_forms/multi_select_circle_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class MSCFormUtils {

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

class MSCQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-msc-field">
        <label class="ef-msc-label">Question Text</label>
        <textarea class="ef-msc-textarea" id="ef-msc-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${MSCFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-msc-render-preview" id="ef-msc-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    MSCFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-msc-question'),
      this._root.querySelector('#ef-msc-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-msc-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class MSCMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${MSCFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-msc-img-preview visible' : 'ef-msc-img-preview';

    return `
      <div class="ef-msc-collapsible" id="ef-msc-svg-section">
        <div class="ef-msc-collapsible-header" id="ef-msc-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-msc-collapsible-arrow">▼</span>
        </div>
        <div class="ef-msc-collapsible-body">
          <textarea class="ef-msc-textarea" id="ef-msc-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${MSCFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-msc-svg-preview" id="ef-msc-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-msc-remove-btn" id="ef-msc-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-msc-collapsible" id="ef-msc-img-section">
        <div class="ef-msc-collapsible-header" id="ef-msc-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-msc-collapsible-arrow">▼</span>
        </div>
        <div class="ef-msc-collapsible-body">
          <input class="ef-msc-input" id="ef-msc-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${MSCFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-msc-img-preview">${imgThumb}</div>
          <button class="ef-msc-remove-btn" id="ef-msc-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    MSCFormUtils.bindCollapsible(
      this._root.querySelector('#ef-msc-svg-toggle'),
      this._root.querySelector('#ef-msc-svg-section')
    );
    this._root.querySelector('#ef-msc-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-msc-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-msc-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-msc-svg').value = '';
      this._root.querySelector('#ef-msc-svg-preview').innerHTML = '';
    });

    MSCFormUtils.bindCollapsible(
      this._root.querySelector('#ef-msc-img-toggle'),
      this._root.querySelector('#ef-msc-img-section')
    );
    this._root.querySelector('#ef-msc-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-msc-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-msc-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-msc-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-msc-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-msc-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${MSCFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: options list (checkbox per option, drag-reorder) + correct count hint
//       + shared preview box + selection limits + scoring methods
//       + description field + case_sensitive toggle

class MSCAnswerWidget {

  constructor(root) {
    this._root    = root;
    this._dragSrc = null;
  }

  render(q) {
    const options       = q.options || [];
    const minSel        = q.minimum_selections != null ? q.minimum_selections : 1;
    const maxSel        = q.maximum_selections != null ? q.maximum_selections : '';
    const scoringMethod = q.scoring_method   || 'exact';
    const scoringMethod01 = q.scoring_method_01 || '';
    const caseSensitive = !!q.case_sensitive;
    const description   = q.description || '';
    const correctCount  = options.filter(o => o.correct).length;
    const hintHasCorrect = correctCount > 0;
    const hintText = correctCount === 0
      ? 'No correct answers marked yet — can be saved as draft.'
      : correctCount === 1 ? '1 correct answer marked' : `${correctCount} correct answers marked`;

    return `
      <div class="ef-msc-field">
        <div class="ef-msc-options-header">
          <label class="ef-msc-label">Options</label>
          <button class="ef-msc-add-option-btn" id="ef-msc-add-option">+ Add Option</button>
        </div>
        <div class="ef-msc-options-list" id="ef-msc-options-list">
          ${options.map((opt, i) => this._optionRowHTML(opt.text || '', !!opt.correct, i)).join('')}
        </div>
        <div class="ef-msc-correct-hint ${hintHasCorrect ? 'has-correct' : ''}"
             id="ef-msc-correct-hint">
          ${hintText}
        </div>
        <div class="ef-msc-option-preview-box" id="ef-msc-option-preview-box">
          <div class="ef-msc-option-preview-label" id="ef-msc-option-preview-label">
            Previewing option 1
          </div>
          <div class="ef-msc-option-preview-content"
               id="ef-msc-option-preview-content"></div>
        </div>
        <div class="ef-msc-error" id="ef-msc-options-error"></div>
      </div>

      <div class="ef-msc-field">
        <label class="ef-msc-label">Selection Limits</label>
        <div class="ef-msc-row-2">
          <div class="ef-msc-field">
            <label class="ef-msc-label" style="font-size:10px">Minimum Selections</label>
            <input class="ef-msc-input" id="ef-msc-min-sel" type="number"
              min="1" step="1" placeholder="e.g. 1"
              value="${minSel}"
            />
          </div>
          <div class="ef-msc-field">
            <label class="ef-msc-label" style="font-size:10px">Maximum Selections</label>
            <input class="ef-msc-input" id="ef-msc-max-sel" type="number"
              min="1" step="1" placeholder="e.g. 3"
              value="${maxSel}"
            />
          </div>
        </div>
      </div>

      <div class="ef-msc-field">
        <label class="ef-msc-label">Scoring Method</label>
        <select class="ef-msc-select" id="ef-msc-scoring-method">
          <option value="exact"   ${scoringMethod === 'exact'   ? 'selected' : ''}>Exact — all correct options must be selected</option>
          <option value="partial" ${scoringMethod === 'partial' ? 'selected' : ''}>Partial — credit per correct option</option>
        </select>
      </div>

      <div class="ef-msc-field">
        <label class="ef-msc-label">
          Scoring Method 01
          <span class="ef-msc-optional">(optional — secondary scoring)</span>
        </label>
        <select class="ef-msc-select" id="ef-msc-scoring-method-01">
          <option value=""        ${!scoringMethod01              ? 'selected' : ''}>— None —</option>
          <option value="exact"   ${scoringMethod01 === 'exact'   ? 'selected' : ''}>Exact</option>
          <option value="partial" ${scoringMethod01 === 'partial' ? 'selected' : ''}>Partial</option>
        </select>
      </div>

      <div class="ef-msc-field">
        <label class="ef-msc-label">
          Description
          <span class="ef-msc-optional">(optional)</span>
        </label>
        <textarea class="ef-msc-textarea" id="ef-msc-description"
          rows="2"
          placeholder="Additional description or instruction for this question..."
        >${MSCFormUtils.escHtml(description)}</textarea>
      </div>

      <div class="ef-msc-field">
        <label class="ef-msc-label">Options</label>
        <label class="ef-msc-checkbox-label">
          <input type="checkbox" class="ef-msc-checkbox" id="ef-msc-case-sensitive"
            ${caseSensitive ? 'checked' : ''} />
          Case sensitive answers
        </label>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-msc-add-option')
      ?.addEventListener('click', () => this.addOptionRow());

    const optList = this._root.querySelector('#ef-msc-options-list');
    if (optList) this._bindOptionListEvents(optList);
  }

  addOptionRow() {
    const list  = this._root.querySelector('#ef-msc-options-list');
    const count = list.querySelectorAll('.ef-msc-option-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._optionRowHTML('', false, count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexOptions();
    row.querySelector('.ef-msc-option-text')?.focus();
  }

  getOptions() {
    const rows = this._root.querySelectorAll('.ef-msc-option-row');
    return Array.from(rows).map((row, i) => ({
      id:      String.fromCharCode(65 + i),
      text:    row.querySelector('.ef-msc-option-text')?.value.trim() || '',
      correct: row.querySelector('.ef-msc-correct-checkbox')?.checked || false,
    }));
  }

  getSelectionLimits() {
    const minVal = parseInt(this._root.querySelector('#ef-msc-min-sel')?.value) || 1;
    const maxRaw = this._root.querySelector('#ef-msc-max-sel')?.value.trim();
    const maxVal = maxRaw ? (parseInt(maxRaw) || null) : null;
    return { minimum_selections: minVal, maximum_selections: maxVal };
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-msc-scoring-method')?.value || 'exact';
  }

  getScoringMethod01() {
    return this._root.querySelector('#ef-msc-scoring-method-01')?.value || '';
  }

  getDescription() {
    return this._root.querySelector('#ef-msc-description')?.value.trim() || '';
  }

  getCaseSensitive() {
    return this._root.querySelector('#ef-msc-case-sensitive')?.checked || false;
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-msc-options-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private ──────────────────────────────────────────

  _optionRowHTML(text, isCorrect, index) {
    return `
      <div class="ef-msc-option-row ${isCorrect ? 'is-correct' : ''}"
           draggable="true" data-opt-index="${index}">
        <span class="ef-msc-drag-handle">⠿</span>
        <input type="checkbox"
               class="ef-msc-correct-checkbox"
               data-opt-index="${index}"
               title="Mark as correct"
               ${isCorrect ? 'checked' : ''}
        />
        <input type="text"
               class="ef-msc-option-text"
               placeholder="Option text (HTML/MathML supported)"
               value="${MSCFormUtils.escHtml(text)}"
               data-opt-index="${index}"
        />
        <button class="ef-msc-option-delete" title="Delete option">✕</button>
      </div>
    `;
  }

  _reindexOptions() {
    this._root.querySelectorAll('.ef-msc-option-row').forEach((row, i) => {
      row.dataset.optIndex = i;
      const cb = row.querySelector('.ef-msc-correct-checkbox');
      if (cb) cb.dataset.optIndex = i;
      const inp = row.querySelector('.ef-msc-option-text');
      if (inp) inp.dataset.optIndex = i;
    });
  }

  _reorderOptionRows(from, to) {
    const list = this._root.querySelector('#ef-msc-options-list');
    const rows = Array.from(list.querySelectorAll('.ef-msc-option-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexOptions();
  }

  _updateCorrectHint() {
    const hint = this._root.querySelector('#ef-msc-correct-hint');
    if (!hint) return;
    const checked = this._root.querySelectorAll('.ef-msc-correct-checkbox:checked').length;
    hint.textContent = checked === 0
      ? 'No correct answers marked yet — can be saved as draft.'
      : checked === 1 ? '1 correct answer marked' : `${checked} correct answers marked`;
    hint.classList.toggle('has-correct', checked > 0);
  }

  _bindOptionListEvents(optList) {

    // Focus → shared preview
    optList.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ef-msc-option-text')) return;
      const row   = e.target.closest('.ef-msc-option-row');
      const index = parseInt(row.dataset.optIndex);
      optList.querySelectorAll('.ef-msc-option-row')
        .forEach(r => r.classList.remove('ef-msc-focused-row'));
      row.classList.add('ef-msc-focused-row');
      const box     = this._root.querySelector('#ef-msc-option-preview-box');
      const label   = this._root.querySelector('#ef-msc-option-preview-label');
      const content = this._root.querySelector('#ef-msc-option-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing option ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    // Input → update shared preview live
    optList.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ef-msc-option-text')) return;
      const row     = e.target.closest('.ef-msc-option-row');
      const index   = parseInt(row.dataset.optIndex);
      const content = this._root.querySelector('#ef-msc-option-preview-content');
      const label   = this._root.querySelector('#ef-msc-option-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing option ${index + 1}`;
      }
    });

    // Checkbox — highlight row + update hint
    optList.addEventListener('change', (e) => {
      if (!e.target.classList.contains('ef-msc-correct-checkbox')) return;
      e.target.closest('.ef-msc-option-row')
        .classList.toggle('is-correct', e.target.checked);
      this._updateCorrectHint();
    });

    // Delete
    optList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-msc-option-delete')) return;
      e.target.closest('.ef-msc-option-row').remove();
      this._reindexOptions();
      this._updateCorrectHint();
      if (!optList.querySelectorAll('.ef-msc-option-row').length) {
        this._root.querySelector('#ef-msc-option-preview-box')?.classList.remove('visible');
      }
    });

    // Drag reorder
    optList.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-msc-option-row');
      if (!row) return;
      this._dragSrc = parseInt(row.dataset.optIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    optList.addEventListener('dragend', () => {
      optList.querySelectorAll('.ef-msc-option-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    optList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-msc-option-row');
      if (row && parseInt(row.dataset.optIndex) !== this._dragSrc) {
        optList.querySelectorAll('.ef-msc-option-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    optList.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetRow = e.target.closest('.ef-msc-option-row');
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

class MSCMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-msc-field">
        <label class="ef-msc-label">
          Explanation
          <span class="ef-msc-optional">(optional)</span>
        </label>
        <textarea class="ef-msc-textarea" id="ef-msc-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${MSCFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-msc-render-preview" id="ef-msc-explanation-preview"></div>
      </div>

      <div class="ef-msc-field">
        <label class="ef-msc-label">Difficulty</label>
        <select class="ef-msc-select" id="ef-msc-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-msc-row-2">
        <div class="ef-msc-field">
          <label class="ef-msc-label">
            Points <span class="ef-msc-optional">(optional)</span>
          </label>
          <input class="ef-msc-input" id="ef-msc-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-msc-field">
          <label class="ef-msc-label">
            Time Limit (sec) <span class="ef-msc-optional">(optional)</span>
          </label>
          <input class="ef-msc-input" id="ef-msc-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-msc-field">
        <label class="ef-msc-label">
          Tags <span class="ef-msc-optional">(comma separated)</span>
        </label>
        <input class="ef-msc-input" id="ef-msc-tags" type="text"
          placeholder="e.g. science, astronomy"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    MSCFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-msc-explanation'),
      this._root.querySelector('#ef-msc-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-msc-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-msc-difficulty')?.value || 'easy',
      points:      MSCFormUtils.parseOptionalNumber(this._root.querySelector('#ef-msc-points')),
      time_limit:  MSCFormUtils.parseOptionalNumber(this._root.querySelector('#ef-msc-time-limit')),
      tags:        MSCFormUtils.parseTags(this._root.querySelector('#ef-msc-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class MSCFormComponent extends HTMLElement {

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
    const q        = this._question || EditorFormRegistry.getDefault('multi_select_circle');
    const isSkip   = q.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'multi_select_circle') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Multi Select Circle';
    const bodyClass    = isSkip ? 'ef-msc-body ef-msc-is-skip' : 'ef-msc-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new MSCQuestionWidget(this);
    const mediaWidget = new MSCMediaWidget(this);
    const ansWidget   = new MSCAnswerWidget(this);
    const metaWidget  = new MSCMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-msc-form">
        <div class="${bodyClass}" id="ef-msc-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-msc-footer">
          <button class="ef-msc-btn-save" id="ef-msc-btn-save">Save</button>
          <button class="ef-msc-btn-skip" id="ef-msc-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new MSCQuestionWidget(this);
    this._mediaWidget = new MSCMediaWidget(this);
    this._ansWidget   = new MSCAnswerWidget(this);
    this._metaWidget  = new MSCMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-msc-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-msc-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'multi_select_circle') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Multi Select Circle';
    const body      = this.querySelector('#ef-msc-body');
    const btn       = this.querySelector('#ef-msc-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'multi_select_circle';
      delete this._question.original_type;
      body.classList.remove('ef-msc-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-msc-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-msc-question')?.focus();
      return;
    }

    const options = this._ansWidget.getOptions();
    if (options.length < 2) {
      this._ansWidget.showError('At least 2 options are required.');
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
    const options = this._ansWidget.getOptions();
    const { minimum_selections, maximum_selections } = this._ansWidget.getSelectionLimits();
    const scoringMethod01 = this._ansWidget.getScoringMethod01();

    const data = {
      type:               this._question?.type || 'multi_select_circle',
      question:           this._qWidget.getValue(),
      svg_content:        this._mediaWidget.getSvg(),
      img_url:            this._mediaWidget.getImgUrl(),
      options,
      user_response:      '',
      minimum_selections,
      maximum_selections: maximum_selections ?? options.length,
      scoring_method:     this._ansWidget.getScoringMethod(),
      description:        this._ansWidget.getDescription(),
      case_sensitive:     this._ansWidget.getCaseSensitive(),
      ...this._metaWidget.getData(),
    };

    if (scoringMethod01) data.scoring_method_01 = scoringMethod01;

    return data;
  }

}

customElements.define('multi-select-circle-form', MSCFormComponent);