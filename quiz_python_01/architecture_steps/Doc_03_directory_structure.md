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
        |   ├── __init__.py
        |   ├── restart_quiz_handler.py          # Handles back-to-home/restart workflow
        |   └── open_review_handler.py           # Opens review page from result page
        |
        └── review/
            ├── __init__.py
            ├── review_next_question_handler.py    
            ├── review_previous_question_handler.py                      
            └── review_jump_to_question_handler.py          
         

```


```
        
quiz_app/ui/
├── __init__.py
├── ui_composer.py                               # Creates page widgets and page controllers
├── ui_page_bundle.py                            # Frozen bundle holding page controllers
│
├── pages/
│   ├── student_selection_page/
│   │   ├── __init__.py
│   │   ├── student_selection_page.py
│   │   └── student_selection_page_controller.py
│   │
│   ├── question_bank_selection_page/
│   │   ├── __init__.py
│   │   ├── question_bank_selection_page.py
│   │   └── question_bank_selection_page_controller.py
│   │
│   ├── quiz_page/
│   │   ├── __init__.py
│   │   ├── quiz_page.py                         # Main quiz screen
│   │   └── quiz_page_controller.py              # Quiz page controller
│   │
│   ├── result_page/
│   │   ├── __init__.py
│   │   ├── result_page.py                       # Quiz result screen
│   │   └── result_page_controller.py            # Result page controller
│   │
│   └── review_page/
│       ├── __init__.py
│       ├── review_page.py                       # Quiz review screen
│       └── review_page_controller.py            # Review page controller
│
├── components/
│   ├── student_selection/
│   │   ├── __init__.py
│   │   └── student_card.py
│   │
│   ├── question_bank_selection/
│   │   ├── __init__.py
│   │   └── question_bank_card.py
│   │
│   ├── result/
│   │   ├── __init__.py
│   │   └── result_summary_card.py               # Result summary card component
│   │
│   └── review/
│       ├── __init__.py
│       ├── review_status_badge.py               # Shows correct/wrong/unanswered status
│       ├── review_navigation_bar.py             # Review next/previous/jump controls
│       └── review_answer_summary.py             # Shows user answer and correct answer
│
├── question_widgets/
│   ├── __init__.py
│   ├── base_question_widget.py                  # Base contract for all question widgets
│   ├── widget_factory.py                        # Creates widgets using registry
│   ├── widget_registry.py                       # Registry mapping question types to widgets
│   ├── review_widget_factory.py                 # Creates read-only review widgets
│   │
│   └── mcq/
│       ├── __init__.py
│       ├── mcq_question_widget.py               # MCQ question widget
│       └── mcq_review_widget.py                 # Read-only MCQ review widget
│
└── navigation/
    ├── __init__.py
    ├── app_router.py                            # Low-level QStackedWidget register/show operations
    ├── app_router_controller.py                 # Semantic navigation methods
    └── route_names.py                           # Route name constants


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
    ├── view_model.py                            # Review page render models
    └── render_data_builder.py                   # Builds review data from questions and answers
    
    
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

---

# Class Responsibilities

---

## `AppComposer`

* Creates the main application object graph.
* Creates `QMainWindow`.
* Creates `AppState`.
* Creates `AppStateController`.
* Creates `UIComposer`.
* Creates `UIPageBundle`.
* Creates `EventHandlerComposer`.
* Creates `EventHandlerBundle`.
* Creates `MainController`.
* Returns the ready-to-show main window.

---

## `MainController`

* Starts the application flow.
* Registers pages with the router controller.
* Binds page events to event handlers.
* Loads the first page.
* Coordinates between page controllers, event handlers, page data builders, and router controller.
* Does not create widgets directly.
* Does not contain business logic.

---

## `AppState`

* Dataclass holding global runtime state.
* Stores selected student id.
* Stores selected question bank id.
* Stores current quiz question index.
* Stores current review question index.
* Stores user answers during quiz session.
* Stores quiz result summary data.

---

## `AppStateController`

* Owns all controlled access to `AppState`.
* Provides getter/setter methods.
* Prevents direct state mutation from UI classes.
* Is currently used by event handlers.

---

## `UIComposer`

* Creates page widgets.
* Creates page controllers.
* Creates router controller.
* Returns `UIPageBundle`.

---

## `UIPageBundle`

* Frozen dataclass.
* Holds references to all page controllers.
* Passed to `MainController`.
* Passed to event handlers when they need to update UI.

