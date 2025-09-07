class FillInBlankMultiOptions extends HTMLElement {
  constructor() {
    super();
    this.data = null;
    this.activeChoice = null; // track selected choice
  }

  connectedCallback() {
    this.data = JSON.parse(this.getAttribute("config"));

    // Initialize user_response if missing
    if (!Array.isArray(this.data.user_response)) {
      this.data.user_response = this.data.options.map(() => "");
    }

    this.render();
  }

  render() {
    this.innerHTML = `
    <div class="fibmo-question-type">
      <div class="fibmo-question">${this.data.question}</div>
      <div class="fibmo-container">
        ${this.data.svg_content ? `<div class="fibmo-svg">${this.data.svg_content}</div>` : ""}
        ${this.data.img_url ? `<div class="fibmo-img"><img src="${this.data.img_url}" /></div>` : ""}
        <div class="fibmo-options">
          ${this.data.options
            .map(
              (opt, idx) => `
              <div class="fibmo-option" data-index="${idx}">
                  ${opt.text.replace(
                    "____",
                    `<span class="fibmo-blank ${this.data.user_response[idx] ? "filled" : ""}" data-index="${idx}">
                        ${this.data.user_response[idx] || "___"}
                    </span>`
                  )}
              </div>`
            )
            .join("")}
        </div>
      </div>
      ${
        this.data.choices
          ? `<div class="fibmo-choices">
              ${this.data.choices
                .map(
                  (ch) =>
                    `<span class="fibmo-choice" data-value="${ch}">${ch}</span>`
                )
                .join("")}
             </div>`
          : ""
      }
    </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Blank click -> turn into input (or apply choice if activeChoice exists)
    this.querySelectorAll(".fibmo-blank").forEach((blank) => {
      blank.addEventListener("click", (e) => {
        const idx = parseInt(blank.dataset.index);

        if (this.activeChoice) {
          // insert chosen value
          this.data.user_response[idx] = this.activeChoice;
          blank.outerHTML = `<span class="fibmo-blank filled" data-index="${idx}">${this.activeChoice}</span>`;
          this.clearActiveChoice();
          this.bindEvents(); // rebind after replacing element
        } else {
          // make editable input
          const input = document.createElement("input");
          input.type = "text";
          input.value = this.data.user_response[idx] || "";
          input.className = "fibmo-input";
          blank.replaceWith(input);
          input.focus();

          input.addEventListener("blur", () => {
            this.data.user_response[idx] = input.value.trim();
            const span = document.createElement("span");
            span.className = "fibmo-blank filled";
            span.dataset.index = idx;
            span.textContent = input.value || "___";
            input.replaceWith(span);
            this.bindEvents();
          });
        }
      });
    });

    // Choice click -> highlight
    this.querySelectorAll(".fibmo-choice").forEach((choice) => {
      choice.addEventListener("click", () => {
        this.clearActiveChoice();
        choice.classList.add("active");
        this.activeChoice = choice.dataset.value;
      });
    });
  }

  clearActiveChoice() {
    this.querySelectorAll(".fibmo-choice").forEach((c) =>
      c.classList.remove("active")
    );
    this.activeChoice = null;
  }

  getUserAnswer() {
    return this.data.user_response;
  }
}

customElements.define("options-fill-in-blank", FillInBlankMultiOptions);



  /*

function testOptionsFillInBlank() {
  const el = document.createElement('options-fill-in-blank');

  const configObj = {
    type: "options_fill_in_blank",
    id: "Q101",
    question: "Fill the blanks in each option below:",
    svg_content: "<svg width='100' height='50'><circle cx='25' cy='25' r='20' fill='skyblue' /></svg>",
    img_url: "https://via.placeholder.com/150",
    options: [
      { label: "a", text: "The capital of France is ____.", correct_answer: "Paris", acceptable_answers: ["paris"], hint: "City of lights" },
      { label: "b", text: "Water boils at ____ degrees Celsius.", correct_answer: "100", acceptable_answers: ["100", "one hundred"], hint: "Triple-digit boiling point" },
      { label: "c", text: "The square root of 9 is ____.", correct_answer: "3", acceptable_answers: ["three"], hint: "Single-digit result" }
    ],
    user_response: ["", "", ""],
    case_sensitive: false,
    difficulty: "easy",
    tags: ["gk", "science", "math"],
    points: 3,
    scoring_method: "exact",
    feedback: {
      full_credit: "Well done!",
      partial_credit: "You got some correct!",
      none: "Try again!"
    }
  };

  el.setAttribute('config', JSON.stringify(configObj));
  document.body.appendChild(el);

  // Wait 5 seconds, then log the responses
  setTimeout(() => {
    const answers = el.getUserAnswer();
    console.log("User responses:", answers);
  }, 5000);
}


  */