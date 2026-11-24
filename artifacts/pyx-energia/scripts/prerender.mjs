import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist/public");
const templatePath = path.join(dist, "index.html");

const { render, seoPages } = await import(pathToFileURL(path.join(root, "dist/server/entry-server.js")).href);

const template = fs.readFileSync(templatePath, "utf8");
if (!template.includes('<div id="root"></div>')) {
  throw new Error("index.html do build não tem <div id=\"root\"></div>");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`pré-render: tag ausente (${label})`);
  return html.replace(pattern, replacement);
}

function applyMeta(html, attr, key, content) {
  const pattern = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  return replaceOnce(
    html,
    pattern,
    `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`,
    `${attr}=${key}`,
  );
}

function applyHead(html, page) {
  let next = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`, "title");
  next = applyMeta(next, "name", "description", page.description);
  next = applyMeta(next, "property", "og:title", page.ogTitle);
  next = applyMeta(next, "property", "og:description", page.ogDescription);
  next = applyMeta(next, "property", "twitter:title", page.ogTitle);
  next = applyMeta(next, "property", "twitter:description", page.ogDescription);
  if (page.robots) {
    next = next.replace(/<link rel="canonical" href="[^"]*"\s*\/?>\s*/g, "");
    next = next.replace(/<meta property="og:url" content="[^"]*"\s*\/?>\s*/g, "");
    next = next.replace(/<meta property="twitter:url" content="[^"]*"\s*\/?>\s*/g, "");
    next = next.replace("</head>", `    <meta name="robots" content="${page.robots}" />\n  </head>`);
    return next;
  }
  const url = page.path === "/" ? "https://pyxenergia.com/" : `https://pyxenergia.com${page.path}`;
  next = replaceOnce(
    next,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
    "canonical",
  );
  next = applyMeta(next, "property", "og:url", url);
  next = applyMeta(next, "property", "twitter:url", url);
  return next;
}

function writePage(page) {
  const rendered = render(page.path);
  let html = applyHead(template, page);
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>\s*/, "");
  html = html.replace('<div id="root"></div>', `<div id="root">${rendered}</div>`);
  if (!html.includes('type="module"')) throw new Error(`${page.file} perdeu o script do app`);
  if (!/<h1[\s>]/.test(html)) throw new Error(`${page.file} não tem h1`);
  if (!html.includes(`<title>${escapeHtml(page.title)}</title>`)) {
    throw new Error(`${page.file} não tem o title da rota`);
  }
  for (const marker of page.markers) {
    if (!html.includes(marker)) throw new Error(`${page.file} não contém "${marker}"`);
  }
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (jsonLd.length === 0) throw new Error(`${page.file} sem JSON-LD`);
  for (const block of jsonLd) JSON.parse(block[1]);
  const visible = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
  if (page.path === "/") {
    if (page.description.length < 150 || page.description.length > 160) {
      throw new Error(`description da home com ${page.description.length} caracteres`);
    }
    if (!visible.includes("Absolutamente nenhuma")) {
      throw new Error("home sem resposta do FAQ no HTML, fora do JSON-LD");
    }
    if (!html.includes("FAQPage")) throw new Error("home sem schema FAQPage");
    if (!html.includes("contato@pyxenergia.com") || !html.includes("Alagoas") || !html.includes("Sergipe")) {
      throw new Error("home sem e-mail ou estados no schema");
    }
  }
  if (page.path !== "/404" && page.path !== "/") {
    if (!/<link rel="canonical" href="https:\/\/pyxenergia\.com[^"]*"/.test(html)) {
      throw new Error(`${page.file} sem canonical`);
    }
  }
  const outfile = path.join(dist, page.file);
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  fs.writeFileSync(outfile, html);
  return outfile;
}

const spa = applyHead(template, {
  ...seoPages.home,
  title: "PYX Energia",
  ogTitle: "PYX Energia",
  robots: "noindex, nofollow",
});
fs.writeFileSync(path.join(dist, "spa.html"), spa);

for (const page of Object.values(seoPages)) {
  writePage(page);
}

if (!fs.readFileSync(path.join(dist, "index.html"), "utf8").includes("LocalBusiness")) {
  throw new Error("index.html sem JSON-LD LocalBusiness");
}

const lastmod = new Date().toISOString().slice(0, 10);
const sitemapPath = path.join(dist, "sitemap.xml");
let sitemap = fs.readFileSync(sitemapPath, "utf8");
if (!sitemap.includes("<lastmod>")) {
  sitemap = sitemap.replace(/<loc>([^<]+)<\/loc>/g, `<loc>$1</loc>\n    <lastmod>${lastmod}</lastmod>`);
} else {
  sitemap = sitemap.replaceAll(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${lastmod}</lastmod>`);
}
fs.writeFileSync(sitemapPath, sitemap);
if (!fs.readFileSync(sitemapPath, "utf8").includes("<lastmod>")) {
  throw new Error("sitemap.xml sem lastmod");
}

const favicon = path.join(dist, "favicon.ico");
const faviconBytes = fs.readFileSync(favicon);
if (faviconBytes.length < 16 || faviconBytes.subarray(0, 4).toString("hex") !== "00000100") {
  throw new Error("favicon.ico ausente ou não é um arquivo ICO");
}

console.log(`pré-render: ${Object.keys(seoPages).join(", ")}; sitemap lastmod ${lastmod}`);
