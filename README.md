# Walmart Offer Activator Chrome Extension

A Chrome extension that automatically activates all Walmart Cash manufacturer offers and tracks the count across multiple pages.

## Features

- ✅ **Auto-Activate Offers**: Automatically clicks all "Get this offer" buttons on the current page
- 🔄 **Multi-Page Support**: Automatically navigates through all offer pages
- 📊 **Live Counter**: Tracks total number of offers activated
- 💾 **Persistent Count**: Saves your progress across browser sessions
- 🎨 **Modern UI**: Beautiful, easy-to-use popup interface

## Installation

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Download or Clone** this repository to your computer

2. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/` in your Chrome browser
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked" button
   - Navigate to the `walmart-offer-activator` folder
   - Select the folder and click "Select Folder"

5. **Extension Loaded!**
   - You should see the "Walmart Offer Activator" extension card
   - Pin it to your toolbar for easy access

## Usage

### Basic Usage

1. **Navigate to Walmart Offers**:
   - Go to https://www.walmart.com/offer/all-offers
   - Make sure you're logged into your Walmart account

2. **Open Extension Popup**:
   - Click the extension icon in your toolbar
   - The popup will show the current count of activated offers

3. **Choose Activation Mode**:

   **Option A: Current Page Only**
   - Click "Activate Current Page" button
   - Extension will activate all offers visible on the current page
   
   **Option B: All Pages Automatically**
   - Click "Auto-Activate All Pages" button
   - Extension will activate all offers and automatically navigate to next pages
   - Process continues until all pages are complete

4. **Monitor Progress**:
   - Watch the counter increment as offers are activated
   - Status messages show current progress
   - Badge on extension icon shows total count

### Resetting Counter

- Click the "Reset Counter" button in the popup
- Confirm the reset when prompted
- Counter will be set back to 0

## How It Works

1. **Content Script**: Runs on Walmart offer pages and finds all "Get this offer" buttons
2. **Auto-Click**: Simulates clicks on each button with a small delay
3. **Count Tracking**: Saves count to Chrome storage for persistence
4. **Pagination**: Automatically detects and clicks "Next" button to move through pages
5. **Completion**: Stops when last page is reached or no more offers are found

## Technical Details

### Files Structure

```
walmart-offer-activator/
├── manifest.json       # Extension configuration
├── content.js         # Main logic for activating offers
├── popup.html         # Extension popup interface
├── popup.js           # Popup interaction logic
├── background.js      # Service worker for badge updates
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
└── README.md          # This file
```

### Permissions Required

- `storage`: To save activated offer count
- `activeTab`: To interact with current Walmart offer page
- `scripting`: To inject content script
- `https://www.walmart.com/*`: To access Walmart pages

## Troubleshooting

### Extension Not Working

1. **Refresh the Page**: After installing, refresh the Walmart offers page
2. **Check Login**: Make sure you're logged into your Walmart account
3. **Correct Page**: Verify you're on the offers page (URL contains `/offer/`)
4. **Console Errors**: Open browser console (F12) and check for error messages

### Offers Not Activating

1. **Already Claimed**: Some offers may already be activated
2. **Rate Limiting**: Walmart may temporarily block requests if too many are made
3. **Page Loading**: Wait for page to fully load before activating

### Counter Not Updating

1. **Storage Permissions**: Check if extension has storage permission
2. **Reset Counter**: Try resetting the counter and starting fresh

## Limitations

- Only works on Walmart.com offer pages
- Requires active internet connection
- May be affected by Walmart's rate limiting
- Buttons must be visible and enabled to be clicked

## Privacy & Security

- This extension only works on Walmart.com
- No data is collected or sent to external servers
- All data stored locally in Chrome storage
- Open source - you can review all code

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Ensure you're using the latest version of Chrome

## Disclaimer

This extension is for educational purposes. Use responsibly and in accordance with Walmart's Terms of Service. The author is not responsible for any misuse or violations.

## Version History

### v1.0.0 (2025)
- Initial release
- Auto-activation of offers
- Multi-page navigation
- Persistent counter
- Modern UI

## License

MIT License - Feel free to modify and distribute

---

Made with ❤️ for easier Walmart offer activation
