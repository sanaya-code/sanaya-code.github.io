class ParentComponent
{
    constructor(rootId, svgId) 
    {
        this.rootElement    =   document.getElementById(rootId);
        this.svgContainer   =   document.getElementById(svgId);
    }

    setSvg(svg)
    {
        if(!(svg === null || svg === undefined))
        {
            this.svgContainer.innerHTML  =   svg;
            this.svgContainer.style.display = 'flex';
        }
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