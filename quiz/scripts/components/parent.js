class ParentComponent
{
    constructor(containerId) 
    {
        this.rootElement    =   document.getElementById(containerId);
        this.svgContainer   =   document.getElementById("geometry-figure");
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