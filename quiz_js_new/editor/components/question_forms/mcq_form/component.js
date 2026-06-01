// editor/components/question_forms/mcq_form/component.js

class McqFormComponent extends HTMLElement {

  connectedCallback() {
    this._question    = null;   // current question object
    this._index       = -1;     // index in state array
    this._optDragSrc  = null;   // drag source index for option rows
    this._render();
    this._bindEvents();
  }

  // ── Public API ───────────────────────────────────────

  // Load a question into the form (called by EditorPanelHandler)
  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question)); // deep clone
    this._render();
    this._bindEvents();
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q       = this._question || EditorConfig.DEFAULTS.mcq;
    const isSkip  = q.type === 'skip';
    const typeConf = EditorConfig.getType(isSkip ? (q.original_type || 'mcq') : q.type);
    const badgeColor = typeConf ? typeConf.color : '#3498db';
    const badgeLabel = typeConf ? typeConf.label : 'MCQ';

    this.innerHTML = `
      <div class="mcq-form">

        <!-- Topbar: badge + skip actions -->
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
              ? `<button class="btn-unskip" id="mcf-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="mcf-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Scrollable form body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text -->
          <div class="mcf-field">
            <label class="mcf-label">Question Text</label>
            <textarea class="mcf-textarea" id="mcf-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="mcf-render-preview" id="mcf-question-preview"></div>
          </div>

          <!-- SVG -->
          <div class="mcf-field">
            <label class="mcf-label">
              SVG Figure
              <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="mcf-svg"
              rows="3"
              placeholder="Paste SVG code here..."
            >${this._esc(q.svg_content || '')}</textarea>
            <div class="mcf-svg-preview" id="mcf-svg-preview"></div>
            <button class="mcf-remove-btn" id="mcf-svg-remove">Remove SVG</button>
          </div>

          <!-- Image URL -->
          <div class="mcf-field">
            <label class="mcf-label">
              Image URL
              <span class="mcf-optional">(optional)</span>
            </label>
            <input class="mcf-input" id="mcf-img-url" type="text"
              placeholder="Enter image URL or relative path..."
              value="${this._esc(q.img_url || '')}"
            />
            <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                 id="mcf-img-preview">
              ${q.img_url
                ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                : ''}
            </div>
            <button class="mcf-remove-btn" id="mcf-img-remove">Remove Image</button>
          </div>

          <!-- Options -->
          <div class="mcf-field">
            <div class="mcf-options-header">
              <label class="mcf-label">Options</label>
              <button class="mcf-add-option-btn" id="mcf-add-option">+ Add Option</button>
            </div>
            <div class="mcf-options-list" id="mcf-options-list">
              ${this._renderOptions(q.options || [], q.correct_answer)}
            </div>
            <div class="mcf-error" id="mcf-options-error"></div>
          </div>

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation
              <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="mcf-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="mcf-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="mcf-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="mcf-row-2">
            <div class="mcf-field">
              <label class="mcf-label">
                Points
                <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="mcf-points" type="number"
                min="0" step="0.5"
                placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">
                Time Limit (sec)
                <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="mcf-time-limit" type="number"
                min="0" step="1"
                placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="mcf-field">
            <label class="mcf-label">
              Tags
              <span class="mcf-optional">(comma separated)</span>
            </label>
            <input class="mcf-input" id="mcf-tags" type="text"
              placeholder="e.g. science, astronomy, solar-system"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="mcf-btn-save">Save</button>
          <span class="mcf-save-hint">
            IDs (A, B, C…) are assigned on save
          </span>
        </div>

      </div><!-- /.mcq-form -->
    `;

    // Populate live previews from loaded data
    this._updatePreview('mcf-question', 'mcf-question-preview');
    this._updatePreview('mcf-explanation', 'mcf-explanation-preview');
    this._updateSvgPreview(q.svg_content || '');
  }

  // ── Render option rows ───────────────────────────────

  _renderOptions(options, correctAnswer) {
    if (!options.length) return '';
    return options.map((opt, i) =>
      this._optionRowHTML(opt.text || '', correctAnswer === opt.id, i)
    ).join('');
  }

  _optionRowHTML(text, isCorrect, index) {
    return `
      <div class="mcf-option-row" draggable="true" data-opt-index="${index}">
        <span class="mcf-drag-handle">⠿</span>
        <input type="radio" name="mcf-correct"
               class="mcf-correct-radio"
               data-opt-index="${index}"
               title="Mark as correct answer"
               ${isCorrect ? 'checked' : ''}
        />
        <div class="mcf-option-inputs">
          <input type="text"
                 class="mcf-option-text"
                 placeholder="Option text (HTML/MathML supported)"
                 value="${this._esc(text)}"
          />
          <div class="mcf-option-render">${text}</div>
        </div>
        <button class="mcf-option-delete" title="Delete option">✕</button>
      </div>
    `;
  }

  // ── Bind all events ──────────────────────────────────

  _bindEvents() {
    // Live preview — question text
    this._livePreview('mcf-question', 'mcf-question-preview');

    // Live preview — explanation
    this._livePreview('mcf-explanation', 'mcf-explanation-preview');

    // Live preview — SVG textarea
    const svgTA = this.querySelector('#mcf-svg');
    if (svgTA) {
      svgTA.addEventListener('input', () =>
        this._updateSvgPreview(svgTA.value)
      );
    }

    // Image URL — show thumbnail on input
    const imgInput = this.querySelector('#mcf-img-url');
    if (imgInput) {
      imgInput.addEventListener('input', () =>
        this._updateImgPreview(imgInput.value.trim())
      );
    }

    // Remove SVG
    this.querySelector('#mcf-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#mcf-svg').value = '';
      this._updateSvgPreview('');
    });

    // Remove Image
    this.querySelector('#mcf-img-remove')?.addEventListener('click', () => {
      this.querySelector('#mcf-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add option
    this.querySelector('#mcf-add-option')?.addEventListener('click', () => {
      this._addOptionRow();
    });

    // Options list — delegated events
    const optList = this.querySelector('#mcf-options-list');
    if (optList) {
      this._bindOptionListEvents(optList);
    }

    // Mark as Skip
    this.querySelector('#mcf-btn-skip')?.addEventListener('click', () => {
      this._markAsSkip();
    });

    // Un-mark Skip
    this.querySelector('#mcf-btn-unskip')?.addEventListener('click', () => {
      this._unmarkSkip();
    });

    // Save
    this.querySelector('#mcf-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Option list delegated events ─────────────────────

  _bindOptionListEvents(optList) {

    // Live render preview for option text inputs
    optList.addEventListener('input', (e) => {
      if (e.target.classList.contains('mcf-option-text')) {
        const row    = e.target.closest('.mcf-option-row');
        const render = row.querySelector('.mcf-option-render');
        render.innerHTML = e.target.value;
      }
    });

    // Delete option row
    optList.addEventListener('click', (e) => {
      if (e.target.classList.contains('mcf-option-delete')) {
        const row = e.target.closest('.mcf-option-row');
        row.remove();
        this._reindexOptions();
      }
    });

    // Drag-to-reorder options
    optList.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.mcf-option-row');
      if (!row) return;
      this._optDragSrc = parseInt(row.dataset.optIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    optList.addEventListener('dragend', (e) => {
      const row = e.target.closest('.mcf-option-row');
      if (row) row.classList.remove('dragging');
      optList.querySelectorAll('.mcf-option-row')
        .forEach(r => r.classList.remove('drag-over'));
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
      const targetRow = e.target.closest('.mcf-option-row');
      if (!targetRow) return;
      const to   = parseInt(targetRow.dataset.optIndex);
      const from = this._optDragSrc;
      if (from === null || from === to) return;
      targetRow.classList.remove('drag-over');
      this._reorderOptionRows(from, to);
    });
  }

  // ── Add a new blank option row ───────────────────────

  _addOptionRow() {
    const list  = this.querySelector('#mcf-options-list');
    const count = list.querySelectorAll('.mcf-option-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._optionRowHTML('', false, count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexOptions();
    // Focus the new text input
    row.querySelector('.mcf-option-text')?.focus();
  }

  // ── Reindex option rows after add/delete/reorder ─────

  _reindexOptions() {
    const rows = this.querySelectorAll('.mcf-option-row');
    rows.forEach((row, i) => {
      row.dataset.optIndex = i;
      const radio = row.querySelector('.mcf-correct-radio');
      if (radio) radio.dataset.optIndex = i;
    });
  }

  // ── Reorder option rows ──────────────────────────────

  _reorderOptionRows(from, to) {
    const list = this.querySelector('#mcf-options-list');
    const rows = Array.from(list.querySelectorAll('.mcf-option-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexOptions();
  }

  // ── Mark as Skip ─────────────────────────────────────

  _markAsSkip() {
    if (!this._question) return;
    this._question.original_type = this._question.type;
    this._question.type          = EditorConfig.SKIP_TYPE;
    this._render();
    this._bindEvents();
  }

  // ── Un-mark Skip ─────────────────────────────────────

  _unmarkSkip() {
    if (!this._question) return;
    this._question.type = this._question.original_type || 'mcq';
    delete this._question.original_type;
    this._render();
    this._bindEvents();
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl = this.querySelector('#mcf-options-error');
    errEl.classList.remove('visible');

    // Collect question text
    const questionText = this.querySelector('#mcf-question')?.value.trim() || '';

    // Collect options
    const optRows = this.querySelectorAll('.mcf-option-row');
    const options = [];
    let correctIndex = -1;

    optRows.forEach((row, i) => {
      const text  = row.querySelector('.mcf-option-text')?.value || '';
      const radio = row.querySelector('.mcf-correct-radio');
      options.push({ text: text.trim() });
      if (radio?.checked) correctIndex = i;
    });

    // Validation
    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#mcf-question')?.focus();
      return;
    }

    if (options.length < 2) {
      errEl.textContent = 'At least 2 options are required.';
      errEl.classList.add('visible');
      return;
    }

    // Assign A, B, C... IDs in final order
    const finalOptions = options.map((opt, i) => ({
      id:   String.fromCharCode(65 + i),   // A, B, C...
      text: opt.text,
    }));

    const correctAnswer = correctIndex >= 0
      ? String.fromCharCode(65 + correctIndex)
      : '';

    // Build final question object
    const saved = {
      type:          this._question?.type || 'mcq',
      question:      questionText,
      svg_content:   this.querySelector('#mcf-svg')?.value.trim()      || '',
      img_url:       this.querySelector('#mcf-img-url')?.value.trim()   || '',
      options:       finalOptions,
      correct_answer: correctAnswer,
      user_response: '',
      explanation:   this.querySelector('#mcf-explanation')?.value.trim() || '',
      difficulty:    this.querySelector('#mcf-difficulty')?.value       || 'easy',
      points:        this._parseOptionalNumber('#mcf-points'),
      time_limit:    this._parseOptionalNumber('#mcf-time-limit'),
      tags:          this._parseTags(),
    };

    // Preserve original_type if skip
    if (this._question?.original_type) {
      saved.original_type = this._question.original_type;
    }

    // Fire event — EditorController / EditorPanelHandler listens
    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved }
    }));
  }

  // ── Helpers ──────────────────────────────────────────

  _parseOptionalNumber(selector) {
    const val = this.querySelector(selector)?.value.trim();
    if (val === '' || val === undefined) return '';
    const n = parseFloat(val);
    return isNaN(n) ? '' : n;
  }

  _parseTags() {
    const raw = this.querySelector('#mcf-tags')?.value || '';
    return raw.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  _livePreview(inputId, previewId) {
    const input   = this.querySelector(`#${inputId}`);
    const preview = this.querySelector(`#${previewId}`);
    if (!input || !preview) return;
    // Set initial content
    preview.innerHTML = input.value;
    input.addEventListener('input', () => {
      preview.innerHTML = input.value;
    });
  }

  _updatePreview(inputId, previewId) {
    const input   = this.querySelector(`#${inputId}`);
    const preview = this.querySelector(`#${previewId}`);
    if (input && preview) preview.innerHTML = input.value;
  }

  _updateSvgPreview(svgCode) {
    const preview = this.querySelector('#mcf-svg-preview');
    if (preview) preview.innerHTML = svgCode;
  }

  _updateImgPreview(url) {
    const preview = this.querySelector('#mcf-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${this._esc(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

  // Escape HTML attribute values
  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

}

customElements.define('mcq-form', McqFormComponent);