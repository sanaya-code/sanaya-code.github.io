// editor/components/question_forms/ordering_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class ORDFormUtils {

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
// Owns: question textarea + focus preview

class ORDQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-ord-field">
        <label class="ef-ord-label">Question Text</label>
        <textarea class="ef-ord-textarea" id="ef-ord-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${ORDFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-ord-render-preview" id="ef-ord-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    ORDFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ord-question'),
      this._root.querySelector('#ef-ord-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-ord-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class ORDMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${ORDFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-ord-img-preview visible' : 'ef-ord-img-preview';

    return `
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
          >${ORDFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-ord-svg-preview" id="ef-ord-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-ord-remove-btn" id="ef-ord-svg-remove">Remove SVG</button>
        </div>
      </div>

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
            value="${ORDFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-ord-img-preview">${imgThumb}</div>
          <button class="ef-ord-remove-btn" id="ef-ord-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    ORDFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ord-svg-toggle'),
      this._root.querySelector('#ef-ord-svg-section')
    );
    this._root.querySelector('#ef-ord-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-ord-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-ord-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ord-svg').value = '';
      this._root.querySelector('#ef-ord-svg-preview').innerHTML = '';
    });

    ORDFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ord-img-toggle'),
      this._root.querySelector('#ef-ord-img-section')
    );
    this._root.querySelector('#ef-ord-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-ord-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ord-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-ord-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-ord-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-ord-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${ORDFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: items list (add / delete / drag-reorder / shared preview)
//       + correct order list (drag-reorder, auto-synced from items)
// Unique to ordering — two linked draggable lists

class ORDAnswerWidget {

  constructor(root) {
    this._root        = root;
    this._itemDragSrc  = null;
    this._orderDragSrc = null;
  }

  render(q) {
    const items = Array.isArray(q.items) ? q.items : [];
    return `
      <div class="ef-ord-field">
        <div class="ef-ord-items-header">
          <label class="ef-ord-label">Items</label>
          <button class="ef-ord-add-item-btn" id="ef-ord-add-item">+ Add Item</button>
        </div>
        <div class="ef-ord-items-list" id="ef-ord-items-list">
          ${items.map((item, i) => this._itemRowHTML(item.text || '', i)).join('')}
        </div>
        <div class="ef-ord-item-preview-box" id="ord-item-preview-box">
          <div class="ef-ord-item-preview-label" id="ord-item-preview-label">
            Previewing item 1
          </div>
          <div class="ef-ord-item-preview-content"
               id="ord-item-preview-content"></div>
        </div>
        <div class="ef-ord-error" id="ef-ord-items-error"></div>
      </div>

      <div class="ef-ord-field">
        <label class="ef-ord-label">
          Correct Order
          <span class="ef-ord-optional">— drag to set the correct sequence</span>
        </label>
        <div class="ef-ord-sync-hint">
          This list stays in sync with Items above.
          Drag rows to set the correct order.
        </div>
        <div class="ef-ord-correct-list" id="ef-ord-correct-list">
          ${this._renderCorrectList(items, q.correct_order || [])}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-ord-add-item')
      ?.addEventListener('click', () => this.addItemRow());

    const itemsList = this._root.querySelector('#ef-ord-items-list');
    if (itemsList) this._bindItemListEvents(itemsList);

    this._bindCorrectListDrag();
  }

  addItemRow() {
    const list  = this._root.querySelector('#ef-ord-items-list');
    const count = list.querySelectorAll('.ef-ord-item-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._itemRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexItems();
    this._syncCorrectList();
    list.querySelector('.ef-ord-item-row:last-child .ord-item-text')?.focus();
  }

  getItems() {
    return Array.from(this._root.querySelectorAll('.ord-item-text'))
      .map((inp, i) => ({
        id:   String.fromCharCode(65 + i),
        text: inp.value.trim(),
      }));
  }

  getCorrectOrder() {
    return Array.from(this._root.querySelectorAll('.ef-ord-correct-row'))
      .map(row => row.dataset.itemId);
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-ord-items-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Private: render helpers ──────────────────────────

  _itemRowHTML(text, index) {
    return `
      <div class="ef-ord-item-row" draggable="true" data-item-index="${index}">
        <span class="ef-ord-drag-handle">⠿</span>
        <input type="text"
               class="ord-item-text"
               placeholder="Item text (HTML/MathML supported)"
               value="${ORDFormUtils.escHtml(text)}"
               data-item-index="${index}"
        />
        <button class="ef-ord-item-delete ord-item-delete"
                title="Delete item">✕</button>
      </div>
    `;
  }

  _renderCorrectList(items, correctOrder) {
    if (!items.length) return '';
    const tempIds  = items.map((_, i) => String.fromCharCode(65 + i));
    const idToText = {};
    items.forEach((item, i) => { idToText[tempIds[i]] = item.text || ''; });

    const validOrder = (correctOrder || []).filter(id => idToText[id] !== undefined);
    const order      = validOrder.length === items.length ? validOrder : tempIds;

    return order.map((id, pos) => this._correctRowHTML(id, pos, idToText[id] || '')).join('');
  }

  _correctRowHTML(id, pos, text) {
    return `
      <div class="ef-ord-correct-row" draggable="true"
           data-order-index="${pos}" data-item-id="${id}">
        <span class="ef-ord-position-badge">${pos + 1}</span>
        <span class="ord-correct-id">${id}</span>
        <span class="ef-ord-correct-text">${text}</span>
        <span class="ef-ord-correct-drag">⠿</span>
      </div>
    `;
  }

  // ── Private: sync ────────────────────────────────────

  _syncCorrectList() {
    const itemTexts = Array.from(this._root.querySelectorAll('.ord-item-text'))
      .map(inp => inp.value.trim());
    const tempIds   = itemTexts.map((_, i) => String.fromCharCode(65 + i));

    const currentOrder = Array.from(
      this._root.querySelectorAll('.ef-ord-correct-row')
    ).map(row => row.dataset.itemId);

    const existingValid = currentOrder.filter(id => tempIds.includes(id));
    const newIds        = tempIds.filter(id => !existingValid.includes(id));
    const finalOrder    = [...existingValid, ...newIds];

    const idToText = {};
    itemTexts.forEach((text, i) => { idToText[tempIds[i]] = text; });

    const correctList = this._root.querySelector('#ef-ord-correct-list');
    if (!correctList) return;

    correctList.innerHTML = finalOrder
      .map((id, pos) => this._correctRowHTML(id, pos, idToText[id] || ''))
      .join('');

    this._bindCorrectListDrag();
  }

  _updateCorrectListText() {
    const itemTexts = Array.from(this._root.querySelectorAll('.ord-item-text'))
      .map(inp => inp.value.trim());
    const tempIds = itemTexts.map((_, i) => String.fromCharCode(65 + i));
    const idToText = {};
    itemTexts.forEach((text, i) => { idToText[tempIds[i]] = text; });

    this._root.querySelectorAll('.ef-ord-correct-row').forEach(row => {
      const textEl = row.querySelector('.ef-ord-correct-text');
      if (textEl && idToText[row.dataset.itemId] !== undefined) {
        textEl.innerHTML = idToText[row.dataset.itemId];
      }
    });
  }

  // ── Private: reindex / reorder ───────────────────────

  _reindexItems() {
    this._root.querySelectorAll('.ef-ord-item-row').forEach((row, i) => {
      row.dataset.itemIndex = i;
      const inp = row.querySelector('.ord-item-text');
      if (inp) inp.dataset.itemIndex = i;
    });
  }

  _reorderItemRows(from, to) {
    const list = this._root.querySelector('#ef-ord-items-list');
    const rows = Array.from(list.querySelectorAll('.ef-ord-item-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexItems();
  }

  _reorderCorrectRows(from, to) {
    const list = this._root.querySelector('#ef-ord-correct-list');
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

  // ── Private: event binding ────────────────────────────

  _bindItemListEvents(list) {

    // Focus → shared preview
    list.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ord-item-text')) return;
      const row   = e.target.closest('.ef-ord-item-row');
      const index = parseInt(row.dataset.itemIndex);
      list.querySelectorAll('.ef-ord-item-row')
        .forEach(r => r.classList.remove('ef-ord-focused-row'));
      row.classList.add('ef-ord-focused-row');
      const box     = this._root.querySelector('#ord-item-preview-box');
      const label   = this._root.querySelector('#ord-item-preview-label');
      const content = this._root.querySelector('#ord-item-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing item ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    // Input → live preview + sync correct list text
    list.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ord-item-text')) return;
      const row     = e.target.closest('.ef-ord-item-row');
      const index   = parseInt(row.dataset.itemIndex);
      const content = this._root.querySelector('#ord-item-preview-content');
      const label   = this._root.querySelector('#ord-item-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing item ${index + 1}`;
      }
      this._updateCorrectListText();
    });

    // Delete item
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ord-item-delete')) return;
      e.target.closest('.ef-ord-item-row').remove();
      this._reindexItems();
      this._syncCorrectList();
      if (!list.querySelectorAll('.ef-ord-item-row').length) {
        this._root.querySelector('#ord-item-preview-box')?.classList.remove('visible');
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

  _bindCorrectListDrag() {
    const list = this._root.querySelector('#ef-ord-correct-list');
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

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class ORDMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-ord-field">
        <label class="ef-ord-label">
          Explanation <span class="ef-ord-optional">(optional)</span>
        </label>
        <textarea class="ef-ord-textarea" id="ef-ord-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${ORDFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-ord-render-preview" id="ef-ord-explanation-preview"></div>
      </div>

      <div class="ef-ord-field">
        <label class="ef-ord-label">Difficulty</label>
        <select class="ef-ord-select" id="ef-ord-difficulty">
          ${diffOptions}
        </select>
      </div>

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

      <div class="ef-ord-field">
        <label class="ef-ord-label">
          Tags <span class="ef-ord-optional">(comma separated)</span>
        </label>
        <input class="ef-ord-input" id="ef-ord-tags" type="text"
          placeholder="e.g. history, sequence"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    ORDFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ord-explanation'),
      this._root.querySelector('#ef-ord-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-ord-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-ord-difficulty')?.value || 'easy',
      points:      ORDFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ord-points')),
      time_limit:  ORDFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ord-time-limit')),
      tags:        ORDFormUtils.parseTags(this._root.querySelector('#ef-ord-tags')),
    };
  }

}

// ── Orchestrator ──────────────────────────────────────────────────────────────

class OrderingFormComponent extends HTMLElement {

  connectedCallback() {
    this._question = null;
    this._index    = -1;
    this._render();
    this._bindAll();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._render();
    this._bindAll();
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('ordering');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'ordering') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Ordering';
    const bodyClass    = isSkip ? 'ef-ord-body ef-ord-is-skip' : 'ef-ord-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new ORDQuestionWidget(this);
    const mediaWidget = new ORDMediaWidget(this);
    const ansWidget   = new ORDAnswerWidget(this);
    const metaWidget  = new ORDMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-ord-form">
        <div class="${bodyClass}" id="ef-ord-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-ord-footer">
          <button class="ef-ord-btn-save" id="ef-ord-btn-save">Save</button>
          <button class="ef-ord-btn-skip" id="ef-ord-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new ORDQuestionWidget(this);
    this._mediaWidget = new ORDMediaWidget(this);
    this._ansWidget   = new ORDAnswerWidget(this);
    this._metaWidget  = new ORDMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

  _bindFooter() {
    this.querySelector('#ef-ord-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-ord-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'ordering') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Ordering';
    const body      = this.querySelector('#ef-ord-body');
    const btn       = this.querySelector('#ef-ord-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'ordering';
      delete this._question.original_type;
      body.classList.remove('ef-ord-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-ord-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-ord-question')?.focus();
      return;
    }

    const items = this._ansWidget.getItems();
    if (items.length < 2) {
      this._ansWidget.showError('At least 2 items are required.');
      return;
    }

    const saved = {
      type:          this._question?.type || 'ordering',
      question:      questionText,
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      items:         items,
      correct_order: this._ansWidget.getCorrectOrder(),
      user_response: '',
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

  // ── Collect all data ─────────────────────────────────

  _collectData() {
    return {
      type:          this._question?.type || 'ordering',
      question:      this._qWidget.getValue(),
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      items:         this._ansWidget.getItems(),
      correct_order: this._ansWidget.getCorrectOrder(),
      user_response: '',
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('ordering-form', OrderingFormComponent);