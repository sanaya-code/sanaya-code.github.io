class TrueFalseComponent extends HTMLElement {
    constructor() {
        super();
        this._initialized = false;
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
        if (this._initialized) return;

        this.innerHTML = `
            <div class="question-type">
                <div class="question-text"></div>
                <div class="svg-figure" style="display: none;"></div>
                <div class="figure" style="display: none;"></div>
                <div class="options-container">
                    <div class="option">
                        <input type="radio" name="trueFalse" value="true">
                        <label>True</label>
                    </div>
                    <div class="option">
                        <input type="radio" name="trueFalse" value="false">
                        <label>False</label>
                    </div>
                </div>
            </div>
        `;

        this.questionEl = this.querySelector('.question-text');
        this.svgContainer = this.querySelector('.svg-figure');
        this.imgContainer = this.querySelector('.figure');
        this._initialized = true;
    }

    updateFromConfig() {
        try {
            const config = JSON.parse(this.getAttribute('config') || '{}');
            const { question, svg_content, img_url, user_response } = config;

            this.questionEl.textContent = question || '';
            this.addSvg(svg_content);
            this.addImg(img_url);
            this.setUserResponse(user_response);
        } catch (e) {
            console.error('Invalid config JSON in <true-false>', e);
        }
    }

    setUserResponse(value) {
        const options = this.querySelectorAll('input[type="radio"]');
        options.forEach(opt => {
            opt.checked = (opt.value === value);
        });
    }

    getUserAnswer() {
        const selected = this.querySelector('input[type="radio"]:checked');
        return selected ? selected.value : null;
    }

    addImg(img_url) {
        if (img_url) {
            this.imgContainer.innerHTML = `<img src="${img_url}" alt="Figure" />`;
            this.imgContainer.style.display = '';
        } else {
            this.imgContainer.innerHTML = '';
            this.imgContainer.style.display = 'none';
        }
    }

    addSvg(svg_content) {
        if (svg_content) {
            this.svgContainer.innerHTML = svg_content;
            this.svgContainer.style.display = '';
        } else {
            this.svgContainer.innerHTML = '';
            this.svgContainer.style.display = 'none';
        }
    }

    disconnectedCallback() {
        this.innerHTML = '';
        this._initialized = false;
    }
}

customElements.define('true-false', TrueFalseComponent);



/*

<true-false
  config='{
    "question": "The earth revolves around the sun.",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 130 130\"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }</style><circle cx=\"65\" cy=\"65\" r=\"50\" class=\"line\"/></svg>",
    "img_url": "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
     "user_response": "true"
  }'>
</true-false>


function test() {
    // 1. Create the element
    const tfEl = document.createElement('true-false');

    // 2. Build config with question + response
    const config = {
        question: "The Earth is flat.",
        svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; } .line-blue { stroke: blue; stroke-width: 1.5; fill: none; } .point { font-family: Arial; font-size: 10px; font-weight: bold; } .angle-fill { fill: rgba(100,200,255,0.3); stroke: none; } .point-marker { fill: red; r: 2; } .angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
        img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
        user_response: "false"
    };

    // 3. Set config attribute
    tfEl.setAttribute('config', JSON.stringify(config));

    // 4. Append to the DOM
    document.getElementById("quiz").appendChild(tfEl);

    // 5. Fetch selected answer later
    setTimeout(() => {
        const answer = tfEl.getUserAnswer();
        console.log("User selected:", answer); // "true" or "false"
    }, 5000);
}

test();


*/