// Background service worker for Walmart Offer Activator

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Walmart Offer Activator installed');
  
  // Initialize storage
  chrome.storage.local.set({
    activatedCount: 0
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateCount') {
    // Update badge with count
    chrome.action.setBadgeText({ 
      text: request.count.toString(),
      tabId: sender.tab.id 
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: '#FFC220',
      tabId: sender.tab.id 
    });
  }
  
  if (request.type === 'completedAll') {
    // Show completion notification
    chrome.action.setBadgeText({ 
      text: '✓',
      tabId: sender.tab.id 
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: '#00A82D',
      tabId: sender.tab.id 
    });
  }
});

// Update badge when tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  
  if (tab.url && tab.url.includes('walmart.com/offer')) {
    chrome.storage.local.get(['activatedCount'], (result) => {
      const count = result.activatedCount || 0;
      if (count > 0) {
        chrome.action.setBadgeText({ 
          text: count.toString(),
          tabId: activeInfo.tabId 
        });
        chrome.action.setBadgeBackgroundColor({ 
          color: '#FFC220',
          tabId: activeInfo.tabId 
        });
      }
    });
  } else {
    chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
  }
});
