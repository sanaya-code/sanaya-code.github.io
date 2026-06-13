
# COMPONENT RULES
* Dumb renderers only. Receive data and update UI.
* A method to create UI elements.
* A method to build layout.
* Methods for signals (if needed).
* Create and update DOM.
* Emit events/signals.
* Handle internal UI concerns (focus, hover, scrolling, animation).
* Never access application state.
* Never access services.
* Never contain business logic.
* Never call controller methods.
* Never communicate with other components.
* Never decide what happens after a user event.


# COMPONENT CONTROLLER RULES

* One controller per component.
* Controllers manage only UI-level behavior.
* Controllers act as the bridge between event handlers and components.
* Controllers never contain business logic.
* Controllers never access application state.
* Controllers never call services.
* Controllers never communicate with other controllers.
* Controllers never access other components.
* Controllers may manage temporary UI state for their own component only.
* Controllers expose methods for updating the component UI.
* Controllers should provide a method that binds one or more callback functions to component events.

# VIEW RULES
* Composes UI components into the overall screen layout.
* Calls component "create UI elements" and "build layout" methods.
* Arranges components into containers/sections/grids for the screen.
* Mounts the composed view into the DOM (e.g., root element).
* Contains no business logic.
* Contains no workflow logic.
* Never accesses application state.
* Never accesses services.
* Never wires event handlers (done by main_controller).
* Never communicates with other views directly.

# EVENT HANDLER RULES

* Cross-component communication goes through `event_handlers/*`.
* Event handlers coordinate application workflows.
* Event handlers respond to UI events.
* Event handlers may call component controller methods.
* Event handlers may call application methods.
* Event handlers may update UI before and after application execution.
* Event handlers should not contain business logic.
* Event handlers should not call services directly.
* Components never communicate directly.
* Controllers never communicate directly.

# APPLICATION RULES

* Applications contain business logic.
* Applications implement use cases and application actions.
* Applications may read state through `state_controller.js`.
* Applications may update state through `state_controller.js`.
* Applications may call services.
* Applications may call utility functions.
* Applications never access components.
* Applications never access controllers.
* Applications never access DOM APIs.
* Applications should return results to event handlers when needed.

# STATE RULES

* Application state lives in `state.js`.
* All state access goes through `state_controller.js`.
* Components never access state directly.
* Controllers never access state directly.
* Applications read and update state through `state_controller.js`.
* State should not contain UI-specific data.

# SERVICE RULES

* Services perform external operations.
* Services may call APIs.
* Services may load or save files.
* Services may access browser storage.
* Services contain no business logic.
* Services never access UI components.
* Services never update state directly.

# MAIN CONTROLLER RULES

* Creates application state.
* Creates UI controllers.
* Creates application objects.
* Creates event handlers.
* Wires all dependencies together.
* Registers all event handlers.
* Mounts UI.
* Contains no business logic.
* Contains no workflow logic.

# DEPENDENCY RULES

* Components know only about themselves.
* Controllers know only about their component.
* Event handlers know about controllers and applications.
* Applications know about state and services.
* Services know about external systems only.

Allowed dependency flow:

Component fires event
→ Event Handler
    → Component Controller → Update Component
    → Application
        → State Controller / Service

Forbidden dependency flow:

Component → State

Component → Service

Controller → Service

Controller → Application

Application → Controller

Application → Component

Service → State

Service → Controller

Service → Component
