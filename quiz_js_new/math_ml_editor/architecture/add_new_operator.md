# Adding a New Operator — Step by Step

## 1. Create the folder and file

`mathml_operators/<name>_operator/operator.js`

## 2. Write the class — extends `Operator`

```js
class MyOperator extends Operator {

  constructor() {
    super({
      name:       'MyOp',               // display name
      sym:        '⊕',                  // symbol shown on pill
      arity:      2,                    // number of operand slots
      group:      'Arithmetic',         // category — must match an existing group in registry
      slotLabels: ['left', 'right'],    // optional — labels for each slot
      keywords:   ['combine', 'merge'], // optional — search terms
    });
  }

  buildPreview(nodes) {
    // nodes[i] are MathML fragments (already valid <mi>, <msup>, etc.)
    // return FULL <math> document for live preview
    return `<math display="inline"><mrow>${nodes[0]}<mo>⊕</mo>${nodes[1]}</mrow></math>`;
  }

  buildMathmlNode(nodes) {
    // return INNER fragment only — NO <math> wrapper
    // used when storing the result as a Working Set node
    return `<mrow>${nodes[0]}<mo>⊕</mo>${nodes[1]}</mrow>`;
  }

  buildExpression(names) {
    // optional — plain text representation
    return `(${names[0]} ⊕ ${names[1]})`;
  }

}

const myOperator = new MyOperator();
```

## 3. Register it

Add `myOperator` to the correct group array in `mathml_operators/operator_registry.js`:

```js
{
  group: 'Arithmetic',
  ops: [
    addOperator,
    myOperator,   // <-- add here
    ...
  ]
}
```

## 4. Load it

Add the script tag in `index.html`, **after `operator.js`, before `operator_registry.js`**:

```html
<script src="mathml_operators/my_operator/operator.js"></script>
<script src="mathml_operators/operator_registry.js"></script>
```

---

## The critical invariant (see `OPERATOR_RULES.md`)

> Every `Node.mathmlNode` is `<math display="inline">SINGLE_INNER_FRAGMENT</math>`

- `buildPreview(nodes)` → returns full `<math>...</math>` — **insert fragments raw, never wrap in `<mi>`/`<mn>`**
- `buildMathmlNode(nodes)` → returns inner fragment only, **no `<math>` wrapper**
- `nodes[i]` are already valid MathML fragments — treat as opaque blobs, never re-wrap them

---

## What you get for free

If you skip `buildPreview` / `buildMathmlNode` / `buildExpression`, the base `Operator` class provides generic fallbacks based on `arity` (1, 2, or N-ary with comma-separated args) — fine for simple operators, but custom layouts (fractions, roots, subscripts) need overrides.

If you skip `slotLabels`, slots auto-label as `operand 1`, `operand 2`, etc.

If you skip `keywords`, search still matches on `name` and `sym`.

---

## Test checklist

- [ ] Operator pill appears in correct category in Operator Browser
- [ ] Clicking it opens the form with correct slot count and labels
- [ ] Filling slots with atoms shows correct preview
- [ ] Filling a slot with a **Working Set expression** (nested case) renders correctly — this catches `<mi>` double-wrapping bugs
- [ ] Apply saves to Working Set and the new pill's MathML renders correctly
- [ ] Search finds the operator by name, symbol, or keyword