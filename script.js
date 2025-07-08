// Small helpers
function getInputValues(id) {
  // Split on newlines → trim → drop blanks
  return document
    .getElementById(id)
    .value.split('\n')
    .map(v => v.trim())
    .filter(Boolean);
}
// “Corp=Corp-Alloc HR”  ->  { Corp: ["Corp-Alloc HR"] }
function parseCategoryGroups(lines) {
  const groups = {};
  for (const raw of lines) {
    const [category, field] = raw.split('=');
    if (!category || !field) continue;  // ignore malformed lines
    const val = field.replace('(Uncategorized)', '(-)');
    (groups[category] = groups[category] || []).push(val);
  }
  return groups;
}
// Deep-merge objects so duplicate categories concatenate instead of overwrite
function mergeGroups(...groupObjs) {
  const merged = {};
  for (const obj of groupObjs) {
    for (const [cat, arr] of Object.entries(obj)) {
      merged[cat] = [...new Set([...(merged[cat] || []), ...arr])];
    }
  }
  return merged;
}
// Core builders
function buildAccountFilter(account, categoryGroups) {
  const blocks = Object.entries(categoryGroups).map(([cat, vals]) => {
    const inner = vals.map(v => `ACCT.${account}[${cat}=${v}]`).join(' +\n');
    return `(${inner})`;
  });
  return blocks.join('\n * \n');
}
// Main controller
function generateFilter() {
  const accounts    = getInputValues('accounts');
  if (accounts.length === 0) {
    return (document.getElementById('output').textContent =
      'Please enter at least one account.');
  }
  const levels              = parseCategoryGroups(getInputValues('levels'));
  const dimensions          = parseCategoryGroups(getInputValues('dimensions'));
  const levelAttributes     = parseCategoryGroups(getInputValues('levelAttributes'));
  const dimensionAttributes = parseCategoryGroups(getInputValues('dimensionAttributes'));
  const merged = mergeGroups(levels, dimensions, levelAttributes, dimensionAttributes);
  const result = accounts
    .map(acct => `(${buildAccountFilter(acct, merged)})`)
    .join(' +\n\n');
  document.getElementById('output').textContent = result;
}
// (Optional) copy helper
function copyOutput() {
  const text = document.getElementById('output').textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    // Give users a tiny bit of feedback
    alert('Filter copied to clipboard ✔️');
  });
}
//  Attach copy helper
document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyFilter');
  if (copyBtn) copyBtn.addEventListener('click', copyOutput);
});