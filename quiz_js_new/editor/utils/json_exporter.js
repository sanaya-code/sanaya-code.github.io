// editor/utils/json_exporter.js

const JsonExporter = (() => {

  // ── Download full JSON with metadata wrapper ─────────

  function download(questions, filename) {
    filename = filename || _defaultFilename();
    const reindexed = _reassignExportIds(questions);

    const payload = {
      metadata: {
        title:         'Quiz Question Bank',
        description:   'Exported from Quiz Editor',
        version:       '2.0',
        created:       new Date().toISOString().slice(0, 10),
        last_modified: new Date().toISOString().slice(0, 10),
        author:        '',
        license:       'CC BY-SA 4.0',
        total_questions: reindexed.length,
      },
      questions: reindexed,
    };

    const json = _stringifyPayload(payload);
    _triggerDownload(json, filename, 'application/json');
  }

  // ── Copy to clipboard ────────────────────────────────

  function copyToClipboard(questions) {
    const reindexed = _reassignExportIds(questions);
    const payload = {
      metadata: {
        title:           'Quiz Question Bank',
        version:         '2.0',
        last_modified:   new Date().toISOString().slice(0, 10),
        total_questions: reindexed.length,
      },
      questions: reindexed,
    };
    const json = _stringifyPayload(payload);
    return navigator.clipboard.writeText(json);
  }

  // ── Type-aware formatting rules ───────────────────────
  //
  // INLINE_OBJ_FIELDS: these array-of-objects fields render
  //   each object on ONE LINE  e.g. {"id":"A","text":"Earth"}
  //
  // EXPAND_FIELDS: these array-of-objects fields always
  //   render EXPANDED (one key per line per object)
  //
  // All other fields follow generic rules:
  //   - array-of-primitives        → inline  ["a","b"]
  //   - array-of-primitive-arrays  → inline  [["a"],["b"]]
  //   - everything else            → expanded

  const INLINE_OBJ_FIELDS = {
    mcq:                    ['options'],
    multi_select:           ['options'],
    multi_select_circle:    ['options'],
    multi_select_two:       ['quantities', 'blocks'],
    ordering:               ['items'],
    fill_in_blank_multi_graph: ['blocks'],
    matching:               ['pairs'],
    matching_select:        ['pairs'],
    matching_drag_drop:     ['pairs'],
    matching_connection:    ['pairs'],
    multi_fill_in_blank:    ['blanks'],
    number_line_arcs:       [],
  };

  // Fields that must always expand even if they look shallow
  const EXPAND_FIELDS = {
    short_answer:                 ['acceptable_variations'],
    options_fill_in_blank:        ['options'],
    table_fill_in_the_blank:      ['user_response'],
    fill_in_blank_operation:      ['editable_answer', 'initial_answer', 'correct_answer', 'user_response'],
    multi_select_two:             ['required_selections', 'available_highlight_styles'],
    matching_connection_image:    ['rows'],
    table_image_fill_in_the_blank:['rows'],
  };

  // ── Top-level payload serializer ──────────────────────

  function _stringifyPayload(payload) {
    const indent = 2;
    const lines  = [];
    lines.push('{');
    const entries = Object.entries(payload);
    entries.forEach(([k, v], i) => {
      const comma = i < entries.length - 1 ? ',' : '';
      if (k === 'questions' && Array.isArray(v)) {
        lines.push(`  "questions": [`);
        v.forEach((q, qi) => {
          const qComma = qi < v.length - 1 ? ',' : '';
          lines.push(_serializeQuestion(q, indent) + qComma);
        });
        lines.push(`  ]${comma}`);
      } else {
        lines.push(`  ${JSON.stringify(k)}: ${_serializeValue(v, 1, null, null, indent)}${comma}`);
      }
    });
    lines.push('}');
    return lines.join('\n');
  }

  // ── Serialize a single question object ───────────────

  function _serializeQuestion(q, indent) {
    const type      = q.type === 'skip' ? (q.original_type || '') : (q.type || '');
    const pad1      = ' '.repeat(indent);
    const pad2      = ' '.repeat(indent * 2);
    const entries   = Object.entries(q);
    const lines     = [];

    lines.push(`${pad1}{`);
    entries.forEach(([k, v], i) => {
      const comma    = i < entries.length - 1 ? ',' : '';
      const inlineFields = (INLINE_OBJ_FIELDS[type] || []);
      const expandFields = (EXPAND_FIELDS[type]      || []);

      let serialized;

      if (expandFields.includes(k)) {
        // Always expand — pass type + fieldName so _serializeValue honours the rule
        serialized = _serializeValue(v, 2, type, k, indent);
      } else if (inlineFields.includes(k) && Array.isArray(v)) {
        // Each object on one line
        serialized = _serializeInlineObjArray(v, 2, indent);
      } else {
        // Generic — pass type + fieldName for context
        serialized = _serializeValue(v, 2, type, k, indent);
      }

      lines.push(`${pad2}${JSON.stringify(k)}: ${serialized}${comma}`);
    });
    lines.push(`${pad1}}`);
    return lines.join('\n');
  }

  // ── Serialize array where each object renders on one line

  function _serializeInlineObjArray(arr, depth, indent) {
    if (!Array.isArray(arr) || arr.length === 0) return '[]';
    const outerPad = ' '.repeat(depth * indent);
    const innerPad = ' '.repeat((depth + 1) * indent);
    const items = arr.map(item => {
      if (item === null || typeof item !== 'object' || Array.isArray(item)) {
        return `${innerPad}${JSON.stringify(item)}`;
      }
      const pairs = Object.entries(item).map(([k, v]) =>
        `${JSON.stringify(k)}: ${_inlinePrimOrPrimArr(v)}`
      ).join(', ');
      return `${innerPad}{${pairs}}`;
    });
    return `[\n${items.join(',\n')}\n${outerPad}]`;
  }

  // ── Generic value serializer ──────────────────────────
  // type + fieldName give context for smart decisions

  function _serializeValue(val, depth, type, fieldName, indent) {
    const outerPad = ' '.repeat(depth * indent);
    const innerPad = ' '.repeat((depth + 1) * indent);

    if (val === null || typeof val !== 'object') {
      return JSON.stringify(_cleanStr(val));
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';

      // If field is explicitly marked to expand, skip all inline rules
      const shouldExpand = fieldName && (EXPAND_FIELDS[type] || []).includes(fieldName);

      // Array of primitive arrays → inline  [[0,2],[2,6]]  (unless expand rule)
      if (!shouldExpand && _isArrOfPrimArrs(val)) {
        return `[${val.map(inner =>
          `[${inner.map(e => JSON.stringify(_cleanStr(e))).join(', ')}]`
        ).join(', ')}]`;
      }

      // Array of primitives → inline  ["a","b"]
      if (!shouldExpand && _isArrOfPrims(val)) {
        return `[${val.map(e => JSON.stringify(_cleanStr(e))).join(', ')}]`;
      }

      // Array of arrays (non-primitive inner) → expand outer, inline inner primitives
      if (val.every(item => Array.isArray(item))) {
        const items = val.map(inner => {
          // inner arrays of primitives → inline on one line
          if (_isArrOfPrims(inner)) {
            return `${innerPad}[${inner.map(e => JSON.stringify(_cleanStr(e))).join(', ')}]`;
          }
          const innerItems = inner.map(cell =>
            `${innerPad}  ${_serializeValue(cell, depth + 2, type, null, indent)}`
          );
          return `${innerPad}[\n${innerItems.join(',\n')}\n${innerPad}]`;
        });
        return `[\n${items.join(',\n')}\n${outerPad}]`;
      }

      // Array of objects — recurse each
      const items = val.map(item =>
        `${innerPad}${_serializeValue(item, depth + 1, type, fieldName, indent)}`
      );
      return `[\n${items.join(',\n')}\n${outerPad}]`;
    }

    // Object — check if it should inline
    if (_shouldInlineObj(val, type, fieldName, depth)) {
      const pairs = Object.entries(val).map(([k, v]) =>
        `${JSON.stringify(k)}: ${_inlinePrimOrPrimArr(v)}`
      ).join(', ');
      return `{${pairs}}`;
    }

    // Expand object
    const pairs = Object.entries(val).map(([k, v]) => {
      return `${innerPad}${JSON.stringify(k)}: ${_serializeValue(v, depth + 1, type, k, indent)}`;
    });
    return `{\n${pairs.join(',\n')}\n${outerPad}}`;
  }

  // ── Inline an object if it qualifies ─────────────────
  // Rules: all values are primitives or prim-arrays AND ≤ 4 keys
  // Exception: never inline at depth < 2 (top-level question objects)

  function _shouldInlineObj(obj, type, fieldName, depth) {
    if (depth < 2) return false;
    if (!_isShallowObj(obj)) return false;
    // Explicitly named expand fields never inline
    const expandFields = (EXPAND_FIELDS[type] || []);
    if (fieldName && expandFields.includes(fieldName)) return false;
    return Object.keys(obj).length <= 4;
  }

  // ── Primitive helpers ─────────────────────────────────

  function _isPrim(v)          { return v === null || typeof v !== 'object'; }
  function _isArrOfPrims(arr)  { return Array.isArray(arr) && arr.every(_isPrim); }
  function _isArrOfPrimArrs(a) { return Array.isArray(a) && a.every(i => Array.isArray(i) && _isArrOfPrims(i)); }
  function _isShallowObj(obj)  {
    if (Array.isArray(obj)) return false;
    return Object.values(obj).every(v => _isPrim(v) || _isArrOfPrims(v));
  }

  // Render a value that is known to be prim or prim-array
  function _inlinePrimOrPrimArr(v) {
    if (_isPrim(v)) return JSON.stringify(_cleanStr(v));
    if (_isArrOfPrims(v)) return `[${v.map(e => JSON.stringify(_cleanStr(e))).join(', ')}]`;
    if (_isArrOfPrimArrs(v)) return `[${v.map(inner =>
      `[${inner.map(e => JSON.stringify(_cleanStr(e))).join(', ')}]`
    ).join(', ')}]`;
    return JSON.stringify(v);
  }

  // Strip wrapping quotes  "\"geography\"" → "geography"
  function _cleanStr(v) {
    if (typeof v !== 'string') return v;
    return v.replace(/^"+|"+$/g, '').trim();
  }

  // ── Helpers ──────────────────────────────────────────

  function _defaultFilename() {
    const d = new Date();
    const stamp = d.getFullYear()
      + String(d.getMonth() + 1).padStart(2, '0')
      + String(d.getDate()).padStart(2, '0');
    return 'quiz_questions_' + stamp + '.json';
  }

  function _triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function _reassignExportIds(questions) {
    return questions.map((q, i) => {
      const { id: _discarded, ...rest } = JSON.parse(JSON.stringify(q));
      return { id: String(i + 1).padStart(3, '0'), ...rest };
    });
  }

  return { download, copyToClipboard };

})();