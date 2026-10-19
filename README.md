# aryavsparihar.github.io

Personal academic site for Aryaveer Singh Parihar, live at **https://aryavsparihar.in**. Plain HTML/CSS/JS, no build step.

The custom domain is set by the `CNAME` file and four GitHub A records at GoDaddy (185.199.108–111.153). Don't delete `CNAME`, or the site falls back to aryavsparihar.github.io.

- `index.html` holds all content (edit the sections there)
- `style.css` holds the styling (light by default, with a dark-mode toggle in the navbar)
- `script.js` handles the dark-mode toggle, the mobile menu, and the active-section nav highlight

## Preview locally

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123.

## Deploy on GitHub Pages

1. Create a **public** repo on GitHub named exactly `aryavsparihar.github.io`.
2. Push this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/aryavsparihar/aryavsparihar.github.io.git
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, and pick `main` / `/ (root)`.
4. The site goes live at **https://aryavsparihar.github.io** within a minute or two.

To update the site later, edit `index.html`, then run `git commit -am "Update" && git push`.

When you change `style.css` or `script.js`, also bump the `?v=` number on their links in `index.html`. GitHub Pages lets browsers cache these files for 10 minutes, and a new number makes them fetch the fresh copy.
