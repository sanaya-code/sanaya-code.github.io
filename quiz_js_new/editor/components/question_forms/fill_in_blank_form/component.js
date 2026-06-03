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
      <div class="ef-fib-form">

        <!-- Topbar -->
        <div class="ef-fib-topbar">
          ${isSkip
            ? `<span class="ef-fib-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="ef-fib-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="ef-fib-topbar-actions">
            ${isSkip
              ? `<button class="ef-fib-btn-unskip" id="ef-fib-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="ef-fib-btn-skip"   id="ef-fib-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="ef-fib-body ${isSkip ? 'ef-fib-is-skip' : ''}">

          <!-- Question text -->
          <div class="ef-fib-field">
            <label class="ef-fib-label">Question Text</label>
            <textarea class="ef-fib-textarea" id="ef-fib-question"
              rows="3"
              placeholder='e.g. Solid state of water is called ____.'
            >${this._esc(q.question || '')}</textarea>
            <div class="ef-fib-render-preview" id="ef-fib-question-preview"></div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <div class="ef-fib-blank-hint">
                Type <code>____</code> (4 underscores) where the blank should appear
              </div>
              <span class="ef-fib-blank-status ${hasBlank ? 'found' : 'missing'}"
                    id="ef-fib-blank-status">
                ${hasBlank ? '✓ Blank found' : '⚠ No blank detected'}
              </span>
            </div>
          </div>

          <!-- SVG — collapsible -->
          <div class="ef-fib-collapsible" id="ef-fib-svg-section">
            <div class="ef-fib-collapsible-header" id="ef-fib-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-fib-collapsible-arrow">▼</span>
            </div>
            <div class="ef-fib-collapsible-body">
              <textarea class="ef-fib-textarea" id="ef-fib-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="ef-fib-svg-preview" id="ef-fib-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="ef-fib-remove-btn" id="ef-fib-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="ef-fib-collapsible" id="ef-fib-img-section">
            <div class="ef-fib-collapsible-header" id="ef-fib-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-fib-collapsible-arrow">▼</span>
            </div>
            <div class="ef-fib-collapsible-body">
              <input class="ef-fib-input" id="ef-fib-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="ef-fib-img-preview ${q.img_url ? 'visible' : ''}"
                   id="ef-fib-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="ef-fib-remove-btn" id="ef-fib-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Correct Answer -->
          <div class="ef-fib-field">
            <label class="ef-fib-label">Correct Answer</label>
            <input class="ef-fib-correct-input" id="ef-fib-correct-answer"
              type="text"
              placeholder="The primary correct answer e.g. ice"
              value="${this._esc(q.correct_answer || '')}"
            />
          </div>

          <!-- Acceptable Answers -->
          <div class="ef-fib-field">
            <div class="ef-fib-options-header">
              <label class="ef-fib-label">
                Acceptable Answers
                <span class="ef-fib-optional">(optional)</span>
              </label>
              <button class="ef-fib-add-answer-btn" id="ef-fib-add-answer">
                + Add Answer
              </button>
            </div>
            <div class="ef-fib-answers-hint">
              All answers that will be accepted as correct
              (including the canonical answer above)
            </div>
            <div class="ef-fib-answers-list-wrap" id="ef-fib-answers-list">
              ${answers.map((a, i) => this._answerRowHTML(a, i)).join('')}
            </div>
            <div class="ef-fib-error" id="ef-fib-error"></div>
          </div>

          <!-- Explanation -->
          <div class="ef-fib-field">
            <label class="ef-fib-label">
              Explanation <span class="ef-fib-optional">(optional)</span>
            </label>
            <textarea class="ef-fib-textarea" id="ef-fib-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="ef-fib-render-preview" id="ef-fib-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="ef-fib-field">
            <label class="ef-fib-label">Difficulty</label>
            <select class="ef-fib-select" id="ef-fib-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="ef-fib-row-2">
            <div class="ef-fib-field">
              <label class="ef-fib-label">
                Points <span class="ef-fib-optional">(optional)</span>
              </label>
              <input class="ef-fib-input" id="ef-fib-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="ef-fib-field">
              <label class="ef-fib-label">
                Time Limit (sec) <span class="ef-fib-optional">(optional)</span>
              </label>
              <input class="ef-fib-input" id="ef-fib-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="ef-fib-field">
            <label class="ef-fib-label">
              Tags <span class="ef-fib-optional">(comma separated)</span>
            </label>
            <input class="ef-fib-input" id="ef-fib-tags" type="text"
              placeholder="e.g. science, states-of-matter"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.ef-fib-body -->

        <!-- Footer -->
        <div class="ef-fib-footer">
          <button class="ef-fib-btn-save" id="ef-fib-btn-save">Save</button>
          <span class="ef-fib-save-hint">
            Use <strong>____</strong> in question text for the blank
          </span>
        </div>

      </div>
    `;
  }

  // ── Answer row HTML ──────────────────────────────────

  _answerRowHTML(text, index) {
    return `
      <div class="ef-fib-answer-row" data-ans-index="${index}">
        <span class="ef-fib-answer-bullet">◦</span>
        <input type="text"
               class="ef-fib-answer-input-field ef-fib-answer-input"
               placeholder="Acceptable answer..."
               value="${this._esc(text)}"
               data-ans-index="${index}"
        />
        <button class="ef-fib-answer-delete" title="Remove answer">✕</button>
      </div>
    `;
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    // Question text — focus preview + blank detector
    const questionTA = this.querySelector('#ef-fib-question');
    const preview    = this.querySelector('#ef-fib-question-preview');
    const status     = this.querySelector('#ef-fib-blank-status');

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

    this._bindFocusPreview('ef-fib-explanation', 'ef-fib-explanation-preview');

    // SVG collapsible
    this.querySelector('#ef-fib-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-fib-svg-section').classList.toggle('open');
    });
    this.querySelector('#ef-fib-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ef-fib-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#ef-fib-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-fib-svg').value = '';
      this.querySelector('#ef-fib-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#ef-fib-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-fib-img-section').classList.toggle('open');
    });
    this.querySelector('#ef-fib-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#ef-fib-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-fib-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add acceptable answer
    this.querySelector('#ef-fib-add-answer')?.addEventListener('click', () => {
      this._addAnswerRow();
    });

    // Answers list — delegated delete
    const ansList = this.querySelector('#ef-fib-answers-list');
    if (ansList) {
      ansList.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ef-fib-answer-delete')) return;
        e.target.closest('.ef-fib-answer-row').remove();
        this._reindexAnswers();
      });
    }

    // Skip / Unskip
    this.querySelector('#ef-fib-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#ef-fib-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'fill_in_blank';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#ef-fib-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Blank status indicator ───────────────────────────

  _updateBlankStatus(text, statusEl) {
    if (!statusEl) return;
    const hasBlank = text.includes('____');
    statusEl.textContent = hasBlank ? '✓ Blank found' : '⚠ No blank detected';
    statusEl.className   = 'ef-fib-blank-status ' + (hasBlank ? 'found' : 'missing');
  }

  // ── Add answer row ───────────────────────────────────

  _addAnswerRow() {
    const list  = this.querySelector('#ef-fib-answers-list');
    const count = list.querySelectorAll('.ef-fib-answer-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._answerRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexAnswers();
    list.querySelector('.ef-fib-answer-row:last-child .ef-fib-answer-input-field')?.focus();
  }

  // ── Reindex answer rows ──────────────────────────────

  _reindexAnswers() {
    this.querySelectorAll('#ef-fib-answers-list .ef-fib-answer-row')
      .forEach((row, i) => {
        row.dataset.ansIndex = i;
        const inp = row.querySelector('.ef-fib-answer-input');
        if (inp) inp.dataset.ansIndex = i;
      });
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl        = this.querySelector('#ef-fib-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#ef-fib-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#ef-fib-question')?.focus();
      return;
    }

    // Collect acceptable answers — filter empty rows
    const acceptableAnswers = Array.from(
      this.querySelectorAll('.ef-fib-answer-input')
    )
      .map(inp => inp.value.trim())
      .filter(a => a.length > 0);

    const saved = {
      type:               this._question?.type || 'fill_in_blank',
      question:           questionText,
      svg_content:        this.querySelector('#ef-fib-svg')?.value.trim()           || '',
      img_url:            this.querySelector('#ef-fib-img-url')?.value.trim()        || '',
      correct_answer:     this.querySelector('#ef-fib-correct-answer')?.value.trim() || '',
      acceptable_answers: acceptableAnswers,
      user_response:      '',
      explanation:        this.querySelector('#ef-fib-explanation')?.value.trim()    || '',
      difficulty:         this.querySelector('#ef-fib-difficulty')?.value            || 'easy',
      points:             this._parseOptionalNumber('#ef-fib-points'),
      time_limit:         this._parseOptionalNumber('#ef-fib-time-limit'),
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
    const preview = this.querySelector('#ef-fib-img-preview');
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
    const raw = this.querySelector('#ef-fib-tags')?.value || '';
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