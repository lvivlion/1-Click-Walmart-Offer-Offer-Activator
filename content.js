// Content script for Walmart Offer Activator
console.log('Walmart Offer Activator content script loaded');

let activatedCount = 0;
let isProcessing = false;

// Function to find all "Get this offer" buttons on the page
function findOfferButtons() {
  const buttons = [];
  
  console.log('=== Searching for offer buttons ===');
  console.log('Current URL:', window.location.href);
  
  // WALMART SPECIFIC: Look for the actual button/label structure
  // Based on the HTML pattern, look for labels with text "Get this offer"
  const allLabels = document.querySelectorAll('label');
  console.log(`Total labels on page: ${allLabels.length}`);
  
  allLabels.forEach((label, index) => {
    const labelText = label.textContent.trim();
    if (labelText === 'Get this offer' || labelText.includes('Get this offer')) {
      // Find the associated checkbox
      const checkbox = label.previousElementSibling || label.querySelector('input[type="checkbox"]') || document.getElementById(label.getAttribute('for'));
      
      if (checkbox && checkbox.type === 'checkbox' && !checkbox.checked) {
        console.log(`Found offer checkbox ${index + 1} via label:`, checkbox);
        buttons.push(checkbox);
      }
    }
  });
  
  // Method 2: Find all checkboxes in offer cards
  if (buttons.length === 0) {
    console.log('Method 1 failed, trying to find checkboxes in offer containers...');
    
    // Look for sections or divs that contain offer info
    const offerSections = document.querySelectorAll('section, div[class*="offer"], article');
    console.log(`Found ${offerSections.length} potential offer sections`);
    
    offerSections.forEach((section, index) => {
      const text = section.textContent;
      if (text.includes('Walmart Cash') && text.includes('Get this offer')) {
        const checkbox = section.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked && !buttons.includes(checkbox)) {
          console.log(`Found checkbox ${index + 1} in offer section:`, checkbox);
          buttons.push(checkbox);
        }
      }
    });
  }
  
  // Method 3: Direct approach - all unchecked checkboxes near "Walmart Cash"
  if (buttons.length === 0) {
    console.log('Method 2 failed, trying direct checkbox search...');
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log(`Total checkboxes found: ${allCheckboxes.length}`);
    
    allCheckboxes.forEach((checkbox, index) => {
      if (!checkbox.checked && !checkbox.disabled) {
        // Get the checkbox's parent container
        let parent = checkbox.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          const parentText = parent.textContent;
          if (parentText.includes('Walmart Cash') || parentText.includes('Get this offer')) {
            console.log(`Found relevant checkbox ${index + 1}:`, checkbox);
            if (!buttons.includes(checkbox)) {
              buttons.push(checkbox);
            }
            break;
          }
          parent = parent.parentElement;
        }
      }
    });
  }
  
  // Deduplicate
  const uniqueButtons = [...new Set(buttons)];
  console.log(`✅ Total unique offer buttons/checkboxes found: ${uniqueButtons.length}`);
  
  
  
  return uniqueButtons;
}

// Function to activate a single offer (NO DELAY)
function activateOfferFast(button) {
  console.log('Clicking offer button/checkbox...');
  
  try {
    button.click();
    activatedCount++;
    console.log(`✓ Click #${activatedCount} successful`);
    
    // Update UI immediately
    const countEl = document.getElementById('wa-count');
    if (countEl) {
      countEl.textContent = activatedCount;
    }
    
    return true;
  } catch (error) {
    console.error('✗ Click failed:', error);
    return false;
  }
}

// Function to activate all offers on current page (FAST - NO DELAYS)
async function activateAllOffersOnPage() {
  if (isProcessing) {
    console.log('Already processing offers...');
    return 0;
  }
  
  isProcessing = true;
  const buttons = findOfferButtons();
  console.log(`Found ${buttons.length} offers to activate`);
  
  let pageActivated = 0;
  const startCount = activatedCount;
  
  // Click ALL buttons rapidly with no delays
  buttons.forEach((button, index) => {
    const success = activateOfferFast(button);
    if (success) {
      pageActivated++;
    }
  });
  
  console.log(`✅ Clicked ${pageActivated} offers on this page`);
  
  // Save count once after all clicks
  chrome.storage.local.set({ activatedCount: activatedCount }, () => {
    console.log(`💾 Saved total count: ${activatedCount}`);
  });
  
  // Update extension badge
  chrome.runtime.sendMessage({
    type: 'updateCount',
    count: activatedCount
  });
  
  isProcessing = false;
  return pageActivated;
}

