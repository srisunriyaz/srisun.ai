// Templates for every redesigned sub-page. Content lives in subpageContent.js;
// each template has its own hero visual and motion, and every page gets its
// own two-colour theme through the --sp-a / --sp-b custom properties.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, ChevronRight, ChevronDown, Check, Search, Filter, Download, Mail, Bot, Quote, Gavel, ExternalLink, Copy, MapPin, Users, X, Info, AlertCircle } from 'lucide-react';
import { subpages, policyList, aboutValues, aboutCapabilities, storyChapters, brandColours, brandRules } from './subpageContent.js';
import { trustedBrands } from './siteData.js';
import { useClientList, useClient, useRelated, useTaxonomies, caseStudyPath, isPublished } from './clientsApi.js';
import { fetchPage } from './apiClient.js';
import pagesSnapshot from './generated/pages.json';
import './subpages.css';

export const getSubpage = (path) => subpages[path] || null;

const slug = (value) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const groupHome = { Services: '/services', Solutions: '/solutions', Industries: '/industries', Partners: '/partners', Products: '/products', Clients: '/clients' };

function Crumbs({ meta, light }) {
  const isLanding = groupHome[meta.title] === meta.path || meta.path === '/products' || meta.path === '/clients';
  return (
    <nav className={`sp-crumbs${light ? ' light' : ''}`} aria-label="Breadcrumb">
      <a href="/">Home</a><ChevronRight size={14} />
      {!isLanding && (groupHome[meta.group] ? <><a href={groupHome[meta.group]}>{meta.group}</a><ChevronRight size={14} /></> : <><span>{meta.group}</span><ChevronRight size={14} /></>)}
      <span aria-current="page">{meta.title}</span>
    </nav>
  );
}

const Reveal = ({ as: Tag = 'div', i = 0, className = '', style, children, ...rest }) => (
  <Tag data-reveal="" className={className} style={{ '--i': i, ...style }} {...rest}>{children}</Tag>
);

function Heading({ kicker, title, text, center }) {
  return (
    <Reveal className={`sp-heading${center ? ' center' : ''}`}>
      {kicker && <span className="sp-kicker">{kicker}</span>}
      <h2>{title}</h2>
      <span className="sp-rule" aria-hidden="true" />
      {text && <p>{text}</p>}
    </Reveal>
  );
}

