class ParentComponent
{
    constructor(rootId, svgId, figureId) 
    {
        this.rootElement    =   document.getElementById(rootId);
        this.svgContainer   =   document.getElementById(svgId);
        this.figContainer   =   document.getElementById(figureId);
    }

    setSvg(svg)
    {
        if(!(svg === null || svg === undefined))
        {
            this.svgContainer.innerHTML     =   svg;
            this.svgContainer.style.display = 'flex';
        }
    }

    setFigure(url)
    {
        if(!(url === null || url === undefined))
        {
            this.figContainer.innerHTML     =   `<img src="${url}" >`;
            this.figContainer.style.display =   'flex';
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