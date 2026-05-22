# Quiz App - Class Responsibilities

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
* Stores raw user answers during quiz session.
* Stores loaded questions from imported JSON.
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
* Renders title, subtitle, hardcoded question bank cards, and JSON load button.
* Emits `question_bank_selected` signal.
* Emits `question_bank_json_selected` signal with selected JSON file path.
* Does not know what happens after selection or file loading.

---

## `QuestionBankSelectionPageController`

* Controls only the question bank selection page.
* Provides `render()`.
* Provides `bind_events()`.
* Provides `get_page_widget()`.
* Binds question bank selection signal to handler.
* Binds JSON file selected signal to handler.
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
* Provides access to current raw user answer.
* Does not perform routing.
* Does not access app state.

---

## `ResultPage`

* QWidget for the quiz result screen.
* Renders quiz summary information.
* Displays score, attempted questions, correct answers, wrong answers, and unanswered questions.
* Emits `restart_clicked` signal.
* Emits `open_review_clicked` signal.
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
* Shows three review tabs: wrong, left/unanswered, and correct.
* Emits `wrong_tab_clicked` signal.
* Emits `unanswered_tab_clicked` signal.
* Emits `correct_tab_clicked` signal.
* Emits `back_to_home_clicked` signal.
* Displays only the questions for the active tab.
* Shows user answer and correct answer for wrong questions.
* Shows correct answer for unanswered questions.
* Shows user answer/correct answer for correct questions.
* Does not contain scoring or answer-comparison logic.
* Does not contain workflow logic.


---

## `ReviewPageController`

* Controls only the review page.
* Provides `render()`.
* Provides `bind_events()`.
* Provides `get_page_widget()`.
* Binds review tab signals to handlers.
* Binds back-to-home signal to handler.
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
* Displays wrong answer count.
* Displays unanswered question count.

---

## `ReviewSection`

* Removed from current design.
* Review page now uses tabs instead of grouped sections.

---

## `ReviewQuestionCard`

* Displays one reviewed question.
* Displays question text.
* Displays user answer if available.
* Displays correct answer.
* Displays review status badge.
* Does not calculate correctness.

---

## `ReviewStatusBadge`

* Displays review state for a question.
* Shows correct, wrong, or unanswered status visually.

---

## `ReviewAnswerSummary`

* Displays user answer and correct answer.
* Can display "Not answered" for unanswered questions.
* Receives already-prepared display text from review view model.

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


## `FilePickerButton`

* Reusable UI component for selecting files.
* Opens a file picker dialog.
* Emits selected file path.
* Does not read, validate, or parse the selected file.

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
* Builds quiz page data using loaded questions if available.
* Falls back to hardcoded questions if no JSON questions are loaded.
* Renders quiz page.
* Navigates to quiz page.

---

## `NextQuestionHandler`

* Handles next-question workflow.
* Reads current raw user answer from quiz page.
* Stores raw answer in `AppState`.
* Uses loaded questions from `AppState` if available.
* Falls back to hardcoded questions if no JSON questions are loaded.
* Advances current question index.
* Renders next question if available.
* Ends quiz when questions are exhausted.
* Uses question type scorers to calculate result data.
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
* Builds review page data with the default active tab set to wrong.
* Renders review page.
* Navigates to review page.

---

## `ShowWrongQuestionsHandler`

* Handles wrong-tab click on review page.
* Builds review page data for wrong questions.
* Re-renders review page with wrong questions active.


---

## `ShowUnansweredQuestionsHandler`

* Handles left/unanswered-tab click on review page.
* Builds review page data for unanswered questions.
* Re-renders review page with unanswered questions active.

---


## `ShowCorrectQuestionsHandler`

* Handles correct-tab click on review page.
* Builds review page data for correct questions.
* Re-renders review page with correct questions active.

---

## `BackToHomeFromReviewHandler`

* Handles back-to-home click from review page.
* Clears quiz session state.
* Rebuilds student selection page data.
* Renders student selection page.
* Navigates back to home screen.

---

## `LoadQuestionBankJsonHandler`

