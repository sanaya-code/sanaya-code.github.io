// editor/components/editor_panel/component.js

class EditorPanelComponent extends HTMLElement {

  connectedCallback() {
    this._currentIndex = -1;
    this._isNew        = false;
    this.clear();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question, isNew = false) {
    this._currentIndex = index;
    this._isNew        = isNew;
    this._renderShell(question);
    this._mountForm(question);
  }

  showPreviewTab(question) {
    this._updateTabBar('preview');
    this._mountPreview(question);
  }

  showTypeSelector() {
    this.innerHTML = `
      <div class="ep-shell">
        <div class="ep-tabbar">
          <div class="ep-tabbar-left">
            <span style="font-size:13px;font-weight:600;
                         color:var(--text-secondary)">New Question</span>
          </div>
          <div class="ep-tabbar-right">
            <button class="ep-close-btn" id="ep-ts-close-btn">✕ Close</button>
          </div>
        </div>
        <div class="ep-content">
          <div class="ep-form-host">
            <type-selector></type-selector>
          </div>
        </div>
      </div>`;

    this.querySelector('#ep-ts-close-btn')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('type-selector-closed', { bubbles: true }));
    });
  }

  clear() {
    this._currentIndex = -1;
    this._isNew        = false;
    this.innerHTML = `
      <div class="middle-placeholder">
        <div class="placeholder-icon">✦</div>
        <p>Click <strong>+ Add Question</strong><br>to get started</p>
      </div>`;
  }

  // ── Shell ────────────────────────────────────────────

  _renderShell(question) {
    const isSkip     = question?.type === EditorConfig.SKIP_TYPE;
    const typeConf   = EditorFormRegistry.getType(
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
            <button class="ep-tab ep-tab-inactive" data-tab="preview">Preview</button>
          </div>
          <div class="ep-tabbar-right">
            <button class="ep-close-btn" id="ep-close-btn"
                    title="${this._isNew ? 'Discard new question' : 'Close editor'}">
              ✕ Close
            </button>
          </div>
        </div>
        <div class="ep-content"></div>
      </div>`;

    this._bindTabEvents(question);
    this._bindCloseButton();
  }

  // ── Tab bar ──────────────────────────────────────────

  _updateTabBar(activeTab) {
    const editTab    = this.querySelector('[data-tab="edit"]');
    const previewTab = this.querySelector('[data-tab="preview"]');
    if (!editTab || !previewTab) return;

    editTab.classList.toggle('ep-tab-active',   activeTab === 'edit');
    editTab.classList.toggle('ep-tab-inactive', activeTab !== 'edit');
    previewTab.classList.toggle('ep-tab-active',   activeTab === 'preview');
    previewTab.classList.toggle('ep-tab-inactive', activeTab !== 'preview');
  }

  // ── Close button ─────────────────────────────────────

  _bindCloseButton() {
    this.querySelector('#ep-close-btn')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('question-closed', {
        bubbles: true,
        detail:  { isNew: this._isNew, index: this._currentIndex }
      }));
    });

    this.addEventListener('question-saved', () => { this._isNew = false; }, { once: true });
  }

  // ── Mount form ───────────────────────────────────────

  _mountForm(question) {
    const content = this.querySelector('.ep-content');
    if (!content) return;

    const type = question?.type === EditorConfig.SKIP_TYPE
      ? (question.original_type || 'mcq')
      : (question?.type || 'mcq');

    const formTag = EditorFormRegistry.getFormTag(type);

    if (formTag) {
      content.innerHTML =
        `<div class="ep-form-host"><${formTag}></${formTag}></div>`;
      const form = content.querySelector(formTag);
      if (form) form.loadQuestion(
        this._currentIndex,
        JSON.parse(JSON.stringify(question))
      );
    } else {
      const typeConf = EditorFormRegistry.getType(type);
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
      const typeConf = EditorFormRegistry.getType(question.original_type || 'mcq');
      content.innerHTML = `
        <div class="ep-preview-wrap"><div class="ep-preview-scroll">
          <div class="ep-skip-notice">
            <div class="ep-skip-icon">⊘</div>
            <p>Marked as <strong>Skip</strong>.<br>
               Original: <strong>
                 ${typeConf ? typeConf.label : question.original_type}
               </strong></p>
          </div>
        </div></div>`;
      return;
    }

    const tag = EditorFormRegistry.getPreviewTag(question?.type);
    if (tag) {
      const previewEl = document.createElement(tag);
      previewEl.setAttribute('config', JSON.stringify(question));
      const wrap   = document.createElement('div');
      wrap.className = 'ep-preview-wrap';
      const scroll = document.createElement('div');
      scroll.className = 'ep-preview-scroll';
      scroll.appendChild(previewEl);
      wrap.appendChild(scroll);
      content.innerHTML = '';
      content.appendChild(wrap);
    } else {
      const typeConf = EditorFormRegistry.getType(question?.type);
      content.innerHTML = `
        <div class="ep-preview-wrap"><div class="ep-preview-scroll">
          <div class="ep-skip-notice">
            <div class="ep-skip-icon">🔧</div>
            <p>No preview for<br>
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

        const active = tab.dataset.tab;
        this._updateTabBar(active);
        this.dispatchEvent(new CustomEvent('tab-switched', {
          bubbles: true,
          detail:  { tab: active, index: this._currentIndex }
        }));
      });
    });
  }

}

customElements.define('editor-panel', EditorPanelComponent);