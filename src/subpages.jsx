// Templates for every redesigned sub-page. Content lives in subpageContent.js;
// each template has its own hero visual and motion, and every page gets its
// own two-colour theme through the --sp-a / --sp-b custom properties.
import { useState } from 'react';
import { ArrowRight, ChevronRight, ChevronDown, Check, Search, Mail, Bot, Quote, Gavel, ExternalLink, Copy, MapPin, Users } from 'lucide-react';
import { subpages, policyList, aboutValues, aboutCapabilities, storyChapters, brandColours, brandRules } from './subpageContent.js';
import { trustedBrands } from './siteData.js';
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
          <Heading kicker="HOW IT WORKS" title="Four steps from first call to everyday use" center />
          <Reveal as="ol" className="sp-steps">
            {page.steps.map(([title, text], index) => <li key={title} style={{ '--i': index }}><span>{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}
          </Reveal>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner sp-fit">
          <Reveal><span className="sp-kicker">POPULAR WITH</span><h2>Organisations that use {page.label.toLowerCase()} services</h2><p>See how this service fits into the wider plans for your sector.</p></Reveal>
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
          <Heading kicker="HOW SRISUN HELPS" title="Solutions that fit the way you work" center />
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
          <Reveal className="sp-starters-copy"><span className="sp-kicker">WHERE TO START</span><h2>Good first projects</h2><p>Small steps that show results quickly and set up what comes next.</p></Reveal>
          <ul>{page.starters.map((item, index) => <Reveal as="li" i={index} key={item}><span><Check size={16} /></span>{item}</Reveal>)}</ul>
        </div>
      </section>

      {page.showClients && <LogoGrid title={page.clientsTitle} />}
      <Faq items={page.faq} title={`Questions from ${page.label.toLowerCase()} teams`} />
      <CtaBand title="Let’s talk about what your organisation needs." text="Tell us your biggest challenge. We will suggest a practical first step." />
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
          <Heading kicker="BEFORE YOUR WALKTHROUGH" title="What to have ready" text="These details help the team show you the parts that matter to you." center />
          <div className="sp-prepare-grid">
            {page.prepare.map(([PrepIcon, title, text], index) => <Reveal as="article" className="sp-prepare" i={index} key={title}><span className="sp-feature-icon"><PrepIcon size={22} /></span><h3>{title}</h3><p>{text}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="sp-section sp-tint">
        <div className="content-page-inner">
          <Heading kicker="HOW IT WORKS" title={`Getting started with ${meta.title}`} center />
          <Reveal as="ol" className="sp-steps three">
            {[['Share your needs', 'Tell us about your organisation and what you want to solve.'], ['See a walkthrough', 'The team shows you the product around your use case.'], ['Plan next steps', 'Agree availability, timeline and how to start.']].map(([title, text], index) => <li key={title} style={{ '--i': index }}><span>{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}
          </Reveal>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner">
          <Heading kicker="THE SRISUN PLATFORM" title="Explore other products" />
          <div className="sp-mini-grid">
            {others.map(([OtherIcon, title, text, href], index) => <Reveal as="a" className="sp-mini" href={href} i={index} key={title}><span className="sp-feature-icon"><OtherIcon size={20} /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={16} /></Reveal>)}
          </div>
        </div>
      </section>

      <Faq title={`Questions about ${meta.title}`} items={[[`Is ${meta.title} available now?`, 'Contact the Srisun team for current availability and pricing.'], ['Can we see a demo?', 'Yes. Ask for a walkthrough and the team will arrange one.'], ['Can it work with our existing tools?', 'Share the tools you use and the team will confirm what is possible.']]} />
      <CtaBand title={`Want to see ${meta.title}?`} text="Share your needs and the team will arrange a walkthrough." button="Request a Walkthrough" />
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
          <Heading kicker="HOW IT WORKS" title="From first message to working together" />
          <ol className="sp-timeline">
            {[['Share your details', 'Send us the information listed below through the contact page.'], ['Introductory call', 'We talk about your organisation, customers and goals.'], ['Agree the scope', 'We agree how we will work together and who does what.'], ['Start working together', 'We begin with a first project or customer.']].map(([title, text], index) => <Reveal as="li" i={index} key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}
          </ol>
        </div>
      </section>

      <section className="sp-section">
        <div className="content-page-inner sp-share">
          <Reveal className="sp-share-list"><span className="sp-kicker">WHAT TO SHARE</span><h2>Helpful details for your application</h2><ul>{page.share.map((item) => <li key={item}><span><Check size={15} /></span>{item}</li>)}</ul></Reveal>
          <Reveal className="sp-share-card" i={1}><Icon size={30} /><h3>Ready to apply?</h3><p>Send your details and mention the {page.label}.</p><a className="sp-btn" href="/contact-us">Apply to Partner <ArrowRight size={17} /></a></Reveal>
        </div>
      </section>

      <Faq title="Questions about partnering" items={[['How do we apply?', `Use the contact page and mention the ${page.label}. The team will reply to arrange a call.`], ['What happens after we apply?', 'The team reviews your details and arranges an introductory call to discuss fit.'], ['Where can we see other partner options?', 'The Partners page lists every programme.']]} />
      <CtaBand title="Let’s build something together." text="Tell us what your organisation brings. We will suggest how to work together." button="Apply to Partner" />
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
          <p>Srisun brings consulting, software, automation, cybersecurity and digital growth together for organisations across India.</p>
        </div>
      </section>
      <section className="sp-section">
        <div className="content-page-inner">
          <Heading kicker="WHAT WE DO" title="Six ways we help" center />
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
          <Reveal className="sp-where-card"><MapPin size={28} /><div><span className="sp-kicker">WHERE WE ARE</span><h2>Based in Tamil Nadu, working across India</h2><p>Our team works with organisations on-site or remotely, wherever they are.</p></div><a className="sp-btn" href="/contact-us">Contact Us <ArrowRight size={17} /></a></Reveal>
        </div>
      </section>
      <LogoGrid title="Organisations that work with Srisun" />
      <CtaBand title="Let’s work together." text="Tell us what you are planning. We will suggest a practical first step." />
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
          <h1>From rural <span className="sp-grad-text">to global</span></h1>
          <p>Good ideas can start anywhere. This is how Srisun grew from local beginnings into a team that builds for organisations across India.</p>
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
          <Reveal className="sp-pullquote"><Quote size={36} /><p>Technology should make everyday work simpler, and create more possibilities for the people who use it.</p></Reveal>
        </div>
      </section>
      <CtaBand title="Be part of the next chapter." text="Work with Srisun, or join the team building it." button="Work With Us" />
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
            <p>For approved use of Srisun names, logos and brand assets, request the current guidelines from the Srisun team.</p>
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
      <CtaBand title="Planning to use the Srisun brand?" text="Request approval and the latest assets before any public or partner campaign." button="Request Brand Guidelines" />
    </>
  );
}

/* ───────────── POLICY ───────────── */
function PolicyPage({ meta }) {
  const current = policyList.find((policy) => policy.href === meta.path);
  const Icon = current?.icon || Gavel;
  return (
    <section className="sp-policy">
      <div className="content-page-inner sp-policy-grid">
        <aside className="sp-policy-nav" aria-label="Policies">
          <span className="sp-kicker">POLICIES</span>
          {policyList.map(({ title, icon: NavIcon, href }) => <a key={href} href={href} className={href === meta.path ? 'active' : ''} aria-current={href === meta.path ? 'page' : undefined}><NavIcon size={16} />{title}</a>)}
        </aside>
        <div className="sp-policy-main">
          <Crumbs meta={meta} />
          <div className="sp-policy-title"><span><Icon size={26} /></span><h1>{meta.title}</h1></div>
          <Reveal className="sp-policy-note"><b>Policy text in preparation</b><p>{meta.description}</p></Reveal>
          <Reveal className="sp-policy-contact" i={1}>
            <div><h2>Questions or requests?</h2><p>Contact Srisun about this policy and the team will respond.</p><a href="mailto:sundar@srisun.com">sundar@srisun.com</a></div>
            <a className="sp-btn" href="/contact-us">Contact Us About {meta.title} <ArrowRight size={17} /></a>
          </Reveal>
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
      <CtaBand title="Not sure where to start?" text="Tell us what you need and we will point you to the right place." button="Talk to Concierge" href="/resources/concierge" />
    </>
  );
}

function StoriesPage({ meta }) {
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
      <section className="sp-section">
        <div className="content-page-inner">
          <div className="sp-story-grid">
            {trustedBrands.map(([name, logo], index) => <Reveal as="article" className="sp-story" i={index % 4} key={name}><div className="sp-story-logo"><img src={logo} alt="" loading="lazy" /></div><h2>{name}</h2><a href="/contact-us">Ask about this work <ArrowRight size={14} /></a></Reveal>)}
          </div>
        </div>
      </section>
      <CtaBand title="Want results like these for your organisation?" text="Tell us about your goals. We will share relevant work and a first step." />
    </>
  );
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
