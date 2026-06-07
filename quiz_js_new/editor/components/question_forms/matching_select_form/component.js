// editor/components/question_forms/matching_select_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class MSELFormUtils {

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

  // Truncate plain text for distractor pill label
  static truncate(str, max = 22) {
    const plain = String(str).replace(/<[^>]*>/g, '').trim();
    return plain.length > max ? plain.slice(0, max) + '…' : (plain || 'Empty');
  }

}

// ── Question Widget ───────────────────────────────────────────────────────────

class MSELQuestionWidget {

  constructor(root) { this._root = root; }

  render(q) {
    return `
      <div class="ef-msel-field">
        <label class="ef-msel-label">Question Text</label>
        <textarea class="ef-msel-textarea" id="ef-msel-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${MSELFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-msel-render-preview" id="ef-msel-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    MSELFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-msel-question'),
      this._root.querySelector('#ef-msel-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-msel-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────

class MSELMediaWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${MSELFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-msel-img-preview visible' : 'ef-msel-img-preview';

    return `
      <div class="ef-msel-collapsible" id="ef-msel-svg-section">
        <div class="ef-msel-collapsible-header" id="ef-msel-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-msel-collapsible-arrow">▼</span>
        </div>
        <div class="ef-msel-collapsible-body">
          <textarea class="ef-msel-textarea" id="ef-msel-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${MSELFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-msel-svg-preview" id="ef-msel-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-msel-remove-btn" id="ef-msel-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-msel-collapsible" id="ef-msel-img-section">
        <div class="ef-msel-collapsible-header" id="ef-msel-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-msel-collapsible-arrow">▼</span>
        </div>
        <div class="ef-msel-collapsible-body">
          <input class="ef-msel-input" id="ef-msel-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${MSELFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-msel-img-preview">${imgThumb}</div>
          <button class="ef-msel-remove-btn" id="ef-msel-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    MSELFormUtils.bindCollapsible(
      this._root.querySelector('#ef-msel-svg-toggle'),
      this._root.querySelector('#ef-msel-svg-section')
    );
    this._root.querySelector('#ef-msel-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-msel-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-msel-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-msel-svg').value = '';
      this._root.querySelector('#ef-msel-svg-preview').innerHTML = '';
    });

    MSELFormUtils.bindCollapsible(
      this._root.querySelector('#ef-msel-img-toggle'),
      this._root.querySelector('#ef-msel-img-section')
    );
    this._root.querySelector('#ef-msel-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-msel-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-msel-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-msel-svg')?.value.trim()     || ''; }
  getImgUrl() { return this._root.querySelector('#ef-msel-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-msel-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${MSELFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: pairs list + distractors (horizontal pills) + scoring method
//       + description + case_sensitive

class MSELAnswerWidget {

  constructor(root) {
    this._root          = root;
    this._pairDragSrc   = null;
    this._distDragSrc   = null;
    this._expandedIndex = null;   // only one distractor expanded at a time
  }

  render(q) {
    const pairs         = Array.isArray(q.pairs)       ? q.pairs       : [];
    const distractors   = Array.isArray(q.distractors) ? q.distractors : [];
    const scoringMethod = q.scoring_method || 'exact';
    const description   = q.description   || '';
    const caseSensitive = !!q.case_sensitive;

    return `
      <div class="ef-msel-field">
        <div class="ef-msel-options-header">
          <label class="ef-msel-label">Pairs</label>
          <button class="ef-msel-add-option-btn" id="ef-msel-add-pair">+ Add Pair</button>
        </div>
        <div class="ef-msel-col-headers">
          <span></span>
          <span class="ef-msel-col-label">Left</span>
          <span></span>
          <span class="ef-msel-col-label">Right (correct match)</span>
          <span></span>
        </div>
        <div class="ef-msel-pairs-list" id="ef-msel-pairs-list">
          ${pairs.map((p, i) => this._pairRowHTML(p.left || '', p.right || '', i)).join('')}
        </div>
        <div class="ef-msel-option-preview-box" id="ef-msel-pair-preview-box">
          <div class="ef-msel-option-preview-label" id="ef-msel-pair-preview-label">
            Previewing pair 1 — left
          </div>
          <div class="ef-msel-option-preview-content"
               id="ef-msel-pair-preview-content"></div>
        </div>
        <div class="ef-msel-error" id="ef-msel-pairs-error"></div>
      </div>

      <div class="ef-msel-field">
        <div class="ef-msel-options-header">
          <label class="ef-msel-label">
            Distractors
            <span class="ef-msel-optional">(optional — wrong options shown in quiz)</span>
          </label>
          <button class="ef-msel-add-option-btn" id="ef-msel-add-distractor">+ Add Distractor</button>
        </div>
        <div class="ef-msel-distractors-row" id="ef-msel-distractors-row">
          ${distractors.map((d, i) => this._distPillHTML(d, i)).join('')}
        </div>
      </div>

      <div class="ef-msel-field">
        <label class="ef-msel-label">Scoring Method</label>
        <select class="ef-msel-select" id="ef-msel-scoring-method">
          <option value="exact"   ${scoringMethod === 'exact'   ? 'selected' : ''}>
            Exact — all pairs must be correct
          </option>
          <option value="partial" ${scoringMethod === 'partial' ? 'selected' : ''}>
            Partial — credit per correct pair
          </option>
        </select>
      </div>

      <div class="ef-msel-field">
        <label class="ef-msel-label">
          Description
          <span class="ef-msel-optional">(optional)</span>
        </label>
        <textarea class="ef-msel-textarea" id="ef-msel-description"
          rows="2"
          placeholder="Additional description or instruction for this question..."
        >${MSELFormUtils.escHtml(description)}</textarea>
      </div>

      <div class="ef-msel-field">
        <label class="ef-msel-label">Options</label>
        <label class="ef-msel-checkbox-label">
          <input type="checkbox" class="ef-msel-checkbox" id="ef-msel-case-sensitive"
            ${caseSensitive ? 'checked' : ''} />
          Case sensitive answers
        </label>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-msel-add-pair')
      ?.addEventListener('click', () => this._addPairRow());

    this._root.querySelector('#ef-msel-add-distractor')
      ?.addEventListener('click', () => this._addDistractor());

    const pairList = this._root.querySelector('#ef-msel-pairs-list');
    if (pairList) this._bindPairListEvents(pairList);

    const distRow = this._root.querySelector('#ef-msel-distractors-row');
    if (distRow) this._bindDistractorEvents(distRow);
  }

  // ── Getters ───────────────────────────────────────────

  getPairs() {
    return Array.from(this._root.querySelectorAll('.ef-msel-pair-row')).map(row => ({
      left:  row.querySelector('.ef-msel-left')?.value.trim()  || '',
      right: row.querySelector('.ef-msel-right')?.value.trim() || '',
    }));
  }

  getDistractors() {
    // Collect from pill data attributes (source of truth even when expanded)
    return Array.from(
      this._root.querySelectorAll('.ef-msel-dist-pill')
    ).map(pill => {
      // If currently expanded, read live textarea value
      if (pill.classList.contains('expanded')) {
        return pill.querySelector('.ef-msel-dist-textarea')?.value || pill.dataset.value || '';
      }
      return pill.dataset.value || '';
    }).filter(d => d.trim() !== '');
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-msel-scoring-method')?.value || 'exact';
  }

  getDescription() {
    return this._root.querySelector('#ef-msel-description')?.value.trim() || '';
  }

  getCaseSensitive() {
    return this._root.querySelector('#ef-msel-case-sensitive')?.checked || false;
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-msel-pairs-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Pair row HTML ─────────────────────────────────────

  _pairRowHTML(left, right, index) {
    return `
      <div class="ef-msel-pair-row" draggable="true" data-pair-index="${index}">
        <span class="ef-msel-drag-handle" title="Drag to reorder">⠿</span>
        <div class="ef-msel-pair-cell">
          <textarea class="ef-msel-pair-textarea ef-msel-left"
                    rows="2"
                    placeholder="Left item (HTML/MathML supported)"
                    data-pair-index="${index}"
                    data-side="left"
          >${MSELFormUtils.escHtml(left)}</textarea>
        </div>
        <div class="ef-msel-arrow">→</div>
        <div class="ef-msel-pair-cell">
          <textarea class="ef-msel-pair-textarea ef-msel-right"
                    rows="2"
                    placeholder="Right item (HTML/MathML supported)"
                    data-pair-index="${index}"
                    data-side="right"
          >${MSELFormUtils.escHtml(right)}</textarea>
        </div>
        <button class="ef-msel-pair-delete" data-pair-index="${index}"
                title="Delete pair">✕</button>
      </div>`;
  }

  // ── Distractor pill HTML ──────────────────────────────
  // Collapsed: shows truncated text + drag handle + delete
  // Expanded:  shows textarea + done button + delete

  _distPillHTML(value, index) {
    const label = MSELFormUtils.truncate(value);
    return `
      <div class="ef-msel-dist-pill"
           draggable="true"
           data-dist-index="${index}"
           data-value="${MSELFormUtils.escHtml(value)}">
        <span class="ef-msel-dist-drag">⠿</span>
        <span class="ef-msel-dist-label">${MSELFormUtils.escHtml(label)}</span>
        <button class="ef-msel-dist-edit" title="Edit">✎</button>
        <button class="ef-msel-dist-delete" title="Delete">✕</button>
        <div class="ef-msel-dist-expanded-body">
          <textarea class="ef-msel-dist-textarea"
                    placeholder="Distractor text (HTML/MathML supported)"
                    rows="2"
          >${MSELFormUtils.escHtml(value)}</textarea>
          <div class="ef-msel-dist-preview" id="ef-msel-dist-preview-${index}"></div>
          <button class="ef-msel-dist-done">✓ Done</button>
        </div>
      </div>`;
  }

  // ── Add distractor ────────────────────────────────────

  _addDistractor() {
    this._collapseAll();
    const row   = this._root.querySelector('#ef-msel-distractors-row');
    const index = row.querySelectorAll('.ef-msel-dist-pill').length;
    const div   = document.createElement('div');
    div.innerHTML = this._distPillHTML('', index);
    const pill = div.firstElementChild;
    row.appendChild(pill);
    this._reindexDist();
    this._expandPill(pill);
    pill.querySelector('.ef-msel-dist-textarea')?.focus();
  }

  // ── Expand / collapse ─────────────────────────────────

  _expandPill(pill) {
    this._collapseAll();
    pill.classList.add('expanded');
    this._expandedIndex = parseInt(pill.dataset.distIndex);
    const ta      = pill.querySelector('.ef-msel-dist-textarea');
    const preview = pill.querySelector('.ef-msel-dist-preview');
    if (ta && preview) {
      preview.innerHTML = ta.value;
      ta.addEventListener('input', () => { preview.innerHTML = ta.value; });
    }
  }

  _collapseAll() {
    this._root.querySelectorAll('.ef-msel-dist-pill.expanded').forEach(pill => {
      // Save current textarea value back to data-value + update label
      const ta = pill.querySelector('.ef-msel-dist-textarea');
      if (ta) {
        pill.dataset.value = ta.value;
        const labelEl = pill.querySelector('.ef-msel-dist-label');
        if (labelEl) labelEl.textContent = MSELFormUtils.truncate(ta.value);
      }
      pill.classList.remove('expanded');
    });
    this._expandedIndex = null;
  }

  // ── Reindex ───────────────────────────────────────────

  _reindexDist() {
    this._root.querySelectorAll('.ef-msel-dist-pill').forEach((pill, i) => {
      pill.dataset.distIndex = i;
    });
  }

  _reindexPairs() {
    this._root.querySelectorAll('.ef-msel-pair-row').forEach((row, i) => {
      row.dataset.pairIndex = i;
      row.querySelectorAll('.ef-msel-pair-textarea').forEach(ta => ta.dataset.pairIndex = i);
      const del = row.querySelector('.ef-msel-pair-delete');
      if (del) del.dataset.pairIndex = i;
    });
  }

  // ── Distractor events ─────────────────────────────────

  _bindDistractorEvents(row) {

    // Edit button → expand
    row.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.ef-msel-dist-edit');
      if (editBtn) {
        const pill = editBtn.closest('.ef-msel-dist-pill');
        if (pill.classList.contains('expanded')) {
          this._collapseAll();
        } else {
          this._expandPill(pill);
          pill.querySelector('.ef-msel-dist-textarea')?.focus();
        }
        return;
      }

      // Click on collapsed label → expand
      const label = e.target.closest('.ef-msel-dist-label');
      if (label) {
        const pill = label.closest('.ef-msel-dist-pill');
        if (!pill.classList.contains('expanded')) {
          this._expandPill(pill);
          pill.querySelector('.ef-msel-dist-textarea')?.focus();
        }
        return;
      }

      // Done button → collapse
      const doneBtn = e.target.closest('.ef-msel-dist-done');
      if (doneBtn) {
        this._collapseAll();
        return;
      }

      // Delete button
      const delBtn = e.target.closest('.ef-msel-dist-delete');
      if (delBtn) {
        delBtn.closest('.ef-msel-dist-pill').remove();
        this._reindexDist();
        return;
      }
    });

    // Drag reorder — horizontal
    row.addEventListener('dragstart', (e) => {
      const pill = e.target.closest('.ef-msel-dist-pill');
      if (!pill) return;
      this._distDragSrc = parseInt(pill.dataset.distIndex);
      pill.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', () => {
      row.querySelectorAll('.ef-msel-dist-pill')
        .forEach(p => p.classList.remove('dragging', 'drag-over'));
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      const pill = e.target.closest('.ef-msel-dist-pill');
      if (pill && parseInt(pill.dataset.distIndex) !== this._distDragSrc) {
        row.querySelectorAll('.ef-msel-dist-pill')
          .forEach(p => p.classList.remove('drag-over'));
        pill.classList.add('drag-over');
      }
    });

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-msel-dist-pill');
      if (!target) return;
      const to   = parseInt(target.dataset.distIndex);
      const from = this._distDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      const pills = Array.from(row.querySelectorAll('.ef-msel-dist-pill'));
      const moved = pills.splice(from, 1)[0];
      pills.splice(to, 0, moved);
      row.innerHTML = '';
      pills.forEach(p => row.appendChild(p));
      this._reindexDist();
      // Re-bind after DOM rebuild
      this._bindDistractorEvents(row);
    });

  }

  // ── Pair list events ──────────────────────────────────

  _bindPairListEvents(list) {

    list.addEventListener('focusin', (e) => {
      const ta = e.target;
      if (!ta.classList.contains('ef-msel-pair-textarea')) return;
      const index   = parseInt(ta.dataset.pairIndex);
      const side    = ta.dataset.side;
      const box     = this._root.querySelector('#ef-msel-pair-preview-box');
      const label   = this._root.querySelector('#ef-msel-pair-preview-label');
      const content = this._root.querySelector('#ef-msel-pair-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing pair ${index + 1} — ${side}`;
      content.innerHTML = ta.value;
    });

    list.addEventListener('input', (e) => {
      const ta = e.target;
      if (!ta.classList.contains('ef-msel-pair-textarea')) return;
      const index   = parseInt(ta.dataset.pairIndex);
      const side    = ta.dataset.side;
      const label   = this._root.querySelector('#ef-msel-pair-preview-label');
      const content = this._root.querySelector('#ef-msel-pair-preview-content');
      if (label)   label.textContent = `Previewing pair ${index + 1} — ${side}`;
      if (content) content.innerHTML = ta.value;
    });

    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-msel-pair-delete')) return;
      e.target.closest('.ef-msel-pair-row').remove();
      this._reindexPairs();
      if (!list.querySelectorAll('.ef-msel-pair-row').length) {
        this._root.querySelector('#ef-msel-pair-preview-box')?.classList.remove('visible');
      }
    });

    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-msel-pair-row');
      if (!row) return;
      this._pairDragSrc = parseInt(row.dataset.pairIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    list.addEventListener('dragend', () => {
      list.querySelectorAll('.ef-msel-pair-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });

    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-msel-pair-row');
      if (row && parseInt(row.dataset.pairIndex) !== this._pairDragSrc) {
        list.querySelectorAll('.ef-msel-pair-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });

    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-msel-pair-row');
      if (!target) return;
      const to   = parseInt(target.dataset.pairIndex);
      const from = this._pairDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      const rows  = Array.from(list.querySelectorAll('.ef-msel-pair-row'));
      const moved = rows.splice(from, 1)[0];
      rows.splice(to, 0, moved);
      list.innerHTML = '';
      rows.forEach(r => list.appendChild(r));
      this._reindexPairs();
    });

  }

  _addPairRow() {
    const list  = this._root.querySelector('#ef-msel-pairs-list');
    const count = list.querySelectorAll('.ef-msel-pair-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._pairRowHTML('', '', count);
    list.appendChild(div.firstElementChild);
    this._reindexPairs();
    list.querySelector('.ef-msel-pair-row:last-child .ef-msel-left')?.focus();
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────

class MSELMetadataWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-msel-field">
        <label class="ef-msel-label">
          Explanation <span class="ef-msel-optional">(optional)</span>
        </label>
        <textarea class="ef-msel-textarea" id="ef-msel-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${MSELFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-msel-render-preview" id="ef-msel-explanation-preview"></div>
      </div>

      <div class="ef-msel-field">
        <label class="ef-msel-label">Difficulty</label>
        <select class="ef-msel-select" id="ef-msel-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-msel-row-2">
        <div class="ef-msel-field">
          <label class="ef-msel-label">
            Points <span class="ef-msel-optional">(optional)</span>
          </label>
          <input class="ef-msel-input" id="ef-msel-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-msel-field">
          <label class="ef-msel-label">
            Time Limit (sec) <span class="ef-msel-optional">(optional)</span>
          </label>
          <input class="ef-msel-input" id="ef-msel-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-msel-field">
        <label class="ef-msel-label">
          Tags <span class="ef-msel-optional">(comma separated)</span>
        </label>
        <input class="ef-msel-input" id="ef-msel-tags" type="text"
          placeholder="e.g. science, biology"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    MSELFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-msel-explanation'),
      this._root.querySelector('#ef-msel-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-msel-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-msel-difficulty')?.value || 'easy',
      points:      MSELFormUtils.parseOptionalNumber(this._root.querySelector('#ef-msel-points')),
      time_limit:  MSELFormUtils.parseOptionalNumber(this._root.querySelector('#ef-msel-time-limit')),
      tags:        MSELFormUtils.parseTags(this._root.querySelector('#ef-msel-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class MatchingSelectFormComponent extends HTMLElement {

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

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('matching_select');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'matching_select') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Matching Select';
    const bodyClass    = isSkip ? 'ef-msel-body ef-msel-is-skip' : 'ef-msel-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new MSELQuestionWidget(this);
    const mediaWidget = new MSELMediaWidget(this);
    const ansWidget   = new MSELAnswerWidget(this);
    const metaWidget  = new MSELMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-msel-form">
        <div class="${bodyClass}" id="ef-msel-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-msel-footer">
          <button class="ef-msel-btn-save" id="ef-msel-btn-save">Save</button>
          <button class="ef-msel-btn-skip" id="ef-msel-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  _bindAll() {
    this._qWidget     = new MSELQuestionWidget(this);
    this._mediaWidget = new MSELMediaWidget(this);
    this._ansWidget   = new MSELAnswerWidget(this);
    this._metaWidget  = new MSELMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  _bindFooter() {
    this.querySelector('#ef-msel-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-msel-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'matching_select') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Matching Select';
    const body      = this.querySelector('#ef-msel-body');
    const btn       = this.querySelector('#ef-msel-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'matching_select';
      delete this._question.original_type;
      body.classList.remove('ef-msel-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-msel-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-msel-question')?.focus();
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

  _collectData() {
    const data = {
      type:           this._question?.type || 'matching_select',
      question:       this._qWidget.getValue(),
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      pairs:          this._ansWidget.getPairs(),
      distractors:    this._ansWidget.getDistractors(),
      user_response:  '',
      scoring_method: this._ansWidget.getScoringMethod(),
      description:    this._ansWidget.getDescription(),
      case_sensitive: this._ansWidget.getCaseSensitive(),
      ...this._metaWidget.getData(),
    };

    if (this._question?.original_type) {
      data.original_type = this._question.original_type;
    }

    return data;
  }

}

customElements.define('matching-select-form', MatchingSelectFormComponent);