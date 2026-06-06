quiz_app/editor/                              # editor.html, config.js, controller.js, editor_form_registry.js, style.css
│
├── state/                                    # index.js, question_state.js, selection_state.js, draft_state.js
│
├── utils/                                    # json_loader.js, json_exporter.js
│
├── event_handler/
│   ├── question_list/                        # handler.js
│   └── editor_panel/                         # handler.js
│
└── components/
    ├── topbar/                               # component.js, controller.js
    ├── empty_state/                          # component.js, controller.js
    ├── question_list/                        # component.js, controller.js, style.css
    ├── editor_panel/                         # component.js, controller.js, style.css
    ├── type_selector/                        # component.js, style.css
    ├── preview_panel/                        # component.js, style.css
    │
    └── question_forms/
        ├── mcq_form/                         # component.js, style.css
        ├── true_false_form/                  # component.js, style.css
        ├── multi_select_form/                # component.js, style.css
        ├── short_answer_form/                # component.js, style.css
        ├── fill_in_blank_form/               # component.js, style.css
        ├── ordering_form/                    # component.js, style.css
        ├── ordering_horizontal_form/         # component.js, style.css
        ├── multi_fill_in_blank_form/         # component.js, style.css
        ├── options_fill_in_blank_form/       # component.js, style.css
        ├── matching_form/                    # component.js, style.css
        ├── compare_quantities_form/          # component.js, style.css
        ├── image_compare_quantities_tick_form/ # component.js, style.css
        ├── multi_select_circle_form/         # component.js, style.css
        └── multi_select_two_form/            # component.js, style.css