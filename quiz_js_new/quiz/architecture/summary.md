# Quiz App — App Summary

---

## What the app is

A standalone HTML-based Quiz Runner (`quiz.html` / `index.html`). It loads a JSON array of
quiz questions, renders each question type as a custom element, lets the user navigate and
answer questions, and evaluates results. It runs entirely in the browser with no build
step — plain HTML, CSS, and vanilla JS custom elements.

---

## Architecture

### Layers

    sessionStorage (quizData)
      -> SessionStorageService loads questions
          -> QuizController boots the page
              -> QuizState tracks current index + answers
                  -> UI Bundle (navigation, index panel, question wrapper, result modal)
                      -> Question type custom element renders + emits answer-changed
                          -> EventHandlers route to QuizState / QuizService
                              -> QuizResultEvaluator scores on submit

### Controller (`controller.js`)

- Boots the quiz page on load. Wires `QuizState`, `QuizService`, `SessionStorageService`,
  the UI bundle, and all event handlers together.
- Single entry point — no other file self-initializes.

### QuizState (`quiz_state.js`)

- Runtime state: current question index, per-question user answers, mark-for-review flags.
- Read/written by event handlers only — never touched directly by components.

### QuizService (`quiz_service.js`)

- Pure calculation/data logic: total question count, progress percentage, navigation
  bounds, answer lookups. No DOM access.

### Storage (`storage/`)

- `session_storage_service.js` — reads the `quizData` JSON array from `sessionStorage`
  (written by the quiz-launching page, e.g. an editor or quiz list).

### Utils (`utils/`)

- `image_url_resolver.js` — resolves relative `img_url` paths in question JSON to
  absolute URLs based on the quiz's data directory.
- `quiz_result_evaluator.js` — `QuizResultEvaluator` class. Takes the questions array
  and user answers, calls each question type's `evaluator.checkAnswer()`, and builds the
  final result JSON (per-question correctness, score, summary).

### UI Bundle (`components/ui_bundle.js`, `ui_bundle_factory.js`)

- `UiBundleFactory` instantiates and returns a `UiBundle` — a plain data class holding
  references to all top-level UI component controllers (navigation panel, index panel,
  question wrapper, result modal).
- Controller passes the bundle to event handlers so they can update UI without each
  handler needing its own wiring.

### Smart Components (`components/`)

Each has a `component.js` (custom element) and a `controller.js` (DOM access layer):

- `question_wrapper/` — `<question-wrapper>`. Hosts the active question type custom
  element, swaps it in/out based on `question.type` via `QuestionRegistry.getTag()`.
- `navigation_panel/` — `<navigation-panel>`. Prev/Next/Mark-for-review/Submit buttons,
  emits `nav-prev`, `nav-next`, `mark-review`, `submit`.
- `index_panel/` — `<question-index-panel>`. Grid of question numbers showing
  answered/unanswered/marked state, emits `question-selected`.
- `result_modal/` — `<result-modal>`. Shows score summary after submit, emits `goHome`,
  `restartWithWrongQuestions`.
- `collapsible_section/` — generic `<collapsible-section>` helper (used by some question
  types for figure sections, though most question types now implement their own
  `.xxx-section` / `.xxx-section-header` pattern directly — see below).

### Event Handlers (`event_handlers/`)

Each class handles one group of events. Called by controller wiring. Read/write
`QuizState`, call `QuizService`, update UI via the UI bundle controllers.

- `navigation_handler.js` — `nav-prev`, `nav-next`, `mark-review`, `submit`
- `index_panel_handler.js` — `question-selected`
- `result_modal_handler.js` — `goHome`, `restartWithWrongQuestions`
- `wrapper_handler.js` — `restart-quiz`, `keydown` (arrow key navigation)

---

## Question Type Component Pattern

Every question type lives in its own directory under
`components/question_types/(type)/` with exactly three files:

    component.js   — 2-4 classes (see below)
    evaluator.js    — checkAnswer / formatUserAnswer / formatCorrectAnswer
    style.css       — fully self-contained, unique prefix, no shared classes

