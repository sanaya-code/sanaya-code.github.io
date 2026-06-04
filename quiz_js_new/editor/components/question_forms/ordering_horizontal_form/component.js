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
// Owns: question textarea + focus preview

class ORHQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-orh-field">
        <label class="ef-orh-label">Question Text</label>
        <textarea class="ef-orh-textarea" id="ef-orh-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
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
// Owns: SVG collapsible + Image URL collapsible

class ORHMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${ORHFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-orh-img-preview visible' : 'ef-orh-img-preview';

    return `
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
          >${ORHFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-orh-svg-preview" id="ef-orh-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-orh-remove-btn" id="ef-orh-svg-remove">Remove SVG</button>
        </div>
      </div>

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

  getSvg() {
    return this._root.querySelector('#ef-orh-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-orh-img-url')?.value.trim() || '';
  }

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
// Owns: items list (add/delete/drag) + correct order list (drag + Show checkbox)
// Unique to ordering_horizontal: correct order rows have a "Show" checkbox
// that determines initial_items (pre-filled slots) on save

class ORHAnswerWidget {

  constructor(root) {
    this._root         = root;
    this._itemDragSrc  = null;
    this._orderDragSrc = null;
  }

  render(q) {
    const items        = Array.isArray(q.items)         ? q.items         : [];
    const correctOrder = Array.isArray(q.correct_order) ? q.correct_order : [];
    const initialItems = Array.isArray(q.initial_items) ? q.initial_items : [];

    return `
      <div class="ef-orh-field">
        <div class="ef-orh-items-header">
          <label class="ef-orh-label">Items</label>
          <button class="ef-orh-add-item-btn" id="ef-orh-add-item">+ Add Item</button>
        </div>
        <div class="ef-orh-items-list" id="ef-orh-items-list">
          ${items.map((val, i) => this._itemRowHTML(val, i)).join('')}
        </div>
        <div class="ef-orh-item-preview-box" id="ef-orh-item-preview-box">
          <div class="ef-orh-item-preview-label" id="ef-orh-item-preview-label">
            Previewing item 1
          </div>
          <div class="ef-orh-item-preview-content"
               id="ef-orh-item-preview-content"></div>
        </div>
        <div class="ef-orh-error" id="ef-orh-error"></div>
      </div>

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
    `;
  }

  bindEvents() {
    this._root.querySelector('#ef-orh-add-item')
      ?.addEventListener('click', () => this.addItemRow());

    const itemsList = this._root.querySelector('#ef-orh-items-list');
    if (itemsList) this._bindItemListEvents(itemsList);

    this._bindCorrectListDrag();

    // Show checkbox toggle
    this._root.querySelector('#ef-orh-correct-list-wrap')
      ?.addEventListener('change', (e) => {
        if (!e.target.classList.contains('ef-orh-show-cb')) return;
        e.target.closest('.ef-orh-correct-row')
          .classList.toggle('is-shown', e.target.checked);
      });
  }

  addItemRow() {
    const list  = this._root.querySelector('#ef-orh-items-list');
    const count = list.querySelectorAll('.ef-orh-item-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._itemRowHTML('', count);
    list.appendChild(div.firstElementChild);
    this._reindexItems();
    this._syncCorrectList();
    list.querySelector('.ef-orh-item-row:last-child .ef-orh-item-text')?.focus();
  }

  getItemTexts() {
    return Array.from(this._root.querySelectorAll('.ef-orh-item-text'))
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);
  }

  getCorrectOrderAndInitial() {
    const correctOrder = [];
    const initialItems = [];
    this._root.querySelectorAll('#ef-orh-correct-list-wrap .ef-orh-correct-row')
      .forEach(row => {
        const val   = row.dataset.itemVal || '';
        const shown = row.querySelector('.ef-orh-show-cb')?.checked || false;
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

  _itemRowHTML(val, index) {
    return `
      <div class="ef-orh-item-row" draggable="true" data-item-index="${index}">
        <span class="ef-orh-drag-handle">⠿</span>
        <input type="text"
               class="ef-orh-item-text"
               placeholder="Item value"
               value="${ORHFormUtils.escHtml(val)}"
               data-item-index="${index}"
        />
        <button class="ef-orh-item-delete" title="Delete item">✕</button>
      </div>
    `;
  }

  _correctRowHTML(val, index, isShown) {
    return `
      <div class="ef-orh-correct-row ${isShown ? 'is-shown' : ''}"
           draggable="true"
           data-order-index="${index}"
           data-item-val="${ORHFormUtils.escHtml(val)}">
        <span class="ef-orh-position-badge">${index + 1}</span>
        <span class="ef-orh-correct-text">${val}</span>
        <label class="ef-orh-show-label">
          <input type="checkbox" class="ef-orh-show-cb" ${isShown ? 'checked' : ''} />
          Show
        </label>
        <span class="ef-orh-correct-drag">⠿</span>
      </div>
    `;
  }

  _renderCorrectList(items, correctOrder, initialItems) {
    if (!items.length) return '';
    const shownMap = {};
    correctOrder.forEach((val, i) => {
      shownMap[val] = initialItems[i] !== '' && initialItems[i] !== undefined;
    });
    const validOrder = correctOrder.filter(v => items.includes(v));
    const newItems   = items.filter(v => !validOrder.includes(v));
    const order      = validOrder.length === items.length
      ? validOrder
      : [...validOrder, ...newItems];
    return order.map((val, i) =>
      this._correctRowHTML(val, i, shownMap[val] || false)
    ).join('');
  }

  // ── Private: sync ─────────────────────────────────────

  _syncCorrectList() {
    const items = Array.from(this._root.querySelectorAll('.ef-orh-item-text'))
      .map(inp => inp.value.trim())
      .filter(v => v.length > 0);

    const currentRows = Array.from(
      this._root.querySelectorAll('#ef-orh-correct-list-wrap .ef-orh-correct-row')
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

    const list = this._root.querySelector('#ef-orh-correct-list-wrap');
    if (!list) return;

    list.innerHTML = order.map((val, i) =>
      this._correctRowHTML(val, i, shownMap[val] || false)
    ).join('');

    this._bindCorrectListDrag();
  }

  // ── Private: reindex / reorder ────────────────────────

  _reindexItems() {
    this._root.querySelectorAll('.ef-orh-item-row').forEach((row, i) => {
      row.dataset.itemIndex = i;
      const inp = row.querySelector('.ef-orh-item-text');
      if (inp) inp.dataset.itemIndex = i;
    });
  }

  _reorderItemRows(from, to) {
    const list = this._root.querySelector('#ef-orh-items-list');
    const rows = Array.from(list.querySelectorAll('.ef-orh-item-row'));
    const moved = rows.splice(from, 1)[0];
    rows.splice(to, 0, moved);
    list.innerHTML = '';
    rows.forEach(r => list.appendChild(r));
    this._reindexItems();
  }

  _reorderCorrectRows(from, to) {
    const list = this._root.querySelector('#ef-orh-correct-list-wrap');
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

  // ── Private: event binding ────────────────────────────

  _bindItemListEvents(list) {

    list.addEventListener('focusin', (e) => {
      if (!e.target.classList.contains('ef-orh-item-text')) return;
      const row   = e.target.closest('.ef-orh-item-row');
      const index = parseInt(row.dataset.itemIndex);
      list.querySelectorAll('.ef-orh-item-row')
        .forEach(r => r.classList.remove('ef-orh-focused-row'));
      row.classList.add('ef-orh-focused-row');
      const box     = this._root.querySelector('#ef-orh-item-preview-box');
      const label   = this._root.querySelector('#ef-orh-item-preview-label');
      const content = this._root.querySelector('#ef-orh-item-preview-content');
      box.classList.add('visible');
      label.textContent = `Previewing item ${index + 1}`;
      content.innerHTML = e.target.value;
    });

    list.addEventListener('input', (e) => {
      if (!e.target.classList.contains('ef-orh-item-text')) return;
      const row     = e.target.closest('.ef-orh-item-row');
      const index   = parseInt(row.dataset.itemIndex);
      const content = this._root.querySelector('#ef-orh-item-preview-content');
      const label   = this._root.querySelector('#ef-orh-item-preview-label');
      if (content) {
        content.innerHTML = e.target.value;
        label.textContent = `Previewing item ${index + 1}`;
      }
      this._syncCorrectList();
    });

    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-orh-item-delete')) return;
      e.target.closest('.ef-orh-item-row').remove();
      this._reindexItems();
      this._syncCorrectList();
      if (!list.querySelectorAll('.ef-orh-item-row').length) {
        this._root.querySelector('#ef-orh-item-preview-box')?.classList.remove('visible');
      }
    });

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

  _bindCorrectListDrag() {
    const list = this._root.querySelector('#ef-orh-correct-list-wrap');
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

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class ORHMetadataWidget {

  constructor(root) {
    this._root = root;
  }

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
        <select class="ef-orh-select" id="ef-orh-difficulty">
          ${diffOptions}
        </select>
      </div>

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

      <div class="ef-orh-field">
        <label class="ef-orh-label">
          Tags <span class="ef-orh-optional">(comma separated)</span>
        </label>
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

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._index    = index;
    this._question = JSON.parse(JSON.stringify(question));
    this._render();
    this._bindAll();
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('ordering_horizontal');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'ordering_horizontal') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Ordering Horizontal';
    const bodyClass    = isSkip ? 'ef-orh-body ef-orh-is-skip' : 'ef-orh-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new ORHQuestionWidget(this);
    const mediaWidget = new ORHMediaWidget(this);
    const ansWidget   = new ORHAnswerWidget(this);
    const metaWidget  = new ORHMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-orh-form">
        <div class="${bodyClass}" id="ef-orh-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-orh-footer">
          <button class="ef-orh-btn-save" id="ef-orh-btn-save">Save</button>
          <button class="ef-orh-btn-skip" id="ef-orh-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new ORHQuestionWidget(this);
    this._mediaWidget = new ORHMediaWidget(this);
    this._ansWidget   = new ORHAnswerWidget(this);
    this._metaWidget  = new ORHMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer: Save + Skip toggle ───────────────────────

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

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-orh-question')?.focus();
      return;
    }

    const itemTexts = this._ansWidget.getItemTexts();
    if (itemTexts.length < 2) {
      this._ansWidget.showError('At least 2 items are required.');
      return;
    }

    const { correctOrder, initialItems } = this._ansWidget.getCorrectOrderAndInitial();
    const blankCount   = initialItems.filter(v => v === '').length;
    const userResponse = Array(blankCount).fill('');

    const saved = {
      type:          this._question?.type || 'ordering_horizontal',
      question:      questionText,
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      items:         itemTexts,
      correct_order: correctOrder,
      initial_items: initialItems,
      user_response: userResponse,
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
    const { correctOrder, initialItems } = this._ansWidget.getCorrectOrderAndInitial();
    const blankCount = initialItems.filter(v => v === '').length;
    return {
      type:          this._question?.type || 'ordering_horizontal',
      question:      this._qWidget.getValue(),
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      items:         this._ansWidget.getItemTexts(),
      correct_order: correctOrder,
      initial_items: initialItems,
      user_response: Array(blankCount).fill(''),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('ordering-horizontal-form', OrderingHorizontalFormComponent);