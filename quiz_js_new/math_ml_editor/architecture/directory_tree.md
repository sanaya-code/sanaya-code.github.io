
```

math_builder/
│
├── index.html
├── index.css
├── main_controller.js
├── OPERATOR_RULES.md
│
├── state/                                  # node.js, sentence_token.js, state.js, state_controller.js
│
├── mathml_operators/                       # operator.js, operator_registry.js
│   │
│   ├── add_operator/                       # operator.js
│   ├── subtract_operator/                  # operator.js
│   ├── multiply_operator/                  # operator.js
│   ├── divide_operator/                    # operator.js
│   ├── power_operator/                     # operator.js
│   ├── sqrt_operator/                      # operator.js
│   ├── negate_operator/                    # operator.js
│   ├── abs_operator/                       # operator.js
│   ├── sin_operator/                       # operator.js
│   ├── cos_operator/                       # operator.js
│   └── log_operator/                       # operator.js
│
├── components/
│   │
│   ├── ui_composer/                        # ui_composer.js
│   │
│   ├── items_panel/                        # component.js, controller.js, style.css
│   ├── atoms_panel/                        # component.js, controller.js, style.css
│   ├── working_set_panel/                  # component.js, controller.js, style.css
│   ├── add_item_popup/                     # component.js, controller.js, style.css
│   ├── operator_accordion/                 # component.js, controller.js, style.css
│   ├── operator_browser/                   # component.js, controller.js, style.css
│   ├── operator_form/                      # component.js, controller.js, style.css
│   ├── sentence_builder/                   # component.js, controller.js, style.css
│   ├── right_panel/                        # component.js, controller.js, style.css
│   └── tab_panel/                          # component.js, controller.js, style.css
│
└── event_handlers/
    │
    ├── event_composer/                     # event_composer.js
    │
    ├── items_panel/                        # event_handler.js
    ├── atoms_panel/                        # event_handler.js
    ├── working_set_panel/                  # event_handler.js
    ├── add_item_popup/                     # event_handler.js
    ├── operator_accordion/                 # event_handler.js
    ├── operator_browser/                   # event_handler.js
    ├── operator_form/                      # event_handler.js
    ├── sentence_builder/                   # event_handler.js
    ├── right_panel/                        # event_handler.js
    └── tab_panel/                          # event_handler.js


```