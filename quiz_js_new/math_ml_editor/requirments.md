```
MATHML BUILDER — DECISIONS FINALIZED SO FAR
===========================================

1. NODE STORAGE
---------------
- Every node stores complete MathML.
- node.mathml stores only a valid MathML fragment, never the outer <math> element.
- node.id : not relevant for discussion (internal use only)
- No references to other nodes.
- No parent/child relationships.
- Node has no metadata beyond mathml.

Example:
{
  id: "node-1",
  mathml: "<mi>x</mi>"
}

Rendering rule:
<math display="inline">
    ${node.mathml}
</math>

2. LEVELS
---------
- Levels are isolated.
- Nodes in a level do not depend on nodes in earlier levels.
- Levels represent construction stages, not tree depth.

3. PREVIOUS LEVEL USAGE
-----------------------
- When building a node, only the immediately previous level is visible.
- Users select nodes from the previous level only.

4. COPY TO NEXT LEVEL
---------------------
- Core feature.
- Copies a complete MathML node into the next level.
- Required for carrying atoms and sub-expressions forward.

5. EDITING
----------
- Editing a node affects only that node.
- No automatic updates elsewhere.

6. DELETION
-----------
- Node deletion requires confirmation.
- Safe deletion.
- No dependency checks.
- Nodes are independent copies of MathML; deletion never affects any other node.

7. NO DEPENDENCY SYSTEM
-----------------------
- No graph structure.
- No usage tracking.
- No recursive updates.
- No root-node management.

8. OPERATOR CLASSES
-------------------
- One class per operator.
- Each operator generates complete, self-contained MathML.
- All operators have fixed arity (strict binary or fixed slots only).
- Operator logic is stateless.

Examples:
AddOperator
PowerOperator
DivideOperator
IntegralOperator
LimitOperator

9. SAVE / LOAD
--------------
- Store nodes only.
- Very simple serialization.
- No import/export JSON feature.

10. EXPORT
----------
- Any node can be exported directly as MathML.

11. STATE STRUCTURE (HYBRID MODEL)
----------------------------------
state = {
  nodesById: {
    "uuid1": { id: "uuid1", mathml: "<mi>x</mi>" },
    "uuid2": { id: "uuid2", mathml: "<mn>2</mn>" }
  },

  atoms: ["uuid1", "uuid2"],
  workingSet: ["uuid3", "uuid4"]
}

- Fully random UUID-like IDs
- Minimal node schema
- Same schema for atoms and working set nodes (unified system)

12. LEVEL 1 (ATOMS)
-------------------
Atoms come from two sources:

A. Built-in symbol palette
   Examples:
   π, ∞, α, β, γ, ≤, ≥, ≠, ∈, ∂, ∇

B. User typing
   Examples:
   x
   y
   velocity
   2
   100
   3.14

- When user types an atom, they must select type via radio button:
  (mi) identifier
  (mn) number

13. LEVEL 1 SIMPLICITY
----------------------
- No operators.
- No slot filling.
- No composition.
- No special workflow.

Level 1 UI:
[ Input Box ] [ Add Atom ]
+
Built-in Symbol Palette

14. BUILT-IN ATOM LIST
----------------------
- Contains only symbols that are difficult to type.
- Regular letters and numbers are NOT stored in the palette.
- Users type them directly.

15. OPERATOR SELECTION
----------------------
- Users choose operators from categorized panels.

Arithmetic:
[ + ] [ - ] [ × ] [ ÷ ]

Powers & Roots:
[ Power ] [ Root ]

Functions:
[ sin ] [ cos ] [ tan ] [ log ]

Calculus:
[ ∫ ] [ lim ]

Relations:
[ = ] [ ≠ ] [ < ] [ > ] [ ≤ ] [ ≥ ]

Sets:
[ ∈ ] [ ∉ ] [ ∪ ] [ ∩ ]

16. SLOT FILLING BEHAVIOR (OPERATOR WORKFLOW)
---------------------------------------------
- All operators use fixed slots (strict arity).
- Slot filling is sequential via manual slot selection.
- User clicks a slot, then selects a node.
- Slots allow overwrite immediately (no prompt).
- Only nodes from current working set can be used as inputs.
- Once all slots are filled, operator generates a node.
- Generated node is automatically added to working set.

- No manual slot auto-assignment.
- No conflict handling needed.
- UI remains open for rapid node creation until manually closed.

17. GENERAL INTERACTION PRINCIPLE
----------------------------------
- System is stateless in dependency terms.
- Every action produces independent MathML snapshots.
- No cross-node updates ever occur.
- Only single active operator form allowed at a time.

18. INTERACTION CONSTRAINTS
--------------------------
- Mouse-only interaction only.
```
