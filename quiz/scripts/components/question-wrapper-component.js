// mcq(mcq-question), true_false(true-false), multi_select(multi-select)
// fill_in_blank(fill-in-blank), multi_fill_in_blank(multi-fill-in-blank)
// options_fill_in_blank(options-fill-in-blank)
// table_fill_in_the_blank(table-fill-in-the-blank)
// table_image_fill_in_the_blank(table-image-fill-in-the-blank)
// table_image_fill_in_the_blank_2_col(table-image-fill-in-the-blank-2-col)
// number_line_fill_in_blank(number-line-fill-in-blank)
// short_answer(short-answer),
// matching(matching-select), matching_drag_drop(matching-drag-drop)
// matching_connection(matching-connection)
// matching_connection_image(matching-connection-image)
// ordering(ordering-drag-drop)
// ordering_horizontal(ordering-horizontal-drag-click)
// compare_quantities(compare-quantities)
// image_compare_quantities_tick(compare-image-objects)

class QuestionWrapperComponent extends HTMLElement {
  static get observedAttributes() {
    return ['question-data'];
  }

  constructor() {
    super();
    this.currentComponent = null;

    // Component tag map for cleaner rendering logic
    this.typeToComponentMap = {
      // json_key_name: 'html_tag_name'
      mcq: 'mcq-radio',
      true_false: 'true-false',
      multi_select: 'multi-select',
      fill_in_blank: 'fill-in-blank',
      multi_fill_in_blank: 'multi-fill-in-blank',
      options_fill_in_blank: 'options-fill-in-blank',
      table_fill_in_the_blank:'table-fill-in-the-blank',
      table_image_fill_in_the_blank: 'table-image-fill-in-the-blank',
      table_image_fill_in_the_blank_2_col: 'table-image-fill-in-the-blank-2-col',
      number_line_fill_in_blank : 'number-line-fill-in-blank',
      short_answer: 'short-answer',
      matching: 'matching-select',
      matching_drag_drop: 'matching-drag-drop',
      matching_connection: 'matching-connection',
      matching_connection_image: 'matching-connection-image',
      ordering: 'ordering-drag-drop',
      ordering_horizontal : 'ordering-horizontal-drag-click',
      compare_quantities: 'compare-quantities',
      image_compare_quantities_tick: 'compare-image-objects'
    };
  }

  connectedCallback() {
    const dataAttr = this.getAttribute('question-data');
    if (dataAttr) {
      try {
        const parsed = JSON.parse(dataAttr);
        this.renderComponent(parsed);
      } catch (e) {
        console.error('Invalid JSON in question-data attribute:', e);
      }
    }
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'question-data' && newValue) {
      try {
        const parsed = JSON.parse(newValue);
        this.renderComponent(parsed);
      } catch (e) {
        console.error('Invalid JSON in question-data attribute:', e);
      }
    }
  }

  renderComponent(data) {
    // Validate data object and type field
    if (!data || typeof data !== 'object' || !data.type) {
      console.warn('Invalid or missing "type" in question data:', data);
      return;
    }

    const componentTag = this.typeToComponentMap[data.type];

    if (!componentTag) {
      console.warn(`Unknown question type: ${data.type}`);
      return;
    }

    // Cleanup previous component if exists
    if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
      this.currentComponent.cleanup();
    }

    if (this.currentComponent && this.contains(this.currentComponent)) {
      this.removeChild(this.currentComponent);
    }

    const component = document.createElement(componentTag);
    component.setAttribute('config', JSON.stringify(data));
    this.currentComponent = component;
    this.appendChild(component);
  }

  getUserAnswer() {
    if (this.currentComponent && typeof this.currentComponent.getUserAnswer === 'function') {
      return this.currentComponent.getUserAnswer();
    }
    console.warn(" component do not have getUserAnswer method");
    return null;
  }

  cleanup() {
    if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
      this.currentComponent.cleanup();
    }
    if (this.currentComponent && this.contains(this.currentComponent)) {
      this.removeChild(this.currentComponent);
    }
    this.currentComponent = null;
  }
}

customElements.define('question-wrapper', QuestionWrapperComponent);


/*

<question-wrapper
  question-data='{
    "type": "mcq",
    "question": "Which of the following are programming languages?",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 130 130\"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }</style><circle cx=\"65\" cy=\"65\" r=\"50\" class=\"line\"/></svg>",
    "img_url": "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
    "options": [
      { "id": "A", "text": "Python", "correct": true },
      { "id": "B", "text": "HTML", "correct": false },
      { "id": "C", "text": "Java", "correct": true }
    ],
    "user_response": ["A", "C"]
  }'>
</question-wrapper>



function test() {
    const wrapper = document.createElement('question-wrapper');
  
    const sampleQuestion = {
      type: 'mcq',
      question: 'Which of the following are programming languages?',
      svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
      img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
      options: [
        { id: 'A', text: 'Python', correct: true },
        { id: 'B', text: 'HTML', correct: false },
        { id: 'C', text: 'Java', correct: true }
      ],
      user_response: ['A', 'C']
    };
  
    wrapper.setAttribute('question-data', JSON.stringify(sampleQuestion));
    document.getElementById("quiz").appendChild(wrapper);
  
    // Example: getting the user answer later
    setTimeout(() => {
      console.log('User Answer:', wrapper.getUserAnswer());
    }, 5000);
  }
  

  test();




*/