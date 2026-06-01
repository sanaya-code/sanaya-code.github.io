# Question Types — Component Design

Each question type lives in its own directory under `quiz/components/question_types/`.
Every directory contains `component.js`, `evaluator.js`, and `style.css`.

---

## MCQ Question (`mcq_question/`)

| Class | Description |
|-------|-------------|
| `McqRenderer` | Builds HTML skeleton once. Renders question text, collapsible SVG/image sections, and radio option elements. Supports rich content via `innerHTML`. Owns all DOM references. |
| `McqQuestion` | Lifecycle, config parsing, validation. Coordinates renderer. Binds radio change and section toggle events. Exposes `getUserAnswer()` and `setUserAnswer()`. |

---

## True/False Question (`true_false_question/`)

| Class | Description |
|-------|-------------|
| `TrueFalseRenderer` | Builds HTML skeleton with True/False radio buttons. Renders question text, collapsible SVG/image sections. Supports rich content via `innerHTML`. Owns all DOM references. |
| `TrueFalseComponent` | Lifecycle, config parsing. Coordinates renderer. Binds radio change and section toggle events. Normalizes boolean `correct_answer` vs string user answer. |

---

## Multi Select (`multi_select/`)

| Class | Description |
|-------|-------------|
| `MultiSelectRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, and checkbox option elements. Supports rich content via `innerHTML`. Owns all DOM references. |
| `MultiSelectComponent` | Lifecycle, config parsing, validation. Coordinates renderer. Binds checkbox change and section toggle events. `getUserAnswer()` returns array of selected ids. |

---

## Matching Select (`matching_select/`)

**Type strings:** `matching_select`, `matching_drag_drop` (backward compat)

| Class | Description |
|-------|-------------|
| `MatchingDragRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, option bank items, and drop zone rows. Supports rich content via `innerHTML`. Returns option and drop zone elements for the handler. |
| `MatchingSelectInteractionHandler` | Owns click/tap select-and-place logic. Tracks `_selectedOption`. Clicking an option selects it (blue highlight), clicking a drop zone places it, clicking selected option again deselects. Fires `onChange` after each placement. |
| `MatchingDragComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` returns array of drop zone values. |

---

## Matching (`matching/`)

**Type strings:** `matching`, `matching_dropdown`

| Class | Description |
|-------|-------------|
| `MatchingDropdownRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, left labels with `innerHTML` (rich content), and `<select>` dropdowns. Returns select elements for handler binding. |
| `MatchingDropdownInteractionHandler` | Binds `change` event on each `<select>`. On any change reads all selects and fires `onChange(answer)` with the full answer array. |
| `MatchingDropdownComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` returns array of selected values per pair. |

---

## Matching Connection (`matching_connection/`)

| Class | Description |
|-------|-------------|
| `MatchingConnectionGeometry` | Pure math. Calculates SVG line coordinates, generates color palettes, shuffles RHS array. Zero DOM, zero events. |
| `MatchingConnectionRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, LHS/RHS connect rows with `innerHTML` (rich content). Stores raw values in `dataset.value` and position in `dataset.index` to support duplicate labels. Returns `{ lhsEls, rhsEls }` for the handler. Draws and clears SVG lines. |
| `MatchingConnectionInteractionHandler` | Owns click and keyboard (A key, Space) events. Manages `_selectedLHSIndex`, `_focusSide`, `_focusIndex`. Calls `onConnect` callback on connection. `unbind()` removes document keydown listener. |
| `MatchingConnectionComponent` | Lifecycle, config, `_matches` array state (stores RHS indices, not values). Coordinates all classes. `_makeConnection()` updates state and redraws lines. `_applyUserResponse()` restores saved connections. `getUserAnswer()` maps indices back to values for evaluator compatibility. |

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

**Type strings:** `ordering_horizontal`, `number_line_fill_in_blank` (replaced, use `ordering_horizontal`)

