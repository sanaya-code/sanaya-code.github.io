# Question Component Method Architecture

This document describes the method structure for each quiz question component.

Each section contains:

1. Main component name
2. Child/helper components recommended for clean implementation
3. Method tables for the main component and helper components

---

## 1. Common Base Question Component

Most question components share the same basic lifecycle, rendering, state, and utility behavior. These methods can be moved into a reusable base class later.

### Recommended Helper / Child Components

- `BaseQuestionComponent` — shared lifecycle, config parsing, rendering orchestration, and answer API.
- `QuestionTextRenderer` — renders question text.
- `MediaRenderer` — renders optional SVG and image blocks.
- `AnswerChangeEmitter` — dispatches common `input-change` event.
- `ComponentVisibilityHelper` — handles show/hide logic.

### Base Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Declares watched attributes such as `config`. |
| `connectedCallback()` | Runs when the component is inserted into the DOM. |
| `disconnectedCallback()` | Cleans up listeners, observers, timers, or drag handlers when removed. |
| `attributeChangedCallback(name, oldValue, newValue)` | Reacts when watched attributes change. |
| `initialize()` | Performs one-time setup for the component. |
| `cacheElements()` | Stores references to important DOM elements. |
| `ensureStructure()` | Creates the base internal HTML structure if missing. |
| `parseConfigAttribute()` | Reads and parses the JSON config attribute. |
| `validateData(data)` | Checks whether required JSON fields are present. |
| `setJsonData(data)` | Accepts full question JSON and updates the component. |
| `render()` | Main rendering orchestration method. |
| `reset()` | Clears the component back to a blank state. |
| `setQuestion(text)` | Renders the question text. |
| `setSvg(svgContent)` | Renders or hides the SVG block. |
| `setImage(imgUrl)` | Renders or hides the image block. |
| `setUserAnswer(answer)` | Applies a saved user answer to the UI. |
| `getUserAnswer()` | Returns the current user answer. |
| `bindEvents()` | Attaches required event listeners. |
| `emitAnswerChanged()` | Dispatches `input-change` event to the parent/controller. |
| `showElement(element)` | Makes a DOM element visible. |
| `hideElement(element)` | Hides a DOM element. |
| `cleanup()` | Removes temporary state and event listeners. |

---

## 2. MCQ Question

Source file: `mcq-question(2).js`  
Main class: `McqQuestion`

### Helper / Child Components Needed

- `McqQuestionComponent` — main custom element.
- `QuestionTextRenderer` — renders question text.
- `MediaRenderer` — renders SVG and image.
- `McqOptionsRenderer` — renders radio options.
- `McqOptionItem` — represents a single radio option.
- `AnswerChangeEmitter` — emits answer change event.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches the `config` attribute. |
| `connectedCallback()` | Initializes and renders the component when added to DOM. |
| `attributeChangedCallback(name, oldValue, newValue)` | Updates component when JSON config changes. |
| `ensureStructure()` | Creates internal MCQ layout. |
| `updateFromConfig()` | Parses config and updates rendered content. |
| `addQunStatement()` | Adds question statement to the UI. |
| `addSvg()` | Adds optional SVG content. |
| `addImg()` | Adds optional image content. |
| `_renderOptions()` | Renders the full options list. |
| `addOption()` | Adds one radio option. |
| `getUserAnswer()` | Returns the selected option id. |
| `disconnectedCallback()` | Cleans up when removed from DOM. |
| `cleanup()` | Removes internal listeners/state. |

### `McqOptionsRenderer` Methods

| Method | Short Description |
|---|---|
| `setOptions(options)` | Renders all radio options. |
| `createOptionElement(option)` | Creates one radio option DOM block. |
| `handleOptionChange(event)` | Handles radio selection change. |
| `setUserAnswer(optionId)` | Pre-selects a saved answer. |
| `getUserAnswer()` | Returns selected option id. |

---

## 3. Multi Select Question

Source file: `multi-select-component.js`  
Main class: `MultiSelectComponent`

### Helper / Child Components Needed

