# Quiz App — Directory Structure

---

## Directory Structure

```
quiz_app/
├── __init__.py
├── main.py                                      # Entry point: creates QApplication and starts app
├── requirements.txt                             # Python dependencies
│
├── app/                                         # Application runtime/control layer
│   ├── main_controller.py                       # Main app orchestrator
│   ├── state/                                   # Global runtime app state
│   └── event_handlers/                          # Event workflow handlers
│       ├── navigation/                          # Cross-page navigation handlers
│       └── pages/                               # Page-specific event handlers
│
├── ui/                                          # Pure PyQt6 rendering/navigation layer
│   ├── pages/                                   # Full screens/pages
│   ├── components/                              # Reusable UI components
│   ├── question_widgets/                        # Widgets for question types
│   └── navigation/                              # Router and route controller
│
├── page_data/                                   # Render-data preparation partitioned by pages
├── question_types/                              # Question parsing, validation, scoring, review logic
├── composers/                                   # Object creation and dependency wiring
├── config/                                      # App constants/configuration
├── resources/                                   # Icons, images, SVG, QSS themes
└── utils/                                       # Generic helper functions

```


```

quiz_app/app/
├── __init__.py
├── main_controller.py                           # Binds page events, registers pages, starts app flow
│
├── state/
│   ├── __init__.py
│   ├── app_state.py                             # AppState dataclass; stores runtime state
│   └── app_state_controller.py                  # Controlled get/set methods for AppState
│
└── event_handlers/
    ├── __init__.py
    ├── event_handler_bundle.py                  # Frozen bundle holding all event handlers
    ├── event_handler_composer.py                # Creates event handlers
    │
    ├── navigation/
    │   └── __init__.py                          # Cross-page navigation handlers go here later
    │
    └── pages/
        ├── __init__.py
        │
        ├── student_selection/
        │   ├── __init__.py
        │   └── select_student_handler.py        # Handles selected student event
        │
        ├── question_bank_selection/
        │   ├── __init__.py
        │   └── select_question_bank_handler.py  # Handles selected question bank event
        │
        ├── quiz/
        │   ├── __init__.py
        │   └── next_question_handler.py         # Handles next-question workflow
        │
        ├── result/
        │   ├── __init__.py
        │   ├── restart_quiz_handler.py          # Handles back-to-home/restart workflow
        │   └── open_review_handler.py           # Opens review page from result page
        │
        └── review/
            ├── __init__.py
            ├── show_wrong_questions_handler.py       # Shows wrong answered questions tab
            ├── show_unanswered_questions_handler.py  # Shows left/unanswered questions tab
            ├── show_correct_questions_handler.py     # Shows correct answered questions tab
            └── back_to_home_from_review_handler.py   # Returns from review page to home

```

```

quiz_app/page_data/
├── __init__.py
│
├── student_selection/
│   ├── __init__.py
│   ├── hardcoded_students.py
│   ├── view_model.py
│   └── render_data_builder.py
│
├── question_bank_selection/
│   ├── __init__.py
│   ├── hardcoded_question_banks.py
│   ├── view_model.py
│   └── render_data_builder.py
│
├── quiz_page/
│   ├── __init__.py
│   ├── hardcoded_questions.py                   # Temporary hardcoded quiz questions
│   ├── view_model.py                            # Quiz page render models
│   └── render_data_builder.py                   # Builds render-ready quiz page data
│
├── result_page/
│   ├── __init__.py
│   ├── view_model.py                            # Result page render model
│   └── render_data_builder.py                   # Builds result summary data
│
└── review_page/
    ├── __init__.py
    ├── view_model.py                            # Tab-based review page render models
    └── render_data_builder.py                   # Builds wrong/left/correct tab data

```


```

quiz_app/question_types/
├── __init__.py
│
├── base/
│   ├── __init__.py
│   ├── answer_status.py                         # Correct, wrong, unanswered status values
│   ├── base_answer_model.py                     # Base answer model contract
│   ├── base_scorer.py                           # Base scorer contract
│   └── review_question_model.py                 # Generic review-ready question model
│
├── registry/
│   ├── __init__.py
│   └── question_type_registry.py                # Maps question type to parser/scorer/review builder
│
└── mcq/
    ├── __init__.py
    ├── answer_model.py                          # MCQ user/correct answer model
    ├── parser.py                                # Parses raw MCQ JSON/question data
    ├── validator.py                             # Validates MCQ structure and answer data
    ├── scorer.py                                # Scores MCQ user answer
    └── review_builder.py                        # Builds MCQ review display data

```


```

quiz_app/composers/
├── __init__.py
└── app_composer.py                              # Creates state, UI bundle, handlers, controller

```

```
quiz_app/config/
├── __init__.py
└── app_config.py                                # App title, window size, constants

```


```
quiz_app/resources/
├── icons/                                       # App icons
├── images/                                      # Static images
├── svg/                                         # SVG assets
└── styles/
    └── ocean_blue_theme.qss                     # Global QSS theme

```