### Class roles

- `(Type)Geometry` — pure math (SVG coordinates, layout calculations). Zero DOM, zero
  events. Only present in visual/interactive components (clocks, number lines, matching
  connections, radial graphs).
- `(Type)Renderer` — owns all DOM creation/updates. Builds the HTML skeleton once via
  `createStructure()`, caches element references via `cacheElements()`. All rich content
  (`question`, option/item labels, choices) set via `innerHTML` for MathML/`<sup>`/`<sub>`/
  SVG support. Never touches state, never binds events.
- `(Type)InteractionHandler` — owns all click/input/drag/keyboard events. Calls back into
  the main component via a single callback (`onChange`, `onPlace`, `onConnect`,
  `onSelect`, `onHandSet`, `onArcToggle` etc.). Present in all but the simplest
  text-input components.
- Main component class — extends `HTMLElement`. Lifecycle
  (`connectedCallback`/`attributeChangedCallback`/`disconnectedCallback`), config parsing
  (`parseConfigAttribute`, `validateData`), owns all `_userResponse`/`_responses` state,
  coordinates Geometry/Renderer/Handler, exposes `getUserAnswer()`, emits
  `answer-changed` with `{ answer: ... }`. Naming is flexible — matches whatever pattern
  was used for similar existing components.

### Standard CSS structure (per component, unique prefix)

    .xxx-wrapper / .xxx-question         — outer container
    .xxx-section / -header / -body        — collapsible figure sections
    .xxx-svg-figure / .xxx-figure         — SVG / image figure containers
    .xxx-question-text sup/sub/math       — rich content baseline fixes

Critical rule: any element that may render `<sup>`/`<sub>` must use
`display: inline-block; line-height: 1.6` (or `inline-flex; align-items: baseline` with
explicit `sup{top:-0.5em}/sub{bottom:-0.25em}` rules) — `display: flex` directly on a
rich-content parent breaks superscript/subscript positioning.

---

## Question Registry (`components/question_types/question_registry.js`)

`QuestionRegistry.register(type, tag, evaluator)` — maps a JSON `type` string to a
custom element tag and an evaluator object. `getTag(type)` / `getEvaluator(type)` are
the only lookup methods. Multiple type strings (legacy aliases) can map to the same tag
+ evaluator (e.g. `matching` and `matching_dropdown` → `matching-dropdown`).

### Registered Question Types (22 components, 26 type strings)

| Type string(s) | Tag | Directory |
|---|---|---|
| `mcq` | `mcq-radio` | `mcq_question/` |
| `true_false` | `true-false` | `true_false_question/` |
| `multi_select` | `multi-select` | `multi_select/` |
| `matching_select`, `matching_drag_drop` | `matching-select` | `matching_select/` |
| `matching`, `matching_dropdown` | `matching-dropdown` | `matching_dropdown/` |
| `matching_connection` | `matching-connection` | `matching_connection/` |
| `matching_connection_image` | `matching-connection-image` | `matching_connection_image/` |
| `ordering` | `ordering-drag-drop` | `ordering/` |
| `ordering_horizontal` | `ordering-horizontal-drag-click` | `ordering_horizontal/` |
| `compare_quantities` | `compare-quantities` | `compare_quantities/` |
| `image_compare_quantities_tick`, `compare_image_objects` | `compare-image-objects` | `compare_image_objects/` |
| `fill_in_blank` | `fill-in-blank` | `fill_in_blank/` |
| `multi_fill_in_blank` | `multi-fill-in-blank` | `multi_fill_in_blank/` |
| `options_fill_in_blank` | `options-fill-in-blank` | `options_fill_in_blank/` |
| `fill_in_blank_operation` | `fill-in-blank-operation` | `fill_in_blank_operation/` |
| `fill_in_blank_multi_graph_text`, `fill_in_blank_multi_graph` | `fill-in-blank-multi-graph-text` | `fill_in_blank_multi_graph_text/` |
| `table_fill_in_the_blank` | `table-fill-in-the-blank` | `table_fill_in_blank/` |
| `table_image_fill_in_the_blank`, `table_image_fill_in_the_blank_2_col` | `table-image-fill-in-the-blank` | `table_image_fill_in_blank/` |
| `short_answer` | `short-answer` | `short_answer/` |
| `multi_select_circle` | `multi-select-circle` | `multi_select_circle/` |
| `multi_select_two` | `multi-select-two` | `multi_select_two/` |
| `clock_set_time` | `clock-set-time` | `clock_set_time/` |
| `number_line_arcs` | `number-line-arcs` | `number_line_arcs/` |