- `MultiSelectComponent` — main custom element.
- `QuestionTextRenderer` — renders question text.
- `MediaRenderer` — renders SVG and image.
- `MultiSelectOptionsRenderer` — renders checkbox options.
- `MultiSelectOptionItem` — represents one checkbox option.
- `SelectionLimitManager` — handles maximum selection rules if needed.

### Main Component Methods

| Method | Short Description |
|---|---|
| `connectedCallback()` | Initializes component when inserted into DOM. |
| `observedAttributes()` | Watches the `config` attribute. |
| `attributeChangedCallback(name, oldValue, newValue)` | Re-renders when config changes. |
| `ensureStructure()` | Creates base multi-select layout. |
| `updateFromConfig()` | Parses config and updates the component. |
| `renderOptions()` | Renders all checkbox options. |
| `addOption()` | Adds one checkbox option. |
| `addQunStatement()` | Adds question statement. |
| `addImg()` | Adds optional image. |
| `addSvg()` | Adds optional SVG. |
| `updateUserResponse(config)` | Updates config/user response after selection. |
| `getUserAnswer()` | Returns selected option ids. |
| `disconnectedCallback()` | Cleans up when removed. |

### `MultiSelectOptionsRenderer` Methods

| Method | Short Description |
|---|---|
| `setOptions(options)` | Renders all checkbox options. |
| `toggleOption(optionId)` | Selects or unselects one option. |
| `setSelections(optionIds)` | Applies saved selected option ids. |
| `getSelections()` | Returns selected option ids. |
| `handleOptionChange(event)` | Handles checkbox change event. |

---

## 4. Multi Select Circle Question

Source file: `multi-select-circle.js`  
Main class: `MultiSelectCircle`

### Helper / Child Components Needed

- `MultiSelectCircleComponent` — main custom element.
- `CircleOptionRenderer` — renders circular selectable options.
- `CircleSelectionState` — manages selected circle ids.
- `AnswerChangeEmitter` — emits selection updates.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config changes. |
| `attributeChangedCallback(name, oldValue, newValue)` | Updates component when config changes. |
| `connectedCallback()` | Initializes component on DOM insertion. |
| `_setConfig()` | Parses and stores config internally. |
| `render()` | Renders the circle options UI. |
| `_attachListeners()` | Attaches option click listeners. |
| `emitChange()` | Emits answer change event. |
| `getUserAnswer()` | Returns selected circle option ids. |

### `CircleOptionRenderer` Methods

| Method | Short Description |
|---|---|
| `setOptions(options)` | Renders circular options. |
| `toggleCircle(optionId)` | Toggles selected circle state. |
| `highlightCircle(optionId)` | Visually marks option as selected. |
| `clearCircle(optionId)` | Removes visual selection. |

---

## 5. Select Two Quantities Question

Source file: `multi-select-two.js`  
Main class: `SelectTwoQuantities`

### Helper / Child Components Needed

- `SelectTwoQuantitiesComponent` — main custom element.
- `QuantityOptionRenderer` — renders quantity choices.
- `TwoSelectionManager` — enforces exactly/two selected values.
- `HighlightManager` — applies selected visual state.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches the config attribute. |
| `attributeChangedCallback(name, oldValue, newValue)` | Reacts to config updates. |
| `connectedCallback()` | Initializes component when added to DOM. |
| `_setConfig()` | Parses and stores config. |
| `render()` | Renders selectable quantity options. |
| `_applyHighlights()` | Applies selected styling. |
| `_attachListeners()` | Attaches click listeners. |
| `_emitChange()` | Emits answer change event. |
| `getUserAnswer()` | Returns selected quantities. |

### `TwoSelectionManager` Methods

| Method | Short Description |
|---|---|
| `toggleSelection(itemId)` | Selects or unselects an item. |
| `canSelectMore()` | Checks whether another item can be selected. |
| `setUserAnswer(answer)` | Applies saved selected items. |
| `getUserAnswer()` | Returns selected item ids. |

---

## 6. Compare Quantities Question

Source file: `compare-question(1).js`  
Main class: `CompareQuantitiesComponent`

### Helper / Child Components Needed

