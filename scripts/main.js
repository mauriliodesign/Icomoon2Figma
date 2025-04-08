// Function to update icon counter
function updateIconCounter(count) {
    const iconCounter = document.getElementById('iconCount');
    if (iconCounter) {
        iconCounter.innerHTML = `<span>${count}</span> icons loaded`;
    }
}

// Remove all preview modal functionality

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
            
            // Remove click handlers for preview
            
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing the file. Please make sure it\'s a valid IcoMoon selection.json file.');
        }
    };
    
    // ... existing code ...
}

// ... existing code ... 