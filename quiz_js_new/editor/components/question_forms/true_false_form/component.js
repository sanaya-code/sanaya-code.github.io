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
    const q        = this._question || EditorFormRegistry.getDefault('true_false');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'true_false') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#f7a24f';
    const badgeLabel = typeConf ? typeConf.label : 'True / False';

    // correct_answer: true | false | '' (unset draft)
    const ca           = q.correct_answer;
    const trueSelected  = ca === true  || ca === 'true';
    const falseSelected = ca === false || ca === 'false';

    this.innerHTML = `
      <div class="ef-tf-form" data-form>

        <!-- Topbar -->
        <div class="ef-tf-topbar">
          ${isSkip
            ? `<span class="ef-tf-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="ef-tf-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="ef-tf-topbar-actions">
            ${isSkip
              ? `<button class="ef-tf-btn-unskip" id="ef-tf-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="ef-tf-btn-skip"   id="ef-tf-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="ef-tf-body" data-body ${isSkip ? 'ef-tf-is-skip' : ''}">

          <!-- Question text -->
          <div class="ef-tf-field">
            <label class="ef-tf-label">Question Text</label>
            <textarea class="ef-tf-textarea" id="ef-tf-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="ef-tf-render-preview" id="ef-tf-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="ef-tf-collapsible" id="ef-tf-svg-section">
            <div class="ef-tf-collapsible-header" id="ef-tf-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-tf-collapsible-arrow">▼</span>
            </div>
            <div class="ef-tf-collapsible-body">
              <textarea class="ef-tf-textarea" id="ef-tf-svg"
                rows="3"
                placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="ef-tf-svg-preview" id="ef-tf-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="ef-tf-remove-btn" id="ef-tf-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="ef-tf-collapsible" id="ef-tf-img-section">
            <div class="ef-tf-collapsible-header" id="ef-tf-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-tf-collapsible-arrow">▼</span>
            </div>
            <div class="ef-tf-collapsible-body">
              <input class="ef-tf-input" id="ef-tf-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="ef-tf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="ef-tf-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="ef-tf-remove-btn" id="ef-tf-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Correct Answer -->
          <div class="ef-tf-field">
            <label class="ef-tf-label">Correct Answer</label>
            <div class="ef-tf-answer-group">

              <label class="ef-tf-answer-option ${trueSelected ? 'selected-true' : ''}"
                     id="ef-tf-opt-true">
                <input type="radio" name="ef-tf-correct" value="true"
                       ${trueSelected ? 'checked' : ''} />
                <span class="ef-tf-answer-icon">✓</span>
                <span class="ef-tf-answer-label">True</span>
              </label>

              <label class="ef-tf-answer-option ${falseSelected ? 'selected-false' : ''}"
                     id="ef-tf-opt-false">
                <input type="radio" name="ef-tf-correct" value="false"
                       ${falseSelected ? 'checked' : ''} />
                <span class="ef-tf-answer-icon">✗</span>
                <span class="ef-tf-answer-label">False</span>
              </label>

            </div>
            ${(!trueSelected && !falseSelected)
              ? `<div class="ef-tf-unset-hint">
                   No answer selected — question can be saved as draft.
                 </div>`
              : ''
            }
            <div class="ef-tf-error" id="ef-tf-error"></div>
          </div>

          <!-- Explanation -->
          <div class="ef-tf-field">
            <label class="ef-tf-label">
              Explanation
              <span class="ef-tf-optional">(optional)</span>
            </label>
            <textarea class="ef-tf-textarea" id="ef-tf-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="ef-tf-render-preview" id="ef-tf-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="ef-tf-field">
            <label class="ef-tf-label">Difficulty</label>
            <select class="ef-tf-select" id="ef-tf-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="ef-tf-row-2">
            <div class="ef-tf-field">
              <label class="ef-tf-label">
                Points
                <span class="ef-tf-optional">(optional)</span>
              </label>
              <input class="ef-tf-input" id="ef-tf-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="ef-tf-field">
              <label class="ef-tf-label">
                Time Limit (sec)
                <span class="ef-tf-optional">(optional)</span>
              </label>
              <input class="ef-tf-input" id="ef-tf-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="ef-tf-field">
            <label class="ef-tf-label">
              Tags
              <span class="ef-tf-optional">(comma separated)</span>
            </label>
            <input class="ef-tf-input" id="ef-tf-tags" type="text"
              placeholder="e.g. science, biology"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.ef-tf-body -->

        <!-- Footer -->
        <div class="ef-tf-footer">
          <button class="ef-tf-btn-save" id="ef-tf-btn-save">Save</button>
          <span class="ef-tf-save-hint">Correct answer can be set later</span>
        </div>

      </div>
    `;
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    // Question text — focus preview
    this._bindFocusPreview('ef-tf-question', 'ef-tf-question-preview');

    // Explanation — focus preview
    this._bindFocusPreview('ef-tf-explanation', 'ef-tf-explanation-preview');

    // SVG collapsible
    this.querySelector('#ef-tf-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-tf-svg-section').classList.toggle('open');
    });
    this.querySelector('#ef-tf-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ef-tf-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#ef-tf-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-tf-svg').value = '';
      this.querySelector('#ef-tf-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#ef-tf-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-tf-img-section').classList.toggle('open');
    });
    this.querySelector('#ef-tf-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#ef-tf-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-tf-img-url').value = '';
      this._updateImgPreview('');
    });

    // Answer radio — highlight selected option
    this.querySelectorAll('input[name="ef-tf-correct"]').forEach(radio => {
      radio.addEventListener('change', () => this._updateAnswerHighlight());
    });

    // Skip / Unskip
    this.querySelector('#ef-tf-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#ef-tf-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'true_false';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#ef-tf-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Highlight selected answer option ─────────────────

  _updateAnswerHighlight() {
    const trueOpt  = this.querySelector('#ef-tf-opt-true');
    const falseOpt = this.querySelector('#ef-tf-opt-false');
    const val      = this.querySelector('input[name="ef-tf-correct"]:checked')?.value;
    trueOpt.classList.toggle('selected-true',   val === 'true');
    falseOpt.classList.toggle('selected-false', val === 'false');
    // Remove opposite
    if (val === 'true')  falseOpt.classList.remove('selected-false');
    if (val === 'false') trueOpt.classList.remove('selected-true');
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl       = this.querySelector('#ef-tf-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#ef-tf-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#ef-tf-question')?.focus();
      return;
    }

    // correct_answer: boolean or '' if unset
    const radioVal = this.querySelector('input[name="ef-tf-correct"]:checked')?.value;
    const correctAnswer = radioVal === 'true'
      ? true
      : radioVal === 'false'
        ? false
        : '';

    const saved = {
      type:           this._question?.type || 'true_false',
      question:       questionText,
      svg_content:    this.querySelector('#ef-tf-svg')?.value.trim()        || '',
      img_url:        this.querySelector('#ef-tf-img-url')?.value.trim()     || '',
      correct_answer: correctAnswer,
      user_response:  '',
      explanation:    this.querySelector('#ef-tf-explanation')?.value.trim() || '',
      difficulty:     this.querySelector('#ef-tf-difficulty')?.value         || 'easy',
      points:         this._parseOptionalNumber('#ef-tf-points'),
      time_limit:     this._parseOptionalNumber('#ef-tf-time-limit'),
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
    const preview = this.querySelector('#ef-tf-img-preview');
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
    const raw = this.querySelector('#ef-tf-tags')?.value || '';
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