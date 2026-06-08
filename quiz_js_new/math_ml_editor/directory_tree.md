

```
math-builder/
│
├── index.html
├── main.controller.js
│
├── state/
│   ├── appState.js          # single source of truth — levels, nodes, active level
│   └── stateManager.js      # get/set/subscribe state, no DOM knowledge
│
├── mathmlOperators/
│   ├── BaseOperator.js      # abstract base class — slots[], generate()
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
│   │
│   ├── levelStrip/          # horizontal pill row — one pill per level
│   │   ├── levelStrip.js
│   │   ├── levelStrip.css
│   │   └── levelStrip.controller.js
│   │
│   ├── previousPanel/       # top full-width panel — previous level nodes
│   │   ├── previousPanel.js
│   │   ├── previousPanel.css
│   │   └── previousPanel.controller.js
│   │
│   ├── currentPanel/        # bottom full-width panel — current level nodes
│   │   ├── currentPanel.js
│   │   ├── currentPanel.css
│   │   └── currentPanel.controller.js
│   │
│   ├── nodeCard/            # individual rendered MathML node card
│   │   ├── nodeCard.js
│   │   ├── nodeCard.css
│   │   └── nodeCard.controller.js
│   │
│   ├── operatorBar/         # clickable operator pills
│   │   ├── operatorBar.js
│   │   ├── operatorBar.css
│   │   └── operatorBar.controller.js
│   │
│   └── slotPanel/           # slot-filling UI after operator selected
│       ├── slotPanel.js
│       ├── slotPanel.css
│       └── slotPanel.controller.js
│
└── event_handlers/
    ├── levelStrip/
    │   └── levelStrip.handlers.js   # pill click, add level
    ├── previousPanel/
    │   └── previousPanel.handlers.js # node click → fill slot
    ├── currentPanel/
    │   └── currentPanel.handlers.js  # copy node, delete node
    ├── operatorBar/
    │   └── operatorBar.handlers.js   # operator selected
    └── slotPanel/
        └── slotPanel.handlers.js     # slot filled, add node, clear

```