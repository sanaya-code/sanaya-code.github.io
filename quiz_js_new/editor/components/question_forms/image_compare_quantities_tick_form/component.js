// editor/components/question_forms/image_compare_quantities_tick_form/component.js

class ImageCompareQuantitiesTickFormComponent extends HTMLElement {

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
    const q          = this._question ||
      EditorFormRegistry.getDefault('image_compare_quantities_tick');
    const isSkip     = q.type === 'skip';
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'image_compare_quantities_tick') : q.type
    );
    const badgeColor  = typeConf ? typeConf.color : '#1565c0';
    const badgeLabel  = typeConf ? typeConf.label : 'Image Compare Tick';

    const dir         = q.partition_direction || 'vertical';
    const zones       = q.tick_zones          || { left: 'top_left', right: 'top_right' };
    const feedback    = q.feedback            || { correct: '', incorrect: '' };
    const ca          = q.correct_answer      || '';

    const ZONE_OPTIONS = ['top_left', 'top_right', 'bottom_left', 'bottom_right'];

    const zoneSelect = (id, current) => `
      <select class="mcf-select" id="${id}">
        ${ZONE_OPTIONS.map(z => `
          <option value="${z}" ${current === z ? 'selected' : ''}>
            ${z.replace(/_/g, ' ')}
          </option>`).join('')}
      </select>`;

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
              ? `<button class="btn-unskip" id="ict-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip"   id="ict-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text -->
          <div class="mcf-field">
            <label class="mcf-label">Question Text</label>
            <textarea class="mcf-textarea" id="ict-question"
              rows="2"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="mcf-render-preview" id="ict-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="mcf-collapsible" id="ict-svg-section">
            <div class="mcf-collapsible-header" id="ict-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <textarea class="mcf-textarea" id="ict-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="mcf-svg-preview" id="ict-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="mcf-remove-btn" id="ict-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="mcf-collapsible" id="ict-img-section">
            <div class="mcf-collapsible-header" id="ict-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <input class="mcf-input" id="ict-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="ict-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="mcf-remove-btn" id="ict-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Partition direction -->
          <div class="mcf-field">
            <label class="mcf-label">Partition Direction</label>
            <select class="mcf-select" id="ict-partition-dir">
              <option value="vertical"   ${dir === 'vertical'   ? 'selected' : ''}>
                Vertical (left / right)
              </option>
              <option value="horizontal" ${dir === 'horizontal' ? 'selected' : ''}>
                Horizontal (top / bottom)
              </option>
            </select>
          </div>

          <!-- Tick zones -->
          <div class="mcf-field">
            <label class="mcf-label">Tick Zones</label>
            <div class="ict-zones-grid">
              <div class="mcf-field">
                <label class="mcf-label" style="font-size:10px">Left Zone</label>
                ${zoneSelect('ict-zone-left', zones.left)}
              </div>
              <div class="mcf-field">
                <label class="mcf-label" style="font-size:10px">Right Zone</label>
                ${zoneSelect('ict-zone-right', zones.right)}
              </div>
            </div>
          </div>

          <!-- Correct answer -->
          <div class="mcf-field">
            <label class="mcf-label">Correct Answer</label>
            <div class="ict-answer-group">
              <label class="ict-answer-option ${ca === 'left' ? 'selected-left' : ''}"
                     id="ict-opt-left">
                <input type="radio" name="ict-correct" value="left"
                       ${ca === 'left' ? 'checked' : ''} />
                ← Left
              </label>
              <label class="ict-answer-option ${ca === 'right' ? 'selected-right' : ''}"
                     id="ict-opt-right">
                <input type="radio" name="ict-correct" value="right"
                       ${ca === 'right' ? 'checked' : ''} />
                Right →
              </label>
            </div>
          </div>

          <!-- Feedback -->
          <div class="mcf-field">
            <label class="mcf-label">
              Feedback <span class="mcf-optional">(optional)</span>
            </label>
            <div class="ict-feedback-grid">
              <div class="mcf-field">
                <label class="mcf-label" style="font-size:10px">✓ Correct</label>
                <input class="mcf-input" id="ict-feedback-correct" type="text"
                  placeholder="e.g. Correct! You picked the right side."
                  value="${this._esc(feedback.correct || '')}"
                />
              </div>
              <div class="mcf-field">
                <label class="mcf-label" style="font-size:10px">✗ Incorrect</label>
                <input class="mcf-input" id="ict-feedback-incorrect" type="text"
                  placeholder="e.g. Try again. Count carefully."
                  value="${this._esc(feedback.incorrect || '')}"
                />
              </div>
            </div>
          </div>

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="ict-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="ict-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="ict-difficulty">
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
              <input class="mcf-input" id="ict-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">
                Time Limit (sec) <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="ict-time-limit" type="number"
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
            <input class="mcf-input" id="ict-tags" type="text"
              placeholder="e.g. counting, visual reasoning"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="ict-btn-save">Save</button>
          <span class="mcf-save-hint">Correct answer can be set later</span>
        </div>

      </div>
    `;
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {
    this._bindFocusPreview('ict-question',    'ict-question-preview');
    this._bindFocusPreview('ict-explanation', 'ict-explanation-preview');

    // SVG collapsible
    this.querySelector('#ict-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ict-svg-section').classList.toggle('open');
    });
    this.querySelector('#ict-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ict-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#ict-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ict-svg').value = '';
      this.querySelector('#ict-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#ict-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ict-img-section').classList.toggle('open');
    });
    this.querySelector('#ict-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#ict-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ict-img-url').value = '';
      this._updateImgPreview('');
    });

    // Correct answer radio — highlight selected
    this.querySelectorAll('input[name="ict-correct"]').forEach(radio => {
      radio.addEventListener('change', () => this._updateAnswerHighlight());
    });

    // Skip / Unskip
    this.querySelector('#ict-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#ict-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'image_compare_quantities_tick';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#ict-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Answer highlight ─────────────────────────────────

  _updateAnswerHighlight() {
    const val      = this.querySelector('input[name="ict-correct"]:checked')?.value;
    const leftOpt  = this.querySelector('#ict-opt-left');
    const rightOpt = this.querySelector('#ict-opt-right');
    leftOpt?.classList.toggle('selected-left',   val === 'left');
    rightOpt?.classList.toggle('selected-right', val === 'right');
    if (val === 'left')  rightOpt?.classList.remove('selected-right');
    if (val === 'right') leftOpt?.classList.remove('selected-left');
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const saved = {
      type:                this._question?.type || 'image_compare_quantities_tick',
      question:            this.querySelector('#ict-question')?.value.trim()          || '',
      svg_content:         this.querySelector('#ict-svg')?.value.trim()               || '',
      img_url:             this.querySelector('#ict-img-url')?.value.trim()            || '',
      partition_direction: this.querySelector('#ict-partition-dir')?.value            || 'vertical',
      tick_zones: {
        left:  this.querySelector('#ict-zone-left')?.value  || 'top_left',
        right: this.querySelector('#ict-zone-right')?.value || 'top_right',
      },
      correct_answer: this.querySelector('input[name="ict-correct"]:checked')?.value || '',
      user_response:  null,
      feedback: {
        correct:   this.querySelector('#ict-feedback-correct')?.value.trim()   || '',
        incorrect: this.querySelector('#ict-feedback-incorrect')?.value.trim() || '',
      },
      explanation:  this.querySelector('#ict-explanation')?.value.trim()              || '',
      difficulty:   this.querySelector('#ict-difficulty')?.value                      || 'easy',
      points:       this._parseOptionalNumber('#ict-points'),
      time_limit:   this._parseOptionalNumber('#ict-time-limit'),
      tags:         this._parseTags(),
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
    const preview = this.querySelector('#ict-img-preview');
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
    const raw = this.querySelector('#ict-tags')?.value || '';
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

customElements.define('compare-image-objects-form',
  ImageCompareQuantitiesTickFormComponent);