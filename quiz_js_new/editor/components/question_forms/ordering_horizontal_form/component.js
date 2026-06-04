// editor/components/question_forms/ordering_horizontal_form/component.js

class OrderingHorizontalFormComponent extends HTMLElement {

  connectedCallback() {
    this._question     = null;
    this._index        = -1;
    this._itemDragSrc  = null;
    this._orderDragSrc = null;
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
    const q        = this._question || EditorFormRegistry.getDefault('ordering_horizontal');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'ordering_horizontal') : q.type
    );
    const badgeColor   = typeConf ? typeConf.color : '#c2185b';
    const badgeLabel   = typeConf ? typeConf.label : 'Ordering Horizontal';
    const items        = Array.isArray(q.items)         ? q.items         : [];
    const correctOrder = Array.isArray(q.correct_order) ? q.correct_order : [];
    const initialItems = Array.isArray(q.initial_items) ? q.initial_items : [];

    this.innerHTML = `
      <div class="ef-orh-form">

        <!-- Topbar -->
        <div class="ef-orh-topbar">
          ${isSkip
            ? `<span class="ef-orh-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="ef-orh-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="ef-orh-topbar-actions">
            ${isSkip
              ? `<button class="ef-orh-btn-unskip" id="ef-orh-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="ef-orh-btn-skip"   id="ef-orh-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="ef-orh-body ${isSkip ? 'ef-orh-is-skip' : ''}">

          <!-- Question text -->
          <div class="ef-orh-field">
            <label class="ef-orh-label">Question Text</label>
            <textarea class="ef-orh-textarea" id="ef-orh-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="ef-orh-render-preview" id="ef-orh-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="ef-orh-collapsible" id="ef-orh-svg-section">
            <div class="ef-orh-collapsible-header" id="ef-orh-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-orh-collapsible-arrow">▼</span>
            </div>
            <div class="ef-orh-collapsible-body">
              <textarea class="ef-orh-textarea" id="ef-orh-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="ef-orh-svg-preview" id="ef-orh-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="ef-orh-remove-btn" id="ef-orh-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="ef-orh-collapsible" id="ef-orh-img-section">
            <div class="ef-orh-collapsible-header" id="ef-orh-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-orh-collapsible-arrow">▼</span>
            </div>
            <div class="ef-orh-collapsible-body">
              <input class="ef-orh-input" id="ef-orh-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="ef-orh-img-preview ${q.img_url ? 'visible' : ''}"
                   id="orh-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="ef-orh-remove-btn" id="ef-orh-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Items list -->
          <div class="ef-orh-field">
            <div class="ef-orh-options-header">
              <label class="ef-orh-label">Items</label>
              <button class="ef-orh-add-option-btn" id="ef-orh-add-item">+ Add Item</button>
            </div>
            <div class="ef-orh-options-list" id="ef-orh-items-list">
              ${items.map((val, i) => this._itemRowHTML(val, i)).join('')}
            </div>
            <!-- Shared item preview -->
            <div class="ef-orh-option-preview-box" id="ef-orh-item-preview-box">
              <div class="ef-orh-option-preview-label" id="ef-orh-item-preview-label">
                Previewing item 1
              </div>
              <div class="ef-orh-option-preview-content"
                   id="ef-orh-item-preview-content"></div>
            </div>
            <div class="ef-orh-error" id="ef-orh-error"></div>
          </div>

          <!-- Correct Order — auto-populated from items, drag to reorder, checkbox to show -->
          <div class="ef-orh-field">
            <label class="ef-orh-label">
              Correct Order
              <span class="ef-orh-optional">— drag to set sequence · ☑ Show = pre-filled</span>
            </label>
            <div class="ef-orh-sync-hint">
              Populated automatically from Items above.
              Drag to set correct sequence. Check ☑ Show to pre-fill that slot.
            </div>
            <div class="ef-orh-correct-list-wrap" id="ef-orh-correct-list-wrap">
              ${this._renderCorrectList(items, correctOrder, initialItems)}
            </div>
          </div>

          <!-- Explanation -->
          <div class="ef-orh-field">
            <label class="ef-orh-label">
              Explanation <span class="ef-orh-optional">(optional)</span>
            </label>
            <textarea class="ef-orh-textarea" id="ef-orh-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="ef-orh-render-preview" id="ef-orh-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="ef-orh-field">
            <label class="ef-orh-label">Difficulty</label>
            <select class="ef-orh-select" id="ef-orh-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="ef-orh-row-2">
            <div class="ef-orh-field">
              <label class="ef-orh-label">
                Points <span class="ef-orh-optional">(optional)</span>
              </label>
              <input class="ef-orh-input" id="ef-orh-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="ef-orh-field">
              <label class="ef-orh-label">
                Time Limit (sec) <span class="ef-orh-optional">(optional)</span>
              </label>
              <input class="ef-orh-input" id="ef-orh-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="ef-orh-field">
            <label class="ef-orh-label">
              Tags <span class="ef-orh-optional">(comma separated)</span>
            </label>
            <input class="ef-orh-input" id="ef-orh-tags" type="text"
              placeholder="e.g. math, sequence"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.ef-orh-body -->

        <!-- Footer -->
        <div class="ef-orh-footer">
          <button class="ef-orh-btn-save" id="ef-orh-btn-save">Save</button>
          <span class="ef-orh-save-hint">
            initial_items derived from ☑ Show checkboxes on save
          </span>
        </div>

      </div>
    `;
  }

  // ── Item row HTML — same as ordering form ────────────

  _itemRowHTML(val, index) {
    return `
      <div class="ef-orh-option-row ef-orh-item-row"
           draggable="true" data-item-index="${index}">
        <span class="ef-orh-drag-handle">⠿</span>
        <input type="text"
               class="ef-orh-option-text ef-orh-item-text"
               placeholder="Item value"
               value="${this._esc(val)}"
               data-item-index="${index}"
        />
        <button class="ef-orh-option-delete ef-orh-item-delete"
                title="Delete item">✕</button>
      </div>
    `;
  }

  // ── Correct order row — ordering form + checkbox ─────

  _correctRowHTML(val, index, isShown) {
    return `
      <div class="ef-orh-correct-row ${isShown ? 'is-shown' : ''}"
           draggable="true"
           data-order-index="${index}"
           data-item-val="${this._esc(val)}">
        <span class="ef-orh-position-badge">${index + 1}</span>
        <span class="ef-orh-correct-text">${val}</span>
        <label class="ef-orh-show-label">
          <input type="checkbox" class="ef-orh-show-cb" ${isShown ? 'checked' : ''} />
          Show
        </label>
        <span class="ef-orh-correct-drag" style="margin-left:auto">⠿</span>
      </div>
    `;
  }

  // ── Render correct list from items + saved order ─────

  _renderCorrectList(items, correctOrder, initialItems) {
    if (!items.length) return '';

    // Build val→isShown map from saved data
    const shownMap = {};
    correctOrder.forEach((val, i) => {
      shownMap[val] = initialItems[i] !== '' && initialItems[i] !== undefined;
    });

    // Use saved correct order if it matches items, else default to items order
    const validOrder = correctOrder.filter(v => items.includes(v));
    const newItems   = items.filter(v => !validOrder.includes(v));
    const order      = validOrder.length === items.length
      ? validOrder
      : [...validOrder, ...newItems];

    return order.map((val, i) =>
      this._correctRowHTML(val, i, shownMap[val] || false)
    ).join('');
  }

  // ── Sync correct list when items change ─────────────

  _syncCorrectList() {
    const items = this._getItemsFromDOM();

    // Read current correct order + show state from DOM
    const currentRows = Array.from(
      this.querySelectorAll('#ef-orh-correct-list-wrap .ef-orh-correct-row')
    );
    const shownMap = {};
    currentRows.forEach(row => {
      shownMap[row.dataset.itemVal] =
        row.querySelector('.ef-orh-show-cb')?.checked || false;
    });
    const existingVals = currentRows
      .map(r => r.dataset.itemVal)
      .filter(v => items.includes(v));
    const newVals = items.filter(v => !existingVals.includes(v));
    const order   = [...existingVals, ...newVals];

    const list = this.querySelector('#ef-orh-correct-list-wrap');
    if (!list) return;

    list.innerHTML = order.map((val, i) =>
      this._correctRowHTML(val, i, shownMap[val] || false)
    ).join('');

    this._bindCorrectListDrag();
  }

  // ── Get item values from DOM ─────────────────────────

  _getItemsFromDOM() {
    return Array.from(this.querySelectorAll('.ef-orh-item-text'))
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);
  }

  // ── Update correct list text when item text changes ──

  _updateCorrectListText() {
    const inputs = Array.from(this.querySelectorAll('.ef-orh-item-text'));
    inputs.forEach(inp => {
      const val = inp.value.trim();
      // Find and update correct row with matching old val — re-sync instead
    });
    // Simplest: full sync preserves order and show state
    this._syncCorrectList();
  }

  // ── Bind all events ──────────────────────────────────

  _bindEvents() {
    this._bindFocusPreview('ef-orh-question',    'ef-orh-question-preview');
    this._bindFocusPreview('ef-orh-explanation', 'ef-orh-explanation-preview');

    // SVG collapsible
    this.querySelector('#ef-orh-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-orh-svg-section').classList.toggle('open');
    });
    this.querySelector('#ef-orh-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ef-orh-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#ef-orh-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-orh-svg').value = '';
      this.querySelector('#ef-orh-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#ef-orh-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-orh-img-section').classList.toggle('open');
    });
    this.querySelector('#ef-orh-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#ef-orh-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-orh-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add item
    this.querySelector('#ef-orh-add-item')?.addEventListener('click', () => {
      this._addItemRow();
    });

    // Items list events
    const itemsList = this.querySelector('#ef-orh-items-list');
    if (itemsList) this._bindItemListEvents(itemsList);

    // Correct list drag
    this._bindCorrectListDrag();

    // Checkbox — toggle is-shown on correct row
    this.querySelector('#ef-orh-correct-list-wrap')?.addEventListener('change', (e) => {
      if (!e.target.classList.contains('ef-orh-show-cb')) return;
      const row = e.target.closest('.ef-orh-correct-row');
      row.classList.toggle('is-shown', e.target.checked);
    });

    // Skip / Unskip
    this.querySelector('#ef-orh-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#ef-orh-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'ordering_horizontal';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#ef-orh-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Items list events — same as ordering form ────────

  _bindItemListEvents(list) {
    // Focus → shared preview
    list.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ef-orh-item-text')) return;
      const row   = e.target.closest('.ef-orh-item-row');
      const index = parseInt(row.dataset.itemIndex);
      list.querySelectorAll('.ef-orh-item-row')
        .forEach(r => r.classList.remove('ef-orh-focused-row'));
      row.classList.add('ef-orh-focused-row');
      const box     = this.querySelector('#ef-orh-item-preview-box');
      const label   = this.querySelector('#ef-orh-item-preview-label');
      const content = this.querySelector('#ef-orh-item-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing item ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    // Live preview + sync correct list on text change
    list.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ef-orh-item-text')) return;
      const row     = e.target.closest('.ef-orh-item-row');
      const index   = parseInt(row.dataset.itemIndex);
      const content = this.querySelector('#ef-orh-item-preview-content');
      const label   = this.querySelector('#ef-orh-item-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing item ${index + 1}`;
      }
      this._syncCorrectList();
    });

    // Delete
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-orh-item-delete')) return;
      e.target.closest('.ef-orh-item-row').remove();
      this._reindexItems();
      this._syncCorrectList();
      const remaining = list.querySelectorAll('.ef-orh-item-row').length;
      if (remaining === 0) {
        this.querySelector('#ef-orh-item-preview-box')?.classList.remove('visible');
      }
    });

    // Drag reorder
    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-orh-item-row');
      if (!row) return;
      this._itemDragSrc = parseInt(row.dataset.itemIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.ef-orh-item-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-orh-item-row');
      if (row && parseInt(row.dataset.itemIndex) !== this._itemDragSrc) {
        list.querySelectorAll('.ef-orh-item-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-orh-item-row');
      if (!target) return;
      const to   = parseInt(target.dataset.itemIndex);
      const from = this._itemDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      this._reorderItemRows(from, to);
      this._syncCorrectList();
    });
  }

  // ── Correct list drag — same as ordering form ────────

  _bindCorrectListDrag() {
    const list = this.querySelector('#ef-orh-correct-list-wrap');
    if (!list) return;

    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-orh-correct-row');
      if (!row) return;
      this._orderDragSrc = parseInt(row.dataset.orderIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.ef-orh-correct-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-orh-correct-row');
      if (row && parseInt(row.dataset.orderIndex) !== this._orderDragSrc) {
        list.querySelectorAll('.ef-orh-correct-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-orh-correct-row');
      if (!target) return;
      const to   = parseInt(target.dataset.orderIndex);
      const from = this._orderDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      this._reorderCorrectRows(from, to);
    });
  }

  // ── Reorder correct rows ─────────────────────────────

  _reorderCorrectRows(from, to) {
    const list = this.querySelector('#ef-orh-correct-list-wrap');
    const rows = Array.from(list.querySelectorAll('.ef-orh-correct-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach((row, i) => {
      row.dataset.orderIndex = i;
      row.querySelector('.ef-orh-position-badge').textContent = i + 1;
      list.appendChild(row);
    });
  }

  // ── Add item row ─────────────────────────────────────

  _addItemRow() {
    const list  = this.querySelector('#ef-orh-items-list');
    const count = list.querySelectorAll('.ef-orh-item-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._itemRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexItems();
    this._syncCorrectList();
    list.querySelector('.ef-orh-item-row:last-child .ef-orh-item-text')?.focus();
  }

  // ── Reindex item rows ────────────────────────────────

  _reindexItems() {
    this.querySelectorAll('.ef-orh-item-row').forEach((row, i) => {
      row.dataset.itemIndex = i;
      const inp = row.querySelector('.ef-orh-item-text');
      if (inp) inp.dataset.itemIndex = i;
    });
  }

  // ── Reorder item rows ────────────────────────────────

  _reorderItemRows(from, to) {
    const list = this.querySelector('#ef-orh-items-list');
    const rows = Array.from(list.querySelectorAll('.ef-orh-item-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexItems();
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl       = this.querySelector('#ef-orh-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#ef-orh-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#ef-orh-question')?.focus();
      return;
    }

    const itemTexts = this._getItemsFromDOM();
    if (itemTexts.length < 2) {
      errEl.textContent = 'At least 2 items are required.';
      errEl.classList.add('visible');
      return;
    }

    // Collect correct order + derive initial_items from checkboxes
    const correctOrder = [];
    const initialItems = [];

    this.querySelectorAll('#ef-orh-correct-list-wrap .ef-orh-correct-row').forEach(row => {
      const val   = row.dataset.itemVal || row.querySelector('.ef-orh-correct-text')?.textContent.trim() || '';
      const shown = row.querySelector('.ef-orh-show-cb')?.checked || false;
      correctOrder.push(val);
      initialItems.push(shown ? val : '');
    });

    // user_response: empty string per blank slot
    const blankCount   = initialItems.filter(v => v === '').length;
    const userResponse = Array(blankCount).fill('');

    const saved = {
      type:          this._question?.type || 'ordering_horizontal',
      question:      questionText,
      svg_content:   this.querySelector('#ef-orh-svg')?.value.trim()        || '',
      img_url:       this.querySelector('#ef-orh-img-url')?.value.trim()     || '',
      items:         itemTexts,
      correct_order: correctOrder,
      initial_items: initialItems,
      user_response: userResponse,
      explanation:   this.querySelector('#ef-orh-explanation')?.value.trim() || '',
      difficulty:    this.querySelector('#ef-orh-difficulty')?.value         || 'easy',
      points:        this._parseOptionalNumber('#ef-orh-points'),
      time_limit:    this._parseOptionalNumber('#ef-orh-time-limit'),
      tags:          this._parseTags(),
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
    const preview = this.querySelector('#orh-img-preview');
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
    const raw = this.querySelector('#ef-orh-tags')?.value || '';
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

customElements.define('ordering-horizontal-form', OrderingHorizontalFormComponent);