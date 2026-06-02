// editor/components/question_forms/fill_in_blank_form/component.js

class FillInBlankFormComponent extends HTMLElement {

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
    const q        = this._question || EditorFormRegistry.getDefault('fill_in_blank');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'fill_in_blank') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#27ae7a';
    const badgeLabel = typeConf ? typeConf.label : 'Fill in Blank';
    const answers    = Array.isArray(q.acceptable_answers)
      ? q.acceptable_answers : [];
    const hasBlank   = (q.question || '').includes('____');

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
              ? `<button class="btn-unskip" id="fib-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="fib-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text -->
          <div class="mcf-field">
            <label class="mcf-label">Question Text</label>
            <textarea class="mcf-textarea" id="fib-question"
              rows="3"
              placeholder='e.g. Solid state of water is called ____.'
            >${this._esc(q.question || '')}</textarea>
            <div class="mcf-render-preview" id="fib-question-preview"></div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <div class="fib-blank-hint">
                Type <code>____</code> (4 underscores) where the blank should appear
              </div>
              <span class="fib-blank-status ${hasBlank ? 'found' : 'missing'}"
                    id="fib-blank-status">
                ${hasBlank ? '✓ Blank found' : '⚠ No blank detected'}
              </span>
            </div>
          </div>

          <!-- SVG — collapsible -->
          <div class="mcf-collapsible" id="fib-svg-section">
            <div class="mcf-collapsible-header" id="fib-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <textarea class="mcf-textarea" id="fib-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="mcf-svg-preview" id="fib-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="mcf-remove-btn" id="fib-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="mcf-collapsible" id="fib-img-section">
            <div class="mcf-collapsible-header" id="fib-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <input class="mcf-input" id="fib-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="fib-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="mcf-remove-btn" id="fib-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Correct Answer -->
          <div class="mcf-field">
            <label class="mcf-label">Correct Answer</label>
            <input class="sa-correct-input" id="fib-correct-answer"
              type="text"
              placeholder="The primary correct answer e.g. ice"
              value="${this._esc(q.correct_answer || '')}"
            />
          </div>

          <!-- Acceptable Answers -->
          <div class="mcf-field">
            <div class="mcf-options-header">
              <label class="mcf-label">
                Acceptable Answers
                <span class="mcf-optional">(optional)</span>
              </label>
              <button class="sa-add-variation-btn" id="fib-add-answer">
                + Add Answer
              </button>
            </div>
            <div class="sa-variations-hint">
              All answers that will be accepted as correct
              (including the canonical answer above)
            </div>
            <div class="sa-variations-list" id="fib-answers-list">
              ${answers.map((a, i) => this._answerRowHTML(a, i)).join('')}
            </div>
            <div class="mcf-error" id="fib-error"></div>
          </div>

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="fib-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="fib-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="fib-difficulty">
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
              <input class="mcf-input" id="fib-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">
                Time Limit (sec) <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="fib-time-limit" type="number"
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
            <input class="mcf-input" id="fib-tags" type="text"
              placeholder="e.g. science, states-of-matter"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="fib-btn-save">Save</button>
          <span class="mcf-save-hint">
            Use <strong>____</strong> in question text for the blank
          </span>
        </div>

      </div>
    `;
  }

  // ── Answer row HTML ──────────────────────────────────

  _answerRowHTML(text, index) {
    return `
      <div class="sa-variation-row" data-ans-index="${index}">
        <span class="sa-variation-bullet">◦</span>
        <input type="text"
               class="sa-variation-input fib-answer-input"
               placeholder="Acceptable answer..."
               value="${this._esc(text)}"
               data-ans-index="${index}"
        />
        <button class="sa-variation-delete" title="Remove answer">✕</button>
      </div>
    `;
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    // Question text — focus preview + blank detector
    const questionTA = this.querySelector('#fib-question');
    const preview    = this.querySelector('#fib-question-preview');
    const status     = this.querySelector('#fib-blank-status');

    if (questionTA) {
      questionTA.addEventListener('focus', () => {
        preview.innerHTML = questionTA.value;
        preview.classList.add('visible');
      });
      questionTA.addEventListener('input', () => {
        preview.innerHTML = questionTA.value;
        this._updateBlankStatus(questionTA.value, status);
      });
    }

    this._bindFocusPreview('fib-explanation', 'fib-explanation-preview');

    // SVG collapsible
    this.querySelector('#fib-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#fib-svg-section').classList.toggle('open');
    });
    this.querySelector('#fib-svg')?.addEventListener('input', (e) => {
      this.querySelector('#fib-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#fib-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#fib-svg').value = '';
      this.querySelector('#fib-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#fib-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#fib-img-section').classList.toggle('open');
    });
    this.querySelector('#fib-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#fib-img-remove')?.addEventListener('click', () => {
      this.querySelector('#fib-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add acceptable answer
    this.querySelector('#fib-add-answer')?.addEventListener('click', () => {
      this._addAnswerRow();
    });

    // Answers list — delegated delete
    const ansList = this.querySelector('#fib-answers-list');
    if (ansList) {
      ansList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('sa-variation-delete')) return;
        e.target.closest('.sa-variation-row').remove();
        this._reindexAnswers();
      });
    }

    // Skip / Unskip
    this.querySelector('#fib-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#fib-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'fill_in_blank';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#fib-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Blank status indicator ───────────────────────────

  _updateBlankStatus(text, statusEl) {
    if (!statusEl) return;
    const hasBlank = text.includes('____');
    statusEl.textContent = hasBlank ? '✓ Blank found' : '⚠ No blank detected';
    statusEl.className   = 'fib-blank-status ' + (hasBlank ? 'found' : 'missing');
  }

  // ── Add answer row ───────────────────────────────────

  _addAnswerRow() {
    const list  = this.querySelector('#fib-answers-list');
    const count = list.querySelectorAll('.sa-variation-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._answerRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexAnswers();
    list.querySelector('.sa-variation-row:last-child .sa-variation-input')?.focus();
  }

  // ── Reindex answer rows ──────────────────────────────

  _reindexAnswers() {
    this.querySelectorAll('#fib-answers-list .sa-variation-row')
      .forEach((row, i) => {
        row.dataset.ansIndex = i;
        const inp = row.querySelector('.fib-answer-input');
        if (inp) inp.dataset.ansIndex = i;
      });
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl        = this.querySelector('#fib-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#fib-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#fib-question')?.focus();
      return;
    }

    // Collect acceptable answers — filter empty rows
    const acceptableAnswers = Array.from(
      this.querySelectorAll('.fib-answer-input')
    )
      .map(inp => inp.value.trim())
      .filter(a => a.length > 0);

    const saved = {
      type:               this._question?.type || 'fill_in_blank',
      question:           questionText,
      svg_content:        this.querySelector('#fib-svg')?.value.trim()           || '',
      img_url:            this.querySelector('#fib-img-url')?.value.trim()        || '',
      correct_answer:     this.querySelector('#fib-correct-answer')?.value.trim() || '',
      acceptable_answers: acceptableAnswers,
      user_response:      '',
      explanation:        this.querySelector('#fib-explanation')?.value.trim()    || '',
      difficulty:         this.querySelector('#fib-difficulty')?.value            || 'easy',
      points:             this._parseOptionalNumber('#fib-points'),
      time_limit:         this._parseOptionalNumber('#fib-time-limit'),
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
    const preview = this.querySelector('#fib-img-preview');
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
    const raw = this.querySelector('#fib-tags')?.value || '';
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

customElements.define('fill-in-blank-form', FillInBlankFormComponent);