- `CompareQuantitiesComponent` — main custom element.
- `QuantityRenderer` — renders quantity A and quantity B.
- `SymbolToggleRenderer` — renders comparison symbols.
- `ComparisonStateManager` — stores selected symbol.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config changes. |
| `connectedCallback()` | Initializes component. |
| `attributeChangedCallback(name, oldValue, newValue)` | Updates component when config changes. |
| `ensureStructure()` | Creates comparison question layout. |
| `updateFromConfig()` | Parses config and updates UI. |
| `toggleSymbol()` | Toggles selected comparison symbol. |
| `updateUserResponse()` | Saves selected symbol into user response. |
| `getUserAnswer()` | Returns selected comparison symbol. |
| `disconnectedCallback()` | Cleans up component. |

### `SymbolToggleRenderer` Methods

| Method | Short Description |
|---|---|
| `setSymbols(symbolOptions)` | Renders comparison symbols. |
| `toggleSymbol(symbol)` | Selects one comparison symbol. |
| `highlightSymbol(symbol)` | Highlights selected symbol. |
| `clearSymbolSelection()` | Clears symbol selection. |

---

## 7. Compare Image Objects Question

Source file: `compare-image-objects.js`  
Main class: `CompareImageObjects`

### Helper / Child Components Needed

- `CompareImageObjectsComponent` — main custom element.
- `PartitionedImageRenderer` — renders image split into zones.
- `TickBoxRenderer` — renders selectable tick boxes.
- `SideSelectionManager` — manages selected side.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches the config attribute. |
| `connectedCallback()` | Initializes component. |
| `attributeChangedCallback()` | Re-renders when config changes. |
| `ensureStructure()` | Creates base image comparison layout. |
| `renderFromConfig()` | Parses config and renders image/tick zones. |
| `selectSide()` | Selects one image side/zone. |
| `getUserAnswer()` | Returns selected side. |

### `PartitionedImageRenderer` Methods

| Method | Short Description |
|---|---|
| `setImage(imgUrl)` | Renders the partitioned image. |
| `setPartitionDirection(direction)` | Applies vertical/horizontal partition layout. |
| `setTickZones(zones)` | Places tick boxes in configured zones. |
| `highlightSelection(side)` | Highlights selected side. |

---

## 8. Basic Matching Question

Source file: `matching-question.js`  
Main class: `MatchingComponent`

### Helper / Child Components Needed

- `MatchingComponent` — main custom element.
- `QuestionTextRenderer` — renders question text.
- `MediaRenderer` — renders SVG/image.
- `MatchingPairsRenderer` — renders rows of left/right pairs.
- `MatchingAnswerManager` — manages selected matching answers.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config changes. |
| `connectedCallback()` | Initializes component. |
| `attributeChangedCallback(name, oldValue, newValue)` | Updates component when config changes. |
| `ensureStructure()` | Creates matching layout. |
| `updateFromConfig()` | Parses config and updates UI. |
| `addQunStatement()` | Adds question statement. |
| `addSvg()` | Adds optional SVG. |
| `addImg()` | Adds optional image. |
| `addAllPairs()` | Renders all matching pairs. |
| `addPair()` | Adds one matching pair row. |
| `getUserAnswer()` | Returns user matching response. |
| `disconnectedCallback()` | Cleans up component. |

### `MatchingPairsRenderer` Methods

| Method | Short Description |
|---|---|
| `setPairs(pairs)` | Renders all matching pairs. |
| `createPairRow(pair)` | Creates one matching row. |
| `setUserAnswer(answer)` | Applies saved matching response. |
| `getUserAnswer()` | Returns current matching response. |

---

## 9. Matching Connect Question

Source file: `matching-connect-component.js`  
Main class: `MatchingConnectComponent`

### Helper / Child Components Needed

