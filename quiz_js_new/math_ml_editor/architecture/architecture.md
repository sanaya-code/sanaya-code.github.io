# Math Builder — Architecture Reference

---




---

| Component Folder     | Component Methods                                                                                                                                                                               | Controller Methods                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atoms_panel`        | `createElement()` `buildLayout()` `renderPills(items)` `highlightPill(id)` `clearHighlight()` `emitAddClick()` `emitPillClick(id)`                                                              | `onPillClick(id)` `onAddClick()` `load(items)` `highlightSelected(id)` `clearSelection()`                                                                               |
| `working_set_panel`  | `createElement()` `buildLayout()` `renderPills(items)` `highlightPill(id)` `clearHighlight()` `showEmpty()` `emitPillClick(id)` `emitDeleteClick(id)`                                           | `onPillClick(id)` `onDeleteClick(id)` `load(items)` `highlightSelected(id)` `clearSelection()` `append(item)` `remove(id)`                                              |
| `add_item_popup`     | `createElement()` `buildLayout()` `open()` `close()` `clearForm()` `emitSubmit(name, type)` `emitCancel()`                                                                                      | `onSubmit(name, type)` `onCancel()` `show()` `hide()`                                                                                                                   |
| `operator_accordion` | `createElement()` `buildLayout()` `renderGroups(groups)` `highlightOperator(name)` `filterItems(query)` `emitOperatorClick(op)`                                                                 | `onOperatorClick(op)` `onSearchInput(query)` `load(groups)` `highlightSelected(op)` `clearSelection()`                                                                  |
| `tab_panel`          | `createElement()` `buildLayout()` `setActiveTab(tabId)` `emitTabClick(tabId)`                                                                                                                   | `onTabClick(tabId)` `switchToTab(tabId)`                                                                                                                                |
| `operator_form`      | `createElement()` `buildLayout()` `renderSlots(slots)` `setSlotFilled(index,item,src)` `setSlotActive(index)` `setSlotEmpty(index)` `emitSlotClick(index)` `emitSlotClear(index)` `emitApply()` | `onSlotClick(index)` `onSlotClear(index)` `onApply()` `fillSlot(index,item)` `clearSlot(index)` `setActiveSlot(index)` `reset(operator)` `getSlots()` `getActiveSlot()` |
| `right_panel`        | `createElement()` `buildLayout()` `showOperatorsView()` `showFormView()`                                                                                                                        | `showOperatorsView()` `showFormView()`                                                                                                                                  |

## CONTROLLER RULES

* One controller per component.
* Controllers manage only UI-level behavior.
* Controllers never contain business logic.
* Controllers never communicate with other controllers directly.
* Controllers never access another component directly.
* Controllers act as bridge between application and their component.
* Controllers may manage temporary UI state for their own component only.

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
