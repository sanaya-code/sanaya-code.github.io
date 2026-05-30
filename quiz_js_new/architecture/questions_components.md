# Question Types — Component Design

Each question type lives in its own directory under `quiz/components/question_types/`.
Every directory contains `component.js`, `evaluator.js`, and `style.css`.

---

## MCQ Question (`mcq_question/`)

| Class | Description |
|-------|-------------|
| `McqRenderer` | Builds HTML skeleton once. Renders question text, collapsible SVG/image sections, and radio option elements. Owns all DOM references. |
| `McqQuestion` | Lifecycle, config parsing, validation. Coordinates renderer. Binds radio change and section toggle events. Exposes `getUserAnswer()` and `setUserAnswer()`. |

---

## True/False Question (`true_false_question/`)

| Class | Description |
|-------|-------------|
| `TrueFalseRenderer` | Builds HTML skeleton with True/False radio buttons. Renders question text, collapsible SVG/image sections. Owns all DOM references. |
| `TrueFalseComponent` | Lifecycle, config parsing. Coordinates renderer. Binds radio change and section toggle events. Normalizes boolean correct_answer vs string user answer. |

---

## Multi Select (`multi_select/`)

| Class | Description |
|-------|-------------|
| `MultiSelectRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, and checkbox option elements. Owns all DOM references. |
| `MultiSelectComponent` | Lifecycle, config parsing, validation. Coordinates renderer. Binds checkbox change and section toggle events. `getUserAnswer()` returns array of selected ids. |

---

## Matching Select (`matching_select/`)

| Class | Description |
|-------|-------------|
| `MatchingDragRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, option bank items, and drop zone rows. Returns option and drop zone elements for the handler. |
| `MatchingSelectInteractionHandler` | Owns click/tap select-and-place logic. Tracks `_selectedOption`. Clicking an option selects it (blue highlight), clicking a drop zone places it, clicking selected option again deselects. Fires `onChange` after each placement. |
| `MatchingDragComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` returns array of drop zone values. |

---

## Matching Connection (`matching_connection/`)

| Class | Description |
|-------|-------------|
| `MatchingConnectionGeometry` | Pure math. Calculates SVG line coordinates, generates color palettes, shuffles RHS array. Zero DOM, zero events. |
| `MatchingConnectionRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, LHS/RHS connect rows, and SVG canvas. Returns `{ lhsEls, rhsEls }` for the handler. Draws and clears SVG lines. |
| `MatchingConnectionInteractionHandler` | Owns click and keyboard (A key, Space) events. Manages `_selectedLHSIndex`, `_focusSide`, `_focusIndex`. Calls `onConnect` callback on connection. `unbind()` removes document keydown listener. |
| `MatchingConnectionComponent` | Lifecycle, config, `_matches` array state. Coordinates all classes. `_makeConnection()` updates state and redraws lines. `_applyUserResponse()` restores saved connections. |

---

## Matching Connection Image (`matching_connection_image/`)

| Class | Description |
|-------|-------------|
| `ImagePropertyMatchingGeometry` | Pure math. Builds curved SVG path data, calculates connection coordinates from DOM rects, manages line color cycling. Zero DOM, zero events. |
| `ImagePropertyMatchingRenderer` | Builds HTML skeleton with table layout. Renders question text, collapsible SVG/image sections, image wrappers, and property cells. Draws/clears curved SVG connection paths. Returns `{ imageWrappers, propertyEls }`. |
| `ImagePropertyMatchingInteractionHandler` | Owns image click (select/deselect) and property click (connect) events. Manages `_selectedImage`. Calls `onConnect(imageIndex, property, allowMultiple)` callback. |
| `ImagePropertyMatchingComponent` | Lifecycle, config, `_connections` Map state (imageIndex → { property, color }). Coordinates all classes. Redraws connections on window resize. `getUserAnswer()` returns array of `{ image_index, property }`. |

---

## Ordering (`ordering/`)

| Class | Description |
|-------|-------------|
| `OrderingRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, and draggable item elements. `reorderItems()` reorders DOM without re-creating elements. DOM order is the source of truth. |
| `OrderingInteractionHandler` | Owns drag events: `dragstart`, `dragover`, `drop`, `dragend`. Manages `_currentDraggedItem`. Inserts dragged item before/after target based on cursor position. Fires `onChange` once on `dragend`. |
| `OrderingComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` reads item id order directly from DOM children. |