- `MatchingConnectComponent` — main custom element.
- `ConnectLayoutRenderer` — renders left and right columns/rows.
- `MediaRenderer` — renders SVG/image.
- `ConnectionStateManager` — stores created connections.
- `SvgLineRenderer` — draws lines between matched items.
- `KeyboardNavigationHandler` — handles keyboard navigation.
- `ResizeObserverHandler` — redraws lines after layout changes.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config attribute. |
| `connectedCallback()` | Initializes component and listeners. |
| `disconnectedCallback()` | Removes listeners/observers. |
| `attributeChangedCallback(name, oldVal, newVal)` | Updates when config changes. |
| `updateFromConfig()` | Parses config and refreshes component. |
| `renderLayout()` | Builds main matching layout. |
| `renderMedia()` | Renders optional media. |
| `renderConnectRows()` | Renders left/right connectable rows. |
| `initElements()` | Caches main DOM elements. |
| `initRhsElements()` | Caches right-side elements. |
| `setupEventListeners()` | Attaches click/keyboard/resize listeners. |
| `applyInitialUserResponse()` | Restores saved connections. |
| `handleKeyDown(e)` | Handles keyboard input. |
| `handleNavigation()` | Moves focus between connectable items. |
| `handleSelection()` | Selects focused item. |
| `updateFocus()` | Updates focused visual state. |
| `updateSelection()` | Updates selected visual state. |
| `updateModeIndicator()` | Shows current selection/navigation mode. |
| `makeConnection()` | Creates or replaces a connection. |
| `getUserAnswer()` | Returns connections as user response. |
| `drawLines()` | Draws all connection lines. |
| `clearSvg()` | Clears existing SVG lines. |
| `getLineCoords(lhsEl, rhsEl, svgRect)` | Calculates line start/end coordinates. |
| `drawLine(coords, color)` | Draws one SVG line. |
| `shuffleArray()` | Shuffles answer items if needed. |
| `generateColorPalette()` | Creates line colors for connections. |
| `handleResize()` | Redraws lines after resize. |

### `SvgLineRenderer` Methods

| Method | Short Description |
|---|---|
| `clearLines()` | Removes all SVG connection lines. |
| `drawLine(coords, color)` | Draws one connection line. |
| `drawLines(connections)` | Draws all current connections. |
| `getLineCoords(leftEl, rightEl)` | Calculates SVG coordinates between elements. |
| `redraw()` | Clears and redraws all lines. |

---

## 10. Image Property Matching Question

Source file: `matching-connect-component-image.js`  
Main class: `ImagePropertyMatching`

### Helper / Child Components Needed

- `ImagePropertyMatchingComponent` — main custom element.
- `ImageGridRenderer` — renders image choices.
- `PropertyListRenderer` — renders property choices.
- `ConnectionStateManager` — stores image-property connections.
- `SvgLineRenderer` — draws image-property lines.
- `ColorManager` — assigns colors to connections.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config attribute. |
| `attributeChangedCallback(name, oldValue, newValue)` | Updates when config changes. |
| `connectedCallback()` | Initializes component. |
| `initializeConnections()` | Prepares connection data. |
| `getNextColor()` | Returns next color for a new connection. |
| `render()` | Renders image/property matching UI. |
| `addEventListeners()` | Attaches image/property click listeners. |
| `handleImageClick(imageIndex, wrapper)` | Handles image selection. |
| `handlePropertyClick(propertyElement)` | Handles property selection. |
| `drawConnections()` | Draws all image-property connection lines. |
| `updateUserResponse()` | Saves connections into response format. |
| `getUserAnswer()` | Returns image-property matches. |

### `ConnectionStateManager` Methods

| Method | Short Description |
|---|---|
| `initializeConnections()` | Initializes empty or saved connections. |
| `selectImage(imageId)` | Stores currently selected image. |
| `selectProperty(propertyId)` | Stores selected property. |
| `makeConnection(imageId, propertyId)` | Creates connection between image and property. |
| `removeConnection(connectionId)` | Removes an existing connection. |
| `getUserAnswer()` | Returns all current connections. |

---

## 11. Matching Drag Question

Source file: `matching-drag-question.js`  
Main class: `MatchingDragComponent`

### Helper / Child Components Needed

