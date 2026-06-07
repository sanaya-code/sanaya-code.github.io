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

    const json = _compactStringify(payload);
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
    const json = _compactStringify(payload);
    return navigator.clipboard.writeText(json);
  }

  // ── Compact JSON serializer ───────────────────────────
  // Like JSON.stringify(x, null, 2) but collapses objects
  // that contain only primitive values onto a single line.
  // e.g. {"id":"A","text":"cat"} stays on one line.

  function _compactStringify(value, indent) {
    indent = indent || 2;

    function _isPrimitive(v) {
      return v === null || typeof v !== 'object';
    }

    function _isShallowObject(obj) {
      if (Array.isArray(obj)) return false;
      return Object.values(obj).every(_isPrimitive);
    }

    function _isArrayOfShallowObjects(arr) {
      if (!Array.isArray(arr)) return false;
      return arr.every(item =>
        item !== null && typeof item === 'object' &&
        !Array.isArray(item) && _isShallowObject(item)
      );
    }

    function _isArrayOfPrimitives(arr) {
      if (!Array.isArray(arr)) return false;
      return arr.every(_isPrimitive);
    }

    // Strip wrapping quotes from strings e.g. "\"geography\"" → "geography"
    function _cleanString(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/^"+|"+$/g, '').trim();
    }

    function _serialize(val, depth) {
      const outerPad = ' '.repeat(depth * indent);
      const innerPad = ' '.repeat((depth + 1) * indent);

      if (_isPrimitive(val)) return JSON.stringify(val);

      if (Array.isArray(val)) {
        if (val.length === 0) return '[]';

        // Array of primitives → all on one line e.g. ["math", "time"]
        if (_isArrayOfPrimitives(val)) {
          const items = val.map(item =>
            JSON.stringify(typeof item === 'string' ? _cleanString(item) : item)
          );
          return `[${items.join(', ')}]`;
        }

        // Array of shallow objects → each item on one line
        if (_isArrayOfShallowObjects(val)) {
          const items = val.map(item => {
            const pairs = Object.entries(item)
              .map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)
              .join(', ');
            return `${innerPad}{${pairs}}`;
          });
          return `[\n${items.join(',\n')}\n${outerPad}]`;
        }

        // Regular array — recurse
        const items = val.map(item => `${innerPad}${_serialize(item, depth + 1)}`);
        return `[\n${items.join(',\n')}\n${outerPad}]`;
      }

      // Object
      const pairs = Object.entries(val).map(([k, v]) => {
        return `${innerPad}${JSON.stringify(k)}: ${_serialize(v, depth + 1)}`;
      });
      return `{\n${pairs.join(',\n')}\n${outerPad}}`;
    }

    return _serialize(value, 0);
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

  // ── Reassign ids sequentially for export ─────────────

  function _reassignExportIds(questions) {
    return questions.map((q, i) => {
      const { id: _discarded, ...rest } = JSON.parse(JSON.stringify(q));
      return { id: String(i + 1).padStart(3, '0'), ...rest };
    });
  }

  return { download, copyToClipboard };

})();