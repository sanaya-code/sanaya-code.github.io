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
      <div class="ef-sa-form">

        <!-- Topbar -->
        <div class="ef-sa-topbar">
          ${isSkip
            ? `<span class="ef-sa-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="ef-sa-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="ef-sa-topbar-actions">
            ${isSkip
              ? `<button class="ef-sa-btn-unskip" id="ef-sa-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="ef-sa-btn-skip"   id="ef-sa-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="ef-sa-body ${isSkip ? 'ef-sa-is-skip' : ''}">

          <!-- Question text -->
          <div class="ef-sa-field">
            <label class="ef-sa-label">Question Text</label>
            <textarea class="ef-sa-textarea" id="ef-sa-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="ef-sa-render-preview" id="ef-sa-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="ef-sa-collapsible" id="ef-sa-svg-section">
            <div class="ef-sa-collapsible-header" id="ef-sa-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-sa-collapsible-arrow">▼</span>
            </div>
            <div class="ef-sa-collapsible-body">
              <textarea class="ef-sa-textarea" id="ef-sa-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="ef-sa-svg-preview" id="ef-sa-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="ef-sa-remove-btn" id="ef-sa-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="ef-sa-collapsible" id="ef-sa-img-section">
            <div class="ef-sa-collapsible-header" id="ef-sa-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-sa-collapsible-arrow">▼</span>
            </div>
            <div class="ef-sa-collapsible-body">
              <input class="ef-sa-input" id="ef-sa-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="ef-sa-img-preview ${q.img_url ? 'visible' : ''}"
                   id="ef-sa-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="ef-sa-remove-btn" id="ef-sa-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Correct Answer -->
          <div class="ef-sa-field">
            <label class="ef-sa-label">Correct Answer</label>
            <div class="ef-sa-correct-wrap">
              <input class="ef-sa-correct-input" id="ef-sa-correct-answer"
                type="text"
                placeholder="Enter the canonical correct answer..."
                value="${this._esc(q.correct_answer || '')}"
              />
            </div>
          </div>

          <!-- Acceptable Variations -->
          <div class="ef-sa-field">
            <div class="ef-sa-options-header">
              <label class="ef-sa-label">
                Acceptable Variations
                <span class="ef-sa-optional">(optional)</span>
              </label>
              <button class="ef-sa-add-variation-btn" id="ef-sa-add-variation">
                + Add Variation
              </button>
            </div>
            <div class="ef-sa-variations-hint">
              Other answers that will be accepted as correct
              (e.g. alternate spellings, abbreviations)
            </div>
            <div class="ef-sa-variations-list" id="ef-sa-variations-list">
              ${variations.map((v, i) => this._variationRowHTML(v, i)).join('')}
            </div>
            <div class="ef-sa-error" id="ef-sa-error"></div>
          </div>

          <!-- Explanation -->
          <div class="ef-sa-field">
            <label class="ef-sa-label">
              Explanation
              <span class="ef-sa-optional">(optional)</span>
            </label>
            <textarea class="ef-sa-textarea" id="ef-sa-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="ef-sa-render-preview" id="ef-sa-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="ef-sa-field">
            <label class="ef-sa-label">Difficulty</label>
            <select class="ef-sa-select" id="ef-sa-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="ef-sa-row-2">
            <div class="ef-sa-field">
              <label class="ef-sa-label">
                Points <span class="ef-sa-optional">(optional)</span>
              </label>
              <input class="ef-sa-input" id="ef-sa-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="ef-sa-field">
              <label class="ef-sa-label">
                Time Limit (sec) <span class="ef-sa-optional">(optional)</span>
              </label>
              <input class="ef-sa-input" id="ef-sa-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="ef-sa-field">
            <label class="ef-sa-label">
              Tags <span class="ef-sa-optional">(comma separated)</span>
            </label>
            <input class="ef-sa-input" id="ef-sa-tags" type="text"
              placeholder="e.g. geography, capitals"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.ef-sa-body -->

        <!-- Footer -->
        <div class="ef-sa-footer">
          <button class="ef-sa-btn-save" id="ef-sa-btn-save">Save</button>
          <span class="ef-sa-save-hint">Correct answer can be set later</span>
        </div>

      </div>
    `;
  }

  // ── Variation row HTML ───────────────────────────────

  _variationRowHTML(text, index) {
    return `
      <div class="ef-sa-variation-row" data-var-index="${index}">
        <span class="ef-sa-variation-bullet">◦</span>
        <input type="text"
               class="ef-sa-variation-input"
               placeholder="Acceptable variation..."
               value="${this._esc(text)}"
               data-var-index="${index}"
        />
        <button class="ef-sa-variation-delete" title="Remove variation">✕</button>
      </div>
    `;
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    this._bindFocusPreview('ef-sa-question',    'ef-sa-question-preview');
    this._bindFocusPreview('ef-sa-explanation', 'ef-sa-explanation-preview');

    // SVG collapsible
    this.querySelector('#ef-sa-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-sa-svg-section').classList.toggle('open');
    });
    this.querySelector('#ef-sa-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ef-sa-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#ef-sa-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-sa-svg').value = '';
      this.querySelector('#ef-sa-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#ef-sa-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-sa-img-section').classList.toggle('open');
    });
    this.querySelector('#ef-sa-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#ef-sa-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-sa-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add variation
    this.querySelector('#ef-sa-add-variation')?.addEventListener('click', () => {
      this._addVariationRow();
    });

    // Variations list — delegated delete
    const varList = this.querySelector('#ef-sa-variations-list');
    if (varList) {
      varList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ef-sa-variation-delete')) return;
        e.target.closest('.ef-sa-variation-row').remove();
        this._reindexVariations();
      });
    }

    // Skip / Unskip
    this.querySelector('#ef-sa-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#ef-sa-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'short_answer';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#ef-sa-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Add variation row ────────────────────────────────

  _addVariationRow() {
    const list  = this.querySelector('#ef-sa-variations-list');
    const count = list.querySelectorAll('.ef-sa-variation-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._variationRowHTML('', count);
    const row = div.firstElementChild;
    list.appendChild(row);
    this._reindexVariations();
    row.querySelector('.ef-sa-variation-input')?.focus();
  }

  // ── Reindex variation rows ───────────────────────────

  _reindexVariations() {
    this.querySelectorAll('.ef-sa-variation-row').forEach((row, i) => {
      row.dataset.varIndex = i;
      const inp = row.querySelector('.ef-sa-variation-input');
      if (inp) inp.dataset.varIndex = i;
    });
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl       = this.querySelector('#ef-sa-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#ef-sa-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#ef-sa-question')?.focus();
      return;
    }

    // Collect acceptable variations — filter empty rows
    const variations = Array.from(
      this.querySelectorAll('.ef-sa-variation-input')
    )
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);

    const saved = {
      type:                   this._question?.type || 'short_answer',
      question:               questionText,
      svg_content:            this.querySelector('#ef-sa-svg')?.value.trim()        || '',
      img_url:                this.querySelector('#ef-sa-img-url')?.value.trim()     || '',
      correct_answer:         this.querySelector('#ef-sa-correct-answer')?.value.trim() || '',
      acceptable_variations:  variations,
      user_response:          '',
      explanation:            this.querySelector('#ef-sa-explanation')?.value.trim() || '',
      difficulty:             this.querySelector('#ef-sa-difficulty')?.value         || 'easy',
      points:                 this._parseOptionalNumber('#ef-sa-points'),
      time_limit:             this._parseOptionalNumber('#ef-sa-time-limit'),
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
    const preview = this.querySelector('#ef-sa-img-preview');
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
    const raw = this.querySelector('#ef-sa-tags')?.value || '';
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