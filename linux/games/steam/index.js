document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching Logic
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  window.showTab = (tabId) => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));

    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
  };

  // Render each tab
  new SystemInfoComponent("system-tab", systemConfiguration, flatpakPackages, aptPackages).render();
  new FlatsealComponent("flatseal-tab", flatsealSettings).render();
  new SteamSettingsComponent("steam-tab", steamSettings).render();
  new KernelBootComponent("kernel-tab", kernelBootParameters).render();
  new CpuPerformanceComponent(
    "cpu-tab",
    cpuGovernorConfiguration,
    vramConfiguration,
    runtimePerformanceMode,
    monitorSystem
  ).render();
});
