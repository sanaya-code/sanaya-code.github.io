// editor/utils/json_loader.js

const JsonLoader = (() => {

  // ── Load from file picker ────────────────────────────
  // Returns a Promise that resolves to a questions array

  function loadFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file provided'));

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const questions = _parse(e.target.result);
          resolve(questions);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // ── Load from raw JSON string ────────────────────────

  function loadFromString(str) {
    return _parse(str);
  }

  // ── Parse: handles bare array or { questions: [] } ──

  function _parse(str) {
    let data;
    try {
      data = JSON.parse(str);
    } catch (e) {
      throw new Error('Invalid JSON: ' + e.message);
    }

    // Bare array format: [ {...}, {...} ]
    if (Array.isArray(data)) {
      return data;
    }

    // Wrapped format: { metadata: {}, questions: [...] }
    if (data && Array.isArray(data.questions)) {
      return data.questions;
    }

    throw new Error(
      'Unrecognised JSON format. Expected an array or { questions: [] }.'
    );
  }

  return { loadFromFile, loadFromString };

})();