// TrustJSON — optional content script (P1).
//
// Purpose: when the browser navigates directly to a *.json URL that the server
// serves as raw text (Chrome shows it as a single <pre> or plain body), offer
// to open it in the TrustJSON viewer instead of the unstyled raw text.
//
// Trust & permissions note:
//   - This script runs ONLY on URLs ending in `.json` (see manifest `matches`).
//   - It makes NO network requests. It reads ONLY the text already on the page
//     (document.body.innerText) — the same bytes the browser already fetched.
//   - It does not run on HTML pages or apps. The match pattern is intentionally
//     narrow. If you prefer zero content scripts, remove the `content_scripts`
//     block from manifest.json — the standalone viewer still works fully.
//
// We do NOT auto-replace the page (that would be intrusive, JSON-Formatter-style).
// Instead we inject a small, dismissible banner with an "Open in TrustJSON" button.

(function () {
  "use strict";

  // Heuristic: is this document a raw JSON payload?
  function looksLikeRawJson() {
    // Common case: Chrome renders text/* as a single <pre> child of <body>.
    var body = document.body;
    if (!body) return null;
    var pre = body.querySelector("pre");
    var text;
    if (pre && body.children.length === 1) {
      text = pre.innerText;
    } else if (body.children.length === 0) {
      text = body.innerText;
    } else {
      return null; // looks like a real HTML page; do nothing.
    }
    text = (text || "").trim();
    if (text.length < 2) return null;
    var first = text.charAt(0);
    if (first !== "{" && first !== "[" && first !== '"') return null;
    // Cheap sanity check on the last non-space char.
    var last = text.charAt(text.length - 1);
    if (first === "{" && last !== "}") return null;
    if (first === "[" && last !== "]") return null;
    return text;
  }

  function injectBanner(text) {
    if (document.getElementById("__trustjson_banner")) return;
    var bar = document.createElement("div");
    bar.id = "__trustjson_banner";
    bar.style.cssText = [
      "position:fixed", "top:0", "left:0", "right:0", "z-index:2147483647",
      "background:#0d1117", "color:#e6edf3", "font:13px system-ui,sans-serif",
      "padding:8px 14px", "display:flex", "align-items:center", "gap:12px",
      "box-shadow:0 2px 8px rgba(0,0,0,.3)",
    ].join(";");

    var label = document.createElement("span");
    label.textContent = "🔒 This looks like JSON. Open it in TrustJSON (100% local, no tracking)?";
    label.style.flex = "1";

    var open = document.createElement("button");
    open.textContent = "Open in TrustJSON";
    styleBtn(open, true);
    open.addEventListener("click", function () {
      // Hand the text to the viewer via sessionStorage of the NEW tab is not
      // shared; instead we open the viewer and pass through chrome.storage.session.
      try {
        chrome.storage.session.set({ trustjsonHandoff: text }, function () {
          window.location.href = chrome.runtime.getURL("viewer.html") + "?from=session";
        });
      } catch (e) {
        // Fallback: open blank viewer (user can paste).
        window.open(chrome.runtime.getURL("viewer.html"), "_blank");
      }
    });

    var dismiss = document.createElement("button");
    dismiss.textContent = "Dismiss";
    styleBtn(dismiss, false);
    dismiss.addEventListener("click", function () { bar.remove(); });

    bar.appendChild(label);
    bar.appendChild(open);
    bar.appendChild(dismiss);
    document.documentElement.appendChild(bar);
    // Nudge the page down so the banner doesn't cover content.
    if (document.body) document.body.style.marginTop = "40px";
  }

  function styleBtn(btn, primary) {
    btn.style.cssText = [
      "font:12px system-ui,sans-serif", "padding:4px 10px", "border-radius:6px",
      "cursor:pointer", "border:1px solid " + (primary ? "#1f6feb" : "#30363d"),
      "background:" + (primary ? "#1f6feb" : "transparent"),
      "color:" + (primary ? "#fff" : "#e6edf3"),
    ].join(";");
  }

  try {
    var text = looksLikeRawJson();
    if (text) injectBanner(text);
  } catch (e) {
    // Never break the page.
  }
})();