| Class | Description |
|-------|-------------|
| `OrderingHorizontalRenderer` | Builds HTML skeleton. Renders question text, collapsible SVG/image sections, sequence nodes, and items bank. `initial_items` support — non-empty positions render as `.oh-node-fixed` (non-interactive, green). Empty positions render as interactive nodes. `updateNode()` updates a single node without full re-render. `activateNodeInput()` replaces a node with an inline `<input>` for direct typing. `adjustLine()` positions the horizontal connector line. |
| `OrderingHorizontalInteractionHandler` | Owns click-to-select and drag-and-drop events on items and nodes. Skips fixed nodes entirely. Tracks `_selectedItem`. On node click with no item selected, activates inline input for typing. Calls `onPlace(index, value)` callback on placement or typing commit. |
| `OrderingHorizontalComponent` | Lifecycle, config, `_userResponse` array state. Coordinates renderer and handler. `_handlePlace()` updates state, updates single node, adjusts line. Handles window resize. |

---

## Compare Quantities (`compare_quantities/`)

| Class | Description |
|-------|-------------|
| `CompareQuantitiesRenderer` | Builds HTML skeleton with quantity A, symbol, and quantity B boxes. Renders question text, collapsible SVG/image sections. `setSymbol()` applies either interactive (`.cmp-qq-symbol`) or fixed (`.cmp-qq-symbol-fixed`) style based on `initial_symbol` presence. |
| `CompareQuantitiesInteractionHandler` | Owns symbol click toggle. Manages `_currentIndex` into `symbolOptions` array. `bind(isFixed)` skips click binding when `isFixed` is true. `setSymbol()` restores saved user response. `unbind()` cleans up listener. |
| `CompareQuantitiesComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` delegates to handler's `getSelectedSymbol()`. |

---

## Fill In Blank Operation (`fill_in_blank_operation/`)

| Class | Description |
|-------|-------------|
| `FillInBlankOperationRenderer` | Builds HTML skeleton with four-row digit operation layout. Renders question text, rows of boxes (editable/non-editable), and choices bank. `updateBox()` updates a single box content. Returns box and choice elements. |
| `FillInBlankOperationComponent` | Lifecycle, config, `_responses` and `_strike` state objects. Binds choice click (select) and box click (fill) and double-click (strikethrough) events. `getUserAnswer()` returns responses and strike states. |

---

## Fill In Blank (`fill_in_blank/`)

| Class | Description |
|-------|-------------|
| `FillInBlankRenderer` | Builds HTML skeleton. Renders question text via `innerHTML` (rich content), collapsible SVG/image sections, and text input. `setValue()` sets saved response. `getInput()` returns input element for handler binding. |
| `FillInBlankInteractionHandler` | Binds `input` event on the text input. Calls `onChange(value)` on every keystroke. `unbind()` removes listener on re-render and cleanup. `getValue()` reads current input value. |
| `FillInBlankComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` delegates to handler's `getValue()`. |

---

## Multi Fill In Blank (`multi_fill_in_blank/`)

| Class | Description |
|-------|-------------|
| `MultiFillInBlankRenderer` | Builds HTML skeleton. Splits `question` on `____` pattern, renders text parts via `innerHTML` (rich content) and inline `.mfib-blank` spans. `createBlankSpan()` and `createInputEl()` factories used during activate/commit cycle. |
| `MultiFillInBlankComponent` | Lifecycle, config, `_responses` array state, `_currentInput` tracking. `_activateInput()` replaces a blank span with inline input. `_commitInput()` replaces input back with updated span. `getUserAnswer()` commits any open input then returns `_responses`. |

---

## Options Fill In Blank (`options_fill_in_blank/`)

| Class | Description |
|-------|-------------|
| `OptionsFillInBlankRenderer` | Builds HTML skeleton. Splits each `option.text` on `____`, renders text parts via `innerHTML` (rich content) and `.fibmo-blank` spans. Renders choices bank. `createBlankSpan()` and `createInputEl()` factories. Returns `blankSpans[optIdx][blankIdx]` map and choice elements. |
| `OptionsFillInBlankInteractionHandler` | Owns all three interaction flows: choice click (select), blank click with active choice (fill), blank click without choice (activate inline input). Manages `_activeChoice` and `_currentInput`. Calls `onResponseChange(optIdx, blankIdx, value)` after each change. `commitCurrentInput()` exposed for `getUserAnswer()`. |
| `OptionsFillInBlankComponent` | Lifecycle, config, `_responses` 2D state. Initialises from `user_response`. Passes `onChange` callback to renderer and `onResponseChange` to handler. `getUserAnswer()` calls `handler.commitCurrentInput()` then returns `_responses`. |

---

## Table Image Fill In Blank (`table_image_fill_in_blank/`)