- `MatchingDragComponent` — main custom element.
- `QuestionTextRenderer` — renders question text.
- `MediaRenderer` — renders SVG/image.
- `DraggableItemRenderer` — renders draggable items.
- `DropZoneRenderer` — renders drop targets.
- `DragDropManager` — handles drag start, drag over, drop, and drag end.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config attribute. |
| `connectedCallback()` | Initializes component. |
| `attributeChangedCallback(name, oldValue, newValue)` | Updates component when config changes. |
| `ensureStructure()` | Creates drag matching layout. |
| `updateFromConfig()` | Parses config and updates UI. |
| `addQunStatement()` | Adds question statement. |
| `addSvg()` | Adds optional SVG. |
| `addImg()` | Adds optional image. |
| `addPairs()` | Renders draggable/drop matching pairs. |
| `getUserAnswer()` | Returns drag matching response. |
| `disconnectedCallback()` | Cleans up component. |

### `DragDropManager` Methods

| Method | Short Description |
|---|---|
| `enableDragDrop()` | Enables drag/drop behavior. |
| `disableDragDrop()` | Removes drag/drop behavior. |
| `handleDragStart(event)` | Starts dragging an item. |
| `handleDragOver(event)` | Allows dragging over a target. |
| `handleDrop(event)` | Handles dropping an item into a target. |
| `handleDragEnd(event)` | Cleans up drag state. |
| `setUserAnswer(answer)` | Restores saved drag/drop answer. |
| `getUserAnswer()` | Returns current drag/drop answer. |

---

## 12. Ordering Question

Source file: `orderingQ.js`  
Main class: `OrderingComponent`

### Helper / Child Components Needed

- `OrderingComponent` — main custom element.
- `QuestionTextRenderer` — renders question text.
- `MediaRenderer` — renders SVG/image.
- `OrderingItemsRenderer` — renders ordered items.
- `DragDropManager` — manages reordering interactions.
- `OrderingStateManager` — stores current order.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config attribute. |
| `connectedCallback()` | Initializes component. |
| `attributeChangedCallback(name, oldValue, newValue)` | Updates component when config changes. |
| `ensureStructure()` | Creates ordering layout. |
| `updateFromConfig()` | Parses config and renders order items. |
| `addQunStatement()` | Adds question statement. |
| `addSvg()` | Adds optional SVG. |
| `addImg()` | Adds optional image. |
| `addAllItems()` | Renders all ordering items. |
| `addItem()` | Adds one ordering item. |
| `setAnswer(orderedIds)` | Applies saved item order. |
| `getUserAnswer()` | Returns current ordered item ids. |
| `cleanup()` | Cleans up listeners/state. |
| `handleDragStart(e)` | Starts dragging an item. |
| `handleDragOver(e)` | Handles drag-over position. |
| `handleDrop(e)` | Drops item into new position. |
| `handleDragEnd(e)` | Clears drag styling/state. |

### `OrderingItemsRenderer` Methods

| Method | Short Description |
|---|---|
| `setItems(items)` | Renders orderable items. |
| `renderItems(items)` | Builds DOM for the item list. |
| `moveItem(fromIndex, toIndex)` | Moves item in the current order. |
| `setAnswer(orderedIds)` | Restores saved order. |
| `getUserAnswer()` | Returns ordered item ids. |

---

## 13. Horizontal Ordering Question

Source file: `orderingQ_horizontal.js`  
Main class: `OrderingHorizontal`

### Helper / Child Components Needed

- `OrderingHorizontalComponent` — main custom element.
- `HorizontalItemsRenderer` — renders items in a horizontal row.
- `DropLineRenderer` — renders insertion/drop indicator line.
- `DragDropManager` — handles drag/drop behavior.
- `HighlightManager` — manages selected/drop highlights.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config changes. |
| `connectedCallback()` | Initializes component. |
| `disconnectedCallback()` | Cleans up listeners. |
| `attributeChangedCallback(name, oldValue, newValue)` | Updates when config changes. |
| `render()` | Renders horizontal ordering UI. |
| `addSvg()` | Adds optional SVG. |
| `addImg()` | Adds optional image. |
| `addEventListeners()` | Attaches drag/click listeners. |
| `handleDrop(event, index)` | Drops item at a specific horizontal index. |
| `highlightSelected()` | Highlights selected item/drop target. |
| `clearHighlights()` | Clears visual highlights. |
| `adjustLine()` | Adjusts visual drop/insertion line. |
| `emitChange()` | Emits answer change event. |
| `getUserAnswer()` | Returns ordered item ids. |

### `DropLineRenderer` Methods

