// editor/components/editor_panel/component.js

class EditorPanelComponent extends HTMLElement {

  connectedCallback() {
    this._currentIndex = -1;
    this._previewSaved = false;
    this._activeTab    = 'edit';
    this.clear();
  }

  // ── Public API ───────────────────────────────────────

  // Load question into Edit tab. question is a deep clone from state.
  loadQuestion(index, question) {
    this._currentIndex = index;
    this._previewSaved = false;
    this._activeTab    = 'edit';
    this._renderShell(question);
    this._mountForm(question);
  }

  // After save — switch to Preview tab with fresh data from state
  showPreviewTab(question) {
    this._previewSaved = true;
    this._activeTab    = 'preview';
    this._updateTabBar(question);
    this._mountPreview(question);
  }

  // Clear panel — show placeholder
  clear() {
    this._currentIndex = -1;
    this._previewSaved = false;
    this._activeTab    = 'edit';
    this.innerHTML = `
      <div class="middle-placeholder">
        <div class="placeholder-icon">✦</div>
        <p>Click <strong>+ Add Question</strong><br>to get started</p>
      </div>`;
  }

  // Silently update index (active card shifted, form content unchanged)
  updateCurrentIndex(newIndex) {
    this._currentIndex = newIndex;
  }

  // ── Shell ────────────────────────────────────────────

  _renderShell(question) {
    const isSkip   = question && question.type === EditorConfig.SKIP_TYPE;
    const typeConf = EditorConfig.getType(
      isSkip ? (question.original_type || 'mcq') : (question?.type || 'mcq')
    );
    const badgeColor = typeConf ? typeConf.color : '#3498db';
    const badgeLabel = typeConf ? typeConf.label : '?';

    const badge = isSkip
      ? `<span class="ep-type-badge ep-badge-skip">⊘ SKIP</span>`
      : `<span class="ep-type-badge" style="background:${badgeColor}">${badgeLabel}</span>`;

    this.innerHTML = `
      <div class="ep-shell">
        <div class="ep-tabbar">
          <div class="ep-tabbar-left">${badge}</div>
          <div class="ep-tabs">
            <button class="ep-tab ep-tab-active" data-tab="edit">Edit</button>
            <button class="ep-tab ${this._previewSaved ? '' : 'ep-tab-disabled'}"
                    data-tab="preview">Preview</button>
          </div>
          <div class="ep-tabbar-right"></div>
        </div>
        <div class="ep-content"></div>
      </div>`;

    this._bindTabEvents(question);
  }

  // ── Tab bar ──────────────────────────────────────────

  _updateTabBar(question) {
    const editTab    = this.querySelector('[data-tab="edit"]');
    const previewTab = this.querySelector('[data-tab="preview"]');
    if (!editTab || !previewTab) return;
    editTab.classList.toggle('ep-tab-active',   this._activeTab === 'edit');
    editTab.classList.toggle('ep-tab-inactive', this._activeTab !== 'edit');
    previewTab.classList.remove('ep-tab-disabled');
    previewTab.classList.toggle('ep-tab-active',   this._activeTab === 'preview');
    previewTab.classList.toggle('ep-tab-inactive', this._activeTab !== 'preview');
  }

  // ── Mount form ───────────────────────────────────────

  _mountForm(question) {
    const content = this.querySelector('.ep-content');
    if (!content) return;

    const type    = question?.type === EditorConfig.SKIP_TYPE
      ? (question.original_type || 'mcq')
      : (question?.type || 'mcq');

    const formTag = EditorFormRegistry.getFormTag(type);

    if (formTag) {
      content.innerHTML =
        `<div class="ep-form-host"><${formTag}></${formTag}></div>`;
      const form = content.querySelector(formTag);
      // Form receives a clone — it edits its own copy until Save
      if (form) form.loadQuestion(this._currentIndex,
        JSON.parse(JSON.stringify(question)));
    } else {
      const typeConf = EditorConfig.getType(type);
      content.innerHTML = `
        <div class="middle-placeholder">
          <div class="placeholder-icon">🔧</div>
          <p>Edit form for <strong style="color:var(--accent)">
            ${typeConf ? typeConf.label : type}
          </strong><br>is not yet implemented.</p>
          <p style="font-size:11px;color:var(--text-muted);margin-top:8px">
            Register a form tag in
            <code>editor_form_registry.js</code> to enable editing.
          </p>
        </div>`;
    }
  }

  // ── Mount preview ────────────────────────────────────

  _mountPreview(question) {
    const content = this.querySelector('.ep-content');
    if (!content) return;

    if (question?.type === EditorConfig.SKIP_TYPE) {
      const typeConf = EditorConfig.getType(question.original_type || 'mcq');
      content.innerHTML = `
        <div class="ep-preview-wrap"><div class="ep-preview-scroll">
          <div class="ep-skip-notice">
            <div class="ep-skip-icon">⊘</div>
            <p>Marked as <strong>Skip</strong>.<br>
               Original type: <strong>
                 ${typeConf ? typeConf.label : question.original_type}
               </strong></p>
          </div>
        </div></div>`;
      return;
    }

    const tag = EditorFormRegistry.getPreviewTag(question?.type);

    if (tag) {
      content.innerHTML = `
        <div class="ep-preview-wrap">
          <div class="ep-preview-scroll"><${tag}></${tag}></div>
        </div>`;
      const el = content.querySelector(tag);
      if (el) el.setAttribute('config', JSON.stringify(question));
    } else {
      const typeConf = EditorConfig.getType(question?.type);
      content.innerHTML = `
        <div class="ep-preview-wrap"><div class="ep-preview-scroll">
          <div class="ep-skip-notice">
            <div class="ep-skip-icon">🔧</div>
            <p>No preview component for<br>
               <strong>${typeConf ? typeConf.label : question?.type}</strong>.<br>
               <span style="font-size:11px;color:var(--text-muted)">
                 Add the quiz component script to editor.html
               </span></p>
          </div>
        </div></div>`;
    }
  }

  // ── Tab events ───────────────────────────────────────

  _bindTabEvents(question) {
    this.querySelectorAll('.ep-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('ep-tab-disabled')) return;
        this._activeTab = tab.dataset.tab;
        this._updateTabBar(question);
        if (this._activeTab === 'edit') {
          // Re-fetch from state — always fresh
          const q = EditorState.getQuestion(this._currentIndex);
          this._mountForm(q || question);
        } else {
          const q = EditorState.getQuestion(this._currentIndex);
          this._mountPreview(q || question);
        }
      });
    });
  }

}

customElements.define('editor-panel', EditorPanelComponent);