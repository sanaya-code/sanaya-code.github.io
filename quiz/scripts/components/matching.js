class MatchingComponent extends ParentComponent {
    constructor() {
        super('matching-question', 'matching-geometry-figure');
        this.id = "matching-question";
        this.questionId = "matching-question-text";
        this.pairsContainerId = "matching-pairs";
        this.questionElement = document.getElementById(this.questionId);
        this.pairsContainer = document.getElementById(this.pairsContainerId);
    }

    setQuestion(qStatement) 
    {
        this.questionElement.textContent = qStatement;
    }

    addPair(leftText, rightOptions, distractorOptions = []) 
    {
        const pairDiv = document.createElement('div');
        pairDiv.className = 'matching-pair';

        const leftDiv = document.createElement('div');
        leftDiv.className = 'matching-left';
        leftDiv.textContent = leftText;
        pairDiv.appendChild(leftDiv);

        const select = document.createElement('select');
        select.className = 'matching-select';

        // Add default empty option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select match";
        select.appendChild(defaultOption);

        // Add all options (correct + distractors)
        [...rightOptions, ...distractorOptions].forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });

        pairDiv.appendChild(select);
        this.pairsContainer.appendChild(pairDiv);
    }

    setAnswer(answers) {
        const selects = this.pairsContainer.querySelectorAll('select');
        selects.forEach((select, index) => {
            if (answers[index]) {
                select.value = answers[index];
            } else {
                select.selectedIndex = 0; // Reset to "Select match"
            }
        });
    }

    getAnswer() {
        const val = Array.from(this.pairsContainer.querySelectorAll('select'))
        .map(select => select.value || null)

        if (val.some(element => element === null)) 
        {
            return(null);
        }

        return val ;
    }

    reset() {
        this.questionElement.textContent    =   '';
        this.pairsContainer.innerHTML       =   '';
        this.svgContainer.innerHTML         =   '';
        this.svgContainer.style.display     =   'none';
        this.hide();
    }
}