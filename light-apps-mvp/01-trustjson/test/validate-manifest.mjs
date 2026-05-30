// TrustJSON — validate manifest.json is legal JSON with complete MV3 fields,
// minimal permissions (the selling point), and that all referenced files exist.
// Usage: node test/validate-manifest.mjs   (exits non-zero on failure)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const m = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

const checks = [];
const check = (name, cond) => checks.push([name, !!cond]);

check("manifest_version === 3", m.manifest_version === 3);
check("has name", typeof m.name === "string" && m.name.length > 0);
check("has version", typeof m.version === "string");
check("has description", typeof m.description === "string");
check("permissions is array", Array.isArray(m.permissions));
check("permissions minimal (only storage)", JSON.stringify(m.permissions) === JSON.stringify(["storage"]));
check("NO host_permissions (trust selling point)", !("host_permissions" in m));
check("NO <all_urls> anywhere", !JSON.stringify(m).includes("<all_urls>"));
check("background.service_worker set", m.background && m.background.service_worker === "background.js");
check("action defined", !!m.action);
check("icons defined (4 sizes)", !!m.icons && Object.keys(m.icons).length === 4);
check("CSP forbids network (connect-src 'none')", m.content_security_policy && /connect-src\s+'none'/.test(m.content_security_policy.extension_pages));
check("web_accessible_resources exposes viewer.html", Array.isArray(m.web_accessible_resources) && JSON.stringify(m.web_accessible_resources).includes("viewer.html"));

const files = [
  "background.js", "viewer.html", "viewer.js", "worker.js", "tree.js",
  "content.js", "styles.css",
  "icons/icon16.png", "icons/icon32.png", "icons/icon48.png", "icons/icon128.png",
];
for (const f of files) check("file exists: " + f, fs.existsSync(path.join(root, f)));

let pass = 0;
for (const [n, ok] of checks) { console.log((ok ? "PASS  " : "FAIL  ") + n); if (ok) pass++; }
console.log(`\n${pass}/${checks.length} checks passed`);
process.exit(pass === checks.length ? 0 : 1);
