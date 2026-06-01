// editor/config.js

const EditorConfig = {

  SUPPORTED_TYPES: [
    {
      type: 'mcq',
      label: 'MCQ',
      description: 'Multiple choice, one correct answer',
      color: '#3498db',
    },
    {
      type: 'true_false',
      label: 'True / False',
      description: 'Simple true or false question',
      color: '#f7a24f',
    },
    {
      type: 'fill_in_blank',
      label: 'Fill in Blank',
      description: 'Type the answer in a blank',
      color: '#27ae7a',
    },
    {
      type: 'multi_fill_in_blank',
      label: 'Multi Fill Blank',
      description: 'Multiple blanks in one question',
      color: '#1a8a8a',
    },
    {
      type: 'options_fill_in_blank',
      label: 'Options Fill Blank',
      description: 'Fill blanks by choosing from options',
      color: '#8e44ad',
    },
    {
      type: 'table_fill_in_the_blank',
      label: 'Table Fill Blank',
      description: 'Fill in blanks inside a table',
      color: '#2980b9',
    },
    {
      type: 'table_image_fill_in_the_blank',
      label: 'Table Image Fill',
      description: 'Table with images and fill blanks',
      color: '#1a5f8a',
    },
    {
      type: 'short_answer',
      label: 'Short Answer',
      description: 'Free text short answer question',
      color: '#7f8c8d',
    },
    {
      type: 'matching',
      label: 'Matching',
      description: 'Match items from two columns',
      color: '#d4a017',
    },
    {
      type: 'matching_select',
      label: 'Matching Select',
      description: 'Match by selecting from dropdowns',
      color: '#c0892a',
    },
    {
      type: 'matching_connection',
      label: 'Matching Connection',
      description: 'Draw lines to connect matching pairs',
      color: '#b7530a',
    },
    {
      type: 'matching_connection_image',
      label: 'Match Connection Image',
      description: 'Connect matching image pairs with lines',
      color: '#a04000',
    },
    {
      type: 'ordering',
      label: 'Ordering',
      description: 'Arrange items in correct sequence',
      color: '#e91e8c',
    },
    {
      type: 'ordering_horizontal',
      label: 'Ordering Horizontal',
      description: 'Arrange items left to right in order',
      color: '#c2185b',
    },
    {
      type: 'compare_quantities',
      label: 'Compare Quantities',
      description: 'Compare two quantities with a symbol',
      color: '#4f86f7',
    },
    {
      type: 'image_compare_quantities_tick',
      label: 'Image Compare Tick',
      description: 'Tick the image with greater quantity',
      color: '#1565c0',
    },
    {
      type: 'multi_select',
      label: 'Multi Select',
      description: 'Multiple correct answers from a list',
      color: '#e05555',
    },
    {
      type: 'multi_select_circle',
      label: 'Multi Select Circle',
      description: 'Select multiple items shown as circles',
      color: '#b71c1c',
    },
    {
      type: 'multi_select_two',
      label: 'Multi Select Two',
      description: 'Highlight items by two categories',
      color: '#880e4f',
    },
    {
      type: 'fill_in_blank_multi_graph',
      label: 'Fill Blank Graph',
      description: 'Fill blanks in a multi-node graph',
      color: '#00838f',
    },
    {
      type: 'fill_in_blank_operation',
      label: 'Fill Operation',
      description: 'Fill in a math operation grid',
      color: '#006064',
    },
    {
      type: 'number_line_arcs',
      label: 'Number Line',
      description: 'Arc based number line question',
      color: '#4527a0',
    },
    {
      type: 'clock_set_time',
      label: 'Clock',
      description: 'Set time on a clock face',
      color: '#2e7d32',
    },
  ],

  // ── Skip type config ────────────────────────────────
  // "skip" is not a creatable type but questions can be
  // marked as skip. The original_type is preserved in JSON.
  SKIP_TYPE: 'skip',

  // ── Difficulty levels ───────────────────────────────
  DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'],

  // ── Default templates per type ──────────────────────
  DEFAULTS: {
    mcq: {
      type: 'mcq',
      question: '',
      svg_content: '',
      img_url: '',
      options: [],
      correct_answer: '',
      user_response: '',
      explanation: '',
      difficulty: 'easy',
      tags: [],
      points: '',
      time_limit: '',
    },
    true_false: {
      type: 'true_false',
      question: '',
      svg_content: '',
      img_url: '',
      correct_answer: '',   // true | false | '' (unset)
      user_response: '',
      explanation: '',
      difficulty: 'easy',
      tags: [],
      points: '',
      time_limit: '',
    },
    multi_select: {
      type: 'multi_select',
      question: '',
      svg_content: '',
      img_url: '',
      options: [],
      user_response: [],
      explanation: '',
      difficulty: 'easy',
      tags: [],
      points: '',
      time_limit: '',
    },
  },

  // ── localStorage key ────────────────────────────────
  STORAGE_KEY: 'quiz_editor_draft',

  // ── Helper: get config for a type ───────────────────
  getType(typeString) {
    return EditorConfig.SUPPORTED_TYPES.find(t => t.type === typeString) || null;
  },

};