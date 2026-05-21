# Quiz App — Directory Structure

---

## Directory Structure


```

quiz_app/
├── __init__.py
├── main.py                                      # Entry point: creates QApplication and starts app
├── requirements.txt                            # Python dependencies
│
├── app/                                        # Application runtime/control layer
│   ├── main_controller.py                      # Main app orchestrator
│   ├── state/                                  # Global runtime app state
│   └── event_handlers/                         # Event workflow handlers
│       ├── navigation/                         # Cross-page navigation handlers
│       └── pages/                              # Page-specific event handlers
│
├── ui/                                         # Pure PyQt6 rendering/navigation layer
│   ├── pages/                                  # Full screens/pages
│   ├── components/                             # Reusable UI components
│   └── navigation/                             # Router and route controller
│
├── page_data/                                  # Render-data preparation partitioned by pages
├── composers/                                  # Object creation and dependency wiring
├── config/                                     # App constants/configuration
├── resources/                                  # Icons, images, SVG, QSS themes
└── utils/                                      # Generic helper functions


```

```

quiz_app/app/
├── __init__.py
├── main_controller.py                          # Binds page events, registers pages, starts app flow
│
├── state/
│   ├── __init__.py
│   ├── app_state.py                            # AppState dataclass; stores runtime state
│   └── app_state_controller.py                 # Controlled get/set methods for AppState
│
└── event_handlers/
    ├── __init__.py
    ├── event_handler_bundle.py                 # Frozen bundle holding all event handlers
    ├── event_handler_composer.py               # Creates event handlers
    │
    ├── navigation/
    │   └── __init__.py                         # Cross-page navigation handlers go here later
    │
    └── pages/
        ├── __init__.py
        └── student_selection/
            ├── __init__.py
            └── select_student_handler.py       # Handles selected student event

```

```


quiz_app/ui/
├── __init__.py
├── ui_composer.py                              # Creates page widgets and page controllers
├── ui_page_bundle.py                           # Frozen bundle holding page controllers
│
├── pages/
│   ├── student_selection_page/
│   │   ├── __init__.py
│   │   ├── student_selection_page.py           # QWidget for student selection screen
│   │   └── student_selection_page_controller.py # Controls rendering and page event binding
│   │
│   └── question_bank_selection_page/
│       ├── __init__.py
│       ├── question_bank_selection_page.py     # QWidget for question bank selection screen
│       └── question_bank_selection_page_controller.py # Controls page rendering/events
│
├── components/
│   ├── student_selection/
│   │   ├── __init__.py
│   │   └── student_card.py                     # Clickable student card widget
│   │
│   └── question_bank_selection/
│       ├── __init__.py
│       └── question_bank_card.py               # Clickable question bank card widget
│
└── navigation/
    ├── __init__.py
    ├── app_router.py                           # Low-level QStackedWidget register/show operations
    ├── app_router_controller.py                # Semantic navigation methods
    └── route_names.py                          # Route name constants


```

```

quiz_app/page_data/
├── __init__.py
│
├── student_selection/
│   ├── __init__.py
│   ├── hardcoded_students.py                   # Temporary hardcoded student data
│   ├── view_model.py                           # Render-ready dataclasses for student page
│   └── render_data_builder.py                  # Converts raw student data into view model
│
└── question_bank_selection/
    ├── __init__.py
    ├── hardcoded_question_banks.py             # Temporary hardcoded question bank data
    ├── view_model.py                           # Render-ready dataclasses for question bank page
    └── render_data_builder.py                  # Converts raw question bank data into view model

```

```

quiz_app/composers/
├── __init__.py
└── app_composer.py                             # Creates state, UI bundle, handlers, controller


```


```

quiz_app/config/
├── __init__.py
└── app_config.py                               # App title, window size, constants

```

```
quiz_app/resources/
├── icons/                                      # App icons
├── images/                                     # Static images
├── svg/                                        # SVG assets
└── styles/
    └── ocean_blue_theme.qss                    # Global QSS theme

```

---

# Class Responsibilities

## `AppComposer`

- Creates the main application object graph.
- Creates `QMainWindow`.
- Creates `AppState`.
- Creates `AppStateController`.
- Creates `UIComposer`.
- Creates `UIPageBundle`.
- Creates `EventHandlerComposer`.
- Creates `EventHandlerBundle`.
- Creates `MainController`.
- Returns the ready-to-show main window.

