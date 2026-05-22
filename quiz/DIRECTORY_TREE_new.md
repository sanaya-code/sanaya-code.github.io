# Quiz App Directory Tree

```

quiz_app/
│
├── pages/
│   ├── home/
│   │   ├── home.html
│   │   ├── home.js
│   │   ├── home-controller.js
│   │   ├── home.css
│   │   ├── data_utils/
│   │   │   ├── custom-quiz-loader.js
│   │   │   └── home-navigation-data.js
│   │   └── components/
│   │       ├── grade_subjects/
│   │       │   ├── grade-subjects.js
│   │       │   ├── grade-subjects-controller.js
│   │       │   └── grade-subjects.css
│   │       └── topic_selector/
│   │           ├── topic-selector.js
│   │           ├── topic-selector-controller.js
│   │           └── topic-selector.css
│   │
│   ├── quiz/
│   │   ├── quiz.html
│   │   ├── quiz.js
│   │   ├── quiz-controller.js
│   │   ├── quiz-state.js
│   │   ├── quiz.css
│   │   ├── data_utils/
│   │   │   ├── quiz-data-loader.js
│   │   │   ├── quiz-source-resolver.js
│   │   │   ├── quiz-session-reader.js
│   │   │   └── quiz-session-writer.js
│   │   └── components/
│   │       ├── question_area/
│   │       │   ├── question-area.js
│   │       │   ├── question-area-controller.js
│   │       │   └── question-area.css
│   │       ├── navigation_panel/
│   │       │   ├── navigation-panel.js
│   │       │   ├── navigation-panel-controller.js
│   │       │   └── navigation-panel.css
│   │       ├── index_panel/
│   │       │   ├── index-panel.js
│   │       │   ├── index-panel-controller.js
│   │       │   └── index-panel.css
│   │       └── modal/
│   │           ├── modal.js
│   │           ├── modal-controller.js
│   │           └── modal.css
│   │
│   └── result/
│       ├── result.html
│       ├── result.js
│       ├── result-controller.js
│       ├── result.css
│       ├── data_utils/
│       │   ├── result-session-reader.js
│       │   ├── result-builder.js
│       │   ├── result-score-calculator.js
│       │   └── result-answer-formatter.js
│       └── components/
│           ├── result_summary/
│           │   ├── result-summary.js
│           │   ├── result-summary-controller.js
│           │   └── result-summary.css
│           └── question_review/
│               ├── question-review.js
│               ├── question-review-controller.js
│               └── question-review.css
│
├── question_types/
│   ├── _registry.js
│   ├── question_wrapper/
│   │   ├── question-wrapper.js
│   │   ├── question-wrapper-controller.js
│   │   └── question-wrapper.css
│   ├── mcq/
│   │   ├── index.js
│   │   ├── mcq-question.js
│   │   ├── mcq-evaluator.js
│   │   └── mcq.css
│   ├── multi_select_two/
│   │   ├── index.js
│   │   ├── multi-select-two.js
│   │   ├── multi-select-two-evaluator.js
│   │   └── multi-select-two.css
│   ├── compare_question/
│   │   ├── index.js
│   │   ├── compare-question.js
│   │   ├── compare-question-evaluator.js
│   │   └── compare-question.css
│   └── fill_in_blank_operation/
│       ├── index.js
│       ├── fill-in-blank-operation.js
│       ├── fill-in-blank-operation-evaluator.js
│       └── fill-in-blank-operation.css
│
├── shared/
│   ├── storage/
│   │   └── session-storage-service.js
│   ├── navigation/
│   │   └── page-navigation-service.js
│   └── utils/
│       └── helpers.js
│
├── config/
│   ├── app-config.js
│   └── routes.js
│
└── DIRECTORY_TREE.md



```


```

quiz_app/
│
├── pages/
│   ├── home/
│   │   ├── home.html
│   │   ├── home.js
│   │   ├── home.css
│   │   ├── grade-subjects.js            # only used on home page
│   │   ├── topic-selector.js            # only used on home page
│   │   └── shared.css                   # styles for above two components
│   │
│   ├── quiz/
│   │   ├── quiz.html
│   │   ├── quiz.js
│   │   ├── quiz-state.js
│   │   ├── quiz.css
│   │   ├── index_panel/
│   │   │   ├── index-panel.js
│   │   │   └── index-panel.css
│   │   └── modal/
│   │       ├── modal.js
│   │       └── modal.css
│   │
│   └── result/
│       ├── result.html
│       ├── result.js
│       ├── result-evaluator.js
│       └── result.css
│
├── js_components/
│   ├── _registry.js
│   ├── question_wrapper/
│   │   ├── question-wrapper.js
│   │   └── question-wrapper.css
│   └── question_types/
│       └── ... (same as before)
│
├── app/
│   ├── quiz-data-loader.js              # data fetching, shared across pages
│   └── router/
│       ├── router.js                    # core router - navigateTo(), back(), etc.
│       └── routes.js                    # route definitions - maps route names to page URLs
│                                        # e.g. { home: 'pages/home/home.html', 
│                                        #        quiz: 'pages/quiz/quiz.html',
│                                        #        result: 'pages/result/result.html' }
│
├── config/
│   └── app-config.js
│
└── utils/
    └── helpers.js

```
