// editor/components/editor_panel/component.js

class EditorPanelComponent extends HTMLElement {

  connectedCallback() {
    this._currentIndex    = -1;
    this._currentQuestion = null;
    this._previewSaved    = false;
    this._activeTab       = 'edit';
    this._showPlaceholder();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._currentIndex    = index;
    this._currentQuestion = JSON.parse(JSON.stringify(question));
    this._previewSaved    = false;
    this._activeTab       = 'edit';
    this._renderShell();
    this._mountForm();
  }

  showPreviewTab(savedQuestion) {
    this._currentQuestion = JSON.parse(JSON.stringify(savedQuestion));
    this._previewSaved    = true;
    this._activeTab       = 'preview';
    this._updateTabBar();
    this._mountPreview();
  }

  clear() {
    this._currentIndex    = -1;
    this._currentQuestion = null;
    this._previewSaved    = false;
    this._activeTab       = 'edit';
    this._showPlaceholder();
  }

  // ── Placeholder ──────────────────────────────────────

  _showPlaceholder() {
    this.innerHTML = `
      <div class="middle-placeholder">
        <div class="placeholder-icon">✦</div>
        <p>Click <strong>+ Add Question</strong><br>to get started</p>
      </div>
    `;
  }

  // ── Shell ────────────────────────────────────────────

  _renderShell() {
    const q        = this._currentQuestion;
    const isSkip   = q && q.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorConfig.getType(
      isSkip ? (q.original_type || 'mcq') : (q?.type || 'mcq')
    );
    const badgeColor = typeConf ? typeConf.color : '#3498db';
    const badgeLabel = typeConf ? typeConf.label : '?';

    const epBadgeHTML = isSkip
      ? '<span class="ep-type-badge ep-badge-skip">⊘ SKIP</span>'
      : '<span class="ep-type-badge" style="background:' + badgeColor + '">' + badgeLabel + '</span>';

    this.innerHTML = `
      <div class="ep-shell">
        <div class="ep-tabbar">
          <div class="ep-tabbar-left">${epBadgeHTML}</div>
          <div class="ep-tabs">
            <button class="ep-tab ep-tab-active" data-tab="edit">Edit</button>
            <button class="ep-tab ep-tab-preview ${this._previewSaved ? '' : 'ep-tab-disabled'}"
                    data-tab="preview">Preview</button>
          </div>
          <div class="ep-tabbar-right"></div>
        </div>
        <div class="ep-content"></div>
      </div>
    `;

    this._bindTabEvents();
  }

  // ── Tab bar update ───────────────────────────────────

  _updateTabBar() {
    const editTab    = this.querySelector('[data-tab="edit"]');
    const previewTab = this.querySelector('[data-tab="preview"]');
    if (!editTab || !previewTab) return;
    editTab.classList.toggle('ep-tab-active',   this._activeTab === 'edit');
    editTab.classList.toggle('ep-tab-inactive', this._activeTab !== 'edit');
    previewTab.classList.remove('ep-tab-disabled');
    previewTab.classList.toggle('ep-tab-active',   this._activeTab === 'preview');
    previewTab.classList.toggle('ep-tab-inactive', this._activeTab !== 'preview');
  }

  // ── Mount form — routes by type ──────────────────────

  _mountForm() {
    const content = this.querySelector('.ep-content');
    if (!content) return;

    const type = this._currentQuestion?.type === EditorConfig.SKIP_TYPE
      ? (this._currentQuestion.original_type || 'mcq')
      : (this._currentQuestion?.type || 'mcq');

    // Form tag registry — add new types here as forms are built
    const FORM_TAGS = {
      'mcq':        'mcq-form',
      'true_false': 'true-false-form',
    };

    const formTag = FORM_TAGS[type];

    if (formTag) {
      content.innerHTML = `<${formTag}></${formTag}>`;
      const form = content.querySelector(formTag);
      if (form) form.loadQuestion(this._currentIndex, this._currentQuestion);
    } else {
      // Unsupported edit form — show info message
      const typeConf = EditorConfig.getType(type);
      content.innerHTML = `
        <div class="middle-placeholder">
          <div class="placeholder-icon">🔧</div>
          <p>Edit form for <strong style="color:var(--accent)">
            ${typeConf ? typeConf.label : type}
          </strong><br>is not yet implemented.</p>
        </div>
      `;
    }
  }

  // ── Mount preview — uses QuestionRegistry for tag ────

  _mountPreview() {
    const content = this.querySelector('.ep-content');
    if (!content) return;
    const q = this._currentQuestion;
    if (!q) { content.innerHTML = ''; return; }

    // Skip notice
    if (q.type === EditorConfig.SKIP_TYPE) {
      const typeConf = EditorConfig.getType(q.original_type || 'mcq');
      content.innerHTML = `
        <div class="ep-preview-wrap">
          <div class="ep-preview-scroll">
            <div class="ep-skip-notice">
              <div class="ep-skip-icon">⊘</div>
              <p>This question is marked as <strong>Skip</strong>.<br>
                 Original type: <strong>${typeConf ? typeConf.label : q.original_type}</strong></p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Look up component tag from registry
    const tag = (typeof QuestionRegistry !== 'undefined')
      ? QuestionRegistry.getTag(q.type)
      : null;

    if (tag) {
      content.innerHTML = `
        <div class="ep-preview-wrap">
          <div class="ep-preview-scroll">
            <${tag}></${tag}>
          </div>
        </div>
      `;
      const el = content.querySelector(tag);
      if (el) el.setAttribute('config', JSON.stringify(q));
    } else {
      // Registry tag not found — component not loaded
      const typeConf = EditorConfig.getType(q.type);
      content.innerHTML = `
        <div class="ep-preview-wrap">
          <div class="ep-preview-scroll">
            <div class="ep-skip-notice">
              <div class="ep-skip-icon">🔧</div>
              <p>Preview component for<br>
                 <strong>${typeConf ? typeConf.label : q.type}</strong><br>
                 is not loaded in this page.</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  // ── Tab events ───────────────────────────────────────

  _bindTabEvents() {
    this.querySelectorAll('.ep-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('ep-tab-disabled')) return;
        this._activeTab = tab.dataset.tab;
        this._updateTabBar();
        this._activeTab === 'edit' ? this._mountForm() : this._mountPreview();
      });
    });
  }

}

customElements.define('editor-panel', EditorPanelComponent);