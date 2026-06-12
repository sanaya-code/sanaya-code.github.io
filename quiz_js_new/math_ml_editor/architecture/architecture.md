# Math Builder — Architecture Reference

---

## COMPONENT CONTROLLER RULES

* One controller per component.
* Controllers manage only UI-level behavior.
* Controllers never contain business logic.
* Controllers never communicate with other controllers directly.
* Controllers never access another component directly.
* Controllers act as bridge between application and their component.
* Controllers may manage temporary UI state for their own component only.
* Controllers shoud have a method that takes one or multiple methods as arguments and bind those methods to the components events.


## COMPONENT RULES

* Dumb renderers only.
* Create and update DOM.
* Emit events/signals.
* Handle internal UI concerns (focus, hover, scrolling, animation).
* Never access global state.
* Never contain business logic.
* Never call controller methods directly.
* Never decide what happens after a user event.

## EVENT HANDLER RULES

* Cross-component communication goes through `event_handlers/*`.
* Event handlers may:

  * Read/write state through `state_controller.js`
  * Call component controller methods
  * Coordinate workflows between components
* Event handlers contain application workflow logic.
* Components never communicate directly.
* Controllers never communicate directly.


## MAIN CONTROLLER RULES

* Creates and wires all controllers.
* Registers all event handlers.
* Mounts UI.
* Contains no business logic.