**Type strings:** `table_image_fill_in_the_blank`, `table_image_fill_in_the_blank_2_col` (backward compat)

| Class | Description |
|-------|-------------|
| `TableImageFillInBlankRenderer` | Builds table skeleton with configurable 2–5 column layout (default 2 if `columns` not specified). `renderHeaders()` reads `headings.field1`..`fieldN` with legacy `count`/`word` fallback. `_createFieldCell()` renders `.tifib-fixed-cell` (non-editable) when `field.value` is present, or `.tifib-input-field` (editable) when `field.acceptable_answers` is present. Loops dynamically for any column count. Returns input elements for event binding. |
| `TableImageFillInBlankComponent` | Lifecycle, config parsing, validation. Default `columns = 2`. `fieldsPerRow = columns - 1`. Initialises `_userResponses` from `user_response` or empty arrays. `_bindInputEvents()` attaches input listeners only to editable fields. `getUserAnswer()` returns deep copy of `_userResponses`. |

---

## Table Fill In Blank (`table_fill_in_blank/`)

| Class | Description |
|-------|-------------|
| `TableFillInBlankRenderer` | Builds table with corner cell + column label header row and row-labelled body. `_renderBody()` iterates `data[][]` — renders static `td` when `cell.value !== '____'`, editable `.tabfib-input` when `cell.value === '____'`. Returns input elements for event binding. Collapsible SVG/image sections follow standard pattern. |
| `TableFillInBlankComponent` | Lifecycle, config parsing, validation. `_initResponses()` maps `data` shape to initialize `_responses` array from saved `user_response` or empty strings — guarantees shape matches `data` exactly. `_bindInputEvents()` attaches input listeners only to editable fields. `getUserAnswer()` returns deep copy of `_responses`. |

---

## Short Answer (`short_answer/`)

| Class | Description |
|-------|-------------|
| `ShortAnswerRenderer` | Builds HTML skeleton. Renders question text via `innerHTML` (rich content), collapsible SVG/image sections, and `<textarea>`. `setValue()` sets saved response. `getTextarea()` returns element for handler binding. |
| `ShortAnswerInteractionHandler` | Binds `input` event on textarea. Calls `onChange(value)` on every keystroke. `unbind()` removes listener. `getValue()` reads current textarea value. |
| `ShortAnswerComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` delegates to handler's `getValue()`. |

---

## Fill In Blank Multi Graph Text (`fill_in_blank_multi_graph_text/`)

**Type strings:** `fill_in_blank_multi_graph_text`, `fill_in_blank_multi_graph` (backward compat)

| Class | Description |
|-------|-------------|
| `FillInBlankMultiGraphTextGeometry` | Pure math. `getBlockPosition(index, total, cx, cy, radius)` → `{x, y}`, `getBoardCenter()`, `getRadius()`. Zero DOM, zero events. |
| `FillInBlankMultiGraphTextRenderer` | Builds HTML skeleton with radial board layout. Renders question text via `innerHTML` (rich content), center label, satellite blocks with labels, input fields, and choices bank. `positionBlocks()` calculates absolute positions and draws SVG spoke lines. Returns input and choice elements. |
| `FillInBlankMultiGraphTextInteractionHandler` | Two interaction modes: click input first then choice (fills immediately), or click choice first then input (fills on input click). Manages `_activeChoice` and `_activeInput`. Calls `onChange(index, value)` after each fill. |
| `FillInBlankMultiGraphTextComponent` | Lifecycle, config, `_responses` array state. `choices` read from `config.choices` or `config.value_choices` (new field name). Handles window resize to reposition blocks via `requestAnimationFrame`. |

---

## Clock Set Time (`clock_set_time/`)

| Class | Description |
|-------|-------------|
| `ClockSetTimeGeometry` | Pure math. `buildClockPoints()` computes positions for all 12 numbers and 12 midpoints. `getSectorPath()` builds 15° wedge SVG paths. `sectorIndexToValue()` converts sector index 0–23 to clock values 0.5–12. `getHandEndpoint()` applies `lengthRatio × 1.15` scaling. |
| `ClockSetTimeRenderer` | Builds HTML skeleton. Renders question text via `innerHTML` (rich content), Hour/Minute buttons, SVG clock face with circle, numbers, invisible click sectors, and center dot. `drawHand()` creates arrowhead markers lazily and draws hand lines. `setActiveButton()` highlights selected button. |
| `ClockSetTimeInteractionHandler` | Owns button clicks (hour/minute selection), number clicks, and sector clicks. Manages `_selectedHand`. Fires `onHandSet('select', hand)` for button clicks and `onHandSet(handType, value)` for clock clicks. |
| `ClockSetTimeComponent` | Lifecycle, config, `_userResponse { hour, minute }` state. Restores saved hands on setup. `_handleHandSet()` routes select vs placement actions. |

