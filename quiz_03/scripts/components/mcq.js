class MCQ_Component extends ParentComponent
{
    constructor() 
    {
        super('question-panel');
        this.id                 =   "question-panel";
        this.questionId         =   "mcq-question-text";
        this.optionsId          =   "mcq-options";
        this.questionElement    =   document.getElementById(this.questionId); 
        this.optionsContainer   =   document.getElementById(this.optionsId);   
    }

    setQuestion(qStatement)
    {
        this.questionElement.textContent = qStatement;
    }

    addOption(option_id, option_text)
    {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'mcq';
        input.id = option_id;
        input.value = option_id;
        
        const label = document.createElement('label');
        label.htmlFor = option_id;
        label.textContent = option_text;
        
        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        this.optionsContainer.appendChild(optionDiv);
    }

    setAnswer(value)
    {
        // document.getElementById(id).checked = true;
        // this.rootElement.querySelector(`input[name="mcq"][value="${value}"]`).checked = true;
        this.rootElement.querySelector(`input[type="radio"][value="${value}"]`).checked = true;
    }

    getAnswer() 
    {
        const selected = this.rootElement.querySelector('input[type="radio"]:checked');
        return selected ? selected.value : null;
    }

    reset()
    {
        this.questionElement.textContent    =   '';
        this.optionsContainer.innerHTML     =   '';
        this.hide();
    }
}