class KernelBootComponent {
    constructor(containerId, settings) {
      this.container = document.getElementById(containerId);
      this.settings = settings;
    }
  
    render() {
      const { GRUB_CMDLINE_LINUX_DEFAULT, parameters, postEditSteps, explanation } = this.settings;
  
      this.container.innerHTML = `
        <h2>Kernel Boot Parameters</h2>
        <p class="section-note">${explanation}</p>
  
        <h3>GRUB_CMDLINE_LINUX_DEFAULT Entries</h3>
        ${Utils.renderArrayAsTable(GRUB_CMDLINE_LINUX_DEFAULT, ['value', 'explanation', 'configured'])}
  
        <h3>Parameter Breakdown</h3>
        ${Utils.renderArrayAsTable(parameters, ['parameter', 'explanation', 'configured'])}
  
        <h3>Post-Edit Steps</h3>
        ${Utils.renderArrayAsTable(postEditSteps, ['command', 'explanation', 'executed'])}
      `;
    }
  }
  