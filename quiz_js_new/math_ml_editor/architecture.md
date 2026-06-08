# Math Builder — Architecture Reference

---

## Directory Tree

```
math-builder/
│
├── index.html
├── main.controller.js
│
├── state/
│   ├── appState.js
│   └── stateManager.js
│
├── mathmlOperators/
│   ├── BaseOperator.js
│   ├── AddOperator.js
│   ├── SubtractOperator.js
│   ├── MultiplyOperator.js
│   ├── DivideOperator.js
│   ├── PowerOperator.js
│   ├── SqrtOperator.js
│   ├── SinOperator.js
│   ├── CosOperator.js
│   ├── LogOperator.js
│   ├── IntegralOperator.js
│   └── LimitOperator.js
│
├── components/
│   ├── levelStrip/
│   │   ├── levelStrip.js
│   │   ├── levelStrip.css
│   │   └── levelStrip.controller.js
│   ├── previousPanel/
│   │   ├── previousPanel.js
│   │   ├── previousPanel.css
│   │   └── previousPanel.controller.js
│   ├── currentPanel/
│   │   ├── currentPanel.js
│   │   ├── currentPanel.css
│   │   └── currentPanel.controller.js
│   ├── nodeCard/
│   │   ├── nodeCard.js
│   │   ├── nodeCard.css
│   │   └── nodeCard.controller.js
│   ├── operatorBar/
│   │   ├── operatorBar.js
│   │   ├── operatorBar.css
│   │   └── operatorBar.controller.js
│   └── slotPanel/
│       ├── slotPanel.js
│       ├── slotPanel.css
│       └── slotPanel.controller.js
│
└── event_handlers/
    ├── levelStrip/
    │   └── levelStrip.handlers.js
    ├── previousPanel/
    │   └── previousPanel.handlers.js
    ├── currentPanel/
    │   └── currentPanel.handlers.js
    ├── operatorBar/
    │   └── operatorBar.handlers.js
    └── slotPanel/
        └── slotPanel.handlers.js
```

---

## File & Class Purposes

---

### `/` — Root

| File | Class | Purpose |
|------|-------|---------|
| `index.html` | — | Shell HTML. Declares mount points for each component. Loads all scripts in dependency order. Contains no logic. |
| `main.controller.js` | `MainController` | Application entry point. Instantiates and mounts all component controllers in the correct order. The only file that knows every module exists. |

---

### `state/`

| File | Class | Purpose |
|------|-------|---------|
| `appState.js` | `AppState` | Plain data object. Holds all levels, their node arrays, the active level index, and the current slot-filling session. No methods — pure data shape. |
| `stateManager.js` | `StateManager` | Single read/write/subscribe interface over `AppState`. Provides `get()`, `set()`, `subscribe(key, fn)`. No DOM knowledge. All other modules read and write state only through this. |

---

### `mathmlOperators/`

| File | Class | Purpose |
|------|-------|---------|
| `BaseOperator.js` | `BaseOperator` | Abstract base class. Defines the shared interface: `slots[]` array of named slot descriptors and `generate(filledSlots[])` method that returns a MathML string. All operator classes extend this. |
| `AddOperator.js` | `AddOperator` | Two slots: `A`, `B`. Generates `<mrow> A <mo>+</mo> B </mrow>`. |
| `SubtractOperator.js` | `SubtractOperator` | Two slots: `A`, `B`. Generates `<mrow> A <mo>−</mo> B </mrow>`. |
| `MultiplyOperator.js` | `MultiplyOperator` | Two slots: `A`, `B`. Generates `<mrow> A <mo>×</mo> B </mrow>`. |
| `DivideOperator.js` | `DivideOperator` | Two slots: numerator `A`, denominator `B`. Generates `<mfrac> A B </mfrac>`. |
| `PowerOperator.js` | `PowerOperator` | Two slots: base `A`, exponent `B`. Generates `<msup> A B </msup>`. |
| `SqrtOperator.js` | `SqrtOperator` | One slot: radicand `A`. Generates `<msqrt> A </msqrt>`. |
| `SinOperator.js` | `SinOperator` | One slot: argument `A`. Generates `<mrow><mo>sin</mo> A </mrow>`. |
| `CosOperator.js` | `CosOperator` | One slot: argument `A`. Generates `<mrow><mo>cos</mo> A </mrow>`. |
| `LogOperator.js` | `LogOperator` | Two slots: base, argument `A`. Generates `<mrow><msub><mo>log</mo> base</msub><mo>(</mo> A <mo>)</mo></mrow>`. |
| `IntegralOperator.js` | `IntegralOperator` | Four slots: expression, variable, lower bound, upper bound. Generates `<mrow><msubsup><mo>∫</mo> lower upper</msubsup> A <mi>d</mi> var</mrow>`. |
| `LimitOperator.js` | `LimitOperator` | Three slots: expression, variable, approach value. Generates `<mrow><munder><mo>lim</mo><mrow> var <mo>→</mo> val</mrow></munder> A</mrow>`. |

---

### `components/levelStrip/`

