// editor/components/editor_panel/component.js

class EditorPanelComponent extends HTMLElement {

  connectedCallback() {
    this._currentIndex   = -1;
    this._currentQuestion = null;
    this._previewSaved   = false;   // preview tab enabled only after first save
    this._activeTab      = 'edit';  // 'edit' | 'preview'
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

  // Called by EditorPanelHandler after save
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

  // ── Placeholder (no question selected) ──────────────

  _showPlaceholder() {
    this.innerHTML = `
      <div class="middle-placeholder">
        <div class="placeholder-icon">✦</div>
        <p>Click <strong>+ Add Question</strong><br>to get started</p>
      </div>
    `;
  }

  // ── Render full shell (tab bar + content area) ───────

  _renderShell() {
    const q        = this._currentQuestion;
    const isSkip   = q && q.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorConfig.getType(
      isSkip ? (q.original_type || 'mcq') : (q?.type || 'mcq')
    );
    const badgeColor = typeConf ? typeConf.color : '#3498db';
    const badgeLabel = typeConf ? typeConf.label : 'MCQ';

    this.innerHTML = `
      <div class="ep-shell">

        <!-- Tab bar -->
        <div class="ep-tabbar">
          <div class="ep-tabbar-left">
            ${isSkip
              ? `<span class="ep-type-badge ep-badge-skip">⊘ SKIP</span>`
              : `<span class="ep-type-badge"
                       style="background:${badgeColor}">${badgeLabel}</span>`
            }
          </div>
          <div class="ep-tabs">
            <button class="ep-tab ep-tab-active" data-tab="edit">Edit</button>
            <button class="ep-tab ep-tab-preview ${this._previewSaved ? '' : 'ep-tab-disabled'}"
                    data-tab="preview">Preview</button>
          </div>
          <div class="ep-tabbar-right"></div>
        </div>

        <!-- Content area -->
        <div class="ep-content"></div>

      </div>
    `;

    this._bindTabEvents();
  }

  // ── Update just the tab bar (after save) ────────────

  _updateTabBar() {
    const editTab    = this.querySelector('[data-tab="edit"]');
    const previewTab = this.querySelector('[data-tab="preview"]');
    if (!editTab || !previewTab) return;

    editTab.classList.toggle('ep-tab-active', this._activeTab === 'edit');
    editTab.classList.toggle('ep-tab-inactive', this._activeTab !== 'edit');
    previewTab.classList.remove('ep-tab-disabled');
    previewTab.classList.toggle('ep-tab-active', this._activeTab === 'preview');
    previewTab.classList.toggle('ep-tab-inactive', this._activeTab !== 'preview');
  }

  // ── Mount form into content area ─────────────────────

  _mountForm() {
    const content = this.querySelector('.ep-content');
    if (!content) return;
    content.innerHTML = '<mcq-form></mcq-form>';
    const form = content.querySelector('mcq-form');
    if (form) form.loadQuestion(this._currentIndex, this._currentQuestion);
  }

  // ── Mount preview into content area ──────────────────

  _mountPreview() {
    const content = this.querySelector('.ep-content');
    if (!content) return;
    const q = this._currentQuestion;

    if (!q) { content.innerHTML = ''; return; }

    if (q.type === EditorConfig.SKIP_TYPE) {
      const typeConf = EditorConfig.getType(q.original_type || 'mcq');
      content.innerHTML = `
        <div class="ep-preview-wrap">
          <div class="ep-preview-scroll">
            <div class="ep-skip-notice">
              <div class="ep-skip-icon">⊘</div>
              <p>This question is marked as <strong>Skip</strong>.<br>
                 Original type: <strong>${typeConf ? typeConf.label : q.original_type}</strong>
              </p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (q.type === 'mcq') {
      content.innerHTML = `
        <div class="ep-preview-wrap">
          <div class="ep-preview-scroll">
            <mcq-radio></mcq-radio>
          </div>
        </div>
      `;
      const mcqEl = content.querySelector('mcq-radio');
      if (mcqEl) mcqEl.setAttribute('config', JSON.stringify(q));
      return;
    }

    // Unsupported type preview
    const typeConf = EditorConfig.getType(q.type);
    content.innerHTML = `
      <div class="ep-preview-wrap">
        <div class="ep-preview-scroll">
          <div class="ep-skip-notice">
            <div class="ep-skip-icon">🔧</div>
            <p>Preview for <strong>${typeConf ? typeConf.label : q.type}</strong><br>
               will be available in a future stage.</p>
          </div>
        </div>
      </div>
    `;
  }

  // ── Tab click events ─────────────────────────────────

  _bindTabEvents() {
    this.querySelectorAll('.ep-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('ep-tab-disabled')) return;
        this._activeTab = tab.dataset.tab;
        this._updateTabBar();
        if (this._activeTab === 'edit') {
          this._mountForm();
        } else {
          this._mountPreview();
        }
      });
    });
  }

}

customElements.define('editor-panel', EditorPanelComponent);