import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pagePath = join(projectRoot, "dist", "index.html");

assert.ok(existsSync(pagePath), "dist/index.html must exist");

const html = readFileSync(pagePath, "utf8");
const requiredPatterns = [
  [/^<!doctype html>/i, "HTML5 doctype"],
  [/<html[^>]+lang="it"/i, "Italian document language"],
  [/<title>[^<]*Ramen di Sergio[^<]*<\/title>/i, "Ramen di Sergio page title"],
  [/<meta[^>]+name="description"[^>]+content="[^"]+"/i, "meta description"],
  [/"@type"\s*:\s*"Restaurant"/i, "Restaurant structured data"],
  [/id="storia"/i, "story section"],
  [/id="menu"/i, "menu section"],
  [/id="esperienza"/i, "experience section"],
  [/id="galleria"/i, "gallery section"],
  [/id="contatti"/i, "contact section"],
  [/https:\/\/go\.nordqr\.com\/ilramendisergio\//i, "public menu link"],
  [/href="tel:\+390309173342"/i, "telephone link"],
  [/Via Mazzini 36/i, "street address"],
  [/google\.com\/maps/i, "Google Maps link"],
  [/instagram\.com\/ilramen_di_sergio/i, "Instagram link"],
  [/id="navToggle"[^>]+aria-expanded="false"[^>]+aria-controls="mobileMenu"/i, "mobile menu ARIA"],
  [/id="lightbox"[^>]+role="dialog"[^>]+aria-modal="true"/i, "lightbox dialog semantics"],
  [/@media\s*\(prefers-reduced-motion:\s*reduce\)/i, "reduced-motion support"],
];

for (const [pattern, label] of requiredPatterns) {
  assert.match(html, pattern, `Missing ${label}`);
}

const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
assert.ok(images.length >= 8, "The page must include at least eight images");
for (const image of images) {
  // la foto di sfondo della hero è decorativa (dentro aria-hidden): alt vuoto è corretto
  if (/hero-bg/.test(image)) continue;
  assert.match(image, /\balt="[^"]+"/i, `Image is missing a useful alt attribute: ${image}`);
}

const sources = [...html.matchAll(/<(?:img|script)\b[^>]*\bsrc="([^"]+)"/gi)]
  .map((match) => match[1])
  .filter((source) => !/^(?:https?:|data:|\/\/)/i.test(source));

for (const source of sources) {
  const assetPath = join(dirname(pagePath), source.split(/[?#]/)[0]);
  assert.ok(existsSync(assetPath), `Missing local asset: ${source}`);
}

const interactionPatterns = [
  [/navToggle\.addEventListener\(["']click["']/i, "mobile navigation handler"],
  [/IntersectionObserver/i, "reveal observer"],
  [/event\.key\s*===\s*["']Escape["']/i, "Escape key handler"],
  [/event\.key\s*===\s*["']ArrowLeft["']/i, "left-arrow handler"],
  [/event\.key\s*===\s*["']ArrowRight["']/i, "right-arrow handler"],
  [/lastFocused\.focus\(\)/i, "focus restoration"],
  [/new Date\(\)\.getFullYear\(\)/i, "dynamic copyright year"],
];

for (const [pattern, label] of interactionPatterns) {
  assert.match(html, pattern, `Missing ${label}`);
}

console.log("All Ramen di Sergio site checks passed.");
