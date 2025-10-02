(() => {
  const ready = () => document.readyState === 'complete' || document.readyState === 'interactive';
  const onReady = (fn) => ready() ? fn() : document.addEventListener('DOMContentLoaded', fn);

  onReady(() => {
    // Require.js path for Monaco (served from CDN)
    // eslint-disable-next-line no-undef
    require.config({
      paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
      }
    });

    // Load Monaco
    // eslint-disable-next-line no-undef
    require(['vs/editor/editor.main'], function () {
      // eslint-disable-next-line no-undef
      const field = new SquidexFormField();

      const statusEl = document.getElementById('status');
      const editorEl = document.getElementById('editor');
      const setStatus = (t, ok) => { statusEl.textContent = t; statusEl.style.color = ok ? '' : 'crimson'; };

      // eslint-disable-next-line no-undef
      const ed = monaco.editor.create(editorEl, {
        language: 'json',
        automaticLayout: true,
        minimap: { enabled: false },
        tabSize: 2
      });

      // SDK → editor
      field.onValueChanged(value => {
        const text = typeof value === 'string' ? value : (value ? JSON.stringify(value) : '');
        if (text !== ed.getValue()) ed.setValue(text);
      });

      field.onDisabled(disabled => ed.updateOptions({ readOnly: disabled }));

      // editor → SDK
      const push = () => {
        const text = ed.getValue();
        try { JSON.parse(text); setStatus('✓ valid JSON', true); }
        catch (e) { setStatus('✗ ' + e.message, false); }
        field.valueChanged(text); // keep it as STRING
      };

      ed.onDidChangeModelContent(push);
      ed.onDidBlurEditorText(() => field.touched());

      // Buttons
      document.getElementById('format').addEventListener('click', () => {
        try {
          const pretty = JSON.stringify(JSON.parse(ed.getValue()), null, 2);
          ed.setValue(pretty); setStatus('✓ formatted', true); field.valueChanged(pretty);
        } catch (e) { setStatus('✗ cannot format (invalid JSON)', false); }
      });

      document.getElementById('minify').addEventListener('click', () => {
        try {
          const min = JSON.stringify(JSON.parse(ed.getValue()));
          ed.setValue(min); setStatus('✓ minified', true); field.valueChanged(min);
        } catch (e) { setStatus('✗ cannot minify (invalid JSON)', false); }
      });

      // Optional initial pull
      field.onInit(() => field.getValue().then(v => {
        const text = typeof v === 'string' ? v : (v ? JSON.stringify(v) : '');
        if (text) ed.setValue(text);
      }));
    });
  });
})();
// after you create `const ed = monaco.editor.create(...)` add:

// Give the editor element a definite height on first load (safety net).
const setEditorHeight = () => {
  // at least 500px, or 70% of viewport if larger
  const target = Math.max(500, Math.floor(window.innerHeight * 0.7));
  const el = document.getElementById('editor');
  if (el) el.style.height = target + 'px';
  // tell monaco to recompute layout when size changes
  if (ed && ed.layout) ed.layout();
};

// 1) immediately after create:
setEditorHeight();

// 2) re-run on window resize:
window.addEventListener('resize', () => setEditorHeight());

// 3) run once more after fonts/CDN load settles
setTimeout(setEditorHeight, 300);
