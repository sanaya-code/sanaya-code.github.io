// editor/components/question_forms/ordering_horizontal_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class ORHFormUtils {

  static escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  static parseOptionalNumber(el) {
    const val = el?.value.trim();
    if (!val) return '';
    const n = parseFloat(val);
    return isNaN(n) ? '' : n;
  }

  static parseTags(el) {
    const raw = el?.value || '';
    return raw.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  static bindFocusPreview(input, preview) {
    if (!input || !preview) return;
    input.addEventListener('focus', () => {
      preview.innerHTML = input.value;
      preview.classList.add('visible');
    });
    input.addEventListener('input', () => {
      preview.innerHTML = input.value;
    });
  }

  static bindCollapsible(header, section) {
    if (!header || !section) return;
    header.addEventListener('click', () => section.classList.toggle('open'));
  }

}

// ── Question Widget ───────────────────────────────────────────────────────────

class ORHQuestionWidget {

  constructor(root) { this._root = root; }

  render(q) {
    return `
      <div class="ef-orh-field">
        <label class="ef-orh-label">Question Text</label>
        <textarea class="ef-orh-textarea" id="ef-orh-question"
          rows="3" placeholder="Enter question text (HTML/MathML supported)"
        >${ORHFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-orh-render-preview" id="ef-orh-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    ORHFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-orh-question'),
      this._root.querySelector('#ef-orh-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-orh-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────

class ORHMediaWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${ORHFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-orh-img-preview visible' : 'ef-orh-img-preview';

    return `
      <div class="ef-orh-collapsible" id="ef-orh-svg-section">
        <div class="ef-orh-collapsible-header" id="ef-orh-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-orh-collapsible-arrow">▼</span>
        </div>
        <div class="ef-orh-collapsible-body">
          <textarea class="ef-orh-textarea" id="ef-orh-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${ORHFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-orh-svg-preview" id="ef-orh-svg-preview">${q.svg_content || ''}</div>
          <button class="ef-orh-remove-btn" id="ef-orh-svg-remove">Remove SVG</button>
        </div>
      </div>
      <div class="ef-orh-collapsible" id="ef-orh-img-section">
        <div class="ef-orh-collapsible-header" id="ef-orh-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;color:var(--text-muted)">(optional)</span>
          <span class="ef-orh-collapsible-arrow">▼</span>
        </div>
        <div class="ef-orh-collapsible-body">
          <input class="ef-orh-input" id="ef-orh-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${ORHFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-orh-img-preview">${imgThumb}</div>
          <button class="ef-orh-remove-btn" id="ef-orh-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    ORHFormUtils.bindCollapsible(
      this._root.querySelector('#ef-orh-svg-toggle'),
      this._root.querySelector('#ef-orh-svg-section')
    );
    this._root.querySelector('#ef-orh-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-orh-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-orh-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-orh-svg').value = '';
      this._root.querySelector('#ef-orh-svg-preview').innerHTML = '';
    });
    ORHFormUtils.bindCollapsible(
      this._root.querySelector('#ef-orh-img-toggle'),
      this._root.querySelector('#ef-orh-img-section')
    );
    this._root.querySelector('#ef-orh-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-orh-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-orh-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-orh-svg')?.value.trim()     || ''; }
  getImgUrl() { return this._root.querySelector('#ef-orh-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-orh-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${ORHFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Items → horizontal chips, click to open inline edit row (one at a time).
// Chips display rendered HTML/MathML preview, truncated via CSS.
// Correct order → visual chip picker (click item chip to append),
// correct order chips also horizontal with position#, Show cb, delete, drag.

class ORHAnswerWidget {

  constructor(root) {
    this._root          = root;
    this._editingIndex  = -1;   // which item chip is currently open for edit
    this._orderDragSrc  = null;
    this._items         = [];   // live array of raw item strings
  }

  render(q) {
    this._items        = Array.isArray(q.items)         ? [...q.items]         : [];
    const correctOrder = Array.isArray(q.correct_order) ? q.correct_order      : [];
    const initialItems = Array.isArray(q.initial_items) ? q.initial_items      : [];

    return `
      <div class="ef-orh-field">
        <div class="ef-orh-items-header">
          <label class="ef-orh-label">Items
            <span class="ef-orh-optional">— includes distractors · click chip to edit</span>
          </label>
          <button class="ef-orh-add-item-btn" id="ef-orh-add-item">+ Add Item</button>
        </div>
        <div class="ef-orh-chips-wrap" id="ef-orh-chips-wrap">
          ${this._items.map((val, i) => this._itemChipHTML(val, i)).join('')}
          ${!this._items.length ? `<span class="ef-orh-chips-empty">No items yet. Click + Add Item.</span>` : ''}
        </div>
        <div class="ef-orh-edit-row ef-orh-hidden" id="ef-orh-edit-row">
          <span class="ef-orh-edit-label">Editing:</span>
          <input class="ef-orh-edit-input" id="ef-orh-edit-input" type="text" placeholder="Item value (HTML/MathML supported)" />
          <div class="ef-orh-edit-preview" id="ef-orh-edit-preview"></div>
          <button class="ef-orh-edit-done" id="ef-orh-edit-done">Done</button>
        </div>
        <div class="ef-orh-error" id="ef-orh-error"></div>
      </div>

      <div class="ef-orh-field">
        <label class="ef-orh-label">Correct Order
          <span class="ef-orh-optional">— click item below to append · drag to reorder · ☑ Show = pre-filled</span>
        </label>
        <div class="ef-orh-picker-wrap" id="ef-orh-picker-wrap">
          <div class="ef-orh-picker-hint">Click any item to add it to the correct order (can add same item multiple times):</div>
          <div class="ef-orh-picker-chips" id="ef-orh-picker-chips">
            ${this._items.filter(v => v.trim()).map((val, i) => this._pickerChipHTML(val, i)).join('')}
            ${!this._items.filter(v => v.trim()).length ? `<span class="ef-orh-chips-empty">Add items above first.</span>` : ''}
          </div>
        </div>
        <div class="ef-orh-correct-list-wrap" id="ef-orh-correct-list-wrap">
          ${correctOrder.map((val, i) =>
            this._correctChipHTML(val, i, initialItems[i] !== '' && initialItems[i] != null)
          ).join('')}
        </div>
        <div class="ef-orh-correct-empty" id="ef-orh-correct-empty"
             style="${correctOrder.length ? 'display:none' : ''}">
          No items in correct order yet.
        </div>
      </div>
    `;
  }

  bindEvents() {
    // + Add Item button
    this._root.querySelector('#ef-orh-add-item')
      ?.addEventListener('click', () => this._addItem());

    // Chips wrap: click chip to edit, click ✕ to delete
    this._root.querySelector('#ef-orh-chips-wrap')
      ?.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.ef-orh-chip-del');
        const chip   = e.target.closest('.ef-orh-item-chip');
        if (delBtn) {
          e.stopPropagation();
          const idx = parseInt(delBtn.dataset.idx);
          this._deleteItem(idx);
        } else if (chip) {
          const idx = parseInt(chip.dataset.idx);
          this._openEdit(idx);
        }
      });

    // Edit row: input → live preview
    this._root.querySelector('#ef-orh-edit-input')
      ?.addEventListener('input', (e) => {
        const preview = this._root.querySelector('#ef-orh-edit-preview');
        if (preview) preview.innerHTML = e.target.value;
      });

    // Edit row: Done button
    this._root.querySelector('#ef-orh-edit-done')
      ?.addEventListener('click', () => this._closeEdit());

    // Picker chips: click to add to correct order
    this._root.querySelector('#ef-orh-picker-chips')
      ?.addEventListener('click', (e) => {
        const chip = e.target.closest('.ef-orh-picker-chip');
        if (!chip) return;
        this._addCorrectChip(chip.dataset.val);
      });

    // Correct list: delete + show checkbox
    this._bindCorrectList();
  }

  getItemTexts() {
    return this._items.filter(v => v.trim().length > 0);
  }

  getCorrectOrderAndInitial() {
    const correctOrder = [];
    const initialItems = [];
    this._root.querySelectorAll('#ef-orh-correct-list-wrap .ef-orh-correct-chip')
      .forEach(chip => {
        const val   = chip.dataset.itemVal || '';
        const shown = chip.querySelector('.ef-orh-show-cb')?.checked || false;
        correctOrder.push(val);
        initialItems.push(shown ? val : '');
      });
    return { correctOrder, initialItems };
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-orh-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private: HTML builders ────────────────────────────

  _itemChipHTML(val, index) {
    return `
      <div class="ef-orh-item-chip" data-idx="${index}" title="Click to edit">
        <span class="ef-orh-chip-preview">${val}</span>
        <button class="ef-orh-chip-del" data-idx="${index}" title="Delete">✕</button>
      </div>
    `;
  }

  _pickerChipHTML(val, index) {
    return `
      <div class="ef-orh-picker-chip" data-val="${ORHFormUtils.escHtml(val)}" data-idx="${index}" title="Click to add to correct order">
        <span class="ef-orh-chip-preview">${val}</span>
      </div>
    `;
  }

  _correctChipHTML(val, index, isShown) {
    return `
      <div class="ef-orh-correct-chip ${isShown ? 'is-shown' : ''}"
           draggable="true"
           data-order-index="${index}"
           data-item-val="${ORHFormUtils.escHtml(val)}">
        <span class="ef-orh-correct-drag">⠿</span>
        <span class="ef-orh-position-badge">${index + 1}</span>
        <span class="ef-orh-chip-preview ef-orh-correct-preview">${val}</span>
        <label class="ef-orh-show-label">
          <input type="checkbox" class="ef-orh-show-cb" ${isShown ? 'checked' : ''} />
          Show
        </label>
        <button class="ef-orh-correct-delete" title="Remove from order">✕</button>
      </div>
    `;
  }

  // ── Private: item operations ──────────────────────────

  _addItem() {
    this._closeEdit(false); // close any open edit without saving
    this._items.push('');
    this._rebuildChipsWrap();
    this._rebuildPickerChips();
    // Open edit for the new item immediately
    this._openEdit(this._items.length - 1);
  }

  _deleteItem(idx) {
    if (this._editingIndex === idx) this._closeEdit(false);
    else if (this._editingIndex > idx) this._editingIndex--;
    this._items.splice(idx, 1);
    this._rebuildChipsWrap();
    this._rebuildPickerChips();
  }

  _openEdit(idx) {
    // Save any currently open edit first
    if (this._editingIndex >= 0 && this._editingIndex !== idx) {
      this._saveCurrentEdit();
    }
    this._editingIndex = idx;

    // Mark chip as active
    this._root.querySelectorAll('.ef-orh-item-chip')
      .forEach(c => c.classList.remove('ef-orh-chip-active'));
    this._root.querySelector(`.ef-orh-item-chip[data-idx="${idx}"]`)
      ?.classList.add('ef-orh-chip-active');

    // Show edit row with current value
    const editRow   = this._root.querySelector('#ef-orh-edit-row');
    const editInput = this._root.querySelector('#ef-orh-edit-input');
    const preview   = this._root.querySelector('#ef-orh-edit-preview');
    if (!editRow || !editInput) return;

    editRow.classList.remove('ef-orh-hidden');
    editInput.value  = this._items[idx] || '';
    preview.innerHTML = editInput.value;
    editInput.focus();
  }

  _saveCurrentEdit() {
    if (this._editingIndex < 0) return;
    const editInput = this._root.querySelector('#ef-orh-edit-input');
    if (!editInput) return;
    const val = editInput.value;
    this._items[this._editingIndex] = val;
    // Update chip preview in place
    const chip = this._root.querySelector(`.ef-orh-item-chip[data-idx="${this._editingIndex}"]`);
    if (chip) {
      const prev = chip.querySelector('.ef-orh-chip-preview');
      if (prev) prev.innerHTML = val;
    }
    this._rebuildPickerChips();
  }

  _closeEdit(save = true) {
    if (save) this._saveCurrentEdit();
    this._editingIndex = -1;
    const editRow = this._root.querySelector('#ef-orh-edit-row');
    if (editRow) editRow.classList.add('ef-orh-hidden');
    this._root.querySelectorAll('.ef-orh-item-chip')
      .forEach(c => c.classList.remove('ef-orh-chip-active'));
  }

  // ── Private: correct order operations ────────────────

  _addCorrectChip(val) {
    if (!val || !val.trim()) return;
    const list  = this._root.querySelector('#ef-orh-correct-list-wrap');
    if (!list) return;
    const count = list.querySelectorAll('.ef-orh-correct-chip').length;
    const div   = document.createElement('div');
    div.innerHTML = this._correctChipHTML(val, count, false);
    list.appendChild(div.firstElementChild);
    this._reindexCorrectChips();
    this._updateCorrectEmpty();
    this._bindCorrectList();
  }

  _reindexCorrectChips() {
    this._root.querySelectorAll('#ef-orh-correct-list-wrap .ef-orh-correct-chip')
      .forEach((chip, i) => {
        chip.dataset.orderIndex = i;
        const badge = chip.querySelector('.ef-orh-position-badge');
        if (badge) badge.textContent = i + 1;
      });
  }

  _updateCorrectEmpty() {
    const list  = this._root.querySelector('#ef-orh-correct-list-wrap');
    const empty = this._root.querySelector('#ef-orh-correct-empty');
    if (!list || !empty) return;
    empty.style.display =
      list.querySelectorAll('.ef-orh-correct-chip').length > 0 ? 'none' : '';
  }

  // ── Private: rebuild DOM sections ────────────────────

  _rebuildChipsWrap() {
    const wrap = this._root.querySelector('#ef-orh-chips-wrap');
    if (!wrap) return;
    wrap.innerHTML = this._items.length
      ? this._items.map((val, i) => this._itemChipHTML(val, i)).join('')
      : `<span class="ef-orh-chips-empty">No items yet. Click + Add Item.</span>`;
  }

  _rebuildPickerChips() {
    const wrap = this._root.querySelector('#ef-orh-picker-chips');
    if (!wrap) return;
    const valid = this._items.filter(v => v.trim());
    wrap.innerHTML = valid.length
      ? valid.map((val, i) => this._pickerChipHTML(val, i)).join('')
      : `<span class="ef-orh-chips-empty">Add items above first.</span>`;
  }

  // ── Private: correct list event binding ──────────────
  // Uses clone-replace to avoid duplicate listener accumulation

  _bindCorrectList() {
    const list = this._root.querySelector('#ef-orh-correct-list-wrap');
    if (!list) return;

    const clone = list.cloneNode(true);
    list.parentNode.replaceChild(clone, list);
    const newList = this._root.querySelector('#ef-orh-correct-list-wrap');

    // Delete
    newList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-orh-correct-delete')) return;
      e.target.closest('.ef-orh-correct-chip').remove();
      this._reindexCorrectChips();
      this._updateCorrectEmpty();
    });

    // Show checkbox
    newList.addEventListener('change', (e) => {
      if (!e.target.classList.contains('ef-orh-show-cb')) return;
      e.target.closest('.ef-orh-correct-chip')
        .classList.toggle('is-shown', e.target.checked);
    });

    // Drag reorder
    newList.addEventListener('dragstart', (e) => {
      const chip = e.target.closest('.ef-orh-correct-chip');
      if (!chip) return;
      this._orderDragSrc = parseInt(chip.dataset.orderIndex);
      chip.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    newList.addEventListener('dragend', () => {
      newList.querySelectorAll('.ef-orh-correct-chip')
        .forEach(c => c.classList.remove('dragging', 'drag-over'));
    });
    newList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const chip = e.target.closest('.ef-orh-correct-chip');
      if (chip && parseInt(chip.dataset.orderIndex) !== this._orderDragSrc) {
        newList.querySelectorAll('.ef-orh-correct-chip')
          .forEach(c => c.classList.remove('drag-over'));
        chip.classList.add('drag-over');
      }
    });
    newList.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-orh-correct-chip');
      if (!target) return;
      const to   = parseInt(target.dataset.orderIndex);
      const from = this._orderDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      this._reorderCorrectChips(from, to);
    });
  }

  _reorderCorrectChips(from, to) {
    const list = this._root.querySelector('#ef-orh-correct-list-wrap');
    const chips = Array.from(list.querySelectorAll('.ef-orh-correct-chip'));
    const moved = chips.splice(from, 1)[0];
    chips.splice(to, 0, moved);
    list.innerHTML = '';
    chips.forEach(c => list.appendChild(c));
    this._reindexCorrectChips();
    this._bindCorrectList();
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────

class ORHMetadataWidget {

  constructor(root) { this._root = root; }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-orh-field">
        <label class="ef-orh-label">
          Explanation <span class="ef-orh-optional">(optional)</span>
        </label>
        <textarea class="ef-orh-textarea" id="ef-orh-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${ORHFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-orh-render-preview" id="ef-orh-explanation-preview"></div>
      </div>
      <div class="ef-orh-field">
        <label class="ef-orh-label">Difficulty</label>
        <select class="ef-orh-select" id="ef-orh-difficulty">${diffOptions}</select>
      </div>
      <div class="ef-orh-row-2">
        <div class="ef-orh-field">
          <label class="ef-orh-label">Points <span class="ef-orh-optional">(optional)</span></label>
          <input class="ef-orh-input" id="ef-orh-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-orh-field">
          <label class="ef-orh-label">Time Limit (sec) <span class="ef-orh-optional">(optional)</span></label>
          <input class="ef-orh-input" id="ef-orh-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>
      <div class="ef-orh-field">
        <label class="ef-orh-label">Tags <span class="ef-orh-optional">(comma separated)</span></label>
        <input class="ef-orh-input" id="ef-orh-tags" type="text"
          placeholder="e.g. math, sequence"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    ORHFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-orh-explanation'),
      this._root.querySelector('#ef-orh-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-orh-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-orh-difficulty')?.value || 'easy',
      points:      ORHFormUtils.parseOptionalNumber(this._root.querySelector('#ef-orh-points')),
      time_limit:  ORHFormUtils.parseOptionalNumber(this._root.querySelector('#ef-orh-time-limit')),
      tags:        ORHFormUtils.parseTags(this._root.querySelector('#ef-orh-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class OrderingHorizontalFormComponent extends HTMLElement {

  connectedCallback() {
    this._question = null;
    this._index    = -1;
    this._render();
    this._bindAll();
  }

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._render();
    this._bindAll();
  }

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('ordering_horizontal');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'ordering_horizontal') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Ordering Horizontal';
    const bodyClass    = isSkip ? 'ef-orh-body ef-orh-is-skip' : 'ef-orh-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    // Create widget instances BEFORE innerHTML — render() populates their state
    // (e.g. _items[]). _bindAll() reuses these same instances so state is intact.
    this._qWidget     = new ORHQuestionWidget(this);
    this._mediaWidget = new ORHMediaWidget(this);
    this._ansWidget   = new ORHAnswerWidget(this);
    this._metaWidget  = new ORHMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-orh-form">
        <div class="${bodyClass}" id="ef-orh-body">
          ${this._qWidget.render(q)}
          ${this._mediaWidget.render(q)}
          ${this._ansWidget.render(q)}
          ${this._metaWidget.render(q)}
        </div>
        <div class="ef-orh-footer">
          <button class="ef-orh-btn-save" id="ef-orh-btn-save">Save</button>
          <button class="ef-orh-btn-skip" id="ef-orh-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  _bindAll() {
    // Instances were already created in _render() with state populated.
    // Just call bindEvents() on them — do NOT create new instances here.
    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();
    this._bindFooter();
  }

  _bindFooter() {
    this.querySelector('#ef-orh-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-orh-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'ordering_horizontal') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Ordering Horizontal';
    const body      = this.querySelector('#ef-orh-body');
    const btn       = this.querySelector('#ef-orh-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'ordering_horizontal';
      delete this._question.original_type;
      body.classList.remove('ef-orh-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-orh-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  _handleSave() {
    this._ansWidget.showError('');
    // Flush any open edit before saving
    this._ansWidget._closeEdit(true);

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-orh-question')?.focus();
      return;
    }

    const itemTexts = this._ansWidget.getItemTexts();
    if (itemTexts.length < 1) {
      this._ansWidget.showError('At least 1 item is required.');
      return;
    }

    const { correctOrder, initialItems } = this._ansWidget.getCorrectOrderAndInitial();
    if (correctOrder.length < 1) {
      this._ansWidget.showError('At least 1 item must be added to the correct order.');
      return;
    }

    const blankCount = initialItems.filter(v => v === '').length;

    const saved = {
      type:          this._question?.type || 'ordering_horizontal',
      question:      questionText,
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      items:         itemTexts,
      correct_order: correctOrder,
      initial_items: initialItems,
      user_response: Array(blankCount).fill(''),
      ...this._metaWidget.getData(),
    };

    if (this._question?.original_type) {
      saved.original_type = this._question.original_type;
    }

    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved },
    }));
  }

  _collectData() {
    this._ansWidget._closeEdit(true);
    const { correctOrder, initialItems } = this._ansWidget.getCorrectOrderAndInitial();
    return {
      type:          this._question?.type || 'ordering_horizontal',
      question:      this._qWidget.getValue(),
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      items:         this._ansWidget.getItemTexts(),
      correct_order: correctOrder,
      initial_items: initialItems,
      user_response: Array(initialItems.filter(v => v === '').length).fill(''),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('ordering-horizontal-form', OrderingHorizontalFormComponent);