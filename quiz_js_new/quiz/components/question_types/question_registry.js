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