# Quiz App Directory Structure

``` 
quiz_app/  
├── index.html
├── quiz.html
├── editor.html
├── home/
├── quiz/
└── editor/
```

---

## home/

```
home/
├── config.js                               # Page constants (URLs, storage keys)
├── state.js                                # In-memory subject JSON cache
├── controller.js                           # Boots home page, wires dependencies
├── event_handler.js                        # Home page event listeners
├── style.css                               # Home page styles
│
├── storage/
│   └── session_storage_service.js          # Writes quizData to sessionStorage
│
├── utils/
│   ├── browser_environment.js              # Detects file:/// vs server mode
│   ├── file_reader.js                      # Reads uploaded local JSON quiz file
│   └── remote_json_loader.js               # Fetches remote JSON
│
└── components/
    ├── subjects_list/
    │   ├── component.js                    # <grade-subjects> custom element
    │   ├── controller.js                   # DOM access layer for grade-subjects
    │   └── style.css                       # Grade/subject selector styles
    │
    ├── topic_selector/
    │   ├── component.js                    # <topic-selector> custom element (widget of grade-subjects)
    │   └── style.css                       # Topic grid card styles
    │
    └── custom_quiz_loader/
        ├── component.js                    # <custom-quiz-loader> custom element
        └── style.css                       # Upload component styles
```

---

## quiz/

```
quiz/
├── config.js                               # Page constants (storage keys, URLs)
├── controller.js                           # Boots quiz page, wires dependencies
├── quiz_state.js                           # Quiz runtime state (current Q, answers)
├── quiz_service.js                         # Pure calculation/data logic
├── style.css                               # Quiz page styles
│
├── storage/
│   └── session_storage_service.js          # Reads quizData from sessionStorage
│
├── utils/
│   ├── image_url_resolver.js               # Resolves relative image URLs
│   └── quiz_result_evaluator.js            # Evaluates answers, builds result object
│
├── event_handlers/
│   ├── navigation_handler.js               # Handles nav-prev, nav-next, mark-review, submit
│   ├── index_panel_handler.js              # Handles question-selected
│   ├── result_modal_handler.js             # Handles goHome, restartWithWrongQuestions
│   └── wrapper_handler.js                  # Handles restart-quiz, keydown
│
└── components/
    ├── ui_bundle.js                        # Data class holding all UI component controllers
    ├── ui_bundle_factory.js                # Creates and returns the UI bundle
    │
    ├── question_wrapper/
    │   ├── question_wrapper.js             # <question-wrapper> custom element
    │   └── question_wrapper_controller.js  # DOM access layer for question-wrapper
    │
    ├── navigation_panel/
    │   ├── component.js                    # <navigation-panel> custom element
    │   └── controller.js                   # DOM access layer for navigation-panel
    │
    ├── index_panel/
    │   ├── component.js                    # <question-index-panel> custom element
    │   └── controller.js                   # DOM access layer for index-panel
    │
    ├── result_modal/
    │   ├── component.js                    # <result-modal> custom element
    │   └── controller.js                   # DOM access layer for result-modal
    │
    └── question_types/
        ├── question_registry.js                    # Maps question type string → tag + evaluator
        │
        ├── mcq_question/                           # type: mcq
        ├── true_false_question/                    # type: true_false
        ├── multi_select/                           # type: multi_select
        ├── matching_select/                        # type: matching_select, matching_drag_drop
        ├── matching_dropdown/                      # type: matching
        ├── matching_connection/                    # type: matching_connection
        ├── matching_connection_image/              # type: matching_connection_image
        ├── ordering/                               # type: ordering
        ├── ordering_horizontal/                    # type: ordering_horizontal
        ├── compare_quantities/                     # type: compare_quantities
        ├── compare_image_objects/                  # type: image_compare_quantities_tick
        ├── fill_in_blank/                          # type: fill_in_blank
        ├── multi_fill_in_blank/                    # type: multi_fill_in_blank
        ├── options_fill_in_blank/                  # type: options_fill_in_blank
        ├── fill_in_blank_operation/                # type: fill_in_blank_operation
        ├── fill_in_blank_multi_graph_text/         # type: fill_in_blank_multi_graph_text, fill_in_blank_multi_graph
        ├── table_fill_in_blank/                    # type: table_fill_in_the_blank
        ├── table_image_fill_in_blank/              # type: table_image_fill_in_the_blank, table_image_fill_in_the_blank_2_col
        ├── short_answer/                           # type: short_answer
        ├── multi_select_circle/                    # type: multi_select_circle
        ├── multi_select_two/                       # type: multi_select_two
        ├── clock_set_time/                         # type: clock_set_time
        └── number_line_arcs/                       # type: number_line_arcs
 
 ```

```

quiz_app/
│
├── index.html
├── quiz.html
├── editor.html
│
├── home/
│
├── quiz/
│
└── editor/ 
    ├── editor.html
    ├── config.js
    ├── controller.js
    ├── editor_form_registry.js
    ├── style.css
    │
    ├── state/  
    │   ├── draft_state.js 
    │   ├── index.js 
    │   ├── question_state.js 
    │   └── selection_state.js 
    │
    ├── utils/                               # json_loader.js, json_exporter.js
    │
    ├── event_handler/
    │   ├── editor_panel/                               # handler.js
    │   ├── question_list/                              # handler.js
    │   ├── topbar/                                     # handler.js
    │   └── import_panel/                               # handler.js
    │
    └── components/
        ├── topbar/                                     # component.js, controller.js
        ├── empty_state/                                # component.js, controller.js
        ├── question_list/                              # component.js, controller.js, style.css
        ├── editor_panel/                               # component.js, controller.js, style.css
        ├── type_selector/                              # component.js, style.css
        ├── preview_panel/                              # component.js, style.css
        ├── import_panel/                               # component.js, controller.js, style.css
        ├── status_bar/                                 # component.js, controller.js, style.css
        │
        └── question_forms/
            ├── mcq_form/                              # component.js, style.css
            ├── true_false_form/                       # component.js, style.css
            ├── multi_select_form/                     # component.js, style.css
            ├── short_answer_form/                     # component.js, style.css
            ├── fill_in_blank_form/                    # component.js, style.css
            ├── ordering_form/                         # component.js, style.css
            ├── ordering_horizontal_form/              # component.js, style.css
            ├── multi_fill_in_blank_form/              # component.js, style.css
            ├── options_fill_in_blank_form/            # component.js, style.css
            ├── matching_form/                         # component.js, style.css
            ├── compare_quantities_form/               # component.js, style.css
            ├── image_compare_quantities_tick_form/    # component.js, style.css
            ├── multi_select_circle_form/              # component.js, style.css
            ├── multi_select_two_form/                 # component.js, style.css
            ├── table_fill_in_the_blank_form/          # component.js, style.css
            ├── table_image_fill_in_blank_form/        # component.js, style.css
            ├── fill_in_blank_operation_form/          # component.js, style.css
            ├── fill_in_blank_multi_graph_form/        # component.js, style.css
            ├── matching_connection_form/              # component.js, style.css
            ├── matching_connection_image_form/        # component.js, style.css
            ├── matching_select_form/                  # component.js, style.css
            ├── number_line_arcs_form/                 # component.js, style.css
            └── clock_set_time_form/                   # component.js, style.css



```