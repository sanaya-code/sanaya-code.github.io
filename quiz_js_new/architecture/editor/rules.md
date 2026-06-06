ADDING A NEW FORM — STEPS & RULES
===================================

--- 1. CREATE THE FORM COMPONENT JS ---

1.1  [NEW FILE] editor/components/question_forms/{type}_form/component.js

1.2  [RULE] Must contain exactly 6 classes:
     - {Type}FormUtils
     - {Type}QuestionWidget
     - {Type}MediaWidget
     - {Type}AnswerWidget
     - {Type}MetadataWidget
     - {Type}FormComponent

1.3  [RULE] {Type}FormComponent extends HTMLElement and implements:
     connectedCallback(), loadQuestion(index, question), _render(),
     _bindAll(), _bindFooter(), _handleSkipToggle(),
     _handleSave(), _collectData()

1.4  [RULE] Form fires two events only:
     - question-saved   → detail: { index, question }
     - question-closed  → detail: { isNew, index }
     These bubble up to editor-panel, which MainController listens to.
     EditorPanelHandler.onQuestionSaved / onQuestionClosed handle them.

1.5  [RULE] Footer layout: Save button LEFT, ⊘ Mark as Skip / ↩ Mark {Label}
     RIGHT. justify-content: space-between. No topbar inside the form.

1.6  [RULE] Skip state: body dims with opacity: 0.6, footer stays active via
     sibling selector: ~ .ef-{prefix}-footer { opacity: 1; pointer-events: all; }

1.7  [RULE] Last line must be:
     customElements.define('{element-tag}', {Type}FormComponent)
     Tag name never changes once registered.

1.8  [RULE] No imports, no shared utilities. Every helper lives inside
     {Type}FormUtils in this file only.

1.9  [RULE] Form component is dumb — never calls StateController, never calls
     any ComponentController. It only reads the question data passed into
     loadQuestion() and fires events upward.


--- 2. CREATE THE FORM STYLE CSS ---

2.1  [NEW FILE] editor/components/question_forms/{type}_form/style.css

2.2  [RULE] All CSS classes must use the ef-{prefix}- prefix from the prefix
     table. Zero bare class names.

2.3  [RULE] Fully self-contained. No shared CSS, no reliance on any other
     form's stylesheet. Copy every base rule you need directly into this file.

2.4  [RULE] Generate base CSS by running:
     sed 's/ef-mcq-/ef-{prefix}-/g; s/mcq-form/{element-tag}/g'
     on MCQ's style.css, then append only the unique rules for the new
     answer widget. Never write the base from scratch.

2.5  [RULE] Include height chain at the bottom:
     {element-tag} .ef-{prefix}-form { min-height: 0; }
     {element-tag} .ef-{prefix}-body { min-height: 0; }

2.6  [RULE] Any flex child with text content must use: flex: 1; min-width: 0
     Never use white-space: nowrap or overflow: hidden + text-overflow: ellipsis
     without min-width: 0.

2.7  [RULE] Verify zero foreign class references and no doubled prefixes
     like ef-ef- after substitution.


--- 3. REGISTER IN THE FORM REGISTRY ---

3.1  [UPDATE] Add one EditorFormRegistry.register('{type}', { ... }) call
     in editor/editor_form_registry.js

3.2  [RULE] Must include: label, description, color, formTag (element tag),
     previewTag (quiz component tag), default (blank JSON template).


--- 4. WIRE INTO editor.html ---

4.1  [UPDATE] Add CSS link — editor form styles section:
     

4.2  [UPDATE] Add script tag — editor form scripts section:
     

4.3  [UPDATE] Add CSS link — quiz preview component:
     

4.4  [UPDATE] Add script tag — quiz preview component:
     

4.5  [RULE] Exactly 4 lines added to editor.html. Nothing else changes.


--- 5. VERIFICATION CHECKLIST ---

5.1  Zero CSS class names that do not start with ef-{prefix}-
5.2  No doubled prefix like ef-ef-{prefix}- anywhere in JS or CSS
5.3  customElements.define() tag matches formTag in registry exactly
5.4  question-saved fires with { index, question }
     question-closed fires with { isNew, index }
5.5  Preview component receives config attribute set BEFORE DOM insertion
5.6  No code, utility, or CSS shared with any other form file
5.7  Form never accesses StateController, ComponentControllers, or any
     global app state — it is fully passive