// editor/components/question_list/component.js

class QuestionListComponent extends HTMLElement {

  connectedCallback() {
    this._dragSrcIdx = null;
    this._render([]);
  }

  // ── Public API ───────────────────────────────────────
  // Receives fresh data from state on every refresh.
  // Does not store questions — renders and discards.

  setQuestions(questions, activeIndex = -1) {
    this._activeIndex = activeIndex;
    this._render(questions);
  }

  setActiveIndex(index) {
    this._activeIndex = index;
    this._highlightActive();
  }

  // ── Render ───────────────────────────────────────────

  _render(questions) {
    this.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'question-list-wrap';

    if (!questions.length) {
      wrap.innerHTML = `
        <div class="question-list-empty">
          <div class="ql-empty-icon">📋</div>
          <p>No questions yet.<br>
             Click <strong>+ Add Question</strong> to begin.</p>
        </div>`;
    } else {
      questions.forEach((q, i) => wrap.appendChild(this._makeCard(q, i)));
    }

    this.appendChild(wrap);
  }

  // ── Build one card ───────────────────────────────────

  _makeCard(q, index) {
    const isSkip     = q.type === 'skip';
    const typeConf   = isSkip ? null : EditorConfig.getType(q.type);
    const badgeColor = typeConf ? typeConf.color : '#7f8c8d';
    const badgeLabel = isSkip ? 'SKIP' : (typeConf ? typeConf.label : q.type);
    const rawText    = (q.question || '').replace(/<[^>]*>/g, '').trim();

    const card = document.createElement('div');
    card.className = 'ql-card' + (index === this._activeIndex ? ' active' : '');
    card.dataset.index = index;
    card.draggable = true;

    card.innerHTML = `
      <div class="ql-card-top">
        <span class="ql-badge ${isSkip ? 'ql-badge-skip' : ''}"
              style="${isSkip ? '' : `background:${badgeColor}`}">
          ${badgeLabel}
        </span>
        ${q._unsaved ? '<span class="ql-unsaved-dot" title="Unsaved"></span>' : ''}
        <span class="ql-card-num">#${String(index + 1).padStart(3, '0')}</span>
        <button class="ql-delete" data-index="${index}" title="Delete">✕</button>
      </div>
      <div class="ql-card-text ${!rawText ? 'empty' : ''}">
        ${rawText || 'Untitled question'}
      </div>
    `;

    this._bindCardEvents(card, index);
    return card;
  }

  // ── Card events ──────────────────────────────────────

  _bindCardEvents(card, index) {

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('ql-delete')) return;
      this.dispatchEvent(new CustomEvent('question-selected',
        { bubbles: true, detail: { index } }));
    });

    card.querySelector('.ql-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('question-deleted',
        { bubbles: true, detail: { index } }));
    });

    card.addEventListener('dragstart', (e) => {
      this._dragSrcIdx = index;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      this.querySelectorAll('.ql-card').forEach(c =>
        c.classList.remove('drag-over'));
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (index !== this._dragSrcIdx) {
        this.querySelectorAll('.ql-card')
          .forEach(c => c.classList.remove('drag-over'));
        card.classList.add('drag-over');
      }
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      const from = this._dragSrcIdx;
      const to   = index;
      if (from === null || from === to) return;
      this._dragSrcIdx = null;
      this.dispatchEvent(new CustomEvent('question-reordered',
        { bubbles: true, detail: { from, to } }));
    });
  }

  // ── Highlight active card without full re-render ─────

  _highlightActive() {
    this.querySelectorAll('.ql-card').forEach((c, i) =>
      c.classList.toggle('active', i === this._activeIndex));
  }

}

customElements.define('question-list', QuestionListComponent);