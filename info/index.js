// Map tab names to global JS variables (strings) holding JSON data
var tabDataStrings = {
  Parvez:parvez,
  Firoz: firoz,
  Sanaya: sanaya,
  Miriam: miriam,
  Farzana: farzana,
  Parents: parents,
  Others:others
};

const tabsContainer = document.getElementById('tabs-container');
const tabComponent = document.querySelector('tab-component');

const tabNames = Object.keys(tabDataStrings);

// Create tab buttons dynamically
tabNames.forEach((tabName, index) => {
  const btn = document.createElement('button');
  btn.classList.add('tab-btn');
  btn.textContent = tabName;

  if (index === 0) btn.classList.add('active');

  btn.addEventListener('click', () => {
    // Set active button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Parse the JSON string from global variable and update tab content
    try {
      const data = JSON.parse(tabDataStrings[tabName]);
      tabComponent.data = data;
    } catch (err) {
      tabComponent.innerHTML = `<p style="color:red;">Error parsing data.</p>`;
    }
  });

  tabsContainer.appendChild(btn);
});

// Load initial tab data (first tab)
try {
  const data = JSON.parse(tabDataStrings[tabNames[0]]);
  tabComponent.data = data;
} catch (err) {
  tabComponent.innerHTML = `<p style="color:red;">Error parsing data.</p>`;
}
