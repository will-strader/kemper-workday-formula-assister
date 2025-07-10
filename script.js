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
  const categories = Object.entries(categoryGroups);

  // Helper: generate all combinations (cartesian product)
  function cartesianProduct(arrays) {
    return arrays.reduce((acc, curr) => {
      const result = [];
      for (const a of acc) {
        for (const b of curr) {
          result.push([...a, b]);
        }
      }
      return result;
    }, [[]]);
  }

  // Convert categoryGroups into array of [cat, val] tuples
  const catValArrays = categories.map(([cat, vals]) =>
    vals.map(val => {
      // Replace (Uncategorized) if category name matches value prefix
      const normalizedVal = val.includes("(Uncategorized)") && val.includes(cat)
        ? "(-)"
        : `${cat}=${val}`;
      return normalizedVal;
    })
  );

  const combinations = cartesianProduct(catValArrays);

  // Build each filter line
  const lines = combinations.map(group => {
    return `ACCT.${account}[${group.join(", ")}]`;
  });

  return lines.join(" +\n");
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

// Level selector modal
// This part allows users to select levels from a predefined list and insert them into the textarea
// It uses a modal dialog to display the list of levels and allows searching through them
// Define the nested levels structure
const nestedLevels = {
  "Top Level": {
    code: "level=Top Level(+)",
    children: {
      "All P&C and L&H Segments": {
        code: "level=BUSINESS_UNIT_HIERARCHY-6-1(+)",
        children: {
          "Corporate": {
            code: "level=BUSINESS_UNIT_HIERARCHY-3-13(+)",
            children: {
              "Corporate and Other": { code: "level=BU_8001(+)", children: {} }
            }
          },
          "L&H Segments": {
            code: "level=BUSINESS_UNIT_HIERARCHY-6-2(+)",
            children: {
              "P&C in L&H Segment": {
                code: "level=BUSINESS_UNIT_HIERARCHY-6-11(+)",
                children: {
                  "Fire": { code: "level=BU_6001(+)", children: {} }
                }
              },
              "Accident & Health": {
                code: "level=BUSINESS_UNIT_HIERARCHY-6-4(+)",
                children: {
                  "A&H - Group": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-6-9(+)",
                    children: {
                      "Group Accident & Health": { code: "level=BU_5001(+)", children: {} }
                    }
                  },
                  "A&H - Other Individual Contracts": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-6-10(+)",
                    children: {
                      "OIC-Non-Cancelable": { code: "level=BU_5002(+)", children: {} },
                      "OIC-Guaranteed Renewable": { code: "level=BU+5003(+)", children: {} },
                      "OIC-Non-renewable for state reasons": { code: "level=BU_5004(+)", children: {} },
                      "OIC-All other": { code: "level=BU_5006(+)", children: {} }
                    }
                  }
                }
              },
              "Life & Annuities": {
                code: "level=BUSINESS_UNIT_HIERARCHY-6-8(+)",
                children: {
                  "Life": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-3-25(+)",
                    children: {
                      "Industrial Life": {
                        code: "level=BUSINESS_UNIT_HIERARCHY-6-13(+)",
                        children: {
                          "Industrial Life": { code: "level=BU_4001(+)", children: {} }
                        }
                      },
                      "Ordinary Life Insurance": {
                        code: "level=BUSINESS_UNIT_HIERARCHY-6-14(+)",
                        children: {
                          "Ordinary Life Insurance": { code: "level=BU_4002(+)", children: {} },
                          "Ordinary Supplemental Contracts": { code: "level=BU_4004(+)", children: {} },
                          "Claims Enhancement Initiatives": { code: "level=BU_4007(+)", children: {} }
                        }
                      },
                      "Group Life": {
                        code: "level=BUSINESS_UNIT_HIERARCHY-6-16(+)",
                        children: {
                          "Group Life Insurance": { code: "level=BU_4005(+)", children: {} }
                        }
                      }
                    }
                  },
                  "Annuities": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-3-26(+)",
                    children: {
                      "Individual Annuities": {
                        code: "level=BUSINESS_UNIT_HIERARCHY-6-15(+)",
                        children: {
                          "Ordinary Individual Annuities": { code: "level=BU_4003(+)", children: {} }
                        }
                      },
                      "Group Annuities": {
                        code: "level=BUSINESS_UNIT_HIERARCHY-6-17(+)",
                        children: {
                          "Group Annuities": { code: "level=BU_4006(+)", children: {} }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "P&C Segments": {
            code: "level=BUSINESS_UNIT_HIERARCHY-6-3(+)",
            children: {
              "Specialty": {
                code: "level=BUSINESS_UNIT_HIERARCHY-6-6(+)",
                children: {
                  "Specialty Personal Auto": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-3-14(+)",
                    children: {
                      "NSA - Private Passenger Auto": { code: "level=BU_1001(+)", children: {} },
                      "Classic Collectors": { code: "level=BU_1003(+)", children: {} },
                      "NSA - Endorsements": { code: "level=BU_1002(+)", children: {} },
                      "Workers Compensation": { code: "level=BU_1004(+)", children: {} }
                    }
                  },
                  "Commercial Auto": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-3-15(+)",
                    children: {
                      "Commercial Vehicle": { code: "level=BU_2001(+)", children: {} },
                      "Discontinued Ops - CV": { code: "level=BU_7003(+)", children: {} }
                    }
                  },
                  "Other": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-3-16(+)",
                    children: {
                      "NSA - Personal": { code: "level=BU_1005(+)", children: {} }
                    }
                  }
                }
              },
              "Preferred": {
                code: "level=BUSINESS_UNIT_HIERARCHY-6-7(+)",
                children: {
                  "Standard Personal Auto": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-3-17(+)",
                    children: {
                      "Preferred - Private Passenger Auto": { code: "level=BU_3001(+)", children: {} },
                      "Discontinued Ops - P&C": { code: "level=BU_7001(+)", children: {} },
                      "Discontinued Ops - PPA": { code: "level=BU_7002(+)", children: {} }
                    }
                  },
                  "Homeowners": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-3-18(+)",
                    children: {
                      "Preferred - Home": { code: "level=BU_3002(+)", children: {} }
                    }
                  },
                  "Other Personal Insurance": {
                    code: "level=BUSINESS_UNIT_HIERARCHY-3-19(+)",
                    children: {
                      "Preferred - Umbrella": { code: "level=BU_3003(+)", children: {} },
                      "Preferred - Endorsements": { code: "level=BU_3004(+)", children: {} }
                    }
                  },
                  "Preferred - Fire": { code: "level=BU_3005(+)", children: {} }
                }
              }
            }
          },
          "Discontinued Ops": {
            code: "level=BUSINESS_UNIT_HIERARCHY-6-5(+)",
            children: {
              "P&C - Discontinued Ops": { code: "level=BUSINESS_UNIT_HIERARCHY-6-12(+)", children: {} }
            }
          }
        }
      }
    }
  }
};


