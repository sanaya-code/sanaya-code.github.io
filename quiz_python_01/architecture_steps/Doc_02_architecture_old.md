> Controller Architecture
---

### General flow of any GUI APP

- User interact with UI
- Event is genarated
- Update UI before performing domain action(service call)
- Perform domain action(servcice call)
- Update UI

interaction --->  event --->  update UI   --->  service call  ---> update UI
 
---

```
                              ┌──────────────────────┐
                              │  Domain Controller   │
                              └────────────┬─────────┘                
   User Interaction                    ▲   │   
           │                           │   | [Response]        
           │                 [Request] │   │   
           ▼                           │   ▼         
      ┌─────────┐      event     ┌─────┴─────────┐        ┌────────────────────┐
      │Component│ →→→→→→→→→→→→→→ │Main Controller│ →→→→→→ │Component Controller│
      └─────────┘                └───────────────┘        └─────────┬──────────┘
           ▲                                                        │
           │                                                        │           
           └────────────────────────────────────────────────────────┘
```
---

> `Three Types Of Class for UI`

| Class Type | Count | Responsibility |
|---|---|---|
| **Component** | Many | Render UI widgets. Emit signals. Nothing else. |
| **ComponentController** | One per smart component | Handle UI-only actions for their component |
| **UIComposer** | Exactly one | Create **MainWindow**, instantiate and lay out all components, create all **ComponentControllers**, return **AppControllers** bundle |

<br>

> `Seven Types Of Class for Services`

| Class Type | Count | Responsibility |
|---|---|---|
| **Service** | Many | Perform one raw operation using simple data types |
| **DomainController** | One per service/domain | Handle business logic and external services |
| **Requests** | One per service/domain | send to DomainController by main controller |
| **Response** | One per service/domain | returns errors/result by DomainController to main controller. If any error occur then it is not throws to the maincontroller and the error is saved in response object |
| **Transaction** | One per service/domain | packs request and respose objects and expose methods to upate them |
| **ServiceComposer** | Exactly one | Instantiate all domain controllers, load API key from **.env**, return **DomainControllers** bundle |
| **Domain Models** | Many | (Requests, Response) MainController and  DomainController exchange information using these |

<br>

```

ServiceComposer       →  passes config
Service Controller    →  reads config, builds dependencies, owns Service
Service               →  receives built objects only, knows nothing about config

```

> `One MainController`

| Class Type | Count | Responsibility |
|---|---|---|
| **MainController** | Exactly one | Orchestrate the full event flow across the app |

---

## Bundles (frozen dataclasses)

| Class | Type | Fields |
|---|---|---|
| `UIControllers`    | `@dataclass(frozen=True)` | one field for each component controller |
| `DomainControllers` | `@dataclass(frozen=True)` | one field for each domain controller |



## Event handlers

| Class | Type | Fields |
|---|---|---|
| `event-handlers` | one for each event | perform UI update|

## Application layer

| Class | Type | Fields |
|---|---|---|
| `application` | many | perform state change and api call. Shold have altlest 4 methods: changeState before service call, perform service call, state change after service call error and state change after service call success|



## App State

| Class | Type | Fields |
|---|---|---|
| `AppState` | one for entire app | `@dataclass`, store data that is available to entire app. Survive multiple event calls |
| `StateController` | one for entire app  | Wrapper around the state object |


## Models (Not implemented so far)

| Class | Type | Fields |
|---|---|---|
| `EventModels` | `@dataclass` | one for each event. Passes to various controllers. Stores everything. Lives as long as event lives. Type of noteshet |


---


## MainController responsibilities

```
MainController
   |
   ├── Initialize Application
   |     |
   |     ├── call UIComposer → get AppControllers
   |     |
   |     ├── call DomainComposer → get DomainControllers
   |     |
   |     └── store references
   |
   ├── Define Event Handling Methods
   |     |
   |     ├── one method per user/system event
   |     |
   |     ├── Inside each event handler:
   |     |     |
   |     |     ├── Orchestrate Flow Between Controllers
   |     |     |
   |     |     ├── Handle Cross-Component Updates
   |     |     |
   |     |     ├── Call Domain Controllers (business logic)
   |     |     |
   |     |     └── Update UI via Component Controllers
   |
   ├── Bind Events to Handlers
   |     |
   |     └── connect UI signals → MainController methods
   |
   ├── Manage Application State (High-Level)
   |     |
   |     └── shared/global state only
   |
   ├── Error Handling & Routing
   |     |
   |     ├── Receive error messages in response objects and update UI
   |     └── erors are saved in response objects by domain controllers
   |
   ├── Manage App Lifecycle
   |     |
   |     ├── initialize
   |     |    
   |     ├── reset
   |     |     
   |     └── shutdown (optional)
   |
   └── Coordinate Async / Long Tasks (if any)
         └── threads, loading states, etc.
```

## Component( Key responsibilities )

- Dumb Renderer : receive data and update UI
- A method to create UI Elements
- A method to build Layout
- Methods for signals if needed
- Emit a external signal when a user interaction occurs
- Handle internal signals (scrolling, focus, hover, animations)
- Manage Internal UI State
- If possible prefer external styling over inline(internal) styling of UI Widgets.
- Never call the controller directly
- Never read from or write to another component
- do not decide what happens after an event
- Do not call any controller method directly
- do not interact with other components
- do not access global/application state

---

## ComponentController ( Key responsibilities )

