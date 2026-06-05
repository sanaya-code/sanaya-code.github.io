// editor/components/question_forms/multi_fill_in_blank_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class MFIBFormUtils {

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
// Owns: segment builder (text + blank pills), inline edit panel,
//       assembled preview, blank count summary, Add Text / Add Blank buttons
// Unique to multi_fill_in_blank — no textarea; uses pill-based builder

class MFIBQuestionWidget {

  constructor(root) {
    this._root          = root;
    this._segments      = [];
    this._activeSegment = -1;
  }

  // Called by orchestrator before render to load existing segments
  setSegments(segments) {
    this._segments      = segments;
    this._activeSegment = -1;
  }

  getSegments() { return this._segments; }

  render() {
    const blankCount = this._segments.filter(s => s.type === 'blank').length;
    return `
      <div class="ef-mfib-field">
        <label class="ef-mfib-label">Question</label>
        <div class="ef-mfib-builder" id="ef-mfib-builder">
          ${this._renderPills()}
        </div>
        <div class="ef-mfib-assembled-preview" id="ef-mfib-assembled-preview"></div>
        <div class="ef-mfib-blanks-summary ${blankCount > 0 ? 'has-blanks' : ''}"
             id="ef-mfib-blanks-summary">
          ${this._hintText(blankCount)}
        </div>
        <div class="ef-mfib-add-btns">
          <button class="ef-mfib-add-text-btn"  id="ef-mfib-add-text">+ Add Text</button>
          <button class="ef-mfib-add-blank-btn" id="ef-mfib-add-blank">+ Add Blank</button>
        </div>
        <div id="ef-mfib-edit-panel" style="display:none"></div>
        <div class="ef-mfib-error" id="ef-mfib-error"></div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-mfib-add-text')?.addEventListener('click', () => {
      this._segments.push({ type: 'text', value: '' });
      this._showEditPanel(this._segments.length - 1);
    });

    this._root.querySelector('#ef-mfib-add-blank')?.addEventListener('click', () => {
      this._segments.push({
        type: 'blank', correct_answer: '', acceptable_answers: [], hint: ''
      });
      this._showEditPanel(this._segments.length - 1);
    });

    this._bindPillEvents();
    this._updateAssembledPreview();
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-mfib-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private: render ──────────────────────────────────

  _renderPills() {
    if (!this._segments.length) {
      return '<span class="ef-mfib-builder-empty">Add text and blanks to build your question</span>';
    }
    let blankNum = 0;
    return this._segments.map((seg, i) => {
      const active = this._activeSegment === i ? 'active' : '';
      if (seg.type === 'blank') {
        blankNum++;
        return `
          <span class="ef-mfib-segment ef-mfib-segment-blank ${active}"
                data-seg-index="${i}">
            <span class="ef-mfib-seg-num">${blankNum}</span>
            ____
          </span>`;
      }
      const display = seg.value.length > 30
        ? seg.value.slice(0, 30) + '…'
        : (seg.value || '(empty text)');
      return `
        <span class="ef-mfib-segment ef-mfib-segment-text ${active}"
              data-seg-index="${i}">
          <span class="ef-mfib-seg-val">${MFIBFormUtils.escHtml(display)}</span>
        </span>`;
    }).join('');
  }

  _renderEditPanel(segIndex) {
    const seg = this._segments[segIndex];
    if (!seg) return '';

    if (seg.type === 'text') {
      return `
        <div class="ef-mfib-edit-panel">
          <div class="ef-mfib-edit-title">Edit Text</div>
          <div class="ef-mfib-edit-field">
            <label class="ef-mfib-edit-label">Text content (HTML/MathML supported)</label>
            <textarea class="ef-mfib-edit-input" id="ef-mfib-seg-text-val"
              rows="2"
              placeholder="Enter text..."
              style="resize:vertical;min-height:52px;font-family:var(--font-mono);font-size:12px"
            >${MFIBFormUtils.escHtml(seg.value)}</textarea>
          </div>
          <div class="ef-mfib-edit-actions">
            <button class="ef-mfib-edit-save"   id="ef-mfib-seg-save">Save</button>
            <button class="ef-mfib-edit-delete" id="ef-mfib-seg-delete">Delete</button>
            <button class="ef-mfib-edit-cancel" id="ef-mfib-seg-cancel">Cancel</button>
          </div>
        </div>`;
    }

    const blankNum = this._segments
      .slice(0, segIndex + 1)
      .filter(s => s.type === 'blank').length;

    return `
      <div class="ef-mfib-edit-panel">
        <div class="ef-mfib-edit-title">Edit Blank #${blankNum}</div>
        <div class="ef-mfib-edit-field">
          <label class="ef-mfib-edit-label">Correct Answer</label>
          <input class="ef-mfib-edit-input" id="ef-mfib-seg-correct"
            type="text" placeholder="e.g. 3"
            value="${MFIBFormUtils.escHtml(seg.correct_answer || '')}"
          />
        </div>
        <div class="ef-mfib-edit-field">
          <label class="ef-mfib-edit-label">
            Acceptable Answers
            <span style="font-weight:400;text-transform:none">(comma separated)</span>
          </label>
          <input class="ef-mfib-edit-input" id="ef-mfib-seg-acceptable"
            type="text" placeholder="e.g. three, 3"
            value="${Array.isArray(seg.acceptable_answers)
              ? seg.acceptable_answers.join(', ') : ''}"
          />
        </div>
        <div class="ef-mfib-edit-field">
          <label class="ef-mfib-edit-label">
            Hint <span style="font-weight:400;text-transform:none">(optional)</span>
          </label>
          <input class="ef-mfib-edit-input" id="ef-mfib-seg-hint"
            type="text" placeholder="Hint shown to student..."
            value="${MFIBFormUtils.escHtml(seg.hint || '')}"
          />
        </div>
        <div class="ef-mfib-edit-actions">
          <button class="ef-mfib-edit-save"   id="ef-mfib-seg-save">Save</button>
          <button class="ef-mfib-edit-delete" id="ef-mfib-seg-delete">Delete</button>
          <button class="ef-mfib-edit-cancel" id="ef-mfib-seg-cancel">Cancel</button>
        </div>
      </div>`;
  }

  // ── Private: refresh (partial re-render) ─────────────

  _refreshBuilder() {
    const builder = this._root.querySelector('#ef-mfib-builder');
    if (builder) builder.innerHTML = this._renderPills();

    const blankCount = this._segments.filter(s => s.type === 'blank').length;
    const summary    = this._root.querySelector('#ef-mfib-blanks-summary');
    if (summary) {
      summary.textContent = this._hintText(blankCount);
      summary.className   = 'ef-mfib-blanks-summary' + (blankCount > 0 ? ' has-blanks' : '');
    }

    this._updateAssembledPreview();
    this._bindPillEvents();
  }

  _updateAssembledPreview() {
    const preview = this._root.querySelector('#ef-mfib-assembled-preview');
    if (!preview) return;
    if (!this._segments.length) { preview.innerHTML = ''; return; }
    let blankNum = 0;
    preview.innerHTML = this._segments.map(seg => {
      if (seg.type === 'text') return seg.value;
      blankNum++;
      return `<span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--accent);
                           color:var(--accent);font-size:11px;text-align:center;
                           margin:0 2px;padding:0 4px">_${blankNum}_</span>`;
    }).join('');
  }

  _hintText(blankCount) {
    return blankCount === 0
      ? 'No blanks added yet — click + Add Blank'
      : `${blankCount} blank${blankCount > 1 ? 's' : ''} defined`;
  }

  // ── Private: show/hide edit panel ────────────────────

  _showEditPanel(segIndex) {
    this._activeSegment = segIndex;
    const panel = this._root.querySelector('#ef-mfib-edit-panel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = this._renderEditPanel(segIndex);
    this._refreshBuilder();
    this._bindEditPanelEvents(segIndex);
    panel.querySelector('.ef-mfib-edit-input')?.focus();
  }

  _hideEditPanel() {
    this._activeSegment = -1;
    const panel = this._root.querySelector('#ef-mfib-edit-panel');
    if (panel) panel.style.display = 'none';
    this._refreshBuilder();
  }

  // ── Private: event binding ────────────────────────────

  _bindPillEvents() {
    this._root.querySelectorAll('.ef-mfib-segment').forEach(pill => {
      pill.addEventListener('click', () => {
        const i = parseInt(pill.dataset.segIndex);
        if (this._activeSegment === i) this._hideEditPanel();
        else this._showEditPanel(i);
      });
    });
  }

  _bindEditPanelEvents(segIndex) {
    const seg = this._segments[segIndex];

    this._root.querySelector('#ef-mfib-seg-save')?.addEventListener('click', () => {
      if (seg.type === 'text') {
        seg.value = this._root.querySelector('#ef-mfib-seg-text-val')?.value.trim() || '';
      } else {
        seg.correct_answer = this._root.querySelector('#ef-mfib-seg-correct')?.value.trim() || '';
        seg.acceptable_answers = (this._root.querySelector('#ef-mfib-seg-acceptable')?.value || '')
          .split(',').map(s => s.trim()).filter(s => s.length > 0);
        seg.hint = this._root.querySelector('#ef-mfib-seg-hint')?.value.trim() || '';
      }
      this._hideEditPanel();
    });

    this._root.querySelector('#ef-mfib-seg-delete')?.addEventListener('click', () => {
      this._segments.splice(segIndex, 1);
      this._hideEditPanel();
    });

    this._root.querySelector('#ef-mfib-seg-cancel')?.addEventListener('click', () => {
      // Remove brand-new empty segment if cancelled immediately
      if (seg && seg.type === 'text'  && seg.value === '') this._segments.splice(segIndex, 1);
      if (seg && seg.type === 'blank' && seg.correct_answer === '') this._segments.splice(segIndex, 1);
      this._hideEditPanel();
    });
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class MFIBMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${MFIBFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-mfib-img-preview visible' : 'ef-mfib-img-preview';

    return `
      <div class="ef-mfib-collapsible" id="ef-mfib-svg-section">
        <div class="ef-mfib-collapsible-header" id="ef-mfib-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-mfib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-mfib-collapsible-body">
          <textarea class="ef-mfib-textarea" id="ef-mfib-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${MFIBFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-mfib-svg-preview" id="ef-mfib-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-mfib-remove-btn" id="ef-mfib-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-mfib-collapsible" id="ef-mfib-img-section">
        <div class="ef-mfib-collapsible-header" id="ef-mfib-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-mfib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-mfib-collapsible-body">
          <input class="ef-mfib-input" id="ef-mfib-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${MFIBFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-mfib-img-preview">${imgThumb}</div>
          <button class="ef-mfib-remove-btn" id="ef-mfib-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    MFIBFormUtils.bindCollapsible(
      this._root.querySelector('#ef-mfib-svg-toggle'),
      this._root.querySelector('#ef-mfib-svg-section')
    );
    this._root.querySelector('#ef-mfib-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-mfib-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-mfib-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-mfib-svg').value = '';
      this._root.querySelector('#ef-mfib-svg-preview').innerHTML = '';
    });

    MFIBFormUtils.bindCollapsible(
      this._root.querySelector('#ef-mfib-img-toggle'),
      this._root.querySelector('#ef-mfib-img-section')
    );
    this._root.querySelector('#ef-mfib-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-mfib-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-mfib-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-mfib-svg')?.value.trim()    || ''; }
  getImgUrl() { return this._root.querySelector('#ef-mfib-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-mfib-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${MFIBFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: case-sensitive checkbox, scoring method, feedback collapsible
// Unique to multi_fill_in_blank — no options/drag; blanks are in QuestionWidget

class MFIBAnswerWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-mfib-field">
        <label class="ef-mfib-checkbox-row">
          <input type="checkbox" id="ef-mfib-case-sensitive"
            ${q.case_sensitive ? 'checked' : ''} />
          Case sensitive matching
        </label>
      </div>

      <div class="ef-mfib-field">
        <label class="ef-mfib-label">Scoring Method</label>
        <select class="ef-mfib-select" id="ef-mfib-scoring-method">
          <option value="exact"
            ${(q.scoring_method || 'exact') === 'exact' ? 'selected' : ''}>
            Exact — all blanks must be correct
          </option>
          <option value="partial"
            ${(q.scoring_method || '') === 'partial' ? 'selected' : ''}>
            Partial — credit per correct blank
          </option>
        </select>
      </div>

      <div class="ef-mfib-collapsible" id="ef-mfib-feedback-section">
        <div class="ef-mfib-collapsible-header" id="ef-mfib-feedback-toggle">
          ▶ Feedback Messages
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-mfib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-mfib-collapsible-body">
          <div class="ef-mfib-field">
            <label class="ef-mfib-label">Full Credit</label>
            <input class="ef-mfib-input" id="ef-mfib-feedback-full" type="text"
              placeholder="e.g. All blanks filled correctly"
              value="${MFIBFormUtils.escHtml(q.feedback?.full_credit || '')}"
            />
          </div>
          <div class="ef-mfib-field">
            <label class="ef-mfib-label">Partial Credit</label>
            <input class="ef-mfib-input" id="ef-mfib-feedback-partial" type="text"
              placeholder="e.g. Some blanks correct"
              value="${MFIBFormUtils.escHtml(q.feedback?.partial_credit || '')}"
            />
          </div>
          <div class="ef-mfib-field">
            <label class="ef-mfib-label">No Credit</label>
            <input class="ef-mfib-input" id="ef-mfib-feedback-none" type="text"
              placeholder="e.g. No correct answers"
              value="${MFIBFormUtils.escHtml(q.feedback?.none || '')}"
            />
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    MFIBFormUtils.bindCollapsible(
      this._root.querySelector('#ef-mfib-feedback-toggle'),
      this._root.querySelector('#ef-mfib-feedback-section')
    );
  }

  getData() {
    return {
      case_sensitive: this._root.querySelector('#ef-mfib-case-sensitive')?.checked || false,
      scoring_method: this._root.querySelector('#ef-mfib-scoring-method')?.value   || 'exact',
      feedback: {
        full_credit:    this._root.querySelector('#ef-mfib-feedback-full')?.value.trim()    || '',
        partial_credit: this._root.querySelector('#ef-mfib-feedback-partial')?.value.trim() || '',
        none:           this._root.querySelector('#ef-mfib-feedback-none')?.value.trim()    || '',
      },
    };
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class MFIBMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-mfib-field">
        <label class="ef-mfib-label">
          Explanation <span class="ef-mfib-optional">(optional)</span>
        </label>
        <textarea class="ef-mfib-textarea" id="ef-mfib-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${MFIBFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-mfib-render-preview" id="ef-mfib-explanation-preview"></div>
      </div>

      <div class="ef-mfib-field">
        <label class="ef-mfib-label">Difficulty</label>
        <select class="ef-mfib-select" id="ef-mfib-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-mfib-row-2">
        <div class="ef-mfib-field">
          <label class="ef-mfib-label">
            Points <span class="ef-mfib-optional">(optional)</span>
          </label>
          <input class="ef-mfib-input" id="ef-mfib-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-mfib-field">
          <label class="ef-mfib-label">
            Time Limit (sec) <span class="ef-mfib-optional">(optional)</span>
          </label>
          <input class="ef-mfib-input" id="ef-mfib-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-mfib-field">
        <label class="ef-mfib-label">
          Tags <span class="ef-mfib-optional">(comma separated)</span>
        </label>
        <input class="ef-mfib-input" id="ef-mfib-tags" type="text"
          placeholder="e.g. science, physics"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    MFIBFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-mfib-explanation'),
      this._root.querySelector('#ef-mfib-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-mfib-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-mfib-difficulty')?.value || 'easy',
      points:      MFIBFormUtils.parseOptionalNumber(this._root.querySelector('#ef-mfib-points')),
      time_limit:  MFIBFormUtils.parseOptionalNumber(this._root.querySelector('#ef-mfib-time-limit')),
      tags:        MFIBFormUtils.parseTags(this._root.querySelector('#ef-mfib-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class MultiFillInBlankFormComponent extends HTMLElement {

  connectedCallback() {
    this._question = null;
    this._index    = -1;
    this._segments = [];
    this._render();
    this._bindAll();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._segments = this._parseSegments(question);
    this._render();
    this._bindAll();
  }

  // ── Parse existing question into segments ────────────

  _parseSegments(q) {
    if (!q.question && (!q.blanks || !q.blanks.length)) return [];
    const text   = q.question || '';
    const blanks = Array.isArray(q.blanks) ? q.blanks : [];
    const parts  = text.split('____');
    const segs   = [];
    parts.forEach((part, i) => {
      if (part) segs.push({ type: 'text', value: part });
      if (i < blanks.length) {
        const b = blanks[i] || {};
        segs.push({
          type:               'blank',
          correct_answer:     b.correct_answer     || '',
          acceptable_answers: b.acceptable_answers || [],
          hint:               b.hint               || '',
        });
      } else if (i < parts.length - 1) {
        segs.push({ type: 'blank', correct_answer: '', acceptable_answers: [], hint: '' });
      }
    });
    return segs;
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('multi_fill_in_blank');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'multi_fill_in_blank') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Multi Fill Blank';
    const bodyClass    = isSkip ? 'ef-mfib-body ef-mfib-is-skip' : 'ef-mfib-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new MFIBQuestionWidget(this);
    const mediaWidget = new MFIBMediaWidget(this);
    const ansWidget   = new MFIBAnswerWidget(this);
    const metaWidget  = new MFIBMetadataWidget(this);

    qWidget.setSegments(this._segments);

    this.innerHTML = `
      <div class="ef-mfib-form">
        <div class="${bodyClass}" id="ef-mfib-body">
          ${qWidget.render()}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-mfib-footer">
          <button class="ef-mfib-btn-save" id="ef-mfib-btn-save">Save</button>
          <button class="ef-mfib-btn-skip" id="ef-mfib-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new MFIBQuestionWidget(this);
    this._mediaWidget = new MFIBMediaWidget(this);
    this._ansWidget   = new MFIBAnswerWidget(this);
    this._metaWidget  = new MFIBMetadataWidget(this);

    // Share the live segments array with the question widget
    this._qWidget.setSegments(this._segments);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-mfib-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-mfib-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'multi_fill_in_blank') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Multi Fill Blank';
    const body      = this.querySelector('#ef-mfib-body');
    const btn       = this.querySelector('#ef-mfib-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'multi_fill_in_blank';
      delete this._question.original_type;
      body.classList.remove('ef-mfib-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-mfib-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._qWidget.showError('');

    const segments   = this._qWidget.getSegments();
    const blankCount = segments.filter(s => s.type === 'blank').length;

    if (!segments.length) {
      this._qWidget.showError('Add at least one text segment or blank.');
      return;
    }
    if (blankCount === 0) {
      this._qWidget.showError('Add at least one blank.');
      return;
    }

    const questionText = segments
      .map(s => s.type === 'text' ? s.value : '____')
      .join('');

    let pos = 0;
    const blanks = segments
      .filter(s => s.type === 'blank')
      .map(s => ({
        position:           ++pos,
        correct_answer:     s.correct_answer,
        acceptable_answers: s.acceptable_answers,
        hint:               s.hint,
      }));

    const saved = {
      type:          this._question?.type || 'multi_fill_in_blank',
      question:      questionText,
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      blanks:        blanks,
      user_response: Array(blankCount).fill(''),
      ...this._ansWidget.getData(),
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
    const segments   = this._qWidget.getSegments();
    const blankCount = segments.filter(s => s.type === 'blank').length;
    let pos = 0;
    return {
      type:          this._question?.type || 'multi_fill_in_blank',
      question:      segments.map(s => s.type === 'text' ? s.value : '____').join(''),
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      blanks:        segments.filter(s => s.type === 'blank').map(s => ({
        position: ++pos, correct_answer: s.correct_answer,
        acceptable_answers: s.acceptable_answers, hint: s.hint,
      })),
      user_response: Array(blankCount).fill(''),
      ...this._ansWidget.getData(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('multi-fill-in-blank-form', MultiFillInBlankFormComponent);