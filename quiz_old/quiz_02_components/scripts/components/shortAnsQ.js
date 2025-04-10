class ShortAnswerComponent extends ParentComponent 
{
    constructor() 
    {
        super('short-question', 'short-svg-figure', 'short-figure');
        this.id = "short-question";
        this.questionId = "short-question-text";
        this.answerTextareaId = "short-answer";
        this.questionElement = document.getElementById(this.questionId);
        this.answerTextarea = document.getElementById(this.answerTextareaId);
    }

    setQuestion(qStatement) 
    {
        this.questionElement.textContent = qStatement;
    }

    setAnswer(value) 
    {
        this.answerTextarea.value = value || '';
    }

    getAnswer() 
    {
        const val =  this.answerTextarea.value.trim();if(val === "")
        {
            return null;
        }
        return(val);
    }

    reset() 
    {
        this.questionElement.textContent    =   '';
        this.answerTextarea.value           =   '';
        this.svgContainer.innerHTML         =   '';
        this.svgContainer.style.display     =   'none';
        this.figContainer.style.display     =   'none';
        this.hide();
    }

}