(() => {
  const ready = () =>
    document.readyState === 'complete' || document.readyState === 'interactive';
  const onReady = (fn) => (ready() ? fn() : document.addEventListener('DOMContentLoaded', fn));

  onReady(() => {
    // Configure RequireJS path for Monaco (served from CDN)
    // eslint-disable-next-line no-undef
    require.config({
      paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs',
      },
    });

    // Load Monaco
    // eslint-disable-next-line no-undef
    require(['vs/editor/editor.main'], function () {
      // eslint-disable-next-line no-undef
      const field = new SquidexFormField();

      const statusEl = document.getElementById('status');
      const editorEl = document.getElementById('editor');
      const setStatus = (t, ok) => {
        statusEl.textContent = t;
        statusEl.style.color = ok ? '' : 'crimson';
      };

      // eslint-disable-next-line no-undef
      const ed = monaco.editor.create(editorEl, {
        language: 'json',
        automaticLayout: true, // still call layout() after sizing events
        minimap: { enabled: false },
        tabSize: 2,
      });

      // ---- Layout helpers ----
      const relayout = () => {
        // Force a visible height and tell Monaco to recompute layout.
        // Use max of 500px or 70% of viewport.
        const target = Math.max(500, Math.floor(window.innerHeight * 0.7));
        editorEl.style.height = target + 'px';
        if (ed && ed.layout) ed.layout();
      };

      // Run once ASAP
      relayout();
      // Again after fonts/CDNs settle
      setTimeout(relayout, 300);
      // And on resize
      window.addEventListener('resize', relayout);

      // Also run when Squidex signals the field is initialized
      field.onInit(() => {
        relayout();
        // Optional initial pull
        field.getValue().then((v) => {
          const text = typeof v === 'string' ? v : v ? JSON.stringify(v) : '';
          if (text && text !== ed.getValue()) ed.setValue(text);
        });
      });

      // ---- SDK → editor ----
      field.onValueChanged((value) => {
        const text = typeof value === 'string' ? value : value ? JSON.stringify(value) : '';
        if (text !== ed.getValue()) ed.setValue(text);
      });

      field.onDisabled((disabled) => ed.updateOptions({ readOnly: disabled }));

      // ---- editor → SDK ----
      const push = () => {
        const text = ed.getValue();
        try {
          JSON.parse(text);
          setStatus('✓ valid JSON', true);
        } catch (e) {
          setStatus('✗ ' + e.message, false);
        }
        field.valueChanged(text); // keep it as STRING
      };

      ed.onDidChangeModelContent(push);
      ed.onDidBlurEditorText(() => field.touched());

      // ---- Toolbar actions ----
      document.getElementById('format').addEventListener('click', () => {
        try {
          const pretty = JSON.stringify(JSON.parse(ed.getValue()), null, 2);
          ed.setValue(pretty);
          setStatus('✓ formatted', true);
          field.valueChanged(pretty);
        } catch (e) {
          setStatus('✗ cannot format (invalid JSON)', false);
        }
      });

      document.getElementById('minify').addEventListener('click', () => {
        try {
          const min = JSON.stringify(JSON.parse(ed.getValue()));
          ed.setValue(min);
          setStatus('✓ minified', true);
          field.valueChanged(min);
        } catch (e) {
          setStatus('✗ cannot minify (invalid JSON)', false);
        }
      });
    });
  });
})();
