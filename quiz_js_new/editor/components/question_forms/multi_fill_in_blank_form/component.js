// editor/components/question_forms/multi_fill_in_blank_form/component.js

class MultiFillInBlankFormComponent extends HTMLElement {

  connectedCallback() {
    this._question        = null;
    this._index           = -1;
    this._segments        = [];   // [{type:'text',value:''} | {type:'blank',correct_answer:'',acceptable_answers:[],hint:''}]
    this._activeSegment   = -1;   // index of segment being edited (-1 = none)
    this._render();
    this._bindEvents();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._segments = this._parseSegments(question);
    this._activeSegment = -1;
    this._render();
    this._bindEvents();
  }

  // ── Parse existing question into segments ────────────

  _parseSegments(q) {
    if (!q.question && (!q.blanks || !q.blanks.length)) return [];

    const text   = q.question || '';
    const blanks = Array.isArray(q.blanks) ? q.blanks : [];
    const parts  = text.split('____');
    const segs   = [];

    parts.forEach((part, i) => {
      if (part) segs.push({ type: 'text', value: part });
      if (i < blanks.length) {
        const b = blanks[i] || {};
        segs.push({
          type:               'blank',
          correct_answer:     b.correct_answer     || '',
          acceptable_answers: b.acceptable_answers || [],
          hint:               b.hint               || '',
        });
      } else if (i < parts.length - 1) {
        // blank with no data
        segs.push({ type: 'blank', correct_answer: '', acceptable_answers: [], hint: '' });
      }
    });

    return segs;
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q        = this._question || EditorFormRegistry.getDefault('multi_fill_in_blank');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'multi_fill_in_blank') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#1a8a8a';
    const badgeLabel = typeConf ? typeConf.label : 'Multi Fill Blank';
    const blankCount = this._segments.filter(s => s.type === 'blank').length;

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
              ? `<button class="btn-unskip" id="mfib-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip" id="mfib-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question builder -->
          <div class="mcf-field">
            <label class="mcf-label">Question</label>
            <div class="mfib-builder" id="mfib-builder">
              ${this._renderSegmentPills()}
            </div>
            <!-- Assembled question preview -->
            <div class="mcf-render-preview" id="mfib-assembled-preview"
                 style="display:block"></div>
            <div class="mfib-blanks-summary ${blankCount > 0 ? 'has-blanks' : ''}"
                 id="mfib-blanks-summary">
              ${blankCount === 0
                ? 'No blanks added yet — click + Add Blank'
                : `${blankCount} blank${blankCount > 1 ? 's' : ''} defined`
              }
            </div>
            <div class="mfib-add-btns">
              <button class="mfib-add-text-btn"  id="mfib-add-text">+ Add Text</button>
              <button class="mfib-add-blank-btn" id="mfib-add-blank">+ Add Blank</button>
            </div>
            <!-- Inline edit panel (hidden initially) -->
            <div id="mfib-edit-panel" style="display:none"></div>
            <div class="mcf-error" id="mfib-error"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="mcf-collapsible" id="mfib-svg-section">
            <div class="mcf-collapsible-header" id="mfib-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <textarea class="mcf-textarea" id="mfib-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="mcf-svg-preview" id="mfib-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="mcf-remove-btn" id="mfib-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="mcf-collapsible" id="mfib-img-section">
            <div class="mcf-collapsible-header" id="mfib-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <input class="mcf-input" id="mfib-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="mfib-img-preview">
                ${q.img_url ? `<img src="${this._esc(q.img_url)}" alt="preview" />` : ''}
              </div>
              <button class="mcf-remove-btn" id="mfib-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Case sensitive -->
          <div class="mcf-field">
            <label class="mfib-checkbox-row">
              <input type="checkbox" id="mfib-case-sensitive"
                ${q.case_sensitive ? 'checked' : ''} />
              Case sensitive matching
            </label>
          </div>

          <!-- Scoring method -->
          <div class="mcf-field">
            <label class="mcf-label">Scoring Method</label>
            <select class="mcf-select" id="mfib-scoring-method">
              <option value="exact"   ${(q.scoring_method||'exact')==='exact'   ? 'selected':''}>Exact — all blanks must be correct</option>
              <option value="partial" ${(q.scoring_method||'')==='partial' ? 'selected':''}>Partial — credit per correct blank</option>
            </select>
          </div>

          <!-- Feedback — collapsible -->
          <div class="mcf-collapsible" id="mfib-feedback-section">
            <div class="mcf-collapsible-header" id="mfib-feedback-toggle">
              ▶ Feedback Messages
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <div class="mcf-field">
                <label class="mcf-label">Full Credit</label>
                <input class="mcf-input" id="mfib-feedback-full" type="text"
                  placeholder="e.g. All blanks filled correctly"
                  value="${this._esc(q.feedback?.full_credit || '')}"
                />
              </div>
              <div class="mcf-field">
                <label class="mcf-label">Partial Credit</label>
                <input class="mcf-input" id="mfib-feedback-partial" type="text"
                  placeholder="e.g. Some blanks correct"
                  value="${this._esc(q.feedback?.partial_credit || '')}"
                />
              </div>
              <div class="mcf-field">
                <label class="mcf-label">No Credit</label>
                <input class="mcf-input" id="mfib-feedback-none" type="text"
                  placeholder="e.g. No correct answers"
                  value="${this._esc(q.feedback?.none || '')}"
                />
              </div>
            </div>
          </div>

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="mfib-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="mfib-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="mfib-difficulty">
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
              <input class="mcf-input" id="mfib-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">
                Time Limit (sec) <span class="mcf-optional">(optional)</span>
              </label>
              <input class="mcf-input" id="mfib-time-limit" type="number"
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
            <input class="mcf-input" id="mfib-tags" type="text"
              placeholder="e.g. science, physics"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="mfib-btn-save">Save</button>
          <span class="mcf-save-hint">
            Blank positions auto-assigned in order
          </span>
        </div>

      </div>
    `;
  }

  // ── Render segment pills ─────────────────────────────

  _renderSegmentPills() {
    if (!this._segments.length) {
      return '<span class="mfib-builder-empty">Add text and blanks to build your question</span>';
    }
    let blankNum = 0;
    return this._segments.map((seg, i) => {
      if (seg.type === 'blank') {
        blankNum++;
        return `
          <span class="mfib-segment mfib-segment-blank ${this._activeSegment === i ? 'active' : ''}"
                data-seg-index="${i}">
            <span class="mfib-seg-num">${blankNum}</span>
            ____
          </span>`;
      } else {
        const display = seg.value.length > 30
          ? seg.value.slice(0, 30) + '…'
          : (seg.value || '(empty text)');
        return `
          <span class="mfib-segment mfib-segment-text ${this._activeSegment === i ? 'active' : ''}"
                data-seg-index="${i}">
            <span class="mfib-seg-val">${this._esc(display)}</span>
          </span>`;
      }
    }).join('');
  }

  // ── Render inline edit panel ─────────────────────────

  _renderEditPanel(segIndex) {
    const seg = this._segments[segIndex];
    if (!seg) return '';

    if (seg.type === 'text') {
      return `
        <div class="mfib-edit-panel">
          <div class="mfib-edit-title">Edit Text</div>
          <div class="mfib-edit-field">
            <label class="mfib-edit-label">Text content (HTML/MathML supported)</label>
            <textarea class="mfib-edit-input" id="mfib-seg-text-val"
              rows="2"
              placeholder="Enter text (HTML/MathML supported)..."
              style="resize:vertical;min-height:52px;font-family:var(--font-mono);font-size:12px"
            >${this._esc(seg.value)}</textarea>
          </div>
          <div class="mfib-edit-actions">
            <button class="mfib-edit-save"   id="mfib-seg-save">Save</button>
            <button class="mfib-edit-delete" id="mfib-seg-delete">Delete</button>
            <button class="mfib-edit-cancel" id="mfib-seg-cancel">Cancel</button>
          </div>
        </div>`;
    } else {
      const blankNum = this._segments
        .slice(0, segIndex + 1)
        .filter(s => s.type === 'blank').length;
      return `
        <div class="mfib-edit-panel">
          <div class="mfib-edit-title">Edit Blank #${blankNum}</div>
          <div class="mfib-edit-field">
            <label class="mfib-edit-label">Correct Answer</label>
            <input class="mfib-edit-input" id="mfib-seg-correct"
              type="text"
              placeholder="e.g. 3"
              value="${this._esc(seg.correct_answer || '')}"
            />
          </div>
          <div class="mfib-edit-field">
            <label class="mfib-edit-label">
              Acceptable Answers
              <span style="font-weight:400;text-transform:none">(comma separated)</span>
            </label>
            <input class="mfib-edit-input" id="mfib-seg-acceptable"
              type="text"
              placeholder="e.g. three, 3"
              value="${Array.isArray(seg.acceptable_answers)
                ? seg.acceptable_answers.join(', ')
                : ''}"
            />
          </div>
          <div class="mfib-edit-field">
            <label class="mfib-edit-label">
              Hint <span style="font-weight:400;text-transform:none">(optional)</span>
            </label>
            <input class="mfib-edit-input" id="mfib-seg-hint"
              type="text"
              placeholder="Hint shown to student..."
              value="${this._esc(seg.hint || '')}"
            />
          </div>
          <div class="mfib-edit-actions">
            <button class="mfib-edit-save"   id="mfib-seg-save">Save</button>
            <button class="mfib-edit-delete" id="mfib-seg-delete">Delete</button>
            <button class="mfib-edit-cancel" id="mfib-seg-cancel">Cancel</button>
          </div>
        </div>`;
    }
  }

  // ── Refresh builder (pills + summary) without full re-render ──

  _refreshBuilder() {
    const builder = this.querySelector('#mfib-builder');
    if (builder) builder.innerHTML = this._renderSegmentPills();

    const blankCount = this._segments.filter(s => s.type === 'blank').length;
    const summary    = this.querySelector('#mfib-blanks-summary');
    if (summary) {
      summary.textContent = blankCount === 0
        ? 'No blanks added yet — click + Add Blank'
        : `${blankCount} blank${blankCount > 1 ? 's' : ''} defined`;
      summary.className = 'mfib-blanks-summary' + (blankCount > 0 ? ' has-blanks' : '');
    }

    // Update assembled preview
    this._updateAssembledPreview();

    // Re-bind pill click events
    this._bindPillEvents();
  }

  // ── Assembled question preview ───────────────────────

  _updateAssembledPreview() {
    const preview = this.querySelector('#mfib-assembled-preview');
    if (!preview) return;
    if (!this._segments.length) {
      preview.innerHTML = '';
      return;
    }
    let blankNum = 0;
    const html = this._segments.map(seg => {
      if (seg.type === 'text') return seg.value;
      blankNum++;
      return `<span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--accent);
                           color:var(--accent);font-size:11px;text-align:center;
                           margin:0 2px;padding:0 4px">_${blankNum}_</span>`;
    }).join('');
    preview.innerHTML = html || '';
  }

  // ── Show/hide inline edit panel ──────────────────────

  _showEditPanel(segIndex) {
    this._activeSegment = segIndex;
    const panel = this.querySelector('#mfib-edit-panel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = this._renderEditPanel(segIndex);
    this._refreshBuilder();
    this._bindEditPanelEvents(segIndex);

    // Focus first input
    panel.querySelector('.mfib-edit-input')?.focus();
  }

  _hideEditPanel() {
    this._activeSegment = -1;
    const panel = this.querySelector('#mfib-edit-panel');
    if (panel) panel.style.display = 'none';
    this._refreshBuilder();
  }

  // ── Bind all events ──────────────────────────────────

  _bindEvents() {
    this._bindFocusPreview('mfib-explanation', 'mfib-explanation-preview');
    // Show assembled preview on load
    this._updateAssembledPreview();

    // SVG collapsible
    this.querySelector('#mfib-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#mfib-svg-section').classList.toggle('open');
    });
    this.querySelector('#mfib-svg')?.addEventListener('input', (e) => {
      this.querySelector('#mfib-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#mfib-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#mfib-svg').value = '';
      this.querySelector('#mfib-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#mfib-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#mfib-img-section').classList.toggle('open');
    });
    this.querySelector('#mfib-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#mfib-img-remove')?.addEventListener('click', () => {
      this.querySelector('#mfib-img-url').value = '';
      this._updateImgPreview('');
    });

    // Feedback collapsible
    this.querySelector('#mfib-feedback-toggle')?.addEventListener('click', () => {
      this.querySelector('#mfib-feedback-section').classList.toggle('open');
    });

    // Add Text
    this.querySelector('#mfib-add-text')?.addEventListener('click', () => {
      this._segments.push({ type: 'text', value: '' });
      const newIndex = this._segments.length - 1;
      this._refreshBuilder();
      this._showEditPanel(newIndex);
    });

    // Add Blank
    this.querySelector('#mfib-add-blank')?.addEventListener('click', () => {
      this._segments.push({
        type: 'blank', correct_answer: '', acceptable_answers: [], hint: ''
      });
      const newIndex = this._segments.length - 1;
      this._refreshBuilder();
      this._showEditPanel(newIndex);
    });

    // Segment pill clicks
    this._bindPillEvents();

    // Skip / Unskip
    this.querySelector('#mfib-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#mfib-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'multi_fill_in_blank';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#mfib-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Pill click events ────────────────────────────────

  _bindPillEvents() {
    this.querySelectorAll('.mfib-segment').forEach(pill => {
      pill.addEventListener('click', () => {
        const i = parseInt(pill.dataset.segIndex);
        if (this._activeSegment === i) {
          this._hideEditPanel();
        } else {
          this._showEditPanel(i);
        }
      });
    });
  }

  // ── Edit panel events ────────────────────────────────

  _bindEditPanelEvents(segIndex) {
    const seg = this._segments[segIndex];

    // Save segment edit
    this.querySelector('#mfib-seg-save')?.addEventListener('click', () => {
      if (seg.type === 'text') {
        seg.value = this.querySelector('#mfib-seg-text-val')?.value.trim() || '';
      } else {
        seg.correct_answer     = this.querySelector('#mfib-seg-correct')?.value.trim() || '';
        seg.acceptable_answers = (this.querySelector('#mfib-seg-acceptable')?.value || '')
          .split(',').map(s => s.trim()).filter(s => s.length > 0);
        seg.hint               = this.querySelector('#mfib-seg-hint')?.value.trim() || '';
      }
      this._hideEditPanel();
    });

    // Delete segment
    this.querySelector('#mfib-seg-delete')?.addEventListener('click', () => {
      this._segments.splice(segIndex, 1);
      this._hideEditPanel();
    });

    // Cancel
    this.querySelector('#mfib-seg-cancel')?.addEventListener('click', () => {
      // If brand new empty segment was added and immediately cancelled, remove it
      const seg = this._segments[segIndex];
      if (seg && seg.type === 'text' && seg.value === '') {
        this._segments.splice(segIndex, 1);
      } else if (seg && seg.type === 'blank' && seg.correct_answer === '') {
        this._segments.splice(segIndex, 1);
      }
      this._hideEditPanel();
    });
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl = this.querySelector('#mfib-error');
    errEl.classList.remove('visible');

    if (!this._segments.length) {
      errEl.textContent = 'Add at least one text segment or blank.';
      errEl.classList.add('visible');
      return;
    }

    const blankCount = this._segments.filter(s => s.type === 'blank').length;
    if (blankCount === 0) {
      errEl.textContent = 'Add at least one blank (____).';
      errEl.classList.add('visible');
      return;
    }

    // Build question string — text segments as-is, blanks as ____
    const questionText = this._segments
      .map(s => s.type === 'text' ? s.value : '____')
      .join('');

    // Build blanks array with position
    let pos = 0;
    const blanks = this._segments
      .filter(s => s.type === 'blank')
      .map(s => ({
        position:           ++pos,
        correct_answer:     s.correct_answer,
        acceptable_answers: s.acceptable_answers,
        hint:               s.hint,
      }));

    const saved = {
      type:            this._question?.type || 'multi_fill_in_blank',
      question:        questionText,
      svg_content:     this.querySelector('#mfib-svg')?.value.trim()        || '',
      img_url:         this.querySelector('#mfib-img-url')?.value.trim()     || '',
      blanks:          blanks,
      user_response:   Array(blankCount).fill(''),
      case_sensitive:  this.querySelector('#mfib-case-sensitive')?.checked   || false,
      scoring_method:  this.querySelector('#mfib-scoring-method')?.value     || 'exact',
      feedback: {
        full_credit:    this.querySelector('#mfib-feedback-full')?.value.trim()    || '',
        partial_credit: this.querySelector('#mfib-feedback-partial')?.value.trim() || '',
        none:           this.querySelector('#mfib-feedback-none')?.value.trim()    || '',
      },
      explanation:     this.querySelector('#mfib-explanation')?.value.trim() || '',
      difficulty:      this.querySelector('#mfib-difficulty')?.value         || 'easy',
      points:          this._parseOptionalNumber('#mfib-points'),
      time_limit:      this._parseOptionalNumber('#mfib-time-limit'),
      tags:            this._parseTags(),
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
    const preview = this.querySelector('#mfib-img-preview');
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
    const raw = this.querySelector('#mfib-tags')?.value || '';
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

customElements.define('multi-fill-in-blank-form', MultiFillInBlankFormComponent);