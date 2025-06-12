class SystemInfoComponent {
  constructor(containerId, systemConfig, flatpakData, aptData) {
    this.container = document.getElementById(containerId);
    this.systemConfig = systemConfig;
    this.flatpakData = flatpakData;
    this.aptData = aptData;
  }

  render() {
    this.container.innerHTML = `
      <h2>System Configuration</h2>
      ${Utils.renderObjectAsTable(this.systemConfig)}

      <h2>Installed Flatpak Packages</h2>
      ${Utils.renderArrayAsTable(this.flatpakData)}

      <h2>Installed APT Packages</h2>
      ${Utils.renderArrayAsTable(this.aptData)}
    `;
  }
}
