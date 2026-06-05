// editor/components/question_forms/options_fill_in_blank_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class OFIBFormUtils {

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

class OFIBQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-ofib-field">
        <label class="ef-ofib-label">Question Text</label>
        <textarea class="ef-ofib-textarea" id="ef-ofib-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${OFIBFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-ofib-render-preview" id="ef-ofib-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    OFIBFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ofib-question'),
      this._root.querySelector('#ef-ofib-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-ofib-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class OFIBMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${OFIBFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-ofib-img-preview visible' : 'ef-ofib-img-preview';

    return `
      <div class="ef-ofib-collapsible" id="ef-ofib-svg-section">
        <div class="ef-ofib-collapsible-header" id="ef-ofib-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-ofib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ofib-collapsible-body">
          <textarea class="ef-ofib-textarea" id="ef-ofib-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${OFIBFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-ofib-svg-preview" id="ef-ofib-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-ofib-remove-btn" id="ef-ofib-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-ofib-collapsible" id="ef-ofib-img-section">
        <div class="ef-ofib-collapsible-header" id="ef-ofib-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-ofib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ofib-collapsible-body">
          <input class="ef-ofib-input" id="ef-ofib-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${OFIBFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-ofib-img-preview">${imgThumb}</div>
          <button class="ef-ofib-remove-btn" id="ef-ofib-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    OFIBFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ofib-svg-toggle'),
      this._root.querySelector('#ef-ofib-svg-section')
    );
    this._root.querySelector('#ef-ofib-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-ofib-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-ofib-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ofib-svg').value = '';
      this._root.querySelector('#ef-ofib-svg-preview').innerHTML = '';
    });

    OFIBFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ofib-img-toggle'),
      this._root.querySelector('#ef-ofib-img-section')
    );
    this._root.querySelector('#ef-ofib-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-ofib-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ofib-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-ofib-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-ofib-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-ofib-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${OFIBFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Choices Widget ────────────────────────────────────────────────────────────
// Owns: choices pool — pill-shaped inputs shown to student as word bank

class OFIBChoicesWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const choices = Array.isArray(q.choices) ? q.choices : [];
    return `
      <div class="ef-ofib-field">
        <div class="ef-ofib-options-header">
          <label class="ef-ofib-label">
            Choices
            <span class="ef-ofib-optional">— word bank shown to student</span>
          </label>
          <button class="ef-ofib-add-option-btn" id="ef-ofib-add-choice">
            + Add Choice
          </button>
        </div>
        <div class="ef-ofib-choices-wrap" id="ef-ofib-choices-wrap">
          ${choices.map((c, i) => this._choiceHTML(c, i)).join('')}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-ofib-add-choice')
      ?.addEventListener('click', () => this._addChoice());
    this._bindChoiceEvents();
  }

  getChoices() {
    return Array.from(this._root.querySelectorAll('.ef-ofib-choice-input'))
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);
  }

  // ── Private ──────────────────────────────────────────

  _choiceHTML(val, index) {
    return `
      <div class="ef-ofib-choice-row" data-choice-index="${index}">
        <input type="text" class="ef-ofib-choice-input"
               value="${OFIBFormUtils.escHtml(val)}"
               placeholder="word"
        />
        <button class="ef-ofib-choice-delete" title="Remove">✕</button>
      </div>`;
  }

  _addChoice() {
    const wrap  = this._root.querySelector('#ef-ofib-choices-wrap');
    const index = wrap.querySelectorAll('.ef-ofib-choice-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._choiceHTML('', index);
    wrap.appendChild(div.firstElementChild);
    this._bindChoiceEvents();
    wrap.querySelector('.ef-ofib-choice-row:last-child .ef-ofib-choice-input')?.focus();
  }

  _bindChoiceEvents() {
    const wrap = this._root.querySelector('#ef-ofib-choices-wrap');
    if (!wrap) return;
    wrap.querySelectorAll('.ef-ofib-choice-delete').forEach(btn => {
      // Remove old listener by replacing with clone
      const fresh = btn.cloneNode(true);
      btn.replaceWith(fresh);
      fresh.addEventListener('click', () => {
        fresh.closest('.ef-ofib-choice-row').remove();
        this._reindexChoices();
      });
    });
  }

  _reindexChoices() {
    this._root.querySelectorAll('.ef-ofib-choice-row').forEach((row, i) => {
      row.dataset.choiceIndex = i;
    });
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class OFIBMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-ofib-field">
        <label class="ef-ofib-label">
          Explanation
          <span class="ef-ofib-optional">(optional)</span>
        </label>
        <textarea class="ef-ofib-textarea" id="ef-ofib-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${OFIBFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-ofib-render-preview" id="ef-ofib-explanation-preview"></div>
      </div>

      <div class="ef-ofib-field">
        <label class="ef-ofib-label">Difficulty</label>
        <select class="ef-ofib-select" id="ef-ofib-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-ofib-row-2">
        <div class="ef-ofib-field">
          <label class="ef-ofib-label">
            Points <span class="ef-ofib-optional">(optional)</span>
          </label>
          <input class="ef-ofib-input" id="ef-ofib-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-ofib-field">
          <label class="ef-ofib-label">
            Time Limit (sec) <span class="ef-ofib-optional">(optional)</span>
          </label>
          <input class="ef-ofib-input" id="ef-ofib-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-ofib-field">
        <label class="ef-ofib-label">
          Tags <span class="ef-ofib-optional">(comma separated)</span>
        </label>
        <input class="ef-ofib-input" id="ef-ofib-tags" type="text"
          placeholder="e.g. science, maths"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    OFIBFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ofib-explanation'),
      this._root.querySelector('#ef-ofib-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-ofib-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-ofib-difficulty')?.value || 'easy',
      points:      OFIBFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ofib-points')),
      time_limit:  OFIBFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ofib-time-limit')),
      tags:        OFIBFormUtils.parseTags(this._root.querySelector('#ef-ofib-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class OptionsFillInBlankFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('options_fill_in_blank');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'options_fill_in_blank') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Options Fill Blank';
    const bodyClass    = isSkip ? 'ef-ofib-body ef-ofib-is-skip' : 'ef-ofib-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget       = new OFIBQuestionWidget(this);
    const mediaWidget   = new OFIBMediaWidget(this);
    const choicesWidget = new OFIBChoicesWidget(this);
    const metaWidget    = new OFIBMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-ofib-form">
        <div class="${bodyClass}" id="ef-ofib-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${choicesWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-ofib-footer">
          <button class="ef-ofib-btn-save" id="ef-ofib-btn-save">Save</button>
          <button class="ef-ofib-btn-skip" id="ef-ofib-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget       = new OFIBQuestionWidget(this);
    this._mediaWidget   = new OFIBMediaWidget(this);
    this._choicesWidget = new OFIBChoicesWidget(this);
    this._metaWidget    = new OFIBMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._choicesWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-ofib-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-ofib-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'options_fill_in_blank') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Options Fill Blank';
    const body      = this.querySelector('#ef-ofib-body');
    const btn       = this.querySelector('#ef-ofib-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'options_fill_in_blank';
      delete this._question.original_type;
      body.classList.remove('ef-ofib-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-ofib-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this.querySelector('#ef-ofib-question')?.focus();
      return;
    }

    const saved = {
      type:          this._question?.type || 'options_fill_in_blank',
      question:      questionText,
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      options:       this._question?.options       ?? [],
      user_response: this._question?.user_response ?? [],
      choices:       this._choicesWidget.getChoices(),
      blank_type:    this._question?.blank_type    ?? 'box',
      case_sensitive:this._question?.case_sensitive ?? false,
      scoring_method:this._question?.scoring_method ?? 'exact',
      feedback:      this._question?.feedback      ?? {},
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
      type:          this._question?.type || 'options_fill_in_blank',
      question:      this._qWidget.getValue(),
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      options:       this._question?.options       ?? [],
      user_response: this._question?.user_response ?? [],
      choices:       this._choicesWidget.getChoices(),
      blank_type:    this._question?.blank_type    ?? 'box',
      case_sensitive:this._question?.case_sensitive ?? false,
      scoring_method:this._question?.scoring_method ?? 'exact',
      feedback:      this._question?.feedback      ?? {},
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('options-fill-in-blank-form', OptionsFillInBlankFormComponent);