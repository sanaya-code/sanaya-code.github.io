// editor/components/question_forms/matching_form/component.js

class MatchingFormComponent extends HTMLElement {

  connectedCallback() {
    this._question   = null;
    this._index      = -1;
    this._pairDragSrc = null;
    this._render();
    this._bindEvents();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._render();
    this._bindEvents();
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('matching');
    const isSkip     = q.type === 'skip';
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'matching') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#d4a017';
    const badgeLabel = typeConf ? typeConf.label : 'Matching';
    const pairs      = Array.isArray(q.pairs)      ? q.pairs      : [];
    const distractors= Array.isArray(q.distractors) ? q.distractors : [];

    this.innerHTML = `
      <div class="mcq-form">

        <!-- Topbar -->
        <div class="mcf-topbar">
          ${isSkip
            ? `<span class="mcf-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="mcf-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="mcf-topbar-actions">
            ${isSkip
              ? `<button class="btn-unskip" id="match-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="match-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text -->
          <div class="mcf-field">
            <label class="mcf-label">Question Text</label>
            <textarea class="mcf-textarea" id="match-question"
              rows="2"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="mcf-render-preview" id="match-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="mcf-collapsible" id="match-svg-section">
            <div class="mcf-collapsible-header" id="match-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <textarea class="mcf-textarea" id="match-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="mcf-svg-preview" id="match-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="mcf-remove-btn" id="match-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="mcf-collapsible" id="match-img-section">
            <div class="mcf-collapsible-header" id="match-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <input class="mcf-input" id="match-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="match-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="mcf-remove-btn" id="match-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Pairs -->
          <div class="mcf-field">
            <div class="mcf-options-header">
              <label class="mcf-label">Pairs</label>
              <button class="mcf-add-option-btn" id="match-add-pair">+ Add Pair</button>
            </div>
            <!-- Column headers -->
            <div class="match-col-headers">
              <span></span>
              <span class="match-col-label">Left</span>
              <span></span>
              <span class="match-col-label">Right (correct match)</span>
              <span></span>
            </div>
            <!-- Pairs list -->
            <div class="match-pairs-list" id="match-pairs-list">
              ${pairs.map((p, i) => this._pairRowHTML(p.left || '', p.right || '', i)).join('')}
            </div>
            <!-- Shared pair preview -->
            <div class="mcf-option-preview-box" id="match-pair-preview-box">
              <div class="mcf-option-preview-label" id="match-pair-preview-label">
                Previewing pair 1 — left
              </div>
              <div class="mcf-option-preview-content"
                   id="match-pair-preview-content"></div>
            </div>
            <div class="mcf-error" id="match-pairs-error"></div>
          </div>

          <!-- Distractors -->
          <div class="mcf-field">
            <div class="mcf-options-header">
              <label class="mcf-label">
                Distractors
                <span class="mcf-optional">— wrong options shown to student</span>
              </label>
              <button class="mcf-add-option-btn" id="match-add-distractor">
                + Add Distractor
              </button>
            </div>
            <div class="match-distractor-hint">
              These appear in the dropdown along with correct answers to mislead the student.
            </div>
            <div class="match-distractors-list" id="match-distractors-list">
              ${distractors.map((d, i) => this._distractorRowHTML(d, i)).join('')}
            </div>
          </div>

          <!-- Scoring method -->
          <div class="mcf-field">
            <label class="mcf-label">Scoring Method</label>
            <select class="mcf-select" id="match-scoring-method">
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

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="match-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="match-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="match-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="mcf-row-2">
            <div class="mcf-field">
              <label class="mcf-label">
                Points <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="match-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">
                Time Limit (sec) <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="match-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="mcf-field">
            <label class="mcf-label">
              Tags <span class="mcf-optional">(comma separated)</span>
            </label>
            <input class="mcf-input" id="match-tags" type="text"
              placeholder="e.g. science, astronomy"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="match-btn-save">Save</button>
          <span class="mcf-save-hint">Both sides support HTML/MathML</span>
        </div>

      </div>
    `;
  }

  // ── Pair row HTML ────────────────────────────────────

