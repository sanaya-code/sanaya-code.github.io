// editor/components/question_forms/matching_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class MATCHFormUtils {

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

class MATCHQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-match-field">
        <label class="ef-match-label">Question Text</label>
        <textarea class="ef-match-textarea" id="ef-match-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${MATCHFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-match-render-preview" id="ef-match-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    MATCHFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-match-question'),
      this._root.querySelector('#ef-match-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-match-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class MATCHMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${MATCHFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-match-img-preview visible' : 'ef-match-img-preview';

    return `
      <div class="ef-match-collapsible" id="ef-match-svg-section">
        <div class="ef-match-collapsible-header" id="ef-match-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-match-collapsible-arrow">▼</span>
        </div>
        <div class="ef-match-collapsible-body">
          <textarea class="ef-match-textarea" id="ef-match-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${MATCHFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-match-svg-preview" id="ef-match-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-match-remove-btn" id="ef-match-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-match-collapsible" id="ef-match-img-section">
        <div class="ef-match-collapsible-header" id="ef-match-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-match-collapsible-arrow">▼</span>
        </div>
        <div class="ef-match-collapsible-body">
          <input class="ef-match-input" id="ef-match-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${MATCHFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-match-img-preview">${imgThumb}</div>
          <button class="ef-match-remove-btn" id="ef-match-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    MATCHFormUtils.bindCollapsible(
      this._root.querySelector('#ef-match-svg-toggle'),
      this._root.querySelector('#ef-match-svg-section')
    );
    this._root.querySelector('#ef-match-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-match-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-match-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-match-svg').value = '';
      this._root.querySelector('#ef-match-svg-preview').innerHTML = '';
    });

    MATCHFormUtils.bindCollapsible(
      this._root.querySelector('#ef-match-img-toggle'),
      this._root.querySelector('#ef-match-img-section')
    );
    this._root.querySelector('#ef-match-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-match-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-match-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-match-svg')?.value.trim()     || ''; }
  getImgUrl() { return this._root.querySelector('#ef-match-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-match-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${MATCHFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: pairs list (drag/add/delete/shared preview) + distractors list + scoring method
// Unique to matching form

class MATCHAnswerWidget {

  constructor(root) {
    this._root       = root;
    this._pairDragSrc = null;
  }

  render(q) {
    const pairs       = Array.isArray(q.pairs)       ? q.pairs       : [];
    const distractors = Array.isArray(q.distractors) ? q.distractors : [];

    return `
      <div class="ef-match-field">
        <div class="ef-match-options-header">
          <label class="ef-match-label">Pairs</label>
          <button class="ef-match-add-option-btn" id="ef-match-add-pair">+ Add Pair</button>
        </div>
        <div class="ef-match-col-headers">
          <span></span>
          <span class="ef-match-col-label">Left</span>
          <span></span>
          <span class="ef-match-col-label">Right (correct match)</span>
          <span></span>
        </div>
        <div class="ef-match-pairs-list" id="ef-match-pairs-list">
          ${pairs.map((p, i) => this._pairRowHTML(p.left || '', p.right || '', i)).join('')}
        </div>
        <div class="ef-match-option-preview-box" id="ef-match-pair-preview-box">
          <div class="ef-match-option-preview-label" id="ef-match-pair-preview-label">
            Previewing pair 1 — left
          </div>
          <div class="ef-match-option-preview-content"
               id="ef-match-pair-preview-content"></div>
        </div>
        <div class="ef-match-error" id="ef-match-pairs-error"></div>
      </div>

      <div class="ef-match-field">
        <div class="ef-match-options-header">
          <label class="ef-match-label">
            Distractors
            <span class="ef-match-optional">— wrong options shown to student</span>
          </label>
          <button class="ef-match-add-option-btn" id="ef-match-add-distractor">
            + Add Distractor
          </button>
        </div>
        <div class="ef-match-distractor-hint">
          These appear in the dropdown along with correct answers to mislead the student.
        </div>
        <div class="ef-match-distractors-list" id="ef-match-distractors-list">
          ${distractors.map((d, i) => this._distractorRowHTML(d, i)).join('')}
        </div>
      </div>

      <div class="ef-match-field">
        <label class="ef-match-label">Scoring Method</label>
        <select class="ef-match-select" id="ef-match-scoring-method">
          <option value="exact"
            ${(q.scoring_method || 'exact') === 'exact' ? 'selected' : ''}>
            Exact — all pairs must be correct
          </option>
          <option value="partial"
            ${(q.scoring_method || '') === 'partial' ? 'selected' : ''}>
            Partial — credit per correct pair
          </option>
        </select>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-match-add-pair')
      ?.addEventListener('click', () => this.addPairRow());

    const pairsList = this._root.querySelector('#ef-match-pairs-list');
    if (pairsList) this._bindPairsListEvents(pairsList);

    this._root.querySelector('#ef-match-add-distractor')
      ?.addEventListener('click', () => this.addDistractorRow());

    const distList = this._root.querySelector('#ef-match-distractors-list');
    if (distList) this._bindDistractorListEvents(distList);
  }

  addPairRow() {
    const list  = this._root.querySelector('#ef-match-pairs-list');
    const count = list.querySelectorAll('.ef-match-pair-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._pairRowHTML('', '', count);
    list.appendChild(div.firstElementChild);
    this._reindexPairs();
    list.querySelector('.ef-match-pair-row:last-child .ef-match-left')?.focus();
  }

  addDistractorRow() {
    const list  = this._root.querySelector('#ef-match-distractors-list');
    const count = list.querySelectorAll('.ef-match-distractor-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._distractorRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexDistractors();
    list.querySelector('.ef-match-distractor-row:last-child .ef-match-distractor-input')?.focus();
  }

  getPairs() {
    return Array.from(this._root.querySelectorAll('.ef-match-pair-row')).map(row => ({
      left:  row.querySelector('.ef-match-left')?.value.trim()  || '',
      right: row.querySelector('.ef-match-right')?.value.trim() || '',
    }));
  }

  getDistractors() {
    return Array.from(this._root.querySelectorAll('.ef-match-distractor-input'))
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-match-scoring-method')?.value || 'exact';
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-match-pairs-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private: HTML builders ────────────────────────────

  _pairRowHTML(left, right, index) {
    return `
      <div class="ef-match-pair-row" draggable="true" data-pair-index="${index}">
        <span class="ef-match-drag-handle" title="Drag to reorder">⠿</span>
        <div class="ef-match-pair-cell">
          <textarea class="ef-match-pair-textarea ef-match-left"
                    rows="2"
                    placeholder="Left item (HTML/MathML supported)"
                    data-pair-index="${index}"
                    data-side="left"
          >${MATCHFormUtils.escHtml(left)}</textarea>
        </div>
        <div class="ef-match-arrow">→</div>
        <div class="ef-match-pair-cell">
          <textarea class="ef-match-pair-textarea ef-match-right"
                    rows="2"
                    placeholder="Right item (HTML/MathML supported)"
                    data-pair-index="${index}"
                    data-side="right"
          >${MATCHFormUtils.escHtml(right)}</textarea>
        </div>
        <button class="ef-match-pair-delete" data-pair-index="${index}"
                title="Delete pair">✕</button>
      </div>`;
  }

  _distractorRowHTML(val, index) {
    return `
      <div class="ef-match-distractor-row" data-dist-index="${index}">
        <input type="text"
               class="ef-match-distractor-input"
               placeholder="Wrong answer option..."
               value="${MATCHFormUtils.escHtml(val)}"
               data-dist-index="${index}"
        />
        <button class="ef-match-distractor-delete" title="Delete">✕</button>
      </div>`;
  }

  // ── Private: reindex ──────────────────────────────────

  _reindexPairs() {
    this._root.querySelectorAll('.ef-match-pair-row').forEach((row, i) => {
      row.dataset.pairIndex = i;
      row.querySelectorAll('.ef-match-pair-textarea').forEach(ta => {
        ta.dataset.pairIndex = i;
      });
    });
  }

  _reindexDistractors() {
    this._root.querySelectorAll('.ef-match-distractor-row').forEach((row, i) => {
      row.dataset.distIndex = i;
      const inp = row.querySelector('.ef-match-distractor-input');
      if (inp) inp.dataset.distIndex = i;
    });
  }

  // ── Private: event binding ────────────────────────────

  _bindPairsListEvents(list) {

    // Focus → shared preview
    list.addEventListener('focusin', (e) => {
      const ta = e.target;
      if (!ta.classList.contains('ef-match-pair-textarea')) return;
      const index   = parseInt(ta.dataset.pairIndex);
      const side    = ta.dataset.side || (ta.classList.contains('ef-match-left') ? 'left' : 'right');
      const box     = this._root.querySelector('#ef-match-pair-preview-box');
      const label   = this._root.querySelector('#ef-match-pair-preview-label');
      const preview = this._root.querySelector('#ef-match-pair-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing pair ${index + 1} — ${side}`;
      preview.innerHTML = ta.value;
    });

    // Live update
    list.addEventListener('input', (e) => {
      const ta = e.target;
      if (!ta.classList.contains('ef-match-pair-textarea')) return;
      const index   = parseInt(ta.dataset.pairIndex);
      const side    = ta.dataset.side || (ta.classList.contains('ef-match-left') ? 'left' : 'right');
      const label   = this._root.querySelector('#ef-match-pair-preview-label');
      const preview = this._root.querySelector('#ef-match-pair-preview-content');
      if (label)   label.textContent = `Previewing pair ${index + 1} — ${side}`;
      if (preview) preview.innerHTML = ta.value;
    });

    // Delete pair
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-match-pair-delete')) return;
      e.target.closest('.ef-match-pair-row').remove();
      this._reindexPairs();
      if (!list.querySelectorAll('.ef-match-pair-row').length) {
        this._root.querySelector('#ef-match-pair-preview-box')?.classList.remove('visible');
      }
    });

    // Drag reorder
    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-match-pair-row');
      if (!row) return;
      this._pairDragSrc = parseInt(row.dataset.pairIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.ef-match-pair-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-match-pair-row');
      if (row && parseInt(row.dataset.pairIndex) !== this._pairDragSrc) {
        list.querySelectorAll('.ef-match-pair-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-match-pair-row');
      if (!target) return;
      const to   = parseInt(target.dataset.pairIndex);
      const from = this._pairDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      const rows  = Array.from(list.querySelectorAll('.ef-match-pair-row'));
      const moved = rows.splice(from, 1)[0];
      rows.splice(to, 0, moved);
      list.innerHTML = '';
      rows.forEach(r => list.appendChild(r));
      this._reindexPairs();
    });
  }

  _bindDistractorListEvents(list) {
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-match-distractor-delete')) return;
      e.target.closest('.ef-match-distractor-row').remove();
      this._reindexDistractors();
    });
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class MATCHMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-match-field">
        <label class="ef-match-label">
          Explanation <span class="ef-match-optional">(optional)</span>
        </label>
        <textarea class="ef-match-textarea" id="ef-match-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${MATCHFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-match-render-preview" id="ef-match-explanation-preview"></div>
      </div>

      <div class="ef-match-field">
        <label class="ef-match-label">Difficulty</label>
        <select class="ef-match-select" id="ef-match-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-match-row-2">
        <div class="ef-match-field">
          <label class="ef-match-label">
            Points <span class="ef-match-optional">(optional)</span>
          </label>
          <input class="ef-match-input" id="ef-match-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-match-field">
          <label class="ef-match-label">
            Time Limit (sec) <span class="ef-match-optional">(optional)</span>
          </label>
          <input class="ef-match-input" id="ef-match-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-match-field">
        <label class="ef-match-label">
          Tags <span class="ef-match-optional">(comma separated)</span>
        </label>
        <input class="ef-match-input" id="ef-match-tags" type="text"
          placeholder="e.g. science, astronomy"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    MATCHFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-match-explanation'),
      this._root.querySelector('#ef-match-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-match-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-match-difficulty')?.value || 'easy',
      points:      MATCHFormUtils.parseOptionalNumber(this._root.querySelector('#ef-match-points')),
      time_limit:  MATCHFormUtils.parseOptionalNumber(this._root.querySelector('#ef-match-time-limit')),
      tags:        MATCHFormUtils.parseTags(this._root.querySelector('#ef-match-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class MatchingFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('matching');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'matching') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Matching';
    const bodyClass    = isSkip ? 'ef-match-body ef-match-is-skip' : 'ef-match-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new MATCHQuestionWidget(this);
    const mediaWidget = new MATCHMediaWidget(this);
    const ansWidget   = new MATCHAnswerWidget(this);
    const metaWidget  = new MATCHMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-match-form">
        <div class="${bodyClass}" id="ef-match-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-match-footer">
          <button class="ef-match-btn-save" id="ef-match-btn-save">Save</button>
          <button class="ef-match-btn-skip" id="ef-match-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new MATCHQuestionWidget(this);
    this._mediaWidget = new MATCHMediaWidget(this);
    this._ansWidget   = new MATCHAnswerWidget(this);
    this._metaWidget  = new MATCHMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-match-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-match-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'matching') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Matching';
    const body      = this.querySelector('#ef-match-body');
    const btn       = this.querySelector('#ef-match-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'matching';
      delete this._question.original_type;
      body.classList.remove('ef-match-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-match-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-match-question')?.focus();
      return;
    }

    const pairs = this._ansWidget.getPairs();
    if (pairs.length < 2) {
      this._ansWidget.showError('At least 2 pairs are required.');
      return;
    }

    const saved = {
      type:           this._question?.type || 'matching',
      question:       questionText,
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      pairs,
      distractors:    this._ansWidget.getDistractors(),
      user_response:  Array(pairs.length).fill(''),
      scoring_method: this._ansWidget.getScoringMethod(),
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
    const pairs = this._ansWidget.getPairs();
    return {
      type:           this._question?.type || 'matching',
      question:       this._qWidget.getValue(),
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      pairs,
      distractors:    this._ansWidget.getDistractors(),
      user_response:  Array(pairs.length).fill(''),
      scoring_method: this._ansWidget.getScoringMethod(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('matching-form', MatchingFormComponent);