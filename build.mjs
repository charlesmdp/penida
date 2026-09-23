import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {build} from 'esbuild';
import {marked} from 'marked';
import TurndownService from 'turndown';
const root=path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
const source=path.join(root,'source'),dist=path.join(root,'dist');
const read=f=>fs.readFileSync(path.join(source,f),'utf8');
const write=(f,value)=>{const full=path.join(dist,f);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,value)};
// Clean only generated output; originals are retained in source/media.
const thumbnail=fs.existsSync(path.join(dist,'screenshot.jpeg'))?fs.readFileSync(path.join(dist,'screenshot.jpeg')):null;
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
if(thumbnail)write('screenshot.jpeg',thumbnail);
await import('./optimize-assets.mjs');
const {jm}=await import('./source/app.js');
const assets=JSON.parse(read('optimized-assets.json'));
const logo=assets.find(a=>a.url.endsWith('/penidalogo.png')).local;
const favicon=assets.find(a=>a.url.endsWith('/Artboard.png')).local;
const manifest=JSON.parse(read('legal.json'));
const articles=JSON.parse(read('articles.json'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const noindex=process.env.SITE_PUBLIC!=='1';
const origin=(process.env.SITE_ORIGIN||'https://penida.io').replace(/\/$/,'');
const updated='2026-09-23';
const markdownPath=url=>url==='/'?'/index.md':url+'.md';
const pages=[];
const allMarkdown=[];
const head=(url,title,description,retired=false)=>`<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#1c3b36"><title>${escape(title)}</title><meta name="description" content="${escape(description)}">${noindex||retired?'<meta name="robots" content="noindex,nofollow">':''}<link rel="canonical" href="${origin+url}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="${url.startsWith('/blog/')?'article':'website'}"><meta property="og:url" content="${origin+url}"><link rel="icon" type="image/png" href="${favicon}"><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/style.css"><link rel="stylesheet" href="/assets/enhancements.css">${retired?'':`<link rel="alternate" type="text/markdown" href="${markdownPath(url)}" title="Markdown version"><link rel="describedby" href="/llms.txt" type="text/plain">`}</head>`;
const legalLinks=manifest.pages.map(p=>`<a href="${p.path}">${escape(p.title)}</a>`).join('');
const footer=`<nav aria-label="Website resources" class="legal-page-footer">${legalLinks}<a href="/ai">AI reference</a><a href="/llms">LLM resources</a></nav><footer class="legal-identity"><p>© 2026 PENIDA SAS · 14 rue Charles V, 75004 Paris, France</p><a href="mailto:penidastudio@gmail.com">penidastudio@gmail.com</a></footer>`;
const header=`<header class="legal-header"><div class="legal-header-inner"><a href="/" aria-label="Penida home"><img src="${logo}" width="150" height="30" style="width:auto" alt="Penida"></a><a href="/">← Back to Home</a></div></header>`;
const script='<script src="/assets/enhancements.js" defer></script>';
const writeRoute=(url,html)=>write(url==='/'?'index.html':url.slice(1)+'/index.html',html);
const mdAbsolute=md=>md.replace(/\]\(\/(?!\/)([^)]*)\)/g,`](${origin}/$1)`);
const writeMarkdown=(url,title,md)=>{
 const body=mdAbsolute(md.trim())+`\n\n---\nSource: ${origin+url}\nUpdated: September 23, 2026\n`;
 write(markdownPath(url).slice(1),body);allMarkdown.push({url,title,body});
};
const markdownHTML=md=>marked.parse(md).replace(/<table>/g,'<div class="table-wrap"><table>').replace(/<\/table>/g,'</table></div>');
write('assets/style.css',read('original.css').replace(/^@import"[^"]+";/,''));
write('assets/enhancements.css',read('enhancements.css'));write('assets/enhancements.js',read('enhancements.js'));
for(const font of fs.readdirSync(path.join(source,'fonts')).filter(f=>f.endsWith('.woff2')||f==='fonts.css'))fs.copyFileSync(path.join(source,'fonts',font),path.join(dist,'assets',font));
await build({entryPoints:['source/client.js'],bundle:true,minify:true,format:'esm',outfile:'dist/assets/app.js',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof',target:['es2020']});
const homeTitle='Penida - French Startup studio building SaaS & Shopify apps';
const homeDescription='Penida is a French startup studio building powerful SaaS & Shopify apps. Join 103,500+ merchants using our tools to grow their business.';
const homeHTML=renderToString(createElement(jm));
writeRoute('/',head('/',homeTitle,homeDescription)+`<body><a href="#solutions" class="skip-link">Skip to content</a><main id="root">${homeHTML}</main>${script}<script src="/assets/app.js" type="module"></script></body></html>`);
pages.push('/');
const td=new TurndownService({headingStyle:'atx',bulletListMarker:'-'});
td.remove(['svg','button','nav','header','footer','style','script']);
writeMarkdown('/',homeTitle,td.turndown(homeHTML));
for(const a of articles){
 const md=read('articles/'+a.slug+'.md');
 const body=markdownHTML(md.replace(/^# .+\n+/,''));
 const related=articles.filter(other=>other.slug!==a.slug).map(other=>`<a href="${other.path}">${escape(other.title)} →</a>`).join('');
 writeRoute(a.path,head(a.path,a.title+' | Penida',a.description)+`<body><a href="#article-content" class="skip-link">Skip to content</a>${header}<main id="article-content" class="legal-page article-page"><a class="article-back" href="/#blog">← Back to articles</a><p class="legal-kicker">${a.tag.toUpperCase()}</p><h1>${escape(a.title)}</h1><p class="legal-intro">${escape(a.description)}</p><p class="legal-date">${a.author} · Updated <time datetime="${updated}">${a.updated}</time> · ${a.readTime}</p><div class="article-content">${body}</div><div class="article-actions"><a href="${markdownPath(a.path)}">Read in Markdown</a><a href="/#apps">Explore our apps</a></div><aside class="article-related" aria-label="Related articles">${related}</aside></main>${footer}${script}</body></html>`);
 pages.push(a.path);writeMarkdown(a.path,a.title,md);
}
for(const p of manifest.pages){
 const toc=p.sections.map(([id,title])=>`<li><a href="#${id}">${escape(title)}</a></li>`).join('');
 const body=p.sections.map(([id,title,html])=>`<section id="${id}"><h2>${escape(title)}</h2>${html}</section>`).join('');
 writeRoute(p.path,head(p.path,p.title+' | Penida',p.intro)+`<body><a href="#main" class="skip-link">Skip to content</a>${header}<main id="main" class="legal-page"><p class="legal-kicker">PENIDA</p><h1>${escape(p.title)}</h1><p class="legal-intro">${escape(p.intro)}</p><p class="legal-date">Last updated: ${manifest.updated}</p><nav class="legal-toc" aria-label="On this page"><h2>Contents</h2><ul>${toc}</ul></nav><div class="legal-body">${body}</div><div class="article-actions"><a href="${markdownPath(p.path)}">Read in Markdown</a></div></main>${footer}${script}</body></html>`);
 pages.push(p.path);writeMarkdown(p.path,p.title,`# ${p.title}\n\n${p.intro}\n\n`+td.turndown(body));
}
for(const [url,title,description] of [['/ai','Penida: official reference','Official studio facts, current product links, contact details and machine-readable resources.'],['/llms','Penida resources for language models','HTML and Markdown sources for retrieving up-to-date information about Penida.']]){
 const md=read(url.slice(1)+'.md');
 writeRoute(url,head(url,title+' | Penida',description)+`<body><a href="#main" class="skip-link">Skip to content</a>${header}<main id="main" class="legal-page article-page"><p class="legal-kicker">PENIDA / REFERENCE</p><h1>${escape(title)}</h1><div class="article-content">${markdownHTML(md.replace(/^# .+\n+/,''))}</div><div class="article-actions"><a href="${markdownPath(url)}">Read in Markdown</a></div></main>${footer}${script}</body></html>`);
 pages.push(url);writeMarkdown(url,title,md);
}
// Old inbound policy links remain informative, but no longer assert Penida operates a sold app.
for(const [slug,name] of [['bee-logo-showcase','Bee Logo Showcase'],['goat-badges','Goat Badges']]){
 const url='/privacy-policy/'+slug;
 writeRoute(url,head(url,name+' policy information | Penida','This application is no longer part of Penida’s current app portfolio.',true)+`<body>${header}<main id="main" class="legal-page"><h1>${name}</h1><div class="article-content"><p>This app has been sold and is no longer part of Penida’s current app portfolio.</p><p>For the app’s current privacy policy and support contact, use the links in its current Shopify App Store listing or within the app. This page is not the app’s privacy policy.</p><p><a href="/privacy-policy">Penida website Privacy Policy</a> · <a href="/">Back to Penida</a></p></div></main>${footer}${script}</body></html>`);
}
write('llms.txt',`# Penida\n\n> French startup studio building SaaS products and Shopify apps. Founded by Marc and Charles.\n\nUpdated: September 23, 2026. Product features and pricing are maintained on each product’s official website.\n\n## Studio\n\n- [Official reference](${origin}/ai.md): Studio facts, current products and portfolio updates.\n- [Homepage](${origin}/index.md): Studio presentation and app directory.\n- [Contact](mailto:penidastudio@gmail.com): General enquiries.\n\n## Articles\n\n${articles.map(a=>`- [${a.title}](${origin+a.path}.md): ${a.description}`).join('\n')}\n\n## Policies\n\n${manifest.pages.map(p=>`- [${p.title}](${origin+p.path}.md): ${p.intro}`).join('\n')}\n\n## Optional\n\n- [All reference content](${origin}/llms-full.txt): Combined studio reference, articles and policies.\n- [Resource guide](${origin}/llms.md): Available formats and freshness.\n- [Sitemap](${origin}/sitemap.xml): Canonical HTML pages.\n`);
write('llms-full.txt',`# Penida — complete reference\n\nUpdated: September 23, 2026.\n\n`+allMarkdown.filter(p=>!['/','/llms'].includes(p.url)).map(p=>p.body).join('\n\n---\n\n'));
write('404.html',head('/404','Page not found | Penida','Return to the Penida studio website.',true)+'<body><main class="not-found"><h1>Page not found</h1><p>This page is not available. Explore our apps or get in touch with the Penida team.</p><a href="/">Back to Penida</a></main></body></html>');
write('robots.txt',noindex?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(r=>`<url><loc>${origin+r}</loc><lastmod>${updated}</lastmod></url>`).join('')+'</urlset>');
write('_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n/*.md\n  Content-Type: text/markdown; charset=utf-8\n/blog/*.md\n  Content-Type: text/markdown; charset=utf-8\n/assets/*\n  Cache-Control: public, max-age=3600\n');
fs.writeFileSync(path.join(root,'routes.json'),JSON.stringify(pages,null,2)+'\n');
console.log(`Built ${pages.length} complete HTML pages, 2 retired-app notices, ${allMarkdown.length} Markdown pages and 2 LLM text resources. ${noindex?'Private review mode (noindex).':'Public mode.'}`);
