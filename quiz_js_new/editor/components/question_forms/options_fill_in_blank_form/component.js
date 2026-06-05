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

class OFIBQuestionWidget {

  constructor(root) { this._root = root; }

  render(q) {
    return `
      <div class="ef-ofib-field">
        <label class="ef-ofib-label">Question Text</label>
        <textarea class="ef-ofib-textarea" id="ef-ofib-question"
          rows="3" placeholder="Enter question text (HTML/MathML supported)"
        >${OFIBFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-ofib-render-preview" id="ef-ofib-question-preview"></div>
      </div>`;
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

class OFIBMediaWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const imgThumb   = q.img_url ? `<img src="${OFIBFormUtils.escHtml(q.img_url)}" alt="preview" />` : '';
    const imgVisible = q.img_url ? 'ef-ofib-img-preview visible' : 'ef-ofib-img-preview';
    return `
      <div class="ef-ofib-collapsible" id="ef-ofib-svg-section">
        <div class="ef-ofib-collapsible-header" id="ef-ofib-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-ofib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ofib-collapsible-body">
          <textarea class="ef-ofib-textarea" id="ef-ofib-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${OFIBFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-ofib-svg-preview" id="ef-ofib-svg-preview">${q.svg_content || ''}</div>
          <button class="ef-ofib-remove-btn" id="ef-ofib-svg-remove">Remove SVG</button>
        </div>
      </div>
      <div class="ef-ofib-collapsible" id="ef-ofib-img-section">
        <div class="ef-ofib-collapsible-header" id="ef-ofib-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-ofib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ofib-collapsible-body">
          <input class="ef-ofib-input" id="ef-ofib-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${OFIBFormUtils.escHtml(q.img_url || '')}" />
          <div class="${imgVisible}" id="ef-ofib-img-preview">${imgThumb}</div>
          <button class="ef-ofib-remove-btn" id="ef-ofib-img-remove">Remove Image</button>
        </div>
      </div>`;
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

  getSvg()    { return this._root.querySelector('#ef-ofib-svg')?.value.trim()     || ''; }
  getImgUrl() { return this._root.querySelector('#ef-ofib-img-url')?.value.trim() || ''; }

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
// Owns: choices pool — word bank shown to student

class OFIBChoicesWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const choices = Array.isArray(q.choices) ? q.choices : [];
    return `
      <div class="ef-ofib-field">
        <div class="ef-ofib-options-header">
          <label class="ef-ofib-label">
            Choices <span class="ef-ofib-optional">— word bank shown to student</span>
          </label>
          <button class="ef-ofib-add-option-btn" id="ef-ofib-add-choice">+ Add Choice</button>
        </div>
        <div class="ef-ofib-choices-wrap" id="ef-ofib-choices-wrap">
          ${choices.map((c, i) => this._choiceHTML(c, i)).join('')}
        </div>
      </div>`;
  }

  bindEvents() {
    this._root.querySelector('#ef-ofib-add-choice')
      ?.addEventListener('click', () => this._addChoice());
    this._bindChoiceEvents();
  }

  getChoices() {
    return Array.from(this._root.querySelectorAll('.ef-ofib-choice-input'))
      .map(inp => inp.value.trim()).filter(v => v.length > 0);
  }

