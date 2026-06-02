// editor/editor_form_registry.js

const EditorFormRegistry = {

  _registry: {},

  // ── Register a question type ─────────────────────────
  // formTag    — the editor custom element tag e.g. 'mcq-form'
  //              pass null if no editor form exists yet
  // previewTag — the quiz component tag e.g. 'mcq-radio'
  //              pass null if no preview component exists

  register(type, formTag, previewTag) {
    this._registry[type] = {
      formTag:    formTag    || null,
      previewTag: previewTag || null,
    };
  },

  // ── Lookups ──────────────────────────────────────────

  getFormTag(type) {
    return this._registry[type]?.formTag || null;
  },

  getPreviewTag(type) {
    return this._registry[type]?.previewTag || null;
  },

  hasForm(type) {
    return !!this._registry[type]?.formTag;
  },

  hasPreview(type) {
    return !!this._registry[type]?.previewTag;
  },

};

// ── Register all question types ───────────────────────
//
// Columns:
//   type string          | editor form tag          | quiz preview tag
//
// Add a new row here when implementing a new question type.
// editor_panel/component.js never needs to be touched.

EditorFormRegistry.register('mcq',                              'mcq-form',            'mcq-radio');
EditorFormRegistry.register('true_false',                       'true-false-form',     'true-false');
EditorFormRegistry.register('multi_select',                     'multi-select-form',   'multi-select');
EditorFormRegistry.register('short_answer',                     'short-answer-form',   'short-answer');
EditorFormRegistry.register('fill_in_blank',                    'fill-in-blank-form',  'fill-in-blank');
EditorFormRegistry.register('ordering',                         'ordering-form',            'ordering-drag-drop');
EditorFormRegistry.register('ordering_horizontal',               'ordering-horizontal-form', 'ordering-horizontal-drag-click');

// ── Forms not yet implemented (preview only) ──────────
EditorFormRegistry.register('multi_fill_in_blank',              null,  'multi-fill-in-blank');
EditorFormRegistry.register('options_fill_in_blank',            null,  'options-fill-in-blank');
EditorFormRegistry.register('table_fill_in_the_blank',          null,  'table-fill-in-the-blank');
EditorFormRegistry.register('table_image_fill_in_the_blank',    null,  'table-image-fill-in-the-blank');
EditorFormRegistry.register('table_image_fill_in_the_blank_2_col', null, 'table-image-fill-in-the-blank');
EditorFormRegistry.register('matching',                         null,  'matching-dropdown');
EditorFormRegistry.register('matching_select',                  null,  'matching-select');
EditorFormRegistry.register('matching_drag_drop',               null,  'matching-select');
EditorFormRegistry.register('matching_connection',              null,  'matching-connection');
EditorFormRegistry.register('matching_connection_image',        null,  'matching-connection-image');
EditorFormRegistry.register('compare_quantities',               null,  'compare-quantities');
EditorFormRegistry.register('image_compare_quantities_tick',    null,  'compare-image-objects');
EditorFormRegistry.register('multi_select_circle',              null,  'multi-select-circle');
EditorFormRegistry.register('multi_select_two',                 null,  'multi-select-two');
EditorFormRegistry.register('fill_in_blank_multi_graph',        null,  'fill-in-blank-multi-graph-text');
EditorFormRegistry.register('fill_in_blank_multi_graph_text',   null,  'fill-in-blank-multi-graph-text');
EditorFormRegistry.register('fill_in_blank_operation',          null,  'fill-in-blank-operation');
EditorFormRegistry.register('number_line_arcs',                 null,  'number-line-arcs');
EditorFormRegistry.register('clock_set_time',                   null,  'clock-set-time');