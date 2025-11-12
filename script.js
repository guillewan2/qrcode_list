// Constants
const QR_STORAGE_KEY = 'qrCodeHistory';
const MAX_HISTORY_ITEMS = 50;

// DOM Elements
const urlInput = document.getElementById('urlInput');
const generateBtn = document.getElementById('generateBtn');
const qrcodeContainer = document.getElementById('qrcode');
const downloadBtn = document.getElementById('downloadBtn');
const qrHistory = document.getElementById('qrHistory');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});

// Event Listeners
generateBtn.addEventListener('click', generateQRCode);
urlInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        generateQRCode();
    }
});

// Generate QR Code
function generateQRCode() {
    const url = urlInput.value.trim();
    if (!url) {
        alert('Please enter a URL or text');
        return;
    }

    qrcodeContainer.innerHTML = '';
    const qrcode = new QRCode(qrcodeContainer, {
        text: url,
        width: 192,
        height: 192,
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(function() {
        const canvas = qrcodeContainer.getElementsByTagName('canvas')[0];
        const imageData = canvas.toDataURL('image/png');
        
        downloadBtn.href = imageData;
        downloadBtn.download = 'qrcode.png';
        downloadBtn.style.display = 'flex';

        // Save to history
        saveToHistory(url, imageData);
        loadHistory();
    }, 50);
}

// Save to localStorage
function saveToHistory(text, imageData) {
    let history = getHistory();
    
    // Check if already exists (to avoid duplicates)
    const exists = history.some(item => item.text === text);
    if (exists) {
        return;
    }
    
    const newItem = {
        id: Date.now(),
        text: text,
        imageData: imageData,
        timestamp: new Date().toISOString()
    };

    history.unshift(newItem);

    // Keep only the last MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(history));
}

// Get history from localStorage
function getHistory() {
    const stored = localStorage.getItem(QR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Load and display history
function loadHistory() {
    const history = getHistory();
    qrHistory.innerHTML = '';

    if (history.length === 0) {
        qrHistory.innerHTML = '<div class="empty-state">No QR codes generated yet</div>';
        return;
    }

    history.forEach(item => {
        const qrItem = createHistoryItem(item);
        qrHistory.appendChild(qrItem);
    });
}

// Create history item element
function createHistoryItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'qr-item';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'qr-item-image';

    // Create QR code
    const qrCanvas = document.createElement('div');
    qrCanvas.style.width = '90px';
    qrCanvas.style.height = '90px';
    
    new QRCode(qrCanvas, {
        text: item.text,
        width: 90,
        height: 90,
        correctLevel: QRCode.CorrectLevel.H
    });

    imageDiv.appendChild(qrCanvas);

    const textDiv = document.createElement('div');
    textDiv.className = 'qr-item-text';
    textDiv.textContent = truncateText(item.text, 20);
    textDiv.title = item.text;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'qr-item-actions';

    const downloadItemBtn = document.createElement('button');
    downloadItemBtn.className = 'qr-item-btn';
    downloadItemBtn.textContent = 'Download';
    downloadItemBtn.addEventListener('click', function() {
        downloadQRCode(item.text, item.imageData);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'qr-item-btn qr-item-btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
        deleteFromHistory(item.id);
    });

    actionsDiv.appendChild(downloadItemBtn);
    actionsDiv.appendChild(deleteBtn);

    itemDiv.appendChild(imageDiv);
    itemDiv.appendChild(textDiv);
    itemDiv.appendChild(actionsDiv);

    return itemDiv;
}

// Truncate text
function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Download QR Code
function downloadQRCode(text, imageData) {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Delete from history
function deleteFromHistory(id) {
    let history = getHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(history));
    loadHistory();
}