class CpuPerformanceComponent {
    constructor(containerId, governorConfig, vramConfig, runtimeConfig, monitorConfig) {
      this.container = document.getElementById(containerId);
      this.governorConfig = governorConfig;
      this.vramConfig = vramConfig;
      this.runtimeConfig = runtimeConfig;
      this.monitorConfig = monitorConfig;
      this.sysctlTuning = sysctlTuning;
    }
  
    render() {
      this.container.innerHTML = `
        <h2>CPU & Performance Optimization</h2>
  
        <section>
          <h3>CPU Governor Setup</h3>
          <p>${this.governorConfig.explanation}</p>
          ${Utils.renderArrayAsTable(this.governorConfig.commands, ['command', 'explanation', 'executed'])}
        </section>
  
        <section>
          <h3>VRAM Allocation Recommendation</h3>
          <p><strong>BIOS Setting:</strong> ${this.vramConfig.recommendation}</p>
          ${Utils.renderArrayAsTable(this.vramConfig.options, ['size', 'explanation', 'executed'])}
        </section>
  
        <section>
          <h3>Runtime Performance Mode</h3>
          ${Utils.renderArrayAsTable(this.runtimeConfig, ['command', 'explanation', 'executed'])}
        </section>
  
        <section>
          <h3>Monitor System in Real Time</h3>
          ${Utils.renderArrayAsTable([this.monitorConfig], ['command', 'explanation', 'executed'])}
        </section>

        <section>
        <h3>Sysctl Tuning</h3>
        <p><strong>Config File:</strong> ${this.sysctlTuning.configFile}</p>
        ${Utils.renderArrayAsTable(this.sysctlTuning.parameters, ['setting', 'explanation', 'configured'])}

        <h4>Post-Edit Verification Steps</h4>
        ${Utils.renderArrayAsTable(this.sysctlTuning.postEditSteps, ['command', 'explanation', 'executed'])}
      </section>

      `;
    }
  }
  