// editor/components/question_forms/mcq_form/component.js

class McqFormComponent extends HTMLElement {

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
    const q        = this._question || EditorFormRegistry.getDefault('mcq');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'mcq') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#3498db';
    const badgeLabel = typeConf ? typeConf.label : 'MCQ';

    // Pre-build conditional HTML to avoid nested backticks
    const topbarBadgeHTML = isSkip
      ? '<span class="ef-mcq-skip-badge">⊘ SKIP</span>' +
        '<span style="font-size:12px;color:var(--text-muted)">Originally: ' + badgeLabel + '</span>'
      : '<span class="ef-mcq-type-badge" style="background:' + badgeColor + '">' + badgeLabel + '</span>';

    const skipBtnHTML = isSkip
      ? '<button class="ef-mcq-btn-unskip" id="ef-mcq-btn-unskip">↩ Un-mark Skip</button>'
      : '<button class="ef-mcq-btn-skip" id="ef-mcq-btn-skip">⊘ Mark as Skip</button>';

    const bodyClass  = isSkip ? 'ef-mcq-body ef-mcq-is-skip' : 'ef-mcq-body';
    const svgOpen    = 'ef-mcq-collapsible'; // always start collapsed
    const imgOpen    = 'ef-mcq-collapsible'; // always start collapsed
    const imgThumb   = q.img_url
      ? '<img src="' + this._esc(q.img_url) + '" alt="preview" />'
      : '';
    const imgVisible = q.img_url ? 'ef-mcq-img-preview visible' : 'ef-mcq-img-preview';

    this.innerHTML = `
      <div class="ef-mcq-form">

        <!-- Topbar -->
        <div class="ef-mcq-topbar">
          ${topbarBadgeHTML}
          <div class="ef-mcq-topbar-actions">
            ${skipBtnHTML}
          </div>
        </div>

        <!-- Body -->
        <div class="${bodyClass}">

          <!-- Question text -->
          <div class="ef-mcq-field">
            <label class="ef-mcq-label">Question Text</label>
            <textarea class="ef-mcq-textarea" id="ef-mcq-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="ef-mcq-render-preview" id="ef-mcq-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="${svgOpen}" id="ef-mcq-svg-section">
            <div class="ef-mcq-collapsible-header" id="ef-mcq-svg-toggle">
              ▶ SVG Figure
              <span class="ef-mcq-optional" style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
              <span class="ef-mcq-collapsible-arrow">▼</span>
            </div>
            <div class="ef-mcq-collapsible-body">
              <textarea class="ef-mcq-textarea" id="ef-mcq-svg"
                rows="3"
                placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="ef-mcq-svg-preview" id="ef-mcq-svg-preview">${q.svg_content || ''}</div>
              <button class="ef-mcq-remove-btn" id="ef-mcq-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="${imgOpen}" id="ef-mcq-img-section">
            <div class="ef-mcq-collapsible-header" id="ef-mcq-img-toggle">
              ▶ Image URL
              <span class="ef-mcq-optional" style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
              <span class="ef-mcq-collapsible-arrow">▼</span>
            </div>
            <div class="ef-mcq-collapsible-body">
              <input class="ef-mcq-input" id="ef-mcq-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="${imgVisible}" id="ef-mcq-img-preview">
                ${imgThumb}
              </div>
              <button class="ef-mcq-remove-btn" id="ef-mcq-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Options -->
          <div class="ef-mcq-field">
            <div class="ef-mcq-options-header">
              <label class="ef-mcq-label">Options</label>
              <button class="ef-mcq-add-option-btn" id="ef-mcq-add-option">+ Add Option</button>
            </div>
            <div class="ef-mcq-options-list" id="ef-mcq-options-list">
              ${this._renderOptions(q.options || [], q.correct_answer)}
            </div>
            <!-- Shared option preview -->
            <div class="ef-mcq-option-preview-box" id="ef-mcq-option-preview-box">
              <div class="ef-mcq-option-preview-label" id="ef-mcq-option-preview-label">
                Previewing option 1
              </div>
              <div class="ef-mcq-option-preview-content"
                   id="ef-mcq-option-preview-content"></div>
            </div>
            <div class="ef-mcq-error" id="ef-mcq-options-error"></div>
          </div>

          <!-- Explanation -->
          <div class="ef-mcq-field">
            <label class="ef-mcq-label">
              Explanation
              <span class="ef-mcq-optional">(optional)</span>
            </label>
            <textarea class="ef-mcq-textarea" id="ef-mcq-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="ef-mcq-render-preview" id="ef-mcq-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="ef-mcq-field">
            <label class="ef-mcq-label">Difficulty</label>
            <select class="ef-mcq-select" id="ef-mcq-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="ef-mcq-row-2">
            <div class="ef-mcq-field">
              <label class="ef-mcq-label">
                Points
                <span class="ef-mcq-optional">(optional)</span>
              </label>
              <input class="ef-mcq-input" id="ef-mcq-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="ef-mcq-field">
              <label class="ef-mcq-label">
                Time Limit (sec)
                <span class="ef-mcq-optional">(optional)</span>
              </label>
              <input class="ef-mcq-input" id="ef-mcq-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="ef-mcq-field">
            <label class="ef-mcq-label">
              Tags
              <span class="ef-mcq-optional">(comma separated)</span>
            </label>
            <input class="ef-mcq-input" id="ef-mcq-tags" type="text"
              placeholder="e.g. science, astronomy, solar-system"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.ef-mcq-body -->

        <!-- Footer -->
        <div class="ef-mcq-footer">
          <button class="ef-mcq-btn-save" id="ef-mcq-btn-save">Save</button>
          <span class="ef-mcq-save-hint">IDs (A, B, C…) are assigned on save</span>
        </div>

      </div>
    `;
  }

  // ── Render option rows (no per-row preview) ──────────

  _renderOptions(options, correctAnswer) {
    if (!options.length) return '';
    return options.map((opt, i) =>
      this._optionRowHTML(opt.text || '', correctAnswer === opt.id, i)
    ).join('');
  }

  _optionRowHTML(text, isCorrect, index) {
    return `
      <div class="ef-mcq-option-row" draggable="true" data-opt-index="${index}">
        <span class="ef-mcq-drag-handle">⠿</span>
        <input type="radio" name="ef-mcq-correct"
               class="ef-mcq-correct-radio"
               data-opt-index="${index}"
               title="Mark as correct answer"
               ${isCorrect ? 'checked' : ''}
        />
        <input type="text"
               class="ef-mcq-option-text"
               placeholder="Option text (HTML/MathML supported)"
               value="${this._esc(text)}"
               data-opt-index="${index}"
        />
        <button class="ef-mcq-option-delete" title="Delete option">✕</button>
      </div>
    `;
  }

  // ── Bind all events ──────────────────────────────────

  _bindEvents() {

    // ── Question text: show preview on focus, keep on blur
    this._bindFocusPreview('ef-mcq-question', 'ef-mcq-question-preview');

    // ── Explanation: show preview on focus, keep on blur
    this._bindFocusPreview('ef-mcq-explanation', 'ef-mcq-explanation-preview');

    // ── SVG collapsible toggle
    this.querySelector('#ef-mcq-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-mcq-svg-section').classList.toggle('open');
    });

    // ── SVG textarea: live update preview
    this.querySelector('#ef-mcq-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ef-mcq-svg-preview').innerHTML = e.target.value;
    });

    // ── Remove SVG
    this.querySelector('#ef-mcq-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-mcq-svg').value = '';
      this.querySelector('#ef-mcq-svg-preview').innerHTML = '';
    });

    // ── Image collapsible toggle
    this.querySelector('#ef-mcq-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-mcq-img-section').classList.toggle('open');
    });

    // ── Image URL: live thumbnail
    this.querySelector('#ef-mcq-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });

    // ── Remove Image
    this.querySelector('#ef-mcq-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-mcq-img-url').value = '';
      this._updateImgPreview('');
    });

    // ── Add option
    this.querySelector('#ef-mcq-add-option')?.addEventListener('click', () => {
      this._addOptionRow();
    });

    // ── Options list: delegated events
    const optList = this.querySelector('#ef-mcq-options-list');
    if (optList) this._bindOptionListEvents(optList);

    // ── Skip / Unskip
    this.querySelector('#ef-mcq-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });

    this.querySelector('#ef-mcq-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'mcq';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // ── Save
    this.querySelector('#ef-mcq-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Focus-driven preview (question text + explanation) ─

  _bindFocusPreview(inputId, previewId) {
    const input   = this.querySelector(`#${inputId}`);
    const preview = this.querySelector(`#${previewId}`);
    if (!input || !preview) return;

    // Show + populate on focus
    input.addEventListener('focus', () => {
      preview.innerHTML = input.value;
      preview.classList.add('visible');
    });

    // Update live while typing (stays visible)
    input.addEventListener('input', () => {
      preview.innerHTML = input.value;
    });

    // On blur: keep visible, don't hide
    // (preview stays showing last content)
  }

  // ── Options list events ──────────────────────────────

  _bindOptionListEvents(optList) {

    // Focus on option text → show shared preview, highlight row
    optList.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ef-mcq-option-text')) return;
      const row   = e.target.closest('.ef-mcq-option-row');
      const index = parseInt(row.dataset.optIndex);

      // Highlight focused row
      optList.querySelectorAll('.ef-mcq-option-row')
        .forEach(r => r.classList.remove('ef-mcq-focused-row'));
      row.classList.add('ef-mcq-focused-row');

      // Show shared preview
      const box     = this.querySelector('#ef-mcq-option-preview-box');
      const label   = this.querySelector('#ef-mcq-option-preview-label');
      const content = this.querySelector('#ef-mcq-option-preview-content');
      box.classList.add('visible');
      label.textContent   = `Previewing option ${index + 1}`;
      content.innerHTML   = e.target.value;
    });

    // Live update shared preview while typing
    optList.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ef-mcq-option-text')) return;
      const row     = e.target.closest('.ef-mcq-option-row');
      const index   = parseInt(row.dataset.optIndex);
      const content = this.querySelector('#ef-mcq-option-preview-content');
      const label   = this.querySelector('#ef-mcq-option-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing option ${index + 1}`;
      }
    });

    // Blur: keep preview visible, showing last focused option
    // (no action needed — box stays as-is)

    // Delete option row
    optList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-mcq-option-delete')) return;
      const row = e.target.closest('.ef-mcq-option-row');
      row.remove();
      this._reindexOptions();
      // Hide shared preview if no options left
      const remaining = optList.querySelectorAll('.ef-mcq-option-row').length;
      if (remaining === 0) {
        this.querySelector('#ef-mcq-option-preview-box')
          ?.classList.remove('visible');
      }
    });

    // Drag reorder
    optList.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-mcq-option-row');
      if (!row) return;
      this._optDragSrc = parseInt(row.dataset.optIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    optList.addEventListener('dragend', () => {
      optList.querySelectorAll('.ef-mcq-option-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });

    optList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-mcq-option-row');
      if (row && parseInt(row.dataset.optIndex) !== this._optDragSrc) {
        optList.querySelectorAll('.ef-mcq-option-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });

    optList.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetRow = e.target.closest('.ef-mcq-option-row');
      if (!targetRow) return;
      const to   = parseInt(targetRow.dataset.optIndex);
      const from = this._optDragSrc;
      if (from === null || from === to) return;
      targetRow.classList.remove('drag-over');
      this._reorderOptionRows(from, to);
    });
  }

  // ── Add blank option row ─────────────────────────────

  _addOptionRow() {
    const list  = this.querySelector('#ef-mcq-options-list');
    const count = list.querySelectorAll('.ef-mcq-option-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._optionRowHTML('', false, count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexOptions();
    const input = row.querySelector('.ef-mcq-option-text');
    input?.focus();
  }

  // ── Reindex after add / delete / reorder ────────────

  _reindexOptions() {
    this.querySelectorAll('.ef-mcq-option-row').forEach((row, i) => {
      row.dataset.optIndex = i;
      const radio = row.querySelector('.ef-mcq-correct-radio');
      if (radio) radio.dataset.optIndex = i;
      const input = row.querySelector('.ef-mcq-option-text');
      if (input) input.dataset.optIndex = i;
    });
  }

  // ── Reorder option rows ──────────────────────────────

  _reorderOptionRows(from, to) {
    const list = this.querySelector('#ef-mcq-options-list');
    const rows = Array.from(list.querySelectorAll('.ef-mcq-option-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexOptions();
  }

  // ── Image preview helper ─────────────────────────────

  _updateImgPreview(url) {
    const preview = this.querySelector('#ef-mcq-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${this._esc(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl = this.querySelector('#ef-mcq-options-error');
    errEl.classList.remove('visible');

    const questionText = this.querySelector('#ef-mcq-question')?.value.trim() || '';
    const optRows      = this.querySelectorAll('.ef-mcq-option-row');
    const options      = [];
    let correctIndex   = -1;

    optRows.forEach((row, i) => {
      const text  = row.querySelector('.ef-mcq-option-text')?.value || '';
      const radio = row.querySelector('.ef-mcq-correct-radio');
      options.push({ text: text.trim() });
      if (radio?.checked) correctIndex = i;
    });

    // Validation
    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#ef-mcq-question')?.focus();
      return;
    }
    if (options.length < 2) {
      errEl.textContent = 'At least 2 options are required.';
      errEl.classList.add('visible');
      return;
    }

    // Assign A, B, C…
    const finalOptions = options.map((opt, i) => ({
      id:   String.fromCharCode(65 + i),
      text: opt.text,
    }));
    const correctAnswer = correctIndex >= 0
      ? String.fromCharCode(65 + correctIndex) : '';

    const saved = {
      type:           this._question?.type || 'mcq',
      question:       questionText,
      svg_content:    this.querySelector('#ef-mcq-svg')?.value.trim()       || '',
      img_url:        this.querySelector('#ef-mcq-img-url')?.value.trim()    || '',
      options:        finalOptions,
      correct_answer: correctAnswer,
      user_response:  '',
      explanation:    this.querySelector('#ef-mcq-explanation')?.value.trim() || '',
      difficulty:     this.querySelector('#ef-mcq-difficulty')?.value        || 'easy',
      points:         this._parseOptionalNumber('#ef-mcq-points'),
      time_limit:     this._parseOptionalNumber('#ef-mcq-time-limit'),
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

  // ── Small helpers ────────────────────────────────────

  _parseOptionalNumber(selector) {
    const val = this.querySelector(selector)?.value.trim();
    if (!val) return '';
    const n = parseFloat(val);
    return isNaN(n) ? '' : n;
  }

  _parseTags() {
    const raw = this.querySelector('#ef-mcq-tags')?.value || '';
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

customElements.define('ef-mcq-form', McqFormComponent);