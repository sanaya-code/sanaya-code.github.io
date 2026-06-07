// editor/editor_form_registry.js
//
// Single registration per question type.
// Adding a new type: add ONE register() call here + 2 files
// (form component + style) + 4 lines in editor.html.
// Nothing else needs to change.

const EditorFormRegistry = {

  _registry: {},

  // ── Register ─────────────────────────────────────────

  register(type, config) {
    this._registry[type] = {
      label:      config.label       || type,
      description:config.description || '',
      color:      config.color       || '#3498db',
      formTag:    config.formTag     || null,
      previewTag: config.previewTag  || null,
      default:    config.default     || { type, question: '' },
    };
  },

  // ── Lookups ──────────────────────────────────────────

  getType(type) {
    return this._registry[type] || null;
  },

  getFormTag(type) {
    return this._registry[type]?.formTag || null;
  },

  getPreviewTag(type) {
    return this._registry[type]?.previewTag || null;
  },

  getDefault(type) {
    const def = this._registry[type]?.default;
    return def ? JSON.parse(JSON.stringify(def)) : { type, question: '' };
  },

  // Returns all registered types as an array (for type selector grid)
  getAllTypes() {
    return Object.entries(this._registry).map(([type, cfg]) => ({
      type,
      label:       cfg.label,
      description: cfg.description,
      color:       cfg.color,
    }));
  },

  hasForm(type)    { return !!this._registry[type]?.formTag;    },
  hasPreview(type) { return !!this._registry[type]?.previewTag; },

};

// ── Register all question types ───────────────────────
//
// To add a new type: add one register() call below.
// formTag:    the editor form custom element tag  (null = not yet built)
// previewTag: the quiz preview component tag      (null = not yet built)
// default:    the blank JSON template for this type