| Method | Short Description |
|---|---|
| `showLine(index)` | Shows insertion line at target index. |
| `adjustLine(index)` | Positions the insertion/drop line. |
| `hideLine()` | Hides insertion line. |

---

## 14. Clock Set Time Question

Source file: `clock-set-time.js`  
Main class: `ClockSetTime`

### Helper / Child Components Needed

- `ClockSetTimeComponent` — main custom element.
- `ClockFaceRenderer` — draws clock face and numbers.
- `ClockHandRenderer` — draws hour/minute hands.
- `ClockGeometryHelper` — calculates angles and positions.
- `ClockInteractionHandler` — handles number/sector clicks.
- `ClockStateManager` — stores selected hour/minute.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config attribute. |
| `attributeChangedCallback(name, oldValue, newValue)` | Re-renders when config changes. |
| `getUserAnswer()` | Returns selected time. |
| `render()` | Renders clock UI. |
| `createClickSectors()` | Creates clickable regions around clock. |
| `precomputeClockPoints()` | Calculates clock number positions. |
| `drawNumbers()` | Draws numbers around clock face. |
| `onNumberClick()` | Handles click directly on a number. |
| `onSectorClick()` | Handles click on a clock sector. |
| `storeAndDrawHand()` | Stores selected time and draws hand. |
| `drawHand_01()` | Older/special hand drawing method. |
| `drawHand()` | Draws hour/minute hand. |
| `restoreHandsFromResponse()` | Restores saved hand positions. |

### `ClockGeometryHelper` Methods

| Method | Short Description |
|---|---|
| `precomputeClockPoints()` | Calculates x/y coordinates for numbers. |
| `calculateAngle(point)` | Calculates angle from clock center. |
| `snapToValidTime(angle)` | Snaps click angle to allowed time value. |
| `getHandEndPoint(timeValue)` | Calculates hand endpoint coordinates. |

### `ClockHandRenderer` Methods

| Method | Short Description |
|---|---|
| `drawHand(handType, point)` | Draws hour or minute hand. |
| `clearHand(handType)` | Removes existing hand. |
| `restoreHandsFromResponse(response)` | Redraws saved hands. |

---

## 15. Number Line Arcs Question

Source file: `number-line-arcs.js`  
Main class: `NumberLineArcs`

### Helper / Child Components Needed

- `NumberLineArcsComponent` — main custom element.
- `NumberLineRenderer` — draws base line and points.
- `ArcRenderer` — draws arcs and self-loops.
- `NumberLineGeometryHelper` — calculates point positions.
- `NumberLineInteractionHandler` — handles point clicks.
- `NumberLineStateManager` — stores selected points and arcs.

### Main Component Methods

| Method | Short Description |
|---|---|
| `observedAttributes()` | Watches config changes. |
| `attributeChangedCallback(name, oldValue, newValue)` | Re-renders on config updates. |
| `connectedCallback()` | Initializes component. |
| `disconnectedCallback()` | Cleans up listeners/observers. |
| `updateLogicalWidth()` | Updates internal SVG width logic. |
| `preparePoints()` | Prepares number line point data. |
| `getPointX(index)` | Returns x-position for a point. |
| `getPointY()` | Returns y-position for the baseline points. |
| `render()` | Renders number line and arcs. |
| `drawBaseLine()` | Draws main number line. |
| `drawPoints()` | Draws clickable points. |
| `attachListeners()` | Attaches point click listeners. |
| `handlePointClick(event)` | Handles number line point clicks. |
| `highlightPoint()` | Highlights active selected point. |
| `toggleArcOrLoop(p1, p2)` | Adds/removes arc or self-loop. |
| `dispatchInputChange()` | Emits input-change event. |
| `drawUserResponseArcs()` | Draws arcs from saved/current response. |
| `createArc(p1, p2)` | Creates arc between two different points. |
| `createSelfLoop(p)` | Creates loop on the same point. |
| `getUserAnswer()` | Returns selected arcs/loops. |

### `ArcRenderer` Methods

