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
|   ├── state/
|   |   └── pages/                              # Page-specific runtime state
|   |
|   └── event_handlers/
|       ├── navigation                          # Cross-page navigation handlers 
|       └── pages/                              # Event handlers partitioned by pages
|   
├── ui/                                         # Pure PyQt6 pages, components, navigation
|   ├── pages 
|   ├── components 
|   └── navigation
|
├── page_data/                                  # Data preparation partitioned by pages. 
├── composers/                                  # Object creation and dependency wiring
├── config/                                     # App constants/configuration
├── resources/                                  # Icons, images, QSS themes
└── utils/                                      # Generic helper functions

```

```
quiz_app/app/
├── __init__.py
├── main_controller.py                          # Main app controller; binds page events to handlers
│
├── state/
│   ├── __init__.py
│   ├── app_state.py                            # AppState dataclass; stores runtime state
│   └── app_state_controller.py                 # Get/set methods for AppState
│
└── event_handlers/
    ├── __init__.py
    ├── event_handler_bundle.py                 # Frozen bundle holding all event handlers
    ├── event_handler_composer.py               # Creates event handlers
    │
    └── student_selection/
        ├── __init__.py
        └── select_student_handler.py           # Handles selected student event
```

```

quiz_app/ui/
├── __init__.py
├── ui_composer.py                              # Creates page widgets and page controllers
├── ui_page_bundle.py                           # Frozen bundle holding page controllers
│
├── pages/
│   └── student_selection_page/
│       ├── __init__.py
│       ├── student_selection_page.py           # QWidget for student selection screen
│       └── student_selection_page_controller.py # Controls rendering and page event binding
│
├── components/
│   └── student_selection/
│       ├── __init__.py
│       └── student_card.py                     # Clickable student card widget
│
└── navigation/
    ├── __init__.py
    ├── app_router.py               # low-level QStackedWidget operations. register/show raw widgets
    ├── app_router_controller.py    # semantic navigation methods
    └── route_names.py              # optional constants

```

```

quiz_app/page_data/
├── __init__.py
│
└── student_selection/
    ├── __init__.py
    ├── hardcoded_students.py                   # Temporary hardcoded student data
    ├── view_model.py                           # Render-ready dataclasses for page
    └── render_data_builder.py                  # Converts raw data into view model

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


| File               | Contains                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `main.py`          | Creates `QApplication`, loads global QSS theme, creates app using `AppComposer`, shows main window. |
| `requirements.txt` | Project dependencies, for example `PyQt6`.                                                          |


| File                                | Contains                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `app/main_controller.py`            | `MainController` — starts app, registers pages, binds page events to event handlers, loads first page. |
| `app/state/app_state.py`            | `AppState` dataclass — stores runtime app data such as `selected_student_id`.                          |
| `app/state/app_state_controller.py` | `AppStateController` — owns all reads/writes to `AppState`.                                            |


| File                                                             | Contains                                                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `app/event_handlers/event_handler_bundle.py`                     | `EventHandlerBundle` frozen dataclass — holds all event handler objects.          |
| `app/event_handlers/event_handler_composer.py`                   | `EventHandlerComposer` — creates event handlers and returns `EventHandlerBundle`. |
| `app/event_handlers/student_selection/select_student_handler.py` | `SelectStudentHandler` — handles student selection and updates app state.         |


| File                                                                   | Contains                                                                                        |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ui/ui_composer.py`                                                    | `UIComposer` — creates page widgets, page controllers, router, and returns `UIPageBundle`.      |
| `ui/ui_page_bundle.py`                                                 | `UIPageBundle` frozen dataclass — holds all page controllers.                                   |
| `ui/pages/student_selection_page/student_selection_page.py`            | `StudentSelectionPage` — dumb QWidget that renders title, subtitle, and student cards.          |
| `ui/pages/student_selection_page/student_selection_page_controller.py` | `StudentSelectionPageController` — renders page, registers page, shows page, binds page events. |
| `ui/components/student_selection/student_card.py`                      | `StudentCard` — clickable student card component that emits selected student id.                |
| `ui/navigation/app_router.py`                                          | `AppRouter` — manages `QStackedWidget`, page registration, and visual page switching.           |


| File                                                 | Contains                                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `page_data/student_selection/hardcoded_students.py`  | Temporary hardcoded list of students. Later replaced by repository/service data.               |
| `page_data/student_selection/view_model.py`          | `StudentCardViewModel` and `StudentSelectionViewModel` dataclasses.                            |
| `page_data/student_selection/render_data_builder.py` | `StudentSelectionRenderDataBuilder` — builds render-ready data for the student selection page. |


| File                        | Contains                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `composers/app_composer.py` | `AppComposer` — creates main window, state, state controller, UI bundle, event handler bundle, and main controller. |



| File                   | Contains                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| `config/app_config.py` | Constants such as `APP_TITLE`, `WINDOW_WIDTH`, and `WINDOW_HEIGHT`. |



| File                                    | Contains                                            |
| --------------------------------------- | --------------------------------------------------- |
| `resources/styles/ocean_blue_theme.qss` | Global QSS theme using `setObjectName()` selectors. |