> Note: `number_line_fill_in_blank` was removed — use `ordering_horizontal` instead.

---

## Directory Tree

    quiz/
      index.html / quiz.html              entry point
      config.js                           page constants (storage keys, URLs)
      controller.js                       boots quiz page, wires dependencies
      quiz_state.js                       runtime state (current Q, answers)
      quiz_service.js                     pure calculation/data logic
      style.css                           quiz page styles

      storage/
        session_storage_service.js        reads quizData from sessionStorage

      utils/
        image_url_resolver.js             resolves relative image URLs
        quiz_result_evaluator.js          evaluates answers, builds result object

      event_handlers/
        navigation_handler.js             nav-prev, nav-next, mark-review, submit
        index_panel_handler.js            question-selected
        result_modal_handler.js           goHome, restartWithWrongQuestions
        wrapper_handler.js                restart-quiz, keydown

      components/
        ui_bundle.js                      data class holding all UI component controllers
        ui_bundle_factory.js              creates and returns the UI bundle

        question_wrapper/
          question_wrapper.js             <question-wrapper> custom element
          question_wrapper_controller.js  DOM access layer for question-wrapper

        navigation_panel/
          component.js                    <navigation-panel> custom element
          controller.js                   DOM access layer for navigation-panel

        index_panel/
          component.js                    <question-index-panel> custom element
          controller.js                   DOM access layer for index-panel

        result_modal/
          component.js                    <result-modal> custom element
          controller.js                   DOM access layer for result-modal

        collapsible_section/
          collapsible_section.js          generic <collapsible-section> helper
          style.css

        question_types/
          question_registry.js            maps question type string -> tag + evaluator

          mcq_question/                   type: mcq
          true_false_question/            type: true_false
          multi_select/                   type: multi_select
          matching_select/                type: matching_select, matching_drag_drop
          matching_dropdown/              type: matching, matching_dropdown
          matching_connection/            type: matching_connection
          matching_connection_image/      type: matching_connection_image
          ordering/                       type: ordering
          ordering_horizontal/            type: ordering_horizontal
          compare_quantities/             type: compare_quantities
          compare_image_objects/          type: image_compare_quantities_tick, compare_image_objects
          fill_in_blank/                  type: fill_in_blank
          multi_fill_in_blank/            type: multi_fill_in_blank
          options_fill_in_blank/          type: options_fill_in_blank
          fill_in_blank_operation/        type: fill_in_blank_operation
          fill_in_blank_multi_graph_text/ type: fill_in_blank_multi_graph_text, fill_in_blank_multi_graph
          table_fill_in_blank/            type: table_fill_in_the_blank
          table_image_fill_in_blank/      type: table_image_fill_in_the_blank, table_image_fill_in_the_blank_2_col
          short_answer/                   type: short_answer
          multi_select_circle/            type: multi_select_circle
          multi_select_two/               type: multi_select_two
          clock_set_time/                 type: clock_set_time
          number_line_arcs/               type: number_line_arcs

---

## Pending Work

All 22 question type components are refactored to the Geometry/Renderer/InteractionHandler
/Component pattern with rich-content (`innerHTML`) support and self-contained prefixed CSS.

Old files to delete from repo if present:

- `quiz/event_handler.js` — superseded by `quiz/event_handlers/` directory