---

## `StudentSelectionPage`

* QWidget for the student selection screen.
* Renders title, subtitle, and student cards.
* Emits `student_selected` signal.
* Does not know what happens after selection.

---

## `StudentSelectionPageController`

* Controls only the student selection page.
* Provides `render()`.
* Provides `bind_events()`.
* Provides `get_page_widget()`.
* Does not perform routing.
* Does not access app state.

---

## `QuestionBankSelectionPage`

* QWidget for the question bank selection screen.
* Renders title, subtitle, and question bank cards.
* Emits `question_bank_selected` signal.
* Does not know what happens after selection.

---

## `QuestionBankSelectionPageController`

* Controls only the question bank selection page.
* Provides `render()`.
* Provides `bind_events()`.
* Provides `get_page_widget()`.
* Does not perform routing.
* Does not access app state.

---

## `QuizPage`

* QWidget for the main quiz screen.
* Renders current question and quiz progress.
* Uses `QuestionWidgetFactory` to create question widgets.
* Emits `next_clicked` signal.
* Does not contain quiz workflow logic.

---

## `QuizPageController`

* Controls only the quiz page.
* Provides `render()`.
* Provides `bind_events()`.
* Provides `get_page_widget()`.
* Provides access to current user answer.
* Does not perform routing.
* Does not access app state.

---

## `ResultPage`

* QWidget for the quiz result screen.
* Renders quiz summary information.
* Displays score, attempted questions, and correct answers.
* Emits `restart_clicked` signal.
* Emits `open_review_clicked` signal later.
* Does not contain quiz workflow logic.

---

## `ResultPageController`

* Controls only the result page.
* Provides `render()`.
* Provides `bind_events()`.
* Provides `get_page_widget()`.
* Does not perform routing.
* Does not access app state.

---

## `ReviewPage`

* QWidget for reviewing completed quiz questions.
* Renders questions in read-only review mode.
* Displays correct/wrong answer state.
* Displays user selected answers.
* Supports next/previous review navigation.
* Emits review navigation signals.
* Does not contain workflow logic.

---

## `ReviewPageController`

* Controls only the review page.
* Provides `render()`.
* Provides `bind_events()`.
* Provides `get_page_widget()`.
* Does not perform routing.
* Does not access app state.

---

## `StudentCard`

* Clickable UI component for one student.
* Receives `StudentCardViewModel`.
* Displays avatar, name, and grade.
* Emits selected student id when clicked.

---

## `QuestionBankCard`

* Clickable UI component for one question bank.
* Receives `QuestionBankCardViewModel`.
* Displays title, subject, grade, and question count.
* Emits selected question bank id when clicked.

---

## `ResultSummaryCard`

* Displays final quiz result summary.
* Displays percentage score.
* Displays attempted question count.
* Displays correct answer count.

---

## `ReviewStatusBadge`

* Displays review state for a question.
* Shows correct/wrong/unanswered status visually.

---

## `ReviewNavigationBar`

* Displays review navigation controls.
* Provides next/previous review navigation UI.
* May later support jump-to-question navigation.

---

## `BaseQuestionWidget`

* Base contract for all interactive question widgets.
* Defines common APIs such as `get_user_answer()`.

---

## `MCQQuestionWidget`

* Renders one MCQ question.
* Displays question text and radio-button options.
* Returns selected option id using `get_user_answer()`.

---

## `MCQReviewWidget`

* Read-only MCQ review widget.
* Displays correct answer.
* Displays selected answer.
* Highlights correct/wrong states.

---

## `QuestionWidgetFactory`

* Creates interactive question widgets dynamically using registry lookup.
* Avoids hardcoded if/else chains for question types.

---

## `ReviewWidgetFactory`

* Creates read-only review widgets dynamically using registry lookup.
* Supports review-mode rendering for all question types.

---

## `QUESTION_WIDGET_REGISTRY`

* Maps question-type strings to interactive widget classes.
* Enables plug-and-play addition of new question widgets.

---

## `REVIEW_WIDGET_REGISTRY`

* Maps question-type strings to review widget classes.
* Enables plug-and-play addition of review widgets.

---

## `AppRouter`

* Low-level router.
* Owns `QStackedWidget`.
* Registers page widgets.
* Switches visible page by route name.
* Does not know application workflow.

---

## `AppRouterController`