---

## Ordering Horizontal (`ordering_horizontal/`)

| Class | Description |
|-------|-------------|
| `OrderingHorizontalRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, sequence nodes (empty or fixed), and items bank. Handles `initial_items` — fixed nodes rendered as `.oh-node-fixed` (non-interactive, green). `updateNode()` updates a single node without full re-render. `adjustLine()` positions the horizontal connector line. |
| `OrderingHorizontalInteractionHandler` | Owns click-to-select and drag-and-drop events on items and nodes. Skips fixed nodes entirely. Tracks `_selectedItem`. Calls `onPlace(index, value)` callback on placement. |
| `OrderingHorizontalComponent` | Lifecycle, config, `_userResponse` array state. Coordinates renderer and handler. `_handlePlace()` updates state, updates single node, adjusts line. Handles window resize. |

---

## Compare Quantities (`compare_quantities/`)

| Class | Description |
|-------|-------------|
| `CompareQuantitiesRenderer` | Builds HTML skeleton with quantity A, symbol, and quantity B boxes. Renders question text, collapsible SVG/image sections. `setSymbol()` applies either interactive (`.cmp-qq-symbol`) or fixed (`.cmp-qq-symbol-fixed`) style. |
| `CompareQuantitiesInteractionHandler` | Owns symbol click toggle. Manages `_currentIndex` into `symbolOptions` array. `bind(isFixed)` skips click binding when `isFixed` is true. `setSymbol()` restores saved user response. `unbind()` cleans up listener. |
| `CompareQuantitiesComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` delegates to handler's `getSelectedSymbol()`. |

---

## Fill In Blank Operation (`fill_in_blank_operation/`)

| Class | Description |
|-------|-------------|
| `FillInBlankOperationRenderer` | Builds HTML skeleton with four-row digit operation layout. Renders question text, rows of boxes (editable/non-editable), and choices bank. `updateBox()` updates a single box content. Returns box and choice elements. |
| `FillInBlankOperationComponent` | Lifecycle, config, `_responses` and `_strike` state objects. Binds choice click (select) and box click (fill) and double-click (strikethrough) events. `getUserAnswer()` returns responses and strike states. |

---


## Table Image Fill In Blank (`table_image_fill_in_blank/`)

| Class | Description |
|-------|-------------|
| `TableImageFillInBlankRenderer` | Builds table skeleton with configurable 2 or 3 column layout. Renders question text, collapsible SVG/image sections, table headers, and rows. `_createFieldCell()` renders `.tifib-fixed-cell` (non-editable) when `field.value` is present, or `.tifib-input-field` (editable) when `field.acceptable_answers` is present. Returns input elements for event binding. |
| `TableImageFillInBlankComponent` | Lifecycle, config parsing, validation. Initialises `_userResponses` state from `user_response` or empty arrays. `_bindInputEvents()` attaches input listeners only to editable fields. `getUserAnswer()` returns deep copy of `_userResponses`. |

---

## Table Fill In Blank (`table_fill_in_blank/`)

| Class | Description |
|-------|-------------|
| `TableFillInBlankRenderer` | Builds table with corner cell + column label header row and row-labelled body. `_renderBody()` iterates `data[][]` — renders static `td` when `cell.value !== '____'`, editable `.tabfib-input` when `cell.value === '____'`. Returns input elements for event binding. Collapsible SVG/image sections follow standard pattern. |
| `TableFillInBlankComponent` | Lifecycle, config parsing, validation. `_initResponses()` maps `data` shape to initialize `_responses` array from saved `user_response` or empty strings — guarantees shape matches `data` exactly. `_bindInputEvents()` attaches input listeners only to editable fields. `getUserAnswer()` returns deep copy of `_responses`. |

---