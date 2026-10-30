import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { App, contentPages, showcasePages, openRoles } = await vite.ssrLoadModule('/src/main.jsx');
  // The production domain. Canonicals, sitemap, social cards and structured data all use it.
  const origin = 'https://srisun.ai';
  const buildDate = new Date().toISOString().slice(0, 10);
  const decode = (value) => String(value).replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '').replace(/&#x27;|&#39;/g, '\'').replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  // FAQ structured data mirrors the questions a visitor actually sees on the page.
  const visibleFaq = (html) => [...html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<svg[\s\S]*?<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/details>/g)]
    .map(([, q, a]) => ({ question: decode(q), answer: decode(a) })).filter((item) => item.question && item.answer);
  const organization = {
    '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Srisun', legalName: 'Srisun Corporation', url: `${origin}/`, logo: `${origin}/assets/srisun-logo.png`,
    email: 'hello@srisun.ai', telephone: '+91 88833 88162', description: 'Srisun builds websites, software, AI tools and security for schools, colleges and growing businesses across India.',
    address: { '@type': 'PostalAddress', streetAddress: '#16, 1st floor, GR Tower, Tindivanam Road, Kilnachipet', addressLocality: 'Tiruvannamalai', addressRegion: 'Tamil Nadu', postalCode: '606611', addressCountry: 'IN' },
    contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: 'hello@srisun.ai', telephone: '+91 88833 88162', areaServed: 'IN', availableLanguage: 'en' },
    areaServed: { '@type': 'Country', name: 'India' }
  };
  const website = { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'Srisun', inLanguage: 'en', publisher: { '@id': `${origin}/#organization` } };
  const groupHub = { Services: '/services', Solutions: '/solutions', Industries: '/industries', Partners: '/partners', Products: '/products', Clients: '/clients' };
  const breadcrumbs = (trail) => ({ '@type': 'BreadcrumbList', itemListElement: trail.map(([name, href], index) => ({ '@type': 'ListItem', position: index + 1, name, item: `${origin}${href}` })) });
  const sitemapPaths = [];
  const llmsSections = new Map();
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
      : isContact ? 'Contact Srisun | Let’s build something better' : isHome ? 'Srisun | Technology Solutions for Businesses' : page?.erp ? 'ERP Consulting & Implementation in India | Srisun' : page?.showcase ? showcasePages[page.showcase].seoTitle : `${page?.title || 'Srisun'} | Srisun`;
    const summary = selectedRole?.summary || '';
    const description = isCareer
      ? (summary.length >= 70 ? summary : selectedRole ? `Apply for the ${selectedRole.title} role at Srisun. Read the responsibilities and requirements for this position, then send your application online.` : 'See the roles Srisun is hiring for across India, from engineering and security to marketing and HR, and apply online.')
      : isContact ? 'Contact Srisun about websites, software, automation, cybersecurity or digital marketing. Call 88833 88162 or email hello@srisun.ai.'
      : isHome ? 'Srisun builds websites, apps, AI tools and security for schools, colleges and growing businesses across India, from planning to support after launch.'
      : page?.description || 'Srisun builds technology for better lives and businesses.';
    const canonical = `${origin}${pathname === '/' ? '/' : pathname}`;
    // policy pages are indexed once their text has been published from the admin;
    // site search results and application forms are never indexed
    const noindex = (page?.group === 'Policies' && !publishedPages.has(pathname)) || pathname.endsWith('/apply') || pathname === '/search';
    const content = renderToString(React.createElement(App));
    const faq = visibleFaq(content);
    const trail = [['Home', '/']];
    if (page && groupHub[page.group] && groupHub[page.group] !== pathname) trail.push([page.group, groupHub[page.group]]);
    if (isCareer && pathname !== '/careers') trail.push(['Careers', '/careers']);
    if (selectedRole) trail.push(['Open roles', '/careers/jobs']);
    if (!isHome) trail.push([selectedRole ? selectedRole.title : isContact ? 'Contact us' : isCareer ? (pathname === '/careers' ? 'Careers' : 'Open roles') : page?.title || 'Srisun', pathname]);
    const isService = page && (page.group === 'Services' || page.group === 'Solutions') && groupHub[page.group] !== pathname;
    const graph = [
      organization,
      website,
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, inLanguage: 'en', isPartOf: { '@id': `${origin}/#website` }, about: { '@id': `${origin}/#organization` }, ...(isHome ? {} : { breadcrumb: { '@id': `${canonical}#breadcrumb` } }) },
      ...(isHome ? [] : [{ ...breadcrumbs(trail), '@id': `${canonical}#breadcrumb` }]),
      ...(isService ? [{ '@type': 'Service', '@id': `${canonical}#service`, name: page.title, serviceType: page.title, description, url: canonical, provider: { '@id': `${origin}/#organization` }, areaServed: { '@type': 'Country', name: 'India' } }] : []),
      ...(faq.length && !noindex ? [{ '@type': 'FAQPage', '@id': `${canonical}#faq`, mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) }] : [])
    ];
    const metadata = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}" /><meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}" /><link rel="canonical" href="${canonical}" /><meta property="og:site_name" content="Srisun" /><meta property="og:type" content="website" /><meta property="og:locale" content="en_IN" /><meta property="og:title" content="${escapeHtml(title)}" /><meta property="og:description" content="${escapeHtml(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:image" content="${origin}/assets/srisun-logo.png" /><meta property="og:image:alt" content="Srisun logo" /><meta name="twitter:card" content="summary" /><meta name="twitter:title" content="${escapeHtml(title)}" /><meta name="twitter:description" content="${escapeHtml(description)}" /><script id="srisun-schema" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`;
    if (!noindex) {
      sitemapPaths.push(pathname);
      const section = isHome ? null : isCareer ? 'Careers' : isContact ? 'Company' : page?.group;
      if (section && section !== 'Policies' && !pathname.startsWith('/careers/jobs/')) {
        if (!llmsSections.has(section)) llmsSections.set(section, []);
        llmsSections.get(section).push(`- [${page?.title || (isContact ? 'Contact us' : 'Careers')}](${canonical}): ${description}`);
      }
    }
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
      { '@type': 'Article', '@id': `${url}#article`, headline: title, description, url, inLanguage: 'en', isPartOf: { '@id': `${origin}/#website` }, publisher: { '@id': `${origin}/#organization` }, author: { '@id': `${origin}/#organization` }, about: { '@type': 'Organization', name: client.name, ...(client.website ? { url: client.website } : {}) }, ...(cs.publishedAt ? { datePublished: cs.publishedAt.replace(' ', 'T') } : {}), ...(cs.heroImage ? { image: origin + cs.heroImage } : {}) },
      breadcrumbs([['Home', '/'], ['Clients', '/clients'], ['Customer stories', '/clients/stories'], [client.name, `/clients/stories/${client.id}`]]),
      organization,
      website
    ];
    const json = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');
    const metadata = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}" /><meta name="robots" content="index,follow,max-image-preview:large" />${cs.keywords ? `<meta name="keywords" content="${escapeHtml(cs.keywords)}" />` : ''}<link rel="canonical" href="${url}" /><meta property="og:site_name" content="Srisun" /><meta property="og:type" content="article" /><meta property="og:locale" content="en_IN" /><meta property="og:title" content="${escapeHtml(cs.ogTitle || title)}" /><meta property="og:description" content="${escapeHtml(cs.ogDescription || description)}" /><meta property="og:url" content="${url}" /><meta property="og:image" content="${cs.heroImage ? origin + cs.heroImage : origin + '/assets/srisun-logo.png'}" /><meta name="twitter:card" content="${cs.heroImage ? 'summary_large_image' : 'summary'}" /><script id="srisun-schema" type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script><script id="srisun-client" type="application/json">${json(client)}</script>`;
    // Render the story itself so search engines and AI crawlers get the full text without running JavaScript.
    globalThis.window = { location: { pathname: `/clients/stories/${client.id}`, search: '', origin } };
    globalThis.__SRISUN_CLIENT__ = client;
    const content = renderToString(React.createElement(App));
    delete globalThis.__SRISUN_CLIENT__;
    const html = template
      .replace(/<title>.*?<\/title>/s, '')
      .replace(/<meta name="description"[^>]*\/>/s, '')
      .replace(/<meta property="og:[^"]+"[^>]*\/>/g, '')
      .replace(/<link rel="canonical"[^>]*\/>/g, '')
      .replace('</head>', `${metadata}</head>`)
      .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
    const output = path.resolve('dist', 'clients/stories', client.id, 'index.html');
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
    sitemapPaths.push(`/clients/stories/${client.id}`);
  }
  console.log(`Published case studies: ${published.length} prerendered.`);

  // Sitemap: every indexable page that was just built, nothing noindexed or in draft.
  const urls = sitemapPaths.map((p) => `  <url><loc>${origin}${p}</loc><lastmod>${buildDate}</lastmod></url>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(path.resolve('dist/sitemap.xml'), sitemap, 'utf8');

  // llms.txt: a plain-text map of the site for AI search tools, built from the same page data.
  const order = ['Services', 'Solutions', 'Industries', 'Products', 'Clients', 'Partners', 'Resources', 'Company', 'Careers'];
  const sections = order.filter((name) => llmsSections.has(name)).map((name) => `## ${name}\n\n${llmsSections.get(name).join('\n')}`);
  const llms = `# Srisun

> Srisun builds websites, software, AI tools and security for schools, colleges and growing businesses across India. The team works from Tiruvannamalai, Tamil Nadu, and supports clients across India and abroad.

- Company: Srisun Corporation, #16, 1st floor, GR Tower, Tindivanam Road, Kilnachipet, Tiruvannamalai, Tamil Nadu, India - 606611
- Phone: +91 88833 88162
- Email: hello@srisun.ai
- Website: ${origin}/

${sections.join('\n\n')}
`;
  await writeFile(path.resolve('dist/llms.txt'), llms, 'utf8');
  console.log(`Sitemap: ${sitemapPaths.length} indexable URLs. llms.txt written.`);
} finally {
  await vite.close();
}
