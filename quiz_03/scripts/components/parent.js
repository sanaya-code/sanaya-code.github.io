class ParentComponent
{
    constructor(containerId) 
    {
        this.rootElement = document.getElementById(containerId);
    }
    
    hide() 
    {
        this.rootElement.style.display = 'none';
    }

    show()
    {
        this.rootElement.style.display = 'block';
    }
}