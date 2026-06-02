// editor/components/question_list/component.js

class QuestionListComponent extends HTMLElement {

  connectedCallback() {
    this._questions   = [];   // array of question objects
    this._activeIndex = -1;   // currently selected card index
    this._dragSrcIdx  = null; // drag source index
    this._render();
  }

  // ── Public API ───────────────────────────────────────

  // Replace the full questions array and re-render
  setQuestions(questions, activeIndex = -1) {
    // Store local copy — don't hold reference to state's array
    this._questions   = questions.map(q => Object.assign({}, q));
    this._activeIndex = activeIndex;
    this._render();
  }

  // Mark one card as active (after external navigation)
  setActiveIndex(index) {
    this._activeIndex = index;
    this._highlightActive();
  }

  // Mark a card as unsaved (dirty)
  markUnsaved(index) {
    if (this._questions[index]) {
      this._questions[index]._unsaved = true;
      this._render();
    }
  }

  // Mark a card as saved (clean)
  markSaved(index) {
    if (this._questions[index]) {
      this._questions[index]._unsaved = false;
      this._render();
    }
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    this.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'question-list-wrap';

    if (this._questions.length === 0) {
      wrap.innerHTML = `
        <div class="question-list-empty">
          <div class="ql-empty-icon">📋</div>
          <p>No questions yet.<br>Click <strong>+ Add Question</strong> to begin.</p>
        </div>
      `;
    } else {
      this._questions.forEach((q, i) => {
        wrap.appendChild(this._makeCard(q, i));
      });
    }

    this.appendChild(wrap);
  }

  // ── Build one card element ───────────────────────────

  _makeCard(q, index) {
    const isSkip    = q.type === 'skip';
    const typeConf  = isSkip
      ? null
      : EditorConfig.getType(q.type);
    const badgeColor = typeConf ? typeConf.color : '#7f8c8d';
    const badgeLabel = isSkip
      ? 'SKIP'
      : (typeConf ? typeConf.label : q.type);

    // Strip HTML tags for preview text
    const rawText   = (q.question || '').replace(/<[^>]*>/g, '').trim();
    const textEmpty = rawText.length === 0;

    const card = document.createElement('div');
    card.className = 'ql-card' +
      (index === this._activeIndex ? ' active' : '');
    card.dataset.index = index;
    card.draggable = true;

    card.innerHTML = `
      <div class="ql-card-top">
        <span class="ql-badge ${isSkip ? 'ql-badge-skip' : ''}"
              style="${isSkip ? '' : `background:${badgeColor}`}">
          ${badgeLabel}
        </span>
        ${q._unsaved ? '<span class="ql-unsaved-dot" title="Unsaved changes"></span>' : ''}
        <span class="ql-card-num">#${String(index + 1).padStart(3, '0')}</span>
        <button class="ql-delete" data-index="${index}" title="Delete question">✕</button>
      </div>
      <div class="ql-card-text ${textEmpty ? 'empty' : ''}">
        ${textEmpty ? 'Untitled question' : rawText}
      </div>
    `;

    this._bindCardEvents(card, index);
    return card;
  }

  // ── Card events ──────────────────────────────────────

  _bindCardEvents(card, index) {

    // Select card
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('ql-delete')) return;
      this._activeIndex = index;
      this._highlightActive();
      this.dispatchEvent(new CustomEvent('question-selected', {
        bubbles: true,
        detail: { index }
      }));
    });

    // Delete button
    card.querySelector('.ql-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('question-deleted', {
        bubbles: true,
        detail: { index }
      }));
    });

    // ── Drag to reorder ──────────────────────────────
    card.addEventListener('dragstart', (e) => {
      this._dragSrcIdx = index;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      this.querySelectorAll('.ql-card').forEach(c =>
        c.classList.remove('drag-over')
      );
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (index !== this._dragSrcIdx) {
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

      this.dispatchEvent(new CustomEvent('question-reordered', {
        bubbles: true,
        detail: { from, to }
      }));

      this._dragSrcIdx = null;
    });
  }

  // ── Highlight active card without full re-render ─────

  _highlightActive() {
    this.querySelectorAll('.ql-card').forEach((c, i) => {
      c.classList.toggle('active', i === this._activeIndex);
    });
  }

}

customElements.define('question-list', QuestionListComponent);