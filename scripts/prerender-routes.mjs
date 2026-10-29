import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { App, contentPages, openRoles } = await vite.ssrLoadModule('/src/main.jsx');
  const origin = 'https://www.srisun.com';
  const paths = [
    '/',
    ...contentPages.map((page) => page.path),
    '/careers', '/careers/jobs', '/contact-us',
    ...openRoles.flatMap((role) => {
      const base = `/careers/jobs/${role.id}`;
      return [base, `${base}/apply`];
    }),
    '/search'
  ].filter((p, index, all) => all.indexOf(p) === index);
  const pageByPath = new Map(contentPages.map((page) => [page.path, page]));
  const publishedPages = new Set(JSON.parse(await readFile(path.resolve('src/generated/pages.json'), 'utf8')).map((page) => page.path));
  const template = await readFile(path.resolve('dist/index.html'), 'utf8');
  const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const rolePath = (role) => `/careers/jobs/${role.id}`;

  for (const pathname of paths) {
    globalThis.window = { location: { pathname, search: '', origin } };
    const page = pageByPath.get(pathname);
    const selectedRole = openRoles.find((role) => rolePath(role) === pathname.replace(/\/apply$/, ''));
    const isCareer = pathname.startsWith('/careers');
    const isContact = pathname === '/contact-us';
    const isHome = pathname === '/';
    const title = isCareer
      ? pathname.endsWith('/jobs') ? 'Open Roles at Srisun | Careers' : pathname.endsWith('/apply') ? 'Apply for a Role at Srisun | Careers' : selectedRole ? `${selectedRole.title} at Srisun | Careers` : 'Careers at Srisun | Build what moves people forward'
      : isContact ? 'Contact Srisun | Let’s build something better' : isHome ? 'Srisun | Technology Solutions for Businesses' : `${page?.title || 'Srisun'} | Srisun`;
    const description = isCareer ? selectedRole?.summary || 'Explore open roles at Srisun across India and find your next opportunity.' : isContact ? 'Contact Srisun to discuss technology consulting, software, automation and digital services.' : page?.description || 'Srisun builds technology for better lives and businesses.';
    const canonical = `${origin}${pathname === '/' ? '/' : pathname}`;
    // policy pages are indexed once their text has been published from the admin
    const noindex = (page?.group === 'Policies' && !publishedPages.has(pathname)) || pathname.endsWith('/apply');
    const faq = page && page.group !== 'Policies' ? [
      { question: `What does Srisun cover in ${page.title}?`, answer: page.description },
      { question: 'How do I start a conversation with Srisun?', answer: 'Use the Contact Us page to share your goals, current context and the best way to reach you.' },
      { question: 'Can the work be shaped around our needs?', answer: 'Share your requirements with the Srisun team so the scope and next steps can be discussed in context.' }
    ] : [];
    const graph = [
      { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Srisun', url: `${origin}/`, logo: `${origin}/assets/srisun-logo.png`, email: 'hello@srisun.ai', telephone: '+91 88833 88162', description: 'Building technology for better lives and businesses.' },
      { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'Srisun', publisher: { '@id': `${origin}/#organization` } },
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, isPartOf: { '@id': `${origin}/#website` }, about: { '@id': `${origin}/#organization` } },
      ...(faq.length ? [{ '@type': 'FAQPage', mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) }] : [])
    ];
    const metadata = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}" /><meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow'}" /><link rel="canonical" href="${canonical}" /><meta property="og:site_name" content="Srisun" /><meta property="og:type" content="website" /><meta property="og:title" content="${escapeHtml(title)}" /><meta property="og:description" content="${escapeHtml(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:image" content="${origin}/assets/srisun-logo.png" /><script id="srisun-schema" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`;
    const content = renderToString(React.createElement(App));
    const html = template
      .replace(/<title>.*?<\/title>/s, '')
      .replace(/<meta name="description"[^>]*\/>/s, '')
      .replace(/<meta property="og:[^"]+"[^>]*\/>/g, '')
      .replace(/<link rel="canonical"[^>]*\/>/g, '')
      .replace('</head>', `${metadata}</head>`)
      .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
    const output = pathname === '/' ? path.resolve('dist/index.html') : path.resolve('dist', pathname.slice(1), 'index.html');
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
  }
  console.log(`Prerendered ${paths.length} routes for search and direct entry.`);

  // ---------------------------------------------------------------------
  // Published case studies, from the client snapshot that
  // scripts/snapshot-data.mjs wrote from the database just before this build.
  // Each gets a static shell carrying real <head> metadata and structured data
  // (React fills the body), plus a sitemap entry. The snapshot only holds
  // public data, so drafts cannot leak in here.
  // ---------------------------------------------------------------------
  let published = [];
  try {
    const snapshot = JSON.parse(await readFile(path.resolve('dist/data/clients.json'), 'utf8'));
    published = (snapshot.clients || []).filter((client) => client.caseStudy?.status === 'published');
  } catch (error) {
    console.warn(`Case studies skipped: no client snapshot (${error.message}).`);
  }

  for (const client of published) {
    const cs = client.caseStudy;
    const url = `${origin}/clients/stories/${client.id}`;
    const title = cs.seoTitle || `${client.name} | Srisun Case Study`;
    const description = cs.metaDescription || cs.summary || client.description || `${client.name} is part of the Srisun client portfolio.`;
    const graph = [
      { '@type': 'Article', '@id': `${url}#article`, headline: title, description, url, isPartOf: { '@id': `${origin}/#website` }, publisher: { '@id': `${origin}/#organization` }, about: { '@type': 'Organization', name: client.name, ...(client.website ? { url: client.website } : {}) }, ...(cs.publishedAt ? { datePublished: cs.publishedAt.replace(' ', 'T') } : {}) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Clients', item: `${origin}/clients` },
        { '@type': 'ListItem', position: 2, name: 'Customer stories', item: `${origin}/clients/stories` },
        { '@type': 'ListItem', position: 3, name: client.name, item: url }
      ] },
      { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Srisun', url: `${origin}/`, logo: `${origin}/assets/srisun-logo.png` },
      { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'Srisun' }
    ];
    const metadata = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}" /><meta name="robots" content="index,follow" />${cs.keywords ? `<meta name="keywords" content="${escapeHtml(cs.keywords)}" />` : ''}<link rel="canonical" href="${url}" /><meta property="og:site_name" content="Srisun" /><meta property="og:type" content="article" /><meta property="og:title" content="${escapeHtml(cs.ogTitle || title)}" /><meta property="og:description" content="${escapeHtml(cs.ogDescription || description)}" /><meta property="og:url" content="${url}" /><meta property="og:image" content="${cs.heroImage ? origin + cs.heroImage : origin + '/assets/srisun-logo.png'}" /><meta name="twitter:card" content="summary_large_image" /><script id="srisun-schema" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\u003c')}</script>`;
    const html = template
      .replace(/<title>.*?<\/title>/s, '')
      .replace(/<meta name="description"[^>]*\/>/s, '')
      .replace(/<meta property="og:[^"]+"[^>]*\/>/g, '')
      .replace(/<link rel="canonical"[^>]*\/>/g, '')
      .replace('</head>', `${metadata}</head>`);
    const output = path.resolve('dist', 'clients/stories', client.id, 'index.html');
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
  }

  // sitemap: the static list plus every published case study, nothing in draft
  const sitemapPath = path.resolve('dist/sitemap.xml');
  let sitemap = await readFile(sitemapPath, 'utf8');
  const entries = published.map((client) => `  <url><loc>${origin}/clients/stories/${client.id}</loc></url>`).join('\n');
  if (entries) {
    sitemap = sitemap.replace('</urlset>', `${entries}\n</urlset>`);
    await writeFile(sitemapPath, sitemap, 'utf8');
  }
  console.log(`Published case studies: ${published.length} prerendered and added to the sitemap.`);
} finally {
  await vite.close();
}