| Method | Short Description |
|---|---|
| `drawArc(p1, p2)` | Draws an arc between two points. |
| `drawSelfLoop(point)` | Draws a loop above one point. |
| `removeArc(p1, p2)` | Removes an existing arc. |
| `clearArcs()` | Clears all arcs. |
| `redrawArcs(response)` | Draws arcs from response data. |

### `NumberLineStateManager` Methods

| Method | Short Description |
|---|---|
| `setActivePoint(point)` | Stores first selected point. |
| `clearActivePoint()` | Clears active point. |
| `toggleArc(p1, p2)` | Adds/removes arc from state. |
| `getUserAnswer()` | Returns current arc response. |

---

## 16. Final Shared Method Layer Table

| Layer | Methods |
|---|---|
| Web Component Lifecycle | `connectedCallback`, `disconnectedCallback`, `observedAttributes`, `attributeChangedCallback` |
| Main Rendering | `render`, `setJsonData`, `updateFromConfig`, `renderFromConfig`, `reset` |
| Structure Setup | `ensureStructure`, `initialize`, `cacheElements`, `initElements` |
| UI Rendering Helpers | `setQuestion`, `addQunStatement`, `setSvg`, `addSvg`, `setImage`, `addImg` |
| User Interaction / Events | `bindEvents`, `setupEventListeners`, `addEventListeners`, `attachListeners`, `handleUserInput`, `emitAnswerChanged`, `dispatchInputChange`, `emitChange` |
| User State API | `setUserAnswer`, `setAnswer`, `getUserAnswer`, `updateUserResponse` |
| Small Utility Helpers | `showElement`, `hideElement`, `validateData`, `parseConfigAttribute`, `cleanup` |
| Specific to MCQ | `setOptions`, `_renderOptions`, `addOption`, `handleOptionChange` |
| Specific to Multi Select | `renderOptions`, `toggleOption`, `setSelections`, `getSelections`, `updateUserResponse` |
| Specific to Compare | `toggleSymbol`, `selectSide`, `highlightSelection` |
| Specific to Matching | `setPairs`, `addAllPairs`, `addPair`, `makeConnection`, `removeConnection` |
| Specific to SVG Line Matching | `drawLine`, `drawLines`, `clearSvg`, `clearLines`, `getLineCoords`, `handleResize` |
| Specific to Drag & Drop | `enableDragDrop`, `disableDragDrop`, `handleDragStart`, `handleDragOver`, `handleDrop`, `handleDragEnd` |
| Specific to Ordering | `setItems`, `renderItems`, `addAllItems`, `addItem`, `moveItem`, `setAnswer` |
| Specific to Clock | `drawNumbers`, `drawHand`, `createClickSectors`, `onNumberClick`, `onSectorClick`, `restoreHandsFromResponse` |
| Specific to Number Line | `drawBaseLine`, `drawPoints`, `handlePointClick`, `toggleArcOrLoop`, `createArc`, `createSelfLoop` |
| Geometry / Position Helpers | `getMousePosition`, `calculateDistance`, `calculateCoordinates`, `getPointX`, `getPointY`, `precomputeClockPoints`, `calculateAngle` |
| Interactive State Helpers | `activateItem`, `deactivateItem`, `clearSelection`, `highlightPoint`, `highlightSelected`, `clearHighlights` |
| Animation / Visual Updates | `refreshUI`, `redraw`, `updateVisualState`, `adjustLine` |

---

## 17. Recommended Future Refactor Direction

For simple components, one class may be enough:

```text
McqQuestionComponent
MultiSelectComponent
CompareQuantitiesComponent
```

For interactive visual components, split into helper classes:

```text
NumberLineArcsComponent
├── NumberLineRenderer
├── ArcRenderer
├── NumberLineGeometryHelper
├── NumberLineInteractionHandler
└── NumberLineStateManager
```

```text
ClockSetTimeComponent
├── ClockFaceRenderer
├── ClockHandRenderer
├── ClockGeometryHelper
├── ClockInteractionHandler
└── ClockStateManager
```

```text
MatchingConnectComponent
├── ConnectLayoutRenderer
├── ConnectionStateManager
├── SvgLineRenderer
├── KeyboardNavigationHandler
└── ResizeObserverHandler
```

This keeps the main component as an orchestrator and prevents very large custom element classes.
