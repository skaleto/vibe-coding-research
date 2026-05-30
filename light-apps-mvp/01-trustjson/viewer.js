// TrustJSON — viewer UI controller.
// 100% local. No fetch / XHR / WebSocket / beacon anywhere in this file or the
// modules it loads. Verify in DevTools → Network.

(function () {
  "use strict";

  var TJ = self.TJTree;
  var ROW_H = 22;        // must match --row-height in CSS
  var BUFFER = 12;       // rows rendered above/below the viewport

  // ---- DOM refs ----
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    toolbar: $("toolbar"),
    loader: $("loader"),
    dropzone: $("dropzone"),
    pasteArea: $("paste-area"),
    fileInput: $("file-input"),
    errorPanel: $("error-panel"),
    errorLoc: $("error-loc"),
    errorSnippet: $("error-snippet"),
    status: $("status"),
    statusText: $("status-text"),
    treeView: $("tree-view"),
    scroll: $("scroll"),
    spacer: $("spacer"),
    rows: $("rows"),
    rawView: $("raw-view"),
    rawPre: $("raw-pre"),
    rawTools: $("raw-tools"),
    toast: $("toast"),
    ctxMenu: $("ctx-menu"),
    statusbar: $("statusbar"),
    statSize: $("stat-size"),
    statNodes: $("stat-nodes"),
    statSel: $("stat-sel"),
    search: $("search-input"),
    searchCount: $("search-count"),
    tabTree: $("tab-tree"),
    tabRaw: $("tab-raw"),
  };

  // ---- App state ----
  var state = {
    raw: "",            // original text
    value: undefined,   // parsed value
    root: null,
    flat: [],           // visible rows (TJTree model)
    selected: -1,       // selected row index
    matches: [],        // search: array of row references that match
    matchIdx: -1,
    searchTerm: "",
    rawMode: false,
    nodeEstimate: 0,
  };

  var worker = null;
  var reqId = 0;

  // ============================================================
  // Worker (parsing off the main thread)
  // ============================================================
  function getWorker() {
    if (!worker) {
      worker = new Worker(chrome.runtime.getURL("worker.js"));
    }
    return worker;
  }

  function parse(text) {
    showStatus("Parsing… (" + fmtBytes(text.length) + ")");
    var id = ++reqId;
    var w = getWorker();
    var onMsg = function (e) {
      if (!e.data || e.data.id !== id) return;
      w.removeEventListener("message", onMsg);
      hideStatus();
      if (e.data.ok) {
        onParsed(text, e.data.value, e.data.bytes);
      } else {
        showError(e.data.error);
      }
    };
    w.addEventListener("message", onMsg);
    w.postMessage({ id: id, type: "parse", text: text });
  }

  function onParsed(text, value, bytes) {
    state.raw = text;
    state.value = value;
    var built = TJ.buildInitial(value);
    state.flat = built.rows;
    state.root = built.root;
    state.selected = -1;
    clearSearch();
    state.nodeEstimate = estimateNodes(value, 200000);

    els.loader.hidden = true;
    els.errorPanel.hidden = true;
    els.toolbar.hidden = false;
    els.statusbar.hidden = false;
    setRawMode(false);
    render();
    updateStatusbar(bytes);
  }

  // ============================================================
  // Virtual scroll renderer
  // ============================================================
  var rowPool = []; // reusable DOM rows

  function render() {
    var total = state.flat.length;
    els.spacer.style.height = (total * ROW_H) + "px";

    var scrollTop = els.scroll.scrollTop;
    var viewport = els.scroll.clientHeight || 600;
    var first = Math.max(0, Math.floor(scrollTop / ROW_H) - BUFFER);
    var visibleCount = Math.ceil(viewport / ROW_H) + BUFFER * 2;
    var last = Math.min(total, first + visibleCount);

    // Ensure pool big enough.
    while (rowPool.length < (last - first)) {
      var el = document.createElement("div");
      el.className = "row";
      els.rows.appendChild(el);
      rowPool.push(el);
    }
    // Render each visible row; hide the rest of the pool.
    var p = 0;
    for (var i = first; i < last; i++, p++) {
      paintRow(rowPool[p], state.flat[i], i);
    }
    for (; p < rowPool.length; p++) {
      rowPool[p].style.display = "none";
    }
  }

  function paintRow(el, row, index) {
    el.style.display = "flex";
    el.style.top = (index * ROW_H) + "px";
    el.style.paddingLeft = (8 + row.depth * 16) + "px";
    el.dataset.index = index;
    el.classList.toggle("selected", index === state.selected);

    if (row.loadMore) {
      var remaining = row.parent.childCount - row.parent.loadedChildren;
      el.innerHTML = '<span class="twisty empty">·</span>' +
        '<span class="loadmore">▾ Load ' + Math.min(TJ.CHILD_CHUNK, remaining) +
        ' more (' + fmtNum(remaining) + ' left)</span>';
      el.dataset.loadmore = "1";
      return;
    }
    delete el.dataset.loadmore;

    var html = "";
    // twisty
    if (row.isContainer && row.childCount > 0) {
      html += '<span class="twisty">' + (row.collapsed ? "▶" : "▼") + "</span>";
    } else {
      html += '<span class="twisty empty">·</span>';
    }
    // key
    if (row.key !== null) {
      var keyCls = row.keyKind === "index" ? "row-key index" : "row-key";
      var keyText = row.keyKind === "index" ? row.key : escapeHtml(row.key);
      html += '<span class="' + keyCls + '">' + highlight(keyText, true) + "</span>";
      html += '<span class="row-colon">:</span>';
    }
    // value
    html += renderValue(row);
    el.innerHTML = html;
  }

  function renderValue(row) {
    var t = row.type;
    if (t === "object" || t === "array") {
      var open = t === "array" ? "[" : "{";
      var close = t === "array" ? "]" : "}";
      if (row.collapsed) {
        var inner = row.childCount === 0 ? "" : "…";
        return '<span class="t-punct">' + open + inner + close + "</span>" +
          '<span class="row-count">' + fmtNum(row.childCount) +
          (t === "array" ? (row.childCount === 1 ? " item" : " items")
                         : (row.childCount === 1 ? " key" : " keys")) + "</span>";
      }
      return '<span class="t-punct">' + open + "</span>";
    }
    if (t === "string") {
      return '<span class="row-val t-string">' + highlight(JSON.stringify(row.value)) + "</span>";
    }
    if (t === "number") {
      return '<span class="row-val t-number">' + highlight(String(row.value)) + "</span>";
    }
    if (t === "boolean") {
      return '<span class="row-val t-boolean">' + highlight(String(row.value)) + "</span>";
    }
    if (t === "null") {
      return '<span class="row-val t-null">null</span>';
    }
    return "";
  }

  // Highlight search matches inside a (already text) value. `isKey` toggles
  // whether we are rendering a key (keys are escaped before highlight).
  function highlight(text, isKey) {
    var safe = isKey ? text : escapeHtml(text);
    if (!state.searchTerm) return safe;
    // case-insensitive highlight on the raw text, then escape pieces.
    var term = state.searchTerm;
    var lower = (isKey ? stripTags(text) : text).toLowerCase();
    // For keys we passed possibly-escaped text; recompute against raw.
    var source = isKey ? text : text;
    var srcLower = source.toLowerCase();
    if (srcLower.indexOf(term.toLowerCase()) === -1) return safe;
    var out = "";
    var i = 0;
    var tl = term.toLowerCase();
    while (i < source.length) {
      var idx = srcLower.indexOf(tl, i);
      if (idx === -1) {
        out += escapeHtml(source.slice(i));
        break;
      }
      out += escapeHtml(source.slice(i, idx));
      out += '<mark class="match">' + escapeHtml(source.slice(idx, idx + term.length)) + "</mark>";
      i = idx + term.length;
    }
    return out;
  }

  function stripTags(s) { return s.replace(/<[^>]*>/g, ""); }

  // ============================================================
  // Interactions: expand/collapse, select, copy
  // ============================================================
  els.scroll.addEventListener("scroll", function () { render(); }, { passive: true });
  window.addEventListener("resize", function () { render(); });

  els.rows.addEventListener("click", function (e) {
    var rowEl = e.target.closest(".row");
    if (!rowEl) return;
    var index = parseInt(rowEl.dataset.index, 10);

    if (e.target.closest(".loadmore")) {
      TJ.loadMore(state.flat, index);
      render();
      return;
    }
    if (e.target.closest(".twisty") && !e.target.closest(".twisty.empty")) {
      TJ.toggle(state.flat, index);
      render();
      return;
    }
    selectRow(index);
  });

  els.rows.addEventListener("dblclick", function (e) {
    var rowEl = e.target.closest(".row");
    if (!rowEl) return;
    var index = parseInt(rowEl.dataset.index, 10);
    var row = state.flat[index];
    if (row && row.isContainer) {
      TJ.toggle(state.flat, index);
      render();
    }
  });

  function selectRow(index) {
    state.selected = index;
    render();
    var row = state.flat[index];
    if (row && !row.loadMore) {
      els.statSel.textContent = "path: " + TJ.rowPath(row);
    }
  }

  // Context menu (right-click) for copy actions
  els.rows.addEventListener("contextmenu", function (e) {
    var rowEl = e.target.closest(".row");
    if (!rowEl) return;
    e.preventDefault();
    var index = parseInt(rowEl.dataset.index, 10);
    if (state.flat[index] && state.flat[index].loadMore) return;
    selectRow(index);
    openCtxMenu(e.clientX, e.clientY);
  });

  function openCtxMenu(x, y) {
    var m = els.ctxMenu;
    m.hidden = false;
    var w = m.offsetWidth, h = m.offsetHeight;
    m.style.left = Math.min(x, window.innerWidth - w - 8) + "px";
    m.style.top = Math.min(y, window.innerHeight - h - 8) + "px";
  }
  function closeCtxMenu() { els.ctxMenu.hidden = true; }
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#ctx-menu")) closeCtxMenu();
  });
  document.addEventListener("scroll", closeCtxMenu, true);

  els.ctxMenu.addEventListener("click", function (e) {
    var act = e.target.dataset.act;
    if (!act) return;
    var row = state.flat[state.selected];
    if (!row) return;
    if (act === "copy-value") copyText(stringifyValue(row.value), "Value copied");
    else if (act === "copy-path") copyText(TJ.rowPath(row), "Path copied: " + TJ.rowPath(row));
    else if (act === "copy-key") copyText(row.key === null ? "$" : String(row.key), "Key copied");
    else if (act === "copy-subtree") copyText(safeStringify(row.value, 2), "Node JSON copied");
    closeCtxMenu();
  });

  function stringifyValue(v) {
    if (typeof v === "string") return v; // copy raw string, not JSON-quoted
    return safeStringify(v, 2);
  }
  function safeStringify(v, indent) {
    try { return JSON.stringify(v, null, indent); }
    catch (e) { return String(v); }
  }

  function copyText(text, msg) {
    // Clipboard API is local-only; no network. Fallback to execCommand.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(msg); }, function () { fallbackCopy(text, msg); });
    } else {
      fallbackCopy(text, msg);
    }
  }
  function fallbackCopy(text, msg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(msg); } catch (e) { toast("Copy failed"); }
    document.body.removeChild(ta);
  }

  // ============================================================
  // Keyboard navigation
  // ============================================================
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
      // search box handles its own keys below
      if (e.target === els.search) handleSearchKeys(e);
      return;
    }
    if (state.rawMode || els.toolbar.hidden) return;
    var idx = state.selected < 0 ? 0 : state.selected;
    var row;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (state.selected < state.flat.length - 1) selectRowEnsureVisible(idx + 1);
        else if (state.selected < 0) selectRowEnsureVisible(0);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (state.selected > 0) selectRowEnsureVisible(idx - 1);
        break;
      case "ArrowRight":
        row = state.flat[idx];
        if (row && row.isContainer && row.collapsed) { TJ.expand(state.flat, idx); render(); }
        else if (row && idx < state.flat.length - 1) selectRowEnsureVisible(idx + 1);
        break;
      case "ArrowLeft":
        row = state.flat[idx];
        if (row && row.isContainer && !row.collapsed) { TJ.collapse(state.flat, idx); render(); }
        break;
      case "Enter":
        row = state.flat[idx];
        if (row && row.isContainer) { TJ.toggle(state.flat, idx); render(); }
        break;
      case "c":
        if ((e.metaKey || e.ctrlKey) && state.selected >= 0) {
          row = state.flat[state.selected];
          if (row && !row.loadMore) copyText(stringifyValue(row.value), "Value copied");
        }
        break;
      case "/":
        e.preventDefault();
        els.search.focus();
        break;
    }
  });

  function selectRowEnsureVisible(index) {
    state.selected = index;
    var top = index * ROW_H;
    var bottom = top + ROW_H;
    var vt = els.scroll.scrollTop, vb = vt + els.scroll.clientHeight;
    if (top < vt) els.scroll.scrollTop = top;
    else if (bottom > vb) els.scroll.scrollTop = bottom - els.scroll.clientHeight;
    render();
    var row = state.flat[index];
    if (row && !row.loadMore) els.statSel.textContent = "path: " + TJ.rowPath(row);
  }

  // ============================================================
  // Search (works on the full value tree, not just visible rows)
  // ============================================================
  var searchTimer = null;
  els.search.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 180);
  });

  function handleSearchKeys(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) gotoMatch(-1);
      else gotoMatch(1);
    } else if (e.key === "Escape") {
      els.search.value = "";
      clearSearch();
      render();
    }
  }

  function clearSearch() {
    state.searchTerm = "";
    state.matches = [];
    state.matchIdx = -1;
    els.searchCount.textContent = "";
  }

  // Find matches by walking the value tree, recording the path (segments) of
  // each node whose key or scalar value contains the term. Capped to avoid
  // pathological memory on huge files.
  function runSearch() {
    var term = els.search.value.trim();
    state.searchTerm = term;
    if (!term) { clearSearch(); render(); return; }

    var lc = term.toLowerCase();
    var found = [];
    var CAP = 5000;
    var truncated = false;

    function walk(value, segments, keyForThis) {
      if (found.length >= CAP) { truncated = true; return; }
      // match on this node's key
      if (keyForThis != null && String(keyForThis).toLowerCase().indexOf(lc) !== -1) {
        found.push(segments);
      }
      var t = TJ.valueType(value);
      if (t === "object") {
        var keys = Object.keys(value);
        for (var i = 0; i < keys.length; i++) {
          if (found.length >= CAP) { truncated = true; return; }
          walk(value[keys[i]], segments.concat([{ kind: "key", value: keys[i] }]), keys[i]);
        }
      } else if (t === "array") {
        for (var j = 0; j < value.length; j++) {
          if (found.length >= CAP) { truncated = true; return; }
          walk(value[j], segments.concat([{ kind: "index", value: j }]), null);
        }
      } else {
        // scalar value match (key already checked above)
        var sv = t === "string" ? value : String(value);
        if (sv.toLowerCase().indexOf(lc) !== -1) {
          // avoid double-push if key already matched this exact segments
          if (found.length === 0 || found[found.length - 1] !== segments) found.push(segments);
        }
      }
    }
    walk(state.value, [], null);

    state.matches = found;
    state.matchIdx = found.length ? 0 : -1;
    els.searchCount.textContent = found.length
      ? (1 + "/" + found.length + (truncated ? "+" : ""))
      : "0";
    render();
    if (found.length) revealMatch(0);
  }

  function gotoMatch(dir) {
    if (!state.matches.length) return;
    state.matchIdx = (state.matchIdx + dir + state.matches.length) % state.matches.length;
    els.searchCount.textContent = (state.matchIdx + 1) + "/" + state.matches.length;
    revealMatch(state.matchIdx);
  }

  function revealMatch(i) {
    var segments = state.matches[i];
    var idx = TJ.revealPath(state.flat, state.root, segments);
    if (idx === -1) { render(); return; }
    selectRowEnsureVisible(idx);
    // mark active highlight after render
    requestAnimationFrame(function () {
      var marks = els.rows.querySelectorAll("mark.match");
      for (var k = 0; k < marks.length; k++) marks[k].classList.remove("active");
      var sel = els.rows.querySelector('.row.selected mark.match');
      if (sel) sel.classList.add("active");
    });
  }

  // ============================================================
  // Expand all / collapse all
  // ============================================================
  $("btn-expand-all").addEventListener("click", function () {
    // Guard: refuse to fully expand monstrous trees (would defeat virtualization
    // by materializing every node). Cap total rows.
    var CAP = 200000;
    var guarded = false;
    var i = 0;
    while (i < state.flat.length) {
      var row = state.flat[i];
      if (row.isContainer && row.collapsed && row.childCount > 0) {
        if (state.flat.length + row.childCount > CAP) { guarded = true; break; }
        TJ.expand(state.flat, i);
      } else if (row.loadMore) {
        if (state.flat.length > CAP) { guarded = true; break; }
        TJ.loadMore(state.flat, i);
        continue;
      }
      i++;
    }
    render();
    if (guarded) toast("Expanded up to " + fmtNum(CAP) + " rows (file is large — expand nodes individually).");
  });

  $("btn-collapse-all").addEventListener("click", function () {
    // Rebuild from scratch: root stays expanded one level, everything else collapsed.
    var built = TJ.buildInitial(state.value);
    state.flat = built.rows;
    state.root = built.root;
    state.selected = -1;
    els.scroll.scrollTop = 0;
    render();
  });

  // ============================================================
  // Raw view + beautify / minify
  // ============================================================
  els.tabTree.addEventListener("click", function () { setRawMode(false); });
  els.tabRaw.addEventListener("click", function () { setRawMode(true); });

  function setRawMode(on) {
    state.rawMode = on;
    els.tabTree.classList.toggle("active", !on);
    els.tabRaw.classList.toggle("active", on);
    els.treeView.hidden = on;
    els.rawView.hidden = !on;
    els.rawTools.hidden = !on;
    if (on) showRaw(safeStringify(state.value, 2));
  }
  function showRaw(text) {
    els.rawPre.textContent = text;
  }
  $("btn-beautify").addEventListener("click", function () {
    showRaw(safeStringify(state.value, 2));
  });
  $("btn-minify").addEventListener("click", function () {
    showRaw(safeStringify(state.value, 0));
  });

  // ============================================================
  // Loading inputs: paste / file / drop / sample
  // ============================================================
  $("btn-parse").addEventListener("click", function () {
    var text = els.pasteArea.value;
    if (!text.trim()) { toast("Paste some JSON first"); return; }
    parse(text);
  });
  $("btn-open-file").addEventListener("click", function () { els.fileInput.click(); });
  els.fileInput.addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    if (f) readFile(f);
    els.fileInput.value = "";
  });
  $("btn-sample").addEventListener("click", function () {
    parse(sampleJSON());
  });
  $("btn-new").addEventListener("click", showLoader);
  $("btn-back-to-input").addEventListener("click", showLoader);

  function showLoader() {
    els.errorPanel.hidden = true;
    els.toolbar.hidden = true;
    els.statusbar.hidden = true;
    els.treeView.hidden = true;
    els.rawView.hidden = true;
    els.loader.hidden = false;
    els.pasteArea.focus();
  }

  function readFile(file) {
    // FileReader is local; reads the user's chosen file only. No upload.
    showStatus("Reading " + file.name + " (" + fmtBytes(file.size) + ")…");
    var reader = new FileReader();
    reader.onload = function () { parse(String(reader.result)); };
    reader.onerror = function () { hideStatus(); toast("Could not read file"); };
    reader.readAsText(file);
  }

  // Drag & drop (on the dropzone and the whole window when on loader)
  function setupDnd(target) {
    ["dragenter", "dragover"].forEach(function (ev) {
      target.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        els.dropzone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      target.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        els.dropzone.classList.remove("dragover");
      });
    });
    target.addEventListener("drop", function (e) {
      var dt = e.dataTransfer;
      if (dt.files && dt.files.length) readFile(dt.files[0]);
      else {
        var txt = dt.getData("text");
        if (txt) parse(txt);
      }
    });
  }
  setupDnd(els.dropzone);
  // Also accept drops anywhere on the window while loader is visible.
  window.addEventListener("dragover", function (e) {
    if (!els.loader.hidden) e.preventDefault();
  });
  window.addEventListener("drop", function (e) {
    if (els.loader.hidden) return;
    e.preventDefault();
    var dt = e.dataTransfer;
    if (dt.files && dt.files.length) readFile(dt.files[0]);
  });

  // ============================================================
  // Pro placeholders
  // ============================================================
  Array.prototype.forEach.call(document.querySelectorAll(".btn.pro"), function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.pro;
      var names = { diff: "Side-by-side diff", jq: "jq / JSONPath queries", jwt: "JWT / Base64 decode" };
      toast((names[f] || f) + " is a Pro feature — coming soon.");
    });
  });

  // ============================================================
  // Theme
  // ============================================================
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }
  function cycleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") || "auto";
    var next = cur === "auto" ? "light" : cur === "light" ? "dark" : "auto";
    applyTheme(next);
    saveTheme(next);
    toast("Theme: " + next);
  }
  $("btn-theme").addEventListener("click", cycleTheme);
  $("btn-theme-2").addEventListener("click", cycleTheme);

  function saveTheme(t) {
    try { if (chrome.storage) chrome.storage.local.set({ theme: t }); } catch (e) {}
    try { localStorage.setItem("trustjson-theme", t); } catch (e) {}
  }
  function loadTheme() {
    // localStorage first (sync), then chrome.storage to reconcile.
    try {
      var t = localStorage.getItem("trustjson-theme");
      if (t) applyTheme(t);
    } catch (e) {}
    try {
      if (chrome.storage) chrome.storage.local.get("theme", function (r) {
        if (r && r.theme) applyTheme(r.theme);
      });
    } catch (e) {}
  }

  // ============================================================
  // Status / toast / formatting helpers
  // ============================================================
  function showStatus(text) {
    els.statusText.textContent = text;
    els.status.hidden = false;
  }
  function hideStatus() { els.status.hidden = true; }

  var toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.hidden = true; }, 1800);
  }

  function showError(err) {
    els.loader.hidden = true;
    els.toolbar.hidden = true;
    els.statusbar.hidden = true;
    els.treeView.hidden = true;
    els.rawView.hidden = true;
    els.errorPanel.hidden = false;
    if (err.line != null) {
      els.errorLoc.textContent = "line " + err.line + ", column " + err.col;
    } else {
      els.errorLoc.textContent = "";
    }
    els.errorSnippet.textContent = (err.snippet ? err.snippet + "\n\n" : "") + err.message;
  }

  function updateStatusbar(bytes) {
    els.statSize.textContent = fmtBytes(bytes);
    els.statNodes.textContent = "~" + fmtNum(state.nodeEstimate) + (state.nodeEstimate >= 200000 ? "+" : "") + " nodes";
    els.statSel.textContent = "";
  }

  function fmtBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / 1024 / 1024).toFixed(1) + " MB";
  }
  function fmtNum(n) { return n.toLocaleString("en-US"); }

  function estimateNodes(value, cap) {
    var count = 0;
    var stack = [value];
    while (stack.length && count < cap) {
      var v = stack.pop();
      count++;
      if (Array.isArray(v)) {
        for (var i = 0; i < v.length && count < cap; i++) stack.push(v[i]);
      } else if (v && typeof v === "object") {
        var keys = Object.keys(v);
        for (var j = 0; j < keys.length && count < cap; j++) stack.push(v[keys[j]]);
      }
    }
    return count;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function sampleJSON() {
    var users = [];
    for (var i = 0; i < 8; i++) {
      users.push({
        id: i + 1,
        name: ["Ada", "Alan", "Grace", "Linus", "Margaret", "Dennis", "Barbara", "Ken"][i],
        active: i % 2 === 0,
        score: Math.round(Math.random() * 1000) / 10,
        roles: i % 3 === 0 ? ["admin", "user"] : ["user"],
        meta: { createdAt: "2026-0" + ((i % 9) + 1) + "-15T10:30:00Z", note: i === 3 ? null : "ok" },
      });
    }
    return JSON.stringify({
      app: "TrustJSON",
      version: "0.1.0",
      privacy: { localOnly: true, networkRequests: 0, tracking: false },
      users: users,
      counts: { total: users.length, active: users.filter(function (u) { return u.active; }).length },
      nested: { a: { b: { c: { d: "deep value", list: [1, 2, 3, [4, 5, [6, 7]]] } } } },
    }, null, 2);
  }

  // ============================================================
  // Boot
  // ============================================================
  loadTheme();

  // If launched from the content-script "Open in TrustJSON" banner, the JSON
  // text was stashed in chrome.storage.session (in-memory, never written to
  // disk, cleared on browser close). Pick it up here. No network involved.
  var fromSession = /[?&]from=session/.test(location.search);
  if (fromSession && chrome.storage && chrome.storage.session) {
    chrome.storage.session.get("trustjsonHandoff", function (r) {
      if (r && r.trustjsonHandoff) {
        chrome.storage.session.remove("trustjsonHandoff");
        parse(r.trustjsonHandoff);
      } else {
        els.pasteArea.focus();
      }
    });
  } else {
    els.pasteArea.focus();
  }
})();
