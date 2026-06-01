// editor/utils/json_exporter.js

const JsonExporter = (() => {

  // ── Download full JSON with metadata wrapper ─────────

  function download(questions, filename) {
    filename = filename || _defaultFilename();

    const payload = {
      metadata: {
        title:         'Quiz Question Bank',
        description:   'Exported from Quiz Editor',
        version:       '2.0',
        created:       new Date().toISOString().slice(0, 10),
        last_modified: new Date().toISOString().slice(0, 10),
        author:        '',
        license:       'CC BY-SA 4.0',
        total_questions: questions.length,
      },
      questions: questions,
    };

    const json = JSON.stringify(payload, null, 2);
    _triggerDownload(json, filename, 'application/json');
  }

  // ── Copy to clipboard ────────────────────────────────

  function copyToClipboard(questions) {
    const payload = {
      metadata: {
        title:           'Quiz Question Bank',
        version:         '2.0',
        last_modified:   new Date().toISOString().slice(0, 10),
        total_questions: questions.length,
      },
      questions: questions,
    };
    const json = JSON.stringify(payload, null, 2);
    return navigator.clipboard.writeText(json);
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

  return { download, copyToClipboard };

})();