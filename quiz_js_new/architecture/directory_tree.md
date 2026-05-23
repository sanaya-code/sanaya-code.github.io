
inside pages/ dir we have one directory for each page(view)

View switching: When swapping views in main.html,  inject/remove dynamically. Cleaner DOM, no hidden bloat, each view loads only when needed.

pages/ directory, Each page folder owns everything specific to it.

```



quiz_app/
│
├── home/
│   ├── index.html                             	# Home page entry point
│   ├── style.css                              	# Home page styles
│   ├── page.js                                # <home-page> HTMLElement
│   ├── config.js                              	# Home page constants (URLs, storage keys)
│   ├── controller.js                          	# Boots home page, injects components
│   ├── event_handler.js                       	# All home page event listeners
│   │
│   ├── storage/
│   │   └── session_storage_service.js         	# Writes quizData to sessionStorage
│   │
│   ├── utils/
│   │   ├── file_reader.js                     	# Reads uploaded local JSON quiz file
│   	├── remote_json_loader.js              	# Fetch + cache remote JSON (async/await)
│   │   └── browser_environment.js             	# Detects file:/// vs server mode
│   │
│   └── components/
│       ├── subjects_list/
│       │   ├── component.js                   	# grade-subjects custom element
│       │   └── style.css                      	# Grade/subject selector styles
│       │
│       ├── topic_selector/
│       │   ├── component.js                   	# topic-selector custom element
│       │   └── style.css                 	   	# Topic grid card styles
│       │
│       └── custom_quiz_loader/                	# Custom JSON upload component
│           ├── component.js                   	# <custom-quiz-loader> HTMLElement
│           └── style.css                      	# Upload component styles
│
└── quiz/
    ├── index.html                              # Quiz page entry point
    ├── page.js                                # <quiz-page> HTMLElement
    ├── style.css                               # Quiz page styles
    ├── config.js                               # Quiz page constants (storage keys)
    ├── controller.js                           # Boots quiz, manages state, navigation
    ├── event_handler.js                        # All quiz page event listeners
    ├── quiz_state.js                           # Quiz runtime state (current Q, answers)
    │
    ├── storage/
    │   └── session_storage_service.js         	# Reads quizData from sessionStorage
    │
    ├── utils/
    │   └── quiz_result_evaluator.js           	# Evaluates answers, builds result object
    │   ├── question-loader.js                 	# Builds question wrapper config
    │
    └── components/
        ├── question_wrapper/
        │   ├── question-wrapper.js            	# Wraps any question type, delegates getUserAnswer()
        │   └── question-wrapper.css           	# Wrapper layout styles
        │
        ├── navigation_panel/
        │   ├── component.js            	  	# Prev/Next/Submit/Mark buttons custom element
        │   ├── controller.js                  	# Controls navigation events
        │   └── style.css           			# Navigation panel styles
        │
        ├── index_panel/
        │   ├── component.js                 	# Question index grid custom element
        │   ├── controller.js                  	# Controls navigation events
        │   └── style.css                		# Answered/unanswered state styles
        │
        ├── result_modal/
        │   ├── component.js                  	# Result modal custom element
        │   ├── controller.js                  	# Controls navigation events
        │   ├── answer-review-builder.js        # Builds review data
        │   ├── result-builder.js               # Builds result before redirect
        │   └── style.css                      	# Modal styles
        │
        └── question_types/
            ├── question_registry.js           	# Maps question type string → component tag
            ├── mcq_question/
            │   ├── component.js               	# MCQ radio button custom element
            │   ├── evaluator.js               	# Checks MCQ answer against correct answer
            │   └── style.css                  	# MCQ option styles
            ├── matching_question/
            │   ├── component.js               	# Matching select dropdown custom element
            │   ├── evaluator.js               	# Checks matching pairs answer
            │   └── style.css                  	# Matching component styles
            ├── fill_in_blank_operation/
            │   ├── component.js
            │   ├── evaluator.js
            │   └── style.css
            ├── multi_select_two/
            │   ├── component.js
            │   ├── evaluator.js
            │   └── style.css
            └── (one directory per question type...)


```
