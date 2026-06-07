// editor/components/question_forms/fill_in_blank_multi_graph_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class FIBMGTFormUtils {

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

  // Returns truncated plain-text preview of rich content (strips tags)
  static collapsePreview(str, maxLen = 40) {
    const plain = String(str || '').replace(/<[^>]*>/g, '').trim();
    if (!plain) return '—';
    return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain;
  }

}

// ── Question Widget ───────────────────────────────────────────────────────────

class FIBMGTQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-fibmgt-field">
        <label class="ef-fibmgt-label">Question Text</label>
        <textarea class="ef-fibmgt-textarea" id="ef-fibmgt-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${FIBMGTFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-fibmgt-render-preview" id="ef-fibmgt-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    FIBMGTFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-fibmgt-question'),
      this._root.querySelector('#ef-fibmgt-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-fibmgt-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────

class FIBMGTMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${FIBMGTFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-fibmgt-img-preview visible' : 'ef-fibmgt-img-preview';

    return `
      <div class="ef-fibmgt-collapsible" id="ef-fibmgt-svg-section">
        <div class="ef-fibmgt-collapsible-header" id="ef-fibmgt-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-fibmgt-collapsible-arrow">▼</span>
        </div>
        <div class="ef-fibmgt-collapsible-body">
          <textarea class="ef-fibmgt-textarea" id="ef-fibmgt-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${FIBMGTFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-fibmgt-svg-preview" id="ef-fibmgt-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-fibmgt-remove-btn" id="ef-fibmgt-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-fibmgt-collapsible" id="ef-fibmgt-img-section">
        <div class="ef-fibmgt-collapsible-header" id="ef-fibmgt-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-fibmgt-collapsible-arrow">▼</span>
        </div>
        <div class="ef-fibmgt-collapsible-body">
          <input class="ef-fibmgt-input" id="ef-fibmgt-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${FIBMGTFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-fibmgt-img-preview">${imgThumb}</div>
          <button class="ef-fibmgt-remove-btn" id="ef-fibmgt-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    FIBMGTFormUtils.bindCollapsible(
      this._root.querySelector('#ef-fibmgt-svg-toggle'),
      this._root.querySelector('#ef-fibmgt-svg-section')
    );
    this._root.querySelector('#ef-fibmgt-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-fibmgt-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-fibmgt-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-fibmgt-svg').value = '';
      this._root.querySelector('#ef-fibmgt-svg-preview').innerHTML = '';
    });

    FIBMGTFormUtils.bindCollapsible(
      this._root.querySelector('#ef-fibmgt-img-toggle'),
      this._root.querySelector('#ef-fibmgt-img-section')
    );
    this._root.querySelector('#ef-fibmgt-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-fibmgt-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-fibmgt-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-fibmgt-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-fibmgt-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-fibmgt-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${FIBMGTFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: center_label, value_choices list, blocks accordion, scoring_method,
//       description, case_sensitive

class FIBMGTAnswerWidget {

  constructor(root) {
    this._root        = root;
    this._dragSrcChoice = null;
    this._dragSrcBlock  = null;
    this._activeBlock   = null;  // index of currently expanded block
  }

  render(q) {
    const centerLabel   = q.center_label || '';
    const valueChoices  = q.value_choices || [];
    const blocks        = q.blocks || [];
    const correctAnswer = q.correct_answer || [];
    const scoring       = q.scoring_method || 'exact';
    const description   = q.description || '';
    const caseSensitive = !!q.case_sensitive;

    return `
      <!-- center_label -->
      <div class="ef-fibmgt-field">
        <label class="ef-fibmgt-label">Center Label</label>
        <input class="ef-fibmgt-input" id="ef-fibmgt-center-label" type="text"
          placeholder="e.g. 3 (the central node value)"
          value="${FIBMGTFormUtils.escHtml(centerLabel)}"
        />
      </div>

      <!-- value_choices -->
      <div class="ef-fibmgt-field">
        <div class="ef-fibmgt-options-header">
          <label class="ef-fibmgt-label">
            Value Choices
            <span class="ef-fibmgt-optional">(optional — pool of selectable values)</span>
          </label>
          <button class="ef-fibmgt-add-option-btn" id="ef-fibmgt-add-choice">+ Add Choice</button>
        </div>
        <div class="ef-fibmgt-choices-list" id="ef-fibmgt-choices-list">
          ${valueChoices.map((v, i) => this._choiceRowHTML(v, i)).join('')}
        </div>
        <div class="ef-fibmgt-choice-preview-box" id="ef-fibmgt-choice-preview-box">
          <div class="ef-fibmgt-option-preview-label" id="ef-fibmgt-choice-preview-label">
            Previewing choice 1
          </div>
          <div class="ef-fibmgt-option-preview-content"
               id="ef-fibmgt-choice-preview-content"></div>
        </div>
      </div>

      <!-- blocks -->
      <div class="ef-fibmgt-field">
        <div class="ef-fibmgt-options-header">
          <label class="ef-fibmgt-label">Blocks</label>
          <button class="ef-fibmgt-add-option-btn" id="ef-fibmgt-add-block">+ Add Block</button>
        </div>
        <div class="ef-fibmgt-blocks-list" id="ef-fibmgt-blocks-list">
          ${blocks.map((blk, i) =>
            this._blockCardHTML(blk, correctAnswer[i] || '', i, true)
          ).join('')}
        </div>
        <div class="ef-fibmgt-error" id="ef-fibmgt-blocks-error"></div>
      </div>

      <!-- scoring_method -->
      <div class="ef-fibmgt-field">
        <label class="ef-fibmgt-label">Scoring Method</label>
        <select class="ef-fibmgt-select" id="ef-fibmgt-scoring-method">
          <option value="exact"   ${scoring === 'exact'   ? 'selected' : ''}>Exact — all blanks must be correct</option>
          <option value="partial" ${scoring === 'partial' ? 'selected' : ''}>Partial — credit per correct blank</option>
        </select>
      </div>

      <!-- description -->
      <div class="ef-fibmgt-field">
        <label class="ef-fibmgt-label">
          Description
          <span class="ef-fibmgt-optional">(optional)</span>
        </label>
        <textarea class="ef-fibmgt-textarea" id="ef-fibmgt-description"
          rows="2"
          placeholder="Additional description or instruction..."
        >${FIBMGTFormUtils.escHtml(description)}</textarea>
      </div>

      <!-- case_sensitive -->
      <div class="ef-fibmgt-field">
        <label class="ef-fibmgt-label">Options</label>
        <label class="ef-fibmgt-checkbox-label">
          <input type="checkbox" class="ef-fibmgt-checkbox" id="ef-fibmgt-case-sensitive"
            ${caseSensitive ? 'checked' : ''} />
          Case sensitive answers
        </label>
      </div>
    `;
  }

  bindEvents() {
    // Add choice
    this._root.querySelector('#ef-fibmgt-add-choice')
      ?.addEventListener('click', () => this._addChoiceRow());

    // Add block
    this._root.querySelector('#ef-fibmgt-add-block')
      ?.addEventListener('click', () => this._addBlockCard());

    // Choice list events (delegated)
    const choiceList = this._root.querySelector('#ef-fibmgt-choices-list');
    if (choiceList) this._bindChoiceListEvents(choiceList);

    // Block list events (delegated)
    const blockList = this._root.querySelector('#ef-fibmgt-blocks-list');
    if (blockList) this._bindBlockListEvents(blockList);
  }

  // ── Getters ───────────────────────────────────────────

  getValueChoices() {
    return Array.from(
      this._root.querySelectorAll('.ef-fibmgt-choice-input')
    ).map(inp => inp.value.trim());
  }

  getBlocks() {
    const cards = this._root.querySelectorAll('.ef-fibmgt-block-card');
    return Array.from(cards).map(card => ({
      a: card.querySelector('.ef-fibmgt-block-a')?.value.trim() || '',
      b: card.querySelector('.ef-fibmgt-block-b')?.value.trim() || '',
    }));
  }

  getCorrectAnswer() {
    const cards = this._root.querySelectorAll('.ef-fibmgt-block-card');
    return Array.from(cards).map(card =>
      card.querySelector('.ef-fibmgt-block-correct')?.value.trim() || ''
    );
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-fibmgt-scoring-method')?.value || 'exact';
  }

  getDescription() {
    return this._root.querySelector('#ef-fibmgt-description')?.value.trim() || '';
  }

  getCaseSensitive() {
    return this._root.querySelector('#ef-fibmgt-case-sensitive')?.checked || false;
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-fibmgt-blocks-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Choice row HTML ───────────────────────────────────

  _choiceRowHTML(value, index) {
    const preview = FIBMGTFormUtils.collapsePreview(value, 20);
    return `
      <div class="ef-fibmgt-choice-pill" draggable="true" data-choice-index="${index}"
           title="${FIBMGTFormUtils.escHtml(value)}">
        <span class="ef-fibmgt-drag-handle ef-fibmgt-pill-handle">⠿</span>
        <span class="ef-fibmgt-pill-text">${FIBMGTFormUtils.escHtml(preview || '…')}</span>
        <input type="text"
               class="ef-fibmgt-choice-input"
               value="${FIBMGTFormUtils.escHtml(value)}"
               data-choice-index="${index}"
               style="display:none"
        />
        <button class="ef-fibmgt-pill-delete ef-fibmgt-choice-delete"
                title="Delete choice">✕</button>
      </div>
    `;
  }

  // ── Block card HTML ───────────────────────────────────
  // collapsed=true → shows summary row only
  // collapsed=false → shows full edit fields

  _blockCardHTML(blk, correct, index, collapsed) {
    const a       = blk.a != null ? String(blk.a) : '';
    const b       = blk.b != null ? String(blk.b) : '';
    const summary = FIBMGTFormUtils.collapsePreview(`${a}${b ? ' ' + b : ''}`, 36);

    return `
      <div class="ef-fibmgt-block-card ${collapsed ? '' : 'ef-fibmgt-block-open'}"
           draggable="true" data-block-index="${index}">

        <!-- collapsed header — always visible -->
        <div class="ef-fibmgt-block-header">
          <span class="ef-fibmgt-drag-handle">⠿</span>
          <span class="ef-fibmgt-block-num">#${index + 1}</span>
          <span class="ef-fibmgt-block-summary">${FIBMGTFormUtils.escHtml(summary)}</span>
          <span class="ef-fibmgt-block-arrow">▼</span>
          <button class="ef-fibmgt-block-delete" title="Delete block">✕</button>
        </div>

        <!-- expanded body -->
        <div class="ef-fibmgt-block-body">
          <div class="ef-fibmgt-block-fields">

            <!-- inputs row -->
            <div class="ef-fibmgt-block-inputs-row">
              <div class="ef-fibmgt-field">
                <label class="ef-fibmgt-label">a <span class="ef-fibmgt-optional">(blank value)</span></label>
                <textarea class="ef-fibmgt-textarea ef-fibmgt-block-a"
                  rows="2" placeholder="Value of a"
                >${FIBMGTFormUtils.escHtml(a)}</textarea>
              </div>
              <div class="ef-fibmgt-field">
                <label class="ef-fibmgt-label">b <span class="ef-fibmgt-optional">(operator / label)</span></label>
                <textarea class="ef-fibmgt-textarea ef-fibmgt-block-b"
                  rows="2" placeholder="Operator or label"
                >${FIBMGTFormUtils.escHtml(b)}</textarea>
              </div>
              <div class="ef-fibmgt-field">
                <label class="ef-fibmgt-label">Correct Answer</label>
                <textarea class="ef-fibmgt-textarea ef-fibmgt-block-correct"
                  rows="2" placeholder="Correct answer"
                >${FIBMGTFormUtils.escHtml(correct)}</textarea>
              </div>
            </div>

            <!-- previews row -->
            <div class="ef-fibmgt-block-previews-row">
              <div class="ef-fibmgt-render-preview ef-fibmgt-block-a-preview"></div>
              <div class="ef-fibmgt-render-preview ef-fibmgt-block-b-preview"></div>
              <div class="ef-fibmgt-render-preview ef-fibmgt-block-correct-preview"></div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  // ── Add rows ──────────────────────────────────────────

  _addChoiceRow() {
    const list  = this._root.querySelector('#ef-fibmgt-choices-list');
    const count = list.querySelectorAll('.ef-fibmgt-choice-pill').length;
    const div   = document.createElement('div');
    div.innerHTML = this._choiceRowHTML('', count);
    const pill = div.firstElementChild;
    list.appendChild(pill);
    this._reindexChoices();
    this._openPillEditor(pill);
  }

  _addBlockCard() {
    const list  = this._root.querySelector('#ef-fibmgt-blocks-list');
    const count = list.querySelectorAll('.ef-fibmgt-block-card').length;
    const div   = document.createElement('div');
    div.innerHTML = this._blockCardHTML({ a: '', b: '' }, '', count, false);
    const card = div.firstElementChild;
    list.appendChild(card);
    this._reindexBlocks();
    // collapse all others, expand new one
    this._setActiveBlock(card);
    this._bindBlockCardEvents(card);
    card.querySelector('.ef-fibmgt-block-a')?.focus();
  }

  // ── Reindex ───────────────────────────────────────────

  _reindexChoices() {
    this._root.querySelectorAll('.ef-fibmgt-choice-pill').forEach((pill, i) => {
      pill.dataset.choiceIndex = i;
      const inp = pill.querySelector('.ef-fibmgt-choice-input');
      if (inp) inp.dataset.choiceIndex = i;
    });
  }

  _reindexBlocks() {
    this._root.querySelectorAll('.ef-fibmgt-block-card').forEach((card, i) => {
      card.dataset.blockIndex = i;
      const num = card.querySelector('.ef-fibmgt-block-num');
      if (num) num.textContent = `#${i + 1}`;
    });
  }

  // ── Active block (expand/collapse) ───────────────────

  _setActiveBlock(activeCard) {
    this._root.querySelectorAll('.ef-fibmgt-block-card').forEach(card => {
      if (card === activeCard) {
        card.classList.add('ef-fibmgt-block-open');
      } else {
        card.classList.remove('ef-fibmgt-block-open');
        this._updateBlockSummary(card);
      }
    });
  }

  _updateBlockSummary(card) {
    const a   = card.querySelector('.ef-fibmgt-block-a')?.value.trim() || '';
    const b   = card.querySelector('.ef-fibmgt-block-b')?.value.trim() || '';
    const sum = FIBMGTFormUtils.collapsePreview(`${a}${b ? ' ' + b : ''}`, 36);
    const el  = card.querySelector('.ef-fibmgt-block-summary');
    if (el) el.textContent = sum;
  }

  // ── Choice list events ────────────────────────────────

  _bindChoiceListEvents(choiceList) {

    // Click pill text → open inline editor
    choiceList.addEventListener('click', (e) => {
      const pill = e.target.closest('.ef-fibmgt-choice-pill');
      if (!pill) return;
      if (e.target.classList.contains('ef-fibmgt-choice-delete')) return;
      if (e.target.classList.contains('ef-fibmgt-pill-handle')) return;
      this._openPillEditor(pill);
    });

    // Delete
    choiceList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-fibmgt-choice-delete')) return;
      e.target.closest('.ef-fibmgt-choice-pill').remove();
      this._reindexChoices();
      if (!choiceList.querySelectorAll('.ef-fibmgt-choice-pill').length) {
        this._root.querySelector('#ef-fibmgt-choice-preview-box')?.classList.remove('visible');
      }
    });

    // Drag reorder
    choiceList.addEventListener('dragstart', (e) => {
      const pill = e.target.closest('.ef-fibmgt-choice-pill');
      if (!pill) return;
      this._dragSrcChoice = parseInt(pill.dataset.choiceIndex);
      pill.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    choiceList.addEventListener('dragend', () => {
      choiceList.querySelectorAll('.ef-fibmgt-choice-pill')
        .forEach(p => p.classList.remove('dragging', 'drag-over'));
    });
    choiceList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const pill = e.target.closest('.ef-fibmgt-choice-pill');
      if (pill && parseInt(pill.dataset.choiceIndex) !== this._dragSrcChoice) {
        choiceList.querySelectorAll('.ef-fibmgt-choice-pill')
          .forEach(p => p.classList.remove('drag-over'));
        pill.classList.add('drag-over');
      }
    });
    choiceList.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-fibmgt-choice-pill');
      if (!target) return;
      const to   = parseInt(target.dataset.choiceIndex);
      const from = this._dragSrcChoice;
      if (from === null || from === to) return;
      target.classList.remove('drag-over');
      this._reorderChoiceRows(from, to);
    });
  }

  // Open an inline edit input on a pill — replaces pill-text with real input
  _openPillEditor(pill) {
    // Already editing
    if (pill.querySelector('.ef-fibmgt-pill-editor')) return;

    const hiddenInput = pill.querySelector('.ef-fibmgt-choice-input');
    const pillText    = pill.querySelector('.ef-fibmgt-pill-text');
    const currentVal  = hiddenInput?.value || '';

    // Replace pill-text with an inline editor input
    const editor = document.createElement('input');
    editor.type        = 'text';
    editor.className   = 'ef-fibmgt-pill-editor';
    editor.value       = currentVal;
    editor.placeholder = 'Choice value...';

    pillText.style.display = 'none';
    pill.insertBefore(editor, pillText);
    editor.focus();

    // Live preview
    const box     = this._root.querySelector('#ef-fibmgt-choice-preview-box');
    const label   = this._root.querySelector('#ef-fibmgt-choice-preview-label');
    const content = this._root.querySelector('#ef-fibmgt-choice-preview-content');
    const index   = parseInt(pill.dataset.choiceIndex);
    box.classList.add('visible');
    label.textContent = `Previewing choice ${index + 1}`;
    content.innerHTML = currentVal;

    editor.addEventListener('input', () => {
      content.innerHTML = editor.value;
    });

    const commit = () => {
      const val = editor.value.trim();
      if (hiddenInput) hiddenInput.value = val;
      const preview = FIBMGTFormUtils.collapsePreview(val, 20);
      pillText.textContent = preview || '…';
      pill.title = val;
      editor.remove();
      pillText.style.display = '';
    };

    editor.addEventListener('blur', commit);
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { editor.value = currentVal; commit(); }
    });
  }

  _reorderChoiceRows(from, to) {
    const list  = this._root.querySelector('#ef-fibmgt-choices-list');
    const pills = Array.from(list.querySelectorAll('.ef-fibmgt-choice-pill'));
    const moved = pills.splice(from, 1)[0];
    pills.splice(to, 0, moved);
    list.innerHTML = '';
    pills.forEach(p => list.appendChild(p));
    this._reindexChoices();
  }

  // ── Block list events ─────────────────────────────────

  _bindBlockListEvents(blockList) {

    // Bind each existing card
    blockList.querySelectorAll('.ef-fibmgt-block-card').forEach(card => {
      this._bindBlockCardEvents(card);
    });

    // Drag reorder on block list
    blockList.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.ef-fibmgt-block-card');
      if (!card) return;
      // Only drag from header handle
      if (!e.target.classList.contains('ef-fibmgt-drag-handle')) return;
      this._dragSrcBlock = parseInt(card.dataset.blockIndex);
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    blockList.addEventListener('dragend', () => {
      blockList.querySelectorAll('.ef-fibmgt-block-card')
        .forEach(c => c.classList.remove('dragging', 'drag-over'));
    });
    blockList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const card = e.target.closest('.ef-fibmgt-block-card');
      if (card && parseInt(card.dataset.blockIndex) !== this._dragSrcBlock) {
        blockList.querySelectorAll('.ef-fibmgt-block-card')
          .forEach(c => c.classList.remove('drag-over'));
        card.classList.add('drag-over');
      }
    });
    blockList.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-fibmgt-block-card');
      if (!target) return;
      const to   = parseInt(target.dataset.blockIndex);
      const from = this._dragSrcBlock;
      if (from == null || from === to) return;
      target.classList.remove('drag-over');
      this._reorderBlockCards(from, to);
    });
  }

  _bindBlockCardEvents(card) {

    // Click header → toggle expand/collapse
    const header = card.querySelector('.ef-fibmgt-block-header');
    header?.addEventListener('click', (e) => {
      // Don't toggle if delete button clicked
      if (e.target.classList.contains('ef-fibmgt-block-delete')) return;
      const isOpen = card.classList.contains('ef-fibmgt-block-open');
      if (isOpen) {
        card.classList.remove('ef-fibmgt-block-open');
        this._updateBlockSummary(card);
      } else {
        this._setActiveBlock(card);
      }
    });

    // Delete block
    card.querySelector('.ef-fibmgt-block-delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      card.remove();
      this._reindexBlocks();
    });

    // Focus previews for a, b, correct fields
    const aField       = card.querySelector('.ef-fibmgt-block-a');
    const aPreview     = card.querySelector('.ef-fibmgt-block-a-preview');
    const bField       = card.querySelector('.ef-fibmgt-block-b');
    const bPreview     = card.querySelector('.ef-fibmgt-block-b-preview');
    const correctField = card.querySelector('.ef-fibmgt-block-correct');
    const correctPrev  = card.querySelector('.ef-fibmgt-block-correct-preview');

    FIBMGTFormUtils.bindFocusPreview(aField, aPreview);
    FIBMGTFormUtils.bindFocusPreview(bField, bPreview);
    FIBMGTFormUtils.bindFocusPreview(correctField, correctPrev);

    // Live update summary on input
    [aField, bField].forEach(el => {
      el?.addEventListener('input', () => {
        if (!card.classList.contains('ef-fibmgt-block-open')) {
          this._updateBlockSummary(card);
        }
      });
    });
  }

  _reorderBlockCards(from, to) {
    const list  = this._root.querySelector('#ef-fibmgt-blocks-list');
    const cards = Array.from(list.querySelectorAll('.ef-fibmgt-block-card'));
    const moved = cards.splice(from, 1)[0];
    cards.splice(to, 0, moved);
    list.innerHTML = '';
    cards.forEach(c => {
      list.appendChild(c);
      this._bindBlockCardEvents(c);
    });
    this._reindexBlocks();
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────

class FIBMGTMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-fibmgt-field">
        <label class="ef-fibmgt-label">
          Explanation
          <span class="ef-fibmgt-optional">(optional)</span>
        </label>
        <textarea class="ef-fibmgt-textarea" id="ef-fibmgt-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${FIBMGTFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-fibmgt-render-preview" id="ef-fibmgt-explanation-preview"></div>
      </div>

      <div class="ef-fibmgt-field">
        <label class="ef-fibmgt-label">Difficulty</label>
        <select class="ef-fibmgt-select" id="ef-fibmgt-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-fibmgt-row-2">
        <div class="ef-fibmgt-field">
          <label class="ef-fibmgt-label">
            Points <span class="ef-fibmgt-optional">(optional)</span>
          </label>
          <input class="ef-fibmgt-input" id="ef-fibmgt-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-fibmgt-field">
          <label class="ef-fibmgt-label">
            Time Limit (sec) <span class="ef-fibmgt-optional">(optional)</span>
          </label>
          <input class="ef-fibmgt-input" id="ef-fibmgt-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-fibmgt-field">
        <label class="ef-fibmgt-label">
          Tags <span class="ef-fibmgt-optional">(comma separated)</span>
        </label>
        <input class="ef-fibmgt-input" id="ef-fibmgt-tags" type="text"
          placeholder="e.g. math, addition"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    FIBMGTFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-fibmgt-explanation'),
      this._root.querySelector('#ef-fibmgt-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-fibmgt-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-fibmgt-difficulty')?.value || 'easy',
      points:      FIBMGTFormUtils.parseOptionalNumber(this._root.querySelector('#ef-fibmgt-points')),
      time_limit:  FIBMGTFormUtils.parseOptionalNumber(this._root.querySelector('#ef-fibmgt-time-limit')),
      tags:        FIBMGTFormUtils.parseTags(this._root.querySelector('#ef-fibmgt-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class FIBMGTFormComponent extends HTMLElement {

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

  // ── Render ───────────────────────────────────────────

  _render() {
    const q          = this._question || EditorFormRegistry.getDefault('fill_in_blank_multi_graph');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'fill_in_blank_multi_graph') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Fill Blank Graph';
    const bodyClass    = isSkip ? 'ef-fibmgt-body ef-fibmgt-is-skip' : 'ef-fibmgt-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new FIBMGTQuestionWidget(this);
    const mediaWidget = new FIBMGTMediaWidget(this);
    const ansWidget   = new FIBMGTAnswerWidget(this);
    const metaWidget  = new FIBMGTMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-fibmgt-form">
        <div class="${bodyClass}" id="ef-fibmgt-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-fibmgt-footer">
          <button class="ef-fibmgt-btn-save" id="ef-fibmgt-btn-save">Save</button>
          <button class="ef-fibmgt-btn-skip" id="ef-fibmgt-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind ─────────────────────────────────────────────

  _bindAll() {
    this._qWidget     = new FIBMGTQuestionWidget(this);
    this._mediaWidget = new FIBMGTMediaWidget(this);
    this._ansWidget   = new FIBMGTAnswerWidget(this);
    this._metaWidget  = new FIBMGTMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  _bindFooter() {
    this.querySelector('#ef-fibmgt-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-fibmgt-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  // ── Skip toggle ──────────────────────────────────────

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip
        ? (this._question.original_type || 'fill_in_blank_multi_graph')
        : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Fill Blank Graph';
    const body      = this.querySelector('#ef-fibmgt-body');
    const btn       = this.querySelector('#ef-fibmgt-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'fill_in_blank_multi_graph';
      delete this._question.original_type;
      body.classList.remove('ef-fibmgt-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-fibmgt-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-fibmgt-question')?.focus();
      return;
    }

    const blocks = this._ansWidget.getBlocks();
    if (blocks.length < 1) {
      this._ansWidget.showError('At least 1 block is required.');
      return;
    }

    const saved = this._collectData();
    if (this._question?.original_type) {
      saved.original_type = this._question.original_type;
    }

    this.dispatchEvent(new CustomEvent('question-saved', {
      bubbles: true,
      detail:  { index: this._index, question: saved },
    }));
  }

  // ── Collect ──────────────────────────────────────────

  _collectData() {
    const blocks        = this._ansWidget.getBlocks();
    const correctAnswer = this._ansWidget.getCorrectAnswer();

    return {
      type:           this._question?.type || 'fill_in_blank_multi_graph',
      question:       this._qWidget.getValue(),
      svg_content:    this._mediaWidget.getSvg(),
      img_url:        this._mediaWidget.getImgUrl(),
      center_label:   this.querySelector('#ef-fibmgt-center-label')?.value.trim() || '',
      blocks,
      value_choices:  this._ansWidget.getValueChoices(),
      correct_answer: correctAnswer,
      user_response:  blocks.map(() => ''),
      scoring_method: this._ansWidget.getScoringMethod(),
      description:    this._ansWidget.getDescription(),
      case_sensitive: this._ansWidget.getCaseSensitive(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('fill-in-blank-multi-graph-form', FIBMGTFormComponent);