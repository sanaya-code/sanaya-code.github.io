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
QuestionRegistry.register('mcq', 'mcq-radio', McqEvaluator);