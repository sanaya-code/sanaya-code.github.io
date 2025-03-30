class MultiSelectComponent extends ParentComponent 
{
    constructor() 
    {
        super('multi-question', 'multi-geometry-figure');
        this.id = "multi-question";
        this.questionId = "multi-question-text";
        this.optionsId = "multi-options";
        this.questionElement = document.getElementById(this.questionId);
        this.optionsContainer = document.getElementById(this.optionsId);
    }

    setQuestion(qStatement) 
    {
        this.questionElement.textContent = qStatement;
    }

    addOption(option_id, option_text, isCorrect) 
    {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        
        const input = document.createElement('input');
        input.type = 'checkbox';  // Multi-select uses checkboxes instead of radio buttons
        input.name = 'multi-select';  // Same name for all options in this question
        input.id = `multi-${option_id}`;  // Unique ID for each option
        input.value = option_id;
        
        const label = document.createElement('label');
        label.htmlFor = `multi-${option_id}`;
        label.textContent = option_text;
        
        // Add visual indicator for correct answers (optional)
        if (isCorrect) {
            label.classList.add('correct-option');
        }
        
        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        this.optionsContainer.appendChild(optionDiv);
    }

    setAnswer(selectedValues) 
    {
        // Clear all selections first
        this.optionsContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Set the selected values
        if (Array.isArray(selectedValues)) {
            selectedValues.forEach(value => {
                const checkbox = this.optionsContainer.querySelector(`input[type="checkbox"][value="${value}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }

    getAnswer() 
    {
        const checkedBoxes = this.optionsContainer.querySelectorAll('input[type="checkbox"]:checked');
        if(checkedBoxes.length == 0)
        {
            return(null);
        }
        return Array.from(checkedBoxes).map(checkbox => checkbox.value);
    }

    reset() 
    {
        this.questionElement.textContent    =   '';
        this.optionsContainer.innerHTML     =   '';
        this.svgContainer.innerHTML         =   '';
        this.svgContainer.style.display     =   'none';
        this.hide();
    }
}