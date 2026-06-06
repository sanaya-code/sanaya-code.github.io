// editor/components/question_forms/fill_in_blank_operation_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class FIBOPRFormUtils {

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

  // Convert index to row name: 0→first_row, 1→second_row, etc.
  static rowName(index) {
    const names = ['first_row','second_row','third_row','fourth_row',
                   'fifth_row','sixth_row','seventh_row','eighth_row',
                   'ninth_row','tenth_row'];
    return names[index] || `row_${index + 1}`;
  }

}

// ── Question Widget ───────────────────────────────────────────────────────────
// Owns: question textarea + focus preview

class FIBOPRQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">Question Text</label>
        <textarea class="ef-fibopr-textarea" id="ef-fibopr-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${FIBOPRFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-fibopr-render-preview" id="ef-fibopr-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    FIBOPRFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-fibopr-question'),
      this._root.querySelector('#ef-fibopr-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-fibopr-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: SVG collapsible + Image URL collapsible

class FIBOPRMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${FIBOPRFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-fibopr-img-preview visible' : 'ef-fibopr-img-preview';

    return `
      <div class="ef-fibopr-collapsible" id="ef-fibopr-svg-section">
        <div class="ef-fibopr-collapsible-header" id="ef-fibopr-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-fibopr-collapsible-arrow">▼</span>
        </div>
        <div class="ef-fibopr-collapsible-body">
          <textarea class="ef-fibopr-textarea" id="ef-fibopr-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${FIBOPRFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-fibopr-svg-preview" id="ef-fibopr-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-fibopr-remove-btn" id="ef-fibopr-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-fibopr-collapsible" id="ef-fibopr-img-section">
        <div class="ef-fibopr-collapsible-header" id="ef-fibopr-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-fibopr-collapsible-arrow">▼</span>
        </div>
        <div class="ef-fibopr-collapsible-body">
          <input class="ef-fibopr-input" id="ef-fibopr-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${FIBOPRFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-fibopr-img-preview">${imgThumb}</div>
          <button class="ef-fibopr-remove-btn" id="ef-fibopr-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    FIBOPRFormUtils.bindCollapsible(
      this._root.querySelector('#ef-fibopr-svg-toggle'),
      this._root.querySelector('#ef-fibopr-svg-section')
    );
    this._root.querySelector('#ef-fibopr-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-fibopr-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-fibopr-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-fibopr-svg').value = '';
      this._root.querySelector('#ef-fibopr-svg-preview').innerHTML = '';
    });

    FIBOPRFormUtils.bindCollapsible(
      this._root.querySelector('#ef-fibopr-img-toggle'),
      this._root.querySelector('#ef-fibopr-img-section')
    );
    this._root.querySelector('#ef-fibopr-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-fibopr-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-fibopr-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-fibopr-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-fibopr-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-fibopr-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${FIBOPRFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: operation fields + grid builder + choices + scoring + case sensitive + description

class FIBOPRAnswerWidget {

  constructor(root) {
    this._root = root;
    // Internal state: array of rows, each row is array of {editable, value}
    this._rows = [];
  }

  // ── Load grid state from question data ───────────────

  _loadRows(q) {
    this._rows = [];
    // Determine row count from initial_answer keys
    const rowNames = ['first_row','second_row','third_row','fourth_row',
                      'fifth_row','sixth_row','seventh_row','eighth_row',
                      'ninth_row','tenth_row'];
    const initial  = q.initial_answer  || {};
    const editable = q.editable_answer || {};
    const correct  = q.correct_answer  || {};

    const usedNames = rowNames.filter(n => initial[n] !== undefined);
    if (usedNames.length === 0) { this._rows = []; return; }

    usedNames.forEach((name, ri) => {
      const initRow = initial[name]  || [];
      const editRow = editable[name] || [];
      const corrRow = correct[name]  || [];
      const cells = initRow.map((initVal, ci) => {
        const isEditable = editRow[ci] === true;
        // value in form: if editable → correct answer value, else → display value
        const value = isEditable
          ? (corrRow[ci] !== undefined ? corrRow[ci] : '')
          : initVal;
        return { editable: isEditable, value: String(value) };
      });
      this._rows.push(cells);
    });
  }

  render(q) {
    this._loadRows(q);

    const operation     = q.operation     || { name: '', symbol: '' };
    const choices       = q.choices       || [];
    const scoringMethod = q.scoring_method || 'exact';
    const caseSensitive = !!q.case_sensitive;
    const description   = q.description   || '';

    return `
      <!-- Operation -->
      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">Operation</label>
        <div class="ef-fibopr-row-2">
          <div class="ef-fibopr-field">
            <label class="ef-fibopr-label" style="font-size:10px">Name</label>
            <input class="ef-fibopr-input" id="ef-fibopr-op-name" type="text"
              placeholder="e.g. subtraction"
              value="${FIBOPRFormUtils.escHtml(operation.name || '')}"
            />
          </div>
          <div class="ef-fibopr-field">
            <label class="ef-fibopr-label" style="font-size:10px">Symbol</label>
            <input class="ef-fibopr-input" id="ef-fibopr-op-symbol" type="text"
              placeholder="e.g. -"
              value="${FIBOPRFormUtils.escHtml(operation.symbol || '')}"
            />
          </div>
        </div>
      </div>

      <!-- Grid Builder -->
      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">Grid</label>
        <div class="ef-fibopr-grid-wrap" id="ef-fibopr-grid-wrap">
          ${this._rows.map((cells, ri) => this._rowHTML(cells, ri)).join('')}
          ${this._rows.length === 0
            ? '<div class="ef-fibopr-grid-empty">No rows yet. Add a row below.</div>'
            : ''}
        </div>

        <!-- Add row controls -->
        <div class="ef-fibopr-add-row-bar">
          <input class="ef-fibopr-input ef-fibopr-cell-count-input"
            id="ef-fibopr-new-row-cells"
            type="number" min="1" max="20" step="1"
            placeholder="# cells"
          />
          <button class="ef-fibopr-add-row-btn" id="ef-fibopr-add-row">+ Add Row</button>
          <button class="ef-fibopr-del-row-btn" id="ef-fibopr-del-row"
            ${this._rows.length === 0 ? 'disabled' : ''}>✕ Delete Last Row</button>
        </div>
        <div class="ef-fibopr-error" id="ef-fibopr-grid-error"></div>
      </div>

      <!-- Choices (word bank) -->
      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">
          Choices
          <span class="ef-fibopr-optional">(word bank — optional)</span>
        </label>
        <div class="ef-fibopr-choices-wrap">
          <div class="ef-fibopr-choices-pills" id="ef-fibopr-choices-pills">
            ${choices.map((c, i) => this._choicePillHTML(c, i)).join('')}
          </div>
          <div class="ef-fibopr-choices-input-row">
            <input class="ef-fibopr-input" id="ef-fibopr-choice-input" type="text"
              placeholder="Type a choice and press Enter..."
            />
            <button class="ef-fibopr-add-choice-btn" id="ef-fibopr-add-choice">Add</button>
          </div>
        </div>
      </div>

      <!-- Scoring Method -->
      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">Scoring Method</label>
        <select class="ef-fibopr-select" id="ef-fibopr-scoring-method">
          <option value="exact"   ${scoringMethod === 'exact'   ? 'selected' : ''}>Exact — all blanks must be correct</option>
          <option value="partial" ${scoringMethod === 'partial' ? 'selected' : ''}>Partial — credit per correct blank</option>
        </select>
      </div>

      <!-- Case Sensitive -->
      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">Options</label>
        <label class="ef-fibopr-checkbox-label">
          <input type="checkbox" class="ef-fibopr-checkbox" id="ef-fibopr-case-sensitive"
            ${caseSensitive ? 'checked' : ''} />
          Case sensitive answers
        </label>
      </div>

      <!-- Description -->
      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">
          Description
          <span class="ef-fibopr-optional">(optional)</span>
        </label>
        <textarea class="ef-fibopr-textarea" id="ef-fibopr-description"
          rows="2"
          placeholder="Additional description or instruction..."
        >${FIBOPRFormUtils.escHtml(description)}</textarea>
      </div>
    `;
  }

  bindEvents() {
    // Add row
    this._root.querySelector('#ef-fibopr-add-row')
      ?.addEventListener('click', () => this._handleAddRow());

    // Delete last row
    this._root.querySelector('#ef-fibopr-del-row')
      ?.addEventListener('click', () => this._handleDeleteLastRow());

    // Grid: cell value change + editable toggle + delete last cell
    const gridWrap = this._root.querySelector('#ef-fibopr-grid-wrap');
    if (gridWrap) this._bindGridEvents(gridWrap);

    // Choices: add on Enter key or Add button
    this._root.querySelector('#ef-fibopr-choice-input')
      ?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); this._addChoice(); }
      });
    this._root.querySelector('#ef-fibopr-add-choice')
      ?.addEventListener('click', () => this._addChoice());

    // Choices: remove pill on click
    this._root.querySelector('#ef-fibopr-choices-pills')
      ?.addEventListener('click', (e) => {
        const btn = e.target.closest('.ef-fibopr-choice-remove');
        if (!btn) return;
        btn.closest('.ef-fibopr-choice-pill').remove();
      });
  }

  // ── Getters ──────────────────────────────────────────

  getOperation() {
    return {
      name:   this._root.querySelector('#ef-fibopr-op-name')?.value.trim()   || '',
      symbol: this._root.querySelector('#ef-fibopr-op-symbol')?.value.trim() || '',
    };
  }

  getGridData() {
    // Read current DOM state of the grid into structured data
    const gridWrap = this._root.querySelector('#ef-fibopr-grid-wrap');
    if (!gridWrap) return { editable_answer: {}, initial_answer: {}, correct_answer: {}, user_response: {} };

    const rowEls = gridWrap.querySelectorAll('.ef-fibopr-grid-row');
    const editable_answer = {};
    const initial_answer  = {};
    const correct_answer  = {};
    const user_response   = {};

    rowEls.forEach((rowEl, ri) => {
      const rowName = FIBOPRFormUtils.rowName(ri);
      const cellEls = rowEl.querySelectorAll('.ef-fibopr-cell');

      const editRow  = [];
      const initRow  = [];
      const corrRow  = [];
      let hasEditable = false;

      cellEls.forEach((cellEl) => {
        const toggle = cellEl.querySelector('.ef-fibopr-cell-toggle');
        const input  = cellEl.querySelector('.ef-fibopr-cell-input');
        const isEdit = toggle?.checked || false;
        const val    = input?.value.trim() || '';

        editRow.push(isEdit);

        if (isEdit) {
          initRow.push('');   // initial_answer blank for editable cells
          corrRow.push(val);  // correct_answer gets the value
          hasEditable = true;
        } else {
          initRow.push(val);  // initial_answer gets the display value
          corrRow.push('');   // correct_answer blank for fixed cells
        }
      });

      editable_answer[rowName] = editRow;
      initial_answer[rowName]  = initRow;

      if (hasEditable) {
        correct_answer[rowName] = corrRow;
        user_response[rowName]  = corrRow.map(() => '');
      }
    });

    return { editable_answer, initial_answer, correct_answer, user_response };
  }

  getChoices() {
    const pills = this._root.querySelectorAll('.ef-fibopr-choice-pill');
    return Array.from(pills).map(p =>
      p.querySelector('.ef-fibopr-choice-text')?.textContent || ''
    );
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-fibopr-scoring-method')?.value || 'exact';
  }

  getCaseSensitive() {
    return this._root.querySelector('#ef-fibopr-case-sensitive')?.checked || false;
  }

  getDescription() {
    return this._root.querySelector('#ef-fibopr-description')?.value.trim() || '';
  }

  getRowCount() {
    return this._root.querySelectorAll('.ef-fibopr-grid-row').length;
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-fibopr-grid-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Row HTML ─────────────────────────────────────────

  _rowHTML(cells, rowIndex) {
    const rowName = FIBOPRFormUtils.rowName(rowIndex);
    return `
      <div class="ef-fibopr-grid-row" data-row-index="${rowIndex}">
        <span class="ef-fibopr-row-label">${rowName.replace('_', ' ')}</span>
        <div class="ef-fibopr-cells" id="ef-fibopr-cells-${rowIndex}">
          ${cells.map((cell, ci) => this._cellHTML(cell, rowIndex, ci, ci === cells.length - 1)).join('')}
        </div>
        <button class="ef-fibopr-add-cell-btn" data-row="${rowIndex}" title="Add cell">+ cell</button>
      </div>
    `;
  }

  _cellHTML(cell, rowIndex, cellIndex, isLast) {
    const isEdit = cell.editable;
    return `
      <div class="ef-fibopr-cell ${isEdit ? 'ef-fibopr-cell-editable' : ''}"
           data-row="${rowIndex}" data-cell="${cellIndex}">
        <label class="ef-fibopr-cell-toggle-label" title="${isEdit ? 'Editable (student fills)' : 'Fixed (display value)'}">
          <input type="checkbox" class="ef-fibopr-cell-toggle"
            ${isEdit ? 'checked' : ''}
            data-row="${rowIndex}" data-cell="${cellIndex}"
          />
          <span class="ef-fibopr-cell-mode">${isEdit ? '✎' : '⊘'}</span>
        </label>
        <input type="text"
          class="ef-fibopr-cell-input"
          placeholder="${isEdit ? 'correct answer' : 'display value'}"
          value="${FIBOPRFormUtils.escHtml(cell.value)}"
          data-row="${rowIndex}" data-cell="${cellIndex}"
        />
        ${isLast
          ? `<button class="ef-fibopr-del-cell-btn" data-row="${rowIndex}" title="Delete last cell">✕</button>`
          : '<span class="ef-fibopr-cell-spacer"></span>'
        }
      </div>
    `;
  }

  _choicePillHTML(text, index) {
    return `
      <span class="ef-fibopr-choice-pill" data-index="${index}">
        <span class="ef-fibopr-choice-text">${FIBOPRFormUtils.escHtml(text)}</span>
        <button class="ef-fibopr-choice-remove" title="Remove">✕</button>
      </span>
    `;
  }

  // ── Grid event handlers ──────────────────────────────

  _bindGridEvents(gridWrap) {

    // Toggle editable state of a cell
    gridWrap.addEventListener('change', (e) => {
      if (!e.target.classList.contains('ef-fibopr-cell-toggle')) return;
      const cellEl  = e.target.closest('.ef-fibopr-cell');
      const inputEl = cellEl?.querySelector('.ef-fibopr-cell-input');
      const modeEl  = cellEl?.querySelector('.ef-fibopr-cell-mode');
      const isEdit  = e.target.checked;

      cellEl?.classList.toggle('ef-fibopr-cell-editable', isEdit);
      if (inputEl) {
        inputEl.placeholder = isEdit ? 'correct answer' : 'display value';
        inputEl.value = ''; // clear on toggle switch
      }
      if (modeEl) modeEl.textContent = isEdit ? '✎' : '⊘';
    });

    // Add cell to a row
    gridWrap.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.ef-fibopr-add-cell-btn');
      if (addBtn) {
        const rowIndex = parseInt(addBtn.dataset.row);
        this._addCellToRow(rowIndex);
        return;
      }

      // Delete last cell in a row
      const delBtn = e.target.closest('.ef-fibopr-del-cell-btn');
      if (delBtn) {
        const rowIndex = parseInt(delBtn.dataset.row);
        this._deleteLastCellFromRow(rowIndex);
      }
    });
  }

  _handleAddRow() {
    const countInput = this._root.querySelector('#ef-fibopr-new-row-cells');
    const count = parseInt(countInput?.value);
    if (!count || count < 1) {
      this.showError('Enter the number of cells for the new row.');
      countInput?.focus();
      return;
    }
    if (count > 20) {
      this.showError('Maximum 20 cells per row.');
      return;
    }
    this.showError('');

    const newRowIndex = this._root.querySelectorAll('.ef-fibopr-grid-row').length;
    const cells = Array.from({ length: count }, () => ({ editable: false, value: '' }));

    const gridWrap = this._root.querySelector('#ef-fibopr-grid-wrap');

    // Remove empty state message if present
    const emptyMsg = gridWrap.querySelector('.ef-fibopr-grid-empty');
    if (emptyMsg) emptyMsg.remove();

    const div = document.createElement('div');
    div.innerHTML = this._rowHTML(cells, newRowIndex);
    gridWrap.appendChild(div.firstElementChild);

    // Update delete last row button state
    this._updateDelRowBtn();

    // Clear input
    if (countInput) countInput.value = '';
  }

  _handleDeleteLastRow() {
    const rows = this._root.querySelectorAll('.ef-fibopr-grid-row');
    if (rows.length === 0) return;
    rows[rows.length - 1].remove();

    const gridWrap = this._root.querySelector('#ef-fibopr-grid-wrap');
    if (!gridWrap.querySelectorAll('.ef-fibopr-grid-row').length) {
      gridWrap.innerHTML = '<div class="ef-fibopr-grid-empty">No rows yet. Add a row below.</div>';
    }
    this._updateDelRowBtn();
  }

  _addCellToRow(rowIndex) {
    const cellsEl = this._root.querySelector(`#ef-fibopr-cells-${rowIndex}`);
    if (!cellsEl) return;

    // Remove ✕ from previous last cell
    const prevCells = cellsEl.querySelectorAll('.ef-fibopr-cell');
    if (prevCells.length > 0) {
      const prevLast = prevCells[prevCells.length - 1];
      const prevDel  = prevLast.querySelector('.ef-fibopr-del-cell-btn');
      if (prevDel) {
        const spacer = document.createElement('span');
        spacer.className = 'ef-fibopr-cell-spacer';
        prevDel.replaceWith(spacer);
      }
    }

    const newCellIndex = prevCells.length;
    const div = document.createElement('div');
    div.innerHTML = this._cellHTML({ editable: false, value: '' }, rowIndex, newCellIndex, true);
    cellsEl.appendChild(div.firstElementChild);
  }

  _deleteLastCellFromRow(rowIndex) {
    const cellsEl = this._root.querySelector(`#ef-fibopr-cells-${rowIndex}`);
    if (!cellsEl) return;
    const cells = cellsEl.querySelectorAll('.ef-fibopr-cell');
    if (cells.length === 0) return;
    cells[cells.length - 1].remove();

    // Restore ✕ on new last cell
    const remaining = cellsEl.querySelectorAll('.ef-fibopr-cell');
    if (remaining.length > 0) {
      const newLast = remaining[remaining.length - 1];
      const spacer  = newLast.querySelector('.ef-fibopr-cell-spacer');
      if (spacer) {
        const delBtn = document.createElement('button');
        delBtn.className = 'ef-fibopr-del-cell-btn';
        delBtn.dataset.row = rowIndex;
        delBtn.title = 'Delete last cell';
        delBtn.textContent = '✕';
        spacer.replaceWith(delBtn);
      }
    }
  }

  _updateDelRowBtn() {
    const btn  = this._root.querySelector('#ef-fibopr-del-row');
    const rows = this._root.querySelectorAll('.ef-fibopr-grid-row');
    if (btn) btn.disabled = rows.length === 0;
  }

  _addChoice() {
    const input = this._root.querySelector('#ef-fibopr-choice-input');
    const val   = input?.value.trim();
    if (!val) return;

    const pills     = this._root.querySelector('#ef-fibopr-choices-pills');
    const index     = pills.querySelectorAll('.ef-fibopr-choice-pill').length;
    const div       = document.createElement('span');
    div.innerHTML   = this._choicePillHTML(val, index);
    pills.appendChild(div.firstElementChild);
    if (input) input.value = '';
    input?.focus();
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class FIBOPRMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">
          Explanation
          <span class="ef-fibopr-optional">(optional)</span>
        </label>
        <textarea class="ef-fibopr-textarea" id="ef-fibopr-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${FIBOPRFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-fibopr-render-preview" id="ef-fibopr-explanation-preview"></div>
      </div>

      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">Difficulty</label>
        <select class="ef-fibopr-select" id="ef-fibopr-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-fibopr-row-2">
        <div class="ef-fibopr-field">
          <label class="ef-fibopr-label">
            Points <span class="ef-fibopr-optional">(optional)</span>
          </label>
          <input class="ef-fibopr-input" id="ef-fibopr-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-fibopr-field">
          <label class="ef-fibopr-label">
            Time Limit (sec) <span class="ef-fibopr-optional">(optional)</span>
          </label>
          <input class="ef-fibopr-input" id="ef-fibopr-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-fibopr-field">
        <label class="ef-fibopr-label">
          Tags <span class="ef-fibopr-optional">(comma separated)</span>
        </label>
        <input class="ef-fibopr-input" id="ef-fibopr-tags" type="text"
          placeholder="e.g. math, subtraction"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    FIBOPRFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-fibopr-explanation'),
      this._root.querySelector('#ef-fibopr-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-fibopr-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-fibopr-difficulty')?.value || 'easy',
      points:      FIBOPRFormUtils.parseOptionalNumber(this._root.querySelector('#ef-fibopr-points')),
      time_limit:  FIBOPRFormUtils.parseOptionalNumber(this._root.querySelector('#ef-fibopr-time-limit')),
      tags:        FIBOPRFormUtils.parseTags(this._root.querySelector('#ef-fibopr-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class FIBOPRFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('fill_in_blank_operation');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'fill_in_blank_operation') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Fill Operation';
    const bodyClass    = isSkip ? 'ef-fibopr-body ef-fibopr-is-skip' : 'ef-fibopr-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new FIBOPRQuestionWidget(this);
    const mediaWidget = new FIBOPRMediaWidget(this);
    const ansWidget   = new FIBOPRAnswerWidget(this);
    const metaWidget  = new FIBOPRMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-fibopr-form">
        <div class="${bodyClass}" id="ef-fibopr-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-fibopr-footer">
          <button class="ef-fibopr-btn-save" id="ef-fibopr-btn-save">Save</button>
          <button class="ef-fibopr-btn-skip" id="ef-fibopr-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind all widgets + footer ────────────────────────

  _bindAll() {
    this._qWidget     = new FIBOPRQuestionWidget(this);
    this._mediaWidget = new FIBOPRMediaWidget(this);
    this._ansWidget   = new FIBOPRAnswerWidget(this);
    this._metaWidget  = new FIBOPRMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer ───────────────────────────────────────────

  _bindFooter() {
    this.querySelector('#ef-fibopr-btn-save')
      ?.addEventListener('click', () => this._handleSave());

    this.querySelector('#ef-fibopr-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip
        ? (this._question.original_type || 'fill_in_blank_operation')
        : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Fill Operation';
    const body = this.querySelector('#ef-fibopr-body');
    const btn  = this.querySelector('#ef-fibopr-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'fill_in_blank_operation';
      delete this._question.original_type;
      body.classList.remove('ef-fibopr-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-fibopr-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-fibopr-question')?.focus();
      return;
    }

    if (this._ansWidget.getRowCount() === 0) {
      this._ansWidget.showError('At least one row is required.');
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

  // ── Collect all data ─────────────────────────────────

  _collectData() {
    const { editable_answer, initial_answer, correct_answer, user_response }
      = this._ansWidget.getGridData();

    return {
      type:             this._question?.type || 'fill_in_blank_operation',
      question:         this._qWidget.getValue(),
      svg_content:      this._mediaWidget.getSvg(),
      img_url:          this._mediaWidget.getImgUrl(),
      operation:        this._ansWidget.getOperation(),
      editable_answer,
      initial_answer,
      correct_answer,
      user_response,
      choices:          this._ansWidget.getChoices(),
      scoring_method:   this._ansWidget.getScoringMethod(),
      case_sensitive:   this._ansWidget.getCaseSensitive(),
      description:      this._ansWidget.getDescription(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('fill-in-blank-operation-form', FIBOPRFormComponent);