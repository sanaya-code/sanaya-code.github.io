// components/sentence_builder/component.js

class SentenceBuilderComponent {

  constructor() {
    this.el           = null;
    this._controlsEl  = null;
    this._stripEl     = null;
    this._previewEl   = null;
    this._textInput   = null;
    this._btnText     = null;
    this._btnMathml   = null;
    this._btnSpace    = null;
    this._copyBtn    = null;
  }

  // ── build ─────────────────────────────────────────────────────────────────

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'sentence-builder';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML  = '';
    this._controlsEl   = this._buildControls();
    this._stripEl      = this._buildPillStrip();
    const previewWrap  = this._buildPreviewPanel();

    this.el.appendChild(this._controlsEl);
    this.el.appendChild(this._stripEl);
    this.el.appendChild(previewWrap);
  }

  // ── private builders ──────────────────────────────────────────────────────

  _buildControls() {
    const el = document.createElement('div');
    el.className = 'sentence-builder__controls';

    const btnRow = document.createElement('div');
    btnRow.className = 'sentence-builder__btn-row';

    this._btnText = document.createElement('button');
    this._btnText.className   = 'sentence-builder__btn';
    this._btnText.textContent = '+ Text';
    this._btnText.addEventListener('click', () => {
      this._textInput.focus();
    });

    this._btnMathml = document.createElement('button');
    this._btnMathml.className   = 'sentence-builder__btn';
    this._btnMathml.textContent = '+ MathML';
    this._btnMathml.addEventListener('click', () => {
      this.emitMathmlModeToggle();
    });

    this._btnSpace = document.createElement('button');
    this._btnSpace.className   = 'sentence-builder__btn';
    this._btnSpace.textContent = '+ Space';
    this._btnSpace.addEventListener('click', () => this.emitAddSpace());

    btnRow.appendChild(this._btnText);
    btnRow.appendChild(this._btnMathml);
    btnRow.appendChild(this._btnSpace);

    const textRow = document.createElement('div');
    textRow.className = 'sentence-builder__text-row';

    this._textInput = document.createElement('input');
    this._textInput.className   = 'sentence-builder__text-input';
    this._textInput.type        = 'text';
    this._textInput.placeholder = 'Type text here…';
    this._textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleAddText();
    });

    const addBtn = document.createElement('button');
    addBtn.className   = 'sentence-builder__add-btn';
    addBtn.textContent = 'Add text';
    addBtn.addEventListener('click', () => this._handleAddText());

    textRow.appendChild(this._textInput);
    textRow.appendChild(addBtn);

    el.appendChild(btnRow);
    el.appendChild(textRow);
    return el;
  }

  _buildPillStrip() {
    const el = document.createElement('div');
    el.className = 'sentence-builder__strip';
    return el;
  }

  _buildPreviewPanel() {
    const el = document.createElement('div');
    el.className = 'sentence-builder__preview-wrap';

    const header = document.createElement('div');
    header.className = 'sentence-builder__preview-header';

    const label = document.createElement('div');
    label.className   = 'sentence-builder__section-label';
    label.textContent = 'Preview';

    this._copyBtn = document.createElement('button');
    this._copyBtn.className   = 'sentence-builder__copy-btn';
    this._copyBtn.textContent = 'Copy MathML';
    this._copyBtn.addEventListener('click', () => this.emitCopy());

    header.appendChild(label);
    header.appendChild(this._copyBtn);

    const box = document.createElement('div');
    box.className = 'sentence-builder__preview';
    box.innerHTML = '—';

    el.appendChild(header);
    el.appendChild(box);
    this._previewEl = box;
    return el;
  }

  _buildTextPill(token, isLast) {
    const pill = document.createElement('span');
    pill.className = 'sentence-builder__pill sentence-builder__pill--text'
      + (isLast ? ' sentence-builder__pill--last' : '');
    pill.textContent = token.value;

    if (isLast) pill.appendChild(this._buildDeleteBtn());
    return pill;
  }

  _buildNodePill(token, isLast) {
    const pill = document.createElement('span');
    pill.className = 'sentence-builder__pill sentence-builder__pill--node'
      + (isLast ? ' sentence-builder__pill--last' : '');
    pill.innerHTML = token.value.getPreview();

    if (isLast) pill.appendChild(this._buildDeleteBtn());
    return pill;
  }

  _buildDeleteBtn() {
    const btn = document.createElement('span');
    btn.className   = 'sentence-builder__pill-delete';
    btn.textContent = '✕';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.emitDeleteLast();
    });
    return btn;
  }

  // ── public API ────────────────────────────────────────────────────────────

  renderTokens(tokens) {
    this._stripEl.innerHTML = '';

    if (!tokens.length) {
      const empty = document.createElement('span');
      empty.className   = 'sentence-builder__strip-empty';
      empty.textContent = 'sentence is empty';
      this._stripEl.appendChild(empty);
      return;
    }

    tokens.forEach((token, i) => {
      const isLast = i === tokens.length - 1;
      const pill   = token.type === 'text'
        ? this._buildTextPill(token, isLast)
        : this._buildNodePill(token, isLast);
      this._stripEl.appendChild(pill);
    });
  }

  updatePreview(tokens) {
    if (!tokens.length) {
      this._previewEl.innerHTML = '—';
      return;
    }
    const mathml = tokens.map(t => t.toMathml()).join('');
    this._previewEl.innerHTML = `<math display="inline">${mathml}</math>`;
  }

  setMathmlMode(active) {
    this._btnMathml.classList.toggle('sentence-builder__btn--active', active);
  }

  // ── internal ──────────────────────────────────────────────────────────────

  _handleAddText() {
    const text = this._textInput.value.trim();
    if (!text) return;
    this._textInput.value = '';
    this.emitAddText(text);
  }

  // ── emit ──────────────────────────────────────────────────────────────────

  showCopyFeedback() {
    this._copyBtn.textContent = '✓ Copied!';
    setTimeout(() => { this._copyBtn.textContent = 'Copy MathML'; }, 2000);
  }

  emitAddText(text) {
    this.el.dispatchEvent(new CustomEvent('sentence:add-text', {
      bubbles: true, detail: { text }
    }));
  }

  emitMathmlModeToggle() {
    this.el.dispatchEvent(new CustomEvent('sentence:mathml-toggle', { bubbles: true }));
  }

  emitAddSpace() {
    this.el.dispatchEvent(new CustomEvent('sentence:add-space', { bubbles: true }));
  }

  emitCopy() {
    this.el.dispatchEvent(new CustomEvent('sentence:copy', { bubbles: true }));
  }

  emitDeleteLast() {
    this.el.dispatchEvent(new CustomEvent('sentence:delete-last', { bubbles: true }));
  }

}