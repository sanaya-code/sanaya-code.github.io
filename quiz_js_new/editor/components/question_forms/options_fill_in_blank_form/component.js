// editor/components/question_forms/options_fill_in_blank_form/component.js

class OptionsFillInBlankFormComponent extends HTMLElement {

  connectedCallback() {
    this._question      = null;
    this._index         = -1;
    this._options       = [];   // [{segments:[], hint:''}]
    this._activeOption  = -1;   // which option card is expanded
    this._activeSeg     = -1;   // which segment is being edited
    this._render();
    this._bindEvents();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._options  = this._parseOptions(question);
    this._activeOption = -1;
    this._activeSeg    = -1;
    this._render();
    this._bindEvents();
  }

  // ── Parse options into segment arrays ───────────────

  _parseOptions(q) {
    const opts = Array.isArray(q.options) ? q.options : [];
    return opts.map(opt => {
      const text   = opt.text || '';
      const ca     = Array.isArray(opt.correct_answer)     ? opt.correct_answer     : [];
      const aa     = Array.isArray(opt.acceptable_answers) ? opt.acceptable_answers : [];
      const parts  = text.split('____');
      const segs   = [];
      parts.forEach((part, i) => {
        if (part) segs.push({ type: 'text', value: part });
        if (i < parts.length - 1) {
          segs.push({
            type:               'blank',
            correct_answer:     ca[i]                  || '',
            acceptable_answers: Array.isArray(aa[i]) ? aa[i] : [],
          });
        }
      });
      return { segments: segs, hint: opt.hint || '' };
    });
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q        = this._question || EditorFormRegistry.getDefault('options_fill_in_blank');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'options_fill_in_blank') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#8e44ad';
    const badgeLabel = typeConf ? typeConf.label : 'Options Fill Blank';
    const choices    = Array.isArray(q.choices) ? q.choices : [];

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
              ? `<button class="btn-unskip" id="ofib-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="btn-skip" id="ofib-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="mcf-body ${isSkip ? 'is-skip' : ''}">

          <!-- Question text (instruction) -->
          <div class="mcf-field">
            <label class="mcf-label">Question Text</label>
            <textarea class="mcf-textarea" id="ofib-question"
              rows="2"
              placeholder="Enter overall instruction text..."
            >${this._esc(q.question || '')}</textarea>
            <div class="mcf-render-preview" id="ofib-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="mcf-collapsible" id="ofib-svg-section">
            <div class="mcf-collapsible-header" id="ofib-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <textarea class="mcf-textarea" id="ofib-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="mcf-svg-preview" id="ofib-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="mcf-remove-btn" id="ofib-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="mcf-collapsible" id="ofib-img-section">
            <div class="mcf-collapsible-header" id="ofib-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <input class="mcf-input" id="ofib-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="mcf-img-preview ${q.img_url ? 'visible' : ''}"
                   id="ofib-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="mcf-remove-btn" id="ofib-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Choices pool -->
          <div class="mcf-field">
            <div class="mcf-options-header">
              <label class="mcf-label">
                Choices
                <span class="mcf-optional">— pool shown to student</span>
              </label>
              <button class="mcf-add-option-btn" id="ofib-add-choice">
                + Add Choice
              </button>
            </div>
            <div class="ofib-choices-wrap" id="ofib-choices-wrap">
              ${choices.map((c, i) => this._choiceHTML(c, i)).join('')}
            </div>
          </div>

          <!-- Blank type -->
          <div class="mcf-field">
            <label class="mcf-label">Blank Type</label>
            <select class="mcf-select" id="ofib-blank-type">
              <option value="box"    ${(q.blank_type||'box')==='box'    ? 'selected':''}>Box</option>
              <option value="normal" ${(q.blank_type||'')==='normal' ? 'selected':''}>Normal</option>
            </select>
          </div>

          <!-- Options list -->
          <div class="mcf-field">
            <div class="mcf-options-header">
              <label class="mcf-label">Options</label>
              <button class="mcf-add-option-btn" id="ofib-add-option">
                + Add Option
              </button>
            </div>
            <div class="ofib-options-list" id="ofib-options-list">
              ${this._options.map((opt, i) => this._optionCardHTML(opt, i)).join('')}
            </div>
            <div class="mcf-error" id="ofib-error"></div>
          </div>

          <!-- Case sensitive -->
          <div class="mcf-field">
            <label class="mfib-checkbox-row">
              <input type="checkbox" id="ofib-case-sensitive"
                ${q.case_sensitive ? 'checked' : ''} />
              Case sensitive matching
            </label>
          </div>

          <!-- Scoring method -->
          <div class="mcf-field">
            <label class="mcf-label">Scoring Method</label>
            <select class="mcf-select" id="ofib-scoring-method">
              <option value="exact"   ${(q.scoring_method||'exact')==='exact'   ? 'selected':''}>Exact</option>
              <option value="partial" ${(q.scoring_method||'')==='partial' ? 'selected':''}>Partial</option>
            </select>
          </div>

          <!-- Feedback — collapsible -->
          <div class="mcf-collapsible" id="ofib-feedback-section">
            <div class="mcf-collapsible-header" id="ofib-feedback-toggle">
              ▶ Feedback Messages
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="mcf-collapsible-arrow">▼</span>
            </div>
            <div class="mcf-collapsible-body">
              <div class="mcf-field">
                <label class="mcf-label">Full Credit</label>
                <input class="mcf-input" id="ofib-feedback-full" type="text"
                  value="${this._esc(q.feedback?.full_credit || '')}"
                  placeholder="e.g. All answers correct"
                />
              </div>
              <div class="mcf-field">
                <label class="mcf-label">Partial Credit</label>
                <input class="mcf-input" id="ofib-feedback-partial" type="text"
                  value="${this._esc(q.feedback?.partial_credit || '')}"
                  placeholder="e.g. Some answers correct"
                />
              </div>
              <div class="mcf-field">
                <label class="mcf-label">No Credit</label>
                <input class="mcf-input" id="ofib-feedback-none" type="text"
                  value="${this._esc(q.feedback?.none || '')}"
                  placeholder="e.g. No correct answers"
                />
              </div>
            </div>
          </div>

          <!-- Explanation -->
          <div class="mcf-field">
            <label class="mcf-label">
              Explanation <span class="mcf-optional">(optional)</span>
            </label>
            <textarea class="mcf-textarea" id="ofib-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="mcf-render-preview" id="ofib-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="mcf-field">
            <label class="mcf-label">Difficulty</label>
            <select class="mcf-select" id="ofib-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="mcf-row-2">
            <div class="mcf-field">
              <label class="mcf-label">Points <span class="mcf-optional">(optional)</span></label>
              <input class="mcf-input" id="ofib-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="mcf-field">
              <label class="mcf-label">Time Limit (sec) <span class="mcf-optional">(optional)</span></label>
              <input class="mcf-input" id="ofib-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="mcf-field">
            <label class="mcf-label">Tags <span class="mcf-optional">(comma separated)</span></label>
            <input class="mcf-input" id="ofib-tags" type="text"
              placeholder="e.g. science, maths"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.mcf-body -->

        <!-- Footer -->
        <div class="mcf-footer">
          <button class="btn-save" id="ofib-btn-save">Save</button>
          <span class="mcf-save-hint">IDs auto-assigned on save</span>
        </div>

      </div>
    `;
  }

  // ── Choice HTML ──────────────────────────────────────

  _choiceHTML(val, index) {
    return `
      <div class="ofib-choice-row" data-choice-index="${index}">
        <input type="text" class="ofib-choice-input"
               value="${this._esc(val)}"
               data-choice-index="${index}"
               placeholder="val"
        />
        <button class="ofib-choice-delete" title="Remove">✕</button>
      </div>`;
  }

  // ── Option card HTML ─────────────────────────────────

  _optionCardHTML(opt, optIndex) {
    const preview = opt.segments.map(s =>
      s.type === 'text' ? this._esc(s.value) : '<strong>____</strong>'
    ).join('') || '<em style="color:var(--text-muted)">Empty option</em>';

    const isActive = this._activeOption === optIndex;

    return `
      <div class="ofib-option-card ${isActive ? 'active' : ''}"
           data-opt-index="${optIndex}">
        <div class="ofib-option-header">
          <span class="ofib-option-num">${optIndex + 1}</span>
          <span class="ofib-option-preview-text">${preview}</span>
          <button class="ofib-option-delete"
                  data-opt-index="${optIndex}"
                  title="Delete option">✕</button>
        </div>
        ${isActive ? this._optionBodyHTML(opt, optIndex) : ''}
      </div>`;
  }

  // ── Option body (segment builder) ────────────────────

  _optionBodyHTML(opt, optIndex) {
    let blankNum = 0;
    const pills = opt.segments.length
      ? opt.segments.map((seg, i) => {
          if (seg.type === 'blank') blankNum++;
          const isActiveSeg = this._activeOption === optIndex && this._activeSeg === i;
          if (seg.type === 'text') {
            const display = seg.value.length > 25
              ? seg.value.slice(0, 25) + '…' : (seg.value || '(empty)');
            return `<span class="ofib-segment ofib-segment-text ${isActiveSeg ? 'active' : ''}"
                         data-seg="${i}">${this._esc(display)}</span>`;
          } else {
            return `<span class="ofib-segment ofib-segment-blank ${isActiveSeg ? 'active' : ''}"
                         data-seg="${i}">
                      <span class="ofib-seg-num">${blankNum}</span>____
                    </span>`;
          }
        }).join('')
      : '<span class="ofib-builder-empty">Add text and blanks</span>';

    const editPanelHTML = this._activeSeg >= 0 && this._activeOption === optIndex
      ? this._segEditPanelHTML(opt.segments[this._activeSeg], this._activeSeg, optIndex)
      : '';

    return `
      <div class="ofib-option-body">
        <div class="ofib-builder" data-opt="${optIndex}">${pills}</div>
        <div class="ofib-seg-btns">
          <button class="ofib-seg-add-text"
                  data-opt="${optIndex}">+ Text</button>
          <button class="ofib-seg-add-blank"
                  data-opt="${optIndex}">+ Blank</button>
        </div>
        <!-- Assembled sentence preview -->
        <div class="mcf-render-preview" style="display:block;font-size:13px"
             id="ofib-assembled-${optIndex}">
          ${this._assembledPreview(opt)}
        </div>
        ${editPanelHTML ? `<div class="ofib-edit-panel-wrap">${editPanelHTML}</div>` : ''}
        <div class="mcf-field">
          <label class="ofib-edit-label">Hint <span style="font-weight:400">(optional)</span></label>
          <input class="ofib-edit-input ofib-hint-input" type="text"
                 data-opt="${optIndex}"
                 placeholder="Hint for this option..."
                 value="${this._esc(opt.hint || '')}"
          />
        </div>
      </div>`;
  }

  // ── Segment edit panel HTML ──────────────────────────

  _segEditPanelHTML(seg, segIndex, optIndex) {
    if (!seg) return '';
    const blankNum = this._options[optIndex].segments
      .slice(0, segIndex + 1)
      .filter(s => s.type === 'blank').length;

    if (seg.type === 'text') {
      return `
        <div class="ofib-edit-panel">
          <div class="ofib-edit-title">Edit Text</div>
          <label class="ofib-edit-label">Text content (HTML/MathML supported)</label>
          <textarea class="ofib-edit-input" id="ofib-seg-val-${optIndex}"
                 rows="2" placeholder="Enter text (HTML/MathML supported)..."
                 style="resize:vertical;min-height:48px;font-family:var(--font-mono);font-size:12px"
          >${this._esc(seg.value)}</textarea>
          <div class="ofib-edit-actions">
            <button class="ofib-edit-save"
                    data-opt="${optIndex}" data-seg="${segIndex}">Save</button>
            <button class="ofib-edit-delete"
                    data-opt="${optIndex}" data-seg="${segIndex}">Delete</button>
            <button class="ofib-edit-cancel"
                    data-opt="${optIndex}">Cancel</button>
          </div>
        </div>`;
    } else {
      return `
        <div class="ofib-edit-panel">
          <div class="ofib-edit-title">Edit Blank #${blankNum}</div>
          <label class="ofib-edit-label">Correct Answer</label>
          <input class="ofib-edit-input" id="ofib-seg-correct-${optIndex}"
                 type="text" placeholder="e.g. 3"
                 value="${this._esc(seg.correct_answer || '')}" />
          <label class="ofib-edit-label" style="margin-top:4px">
            Acceptable Answers <span style="font-weight:400">(comma separated)</span>
          </label>
          <input class="ofib-edit-input" id="ofib-seg-acceptable-${optIndex}"
                 type="text" placeholder="e.g. three, 3"
                 value="${Array.isArray(seg.acceptable_answers)
                   ? seg.acceptable_answers.join(', ') : ''}" />
          <div class="ofib-edit-actions">
            <button class="ofib-edit-save"
                    data-opt="${optIndex}" data-seg="${segIndex}">Save</button>
            <button class="ofib-edit-delete"
                    data-opt="${optIndex}" data-seg="${segIndex}">Delete</button>
            <button class="ofib-edit-cancel"
                    data-opt="${optIndex}">Cancel</button>
          </div>
        </div>`;
    }
  }

  // ── Refresh options list ─────────────────────────────

  _refreshOptions() {
    const list = this.querySelector('#ofib-options-list');
    if (list) {
      list.innerHTML = this._options
        .map((opt, i) => this._optionCardHTML(opt, i)).join('');
    }
    this._bindOptionEvents();
  }

  // ── Bind all events ──────────────────────────────────

  _bindEvents() {
    this._bindFocusPreview('ofib-question',    'ofib-question-preview');
    this._bindFocusPreview('ofib-explanation', 'ofib-explanation-preview');

    // SVG
    this.querySelector('#ofib-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ofib-svg-section').classList.toggle('open');
    });
    this.querySelector('#ofib-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ofib-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#ofib-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ofib-svg').value = '';
      this.querySelector('#ofib-svg-preview').innerHTML = '';
    });

    // Image
    this.querySelector('#ofib-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ofib-img-section').classList.toggle('open');
    });
    this.querySelector('#ofib-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#ofib-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ofib-img-url').value = '';
      this._updateImgPreview('');
    });

    // Feedback
    this.querySelector('#ofib-feedback-toggle')?.addEventListener('click', () => {
      this.querySelector('#ofib-feedback-section').classList.toggle('open');
    });

    // Choices
    this.querySelector('#ofib-add-choice')?.addEventListener('click', () => {
      const q   = this._question || {};
      if (!Array.isArray(q.choices)) q.choices = [];
      q.choices.push('');
      this._question = q;
      const wrap  = this.querySelector('#ofib-choices-wrap');
      const index = q.choices.length - 1;
      const div   = document.createElement('div');
      div.innerHTML = this._choiceHTML('', index);
      wrap.appendChild(div.firstElementChild);
      this._bindChoiceEvents();
      wrap.querySelector(`.ofib-choice-row:last-child .ofib-choice-input`)?.focus();
    });
    this._bindChoiceEvents();

    // Add option
    this.querySelector('#ofib-add-option')?.addEventListener('click', () => {
      this._options.push({ segments: [], hint: '' });
      this._activeOption = this._options.length - 1;
      this._activeSeg    = -1;
      this._refreshOptions();
    });

    this._bindOptionEvents();

    // Skip / Unskip
    this.querySelector('#ofib-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#ofib-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'options_fill_in_blank';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#ofib-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Choice events ────────────────────────────────────

  _bindChoiceEvents() {
    const wrap = this.querySelector('#ofib-choices-wrap');
    if (!wrap) return;

    wrap.querySelectorAll('.ofib-choice-delete').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.ofib-choice-row');
        row.remove();
        this._reindexChoices();
      });
    });
  }

  _reindexChoices() {
    this.querySelectorAll('.ofib-choice-row').forEach((row, i) => {
      row.dataset.choiceIndex = i;
      const inp = row.querySelector('.ofib-choice-input');
      if (inp) inp.dataset.choiceIndex = i;
    });
  }

  // ── Option card events ───────────────────────────────

  _bindOptionEvents() {
    const list = this.querySelector('#ofib-options-list');
    if (!list) return;

    // Option card header click — expand/collapse
    list.querySelectorAll('.ofib-option-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.classList.contains('ofib-option-delete')) return;
        const card     = header.closest('.ofib-option-card');
        const optIndex = parseInt(card.dataset.optIndex);
        if (this._activeOption === optIndex) {
          this._activeOption = -1;
          this._activeSeg    = -1;
        } else {
          this._activeOption = optIndex;
          this._activeSeg    = -1;
        }
        this._refreshOptions();
      });
    });

    // Option delete
    list.querySelectorAll('.ofib-option-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const optIndex = parseInt(btn.dataset.optIndex);
        this._options.splice(optIndex, 1);
        if (this._activeOption >= this._options.length) {
          this._activeOption = -1;
          this._activeSeg    = -1;
        }
        this._refreshOptions();
      });
    });

    // Hint input
    list.querySelectorAll('.ofib-hint-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const optIndex = parseInt(input.dataset.opt);
        if (this._options[optIndex]) {
          this._options[optIndex].hint = input.value;
        }
      });
    });

    // Segment pills click
    list.querySelectorAll('.ofib-segment').forEach(pill => {
      pill.addEventListener('click', () => {
        const optIndex = parseInt(pill.closest('[data-opt-index]')?.dataset.optIndex);
        const segIndex = parseInt(pill.dataset.seg);
        if (this._activeSeg === segIndex && this._activeOption === optIndex) {
          this._activeSeg = -1;
        } else {
          this._activeOption = optIndex;
          this._activeSeg    = segIndex;
        }
        this._refreshOptions();
      });
    });

    // Add text segment
    list.querySelectorAll('.ofib-seg-add-text').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        this._options[optIndex].segments.push({ type: 'text', value: '' });
        this._activeOption = optIndex;
        this._activeSeg    = this._options[optIndex].segments.length - 1;
        this._refreshOptions();
        // Focus the new input
        const id = `ofib-seg-val-${optIndex}`;
        setTimeout(() => this.querySelector(`#${id}`)?.focus(), 50);
      });
    });

    // Add blank segment
    list.querySelectorAll('.ofib-seg-add-blank').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        this._options[optIndex].segments.push({
          type: 'blank', correct_answer: '', acceptable_answers: []
        });
        this._activeOption = optIndex;
        this._activeSeg    = this._options[optIndex].segments.length - 1;
        this._refreshOptions();
        const id = `ofib-seg-correct-${optIndex}`;
        setTimeout(() => this.querySelector(`#${id}`)?.focus(), 50);
      });
    });

    // Edit panel: Save / Delete / Cancel
    list.querySelectorAll('.ofib-edit-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        const segIndex = parseInt(btn.dataset.seg);
        const seg      = this._options[optIndex].segments[segIndex];
        if (seg.type === 'text') {
          seg.value = this.querySelector(`#ofib-seg-val-${optIndex}`)?.value || '';
        } else {
          seg.correct_answer = this.querySelector(`#ofib-seg-correct-${optIndex}`)
            ?.value.trim() || '';
          seg.acceptable_answers = (this.querySelector(`#ofib-seg-acceptable-${optIndex}`)
            ?.value || '')
            .split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
        this._activeSeg = -1;
        this._refreshOptions();
      });
    });

    list.querySelectorAll('.ofib-edit-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        const segIndex = parseInt(btn.dataset.seg);
        this._options[optIndex].segments.splice(segIndex, 1);
        this._activeSeg = -1;
        this._refreshOptions();
      });
    });

    list.querySelectorAll('.ofib-edit-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIndex = parseInt(btn.dataset.opt);
        // Remove empty new segment if cancelled
        const segs = this._options[optIndex].segments;
        const seg  = segs[this._activeSeg];
        if (seg && seg.type === 'text'  && seg.value === '') segs.splice(this._activeSeg, 1);
        if (seg && seg.type === 'blank' && seg.correct_answer === '') segs.splice(this._activeSeg, 1);
        this._activeSeg = -1;
        this._refreshOptions();
      });
    });
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl = this.querySelector('#ofib-error');
    errEl.classList.remove('visible');

    if (!this._options.length) {
      errEl.textContent = 'Add at least one option.';
      errEl.classList.add('visible');
      return;
    }

    // Collect choices from DOM
    const choices = Array.from(this.querySelectorAll('.ofib-choice-input'))
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);

    // Build options array
    const options = this._options.map((opt, i) => {
      const text           = opt.segments.map(s => s.type === 'text' ? s.value : '____').join('');
      const blanks         = opt.segments.filter(s => s.type === 'blank');
      const correctAnswer  = blanks.map(s => s.correct_answer);
      const acceptAnswers  = blanks.map(s => s.acceptable_answers);
      return {
        id:                  String(i + 1).padStart(2, '0'),
        text,
        correct_answer:      correctAnswer,
        acceptable_answers:  acceptAnswers,
        hint:                opt.hint || '',
      };
    });

    // user_response: one inner array per option, one '' per blank
    const userResponse = options.map(opt => {
      const blankCount = (opt.text.match(/____/g) || []).length;
      return Array(blankCount).fill('');
    });

    const saved = {
      type:           this._question?.type || 'options_fill_in_blank',
      question:       this.querySelector('#ofib-question')?.value.trim() || '',
      svg_content:    this.querySelector('#ofib-svg')?.value.trim()          || '',
      img_url:        this.querySelector('#ofib-img-url')?.value.trim()       || '',
      blank_type:     this.querySelector('#ofib-blank-type')?.value           || 'box',
      options,
      user_response:  userResponse,
      choices,
      case_sensitive: this.querySelector('#ofib-case-sensitive')?.checked     || false,
      scoring_method: this.querySelector('#ofib-scoring-method')?.value       || 'exact',
      feedback: {
        full_credit:    this.querySelector('#ofib-feedback-full')?.value.trim()    || '',
        partial_credit: this.querySelector('#ofib-feedback-partial')?.value.trim() || '',
        none:           this.querySelector('#ofib-feedback-none')?.value.trim()    || '',
      },
      explanation:    this.querySelector('#ofib-explanation')?.value.trim()   || '',
      difficulty:     this.querySelector('#ofib-difficulty')?.value           || 'easy',
      points:         this._parseOptionalNumber('#ofib-points'),
      time_limit:     this._parseOptionalNumber('#ofib-time-limit'),
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
    const preview = this.querySelector('#ofib-img-preview');
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
    const raw = this.querySelector('#ofib-tags')?.value || '';
    return raw.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  // ── Assembled option sentence preview ───────────────

  _assembledPreview(opt) {
    if (!opt.segments.length) return '<em style="color:var(--text-muted)">Empty option</em>';
    let blankNum = 0;
    return opt.segments.map(seg => {
      if (seg.type === 'text') return seg.value;
      blankNum++;
      return `<span style="display:inline-block;min-width:36px;border-bottom:2px solid var(--accent);
                           color:var(--accent);font-size:11px;text-align:center;
                           margin:0 2px;padding:0 3px">_${blankNum}_</span>`;
    }).join('');
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

}

customElements.define('options-fill-in-blank-form', OptionsFillInBlankFormComponent);