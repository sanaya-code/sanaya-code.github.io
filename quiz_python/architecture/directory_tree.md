

```

quiz_app/
│
├── ui/                                      # All PyQt6 UI related code
│   │
│   ├── pages/                               # Full application screens/pages
│   │
│   ├── components/                          # Reusable UI components
│   │   ├── common/                          # Shared reusable UI widgets
│   │   ├── student_selection_page/          # Components used only in student selection page
│   │   ├── add_new_student_page/            # Components used only in add student page
│   │   ├── question_bank_selection_page/    # Components used only in question bank page
│   │   ├── quiz_info_page/                  # Components used only in quiz info page
│   │   ├── quiz_page/                       # Components used only in quiz page
│   │   ├── result_page/                     # Components used only in result page
│   │   ├── review_page/                     # Components used only in review page
│   │   └── statistics_page/                 # Components used only in statistics page
│   │
│   ├── question_widgets/                    # PyQt6 widgets for question types
│   │   ├── widget_factory.py                # Maps JSON types to widget classes
│   │   └── base_question_widget.py          # Base contract for all question widgets
│   │
│   ├── navigation/                          # Page routing/navigation system
│   │
│   └── events/                              # UI event names and signal payloads
│       ├── ui_event_names.py                # Shared UI event name constants
│       └── payloads/                        # Small data objects carried by UI signals
│
├── question_types/                          # Question-type business logic
│   ├── base/                                # Base contracts/interfaces for all question types
│   ├── registry/                            # Factories and question-type mappings
│   ├── mcq/                                 # MCQ model/parser/validator/scorer
│   ├── true_false/                          # True/false model/parser/validator/scorer
│   ├── multi_select/                        # Multi-select model/parser/validator/scorer
│   ├── fill_in_blank/                       # Fill-in-blank model/parser/validator/scorer
│   ├── matching/                            # Matching model/parser/validator/scorer
│   ├── ordering/                            # Ordering model/parser/validator/scorer
│   ├── number_line_arcs/                    # Number-line model/parser/validator/scorer
│   ├── clock_set_time/                      # Clock model/parser/validator/scorer
│   └── ...                                  # Other question types
│
├── event_handlers/                          # Handles UI workflows/events
│   ├── common/                              # Shared event handling logic
│   └── pages/                               # Page-specific event handlers
│       ├── student_selection_page/          # Handlers for student selection page
│       ├── add_new_student_page/            # Handlers for add student page
│       ├── question_bank_selection_page/    # Handlers for question bank page
│       ├── quiz_info_page/                  # Handlers for quiz info page
│       ├── quiz_page/                       # Handlers for quiz page
│       ├── result_page/                     # Handlers for result page
│       ├── review_page/                     # Handlers for review page
│       └── statistics_page/                 # Handlers for statistics page
│
├── state/                                   # Runtime application state
│   ├── models/                              # State data objects
│   │   ├── common/                          # Shared state models
│   │   └── pages/                           # Page-specific state models
│   └── controllers/                         # Read/write state controllers
│       ├── common/                          # Shared state controllers
│       └── pages/                           # Page-specific state controllers
│
├── services/                                # App-level business services
│   ├── question_bank_loader/                # Loads/parses question bank JSON files
│   ├── quiz_session/                        # Quiz session management services
│   ├── statistics/                          # Statistics calculation/update services
│   ├── student_profile/                     # Student profile services
│   ├── autosave/                            # Quiz autosave services
│   └── settings/                            # App settings services
│
├── models/                                  # Shared domain/business models
│   ├── question_bank/                       # Question bank models
│   ├── student/                             # Student-related models
│   ├── statistics/                          # Statistics-related models
│   └── common/                              # Shared generic models
│
├── repositories/                            # Persistence abstraction layer
│   ├── question_bank/                       # Question bank repositories
│   ├── student/                             # Student repositories
│   ├── statistics/                          # Statistics repositories
│   ├── quiz_session/                        # Quiz session repositories
│   └── settings/                            # Settings repositories
│
├── storage/                                 # Actual stored files/data
│   ├── students/                            # Student profile/statistics files
│   ├── question_banks/                      # Quiz JSON files
│   ├── quiz_sessions/                       # Saved/autosaved quiz sessions
│   ├── settings/                            # Stored app settings
│   ├── cache/                               # Temporary cached files
│   └── logs/                                # Application log files
│
├── config/                                  # App configuration/constants
│
├── resources/                               # Icons/images/fonts/styles
│   ├── icons/                               # App icons
│   ├── images/                              # Static images
│   ├── fonts/                               # Custom fonts
│   ├── styles/                              # QSS style/theme files
│   └── svg/                                 # Shared SVG assets
│
├── utils/                                   # Stateless helper functions
│   ├── json_utils.py                        # JSON helper functions
│   ├── file_utils.py                        # File/path helper functions
│   ├── qt_utils.py                          # Shared PyQt helper functions
│   ├── image_utils.py                       # Image helper functions
│   ├── svg_utils.py                         # SVG helper functions
│   └── datetime_utils.py                    # Date/time helper functions
│
├── composers/                               # Dependency/object wiring
│
├── shared/                                  # Shared reusable items
│   ├── enums/                               # Shared enums/constants
│   ├── validators/                          # Generic reusable validators
│   ├── models/                              # Shared helper models
│   └── helpers/                             # Shared helper functions
│
├── logging/                                 # Logging setup
│   ├── logger_factory.py                    # Creates/configures loggers
│   ├── app_logger.py                        # Single app logger for events/state/services
│   └── log_config.py                        # Logging configuration/settings
│
├── tests/                                   # Automated tests
│   ├── ui/                                  # UI tests
│   ├── question_types/                      # Question type tests
│   ├── services/                            # Service tests
│   ├── repositories/                        # Repository tests
│   ├── state/                               # State/controller tests
│   ├── event_handlers/                      # Event handler tests
│   └── fixtures/                            # Sample test JSON/data
│
└── docs/                                    # Architecture/design documents
    ├── architecture/                        # System architecture docs
    ├── question_types/                      # Question type documentation
    ├── json_formats/                        # JSON schema/examples
    ├── pages/                               # Page/UI documentation
    └── diagrams/                            # SVG/flow diagrams

```