// Function to find and click next page button
function goToNextPage() {
  console.log('🔍 Looking for next page button...');

  const nextPageButton = document.querySelector('a[data-testid="NextPage"]');

  if (nextPageButton && !nextPageButton.hasAttribute('disabled')) {
    const href = nextPageButton.getAttribute('href');
    if (href && href !== '#') {
      console.log(`✅ Found next page button with href: ${href}. Navigating...`);
      window.location.href = href;
      return true;
    } else {
      console.log('✅ Found next page button with href="#". Clicking...');
      nextPageButton.click();
      return true;
    }
  } else if (nextPageButton && nextPageButton.hasAttribute('disabled')){
    console.log('❌ Next page button is disabled. Assuming this is the last page.');
    return false;
  } else {
    console.log('⚠️ No next page button found. Assuming end of pages.');
    return false;
  }
}

// Alternative: Check if there are more pages
function hasMorePages() {
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get('page')) || 1;
  
  // Look for highest page number in pagination
  const pageLinks = document.querySelectorAll('a[href*="page="]');
  let maxPage = currentPage;
  
  pageLinks.forEach(link => {
    const match = link.href.match(/page=(\d+)/);
    if (match) {
      const pageNum = parseInt(match[1]);
      if (pageNum > maxPage) {
        maxPage = pageNum;
      }
    }
  });
  
  console.log(`📊 Current page: ${currentPage}, Max page found in DOM: ${maxPage}`);
  
  // If no pagination found, check if there are any offers on this page
  // If there are no offers, we're likely past the last page
  const buttons = findOfferButtons();
  if (buttons.length === 0 && currentPage > 1) {
    console.log('⚠️ No offers found on this page - stopping');
    return false;
  }
  
  // If we found pagination links and current page is less than max, continue
  if (maxPage > currentPage) {
    console.log(`✓ More pages available (up to page ${maxPage})`);
    return true;
  }
  
  // If no pagination found but we have offers, try to go to next page
  // (Walmart might lazy-load pagination)
  if (buttons.length > 0 && maxPage === currentPage) {
    console.log('🤔 No pagination found but offers exist - will try next page');
    return true;
  }
  
  console.log('❌ No more pages');
  return false;
}

// Function to check if we're on the last page
function isLastPage() {
  // Use the hasMorePages function
  const morePages = hasMorePages();
  
  if (!morePages) {
    console.log('✓ This is the last page');
    return true;
  }
  
  console.log('✓ More pages available');
  return false;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startActivation') {
    activateAllOffersOnPage().then(count => {
      sendResponse({ success: true, count: count });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'startAutoActivation') {
    // Start the auto-activation process
    autoActivateAllPages();
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'getStatus') {
    sendResponse({
      activatedCount: activatedCount,
      isProcessing: isProcessing
    });
    return true;
  }
});

// Get max page number from pagination
function getMaxPageNumber() {
  const pageLinks = document.querySelectorAll('a[href*="page="]');
  let maxPage = 1;
  
  pageLinks.forEach(link => {
    const match = link.href.match(/page=(\d+)/);
    if (match) {
      const pageNum = parseInt(match[1]);
      if (pageNum > maxPage) {
        maxPage = pageNum;
      }
    }
  });
  
  // Also check for any text that might be a page number
  const allLinks = document.querySelectorAll('a');
  allLinks.forEach(link => {
    const text = link.textContent.trim();
    const num = parseInt(text);
    if (num && num > maxPage && num < 200) { // reasonable limit
      maxPage = num;
    }
  });
  
  return maxPage;
}

