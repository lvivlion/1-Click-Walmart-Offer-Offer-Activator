// Paste this in browser console on Walmart offers page to test pagination

console.log('=== Testing Pagination Detection ===\n');

// Test 1: Check for pagination container
const paginationContainer = document.querySelector('nav[aria-label*="pagination"], div[role="navigation"]');
console.log('Pagination container:', paginationContainer);

// Test 2: Check for next button
const nextButtons = document.querySelectorAll('a[aria-label*="next"], button[aria-label*="next"]');
console.log('Next buttons found:', nextButtons.length);
nextButtons.forEach((btn, i) => {
  console.log(`  Button ${i+1}:`, btn.textContent, btn.getAttribute('aria-label'));
});

// Test 3: Check for page links
const pageLinks = document.querySelectorAll('a[href*="page="]');
console.log('Page links found:', pageLinks.length);
pageLinks.forEach((link, i) => {
  console.log(`  Link ${i+1}: Page`, link.textContent.trim(), '- URL:', link.href);
});

// Test 4: Check current page
const currentPage = document.querySelector('[aria-current="page"]');
console.log('Current page:', currentPage ? currentPage.textContent : 'Not found');

// Test 5: Look for chevron icons
const chevrons = document.querySelectorAll('i[class*="Chevron"], svg[class*="chevron"]');
console.log('Chevron icons found:', chevrons.length);

// Test 6: Try to find pagination by looking at bottom of page
const allLinks = Array.from(document.querySelectorAll('a'));
const paginationLinks = allLinks.filter(link => {
  const text = link.textContent.trim();
  return /^\d+$/.test(text) && parseInt(text) > 0;
});
console.log('\nNumeric links (possible pagination):', paginationLinks.length);
paginationLinks.slice(0, 10).forEach(link => {
  console.log(`  Page ${link.textContent}: ${link.href}`);
});
