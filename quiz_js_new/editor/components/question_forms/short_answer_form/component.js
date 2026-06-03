// editor/components/question_forms/short_answer_form/component.js

class ShortAnswerFormComponent extends HTMLElement {

  connectedCallback() {
    this._question = null;
    this._index    = -1;
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
    const q        = this._question || EditorFormRegistry.getDefault('short_answer');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'short_answer') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#7f8c8d';
    const badgeLabel = typeConf ? typeConf.label : 'Short Answer';
    const variations = Array.isArray(q.acceptable_variations)
      ? q.acceptable_variations : [];

    this.innerHTML = `
      <div class="sa-form">

        <!-- Topbar -->
        <div class="sa-topbar">
          ${isSkip
            ? `<span class="sa-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="sa-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="sa-topbar-actions">
            ${isSkip
              ? `<button class="btn-unskip" id="sa-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="sa-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="sa-body ${isSkip ? 'sa-is-skip' : ''}">

          <!-- Question text -->
          <div class="sa-field">
            <label class="sa-label">Question Text</label>
            <textarea class="sa-textarea" id="sa-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="sa-render-preview" id="sa-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="sa-collapsible" id="sa-svg-section">
            <div class="sa-collapsible-header" id="sa-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="sa-collapsible-arrow">▼</span>
            </div>
            <div class="sa-collapsible-body">
              <textarea class="sa-textarea" id="sa-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="sa-svg-preview" id="sa-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="sa-remove-btn" id="sa-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="sa-collapsible" id="sa-img-section">
            <div class="sa-collapsible-header" id="sa-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="sa-collapsible-arrow">▼</span>
            </div>
            <div class="sa-collapsible-body">
              <input class="sa-input" id="sa-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="sa-img-preview ${q.img_url ? 'visible' : ''}"
                   id="sa-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="sa-remove-btn" id="sa-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Correct Answer -->
          <div class="sa-field">
            <label class="sa-label">Correct Answer</label>
            <div class="sa-correct-wrap">
              <input class="sa-correct-input" id="sa-correct-answer"
                type="text"
                placeholder="Enter the canonical correct answer..."
                value="${this._esc(q.correct_answer || '')}"
              />
            </div>
          </div>

          <!-- Acceptable Variations -->
          <div class="sa-field">
            <div class="sa-options-header">
              <label class="sa-label">
                Acceptable Variations
                <span class="sa-optional">(optional)</span>
              </label>
              <button class="sa-add-variation-btn" id="sa-add-variation">
                + Add Variation
              </button>
            </div>
            <div class="sa-variations-hint">
              Other answers that will be accepted as correct
              (e.g. alternate spellings, abbreviations)
            </div>
            <div class="sa-variations-list" id="sa-variations-list">
              ${variations.map((v, i) => this._variationRowHTML(v, i)).join('')}
            </div>
            <div class="sa-error-msg" id="sa-error"></div>
          </div>

          <!-- Explanation -->
          <div class="sa-field">
            <label class="sa-label">
              Explanation
              <span class="sa-optional">(optional)</span>
            </label>
            <textarea class="sa-textarea" id="sa-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="sa-render-preview" id="sa-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="sa-field">
            <label class="sa-label">Difficulty</label>
            <select class="sa-select" id="sa-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="sa-row-2">
            <div class="sa-field">
              <label class="sa-label">
                Points <span class="sa-optional">(optional)</span>
              </label>
              <input class="sa-input" id="sa-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="sa-field">
              <label class="sa-label">
                Time Limit (sec) <span class="sa-optional">(optional)</span>
              </label>
              <input class="sa-input" id="sa-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="sa-field">
            <label class="sa-label">
              Tags <span class="sa-optional">(comma separated)</span>
            </label>
            <input class="sa-input" id="sa-tags" type="text"
              placeholder="e.g. geography, capitals"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.sa-body -->

        <!-- Footer -->
        <div class="sa-footer">
          <button class="sa-btn-save" id="sa-btn-save">Save</button>
          <span class="sa-save-hint">Correct answer can be set later</span>
        </div>

      </div>
    `;
  }

  // ── Variation row HTML ───────────────────────────────

  _variationRowHTML(text, index) {
    return `
      <div class="sa-variation-row" data-var-index="${index}">
        <span class="sa-variation-bullet">◦</span>
        <input type="text"
               class="sa-variation-input"
               placeholder="Acceptable variation..."
               value="${this._esc(text)}"
               data-var-index="${index}"
        />
        <button class="sa-variation-delete" title="Remove variation">✕</button>
      </div>
    `;
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    this._bindFocusPreview('sa-question',    'sa-question-preview');
    this._bindFocusPreview('sa-explanation', 'sa-explanation-preview');

    // SVG collapsible
    this.querySelector('#sa-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#sa-svg-section').classList.toggle('open');
    });
    this.querySelector('#sa-svg')?.addEventListener('input', (e) => {
      this.querySelector('#sa-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#sa-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#sa-svg').value = '';
      this.querySelector('#sa-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#sa-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#sa-img-section').classList.toggle('open');
    });
    this.querySelector('#sa-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#sa-img-remove')?.addEventListener('click', () => {
      this.querySelector('#sa-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add variation
    this.querySelector('#sa-add-variation')?.addEventListener('click', () => {
      this._addVariationRow();
    });

    // Variations list — delegated delete
    const varList = this.querySelector('#sa-variations-list');
    if (varList) {
      varList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('sa-variation-delete')) return;
        e.target.closest('.sa-variation-row').remove();
        this._reindexVariations();
      });
    }

    // Skip / Unskip
    this.querySelector('#sa-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#sa-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'short_answer';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#sa-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Add variation row ────────────────────────────────

  _addVariationRow() {
    const list  = this.querySelector('#sa-variations-list');
    const count = list.querySelectorAll('.sa-variation-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._variationRowHTML('', count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexVariations();
    row.querySelector('.sa-variation-input')?.focus();
  }

  // ── Reindex variation rows ───────────────────────────

  _reindexVariations() {
    this.querySelectorAll('.sa-variation-row').forEach((row, i) => {
      row.dataset.varIndex = i;
      const inp = row.querySelector('.sa-variation-input');
      if (inp) inp.dataset.varIndex = i;
    });
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl       = this.querySelector('#sa-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#sa-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#sa-question')?.focus();
      return;
    }

    // Collect acceptable variations — filter empty rows
    const variations = Array.from(
      this.querySelectorAll('.sa-variation-input')
    )
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);

    const saved = {
      type:                   this._question?.type || 'short_answer',
      question:               questionText,
      svg_content:            this.querySelector('#sa-svg')?.value.trim()        || '',
      img_url:                this.querySelector('#sa-img-url')?.value.trim()     || '',
      correct_answer:         this.querySelector('#sa-correct-answer')?.value.trim() || '',
      acceptable_variations:  variations,
      user_response:          '',
      explanation:            this.querySelector('#sa-explanation')?.value.trim() || '',
      difficulty:             this.querySelector('#sa-difficulty')?.value         || 'easy',
      points:                 this._parseOptionalNumber('#sa-points'),
      time_limit:             this._parseOptionalNumber('#sa-time-limit'),
      tags:                   this._parseTags(),
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
    const preview = this.querySelector('#sa-img-preview');
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
    const raw = this.querySelector('#sa-tags')?.value || '';
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

customElements.define('short-answer-form', ShortAnswerFormComponent);