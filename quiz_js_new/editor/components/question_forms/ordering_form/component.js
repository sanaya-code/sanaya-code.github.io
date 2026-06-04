// editor/components/question_forms/ordering_form/component.js

class OrderingFormComponent extends HTMLElement {

  connectedCallback() {
    this._question      = null;
    this._index         = -1;
    this._itemDragSrc   = null;   // drag index for items list
    this._orderDragSrc  = null;   // drag index for correct order list
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
    const q        = this._question || EditorFormRegistry.getDefault('ordering');
    const isSkip   = q.type === 'skip';
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'ordering') : q.type
    );
    const badgeColor = typeConf ? typeConf.color : '#e91e8c';
    const badgeLabel = typeConf ? typeConf.label : 'Ordering';
    const items      = Array.isArray(q.items) ? q.items : [];

    this.innerHTML = `
      <div class="ef-ord-form">

        <!-- Topbar -->
        <div class="ef-ord-topbar">
          ${isSkip
            ? `<span class="ef-ord-skip-badge">⊘ SKIP</span>
               <span style="font-size:12px;color:var(--text-muted)">
                 Originally: ${badgeLabel}
               </span>`
            : `<span class="ef-ord-type-badge"
                     style="background:${badgeColor}">${badgeLabel}</span>`
          }
          <div class="ef-ord-topbar-actions">
            ${isSkip
              ? `<button class="ef-ord-btn-unskip" id="ef-ord-btn-unskip">↩ Un-mark Skip</button>`
              : `<button class="ef-ord-btn-skip"   id="ef-ord-btn-skip">⊘ Mark as Skip</button>`
            }
          </div>
        </div>

        <!-- Body -->
        <div class="ef-ord-body ${isSkip ? 'ef-ord-is-skip' : ''}">

          <!-- Question text -->
          <div class="ef-ord-field">
            <label class="ef-ord-label">Question Text</label>
            <textarea class="ef-ord-textarea" id="ef-ord-question"
              rows="3"
              placeholder="Enter question text (HTML/MathML supported)"
            >${this._esc(q.question || '')}</textarea>
            <div class="ef-ord-render-preview" id="ef-ord-question-preview"></div>
          </div>

          <!-- SVG — collapsible -->
          <div class="ef-ord-collapsible" id="ef-ord-svg-section">
            <div class="ef-ord-collapsible-header" id="ef-ord-svg-toggle">
              ▶ SVG Figure
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-ord-collapsible-arrow">▼</span>
            </div>
            <div class="ef-ord-collapsible-body">
              <textarea class="ef-ord-textarea" id="ef-ord-svg"
                rows="3" placeholder="Paste SVG code here..."
              >${this._esc(q.svg_content || '')}</textarea>
              <div class="ef-ord-svg-preview" id="ef-ord-svg-preview">
                ${q.svg_content || ''}
              </div>
              <button class="ef-ord-remove-btn" id="ef-ord-svg-remove">Remove SVG</button>
            </div>
          </div>

          <!-- Image — collapsible -->
          <div class="ef-ord-collapsible" id="ef-ord-img-section">
            <div class="ef-ord-collapsible-header" id="ef-ord-img-toggle">
              ▶ Image URL
              <span style="font-weight:400;font-size:11px;margin-left:4px;
                           color:var(--text-muted)">(optional)</span>
              <span class="ef-ord-collapsible-arrow">▼</span>
            </div>
            <div class="ef-ord-collapsible-body">
              <input class="ef-ord-input" id="ef-ord-img-url" type="text"
                placeholder="Enter image URL or relative path..."
                value="${this._esc(q.img_url || '')}"
              />
              <div class="ef-ord-img-preview ${q.img_url ? 'visible' : ''}"
                   id="ef-ord-img-preview">
                ${q.img_url
                  ? `<img src="${this._esc(q.img_url)}" alt="preview" />`
                  : ''}
              </div>
              <button class="ef-ord-remove-btn" id="ef-ord-img-remove">Remove Image</button>
            </div>
          </div>

          <!-- Items list -->
          <div class="ef-ord-field">
            <div class="ef-ord-options-header">
              <label class="ef-ord-label">Items</label>
              <button class="ef-ord-add-option-btn" id="ef-ord-add-item">+ Add Item</button>
            </div>
            <div class="ef-ord-options-list" id="ef-ord-items-list">
              ${items.map((item, i) => this._itemRowHTML(item.text || '', i)).join('')}
            </div>
            <!-- Shared item preview -->
            <div class="ef-ord-option-preview-box" id="ord-item-preview-box">
              <div class="ef-ord-option-preview-label" id="ord-item-preview-label">
                Previewing item 1
              </div>
              <div class="ef-ord-option-preview-content"
                   id="ord-item-preview-content"></div>
            </div>
            <div class="ef-ord-error" id="ef-ord-items-error"></div>
          </div>

          <!-- Correct Order -->
          <div class="ef-ord-field">
            <label class="ef-ord-label">
              Correct Order
              <span class="ef-ord-optional">
                — drag to set the correct sequence
              </span>
            </label>
            <div class="ef-ord-sync-hint">
              This list stays in sync with Items above.
              Drag rows to set the correct order.
            </div>
            <div class="ef-ord-correct-list" id="ef-ord-correct-list">
              ${this._renderCorrectList(items, q.correct_order || [])}
            </div>
          </div>

          <!-- Explanation -->
          <div class="ef-ord-field">
            <label class="ef-ord-label">
              Explanation <span class="ef-ord-optional">(optional)</span>
            </label>
            <textarea class="ef-ord-textarea" id="ef-ord-explanation"
              rows="2"
              placeholder="Explanation (HTML/MathML supported)"
            >${this._esc(q.explanation || '')}</textarea>
            <div class="ef-ord-render-preview" id="ef-ord-explanation-preview"></div>
          </div>

          <!-- Difficulty -->
          <div class="ef-ord-field">
            <label class="ef-ord-label">Difficulty</label>
            <select class="ef-ord-select" id="ef-ord-difficulty">
              ${EditorConfig.DIFFICULTY_LEVELS.map(d => `
                <option value="${d}"
                  ${q.difficulty === d ? 'selected' : ''}>${d}</option>
              `).join('')}
            </select>
          </div>

          <!-- Points + Time Limit -->
          <div class="ef-ord-row-2">
            <div class="ef-ord-field">
              <label class="ef-ord-label">
                Points <span class="ef-ord-optional">(optional)</span>
              </label>
              <input class="ef-ord-input" id="ef-ord-points" type="number"
                min="0" step="0.5" placeholder="e.g. 1"
                value="${q.points !== '' && q.points != null ? q.points : ''}"
              />
            </div>
            <div class="ef-ord-field">
              <label class="ef-ord-label">
                Time Limit (sec) <span class="ef-ord-optional">(optional)</span>
              </label>
              <input class="ef-ord-input" id="ef-ord-time-limit" type="number"
                min="0" step="1" placeholder="e.g. 30"
                value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="ef-ord-field">
            <label class="ef-ord-label">
              Tags <span class="ef-ord-optional">(comma separated)</span>
            </label>
            <input class="ef-ord-input" id="ef-ord-tags" type="text"
              placeholder="e.g. history, sequence"
              value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
            />
          </div>

        </div><!-- /.ef-ord-body -->

        <!-- Footer -->
        <div class="ef-ord-footer">
          <button class="ef-ord-btn-save" id="ef-ord-btn-save">Save</button>
          <span class="ef-ord-save-hint">
            IDs (A, B, C…) assigned on save
          </span>
        </div>

      </div>
    `;
  }

  // ── Item row HTML ────────────────────────────────────

  _itemRowHTML(text, index) {
    return `
      <div class="ef-ord-option-row ef-ord-item-row"
           draggable="true" data-item-index="${index}">
        <span class="ef-ord-drag-handle">⠿</span>
        <input type="text"
               class="ef-ord-option-text ord-item-text"
               placeholder="Item text (HTML/MathML supported)"
               value="${this._esc(text)}"
               data-item-index="${index}"
        />
        <button class="ef-ord-option-delete ord-item-delete"
                title="Delete item">✕</button>
      </div>
    `;
  }

  // ── Correct order list HTML ──────────────────────────

  _renderCorrectList(items, correctOrder) {
    if (!items.length) return '';

    // Build id→text map from current items
    const tempIds  = items.map((_, i) => String.fromCharCode(65 + i));
    const idToText = {};
    items.forEach((item, i) => { idToText[tempIds[i]] = item.text || ''; });

    // If correctOrder is provided and valid, use it; else default to A,B,C…
    const validOrder = (correctOrder || []).filter(id => idToText[id] !== undefined);
    const order      = validOrder.length === items.length
      ? validOrder
      : tempIds;

    return order.map((id, pos) => `
      <div class="ef-ord-correct-row"
           draggable="true"
           data-order-index="${pos}"
           data-item-id="${id}">
        <span class="ef-ord-position-badge">${pos + 1}</span>
        <span class="ord-correct-id">${id}</span>
        <span class="ef-ord-correct-text">${idToText[id] || ''}</span>
        <span class="ef-ord-correct-drag">⠿</span>
      </div>
    `).join('');
  }

  // ── Sync correct order list from items list ──────────
  // Called after items are added, deleted, or reordered

  _syncCorrectList() {
    const items     = this._getItemsFromDOM();
    const tempIds   = items.map((_, i) => String.fromCharCode(65 + i));

    // Read current correct order IDs from DOM — preserve user-set order
    const currentOrder = Array.from(
      this.querySelectorAll('.ef-ord-correct-row')
    ).map(row => row.dataset.itemId);

    // Keep IDs that still exist, append new ones at end
    const existingValid = currentOrder.filter(id => tempIds.includes(id));
    const newIds        = tempIds.filter(id => !existingValid.includes(id));
    const finalOrder    = [...existingValid, ...newIds];

    // Re-build id→text from current items
    const idToText = {};
    items.forEach((text, i) => { idToText[tempIds[i]] = text; });

    const correctList = this.querySelector('#ef-ord-correct-list');
    if (!correctList) return;

    correctList.innerHTML = finalOrder.map((id, pos) => `
      <div class="ef-ord-correct-row"
           draggable="true"
           data-order-index="${pos}"
           data-item-id="${id}">
        <span class="ef-ord-position-badge">${pos + 1}</span>
        <span class="ord-correct-id">${id}</span>
        <span class="ef-ord-correct-text">${idToText[id] || ''}</span>
        <span class="ef-ord-correct-drag">⠿</span>
      </div>
    `).join('');

    this._bindCorrectListDrag();
  }

  // ── Get item texts from DOM ──────────────────────────

  _getItemsFromDOM() {
    return Array.from(this.querySelectorAll('.ord-item-text'))
      .map(inp => inp.value.trim());
  }

  // ── Bind all events ──────────────────────────────────

  _bindEvents() {
    this._bindFocusPreview('ef-ord-question',    'ef-ord-question-preview');
    this._bindFocusPreview('ef-ord-explanation', 'ef-ord-explanation-preview');

    // SVG collapsible
    this.querySelector('#ef-ord-svg-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-ord-svg-section').classList.toggle('open');
    });
    this.querySelector('#ef-ord-svg')?.addEventListener('input', (e) => {
      this.querySelector('#ef-ord-svg-preview').innerHTML = e.target.value;
    });
    this.querySelector('#ef-ord-svg-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-ord-svg').value = '';
      this.querySelector('#ef-ord-svg-preview').innerHTML = '';
    });

    // Image collapsible
    this.querySelector('#ef-ord-img-toggle')?.addEventListener('click', () => {
      this.querySelector('#ef-ord-img-section').classList.toggle('open');
    });
    this.querySelector('#ef-ord-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this.querySelector('#ef-ord-img-remove')?.addEventListener('click', () => {
      this.querySelector('#ef-ord-img-url').value = '';
      this._updateImgPreview('');
    });

    // Add item
    this.querySelector('#ef-ord-add-item')?.addEventListener('click', () => {
      this._addItemRow();
    });

    // Items list — delegated events
    const itemsList = this.querySelector('#ef-ord-items-list');
    if (itemsList) this._bindItemListEvents(itemsList);

    // Correct order list drag
    this._bindCorrectListDrag();

    // Skip / Unskip
    this.querySelector('#ef-ord-btn-skip')?.addEventListener('click', () => {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      this._render(); this._bindEvents();
    });
    this.querySelector('#ef-ord-btn-unskip')?.addEventListener('click', () => {
      this._question.type = this._question.original_type || 'ordering';
      delete this._question.original_type;
      this._render(); this._bindEvents();
    });

    // Save
    this.querySelector('#ef-ord-btn-save')?.addEventListener('click', () => {
      this._handleSave();
    });
  }

  // ── Items list events ────────────────────────────────

  _bindItemListEvents(list) {

    // Focus → shared preview
    list.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ord-item-text')) return;
      const row   = e.target.closest('.ef-ord-item-row');
      const index = parseInt(row.dataset.itemIndex);
      list.querySelectorAll('.ef-ord-item-row')
        .forEach(r => r.classList.remove('ef-ord-focused-row'));
      row.classList.add('ef-ord-focused-row');
      const box     = this.querySelector('#ord-item-preview-box');
      const label   = this.querySelector('#ord-item-preview-label');
      const content = this.querySelector('#ord-item-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing item ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    // Live preview + sync correct list on text change
    list.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ord-item-text')) return;
      const row     = e.target.closest('.ef-ord-item-row');
      const index   = parseInt(row.dataset.itemIndex);
      const content = this.querySelector('#ord-item-preview-content');
      const label   = this.querySelector('#ord-item-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing item ${index + 1}`;
      }
      // Update the text in correct order list live
      this._updateCorrectListText();
    });

    // Delete item
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ord-item-delete')) return;
      e.target.closest('.ef-ord-item-row').remove();
      this._reindexItems();
      this._syncCorrectList();
      const remaining = list.querySelectorAll('.ef-ord-item-row').length;
      if (remaining === 0) {
        this.querySelector('#ord-item-preview-box')?.classList.remove('visible');
      }
    });

    // Drag reorder items
    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-ord-item-row');
      if (!row) return;
      this._itemDragSrc = parseInt(row.dataset.itemIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.ef-ord-item-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-ord-item-row');
      if (row && parseInt(row.dataset.itemIndex) !== this._itemDragSrc) {
        list.querySelectorAll('.ef-ord-item-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-ord-item-row');
      if (!target) return;
      const to   = parseInt(target.dataset.itemIndex);
      const from = this._itemDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      this._reorderItemRows(from, to);
      this._syncCorrectList();
    });
  }

  // ── Correct order list drag ──────────────────────────

  _bindCorrectListDrag() {
    const list = this.querySelector('#ef-ord-correct-list');
    if (!list) return;

    list.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.ef-ord-correct-row');
      if (!row) return;
      this._orderDragSrc = parseInt(row.dataset.orderIndex);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.ef-ord-correct-row')
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = e.target.closest('.ef-ord-correct-row');
      if (row && parseInt(row.dataset.orderIndex) !== this._orderDragSrc) {
        list.querySelectorAll('.ef-ord-correct-row')
          .forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      }
    });
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-ord-correct-row');
      if (!target) return;
      const to   = parseInt(target.dataset.orderIndex);
      const from = this._orderDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      this._reorderCorrectRows(from, to);
    });
  }

  // ── Update correct list text labels (on item text change) ──

  _updateCorrectListText() {
    const items   = this._getItemsFromDOM();
    const tempIds = items.map((_, i) => String.fromCharCode(65 + i));
    const idToText = {};
    items.forEach((text, i) => { idToText[tempIds[i]] = text; });

    this.querySelectorAll('.ef-ord-correct-row').forEach(row => {
      const id      = row.dataset.itemId;
      const textEl  = row.querySelector('.ef-ord-correct-text');
      if (textEl && idToText[id] !== undefined) {
        textEl.innerHTML = idToText[id];
      }
    });
  }

  // ── Reorder correct order rows ───────────────────────

  _reorderCorrectRows(from, to) {
    const list = this.querySelector('#ef-ord-correct-list');
    const rows = Array.from(list.querySelectorAll('.ef-ord-correct-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach((row, i) => {
      row.dataset.orderIndex = i;
      row.querySelector('.ef-ord-position-badge').textContent = i + 1;
      list.appendChild(row);
    });
  }

  // ── Add item row ─────────────────────────────────────

  _addItemRow() {
    const list  = this.querySelector('#ef-ord-items-list');
    const count = list.querySelectorAll('.ef-ord-item-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._itemRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexItems();
    this._syncCorrectList();
    list.querySelector('.ef-ord-item-row:last-child .ord-item-text')?.focus();
  }

  // ── Reindex item rows ────────────────────────────────

  _reindexItems() {
    this.querySelectorAll('.ef-ord-item-row').forEach((row, i) => {
      row.dataset.itemIndex = i;
      const inp = row.querySelector('.ord-item-text');
      if (inp) inp.dataset.itemIndex = i;
    });
  }

  // ── Reorder item rows ────────────────────────────────

  _reorderItemRows(from, to) {
    const list = this.querySelector('#ef-ord-items-list');
    const rows = Array.from(list.querySelectorAll('.ef-ord-item-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexItems();
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    const errEl       = this.querySelector('#ef-ord-items-error');
    errEl.classList.remove('visible');
    const questionText = this.querySelector('#ef-ord-question')?.value.trim() || '';

    if (questionText === '') {
      errEl.textContent = 'Question text is required.';
      errEl.classList.add('visible');
      this.querySelector('#ef-ord-question')?.focus();
      return;
    }

    const itemTexts = this._getItemsFromDOM();
    if (itemTexts.length < 2) {
      errEl.textContent = 'At least 2 items are required.';
      errEl.classList.add('visible');
      return;
    }

    // Build items array with A/B/C… IDs
    const items = itemTexts.map((text, i) => ({
      id:   String.fromCharCode(65 + i),
      text: text,
    }));

    // Build correct_order from the correct order list DOM
    const correctOrder = Array.from(
      this.querySelectorAll('.ef-ord-correct-row')
    ).map(row => row.dataset.itemId);

    const saved = {
      type:          this._question?.type || 'ordering',
      question:      questionText,
      svg_content:   this.querySelector('#ef-ord-svg')?.value.trim()        || '',
      img_url:       this.querySelector('#ef-ord-img-url')?.value.trim()     || '',
      items:         items,
      correct_order: correctOrder,
      user_response: '',
      explanation:   this.querySelector('#ef-ord-explanation')?.value.trim() || '',
      difficulty:    this.querySelector('#ef-ord-difficulty')?.value         || 'easy',
      points:        this._parseOptionalNumber('#ef-ord-points'),
      time_limit:    this._parseOptionalNumber('#ef-ord-time-limit'),
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
    const preview = this.querySelector('#ef-ord-img-preview');
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
    const raw = this.querySelector('#ef-ord-tags')?.value || '';
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

customElements.define('ordering-form', OrderingFormComponent);