// Tab functionality
function openTab(evt, tabName) {
    // Hide all tab contents
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }
    
    // Remove active class from all tab buttons
    var tabButtons = document.getElementsByClassName("tab-btn");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }
    
    // Show the current tab and mark button as active
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// JSON data for tables
const envVarsData = [
    { variable: "RADV_PERFTEST=aco,rt", remark: "Enables ACO shader compiler (better FPS)" },
    { variable: "VKD3D_CONFIG=no_upload_hvv", remark: "Optimization for Direct3D 12 games" },
    { variable: "AMD_VULKAN_ICD=RADV", remark: "Ensures RADV driver is used (not llvmpipe)" },
    { variable: "GAMEMODERUN=1", remark: "Activates GameMode optimizations" },
    { variable: "MANGOHUD=1", remark: "Enables performance overlay" },
    { variable: "MANGOHUD_CONFIG=fps_limit=60,position=top-left,no_display=0", remark: "Caps FPS to avoid thermal throttling" },
    { variable: "PROTON_USE_WINED3D=0", remark: "Forces Vulkan usage instead of OpenGL" },
    { variable: "DXVK_ASYNC=1", remark: "Reduces shader compilation stutter" },
    { variable: "DISABLE_LAYER_AMD_SWITCHABLE_GRAPHICS_1=1", remark: "Prevents GPU switching issues" }
];

const optionalVarsData = [
    { variable: "VK_INSTANCE_LAYERS=gamescope_wsi", remark: "Enables Gamescope compositor" },
    { variable: "WINE_FULLSCREEN_FSR=1", remark: "Enables AMD FSR upscaling at 1080p" },
    { variable: "PROTON_NO_FSYNC=1", remark: "Use if frame pacing is bad" },
    { variable: "PROTON_NO_ESYNC=1", remark: "Alternative to fsync" },
    { variable: "ENABLE_VK_LAYER_gamescope=1", remark: "Enables Gamescope Vulkan layer" },
    { variable: "VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/radeon_icd.x86_64.json", remark: "Explicitly points to RADV driver" }
];

const websitesData = [
    { 
        website: '<a href="https://steamcommunity.com/sharedfiles/filedetails/?l=german&id=1787799592" target="_blank">Link</a>', 
        description: "Optimizing Linux for Gaming, steamcommunity" 
    },
    { 
        website: '<a href="https://www.veeble.com/kb/how-to-optimise-ubuntu-gaming-performance/" target="_blank">Link</a>', 
        description: "Optimise Ubuntu Linux for Gaming" 
    },
    { 
        website: '<a href="https://linux-gaming.kwindu.eu/index.php?title=Improving_performance" target="_blank">Link</a>', 
        description: "Improving performance" 
    },
    { 
        website: '<a href="https://help.steampowered.com/en/faqs/view/7D01-D2DD-D75E-2955" target="_blank">Link</a>', 
        description: "Steam Launch Options" 
    },
    { 
        website: '<a href="https://steamcommunity.com/sharedfiles/filedetails/?l=french&id=1300836306" target="_blank">Link</a>', 
        description: "FPS BOOST TUTORIAL" 
    },
    { 
        website: '<a href="https://help.steampowered.com/en/faqs/view/2542-790F-14F8-D66A" target="_blank">Link</a>', 
        description: "Launch Settings for Video and Display" 
    },
    { 
        website: '<a href="https://discourse.ubuntu.com/t/fine-tuning-the-ubuntu-24-04-kernel-for-low-latency-throughput-and-power-efficiency/44834" target="_blank">Link</a>', 
        description: "Fine-Tuning the Ubuntu 24.04 Kernel for low latency" 
    }
];

// Function to populate tables
function populateTables() {
    // Populate Environment Variables table
    const envVarsBody = document.getElementById("env-vars-body");
    envVarsData.forEach(item => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #ddd";
        
        const varCell = document.createElement("td");
        varCell.style.padding = "10px";
        varCell.style.border = "1px solid #ddd";
        varCell.innerHTML = `<code>${item.variable}</code>`;
        
        const remarkCell = document.createElement("td");
        remarkCell.style.padding = "10px";
        remarkCell.style.border = "1px solid #ddd";
        remarkCell.textContent = item.remark;
        
        row.appendChild(varCell);
        row.appendChild(remarkCell);
        envVarsBody.appendChild(row);
    });
    
    // Populate Optional Variables table
    const optionalVarsBody = document.getElementById("optional-vars-body");
    optionalVarsData.forEach(item => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #ddd";
        
        const varCell = document.createElement("td");
        varCell.style.padding = "10px";
        varCell.style.border = "1px solid #ddd";
        varCell.innerHTML = `<code>${item.variable}</code>`;
        
        const remarkCell = document.createElement("td");
        remarkCell.style.padding = "10px";
        remarkCell.style.border = "1px solid #ddd";
        remarkCell.textContent = item.remark;
        
        row.appendChild(varCell);
        row.appendChild(remarkCell);
        optionalVarsBody.appendChild(row);
    });
    
    // Populate Websites table
    const websitesBody = document.getElementById("websites-body");
    websitesData.forEach(item => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #ddd";
        
        const websiteCell = document.createElement("td");
        websiteCell.style.padding = "10px";
        websiteCell.style.border = "1px solid #ddd";
        websiteCell.innerHTML = item.website;
        
        const descCell = document.createElement("td");
        descCell.style.padding = "10px";
        descCell.style.border = "1px solid #ddd";
        descCell.textContent = item.description;
        
        row.appendChild(websiteCell);
        row.appendChild(descCell);
        websitesBody.appendChild(row);
    });
}

// Initialize the page when loaded
document.addEventListener("DOMContentLoaded", function() {
    populateTables();
});