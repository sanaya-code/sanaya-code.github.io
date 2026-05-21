## Page (Key responsibilities)

- Dumb renderer: receive data and update UI widgets
- A method to create UI elements
- A method to build layout
- Methods for signals if needed
- Emit an external signal when a user interaction occurs
- Handle internal signals (scrolling, focus, hover, animations)
- Prefer external styling over inline styling of UI widgets where possible
- Never call any controller directly
- Never read from or write to another Page
- Do not decide what happens after an event
- Do not interact with other Pages
- Do not access global/application state

---

## PageController (Key responsibilities)

- A non-widget class that manages one Page
- One PageController per Page
- Contains only operation methods that are called during event handling
- There can be one or more methods corresponding to an event
- Owns all UI-level logic for its Page
- Manages internal UI state of its Page
- Acts as the bridge between MainController and the Page
- Ensures the Page remains dumb and passive
- Never contains business logic
- Never communicates with other `PageController`s directly

---

## PageControllerComposer (Key responsibilities)

- A plain class that creates all PageControllers
- Single place where all PageControllers are instantiated
- Injects each PageController with its corresponding Page
- Returns references of all PageControllers as a frozen `PageControllerBundle`
- MainController uses it to get references to all PageControllers

---

## PageControllerBundle

- Frozen dataclass
- One field per PageController
- Passed to MainController, EventHandlers, and PageDataBuilder

---

## EventHandler (Key responsibilities)

- Contains a method to handle exactly one event
- The only layer currently allowed to read/write `AppState` via `StateController`
- Calls `PageDataBuilder` if a data refresh is needed after the event
- Calls `PageController` methods to update the UI at the end
- Does not contain business logic

---

## EventHandlerComposer (Key responsibilities)

- A plain class that creates all EventHandlers
- Single place where all EventHandlers are instantiated
- Injects each EventHandler with the PageControllerBundle, StateController, and any PageDataBuilder it needs
- Returns references of all EventHandlers as a frozen `EventHandlerBundle`

---

## EventHandlerBundle

- Frozen dataclass
- One field per EventHandler
- Passed to MainController for signal binding

---

## PageDataBuilder (Key responsibilities)

- Assembles all data needed to render a screen
- Called on initial navigation to a screen or after an event that requires a data refresh
- Returns a data bundle to the PageController
- Does not access `StateController` directly

---

> Router Layer (Key responsibilities)

### AppRouter

- Low-level UI navigation class.
- Registers page widgets with route names.
- Switches visible page inside `QStackedWidget`.
- Does not know why navigation happened.
- Does not fetch page data.
- Does not call `PageController` methods.
- Does not access `AppState`.

### AppRouterController

- High-level semantic navigation API.
- Provides readable methods such as `show_student_selection_page()`.
- Hides raw route-name strings from `MainController` and `EventHandlers`.
- Calls `AppRouter` internally.
- May hold navigation history later.
- Does not fetch page data.
- Does not contain business logic.

### Navigation Rule

- `MainController` or `EventHandler` decides when navigation should happen.
- `PageDataBuilder` prepares data before navigation if needed.
- `PageController` renders the page before it is shown.
- `AppRouterController` only performs the final page switch.

---

## MainController (Key responsibilities)

- The single orchestrator for the entire application
- Only class that knows the full sequence of steps for every user event
- Instantiates all Composers on startup and holds all bundles
- Connects all Page signals to EventHandlers on startup
- Owns the Router
- Calls `PageController`s to update the UI
- Handles errors and decides how to surface them
- Does not contain low-level UI code — delegates to `PageController`
- Does not contain business logic — delegates to the service/domain layer (deferred)

---

## AppState (Key responsibilities)

- Single dataclass holding all global state that survives across events and screens
- Modelling tip: if you can sketch SQL tables for the app's data, that structure maps well to AppState fields
- Never accessed directly by Pages, PageControllers, or PageDataBuilder

---

## StateController (Key responsibilities)

- The only class allowed to read from or write to `AppState`
- Exposes controlled getter/setter methods
- Currently injected into EventHandlers only
- A dedicated layer between EventHandlers and StateController may be introduced later

---

## Deferred for later phase

### Application layer
- Typically has 4 methods: change state before performing an activity, perform the activity (service/domain call), change state after activity returned an error, change state after activity succeeded

### Service, DomainController, Request, Response
- Business logic, external service calls, and request/response models are not yet assigned to a layer
- Will be introduced once the UI and event layers are stable

### Config
- Separate config class per concern (UI, database, external API, etc.)
- Use Pydantic to read directly from env file
- Bundle all config objects into a single root config object
- Only the DomainComposer has access to config — no Page, EventHandler, AppState, or any other class accesses config directly

### Models
- Use Pydantic only at boundaries where data comes from outside; use dataclasses for internal app models
- Request and Response models for DomainControllers are cleaner than passing raw dicts
- Event Models: one per event, passed across controllers, stores everything about the event from start to finish — lives only as long as the event lives