// Auto-activate all pages (robust navigation)
async function autoActivateAllPages() {
  console.log(`\n🎯 STARTING AUTO-ACTIVATION`);
  
  // Load stored values
  try {
    const storage = await chrome.storage.local.get(['activatedCount']);
    if (storage.activatedCount) {
      activatedCount = storage.activatedCount;
    }
  } catch (error) {
    console.error('❌ Storage read error:', error);
  }
  
  let currentPage = 1;
  
  while (true) {
    console.log(`\n=== 📄 PAGE ${currentPage} ===`);
    
    // Update popup status
    const statusEl = document.getElementById('wa-status');
    if (statusEl) {
      statusEl.textContent = `⚡ Activating page ${currentPage}...`;
    }
    
    // Activate all offers on the current page
    const count = await activateAllOffersOnPage();
    console.log(`✅ Activated ${count} offers | Running Total: ${activatedCount}`);
    
    // Update popup with total
    const countEl = document.getElementById('wa-count');
    if (countEl) {
      countEl.textContent = activatedCount;
    }
    
    
    
    // Short wait to let page process the clicks
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Try to go to the next page
    if (goToNextPage()) {
      currentPage++;
      console.log(`➡️ Navigating to page ${currentPage}...`);
      
      if (statusEl) {
        statusEl.textContent = `➡️ Loading page ${currentPage}...`;
      }
      
      // Wait for the new page to load
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('🏁 All pages completed!');
      finishAutoActivation();
      break;
    }
  }
}

// Helper function for reliable storage writes
async function saveStorage(data) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Finish auto-activation process
function finishAutoActivation() {
  console.log(`\n✅ COMPLETE! Total offers activated: ${activatedCount}`);
  
  const statusEl = document.getElementById('wa-status');
  if (statusEl) {
    statusEl.textContent = `✅ Complete! ${activatedCount} total offers activated`;
    statusEl.classList.remove('processing');
  }
  
  // Re-enable buttons
  const activatePageBtn = document.getElementById('wa-activate-page');
  const activateAllBtn = document.getElementById('wa-activate-all');
  if (activatePageBtn) activatePageBtn.disabled = false;
  if (activateAllBtn) activateAllBtn.disabled = false;
  
  chrome.runtime.sendMessage({
    type: 'completedAll',
    totalCount: activatedCount
  });
}

