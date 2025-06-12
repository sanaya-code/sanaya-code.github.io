class SteamSettingsComponent {
  constructor(containerId, settings) {
    this.container = document.getElementById(containerId);
    this.settings = settings;
  }

  render() {
    const { launchOptions, breakdown, explanation } = this.settings.steamLaunchOptions;
    const { protonSettings } = this.settings;

    this.container.innerHTML = `
      <h2>Steam Launch Options</h2>
      <p class="section-note">${explanation}</p>
      <h3>Presets</h3>
      ${Utils.renderArrayAsTable(launchOptions, ['type', 'command', 'configured', 'explanation'])}
      <h3>Command Breakdown</h3>
      ${Utils.renderArrayAsTable(breakdown, ['command', 'value', 'explanation', 'required'])}
      <h2>Proton Settings</h2>
      <p class="section-note">${protonSettings}</p>
    `;
  }
}