EditorFormRegistry.register('mcq', {
  label:       'MCQ',
  description: 'Multiple choice, one correct answer',
  color:       '#3498db',
  formTag:     'mcq-form',
  previewTag:  'mcq-radio',
  default: {
    type: 'mcq', question: '', svg_content: '', img_url: '',
    options: [], correct_answer: '', user_response: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('true_false', {
  label:       'True / False',
  description: 'Simple true or false question',
  color:       '#f7a24f',
  formTag:     'true-false-form',
  previewTag:  'true-false',
  default: {
    type: 'true_false', question: '', svg_content: '', img_url: '',
    correct_answer: '', user_response: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('multi_select', {
  label:       'Multi Select',
  description: 'Multiple correct answers from a list',
  color:       '#e05555',
  formTag:     'multi-select-form',
  previewTag:  'multi-select',
  default: {
    type: 'multi_select', question: '', svg_content: '', img_url: '',
    options: [], user_response: [],
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('short_answer', {
  label:       'Short Answer',
  description: 'Free text short answer question',
  color:       '#7f8c8d',
  formTag:     'short-answer-form',
  previewTag:  'short-answer',
  default: {
    type: 'short_answer', question: '', svg_content: '', img_url: '',
    correct_answer: '', acceptable_variations: [], user_response: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('fill_in_blank', {
  label:       'Fill in Blank',
  description: 'Type the answer in a blank',
  color:       '#27ae7a',
  formTag:     'fill-in-blank-form',
  previewTag:  'fill-in-blank',
  default: {
    type: 'fill_in_blank', question: '', svg_content: '', img_url: '',
    correct_answer: '', acceptable_answers: [], user_response: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('ordering', {
  label:       'Ordering',
  description: 'Arrange items in correct sequence',
  color:       '#e91e8c',
  formTag:     'ordering-form',
  previewTag:  'ordering-drag-drop',
  default: {
    type: 'ordering', question: '', svg_content: '', img_url: '',
    items: [], correct_order: [], user_response: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('ordering_horizontal', {
  label:       'Ordering Horizontal',
  description: 'Arrange items left to right in order',
  color:       '#c2185b',
  formTag:     'ordering-horizontal-form',
  previewTag:  'ordering-horizontal-drag-click',
  default: {
    type: 'ordering_horizontal', question: '', svg_content: '', img_url: '',
    items: [], correct_order: [], initial_items: [], user_response: [],
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('multi_fill_in_blank', {
  label: 'Multi Fill Blank', description: 'Multiple blanks in one question',
  color: '#1a8a8a', formTag: 'multi-fill-in-blank-form', previewTag: 'multi-fill-in-blank',
  default: { type: 'multi_fill_in_blank', question: '', svg_content: '', img_url: '',
    blanks: [], user_response: [], explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('options_fill_in_blank', {
  label: 'Options Fill Blank', description: 'Fill blanks by choosing from options',
  color: '#8e44ad', formTag: 'options-fill-in-blank-form', previewTag: 'options-fill-in-blank',
  default: { type: 'options_fill_in_blank', question: '', svg_content: '', img_url: '',
    options: [], user_response: [], explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('table_fill_in_the_blank', {
  label: 'Table Fill Blank', description: 'Fill in blanks inside a table',
  color: '#2980b9', formTag: 'table-fill-in-the-blank-form', previewTag: 'table-fill-in-the-blank',
  default: { type: 'table_fill_in_the_blank', question: '', svg_content: '', img_url: '',
    title: '', column_labels: ['C1', 'C2'], row_labels: ['R1', 'R2'],
    data: [[{value:''},{value:''}],[{value:''},{value:''}]],
    user_response: [], scoring_method: 'exact', case_sensitive: false,
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('table_image_fill_in_the_blank', {
  label: 'Table Image Fill', description: 'Table with images and fill blanks',
  color: '#1a5f8a', formTag: 'table-image-fill-in-blank-form', previewTag: 'table-image-fill-in-the-blank',
  default: { type: 'table_image_fill_in_the_blank', question: '', svg_content: '', img_url: '',
    columns: 3,
    column_headings: { image: 'Visual', count: 'Count (Digit)', word: 'Number Name' },
    rows: [],
    user_response: [],
    validation: { case_sensitive: false, scoring_method: 'exact' },
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('table_image_fill_in_the_blank_2_col', {
  label: 'Table Image Fill 2col', description: 'Two-column table image fill',
  color: '#1a5f8a', previewTag: 'table-image-fill-in-the-blank',
  default: { type: 'table_image_fill_in_the_blank_2_col', question: '', svg_content: '', img_url: '',
    table: [], user_response: [], explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('matching', {
  label: 'Matching', description: 'Match items from two columns',
  color: '#d4a017', formTag: 'matching-form', previewTag: 'matching-dropdown',
  default: { type: 'matching', question: '', svg_content: '', img_url: '',
    pairs: [], user_response: [], explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('matching_select', {
  label: 'Matching Select', description: 'Match by selecting from dropdowns',
  color: '#c0892a', formTag: 'matching-select-form', previewTag: 'matching-select',
  default: { type: 'matching_select', question: '', svg_content: '', img_url: '',
    pairs: [], distractors: [], user_response: '',
    scoring_method: 'exact', description: '', case_sensitive: false,
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('matching_drag_drop', {
  label: 'Matching Drag Drop', description: 'Match by dragging items',
  color: '#b7530a', previewTag: 'matching-select',
  default: { type: 'matching_drag_drop', question: '', svg_content: '', img_url: '',
    pairs: [], user_response: [], explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('matching_connection', {
  label: 'Matching Connection', description: 'Draw lines to connect matching pairs',
  color: '#a04000', formTag: 'matching-connection-form', previewTag: 'matching-connection',
  default: { type: 'matching_connection', question: '', svg_content: '', img_url: '',
    pairs: [], user_response: '', scoring_method: 'exact',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('matching_connection_image', {
  label: 'Match Connection Image', description: 'Connect matching image pairs',
  color: '#7b3000',
  formTag:    'matching-connection-image-form',
  previewTag: 'matching-connection-image',
  default: {
    type: 'matching_connection_image', question: '', svg_content: '', img_url: '',
    rows: [],
    properties_column: [],
    user_response: [],
    validation: {
      scoring_method: 'exact',
      allow_multiple_connections: false,
      line_colors: ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#ffa500', '#ffffff'],
    },
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('compare_quantities', {
  label: 'Compare Quantities', description: 'Compare two quantities with a symbol',
  color: '#4f86f7', formTag: 'compare-quantities-form', previewTag: 'compare-quantities',
  default: { type: 'compare_quantities', question: '', svg_content: '', img_url: '',
    left: '', right: '', correct_answer: '', user_response: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('image_compare_quantities_tick', {
  label: 'Image Compare Tick', description: 'Tick the image with greater quantity',
  color: '#1565c0', formTag: 'compare-image-objects-form', previewTag: 'compare-image-objects',
  default: { type: 'image_compare_quantities_tick', question: '', svg_content: '', img_url: '',
    items: [], correct_answer: '', user_response: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('multi_select_circle', {
  label: 'Multi Select Circle', description: 'Select multiple items shown as circles',
  color: '#b71c1c', formTag: 'multi-select-circle-form', previewTag: 'multi-select-circle',
  default: { type: 'multi_select_circle', question: '', svg_content: '', img_url: '',
    options: [], user_response: '', minimum_selections: 1, maximum_selections: null,
    scoring_method: 'exact', explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('multi_select_two', {
  label: 'Multi Select Two', description: 'Highlight items by two categories',
  color: '#880e4f', formTag: 'multi-select-two-form', previewTag: 'multi-select-two',
  default: {
    type: 'multi_select_two', question: '', svg_content: '', img_url: '',
    quantities: [], required_selections: [], correct_answer: {}, user_response: {},
    scoring_method: 'exact', case_sensitive: false,
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '',
  },
});

EditorFormRegistry.register('fill_in_blank_multi_graph', {
  label: 'Fill Blank Graph', description: 'Fill blanks in a multi-node graph',
  color: '#00838f', formTag: 'fill-in-blank-multi-graph-form', previewTag: 'fill-in-blank-multi-graph-text',
  default: { type: 'fill_in_blank_multi_graph', question: '', svg_content: '', img_url: '',
    center_label: '', blocks: [], value_choices: [], correct_answer: [], user_response: [],
    scoring_method: 'exact', description: '', case_sensitive: false,
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('fill_in_blank_multi_graph_text', {
  label: 'Fill Blank Graph Text', description: 'Fill blanks in a text graph',
  color: '#006064', previewTag: 'fill-in-blank-multi-graph-text',
  default: { type: 'fill_in_blank_multi_graph_text', question: '', svg_content: '', img_url: '',
    nodes: [], user_response: [], explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('fill_in_blank_operation', {
  label: 'Fill Operation', description: 'Fill in a math operation grid',
  color: '#006064', formTag: 'fill-in-blank-operation-form', previewTag: 'fill-in-blank-operation',
  default: { type: 'fill_in_blank_operation', question: '', svg_content: '', img_url: '',
    operation: { name: '', symbol: '' },
    editable_answer: {}, initial_answer: {}, correct_answer: {}, user_response: {},
    choices: [], scoring_method: 'exact', case_sensitive: false, description: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});

EditorFormRegistry.register('number_line_arcs', {
  label: 'Number Line', description: 'Arc based number line question',
  color: '#4527a0',
  formTag:    'number-line-arcs-form',
  previewTag: 'number-line-arcs',
  default: {
    type: 'number_line_arcs', question: '', svg_content: '', img_url: '',
    points: [], pairs: [], user_response: [],
    explanation: '', description: '',
    metadata: {
      difficulty: 'easy', points: '', time_limit: '',
      tags: [], scoring_method: 'exact', scoring_method_01: '',
      case_sensitive: false,
    },
  },
});

EditorFormRegistry.register('clock_set_time', {
  label: 'Clock', description: 'Set time on a clock face',
  color: '#2e7d32', previewTag: 'clock-set-time',
  default: { type: 'clock_set_time', question: '', svg_content: '', img_url: '',
    correct_answer: '', user_response: '',
    explanation: '', difficulty: 'easy', tags: [], points: '', time_limit: '' },
});