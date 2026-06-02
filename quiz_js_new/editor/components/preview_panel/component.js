// editor/components/preview_panel/component.js

class PreviewPanelComponent extends HTMLElement {

  connectedCallback() {
    this._showPlaceholder();
  }

  // ── Public API ───────────────────────────────────────

  // Show the live quiz component for a saved question
  show(question) {
    if (!question) { this._showPlaceholder(); return; }

    if (question.type === EditorConfig.SKIP_TYPE) {
      this._showSkipNotice(question);
      return;
    }

    // Currently only MCQ is supported — Stage 6+ adds more types
    if (question.type === 'mcq') {
      this._showMcq(question);
      return;
    }

    this._showUnsupported(question.type);
  }

  clear() {
    this._showPlaceholder();
  }

  // ── Render states ────────────────────────────────────

  _showPlaceholder() {
    this.innerHTML = `
      <div class="preview-placeholder">
        <div class="placeholder-icon">◎</div>
        <p>Save a question to<br>see the live preview</p>
      </div>
    `;
  }

  _showMcq(question) {
    this.innerHTML = `
      <div class="preview-panel-wrap">
        <div class="pp-label">Live Preview</div>
        <div class="pp-component-wrap">
          <mcq-radio></mcq-radio>
        </div>
      </div>
    `;
    // Pass question data to the existing quiz component via config attribute
    const mcqEl = this.querySelector('mcq-radio');
    if (mcqEl) {
      mcqEl.setAttribute('config', JSON.stringify(question));
    }
  }

  _showSkipNotice(question) {
    const originalType = question.original_type || 'unknown';
    const typeConf     = EditorFormRegistry.getType(originalType);
    const label        = typeConf ? typeConf.label : originalType;

    this.innerHTML = `
      <div class="preview-panel-wrap">
        <div class="pp-label">Live Preview</div>
        <div class="pp-skip-notice">
          <div class="pp-skip-icon">⊘</div>
          <p>This question is marked as <strong>Skip</strong>.<br>
             Original type: <strong>${label}</strong></p>
        </div>
      </div>
    `;
  }

  _showUnsupported(type) {
    this.innerHTML = `
      <div class="preview-panel-wrap">
        <div class="pp-label">Live Preview</div>
        <div class="pp-skip-notice">
          <div class="pp-skip-icon">🔧</div>
          <p>Preview for <strong>${type}</strong><br>
             will be available in a future stage.</p>
        </div>
      </div>
    `;
  }

}

customElements.define('preview-panel', PreviewPanelComponent);