* High-level semantic navigation controller.
* Provides methods like `show_student_selection_page()`.
* Provides methods like `show_question_bank_selection_page()`.
* Provides methods like `show_quiz_page()`.
* Provides methods like `show_result_page()`.
* Provides methods like `show_review_page()`.
* Hides raw route strings from controllers and handlers.
* Calls `AppRouter` internally.

---

## `RouteNames`

* Stores route-name constants.
* Avoids hardcoded page-name strings across the app.

---

## `EventHandlerComposer`

* Creates all event handlers.
* Injects required dependencies into handlers.
* Returns `EventHandlerBundle`.

---

## `EventHandlerBundle`

* Frozen dataclass.
* Holds references to all event handlers.
* Used by `MainController` for signal binding.

---

## `SelectStudentHandler`

* Handles student selection event.
* Updates selected student id through `AppStateController`.
* Builds question bank selection page data.
* Renders question bank selection page.
* Navigates to question bank selection page through `AppRouterController`.

---

## `SelectQuestionBankHandler`

* Handles question bank selection event.
* Updates selected question bank id.
* Resets current question index.
* Builds quiz page data.
* Renders quiz page.
* Navigates to quiz page.

---

## `NextQuestionHandler`

* Handles next-question workflow.
* Reads current user answer from quiz page.
* Stores answer in `AppState`.
* Advances current question index.
* Renders next question if available.
* Ends quiz when questions are exhausted.
* Builds and renders result page at quiz completion.

---

## `RestartQuizHandler`

* Handles restart-quiz workflow.
* Clears quiz session state.
* Rebuilds student selection page data.
* Renders student selection page.
* Navigates back to home screen.

---

## `OpenReviewHandler`

* Handles opening the review page from result page.
* Resets review question index.
* Builds review page data.
* Renders review page.
* Navigates to review page.

---

## `ReviewNextQuestionHandler`

* Handles next-question navigation in review mode.
* Advances review question index.
* Re-renders review page.

---

## `ReviewPreviousQuestionHandler`

* Handles previous-question navigation in review mode.
* Decrements review question index.
* Re-renders review page.

---

## `ReviewJumpToQuestionHandler`

* Handles jump-to-question navigation in review mode.
* Updates review question index directly.
* Re-renders review page.

---

## `StudentSelectionRenderDataBuilder`

* Builds render-ready data for student selection page.
* Reads temporary hardcoded student data.
* Returns `StudentSelectionViewModel`.

---

## `QuestionBankSelectionRenderDataBuilder`

* Builds render-ready data for question bank selection page.
* Reads temporary hardcoded question bank data.
* Returns `QuestionBankSelectionViewModel`.

---

## `QuizPageRenderDataBuilder`

* Builds render-ready data for quiz page.
* Reads temporary hardcoded quiz questions.
* Returns `QuizPageViewModel`.

---

## `ResultPageRenderDataBuilder`

* Builds render-ready data for result page.
* Converts quiz result summary into render models.
* Returns `ResultPageViewModel`.

---

## `ReviewPageRenderDataBuilder`

* Builds render-ready data for review page.
* Combines questions, user answers, and correctness state.
* Returns `ReviewPageViewModel`.

---

## `StudentCardViewModel`

* Dataclass for one student card.
* Contains student id, name, grade, and avatar text.

---

## `StudentSelectionViewModel`

* Dataclass for full student selection page render data.
* Contains page title, subtitle, and student card view models.

---

## `QuestionBankCardViewModel`

* Dataclass for one question bank card.
* Contains question bank id, title, subject, grade, and total questions.

---

## `QuestionBankSelectionViewModel`

* Dataclass for full question bank selection page render data.
* Contains page title, subtitle, and question bank card view models.

---

## `OptionViewModel`

* Dataclass for one MCQ option.
* Contains option id and option text.

---

## `QuestionViewModel`

* Dataclass for one question.
* Contains question id, question type, question text, and options.

---

## `QuizPageViewModel`

* Dataclass for full quiz page render data.
* Contains current question, question progress, and page title.

---

## `ResultPageViewModel`

* Dataclass for full result page render data.
* Contains score summary information.

---

## `ReviewQuestionViewModel`

* Dataclass for one review question.
* Contains question data, selected answer, correct answer, and correctness state.

---

## `ReviewPageViewModel`

* Dataclass for full review page render data.
* Contains current review question and review progress data.

```
```
