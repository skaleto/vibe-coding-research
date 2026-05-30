// TrustJSON — tree model & flattening logic (shared, pure, no DOM, no network).
//
// Design for large files:
//   - The parsed value is a plain JS object/array (from JSON.parse, in a Worker).
//   - We never build DOM for the whole tree. Instead we maintain a FLAT array of
//     "visible rows". Collapsed subtrees are NOT materialized into rows.
//   - Expand = splice the node's immediate children into the flat array.
//   - Collapse = splice the node's descendants out.
//   - The renderer then windows over this flat array (virtual scroll).
//
// A Row describes one rendered line.
//
// This module is loaded both as a classic <script> (window.TJTree) and is safe
// to import in tests via require-like shims (see test/run-tests.mjs).

(function (root) {
  "use strict";

  // Cap how many immediate children we materialize at once for a single
  // container, so an array with millions of entries cannot create millions of
  // rows in one synchronous splice. Extra children are shown via a "load more"
  // sentinel row.
  var CHILD_CHUNK = 1000;

  function valueType(v) {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    var t = typeof v;
    if (t === "object") return "object";
    return t; // "string" | "number" | "boolean"
  }

  function isContainer(type) {
    return type === "object" || type === "array";
  }

  function childCount(v, type) {
    if (type === "array") return v.length;
    if (type === "object") return Object.keys(v).length;
    return 0;
  }

  // Build a JSON path string from an array of segments.
  // Object keys that are safe identifiers use dot notation; others use ["..."] ;
  // array indices use [n]. Root is "$" when no segments.
  function pathToString(segments) {
    if (!segments || segments.length === 0) return "$";
    var out = "";
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      if (seg.kind === "index") {
        out += "[" + seg.value + "]";
      } else {
        var k = seg.value;
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k)) {
          out += (out === "" ? "" : ".") + k;
        } else {
          out += '["' + String(k).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"]';
        }
      }
    }
    return out.charAt(0) === "[" ? out : out; // leading [ is fine without root prefix
  }

  // Create a single row object.
  function makeRow(value, type, segments, depth, keyLabel, keyKind) {
    var ct = childCount(value, type);
    return {
      value: value,
      type: type,
      segments: segments,         // array of {kind:'key'|'index', value}
      depth: depth,
      key: keyLabel,              // display key (string) or null for root
      keyKind: keyKind || null,   // 'key' | 'index' | null
      isContainer: isContainer(type),
      childCount: ct,
      collapsed: true,            // default collapsed; renderer expands root level
      loadedChildren: 0,          // how many immediate children currently materialized
      _path: null,                // lazily computed path string cache
    };
  }

  function rowPath(row) {
    if (row._path === null) row._path = pathToString(row.segments);
    return row._path;
  }

  // Return immediate children rows for a container row, materializing up to
  // `limit` of them starting at offset `from`.
  function childRows(parentRow, from, limit) {
    var rows = [];
    var v = parentRow.value;
    var depth = parentRow.depth + 1;
    if (parentRow.type === "array") {
      var end = Math.min(v.length, from + limit);
      for (var i = from; i < end; i++) {
        var seg = parentRow.segments.concat([{ kind: "index", value: i }]);
        rows.push(makeRow(v[i], valueType(v[i]), seg, depth, String(i), "index"));
      }
    } else if (parentRow.type === "object") {
      var keys = Object.keys(v);
      var end2 = Math.min(keys.length, from + limit);
      for (var j = from; j < end2; j++) {
        var key = keys[j];
        var seg2 = parentRow.segments.concat([{ kind: "key", value: key }]);
        rows.push(makeRow(v[key], valueType(v[key]), seg2, depth, key, "key"));
      }
    }
    return rows;
  }

  // Build the initial flat list: a single root row, then expand it one level.
  // Returns { rows: Row[], root: Row }.
  function buildInitial(parsed) {
    var type = valueType(parsed);
    var root = makeRow(parsed, type, [], 0, null, null);
    var rows = [root];
    if (root.isContainer && root.childCount > 0) {
      expand(rows, 0); // expand root one level by default
    }
    return { rows: rows, root: root };
  }

  // Number of currently-visible rows that belong to the subtree rooted at index
  // `idx` (i.e. rows after idx whose depth > rows[idx].depth, contiguous).
  function subtreeSpan(rows, idx) {
    var baseDepth = rows[idx].depth;
    var n = 0;
    for (var i = idx + 1; i < rows.length; i++) {
      if (rows[i].depth > baseDepth) n++;
      else break;
    }
    return n;
  }

  // Expand the container at row index `idx` by one level (materialize immediate
  // children). Mutates `rows` in place. No-op if not a container / already
  // expanded / empty.
  function expand(rows, idx) {
    var row = rows[idx];
    if (!row.isContainer || !row.collapsed || row.childCount === 0) return 0;
    var take = Math.min(CHILD_CHUNK, row.childCount);
    var kids = childRows(row, 0, take);
    row.loadedChildren = take;
    row.collapsed = false;
    // If there are more children than the first chunk, append a "load more" row.
    if (take < row.childCount) {
      kids.push(makeLoadMore(row));
    }
    spliceInsert(rows, idx + 1, kids);
    return kids.length;
  }

  // Collapse the container at row index `idx`: remove its whole visible subtree.
  function collapse(rows, idx) {
    var row = rows[idx];
    if (!row.isContainer || row.collapsed) return 0;
    var span = subtreeSpan(rows, idx);
    rows.splice(idx + 1, span);
    row.collapsed = true;
    row.loadedChildren = 0;
    return span;
  }

  function toggle(rows, idx) {
    var row = rows[idx];
    if (!row.isContainer) return 0;
    return row.collapsed ? expand(rows, idx) : collapse(rows, idx);
  }

  // "Load more" sentinel row for very large containers.
  function makeLoadMore(parentRow) {
    return {
      loadMore: true,
      parent: parentRow,
      depth: parentRow.depth + 1,
      type: "loadmore",
      isContainer: false,
      childCount: 0,
      segments: parentRow.segments,
      key: null,
    };
  }

  // Materialize the next chunk of children for `parentRow`, given the index of
  // its load-more row in `rows`. Replaces the load-more row with new children
  // (and a fresh load-more row if still more remain).
  function loadMore(rows, loadMoreIdx) {
    var lm = rows[loadMoreIdx];
    if (!lm || !lm.loadMore) return 0;
    var parent = lm.parent;
    var from = parent.loadedChildren;
    var take = Math.min(CHILD_CHUNK, parent.childCount - from);
    var kids = childRows(parent, from, take);
    parent.loadedChildren += take;
    if (parent.loadedChildren < parent.childCount) {
      kids.push(makeLoadMore(parent));
    }
    rows.splice(loadMoreIdx, 1); // remove old load-more
    spliceInsert(rows, loadMoreIdx, kids);
    return kids.length;
  }

  // Splice helper that avoids "Maximum call stack" from apply() on huge arrays.
  function spliceInsert(arr, at, items) {
    if (items.length < 50000) {
      Array.prototype.splice.apply(arr, [at, 0].concat(items));
    } else {
      // Chunked insert for safety on very large item arrays.
      for (var i = 0; i < items.length; i += 50000) {
        var slice = items.slice(i, i + 50000);
        Array.prototype.splice.apply(arr, [at + i, 0].concat(slice));
      }
    }
  }

  // Expand every ancestor of the row at `targetIdx`... but search works on the
  // value tree, not the flat list. So we provide a way to reveal a path:
  // given the root and a target row's segments, ensure all ancestors are
  // expanded and return the index of the target row in `rows`.
  // This rebuilds visibility along the path.
  function revealPath(rows, root, segments) {
    // Walk from root, expanding as needed, locating the row index each step.
    var idx = 0; // root is at 0
    for (var d = 0; d < segments.length; d++) {
      var row = rows[idx];
      if (row.isContainer && row.collapsed) expand(rows, idx);
      // Find the child row matching segments[d] among the immediate children.
      var seg = segments[d];
      var found = -1;
      var baseDepth = row.depth;
      for (var i = idx + 1; i < rows.length; i++) {
        var r = rows[i];
        if (r.depth <= baseDepth) break;
        if (r.depth === baseDepth + 1 && r.loadMore) {
          // Need to load more to find a later child.
          loadMore(rows, i);
          i--; // re-check from replaced position
          continue;
        }
        if (r.depth === baseDepth + 1 && r.keyKind === seg.kind && String(r.key) === String(seg.value)) {
          found = i;
          break;
        }
      }
      if (found === -1) return -1;
      idx = found;
    }
    return idx;
  }

  // Compact one-line preview of a value (used for collapsed containers / strings).
  function previewValue(value, type) {
    if (type === "string") return JSON.stringify(value);
    if (type === "null") return "null";
    if (type === "boolean" || type === "number") return String(value);
    if (type === "array") return "[" + (value.length ? "…" : "") + "]";
    if (type === "object") {
      var k = Object.keys(value);
      return "{" + (k.length ? "…" : "") + "}";
    }
    return "";
  }

  var api = {
    valueType: valueType,
    isContainer: isContainer,
    childCount: childCount,
    pathToString: pathToString,
    rowPath: rowPath,
    buildInitial: buildInitial,
    expand: expand,
    collapse: collapse,
    toggle: toggle,
    loadMore: loadMore,
    subtreeSpan: subtreeSpan,
    revealPath: revealPath,
    previewValue: previewValue,
    makeRow: makeRow,
    childRows: childRows,
    CHILD_CHUNK: CHILD_CHUNK,
  };

  root.TJTree = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : this);
