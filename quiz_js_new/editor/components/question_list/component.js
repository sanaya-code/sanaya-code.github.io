// editor/components/question_list/component.js

// ── Config ───────────────────────────────────────────────────────────────────

const DOT_COLUMNS = 4;   // number of dot widgets per row

// ── Question Card Widget ──────────────────────────────────────────────────────

class QuestionCardWidget {

  render(q, index, activeIndex, canDrag) {
    const isSkip     = q.type === 'skip';
    const typeConf   = isSkip ? null : EditorFormRegistry.getType(q.type);
    const badgeColor = typeConf ? typeConf.color : '#7f8c8d';
    const badgeLabel = isSkip ? 'SKIP' : (typeConf ? typeConf.label : q.type);
    const rawText    = (q.question || '').replace(/<[^>]*>/g, '').trim();
    const isActive   = index === activeIndex;

    const card = document.createElement('div');
    card.className = 'ql-card' + (isActive ? ' active' : '');
    card.dataset.index = index;
    card.draggable = canDrag;

    card.innerHTML = `
      <div class="ql-card-top">
        ${canDrag
          ? '<span class="ql-drag-handle" title="Drag to reorder">⠿</span>'
          : '<span class="ql-drag-handle ql-drag-disabled">⠿</span>'
        }
        <span class="ql-badge ${isSkip ? 'ql-badge-skip' : ''}"
              style="${isSkip ? '' : `background:${badgeColor}`}">
          ${badgeLabel}
        </span>
        ${q._unsaved
          ? '<span class="ql-unsaved-dot" title="Unsaved"></span>'
          : ''}
        <span class="ql-card-num">#${String(index + 1).padStart(3, '0')}</span>
        <button class="ql-delete" data-index="${index}"
                title="Delete" ${!canDrag ? 'disabled' : ''}>✕</button>
      </div>
      <div class="ql-card-text ${!rawText ? 'empty' : ''}">
        ${rawText || 'Untitled question'}
      </div>
    `;

    return card;
  }

  bindEvents(el, index, canDrag, component) {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('ql-delete')) return;
      component.dispatchEvent(new CustomEvent('question-selected',
        { bubbles: true, detail: { index } }));
    });

    el.querySelector('.ql-delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      component.dispatchEvent(new CustomEvent('question-deleted',
        { bubbles: true, detail: { index } }));
    });

    if (!canDrag) return;
    this._bindDragEvents(el, index, component);
  }

  _bindDragEvents(el, index, component) {
    el.addEventListener('dragstart', (e) => {
      component._dragSrcIdx = index;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      component.querySelectorAll('[data-index]')
        .forEach(c => {
          c.classList.remove('drag-over-top');
          c.classList.remove('drag-over-bottom');
        });
    });

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (index === component._dragSrcIdx) return;
      component.querySelectorAll('[data-index]')
        .forEach(c => {
          c.classList.remove('drag-over-top');
          c.classList.remove('drag-over-bottom');
        });
      const rect     = el.getBoundingClientRect();
      const isTop    = e.clientY < rect.top + rect.height / 2;
      component._dropIndex = isTop ? index : index + 1;
      el.classList.add(isTop ? 'drag-over-top' : 'drag-over-bottom');
    });

    el.addEventListener('dragleave', () => {
      el.classList.remove('drag-over-top');
      el.classList.remove('drag-over-bottom');
    });

    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('drag-over-top');
      el.classList.remove('drag-over-bottom');
      const from = component._dragSrcIdx;
      const to   = component._dropIndex;
      component._dragSrcIdx = null;
      component._dropIndex  = null;
      if (from === null || to === null) return;
      // Adjust for the removal of the dragged item shifting indices
      const adjustedTo = to > from ? to - 1 : to;
      if (from === adjustedTo) return;
      component.dispatchEvent(new CustomEvent('question-reordered',
        { bubbles: true, detail: { from, to: adjustedTo } }));
    });
  } 
}

class QuestionDotWidget {

