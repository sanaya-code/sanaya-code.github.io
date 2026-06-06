---

## Quiz Editor — App Summary

### What the app is

A standalone HTML-based **Quiz Question Editor** (`editor.html`). It lets you create, edit,
and export quiz questions of many different types. It runs entirely in the browser with no
build step — plain HTML, CSS, and vanilla JS custom elements.

---

### Architecture

#### Layers

```
User interaction
    → Component emits CustomEvent
        → MainController routes to event handler method
            → Event handler calls ComponentController method(s)
                → ComponentController calls Component method(s)
                    → Component updates UI
```

#### MainController (`editor/controller.js`)
- Single orchestrator for the entire application. A plain class: `new MainController()` on DOMContentLoaded.
- Instantiates all ComponentControllers and EventHandlers on startup.
- Binds all CustomEvents from components to handler methods in `_bindCustomEvents()`.
- Binds all DOM button events in `_bindDomEvents()` via controller signal methods.
- Owns load/export/draft logic. Delegates all UI ops to controllers.
- Zero direct DOM access except `#shell` (layout toggle only).

#### ComponentControllers
One per smart component. Acts as bridge between MainController/handlers and the component.
Contains only UI-level operation methods. Never touches state. Never talks to other controllers.

- `TopbarController` — disableAddQuestion, enableAddQuestion, openFilePicker, signal bindings
- `EmptyStateController` — show/hide, showDraftButton, showError/hideError, signal bindings
- `QuestionListController` — refresh()
- `EditorPanelController` — loadQuestion, loadNewQuestion, showPreview, showTypeSelector, clear.
  Also owns internal `tab-switched` logic (reads state, tells component what to render).

#### Components
Dumb renderers. Receive data and update UI. Emit CustomEvents on user interaction.
Never call controllers. Never read from state. Never talk to other components.

- `TopbarComponent` — wraps `#topbar`, exposes signal binding methods (onAddQuestion etc)
- `EmptyStateComponent` — wraps `#empty-state`, exposes show/hide/error/draft methods
- `QuestionListComponent` — custom element `question-list`, renders card list, emits
  question-selected / question-deleted / question-reordered
- `EditorPanelComponent` — custom element `editor-panel`, renders form+preview shell,
  emits question-saved / question-closed / type-selected / type-selector-closed / tab-switched
- `TypeSelectorComponent` — custom element `type-selector`, rendered inside editor-panel,
  no separate controller needed

#### EventHandlers (`editor/event_handler/`)
Each class has methods that handle exactly one event.
Called by MainController. Call StateController for state. Call ComponentControllers for UI.

- `QuestionListHandler` — onQuestionSelected, onQuestionDeleted, onQuestionReordered
- `EditorPanelHandler` — onQuestionSaved, onQuestionClosed, onTypeSelected, onTypeSelectorClosed

#### State (`editor/state/`)
`StateController` is the only state API. Delegates to three sub-states.
Never accessed by components or ComponentControllers — only by event handlers.

- `QuestionState` — owns questions array (add/delete/reorder/save)
- `SelectionState` — owns active index + mode (view/edit/new) + guards
- `DraftState` — localStorage persistence

---

### Form Widget Class Pattern (every form follows this)

Each form component is split into 6 classes:

```
{TYPE}FormUtils        — escHtml, parseOptionalNumber, parseTags,
                         bindFocusPreview, bindCollapsible
{TYPE}QuestionWidget   — render(q), bindEvents(), getValue()
{TYPE}MediaWidget      — render(q), bindEvents(), getSvg(), getImgUrl()
{TYPE}AnswerWidget     — render(q), bindEvents(), get*(), showError(msg)
{TYPE}MetadataWidget   — render(q), bindEvents(), getData()
{TYPE}FormComponent    — connectedCallback(), loadQuestion(), _render(),
                         _bindAll(), _bindFooter(), _handleSkipToggle(),
                         _handleSave(), _collectData()
```

**Footer layout**: Save button left + ⊘ Mark as Skip / ↩ Mark {TypeLabel} right,
`justify-content: space-between`. No topbar inside the form.

**Skip state**: body dims via `opacity: 0.6`, footer stays active via
`~ .ef-{prefix}-footer { opacity: 1; pointer-events: all; }`.

**CSS generation rule**: Always `sed 's/ef-mcq-/ef-{prefix}-/g; s/mcq-form/{element-tag}/g'`
on MCQ's `style.css` as the base, then append only new rules for the unique answer widget.
Never write the base from scratch.

**CSS width rule**: Any flex child with text content must use `flex: 1; min-width: 0`.
Never use `white-space: nowrap` or `overflow: hidden + text-overflow: ellipsis`
without `min-width: 0`.

---

### CSS Prefix Table