  _pairRowHTML(left, right, index) {
    return `
      <div class="match-pair-row" draggable="true" data-pair-index="${index}">

        <!-- Drag handle -->
        <span class="mcf-drag-handle" title="Drag to reorder">⠿</span>

        <!-- Left cell -->
        <div class="match-pair-cell">
          <textarea class="match-pair-textarea match-left"
                    rows="2"
                    placeholder="Left item (HTML/MathML supported)"
                    data-pair-index="${index}"
                    data-side="left"
          >${this._esc(left)}</textarea>
        </div>

        <!-- Arrow -->
        <div class="match-arrow">→</div>

        <!-- Right cell -->
        <div class="match-pair-cell">
          <textarea class="match-pair-textarea match-right"
                    rows="2"
                    placeholder="Right item (HTML/MathML supported)"
                    data-pair-index="${index}"
                    data-side="right"
          >${this._esc(right)}</textarea>
        </div>

        <!-- Delete -->
        <button class="match-pair-delete" data-pair-index="${index}"
                title="Delete pair">✕</button>

      </div>`;
  }

  // ── Distractor row HTML ──────────────────────────────

  _distractorRowHTML(val, index) {
    return `
      <div class="match-distractor-row" data-dist-index="${index}">
        <input type="text"
               class="match-distractor-input"
               placeholder="Wrong answer option..."
               value="${this._esc(val)}"
               data-dist-index="${index}"
        />
        <button class="match-distractor-delete" title="Delete">✕</button>
      </div>`;
  }

  // ── Bind all events ──────────────────────────────────