  _choiceHTML(val, index) {
    return `
      <div class="ef-ofib-choice-row" data-choice-index="${index}">
        <input type="text" class="ef-ofib-choice-input"
               value="${OFIBFormUtils.escHtml(val)}" placeholder="word" />
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

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: blank type + case sensitive + scoring method + feedback collapsible
//       + options list (each option has its own segment builder)

class OFIBAnswerWidget {

  constructor(root) {
    this._root         = root;
    this._options      = [];
    this._activeOption = -1;
    this._activeSeg    = -1;
  }

  setOptions(options) {
    this._options      = options;
    this._activeOption = -1;
    this._activeSeg    = -1;
  }

  getOptions() { return this._options; }

  render(q) {
    return `
      <div class="ef-ofib-field">
        <label class="ef-ofib-label">Blank Type</label>
        <select class="ef-ofib-select" id="ef-ofib-blank-type">
          <option value="box"    ${(q.blank_type || 'box') === 'box'    ? 'selected' : ''}>Box</option>
          <option value="normal" ${(q.blank_type || '')   === 'normal'  ? 'selected' : ''}>Normal</option>
        </select>
      </div>

      <div class="ef-ofib-field">
        <label class="ef-ofib-checkbox-row">
          <input type="checkbox" id="ef-ofib-case-sensitive"
            ${q.case_sensitive ? 'checked' : ''} />
          Case sensitive matching
        </label>
      </div>

      <div class="ef-ofib-field">
        <label class="ef-ofib-label">Scoring Method</label>
        <select class="ef-ofib-select" id="ef-ofib-scoring-method">
          <option value="exact"   ${(q.scoring_method || 'exact') === 'exact'   ? 'selected' : ''}>Exact — all blanks correct</option>
          <option value="partial" ${(q.scoring_method || '')      === 'partial' ? 'selected' : ''}>Partial — credit per blank</option>
        </select>
      </div>

      <div class="ef-ofib-collapsible" id="ef-ofib-feedback-section">
        <div class="ef-ofib-collapsible-header" id="ef-ofib-feedback-toggle">
          ▶ Feedback Messages
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-ofib-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ofib-collapsible-body">
          <div class="ef-ofib-field">
            <label class="ef-ofib-label">Full Credit</label>
            <input class="ef-ofib-input" id="ef-ofib-feedback-full" type="text"
              placeholder="e.g. All answers correct"
              value="${OFIBFormUtils.escHtml(q.feedback?.full_credit || '')}" />
          </div>
          <div class="ef-ofib-field">
            <label class="ef-ofib-label">Partial Credit</label>
            <input class="ef-ofib-input" id="ef-ofib-feedback-partial" type="text"
              placeholder="e.g. Some answers correct"
              value="${OFIBFormUtils.escHtml(q.feedback?.partial_credit || '')}" />
          </div>
          <div class="ef-ofib-field">
            <label class="ef-ofib-label">No Credit</label>
            <input class="ef-ofib-input" id="ef-ofib-feedback-none" type="text"
              placeholder="e.g. No correct answers"
              value="${OFIBFormUtils.escHtml(q.feedback?.none || '')}" />
          </div>
        </div>
      </div>

      <div class="ef-ofib-field">
        <div class="ef-ofib-options-header">
          <label class="ef-ofib-label">Options</label>
          <button class="ef-ofib-add-option-btn" id="ef-ofib-add-option">+ Add Option</button>
        </div>
        <div class="ef-ofib-options-list" id="ef-ofib-options-list">
          ${this._options.map((opt, i) => this._optionCardHTML(opt, i)).join('')}
        </div>
        <div class="ef-ofib-error" id="ef-ofib-error"></div>
      </div>`;
  }

  bindEvents() {
    OFIBFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ofib-feedback-toggle'),
      this._root.querySelector('#ef-ofib-feedback-section')
    );
    this._root.querySelector('#ef-ofib-add-option')?.addEventListener('click', () => {
      this._options.push({ segments: [], hint: '' });
      this._activeOption = this._options.length - 1;
      this._activeSeg    = -1;
      this._refreshOptions();
    });
    this._bindOptionEvents();
  }

  getAnswerData() {
    return {
      blank_type:     this._root.querySelector('#ef-ofib-blank-type')?.value     || 'box',
      case_sensitive: this._root.querySelector('#ef-ofib-case-sensitive')?.checked || false,
      scoring_method: this._root.querySelector('#ef-ofib-scoring-method')?.value  || 'exact',
      feedback: {
        full_credit:    this._root.querySelector('#ef-ofib-feedback-full')?.value.trim()    || '',
        partial_credit: this._root.querySelector('#ef-ofib-feedback-partial')?.value.trim() || '',
        none:           this._root.querySelector('#ef-ofib-feedback-none')?.value.trim()    || '',
      },
    };
  }

  getBuiltOptions() {
    return this._options.map((opt, i) => {
      const text          = opt.segments.map(s => s.type === 'text' ? s.value : '____').join('');
      const blanks        = opt.segments.filter(s => s.type === 'blank');
      return {
        id:                 String(i + 1).padStart(2, '0'),
        text,
        correct_answer:     blanks.map(s => s.correct_answer),
        acceptable_answers: blanks.map(s => s.acceptable_answers),
        hint:               opt.hint || '',
      };
    });
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-ofib-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private: HTML builders ────────────────────────────

  _optionCardHTML(opt, optIndex) {
    const isActive = this._activeOption === optIndex;
    return `
      <div class="ef-ofib-option-card ${isActive ? 'active' : ''}"
           data-opt-index="${optIndex}">
        <div class="ef-ofib-option-header">
          <span class="ef-ofib-option-num">${optIndex + 1}</span>
          <span class="ef-ofib-option-header-preview">
            ${this._assembledPreview(opt)}
          </span>
          <button class="ef-ofib-option-delete"
                  data-opt-index="${optIndex}"
                  title="Delete option">✕</button>
        </div>
        ${isActive ? this._optionBodyHTML(opt, optIndex) : ''}
      </div>`;
  }

  _optionBodyHTML(opt, optIndex) {
    let blankNum = 0;
    const pills = opt.segments.length
      ? opt.segments.map((seg, i) => {
          const isActiveSeg = this._activeOption === optIndex && this._activeSeg === i;
          if (seg.type === 'blank') blankNum++;
          if (seg.type === 'text') {
            const display = seg.value.length > 25 ? seg.value.slice(0, 25) + '…' : (seg.value || '(empty)');
            return `<span class="ef-ofib-segment ef-ofib-segment-text ${isActiveSeg ? 'active' : ''}"
                         data-seg="${i}">${OFIBFormUtils.escHtml(display)}</span>`;
          }
          return `<span class="ef-ofib-segment ef-ofib-segment-blank ${isActiveSeg ? 'active' : ''}"
                       data-seg="${i}">
                    <span class="ef-ofib-seg-num">${blankNum}</span>____
                  </span>`;
        }).join('')
      : '<span class="ef-ofib-builder-empty">Add text and blanks</span>';

    const editHTML = this._activeSeg >= 0 && this._activeOption === optIndex
      ? this._segEditPanelHTML(opt.segments[this._activeSeg], this._activeSeg, optIndex)
      : '';

    return `
      <div class="ef-ofib-option-body">
        <div class="ef-ofib-builder" data-opt="${optIndex}">${pills}</div>
        <div class="ef-ofib-seg-btns">
          <button class="ef-ofib-seg-add-text"  data-opt="${optIndex}">+ Text</button>
          <button class="ef-ofib-seg-add-blank" data-opt="${optIndex}">+ Blank</button>
        </div>
        ${editHTML ? `<div>${editHTML}</div>` : ''}
        <div class="ef-ofib-field">
          <label class="ef-ofib-edit-label">Hint <span style="font-weight:400">(optional)</span></label>
          <input class="ef-ofib-edit-input ef-ofib-hint-input" type="text"
                 data-opt="${optIndex}" placeholder="Hint for this option..."
                 value="${OFIBFormUtils.escHtml(opt.hint || '')}" />
        </div>
      </div>`;
  }

  _segEditPanelHTML(seg, segIndex, optIndex) {
    if (!seg) return '';
    const blankNum = this._options[optIndex].segments
      .slice(0, segIndex + 1).filter(s => s.type === 'blank').length;

    if (seg.type === 'text') {
      return `
        <div class="ef-ofib-edit-panel">
          <div class="ef-ofib-edit-title">Edit Text</div>
          <label class="ef-ofib-edit-label">Text content (HTML/MathML supported)</label>
          <textarea class="ef-ofib-edit-input" id="ef-ofib-seg-val-${optIndex}"
            rows="2" placeholder="Enter text..."
            style="resize:vertical;min-height:48px;font-family:var(--font-mono);font-size:12px"
          >${OFIBFormUtils.escHtml(seg.value)}</textarea>
          <div class="ef-ofib-edit-actions">
            <button class="ef-ofib-edit-save"   data-opt="${optIndex}" data-seg="${segIndex}">Save</button>
            <button class="ef-ofib-edit-delete" data-opt="${optIndex}" data-seg="${segIndex}">Delete</button>
            <button class="ef-ofib-edit-cancel" data-opt="${optIndex}">Cancel</button>
          </div>
        </div>`;
    }

    return `
      <div class="ef-ofib-edit-panel">
        <div class="ef-ofib-edit-title">Edit Blank #${blankNum}</div>
        <label class="ef-ofib-edit-label">Correct Answer</label>
        <input class="ef-ofib-edit-input" id="ef-ofib-seg-correct-${optIndex}"
               type="text" placeholder="e.g. 3"
               value="${OFIBFormUtils.escHtml(seg.correct_answer || '')}" />
        <label class="ef-ofib-edit-label" style="margin-top:4px">
          Acceptable Answers <span style="font-weight:400">(comma separated)</span>
        </label>
        <input class="ef-ofib-edit-input" id="ef-ofib-seg-acceptable-${optIndex}"
               type="text" placeholder="e.g. three, 3"
               value="${Array.isArray(seg.acceptable_answers) ? seg.acceptable_answers.join(', ') : ''}" />
        <div class="ef-ofib-edit-actions">
          <button class="ef-ofib-edit-save"   data-opt="${optIndex}" data-seg="${segIndex}">Save</button>
          <button class="ef-ofib-edit-delete" data-opt="${optIndex}" data-seg="${segIndex}">Delete</button>
          <button class="ef-ofib-edit-cancel" data-opt="${optIndex}">Cancel</button>
        </div>
      </div>`;
  }

  _assembledPreview(opt) {
    if (!opt.segments.length) return '<em style="color:var(--text-muted)">Empty option</em>';
    let blankNum = 0;
    return opt.segments.map(seg => {
      if (seg.type === 'text') return seg.value;
      blankNum++;
      return `<span style="display:inline-block;min-width:36px;border-bottom:2px solid var(--accent);
                           color:var(--accent);font-size:11px;text-align:center;
                           margin:0 2px;padding:0 3px">_${blankNum}_</span>`;
    }).join('');
  }

  // ── Private: refresh ──────────────────────────────────

  _refreshOptions() {
    const list = this._root.querySelector('#ef-ofib-options-list');
    if (list) list.innerHTML = this._options.map((opt, i) => this._optionCardHTML(opt, i)).join('');
    this._bindOptionEvents();
  }

  // ── Private: event binding ────────────────────────────

  _bindOptionEvents() {
    const list = this._root.querySelector('#ef-ofib-options-list');
    if (!list) return;

    list.querySelectorAll('.ef-ofib-option-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.classList.contains('ef-ofib-option-delete')) return;
        const optIndex = parseInt(header.closest('.ef-ofib-option-card').dataset.optIndex);
        this._activeOption = this._activeOption === optIndex ? -1 : optIndex;
        this._activeSeg    = -1;
        this._refreshOptions();
      });
    });

    list.querySelectorAll('.ef-ofib-option-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const optIndex = parseInt(btn.dataset.optIndex);
        this._options.splice(optIndex, 1);
        if (this._activeOption >= this._options.length) { this._activeOption = -1; this._activeSeg = -1; }
        this._refreshOptions();
      });
    });

    list.querySelectorAll('.ef-ofib-hint-input').forEach(input => {
      input.addEventListener('input', () => {
        const optIndex = parseInt(input.dataset.opt);
        if (this._options[optIndex]) this._options[optIndex].hint = input.value;
      });
    });

    list.querySelectorAll('.ef-ofib-segment').forEach(pill => {
      pill.addEventListener('click', () => {
        const optIndex = parseInt(pill.closest('[data-opt-index]')?.dataset.optIndex);
        const segIndex = parseInt(pill.dataset.seg);
        if (this._activeSeg === segIndex && this._activeOption === optIndex) this._activeSeg = -1;
        else { this._activeOption = optIndex; this._activeSeg = segIndex; }
        this._refreshOptions();
      });
    });

    list.querySelectorAll('.ef-ofib-seg-add-text').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        this._options[optIndex].segments.push({ type: 'text', value: '' });
        this._activeOption = optIndex;
        this._activeSeg    = this._options[optIndex].segments.length - 1;
        this._refreshOptions();
        setTimeout(() => this._root.querySelector(`#ef-ofib-seg-val-${optIndex}`)?.focus(), 50);
      });
    });

    list.querySelectorAll('.ef-ofib-seg-add-blank').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        this._options[optIndex].segments.push({ type: 'blank', correct_answer: '', acceptable_answers: [] });
        this._activeOption = optIndex;
        this._activeSeg    = this._options[optIndex].segments.length - 1;
        this._refreshOptions();
        setTimeout(() => this._root.querySelector(`#ef-ofib-seg-correct-${optIndex}`)?.focus(), 50);
      });
    });

    list.querySelectorAll('.ef-ofib-edit-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        const segIndex = parseInt(btn.dataset.seg);
        const seg      = this._options[optIndex].segments[segIndex];
        if (seg.type === 'text') {
          seg.value = this._root.querySelector(`#ef-ofib-seg-val-${optIndex}`)?.value || '';
        } else {
          seg.correct_answer = this._root.querySelector(`#ef-ofib-seg-correct-${optIndex}`)?.value.trim() || '';
          seg.acceptable_answers = (this._root.querySelector(`#ef-ofib-seg-acceptable-${optIndex}`)?.value || '')
            .split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
        this._activeSeg = -1;
        this._refreshOptions();
      });
    });

    list.querySelectorAll('.ef-ofib-edit-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        const segIndex = parseInt(btn.dataset.seg);
        this._options[optIndex].segments.splice(segIndex, 1);
        this._activeSeg = -1;
        this._refreshOptions();
      });
    });

    list.querySelectorAll('.ef-ofib-edit-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        const segs = this._options[optIndex].segments;
        const seg  = segs[this._activeSeg];
        if (seg && seg.type === 'text'  && seg.value === '')          segs.splice(this._activeSeg, 1);
        if (seg && seg.type === 'blank' && seg.correct_answer === '') segs.splice(this._activeSeg, 1);
        this._activeSeg = -1;
        this._refreshOptions();
      });
    });
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────

class OFIBMetadataWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');
    return `
      <div class="ef-ofib-field">
        <label class="ef-ofib-label">
          Explanation <span class="ef-ofib-optional">(optional)</span>
        </label>
        <textarea class="ef-ofib-textarea" id="ef-ofib-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${OFIBFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-ofib-render-preview" id="ef-ofib-explanation-preview"></div>
      </div>
      <div class="ef-ofib-field">
        <label class="ef-ofib-label">Difficulty</label>
        <select class="ef-ofib-select" id="ef-ofib-difficulty">${diffOptions}</select>
      </div>
      <div class="ef-ofib-row-2">
        <div class="ef-ofib-field">
          <label class="ef-ofib-label">Points <span class="ef-ofib-optional">(optional)</span></label>
          <input class="ef-ofib-input" id="ef-ofib-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}" />
        </div>
        <div class="ef-ofib-field">
          <label class="ef-ofib-label">Time Limit (sec) <span class="ef-ofib-optional">(optional)</span></label>
          <input class="ef-ofib-input" id="ef-ofib-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}" />
        </div>
      </div>
      <div class="ef-ofib-field">
        <label class="ef-ofib-label">Tags <span class="ef-ofib-optional">(comma separated)</span></label>
        <input class="ef-ofib-input" id="ef-ofib-tags" type="text"
          placeholder="e.g. science, maths"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}" />
      </div>`;
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
    this._options  = [];
    this._render();
    this._bindAll();
  }

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._options  = this._parseOptions(question);
    this._render();
    this._bindAll();
  }

  _parseOptions(q) {
    const opts = Array.isArray(q.options) ? q.options : [];
    return opts.map(opt => {
      const text  = opt.text || '';
      const ca    = Array.isArray(opt.correct_answer)     ? opt.correct_answer     : [];
      const aa    = Array.isArray(opt.acceptable_answers) ? opt.acceptable_answers : [];
      const parts = text.split('____');
      const segs  = [];
      parts.forEach((part, i) => {
        if (part) segs.push({ type: 'text', value: part });
        if (i < parts.length - 1) {
          segs.push({ type: 'blank', correct_answer: ca[i] || '', acceptable_answers: Array.isArray(aa[i]) ? aa[i] : [] });
        }
      });
      return { segments: segs, hint: opt.hint || '' };
    });
  }

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('options_fill_in_blank');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(isSkip ? (q.original_type || 'options_fill_in_blank') : q.type);
    const typeLabel    = typeConf ? typeConf.label : 'Options Fill Blank';
    const bodyClass    = isSkip ? 'ef-ofib-body ef-ofib-is-skip' : 'ef-ofib-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget       = new OFIBQuestionWidget(this);
    const mediaWidget   = new OFIBMediaWidget(this);
    const choicesWidget = new OFIBChoicesWidget(this);
    const ansWidget     = new OFIBAnswerWidget(this);
    const metaWidget    = new OFIBMetadataWidget(this);

    ansWidget.setOptions(this._options);

    this.innerHTML = `
      <div class="ef-ofib-form">
        <div class="${bodyClass}" id="ef-ofib-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${choicesWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-ofib-footer">
          <button class="ef-ofib-btn-save" id="ef-ofib-btn-save">Save</button>
          <button class="ef-ofib-btn-skip" id="ef-ofib-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>`;
  }

  _bindAll() {
    this._qWidget       = new OFIBQuestionWidget(this);
    this._mediaWidget   = new OFIBMediaWidget(this);
    this._choicesWidget = new OFIBChoicesWidget(this);
    this._ansWidget     = new OFIBAnswerWidget(this);
    this._metaWidget    = new OFIBMetadataWidget(this);

    this._ansWidget.setOptions(this._options);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._choicesWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  _bindFooter() {
    this.querySelector('#ef-ofib-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-ofib-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(isSkip ? (this._question.original_type || 'options_fill_in_blank') : this._question.type);
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

  _handleSave() {
    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this.querySelector('#ef-ofib-question')?.focus();
      return;
    }
    const options      = this._ansWidget.getBuiltOptions();
    const userResponse = options.map(opt => Array((opt.text.match(/____/g) || []).length).fill(''));
    const saved = {
      type:          this._question?.type || 'options_fill_in_blank',
      question:      questionText,
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      choices:       this._choicesWidget.getChoices(),
      options,
      user_response: userResponse,
      ...this._ansWidget.getAnswerData(),
      ...this._metaWidget.getData(),
    };
    if (this._question?.original_type) saved.original_type = this._question.original_type;
    this.dispatchEvent(new CustomEvent('question-saved', { bubbles: true, detail: { index: this._index, question: saved } }));
  }

  _collectData() {
    const options      = this._ansWidget.getBuiltOptions();
    const userResponse = options.map(opt => Array((opt.text.match(/____/g) || []).length).fill(''));
    return {
      type:          this._question?.type || 'options_fill_in_blank',
      question:      this._qWidget.getValue(),
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      choices:       this._choicesWidget.getChoices(),
      options,
      user_response: userResponse,
      ...this._ansWidget.getAnswerData(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('options-fill-in-blank-form', OptionsFillInBlankFormComponent);