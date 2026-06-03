// editor/components/question_forms/compare_quantities_form/component.js

class CompareQuantitiesFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('compare_quantities');
    const isSkip     = q.type === 'skip';
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'compare_quantities') : q.type
    );
    const badgeColor  = typeConf ? typeConf.color : '#4f86f7';
    const badgeLabel  = typeConf ? typeConf.label : 'Compare Quantities';
    const qA          = q.quantity_a || { label: 'A', value: '' };
    const qB          = q.quantity_b || { label: 'B', value: '' };
    const symbols     = Array.isArray(q.symbol_options)
      ? q.symbol_options
      : [' ', '>', '<', '='];
    const correctAnswer = q.correct_answer || '';

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
              ? `<button class="btn-unskip" id="cq-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="cq-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text -->
          <div class="mcf-field">
            <label class="mcf-label">Question Text</label>
            <textarea class="mcf-textarea" id="cq-question"
              rows="2"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="mcf-render-preview" id="cq-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="mcf-collapsible" id="cq-svg-section">
            <div class="mcf-collapsible-header" id="cq-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <textarea class="mcf-textarea" id="cq-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="mcf-svg-preview" id="cq-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="mcf-remove-btn" id="cq-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="mcf-collapsible" id="cq-img-section">
            <div class="mcf-collapsible-header" id="cq-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <input class="mcf-input" id="cq-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="cq-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="mcf-remove-btn" id="cq-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Quantities side by side -->
          <div class="mcf-field">
            <label class="mcf-label">Quantities</label>
            <div class="cq-quantities">

              <!-- Quantity A -->
              <div class="cq-quantity-card">
                <div class="cq-quantity-title">Quantity A</div>
                <div class="mcf-field">
                  <label class="mcf-label" style="font-size:10px">Label</label>
                  <input class="mcf-input" id="cq-label-a" type="text"
                    placeholder="e.g. A"
                    value="${this._esc(qA.label || 'A')}"
                  />
                </div>
                <div class="mcf-field">
                  <label class="mcf-label" style="font-size:10px">
                    Value (HTML/MathML supported)
                  </label>
                  <textarea class="mcf-textarea" id="cq-value-a"
                    rows="2"
                    placeholder="e.g. 3x+2"
                  >${this._esc(qA.value || '')}</textarea>
                  <div class="mcf-render-preview" id="cq-value-a-preview"></div>
                </div>
              </div>

              <!-- VS divider -->
              <div class="cq-vs">?</div>

              <!-- Quantity B -->
              <div class="cq-quantity-card">
                <div class="cq-quantity-title">Quantity B</div>
                <div class="mcf-field">
                  <label class="mcf-label" style="font-size:10px">Label</label>
                  <input class="mcf-input" id="cq-label-b" type="text"
                    placeholder="e.g. B"
                    value="${this._esc(qB.label || 'B')}"
                  />
                </div>
                <div class="mcf-field">
                  <label class="mcf-label" style="font-size:10px">
                    Value (HTML/MathML supported)
                  </label>
                  <textarea class="mcf-textarea" id="cq-value-b"
                    rows="2"
                    placeholder="e.g. 2x+5"
                  >${this._esc(qB.value || '')}</textarea>
                  <div class="mcf-render-preview" id="cq-value-b-preview"></div>
                </div>
              </div>

            </div>
          </div>

          <!-- Symbol options -->
          <div class="mcf-field">
            <div class="mcf-options-header">
              <label class="mcf-label">Symbol Options</label>
              <button class="mcf-add-option-btn" id="cq-add-symbol">+ Add Symbol</button>
            </div>
            <div class="cq-symbols-wrap" id="cq-symbols-wrap">
              ${symbols.map((s, i) => this._symbolRowHTML(s, i)).join('')}
            </div>
          </div>

          <!-- Correct answer — click to select -->
          <div class="mcf-field">
            <label class="mcf-label">Correct Answer</label>
            <div class="cq-correct-answer-display" id="cq-correct-display">
              ${symbols.map(s => `
                <div class="cq-answer-option ${s === correctAnswer ? 'selected' : ''}"
                     data-symbol="${this._esc(s)}">
                  ${this._esc(s) || '&nbsp;&nbsp;'}
                </div>`).join('')}
            </div>
            <input type="hidden" id="cq-correct-answer"
                   value="${this._esc(correctAnswer)}" />
            <div class="mcf-error" id="cq-error"></div>
          </div>

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="cq-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="cq-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="cq-difficulty">
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
              <input class="mcf-input" id="cq-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">
                Time Limit (sec) <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="cq-time-limit" type="number"
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
            <input class="mcf-input" id="cq-tags" type="text"
              placeholder="e.g. algebra, comparison"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="cq-btn-save">Save</button>
          <span class="mcf-save-hint">Both quantities support HTML/MathML</span>
        </div>

      </div>
    `;
  }

  // ── Symbol row HTML ──────────────────────────────────

  _symbolRowHTML(val, index) {
    return `
      <div class="cq-symbol-row" data-sym-index="${index}">
        <input type="text" class="cq-symbol-input"
               value="${this._esc(val)}"
               data-sym-index="${index}"
               maxlength="3"
        />
        <button class="cq-symbol-delete" title="Remove">✕</button>
      </div>`;
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    this._bindFocusPreview('cq-question',    'cq-question-preview');
    this._bindFocusPreview('cq-value-a',     'cq-value-a-preview');
    this._bindFocusPreview('cq-value-b',     'cq-value-b-preview');
    this._bindFocusPreview('cq-explanation', 'cq-explanation-preview');

    // SVG collapsible
    this.querySelector('#cq-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#cq-svg-section').classList.toggle('open');
    });
    this.querySelector('#cq-svg')?.addEventListener('input', (e) => {
      this.querySelector('#cq-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#cq-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#cq-svg').value = '';
      this.querySelector('#cq-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#cq-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#cq-img-section').classList.toggle('open');
    });
    this.querySelector('#cq-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#cq-img-remove')?.addEventListener('click', () => {
      this.querySelector('#cq-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add symbol
    this.querySelector('#cq-add-symbol')?.addEventListener('click', () => {
      const wrap  = this.querySelector('#cq-symbols-wrap');
      const count = wrap.querySelectorAll('.cq-symbol-row').length;
      const div   = document.createElement('div');
      div.innerHTML = this._symbolRowHTML('', count);
      wrap.appendChild(div.firstElementChild);
      this._bindSymbolEvents();
      this._refreshCorrectDisplay();
      wrap.querySelector('.cq-symbol-row:last-child .cq-symbol-input')?.focus();
    });

    this._bindSymbolEvents();

    // Correct answer click
    this.querySelector('#cq-correct-display')?.addEventListener('click', (e) => {
      const opt = e.target.closest('.cq-answer-option');
      if (!opt) return;
      this.querySelectorAll('.cq-answer-option')
        .forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      this.querySelector('#cq-correct-answer').value = opt.dataset.symbol;
    });

    // Skip / Unskip
    this.querySelector('#cq-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#cq-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'compare_quantities';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#cq-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Symbol events ─────────────────────────────────────

  _bindSymbolEvents() {
    const wrap = this.querySelector('#cq-symbols-wrap');
    if (!wrap) return;

    // Delete symbol
    wrap.querySelectorAll('.cq-symbol-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.cq-symbol-row').remove();
        this._reindexSymbols();
        this._refreshCorrectDisplay();
      });
    });

    // Update correct display when symbol text changes
    wrap.querySelectorAll('.cq-symbol-input').forEach(inp => {
      inp.addEventListener('input', () => {
        this._refreshCorrectDisplay();
      });
    });
  }

  _reindexSymbols() {
    this.querySelectorAll('.cq-symbol-row').forEach((row, i) => {
      row.dataset.symIndex = i;
      const inp = row.querySelector('.cq-symbol-input');
      if (inp) inp.dataset.symIndex = i;
    });
  }

  // ── Refresh correct answer buttons from current symbols ──

  _refreshCorrectDisplay() {
    const display = this.querySelector('#cq-correct-display');
    const current = this.querySelector('#cq-correct-answer')?.value || '';
    if (!display) return;

    const symbols = Array.from(this.querySelectorAll('.cq-symbol-input'))
      .map(inp => inp.value);

    display.innerHTML = symbols.map(s => `
      <div class="cq-answer-option ${s === current ? 'selected' : ''}"
           data-symbol="${this._esc(s)}">
        ${this._esc(s) || '&nbsp;&nbsp;'}
      </div>`).join('');

    // Re-bind click on new elements
    display.querySelectorAll('.cq-answer-option').forEach(opt => {
      opt.addEventListener('click', () => {
        display.querySelectorAll('.cq-answer-option')
          .forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const hidden = this.querySelector('#cq-correct-answer');
        if (hidden) hidden.value = opt.dataset.symbol;
      });
    });
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl = this.querySelector('#cq-error');
    errEl.classList.remove('visible');

    const questionText = this.querySelector('#cq-question')?.value.trim() || '';
    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#cq-question')?.focus();
      return;
    }

    const symbols = Array.from(this.querySelectorAll('.cq-symbol-input'))
      .map(inp => inp.value)
      .filter(s => s.length > 0 || s === ' ');

    const correctAnswer = this.querySelector('#cq-correct-answer')?.value || '';

    const saved = {
      type:           this._question?.type || 'compare_quantities',
      question:       questionText,
      svg_content:    this.querySelector('#cq-svg')?.value.trim()          || '',
      img_url:        this.querySelector('#cq-img-url')?.value.trim()       || '',
      quantity_a: {
        label: this.querySelector('#cq-label-a')?.value.trim() || 'A',
        value: this.querySelector('#cq-value-a')?.value.trim() || '',
      },
      quantity_b: {
        label: this.querySelector('#cq-label-b')?.value.trim() || 'B',
        value: this.querySelector('#cq-value-b')?.value.trim() || '',
      },
      symbol_options: symbols,
      correct_answer: correctAnswer,
      user_response:  '',
      explanation:    this.querySelector('#cq-explanation')?.value.trim()   || '',
      difficulty:     this.querySelector('#cq-difficulty')?.value           || 'easy',
      points:         this._parseOptionalNumber('#cq-points'),
      time_limit:     this._parseOptionalNumber('#cq-time-limit'),
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
    const preview = this.querySelector('#cq-img-preview');
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
    const raw = this.querySelector('#cq-tags')?.value || '';
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

customElements.define('compare-quantities-form', CompareQuantitiesFormComponent);