# Math Builder — Architecture Reference

---

| Component Folder     | Component Methods                                                                                                                                                                                                                              | Controller Methods                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items_panel`         | `createElement()` `buildLayout()` `_buildSection(title)` `getAtomsMount()` `getWorkingSetMount()` `setAtomsCount(count)` `setWorkingSetCount(count)` `emitAddClick()`                                                                          | `mount()` `bindEvents(onAddClick)` — also instantiates and mounts `AtomsPanelController` and `WorkingSetPanelController` into its section mounts                       |
| `atoms_panel`         | `createElement()` `buildLayout()` `renderPills(nodes)` `highlightPill(id)` `clearHighlight()` `emitPillClick(id)` `emitCountChange(count)`                                                                                                     | `mount()` `bindEvents(onPillClick)` `bindCountChange(onCountChange)` `load(items)` `activateItem(id)` `highlightSelected(id)` `clearSelection()`                       |
| `working_set_panel`   | `createElement()` `buildLayout()` `renderPills(nodes)` `highlightPill(id)` `clearHighlight()` `showEmpty()` `emitPillClick(id)` `emitDeleteClick(id)` `emitCountChange(count)`                                                                 | `mount()` `bindEvents(onPillClick, onDeleteClick)` `bindCountChange(onCountChange)` `load(items)` `activateItem(id)` `highlightSelected(id)` `clearSelection()`        |
| `add_item_popup`      | `createElement()` `buildLayout()` `_getSelectedType()` `_handleSubmit()` `_handleSubmitAll()` `open()` `close()` `clearForm()` `emitSubmit(name, type)` `emitSubmitAll(raw, type)` `emitCancel()`                                              | `mount()` `bindEvents(onSubmit, onSubmitAll, onCancel)` `show()` `hide()`                                                                                              |
| `operator_browser`    | `createElement()` `buildLayout()` `_buildSearchInput()` `_buildCatRow()` `_buildOpsPanel()` `_buildCatCard(group, active)` `_buildOpPill(op)` `_renderCategories()` `_renderOps(groupName)` `_renderSearchResults(query)` `_opMatches(op, query)` `highlightOperator(name)` `emitOperatorClick(op)` `emitSearchInput(query)` | `mount()` `bindEvents(onOperatorClick, onSearchInput)` `highlightSelected(op)` `clearSelection()`                                                                      |
| `operator_form`       | `createElement()` `buildLayout()` `_buildEmptyState()` `_buildFormBody()` `_buildApplyRow()` `_buildSlotEl(slot, index, slotLabels)` `showEmpty()` `renderSlots(slots, slotLabels)` `setSlotActive(index)` `updatePreview(exprHtml)` `setOperatorHeader(sym, name, arity)` `setApplyEnabled(enabled)` `showFeedback(msg)` `emitSlotClick(index)` `emitSlotClear(index)` `emitApply()` | `mount()` `bindEvents(onSlotClick, onSlotClear, onApply)` `reset(operator)` `fillSlot(index, node)` `clearSlot(index)` `setActiveSlot(index)` `updatePreview(slots)` `getSlots()` `getActiveSlot()` `showFeedback(msg)` `_rerenderSlots()` `_allFilled()` |
| `sentence_builder`    | `createElement()` `buildLayout()` `_buildControls()` `_buildPillStrip()` `_buildPreviewPanel()` `_buildTextPill(token, isLast)` `_buildNodePill(token, isLast)` `_buildDeleteBtn()` `renderTokens(tokens)` `updatePreview(tokens)` `setMathmlMode(active)` `_handleAddText()` `showCopyFeedback()` `emitAddText(text)` `emitAddSpace()` `emitMathmlModeToggle()` `emitCopy()` `emitDeleteLast()` | `mount()` `bindEvents(onAddText, onAddSpace, onDeleteLast, onMathmlModeToggle, onCopy)` `load(tokens)` `setMathmlMode(active)` `showCopyFeedback()`                    |
| `right_panel`         | `createElement()` `buildLayout()` `getOperatorsPane()` `getFormPane()` `getSentencePane()` `showOperatorsView()` `showFormView()` `showSentenceView()` `_setPaneActive(tabId)` `emitTabClick(tabId)`                                           | `mount()` `getOperatorsPane()` `getFormPane()` `getSentencePane()` `bindEvents(onTabClick)` `showOperatorsView()` `showFormView()` `showSentenceView()`               |

`operator_accordion` and `tab_panel` (and their event handlers) are unused dead code from earlier scaffolding, kept on disk but not wired into `index.html`'s active app flow. `operator_browser` and `right_panel` are the live replacements.

---

## COMPONENT CONTROLLER RULES


**Exception — `items_panel`:** as a wrapper panel, its controller instantiates and mounts `AtomsPanelController` and `WorkingSetPanelController` into its own section mount points, and wires their `count-change` events to update its header badges. This is the one case where a controller owns child controllers, justified because `items_panel` exists purely to compose the visual layout of two sibling panels into one bordered region.


## EVENT HANDLER RULES

Active event handlers: `items_panel` (handles `+ Add` → opens popup), `atoms_panel`, `working_set_panel`, `add_item_popup`, `operator_browser`, `operator_form`, `sentence_builder`, `right_panel`. The `sentence_builder` handler is constructed first in `event_composer.js` since `atoms_panel` and `working_set_panel` handlers depend on it for routing pill clicks when sentence "MathML mode" is active.

## MAIN CONTROLLER RULES

Required order in `main_controller.js`:
```js
this.ui = new UIComposer();
this.ui.mountAll();                              // must run before EventComposer
this.events = new EventComposer(this.ui, StateController);
```
`mountAll()` must run before `EventComposer` is constructed, because `ui.atomsPanel` / `ui.workingSetPanel` are getters that delegate to `ui.itemsPanel.atomsPanel` / `.workingSetPanel`, which are only set during `itemsPanel.mount()`.