| File | Class | Purpose |
|------|-------|---------|
| `levelStrip.js` | `LevelStrip` | Builds the horizontal pill row DOM. One pill per level plus an "Add Level" pill at the end. Marks the active pill. Returns root element — attaches no events. |
| `levelStrip.css` | — | Pill row layout, active and hover states, add-level pill styling, strip scroll behaviour. |
| `levelStrip.controller.js` | `LevelStripController` | Mounts `LevelStrip` into the page. Subscribes to level count and active index in state. Re-renders strip on change. Delegates click events to `levelStrip.handlers.js`. |

---

### `components/previousPanel/`

| File | Class | Purpose |
|------|-------|---------|
| `previousPanel.js` | `PreviousPanel` | Builds the top full-width panel. Renders all node cards from the previous level as read-only clickable tiles. Shows an empty state message when on Level 1. |
| `previousPanel.css` | — | Full-width container, scrollable tile grid, muted read-only visual treatment for node cards. |
| `previousPanel.controller.js` | `PreviousPanelController` | Mounts `PreviousPanel`. Subscribes to active level changes and re-renders accordingly. Delegates node-click events to `previousPanel.handlers.js`. |

---

### `components/currentPanel/`

| File | Class | Purpose |
|------|-------|---------|
| `currentPanel.js` | `CurrentPanel` | Builds the bottom full-width panel. Renders nodes of the active level. Shows type-in input row on Level 1 only. Renders delete and copy-to-next-level buttons on each card. |
| `currentPanel.css` | — | Active editable visual treatment, input row layout, node grid, action button styles. |
| `currentPanel.controller.js` | `CurrentPanelController` | Mounts `CurrentPanel`. Subscribes to the active level's node array. Re-renders on node add or delete. Delegates all events to `currentPanel.handlers.js`. |

---

### `components/nodeCard/`

| File | Class | Purpose |
|------|-------|---------|
| `nodeCard.js` | `NodeCard` | Builds a single node card element. Renders the node's MathML string as a live preview label. Accepts props: `node`, `mode` (`readonly` or `editable`), `selected`. |
| `nodeCard.css` | — | Card shape, MathML preview sizing, selected highlight, readonly dimming, hover state. |
| `nodeCard.controller.js` | `NodeCardController` | Manages a single card's selected/unselected toggle when used as a slot-fill target. Notifies the parent panel controller via a custom DOM event. |

---

### `components/operatorBar/`

| File | Class | Purpose |
|------|-------|---------|
| `operatorBar.js` | `OperatorBar` | Builds the horizontal operator pill bar. One pill per operator class. Entire bar is disabled when the active level is Level 1. |
| `operatorBar.css` | — | Operator pill layout, active and selected states, disabled state styling, symbol typography. |
| `operatorBar.controller.js` | `OperatorBarController` | Mounts `OperatorBar`. Subscribes to active level and enables or disables the bar. On selection stores the operator in state and signals `SlotPanelController` to open. Delegates to `operatorBar.handlers.js`. |

---

### `components/slotPanel/`

| File | Class | Purpose |
|------|-------|---------|
| `slotPanel.js` | `SlotPanel` | Builds the slot-filling UI. Reads the selected operator's `slots[]` and renders one labelled box per slot. Each box shows its filled node's MathML preview or an empty placeholder. Renders a live composed MathML preview and Add Node / Clear buttons. |
| `slotPanel.css` | — | Slot box layout, filled and empty states, live preview area, Add Node and Clear button styles. |
| `slotPanel.controller.js` | `SlotPanelController` | Mounts `SlotPanel`. Tracks which slot index awaits a fill. Receives node-click events from `PreviousPanel` and fills the next empty slot. Calls the operator's `generate()` when all slots are full. Delegates to `slotPanel.handlers.js`. |

---

### `event_handlers/levelStrip/`

| File | Exports | Purpose |
|------|---------|---------|
| `levelStrip.handlers.js` | `onPillClick`, `onAddLevel` | `onPillClick` sets the active level index in state. `onAddLevel` appends a new empty level object to the levels array in state. |

---

### `event_handlers/previousPanel/`

| File | Exports | Purpose |
|------|---------|---------|
| `previousPanel.handlers.js` | `onNodeClick` | Fires when the user clicks a node in the previous panel. Passes the selected node's MathML to `SlotPanelController` for slot filling. |

---

### `event_handlers/currentPanel/`

| File | Exports | Purpose |
|------|---------|---------|
| `currentPanel.handlers.js` | `onDeleteNode`, `onCopyToNext`, `onAddAtom` | `onDeleteNode` removes the node from the current level in state. `onCopyToNext` clones the node's MathML string into the next level. `onAddAtom` handles the Level 1 input submit and creates a new atom node. |

---

### `event_handlers/operatorBar/`

| File | Exports | Purpose |
|------|---------|---------|
| `operatorBar.handlers.js` | `onOperatorSelect` | Stores the selected operator instance in state. Emits an event to open and reset the slot panel for the chosen operator. |

---

### `event_handlers/slotPanel/`

| File | Exports | Purpose |
|------|---------|---------|
| `slotPanel.handlers.js` | `onSlotFill`, `onAddNode`, `onClear` | `onSlotFill` assigns a chosen node's MathML to the currently open slot in state. `onAddNode` calls `generate()` on the operator, creates the new node, and pushes it to the active level. `onClear` resets the entire slot-filling session in state. |