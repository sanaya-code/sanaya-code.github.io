class FillInBlankComponent extends ParentComponent {
    constructor() {
        super('fill-question', 'fill-geometry-figure');
        this.id = "fill-question";
        this.questionId = "fill-question-text";
        this.answerInputId = "fill-answer";
        this.questionElement = document.getElementById(this.questionId);
        this.answerInput = document.getElementById(this.answerInputId);
    }

    setQuestion(qStatement) {
        this.questionElement.textContent = qStatement;
    }

    setAnswer(value) {
        this.answerInput.value = value;
    }

    getAnswer() {
        const val = this.answerInput.value.trim();
        if(val === "")
        {
            return null;
        }
        return(val);
    }

    reset() {
        this.questionElement.textContent    =   '';
        this.answerInput.value              =   '';
        this.svgContainer.innerHTML         =   '';
        this.svgContainer.style.display     =   'none';
        this.hide();
    }
}