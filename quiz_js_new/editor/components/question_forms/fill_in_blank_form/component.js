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
      <div class="fib-form">

        <!-- Topbar -->
        <div class="fib-topbar">
          ${isSkip
            ? `<span class="fib-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="fib-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="fib-topbar-actions">
            ${isSkip
              ? `<button class="btn-unskip" id="fib-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="fib-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="fib-body ${isSkip ? 'fib-is-skip' : ''}">

          <!-- Question text -->
          <div class="fib-field">
            <label class="fib-label">Question Text</label>
            <textarea class="fib-textarea" id="fib-question"
              rows="3"
              placeholder='e.g. Solid state of water is called ____.'
            >${this._esc(q.question || '')}</textarea>
            <div class="fib-render-preview" id="fib-question-preview"></div>
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
          <div class="fib-collapsible" id="fib-svg-section">
            <div class="fib-collapsible-header" id="fib-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="fib-collapsible-arrow">▼</span>
            </div>
            <div class="fib-collapsible-body">
              <textarea class="fib-textarea" id="fib-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="fib-svg-preview" id="fib-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="fib-remove-btn" id="fib-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="fib-collapsible" id="fib-img-section">
            <div class="fib-collapsible-header" id="fib-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="fib-collapsible-arrow">▼</span>
            </div>
            <div class="fib-collapsible-body">
              <input class="fib-input" id="fib-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="fib-img-preview ${q.img_url ? 'visible' : ''}"
                   id="fib-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="fib-remove-btn" id="fib-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Correct Answer -->
          <div class="fib-field">
            <label class="fib-label">Correct Answer</label>
            <input class="fib-correct-input" id="fib-correct-answer"
              type="text"
              placeholder="The primary correct answer e.g. ice"
              value="${this._esc(q.correct_answer || '')}"
            />
          </div>

          <!-- Acceptable Answers -->
          <div class="fib-field">
            <div class="fib-options-header">
              <label class="fib-label">
                Acceptable Answers
                <span class="fib-optional">(optional)</span>
              </label>
              <button class="fib-add-answer-btn" id="fib-add-answer">
                + Add Answer
              </button>
            </div>
            <div class="fib-answers-hint">
              All answers that will be accepted as correct
              (including the canonical answer above)
            </div>
            <div class="fib-answers-list-wrap" id="fib-answers-list">
              ${answers.map((a, i) => this._answerRowHTML(a, i)).join('')}
            </div>
            <div class="fib-error" id="fib-error"></div>
          </div>

          <!-- Explanation -->
          <div class="fib-field">
            <label class="fib-label">
              Explanation <span class="fib-optional">(optional)</span>
            </label>
            <textarea class="fib-textarea" id="fib-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="fib-render-preview" id="fib-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="fib-field">
            <label class="fib-label">Difficulty</label>
            <select class="fib-select" id="fib-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="fib-row-2">
            <div class="fib-field">
              <label class="fib-label">
                Points <span class="fib-optional">(optional)</span>
              </label>
              <input class="fib-input" id="fib-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="fib-field">
              <label class="fib-label">
                Time Limit (sec) <span class="fib-optional">(optional)</span>
              </label>
              <input class="fib-input" id="fib-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="fib-field">
            <label class="fib-label">
              Tags <span class="fib-optional">(comma separated)</span>
            </label>
            <input class="fib-input" id="fib-tags" type="text"
              placeholder="e.g. science, states-of-matter"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.fib-body -->

        <!-- Footer -->
        <div class="fib-footer">
          <button class="fib-btn-save" id="fib-btn-save">Save</button>
          <span class="fib-save-hint">
            Use <strong>____</strong> in question text for the blank
          </span>
        </div>

      </div>
    `;
  }

  // ── Answer row HTML ──────────────────────────────────

  _answerRowHTML(text, index) {
    return `
      <div class="fib-answer-row" data-ans-index="${index}">
        <span class="fib-answer-bullet">◦</span>
        <input type="text"
               class="fib-answer-input-field fib-answer-input"
               placeholder="Acceptable answer..."
               value="${this._esc(text)}"
               data-ans-index="${index}"
        />
        <button class="fib-answer-delete" title="Remove answer">✕</button>
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
        if (!e.target.classList.contains('fib-answer-delete')) return;
        e.target.closest('.fib-answer-row').remove();
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
    const count = list.querySelectorAll('.fib-answer-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._answerRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexAnswers();
    list.querySelector('.fib-answer-row:last-child .fib-answer-input-field')?.focus();
  }

  // ── Reindex answer rows ──────────────────────────────

  _reindexAnswers() {
    this.querySelectorAll('#fib-answers-list .fib-answer-row')
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