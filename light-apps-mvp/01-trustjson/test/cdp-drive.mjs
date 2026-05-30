// DEV-ONLY: drive headless Chrome via CDP to verify the REAL viewer.js render
// pipeline (Worker parse + virtual scroll + search + copy path) in a browser.
// Requires a headless Chrome with --remote-debugging-port=9322 already running
// and a static server on :8731 serving the extension dir.
// Usage: node test/cdp-drive.mjs

const DEBUG = "http://localhost:9322";
const URL_TO_OPEN = "http://localhost:8731/test/harness.html?auto=1";

function getJSON(url) {
  return fetch(url).then((r) => r.json());
}

async function main() {
  // Open a fresh target (tab).
  const created = await getJSON(`${DEBUG}/json/new?${encodeURIComponent("about:blank")}`).catch(async () => {
    // Some Chrome versions require PUT for /json/new.
    const r = await fetch(`${DEBUG}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
    return r.json();
  });
  const wsUrl = created.webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);

  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  const consoleAll = [];

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    } else if (msg.method === "Runtime.consoleAPICalled") {
      const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? "").join(" ");
      consoleAll.push(msg.params.type + ": " + text);
      if (msg.params.type === "error") consoleErrors.push(text);
    } else if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      consoleErrors.push("EXCEPTION: " + (d.exception?.description || d.text));
    }
  };

  await send("Runtime.enable");
  await send("Log.enable").catch(() => {});
  await send("Page.enable");
  await send("Page.navigate", { url: URL_TO_OPEN });

  // Wait until the tree has rendered rows (auto-loads the sample).
  async function evalExpr(expression) {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description || ""));
    return r.result.value;
  }

  let rendered = false;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const count = await evalExpr(`document.querySelectorAll('#rows .row').length`).catch(() => 0);
    const toolbarHidden = await evalExpr(`document.getElementById('toolbar').hidden`).catch(() => true);
    if (count > 0 && !toolbarHidden) { rendered = true; break; }
  }

  const results = {};
  results.renderedRows = await evalExpr(`document.querySelectorAll('#rows .row').length`);
  results.visibleNonEmptyRows = await evalExpr(
    `Array.from(document.querySelectorAll('#rows .row')).filter(r => r.style.display !== 'none').length`
  );
  results.typeColorClasses = await evalExpr(
    `(() => { const s = new Set(); document.querySelectorAll('#rows .row [class*="t-"]').forEach(e => e.className.split(' ').forEach(c => { if (c.startsWith('t-')) s.add(c); })); return Array.from(s); })()`
  );
  results.hasRowCount = await evalExpr(`!!document.querySelector('#rows .row-count')`);
  results.statusbarSize = await evalExpr(`document.getElementById('stat-size').textContent`);
  results.statusbarNodes = await evalExpr(`document.getElementById('stat-nodes').textContent`);

  // Exercise expand-all then collapse-all via buttons.
  await evalExpr(`document.getElementById('btn-expand-all').click(); true`);
  await new Promise((r) => setTimeout(r, 150));
  results.rowsAfterExpandAll = await evalExpr(`document.querySelectorAll('#rows .row').length`);
  results.spacerHeightPx = await evalExpr(`parseInt(document.getElementById('spacer').style.height) || 0`);

  // Drive a search for a term present in the built-in sample ("score" key
  // appears on every user) and verify match + reveal + path.
  await evalExpr(`
    const inp = document.getElementById('search-input');
    inp.value = 'score';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    true
  `);
  await new Promise((r) => setTimeout(r, 400));
  results.searchCount = await evalExpr(`document.getElementById('search-count').textContent`);
  results.hasMatchMark = await evalExpr(`!!document.querySelector('#rows mark.match')`);
  results.selectedPath = await evalExpr(`document.getElementById('stat-sel').textContent`);

  // Verify copy-path produces a correct JSON path for a known node:
  // build the path for users[0].score directly via the shared TJTree module.
  results.pathForUsers0Score = await evalExpr(`
    self.TJTree.pathToString([
      { kind: 'key', value: 'users' },
      { kind: 'index', value: 0 },
      { kind: 'key', value: 'score' }
    ])
  `);

  // Toggle raw view + minify.
  await evalExpr(`document.getElementById('tab-raw').click(); true`);
  await new Promise((r) => setTimeout(r, 100));
  results.rawHasContent = await evalExpr(`document.getElementById('raw-pre').textContent.length > 100`);
  await evalExpr(`document.getElementById('btn-minify').click(); true`);
  results.rawMinifiedOneLine = await evalExpr(
    `(() => { const t = document.getElementById('raw-pre').textContent; return t.indexOf('\\n') === -1; })()`
  );

  console.log("RENDERED:", rendered);
  console.log(JSON.stringify(results, null, 2));
  console.log("\nCONSOLE ERRORS (" + consoleErrors.length + "):");
  consoleErrors.forEach((e) => console.log("  " + e));

  ws.close();

  // Verdict
  const okRender = rendered && results.renderedRows > 0;
  const okTypes = (results.typeColorClasses || []).length >= 2;
  const okSearch = results.hasMatchMark && /\d\/\d/.test(results.searchCount || "");
  const okRaw = results.rawHasContent && results.rawMinifiedOneLine;
  const okExpandAll = results.rowsAfterExpandAll > results.renderedRows;
  const okSpacer = results.spacerHeightPx > 0;
  const okPath = results.pathForUsers0Score === "users[0].score";
  const noErrors = consoleErrors.length === 0;

  console.log("\n--- VERDICT ---");
  console.log((okRender ? "PASS" : "FAIL") + "  tree rendered with rows");
  console.log((okTypes ? "PASS" : "FAIL") + "  type-color classes present (" + (results.typeColorClasses || []).join(",") + ")");
  console.log((okSearch ? "PASS" : "FAIL") + "  search highlights + locates (count=" + results.searchCount + ")");
  console.log((okPath ? "PASS" : "FAIL") + "  copy-path builds correct JSON path (" + results.pathForUsers0Score + ")");
  console.log((okExpandAll ? "PASS" : "FAIL") + "  expand-all grows the flat model");
  console.log((okSpacer ? "PASS" : "FAIL") + "  virtual-scroll spacer sized (" + results.spacerHeightPx + "px)");
  console.log((okRaw ? "PASS" : "FAIL") + "  raw beautify/minify works");
  console.log((noErrors ? "PASS" : "FAIL") + "  no console errors");
  process.exit(okRender && okTypes && okSearch && okPath && okExpandAll && okSpacer && okRaw && noErrors ? 0 : 1);
}

main().catch((e) => { console.error("DRIVER ERROR:", e); process.exit(2); });
