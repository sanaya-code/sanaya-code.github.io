// components/right_panel/controller.js

class RightPanelController {

  constructor(mountEl) {
    this.component = new RightPanelComponent();
    this.mountEl   = mountEl;
  }

  // ── setup ─────────────────────────────────────────────────────────────────

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
  }

  // ── expose panes so UIComposer can mount children into them ───────────────

  getOperatorsPane() { return this.component.getOperatorsPane(); }
  getFormPane()      { return this.component.getFormPane(); }
  getSentencePane()  { return this.component.getSentencePane(); }

  // ── event binding ─────────────────────────────────────────────────────────

  bindEvents(onTabClick) {
    this.component.el.addEventListener('right-panel:tab-click', (e) => {
      onTabClick(e.detail.tabId);
    });
  }

  // ── called by app / event handlers ───────────────────────────────────────

  showOperatorsView() { this.component.showOperatorsView(); }
  showFormView()      { this.component.showFormView(); }
  showSentenceView()  { this.component.showSentenceView(); }

}