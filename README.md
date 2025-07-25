# Workday Account Generator

A lightweight, **client‑side** tool used by Kemper BI analysts build formula strings for *Workday Adaptive Planning* without touching the Adaptive system.

---

## Features

| Module | What it does | Output example |
|--------|--------------|----------------|
| **Filter Formula Generator** | Combines Accounts, Levels, Dimensions, and their Attributes into Workday‑ready filter logic. Supports multi‑select level & dimension pickers, dynamic text areas, and one‑click copy. | `(ACCT.Revenue[Level=Corp] + …) * (ACCT.Revenue[WD_Business_Unit=Claims] + …)` |
| **Percentage Formula Generator** | Generates simple div() ratios between two accounts. | `div(ACCT.Revenue, ACCT.Total_Premium)` |

Both modules run entirely in the browser. No back‑end, no authentication, no data leaves your machine.

---

## Quick start

```bash
# clone & open locally
git clone https://github.com/your‑org/kemper-workday-formula-assister.git
cd kemper-workday-formula-assister

# launch a simple dev server (optional)
npx serve .
```

Then open **index.html** in your browser (or via the local dev server) and start building formulas.

---

## Tech stack

* **HTML / vanilla JS / CSS** – zero frameworks for maximal portability  
* Custom modal components + CSS variables for Kemper color tokens  
* Clipboard API for one‑click copy

---

## Local development

1. Edit **`/script.js`** or **`/style.css`** – changes hot‑reload if you use a dev server.
2. Keep styling consistent by re‑using the CSS variables in `:root`.
3. Commit and push—GitHub Pages or Azure Static Web Apps will serve the latest build.

---

## Contributing

Pull requests are welcome! Please open an issue first if you plan major changes.

1. Fork the repo & create a feature branch  
2. Write clear, concise commit messages  
3. Ensure ESLint passes (`npm run lint`, if configured)  
4. Open a PR with context and screenshots

---

## License

MIT © Kemper BI Team