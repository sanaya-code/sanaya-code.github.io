class ResultModalComponent extends ParentComponent 
{
    constructor() 
    {
        super('result-modal');
        this.id = "result-modal";
        this.detailsId = "result-details";
        this.modalElement = document.getElementById(this.id);
        this.detailsElement = document.getElementById(this.detailsId);
    }

    addAnalysis(qNo, qStatement, givenAnswer, correctAnswer, explanation, isCorrect) 
    {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        resultItem.innerHTML = `
            <p><strong>Question ${qNo}:</strong> ${qStatement}</p>
            <p><strong>Your answer:</strong> ${givenAnswer || 'Not answered'}</p>
            <p><strong>Correct answer:</strong> ${correctAnswer}</p>
            ${explanation ? `<p class="explanation"><strong>Explanation:</strong> ${explanation}</p>` : ''}
        `;
        
        this.detailsElement.appendChild(resultItem);
    }

    createSummary(scorePercentage, correctCount, totalQuestions) 
    {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'score-summary';
        summaryDiv.innerHTML = `
            <h3>Your Score: ${scorePercentage}%</h3>
            <p>${correctCount} out of ${totalQuestions} questions correct</p>
        `;
        
        // Insert at beginning of details element
        this.detailsElement.insertBefore(summaryDiv, this.detailsElement.firstChild);
    }

    show() 
    {
        this.modalElement.style.display = 'block';
    }

    hide() 
    {
        this.modalElement.style.display = 'none';
    }

    reset() 
    {
        this.detailsElement.innerHTML = '';
        this.hide();
    }
}