class TrueFalseComponent extends ParentComponent 
{
    constructor() 
    {
        super('tf-question');
        this.id = "tf-question";
        this.questionId = "tf-question-text";
        this.trueOptionId = "true-option";
        this.falseOptionId = "false-option";
        this.questionElement = document.getElementById(this.questionId);
        this.trueOption = document.getElementById(this.trueOptionId);
        this.falseOption = document.getElementById(this.falseOptionId);
    }

    setQuestion(qStatement) 
    {
        this.questionElement.textContent = qStatement;
    }

    setAnswer(value) 
    {
        if (value === true || value === "true") 
        {
            this.trueOption.checked = true;
        } 
        else if (value === false || value === "false") 
        {
            this.falseOption.checked = true;
        }
    }

    getAnswer() 
    {
        if (this.trueOption.checked) return true;
        else if (this.falseOption.checked) return false;
        else return null;
    }

    reset() 
    {
        this.questionElement.textContent = '';
        this.trueOption.checked = false;
        this.falseOption.checked = false;
        this.hide();
    }
}