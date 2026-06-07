// editor/components/question_forms/number_line_arcs_form/component.js

// ── Utilities ─────────────────────────────────────────────────────────────────

class NLAFormUtils {

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

  // Truncate HTML string for chip label — show first N chars of text content
  static truncateHtml(html, maxLen = 20) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : (html || '');
  }

}

// ── Question Widget ───────────────────────────────────────────────────────────

class NLAQuestionWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    return `
      <div class="ef-nla-field">
        <label class="ef-nla-label">Question Text</label>
        <textarea class="ef-nla-textarea" id="ef-nla-question"
          rows="3"
          placeholder="Enter question text (HTML/MathML supported)"
        >${NLAFormUtils.escHtml(q.question || '')}</textarea>
        <div class="ef-nla-render-preview" id="ef-nla-question-preview"></div>
      </div>
    `;
  }

  bindEvents() {
    NLAFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-nla-question'),
      this._root.querySelector('#ef-nla-question-preview')
    );
  }

  getValue() {
    return this._root.querySelector('#ef-nla-question')?.value.trim() || '';
  }

}

// ── Media Widget ──────────────────────────────────────────────────────────────

class NLAMediaWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    const imgThumb   = q.img_url
      ? `<img src="${NLAFormUtils.escHtml(q.img_url)}" alt="preview" />`
      : '';
    const imgVisible = q.img_url ? 'ef-nla-img-preview visible' : 'ef-nla-img-preview';

    return `
      <div class="ef-nla-collapsible" id="ef-nla-svg-section">
        <div class="ef-nla-collapsible-header" id="ef-nla-svg-toggle">
          ▶ SVG Figure
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-nla-collapsible-arrow">▼</span>
        </div>
        <div class="ef-nla-collapsible-body">
          <textarea class="ef-nla-textarea" id="ef-nla-svg"
            rows="3" placeholder="Paste SVG code here..."
          >${NLAFormUtils.escHtml(q.svg_content || '')}</textarea>
          <div class="ef-nla-svg-preview" id="ef-nla-svg-preview">
            ${q.svg_content || ''}
          </div>
          <button class="ef-nla-remove-btn" id="ef-nla-svg-remove">Remove SVG</button>
        </div>
      </div>

      <div class="ef-nla-collapsible" id="ef-nla-img-section">
        <div class="ef-nla-collapsible-header" id="ef-nla-img-toggle">
          ▶ Image URL
          <span style="font-weight:400;font-size:11px;margin-left:4px;
                       color:var(--text-muted)">(optional)</span>
          <span class="ef-nla-collapsible-arrow">▼</span>
        </div>
        <div class="ef-nla-collapsible-body">
          <input class="ef-nla-input" id="ef-nla-img-url" type="text"
            placeholder="Enter image URL or relative path..."
            value="${NLAFormUtils.escHtml(q.img_url || '')}"
          />
          <div class="${imgVisible}" id="ef-nla-img-preview">${imgThumb}</div>
          <button class="ef-nla-remove-btn" id="ef-nla-img-remove">Remove Image</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    NLAFormUtils.bindCollapsible(
      this._root.querySelector('#ef-nla-svg-toggle'),
      this._root.querySelector('#ef-nla-svg-section')
    );
    this._root.querySelector('#ef-nla-svg')?.addEventListener('input', (e) => {
      this._root.querySelector('#ef-nla-svg-preview').innerHTML = e.target.value;
    });
    this._root.querySelector('#ef-nla-svg-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-nla-svg').value = '';
      this._root.querySelector('#ef-nla-svg-preview').innerHTML = '';
    });

    NLAFormUtils.bindCollapsible(
      this._root.querySelector('#ef-nla-img-toggle'),
      this._root.querySelector('#ef-nla-img-section')
    );
    this._root.querySelector('#ef-nla-img-url')?.addEventListener('input', (e) => {
      this._updateImgPreview(e.target.value.trim());
    });
    this._root.querySelector('#ef-nla-img-remove')?.addEventListener('click', () => {
      this._root.querySelector('#ef-nla-img-url').value = '';
      this._updateImgPreview('');
    });
  }

  getSvg()    { return this._root.querySelector('#ef-nla-svg')?.value.trim() || ''; }
  getImgUrl() { return this._root.querySelector('#ef-nla-img-url')?.value.trim() || ''; }

  _updateImgPreview(url) {
    const preview = this._root.querySelector('#ef-nla-img-preview');
    if (!preview) return;
    if (url) {
      preview.innerHTML = `<img src="${NLAFormUtils.escHtml(url)}" alt="preview" />`;
      preview.classList.add('visible');
    } else {
      preview.innerHTML = '';
      preview.classList.remove('visible');
    }
  }

}

// ── Answer Widget ─────────────────────────────────────────────────────────────
// Owns: points strip + arcs strip (both horizontal, draggable, click-to-edit)
//       + description + scoring fields

class NLAAnswerWidget {

  constructor(root) {
    this._root          = root;
    this._activePoint   = -1;   // index of open point edit panel (-1 = none)
    this._activeArc     = -1;   // index of open arc edit panel   (-1 = none)
    this._pointDragSrc  = null;
    this._arcDragSrc    = null;
  }

  render(q) {
    const points        = q.points || [];
    const pairs         = q.pairs  || [];
    const description   = q.description || '';
    const caseSensitive = !!q.case_sensitive;
    const scoringMethod   = (q.metadata && q.metadata.scoring_method)   || q.scoring_method   || 'exact';
    const scoringMethod01 = (q.metadata && q.metadata.scoring_method_01) || q.scoring_method_01 || '';

    return `
      <!-- ── Points ── -->
      <div class="ef-nla-field">
        <div class="ef-nla-section-header">
          <label class="ef-nla-label" style="margin-bottom:0">Points</label>
          <button class="ef-nla-add-btn" id="ef-nla-add-point">+ Add Point</button>
        </div>
        <div class="ef-nla-chip-strip" id="ef-nla-points-strip">
          ${points.map((p, i) => this._pointChipHTML(p, i)).join('')}
        </div>
        <div class="ef-nla-edit-panel" id="ef-nla-point-edit-panel" style="display:none">
          <div class="ef-nla-edit-panel-header">
            <span class="ef-nla-edit-panel-title" id="ef-nla-point-edit-title">Editing point</span>
            <button class="ef-nla-edit-del-btn" id="ef-nla-point-delete">Delete</button>
          </div>
          <textarea class="ef-nla-textarea" id="ef-nla-point-input"
            rows="2" placeholder="Point value (HTML/MathML supported)"></textarea>
          <div class="ef-nla-render-preview visible" id="ef-nla-point-preview"></div>
        </div>
        <div class="ef-nla-error" id="ef-nla-points-error"></div>
      </div>

      <!-- ── Arcs ── -->
      <div class="ef-nla-field">
        <div class="ef-nla-section-header">
          <label class="ef-nla-label" style="margin-bottom:0">Arcs (pairs)</label>
          <button class="ef-nla-add-btn" id="ef-nla-add-arc">+ Add Arc</button>
        </div>
        <div class="ef-nla-chip-strip" id="ef-nla-arcs-strip">
          ${pairs.map((p, i) => this._arcChipHTML(p, i)).join('')}
        </div>
        <div class="ef-nla-edit-panel" id="ef-nla-arc-edit-panel" style="display:none">
          <div class="ef-nla-edit-panel-header">
            <span class="ef-nla-edit-panel-title" id="ef-nla-arc-edit-title">Editing arc</span>
            <button class="ef-nla-edit-del-btn" id="ef-nla-arc-delete">Delete</button>
          </div>
          <div class="ef-nla-arc-edit-row">
            <div class="ef-nla-field">
              <label class="ef-nla-sublabel">Start point</label>
              <textarea class="ef-nla-textarea" id="ef-nla-arc-start"
                rows="2" placeholder="Start (HTML/MathML supported)"></textarea>
              <div class="ef-nla-render-preview visible" id="ef-nla-arc-start-preview"></div>
            </div>
            <div class="ef-nla-field">
              <label class="ef-nla-sublabel">End point</label>
              <textarea class="ef-nla-textarea" id="ef-nla-arc-end"
                rows="2" placeholder="End (HTML/MathML supported)"></textarea>
              <div class="ef-nla-render-preview visible" id="ef-nla-arc-end-preview"></div>
            </div>
          </div>
        </div>
        <div class="ef-nla-error" id="ef-nla-arcs-error"></div>
      </div>

      <!-- ── Description ── -->
      <div class="ef-nla-field">
        <label class="ef-nla-label">
          Description
          <span class="ef-nla-optional">(optional)</span>
        </label>
        <textarea class="ef-nla-textarea" id="ef-nla-description"
          rows="2"
          placeholder="Additional instruction for this question..."
        >${NLAFormUtils.escHtml(description)}</textarea>
      </div>

      <!-- ── Scoring ── -->
      <div class="ef-nla-row-2">
        <div class="ef-nla-field">
          <label class="ef-nla-label">Scoring Method</label>
          <select class="ef-nla-select" id="ef-nla-scoring-method">
            <option value="exact"   ${scoringMethod === 'exact'   ? 'selected' : ''}>Exact</option>
            <option value="partial" ${scoringMethod === 'partial' ? 'selected' : ''}>Partial</option>
          </select>
        </div>
        <div class="ef-nla-field">
          <label class="ef-nla-label">
            Scoring Method 01
            <span class="ef-nla-optional">(optional)</span>
          </label>
          <select class="ef-nla-select" id="ef-nla-scoring-method-01">
            <option value=""        ${!scoringMethod01              ? 'selected' : ''}>— None —</option>
            <option value="exact"   ${scoringMethod01 === 'exact'   ? 'selected' : ''}>Exact</option>
            <option value="partial" ${scoringMethod01 === 'partial' ? 'selected' : ''}>Partial</option>
          </select>
        </div>
      </div>

      <!-- ── Case sensitive ── -->
      <div class="ef-nla-field">
        <label class="ef-nla-checkbox-label">
          <input type="checkbox" class="ef-nla-checkbox" id="ef-nla-case-sensitive"
            ${caseSensitive ? 'checked' : ''} />
          Case sensitive answers
        </label>
      </div>
    `;
  }

  bindEvents() {
    // ── Add buttons ──
    this._root.querySelector('#ef-nla-add-point')
      ?.addEventListener('click', () => this._addPoint());
    this._root.querySelector('#ef-nla-add-arc')
      ?.addEventListener('click', () => this._addArc());

    // ── Points strip ──
    this._bindPointsStrip();

    // ── Arcs strip ──
    this._bindArcsStrip();

    // ── Point edit panel ──
    this._root.querySelector('#ef-nla-point-input')
      ?.addEventListener('input', (e) => {
        this._root.querySelector('#ef-nla-point-preview').innerHTML = e.target.value;
        // sync chip label live
        const chip = this._root.querySelector(
          `.ef-nla-point-chip[data-idx="${this._activePoint}"]`
        );
        if (chip) {
          const lbl = chip.querySelector('.ef-nla-chip-label');
          if (lbl) lbl.innerHTML = e.target.value || '<em style="opacity:0.4">empty</em>';
        }
      });

    this._root.querySelector('#ef-nla-point-delete')
      ?.addEventListener('click', () => this._deletePoint(this._activePoint));

    // ── Arc edit panel ──
    this._root.querySelector('#ef-nla-arc-start')
      ?.addEventListener('input', (e) => {
        this._root.querySelector('#ef-nla-arc-start-preview').innerHTML = e.target.value;
        this._syncArcChipLabel(this._activeArc);
      });
    this._root.querySelector('#ef-nla-arc-end')
      ?.addEventListener('input', (e) => {
        this._root.querySelector('#ef-nla-arc-end-preview').innerHTML = e.target.value;
        this._syncArcChipLabel(this._activeArc);
      });

    this._root.querySelector('#ef-nla-arc-delete')
      ?.addEventListener('click', () => this._deleteArc(this._activeArc));
  }

  // ── Getters ──────────────────────────────────────────

  getPoints() {
    return Array.from(
      this._root.querySelectorAll('.ef-nla-point-chip')
    ).map(chip => chip.dataset.value || '');
  }

  getPairs() {
    return Array.from(
      this._root.querySelectorAll('.ef-nla-arc-chip')
    ).map(chip => [chip.dataset.start || '', chip.dataset.end || '']);
  }

  getDescription() {
    return this._root.querySelector('#ef-nla-description')?.value.trim() || '';
  }

  getScoringMethod() {
    return this._root.querySelector('#ef-nla-scoring-method')?.value || 'exact';
  }

  getScoringMethod01() {
    return this._root.querySelector('#ef-nla-scoring-method-01')?.value || '';
  }

  getCaseSensitive() {
    return this._root.querySelector('#ef-nla-case-sensitive')?.checked || false;
  }

  showError(msg, target = 'points') {
    const id = target === 'arcs' ? '#ef-nla-arcs-error' : '#ef-nla-points-error';
    const el = this._root.querySelector(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
  }

  // ── Point chip HTML ───────────────────────────────────

  _pointChipHTML(value, index) {
    const label = value || '<em style="opacity:0.4">empty</em>';
    return `
      <div class="ef-nla-point-chip" draggable="true"
           data-idx="${index}" data-value="${NLAFormUtils.escHtml(String(value))}">
        <span class="ef-nla-drag-dot">⠿</span>
        <span class="ef-nla-chip-label">${label}</span>
      </div>
    `;
  }

  // ── Arc chip HTML ─────────────────────────────────────

  _arcChipHTML(pair, index) {
    const start = pair[0] || '';
    const end   = pair[1] || '';
    const startLabel = NLAFormUtils.truncateHtml(start, 18);
    const endLabel   = NLAFormUtils.truncateHtml(end,   18);
    return `
      <div class="ef-nla-arc-chip" draggable="true"
           data-idx="${index}"
           data-start="${NLAFormUtils.escHtml(String(start))}"
           data-end="${NLAFormUtils.escHtml(String(end))}">
        <span class="ef-nla-drag-dot">⠿</span>
        <span class="ef-nla-arc-start-label">${startLabel || '<em style="opacity:0.4">—</em>'}</span>
        <span class="ef-nla-arc-sep">,</span>
        <span class="ef-nla-arc-end-label">${endLabel || '<em style="opacity:0.4">—</em>'}</span>
      </div>
    `;
  }

  // ── Add ───────────────────────────────────────────────

  _addPoint() {
    const strip = this._root.querySelector('#ef-nla-points-strip');
    const idx   = strip.querySelectorAll('.ef-nla-point-chip').length;
    strip.insertAdjacentHTML('beforeend', this._pointChipHTML('', idx));
    this._reindexPoints();
    this._openPointEdit(idx);
  }

  _addArc() {
    const strip = this._root.querySelector('#ef-nla-arcs-strip');
    const idx   = strip.querySelectorAll('.ef-nla-arc-chip').length;
    strip.insertAdjacentHTML('beforeend', this._arcChipHTML(['', ''], idx));
    this._reindexArcs();
    this._openArcEdit(idx);
  }

  // ── Delete ────────────────────────────────────────────

  _deletePoint(index) {
    const strip = this._root.querySelector('#ef-nla-points-strip');
    const chips = strip.querySelectorAll('.ef-nla-point-chip');
    if (chips.length === 0) return;
    // Only delete the last chip
    chips[chips.length - 1].remove();
    this._activePoint = -1;
    this._root.querySelector('#ef-nla-point-edit-panel').style.display = 'none';
    this._reindexPoints();
  }

  _deleteArc(index) {
    const strip = this._root.querySelector('#ef-nla-arcs-strip');
    const chips = strip.querySelectorAll('.ef-nla-arc-chip');
    if (chips.length === 0) return;
    chips[chips.length - 1].remove();
    this._activeArc = -1;
    this._root.querySelector('#ef-nla-arc-edit-panel').style.display = 'none';
    this._reindexArcs();
  }

  // ── Open edit panels ──────────────────────────────────

  _openPointEdit(index) {
    const strip = this._root.querySelector('#ef-nla-points-strip');
    const chips = Array.from(strip.querySelectorAll('.ef-nla-point-chip'));
    const chip  = chips[index];
    if (!chip) return;

    // Deactivate all chips
    chips.forEach(c => c.classList.remove('ef-nla-chip-active'));
    chip.classList.add('ef-nla-chip-active');

    this._activePoint = index;
    const total = chips.length;
    const panel = this._root.querySelector('#ef-nla-point-edit-panel');
    panel.style.display = 'flex';

    this._root.querySelector('#ef-nla-point-edit-title').textContent =
      `Editing point ${index + 1} of ${total}`;

    const input   = this._root.querySelector('#ef-nla-point-input');
    const preview = this._root.querySelector('#ef-nla-point-preview');
    const value   = chip.dataset.value || '';
    input.value       = value;
    preview.innerHTML = value;
    input.focus();

    // Show delete only if this is the last chip
    const delBtn = this._root.querySelector('#ef-nla-point-delete');
    delBtn.style.display = (index === total - 1) ? '' : 'none';
  }

  _openArcEdit(index) {
    const strip = this._root.querySelector('#ef-nla-arcs-strip');
    const chips = Array.from(strip.querySelectorAll('.ef-nla-arc-chip'));
    const chip  = chips[index];
    if (!chip) return;

    chips.forEach(c => c.classList.remove('ef-nla-chip-active'));
    chip.classList.add('ef-nla-chip-active');

    this._activeArc = index;
    const total = chips.length;
    const panel = this._root.querySelector('#ef-nla-arc-edit-panel');
    panel.style.display = 'flex';

    this._root.querySelector('#ef-nla-arc-edit-title').textContent =
      `Editing arc ${index + 1} of ${total}`;

    const startVal = chip.dataset.start || '';
    const endVal   = chip.dataset.end   || '';

    const startInput   = this._root.querySelector('#ef-nla-arc-start');
    const endInput     = this._root.querySelector('#ef-nla-arc-end');
    const startPreview = this._root.querySelector('#ef-nla-arc-start-preview');
    const endPreview   = this._root.querySelector('#ef-nla-arc-end-preview');

    startInput.value       = startVal;
    endInput.value         = endVal;
    startPreview.innerHTML = startVal;
    endPreview.innerHTML   = endVal;
    startInput.focus();

    // Show delete only if this is the last chip
    const delBtn = this._root.querySelector('#ef-nla-arc-delete');
    delBtn.style.display = (index === total - 1) ? '' : 'none';
  }

  // ── Sync chip label from edit panel ───────────────────

  _syncArcChipLabel(index) {
    const chip = this._root.querySelector(`.ef-nla-arc-chip[data-idx="${index}"]`);
    if (!chip) return;
    const startVal = this._root.querySelector('#ef-nla-arc-start')?.value || '';
    const endVal   = this._root.querySelector('#ef-nla-arc-end')?.value   || '';
    chip.dataset.start = startVal;
    chip.dataset.end   = endVal;
    const sl = chip.querySelector('.ef-nla-arc-start-label');
    const el = chip.querySelector('.ef-nla-arc-end-label');
    if (sl) sl.innerHTML = NLAFormUtils.truncateHtml(startVal, 18) || '<em style="opacity:0.4">—</em>';
    if (el) el.innerHTML = NLAFormUtils.truncateHtml(endVal,   18) || '<em style="opacity:0.4">—</em>';
  }

  // ── Save point edit value back to chip dataset ────────

  _commitPointEdit() {
    if (this._activePoint < 0) return;
    const chip = this._root.querySelector(
      `.ef-nla-point-chip[data-idx="${this._activePoint}"]`
    );
    if (!chip) return;
    const val = this._root.querySelector('#ef-nla-point-input')?.value || '';
    chip.dataset.value = val;
    const lbl = chip.querySelector('.ef-nla-chip-label');
    if (lbl) lbl.innerHTML = val || '<em style="opacity:0.4">empty</em>';
  }

  // ── Reindex ───────────────────────────────────────────

  _reindexPoints() {
    this._root.querySelectorAll('.ef-nla-point-chip').forEach((chip, i) => {
      chip.dataset.idx = i;
    });
  }

  _reindexArcs() {
    this._root.querySelectorAll('.ef-nla-arc-chip').forEach((chip, i) => {
      chip.dataset.idx = i;
    });
  }

  // ── Drag reorder — points ─────────────────────────────

  _bindPointsStrip() {
    const strip = this._root.querySelector('#ef-nla-points-strip');
    if (!strip) return;

    strip.addEventListener('click', (e) => {
      const chip = e.target.closest('.ef-nla-point-chip');
      if (!chip) return;
      const idx = parseInt(chip.dataset.idx);
      if (this._activePoint === idx) {
        // toggle close
        this._commitPointEdit();
        chip.classList.remove('ef-nla-chip-active');
        this._activePoint = -1;
        this._root.querySelector('#ef-nla-point-edit-panel').style.display = 'none';
      } else {
        this._commitPointEdit();
        this._openPointEdit(idx);
      }
    });

    strip.addEventListener('dragstart', (e) => {
      const chip = e.target.closest('.ef-nla-point-chip');
      if (!chip) return;
      this._pointDragSrc = parseInt(chip.dataset.idx);
      chip.classList.add('ef-nla-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    strip.addEventListener('dragend', () => {
      strip.querySelectorAll('.ef-nla-point-chip')
        .forEach(c => c.classList.remove('ef-nla-dragging', 'ef-nla-drag-over'));
    });
    strip.addEventListener('dragover', (e) => {
      e.preventDefault();
      const chip = e.target.closest('.ef-nla-point-chip');
      if (chip && parseInt(chip.dataset.idx) !== this._pointDragSrc) {
        strip.querySelectorAll('.ef-nla-point-chip')
          .forEach(c => c.classList.remove('ef-nla-drag-over'));
        chip.classList.add('ef-nla-drag-over');
      }
    });
    strip.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-nla-point-chip');
      if (!target) return;
      const to   = parseInt(target.dataset.idx);
      const from = this._pointDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('ef-nla-drag-over');
      this._reorderChips(strip, '.ef-nla-point-chip', from, to);
      this._reindexPoints();
      this._activePoint = -1;
      this._root.querySelector('#ef-nla-point-edit-panel').style.display = 'none';
    });
  }

  // ── Drag reorder — arcs ───────────────────────────────

  _bindArcsStrip() {
    const strip = this._root.querySelector('#ef-nla-arcs-strip');
    if (!strip) return;

    strip.addEventListener('click', (e) => {
      const chip = e.target.closest('.ef-nla-arc-chip');
      if (!chip) return;
      const idx = parseInt(chip.dataset.idx);
      if (this._activeArc === idx) {
        chip.classList.remove('ef-nla-chip-active');
        this._activeArc = -1;
        this._root.querySelector('#ef-nla-arc-edit-panel').style.display = 'none';
      } else {
        this._openArcEdit(idx);
      }
    });

    strip.addEventListener('dragstart', (e) => {
      const chip = e.target.closest('.ef-nla-arc-chip');
      if (!chip) return;
      this._arcDragSrc = parseInt(chip.dataset.idx);
      chip.classList.add('ef-nla-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    strip.addEventListener('dragend', () => {
      strip.querySelectorAll('.ef-nla-arc-chip')
        .forEach(c => c.classList.remove('ef-nla-dragging', 'ef-nla-drag-over'));
    });
    strip.addEventListener('dragover', (e) => {
      e.preventDefault();
      const chip = e.target.closest('.ef-nla-arc-chip');
      if (chip && parseInt(chip.dataset.idx) !== this._arcDragSrc) {
        strip.querySelectorAll('.ef-nla-arc-chip')
          .forEach(c => c.classList.remove('ef-nla-drag-over'));
        chip.classList.add('ef-nla-drag-over');
      }
    });
    strip.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.ef-nla-arc-chip');
      if (!target) return;
      const to   = parseInt(target.dataset.idx);
      const from = this._arcDragSrc;
      if (from === null || from === to) return;
      target.classList.remove('ef-nla-drag-over');
      this._reorderChips(strip, '.ef-nla-arc-chip', from, to);
      this._reindexArcs();
      this._activeArc = -1;
      this._root.querySelector('#ef-nla-arc-edit-panel').style.display = 'none';
    });
  }

  // ── Generic chip reorder ──────────────────────────────

  _reorderChips(strip, selector, from, to) {
    const chips = Array.from(strip.querySelectorAll(selector));
    const moved = chips.splice(from, 1)[0];
    chips.splice(to, 0, moved);
    chips.forEach(c => strip.appendChild(c));
  }

}

// ── Metadata Widget ───────────────────────────────────────────────────────────
// Owns: explanation + difficulty + points + time_limit + tags
// NOTE: for number_line_arcs these are saved nested under metadata: {}

class NLAMetadataWidget {

  constructor(root) {
    this._root = root;
  }

  render(q) {
    // Support both nested metadata object and flat fields
    const meta = q.metadata || {};
    const difficulty = meta.difficulty || q.difficulty || 'easy';
    const points     = meta.points     != null ? meta.points     : (q.points     != null ? q.points     : '');
    const timeLimit  = meta.time_limit != null ? meta.time_limit : (q.time_limit != null ? q.time_limit : '');
    const tags       = meta.tags       || q.tags       || [];
    const explanation = q.explanation  || '';

    const diffOptions = EditorConfig.DIFFICULTY_LEVELS.map(d =>
      `<option value="${d}" ${difficulty === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <div class="ef-nla-field">
        <label class="ef-nla-label">
          Explanation
          <span class="ef-nla-optional">(optional)</span>
        </label>
        <textarea class="ef-nla-textarea" id="ef-nla-explanation"
          rows="2" placeholder="Explanation (HTML/MathML supported)"
        >${NLAFormUtils.escHtml(explanation)}</textarea>
        <div class="ef-nla-render-preview" id="ef-nla-explanation-preview"></div>
      </div>

      <div class="ef-nla-field">
        <label class="ef-nla-label">Difficulty</label>
        <select class="ef-nla-select" id="ef-nla-difficulty">
          ${diffOptions}
        </select>
      </div>

      <div class="ef-nla-row-2">
        <div class="ef-nla-field">
          <label class="ef-nla-label">
            Points <span class="ef-nla-optional">(optional)</span>
          </label>
          <input class="ef-nla-input" id="ef-nla-points" type="number"
            min="0" step="0.5" placeholder="e.g. 1"
            value="${points !== '' && points != null ? points : ''}"
          />
        </div>
        <div class="ef-nla-field">
          <label class="ef-nla-label">
            Time Limit (sec) <span class="ef-nla-optional">(optional)</span>
          </label>
          <input class="ef-nla-input" id="ef-nla-time-limit" type="number"
            min="0" step="1" placeholder="e.g. 30"
            value="${timeLimit !== '' && timeLimit != null ? timeLimit : ''}"
          />
        </div>
      </div>

      <div class="ef-nla-field">
        <label class="ef-nla-label">
          Tags <span class="ef-nla-optional">(comma separated)</span>
        </label>
        <input class="ef-nla-input" id="ef-nla-tags" type="text"
          placeholder="e.g. number line, addition"
          value="${Array.isArray(tags) ? tags.join(', ') : (tags || '')}"
        />
      </div>
    `;
  }

  bindEvents() {
    NLAFormUtils.bindFocusPreview(
      this._root.querySelector('#ef-nla-explanation'),
      this._root.querySelector('#ef-nla-explanation-preview')
    );
  }

  getData() {
    return {
      explanation: this._root.querySelector('#ef-nla-explanation')?.value.trim() || '',
      difficulty:  this._root.querySelector('#ef-nla-difficulty')?.value || 'easy',
      points:      NLAFormUtils.parseOptionalNumber(this._root.querySelector('#ef-nla-points')),
      time_limit:  NLAFormUtils.parseOptionalNumber(this._root.querySelector('#ef-nla-time-limit')),
      tags:        NLAFormUtils.parseTags(this._root.querySelector('#ef-nla-tags')),
    };
  }

}

// ── Form Component ────────────────────────────────────────────────────────────

class NLAFormComponent extends HTMLElement {

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
    const q        = this._question || EditorFormRegistry.getDefault('number_line_arcs');
    const isSkip   = q.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (q.original_type || 'number_line_arcs') : q.type
    );
    const typeLabel    = typeConf ? typeConf.label : 'Number Line';
    const bodyClass    = isSkip ? 'ef-nla-body ef-nla-is-skip' : 'ef-nla-body';
    const skipBtnLabel = isSkip ? `↩ Mark ${typeLabel}` : '⊘ Mark as Skip';

    const qWidget     = new NLAQuestionWidget(this);
    const mediaWidget = new NLAMediaWidget(this);
    const ansWidget   = new NLAAnswerWidget(this);
    const metaWidget  = new NLAMetadataWidget(this);

    this.innerHTML = `
      <div class="ef-nla-form">
        <div class="${bodyClass}" id="ef-nla-body">
          ${qWidget.render(q)}
          ${mediaWidget.render(q)}
          ${ansWidget.render(q)}
          ${metaWidget.render(q)}
        </div>
        <div class="ef-nla-footer">
          <button class="ef-nla-btn-save" id="ef-nla-btn-save">Save</button>
          <button class="ef-nla-btn-skip" id="ef-nla-btn-skip">${skipBtnLabel}</button>
        </div>
      </div>
    `;
  }

  // ── Bind ─────────────────────────────────────────────

  _bindAll() {
    this._qWidget     = new NLAQuestionWidget(this);
    this._mediaWidget = new NLAMediaWidget(this);
    this._ansWidget   = new NLAAnswerWidget(this);
    this._metaWidget  = new NLAMetadataWidget(this);

    this._qWidget.bindEvents();
    this._mediaWidget.bindEvents();
    this._ansWidget.bindEvents();
    this._metaWidget.bindEvents();

    this._bindFooter();
  }

  _bindFooter() {
    this.querySelector('#ef-nla-btn-save')
      ?.addEventListener('click', () => this._handleSave());
    this.querySelector('#ef-nla-btn-skip')
      ?.addEventListener('click', () => this._handleSkipToggle());
  }

  // ── Skip toggle ───────────────────────────────────────

  _handleSkipToggle() {
    const isSkip   = this._question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorFormRegistry.getType(
      isSkip ? (this._question.original_type || 'number_line_arcs') : this._question.type
    );
    const typeLabel = typeConf ? typeConf.label : 'Number Line';
    const body      = this.querySelector('#ef-nla-body');
    const btn       = this.querySelector('#ef-nla-btn-skip');

    if (isSkip) {
      this._question.type = this._question.original_type || 'number_line_arcs';
      delete this._question.original_type;
      body.classList.remove('ef-nla-is-skip');
      btn.textContent = '⊘ Mark as Skip';
    } else {
      this._question.original_type = this._question.type;
      this._question.type = EditorConfig.SKIP_TYPE;
      body.classList.add('ef-nla-is-skip');
      btn.textContent = `↩ Mark ${typeLabel}`;
    }
  }

  // ── Save ─────────────────────────────────────────────

  _handleSave() {
    this._ansWidget.showError('', 'points');
    this._ansWidget.showError('', 'arcs');

    const questionText = this._qWidget.getValue();
    if (!questionText) {
      this._ansWidget.showError('Question text is required.', 'points');
      this.querySelector('#ef-nla-question')?.focus();
      return;
    }

    const points = this._ansWidget.getPoints();
    if (points.length < 2) {
      this._ansWidget.showError('At least 2 points are required.', 'points');
      return;
    }

    const pairs = this._ansWidget.getPairs();
    if (pairs.length < 1) {
      this._ansWidget.showError('At least 1 arc (pair) is required.', 'arcs');
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

  // ── Collect ───────────────────────────────────────────

  _collectData() {
    const metaData        = this._metaWidget.getData();
    const scoringMethod01 = this._ansWidget.getScoringMethod01();

    const metadata = {
      difficulty:     metaData.difficulty,
      points:         metaData.points,
      time_limit:     metaData.time_limit,
      tags:           metaData.tags,
      scoring_method: this._ansWidget.getScoringMethod(),
      case_sensitive: this._ansWidget.getCaseSensitive(),
    };
    if (scoringMethod01) metadata.scoring_method_01 = scoringMethod01;

    return {
      type:          this._question?.type || 'number_line_arcs',
      question:      this._qWidget.getValue(),
      svg_content:   this._mediaWidget.getSvg(),
      img_url:       this._mediaWidget.getImgUrl(),
      points:        this._ansWidget.getPoints(),
      pairs:         this._ansWidget.getPairs(),
      user_response: [],
      explanation:   metaData.explanation,
      description:   this._ansWidget.getDescription(),
      metadata,
    };
  }

}

customElements.define('number-line-arcs-form', NLAFormComponent);