- A non-widget class that **manages one smart component**.
- One controller per smart component (our app)
- Contains only operation methods that are called during event handling 
- there can be one or more methods corrosponding to an event.
- Owns all UI-level logic for that component
- Manage internal UI state of its component
- Acts as the bridge between MainController and the Component
- Ensures the component remains dumb and passive
- Never contain business logic
- Never communicate with other `ComponentController`s directly
---

## DomainController or ServiceControllers (Key responsibilities)

- A plain class that **handles one domain of business logic or one external service**
- Can be a Singleton class?
- Contains only operation methods that are called during event handling
- accepts a request object and returns a response object
- never throw error to main controller. Errors are saved in thr response object.
- It knows nothing about the UI. Never update the UI directly
- Perform a specific business operation when called
- Return a result or raise a descriptive exception
- Receive a domain model, unpack it into simple types, call the raw service
- Assemble the result into domain model and returns back to main_controller
  back into a domain model to return
- Communicates only via MainController
- Never communicate with other `DomainController`s directly
- Never communicate with other `ComponentController`s directly

---

## Services (Key responsibilities)

- A plain class that handles exactly one external service**
- Has a dedicated Domain Controller for it.
- reusable infrastructure

---


## UIComposer (Key responsibilities)

- A plain class that **builds the entire UI** 
- single place where all components and component controllers are created
- Creates `MainWindow` and adds all components to it with correct layout
- Instantiates all `ComponentControllers` and passes each one its component
- Returns refrences of all component controllers as a frozen bundle
- Main controller need it get refrences of all component controllers 

---

## DomainComposer (Key responsibilities)

- A plain class that **builds all domain services** 
- the single place where all domain controllers are created
- Loads the settings from `.env` file at startup
- Instantiates all `DomainControllers`
- Returns refrences of all domain controllers as a frozen bundle
- Main controller need it get refrences of all domain controllers 
- Reads data from config object and pass them to controller.

## Event handlers

- Contains method to handle exactly one event.
- Perform UI updates only. Does not change state and do not perform business logic.
- Receive response object to update UI
- At the end calls UI contorllers to update UI

## Applications (Application layer)

- Create request object and calls domain(service) controllers
- Receive response object from the domain controllers
- Can call multiple domain controllers. 
- (req1--> DC1 -->res1) --> (req2--> DC2 -->res2)--> (req2--> DC3--> res3) --> UIC
- Tipically shoud have 4 methods : change state before service call, to perform service call, to change state after service call error, to change state after service call success.

## MainController (Key responsibilities)

- The **single orchestrator** for the entire application.
- Only class that knows the full sequence of steps for every user event.
- Connect all component signals to handler methods on startup
- Define the complete step-by-step flow for every user event
- Send request object and recieve response object from `DomainController`s for business logic
- Never catches exception. Errors in domain controllers are saved in response objects
- Call `ComponentController`s to update the UI
- Handle errors and decide how to surface them
- Do not contain low-level UI code. Delegate to `ComponentController`
- Do not contain business logic (no PDF parsing, no API calls). Delegate to `DomainController`


## State of the app
  - if you can creats SQL tables for the data of entire app then it can help understand/manage state easily.
  - to manage state shoud we create singleton class?

## config files
  - seprate config files for seprate work - llm, UI, data_base, etc
  - use Pydantic class to read directly from env file
  - keep all config in seprate objects and bundel all these objects into single main object.
  - only service-composer has access to these config files. It pass confgs to service composers. No Component, service, handler, app state or any other code has direct access to config object


## Models
  - Use Pydantic only at boundaries where data comes from outside. Use dataclass for internal app models.
  - Request and response models for domain controllers: better design than using Event Models.
  - Event Models : created one for each event. Passes to various controllers. Stores everything. Lives as long as event lives. Type of notesheet that records everything from start of an event till event handling finishes.


> we have try catch to handle same error in both DomainController and MainController. DomainController catches Raw library exceptions and raises clean domain error. MainController catches Clean domain errors and decides what to do next. This is the standard pattern for layered architectures. Each layer only speaks the language of the layer above it.

---


## Blocking Vs Async calls


| Topic | Blocking Call | Async Call |
|---|---|---|
| Qt event loop | Frozen for the duration of the call | Stays alive |
| User interaction | Impossible — UI cannot respond | Possible — user can still click/interact |
| Widget guards needed | Usually no — freezing acts like an implicit lock | Yes — guards prevent duplicate/concurrent requests |
| Spinner / progress feedback | Not renderable — UI is frozen| Works correctly |
| UI enable/disable action | Usually not useful before the call, because UI freezes anyway | Enable/disable relevant elements before starting the async task |

## State Change Decision

### Decision: controller-driven UI updates (not state-driven / reactive)

For this app we chose a **simple controller-driven approach** over a reactive state pattern (like signals on a shared `AppState` object).

This means: **`MainController` explicitly calls `ComponentController` methods to update the UI** after every event. There is no observable state object that components watch automatically.

### Why this approach fits our app

| Factor | Reason |
|---|---|
| Small app | Only 4 user events, 12 components — reactive overhead not justified |
| Linear flows | Each event has a clear, predictable sequence of steps |
| Beginner-friendly | Explicit calls are easier to read, trace, and debug than reactive subscriptions |
| No cross-cutting state | No component needs to react to state it didn't directly cause |

### Rule
> Every UI update in this app is an **explicit method call** made by `MainController` or a `ComponentController`. No component updates itself in response to a shared state object.

---