| Type                          | Prefix        | Custom Element Tag             |
|-------------------------------|---------------|--------------------------------|
| mcq                           | ef-mcq-       | mcq-form                       |
| true_false                    | ef-tf-        | true-false-form                |
| multi_select                  | ef-ms-        | multi-select-form              |
| short_answer                  | ef-sa-        | short-answer-form              |
| fill_in_blank                 | ef-fib-       | fill-in-blank-form             |
| ordering                      | ef-ord-       | ordering-form                  |
| ordering_horizontal           | ef-orh-       | ordering-horizontal-form       |
| multi_fill_in_blank           | ef-mfib-      | multi-fill-in-blank-form       |
| options_fill_in_blank         | ef-ofib-      | options-fill-in-blank-form     |
| matching                      | ef-match-     | matching-form                  |
| compare_quantities            | ef-cq-        | compare-quantities-form        |
| image_compare_quantities_tick | ef-ict-       | compare-image-objects-form     |
| multi_select_circle           | ef-msc-       | multi-select-circle-form       |
| multi_select_two              | ef-stq-       | multi-select-two-form          |

---

### Directory Tree

```
editor/
├── editor.html                        # entry point — loads all scripts/styles
├── config.js                          # EditorConfig: difficulty levels, SKIP_TYPE, STORAGE_KEY
├── controller.js                      # MainController class — orchestrator, no UI/business logic
├── editor_form_registry.js            # registry: maps type string → form tag + default data
├── style.css                          # global shell styles, CSS variables, layout
│
├── state/
│   ├── index.js                       # StateController: delegates to 3 sub-states
│   ├── question_state.js              # owns questions array (add/delete/reorder/save)
│   ├── selection_state.js             # owns active index + mode + guards
│   └── draft_state.js                 # localStorage read/write/check/clear
│
├── components/
│   ├── topbar/
│   │   ├── component.js               # TopbarComponent: wraps #topbar, signal bindings
│   │   └── controller.js              # TopbarController: add/load/export/filePicker ops
│   │
│   ├── empty_state/
│   │   ├── component.js               # EmptyStateComponent: wraps #empty-state
│   │   └── controller.js              # EmptyStateController: show/hide/error/draft ops
│   │
│   ├── question_list/
│   │   ├── component.js               # QuestionListComponent: custom element, card list
│   │   ├── controller.js              # QuestionListController: refresh()
│   │   └── style.css
│   │
│   ├── editor_panel/
│   │   ├── component.js               # EditorPanelComponent: custom element, form+preview shell
│   │   ├── controller.js              # EditorPanelController: load/preview/typeSelector/clear
│   │   └── style.css
│   │
│   ├── type_selector/
│   │   ├── component.js               # TypeSelectorComponent: type grid, search
│   │   └── style.css
│   │
│   ├── preview_panel/
│   │   ├── component.js               # PreviewPanelComponent: legacy, not in main shell
│   │   └── style.css
│   │
│   └── question_forms/                # one folder per question type
│       ├── mcq_form/                  # MCQ — THE TEMPLATE for all other forms ✓
│       │   ├── component.js           #   6 classes: Utils/Question/Media/Answer/Metadata/Form
│       │   └── style.css
│       ├── true_false_form/           # True / False — needs refactor (1 class currently)
│       │   ├── component.js
│       │   └── style.css
│       ├── multi_select_form/         # Multi Select checkboxes ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── short_answer_form/         # Short Answer ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── fill_in_blank_form/        # Fill in Blank ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── ordering_form/             # Ordering — two linked drag lists ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── ordering_horizontal_form/  # Ordering Horizontal ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── multi_fill_in_blank_form/  # Multi Fill Blank — segment builder pill UI ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── options_fill_in_blank_form/ # Options Fill Blank ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── matching_form/             # Matching — pairs drag grid + distractors ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── compare_quantities_form/   # Compare Quantities ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── image_compare_quantities_tick_form/ # Image Compare Tick ✓
│       │   ├── component.js
│       │   └── style.css
│       ├── multi_select_circle_form/  # Multi Select Circle ✓
│       │   ├── component.js
│       │   └── style.css
│       └── multi_select_two_form/     # Multi Select Two ✓
│           ├── component.js
│           └── style.css
│
├── event_handler/
│   ├── question_list/
│   │   └── handler.js                 # QuestionListHandler: onSelected/Deleted/Reordered
│   └── editor_panel/
│       └── handler.js                 # EditorPanelHandler: onSaved/Closed/TypeSelected/TypeSelectorClosed
│
└── utils/
    ├── json_loader.js                 # loads question JSON from file
    └── json_exporter.js               # exports questions array to downloadable JSON
```

---

### Pending Work

#### Immediate
- `true_false_form` — needs refactor to 6-class pattern (currently 1 class)

#### Question type forms not yet built (10 types)
| Type                        | Target Prefix  | Element Tag                        |
|-----------------------------|----------------|------------------------------------|
| table_fill_in_the_blank     | ef-tabfib-     | table-fill-in-the-blank-form       |
| table_image_fill_in_blank   | ef-tifib-      | table-image-fill-in-blank-form     |
| fill_in_blank_operation     | ef-fibopr-     | fill-in-blank-operation-form       |
| fill_in_blank_multi_graph   | ef-fibmgt-     | fill-in-blank-multi-graph-form     |
| matching_connection         | ef-mconn-      | matching-connection-form           |
| matching_connection_image   | ef-ipm-        | matching-connection-image-form     |
| matching_select             | ef-mdrag-      | matching-select-form               |
| number_line_arcs            | ef-nla-        | number-line-arcs-form              |
| clock_set_time              | ef-cst-        | clock-set-time-form                |

#### Old files to delete
- editor/state.js
- editor/selection_state.js
