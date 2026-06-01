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
    ├── config.js
    ├── state.js
    ├── controller.js
    ├── style.css
    │
    ├── storage/
    │   └── local_storage_service.js
    │
    ├── utils/
    │   ├── json_loader.js
    │   └── json_exporter.js
    │
    ├── event_handler/
    │   ├── question_list/
    │   │   └── handler.js
    │   ├── editor_panel/
    │   │   └── handler.js
    │   └── preview_panel/
    │       └── handler.js
    │
    └── components/
        ├── question_list/
        │   ├── component.js
        │   └── style.css
        ├── editor_panel/
        │   ├── component.js
        │   └── style.css
        ├── preview_panel/
        │   ├── component.js
        │   └── style.css
        └── question_forms/
            └── mcq_form/
                ├── component.js
                └── style.css



```