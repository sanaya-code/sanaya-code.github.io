# Application Flow Design

## 1. Event Handler — Chaining Applications

The event handler orchestrates the workflow by chaining multiple application calls, feeding the output of one as input to the next, and updating the relevant component controller after each step.

```
Event Handler:
  result1 = application_01.doSomething(eventData)
  componentController_01.update(result1)

  result2 = application_02.doSomethingElse(result1)
  componentController_02.update(result2)

  result3 = application_03.doSomethingElse(result2)
  componentController_03.update(result3)

  ...

  resultN = application_0N.doSomethingElse(resultN-1)
  componentController_0N.update(resultN)
```

**Rules:**
- Event handler contains the orchestration/workflow logic (chaining order, which controller to update when).
- Applications never call other applications directly.
- Applications never call component controllers directly.

---

## 2. Application Flow Template

A generic template for a single application's use case.

```
Application_0X.useCaseName(input):
  1. Read required data via state_controller.get(...)        [optional]
  2. Validate / transform input using utils                  [optional]
  3. Call service(s) as needed for this use case:
       - service_A.operation(...)
       - service_B.operation(...)
       - ... (multiple allowed if part of same business transaction)
  4. Process service result(s) / apply business rules
       - may interleave with further service calls if logic requires
  5. Update state via state_controller.set(...)              [optional]
  6. Return output (data needed by event handler / next application)
```

**Notes:**
- Steps 1 and 5 — only via `state_controller`, never direct state access.
- Step 3 — only via `service_0X`, application contains no API/storage details.
- Steps 2 and 4 — pure business logic + utils, no DOM/UI/controller access.
- Step 6 — return value is the only way output reaches the event handler; no side-channel communication.
- Any step may be omitted if not needed (e.g., a pure calculation use case skips 1, 3, 5).

---

## 3. Example — Single Cohesive Transaction with Multiple Service Calls

```
application_01.placeOrder(orderData):
  1. cart = state_controller.get('cart')
  2. validatedOrder = validateOrder(orderData, cart)         // utils
  3. stock = service_inventory.checkStock(validatedOrder)
  4. validateStock(stock)                                     // business logic
  5. paymentResult = service_payment.charge(validatedOrder)
  6. processPayment(paymentResult)                            // business logic
  7. service_notification.sendConfirmation(validatedOrder)
  8. state_controller.set('lastOrder', buildSummary(...))
  9. return summary
```

---

## 4. Decision Rule — One Application vs. Multiple Chained Applications

- **Same business transaction** → keep all service calls inside **one** application (see example above).
- **Independent / reusable use cases** → split into separate applications, chained via the event handler (see section 1).
- Do not create one application per service call by default — split based on business meaning, not service boundaries.