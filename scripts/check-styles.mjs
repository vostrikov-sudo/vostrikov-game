#!/usr/bin/env node
// Check the styles actually linked by SSR, including a second pass after all
// routes are loaded: Tailwind watch dependencies can pollute the warm dev graph.
import assert from "node:assert/strict";
import { checkedUrl } from "./browser-guard.mjs";

const origin = new URL(checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"));
const routes = ["/", "/profile", "/runner", "/battle"];
const unrelatedStyles = [
  /\.hero-overlay\b/,
  /--accent2\s*:/,
  /\.powered-by\b/,
  /--text-footnote\s*:/,
];

async function read(url, mime) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  assert.match(response.headers.get("content-type") ?? "", mime, `${url}: wrong content type`);
  return response.text();
}

for (let pass = 1; pass <= 2; pass++) {
  for (const route of routes) {
    const url = new URL(route, origin);
    const html = await read(url, /text\/html/);
    const styles = [];
    for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
      if (!/\brel=["']stylesheet["']/i.test(tag)) continue;
      const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]?.replaceAll("&amp;", "&");
      if (!href) continue;
      const asset = new URL(href, url);
      if (asset.origin !== origin.origin) continue;
      styles.push(await read(asset, /text\/css/));
    }
    assert.ok(styles.length, `${route}: SSR must link application CSS before hydration`);
    const css = styles.join("\n");
    assert.match(css, /--color-bg\s*:\s*#0c0d10\b/, `${route}: missing game theme`);
    assert.match(css, /\.px-4\s*\{/, `${route}: missing spacing utilities`);
    for (const pattern of unrelatedStyles) {
      assert.doesNotMatch(
        css,
        pattern,
        `${route}: archived app or PWA install styles leaked into game`,
      );
    }
    if (route === "/battle")
      assert.match(css, /\.battle-stage\s*\{/, "Battle CSS missing from SSR");
    console.log(`PASS ${route}: application CSS, spacing and isolation (pass ${pass})`);
  }
}
