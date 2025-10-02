# Squidex Custom JSON Editor (String Field)

This is a tiny custom editor for a **string/textarea** field in Squidex.
It pretty-prints & validates JSON but stores the value as **string**.

## How to use

1. Enable GitHub Pages:
   - Repo → **Settings** → **Pages** → Source = `Deploy from a branch`
   - Branch = `main` (or default), Folder = `/ (root)`
   - Save and copy the public URL, e.g.:
     `https://<your-user>.github.io/squidex-json-editor/editor.html`

2. In Squidex:
   - Go to **Schemas → (your schema) → (your string field) → UI**
   - Set **Editor = Custom**
   - Paste the URL from step 1 (ending with `/editor.html`)
   - Save the schema and open a content item to test.

## Notes
- Uses CDN:
  - Squidex editor SDK: https://cloud.squidex.io/scripts/editor-sdk.js
  - Monaco loader: https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js
- No inline scripts (to avoid CSP issues).
- If you later need stricter CSP or self-hosted Monaco, switch to Netlify/Vercel/your gateway where you control headers.
