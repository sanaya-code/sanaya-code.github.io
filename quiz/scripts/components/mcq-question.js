class McqQuestion extends HTMLElement {
    constructor() {
        super();
        this._optionsRendered = false;
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        this.ensureStructure();
        this.updateFromConfig();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config') {
            this.ensureStructure();
            this.updateFromConfig();
        }
    }

    ensureStructure() {
        if (!this._initialized) {
            this.innerHTML = `
                <div class="question-type question-panel mcq-question">
                    <div class="question-text"></div>
                    <div class="svg-figure" style="display: none;"></div>
                    <div class="figure" style="display: none;"></div>
                    <div class="options-container"></div>
                </div>
            `;
            const root = this.querySelector('.mcq-question');
            this._questionTextEl = root.querySelector('.question-text');
            this._svgFigureEl = root.querySelector('.svg-figure');
            this._imageFigureEl = root.querySelector('.figure');
            this._optionsEl = root.querySelector('.options-container');
            this._initialized = true;
        }
    }

    updateFromConfig() {
        let config = {};
        try {
            config = JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('Invalid config JSON:', e);
            return;
        }

        const {
            question = '',
            svg_content = null,
            img_url = null,
            options = [],
            user_response = null
        } = config;

        this.addQunStatement(question);
        this.addSvg(svg_content);
        this.addImg(img_url);
        this._renderOptions(options, user_response);
        this._optionsRendered = true;
    }

    addQunStatement(question) {
        this._questionTextEl.textContent = question;
    }

    addSvg(svg_content) {
        if (svg_content) {
            this._svgFigureEl.style.display = '';
            this._svgFigureEl.innerHTML = svg_content;
        } else {
            this._svgFigureEl.style.display = 'none';
            this._svgFigureEl.innerHTML = '';
        }
    }

    addImg(img_url) {
        if (img_url) {
            this._imageFigureEl.style.display = '';
            this._imageFigureEl.innerHTML = `<img src="${img_url}" alt="figure" />`;
        } else {
            this._imageFigureEl.style.display = 'none';
            this._imageFigureEl.innerHTML = '';
        }
    }

    _renderOptions(options, userResponse) {
        this._optionsEl.innerHTML = '';
        options.forEach(opt => {
            this.addOption(opt, userResponse);
        });
    }

    addOption(opt, userResponse) {
        const questionName = 'mcq'; // still safe for form grouping
        const optionHTML = `
            <div class="option">
                <input  type="radio" 
                        name="${questionName}" 
                        id="${opt.id}" 
                        value="${opt.id}"
                        ${(opt.id === userResponse) ? 'checked' : ''} >
                <label for="${opt.id}">${opt.text}</label>
            </div>
        `;
        this._optionsEl.insertAdjacentHTML('beforeend', optionHTML);
    }

    getUserAnswer() {
        if (!this._optionsRendered) return null;
        const selected = this.querySelector('input[type="radio"]:checked');
        return selected ? selected.value : null;
    }

    disconnectedCallback() {
        this.cleanup();
    }

    cleanup() {
        this.innerHTML = '';
        this._initialized = false;
        this._optionsRendered = false;
        this._questionTextEl = null;
        this._svgFigureEl = null;
        this._imageFigureEl = null;
        this._optionsEl = null;
    }
}

customElements.define('mcq-radio', McqQuestion);


/*

            <mcq-radio
                config='{
                    "question": "Which planet is the largest in our solar system?",
                    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 130 130\"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }</style><circle cx=\"65\" cy=\"65\" r=\"50\" class=\"line\"/></svg>",
                    "img_url": "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
                    "options": [
                        { "id": "A", "text": "Earth" },
                        { "id": "B", "text": "Mars" },
                        { "id": "C", "text": "Jupiter" }
                    ],
                    "user_response": "C"
                }'>
            </mcq-radio>


function test() {

    const mcqEl = document.createElement('mcq-radio');

    const configObj = {
        question: "Which planet is the largest in our solar system?",
        svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
        img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
        options: [
            { id: "A", text: "Earth" },
            { id: "B", text: "Mars" },
            { id: "C", text: "Jupiter" }
        ],
        user_response: "C"  
    };

    // Set only the config attribute
    mcqEl.setAttribute("config", JSON.stringify(configObj));

    // Append to DOM
    document.getElementById("quiz").appendChild(mcqEl);

    // Wait and log user's answer
    setTimeout(() => {
        const userAnswer = mcqEl.getUserAnswer();
        console.log("User's answer is:", userAnswer);
    }, 5000);
}

test();


*/