// Create floating action popup
function createFloatingPopup() {
  // Check if popup already exists
  if (document.getElementById('walmart-activator-popup')) {
    return;
  }
  
  const popup = document.createElement('div');
  popup.id = 'walmart-activator-popup';
  popup.innerHTML = `
    <style>
      #walmart-activator-popup {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #0071CE 0%, #004F9A 100%);
        color: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      #walmart-activator-popup .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      #walmart-activator-popup h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      #walmart-activator-popup .close-btn {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        transition: all 0.2s;
      }
      
      #walmart-activator-popup .close-btn:hover {
        background: rgba(255,255,255,0.3);
        transform: rotate(90deg);
      }
      
      #walmart-activator-popup .count {
        background: rgba(255,255,255,0.15);
        padding: 15px;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 15px;
      }
      
      #walmart-activator-popup .count-number {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      #walmart-activator-popup .count-label {
        font-size: 12px;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      #walmart-activator-popup button.action-btn {
        width: 100%;
        padding: 12px;
        margin-bottom: 8px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 13px;
        text-transform: uppercase;
      }
      
      #walmart-activator-popup button.primary {
        background: #FFC220;
        color: #0071CE;
      }
      
      #walmart-activator-popup button.primary:hover {
        background: #FFD04D;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255,194,32,0.4);
      }
      
      #walmart-activator-popup button.secondary {
        background: rgba(255,255,255,0.2);
        color: white;
      }
      
      #walmart-activator-popup button.secondary:hover {
        background: rgba(255,255,255,0.3);
      }

      #walmart-activator-popup button.coffee {
        background: #FFDD00;
        color: #000000;
      }
      
      #walmart-activator-popup button.coffee:hover {
        background: #FFEA4D;
      }
      
      #walmart-activator-popup button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }
      
      #walmart-activator-popup .status {
        font-size: 12px;
        text-align: center;
        margin-top: 10px;
        opacity: 0.9;
      }
      
      #walmart-activator-popup .status.processing {
        animation: pulse 1.5s infinite;
      }

      #walmart-activator-popup .info {
        font-size: 12px;
        text-align: center;
        margin-top: 10px;
        opacity: 0.9;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    </style>
    
    <div class="header">
      <h3>🎯 Offer Activator</h3>
      <button class="close-btn" id="wa-close">×</button>
    </div>
    
    <div class="count">
      <div class="count-number" id="wa-count">0</div>
      <div class="count-label">Offers Activated</div>
    </div>
    
    <button class="action-btn primary" id="wa-activate-all">
      🚀 Activate All Pages
    </button>
    
    <button class="action-btn secondary" id="wa-reset">
      Reset Counter
    </button>

    <div class="info">Like the extension?</div>
    <button class="action-btn coffee" id="wa-buy-me-a-coffee">
      ☕ Buy me a coffee
    </button>
    
    <div class="status" id="wa-status">Ready to activate offers</div>
  `;
  
  document.body.appendChild(popup);
  
  // Update count display
  chrome.storage.local.get(['activatedCount'], (result) => {
    document.getElementById('wa-count').textContent = result.activatedCount || 0;
  });
  
  // Close button
  document.getElementById('wa-close').addEventListener('click', () => {
    popup.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => popup.remove(), 300);
  });
  
  // Activate all pages
  document.getElementById('wa-activate-all').addEventListener('click', () => {
    const btn = document.getElementById('wa-activate-all');
    const status = document.getElementById('wa-status');
    
    btn.disabled = true;
    status.textContent = '🔄 Starting auto-activation...';
    status.classList.add('processing');
    
    autoActivateAllPages();
  });
  
  // Reset counter
  document.getElementById('wa-reset').addEventListener('click', () => {
    if (confirm('Reset the offer counter to 0?')) {
      chrome.storage.local.set({ activatedCount: 0 });
      activatedCount = 0;
      document.getElementById('wa-count').textContent = '0';
      document.getElementById('wa-status').textContent = 'Counter reset to 0';
    }
  });

  // Buy me a coffee
  document.getElementById('wa-buy-me-a-coffee').addEventListener('click', () => {
    window.open('https://buymeacoffee.com/ost4p', '_blank');
  });
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Update popup count when offers are activated
const originalActivateOffer = activateOffer;
async function activateOffer(button) {
  await originalActivateOffer(button);
  const countEl = document.getElementById('wa-count');
  if (countEl) {
    countEl.textContent = activatedCount;
  }
}

// Initialize
chrome.storage.local.get(['activatedCount'], (result) => {
  if (result.activatedCount) {
    activatedCount = result.activatedCount;
  }
});

// Check if auto-activation is in progress when page loads
chrome.storage.local.get(['autoActivateInProgress', 'autoActivateNextPage', 'autoActivateMaxPages'], (result) => {
  console.log('📦 Checking storage on page load:', result);
  
  if (result.autoActivateInProgress && result.autoActivateNextPage) {
    const currentPage = result.autoActivateNextPage;
    const maxPages = result.autoActivateMaxPages || 100;
    console.log(`\n🔄 AUTO-RESUME DETECTED!`);
    console.log(`📄 Resuming on page ${currentPage}/${maxPages}`);
    console.log(`🌐 Current URL: ${window.location.href}`);
    
    // Clear the flag using saveStorage
    saveStorage({ autoActivateInProgress: false }).then(() => {
      console.log('✓ Cleared inProgress flag');
      
      // Wait for page to fully load, then continue
      setTimeout(() => {
        console.log('⏱️ Creating popup...');
        createFloatingPopup();
        
        // Continue auto-activation from where we left off
        setTimeout(() => {
          console.log(`⚡ Resuming auto-activation on page ${currentPage}...`);
          autoActivateAllPages(currentPage);
        }, 1000);
      }, 1500);
    }).catch(error => {
      console.error('❌ Error clearing inProgress flag:', error);
    });
  } else {
    console.log('ℹ️ No auto-activation in progress - showing normal popup');
    console.log(`   autoActivateInProgress: ${result.autoActivateInProgress}`);
    console.log(`   autoActivateNextPage: ${result.autoActivateNextPage}`);
    
    // Normal popup display
    setTimeout(() => {
      createFloatingPopup();
    }, 1500);
  }
});
