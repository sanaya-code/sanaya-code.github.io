class ResourcesComponent {
    constructor(containerId, websitesData) {
      this.container = document.getElementById(containerId);
      this.websites = websitesData;
    }
  
    render() {
      if (!this.container) return;
  
      const title = document.createElement("h2");
      title.textContent = "Useful Linux & Gaming Resources";
      this.container.appendChild(title);
  
      const list = document.createElement("ul");
      list.style.paddingLeft = "20px";
  
      this.websites.forEach(entry => {
        const item = document.createElement("li");
        item.style.marginBottom = "10px";
        item.innerHTML = `<strong>${entry.description}:</strong> ${entry.website}`;
        list.appendChild(item);
      });
  
      this.container.appendChild(list);
    }
  }
  