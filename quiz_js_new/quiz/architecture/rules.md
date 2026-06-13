# Adding a New Quiz Question Type — Steps and Rules

---

## 0. Document in the Design Doc

**0.1** ADD a new section to `Question Types — Component Design` (the
table-per-component reference doc) following the existing format:

    ## (Display Name) (`(type_dir)/`)

    **Type strings:** `(type)`, `(legacy_alias)` (backward compat)   ← omit if single type

    | Class | Description |
    |-------|-------------|
    | `(Type)Geometry`            | ... |   ← omit if no geometry class
    | `(Type)Renderer`            | ... |
    | `(Type)InteractionHandler`  | ... |   ← omit if no handler class
    | `(MainClassName)`           | ... |

**0.2** ADD the new directory to the `quiz/components/question_types/`
tree listing in the same doc, with a trailing comment showing the type
string(s) it handles, matching the existing entries' format exactly.

---

## 1. Create the Component JS

**1.1** NEW FILE: `quiz/components/question_types/(type)/component.js`

**1.2** Must contain 2–4 classes depending on complexity:
- `(Type)Geometry` — only if the component does SVG/coordinate math (optional)
- `(Type)Renderer` — always present. Owns all DOM creation/updates. No events, no state.
- `(Type)InteractionHandler` — present unless the component is trivial
  (single textarea/input with one event). Owns all click/input/drag events,
  calls back into the component via an `onChange`/`onPlace`/`onSelect` callback.
- Main component class — always present. Extends `HTMLElement`. Naming is
  flexible (`McqQuestion`, `TrueFalseComponent`, `MatchingDragComponent`,
  `OrderingComponent` etc. are all valid) — match the existing pattern for
  similar components rather than forcing a rigid `(Type)Component` suffix.

**1.3** Main component class extends `HTMLElement` and implements:
`connectedCallback()`, `attributeChangedCallback()`, `disconnectedCallback()`,
`setup()`, `parseConfigAttribute()`, `validateData()`, `getUserAnswer()`,
`emitAnswerChanged()`, `cleanup()`, plus `bindToggleEvent()` /
`_handleSectionToggle()` if the component has collapsible figure sections.

**1.4** Component fires exactly one event:
- `answer-changed` — detail: `{ answer: <current user answer> }`, bubbles: true

**1.5** All rich content (`question`, option/item labels, choices) must be set
via `innerHTML`, never `textContent`, so MathML/`<sup>`/`<sub>`/SVG render
correctly.

**1.6** `static get observedAttributes() { return ['config']; }` —
`attributeChangedCallback` calls `setup()` only when `config` actually changes
(`oldValue !== newValue`).

**1.7** Last line must be:
`customElements.define('(element-tag)', (Type)Component)`
Tag name never changes once registered. If the new type's natural tag would
collide with an existing custom element, pick a distinct tag
(e.g. `matching-dropdown` vs `matching-select`).

**1.8** No imports, no shared utilities. Every helper lives inside this file
only (Geometry/Renderer/Handler classes above).

**1.9** Renderer never touches `_userResponse`/state. InteractionHandler never
touches global state. Component owns all state and coordinates the others.

---

## 2. Create the Style CSS

**2.1** NEW FILE: `quiz/components/question_types/(type)/style.css`

**2.2** All CSS classes must use a unique short prefix
(e.g. `mcq-`, `ms-`, `mconn-`, `fibmo-`, `cst-`). Zero bare class names.
Confirm the prefix doesn't collide with any existing component's prefix.

**2.3** Fully self-contained. Copy every base rule needed (question wrapper,
collapsible figure sections, svg/image figure styles, rich-content
`sup`/`sub`/`math` rules) directly into this file — do not rely on
`quiz/style.css` or any other component's CSS.

**2.4** Standard base structure to include (rename `xxx-` to the new prefix):

    .xxx-wrapper / .xxx-question { ... }
    .xxx-section, .xxx-section-header, .xxx-section-body, .xxx-collapsed { ... }
    .xxx-svg-figure, .xxx-figure { ... }
    .xxx-question-text sup/sub/math { ... }   /* rich content baseline fixes */

