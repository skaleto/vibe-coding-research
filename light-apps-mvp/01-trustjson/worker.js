// TrustJSON — parse Worker.
// Runs JSON.parse off the main thread so the UI never freezes on large files.
// 100% local: no importScripts of remote code, no fetch, no network.
//
// Messages in:  { id, type:"parse", text }
// Messages out: { id, ok:true, value, bytes }  (structured-clone transfers the
//               parsed object back to the main thread)
//           or  { id, ok:false, error:{message, line, col, pos, snippet} }

"use strict";

// Compute a human-friendly error location from the raw text + parse error.
// V8's SyntaxError message often contains "position N" (line/column in newer
// engines). We derive line/col from a character position to be engine-robust.
function locate(text, message) {
  var pos = -1;

  // Format 1 (newer V8 / Firefox): "... at position 1234 (line 5 column 6)"
  var mLine = /line (\d+) column (\d+)/i.exec(message);
  var mPos = /position (\d+)/i.exec(message);
  if (mPos) pos = parseInt(mPos[1], 10);

  // Format 2 (common V8): 'Unexpected token X, "...context..." is not valid JSON'
  // No position is given, so we recover it by locating V8's context snippet in
  // the source text. The snippet is the substring between the FIRST and the
  // LAST double-quote of the message's "...context..." part.
  if (pos < 0 && !mLine) {
    pos = recoverPosFromTokenMessage(text, message);
  }

  var line, col;
  if (mLine) {
    line = parseInt(mLine[1], 10);
    col = parseInt(mLine[2], 10);
    if (pos < 0) pos = posFromLineCol(text, line, col);
  } else if (pos >= 0) {
    var lc = lineColFromPos(text, pos);
    line = lc.line;
    col = lc.col;
  } else {
    // Truly unknown location — still return the message.
    return { message: message, line: null, col: null, pos: null, snippet: null };
  }

  return {
    message: message,
    line: line,
    col: col,
    pos: pos,
    snippet: snippetAround(text, pos >= 0 ? pos : 0),
  };
}

// Recover an error position from a V8 "Unexpected token …" message that embeds
// a context snippet but no numeric position.
function recoverPosFromTokenMessage(text, message) {
  // The message looks like:  Unexpected token 'X', "<context>" is not valid JSON
  // or (long inputs):        Unexpected token 'X', ..."<context>"... is not valid JSON
  // Extract <context> = text between the first and last double quote.
  var first = message.indexOf('"');
  var last = message.lastIndexOf('"');
  if (first === -1 || last <= first) {
    // No context snippet. Try the bare token: 'X'
    var mTok = /Unexpected token '?(.)'?/.exec(message);
    if (mTok) {
      var ch = mTok[1];
      var i = text.indexOf(ch);
      return i >= 0 ? i : -1;
    }
    return -1;
  }
  var context = message.slice(first + 1, last);
  // Trim V8's leading/trailing "..." truncation markers (already outside quotes,
  // but be safe).
  context = context.replace(/^\.\.\./, "").replace(/\.\.\.$/, "");
  if (!context) return -1;

  // The context is a verbatim slice of the source. Find it; the error token is
  // typically near the END of the shown context (V8 shows text up to the bad
  // token). Point at the last char of the located context.
  var at = text.indexOf(context);
  if (at === -1) {
    // The snippet may itself be truncated; fall back to a shorter tail match.
    var tail = context.slice(-15);
    at = text.indexOf(tail);
    if (at === -1) return -1;
    return at + tail.length - 1;
  }
  return at + context.length - 1;
}

function lineColFromPos(text, pos) {
  var line = 1, col = 1;
  var max = Math.min(pos, text.length);
  for (var i = 0; i < max; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line: line, col: col };
}

function posFromLineCol(text, line, col) {
  var curLine = 1, i = 0;
  while (i < text.length && curLine < line) {
    if (text.charCodeAt(i) === 10) curLine++;
    i++;
  }
  return i + (col - 1);
}

// Return up to 3 lines of context around `pos` with a caret under the column.
function snippetAround(text, pos) {
  var start = text.lastIndexOf("\n", Math.max(0, pos - 1)) + 1;
  var end = text.indexOf("\n", pos);
  if (end === -1) end = text.length;
  var lineText = text.slice(start, Math.min(end, start + 200));
  var col = pos - start;
  var caret = new Array(Math.max(0, Math.min(col, 200)) + 1).join(" ") + "^";
  return lineText + "\n" + caret;
}

self.onmessage = function (e) {
  var msg = e.data || {};
  if (msg.type !== "parse") return;
  var id = msg.id;
  var text = msg.text || "";
  var bytes = text.length;

  // Reject empty input early.
  if (!text.trim()) {
    self.postMessage({
      id: id,
      ok: false,
      error: { message: "Empty input — nothing to parse.", line: null, col: null, pos: null, snippet: null },
    });
    return;
  }

  try {
    var value = JSON.parse(text);
    self.postMessage({ id: id, ok: true, value: value, bytes: bytes });
  } catch (err) {
    self.postMessage({ id: id, ok: false, error: locate(text, String(err.message || err)) });
  }
};
