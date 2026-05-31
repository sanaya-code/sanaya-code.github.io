const QuestionRegistry = {
    _registry: {},

    register(type, tag, evaluator) {
        this._registry[type] = { tag, evaluator };
    },

    getTag(type) {
        return this._registry[type]?.tag || null;
    },

    getEvaluator(type) {
        return this._registry[type]?.evaluator || null;
    },
};

// ── Register question types here ──────────────────────────
QuestionRegistry.register('mcq',                 'mcq-radio',          McqEvaluator);
QuestionRegistry.register('true_false',          'true-false',         TrueFalseEvaluator);
QuestionRegistry.register('multi_select',        'multi-select',       MultiSelectEvaluator);
QuestionRegistry.register('matching_drag_drop',  'matching-select',    MatchingSelectEvaluator);
QuestionRegistry.register('matching_select',     'matching-select',    MatchingSelectEvaluator);
QuestionRegistry.register('matching_connection', 'matching-connection', MatchingConnectionEvaluator);
QuestionRegistry.register('ordering_horizontal', 'ordering-horizontal-drag-click', OrderingHorizontalEvaluator);
QuestionRegistry.register('fill_in_blank_operation', 'fill-in-blank-operation', FillInBlankOperationEvaluator);
QuestionRegistry.register('compare_quantities', 'compare-quantities', CompareQuantitiesEvaluator);
QuestionRegistry.register('matching_connection_image', 'matching-connection-image', MatchingConnectionImageEvaluator);
QuestionRegistry.register('ordering', 'ordering-drag-drop', OrderingEvaluator);
QuestionRegistry.register('table_image_fill_in_the_blank', 'table-image-fill-in-the-blank', TableImageFillInBlankEvaluator);
QuestionRegistry.register('table_fill_in_the_blank', 'table-fill-in-the-blank', TableFillInBlankEvaluator);
QuestionRegistry.register('options_fill_in_blank', 'options-fill-in-blank', OptionsFillInBlankEvaluator);
QuestionRegistry.register('fill_in_blank_multi_graph_text', 'fill-in-blank-multi-graph-text', FillInBlankMultiGraphTextEvaluator);
QuestionRegistry.register('clock_set_time', 'clock-set-time', ClockSetTimeEvaluator);
QuestionRegistry.register('number_line_arcs', 'number-line-arcs', NumberLineArcsEvaluator);
QuestionRegistry.register('multi_select_circle', 'multi-select-circle', MultiSelectCircleEvaluator);
QuestionRegistry.register('multi_select_two', 'multi-select-two', MultiSelectTwoEvaluator);
QuestionRegistry.register('short_answer', 'short-answer', ShortAnswerEvaluator);
QuestionRegistry.register('matching',          'matching-dropdown', MatchingDropdownEvaluator);