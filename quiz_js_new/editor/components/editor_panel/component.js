// editor/components/editor_panel/component.js

class EditorPanelComponent extends HTMLElement {

  connectedCallback() {
    this._currentIndex = -1;
  }

  // ── Public API ───────────────────────────────────────

  // Load a question into the appropriate form
  loadQuestion(index, question) {
    this._currentIndex = index;
    const type = question.type === EditorConfig.SKIP_TYPE
      ? (question.original_type || 'mcq')
      : question.type;

    switch (type) {
      case 'mcq':
        this._loadMcqForm(index, question);
        break;
      default:
        this._showUnsupported(type);
    }
  }

  clear() {
    this.innerHTML = '';
  }

  // ── Form loaders ─────────────────────────────────────

  _loadMcqForm(index, question) {
    this.innerHTML = '<mcq-form></mcq-form>';
    const form = this.querySelector('mcq-form');
    if (form) form.loadQuestion(index, question);
  }

  _showUnsupported(type) {
    const typeConf = EditorConfig.getType(type);
    const label    = typeConf ? typeConf.label : type;
    this.innerHTML = `
      <div class="middle-placeholder">
        <div class="placeholder-icon">🔧</div>
        <p>
          Editor form for <strong style="color:var(--accent)">${label}</strong><br>
          is not yet implemented.
        </p>
        <p style="margin-top:8px;font-size:12px;color:var(--text-muted)">
          Only MCQ is supported in this stage.
        </p>
      </div>
    `;
  }

}

customElements.define('editor-panel', EditorPanelComponent);