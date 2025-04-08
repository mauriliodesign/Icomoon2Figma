import { getSelectedIcons } from './display.js';

let currentIcons = [];

export function setCurrentIcons(icons) {
  currentIcons = icons;
}

export function initializeExport() {
  const exportCSVBtn = document.getElementById('exportCSV');
  const exportSelectedBtn = document.getElementById('exportSelected');
  const exportTokensBtn = document.getElementById('exportTokens');
  const exportSVGBtn = document.getElementById('exportSVG');
  const exportJSONBtn = document.getElementById('exportJSON');
  
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener('click', () => {
      // Export all icons in CSV format
      exportCSV(currentIcons);
    });
  }

  if (exportSelectedBtn) {
    exportSelectedBtn.addEventListener('click', () => {
      const selectedIconsData = getSelectedIcons();
      if (selectedIconsData.length > 0) {
        // Export selected icons in CSV format
        exportCSV(selectedIconsData);
      }
    });
  }

  if (exportTokensBtn) {
    exportTokensBtn.addEventListener('click', () => {
      // Export all icons in Tokens Studio format
      exportTokensStudioJSON(currentIcons);
    });
  }

  if (exportSVGBtn) {
    exportSVGBtn.addEventListener('click', () => {
      const selectedIconsData = getSelectedIcons();
      if (selectedIconsData.length > 0) {
        exportSVG(selectedIconsData);
      }
    });
  }

  if (exportJSONBtn) {
    exportJSONBtn.addEventListener('click', () => {
      const selectedIconsData = getSelectedIcons();
      if (selectedIconsData.length > 0) {
        exportJSON(selectedIconsData);
      }
    });
  }
}

function exportCSV(icons) {
  // Define CSV headers according to the required format
  const headers = [
    'variableName',  // Required: The variable name
    'category',      // Required: The variable group name
    'unicode',       // Additional: Unicode character
    'unicodeHex',    // Additional: Unicode hex value
    'tags'          // Additional: Tags if any
  ];

  // Create CSV content
  const csvContent = [
    // Add headers
    headers.join(','),
    // Add data rows
    ...icons.map(icon => {
      const name = escapeCsvValue(icon.properties.name);
      const code = icon.properties.code;
      const unicodeChar = String.fromCharCode(code);
      const unicodeHex = `\\u${code.toString(16).padStart(4, '0')}`;
      const tags = icon.properties.tags ? escapeCsvValue(icon.properties.tags.join(', ')) : '';
      
      return [
        name,           // variableName
        'icons',        // category (fixed as 'icons' for now)
        unicodeChar,    // unicode
        unicodeHex,     // unicodeHex
        tags           // tags
      ].join(',');
    })
  ].join('\n');

  // Create and download the CSV file
  downloadFile(csvContent, 'icons.csv', 'text/csv;charset=utf-8;');
}

function exportTokensStudioJSON(icons) {
  const tokensData = {
    icons: {}
  };

  icons.forEach(icon => {
    const name = icon.properties.name;
    const code = icon.properties.code;
    const unicodeChar = String.fromCharCode(code);

    tokensData.icons[name] = {
      $type: "string",
      $value: unicodeChar,
      $description: `Unicode: \\u${code.toString(16).padStart(4, '0')}`,
    };
  });

  // Create and download the JSON file
  const jsonContent = JSON.stringify(tokensData, null, 2);
  downloadFile(jsonContent, 'figma-icons-tokens.json', 'application/json');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  // and escape any existing quotes
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function exportSVG(icons) {
  const zip = new JSZip();
  
  icons.forEach(icon => {
    const svgContent = icon.svg;
    zip.file(`${icon.name}.svg`, svgContent);
  });
  
  const content = await zip.generateAsync({type: "blob"});
  downloadFile(content, 'icons.zip', 'application/zip');
}

function exportJSON(icons) {
  const jsonData = icons.map(icon => ({
    name: icon.name,
    svg: icon.svg,
    unicode: icon.unicode,
    tags: icon.tags
  }));
  
  const content = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  downloadFile(blob, 'icons.json', 'application/json');
} 