
inside pages/ dir we have one directory for each page(view)

View switching: When swapping views in main.html,  inject/remove dynamically. Cleaner DOM, no hidden bloat, each view loads only when needed.

pages/ directory, Each page folder owns everything specific to it.


# Quiz App Directory Structure

```
quiz_app/
├── index.html
├── quiz.html
├── home/
└── quiz/
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
        ├── question_registry.js            # Maps question type string → tag + evaluator
        │
        ├── mcq_question/
        │   ├── component.js                # <mcq-radio> custom element
        │   └── evaluator.js               # checkAnswer, formatUserAnswer, formatCorrectAnswer
        │
        ├── matching_question/
        │   ├── component.js
        │   └── evaluator.js
        │
        ├── fill_in_blank_operation/
        │   ├── component.js
        │   └── evaluator.js
        │
        ├── multi_select_two/
        │   ├── component.js
        │   └── evaluator.js
        │
        └── (one directory per question type...)
```


> Break component class into 2 or more. one class will only have life cycle methods. while other classes will have helper methods that work on the DOM. Helper receives "this"

```

| Component Type         | Suggested Design                                              |
| ---------------------- | ------------------------------------------------------------- |
| Simple components      | Keep as one class                                             |
| Medium components      | Main class + Renderer                                         |
| Interactive components | Main class + Renderer + Interaction Handler                   |
| Visual/SVG components  | Main class + Renderer + Geometry Helper + Interaction Handler |
| Advanced               | Main class + Renderer + Geometry Helper + Interaction Handler + State + Event Handler |


```