**2.5** For any element that may contain `<sup>`/`<sub>` (question text,
options, labels, choices), use `display: inline-block; line-height: 1.6` —
**never** `display: flex` on the direct parent of rich-content text, or
`<sup>` will render as plain inline text (e.g. "x2" instead of "x²"). If a
flex layout is required, use `display: inline-flex; align-items: baseline`
on the container and put explicit `sup { top: -0.5em }` / `sub { bottom:
-0.25em }` rules on the inner text element.

**2.6** If the component is interactive (drag/click/select), include hover,
selected/active, and focus state classes (e.g. `.xxx-selected`,
`.xxx-active`, `.xxx-focused`).

**2.7** Verify zero foreign class references and no leftover inline styles
from the original component — all `el.style.xxx` assignments for static
styling must become CSS classes (only transient/computed positions like SVG
coordinates may remain as inline styles).

---

## 3. Create the Evaluator JS

**3.1** NEW FILE: `quiz/components/question_types/(type)/evaluator.js`

**3.2** Must export a single object `const (Type)Evaluator = { ... }` with
exactly 3 methods:
- `checkAnswer(question, userAnswer)` → boolean
- `formatUserAnswer(question, userAnswer)` → string (for reporting)
- `formatCorrectAnswer(question)` → string (for reporting)

**3.3** Respect `question.case_sensitive` for text-based answers. Respect
`question.acceptable_answers` / `acceptable_variations` arrays where present.

---

## 4. Register in the Question Registry

**4.1** ADD one or more `QuestionRegistry.register('(type)', '(element-tag)',
(Type)Evaluator)` calls at the end of
`quiz/components/question_types/question_registry.js`.

**4.2** If the JSON data may use multiple type strings for the same
component (legacy aliases, e.g. `matching` and `matching_dropdown`), register
each alias pointing to the same `element-tag` and evaluator.

**4.3** If the JSON data may use multiple field names for the same config
value across versions (e.g. `config.choices` vs `config.value_choices`,
or `headings.field1` vs legacy `headings.count`), the component must read
with a fallback chain: `config.choices || config.value_choices || []`.
Document such aliases in the type comment in `question_registry.js` and in
the design doc table for that component.

---

## 5. Wire into quiz.html

**5.1** Add CSS link — question type styles section:

    link rel=stylesheet href=quiz/components/question_types/(type)/style.css

**5.2** Add script tag — evaluator scripts section (must load BEFORE
`question_registry.js`):

    script src=quiz/components/question_types/(type)/evaluator.js

**5.3** Add script tag — component scripts section (must load AFTER
`question_registry.js`):

    script src=quiz/components/question_types/(type)/component.js

**5.4** Exactly 3 lines added to `quiz.html`. Nothing else changes.

---

## 6. Verification Checklist

- 6.1 Zero CSS class names that don't start with the new component's prefix
- 6.2 No prefix collisions with any other component's `style.css`
- 6.3 `customElements.define()` tag matches the `element-tag` used in the
  registry exactly
- 6.4 `answer-changed` fires with `{ answer: ... }` on every user interaction
- 6.5 `getUserAnswer()` returns data in the same shape as `correct_answer` /
  `user_response` in the JSON schema, so the evaluator can compare directly
- 6.6 All rich-content fields use `innerHTML`; `<sup>`/`<sub>`/MathML render
  correctly (no flex-on-parent bug)
- 6.7 Component handles missing/empty `config` gracefully via
  `validateData()` → `renderer.clear()`
- 6.8 No code, utility, or CSS shared with any other component file
- 6.9 Component never accesses any global app state — it only reads
  `config` from its `config` attribute and fires `answer-changed` upward
- 6.10 If component uses `ResizeObserver` or `window` listeners, they are
  disconnected/removed in `cleanup()` / `disconnectedCallback()`