  render(q, index, activeIndex, canDrag) {
    const isSkip   = q.type === 'skip';
    const typeConf = isSkip ? null : EditorFormRegistry.getType(q.type);
    const color    = typeConf ? typeConf.color : '#7f8c8d';
    const rawText  = (q.question || '').replace(/<[^>]*>/g, '').trim();
    const isActive = index === activeIndex;
    const label    = String(index + 1).padStart(3, '0');
    const tooltip  = rawText || 'Untitled question';

    const dot = document.createElement('div');
    dot.className = 'ql-dot' + (isActive ? ' active' : '') + (isSkip ? ' ql-dot-skip' : '');
    dot.dataset.index = index;
    dot.draggable = canDrag;
    dot.title = `#${label} — ${tooltip}`;
    dot.style.setProperty('--dot-color', isSkip ? '#7f8c8d' : color);

    dot.innerHTML = `
      <span class="ql-dot-num">${label}</span>
      ${q._unsaved ? '<span class="ql-dot-unsaved"></span>' : ''}
    `;

    return dot;
  }

  bindEvents(el, index, canDrag, component) {
    el.addEventListener('click', () => {
      component.dispatchEvent(new CustomEvent('question-selected',
        { bubbles: true, detail: { index } }));
    });

    if (!canDrag) return;
    this._bindDragEvents(el, index, component);
  }

  _bindDragEvents(el, index, component) {
    el.addEventListener('dragstart', (e) => {
      component._dragSrcIdx = index;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      component.querySelectorAll('[data-index]')
        .forEach(c => {
          c.classList.remove('drag-over-top');
          c.classList.remove('drag-over-bottom');
        });
    });

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (index === component._dragSrcIdx) return;
      component.querySelectorAll('[data-index]')
        .forEach(c => {
          c.classList.remove('drag-over-top');
          c.classList.remove('drag-over-bottom');
        });
      const rect  = el.getBoundingClientRect();
      const isTop = e.clientX < rect.left + rect.width / 2;
      component._dropIndex = isTop ? index : index + 1;
      el.classList.add(isTop ? 'drag-over-top' : 'drag-over-bottom');
    });

    el.addEventListener('dragleave', () => {
      el.classList.remove('drag-over-top');
      el.classList.remove('drag-over-bottom');
    });

    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('drag-over-top');
      el.classList.remove('drag-over-bottom');
      const from = component._dragSrcIdx;
      const to   = component._dropIndex;
      component._dragSrcIdx = null;
      component._dropIndex  = null;
      if (from === null || to === null) return;
      const adjustedTo = to > from ? to - 1 : to;
      if (from === adjustedTo) return;
      component.dispatchEvent(new CustomEvent('question-reordered',
        { bubbles: true, detail: { from, to: adjustedTo } }));
    });
  }

}

// ── Question List Component ───────────────────────────────────────────────────

class QuestionListComponent extends HTMLElement {

  connectedCallback() {
    this._dragSrcIdx  = null;
    this._dropIndex   = null;
    this._mode        = 'view';
    this._viewMode    = 'card';
    this._questions   = [];
    this._activeIndex = -1;
    this._render();
  }

  // ── Public API ───────────────────────────────────────

  setQuestions(questions, activeIndex = -1, mode = 'view') {
    this._mode        = mode;
    this._questions   = questions;
    this._activeIndex = activeIndex;
    this._render();
  }

  setViewMode(mode) {
    if (this._viewMode === mode) return;
    this._viewMode = mode;
    this._render();
  }

  // ── Get active widget ─────────────────────────────────

  _getWidget() {
    return this._viewMode === 'dot'
      ? new QuestionDotWidget()
      : new QuestionCardWidget();
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    const questions   = this._questions;
    const activeIndex = this._activeIndex;
    const canDrag     = this._mode === 'view';
    const widget      = this._getWidget();
    const isDot       = this._viewMode === 'dot';

    this.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = isDot ? 'ql-dot-wrap' : 'question-list-wrap';
    if (isDot) wrap.style.setProperty('--dot-columns', DOT_COLUMNS);

    if (!questions.length) {
      wrap.innerHTML = `
        <div class="question-list-empty">
          <div class="ql-empty-icon">📋</div>
          <p>No questions yet.<br>
             Click <strong>+ Add Question</strong> to begin.</p>
        </div>`;
    } else {
      questions.forEach((q, i) => {
        const el = widget.render(q, i, activeIndex, canDrag);
        widget.bindEvents(el, i, canDrag, this);
        wrap.appendChild(el);
      });
    }

    this.appendChild(wrap);
    this._scrollToIndex(activeIndex);
  }

  // ── Scroll active item into view ─────────────────────

  _scrollToIndex(index) {
    if (index < 0) return;
    const el = this.querySelector(`[data-index="${index}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

}

customElements.define('question-list', QuestionListComponent);