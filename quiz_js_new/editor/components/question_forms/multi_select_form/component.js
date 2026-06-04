// editor/components/question_forms/multi_select_form/component.js

class MultiSelectFormComponent extends HTMLElement {

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
    const q        = this._question || EditorFormRegistry.getDefault('multi_select');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'multi_select') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#e05555';
    const badgeLabel = typeConf ? typeConf.label : 'Multi Select';

    this.innerHTML = `
      <div class="ef-ms-form">

        <!-- Topbar -->
        <div class="ef-ms-topbar">
          ${isSkip
            ? `<span class="ef-ms-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="ef-ms-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="ef-ms-topbar-actions">
            ${isSkip
              ? `<button class="ef-ms-btn-unskip" id="ef-ms-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="ef-ms-btn-skip"   id="ef-ms-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="ef-ms-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text -->
          <div class="ef-ms-field">
            <label class="ef-ms-label">Question Text</label>
            <textarea class="ef-ms-textarea" id="ef-ms-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="ef-ms-render-preview" id="ef-ms-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="ef-ms-collapsible" id="ef-ms-svg-section">
            <div class="ef-ms-collapsible-header" id="ef-ms-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-ms-collapsible-arrow">▼</span>
            </div>
            <div class="ef-ms-collapsible-body">
              <textarea class="ef-ms-textarea" id="ef-ms-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="ef-ms-svg-preview" id="ef-ms-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="ef-ms-remove-btn" id="ef-ms-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="ef-ms-collapsible" id="ef-ms-img-section">
            <div class="ef-ms-collapsible-header" id="ef-ms-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-ms-collapsible-arrow">▼</span>
            </div>
            <div class="ef-ms-collapsible-body">
              <input class="ef-ms-input" id="ef-ms-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="ef-ms-img-preview ${q.img_url ? 'visible' : ''}"
                   id="ef-ms-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="ef-ms-remove-btn" id="ef-ms-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Options -->
          <div class="ef-ms-field">
            <div class="ef-ms-options-header">
              <label class="ef-ms-label">Options</label>
              <button class="ef-ms-add-option-btn" id="ef-ms-add-option">+ Add Option</button>
            </div>
            <div class="ef-ms-options-list" id="ef-ms-options-list">
              ${this._renderOptions(q.options || [])}
            </div>
            <!-- Correct count hint -->
            <div class="ef-ms-correct-hint ${this._correctCount(q.options || []) > 0 ? 'has-correct' : ''}"
                 id="ef-ms-correct-hint">
              ${this._correctHintText(q.options || [])}
            </div>
            <!-- Shared option preview -->
            <div class="ef-ms-option-preview-box" id="ef-ms-option-preview-box">
              <div class="ef-ms-option-preview-label" id="ef-ms-option-preview-label">
                Previewing option 1
              </div>
              <div class="ef-ms-option-preview-content"
                   id="ef-ms-option-preview-content"></div>
            </div>
            <div class="ef-ms-error" id="ef-ms-options-error"></div>
          </div>

          <!-- Explanation -->
          <div class="ef-ms-field">
            <label class="ef-ms-label">
              Explanation
              <span class="ef-ms-optional">(optional)</span>
            </label>
            <textarea class="ef-ms-textarea" id="ef-ms-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="ef-ms-render-preview" id="ef-ms-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="ef-ms-field">
            <label class="ef-ms-label">Difficulty</label>
            <select class="ef-ms-select" id="ef-ms-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="ef-ms-row-2">
            <div class="ef-ms-field">
              <label class="ef-ms-label">
                Points <span class="ef-ms-optional">(optional)</span>
              </label>
              <input class="ef-ms-input" id="ef-ms-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="ef-ms-field">
              <label class="ef-ms-label">
                Time Limit (sec) <span class="ef-ms-optional">(optional)</span>
              </label>
              <input class="ef-ms-input" id="ef-ms-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="ef-ms-field">
            <label class="ef-ms-label">
              Tags <span class="ef-ms-optional">(comma separated)</span>
            </label>
            <input class="ef-ms-input" id="ef-ms-tags" type="text"
              placeholder="e.g. science, math"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.ef-ms-body -->

        <!-- Footer -->
        <div class="ef-ms-footer">
          <button class="ef-ms-btn-save" id="ef-ms-btn-save">Save</button>
          <span class="ef-ms-save-hint">IDs (A, B, C…) assigned on save</span>
        </div>

      </div>
    `;
  }

  // ── Render option rows ───────────────────────────────

  _renderOptions(options) {
    if (!options.length) return '';
    return options.map((opt, i) =>
      this._optionRowHTML(opt.text || '', !!opt.correct, i)
    ).join('');
  }

  _optionRowHTML(text, isCorrect, index) {
    return `
      <div class="ef-ms-option-row ${isCorrect ? 'ef-ms-is-correct' : ''}"
           draggable="true" data-opt-index="${index}">
        <span class="ef-ms-drag-handle">⠿</span>
        <input type="checkbox"
               class="ef-ms-correct-checkbox"
               data-opt-index="${index}"
               title="Mark as correct answer"
               ${isCorrect ? 'checked' : ''}
        />
        <input type="text"
               class="ef-ms-option-text"
               placeholder="Option text (HTML/MathML supported)"
               value="${this._esc(text)}"
               data-opt-index="${index}"
        />
        <button class="ef-ms-option-delete" title="Delete option">✕</button>
      </div>
    `;
  }

  // ── Correct count helpers ────────────────────────────

  _correctCount(options) {
    return options.filter(o => o.correct).length;
  }

  _correctHintText(options) {
    const count = this._correctCount(options);
    if (count === 0) return 'No correct answers marked yet — can be saved as draft.';
    return count === 1
      ? '1 correct answer marked'
      : `${count} correct answers marked`;
  }

  // ── Update hint from live DOM ────────────────────────

  _updateCorrectHint() {
    const hint     = this.querySelector('#ef-ms-correct-hint');
    if (!hint) return;
    const checked  = this.querySelectorAll('.ef-ms-correct-checkbox:checked').length;
    hint.textContent = checked === 0
      ? 'No correct answers marked yet — can be saved as draft.'
      : checked === 1
        ? '1 correct answer marked'
        : `${checked} correct answers marked`;
    hint.classList.toggle('has-correct', checked > 0);
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    this._bindFocusPreview('ef-ms-question',    'ef-ms-question-preview');
    this._bindFocusPreview('ef-ms-explanation', 'ef-ms-explanation-preview');

    // SVG collapsible
    this.querySelector('#ef-ms-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-ms-svg-section').classList.toggle('open');
    });
    this.querySelector('#ef-ms-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ef-ms-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#ef-ms-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-ms-svg').value = '';
      this.querySelector('#ef-ms-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#ef-ms-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-ms-img-section').classList.toggle('open');
    });
    this.querySelector('#ef-ms-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#ef-ms-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-ms-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add option
    this.querySelector('#ef-ms-add-option')?.addEventListener('click', () => {
      this._addOptionRow();
    });

    // Options list — delegated
    const optList = this.querySelector('#ef-ms-options-list');
    if (optList) this._bindOptionListEvents(optList);

    // Skip / Unskip
    this.querySelector('#ef-ms-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#ef-ms-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'multi_select';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#ef-ms-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Options list delegated events ────────────────────

  _bindOptionListEvents(optList) {

    // Focus → shared preview
    optList.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ef-ms-option-text')) return;
      const row   = e.target.closest('.ef-ms-option-row');
      const index = parseInt(row.dataset.optIndex);
      optList.querySelectorAll('.ef-ms-option-row')
        .forEach(r => r.classList.remove('ef-ms-focused-row'));
      row.classList.add('ef-ms-focused-row');
      const box     = this.querySelector('#ef-ms-option-preview-box');
      const label   = this.querySelector('#ef-ms-option-preview-label');
      const content = this.querySelector('#ef-ms-option-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing option ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    // Live preview update
    optList.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ef-ms-option-text')) return;
      const row     = e.target.closest('.ef-ms-option-row');
      const index   = parseInt(row.dataset.optIndex);
      const content = this.querySelector('#ef-ms-option-preview-content');
      const label   = this.querySelector('#ef-ms-option-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing option ${index + 1}`;
      }
    });

    // Checkbox change — highlight row + update hint
    optList.addEventListener('change', (e) => {
      if (!e.target.classList.contains('ef-ms-correct-checkbox')) return;
      const row = e.target.closest('.ef-ms-option-row');
      row.classList.toggle('ef-ms-is-correct', e.target.checked);
      this._updateCorrectHint();
    });

    // Delete option
    optList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-ms-option-delete')) return;
      e.target.closest('.ef-ms-option-row').remove();
      this._reindexOptions();
      this._updateCorrectHint();
      const remaining = optList.querySelectorAll('.ef-ms-option-row').length;
      if (remaining === 0) {
        this.querySelector('#ef-ms-option-preview-box')
          ?.classList.remove('visible');
      }
    });

    // Drag reorder
    optList.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-ms-option-row');
      if (!row) return;
      this._optDragSrc = parseInt(row.dataset.optIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    optList.addEventListener('dragend', () => {
      optList.querySelectorAll('.ef-ms-option-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    optList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-ms-option-row');
      if (row && parseInt(row.dataset.optIndex) !== this._optDragSrc) {
        optList.querySelectorAll('.ef-ms-option-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    optList.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetRow = e.target.closest('.ef-ms-option-row');
      if (!targetRow) return;
      const to = parseInt(targetRow.dataset.optIndex);
      if (this._optDragSrc === null || this._optDragSrc === to) return;
      targetRow.classList.remove('drag-over');
      this._reorderOptionRows(this._optDragSrc, to);
    });
  }

  // ── Add blank option row ─────────────────────────────

  _addOptionRow() {
    const list  = this.querySelector('#ef-ms-options-list');
    const count = list.querySelectorAll('.ef-ms-option-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._optionRowHTML('', false, count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexOptions();
    row.querySelector('.ef-ms-option-text')?.focus();
  }

  // ── Reindex ──────────────────────────────────────────

  _reindexOptions() {
    this.querySelectorAll('.ef-ms-option-row').forEach((row, i) => {
      row.dataset.optIndex = i;
      const cb  = row.querySelector('.ef-ms-correct-checkbox');
      if (cb)  cb.dataset.optIndex  = i;
      const inp = row.querySelector('.ef-ms-option-text');
      if (inp) inp.dataset.optIndex = i;
    });
  }

  // ── Reorder ──────────────────────────────────────────

  _reorderOptionRows(from, to) {
    const list = this.querySelector('#ef-ms-options-list');
    const rows = Array.from(list.querySelectorAll('.ef-ms-option-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexOptions();
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl       = this.querySelector('#ef-ms-options-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#ef-ms-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#ef-ms-question')?.focus();
      return;
    }

    const optRows = this.querySelectorAll('.ef-ms-option-row');
    if (optRows.length < 2) {
      errEl.textContent = 'At least 2 options are required.';
      errEl.classList.add('visible');
      return;
    }

    // Build options with A/B/C IDs + correct boolean per option
    const options = Array.from(optRows).map((row, i) => ({
      id:      String.fromCharCode(65 + i),
      text:    row.querySelector('.ef-ms-option-text')?.value.trim() || '',
      correct: row.querySelector('.ef-ms-correct-checkbox')?.checked || false,
    }));

    const saved = {
      type:          this._question?.type || 'multi_select',
      question:      questionText,
      svg_content:   this.querySelector('#ef-ms-svg')?.value.trim()        || '',
      img_url:       this.querySelector('#ef-ms-img-url')?.value.trim()     || '',
      options:       options,
      user_response: [],
      explanation:   this.querySelector('#ef-ms-explanation')?.value.trim() || '',
      difficulty:    this.querySelector('#ef-ms-difficulty')?.value         || 'easy',
      points:        this._parseOptionalNumber('#ef-ms-points'),
      time_limit:    this._parseOptionalNumber('#ef-ms-time-limit'),
      tags:          this._parseTags(),
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
    const preview = this.querySelector('#ef-ms-img-preview');
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
    const raw = this.querySelector('#ef-ms-tags')?.value || '';
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

customElements.define('multi-select-form', MultiSelectFormComponent);