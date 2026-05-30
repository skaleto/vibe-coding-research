// TrustJSON — Node self-test for the core parse/tree logic.
// Runs the SAME tree.js module the extension uses (it exports via module.exports),
// feeds it a large generated JSON, and asserts the model behaves and does not
// blow up (no full DOM, virtualization-friendly flat list).
//
// Usage:  node test/run-tests.mjs
// Exits non-zero on any failure.

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TJ = require(path.join(__dirname, "..", "tree.js"));

let passed = 0, failed = 0;
function ok(name, cond) {
  if (cond) { passed++; console.log("PASS  " + name); }
  else { failed++; console.log("FAIL  " + name); }
}
function eq(name, a, b) { ok(name + "  (got " + JSON.stringify(a) + ")", a === b); }

// ---------------------------------------------------------------------------
// 1. Basic value typing & path building
// ---------------------------------------------------------------------------
eq("valueType null", TJ.valueType(null), "null");
eq("valueType array", TJ.valueType([1]), "array");
eq("valueType object", TJ.valueType({}), "object");
eq("valueType string", TJ.valueType("x"), "string");
eq("valueType number", TJ.valueType(3), "number");
eq("valueType boolean", TJ.valueType(true), "boolean");

eq("path root", TJ.pathToString([]), "$");
eq("path dotted", TJ.pathToString([{ kind: "key", value: "data" }, { kind: "key", value: "users" }, { kind: "index", value: 0 }, { kind: "key", value: "name" }]), "data.users[0].name");
eq("path weird key bracketed", TJ.pathToString([{ kind: "key", value: "a b" }]), '["a b"]');
eq("path key with quote escaped", TJ.pathToString([{ kind: "key", value: 'he"llo' }]), '["he\\"llo"]');

// ---------------------------------------------------------------------------
// 2. Build initial tree expands root one level only
// ---------------------------------------------------------------------------
{
  const data = { a: 1, b: { c: 2 }, d: [10, 20] };
  const { rows, root } = TJ.buildInitial(data);
  // root + 3 top-level keys = 4 visible rows (b and d collapsed)
  eq("initial visible rows = 4", rows.length, 4);
  eq("root is object", root.type, "object");
  ok("b is collapsed", rows.find(r => r.key === "b").collapsed === true);
  ok("d is collapsed", rows.find(r => r.key === "d").collapsed === true);
}

// ---------------------------------------------------------------------------
// 3. Expand / collapse / toggle splices correctly
// ---------------------------------------------------------------------------
{
  const data = { arr: [1, 2, 3], obj: { x: { y: 1 } } };
  const { rows } = TJ.buildInitial(data);
  const arrIdx = rows.findIndex(r => r.key === "arr");
  TJ.expand(rows, arrIdx);
  // arr now shows 3 children
  ok("expand arr adds 3 rows", rows.filter(r => r.depth === 2 && r.keyKind === "index").length === 3);
  const before = rows.length;
  TJ.collapse(rows, arrIdx);
  ok("collapse arr removes children", rows.length === before - 3);
  // toggle expands again
  TJ.toggle(rows, arrIdx);
  ok("toggle re-expands", rows.length === before);
}

// ---------------------------------------------------------------------------
// 4. revealPath expands ancestors and locates a deep node
// ---------------------------------------------------------------------------
{
  const data = { level1: { level2: { level3: { target: "FOUND" } } } };
  const { rows, root } = TJ.buildInitial(data);
  const segs = [
    { kind: "key", value: "level1" },
    { kind: "key", value: "level2" },
    { kind: "key", value: "level3" },
    { kind: "key", value: "target" },
  ];
  const idx = TJ.revealPath(rows, root, segs);
  ok("revealPath finds deep target", idx > -1 && rows[idx].value === "FOUND");
  eq("revealPath path is correct", TJ.rowPath(rows[idx]), "level1.level2.level3.target");
}