---

## `MainController`

- Starts the application flow.
- Registers pages with the router controller.
- Binds page events to event handlers.
- Loads the first page.
- Coordinates between page controllers, event handlers, page data builders, and router controller.
- Does not create widgets directly.
- Does not contain business logic.

---

## `AppState`

- Dataclass holding global runtime state.
- Stores selected student id.
- Stores selected question bank id.
- May later store current quiz/session data.

---

## `AppStateController`

- Owns all controlled access to `AppState`.
- Provides getter/setter methods.
- Prevents direct state mutation from UI classes.
- Is currently used by event handlers.

---

## `UIComposer`

- Creates page widgets.
- Creates page controllers.
- Creates router controller.
- Returns `UIPageBundle`.

---

## `UIPageBundle`

- Frozen dataclass.
- Holds references to all page controllers.
- Passed to `MainController`.
- Passed to event handlers when they need to update UI.

---

## `StudentSelectionPage`

- QWidget for the student selection screen.
- Renders title, subtitle, and student cards.
- Emits `student_selected` signal.
- Does not know what happens after selection.

---

## `StudentSelectionPageController`

- Controls only the student selection page.
- Provides `render()`.
- Provides `bind_events()`.
- Provides `get_page_widget()`.
- Does not perform routing.
- Does not access app state.

---

## `QuestionBankSelectionPage`

- QWidget for the question bank selection screen.
- Renders title, subtitle, and question bank cards.
- Emits `question_bank_selected` signal.
- Does not know what happens after selection.

---

## `QuestionBankSelectionPageController`

- Controls only the question bank selection page.
- Provides `render()`.
- Provides `bind_events()`.
- Provides `get_page_widget()`.
- Does not perform routing.
- Does not access app state.

---

## `StudentCard`

- Clickable UI component for one student.
- Receives `StudentCardViewModel`.
- Displays avatar, name, and grade.
- Emits selected student id when clicked.

---

## `QuestionBankCard`

- Clickable UI component for one question bank.
- Receives `QuestionBankCardViewModel`.
- Displays title, subject, grade, and question count.
- Emits selected question bank id when clicked.

---

## `AppRouter`

- Low-level router.
- Owns `QStackedWidget`.
- Registers page widgets.
- Switches visible page by route name.
- Does not know application workflow.

---

## `AppRouterController`

- High-level semantic navigation controller.
- Provides methods like `show_student_selection_page()`.
- Provides methods like `show_question_bank_selection_page()`.
- Hides raw route strings from controllers and handlers.
- Calls `AppRouter` internally.

---

## `RouteNames`

- Stores route-name constants.
- Avoids hardcoded page-name strings across the app.

---

## `EventHandlerComposer`

- Creates all event handlers.
- Injects required dependencies into handlers.
- Returns `EventHandlerBundle`.

---

## `EventHandlerBundle`

- Frozen dataclass.
- Holds references to all event handlers.
- Used by `MainController` for signal binding.

---

## `SelectStudentHandler`

- Handles student selection event.
- Updates selected student id through `AppStateController`.
- Builds question bank selection page data.
- Renders question bank selection page.
- Navigates to question bank selection page through `AppRouterController`.

---

## `StudentSelectionRenderDataBuilder`

- Builds render-ready data for student selection page.
- Reads temporary hardcoded student data.
- Returns `StudentSelectionViewModel`.

---

## `QuestionBankSelectionRenderDataBuilder`

- Builds render-ready data for question bank selection page.
- Reads temporary hardcoded question bank data.
- Returns `QuestionBankSelectionViewModel`.

---

## `StudentCardViewModel`

- Dataclass for one student card.
- Contains student id, name, grade, and avatar text.

---

## `StudentSelectionViewModel`

- Dataclass for full student selection page render data.
- Contains page title, subtitle, and student card view models.

---

## `QuestionBankCardViewModel`

- Dataclass for one question bank card.
- Contains question bank id, title, subject, grade, and total questions.

---

## `QuestionBankSelectionViewModel`

- Dataclass for full question bank selection page render data.
- Contains page title, subtitle, and question bank card view models.