// editor/components/question_forms/matching_connection_image_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class IPMFormUtils {

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

  // Normalise a color string — returns as-is if non-empty, else fallback
  static normaliseColor(str, fallback = '#3498db') {
    const s = (str || '').trim();
    return s.length > 0 ? s : fallback;
  }

}

// ── Question Widget ───────────────────────────────────────────────────────────
// Owns: question textarea + focus preview

class IPMQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-ipm-field">
        <label class="ef-ipm-label">Question Text</label>
        <textarea class="ef-ipm-textarea" id="ef-ipm-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${IPMFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-ipm-render-preview" id="ef-ipm-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    IPMFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ipm-question'),
      this._root.querySelector('#ef-ipm-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-ipm-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────
// Owns: question-level SVG collapsible + Image URL collapsible

class IPMMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${IPMFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-ipm-img-preview visible' : 'ef-ipm-img-preview';

    return `
      <div class="ef-ipm-collapsible" id="ef-ipm-svg-section">
        <div class="ef-ipm-collapsible-header" id="ef-ipm-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-ipm-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ipm-collapsible-body">
          <textarea class="ef-ipm-textarea" id="ef-ipm-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${IPMFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-ipm-svg-preview" id="ef-ipm-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-ipm-remove-btn" id="ef-ipm-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-ipm-collapsible" id="ef-ipm-img-section">
        <div class="ef-ipm-collapsible-header" id="ef-ipm-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-ipm-collapsible-arrow">▼</span>
        </div>
        <div class="ef-ipm-collapsible-body">
          <input class="ef-ipm-input" id="ef-ipm-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${IPMFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-ipm-img-preview">${imgThumb}</div>
          <button class="ef-ipm-remove-btn" id="ef-ipm-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    IPMFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ipm-svg-toggle'),
      this._root.querySelector('#ef-ipm-svg-section')
    );
    this._root.querySelector('#ef-ipm-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-ipm-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-ipm-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ipm-svg').value = '';
      this._root.querySelector('#ef-ipm-svg-preview').innerHTML = '';
    });

    IPMFormUtils.bindCollapsible(
      this._root.querySelector('#ef-ipm-img-toggle'),
      this._root.querySelector('#ef-ipm-img-section')
    );
    this._root.querySelector('#ef-ipm-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-ipm-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-ipm-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg() {
    return this._root.querySelector('#ef-ipm-svg')?.value.trim() || '';
  }

  getImgUrl() {
    return this._root.querySelector('#ef-ipm-img-url')?.value.trim() || '';
  }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-ipm-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${IPMFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: image rows list + properties column + validation block
//
// Image rows  — each row has: SVG/imgUrl toggle, alt text, correct property,
//               acceptable properties, drag reorder, delete
// Properties  — auto-entries (locked, from row.property) + manual distractors
//               both draggable; auto-entries cannot be deleted
// Validation  — scoring_method, allow_multiple_connections, line_colors

class IPMAnswerWidget {

  constructor(root) {
    this._root        = root;
    this._dragSrcRow  = null;   // drag index for image rows
    this._dragSrcProp = null;   // drag index for properties column
  }

  // ── Render ───────────────────────────────────────────

  render(q) {
    const rows       = q.rows || [];
    const propCol    = q.properties_column || [];
    const validation = q.validation || {};

    return `
      ${this._renderRows(rows)}
      ${this._renderPropertiesColumn(rows, propCol)}
      ${this._renderValidation(validation)}
      <div class="ef-ipm-error" id="ef-ipm-error"></div>
    `;
  }

  // ── Rows section ─────────────────────────────────────

  _renderRows(rows) {
    return `
      <div class="ef-ipm-field">
        <div class="ef-ipm-section-header">
          <label class="ef-ipm-label">Image Rows</label>
          <button class="ef-ipm-add-btn" id="ef-ipm-add-row">+ Add Row</button>
        </div>
        <div class="ef-ipm-rows-list" id="ef-ipm-rows-list">
          ${rows.map((row, i) => this._rowHTML(row, i)).join('')}
        </div>
      </div>
    `;
  }

  _rowHTML(row, index) {
    const hasSvg    = !!(row.svg_content);
    const mode      = hasSvg ? 'svg' : 'url';
    const acceptable = Array.isArray(row.acceptable_properties)
      ? row.acceptable_properties.join(', ')
      : (row.acceptable_properties || '');

    const summary = row.alt_text
      ? IPMFormUtils.escHtml(row.alt_text)
      : (row.property ? `property: ${IPMFormUtils.escHtml(row.property)}` : 'empty row');

    return `
      <div class="ef-ipm-row-card ef-ipm-row-collapsed" draggable="true" data-row-index="${index}">

        <div class="ef-ipm-row-card-header" data-collapse-toggle>
          <span class="ef-ipm-drag-handle">⠿</span>
          <span class="ef-ipm-row-num">Row ${index + 1}</span>
          <span class="ef-ipm-row-summary">${summary}</span>
          <span class="ef-ipm-row-collapse-arrow">▼</span>
          <button class="ef-ipm-row-delete" title="Delete row">✕</button>
        </div>

        <div class="ef-ipm-row-card-body">

          <!-- Media toggle — label + radios on one line, panel below is collapsible -->
          <div class="ef-ipm-field">
            <div class="ef-ipm-row-media-header" data-media-toggle>
              <label class="ef-ipm-label" style="pointer-events:none">Image Source</label>
              <div class="ef-ipm-toggle-group">
                <label class="ef-ipm-toggle-option">
                  <input type="radio" name="ef-ipm-row-mode-${index}"
                    class="ef-ipm-row-mode-radio" value="svg"
                    ${mode === 'svg' ? 'checked' : ''} />
                  SVG
                </label>
                <label class="ef-ipm-toggle-option">
                  <input type="radio" name="ef-ipm-row-mode-${index}"
                    class="ef-ipm-row-mode-radio" value="url"
                    ${mode === 'url' ? 'checked' : ''} />
                  Image URL
                </label>
              </div>
              <span class="ef-ipm-row-media-arrow">▼</span>
            </div>
          </div>

          <!-- SVG panel -->
          <div class="ef-ipm-row-panel ef-ipm-row-svg-panel ef-ipm-row-media-panel
               ${mode === 'svg' ? 'active' : ''}">
            <textarea class="ef-ipm-textarea ef-ipm-row-svg-input"
              rows="3" placeholder="Paste SVG markup..."
            >${IPMFormUtils.escHtml(row.svg_content || '')}</textarea>
            <div class="ef-ipm-row-svg-preview">
              ${row.svg_content || ''}
            </div>
          </div>

          <!-- Image URL panel -->
          <div class="ef-ipm-row-panel ef-ipm-row-url-panel ef-ipm-row-media-panel
               ${mode === 'url' ? 'active' : ''}">
            <input class="ef-ipm-input ef-ipm-row-url-input" type="text"
              placeholder="Image URL or relative path..."
              value="${IPMFormUtils.escHtml(row.img_url || '')}"
            />
            <div class="ef-ipm-row-img-preview
                 ${row.img_url ? 'visible' : ''}">
              ${row.img_url
                ? `<img src="${IPMFormUtils.escHtml(row.img_url)}" alt="preview" />`
                : ''}
            </div>
          </div>

          <!-- Alt text -->
          <div class="ef-ipm-field">
            <label class="ef-ipm-label">Alt Text
              <span class="ef-ipm-optional">(describes the image)</span>
            </label>
            <input class="ef-ipm-input ef-ipm-row-alt-input" type="text"
              placeholder="e.g. Five red apples"
              value="${IPMFormUtils.escHtml(row.alt_text || '')}"
            />
          </div>

          <!-- Correct property -->
          <div class="ef-ipm-field">
            <label class="ef-ipm-label">Correct Property</label>
            <input class="ef-ipm-input ef-ipm-row-property-input" type="text"
              placeholder="e.g. 5"
              value="${IPMFormUtils.escHtml(row.property || '')}"
            />
          </div>

          <!-- Acceptable properties -->
          <div class="ef-ipm-field">
            <label class="ef-ipm-label">Acceptable Properties
              <span class="ef-ipm-optional">(comma separated)</span>
            </label>
            <input class="ef-ipm-input ef-ipm-row-acceptable-input" type="text"
              placeholder="e.g. 5, five"
              value="${IPMFormUtils.escHtml(acceptable)}"
            />
          </div>

        </div>
      </div>
    `;
  }

  // ── Properties column section ─────────────────────────

  _renderPropertiesColumn(rows, propCol) {
    // Collect auto-entries from rows
    const autoValues = new Set(
      rows.map(r => (r.property || '').trim()).filter(v => v.length > 0)
    );

    // Build unified list: mark each entry as auto or manual
    // Any entry in propCol that matches an auto value = locked
    // Remaining entries in propCol that are not auto = manual distractors
    // Auto values not yet in propCol get appended
    const seen    = new Set();
    const entries = [];

    propCol.forEach(val => {
      const v = String(val).trim();
      if (!v) return;
      if (seen.has(v)) return;
      seen.add(v);
      entries.push({ value: v, auto: autoValues.has(v) });
    });

    // Add auto values missing from propCol
    autoValues.forEach(v => {
      if (!seen.has(v)) {
        seen.add(v);
        entries.push({ value: v, auto: true });
      }
    });

    return `
      <div class="ef-ipm-field">
        <div class="ef-ipm-section-header">
          <label class="ef-ipm-label">Properties Column
            <span class="ef-ipm-optional">(right-side labels)</span>
          </label>
          <button class="ef-ipm-add-btn" id="ef-ipm-add-prop">+ Add Distractor</button>
        </div>
        <div class="ef-ipm-hint">
          🔒 Locked entries are derived from row correct properties and cannot be deleted.
        </div>
        <div class="ef-ipm-props-list" id="ef-ipm-props-list">
          ${entries.map((e, i) => this._propRowHTML(e.value, e.auto, i)).join('')}
        </div>
      </div>
    `;
  }

  _propRowHTML(value, isAuto, index) {
    return `
      <div class="ef-ipm-prop-row ${isAuto ? 'ef-ipm-prop-auto' : ''}"
           draggable="true"
           data-prop-index="${index}"
           data-prop-auto="${isAuto ? '1' : '0'}">
        <span class="ef-ipm-drag-handle">⠿</span>
        ${isAuto
          ? `<span class="ef-ipm-lock-icon" title="Derived from row property">🔒</span>`
          : ''}
        <input class="ef-ipm-input ef-ipm-prop-value-input" type="text"
          placeholder="Property value..."
          value="${IPMFormUtils.escHtml(value)}"
          ${isAuto ? 'readonly' : ''}
        />
        ${isAuto
          ? `<span class="ef-ipm-prop-auto-tag">auto</span>`
          : `<button class="ef-ipm-prop-delete" title="Delete">✕</button>`
        }
      </div>
    `;
  }

  // ── Validation section ────────────────────────────────

  _renderValidation(validation) {
    const scoringMethod       = validation.scoring_method || 'exact';
    const allowMultiple       = !!validation.allow_multiple_connections;
    const lineColors          = Array.isArray(validation.line_colors)
      ? validation.line_colors
      : ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#ffa500', '#ffffff'];

    return `
      <div class="ef-ipm-field">
        <label class="ef-ipm-label">Validation</label>

        <div class="ef-ipm-validation-block">

          <div class="ef-ipm-field">
            <label class="ef-ipm-label">Scoring Method</label>
            <select class="ef-ipm-select" id="ef-ipm-scoring-method">
              <option value="exact"   ${scoringMethod === 'exact'   ? 'selected' : ''}>
                Exact — all connections must be correct
              </option>
              <option value="partial" ${scoringMethod === 'partial' ? 'selected' : ''}>
                Partial — credit per correct connection
              </option>
            </select>
          </div>

          <div class="ef-ipm-field">
            <label class="ef-ipm-checkbox-label">
              <input type="checkbox" class="ef-ipm-checkbox"
                id="ef-ipm-allow-multiple"
                ${allowMultiple ? 'checked' : ''} />
              Allow multiple connections per image
            </label>
          </div>

          <div class="ef-ipm-field">
            <div class="ef-ipm-section-header">
              <label class="ef-ipm-label">Line Colors</label>
              <button class="ef-ipm-add-btn" id="ef-ipm-add-color">+ Add Color</button>
            </div>
            <div class="ef-ipm-colors-list" id="ef-ipm-colors-list">
              ${lineColors.map((c, i) => this._colorRowHTML(c, i)).join('')}
            </div>
          </div>

        </div>
      </div>
    `;
  }

  _colorRowHTML(color, index) {
    const safe = IPMFormUtils.escHtml(color || '#3498db');
    return `
      <div class="ef-ipm-color-row" data-color-index="${index}">
        <input type="color"
               class="ef-ipm-color-picker"
               value="${safe}"
               title="Pick color" />
        <input type="text"
               class="ef-ipm-color-text ef-ipm-input"
               value="${safe}"
               placeholder="#rrggbb"
               maxlength="30" />
        <button class="ef-ipm-color-delete" title="Remove color">✕</button>
      </div>
    `;
  }

  // ── Bind events ───────────────────────────────────────

  bindEvents() {
    this._bindRowsSection();
    this._bindPropsSection();
    this._bindColorsSection();
  }

  // ── Rows section events ───────────────────────────────

  _bindRowsSection() {
    // Add row
    this._root.querySelector('#ef-ipm-add-row')
      ?.addEventListener('click', () => this._addRow());

    const list = this._root.querySelector('#ef-ipm-rows-list');
    if (!list) return;

    // Media header click → collapse/expand the active SVG or URL panel
    list.addEventListener('click', (e) => {
      const mediaHeader = e.target.closest('[data-media-toggle]');
      if (!mediaHeader) return;
      const card = mediaHeader.closest('.ef-ipm-row-card');
      if (!card) return;
      const panels = card.querySelectorAll('.ef-ipm-row-media-panel');
      const arrow  = mediaHeader.querySelector('.ef-ipm-row-media-arrow');
      const isHidden = [...panels].every(p => p.classList.contains('ef-ipm-media-hidden'));
      panels.forEach(p => p.classList.toggle('ef-ipm-media-hidden', !isHidden));
      if (arrow) arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
    });

    // Collapse toggle — click header to expand/collapse body
    list.addEventListener('click', (e) => {
      const header = e.target.closest('[data-collapse-toggle]');
      if (!header) return;
      // Don't toggle if clicking the delete button
      if (e.target.classList.contains('ef-ipm-row-delete')) return;
      const card = header.closest('.ef-ipm-row-card');
      if (card) card.classList.toggle('ef-ipm-row-collapsed');
    });

    // Delegated events on list
    list.addEventListener('click', (e) => {
      // Delete row
      if (e.target.classList.contains('ef-ipm-row-delete')) {
        const card = e.target.closest('.ef-ipm-row-card');
        if (!card) return;
        const idx   = parseInt(card.dataset.rowIndex);
        const propVal = card.querySelector('.ef-ipm-row-property-input')?.value.trim();
        card.remove();
        this._reindexRows();
        if (propVal) this._removeAutoPropertyIfOrphaned(propVal);
      }
    });

    // Mode toggle (SVG vs URL)
    list.addEventListener('change', (e) => {
      if (!e.target.classList.contains('ef-ipm-row-mode-radio')) return;
      const card = e.target.closest('.ef-ipm-row-card');
      if (!card) return;
      const mode = e.target.value;
      card.querySelector('.ef-ipm-row-svg-panel')
        .classList.toggle('active', mode === 'svg');
      card.querySelector('.ef-ipm-row-url-panel')
        .classList.toggle('active', mode === 'url');
    });

    // SVG input → live preview
    list.addEventListener('input', (e) => {
      if (e.target.classList.contains('ef-ipm-row-svg-input')) {
        const card = e.target.closest('.ef-ipm-row-card');
        card.querySelector('.ef-ipm-row-svg-preview').innerHTML = e.target.value;
      }
      // URL input → live img preview
      if (e.target.classList.contains('ef-ipm-row-url-input')) {
        const card    = e.target.closest('.ef-ipm-row-card');
        const preview = card.querySelector('.ef-ipm-row-img-preview');
        const url     = e.target.value.trim();
        if (url) {
          preview.innerHTML = `<img src="${IPMFormUtils.escHtml(url)}" alt="preview" />`;
          preview.classList.add('visible');
        } else {
          preview.innerHTML = '';
          preview.classList.remove('visible');
        }
      }
    });

    // Property input → on blur, sync auto-entry in properties column + update summary
    list.addEventListener('blur', (e) => {
      const card = e.target.closest('.ef-ipm-row-card');
      if (!card) return;
      if (e.target.classList.contains('ef-ipm-row-property-input')) {
        const idx    = parseInt(card.dataset.rowIndex);
        const newVal = e.target.value.trim();
        this._syncAutoProperty(idx, newVal);
        this._updateRowSummary(card);
      }
      if (e.target.classList.contains('ef-ipm-row-alt-input')) {
        this._updateRowSummary(card);
      }
    }, true); // capture=true for blur

    // Drag reorder rows
    this._bindDragList(list, 'ef-ipm-row-card', '_dragSrcRow', (from, to) => {
      this._reorderList(list, '.ef-ipm-row-card', from, to);
      this._reindexRows();
    });
  }

  _addRow() {
    const list  = this._root.querySelector('#ef-ipm-rows-list');
    const count = list.querySelectorAll('.ef-ipm-row-card').length;
    const div   = document.createElement('div');
    div.innerHTML = this._rowHTML({
      svg_content: '', img_url: '', alt_text: '',
      property: '', acceptable_properties: [],
    }, count);
    list.appendChild(div.firstElementChild);
    this._reindexRows();
  }

  _reindexRows() {
    this._root.querySelectorAll('.ef-ipm-row-card').forEach((card, i) => {
      card.dataset.rowIndex = i;
      card.querySelector('.ef-ipm-row-num').textContent = `Row ${i + 1}`;
      // Update radio name to keep groups separate
      card.querySelectorAll('.ef-ipm-row-mode-radio').forEach(r => {
        r.name = `ef-ipm-row-mode-${i}`;
      });
    });
  }

  _updateRowSummary(card) {
    const altText  = card.querySelector('.ef-ipm-row-alt-input')?.value.trim();
    const property = card.querySelector('.ef-ipm-row-property-input')?.value.trim();
    const summary  = card.querySelector('.ef-ipm-row-summary');
    if (!summary) return;
    summary.textContent = altText
      ? altText
      : (property ? `property: ${property}` : 'empty row');
  }

  // ── Properties column events ──────────────────────────

  _bindPropsSection() {
    // Add distractor
    this._root.querySelector('#ef-ipm-add-prop')
      ?.addEventListener('click', () => this._addManualProp());

    const list = this._root.querySelector('#ef-ipm-props-list');
    if (!list) return;

    // Delete manual prop
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-ipm-prop-delete')) return;
      e.target.closest('.ef-ipm-prop-row').remove();
      this._reindexProps();
    });

    // Drag reorder props
    this._bindDragList(list, 'ef-ipm-prop-row', '_dragSrcProp', (from, to) => {
      this._reorderList(list, '.ef-ipm-prop-row', from, to);
      this._reindexProps();
    });
  }

  _addManualProp() {
    const list  = this._root.querySelector('#ef-ipm-props-list');
    const count = list.querySelectorAll('.ef-ipm-prop-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._propRowHTML('', false, count);
    list.appendChild(div.firstElementChild);
    this._reindexProps();
    list.lastElementChild?.querySelector('.ef-ipm-prop-value-input')?.focus();
  }

  _reindexProps() {
    this._root.querySelectorAll('.ef-ipm-prop-row').forEach((row, i) => {
      row.dataset.propIndex = i;
    });
  }

  // Sync auto-entry when a row's property field blurs
  _syncAutoProperty(rowIndex, newValue) {
    const list      = this._root.querySelector('#ef-ipm-props-list');
    const autoRows  = list.querySelectorAll('.ef-ipm-prop-row[data-prop-auto="1"]');

    // Find the old auto-entry that was tied to this row's previous property
    // We identify it by position: the nth auto-entry corresponds to the nth row
    // (this is a heuristic — good enough for editor use)
    // A cleaner approach: store data-row-origin on each auto entry
    // We do that on creation; here we look for it
    const allRowCards = this._root.querySelectorAll('.ef-ipm-row-card');
    const card = Array.from(allRowCards).find(
      c => parseInt(c.dataset.rowIndex) === rowIndex
    );
    if (!card) return;

    // Find existing auto entry with data-row-origin matching rowIndex
    const existingAuto = list.querySelector(
      `.ef-ipm-prop-row[data-row-origin="${rowIndex}"]`
    );

    if (existingAuto) {
      if (newValue) {
        // Update value
        existingAuto.querySelector('.ef-ipm-prop-value-input').value = newValue;
      } else {
        // Row property cleared — remove auto entry
        existingAuto.remove();
        this._reindexProps();
      }
    } else if (newValue) {
      // No existing auto entry — add one
      this._addAutoProperty(newValue, rowIndex);
    }
  }

  _addAutoProperty(value, rowOrigin) {
    const list  = this._root.querySelector('#ef-ipm-props-list');
    const count = list.querySelectorAll('.ef-ipm-prop-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._propRowHTML(value, true, count);
    const row = div.firstElementChild;
    row.dataset.rowOrigin = rowOrigin;
    list.appendChild(row);
    this._reindexProps();
  }

  _removeAutoPropertyIfOrphaned(propVal) {
    // After a row is deleted, check if this propVal is still used by any other row
    const stillUsed = Array.from(
      this._root.querySelectorAll('.ef-ipm-row-property-input')
    ).some(inp => inp.value.trim() === propVal);

    if (!stillUsed) {
      const list   = this._root.querySelector('#ef-ipm-props-list');
      const toRemove = list.querySelector(
        `.ef-ipm-prop-row[data-prop-auto="1"] .ef-ipm-prop-value-input[value="${CSS.escape(propVal)}"]`
      )?.closest('.ef-ipm-prop-row');
      if (toRemove) {
        toRemove.remove();
        this._reindexProps();
      }
    }
  }

  // ── Colors section events ─────────────────────────────

  _bindColorsSection() {
    this._root.querySelector('#ef-ipm-add-color')
      ?.addEventListener('click', () => this._addColorRow());

    const list = this._root.querySelector('#ef-ipm-colors-list');
    if (!list) return;

    // Delete color
    list.addEventListener('click', (e) => {
      if (!e.target.classList.contains('ef-ipm-color-delete')) return;
      e.target.closest('.ef-ipm-color-row').remove();
    });

    // Color picker → sync text + swatch
    list.addEventListener('input', (e) => {
      const row = e.target.closest('.ef-ipm-color-row');
      if (!row) return;
      if (e.target.classList.contains('ef-ipm-color-picker')) {
        const val = e.target.value;
        row.querySelector('.ef-ipm-color-text').value = val;
        row.querySelector('.ef-ipm-color-swatch').style.background = val;
      }
      if (e.target.classList.contains('ef-ipm-color-text')) {
        const val = e.target.value.trim();
        row.querySelector('.ef-ipm-color-swatch').style.background = val;
        // Only update picker if it looks like a valid hex color
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
          row.querySelector('.ef-ipm-color-picker').value = val;
        }
      }
    });
  }

  _addColorRow() {
    const list  = this._root.querySelector('#ef-ipm-colors-list');
    const count = list.querySelectorAll('.ef-ipm-color-row').length;
    const div   = document.createElement('div');
    div.innerHTML = this._colorRowHTML('#3498db', count);
    list.appendChild(div.firstElementChild);
  }

  // ── Generic drag-reorder helper ───────────────────────

  _bindDragList(list, itemClass, srcKey, onDrop) {
    list.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.' + itemClass);
      if (!item) return;
      this[srcKey] = parseInt(item.dataset[
        itemClass === 'ef-ipm-row-card' ? 'rowIndex' : 'propIndex'
      ]);
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    list.addEventListener('dragend', () => {
      list.querySelectorAll('.' + itemClass)
        .forEach(r => r.classList.remove('dragging', 'drag-over'));
    });

    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const item = e.target.closest('.' + itemClass);
      if (!item) return;
      const idx = parseInt(item.dataset[
        itemClass === 'ef-ipm-row-card' ? 'rowIndex' : 'propIndex'
      ]);
      if (idx !== this[srcKey]) {
        list.querySelectorAll('.' + itemClass)
          .forEach(r => r.classList.remove('drag-over'));
        item.classList.add('drag-over');
      }
    });

    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const item = e.target.closest('.' + itemClass);
      if (!item) return;
      const to   = parseInt(item.dataset[
        itemClass === 'ef-ipm-row-card' ? 'rowIndex' : 'propIndex'
      ]);
      const from = this[srcKey];
      item.classList.remove('drag-over');
      if (from === null || from === to) return;
      onDrop(from, to);
    });
  }

  _reorderList(list, selector, from, to) {
    const items = Array.from(list.querySelectorAll(selector));
    const moved = items.splice(from, 1)[0];
    items.splice(to, 0, moved);
    list.innerHTML = '';
    items.forEach(item => list.appendChild(item));
  }

  // ── Getters ───────────────────────────────────────────

  getRows() {
    return Array.from(
      this._root.querySelectorAll('.ef-ipm-row-card')
    ).map((card, i) => {
      const mode    = card.querySelector('.ef-ipm-row-mode-radio:checked')?.value || 'url';
      const svgVal  = card.querySelector('.ef-ipm-row-svg-input')?.value.trim() || '';
      const urlVal  = card.querySelector('.ef-ipm-row-url-input')?.value.trim() || '';
      const acceptable = (card.querySelector('.ef-ipm-row-acceptable-input')?.value || '')
        .split(',').map(s => s.trim()).filter(s => s.length > 0);

      return {
        image_index:            i + 1,
        svg_content:            mode === 'svg' ? svgVal : null,
        img_url:                mode === 'url' ? (urlVal || null) : null,
        alt_text:               card.querySelector('.ef-ipm-row-alt-input')?.value.trim() || '',
        property:               card.querySelector('.ef-ipm-row-property-input')?.value.trim() || '',
        acceptable_properties:  acceptable,
      };
    });
  }

  getPropertiesColumn() {
    return Array.from(
      this._root.querySelectorAll('.ef-ipm-prop-row .ef-ipm-prop-value-input')
    ).map(inp => inp.value.trim()).filter(v => v.length > 0);
  }

  getValidation() {
    const colors = Array.from(
      this._root.querySelectorAll('.ef-ipm-color-text')
    ).map(inp => inp.value.trim()).filter(v => v.length > 0);

    return {
      scoring_method:            this._root.querySelector('#ef-ipm-scoring-method')?.value || 'exact',
      allow_multiple_connections: this._root.querySelector('#ef-ipm-allow-multiple')?.checked || false,
      line_colors:               colors,
    };
  }

  showError(msg) {
    const el = this._root.querySelector('#ef-ipm-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time limit + tags

class IPMMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${q.difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-ipm-field">
        <label class="ef-ipm-label">
          Explanation
          <span class="ef-ipm-optional">(optional)</span>
        </label>
        <textarea class="ef-ipm-textarea" id="ef-ipm-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${IPMFormUtils.escHtml(q.explanation || '')}</textarea>
        <div class="ef-ipm-render-preview" id="ef-ipm-explanation-preview"></div>
      </div>

      <div class="ef-ipm-field">
        <label class="ef-ipm-label">Difficulty</label>
        <select class="ef-ipm-select" id="ef-ipm-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-ipm-row-2">
        <div class="ef-ipm-field">
          <label class="ef-ipm-label">
            Points <span class="ef-ipm-optional">(optional)</span>
          </label>
          <input class="ef-ipm-input" id="ef-ipm-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${q.points !== '' && q.points != null ? q.points : ''}"
          />
        </div>
        <div class="ef-ipm-field">
          <label class="ef-ipm-label">
            Time Limit (sec) <span class="ef-ipm-optional">(optional)</span>
          </label>
          <input class="ef-ipm-input" id="ef-ipm-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${q.time_limit !== '' && q.time_limit != null ? q.time_limit : ''}"
          />
        </div>
      </div>

      <div class="ef-ipm-field">
        <label class="ef-ipm-label">
          Tags <span class="ef-ipm-optional">(comma separated)</span>
        </label>
        <input class="ef-ipm-input" id="ef-ipm-tags" type="text"
          placeholder="e.g. math, counting"
          value="${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    IPMFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-ipm-explanation'),
      this._root.querySelector('#ef-ipm-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-ipm-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-ipm-difficulty')?.value || 'easy',
      points:      IPMFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ipm-points')),
      time_limit:  IPMFormUtils.parseOptionalNumber(this._root.querySelector('#ef-ipm-time-limit')),
      tags:        IPMFormUtils.parseTags(this._root.querySelector('#ef-ipm-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class IPMFormComponent extends HTMLElement {

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
    const q          = this._question || EditorFormRegistry.getDefault('matching_connection_image');
    const isSkip     = q.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'matching_connection_image') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Match Connection Image';
    const bodyClass    = isSkip ? 'ef-ipm-body ef-ipm-is-skip' : 'ef-ipm-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new IPMQuestionWidget(this);
    const mediaWidget = new IPMMediaWidget(this);
    const ansWidget   = new IPMAnswerWidget(this);
    const metaWidget  = new IPMMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-ipm-form">
        <div class="${bodyClass}" id="ef-ipm-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-ipm-footer">
          <button class="ef-ipm-btn-save" id="ef-ipm-btn-save">Save</button>
          <button class="ef-ipm-btn-skip" id="ef-ipm-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind ─────────────────────────────────────────────

  _bindAll() {
    this._qWidget     = new IPMQuestionWidget(this);
    this._mediaWidget = new IPMMediaWidget(this);
    this._ansWidget   = new IPMAnswerWidget(this);
    this._metaWidget  = new IPMMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  // ── Footer ───────────────────────────────────────────

  _bindFooter() {
    this.querySelector('#ef-ipm-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-ipm-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip
        ? (this._question.original_type || 'matching_connection_image')
        : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Match Connection Image';
    const body      = this.querySelector('#ef-ipm-body');
    const btn       = this.querySelector('#ef-ipm-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'matching_connection_image';
      delete this._question.original_type;
      body.classList.remove('ef-ipm-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-ipm-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.');
      this.querySelector('#ef-ipm-question')?.focus();
      return;
    }

    const rows = this._ansWidget.getRows();
    if (rows.length < 2) {
      this._ansWidget.showError('At least 2 image rows are required.');
      return;
    }

    const hasProperties = rows.every(r => r.property.length > 0);
    if (!hasProperties) {
      this._ansWidget.showError('Every row must have a correct property.');
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

  // ── Collect data ──────────────────────────────────────

  _collectData() {
    return {
      type:               this._question?.type || 'matching_connection_image',
      question:           this._qWidget.getValue(),
      svg_content:        this._mediaWidget.getSvg(),
      img_url:            this._mediaWidget.getImgUrl(),
      rows:               this._ansWidget.getRows(),
      properties_column:  this._ansWidget.getPropertiesColumn(),
      user_response:      [],
      validation:         this._ansWidget.getValidation(),
      ...this._metaWidget.getData(),
    };
  }

}

customElements.define('matching-connection-image', IPMFormComponent);