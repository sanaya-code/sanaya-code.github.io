
```
app/
│
├── main_controller.js
│
├── state/
│   ├── state.js
│   └── state_controller.js
│
├── event_handlers/
│   │
│   ├── event_composer.js                # Creates and wires event handlers
│   │
│   ├── handler_component_01.js          # Handles events from component_01
│   ├── handler_component_02.js          # Handles events from component_02
│   └── handler_component_xx.js          # Handles events from component_xx
│
├── applications/
│   │
│   ├── application_composer.js          # Creates and returns application instances
│   │
│   ├── application_01.js                # Business use case
│   ├── application_02.js                # Business use case
│   └── application_xx.js                # Business use case
│
│
├── views/
│   └── main_view.js                     # Integrates UI bundle components into the screen 
│
├── components/
│   │
│   ├── ui_bundle.js                     # Holds all component controllers
│   ├── ui_bundle_factory.js             # Creates and returns UI bundle
│   │
│   ├── component_01/
│   │   ├── component.js                 # DOM rendering and event emission
│   │   ├── controller.js                # UI controller
│   │   └── style.css
│   │
│   ├── component_02/
│   │   ├── component.js
│   │   ├── controller.js
│   │   └── style.css
│   │
│   └── component_xx/
│       ├── component.js
│       ├── controller.js
│       └── style.css
│
├── services/
│   │
│   ├── service_01.js                    # API / storage / file operations
│   ├── service_02.js
│   └── service_xx.js
│
├── utils/
│   │
│   ├── helper_01.js
│   ├── helper_02.js
│   └── helper_xx.js
│
└── config/
    │
    ├── app_config.js
    └── constants.js



```