---

## Number Line Arcs (`number_line_arcs/`)

| Class | Description |
|-------|-------------|
| `NumberLineArcsGeometry` | Pure math. `buildPoints()` handles both `points` array and `number_line` range. `getPointX()`, `getPointY()`, `buildArcPath()`, `buildSelfLoopPath()`. |
| `NumberLineArcsRenderer` | Builds HTML skeleton. Renders question text via `innerHTML` (rich content), collapsible SVG/image sections, SVG number line with baseline, numbered circles, and arcs group. `drawArcs()` clears and redraws all arcs. `setPointActive()` toggles `.nla-point-active` class. |
| `NumberLineArcsInteractionHandler` | Owns circle click and keydown events. First click sets `_activePoint` (highlights green), second click normalises pair order and calls `onArcToggle(p1, p2)`. |
| `NumberLineArcsComponent` | Lifecycle, config, `_userResponse` pairs array state. `_handleArcToggle()` toggles pair in/out of state and redraws. `ResizeObserver` re-renders SVG on container width change. |

---

## Multi Select Circle (`multi_select_circle/`)

| Class | Description |
|-------|-------------|
| `MultiSelectCircleRenderer` | Builds HTML skeleton. Renders question text via `innerHTML` (rich content), collapsible SVG/image sections, and circular option elements with `innerHTML`. `setOptionSelected()` toggles `.msc-selected` class on a single option — no re-render on click. Returns option elements for handler binding. |
| `MultiSelectCircleInteractionHandler` | Uses a `Set` for O(1) selection tracking. Enforces `maximum_selections`. Calls `onChange(id, selected, allSelected)` on each click. `getSelected()` returns current selection array. |
| `MultiSelectCircleComponent` | Lifecycle, config, `_userResponse` array state. `_onSelectionChange()` updates state and toggles single option class without re-render. |

---

## Multi Select Two (`multi_select_two/`)

| Class | Description |
|-------|-------------|
| `MultiSelectTwoRenderer` | Builds HTML skeleton. Renders question text via `innerHTML` (rich content), collapsible SVG/image sections, quantity elements with `innerHTML`, and instructions. `applyHighlights()` resets all quantities to original `innerHTML` then applies color/shape/tick highlights per selection. `clearHighlight()` removes known highlight classes. Returns quantity elements for handler binding. |
| `MultiSelectTwoInteractionHandler` | Owns quantity click events. On click — if id already assigned to any key, clears it; else fills first empty slot in `required_selections` order. Calls `onChange(updatedResponse)` after each change. `getResponse()` returns current response object. |
| `MultiSelectTwoComponent` | Lifecycle, config, `_userResponse` object state. `_onResponseChange()` calls `renderer.applyHighlights()` directly on existing elements — no re-render. |

---

## Image Compare Quantities Tick (`compare_image_objects/`)

**Type strings:** `image_compare_quantities_tick`, `compare_image_objects`

| Class | Description |
|-------|-------------|
| `CompareImageObjectsRenderer` | Builds HTML skeleton with question text and image holder. `setContent()` renders SVG or image. `renderTickBoxes()` creates absolutely-positioned `.icqt-tick-box` elements at positions defined by `tick_zones` (top_left, top_right, bottom_left, bottom_right). `setTickSelected()` toggles `.icqt-selected` class without re-render. Returns `{ side → el }` map. |
| `CompareImageObjectsInteractionHandler` | Owns tick box click events. Click on already-selected side is a no-op. `setInitialSelected()` restores saved `user_response` before binding. Calls `onSelect(side)` on change. |
| `CompareImageObjectsComponent` | Lifecycle, config parsing, validation. Coordinates renderer and handler. `getUserAnswer()` returns selected side string (`left`, `right`, `top`, `bottom`, or null). |