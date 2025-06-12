// System Configuration
const systemConfiguration = {
    processor: "AMD Ryzen 9 6900HX (8 cores, 16 threads @ 3.3GHz)",
    cache: "L1 (8x32KB), L1 Data (8x32KB), L2 (8x512KB), L3 (16MB)",
    gpu: "AMD Radeon 680M (12 CUs, 768 shaders)",
    tdp: "45W",
    ram: "16GB DDR5 (Dual Channel)",
    os: "Ubuntu 24.04 LTS"
  };
  
  // Installed Flatpak Packages
  const flatpakPackages = [
    { 
        packageName: "com.valvesoftware.Steam", 
        configured: true, 
        explanation: "Valve's Steam client for game distribution and gaming platform" 
    },
    { 
        packageName: "com.github.tchx84.Flatseal", 
        configured: true, 
        explanation: "Graphical utility to manage Flatpak application permissions" 
    },
    { 
        packageName: "flathub net.davidotek.pupgui2", 
        configured: true, 
        explanation: "ProtonUp-Qt (pupgui2) - Install and manage Proton-GE and other compatibility tools" 
    },
    { 
        packageName: "com.valvesoftware.Steam.Utility.MangoHud", 
        configured: true, 
        explanation: "MangoHud performance overlay for Steam games (Vulkan/OpenGL)" 
    },
    { 
        packageName: "org.freedesktop.Platform.VulkanLayer.gamescope", 
        configured: true, 
        explanation: "Gamescope Vulkan layer - SteamOS session compositing window manager" 
    }
  ];
  
  // Installed APT Packages
  const aptPackages = [
    { 
        packageName: "gamemode", 
        configured: true,
        explanation: "Optimizes system performance during gaming sessions" 
    },
    { 
        packageName: "libgamemode0", 
        configured: true,
        explanation: "Core library for gamemode functionality" 
    },
    { 
        packageName: "libgamemodeauto0", 
        configured: true, 
        explanation: "Required for automatic gamemode activation in games" 
    },
    { 
        packageName: "mangohud", 
        configured: true,
        explanation: "Performance overlay for monitoring FPS, temperatures, and system stats in games" 
    },
    { 
        packageName: "mesa-vulkan-drivers", 
        configured: true,
        explanation: "Open-source Vulkan graphics drivers for AMD/Intel GPUs" 
    },
    { 
        packageName: "mesa-vulkan-drivers:i386", 
        configured: true, 
        explanation: "32-bit version of Vulkan drivers required for 32-bit games" 
    },
    { 
        packageName: "vulkan-tools", 
        configured: true,
        explanation: "Utilities for Vulkan development and testing (includes vkcube, vulkaninfo)" 
    }
  ];
  
  // Flatseal Environment Variables
  const flatsealSettings = {
    // Environment Variables
    Vulkan_Driver_Settings: [
      { variable: "RADV_PERFTEST=aco,rt", explanation: "Enables ACO compiler and ray tracing support in RADV", configured: true },
      { variable: "AMD_VULKAN_ICD=RADV", explanation: "Forces RADV Vulkan driver for AMD GPUs", configured: true },
      { variable: "VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/radeon_icd.x86_64.json", explanation: "Specifies Vulkan ICD file location", configured: true }
    ],
    
    Low_Power_GPU_Tuning: [
      { variable: "R600_DEBUG=nohyperz", explanation: "Not for radeon 680m, Disables HyperZ for older R600 GPUs (may improve stability)", configured: false },
      { variable: "RADV_DEBUG=nodcc", explanation: "Disables DCC (Delta Color Compression) - may help with VRAM limitations", configured: true },
      { variable: "mesa_glthread=true", explanation: "Use it in games launch options. It may break some titles, Enables multithreaded OpenGL command processing", configured: false }
    ],
    
    Proton_Performance: [
      { variable: "DXVK_ASYNC=1", explanation: "Enables async shader compilation (reduces stuttering)", configured: true },
      { variable: "PROTON_USE_WINED3D=0", explanation: "Forces DX11 games to use DXVK instead of OpenGL", configured: true },
      { variable: "VKD3D_CONFIG=no_upload_hvv", explanation: "Optimizes VRAM usage for D3D12 games", configured: true },
      { variable: "PROTON_LOG=0", explanation: "Disables debug logging (improves performance)", configured: true }
    ],
    
    Nvidia_GPU_Features: [
      { variable: "PROTON_HIDE_NVIDIA_GPU=0", explanation: "Makes Nvidia GPUs visible to Proton", configured: false },
      { variable: "PROTON_ENABLE_NVAPI=1", explanation: "Enables Nvidia's NVAPI support in Proton", configured: false}
    ],
    
    Memory_Management: [
      { variable: "PROTON_FORCE_LARGE_ADDRESS_AWARE=1", explanation: "Enables >2GB memory support for Windows executables", configured: true },
      { variable: "WINE_LARGE_ADDRESS_AWARE=1", explanation: "Enables >2GB memory support for Wine processes", configured: true }
    ],
    
    System_Performance: [
      { variable: "GAME_MODE=1", explanation: "not really used by newer GameMode setups. Legacy variable for Feral's GameMode", configured: false },
      { variable: "GAMEMODERUN=1", explanation: "Activates gamemode optimizations for games", configured: true }
    ],
    
    Performance_Overlay: [
      { variable: "MANGOHUD=1", explanation: "Enables MangoHUD performance overlay", configured: true },
      { variable: "MANGOHUD_CONFIG=fps_limit=60,position=top-left,no_display=0,gpu_stats=1,gpu_temp=1", 
        explanation: "Configures MangoHUD display: FPS cap, position, GPU stats", configured: true }
    ],
  
    // File System Access
    Filesystem_Permissions: [
      { path: "/mnt/ldata/games/steam:rw", configured: true, explanation: "Steam library location" },
      { path: "~/.local/share:rw", configured: true, explanation: "User application data" },
      { path: "~/.cache:rw", configured: true, explanation: "Cache files" },
      { path: "~/.config:rw", configured: true, explanation: "Configuration files" },
      { path: "~/.steam:rw", configured: true, explanation: "Steam client files" },
      { path: "~/.var/app:rw", configured: true, explanation: "Flatpak application data" },
      { path: "/tmp:rw", configured: true, explanation: "Temporary files" }
    ],
  
    // Hardware Access
    Device_Permissions: [
      {
        permission: "--device=dri",
        configured: true,
        explanation: [
          "Grants access to Direct Rendering Infrastructure (DRI)",
          "Required for GPU acceleration in games",
          "Allows Vulkan/OpenGL applications to use the GPU"
        ]
      },
      {
        permission: "--share=ipc",
        configured: true,
        explanation: [
          "Enables Inter-Process Communication (IPC) sharing",
          "Needed for Steam client ↔ game communication",
          "Allows shared memory between processes"
        ]
      }
    ]
  };
  
  // Steam Launch Options
  const steamSettings = {
    steamLaunchOptions:{
      launchOptions: [
        { 
          type: "default",  configured: true,
          command: "gamemoderun taskset -c 8-15 gamescope -f -e -- %command%",
          explanation: "Isolates game to cores 8-15 with full gamescope features"
        },
        { 
          type: "720p",  configured: true,
          command: "gamemoderun taskset -c 8-15 gamescope -W 1280 -H 720 -f -- %command%",
          explanation: "720p low-res performance mode with core isolation"
        },
        { 
          type: "physical-cores",  configured: true,
          command: "gamemoderun taskset -c 4,5,6,7 gamescope -f -e -- taskset -c 4,5,6,7 %command%",
          explanation: "Pins gamescope and game to physical cores 4-7 for minimal OS interference"
        },
        { 
          type: "game-only-physical",  configured: true,
          command: "gamemoderun taskset -c 4,5,6,7 %command%",
          explanation: "Runs game on physical cores 4-7 without gamescope"
        },
        { 
          type: "smt-paired",  configured: true,
          command: "gamemoderun taskset -c 4,5,12,13 gamescope -f -e -- taskset -c 4,5,12,13 %command%",
          explanation: "Uses physical cores 4-5 and their SMT siblings 12-13 for wider thread pool"
        }
      ],
      breakdown: [
        { command: "gamemoderun", value: "(no value)", explanation: "Wrapper that activates Feral GameMode optimizations", required: false },
        { command: "taskset", value: "-c 8-15", explanation: "Pins process to CPU cores 8-15 (for core isolation)", required: false },
        { command: "gamescope", value: "(no value)", explanation: "Compositor that provides better fullscreen performance", required: false },
        { command: "-W", value: "1280", explanation: "Sets output width in pixels (here 720p width)", required: false },
        { command: "-H", value: "720", explanation: "Sets output height in pixels (here 720p height)", required: false },
        { command: "-f", value: "(flag)", explanation: "Forces fullscreen mode", required: false },
        { command: "-e", value: "(flag)", explanation: "Enables vsync (adaptive sync if available)", required: false },
        { command: "--", value: "(separator)", explanation: "Indicates end of gamescope options", required: true },
        { command: "%command%", value: "(Steam placeholder)", explanation: "Replaced with actual game executable command", required: true }
      ],
      explanation: "Cores 8-15 are isolated from system tasks for dedicated game performance. "
    },
    protonSettings: "Use Proton-GE (latest) via ProtonUp-Qt for best compatibility and performance"
  };
  
  // Kernel Boot Parameters
  const kernelBootParameters = {
    GRUB_CMDLINE_LINUX_DEFAULT: [
      {
        value: "quiet splash amdgpu.ppfeaturemask=0xffffffff mitigations=off nowatchdog preempt=full nohz_full=8-15 threadirqs rcu_nocbs=8-15 rcutree.enable_rcu_lazy=1 amdgpu.sg_display=0 amdgpu.dc=1 amdgpu.vm_fragment_size=9 isolcpus=8-15",
        explanation: "Base configuration with AMD full feature mask, GPU memory optimizations, CPU isolation, and system latency reductions.",
        configured: false
      },
      {
        value: "quiet splash amd_pstate=active amdgpu.ppfeaturemask=0xffffffff mitigations=off nowatchdog preempt=full nohz_full=8-15 threadirqs rcu_nocbs=8-15 rcutree.enable_rcu_lazy=1 amdgpu.sg_display=0 amdgpu.dc=1 amdgpu.vm_fragment_size=9 isolcpus=8-15",
        explanation: "Adds `amd_pstate=active` to enable modern CPU frequency scaling with better responsiveness and efficiency for gaming workloads.",
        configured: false
      },
      {
        value: "quiet splash amd_pstate=active amdgpu.ppfeaturemask=0xffffffff mitigations=off nowatchdog preempt=full nohz_full=8-15 threadirqs rcu_nocbs=8-15 rcutree.enable_rcu_lazy=1 amdgpu.sg_display=0 amdgpu.dc=1 amdgpu.vm_fragment_size=9 isolcpus=8-15 amdgpu.gpu_recovery=0",
        explanation: "Disables AMD GPU crash recovery for more stable fullscreen performance (if system is stable without crashes).",
        configured: false
      },
      {
        value: "quiet splash amd_pstate=active amdgpu.ppfeaturemask=0xffffffff mitigations=off nowatchdog preempt=full nohz_full=8-15 threadirqs rcu_nocbs=8-15 rcutree.enable_rcu_lazy=1 amdgpu.sg_display=0 amdgpu.dc=1 amdgpu.vm_fragment_size=9 isolcpus=8-15 rcutree.use_softirq=0",
        explanation: "Reduces CPU latency by offloading RCU callbacks from soft IRQ context.",
        configured: false
      },
      {
        value: "quiet splash amd_pstate=active amdgpu.ppfeaturemask=0xffffffff mitigations=off nowatchdog preempt=full nohz_full=8-15 threadirqs rcu_nocbs=8-15 rcutree.enable_rcu_lazy=1 amdgpu.sg_display=0 amdgpu.dc=1 amdgpu.vm_fragment_size=9 isolcpus=8-15 idle=poll",
        explanation: "Forces CPU to avoid deep sleep states (C-states) to reduce input latency, at the cost of higher power usage and heat.",
        configured: false
      }
    ],
      parameters: [
        { 
          parameter: "quiet", 
          explanation: "Suppresses boot messages for cleaner startup | Recommended for: All systems", 
          configured: false
        },
        { 
          parameter: "splash", 
          explanation: "Enables splash screen during boot | Recommended for: All systems", 
          configured: false 
        },
        { 
          parameter: "amdgpu.ppfeaturemask=0xffffffff", 
          explanation: "Enables all AMD GPU power/performance features | Recommended for: AMD GPU systems | Warning: Experimental features may affect stability", 
          configured: false 
        },
        { 
          parameter: "mitigations=off", 
          explanation: "Disables CPU vulnerability mitigations for performance | Recommended for: Gaming systems | Security Note: Reduces protection against CPU vulnerabilities", 
          configured: false 
        },
        { 
          parameter: "nowatchdog", 
          explanation: "Disables hardware watchdog timers | Recommended for: Performance tuning", 
          configured: false 
        },
        { 
          parameter: "preempt=full", 
          explanation: "Enables full preemption for lower latency | Recommended for: Low-latency needs", 
          configured: false 
        },
        { 
          parameter: "nohz_full=8-15", 
          explanation: "Disables timer interrupts on cores 8-15 | Recommended for: Core isolation", 
          configured: false 
        },
        { 
          parameter: "threadirqs", 
          explanation: "Forces thread-specific IRQs for better core isolation | Recommended for: Core isolation", 
          configured: false 
        },
        { 
          parameter: "rcu_nocbs=8-15", 
          explanation: "Moves RCU callbacks from cores 8-15 to others | Recommended for: Core isolation", 
          configured: false 
        },
        { 
          parameter: "rcutree.enable_rcu_lazy=1", 
          explanation: "Enables lazy RCU callback processing for better performance | Recommended for: Performance tuning", 
          configured: false 
        },
        { 
          parameter: "amdgpu.sg_display=0", 
          explanation: "Disables scatter-gather display support | Recommended for: AMD GPU systems", 
          configured: false 
        },
        { 
          parameter: "amdgpu.dc=1", 
          explanation: "Enables Display Core hardware acceleration | Recommended for: AMD GPU systems", 
          configured: false 
        },
        { 
          parameter: "amdgpu.vm_fragment_size=9", 
          explanation: "Sets VM fragment size (512MB chunks) for better allocation | Recommended for: AMD GPU systems", 
          configured: false 
        },
        { 
          parameter: "isolcpus=8-15", 
          explanation: "Isolates cores 8-15 from general kernel scheduling | Recommended for: Core isolation", 
          configured: false 
        }
    ],
    postEditSteps: [
      { command: "sudo update-grub", explanation: "Applies GRUB configuration changes", executed: false },
      { command: "sudo reboot", explanation: "Required for kernel parameters to take effect", executed: false }
    ],
    explanation: "Isolating cores 8-15 (not 1-15) prevents starving the OS of CPU resources"
  };
  
  // Sysctl Tuning
  const sysctlTuning = {
    configFile: "/etc/sysctl.d/99-gaming.conf",
    parameters: [
      { setting: "vm.compaction_proactiveness=0", explanation: "Reduces background memory compaction", configured: true },
      { setting: "vm.dirty_ratio=5", explanation: "Maximum % of dirty memory before writeback", configured: true },
      { setting: "vm.dirty_background_ratio=5", explanation: "% of dirty memory to start writeback", configured: true },
      { setting: "vm.swappiness=10", explanation: "How aggressively to swap (10=moderate)", configured: true },
      { setting: "vm.vfs_cache_pressure=50", explanation: "Filesystem cache retention (50=balanced)", configured: true },
      { setting: "kernel.numa_balancing=0", explanation: "Disables NUMA balancing for AMD systems", configured: true },
      { setting: "kernel.sched_energy_aware=0", explanation: "Disables energy-aware scheduling", configured: true },
      { setting: "kernel.sched_autogroup_enabled=0", explanation: "Disables task autogrouping to prevent latency in games", configured: false },
      { setting: "kernel.sched_latency_ns=6000000", explanation: "may cause overheating, Tightens scheduler latency window (6ms)", configured: false },
      { setting: "kernel.sched_min_granularity_ns=1000000", explanation: "Prevents excessive CPU switching.. Minimum time a task runs before preemption (0.75ms)", configured: false },
      { setting: "kernel.sched_wakeup_granularity_ns=1000000", explanation: "How early tasks can preempt (1ms)", configured: false },
      { setting: "fs.inotify.max_user_watches=524288", explanation: "Allows more file system watchers (useful for gaming platforms)", configured: false },
      { setting: "net.core.wmem_max=26214400", explanation: "Max send buffer size", configured: false },
      { setting: "kernel.timer_migration=0", explanation: "may cause issues with power management, Use this only if you've fully isolated CPU cores (e.g., using isolcpus, nohz_full, rcu_nocbs). Pins timers to cores, avoids waking idle CPUs", configured: false }
    ],
    postEditSteps: [
      { command: "sudo sysctl --system", explanation: "Applies all sysctl changes", executed: false },
      { command: "cat /proc/cmdline | grep isolcpus", explanation: "Verify core isolation", executed: false },
      { command: "sysctl -a | grep sched", explanation: "Verify scheduler settings", executed: false },
      { command: "sysctl -a | grep vm", explanation: "Verify memory tuning settings", executed: false },
      { command: "glxinfo | grep \"OpenGL renderer\" ", explanation: "Verify memory tuning settings", executed: false }
    ]
  };


  
  // CPU Governor Setup
  const cpuGovernorConfiguration = {
    commands: [
      { id: 1, command: "sudo apt install cpufrequtils", explanation: "Install CPU frequency scaling utilities", executed: false },
      { id: 2, command: "echo 'GOVERNOR=\"performance\"' | sudo tee /etc/default/cpufrequtils", explanation: "Set performance governor as default", executed: false },
      { id: 3, command: "sudo systemctl enable cpufrequtils", explanation: "Enable service", executed: false },
      { id: 4, command: "sudo cpufreq-set -g performance", explanation: "Apply immediately", executed: false }
    ],
    explanation: "Performance governor keeps CPU at maximum frequency for consistent gaming performance"
  };
  
  // VRAM Allocation Configuration
  const vramConfiguration = {
    recommendation: "Set UMA Buffer Size or Shared Memory in BIOS",
    options: [
      { size: "2GB", explanation: "Works for most games" },
      { size: "4GB", explanation: "Only for heavy games, May be excessive for many small game titles" }
    ]
  };
  
  // Runtime Performance Mode
  const runtimePerformanceMode = [
    {
      command: "echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor",
      explanation: "Forces all CPU cores into 'performance' mode at runtime using sysfs. This ensures max clock speeds and responsiveness but increases power consumption and system temperatures. Temporary until reboot.",
      executed: false
    },
    {
      command: "sudo cpupower frequency-set -g performance",
      explanation: "Applies the 'performance' governor via cpupower, pushing the CPU to run at its highest frequency at all times. Improves frame times and consistency in games but may significantly raise system heat and reduce battery life on laptops.",
      executed: false
    },
    {
      command: "sudo cpupower frequency-set -g ondemand",
      explanation: "Sets the CPU to the 'ondemand' governor, which dynamically scales CPU frequency based on load. Conserves energy and reduces heat under light workloads but may introduce lag spikes or slower ramp-up under heavy gaming loads.",
      executed: false
    }
  ];
  
  const monitorSystem = {
    command: "watch -n 1 \"cat /proc/cpuinfo | grep MHz && sensors | grep Tdie\"",
    explanation: "Monitors real-time CPU clock speeds (MHz) and die temperatures (Tdie) every second",
    executed: false
  };