  _bindEvents() {

    // Question text — focus preview
    this._bindFocusPreview('match-question',    'match-question-preview');
    this._bindFocusPreview('match-explanation', 'match-explanation-preview');

    // SVG collapsible
    this.querySelector('#match-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#match-svg-section').classList.toggle('open');
    });
    this.querySelector('#match-svg')?.addEventListener('input', (e) => {
      this.querySelector('#match-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#match-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#match-svg').value = '';
      this.querySelector('#match-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#match-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#match-img-section').classList.toggle('open');
    });
    this.querySelector('#match-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#match-img-remove')?.addEventListener('click', () => {
      this.querySelector('#match-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add pair
    this.querySelector('#match-add-pair')?.addEventListener('click', () => {
      this._addPairRow();
    });

    // Pairs list — delegated events
    const pairsList = this.querySelector('#match-pairs-list');
    if (pairsList) this._bindPairsListEvents(pairsList);

    // Add distractor
    this.querySelector('#match-add-distractor')?.addEventListener('click', () => {
      this._addDistractorRow();
    });

    // Distractors list — delegated events
    const distList = this.querySelector('#match-distractors-list');
    if (distList) this._bindDistractorListEvents(distList);

    // Skip / Unskip
    this.querySelector('#match-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#match-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'matching';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#match-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Pairs list events ────────────────────────────────

  _bindPairsListEvents(list) {

    // Focus → shared preview
    list.addEventListener('focusin', (e) => {
      const ta = e.target;
      if (!ta.classList.contains('match-pair-textarea')) return;
      const index   = parseInt(ta.dataset.pairIndex);
      const side    = ta.dataset.side || (ta.classList.contains('match-left') ? 'left' : 'right');
      const box     = this.querySelector('#match-pair-preview-box');
      const label   = this.querySelector('#match-pair-preview-label');
      const preview = this.querySelector('#match-pair-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing pair ${index + 1} — ${side}`;
      preview.innerHTML = ta.value;
    });

    // Live update shared preview while typing
    list.addEventListener('input', (e) => {
      const ta = e.target;
      if (!ta.classList.contains('match-pair-textarea')) return;
      const index   = parseInt(ta.dataset.pairIndex);
      const side    = ta.dataset.side || (ta.classList.contains('match-left') ? 'left' : 'right');
      const label   = this.querySelector('#match-pair-preview-label');
      const preview = this.querySelector('#match-pair-preview-content');
      if (label) label.textContent = `Previewing pair ${index + 1} — ${side}`;
      if (preview) preview.innerHTML = ta.value;
    });

    // Delete pair
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('match-pair-delete')) return;
      e.target.closest('.match-pair-row').remove();
      this._reindexPairs();
      const remaining = list.querySelectorAll('.match-pair-row').length;
      if (remaining === 0) {
        this.querySelector('#match-pair-preview-box')?.classList.remove('visible');
      }
    });

    // Drag reorder
    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.match-pair-row');
      if (!row) return;
      this._pairDragSrc = parseInt(row.dataset.pairIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.match-pair-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.match-pair-row');
      if (row && parseInt(row.dataset.pairIndex) !== this._pairDragSrc) {
        list.querySelectorAll('.match-pair-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.match-pair-row');
      if (!target) return;
      const to   = parseInt(target.dataset.pairIndex);
      const from = this._pairDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      const rows  = Array.from(list.querySelectorAll('.match-pair-row'));
      const moved = rows.splice(from, 1)[0];
      rows.splice(to, 0, moved);
      list.innerHTML = '';
      rows.forEach(r => list.appendChild(r));
      this._reindexPairs();
    });
  }

  // ── Distractor list events ───────────────────────────

  _bindDistractorListEvents(list) {
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('match-distractor-delete')) return;
      e.target.closest('.match-distractor-row').remove();
      this._reindexDistractors();
    });
  }

  // ── Add pair row ─────────────────────────────────────

  _addPairRow() {
    const list  = this.querySelector('#match-pairs-list');
    const count = list.querySelectorAll('.match-pair-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._pairRowHTML('', '', count);
    list.appendChild(div.firstElementChild);
    this._reindexPairs();
    list.querySelector('.match-pair-row:last-child .match-left')?.focus();
  }

  // ── Add distractor row ───────────────────────────────

  _addDistractorRow() {
    const list  = this.querySelector('#match-distractors-list');
    const count = list.querySelectorAll('.match-distractor-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._distractorRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexDistractors();
    list.querySelector('.match-distractor-row:last-child .match-distractor-input')?.focus();
  }

  // ── Reindex helpers ──────────────────────────────────

  _reindexPairs() {
    this.querySelectorAll('.match-pair-row').forEach((row, i) => {
      row.dataset.pairIndex = i;
      row.querySelectorAll('.match-pair-textarea').forEach(ta => {
        ta.dataset.pairIndex = i;
      });
    });
  }

  _reindexDistractors() {
    this.querySelectorAll('.match-distractor-row').forEach((row, i) => {
      row.dataset.distIndex = i;
      const inp = row.querySelector('.match-distractor-input');
      if (inp) inp.dataset.distIndex = i;
    });
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl = this.querySelector('#match-pairs-error');
    errEl.classList.remove('visible');

    const pairRows = this.querySelectorAll('.match-pair-row');
    if (pairRows.length < 2) {
      errEl.textContent = 'At least 2 pairs are required.';
      errEl.classList.add('visible');
      return;
    }

    // Collect pairs
    const pairs = Array.from(pairRows).map(row => ({
      left:  row.querySelector('.match-left')?.value.trim()  || '',
      right: row.querySelector('.match-right')?.value.trim() || '',
    }));

    // Collect distractors
    const distractors = Array.from(
      this.querySelectorAll('.match-distractor-input')
    )
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);

    // user_response: one '' per pair
    const userResponse = Array(pairs.length).fill('');

    const saved = {
      type:           this._question?.type || 'matching',
      question:       this.querySelector('#match-question')?.value.trim()     || '',
      svg_content:    this.querySelector('#match-svg')?.value.trim()          || '',
      img_url:        this.querySelector('#match-img-url')?.value.trim()       || '',
      pairs,
      distractors,
      user_response:  userResponse,
      scoring_method: this.querySelector('#match-scoring-method')?.value      || 'exact',
      explanation:    this.querySelector('#match-explanation')?.value.trim()   || '',
      difficulty:     this.querySelector('#match-difficulty')?.value           || 'easy',
      points:         this._parseOptionalNumber('#match-points'),
      time_limit:     this._parseOptionalNumber('#match-time-limit'),
      tags:           this._parseTags(),
    };

    if (this._question?.original_type) {
      saved.original_type = this._question.original_type;
    }

    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved }
    }));
  }

  // ── Helpers ──────────────────────────────────────────

  _bindFocusPreview(inputId, previewId) {
    const input   = this.querySelector(`#${inputId}`);
    const preview = this.querySelector(`#${previewId}`);
    if (!input || !preview) return;
    input.addEventListener('focus', () => {
      preview.innerHTML = input.value;
      preview.classList.add('visible');
    });
    input.addEventListener('input', () => {
      preview.innerHTML = input.value;
    });
  }

  _updateImgPreview(url) {
    const preview = this.querySelector('#match-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${this._esc(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

  _parseOptionalNumber(selector) {
    const val = this.querySelector(selector)?.value.trim();
    if (!val) return '';
    const n = parseFloat(val);
    return isNaN(n) ? '' : n;
  }

  _parseTags() {
    const raw = this.querySelector('#match-tags')?.value || '';
    return raw.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

}

customElements.define('matching-form', MatchingFormComponent);