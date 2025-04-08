// Function to update icon counter
function updateIconCounter(count) {
    const iconCounter = document.getElementById('iconCount');
    if (iconCounter) {
        iconCounter.innerHTML = `<span>${count}</span> icons loaded`;
    }
}

// Preview modal functionality
const modal = document.getElementById('previewModal');
const closeBtn = document.querySelector('.close-modal');

function showPreviewModal(iconElement, iconName) {
    const modalIconPreview = document.querySelector('.preview-icon');
    const iconInfo = document.querySelector('.icon-info');
    
    // Clone the icon and adjust its size
    const iconClone = iconElement.cloneNode(true);
    modalIconPreview.innerHTML = '';
    modalIconPreview.appendChild(iconClone);
    
    // Set icon information
    iconInfo.textContent = `Icon Name: ${iconName}`;
    
    // Show modal
    modal.style.display = 'block';
}

// Close modal when clicking the close button or outside the modal
closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Update the processFile function to include icon counter
function processFile(file) {
    // ... existing code ...
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const icons = data.icons || [];
            
            // Update icon counter
            updateIconCounter(icons.length);
            
            // ... rest of the existing code ...
            
            // Add click handlers for preview
            document.querySelectorAll('.preview-grid .icon-item').forEach(icon => {
                icon.onclick = function() {
                    const iconName = this.getAttribute('data-name') || 'Unknown';
                    showPreviewModal(this.querySelector('i'), iconName);
                }
            });
            
            document.querySelectorAll('#outputTable td:nth-child(3)').forEach(cell => {
                cell.onclick = function() {
                    const iconName = this.parentElement.querySelector('td:first-child').textContent;
                    showPreviewModal(this.querySelector('i'), iconName);
                }
            });
            
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing the file. Please make sure it\'s a valid IcoMoon selection.json file.');
        }
    };
    
    // ... existing code ...
}

// ... existing code ... 