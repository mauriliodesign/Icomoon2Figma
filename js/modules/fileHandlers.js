import { showToast } from './toast.js';
import { refreshDisplay } from './display.js';

const VALID_FONT_TYPES = [
  'font/woff',
  'font/woff2',
  'font/ttf',
  'font/otf',
  'application/x-font-ttf',
  'application/x-font-otf',
  'application/font-woff',
  'application/font-woff2'
];

// Add font style to document head
const fontStyle = document.createElement('style');
document.head.appendChild(fontStyle);

export function initializeFileHandlers(appState) {
  const dropZones = {
    json: document.getElementById('jsonDropZone'),
    font: document.getElementById('fontDropZone')
  };

  const fileInputs = {
    json: document.getElementById('fileInput'),
    font: document.getElementById('fontInput')
  };

  // Initialize delete buttons
  Object.entries(dropZones).forEach(([type, zone]) => {
    const deleteBtn = zone.querySelector('.delete-file');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleFileDelete(type, appState, zone, fileInputs[type]);
      });
    }
  });

  // Add drag and drop listeners for both zones
  Object.entries(dropZones).forEach(([type, zone]) => {
    if (!zone) {
      console.error(`Drop zone for ${type} not found`);
      return;
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, () => highlight(zone), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, () => unhighlight(zone), false);
    });

    zone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (type === 'json') {
        handleJsonFile(file, appState, zone);
      } else {
        handleFontFile(file, appState, zone);
      }
    }, false);
  });

  // File input listeners
  Object.entries(fileInputs).forEach(([type, input]) => {
    if (!input) {
      console.error(`File input for ${type} not found`);
      return;
    }

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (type === 'json') {
        handleJsonFile(file, appState, dropZones[type]);
      } else {
        handleFontFile(file, appState, dropZones[type]);
      }
    });
  });
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(element) {
  element.style.borderColor = 'var(--primary)';
}

function unhighlight(element) {
  if (!element.classList.contains('file-loaded')) {
    element.style.borderColor = 'var(--border)';
  }
}

function updateFileLoadedState(zone, file) {
  zone.classList.add('file-loaded');
  const fileInfo = zone.querySelector('.file-info');
  const fileName = zone.querySelector('.file-name');
  
  if (fileInfo && fileName) {
    fileName.textContent = file.name;
    fileInfo.style.display = 'flex';
  }
}

function handleFileDelete(type, appState, zone, input) {
  // Reset the file input
  if (input) {
    input.value = '';
  }

  // Reset the upload zone appearance
  zone.classList.remove('file-loaded');
  zone.style.borderColor = 'var(--border)';
  const fileInfo = zone.querySelector('.file-info');
  if (fileInfo) {
    fileInfo.style.display = 'none';
  }

  // Reset the appropriate state
  if (type === 'json') {
    appState.currentIcons = [];
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';
    document.getElementById('outputTable').style.display = 'none';
  } else if (type === 'font') {
    appState.currentFont = null;
    fontStyle.textContent = '';
  }

  refreshDisplay(appState);
  showToast('File removed');
}

async function handleFontFile(file, appState, zone) {
  if (!file) {
    console.error('No font file provided');
    return;
  }

  console.log('Processing font file:', file.name, 'Type:', file.type);

  if (!file.name.match(/\.(woff2?|ttf|otf)$/i)) {
    showToast('Please upload a valid font file (woff, woff2, ttf, or otf)');
    return;
  }

  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const fontBlob = new Blob([arrayBuffer], { type: file.type || 'font/ttf' });
    const fontUrl = URL.createObjectURL(fontBlob);

    const fontFace = new FontFace('icomoon', `url(${fontUrl})`);
    
    console.log('Loading font face...');
    const loadedFont = await fontFace.load();
    console.log('Font face loaded successfully');

    document.fonts.delete(loadedFont);
    document.fonts.add(loadedFont);

    fontStyle.textContent = `
      @font-face {
        font-family: 'icomoon';
        src: url('${fontUrl}') format('${getFontFormat(file.name)}');
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }
    `;

    appState.currentFont = loadedFont;
    updateFileLoadedState(zone, file);
    showToast('Font loaded successfully');
    refreshDisplay(appState);

  } catch (error) {
    console.error('Error loading font:', error);
    showToast('Error loading font file. Please check the console for details.');
  }
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function getFontFormat(filename) {
  if (filename.endsWith('.woff2')) return 'woff2';
  if (filename.endsWith('.woff')) return 'woff';
  if (filename.endsWith('.ttf')) return 'truetype';
  if (filename.endsWith('.otf')) return 'opentype';
  return 'truetype';
}

function handleJsonFile(file, appState, zone) {
  if (!file) {
    console.error('No JSON file provided');
    return;
  }

  console.log('Processing JSON file:', file.name);

  if (!file.name.toLowerCase().endsWith('.json')) {
    showToast('Please select a valid selection.json file');
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function (e) {
    try {
      const content = JSON.parse(e.target.result);
      
      if (!content || typeof content !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      const icons = content.icons || [];
      console.log('Found icons:', icons.length);

      if (icons.length === 0) {
        showToast('No icons found in the file');
        return;
      }

      const validIcons = icons.every(icon => 
        icon && 
        icon.properties && 
        typeof icon.properties.name === 'string' &&
        typeof icon.properties.code === 'number'
      );

      if (!validIcons) {
        throw new Error('Invalid icon data structure');
      }

      appState.currentIcons = icons;
      updateFileLoadedState(zone, file);
      
      document.getElementById('previewSection').style.display = 'block';
      document.getElementById('exportSection').style.display = 'flex';
      showToast(`Successfully loaded ${icons.length} icons`);
      refreshDisplay(appState);
      
    } catch (error) {
      console.error('Error parsing JSON:', error);
      showToast('Error parsing the file. Please ensure it\'s a valid selection.json');
    }
  };

  reader.onerror = function(error) {
    console.error('Error reading file:', error);
    showToast('Error reading the file');
  };

  reader.readAsText(file);
} 