function Faq({ items, title }) {
  if (!items?.length) return null;
  return (
    <section className="sp-section">
      <div className="content-page-inner sp-narrow">
        <Heading kicker="FAQ" title={title} center />
        <div className="sp-faq">
          {items.map(([question, answer], index) => (
            <Reveal as="details" i={index} key={question}><summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand({ title, text, button = 'Talk to Our Team', href = '/contact-us' }) {
  return (
    <section className="sp-cta-wrap">
      <div className="content-page-inner">
        <Reveal className="sp-cta">
          <span className="sp-cta-glow" aria-hidden="true" />
          <div><h2>{title}</h2><p>{text}</p></div>
          <a className="sp-btn light" href={href}>{button} <ArrowRight size={17} /></a>
        </Reveal>
      </div>
    </section>
  );
}

function LogoGrid({ title }) {
  return (
    <section className="sp-section">
      <div className="content-page-inner">
        <Heading kicker="OUR CLIENTS" title={title} center />
        <div className="sp-logo-grid">
          {trustedBrands.map(([name, logo], index) => <Reveal className="sp-logo" i={index % 4} key={name}><img src={logo} alt={name} loading="lazy" /></Reveal>)}
        </div>
      </div>
    </section>
  );
}

/* ───────────── SERVICE ───────────── */
function ServicePage({ page, meta }) {
  const { icon: Icon, mock } = page;
  return (
    <>
      <section className="sp-hero sp-hero-light">
        <div className="sp-grid-bg" aria-hidden="true" />
        <div className="content-page-inner sp-split">
          <div className="sp-hero-copy">
            <Crumbs meta={meta} />
            <span className="sp-eyebrow"><Icon size={16} /> {page.label.toUpperCase()} SERVICE</span>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <div className="sp-actions"><a className="sp-btn" href="/contact-us">Talk to Our Team <ArrowRight size={17} /></a><a className="sp-btn-ghost" href="#sp-features">See What’s Included <ChevronRight size={16} /></a></div>
          </div>
          <div className="sp-mock" aria-hidden="true">
            <div className="sp-mock-bar"><i /><i /><i /><span>{mock.title}</span></div>
            <ul>{mock.rows.map(([RowIcon, label, status], index) => <li key={label} style={{ '--i': index }}><span className="sp-mock-icon"><RowIcon size={16} /></span><b>{label}</b><em>{status}</em></li>)}</ul>
            <div className="sp-meter"><span>{mock.meter[0]}</span><b>{mock.meter[1]}%</b><div><i style={{ '--w': `${mock.meter[1]}%` }} /></div></div>
            <div className="sp-mock-badge"><Icon size={16} /> Srisun {page.label}</div>
          </div>
        </div>
      </section>

      <section className="sp-section" id="sp-features">
        <div className="content-page-inner">
          <Heading kicker="WHAT’S INCLUDED" title={page.featuresTitle} />
          <div className="sp-feature-grid">
            {page.features.map(([FeatureIcon, title, text], index) => (
              <Reveal as="article" className="sp-feature" i={index % 3} key={title}>
                <span className="sp-feature-icon"><FeatureIcon size={22} /></span>
                <h3>{title}</h3><p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section sp-tint">
        <div className="content-page-inner">
          <Heading kicker="HOW IT WORKS" title="How we work with you, step by step" center />
          <Reveal as="ol" className="sp-steps">
            {page.steps.map(([title, text], index) => <li key={title} style={{ '--i': index }}><span>{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}
          </Reveal>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner sp-fit">
          <Reveal><span className="sp-kicker">POPULAR WITH</span><h2>Organisations that use {page.label.toLowerCase()} services</h2><p>See how this service fits into the bigger plans for your sector.</p></Reveal>
          <div className="sp-fit-list">
            {page.fit.map((industry, index) => <Reveal as="a" i={index} href={`/industries/${slug(industry)}`} key={industry}>{industry}<ArrowRight size={16} /></Reveal>)}
          </div>
        </div>
      </section>

      <Faq items={page.faq} title={`Questions about ${page.label.toLowerCase()}`} />
      <CtaBand title={page.cta[0]} text={page.cta[1]} />
    </>
  );
}

/* ───────────── INDUSTRY ───────────── */
function IndustryPage({ page, meta }) {
  const { icon: Icon } = page;
  return (
    <>
      <section className="sp-hero sp-hero-dark">
        <div className="sp-orbits" aria-hidden="true"><span /><span /><span /><div className="sp-orbit-core"><Icon size={58} strokeWidth={1.4} /></div></div>
        <div className="content-page-inner sp-hero-narrow">
          <Crumbs meta={meta} light />
          <span className="sp-eyebrow light"><Icon size={16} /> {page.label.toUpperCase()}</span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          <div className="sp-actions"><a className="sp-btn" href="/contact-us">Talk to Our Team <ArrowRight size={17} /></a><a className="sp-btn-ghost light" href="#sp-help">See How We Help <ChevronRight size={16} /></a></div>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner">
          <Heading kicker="WHAT WE HEAR" title={`Common challenges in ${page.label.toLowerCase()}`} />
          <div className="sp-challenge-grid">
            {page.challenges.map(([title, text], index) => <Reveal as="article" className="sp-challenge" i={index} key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="sp-section sp-tint" id="sp-help">
        <div className="content-page-inner">
          <Heading kicker="HOW SRISUN HELPS" title="Where we can help" center />
          <div className="sp-solution-grid">
            {page.solutions.map(([SolutionIcon, title, text, href], index) => (
              <Reveal as="a" className="sp-solution" href={href} i={index} key={title}>
                <span className="sp-feature-icon"><SolutionIcon size={22} /></span>
                <h3>{title}</h3><p>{text}</p>
                <em>Learn more <ArrowRight size={15} /></em>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner sp-starters">
          <Reveal className="sp-starters-copy"><span className="sp-kicker">WHERE TO START</span><h2>Where to start</h2><p>Small projects that show results quickly and prepare the ground for the next step.</p></Reveal>
          <ul>{page.starters.map((item, index) => <Reveal as="li" i={index} key={item}><span><Check size={16} /></span>{item}</Reveal>)}</ul>
        </div>
      </section>

      {page.showClients && <LogoGrid title={page.clientsTitle} />}
      <Faq items={page.faq} title={`Questions from ${page.label.toLowerCase()} teams`} />
      <CtaBand title="Let’s talk about what your organisation needs." text="Tell us the biggest challenge you face, and we will suggest a practical first step." />
    </>
  );
}

/* ───────────── PRODUCT ───────────── */
function ProductPage({ page, meta }) {
  const others = subpages['/products'].items.filter(([, , , href]) => href !== meta.path);
  return (
    <>
      <section className="sp-hero sp-hero-product">
        <div className="content-page-inner sp-product-hero">
          <Crumbs meta={meta} light />
          <div className="sp-product-stage" aria-hidden="true"><span className="sp-ring" /><span className="sp-ring two" /><div className="sp-product-mark"><small>SRISUN</small><strong>{page.mark}</strong></div></div>
          <span className="sp-status"><i /> Contact us for availability</span>
          <h1>{meta.title}</h1>
          <p className="sp-lead">{page.tagline}</p>
          <p>{page.intro}</p>
          <div className="sp-actions center"><a className="sp-btn" href="/contact-us">Request a Walkthrough <ArrowRight size={17} /></a><a className="sp-btn-ghost light" href="/products">All Products <ChevronRight size={16} /></a></div>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner">
          <Heading kicker="BEFORE YOUR WALKTHROUGH" title="What to have ready" text="Having these details ready helps us focus the walkthrough on what matters to you." center />
          <div className="sp-prepare-grid">
            {page.prepare.map(([PrepIcon, title, text], index) => <Reveal as="article" className="sp-prepare" i={index} key={title}><span className="sp-feature-icon"><PrepIcon size={22} /></span><h3>{title}</h3><p>{text}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="sp-section sp-tint">
        <div className="content-page-inner">
          <Heading kicker="HOW IT WORKS" title={`Getting started with ${meta.title}`} center />
          <Reveal as="ol" className="sp-steps three">
            {[['Share your needs', 'Tell us about your organisation and the problem you want to solve.'], ['See a walkthrough', 'We show you the product using examples close to your own work.'], ['Plan next steps', 'Together we agree availability, timing and the next steps.']].map(([title, text], index) => <li key={title} style={{ '--i': index }}><span>{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}
          </Reveal>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner">
          <Heading kicker="THE SRISUN PLATFORM" title="Other Srisun products" />
          <div className="sp-mini-grid">
            {others.map(([OtherIcon, title, text, href], index) => <Reveal as="a" className="sp-mini" href={href} i={index} key={title}><span className="sp-feature-icon"><OtherIcon size={20} /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={16} /></Reveal>)}
          </div>
        </div>
      </section>

      <Faq title={`Questions about ${meta.title}`} items={[[`Is ${meta.title} available now?`, 'Please contact our team for current availability and pricing.'], ['Can we see a demo?', 'Yes. Ask for a walkthrough, and we will arrange a time.'], ['Can it work with our existing tools?', 'Tell us which tools you use, and we will confirm what is possible.']]} />
      <CtaBand title={`Want to see ${meta.title}?`} text="Tell us what you need, and we will arrange a walkthrough." button="Request a Walkthrough" />
    </>
  );
}

/* ───────────── PARTNER ───────────── */
function PartnerPage({ page, meta }) {
  const { icon: Icon } = page;
  return (
    <>
      <section className="sp-hero sp-hero-light sp-hero-partner">
        <div className="content-page-inner sp-split">
          <div className="sp-hero-copy">
            <Crumbs meta={meta} />
            <span className="sp-eyebrow"><Icon size={16} /> {page.label.toUpperCase()}</span>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <div className="sp-actions"><a className="sp-btn" href="/contact-us">Apply to Partner <ArrowRight size={17} /></a><a className="sp-btn-ghost" href="#sp-how">How It Works <ChevronRight size={16} /></a></div>
          </div>
          <div className="sp-connect" aria-hidden="true">
            <svg viewBox="0 0 400 260"><path className="sp-connect-path" d="M70 130 C 150 30, 250 230, 330 130" /><circle className="sp-connect-dot" r="6"><animateMotion dur="3.2s" repeatCount="indefinite" path="M70 130 C 150 30, 250 230, 330 130" /></circle></svg>
            <div className="sp-node you"><Users size={26} /><b>Your organisation</b></div>
            <div className="sp-node srisun"><img src="/assets/srisun-favicon.png" alt="" /><b>Srisun</b></div>
          </div>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner">
          <Heading kicker="WHO IT IS FOR" title="Is this partnership right for you?" />
          <div className="sp-prepare-grid">
            {page.who.map(([WhoIcon, title, text], index) => <Reveal as="article" className="sp-prepare" i={index} key={title}><span className="sp-feature-icon"><WhoIcon size={22} /></span><h3>{title}</h3><p>{text}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="sp-section sp-tint" id="sp-how">
        <div className="content-page-inner sp-timeline-wrap">
          <Heading kicker="HOW IT WORKS" title="How a partnership gets started" />
          <ol className="sp-timeline">
            {[['Share your details', 'Send us the details listed below using the contact page.'], ['Introductory call', 'We set up a call to learn about your organisation, customers and goals.'], ['Agree the scope', 'We agree how we will work together and who is responsible for what.'], ['Start working together', 'We start with a first project or customer.']].map(([title, text], index) => <Reveal as="li" i={index} key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}
          </ol>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner sp-share">
          <Reveal className="sp-share-list"><span className="sp-kicker">WHAT TO SHARE</span><h2>Helpful details for your application</h2><ul>{page.share.map((item) => <li key={item}><span><Check size={15} /></span>{item}</li>)}</ul></Reveal>
          <Reveal className="sp-share-card" i={1}><Icon size={30} /><h3>Ready to apply?</h3><p>Send your details and mention the {page.label}.</p><a className="sp-btn" href="/contact-us">Apply to Partner <ArrowRight size={17} /></a></Reveal>
        </div>
      </section>

      <Faq title="Questions about partnering" items={[['How do we apply?', `Use the contact page and mention the ${page.label}. The team will reply to arrange a call.`], ['What happens after we apply?', 'We review your details and arrange an introductory call to see whether it is a good fit.'], ['Where can we see other partner options?', 'Every programme is listed on the Partners page.']]} />
      <CtaBand title="Let’s build something together." text="Tell us what your organisation brings, and we will suggest how we could work together." button="Apply to Partner" />
    </>
  );
}

/* ───────────── RESOURCE ───────────── */
function ResourceVisual({ page }) {
  if (page.variant === 'chat') {
    return (
      <div className="sp-visual sp-chat" aria-hidden="true">
        <div className="sp-chat-head"><span><Bot size={18} /></span><b>Shri</b><i>online</i></div>
        <p className="bot" style={{ '--i': 0 }}>{page.chat[0]}</p>
        <p className="user" style={{ '--i': 1 }}>{page.chat[1]}</p>
        <p className="bot" style={{ '--i': 2 }}>{page.chat[2]}</p>
        <div className="sp-typing"><i /><i /><i /></div>
      </div>
    );
  }
  if (page.variant === 'mail') {
    return (
      <div className="sp-visual sp-mail" aria-hidden="true">
        <div className="sp-mail-top"><Mail size={18} /><b>Srisun Newsletter</b><small>Inbox</small></div>
        <h4>This edition</h4>
        {page.topics.map((topic, index) => <div className="sp-mail-row" style={{ '--i': index }} key={topic}><i />{topic}</div>)}
      </div>
    );
  }
  if (page.variant === 'search') {
    return (
      <div className="sp-visual sp-searchbox" aria-hidden="true">
        <div className="sp-search-input"><Search size={18} /><span className="sp-typed">How do I renew my domain?</span></div>
        {page.topics.slice(0, 4).map((topic, index) => <div className="sp-search-hit" style={{ '--i': index }} key={topic}><ChevronRight size={14} />{topic}</div>)}
      </div>
    );
  }
  if (page.variant === 'quote') {
    return <div className="sp-visual sp-quote" aria-hidden="true"><Quote size={40} /><p>{page.quote}</p><span>The Long Game</span></div>;
  }
  if (page.variant === 'route') {
    return <div className="sp-visual sp-compass" aria-hidden="true"><span className="sp-compass-ring" /><span className="sp-compass-needle" /><b>N</b></div>;
  }
  // timeline + grid: shimmering placeholder cards
  return (
    <div className={`sp-visual sp-skeleton ${page.variant}`} aria-hidden="true">
      {page.topics.slice(0, 3).map((topic, index) => <div className="sp-skel-card" style={{ '--i': index }} key={topic}><small>{topic}</small><i /><i /><i className="short" /></div>)}
    </div>
  );
}

function ResourcePage({ page, meta }) {
  const { icon: Icon } = page;
  return (
    <>
      <section className="sp-hero sp-hero-light sp-hero-resource">
        <div className="content-page-inner sp-split">
          <div className="sp-hero-copy">
            <Crumbs meta={meta} />
            <span className="sp-eyebrow"><Icon size={16} /> {page.label.toUpperCase()}</span>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <div className="sp-actions"><a className="sp-btn" href={page.panelCta[1]}>{page.panelCta[0]} <ArrowRight size={17} /></a></div>
          </div>
          <ResourceVisual page={page} />
        </div>
      </section>

      {page.routes ? (
        <section className="sp-section">
          <div className="content-page-inner sp-narrow">
            <Heading kicker="PICK A STARTING POINT" title="What do you need help with?" center />
            <div className="sp-routes">{page.routes.map(([label, href], index) => <Reveal as="a" href={href} i={index} key={label}><span>{label}</span><ArrowRight size={18} /></Reveal>)}</div>
          </div>
        </section>
      ) : (
        <section className="sp-section">
          <div className="content-page-inner">
            <Heading kicker="TOPICS" title="What you will find here" center />
            <div className="sp-topic-grid">{page.topics.map((topic, index) => <Reveal className="sp-topic" i={index % 4} key={topic}><span>{String(index + 1).padStart(2, '0')}</span>{topic}</Reveal>)}</div>
          </div>
        </section>
      )}

      <CtaBand title={page.panelTitle} text={page.panelText} button={page.panelCta[0]} href={page.panelCta[1]} />
    </>
  );
}

/* ───────────── COMPANY ───────────── */
function AboutPage({ meta }) {
  return (
    <>
      <section className="sp-hero sp-hero-statement">
        <div className="content-page-inner">
          <Crumbs meta={meta} />
          <span className="sp-eyebrow">ABOUT SRISUN</span>
          <h1>Building technology for <span className="sp-grad-text">better lives &amp; businesses</span></h1>
          <p>Srisun offers consulting, software, automation, cybersecurity and digital marketing to organisations across India, all from one team.</p>
        </div>
      </section>
      <section className="sp-section">
        <div className="content-page-inner">
          <Heading kicker="WHAT WE DO" title="Six areas we work in" center />
          <div className="sp-cap-grid">{aboutCapabilities.map(([CapIcon, title, href], index) => <Reveal as="a" className="sp-cap" href={href} i={index % 3} key={title}><CapIcon size={28} strokeWidth={1.6} /><b>{title}</b><ArrowRight size={16} /></Reveal>)}</div>
        </div>
      </section>
      <section className="sp-section sp-tint">
        <div className="content-page-inner">
          <Heading kicker="WHAT WE STAND FOR" title="Our values" />
          <div className="sp-feature-grid four">{aboutValues.map(([ValueIcon, title, text], index) => <Reveal as="article" className="sp-feature" i={index} key={title}><span className="sp-feature-icon"><ValueIcon size={22} /></span><h3>{title}</h3><p>{text}</p></Reveal>)}</div>
        </div>
      </section>
      <section className="sp-section">
        <div className="content-page-inner sp-where">
          <Reveal className="sp-where-card"><MapPin size={28} /><div><span className="sp-kicker">WHERE WE ARE</span><h2>Based in Tamil Nadu, working across India</h2><p>We work with organisations on-site or remotely, wherever they are based.</p></div><a className="sp-btn" href="/contact-us">Contact Us <ArrowRight size={17} /></a></Reveal>
        </div>
      </section>
      <LogoGrid title="Organisations that work with Srisun" />
      <CtaBand title="Let’s work together." text="Tell us what you are planning, and we will suggest a practical first step." />
    </>
  );
}

function StoryPage({ meta }) {
  return (
    <>
      <section className="sp-hero sp-hero-dark sp-hero-story">
        <div className="content-page-inner sp-hero-narrow">
          <Crumbs meta={meta} light />
          <span className="sp-eyebrow light">OUR STORY</span>
          <h1>Started small, <span className="sp-grad-text">still growing</span></h1>
          <p>Srisun began as a small team in Tiruvannamalai, and this is still where we work from. Today we build websites, software and digital services for schools, colleges and businesses across India and abroad.</p>
        </div>
      </section>
      <section className="sp-section">
        <div className="content-page-inner sp-narrow">
          <ol className="sp-chapters">
            {storyChapters.map(([ChapterIcon, title, text], index) => <Reveal as="li" i={0} className={index % 2 ? 'right' : 'left'} key={title}><span className="sp-chapter-dot"><ChapterIcon size={20} /></span><div><small>CHAPTER {index + 1}</small><h3>{title}</h3><p>{text}</p></div></Reveal>)}
          </ol>
        </div>
      </section>
      <section className="sp-section sp-tint">
        <div className="content-page-inner sp-narrow">
          <Reveal className="sp-pullquote"><Quote size={36} /><p>Technology should make everyday work simpler and open up new possibilities for the people who use it.</p></Reveal>
        </div>
      </section>
      <CtaBand title="Join us for what comes next." text="Work with us as a client, or join the team." button="Work With Us" />
    </>
  );
}

function BrandPage({ meta }) {
  const [copied, setCopied] = useState('');
  const copy = (hex) => {
    try { navigator.clipboard?.writeText(hex); } catch { /* clipboard may be unavailable */ }
    setCopied(hex);
    setTimeout(() => setCopied(''), 1600);
  };
  return (
    <>
      <section className="sp-hero sp-hero-light">
        <div className="content-page-inner sp-split">
          <div className="sp-hero-copy">
            <Crumbs meta={meta} />
            <span className="sp-eyebrow">BRAND GUIDELINES</span>
            <h1>Using the Srisun brand</h1>
            <p>To use the Srisun name, logo or brand assets, please request the current guidelines from our team first.</p>
            <div className="sp-actions"><a className="sp-btn" href="/contact-us">Request Brand Guidelines <ArrowRight size={17} /></a></div>
          </div>
          <div className="sp-brand-logos" aria-label="Srisun logo on light and dark backgrounds">
            <div className="light"><img src="/assets/srisun-logo.png" alt="Srisun logo on a light background" /></div>
            <div className="dark"><img src="/assets/srisun-logo.png" alt="Srisun logo on a dark background" /></div>
          </div>
        </div>
      </section>
      <section className="sp-section">
        <div className="content-page-inner">
          <Heading kicker="COLOURS" title="Brand colours" text="Click a colour to copy its hex code." />
          <div className="sp-swatches">{brandColours.map(([name, hex], index) => <Reveal as="button" type="button" className="sp-swatch" i={index % 3} key={hex} onClick={() => copy(hex)}><span style={{ background: hex }}>{copied === hex ? <Check size={20} /> : <Copy size={18} />}</span><b>{name}</b><code>{hex}</code></Reveal>)}</div>
          <p className="sp-copy-status" role="status">{copied ? `Copied ${copied}` : ''}</p>
        </div>
      </section>
      <section className="sp-section sp-tint">
        <div className="content-page-inner">
          <Heading kicker="USAGE" title="Do’s and don’ts" />
          <div className="sp-rules">{brandRules.map(([RuleIcon, ok, text], index) => <Reveal className={`sp-rule-item ${ok ? 'ok' : 'no'}`} i={index % 3} key={text}><span><RuleIcon size={16} /></span>{text}</Reveal>)}</div>
        </div>
      </section>
      <CtaBand title="Planning to use the Srisun brand?" text="Please ask for approval and the latest assets before any public or partner campaign." button="Request Brand Guidelines" />
    </>
  );
}

/* ───────────── POLICY ───────────── */
// Policy text is edited in the admin (Pages). The build-time snapshot renders
// first, then the live published version replaces it, so edits appear
// without a redeploy. Unpublished pages show the contact panel only.
export const publishedPage = (path) => pagesSnapshot.find((page) => page.path === path) || null;

function usePublishedPage(path) {
  const [page, setPage] = useState(() => publishedPage(path));
  useEffect(() => {
    const controller = new AbortController();
    fetchPage(path.split('/').pop(), controller.signal)
      .then(setPage)
      .catch((error) => { if (error.name !== 'AbortError' && error.status === 404) setPage(null); });
    return () => controller.abort();
  }, [path]);
  return page;
}

/** Plain text from the admin: "## " starts a heading, "- " a bullet, a blank line a new paragraph. */
export function PolicyText({ text }) {
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => { if (para.length) blocks.push(<p key={blocks.length}>{para.join(' ')}</p>); para = []; };
  const flushList = () => { if (list.length) blocks.push(<ul key={blocks.length}>{list.map((item, i) => <li key={i}>{item}</li>)}</ul>); list = []; };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); }
    else if (line.startsWith('## ')) { flushPara(); flushList(); blocks.push(<h2 key={blocks.length}>{line.slice(3)}</h2>); }
    else if (/^[-•*] /.test(line)) { flushPara(); list.push(line.slice(2)); }
    else { flushList(); para.push(line); }
  }
  flushPara();
  flushList();
  return <div className="sp-policy-text">{blocks}</div>;
}

function PolicyPage({ meta }) {
  const current = policyList.find((policy) => policy.href === meta.path);
  const Icon = current?.icon || Gavel;
  const page = usePublishedPage(meta.path);
  const title = page?.title || meta.title;
  useEffect(() => { if (page?.title) document.title = `${page.title} | Srisun`; }, [page?.title]);
  return (
    <section className="sp-policy">
      <div className="content-page-inner sp-policy-grid">
        <aside className="sp-policy-nav" aria-label="Policies">
          <span className="sp-kicker">POLICIES</span>
          {policyList.map(({ title: navTitle, icon: NavIcon, href }) => <a key={href} href={href} className={href === meta.path ? 'active' : ''} aria-current={href === meta.path ? 'page' : undefined}><NavIcon size={16} />{navTitle}</a>)}
        </aside>
        <div className="sp-policy-main">
          <Crumbs meta={meta} />
          <div className="sp-policy-title"><span><Icon size={26} /></span><h1>{title}</h1></div>
          {page ? (
            <article className="sp-policy-article">
              {page.summary ? <p className="sp-policy-summary">{page.summary}</p> : null}
              <p className="sp-policy-updated">Last updated {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <PolicyText text={page.body} />
            </article>
          ) : (
            <div className="sp-policy-note"><p>This policy is being updated and will be published here shortly. For questions or requests in the meantime, please contact our team.</p></div>
          )}
          <div className="sp-policy-contact">
            <div><h2>Questions or requests?</h2><p>If you have a question about this policy, contact us and our team will reply.</p><a href="mailto:hello@srisun.ai">hello@srisun.ai</a></div>
            <a className="sp-btn" href="/contact-us">Contact Us <ArrowRight size={17} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── DIRECTORY ───────────── */
function DirectoryPage({ page, meta }) {
  return (
    <>
      <section className="sp-hero sp-hero-directory">
        <div className="sp-float-icons" aria-hidden="true">{page.items.slice(0, 6).map(([FloatIcon], index) => <span key={index} style={{ '--i': index }}><FloatIcon size={22} /></span>)}</div>
        <div className="content-page-inner sp-hero-narrow">
          <Crumbs meta={meta} light />
          <span className="sp-eyebrow light">{page.eyebrow} · {page.items.length}</span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
      </section>
      <section className="sp-section">
        <div className="content-page-inner">
          <div className="sp-directory">
            {page.items.map(([ItemIcon, title, text, href], index) => {
              const external = href.startsWith('http');
              return (
                <Reveal as="a" className="sp-dir-card" href={href} i={index % 4} key={title} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <span className="sp-feature-icon"><ItemIcon size={24} /></span>
                  <h2>{title}</h2><p>{text}</p>
                  <em>{external ? <>Visit site <ExternalLink size={15} /></> : <>Explore <ArrowRight size={15} /></>}</em>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      {page.showClients && <LogoGrid title="Schools, colleges and companies we work with" />}
      <CtaBand title="Not sure where to start?" text="Tell us what you need, and we will point you in the right direction." button="Talk to Concierge" href="/resources/concierge" />
    </>
  );
}

const initials = (name) => name.replace(/[^A-Za-z ]/g, ' ').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// ─── Clients & case studies ──────────────────────────────────────────────────
// Data comes from the PHP REST API. Public endpoints return published case
// studies only; drafts are filtered out server-side.

function ClientLogo({ client, className }) {
  if (client.logo) return <img className={className} src={client.logo} alt={`${client.name} logo`} loading="lazy" />;
  return <span className={`${className} cp-monogram`} aria-hidden="true">{initials(client.name)}</span>;
}

function CheckboxGroup({ legend, options, selected, onToggle }) {
  return (
    <fieldset className="cf-group">
      <legend>{legend}</legend>
      <div className="cf-checks">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label className={`cf-check${checked ? ' is-on' : ''}`} key={option}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(option)} />
              <span className="cf-box" aria-hidden="true">{checked ? <Check size={13} strokeWidth={3} /> : null}</span>
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// Selections are held as a draft inside the panel and only reach the page when
// Apply Filters is pressed, so the grid does not churn while choosing.
function FilterPanel({ industries, solutions, options, onApply, onReset, onClose }) {
  const panel = useRef(null);
  const [draftIndustries, setDraftIndustries] = useState(industries);
  const [draftSolutions, setDraftSolutions] = useState(solutions);

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.activeElement;
    panel.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [onClose]);

  const toggle = (list, setList) => (value) => setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const count = draftIndustries.length + draftSolutions.length;

  return (
    <div className="cf-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="cf-panel" role="dialog" aria-modal="true" aria-labelledby="cf-title" tabIndex={-1} ref={panel}>
        <header className="cf-head">
          <h2 id="cf-title"><Filter size={18} aria-hidden="true" /> Filter By</h2>
          <button type="button" className="cf-close" onClick={onClose} aria-label="Close filters"><X size={20} /></button>
        </header>

        <div className="cf-body">
          <CheckboxGroup legend="Industry" options={options.industries} selected={draftIndustries} onToggle={toggle(draftIndustries, setDraftIndustries)} />
          <CheckboxGroup legend="Solution" options={options.solutions} selected={draftSolutions} onToggle={toggle(draftSolutions, setDraftSolutions)} />
        </div>

        <footer className="cf-foot">
          <button type="button" className="cf-reset-btn" onClick={() => { setDraftIndustries([]); setDraftSolutions([]); onReset(); }}>Reset</button>
          <button type="button" className="cf-apply" onClick={() => onApply(draftIndustries, draftSolutions)}>
            Apply Filters{count ? ` (${count})` : ''}
          </button>
        </footer>
      </div>
    </div>
  );
}

function StoriesPage({ meta }) {
  const [query, setQuery] = useState('');
  const [industries, setIndustries] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const options = useTaxonomies();
  const { clients, total, loading, error } = useClientList({ query, industries, solutions });

  const activeFilters = [...industries, ...solutions];
  const hasAny = activeFilters.length > 0 || query.trim().length > 0;
  const dropFilter = (value) => {
    setIndustries((list) => list.filter((item) => item !== value));
    setSolutions((list) => list.filter((item) => item !== value));
  };

  return (
    <>
      <section className="sp-hero sp-hero-directory">
        <div className="content-page-inner sp-hero-narrow">
          <Crumbs meta={meta} light />
          <span className="sp-eyebrow light">CUSTOMER STORIES</span>
          <h1>Organisations that work with Srisun</h1>
          <p>{meta.description}</p>
        </div>
      </section>

      <section className="sp-section cp-section">
        <div className="content-page-inner">
          <div className="cp-bar">
            <div className="cp-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search clients by company name..."
                aria-label="Search clients by company name"
              />
            </div>
            <button type="button" className={`cp-filter-btn${activeFilters.length ? ' is-active' : ''}`} onClick={() => setPanelOpen(true)} aria-haspopup="dialog" aria-expanded={panelOpen}>
              <Filter size={17} aria-hidden="true" /> Filter By
              {activeFilters.length ? <span className="cp-filter-count">{activeFilters.length}</span> : null}
            </button>
          </div>

          <div className="cp-status">
            <span className="cp-count" role="status">
              {loading ? 'Loading clients…' : error ? 'Clients could not be loaded' : `Showing ${clients.length}${total > clients.length ? ` of ${total}` : ''} ${total === 1 ? 'client' : 'clients'}`}
            </span>
            {activeFilters.length ? (
              <div className="cp-chiprow">
                {activeFilters.map((value) => (
                  <button type="button" className="cp-activechip" key={value} onClick={() => dropFilter(value)} aria-label={`Remove ${value} filter`}>
                    {value} <X size={13} aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : null}
            {hasAny ? <button type="button" className="cp-reset" onClick={() => { setQuery(''); setIndustries([]); setSolutions([]); }}>Clear all</button> : null}
          </div>

          {error ? (
            <p className="cp-error" role="alert"><AlertCircle size={17} aria-hidden="true" /> {error}</p>
          ) : loading ? (
            <div className="cp-grid" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, index) => <div className="cp-skeleton" key={index} />)}
            </div>
          ) : clients.length === 0 ? (
            <p className="cp-empty">No clients match that search or filter. Try a different name, industry or solution.</p>
          ) : (
            <div className="cp-grid">
              {clients.map((client) => (
                <article className="cp-card" key={client.id}>
                  <a className="cp-card-hit" href={caseStudyPath(client)}>
                    <span className="cp-sr">{isPublished(client) ? `View case study for ${client.name}` : `View details for ${client.name}`}</span>
                  </a>
                  <div className="cp-card-logo"><ClientLogo client={client} className="cp-card-img" /></div>
                  <div className="cp-card-body">
                    <h2>{client.name}</h2>
                    {client.description ? <p>{client.description}</p> : null}
                    <div className="cp-tags">{client.tags.slice(0, 4).map((tag) => <span className="cp-tag" key={tag}>{tag}</span>)}</div>
                  </div>
                  <div className="cp-card-foot">
                    <span className="cp-industry">{client.industry}</span>
                    <span className="cp-more">{isPublished(client) ? 'View Case Study' : 'View Details'} <ArrowRight size={14} /></span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {panelOpen && (
        <FilterPanel
          industries={industries}
          solutions={solutions}
          options={options}
          onClose={() => setPanelOpen(false)}
          onApply={(nextIndustries, nextSolutions) => { setIndustries(nextIndustries); setSolutions(nextSolutions); setPanelOpen(false); }}
          onReset={() => { setIndustries([]); setSolutions([]); }}
        />
      )}

      <CtaBand title="Want results like these for your organisation?" text="Tell us about your goals, and we will share relevant work and a sensible first step." />
    </>
  );
}

// ─── Case study detail view ──────────────────────────────────────────────────
// Each block renders only when the database holds that content.

const CsSection = ({ title, children }) => (
  <section className="cs-block">
    <h2>{title}</h2>
    {children}
  </section>
);

function CaseStudyPage({ client }) {
  const theme = subpages['/clients/stories']?.theme || ['#079b68', '#e2a900'];

  const cs = client.caseStudy;
  const related = useRelated(client);

  // This page can mount after the shared reveal observer in App has already
  // run, so anything inside it is revealed directly rather than waiting to be
  // observed and left at opacity 0.
  useEffect(() => {
    document.querySelectorAll('.cs-page [data-reveal]').forEach((el) => el.classList.add('is-visible'));
  }, [client.id]);

  // Search metadata, straight from the database record. Only a published case
  // study is marked indexable; a draft stays out of the index entirely.
  useEffect(() => {
    const origin = 'https://srisun.ai';
    const url = `${origin}/clients/stories/${client.id}`;
    const published = cs?.status === 'published';
    const title = cs?.seoTitle || `${client.name} | Srisun Case Study`;
    const description = cs?.metaDescription || cs?.summary || client.description || `${client.name} is part of the Srisun client portfolio.`;

    // the build already wrote complete head tags for a published, prerendered story
    if (published && document.head.querySelector(`link[rel="canonical"][href="${url}"]`)) return;

    document.title = title;

    const head = document.head;
    const setTag = (selector, create, attrs) => {
      let el = head.querySelector(selector);
      if (!el) { el = create(); head.appendChild(el); }
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
      return el;
    };
    const meta = (name, value, property = false) => setTag(
      `meta[${property ? 'property' : 'name'}="${name}"]`,
      () => document.createElement('meta'),
      { [property ? 'property' : 'name']: name, content: value }
    );

    meta('description', description);
    meta('robots', published ? 'index,follow' : 'noindex,nofollow');
    if (cs?.keywords) meta('keywords', cs.keywords);
    meta('og:type', 'article', true);
    meta('og:title', cs?.ogTitle || title, true);
    meta('og:description', cs?.ogDescription || description, true);
    meta('og:url', url, true);
    meta('og:image', cs?.heroImage ? `${origin}${cs.heroImage}` : `${origin}/assets/srisun-logo.png`, true);
    meta('twitter:card', 'summary_large_image');

    setTag('link[rel="canonical"]', () => document.createElement('link'), { rel: 'canonical', href: url });

    const schema = setTag('#srisun-schema', () => {
      const script = document.createElement('script');
      script.id = 'srisun-schema';
      return script;
    }, { type: 'application/ld+json' });
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': `${url}#article`,
          headline: title,
          description,
          url,
          isPartOf: { '@id': `${origin}/#website` },
          publisher: { '@id': `${origin}/#organization` },
          about: { '@type': 'Organization', name: client.name, url: client.website || undefined },
          ...(cs?.publishedAt ? { datePublished: cs.publishedAt.replace(' ', 'T') } : {})
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Clients', item: `${origin}/clients` },
            { '@type': 'ListItem', position: 2, name: 'Customer stories', item: `${origin}/clients/stories` },
            { '@type': 'ListItem', position: 3, name: client.name, item: url }
          ]
        },
        { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Srisun', url: `${origin}/`, logo: `${origin}/assets/srisun-logo.png` },
        { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'Srisun' }
      ]
    });
  }, [client, cs]);

  return (
    <main className="sp-page sp-t-stories cs-page" style={{ '--sp-a': theme[0], '--sp-b': theme[1] }}>
      <section className="cs-hero" style={cs?.heroImage ? { backgroundImage: `url(${cs.heroImage})` } : undefined}>
        <div className="cs-hero-inner content-page-inner">
          <nav className="cs-crumbs" aria-label="Breadcrumb">
            <a href="/clients">Clients</a> <ChevronRight size={13} aria-hidden="true" />
            <a href="/clients/stories">Customer stories</a> <ChevronRight size={13} aria-hidden="true" />
            <span>{client.name}</span>
          </nav>
          <div className="cs-hero-head">
            <div className="cs-hero-logo"><ClientLogo client={client} className="cs-hero-img" /></div>
            <div>
              <h1>{cs?.title || client.name}</h1>
              {cs?.summary ? <p className="cs-lede">{cs.summary}</p> : null}
              <div className="cp-chips cs-chips">
                {client.industry ? <span className="cp-chip cp-chip-industry">{client.industry}</span> : null}
                {client.solutions.map((item) => <span className="cp-chip" key={item}>{item}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="content-page-inner cs-body">
        {!cs ? (
          <div className="cs-blank">
            <h2>Case study in progress</h2>
            <p>{client.name} works with Srisun. A detailed case study will be published here. To discuss similar work, contact our team.</p>
          </div>
        ) : null}

        {cs?.metrics?.length ? (
          <section className="cs-metrics" aria-label="Key results">
            {cs.metrics.map((metric) => (
              <div className="cs-metric" key={`${metric.label}-${metric.value}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                {metric.caption ? <small>{metric.caption}</small> : null}
              </div>
            ))}
          </section>
        ) : null}

        {cs?.executiveSummary ? <CsSection title="Executive summary"><p>{cs.executiveSummary}</p></CsSection> : null}
        {cs?.aboutClient ? <CsSection title="About the client"><p>{cs.aboutClient}</p></CsSection> : null}
        {cs?.challenge ? <CsSection title="The challenge"><p>{cs.challenge}</p></CsSection> : null}
        {cs?.solution ? <CsSection title="Our solution"><p>{cs.solution}</p></CsSection> : null}

        {cs?.services?.length ? (
          <CsSection title="Services delivered">
            <ul className="cp-list">{cs.services.map((item) => <li key={item}><Check size={15} aria-hidden="true" /> {item}</li>)}</ul>
          </CsSection>
        ) : null}

        {cs?.technologies?.length ? (
          <CsSection title="Technologies used">
            <div className="cp-chips">{cs.technologies.map((item) => <span className="cp-chip" key={item}>{item}</span>)}</div>
          </CsSection>
        ) : null}

        {cs?.timeline?.length ? (
          <CsSection title="Implementation timeline">
            <ol className="cs-timeline">
              {cs.timeline.map((step, index) => (
                <li key={`${step.stage}-${index}`}>
                  <span className="cs-stage-dot">{index + 1}</span>
                  <div>
                    <strong>{step.stage}</strong>
                    {step.title ? <span className="cs-stage-title">{step.title}</span> : null}
                    {step.detail ? <p>{step.detail}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </CsSection>
        ) : null}

        {cs?.images?.length ? (
          <CsSection title="Project images">
            <div className="cs-gallery">
              {cs.images.map((image, index) => (
                <figure key={`${image.src}-${index}`}>
                  <img src={image.src} alt={image.alt || `${client.name} project image ${index + 1}`} loading="lazy" />
                  {image.alt ? <figcaption>{image.alt}</figcaption> : null}
                </figure>
              ))}
            </div>
          </CsSection>
        ) : null}

        {cs?.results ? <CsSection title="Results and outcomes"><p>{cs.results}</p></CsSection> : null}

        {cs?.testimonial?.quote ? (
          <blockquote className="cs-quote">
            <Quote size={22} aria-hidden="true" />
            <p>{cs.testimonial.quote}</p>
            {cs.testimonial.author ? (
              <footer>
                {cs.testimonial.author}
                {cs.testimonial.role ? <span>{cs.testimonial.role}</span> : null}
              </footer>
            ) : null}
          </blockquote>
        ) : null}

        {cs?.conclusion ? <CsSection title="Conclusion"><p>{cs.conclusion}</p></CsSection> : null}

        <div className="cs-actions">
          {client.website ? <a className="cp-visit" href={client.website} target="_blank" rel="noopener noreferrer">Visit Website <ExternalLink size={15} /></a> : null}
          {cs?.pdf?.src ? <a className="cs-pdf" href={cs.pdf.src} download={cs.pdf.name || `${client.id}-case-study.pdf`}>Download case study PDF <Download size={15} /></a> : null}
          <a className="cp-ask" href="/contact-us">Ask about this work <ArrowRight size={14} /></a>
        </div>

        {related.length ? (
          <section className="cs-related" aria-label="Related case studies">
            <h2>Related case studies</h2>
            <div className="cs-related-grid">
              {related.map((other) => (
                <a className="cs-related-card" href={caseStudyPath(other)} key={other.id}>
                  <div className="cs-related-logo"><ClientLogo client={other} className="cs-related-img" /></div>
                  <strong>{other.name}</strong>
                  <span>{other.industry}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <a className="cs-back" href="/clients/stories"><ArrowLeft size={15} /> All customer stories</a>
      </div>

      <CtaBand title="Want results like these for your organisation?" text="Tell us about your goals, and we will share relevant work and a sensible first step." />
    </main>
  );
}

export function CaseStudyRoute({ slug }) {
  const { client, loading, error, notFound } = useClient(slug);

  if (loading) {
    return (
      <main className="sp-page cs-page">
        <div className="content-page-inner cs-loading" role="status">Loading case study…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sp-page cs-page">
        <div className="content-page-inner cs-loading" role="alert"><AlertCircle size={18} aria-hidden="true" /> {error}</div>
      </main>
    );
  }

  if (notFound || !client) {
    return (
      <main className="content-page content-not-found">
        <div className="content-page-inner">
          <span className="content-eyebrow"><i /> Not found</span>
          <h1>We couldn’t find that case study.</h1>
          <p>The link may be mistyped, or the page may have moved.</p>
          <div className="content-not-found-links">
            <a href="/clients/stories">Customer stories</a>
            <a href="/clients">Clients</a>
            <a href="/contact-us">Contact Us</a>
          </div>
        </div>
      </main>
    );
  }

  return <CaseStudyPage client={client} />;
}

const templates = { service: ServicePage, industry: IndustryPage, product: ProductPage, partner: PartnerPage, resource: ResourcePage, about: AboutPage, story: StoryPage, brand: BrandPage, policy: PolicyPage, directory: DirectoryPage, stories: StoriesPage };

export function SubPage({ page, meta }) {
  const Template = templates[page.template];
  return (
    <main className={`sp-page sp-t-${page.template}`} style={{ '--sp-a': page.theme[0], '--sp-b': page.theme[1] }}>
      <Template page={page} meta={meta} />
    </main>
  );
}

export const subpageFaq = (path) => subpages[path]?.faq?.map(([question, answer]) => ({ question, answer })) || null;