// ---------------------------------------------------------------------------
// 5. Large container uses CHILD_CHUNK + load-more (no millions of rows at once)
// ---------------------------------------------------------------------------
{
  const big = [];
  for (let i = 0; i < 50000; i++) big.push(i);
  const data = { big };
  const { rows } = TJ.buildInitial(data);
  const bigIdx = rows.findIndex(r => r.key === "big");
  TJ.expand(rows, bigIdx);
  const childrenNow = rows.filter(r => r.keyKind === "index").length;
  ok("expand huge array materializes only CHILD_CHUNK children", childrenNow === TJ.CHILD_CHUNK);
  ok("load-more sentinel present", rows.some(r => r.loadMore));
  const lmIdx = rows.findIndex(r => r.loadMore);
  TJ.loadMore(rows, lmIdx);
  const childrenAfter = rows.filter(r => r.keyKind === "index").length;
  ok("loadMore adds next chunk", childrenAfter === TJ.CHILD_CHUNK * 2);
}

// ---------------------------------------------------------------------------
// 6. STRESS: large/deep JSON parses and builds without crashing
// ---------------------------------------------------------------------------
{
  // Build a ~ large JSON string (target a few MB) to mimic real big files.
  const users = [];
  const N = 60000;
  for (let i = 0; i < N; i++) {
    users.push({
      id: i,
      name: "user_" + i,
      active: i % 2 === 0,
      score: (i * 7) % 1000,
      tags: ["a", "b", "c"],
      meta: { created: "2026-05-30", nested: { deep: { value: i } } },
    });
  }
  const payload = { count: N, users };
  const text = JSON.stringify(payload);
  const mb = (text.length / 1024 / 1024).toFixed(1);

  const t0 = Date.now();
  const parsed = JSON.parse(text);          // same call worker.js makes
  const t1 = Date.now();
  const { rows, root } = TJ.buildInitial(parsed);
  const t2 = Date.now();

  console.log(`      [stress] generated ${mb} MB JSON, ${N} users`);
  console.log(`      [stress] JSON.parse: ${t1 - t0}ms | buildInitial: ${t2 - t1}ms`);
  console.log(`      [stress] initial visible rows: ${rows.length} (NOT ${N}+ — virtualization works)`);

  // The whole point: initial flat list stays tiny even for a huge file,
  // because the `users` array is collapsed and only chunked when expanded.
  ok("stress: parsed object has all users", parsed.users.length === N);
  ok("stress: initial rows stay small (<= CHILD_CHUNK + a few)", rows.length <= TJ.CHILD_CHUNK + 10);

  // Expand the giant users array — should chunk, not explode.
  const usersIdx = rows.findIndex(r => r.key === "users");
  TJ.expand(rows, usersIdx);
  ok("stress: expanding giant array stays chunked", rows.filter(r => r.depth === 2).length <= TJ.CHILD_CHUNK + 1);

  // Reveal a deep node inside a far-away user (forces load-more walking).
  const segs = [
    { kind: "key", value: "users" },
    { kind: "index", value: N - 1 },
    { kind: "key", value: "meta" },
    { kind: "key", value: "nested" },
    { kind: "key", value: "deep" },
    { kind: "key", value: "value" },
  ];
  const t3 = Date.now();
  const idx = TJ.revealPath(rows, root, segs);
  const t4 = Date.now();
  console.log(`      [stress] revealPath to users[${N - 1}].meta.nested.deep.value: ${t4 - t3}ms`);
  ok("stress: revealPath reaches last user's deep value", idx > -1 && rows[idx].value === N - 1);
  eq("stress: deep path string", TJ.rowPath(rows[idx]), `users[${N - 1}].meta.nested.deep.value`);
}

// ---------------------------------------------------------------------------
// 7. Edge cases
// ---------------------------------------------------------------------------
{
  const { rows } = TJ.buildInitial([]);     // empty array
  eq("empty array -> 1 row", rows.length, 1);
}
{
  const { rows } = TJ.buildInitial("just a string");
  eq("scalar root -> 1 row", rows.length, 1);
  eq("scalar root preview", TJ.previewValue("just a string", "string"), '"just a string"');
}
{
  const { rows } = TJ.buildInitial(null);
  eq("null root -> 1 row", rows.length, 1);
}

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