function renderTree(container, tree, parentKey = '', expanded = false) {
  for (const [label, node] of Object.entries(tree)) {
    const row = document.createElement('div');
    row.className = 'tree-row';

    const expandBtn = document.createElement('span');
    expandBtn.className = 'expand-btn';

    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = selectedLevels.has(node.code) ? 'selected small-btn' : 'small-btn';
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (selectedLevels.has(node.code)) {
        selectedLevels.delete(node.code);
        btn.classList.remove('selected');
      } else {
        selectedLevels.add(node.code);
        btn.classList.add('selected');
      }
    });

    let childContainer;
    const hasChildren = Object.keys(node.children).length > 0;
    if (hasChildren) {
      expandBtn.textContent = expanded ? '–' : '+';
      childContainer = document.createElement('div');
      childContainer.style.marginLeft = '20px';
      childContainer.className = 'tree-children';
      if (!expanded) {
        childContainer.classList.add('hidden');
      }

      expandBtn.addEventListener('click', e => {
        e.stopPropagation();
        const isHidden = childContainer.classList.toggle('hidden');
        expandBtn.textContent = isHidden ? '+' : '–';
      });

      renderTree(childContainer, node.children, `${parentKey}/${label}`, expanded);
    }

    row.appendChild(expandBtn);
    row.appendChild(btn);
    container.appendChild(row);

    if (childContainer) {
      container.appendChild(childContainer);
    }
  }
}

function renderLevelList(filter = '') {
  listContainer.innerHTML = '';
  const applyFilter = (tree) => {
    const filtered = {};
    for (const [label, node] of Object.entries(tree)) {
      const matches = label.toLowerCase().includes(filter.toLowerCase());
      const childMatches = applyFilter(node.children);
      if (matches || Object.keys(childMatches).length > 0) {
        filtered[label] = {
          ...node,
          children: childMatches
        };
      }
    }
    return filtered;
  };
  const filteredTree = filter ? applyFilter(nestedLevels) : nestedLevels;
  renderTree(listContainer, filteredTree, '', !!filter);
}

const modal = document.getElementById('levelSelectorModal');
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

modal.querySelector('.modal-content').addEventListener('click', e => {
  e.stopPropagation();
});
const openBtn = document.getElementById('openLevelSelector');
const confirmBtn = document.getElementById('confirmLevelSelection');
const searchInput = document.getElementById('levelSearch');
const listContainer = document.getElementById('levelList');
const textarea = document.getElementById('levels');

let selectedLevels = new Set();


openBtn.onclick = () => {
  modal.classList.remove('hidden');
  renderLevelList();
};

searchInput.oninput = () => renderLevelList(searchInput.value);

confirmBtn.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();

  textarea.value = Array.from(selectedLevels).join('\n');

  // Hide modal
  modal.classList.add('hidden');

  // Clear search input and rerender full list
  searchInput.value = '';
  renderLevelList();
});

// Add support for "Clear" button to clear all selected level options
const clearBtn = document.getElementById('clearLevelSelection');

clearBtn.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();

  selectedLevels.clear();
  renderLevelList(searchInput.value); // rerender based on current search filter
});
