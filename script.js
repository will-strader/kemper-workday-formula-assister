function getInputValues(id) {
    const raw = document.getElementById(id).value;
    return raw.split('\n').map(v => v.trim()).filter(v => v !== "");  
  }

  function parseCategoryGroups(values) {
    const categoryGroups = {};
  
    for (const line of values) {
      const [category, fieldValue] = line.split("=");

      if (!category || !fieldValue) continue;

      const cleanedValue = fieldValue.replace("(Uncategorized)", "(-)");

      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(cleanedValue);  
    }

    return categoryGroups;
}
  function buildAccountFilter(account, categoryGroups) {  
    const groupBlocks = [];

    for (const [category, values] of Object.entries(categoryGroups)) {
      const lines = values.map(val => `ACCT.${account}[${category}=${val}]`);
      const group = lines.join(" +\n");
      groupBlocks.push(`(${group})`);  
    }

    return groupBlocks.join(" \n * \n ");  
  }

  function generateFilter() {
    const accounts = getInputValues("accounts");
    const levels = parseCategoryGroups(getInputValues("levels"));
    const dimensions = parseCategoryGroups(getInputValues("dimensions"));
    const levelAttributes = parseCategoryGroups(getInputValues("levelAttributes"));
    const dimensionAttributes = parseCategoryGroups(getInputValues("dimensionAttributes"));  
    const allGroups = [levels, dimensions, levelAttributes, dimensionAttributes];
  
    const fullOutput = accounts.map(account => {
      // Merge all category groups together
      const mergedGroups = Object.assign({}, ...allGroups);
      const filterBlock = buildAccountFilter(account, mergedGroups);
      return `(${filterBlock})`;
    });

    document.getElementById("output").textContent = fullOutput.join(" +\n\n");
  }