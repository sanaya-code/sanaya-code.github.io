// editor/components/question_forms/multi_select_circle_form/component.js

class MultiSelectCircleFormComponent extends HTMLElement {

  connectedCallback() {
    this._question   = null;
    this._index      = -1;
    this._optDragSrc = null;
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
    const q        = this._question ||
      EditorFormRegistry.getDefault('multi_select_circle');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'multi_select_circle') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#b71c1c';
    const badgeLabel = typeConf ? typeConf.label : 'Multi Select Circle';

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
              ? `<button class="btn-unskip" id="msc-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="msc-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text -->
          <div class="mcf-field">
            <label class="mcf-label">Question Text</label>
            <textarea class="mcf-textarea" id="msc-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="mcf-render-preview" id="msc-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="mcf-collapsible" id="msc-svg-section">
            <div class="mcf-collapsible-header" id="msc-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <textarea class="mcf-textarea" id="msc-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="mcf-svg-preview" id="msc-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="mcf-remove-btn" id="msc-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="mcf-collapsible" id="msc-img-section">
            <div class="mcf-collapsible-header" id="msc-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <input class="mcf-input" id="msc-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="msc-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="mcf-remove-btn" id="msc-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Options -->
          <div class="mcf-field">
            <div class="mcf-options-header">
              <label class="mcf-label">Options</label>
              <button class="mcf-add-option-btn" id="msc-add-option">+ Add Option</button>
            </div>
            <div class="mcf-options-list" id="msc-options-list">
              ${this._renderOptions(q.options || [])}
            </div>
            <!-- Correct count hint -->
            <div class="ms-correct-hint ${this._correctCount(q.options || []) > 0 ? 'has-correct' : ''}"
                 id="msc-correct-hint">
              ${this._correctHintText(q.options || [])}
            </div>
            <!-- Shared option preview -->
            <div class="mcf-option-preview-box" id="msc-option-preview-box">
              <div class="mcf-option-preview-label" id="msc-option-preview-label">
                Previewing option 1
              </div>
              <div class="mcf-option-preview-content"
                   id="msc-option-preview-content"></div>
            </div>
            <div class="mcf-error" id="msc-options-error"></div>
          </div>

          <!-- Selection limits -->
          <div class="mcf-field">
            <label class="mcf-label">Selection Limits</label>
            <div class="msc-limits-row">
              <div class="mcf-field">
                <label class="mcf-label" style="font-size:10px">
                  Minimum Selections
                </label>
                <input class="mcf-input" id="msc-min-sel" type="number"
                  min="1" step="1" placeholder="e.g. 1"
                  value="${q.minimum_selections != null ? q.minimum_selections : 1}"
                />
              </div>
              <div class="mcf-field">
                <label class="mcf-label" style="font-size:10px">
                  Maximum Selections
                </label>
                <input class="mcf-input" id="msc-max-sel" type="number"
                  min="1" step="1" placeholder="e.g. 3"
                  value="${q.maximum_selections != null ? q.maximum_selections : ''}"
                />
              </div>
            </div>
          </div>

          <!-- Scoring method -->
          <div class="mcf-field">
            <label class="mcf-label">Scoring Method</label>
            <select class="mcf-select" id="msc-scoring-method">
              <option value="exact"
                ${(q.scoring_method || 'exact') === 'exact' ? 'selected' : ''}>
                Exact — all correct options must be selected
              </option>
              <option value="partial"
                ${(q.scoring_method || '') === 'partial' ? 'selected' : ''}>
                Partial — credit per correct option
              </option>
            </select>
          </div>

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="msc-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="msc-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="msc-difficulty">
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
              <input class="mcf-input" id="msc-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">
                Time Limit (sec) <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="msc-time-limit" type="number"
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
            <input class="mcf-input" id="msc-tags" type="text"
              placeholder="e.g. computer-science, programming"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="msc-btn-save">Save</button>
          <span class="mcf-save-hint">IDs (A, B, C…) assigned on save</span>
        </div>

      </div>
    `;
  }

  // ── Option rows (identical to multi_select) ──────────

  _renderOptions(options) {
    if (!options.length) return '';
    return options.map((opt, i) =>
      this._optionRowHTML(opt.text || '', !!opt.correct, i)
    ).join('');
  }

  _optionRowHTML(text, isCorrect, index) {
    return `
      <div class="mcf-option-row ${isCorrect ? 'is-correct' : ''}"
           draggable="true" data-opt-index="${index}">
        <span class="mcf-drag-handle">⠿</span>
        <input type="checkbox"
               class="mcf-correct-checkbox"
               data-opt-index="${index}"
               title="Mark as correct"
               ${isCorrect ? 'checked' : ''}
        />
        <input type="text"
               class="mcf-option-text"
               placeholder="Option text (HTML/MathML supported)"
               value="${this._esc(text)}"
               data-opt-index="${index}"
        />
        <button class="mcf-option-delete" title="Delete option">✕</button>
      </div>`;
  }

  // ── Correct count helpers ────────────────────────────

  _correctCount(options) {
    return options.filter(o => o.correct).length;
  }

  _correctHintText(options) {
    const count = this._correctCount(options);
    if (count === 0) return 'No correct answers marked yet — can be saved as draft.';
    return count === 1 ? '1 correct answer marked' : `${count} correct answers marked`;
  }

  _updateCorrectHint() {
    const hint    = this.querySelector('#msc-correct-hint');
    if (!hint) return;
    const checked = this.querySelectorAll('.mcf-correct-checkbox:checked').length;
    hint.textContent = checked === 0
      ? 'No correct answers marked yet — can be saved as draft.'
      : checked === 1 ? '1 correct answer marked' : `${checked} correct answers marked`;
    hint.classList.toggle('has-correct', checked > 0);
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {
    this._bindFocusPreview('msc-question',    'msc-question-preview');
    this._bindFocusPreview('msc-explanation', 'msc-explanation-preview');

    // SVG
    this.querySelector('#msc-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#msc-svg-section').classList.toggle('open');
    });
    this.querySelector('#msc-svg')?.addEventListener('input', (e) => {
      this.querySelector('#msc-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#msc-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#msc-svg').value = '';
      this.querySelector('#msc-svg-preview').innerHTML = '';
    });

    // Image
    this.querySelector('#msc-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#msc-img-section').classList.toggle('open');
    });
    this.querySelector('#msc-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#msc-img-remove')?.addEventListener('click', () => {
      this.querySelector('#msc-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add option
    this.querySelector('#msc-add-option')?.addEventListener('click', () => {
      this._addOptionRow();
    });

    // Options list
    const optList = this.querySelector('#msc-options-list');
    if (optList) this._bindOptionListEvents(optList);

    // Skip / Unskip
    this.querySelector('#msc-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#msc-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'multi_select_circle';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#msc-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Options list events (identical to multi_select) ──

  _bindOptionListEvents(optList) {

    // Focus → shared preview
    optList.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('mcf-option-text')) return;
      const row   = e.target.closest('.mcf-option-row');
      const index = parseInt(row.dataset.optIndex);
      optList.querySelectorAll('.mcf-option-row')
        .forEach(r => r.classList.remove('focused-row'));
      row.classList.add('focused-row');
      const box     = this.querySelector('#msc-option-preview-box');
      const label   = this.querySelector('#msc-option-preview-label');
      const content = this.querySelector('#msc-option-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing option ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    optList.addEventListener('input', (e) => {
      if (!e.target.classList.contains('mcf-option-text')) return;
      const row     = e.target.closest('.mcf-option-row');
      const index   = parseInt(row.dataset.optIndex);
      const content = this.querySelector('#msc-option-preview-content');
      const label   = this.querySelector('#msc-option-preview-label');
      if (content) { content.innerHTML = e.target.value; }
      if (label)   { label.textContent = `Previewing option ${index + 1}`; }
    });

    // Checkbox — highlight + hint
    optList.addEventListener('change', (e) => {
      if (!e.target.classList.contains('mcf-correct-checkbox')) return;
      e.target.closest('.mcf-option-row')
        .classList.toggle('is-correct', e.target.checked);
      this._updateCorrectHint();
    });

    // Delete
    optList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('mcf-option-delete')) return;
      e.target.closest('.mcf-option-row').remove();
      this._reindexOptions();
      this._updateCorrectHint();
      if (!optList.querySelectorAll('.mcf-option-row').length) {
        this.querySelector('#msc-option-preview-box')?.classList.remove('visible');
      }
    });

    // Drag reorder
    optList.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.mcf-option-row');
      if (!row) return;
      this._optDragSrc = parseInt(row.dataset.optIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    optList.addEventListener('dragend', () => {
      optList.querySelectorAll('.mcf-option-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    optList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.mcf-option-row');
      if (row && parseInt(row.dataset.optIndex) !== this._optDragSrc) {
        optList.querySelectorAll('.mcf-option-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    optList.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.mcf-option-row');
      if (!target) return;
      const to = parseInt(target.dataset.optIndex);
      if (this._optDragSrc === null || this._optDragSrc === to) return;
      target.classList.remove('drag-over');
      this._reorderOptionRows(this._optDragSrc, to);
    });
  }

  _addOptionRow() {
    const list  = this.querySelector('#msc-options-list');
    const count = list.querySelectorAll('.mcf-option-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._optionRowHTML('', false, count);
    list.appendChild(div.firstElementChild);
    this._reindexOptions();
    list.querySelector('.mcf-option-row:last-child .mcf-option-text')?.focus();
  }

  _reindexOptions() {
    this.querySelectorAll('.mcf-option-row').forEach((row, i) => {
      row.dataset.optIndex = i;
      row.querySelector('.mcf-correct-checkbox')?.setAttribute('data-opt-index', i);
      row.querySelector('.mcf-option-text')?.setAttribute('data-opt-index', i);
    });
  }

  _reorderOptionRows(from, to) {
    const list = this.querySelector('#msc-options-list');
    const rows = Array.from(list.querySelectorAll('.mcf-option-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexOptions();
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl       = this.querySelector('#msc-options-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#msc-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#msc-question')?.focus();
      return;
    }

    const optRows = this.querySelectorAll('.mcf-option-row');
    if (optRows.length < 2) {
      errEl.textContent = 'At least 2 options are required.';
      errEl.classList.add('visible');
      return;
    }

    const options = Array.from(optRows).map((row, i) => ({
      id:      String.fromCharCode(65 + i),
      text:    row.querySelector('.mcf-option-text')?.value.trim() || '',
      correct: row.querySelector('.mcf-correct-checkbox')?.checked || false,
    }));

    const minSel = parseInt(this.querySelector('#msc-min-sel')?.value) || 1;
    const maxSel = parseInt(this.querySelector('#msc-max-sel')?.value) || null;

    const saved = {
      type:               this._question?.type || 'multi_select_circle',
      question:           questionText,
      svg_content:        this.querySelector('#msc-svg')?.value.trim()          || '',
      img_url:            this.querySelector('#msc-img-url')?.value.trim()       || '',
      options,
      user_response:      '',
      minimum_selections: minSel,
      maximum_selections: maxSel || options.length,
      scoring_method:     this.querySelector('#msc-scoring-method')?.value       || 'exact',
      explanation:        this.querySelector('#msc-explanation')?.value.trim()   || '',
      difficulty:         this.querySelector('#msc-difficulty')?.value           || 'easy',
      points:             this._parseOptionalNumber('#msc-points'),
      time_limit:         this._parseOptionalNumber('#msc-time-limit'),
      tags:               this._parseTags(),
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
    const preview = this.querySelector('#msc-img-preview');
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
    const raw = this.querySelector('#msc-tags')?.value || '';
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

customElements.define('multi-select-circle-form', MultiSelectCircleFormComponent);