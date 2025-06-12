const Utils = {
  renderArrayAsTable: (arr, keys) => {
    if (!arr.length) return "<p>No data available</p>";

    const headers = keys || Object.keys(arr[0]);
    const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;

    const tbody = arr.map(item => `
      <tr>${headers.map(h => {
        const value = item[h];
        const className = value === true ? 'true' : value === false ? 'false' : '';
        const display = typeof value === 'boolean' ? (value ? 'True' : 'False') :
                        Array.isArray(value) ? value.join("<br>") : value;
        return `<td class="${className}">${display ?? ''}</td>`;
      }).join('')}</tr>
    `).join('');

    return `<table>${thead}${tbody}</table>`;
  },

  renderObjectAsTable: (obj) => {
    const rows = Object.entries(obj).map(([k, v]) => `
      <tr><th>${k}</th><td>${v}</td></tr>
    `).join('');
    return `<table>${rows}</table>`;
  }
};
