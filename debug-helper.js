// PASTE THIS IN CONSOLE TO DEBUG WALMART OFFERS PAGE
// This will show you exactly what elements exist

console.log('🔍 WALMART OFFERS PAGE DEBUGGER\n');

// 1. Check all checkboxes
const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
console.log(`📦 Total checkboxes: ${allCheckboxes.length}`);
allCheckboxes.forEach((cb, i) => {
  const label = document.querySelector(`label[for="${cb.id}"]`);
  const labelText = label ? label.textContent.trim() : 'No label';
  console.log(`  Checkbox ${i+1}: ${labelText.substring(0, 50)}`, cb);
});

// 2. Check all labels
const allLabels = document.querySelectorAll('label');
console.log(`\n🏷️ Total labels: ${allLabels.length}`);
let offerLabels = 0;
allLabels.forEach((label, i) => {
  const text = label.textContent.trim();
  if (text.includes('Get this offer')) {
    offerLabels++;
    console.log(`  ✓ Offer label ${offerLabels}: "${text}"`, label);
  }
});

// 3. Check buttons
const allButtons = document.querySelectorAll('button');
console.log(`\n🔘 Total buttons: ${allButtons.length}`);
let offerButtons = 0;
allButtons.forEach((btn, i) => {
  const text = btn.textContent.trim();
  if (text.includes('Get this offer')) {
    offerButtons++;
    console.log(`  ✓ Offer button ${offerButtons}: "${text}"`, btn);
  }
});

// 4. Try to click first offer
console.log('\n🎯 Attempting to click first offer...');
const firstLabel = Array.from(allLabels).find(l => l.textContent.includes('Get this offer'));
if (firstLabel) {
  console.log('Found label:', firstLabel);
  const checkbox = firstLabel.previousElementSibling || firstLabel.querySelector('input') || document.getElementById(firstLabel.getAttribute('for'));
  if (checkbox) {
    console.log('Found checkbox:', checkbox);
    console.log('Checkbox checked before:', checkbox.checked);
    checkbox.click();
    console.log('Checkbox checked after:', checkbox.checked);
  } else {
    console.log('❌ No checkbox found for label');
  }
} else {
  console.log('❌ No offer label found');
}

console.log('\n✅ Debug complete!');
