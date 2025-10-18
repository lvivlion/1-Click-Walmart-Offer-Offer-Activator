// Popup script for Walmart Offer Activator
const offerCountEl = document.getElementById('offerCount');
const statusEl = document.getElementById('status');
const goToWalmartBtn = document.getElementById('goToWalmartBtn');
const autoActivateBtn = document.getElementById('autoActivateBtn');
const resetBtn = document.getElementById('resetBtn');

// Load saved count on popup open
chrome.storage.local.get(['activatedCount'], (result) => {
  if (result.activatedCount) {
    offerCountEl.textContent = result.activatedCount;
  }
});

// Update count display
function updateCount(count) {
  offerCountEl.textContent = count;
  chrome.storage.local.set({ activatedCount: count });
}

// Update status message
function updateStatus(message, isProcessing = false) {
  statusEl.textContent = message;
  if (isProcessing) {
    statusEl.classList.add('processing');
    statusEl.innerHTML = '<span class="spinner"></span>' + message;
  } else {
    statusEl.classList.remove('processing');
  }
}

// Check if current tab is on Walmart offers page
async function checkCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url || !tab.url.includes('walmart.com/offer')) {
    autoActivateBtn.disabled = true;
    updateStatus('⚠️ Please navigate to Walmart offers page');
    return false;
  }
  
  autoActivateBtn.disabled = false;
  return true;
}

// Go to Walmart offers page
goToWalmartBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.walmart.com/offer/all-offers' });
});

// Auto-activate all pages
autoActivateBtn.addEventListener('click', async () => {
  const isValid = await checkCurrentPage();
  if (!isValid) return;
  
  autoActivateBtn.disabled = true;
  updateStatus('Auto-activating all pages...', true);
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'startAutoActivation' }, (response) => {
    if (chrome.runtime.lastError) {
      updateStatus('❌ Error: Please refresh the page');
      autoActivateBtn.disabled = false;
      return;
    }
    
    if (response && response.success) {
      updateStatus('🔄 Processing... Check console for progress', true);
    }
  });
});

// Reset counter
resetBtn.addEventListener('click', () => {
  if (confirm('Reset the offer counter to 0?')) {
    chrome.storage.local.set({ activatedCount: 0 });
    updateCount(0);
    updateStatus('Counter reset to 0');
  }
});

buyMeACoffeeBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://buymeacoffee.com/ost4p' });
});

// Listen for count updates from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateCount') {
    updateCount(request.count);
  }
  
  if (request.type === 'completedAll') {
    updateStatus(`✅ Completed! Total: ${request.totalCount} offers activated`);
    autoActivateBtn.disabled = false;
  }
});

// Check page status on load
checkCurrentPage();

// Refresh status every 2 seconds
setInterval(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && tab.url && tab.url.includes('walmart.com/offer')) {
    chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
      if (response && response.isProcessing) {
        chrome.storage.local.get(['activatedCount'], (result) => {
          updateCount(result.activatedCount || 0);
        });
      }
    });
  }
}, 2000);
