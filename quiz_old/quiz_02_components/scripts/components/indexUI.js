class IndexPanelComponent extends ParentComponent 
{
    constructor() {
        super('index-panel');
        this.id = "index-panel";
        this.gridId = "index-grid";
        this.panelElement = document.getElementById(this.id);
        this.gridElement = document.getElementById(this.gridId);
    }

    addQuestion(qIndex) 
    {
        const indexItem = document.createElement('div');
        indexItem.className = 'index-item not-answered';
        indexItem.dataset.index = qIndex;
        indexItem.textContent = qIndex + 1; // Display 1-based numbering
        
        // Add click handler to navigate to question
        indexItem.addEventListener('click', () => {
            this.emitQuestionNavigationEvent(qIndex);
        });
        
        this.gridElement.appendChild(indexItem);
    }

    markQuestionAnswered(qIndex) 
    {
        const item = this.getItemByIndex(qIndex);
        if (item) 
        {
            item.classList.remove('not-answered');
            item.classList.remove('answered');
            item.classList.add('answered');
            item.classList.remove('marked'); // Remove marked if it was there
        }
    }

    markQuestionUnAnswered(qIndex) 
    {
        const item = this.getItemByIndex(qIndex);
        if (item) {
            item.classList.remove('answered');
            item.classList.remove('not-answered');
            item.classList.add('not-answered');
        }
    }

    markQuestionCurrent(qIndex) 
    {
        // Remove current class from all items first
        this.gridElement.querySelectorAll('.index-item').forEach(item => {
            item.classList.remove('current');
        });
        
        // Add to specified item
        const item = this.getItemByIndex(qIndex);
        if (item) {
            item.classList.add('current');
        }
    }

    markQuestionReviewed(qIndex) 
    {
        const item = this.getItemByIndex(qIndex);
        if (item) 
        {
            item.classList.remove('marked');
            item.classList.add('marked');
        }
    }

    unMarkQuestionReviewed(qIndex) 
    {
        const item = this.getItemByIndex(qIndex);
        if (item) 
        {
            item.classList.remove('marked');
        }
    }

    // Helper method to get item by index
    getItemByIndex(qIndex) 
    {
        return this.gridElement.querySelector(`.index-item[data-index="${qIndex}"]`);
    }

    markAllQuestionsUnAnswered() 
    {
        const allItems = this.gridElement.querySelectorAll('.index-item');
        
        allItems.forEach(item => {
            // Remove all state classes
            item.classList.remove('answered');
            item.classList.remove('marked');
            item.classList.remove('current');
            
            // Add not-answered class
            item.classList.add('not-answered');
        });
    }

    // Helper method to emit navigation event
    emitQuestionNavigationEvent(qIndex) 
    {
        const event = new CustomEvent('questionNavigation', {
            detail: qIndex
        });
        document.dispatchEvent(event);
    }

    reset() 
    {
        this.gridElement.innerHTML = '';
        this.hide();
    }
}