// editor/components/question_forms/matching_connection_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class MCONNFormUtils {

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

class MCONNQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-mconn-field">
        <label class="ef-mconn-label">Question Text</label>
        <textarea class="ef-mconn-textarea" id="ef-mconn-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${MCONNFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-mconn-render-preview" id="ef-mconn-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    MCONNFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-mconn-question'),
      this._root.querySelector('#ef-mconn-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-mconn-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class MCONNMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${MCONNFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-mconn-img-preview visible' : 'ef-mconn-img-preview';

    return `
      <div class="ef-mconn-collapsible" id="ef-mconn-svg-section">
        <div class="ef-mconn-collapsible-header" id="ef-mconn-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-mconn-collapsible-arrow">▼</span>
        </div>
        <div class="ef-mconn-collapsible-body">
          <textarea class="ef-mconn-textarea" id="ef-mconn-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${MCONNFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-mconn-svg-preview" id="ef-mconn-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-mconn-remove-btn" id="ef-mconn-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-mconn-collapsible" id="ef-mconn-img-section">
        <div class="ef-mconn-collapsible-header" id="ef-mconn-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-mconn-collapsible-arrow">▼</span>
        </div>
        <div class="ef-mconn-collapsible-body">
          <input class="ef-mconn-input" id="ef-mconn-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${MCONNFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-mconn-img-preview">${imgThumb}</div>
          <button class="ef-mconn-remove-btn" id="ef-mconn-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    MCONNFormUtils.bindCollapsible(
      this._root.querySelector('#ef-mconn-svg-toggle'),
      this._root.querySelector('#ef-mconn-svg-section')
    );
    this._root.querySelector('#ef-mconn-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-mconn-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-mconn-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-mconn-svg').value = '';
      this._root.querySelector('#ef-mconn-svg-preview').innerHTML = '';
    });

    MCONNFormUtils.bindCollapsible(
      this._root.querySelector('#ef-mconn-img-toggle'),
      this._root.querySelector('#ef-mconn-img-section')
    );
    this._root.querySelector('#ef-mconn-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-mconn-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-mconn-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-mconn-svg')?.value.trim()     || ''; }
  getImgUrl() { return this._root.querySelector('#ef-mconn-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-mconn-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${MCONNFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: pairs list (drag/add/delete) + shared preview box + scoring method
// Unique to matching_connection form — no distractors

class MCONNAnswerWidget {

  constructor(root) {
    this._root       = root;
    this._dragSrc    = null;
  }

  render(q) {
    const pairs = Array.isArray(q.pairs) ? q.pairs : [];

    return `
      <div class="ef-mconn-field">
        <div class="ef-mconn-options-header">
          <label class="ef-mconn-label">Pairs</label>
          <button class="ef-mconn-add-option-btn" id="ef-mconn-add-pair">+ Add Pair</button>
        </div>
        <div class="ef-mconn-col-headers">
          <span></span>
          <span class="ef-mconn-col-label">Left</span>
          <span></span>
          <span class="ef-mconn-col-label">Right (correct match)</span>
          <span></span>
        </div>
        <div class="ef-mconn-pairs-list" id="ef-mconn-pairs-list">
          ${pairs.map((p, i) => this._pairRowHTML(p.left || '', p.right || '', i)).join('')}
        </div>
        <div class="ef-mconn-option-preview-box" id="ef-mconn-pair-preview-box">
          <div class="ef-mconn-option-preview-label" id="ef-mconn-pair-preview-label">
            Previewing pair 1 — left
          </div>
          <div class="ef-mconn-option-preview-content"
               id="ef-mconn-pair-preview-content"></div>
        </div>
        <div class="ef-mconn-error" id="ef-mconn-pairs-error"></div>
      </div>

      <div class="ef-mconn-field">
        <label class="ef-mconn-label">Scoring Method</label>
        <select class="ef-mconn-select" id="ef-mconn-scoring-method">
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
    this._root.querySelector('#ef-mconn-add-pair')
      ?.addEventListener('click', () => this._addPairRow());

    const list = this._root.querySelector('#ef-mconn-pairs-list');
    if (list) this._bindListEvents(list);
  }

  getPairs() {
    return Array.from(this._root.querySelectorAll('.ef-mconn-pair-row')).map(row => ({
      left:  row.querySelector('.ef-mconn-left')?.value.trim()  || '',
      right: row.querySelector('.ef-mconn-right')?.value.trim() || '',
    }));
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-mconn-scoring-method')?.value || 'exact';
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-mconn-pairs-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private: HTML builders ────────────────────────────

  _pairRowHTML(left, right, index) {
    return `
      <div class="ef-mconn-pair-row" draggable="true" data-pair-index="${index}">
        <span class="ef-mconn-drag-handle" title="Drag to reorder">⠿</span>
        <div class="ef-mconn-pair-cell">
          <textarea class="ef-mconn-pair-textarea ef-mconn-left"
                    rows="2"
                    placeholder="Left item (HTML/MathML supported)"
                    data-pair-index="${index}"
                    data-side="left"
          >${MCONNFormUtils.escHtml(left)}</textarea>
        </div>
        <div class="ef-mconn-arrow">→</div>
        <div class="ef-mconn-pair-cell">
          <textarea class="ef-mconn-pair-textarea ef-mconn-right"
                    rows="2"
                    placeholder="Right item (HTML/MathML supported)"
                    data-pair-index="${index}"
                    data-side="right"
          >${MCONNFormUtils.escHtml(right)}</textarea>
        </div>
        <button class="ef-mconn-pair-delete" data-pair-index="${index}"
                title="Delete pair">✕</button>
      </div>`;
  }

  // ── Private: add row ──────────────────────────────────

  _addPairRow() {
    const list  = this._root.querySelector('#ef-mconn-pairs-list');
    const count = list.querySelectorAll('.ef-mconn-pair-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._pairRowHTML('', '', count);
    list.appendChild(div.firstElementChild);
    this._reindex();
    list.querySelector('.ef-mconn-pair-row:last-child .ef-mconn-left')?.focus();
  }

  // ── Private: reindex ──────────────────────────────────

  _reindex() {
    this._root.querySelectorAll('.ef-mconn-pair-row').forEach((row, i) => {
      row.dataset.pairIndex = i;
      row.querySelectorAll('.ef-mconn-pair-textarea').forEach(ta => {
        ta.dataset.pairIndex = i;
      });
      const del = row.querySelector('.ef-mconn-pair-delete');
      if (del) del.dataset.pairIndex = i;
    });
  }

  // ── Private: event binding ────────────────────────────

  _bindListEvents(list) {

    // Focus → shared preview
    list.addEventListener('focusin', (e) => {
      const ta = e.target;
      if (!ta.classList.contains('ef-mconn-pair-textarea')) return;
      const index   = parseInt(ta.dataset.pairIndex);
      const side    = ta.dataset.side;
      const box     = this._root.querySelector('#ef-mconn-pair-preview-box');
      const label   = this._root.querySelector('#ef-mconn-pair-preview-label');
      const content = this._root.querySelector('#ef-mconn-pair-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing pair ${index + 1} — ${side}`;
      content.innerHTML = ta.value;
    });

    // Live update preview while typing
    list.addEventListener('input', (e) => {
      const ta = e.target;
      if (!ta.classList.contains('ef-mconn-pair-textarea')) return;
      const index   = parseInt(ta.dataset.pairIndex);
      const side    = ta.dataset.side;
      const label   = this._root.querySelector('#ef-mconn-pair-preview-label');
      const content = this._root.querySelector('#ef-mconn-pair-preview-content');
      if (label)   label.textContent = `Previewing pair ${index + 1} — ${side}`;
      if (content) content.innerHTML = ta.value;
    });

    // Delete pair
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-mconn-pair-delete')) return;
      e.target.closest('.ef-mconn-pair-row').remove();
      this._reindex();
      if (!list.querySelectorAll('.ef-mconn-pair-row').length) {
        this._root.querySelector('#ef-mconn-pair-preview-box')?.classList.remove('visible');
      }
    });

    // Drag reorder — dragstart
    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-mconn-pair-row');
      if (!row) return;
      this._dragSrc = parseInt(row.dataset.pairIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    // Drag reorder — dragend
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.ef-mconn-pair-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });

    // Drag reorder — dragover
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-mconn-pair-row');
      if (row && parseInt(row.dataset.pairIndex) !== this._dragSrc) {
        list.querySelectorAll('.ef-mconn-pair-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });

    // Drag reorder — drop
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-mconn-pair-row');
      if (!target) return;
      const to   = parseInt(target.dataset.pairIndex);
      const from = this._dragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      const rows  = Array.from(list.querySelectorAll('.ef-mconn-pair-row'));
      const moved = rows.splice(from, 1)[0];
      rows.splice(to, 0, moved);
      list.innerHTML = '';
      rows.forEach(r => list.appendChild(r));
      this._reindex();
    });

  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class MCONNMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-mconn-field">
        <label class="ef-mconn-label">
          Explanation <span class="ef-mconn-optional">(optional)</span>
        </label>
        <textarea class="ef-mconn-textarea" id="ef-mconn-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${MCONNFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-mconn-render-preview" id="ef-mconn-explanation-preview"></div>
      </div>

      <div class="ef-mconn-field">
        <label class="ef-mconn-label">Difficulty</label>
        <select class="ef-mconn-select" id="ef-mconn-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-mconn-row-2">
        <div class="ef-mconn-field">
          <label class="ef-mconn-label">
            Points <span class="ef-mconn-optional">(optional)</span>
          </label>
          <input class="ef-mconn-input" id="ef-mconn-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-mconn-field">
          <label class="ef-mconn-label">
            Time Limit (sec) <span class="ef-mconn-optional">(optional)</span>
          </label>
          <input class="ef-mconn-input" id="ef-mconn-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-mconn-field">
        <label class="ef-mconn-label">
          Tags <span class="ef-mconn-optional">(comma separated)</span>
        </label>
        <input class="ef-mconn-input" id="ef-mconn-tags" type="text"
          placeholder="e.g. science, biology"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    MCONNFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-mconn-explanation'),
      this._root.querySelector('#ef-mconn-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-mconn-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-mconn-difficulty')?.value || 'easy',
      points:      MCONNFormUtils.parseOptionalNumber(this._root.querySelector('#ef-mconn-points')),
      time_limit:  MCONNFormUtils.parseOptionalNumber(this._root.querySelector('#ef-mconn-time-limit')),
      tags:        MCONNFormUtils.parseTags(this._root.querySelector('#ef-mconn-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class MatchingConnectionFormComponent extends HTMLElement {

  connectedCallback() {
    this._question = null;
    this._index    = -1;
    this._render();
    this._bindAll();
  }

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._render();
    this._bindAll();
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('matching_connection');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'matching_connection') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Matching Connection';
    const bodyClass    = isSkip ? 'ef-mconn-body ef-mconn-is-skip' : 'ef-mconn-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new MCONNQuestionWidget(this);
    const mediaWidget = new MCONNMediaWidget(this);
    const ansWidget   = new MCONNAnswerWidget(this);
    const metaWidget  = new MCONNMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-mconn-form">
        <div class="${bodyClass}" id="ef-mconn-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-mconn-footer">
          <button class="ef-mconn-btn-save" id="ef-mconn-btn-save">Save</button>
          <button class="ef-mconn-btn-skip" id="ef-mconn-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new MCONNQuestionWidget(this);
    this._mediaWidget = new MCONNMediaWidget(this);
    this._ansWidget   = new MCONNAnswerWidget(this);
    this._metaWidget  = new MCONNMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer ───────────────────────────────────────────

  _bindFooter() {
    this.querySelector('#ef-mconn-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-mconn-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'matching_connection') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Matching Connection';
    const body      = this.querySelector('#ef-mconn-body');
    const btn       = this.querySelector('#ef-mconn-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'matching_connection';
      delete this._question.original_type;
      body.classList.remove('ef-mconn-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-mconn-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-mconn-question')?.focus();
      return;
    }

    const pairs = this._ansWidget.getPairs();
    if (pairs.length < 2) {
      this._ansWidget.showError('At least 2 pairs are required.');
      return;
    }

    const saved = this._collectData();

    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved },
    }));
  }

  // ── Collect data ─────────────────────────────────────

  _collectData() {
    const pairs = this._ansWidget.getPairs();
    const data  = {
      type:           this._question?.type || 'matching_connection',
      question:       this._qWidget.getValue(),
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      pairs,
      user_response:  '',
      scoring_method: this._ansWidget.getScoringMethod(),
      ...this._metaWidget.getData(),
    };

    if (this._question?.original_type) {
      data.original_type = this._question.original_type;
    }

    return data;
  }

}

customElements.define('matching-connection-form', MatchingConnectionFormComponent);