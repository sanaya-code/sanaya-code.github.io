class OrderingComponent extends ParentComponent 
{
    constructor() 
    {
        super('ordering-question', 'ordering-svg-figure', 'ordering-figure');
        this.id = "ordering-question";
        this.questionId = "ordering-question-text";
        this.itemsContainerId = "ordering-items";
        this.questionElement = document.getElementById(this.questionId);
        this.itemsContainer = document.getElementById(this.itemsContainerId);
        this.draggedItem = null;
    }

    setQuestion(qStatement) 
    {
        this.questionElement.textContent = qStatement;
    }

    addItem(item_id, item_text) 
    {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'ordering-item';
        itemDiv.draggable = true;
        itemDiv.dataset.id = item_id;
        itemDiv.textContent = item_text;
        
        // Drag and drop event handlers
        itemDiv.addEventListener('dragstart', this.handleDragStart.bind(this));
        itemDiv.addEventListener('dragover', this.handleDragOver.bind(this));
        itemDiv.addEventListener('drop', this.handleDrop.bind(this));
        itemDiv.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        this.itemsContainer.appendChild(itemDiv);
    }

    setAnswer(orderedIds) 
    {
        // Create a map of existing items for quick lookup
        const itemsMap = {};
        Array.from(this.itemsContainer.children).forEach(item => {
            itemsMap[item.dataset.id] = item;
        });
    
        // Clear the container
        this.itemsContainer.innerHTML = '';
    
        // Re-add items in the new order
        orderedIds.forEach(id => {
            if (itemsMap[id]) {
                this.itemsContainer.appendChild(itemsMap[id]);
            }
        });
    }

    getAnswer() 
    {
        return Array.from(this.itemsContainer.children).map(item => item.dataset.id);
    }

    reset() 
    {
        this.questionElement.textContent    =   '';
        this.itemsContainer.innerHTML       =   '';
        this.svgContainer.innerHTML         =   '';
        this.svgContainer.style.display     =   'none';
        this.figContainer.style.display     =   'none';
        this.hide();
    }

    // Drag and drop handlers
    handleDragStart(e) 
    {
        this.draggedItem = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        e.target.classList.add('dragging');
    }

    handleDragOver(e) 
    {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetItem = e.target.closest('.ordering-item');
        if (targetItem && targetItem !== this.draggedItem) {
            const rect = targetItem.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                targetItem.parentNode.insertBefore(this.draggedItem, targetItem);
            } else {
                targetItem.parentNode.insertBefore(this.draggedItem, targetItem.nextSibling);
            }
        }
    }

    handleDrop(e) 
    {
        e.preventDefault();
    }

    handleDragEnd(e) 
    {
        e.target.classList.remove('dragging');
        this.draggedItem = null;
    }
}