// editor/components/question_forms/true_false_form/component.js

class TrueFalseFormComponent extends HTMLElement {

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
    const q        = this._question || EditorConfig.DEFAULTS.true_false;
    const isSkip   = q.type === 'skip';
    const typeConf = EditorConfig.getType(
      isSkip ? (q.original_type || 'true_false') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#f7a24f';
    const badgeLabel = typeConf ? typeConf.label : 'True / False';

    // correct_answer: true | false | '' (unset draft)
    const ca           = q.correct_answer;
    const trueSelected  = ca === true  || ca === 'true';
    const falseSelected = ca === false || ca === 'false';

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
              ? `<button class="btn-unskip" id="tf-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="tf-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text -->
          <div class="mcf-field">
            <label class="mcf-label">Question Text</label>
            <textarea class="mcf-textarea" id="tf-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="mcf-render-preview" id="tf-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="mcf-collapsible" id="tf-svg-section">
            <div class="mcf-collapsible-header" id="tf-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <textarea class="mcf-textarea" id="tf-svg"
                rows="3"
                placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="mcf-svg-preview" id="tf-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="mcf-remove-btn" id="tf-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="mcf-collapsible" id="tf-img-section">
            <div class="mcf-collapsible-header" id="tf-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <input class="mcf-input" id="tf-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="tf-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="mcf-remove-btn" id="tf-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Correct Answer -->
          <div class="mcf-field">
            <label class="mcf-label">Correct Answer</label>
            <div class="tf-answer-group">

              <label class="tf-answer-option ${trueSelected ? 'selected-true' : ''}"
                     id="tf-opt-true">
                <input type="radio" name="tf-correct" value="true"
                       ${trueSelected ? 'checked' : ''} />
                <span class="tf-answer-icon">✓</span>
                <span class="tf-answer-label">True</span>
              </label>

              <label class="tf-answer-option ${falseSelected ? 'selected-false' : ''}"
                     id="tf-opt-false">
                <input type="radio" name="tf-correct" value="false"
                       ${falseSelected ? 'checked' : ''} />
                <span class="tf-answer-icon">✗</span>
                <span class="tf-answer-label">False</span>
              </label>

            </div>
            ${(!trueSelected && !falseSelected)
              ? `<div class="tf-unset-hint">
                   No answer selected — question can be saved as draft.
                 </div>`
              : ''
            }
            <div class="mcf-error" id="tf-error"></div>
          </div>

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation
              <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="tf-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="tf-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="tf-difficulty">
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
              <input class="mcf-input" id="tf-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">
                Time Limit (sec)
                <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="tf-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
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
            <input class="mcf-input" id="tf-tags" type="text"
              placeholder="e.g. science, biology"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="tf-btn-save">Save</button>
          <span class="mcf-save-hint">Correct answer can be set later</span>
        </div>

      </div>
    `;
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    // Question text — focus preview
    this._bindFocusPreview('tf-question', 'tf-question-preview');

    // Explanation — focus preview
    this._bindFocusPreview('tf-explanation', 'tf-explanation-preview');

    // SVG collapsible
    this.querySelector('#tf-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#tf-svg-section').classList.toggle('open');
    });
    this.querySelector('#tf-svg')?.addEventListener('input', (e) => {
      this.querySelector('#tf-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#tf-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#tf-svg').value = '';
      this.querySelector('#tf-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#tf-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#tf-img-section').classList.toggle('open');
    });
    this.querySelector('#tf-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#tf-img-remove')?.addEventListener('click', () => {
      this.querySelector('#tf-img-url').value = '';
      this._updateImgPreview('');
    });

    // Answer radio — highlight selected option
    this.querySelectorAll('input[name="tf-correct"]').forEach(radio => {
      radio.addEventListener('change', () => this._updateAnswerHighlight());
    });

    // Skip / Unskip
    this.querySelector('#tf-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#tf-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'true_false';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#tf-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Highlight selected answer option ─────────────────

  _updateAnswerHighlight() {
    const trueOpt  = this.querySelector('#tf-opt-true');
    const falseOpt = this.querySelector('#tf-opt-false');
    const val      = this.querySelector('input[name="tf-correct"]:checked')?.value;
    trueOpt.classList.toggle('selected-true',   val === 'true');
    falseOpt.classList.toggle('selected-false', val === 'false');
    // Remove opposite
    if (val === 'true')  falseOpt.classList.remove('selected-false');
    if (val === 'false') trueOpt.classList.remove('selected-true');
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl       = this.querySelector('#tf-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#tf-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#tf-question')?.focus();
      return;
    }

    // correct_answer: boolean or '' if unset
    const radioVal = this.querySelector('input[name="tf-correct"]:checked')?.value;
    const correctAnswer = radioVal === 'true'
      ? true
      : radioVal === 'false'
        ? false
        : '';

    const saved = {
      type:           this._question?.type || 'true_false',
      question:       questionText,
      svg_content:    this.querySelector('#tf-svg')?.value.trim()        || '',
      img_url:        this.querySelector('#tf-img-url')?.value.trim()     || '',
      correct_answer: correctAnswer,
      user_response:  '',
      explanation:    this.querySelector('#tf-explanation')?.value.trim() || '',
      difficulty:     this.querySelector('#tf-difficulty')?.value         || 'easy',
      points:         this._parseOptionalNumber('#tf-points'),
      time_limit:     this._parseOptionalNumber('#tf-time-limit'),
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
    const preview = this.querySelector('#tf-img-preview');
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
    const raw = this.querySelector('#tf-tags')?.value || '';
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

customElements.define('true-false-form', TrueFalseFormComponent);