* Handles selected JSON file path from question bank selection page.
* Calls `QuizDataLoader` to load questions from JSON.
* Stores loaded questions in `AppState` through `AppStateController`.
* Resets current question index.
* Builds quiz page data from loaded questions.
* Renders quiz page.
* Navigates to quiz page.
* Handles loading errors temporarily by printing them.

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
* Accepts a question list from loaded JSON or falls back to hardcoded quiz questions.
* Converts raw question data into `QuizPageViewModel`.
* Returns `QuizPageViewModel`.

---

## `ResultPageRenderDataBuilder`

* Builds render-ready data for result page.
* Converts quiz result summary into render models.
* Returns `ResultPageViewModel`.

---

## `ReviewPageRenderDataBuilder`

* Builds render-ready tab-based data for review page.
* Combines active question list, raw user answers, and question-type review builders.
* Uses loaded questions when available.
* Falls back to hardcoded questions when no JSON questions are loaded.
* Separates questions into wrong, unanswered, and correct groups internally.
* Returns only questions for the active tab.
* Returns `ReviewPageViewModel`.

---

# Question Type Layer

---

## `AnswerStatus`

* Shared enum or constants for answer status.
* Possible values: correct, wrong, unanswered.
* Used by scorers, review builders, result builders, and review page models.

---

## `BaseAnswerModel`

* Base contract for question-specific answer models.
* Allows each question type to represent answers differently.
* Keeps complex answers out of UI widgets.

---

## `BaseScorer`

* Base contract for question-type scorers.
* Defines scoring API for checking user answer against correct answer.
* Implemented separately by each question type.

---

## `ReviewQuestionModel`

* Generic review-ready model returned by question-type review builders.
* Contains question text, status, user answer display, and correct answer display.
* Allows Review Page to remain question-type independent.

---

## `QuestionTypeRegistry`

* Maps question-type strings to parser, validator, scorer, and review builder.
* Allows plug-and-play support for new question types.
* Avoids hardcoded if/else logic in scoring and review building.

---

## `MCQAnswerModel`

* Represents MCQ user/correct answer data.
* Usually stores selected option id and correct option id.

---

## `MCQParser`

* Parses raw MCQ question data.
* Converts raw dictionary/question JSON into structured MCQ data.

---

## `MCQValidator`

* Validates MCQ question structure.
* Ensures options, correct answer, and user answer format are valid.

---

## `MCQScorer`

* Compares selected option id with correct option id.
* Returns correct, wrong, or unanswered status.

---

## `MCQReviewBuilder`

* Builds MCQ-specific review display data.
* Converts option ids into readable option text.
* Provides selected answer display and correct answer display.

---

## `QuizDataLoader`

* Page-data helper for quiz page.
* Uses `QuestionBankLoaderService`.
* Loads questions from selected JSON file.
* Returns parsed question data for quiz rendering.

---

## `JsonFileReader`

* Reads JSON data from a selected file path.
* Ensures the selected file exists.
* Ensures the selected file has `.json` extension.
* Returns raw JSON dictionary.

---

## `QuestionBankJsonValidator`

* Validates question bank JSON structure.
* Ensures the JSON contains a non-empty `questions` list.
* Validates required question fields.
* Currently validates MCQ-only question format.
* Ensures `correct_option_id` exists in the option list.

---

## `QuestionBankParser`

* Converts validated question bank JSON into internal question data.
* Currently returns the validated `questions` list.


---

## `QuestionBankLoaderService`

* Orchestrates question bank loading.
* Calls `JsonFileReader`.
* Calls `QuestionBankJsonValidator`.
* Calls `QuestionBankParser`.
* Returns parsed question list.

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

* Dataclass for one review question card.
* Contains question text, answer status, user answer display, and correct answer display.

---

## `ReviewSectionViewModel`

* Dataclass for one review section.
* Contains section title and list of review questions.
* Example sections: wrong answers, unanswered questions, correct answers.

---

## `ReviewPageViewModel`

* Dataclass for full review page render data.
* Contains page title.
* Contains active tab name.
* Contains total, correct, wrong, and unanswered counts.
* Contains only the questions for the active tab.