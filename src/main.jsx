import React, { useEffect, useRef, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import {
  Search,
  Mail,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
  Globe,
  Boxes,
  GraduationCap,
  Landmark,
  Store,
  Factory,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Megaphone,
  BookOpen,
  BriefcaseBusiness,
  Phone,
  AtSign,
  MapPin,
  Send,
  Compass,
  Layers,
  Route,
  Cloud,
  Workflow,
  Bot,
  Database,
  ClipboardCheck,
  Lightbulb,
  Rocket,
  Handshake,
  ArrowRight,
  Users,
  Monitor,
  ShoppingCart,
  PenTool,
  Puzzle,
  Smartphone,
  Headphones,
  CreditCard,
  TrendingUp,
  Palette
} from 'lucide-react';
import './styles.css';
import { trustedBrands } from './siteData.js';
import { getSubpage, SubPage, subpageFaq, CaseStudyRoute, publishedPage } from './subpages.jsx';
import { AdminApp } from './admin.jsx';
import { fetchJobs, submitApplication, submitEnquiry } from './apiClient.js';
import jobsSnapshot from './generated/jobs.json';

const menuData = {
  Services: [
    'Sales', 'ERP', 'Legal', 'Marketing', 'CRM', 'Forms', 'Booking', 'Domain / Server'
  ],
  Solutions: {
    category: [
      'Tech Consulting', 'Web & E-Commerce', 'Software & Apps',
      'AI & Automation', 'Cybersecurity', 'Business Communication', 'Digital Growth'
    ],
    industry: [
      'Education', 'Finance', 'Retail', 'Manufacturing', 'Healthcare',
      'Professional Services', 'SMEs'
    ]
  },
  Clients: ['Stories', 'Training & Certifications', 'Affiliate Program'],
  Partners: [
    'Partner Program', 'Technology Partners', 'Reseller Partners',
    'Integration Partners', 'Strategic Partnerships'
  ],
  Resources: {
  learn: [
    'Announcements Hub',
    'Blog',
    'Shri (AI Agent)',
    'Newsletter',
    'The Long Game'
  ],

  support: [
    'Knowledge Base',
    'Concierge',
    'Contact Us'
  ],

  opportunities: [
    'Careers'
  ]
}
};

const slugify = (value) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const serviceItems = ['Sales', 'ERP', 'Legal', 'Marketing', 'CRM', 'Forms', 'Booking', 'Domain / Server'];
const solutionItems = ['Tech Consulting', 'Web & E-Commerce', 'Software & Apps', 'AI & Automation', 'Cybersecurity', 'Business Communication', 'Digital Growth'];
const industryItems = ['Education', 'Finance', 'Retail', 'Manufacturing', 'Healthcare', 'Professional Services', 'SMEs'];
const routeForItem = {
  'Training & Certifications': 'https://sit.srisun.org/',
  'Contact Us': '/contact-us', 'Careers': '/careers',
  'Stories': '/clients/stories', 'Client Stories': '/clients/stories',
  'Affiliate Program': '/partners/affiliate-program',
  'Partner Program': '/partners/partner-program', 'Technology Partners': '/partners/technology-partners',
  'Reseller Partners': '/partners/reseller-partners', 'Integration Partners': '/partners/integration-partners',
  'Strategic Partnerships': '/partners/strategic-partnerships',
  'Announcements Hub': '/resources/announcements', 'Blog': '/resources/blog',
  'Shri (AI Agent)': '/resources/shri-ai-agent', 'Newsletter': '/resources/newsletter',
  'The Long Game': '/resources/the-long-game', 'Knowledge Base': '/resources/knowledge-base',
  'Concierge': '/resources/concierge', 'About Us': '/company/about-srisun', 'Our Story': '/company/our-story',
  'News & Updates': '/resources/announcements', 'Brand Guidelines': '/company/brand-guidelines',
  'Srisun AI': '/products/srisun-ai', 'Srisun Books': '/products/srisun-books',
  'Srisun Social': '/products/srisun-social', 'Zedu': '/products/zedu', 'XLoan': '/products/xloan',
  'Work With a Partner': '/partners/partner-program', 'Security': '/legal/security', 'Compliance': '/legal/compliance',
  'IPR Complaints': '/legal/ipr-complaints', 'Terms of Service': '/legal/terms-of-service',
  'Privacy Policy': '/legal/privacy-policy', 'Refund Policy': '/legal/refund-policy',
  'Trademark Policy': '/legal/trademark-policy', 'Cookie Policy': '/legal/cookie-policy',
  'GDPR Compliance': '/legal/gdpr-compliance', 'Abuse Policy': '/legal/abuse-policy'
};
const menuItemHref = (item) => routeForItem[item]
  || (serviceItems.includes(item) ? `/services/${slugify(item)}` : null)
  || (solutionItems.includes(item) ? `/solutions/${slugify(item)}` : null)
  || (industryItems.includes(item) ? `/industries/${slugify(item)}` : null)
  || `/resources/${slugify(item)}`;

function SimpleDropdown({ items }) {
  return (
    <div className="dropdown-menu simple-dropdown">
      {items.map((item) => (
        <a href={menuItemHref(item)} className="dropdown-link" key={item}>
          <span>{item}</span>
          <ChevronRight size={14} className="dropdown-arrow" />
        </a>
      ))}
    </div>
  );
}

function SolutionsDropdown() {
  return (
    <div className="dropdown-menu solutions-dropdown">
      <div className="dropdown-column">
        <div className="dropdown-title"><Boxes size={14} /> Solution By Category</div>
        {menuData.Solutions.category.map((item) => (
          <a href={menuItemHref(item)} className="dropdown-link" key={item}>
            <span>{item}</span><ChevronRight size={14} className="dropdown-arrow" />
          </a>
        ))}
      </div>
      <div className="dropdown-column dropdown-column-border">
        <div className="dropdown-title"><Factory size={14} /> Solution By Industry</div>
        {menuData.Solutions.industry.map((item) => (
          <a href={menuItemHref(item)} className="dropdown-link" key={item}>
            <span>{item}</span><ChevronRight size={14} className="dropdown-arrow" />
          </a>
        ))}
      </div>
    </div>
  );
}

function ResourcesDropdown() {
  return (
    <div className="dropdown-menu resources-dropdown">
      <div className="dropdown-column">
        <div className="dropdown-title"><BookOpen size={14} /> Learn</div>
        {menuData.Resources.learn.map((item) => (
          <a href={menuItemHref(item)} className="dropdown-link" key={item}>
            <span>{item}</span>
            <ChevronRight size={14} className="dropdown-arrow" />
          </a>
        ))}
      </div>

      <div className="dropdown-column dropdown-column-border">
        <div className="dropdown-title"><MessageCircle size={14} /> Support</div>
        {menuData.Resources.support.map((item) => (
          <a href={menuItemHref(item)} className="dropdown-link" key={item}>
            <span>{item}</span>
            <ChevronRight size={14} className="dropdown-arrow" />
          </a>
        ))}
      </div>

      <div className="dropdown-column dropdown-column-border">
        <div className="dropdown-title"><BriefcaseBusiness size={14} /> Opportunities</div>
        {menuData.Resources.opportunities.map((item) => (
          <a href={menuItemHref(item)} className="dropdown-link" key={item}>
            <span>{item}</span>
            <ChevronRight size={14} className="dropdown-arrow" />
          </a>
        ))}
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const headerRef = useRef(null);

  const toggle = (name) => setOpen(open === name ? null : name);

  // Close menus on outside click / Escape; reset mobile menu when returning to desktop.
  useEffect(() => {
    const onPointer = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpen(null);
        setSearch(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setSearch(false);
        setMobile(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth > 1024) setMobile(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const renderDropdown = (name) => {
    if (name === 'Solutions') return <SolutionsDropdown />;
    if (name === 'Resources') return <ResourcesDropdown />;
    return <SimpleDropdown items={menuData[name]} />;
  };

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-inner">
        <a className="brand" href="/" aria-label="Srisun home">
          <img src="/assets/srisun-logo.png" alt="Srisun" width="172" height="56" />
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {Object.keys(menuData).map((name) => (
            <div className={`nav-item${name === 'Solutions' || name === 'Resources' ? ' wide' : ''}`} key={name}>
              <button
                type="button"
                className={`nav-link ${open === name ? 'active' : ''}`}
                onClick={() => toggle(name)}
                aria-expanded={open === name}
                aria-haspopup="true"
              >
                {name}<ChevronDown size={15} />
              </button>
              {open === name && renderDropdown(name)}
            </div>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-button" onClick={() => setSearch((v) => !v)} aria-label="Search" aria-expanded={search}>
            <Search size={21} />
          </button>
          <a href="/contact-us" className="header-consult">Book a Consultation</a>
          <button type="button" className="mobile-toggle" onClick={() => setMobile((v) => !v)} aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile}>
            {mobile ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {search && (
        <div className="search-bar">
          <Search size={20} />
          <form className="site-search-form" action="/search">
            <input autoFocus type="search" name="q" aria-label="Search Srisun" placeholder="Search services, solutions and industries" />
            <button type="submit" className="site-search-submit">Search</button>
          </form>
          <button type="button" onClick={() => setSearch(false)} aria-label="Close search"><X size={18} /></button>
        </div>
      )}

      {mobile && (
        <div className="mobile-menu">
          {Object.keys(menuData).map((name) => (
            <div key={name}>
              <button type="button" className="mobile-menu-item" onClick={() => toggle(name)} aria-expanded={open === name}>
                {name}<ChevronDown size={18} />
              </button>
              {open === name && (
                <div className="mobile-submenu">
                  {name === 'Solutions' ? (
                    <>
                      <div className="mobile-group-title">Solution By Category</div>
                      {menuData.Solutions.category.map((item) => <a href={menuItemHref(item)} key={item}>{item}</a>)}
                      <div className="mobile-group-title">Solution By Industry</div>
                      {menuData.Solutions.industry.map((item) => <a href={menuItemHref(item)} key={item}>{item}</a>)}
                    </>
                  ) : name === 'Resources' ? (
                    <>
                      <div className="mobile-group-title">Learn</div>
                      {menuData.Resources.learn.map((item) => <a href={menuItemHref(item)} key={item}>{item}</a>)}
                      <div className="mobile-group-title">Support</div>
                      {menuData.Resources.support.map((item) => <a href={menuItemHref(item)} key={item}>{item}</a>)}
                      <div className="mobile-group-title">Opportunities</div>
                      {menuData.Resources.opportunities.map((item) => <a href={menuItemHref(item)} key={item}>{item}</a>)}
                    </>
                  ) : menuData[name].map((item) => <a href={menuItemHref(item)} key={item}>{item}</a>)}
                </div>
              )}
            </div>
          ))}
          <a href="/contact-us" className="mobile-consult">Book a Consultation</a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const featuredSolutions = [
  {
    icon: <Globe size={30} strokeWidth={1.5} />,
    title: "Web & E-Commerce",
    text: "Company websites, online stores and customer portals."
  },
  {
    icon: <Boxes size={30} strokeWidth={1.5} />,
    title: "Software & Apps",
    text: "ERP systems, SaaS products and mobile apps that fit how your team already works."
  },
  {
    icon: <Sparkles size={30} strokeWidth={1.5} />,
    title: "AI & Automation",
    text: "AI agents and automated workflows for the repetitive jobs your staff handle every day."
  },
  {
    icon: <ShieldCheck size={30} strokeWidth={1.5} />,
    title: "Cybersecurity",
    text: "Protection for your data, staff accounts and devices against common attacks."
  },
  {
    icon: <MessageCircle size={30} strokeWidth={1.5} />,
    title: "Business Communication",
    text: "Reach customers on WhatsApp and SMS, with automatic reminders and alerts."
  },
  {
    icon: <Megaphone size={30} strokeWidth={1.5} />,
    title: "Digital Growth",
    text: "Branding, ads and content planned to bring in genuine enquiries."
  }
];

  return (
    <section className="srisun-hero">

      <div className="srisun-hero-container scroll-reveal">

        {/* =========================
            LEFT CONTENT
        ========================== */}

        <div className="srisun-hero-content">

          <h1>
            Building Technology
            <br />
            for Better Lives &amp; Businesses
          </h1>

          <div className="srisun-hero-line"></div>

          <p className="srisun-hero-description">
            We build websites, apps, AI tools and security setups for
            schools, colleges and growing companies across India. The team
            that plans your project also builds it and supports it after launch.
          </p>

          <p className="srisun-hero-stack">
            Software <span>•</span>
            Web <span>•</span>
            Mobile <span>•</span>
            AI <span>•</span>
            Automation <span>•</span>
            Cloud <span>•</span>
            Marketing
          </p>

          <div className="srisun-hero-actions">

            <a
              href="/contact-us"
              className="srisun-hero-button"
            >
              Book a Consultation
              <span>→</span>
            </a>

          </div>

        </div>


        {/* =========================
            RIGHT FEATURED SOLUTIONS
        ========================== */}

        <div className="srisun-featured" id="solutions">

          <div className="srisun-featured-heading">
            <span>FEATURED SOLUTIONS</span>
          </div>

          <div className="srisun-featured-grid">

            {featuredSolutions.map((item) => (
              <a
                href={menuItemHref(item.title)}
                className="srisun-featured-item"
                key={item.title}
              >

                <div className="srisun-featured-icon">
                  {item.icon}
                </div>

                <div className="srisun-featured-info">

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>

                </div>

              </a>
            ))}

          </div>

          <a
            href="/solutions"
            className="srisun-explore"
          >
            See All Solutions
            <span>→</span>
          </a>

        </div>

      </div>

    </section>
  );
}

function SrisunFeaturedSection() {
  return (
    <section className="philosophy-section" aria-labelledby="philosophy-title">
      <div className="philosophy-container scroll-reveal">
        <div className="philosophy-image-wrap">
          <img
            src="/assets/philosophy-girl.webp"
            srcSet={srcSetFor('/assets/philosophy-girl.webp')}
            sizes="(max-width: 860px) 100vw, 1240px"
            alt="Smiling professional thinking beside a laptop"
            className="philosophy-image"
            width="1020"
            height="768"
          />
        </div>

        <div className="philosophy-content">
          <span className="philosophy-label">OUR PHILOSOPHY</span>
          <h2 id="philosophy-title" className="philosophy-title-wrap">
            <span className="philosophy-line">Built in Tiruvannamalai.</span>
            <span className="philosophy-line">Built for <span className="global-word">the world</span>.</span>
          </h2>
          <p className="philosophy-text">
            We started in Tiruvannamalai and still work from here. From this town we
            build websites and software for schools, shops and companies, with clients
            across India and abroad.
          </p>
          <a href="/company/our-story" className="philosophy-button">Read Our Story <span>→</span></a>
        </div>

      </div>
    </section>
  );
}


function TrustedBrandsSection() {
  return (
    <section className="trusted-brands-section" aria-labelledby="trusted-brands-title">
      <div className="trusted-brands-container scroll-reveal">
        <span className="trusted-brands-eyebrow">OUR CLIENTS</span>
        <h2 id="trusted-brands-title">Schools, colleges and companies we work with</h2>
        <div className="trusted-brands-marquee" aria-label="Client logos">
          <div className="trusted-brands-track">
            {[0, 1].map((copy) => (
              <div className="trusted-brands-group" key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
                {trustedBrands.map(([name, logo, url]) => {
                  const image = <img src={logo} alt={copy === 0 ? name : ''} width="160" height="80" loading="lazy" />;
                  return (
                    <div className="trusted-brand" key={name}>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={copy === 0 ? `${name} (opens in a new tab)` : undefined}
                          tabIndex={copy === 0 ? undefined : -1}
                        >
                          {image}
                        </a>
                      ) : image}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <a className="trusted-stories-link" href="/clients/stories">
          See All Clients <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}

function VideoStoriesSection() {
  const slides = [
    { title: 'See the work we have done for our clients.', image: '/assets/client-story-team.webp', alt: 'Indian business team collaborating around a laptop' },
    { title: 'A good project starts with a clear brief.', image: '/assets/client-story-studio.webp', alt: 'Entrepreneur and colleague reviewing a project together' }
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const changeSlide = (direction) => setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  const slide = slides[activeSlide];

  return (
    <section className="video-stories-section" aria-labelledby="video-stories-title">
      <div className="video-stories-carousel scroll-reveal" aria-roledescription="carousel" aria-label="Client stories">
        <button type="button" className="video-stories-arrow video-stories-arrow-prev" onClick={() => changeSlide(-1)} aria-label="Previous story"><ChevronRight size={20} /></button>
        <div className="video-stories-card" aria-live="polite">
          <div className="video-stories-copy">
            <span className="video-stories-kicker">CLIENT STORIES</span>
            <h2 id="video-stories-title">{slide.title}</h2>
            <a href="/clients/stories" className="video-stories-button">Read Their Stories <ChevronRight size={16} /></a>
          </div>
          <img className="video-stories-image" src={slide.image} srcSet={srcSetFor(slide.image)} sizes="(max-width: 860px) 100vw, 620px" width="1600" height="900" alt={slide.alt} />
        </div>
        <button type="button" className="video-stories-arrow video-stories-arrow-next" onClick={() => changeSlide(1)} aria-label="Next story"><ChevronRight size={20} /></button>
        <div className="video-stories-dots" aria-label="Choose a story">
          {slides.map((item, index) => <button key={item.image} type="button" className={index === activeSlide ? 'active' : ''} onClick={() => setActiveSlide(index)} aria-label={`Show story ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined} />)}
        </div>
      </div>
    </section>
  );
}

function EnterpriseSection() {
  return (
    <section className="enterprise-section" id="client-spotlight" aria-labelledby="enterprise-title">
      <div className="enterprise-container scroll-reveal">
        <div className="enterprise-copy">
          <div className="enterprise-heading-row">
            <div className="enterprise-icon" aria-hidden="true"><Boxes size={30} strokeWidth={1.7} /></div>
            <h2 id="enterprise-title">Srisun for Enterprise</h2>
          </div>
          <p>In a larger organisation, sales, accounts and operations often run on separate systems. We connect them so information moves on its own and nobody has to chase reports.</p>
          <a href="/services" className="enterprise-learn-link">View Enterprise Services <ChevronRight size={16} /></a>
        </div>

      </div>
    </section>
  );
}

const industries = [
  { title: 'Education', icon: <GraduationCap size={25} strokeWidth={1.7} />, text: 'Admissions, learning platforms and regular updates for parents.' },
  { title: 'Finance', icon: <Landmark size={25} strokeWidth={1.7} />, text: 'Secure software and clear approval workflows for lenders and finance firms.' },
  { title: 'Retail', icon: <Store size={25} strokeWidth={1.7} />, text: 'Online stores, billing and customer tools that bring shoppers back.' },
  { title: 'Manufacturing', icon: <Factory size={25} strokeWidth={1.7} />, text: 'Connected systems for production, stock and quality checks.' }
];

function IndustriesSection() {
  return (
    <section className="industries-section" aria-labelledby="industries-title">
      <div className="industries-container scroll-reveal">
        <div className="industries-heading">
          <span>INDUSTRIES WE SERVE</span>
          <h2 id="industries-title">Every sector works differently.</h2>
          <p>A school, a lender and a factory each need something different from technology. We start by learning how your sector works.</p>
        </div>
        <div className="industries-grid">
          {industries.map((industry) => (
            <article className="industry-card" key={industry.title}>
              <div className="industry-icon" aria-hidden="true">{industry.icon}</div>
              <h3>{industry.title}</h3>
              <p>{industry.text}</p>
              <a href={menuItemHref(industry.title)}>View Options <ChevronRight size={16} /></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const workSteps = [
  { number: '01', title: 'Discover', color: 'blue', text: 'We learn what you want to achieve, who will use the system and how the work is done today.' },
  { number: '02', title: 'Plan', color: 'red', text: 'You get a written plan covering the services, tools, timeline and milestones.' },
  { number: '03', title: 'Build', color: 'green', text: 'We design, develop and test the work against your actual requirements.' },
  { number: '04', title: 'Grow', color: 'yellow', text: 'After launch, we train your staff and keep improving things as your needs change.' }
];

function HowWeWorkSection() {
  return (
    <section className="how-we-work-section" aria-labelledby="how-we-work-title">
      <div className="how-we-work-container scroll-reveal">
        <div className="how-we-work-heading">
          <span>HOW WE WORK</span>
          <h2 id="how-we-work-title">How a project runs with us</h2>
          <p>You see progress at every stage, and we stay with you after the launch.</p>
        </div>
        <ol className="work-steps">
          {workSteps.map((step) => (
            <li className={`work-step work-step-${step.color}`} key={step.number}>
              <span className="work-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <a href="#contact" className="how-we-work-cta">Start Your Project <ChevronRight size={17} /></a>
      </div>
    </section>
  );
}

function CoreValuesSection() {
  const values = [
    { icon: <MessageCircle size={21} />, color: 'red', title: 'People first', text: 'We design for the people who will use the product every day, not only the people who approve it.' },
    { icon: <Sparkles size={21} />, color: 'yellow', title: 'Always learning', text: 'Every project teaches us something, and we carry it into the next one.' },
    { icon: <ShieldCheck size={21} />, color: 'green', title: 'Honest updates', text: 'We tell you what we know, what we do not know yet and what happens next.' },
    { icon: <Globe size={21} />, color: 'blue', title: 'Local roots, wider reach', text: 'Understanding local needs well helps us build for customers anywhere.' }
  ];
  return (
    <section className="core-values-section" id="about" aria-labelledby="core-values-title">
      <div className="core-values-banner" role="img" aria-label="A team of people coming together to build a better future" />
      <div className="core-values-card scroll-reveal">
        <span className="home-closing-kicker">OUR VALUES</span>
        <h2 id="core-values-title">What we<br />stand for</h2>
        <span className="home-closing-rule" />
        <div className="core-values-grid">
          {values.map((value) => (
            <article className="core-value" key={value.title}>
              <span className={`core-value-icon core-value-${value.color}`}>{value.icon}</span>
              <div><h3>{value.title}</h3><p>{value.text}</p></div>
            </article>
          ))}
        </div>
        <a href="/company/about-srisun" className="core-values-link">About Srisun <ChevronRight size={16} /></a>
      </div>
    </section>
  );
}

function IndiaImpactSection() {
  const focusAreas = ['Consult', 'Build', 'Protect', 'Grow'];
  return (
    <section className="india-impact-section" aria-labelledby="india-impact-title">
      <div className="india-impact-inner scroll-reveal">
        <span className="home-closing-kicker">WHERE WE WORK</span>
        <h2 id="india-impact-title">Based in Tamil Nadu.<br />Working across India.</h2>
        <p>We work with organisations across India, on-site or remotely, whichever suits the project.</p>
        <div className="india-impact-focus" aria-label="Our focus areas">
          {focusAreas.map((area, index) => <div key={area}><span>0{index + 1}</span><strong>{area}</strong></div>)}
        </div>
        <a href="/services" className="india-impact-button">Browse Our Services <ChevronRight size={16} /></a>
      </div>
      <div className="india-impact-orbit india-impact-orbit-one" aria-hidden="true" />
      <div className="india-impact-orbit india-impact-orbit-two" aria-hidden="true" />
    </section>
  );
}


const careerRolePath = (role) => `/careers/jobs/${role.id}`;

// Open roles: the build-time snapshot renders first (and prerenders), then the
// live list from the API replaces it so roles added in the admin show up.
function useOpenRoles() {
  const [state, setState] = useState({ roles: jobsSnapshot, live: false });
  useEffect(() => {
    const controller = new AbortController();
    fetchJobs(controller.signal)
      .then((roles) => setState({ roles, live: true }))
      .catch((error) => { if (error.name !== 'AbortError') setState((prev) => ({ ...prev, live: true })); });
    return () => controller.abort();
  }, []);
  return state;
}

function CareersPage() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const segments = path.split('/').filter(Boolean);
  const { roles, live } = useOpenRoles();
  const roleSlug = path.endsWith('/apply') ? segments.at(-2) : segments.at(-1);
  const selectedRole = roles.find((role) => role.id === roleSlug);
  if (segments.length >= 3 && !selectedRole) {
    return live ? <CareerRoleClosed /> : <main className="careers-page careers-subpage"><p className="careers-loading" role="status">Loading role…</p></main>;
  }
  if (path.endsWith('/apply')) return <CareerApplicationPage role={selectedRole} />;
  if (segments.length >= 3) return <CareerJobDetailPage role={selectedRole} />;
  if (path.endsWith('/jobs')) return <CareersListingPage roles={roles} />;
  return <CareersLandingPage />;
}

function CareerRoleClosed() {
  return (
    <main className="careers-page careers-subpage">
      <section className="careers-job-details careers-detail-page">
        <div className="careers-content-width">
          <div className="careers-job-topline"><a href="/careers">Careers</a><ChevronRight size={14} /><a href="/careers/jobs">Open positions</a></div>
          <h1>This role is not open right now.</h1>
          <p className="careers-job-intro">It may have been filled or closed. Have a look at the roles we are hiring for now.</p>
          <a className="careers-primary-button" href="/careers/jobs">See Open Roles <ChevronRight size={17} /></a>
        </div>
      </section>
    </main>
  );
}

function CareersLandingPage() {
  const emailShareHref = `mailto:?subject=${encodeURIComponent('Careers at Srisun')}&body=${encodeURIComponent(`Explore career opportunities at Srisun: ${window.location.origin}/careers`)}`;
  return (
    <main className="careers-page careers-home">
      <section className="career-home-hero">
        <div className="career-home-inner">
          <div className="career-home-copy">
            <span className="career-home-eyebrow"><i /> CAREERS AT SRISUN <b>·</b> INDIA</span>
            <h1>Do work you can be proud of.<br /><em>Grow as you go.</em></h1>
            <p>Bring your curiosity and your ideas, and build useful technology with people who care about doing it well.</p>
            <div className="career-home-actions">
              <a className="career-home-primary" href="/careers/jobs">Explore Open Roles <ChevronRight size={18} /></a>
              <a className="career-home-secondary" href={emailShareHref}><Mail size={17} /> Share Job via Email</a>
            </div>
            <div className="career-home-location"><Globe size={16} /> Opportunities across India</div>
          </div>
          <div className="career-home-image-wrap">
            <img src="/assets/careers-team.webp" srcSet={srcSetFor('/assets/careers-team.webp')} sizes="(max-width: 860px) 100vw, 640px" width="1600" height="900" fetchpriority="high" alt="A diverse Indian team sharing ideas around a laptop" />
            <div className="career-image-note"><span>GOOD WORK, TOGETHER</span><strong>Bring your best ideas.</strong></div>
            <i className="career-image-spark career-image-spark-red" /><i className="career-image-spark career-image-spark-yellow" />
          </div>
        </div>
      </section>

      <section className="career-home-people">
        <div className="career-home-inner career-people-inner">
          <div className="career-people-image"><img src="/assets/careers-collaboration.webp" srcSet={srcSetFor('/assets/careers-collaboration.webp')} sizes="(max-width: 860px) 100vw, 640px" width="1600" height="674" loading="lazy" alt="Srisun colleagues reviewing an idea together" /><span>PEOPLE BEHIND THE WORK</span></div>
          <div className="career-people-copy"><span className="career-home-kicker">A PLACE TO DO YOUR BEST WORK</span><h2>We grow when our people grow.</h2><p>Different skills and points of view help us solve real problems. At Srisun, you can keep learning, take ownership of your work and see the difference it makes.</p><div className="career-people-accent"><b>Curiosity</b><b>Collaboration</b><b>Care</b></div></div>
        </div>
      </section>

      <section className="career-home-values">
        <div className="career-home-inner career-values-inner">
          <div className="career-values-intro"><span className="career-home-kicker">WHAT WE STAND FOR</span><h2>Build with purpose.<br />Belong across India.</h2><p>We welcome applications from across India to join the teams building technology for better lives and businesses.</p><div className="career-india-chip"><Globe size={17} /> INDIA-WIDE OPPORTUNITIES</div></div>
          <div className="career-values-grid">
            <article><span className="career-value-index career-value-blue">01</span><h3>Learn by building</h3><p>Take on real problems and keep improving your skills.</p></article>
            <article><span className="career-value-index career-value-red">02</span><h3>Work together</h3><p>Share ideas with people from different teams and backgrounds.</p></article>
            <article><span className="career-value-index career-value-green">03</span><h3>Make it useful</h3><p>Build technology that solves real needs.</p></article>
            <article><span className="career-value-index career-value-yellow">04</span><h3>Keep improving</h3><p>Stay curious and make each version better than the last.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}

function CareersListingPage({ roles }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredRoles = roles.filter((role) => `${role.title} ${role.department} ${role.location}`.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <main className="careers-page careers-subpage">
      <section className="careers-openings careers-listing-page">
        <div className="careers-content-width">
          <div className="careers-page-breadcrumb"><a href="/careers">Careers</a><ChevronRight size={14} /><span>Open roles</span></div>
          <div className="careers-section-heading">
            <div><span className="careers-section-kicker">YOUR NEXT CHAPTER</span><h1>Open positions</h1><p>See the roles we are currently hiring for across India.</p></div>
            <label className="careers-search"><Search size={18} /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search roles" aria-label="Search open roles" /></label>
          </div>
          <p className="careers-results-count">{filteredRoles.length} {filteredRoles.length === 1 ? 'role' : 'roles'} available</p>
          <div className="careers-role-list" aria-live="polite">
            {filteredRoles.length ? filteredRoles.map((role) => (
              <article className="careers-role-card" key={role.id}>
                <div className="careers-role-symbol" aria-hidden="true">&lt;/&gt;</div>
                <div className="careers-role-main"><span>{role.department}</span><h2>{role.title}</h2><p>{role.summary}</p><div className="careers-role-meta"><span><Globe size={15} />{role.location}</span><span>{role.type}</span></div></div>
                <a href={careerRolePath(role)} className="careers-role-link">View Details <ChevronRight size={17} /></a>
              </article>
            )) : <p className="careers-no-results">{roles.length ? 'No roles match that search. Try a different title or team.' : 'We have no open roles at the moment. Please check back soon.'}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}

function CareerJobDetailPage({ role }) {
  return (
    <main className="careers-page careers-subpage">
      <section className="careers-job-details careers-detail-page">
        <div className="careers-content-width">
          <div className="careers-job-topline"><a href="/careers">Careers</a><ChevronRight size={14} /><a href="/careers/jobs">Open positions</a><ChevronRight size={14} /><span>{role.title}</span></div>
          <div className="careers-job-layout">
            <div className="careers-job-description">
              <span className="careers-section-kicker">{role.department.toUpperCase()}</span><h1>{role.title}</h1>
              <p className="careers-job-intro">{role.summary}</p>
              <h2>What you’ll work on</h2><ul>{role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
              <h2>What will help you succeed</h2><ul>{role.qualifications.map((item) => <li key={item}>{item}</li>)}</ul>
              <a className="careers-primary-button" href={`${careerRolePath(role)}/apply`}>Apply for This Role <ChevronRight size={17} /></a>
            </div>
            <aside className="careers-job-info"><h2>Role information</h2><dl><div><dt>Location</dt><dd>{role.location}</dd></div><div><dt>Work type</dt><dd>{role.type}</dd></div><div><dt>Team</dt><dd>{role.department}</dd></div></dl><div className="careers-info-note">We are currently considering applicants from across India.</div></aside>
          </div>
        </div>
      </section>
    </main>
  );
}

const MAX_RESUME_MB = 4;

function CareerApplicationPage({ role }) {
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const handleApplication = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const resume = form.get('resume');
    if (resume && resume.size > MAX_RESUME_MB * 1024 * 1024) {
      setStatus({ state: 'error', message: `Your resume is larger than ${MAX_RESUME_MB} MB. Please attach a smaller file.` });
      return;
    }
    form.set('job', role.id);
    form.set('consent', form.get('consent') ? 'yes' : '');
    setStatus({ state: 'sending', message: '' });
    try {
      await submitApplication(form);
      formElement.reset();
      setStatus({ state: 'sent', message: 'Thank you. We have received your application, and our team will be in touch.' });
    } catch (error) {
      setStatus({ state: 'error', message: error.message });
    }
  };
  if (status.state === 'sent') {
    return (
      <main className="careers-page careers-subpage">
        <section className="careers-application careers-apply-page">
          <div className="careers-application-inner">
            <div className="careers-application-heading"><span className="careers-section-kicker">{role.title.toUpperCase()}</span><h1>Application sent.</h1><p role="status">{status.message}</p></div>
            <a className="careers-primary-button" href="/careers/jobs">See Other Roles <ChevronRight size={17} /></a>
          </div>
        </section>
      </main>
    );
  }
  return (
    <main className="careers-page careers-subpage">
      <section className="careers-application careers-apply-page">
        <div className="careers-application-inner">
          <div className="careers-job-topline"><a href="/careers">Careers</a><ChevronRight size={14} /><a href="/careers/jobs">Open positions</a><ChevronRight size={14} /><a href={careerRolePath(role)}>{role.title}</a><ChevronRight size={14} /><span>Application</span></div>
          <div className="careers-application-heading"><span className="careers-section-kicker">{role.title.toUpperCase()} · INDIA</span><h1>Apply for this role.</h1><p>Fill in your details and attach your resume. Fields marked * are required.</p></div>
          <form className="careers-form" onSubmit={handleApplication}>
            <h2 className="careers-form-section-title">Personal details</h2>
            <div className="careers-form-grid">
              <label>Role applied for<input value={role.title} readOnly /></label>
              <label>First name *<input name="firstName" autoComplete="given-name" required /></label><label>Last name *<input name="lastName" autoComplete="family-name" required /></label>
              <label>Email address *<input type="email" name="email" autoComplete="email" required /></label><label>Phone number *<input type="tel" name="phone" autoComplete="tel" required /></label>
              <label>Current location *<input name="currentLocation" placeholder="City, State" required /></label><label>Preferred location in India<select name="preferredLocation" defaultValue=""><option value="" disabled>Select a preference</option><option>Open to locations across India</option><option>Prefer my current city</option><option>Open to relocation</option></select></label>
            </div>
            <h2 className="careers-form-section-title">Experience and resume</h2>
            <div className="careers-form-grid">
              <label>Years of experience<select name="experience" defaultValue=""><option value="" disabled>Select experience</option><option>0–1 years</option><option>1–3 years</option><option>3–5 years</option><option>5+ years</option></select></label>
              <label>Current employer<input name="employer" placeholder="Optional" /></label>
              <label>Notice period<select name="noticePeriod" defaultValue=""><option value="" disabled>Select notice period</option><option>Immediate</option><option>15 days</option><option>30 days</option><option>60 days</option><option>90 days or more</option></select></label>
              <label>Key skills<input name="skills" placeholder="Add skills relevant to this role" required /></label>
              <label>Portfolio or LinkedIn <input type="url" name="portfolio" placeholder="https://" /></label>
              <label className="careers-file-field">Resume *<input type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /><small>PDF or Word document, up to {MAX_RESUME_MB} MB</small></label>
            </div>
            <label className="careers-hp" aria-hidden="true">Leave this empty<input name="nickname" tabIndex={-1} autoComplete="off" /></label>
            <label className="careers-consent"><input type="checkbox" name="consent" required /><span>I confirm that the information above is accurate and may be used to review my application.</span></label>
            <button type="submit" className="careers-primary-button" disabled={status.state === 'sending'}>{status.state === 'sending' ? 'Sending…' : <>Submit Application <ChevronRight size={17} /></>}</button>
            {status.state === 'error' && <p className="careers-form-status careers-form-error" role="alert">{status.message}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}

// Solutions pages that use the full SolutionShowcasePage layout (see showcasePages).
const showcaseSummaries = {
  'Tech Consulting': { showcase: 'consulting', description: 'Independent technology consulting for organisations across India: strategy, IT assessments, cloud, data, AI readiness and cybersecurity, with roadmaps you can act on.' },
  'Web & E-Commerce': { showcase: 'commerce', description: 'Websites and online stores for businesses across India: custom design, WooCommerce and Shopify stores, payment integrations, SEO-ready builds and support after launch.' },
  'AI & Automation': { showcase: 'ai', description: 'AI agents, workflow automation and analytics for organisations across India, starting with a review of where automation will save time.' },
  'Cybersecurity': { showcase: 'security', description: 'Cybersecurity for organisations across India: security reviews, access and data protection, backups, staff training and ongoing support.' },
  'Business Communication': { showcase: 'comms', description: 'WhatsApp Business, SMS, email and app notifications for organisations across India, set up with templates, automation and reporting.' },
  'Digital Growth': { showcase: 'growth', description: 'Branding, performance ads, SEO, social media and content for organisations across India, with clear goals and regular reports.' },
  'Software & Apps': { showcase: 'software', description: 'Custom web apps, Android and iOS apps, SaaS platforms and business software for organisations across India, with support after launch.' }
};

const contentPages = [
  { path: '/services', title: 'Services', group: 'Services', description: 'Explore the services Srisun brings together to help organizations plan, build and grow with technology.', links: serviceItems.map((title) => ({ title, href: menuItemHref(title) })) },
  ...serviceItems.map((title) => ({ path: menuItemHref(title), title, group: 'Services', description: title === 'ERP' ? 'Plan, implement and connect ERP systems around your finance, inventory, people and day-to-day operations. Srisun helps Indian businesses choose a practical path from disconnected tools to clearer workflows.' : `${title} services shaped around your business goals, people and existing technology. Start with the challenge you want to solve and we can help define a practical next step.`, bullets: ['Understand the need and the people affected.', 'Choose an approach that fits your existing systems.', 'Plan delivery, adoption and ongoing improvement.'], ...(title === 'ERP' ? { erp: true } : {}) })),
  { path: '/solutions', title: 'Solutions', group: 'Solutions', description: 'Explore the capabilities that connect strategy, software, automation, security and digital growth.', links: solutionItems.map((title) => ({ title, href: menuItemHref(title) })) },
  ...solutionItems.map((title) => ({ path: menuItemHref(title), title, group: 'Solutions', description: `Explore ${title.toLowerCase()} services for organizations looking to make technology work better for people and business. We shape the scope around your goals, current systems and operating context.`, bullets: ['Discovery and solution planning.', 'Design and implementation support.', 'Integration, refinement and continued improvement.'], ...(showcaseSummaries[title] || {}) })),
  { path: '/industries', title: 'Industries', group: 'Industries', description: 'Technology works best when it fits the way people work. Explore the sectors Srisun serves and how we support each one.', links: industryItems.map((title) => ({ title, href: menuItemHref(title) })) },
  ...industryItems.map((title) => ({ path: menuItemHref(title), title, group: 'Industries', description: `Explore technology considerations for ${title.toLowerCase()} organizations. Srisun brings consulting, software and digital capabilities together around the needs and workflows you identify.`, bullets: ['Map user and operational needs.', 'Connect suitable digital tools and services.', 'Plan for security, usability and future change.'] })),
  { path: '/clients', title: 'Clients', group: 'Company', description: 'Learn about the organizations and communities that have worked with Srisun.', links: [{ title: 'Customer stories', href: '/clients/stories' }] },
  { path: '/clients/stories', title: 'Customer stories', group: 'Clients', description: 'A selection of the schools, colleges and businesses that work with Srisun.', stories: true },
  { path: '/partners', title: 'Partners', group: 'Company', description: 'Build stronger solutions through collaboration with technology, reseller, integration and strategic partners.', links: ['Partner Program', 'Technology Partners', 'Reseller Partners', 'Integration Partners', 'Strategic Partnerships', 'Affiliate Program'].map((title) => ({ title, href: menuItemHref(title) })) },
  { path: '/products', title: 'Products and platforms', group: 'Products', description: 'Explore Srisun’s products and platforms, and speak with our team about the right fit for your organization.', links: ['Srisun AI', 'Srisun Books', 'Srisun Social', 'Zedu', 'XLoan'].map((title) => ({ title, href: menuItemHref(title) })) },
  ...['Partner Program', 'Technology Partners', 'Reseller Partners', 'Integration Partners', 'Strategic Partnerships', 'Affiliate Program'].map((title) => ({ path: menuItemHref(title), title, group: 'Partners', description: `Connect with Srisun around ${title.toLowerCase()}. Tell us about your organization, the capabilities you bring and the kind of collaboration you have in mind.`, bullets: ['Share your organization and areas of expertise.', 'Describe the customers or projects you support.', 'Start a conversation with the Srisun team.'] })),
  { path: '/company/about-srisun', title: 'About Srisun', group: 'Company', description: 'Srisun builds technology for better lives and businesses, bringing consulting, software, automation, cybersecurity and digital growth capabilities together.', bullets: ['Technology shaped around real business needs.', 'A focus on useful, understandable solutions.', 'Rooted in India and open to working with organizations across locations.'] },
  { path: '/company/our-story', title: 'Our story', group: 'Company', description: 'Srisun brings people and technology together to help organizations move forward. Our work spans consulting, digital experiences, software and business services.', bullets: ['Listen to the people closest to the challenge.', 'Build solutions that are clear and useful.', 'Keep learning as needs and technology change.'] },
  { path: '/company/brand-guidelines', title: 'Brand guidelines', group: 'Company', description: 'For approved use of Srisun names, logos and brand assets, contact the Srisun team to request the current guidelines.', bullets: ['Use official Srisun assets supplied by the team.', 'Keep the logo colors, proportions and clear space intact.', 'Request approval before using the brand in a public or partner campaign.'], cta: 'Request Brand Guidelines' },
  ...[
    ['Announcements Hub','/resources/announcements','Company news and updates from Srisun.'],['Blog','/resources/blog','Perspectives on technology, digital services and better ways of working.'],['Shri (AI Agent)','/resources/shri-ai-agent','Learn about Shri, Srisun’s AI agent initiative.'],['Newsletter','/resources/newsletter','Company news and updates from Srisun. Contact our team to join the mailing list.'],['The Long Game','/resources/the-long-game','Ideas on building useful technology and long-term digital capability.'],['Knowledge Base','/resources/knowledge-base','Support for Srisun products and services. Contact our team and we will help.'],['Concierge','/resources/concierge','Tell us what you need help with and we will direct your enquiry.']
  ].map(([title,path,description]) => ({ path,title,group:'Resources',description, cta:title === 'Blog' || title === 'Announcements Hub' ? 'Contact Us for Updates' : 'Ask Srisun' })),
  ...[['Srisun AI','Explore AI and automation opportunities with the Srisun team. Discuss use cases, data and the controls your organization needs.'],['Srisun Books','Request a walkthrough of Srisun Books and its current availability.'],['Srisun Social','Srisun Social supports your organization’s communication with customers, members and students.'],['Zedu','Zedu supports schools, colleges and training teams. Share your requirements to arrange a walkthrough.'],['XLoan','Request a walkthrough of XLoan and its current availability.']].map(([title,description]) => ({ path:menuItemHref(title),title,group:'Products',description, cta:'Ask About This Product' })),
  ...['Security','Compliance','IPR Complaints','Terms of Service','Privacy Policy','Refund Policy','Trademark Policy','Cookie Policy','GDPR Compliance','Abuse Policy'].map((title) => ({ path:menuItemHref(title),title,group:'Policies',description:`Srisun’s ${title.toLowerCase()}. For questions or requests about this policy, contact our team.`,cta:`Contact Us About ${title}` }))
];

// WebP photos ship at 1600px and 800px wide; the browser picks the size it needs.
const srcSetFor = (src) => `${src.replace(/\.webp$/, '-800.webp')} 800w, ${src} 1600w`;

// True when the build wrote this page's head tags (canonical, description, structured data).
const headPrerenderedFor = (pathname) => {
  const href = typeof document !== 'undefined' && document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const trim = (value) => value.replace(/\/+$/, '') || '/';
  return Boolean(href) && trim(new URL(href, window.location.origin).pathname) === trim(pathname);
};

// Search descriptions (shown in Google results), written per page and kept under 160 characters.
const seoDescriptions = {
  '/services/sales': 'Sales process setup from Srisun: lead capture, pipelines, follow-up reminders, quotes and sales reports, so every enquiry gets a timely reply.',
  '/services/erp': 'ERP consulting and implementation for Indian businesses: connect finance, inventory, sales and HR in one system, planned around how you already work.',
  '/services/legal': 'Website policies, agreement templates and compliance checklists for your business, prepared by Srisun and kept up to date as your services change.',
  '/services/marketing': 'Digital marketing from Srisun: Google and Meta ads, social media, email and WhatsApp campaigns, with clear reports on spend and enquiries.',
  '/services/crm': 'CRM setup and customisation by Srisun: customer records, pipelines, reminders and WhatsApp logging, so your team always knows the next step.',
  '/services/forms': 'Online admission, registration, feedback and payment forms that work on any phone and send each response to email, a sheet or your CRM.',
  '/services/booking': 'Online booking for appointments, classes and services, with SMS and WhatsApp reminders, advance payments and staff calendars, set up by Srisun.',
  '/services/domain-server': 'Domain registration, web hosting, business email, SSL and backups, set up and managed by Srisun so your website and inbox stay online.',
  '/solutions/tech-consulting': 'Independent technology consulting across India: strategy, IT assessments, cloud, data, AI readiness and cybersecurity, with roadmaps you can act on.',
  '/solutions/web-and-e-commerce': 'Websites and online stores for businesses across India: custom design, WooCommerce and Shopify, payment integrations, SEO-ready builds and support.',
  '/industries/education': 'Technology for schools, colleges and training institutes: online admissions, fee payments, WhatsApp updates for parents and websites staff can edit.',
  '/industries/finance': 'Software, automation and security for lenders and financial firms: digital loan applications, repayment reminders and security reviews.',
  '/industries/retail': 'Online stores, stock control and WhatsApp marketing for shops and retail brands, with UPI payments and one view of stock across every channel.',
  '/industries/manufacturing': 'ERP, shop-floor apps and production dashboards that connect purchase, stock, quality checks and dispatch for manufacturers across India.',
  '/industries/healthcare': 'Online appointments, visit reminders, clinic websites and patient data protection for clinics, hospitals and diagnostic centres.',
  '/industries/professional-services': 'Client CRM, online onboarding, billing workflows and meeting booking for consultants, agencies, CA firms and law practices.',
  '/industries/smes': 'Practical technology for small and medium businesses: websites, simple ERP, local marketing and basic security, introduced one step at a time.',
  '/products/srisun-books': 'Request a walkthrough of Srisun Books. Our team will show you how it fits your process and confirm the current features and availability.',
  '/products/xloan': 'XLoan supports lending workflows from first enquiry to final decision. Request a walkthrough to see the current features and availability.',
  '/resources/announcements': 'Company news, product updates and announcements from Srisun. Contact our team if you would like recent updates shared with you.',
  '/resources/concierge': 'Not sure where to start? Tell Srisun what you need, from a website to automation or security, and we will point you to the right team.',
  '/resources/shri-ai-agent': 'Shri is Srisun’s work on AI agents that answer questions, find information and pass requests to the right person. Ask what it can do today.',
  '/resources/the-long-game': 'Thoughts from Srisun on building useful technology and the long-term digital skills organisations need to keep it working well.',
  '/services': 'Srisun services for growing organisations: sales setup, ERP, CRM, marketing, online forms, booking, legal paperwork, domains and hosting.',
  '/solutions': 'Technology consulting, websites and online stores, custom software, AI and automation, cybersecurity, messaging and digital growth from Srisun.',
  '/industries': 'How Srisun helps education, finance, retail, manufacturing, healthcare, professional services and SMEs with practical, sector-specific technology.',
  '/clients': 'The schools, colleges and businesses that work with Srisun, along with our training programme and ways to introduce new customers.',
  '/partners': 'Work with Srisun as a technology, reseller, integration, strategic or affiliate partner on projects for organisations across India.',
  '/products': 'Software products from Srisun: Srisun AI, Srisun Books, Srisun Social, Zedu and XLoan. Request a walkthrough to see which one suits you.',
  '/partners/partner-program': 'The Srisun Partner Program is for organisations that want to build, sell or deliver technology with us. See who it suits and how to apply.',
  '/partners/technology-partners': 'Partner with Srisun if your platform, AI product or security tool could help our customers. See what to share and how partnerships start.',
  '/partners/reseller-partners': 'Offer Srisun websites, software, AI and security services to your own business customers. See who the reseller programme suits.',
  '/partners/integration-partners': 'For API, integration and data providers whose products help Srisun clients connect their systems. See what to share and how to start.',
  '/partners/strategic-partnerships': 'Long-term partnerships with institutions and organisations planning larger technology programmes with Srisun over several years.',
  '/partners/affiliate-program': 'Know a business that needs a website, software or security help? Introduce them to Srisun through our affiliate programme.',
  '/company/about-srisun': 'Srisun is a technology company in Tiruvannamalai, Tamil Nadu, offering consulting, software, automation, cybersecurity and digital marketing.',
  '/company/our-story': 'How Srisun grew from a small team in Tiruvannamalai into a company building websites, software and digital services for clients in India and abroad.'
};
contentPages.forEach((page) => { if (seoDescriptions[page.path]) page.description = seoDescriptions[page.path]; });

const getPageFaq = (page) => page.showcase ? showcasePages[page.showcase].faq : subpageFaq(page.path) ? subpageFaq(page.path) : page.erp ? [
    { question: 'What does ERP implementation involve?', answer: 'ERP implementation can include process discovery, system selection, configuration, data migration, integrations, testing, training and rollout. The right scope depends on your current systems and business requirements.' },
    { question: 'Can an ERP system connect finance, inventory and sales?', answer: 'Yes. An ERP platform can connect these functions through shared records and workflows. Srisun can help map your requirements and plan integrations around the systems you use.' },
    { question: 'Does Srisun support ERP projects across India?', answer: 'Srisun is based in Tamil Nadu and can discuss ERP consulting, implementation and support requirements with businesses across India.' }
  ] : [
  { question: `What does Srisun cover in ${page.title}?`, answer: page.description },
  { question: 'How do I start a conversation with Srisun?', answer: 'Use the Contact Us page to share your goals, current context and the best way to reach you.' },
  { question: 'Can the work be shaped around our needs?', answer: 'Share your requirements with the Srisun team so the scope and next steps can be discussed in context.' }
];

function ContentPage({ page }) {
  const isSearch = page.path === '/search';
  const isGroupLanding = ['/services', '/solutions', '/industries', '/clients', '/partners', '/products'].includes(page.path);
  const query = new URLSearchParams(window.location.search).get('q')?.trim() || '';
  const searchResults = contentPages.filter((entry) => `${entry.title} ${entry.group} ${entry.description}`.toLowerCase().includes(query.toLowerCase()));
  const primary = page.links?.[0]?.href || '/contact-us';
  return (
    <main className="content-page">
      <section className="content-page-hero">
        <div className="content-page-inner">
          <nav className="content-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><ChevronRight size={14} />{isSearch || isGroupLanding ? <span>{isSearch ? 'Search' : page.title}</span> : <><a href={page.group === 'Services' ? '/services' : page.group === 'Solutions' ? '/solutions' : page.group === 'Industries' ? '/industries' : page.group === 'Partners' ? '/partners' : page.group === 'Clients' ? '/clients' : page.group === 'Products' ? '/products' : '/'}>{page.group}</a><ChevronRight size={14} /><span>{page.title}</span></>}</nav>
          <div className="content-page-hero-grid"><div><span className="content-eyebrow"><i /> {isSearch ? 'SITE SEARCH' : page.group.toUpperCase()}</span><h1>{isSearch ? `Search${query ? `: ${query}` : ' Srisun'}` : page.title}</h1><p>{isSearch ? (query ? `Pages and topics related to “${query}”.` : 'Search Srisun services, solutions and resources.') : page.description}</p><a className="content-primary-link" href={page.cta ? '/contact-us' : primary}>{page.cta || 'Talk to Our Team'} <ChevronRight size={17} /></a></div><div className="content-hero-mark" aria-hidden="true"><img src="/assets/srisun-logo.png" alt="" /><span>Building Technology<br />for Better Lives &amp; Businesses</span></div></div>
        </div>
      </section>
      <section className="content-page-body"><div className="content-page-inner">
        {page.links?.length > 0 && <><div className="content-section-heading"><span>EXPLORE</span><h2>Find the right place to start</h2></div><div className="content-link-grid">{page.links.map((link,index) => <a className="content-link-card" href={link.href} key={link.title}><span className={`content-card-index content-index-${index%4}`}>0{index+1}</span><h3>{link.title}</h3><p>Explore {link.title.toLowerCase()} and see how it connects to your organization’s goals.</p><span className="content-card-action">Explore <ChevronRight size={15}/></span></a>)}</div></>}
        {page.stories && <><div className="content-section-heading"><span>OUR CLIENTS</span><h2>Organizations moving forward</h2></div><div className="content-client-grid">{[['Vivekanandha Higher Secondary School, Pondicherry','/assets/clients/1.jpg'],['Annapurna College of Film and Media','/assets/clients/2.jpg'],['The Green Mount International School','/assets/clients/3.jpg'],['Arunai Engineering College','/assets/clients/4.jpg'],['Aakhaash Institute of Media Studies','/assets/clients/5.jpg'],['Sri Rangapoopathi Educational Charitable Trust','/assets/clients/6.jpg'],['TMS Vidyalaya Matriculation School','/assets/clients/7.jpg'],['Vijay Vidya','/assets/clients/8.jpg']].map(([name,image])=><article key={name}><img src={image} alt="" loading="lazy"/><h3>{name}</h3></article>)}</div></>}
        {page.bullets?.length > 0 && <div className="content-detail-grid"><article className="content-detail-main"><div className="content-section-heading"><span>HOW WE CAN HELP</span><h2>Start with what you need</h2></div><p>{page.description}</p><ul>{page.bullets.map((item)=><li key={item}><span className="content-check"><ChevronRight size={15}/></span>{item}</li>)}</ul></article><aside className="content-detail-aside"><span className="content-aside-symbol"><Sparkles size={22}/></span><h3>Let’s talk about your goals.</h3><p>Share your context and the Srisun team can help identify a useful next step.</p><a href="/contact-us">Contact Us <ChevronRight size={15}/></a></aside></div>}
        {isSearch && <div className="content-search-results">{searchResults.length ? searchResults.map((result)=><a href={result.path} key={result.path}><span>{result.group}</span><h2>{result.title}</h2><p>{result.description}</p><ChevronRight size={18}/></a>) : <p>No pages match this search yet. <a href="/contact-us">Contact our team</a> for help.</p>}</div>}
        {!isSearch && page.group !== 'Policies' && <section className="content-faq" aria-labelledby="content-faq-title"><div className="content-section-heading"><span>ANSWERS</span><h2 id="content-faq-title">Questions about {page.title.toLowerCase()}</h2></div><div className="content-faq-list">{getPageFaq(page).map((faq) => <details key={faq.question}><summary>{faq.question}<ChevronDown size={17}/></summary><p>{faq.answer}</p></details>)}</div></section>}
      </div></section>
    </main>
  );
}

const erpMicrosite = {
  theme: 'erp', label: 'ERP', home: '/services/erp',
  nav: [['Overview', '#erp-top'], ['Capabilities', '#erp-capabilities'], ['Infrastructure', '#erp-stack'], ['Industries', '#erp-industries'], ['Integrations', '#erp-integrations'], ['FAQ', '#erp-faq']],
  cta: ['Request a Demo', '/contact-us', 'Demo'],
  footerKicker: 'READY TO MAKE WORK FLOW?', footerTitle: 'Let’s plan your ERP project.', footerText: 'Talk to us about your ERP goals, the systems you use today and the next steps.', footerButton: 'Start a Conversation',
  footerLinks: ['ERP', [['Capabilities', '#erp-capabilities'], ['Infrastructure', '#erp-stack'], ['Industries', '#erp-industries'], ['Integrations', '#erp-integrations']]]
};

// Page-specific header used by the ERP, Tech Consulting and Web & E-Commerce pages.
function MicrositeHeader({ site }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={`erp-site-header micro-${site.theme}`}>
      <div className="erp-site-header-inner">
        <a href={site.home} className="erp-brand" aria-label={`Srisun ${site.label} home`}><img src="/assets/srisun-logo.png" alt="Srisun" /><span>{site.label}</span></a>
        <nav className={menuOpen ? 'erp-nav open' : 'erp-nav'} aria-label={`${site.label} page navigation`}>
          {site.nav.map(([name, href]) => <a key={name} href={href} onClick={() => setMenuOpen(false)}>{name}</a>)}
          <a className="erp-nav-home" href="/">Srisun Home</a>
        </nav>
        <div className="erp-header-actions">
          <a className="erp-header-signin" href="/">Srisun Home</a>
          <a className="erp-header-demo" href={site.cta[1]}><span className="ms-cta-long">{site.cta[0]}</span><span className="ms-cta-short">{site.cta[2]}</span> <ChevronRight size={14} /></a>
          <button type="button" className="erp-menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Close page menu' : 'Open page menu'} aria-expanded={menuOpen}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
    </header>
  );
}

function MicrositeFooter({ site }) {
  const [columnTitle, columnLinks] = site.footerLinks;
  return (
    <footer className={`erp-site-footer micro-${site.theme}`}>
      <div className="content-page-inner">
        <div className="erp-footer-cta"><div><span className="erp-section-kicker">{site.footerKicker}</span><h2>{site.footerTitle}</h2><p>{site.footerText}</p></div><a href="/contact-us">{site.footerButton} <ChevronRight size={17} /></a></div>
        <div className="erp-footer-links">
          <a href={site.home} className="erp-footer-brand"><img src="/assets/srisun-logo.png" alt="Srisun" /><span>{site.label}</span><small>Building technology for better lives and businesses.</small></a>
          <div><strong>{columnTitle}</strong>{columnLinks.map(([name, href]) => <a key={name} href={href}>{name}</a>)}</div>
          <div><strong>Explore Srisun</strong><a href="/services">Services</a><a href="/solutions">Solutions</a><a href="/clients/stories">Client stories</a><a href="/careers">Careers</a></div>
          <div><strong>Contact</strong><a href="tel:+918883388162">88833 88162</a><a href="mailto:hello@srisun.ai">hello@srisun.ai</a><a href="/contact-us">Contact Us <ChevronRight size={13} /></a></div>
        </div>
        <div className="erp-footer-legal"><span>© 2026, Srisun. All rights reserved.</span><div><a href="/legal/privacy-policy">Privacy</a><a href="/legal/terms-of-service">Terms</a><a href="/legal/security">Security</a></div></div>
      </div>
    </footer>
  );
}

function ErpPage() {
  const modules = [
    ['Finance and accounting', 'Invoicing, payables, receivables and reporting kept together, so the numbers always match.', '01'],
    ['Inventory and procurement', 'Stock, purchasing and transfers tracked across teams, locations and suppliers.', '02'],
    ['Sales and order workflows', 'Enquiries, orders, delivery and customer updates handled in one process.', '03'],
    ['People and payroll', 'Employee records, approvals and routine HR tasks in one place.', '04'],
    ['Production and projects', 'Resources, work in progress, delivery schedules and running costs planned together.', '05'],
    ['Analytics and reporting', 'Daily business activity turned into reports managers can act on.', '06']
  ];
  const steps = [
    ['01', 'Understand your workflows', 'We map the processes, systems and reports your ERP project needs to cover.'],
    ['02', 'Shape the right solution', 'We compare suitable platforms, integrations and rollout options against your requirements.'],
    ['03', 'Implement and connect', 'We configure the workflows, move your data, connect your systems and test everything.'],
    ['04', 'Support adoption', 'We train your teams, fine-tune the workflows and plan support after launch.']
  ];
  return (
    <main className="erp-page" id="erp-top">
      <section className="erp-hero">
        <div className="content-page-inner">
          <nav className="content-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><ChevronRight size={14} /><a href="/services">Services</a><ChevronRight size={14} /><span>ERP</span></nav>
          <div className="erp-hero-grid">
            <div className="erp-hero-copy">
              <span className="erp-eyebrow"><i /> ERP CONSULTING &amp; IMPLEMENTATION</span>
              <h1>Run your whole business from one system.</h1>
              <p>Connect finance, stock, sales and HR with an ERP set up around the way your business already works.</p>
              <div className="erp-hero-actions"><a className="erp-primary" href="/contact-us">Talk to an ERP Specialist <ChevronRight size={17} /></a><a className="erp-secondary" href="#erp-capabilities">Explore ERP Capabilities <ChevronRight size={16} /></a></div>
              <div className="erp-hero-proof"><span><b>01</b> Map your current processes</span><span><b>02</b> Plan a connected system</span></div>
            </div>
            <div className="erp-dashboard" aria-label="Illustration of a connected ERP operations dashboard" role="img">
              <div className="erp-dashboard-top"><span className="erp-dots"><i /><i /><i /></span><span>Operations overview</span><span className="erp-dashboard-profile">SR</span></div>
              <div className="erp-dashboard-body">
                <aside className="erp-dashboard-rail"><span className="selected"><Boxes size={17}/></span><span><Landmark size={17}/></span><span><Store size={17}/></span><span><Factory size={17}/></span></aside>
                <div className="erp-dashboard-content">
                  <div className="erp-dashboard-heading"><div><small>BUSINESS WORKSPACE</small><strong>Good morning, team</strong></div><span>Updated just now</span></div>
                  <div className="erp-metric-grid"><div><small>Revenue</small><strong>₹ 24.8L</strong><em>↑ 12.4%</em></div><div><small>Open orders</small><strong>1,284</strong><em>On track</em></div><div><small>Stock health</small><strong>92.6%</strong><em>Across locations</em></div></div>
                  <div className="erp-chart-card"><div><strong>Revenue overview</strong><small>Connected financial snapshot</small></div><div className="erp-chart-bars" aria-hidden="true">{[34,48,41,65,52,77,58,88,70,96,76,100].map((height,index)=><i style={{'--bar-height':`${height}%`}} key={index}/>)}</div><div className="erp-chart-labels"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div></div>
                  <div className="erp-dashboard-bottom"><span><i className="erp-status-dot"/>Finance synced</span><span><i className="erp-status-dot yellow"/>3 approvals waiting</span><span><i className="erp-status-dot blue"/>Inventory updated</span></div>
                </div>
              </div>
              <div className="erp-floating-card"><span><Sparkles size={15}/></span><div><small>Connected operations</small><b>One clearer view of work</b></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="erp-intro-section">
        <div className="content-page-inner erp-intro-grid"><div><span className="erp-section-kicker">A PRACTICAL ERP JOURNEY</span><h2>When every department uses a different system.</h2></div><p>An ERP project is more than installing software. It brings your core processes, information and teams together. We help you decide what needs to connect, choose an approach that suits you and prepare your staff for the change.</p></div>
        <div className="content-page-inner erp-value-grid"><article><span className="erp-value-icon red"><Globe size={22}/></span><h3>One shared view</h3><p>Less repeated data entry, and the same up-to-date information for every team.</p></article><article><span className="erp-value-icon yellow"><Boxes size={22}/></span><h3>Workflows that fit</h3><p>A system set up around your approvals, roles, locations and ways of working.</p></article><article><span className="erp-value-icon green"><ShieldCheck size={22}/></span><h3>Room to grow</h3><p>Integrations and features planned so they can change as your business does.</p></article></div>
      </section>

      <section className="erp-modules-section" id="erp-capabilities">
        <div className="content-page-inner"><div className="erp-section-heading"><span className="erp-section-kicker">ERP CAPABILITIES</span><h2>Connect each part of your business.</h2><p>Start with the areas that matter most, then bring in the rest step by step.</p></div><div className="erp-modules-grid">{modules.map(([title,description,number],index)=><article className={`erp-module-card erp-module-${index+1}`} key={title}><span className="erp-module-number">{number}</span><div className="erp-module-icon">{index===0?<Landmark size={22}/>:index===1?<Boxes size={22}/>:index===2?<Store size={22}/>:index===3?<BriefcaseBusiness size={22}/>:index===4?<Factory size={22}/>:<Sparkles size={22}/>}</div><h3>{title}</h3><p>{description}</p><a href="/contact-us">Discuss This Capability <ChevronRight size={15}/></a></article>)}</div></div>
      </section>

      <section className="erp-stack-section" id="erp-stack"><div className="content-page-inner erp-stack-grid"><div className="erp-stack-copy"><span className="erp-section-kicker">A CONNECTED ERP STACK</span><h2>One foundation.<br/>Many moving parts.</h2><p>ERP works best when your main applications, data and infrastructure work together. We help plan the integrations and controls that suit your organisation.</p><ul><li><span>01</span> Choose an ERP platform around your processes</li><li><span>02</span> Connect the systems your teams already use</li><li><span>03</span> Plan access, data and security together</li><li><span>04</span> Roll out in clear, manageable stages</li></ul><a href="/contact-us">Discuss Your ERP Stack <ChevronRight size={15}/></a></div><div className="erp-stack-visual" aria-label="Layered ERP technology stack illustration" role="img"><div className="erp-stack-orbit"/><div className="erp-layer layer-one"><span>BUSINESS APPLICATIONS</span><Boxes size={20}/></div><div className="erp-layer layer-two"><span>CONNECTED DATA</span><Globe size={20}/></div><div className="erp-layer layer-three"><span>WORKFLOWS &amp; AUTOMATION</span><Sparkles size={20}/></div><div className="erp-layer layer-four"><span>SECURE INFRASTRUCTURE</span><ShieldCheck size={20}/></div><div className="erp-stack-caption"><i/>A solid base for connected operations</div></div></div></section>

      <section className="erp-ai-section"><div className="content-page-inner erp-ai-grid"><div className="erp-ai-visual"><div className="erp-ai-window"><div className="erp-ai-window-bar"><i/><i/><i/><span>Operations assistant</span></div><div className="erp-ai-question">Show me orders that may need attention this week</div><div className="erp-ai-response"><span><Sparkles size={16}/></span><div><small>WORKFLOW INSIGHT</small><b>12 orders may need follow-up</b><p>3 are waiting for approval and 9 are scheduled for dispatch.</p></div></div><div className="erp-ai-progress"><i/><i/><i/></div></div><div className="erp-ai-glow"/></div><div className="erp-ai-copy"><span className="erp-section-kicker">AI IN ERP</span><h2>Use AI where your team does the work.</h2><p>See where automation and AI can help with daily ERP work, from summarising activity to flagging problems and helping staff find information faster.</p><a href="/contact-us">Explore AI Opportunities <ChevronRight size={16}/></a></div></div></section>

      <section className="erp-industries-section" id="erp-industries"><div className="content-page-inner"><div className="erp-section-heading"><span className="erp-section-kicker">BUILT AROUND YOUR OPERATIONS</span><h2>ERP planned around how your industry works.</h2><p>Every organisation works in its own way. We start with the processes, teams and customer needs that matter most in your sector.</p></div><div className="erp-industry-grid">{[['Manufacturing','Production planning, material movement and quality checks.',Factory],['Retail','Stock levels, orders and connected store operations.',Store],['Distribution','Purchasing, stock movement and delivery across locations.',Boxes],['Education','Finance, procurement and administration across institutions.',GraduationCap]].map(([title,description,Icon],index)=><article key={title}><div className="erp-industry-image erp-industry-icon" aria-hidden="true"><Icon size={48} strokeWidth={1.4}/><span>0{index+1}</span></div><h3>{title}</h3><p>{description}</p><a href="/contact-us">Talk About Your Requirements <ChevronRight size={14}/></a></article>)}</div></div></section>

      <section className="erp-scale-section"><div className="content-page-inner erp-scale-inner"><div className="erp-scale-copy"><span className="erp-section-kicker">READY FOR WHAT COMES NEXT</span><h2>A system that can grow starts with a careful plan.</h2><p>We design for the business you run today, while leaving room for more users, locations, data and processes later on.</p></div><div className="erp-scale-globe" aria-hidden="true"><div className="erp-globe-lines"/><span>ONE CONNECTED<br/>BUSINESS VIEW</span><i className="erp-globe-node node-a"/><i className="erp-globe-node node-b"/><i className="erp-globe-node node-c"/></div><div className="erp-scale-points"><article><strong>People</strong><span>Clear roles and access</span></article><article><strong>Processes</strong><span>Workflows that can change with you</span></article><article><strong>Platforms</strong><span>Only the connections you need</span></article><article><strong>Performance</strong><span>Room for new business needs</span></article></div></div></section>

      <section className="erp-trust-section"><div className="content-page-inner erp-trust-grid"><article><span className="erp-trust-icon red"><ShieldCheck size={21}/></span><div><h3>Security considered from the start</h3><p>Permissions, data handling, backups and controls are planned as part of the ERP project.</p><a href="/legal/security">Explore Security <ChevronRight size={14}/></a></div></article><article><span className="erp-trust-icon blue"><Globe size={21}/></span><div><h3>Your business data stays yours</h3><p>We talk through data ownership, privacy and the responsibilities that come with the platform you choose.</p><a href="/legal/privacy-policy">Read Our Privacy Policy <ChevronRight size={14}/></a></div></article></div></section>

      <section className="erp-integrations-section" id="erp-integrations"><div className="content-page-inner"><div className="erp-section-heading erp-integrations-heading"><span className="erp-section-kicker">INTEGRATIONS</span><h2>Don’t forget the systems around your ERP.</h2><p>We map the data and handovers that link your ERP to the rest of your business.</p></div><div className="erp-integration-map"><div className="erp-integration-node node-center"><Boxes size={25}/><strong>ERP</strong><small>Shared operations</small></div>{[['Payments','₹'],['E-commerce','EC'],['Banking','BK'],['Customer tools','CRM'],['Shipping','SH'],['Reporting','BI'],['Communication','CM'],['Inventory','IN']].map(([title,mark],index)=><div className={`erp-integration-node node-${index+1}`} key={title}><span>{mark}</span><strong>{title}</strong></div>)}<div className="erp-map-line line-1"/><div className="erp-map-line line-2"/><div className="erp-map-line line-3"/><div className="erp-map-line line-4"/><div className="erp-map-line line-5"/><div className="erp-map-line line-6"/><div className="erp-map-line line-7"/><div className="erp-map-line line-8"/></div></div></section>

      <section className="erp-support-section"><div className="content-page-inner"><div className="erp-section-heading"><span className="erp-section-kicker">SUPPORT THROUGH THE JOURNEY</span><h2>Making your ERP plan work in practice.</h2></div><div className="erp-support-grid"><article><div className="erp-support-photo"><img src="/assets/client-story-studio.webp" alt="Teams collaborating on business technology" loading="lazy"/></div><div><span>ERP CONSULTING</span><h3>Experienced help from first discussion to rollout.</h3><p>Help with requirements, choosing a platform, planning the rollout, moving data and preparing your team.</p><a href="/contact-us">Talk to Our Team <ChevronRight size={14}/></a></div></article><article><div className="erp-support-photo support-photo-alt"><img src="/assets/careers-team.webp" alt="Srisun team working together" loading="lazy"/></div><div><span>ONGOING SUPPORT</span><h3>Keep improving after launch.</h3><p>We review what is working, fix gaps and adjust your ERP workflows as priorities change.</p><a href="/contact-us">Plan Your Next Step <ChevronRight size={14}/></a></div></article></div></div></section>

      <section className="erp-process-section"><div className="content-page-inner"><div className="erp-section-heading"><span className="erp-section-kicker">HOW WE WORK</span><h2>From your first question to launch day.</h2><p>Clear stages keep the project focused on your business needs throughout.</p></div><div className="erp-process-grid">{steps.map(([number,title,description])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

      <section className="erp-stats-section"><div className="content-page-inner"><div className="erp-stats-heading"><span className="erp-section-kicker">MADE FOR THE WAY YOU WORK</span><h2>Bring your operations together in one system.</h2><p>Plan a system that suits your people, your processes and the pace you want to move at.</p><a href="/contact-us">Start a Conversation <ChevronRight size={15}/></a></div><div className="erp-stats-grid"><div><strong>01</strong><span>Clear discovery</span></div><div><strong>02</strong><span>Connected workflows</span></div><div><strong>03</strong><span>Practical rollout</span></div><div><strong>04</strong><span>Ongoing improvement</span></div></div></div></section>


      <section className="erp-cta-section"><div className="content-page-inner erp-cta-card"><div><span className="erp-section-kicker">START WITH A CONVERSATION</span><h2>Planning an ERP project?</h2><p>Tell us where work gets stuck between teams or systems, and we will suggest practical next steps for your organisation.</p></div><a href="/contact-us">Talk to Srisun <ChevronRight size={17}/></a></div></section>

      <section className="erp-faq-section" id="erp-faq"><div className="content-page-inner"><div className="erp-section-heading"><span className="erp-section-kicker">ERP FAQ</span><h2>Common questions about ERP.</h2></div><div className="content-faq-list">{getPageFaq({title:'ERP',description:'ERP consulting, implementation and integration support from Srisun.'}).slice(0,3).map((faq)=><details key={faq.question}><summary>{faq.question}<ChevronDown size={17}/></summary><p>{faq.answer}</p></details>)}</div></div></section>
    </main>
  );
}

const showcaseNav = [['Overview', '#sc-top'], ['Approach', '#sc-approach'], ['Services', '#sc-services'], ['Process', '#sc-process'], ['Clients', '#sc-stories'], ['FAQ', '#sc-faq']];

const techConsultingPage = {
  theme: 'consulting',
  seoTitle: 'Technology Consulting Services in India | Srisun',
  micro: {
    theme: 'consulting', label: 'Consulting', home: '/solutions/tech-consulting', nav: showcaseNav,
    cta: ['Book a Consultation', '/contact-us', 'Book a Call'],
    footerKicker: 'NOT SURE WHERE TO START?', footerTitle: 'Let’s find your next step.', footerText: 'Tell us what you are trying to solve, and we will suggest a practical way forward.', footerButton: 'Request a Consultation',
    footerLinks: ['Tech Consulting', [['Approach', '#sc-approach'], ['Services', '#sc-services'], ['Process', '#sc-process'], ['FAQ', '#sc-faq']]]
  },
  breadcrumb: 'Tech Consulting',
  eyebrow: 'TECHNOLOGY CONSULTING, GROUNDED IN YOUR BUSINESS',
  headline: 'Clear technology decisions for',
  words: ['Strategy', 'Cloud', 'Data', 'AI', 'Security'],
  intro: 'We help organisations across India decide what to build, what to buy and what to change, and we stay involved until it works.',
  primary: ['Book a Consultation', '/contact-us'],
  secondary: ['See How We Work', '#sc-process'],
  logosCaption: 'TRUSTED BY SCHOOLS, COLLEGES AND GROWING ORGANISATIONS',
  approachTitle: 'The Srisun approach',
  advantages: [
    [Compass, 'red', 'Business first, technology second', 'We begin with your goals, your constraints and the people involved, and only then choose the tools.'],
    [Layers, 'yellow', 'Vendor-neutral advice', 'We recommend what fits your budget and existing systems, whether that is off-the-shelf, custom-built or a mix.'],
    [Route, 'green', 'Roadmaps you can act on', 'You leave with clear priorities, owners, effort estimates and timelines, not just a presentation.'],
    [ShieldCheck, 'blue', 'Secure by design', 'Security, data privacy and compliance are built into the plan from the start.']
  ],
  chipsLabel: 'WAYS TO WORK WITH US',
  chips: ['Fixed-scope assessments', 'Ongoing advisory', 'Project-based delivery', 'On-site or remote'],
  servicesTitle: 'Consulting at every stage of growth',
  services: [
    { tab: 'Plan & Strategise', items: [
      [Lightbulb, 'Digital transformation strategy', 'Understand where you are today, decide where you want to be and plan realistic steps to get there.', '/solutions/digital-growth'],
      [ClipboardCheck, 'IT assessment & audit', 'A review of your infrastructure, software, costs and risks, with findings ranked by priority.', '/contact-us'],
      [Search, 'Technology selection', 'ERP, CRM, LMS and cloud platforms compared against your actual requirements before you commit.', '/services/erp']
    ] },
    { tab: 'Modernise & Build', items: [
      [Cloud, 'Cloud adoption & migration', 'A planned move to the cloud with as little disruption to daily work as possible.', '/contact-us'],
      [Workflow, 'Systems integration', 'The tools you already use, connected so nobody has to type the same data twice.', '/solutions/software-and-apps'],
      [Bot, 'AI & automation readiness', 'The processes worth automating identified, and your data made ready first.', '/solutions/ai-and-automation']
    ] },
    { tab: 'Protect & Optimise', items: [
      [ShieldCheck, 'Cybersecurity consulting', 'Weak points found, practical policies set and everyday risk reduced.', '/solutions/cybersecurity'],
      [Database, 'Data & analytics strategy', 'Agree what data to collect, how to manage it and which reports should guide decisions.', '/contact-us'],
      [Handshake, 'Ongoing technology advisory', 'Ongoing support with reviews, vendor management and planning the next steps.', '/contact-us']
    ] }
  ],
  processTitle: 'From the first conversation to real results',
  processIntro: 'We work through each stage with you, so every recommendation stays tied to what your organisation needs.',
  steps: [
    [Users, '01', 'Discover', 'Workshops and conversations to understand your goals, problems, people and current systems.'],
    [Search, '02', 'Assess', 'We look at gaps, risks and opportunities, and compare the options that could work for you.'],
    [Route, '03', 'Recommend', 'A prioritised roadmap showing effort, timelines, quick wins and the decisions you need to make.'],
    [Rocket, '04', 'Enable', 'We support the rollout, prepare your teams and review the results so the plan keeps working.']
  ],
  storiesTitle: 'Organisations that grow with Srisun',
  storyText: 'An organisation we work with. Ask us about the technology work we do for organisations like yours.',
  faqTitle: 'Questions about tech consulting',
  faq: [
    { question: 'How long does a technology consulting engagement take?', answer: 'That depends on the scope. A focused assessment can take a few weeks, while advisory support may continue for longer. We agree the scope and timeline with you before any work starts.' },
    { question: 'Do you only recommend Srisun products?', answer: 'No. We recommend what fits your goals, budget and existing systems. We only suggest a Srisun product when it is genuinely the right fit.' },
    { question: 'Can Srisun help implement what you recommend?', answer: 'Yes. We can handle delivery, integration and training, or work alongside the vendors and teams you already have.' },
    { question: 'Do you work with organisations outside Tamil Nadu?', answer: 'Yes. We work with organisations across India, remotely or on-site, depending on what the work needs.' }
  ]
};

const webCommercePage = {
  theme: 'commerce',
  seoTitle: 'Website & E-Commerce Development in India | Srisun',
  micro: {
    theme: 'commerce', label: 'Web', home: '/solutions/web-and-e-commerce', nav: showcaseNav,
    cta: ['Get a Quote', '/contact-us', 'Get a Quote'],
    footerKicker: 'READY TO BUILD YOUR WEBSITE?', footerTitle: 'Let’s build a website that sells.', footerText: 'Tell us what you sell and who buys it, and we will suggest the right website or store for your budget.', footerButton: 'Talk to Our Experts',
    footerLinks: ['Web & E-Commerce', [['Why Srisun', '#sc-approach'], ['Services', '#sc-services'], ['Process', '#sc-process'], ['FAQ', '#sc-faq']]]
  },
  breadcrumb: 'Web & E-Commerce',
  eyebrow: 'WEBSITES AND ONLINE STORES FOR GROWING BUSINESSES',
  headline: 'Digital stores that sell',
  words: ['Fashion', 'Groceries', 'Jewellery', 'Courses', 'Services'],
  intro: 'We design and build websites and online stores for businesses across India, and help you run them after launch.',
  primary: ['Get Your Website', '/contact-us'],
  secondary: ['See Our Process', '#sc-process'],
  logosCaption: 'TRUSTED BY SCHOOLS, COLLEGES AND BUSINESSES',
  approachTitle: 'Why build with Srisun',
  advantages: [
    [Palette, 'red', 'Designed for your brand', 'Each layout is based on your products and customers, not a ready-made template.'],
    [Smartphone, 'yellow', 'Mobile first', 'Most buyers shop on their phones, so we design for small screens first.'],
    [CreditCard, 'green', 'Payments that work', 'UPI, cards and wallets, with a checkout buyers feel safe using.'],
    [Search, 'blue', 'Ready for Google', 'Clean structure, fast pages and the basics that help search engines find you.']
  ],
  chipsLabel: 'PLATFORMS WE BUILD ON',
  chips: ['WordPress', 'WooCommerce', 'Shopify', 'Custom builds'],
  servicesTitle: 'Everything your website needs',
  services: [
    { tab: 'Build', items: [
      [Monitor, 'Business websites', 'Fast, mobile-friendly websites for schools, clinics, shops and service firms.', '/contact-us'],
      [ShoppingCart, 'E-commerce stores', 'Online stores with product pages, cart, checkout and order tracking.', '/contact-us'],
      [Rocket, 'Landing pages', 'Single pages for a launch, an admission season or an ad campaign.', '/solutions/digital-growth']
    ] },
    { tab: 'Design', items: [
      [PenTool, 'UI/UX design', 'Page layouts planned around what your visitors come to do.', '/contact-us'],
      [Palette, 'Website redesign', 'An older site refreshed so it looks up to date and loads faster.', '/contact-us'],
      [Layers, 'Product catalogues', 'Large product ranges sorted into categories that are easy to browse.', '/contact-us']
    ] },
    { tab: 'Grow', items: [
      [Puzzle, 'Payments & bookings', 'Payment gateways, appointment booking, memberships and custom modules.', '/services/booking'],
      [TrendingUp, 'SEO setup', 'Page titles, speed and structure that help customers find you on Google.', '/solutions/digital-growth'],
      [Headphones, 'Care & maintenance', 'Updates, backups, fixes and small changes once the site is live.', '/services/domain-server']
    ] }
  ],
  processTitle: 'From first call to a live website',
  processIntro: 'You approve the design before we build, and you test the site before your customers see it.',
  steps: [
    [Users, '01', 'Discover', 'We note your goals, products and customers, and the websites you like.'],
    [PenTool, '02', 'Design', 'You review the page layouts and overall look before development begins.'],
    [Monitor, '03', 'Develop', 'We build the site, connect payments and test each page.'],
    [Rocket, '04', 'Launch & grow', 'We launch, train your team and keep improving the site.']
  ],
  storiesTitle: 'Organisations that work with Srisun',
  storyText: 'An organisation we work with. Ask us about the web work we do for organisations like yours.',
  faqTitle: 'Questions about websites and stores',
  faq: [
    { question: 'How long does it take to build a website?', answer: 'That depends on the number of pages, products and features. We agree a timeline with you after our first discussion, before any work starts.' },
    { question: 'Can my team update the website after launch?', answer: 'Yes. We can build on a platform your team can edit, such as WordPress or Shopify, and show you how to make routine changes.' },
    { question: 'Do you provide domain and hosting?', answer: 'Yes. We also provide domain and server services, so your website, domain and hosting can all be managed in one place.' },
    { question: 'Do you support the website after it goes live?', answer: 'Yes. We can take care of updates, backups, fixes and new features once your site is live.' }
  ]
};

const softwareAppsPage = {
  theme: 'software',
  seoTitle: 'Custom Software & App Development in India | Srisun',
  micro: {
    theme: 'software', label: 'Software', home: '/solutions/software-and-apps', nav: showcaseNav,
    cta: ['Start a Project', '/contact-us', 'Start'],
    footerKicker: 'HAVE AN APP IDEA?', footerTitle: 'Let’s turn it into working software.', footerText: 'Tell us who will use it and what it needs to do, and we will suggest a practical first version.', footerButton: 'Start a Project',
    footerLinks: ['Software & Apps', [['Approach', '#sc-approach'], ['Services', '#sc-services'], ['Process', '#sc-process'], ['FAQ', '#sc-faq']]]
  },
  breadcrumb: 'Software & Apps',
  eyebrow: 'CUSTOM SOFTWARE AND MOBILE APPS',
  headline: 'Software built for your',
  words: ['Sales Team', 'Classrooms', 'Warehouse', 'Customers', 'Clinic'],
  intro: 'We build web apps, mobile apps and business software around the way your organisation works, and support them after launch.',
  primary: ['Discuss Your Project', '/contact-us'],
  secondary: ['See How We Work', '#sc-process'],
  logosCaption: 'TRUSTED BY SCHOOLS, COLLEGES AND GROWING ORGANISATIONS',
  approachTitle: 'How we build software',
  advantages: [
    [Users, 'red', 'Built around your process', 'Before writing any code, we map how the work is done today, so the software suits your team.'],
    [Layers, 'yellow', 'Start small, then grow', 'Launch the essential features first, then add more as you learn what users need.'],
    [Workflow, 'green', 'Works with your tools', 'Connections to the accounting, payment and messaging tools you already use.'],
    [ShieldCheck, 'blue', 'Secure from day one', 'Role-based access, backups and data protection are included from the first version.']
  ],
  chipsLabel: 'WHAT WE BUILD',
  chips: ['Web apps', 'Android & iOS apps', 'SaaS platforms', 'Internal tools'],
  servicesTitle: 'Software for each part of your business',
  services: [
    { tab: 'Web & SaaS', items: [
      [Monitor, 'Custom web applications', 'Portals, dashboards and tools your team and customers use in a web browser.', '/contact-us'],
      [Cloud, 'SaaS products', 'Multi-user platforms with subscriptions, roles and admin controls.', '/contact-us'],
      [Database, 'Admin dashboards', 'Reports and controls that show what is happening across your business.', '/contact-us']
    ] },
    { tab: 'Mobile Apps', items: [
      [Smartphone, 'Android & iOS apps', 'Apps for customers, students or field staff, built for both platforms.', '/contact-us'],
      [MessageCircle, 'Notifications & messaging', 'Push alerts, SMS and WhatsApp updates that keep people informed.', '/solutions/business-communication'],
      [Rocket, 'App store launch', 'We prepare the store listings and handle submission to Google Play and the App Store.', '/contact-us']
    ] },
    { tab: 'Business Systems', items: [
      [Boxes, 'ERP & inventory', 'Finance, stock and orders connected in one system.', '/services/erp'],
      [Handshake, 'CRM', 'Leads, follow-ups and customer history tracked in one place.', '/services/crm'],
      [Bot, 'Automation', 'Repeated manual steps removed with workflows and AI tools.', '/solutions/ai-and-automation']
    ] }
  ],
  processTitle: 'From idea to working software',
  processIntro: 'You see working screens early and can give feedback at every stage.',
  steps: [
    [Search, '01', 'Discover', 'We list your users, their tasks and the problems the software needs to solve.'],
    [PenTool, '02', 'Design', 'You try out clickable screens before development begins.'],
    [Monitor, '03', 'Build & test', 'We build in short cycles and test each feature as soon as it is ready.'],
    [Rocket, '04', 'Launch & support', 'We go live, train your users and keep improving the software.']
  ],
  storiesTitle: 'Organisations that build with Srisun',
  storyText: 'An organisation we work with. Ask us about the software work we do for organisations like yours.',
  faqTitle: 'Questions about software and apps',
  faq: [
    { question: 'How much does custom software cost?', answer: 'That depends on the features, the number of users and the integrations needed. We give you an estimate once we understand your requirements.' },
    { question: 'Can you build apps for both Android and iOS?', answer: 'Yes. We build mobile apps for both platforms and can help you publish them on Google Play and the App Store.' },
    { question: 'Can the software connect to our existing tools?', answer: 'Yes. We can connect to accounting, payment, messaging and other tools through their APIs, where available.' },
    { question: 'Do you support the software after launch?', answer: 'Yes. We can take care of fixes, updates and new features once your software is live.' }
  ]
};

const aiAutomationPage = {
  theme: 'ai',
  seoTitle: 'AI & Automation Services in India | Srisun',
  micro: {
    theme: 'ai', label: 'AI', home: '/solutions/ai-and-automation', nav: showcaseNav,
    cta: ['Book an AI Review', '/contact-us', 'AI Review'],
    footerKicker: 'NOT SURE WHERE AI FITS?', footerTitle: 'Let’s find your first automation.', footerText: 'Tell us which tasks take up most of your team’s week, and we will suggest where to start.', footerButton: 'Book an AI Review',
    footerLinks: ['AI & Automation', [['Approach', '#sc-approach'], ['Services', '#sc-services'], ['Process', '#sc-process'], ['FAQ', '#sc-faq']]]
  },
  breadcrumb: 'AI & Automation',
  eyebrow: 'AI AGENTS, AUTOMATION AND ANALYTICS',
  headline: 'Put AI to work on your',
  words: ['Enquiries', 'Admissions', 'Invoices', 'Reports', 'Follow-ups'],
  intro: 'We find the repetitive work in your organisation and build AI agents and automated workflows to handle it, while your people stay in control.',
  primary: ['Find What to Automate', '/contact-us'],
  secondary: ['See How We Work', '#sc-process'],
  logosCaption: 'TRUSTED BY SCHOOLS, COLLEGES AND GROWING ORGANISATIONS',
  approachTitle: 'How we approach AI',
  advantages: [
    [Lightbulb, 'red', 'Start with the problem', 'We choose tasks where automation saves real time, not where AI simply sounds impressive.'],
    [Users, 'yellow', 'People stay in control', 'The AI suggests and drafts. Your team approves anything important.'],
    [Database, 'green', 'Your data, used carefully', 'We check what data each task needs, where it is kept and who can see it.'],
    [ShieldCheck, 'blue', 'Clear limits and logs', 'Every automated action is recorded, so you can see what happened and why.']
  ],
  chipsLabel: 'WHERE WE START',
  chips: ['Automation review', 'Pilot project', 'Full rollout', 'Ongoing tuning'],
  servicesTitle: 'AI and automation across your work',
  services: [
    { tab: 'AI Agents', items: [
      [Bot, 'Customer support agents', 'Answers to common questions on your website or WhatsApp, with harder ones passed to your staff.', '/solutions/business-communication'],
      [MessageCircle, 'Enquiry & lead handling', 'New enquiries answered, details collected and follow-ups booked automatically.', '/services/crm'],
      [Sparkles, 'Internal assistants', 'Staff can quickly find policies, documents and answers in your own information.', '/contact-us']
    ] },
    { tab: 'Workflow Automation', items: [
      [Workflow, 'Approval workflows', 'Requests, approvals and reminders handled without long email chains.', '/contact-us'],
      [ClipboardCheck, 'Document processing', 'Invoices, forms and applications read and entered into your system for you.', '/contact-us'],
      [Send, 'Notifications & reminders', 'Fee, payment and appointment reminders sent on time.', '/solutions/business-communication']
    ] },
    { tab: 'Analytics', items: [
      [TrendingUp, 'Dashboards & reports', 'Sales, admissions or operations in one view, updated automatically.', '/contact-us'],
      [Database, 'Data cleanup & setup', 'Scattered spreadsheets turned into data you can report on.', '/contact-us'],
      [Search, 'Insights & alerts', 'An alert when numbers move outside the range you expect.', '/contact-us']
    ] }
  ],
  processTitle: 'From first idea to working automation',
  processIntro: 'We test on a small scale first, so you see results before rolling it out further.',
  steps: [
    [Search, '01', 'Review', 'We list the repetitive tasks and note how much time each one takes today.'],
    [Lightbulb, '02', 'Prioritise', 'We pick the tasks where automation gives the clearest benefit.'],
    [Bot, '03', 'Pilot', 'We build a small working version and try it out with your team.'],
    [Rocket, '04', 'Roll out', 'We extend what works, train your staff and keep an eye on the results.']
  ],
  storiesTitle: 'Organisations that work with Srisun',
  storyText: 'An organisation we work with. Ask us about the automation work we do for organisations like yours.',
  faqTitle: 'Questions about AI and automation',
  faq: [
    { question: 'Do we need a lot of data to use AI?', answer: 'Not always. Many automations work with the forms, emails and spreadsheets you already have. We check this in the first review.' },
    { question: 'Will AI replace our staff?', answer: 'Our aim is to take repetitive tasks away, so your team has more time for work that needs a person.' },
    { question: 'How is our data handled?', answer: 'We plan access, storage and logging with you, and connect only the data each automation needs to work.' },
    { question: 'Can it connect to WhatsApp and our existing software?', answer: 'Yes, if those tools offer an API. We confirm what is possible during the review.' }
  ]
};

const cybersecurityPage = {
  theme: 'security',
  seoTitle: 'Cybersecurity Services in India | Srisun',
  micro: {
    theme: 'security', label: 'Security', home: '/solutions/cybersecurity', nav: showcaseNav,
    cta: ['Get a Security Review', '/contact-us', 'Review'],
    footerKicker: 'WORRIED ABOUT A GAP?', footerTitle: 'Let’s check your security.', footerText: 'Tell us about your systems and your team, and we will suggest where to start.', footerButton: 'Request a Security Review',
    footerLinks: ['Cybersecurity', [['Approach', '#sc-approach'], ['Services', '#sc-services'], ['Process', '#sc-process'], ['FAQ', '#sc-faq']]]
  },
  breadcrumb: 'Cybersecurity',
  eyebrow: 'CYBERSECURITY FOR GROWING ORGANISATIONS',
  headline: 'Protect your',
  words: ['Data', 'Accounts', 'Devices', 'Website', 'Customers'],
  intro: 'We help organisations across India find security gaps, fix them in order of risk and train staff to avoid common threats.',
  primary: ['Request a Security Review', '/contact-us'],
  secondary: ['See How We Work', '#sc-process'],
  logosCaption: 'TRUSTED BY SCHOOLS, COLLEGES AND GROWING ORGANISATIONS',
  approachTitle: 'How we approach security',
  advantages: [
    [ClipboardCheck, 'red', 'Risk first', 'We fix the gaps most likely to cause harm first, and the minor ones after.'],
    [Users, 'yellow', 'Plain-language advice', 'Each finding comes with clear steps your team can follow, not just a technical report.'],
    [Layers, 'green', 'Sized for you', 'Controls sized for a school, clinic or growing company, not a large bank.'],
    [ShieldCheck, 'blue', 'Ongoing protection', 'We check security again whenever your systems or staff change.']
  ],
  chipsLabel: 'WHERE WE START',
  chips: ['Security review', 'Priority fixes', 'Staff training', 'Regular check-ups'],
  servicesTitle: 'Security across your whole organisation',
  services: [
    { tab: 'Assess', items: [
      [Search, 'Security assessment', 'Your systems, accounts and settings reviewed for weak points.', '/contact-us'],
      [Monitor, 'Website & app checks', 'Your website and apps tested for common vulnerabilities.', '/solutions/web-and-e-commerce'],
      [Database, 'Data protection review', 'A clear map of where sensitive data is kept and who can access it.', '/contact-us']
    ] },
    { tab: 'Protect', items: [
      [ShieldCheck, 'Access & identity', 'Strong passwords, two-step login and the right level of access for each role.', '/contact-us'],
      [Cloud, 'Backup & recovery', 'Tested backups, so you can recover quickly if something goes wrong.', '/services/domain-server'],
      [Smartphone, 'Device security', 'Laptops and phones kept updated, protected and accounted for.', '/contact-us']
    ] },
    { tab: 'Train & Respond', items: [
      [Users, 'Staff awareness training', 'Training that helps staff spot phishing emails, fake calls and unsafe links.', '/contact-us'],
      [Lightbulb, 'Incident response plan', 'A clear plan for who does what if there is an incident.', '/contact-us'],
      [Handshake, 'Ongoing security support', 'Regular reviews, updates and advice as your organisation grows.', '/contact-us']
    ] }
  ],
  processTitle: 'From first review to better protection',
  processIntro: 'You get a ranked list of risks, with a fix for each one.',
  steps: [
    [Search, '01', 'Assess', 'We review your systems, accounts and devices, and how staff work today.'],
    [ClipboardCheck, '02', 'Prioritise', 'We rank each gap by risk and agree with you what to fix first.'],
    [ShieldCheck, '03', 'Protect', 'We put the controls in place and test that they work.'],
    [Users, '04', 'Train & review', 'We train your staff and recheck security at regular intervals.']
  ],
  storiesTitle: 'Organisations that work with Srisun',
  storyText: 'An organisation we work with. Ask us about the security work we do for organisations like yours.',
  faqTitle: 'Questions about cybersecurity',
  faq: [
    { question: 'Is cybersecurity only for large companies?', answer: 'No. Schools, clinics and small firms also hold personal data and payment details that need protecting.' },
    { question: 'What does a security review include?', answer: 'We look at your accounts, devices, website, backups and data access, then explain the risks we find and how to fix each one.' },
    { question: 'Will the review disrupt our work?', answer: 'We plan our checks around your working hours and agree any testing with you in advance.' },
    { question: 'Can you train our staff?', answer: 'Yes. We run awareness sessions that help staff recognise phishing and other common scams.' }
  ]
};

const businessCommunicationPage = {
  theme: 'comms',
  seoTitle: 'WhatsApp & SMS Business Messaging in India | Srisun',
  micro: {
    theme: 'comms', label: 'Messaging', home: '/solutions/business-communication', nav: showcaseNav,
    cta: ['Get Started', '/contact-us', 'Start'],
    footerKicker: 'WANT TO REACH CUSTOMERS FASTER?', footerTitle: 'Let’s set up your first message.', footerText: 'Tell us what your customers need to hear from you, and we will suggest the right channel.', footerButton: 'Plan Your Messaging',
    footerLinks: ['Business Communication', [['Approach', '#sc-approach'], ['Services', '#sc-services'], ['Process', '#sc-process'], ['FAQ', '#sc-faq']]]
  },
  breadcrumb: 'Business Communication',
  eyebrow: 'WHATSAPP, SMS AND CUSTOMER MESSAGING',
  headline: 'Reach customers on',
  words: ['WhatsApp', 'SMS', 'Email', 'App Alerts'],
  intro: 'We set up WhatsApp, SMS and automatic notifications, so your customers hear from you when it matters.',
  primary: ['Plan Your Messaging', '/contact-us'],
  secondary: ['See How We Work', '#sc-process'],
  logosCaption: 'TRUSTED BY SCHOOLS, COLLEGES AND GROWING ORGANISATIONS',
  approachTitle: 'How we set up messaging',
  advantages: [
    [MessageCircle, 'red', 'Channels your customers use', 'We start with the channel your customers already use, not every channel at once.'],
    [Workflow, 'yellow', 'Automated, not robotic', 'Routine updates go out automatically, while your staff handle the real conversations.'],
    [Users, 'green', 'One view of conversations', 'Replies arrive where your team can see and answer them.'],
    [ShieldCheck, 'blue', 'Consent built in', 'Opt-ins, templates and sender approvals are set up correctly from the start.']
  ],
  chipsLabel: 'CHANNELS WE SET UP',
  chips: ['WhatsApp Business', 'Bulk SMS', 'Email updates', 'App notifications'],
  servicesTitle: 'Messaging for each stage of the customer journey',
  services: [
    { tab: 'WhatsApp', items: [
      [MessageCircle, 'WhatsApp Business setup', 'A verified business profile, message templates and team access.', '/contact-us'],
      [Bot, 'WhatsApp chatbots', 'Common questions answered and details collected automatically.', '/solutions/ai-and-automation'],
      [Send, 'Broadcast campaigns', 'Offers and updates for customers who have opted in.', '/contact-us']
    ] },
    { tab: 'SMS & Alerts', items: [
      [Smartphone, 'Transactional SMS', 'OTPs, order updates and payment confirmations.', '/contact-us'],
      [Send, 'Scheduled reminders', 'Fee, appointment and renewal reminders sent on time.', '/contact-us'],
      [Monitor, 'App & web notifications', 'Push alerts for the people using your app or website.', '/solutions/software-and-apps']
    ] },
    { tab: 'Integrations', items: [
      [Workflow, 'CRM & ERP connection', 'Trigger messages from records in your CRM or ERP.', '/services/crm'],
      [Database, 'Message reports', 'Delivery, read and reply tracking in one place.', '/contact-us'],
      [Handshake, 'Ongoing support', 'Template changes, approvals and troubleshooting.', '/contact-us']
    ] }
  ],
  processTitle: 'From the first message to automatic updates',
  processIntro: 'We start with one use, show that it works, then add more.',
  steps: [
    [Search, '01', 'Map', 'We list the messages your customers need, and when they need them.'],
    [PenTool, '02', 'Set up', 'We register the senders, write the templates and get them approved.'],
    [Workflow, '03', 'Automate', 'We connect triggers from your systems and test every message flow.'],
    [Rocket, '04', 'Grow', 'We review the results and add new messages and channels.']
  ],
  storiesTitle: 'Organisations that work with Srisun',
  storyText: 'An organisation we work with. Ask us about the messaging work we do for organisations like yours.',
  faqTitle: 'Questions about business messaging',
  faq: [
    { question: 'Do we need approval to send WhatsApp business messages?', answer: 'Yes. WhatsApp requires a verified business profile and approved message templates. We handle the setup and submission for you.' },
    { question: 'Can messages be sent automatically from our software?', answer: 'Yes, if your software offers an API. We connect it so messages go out whenever records change.' },
    { question: 'Can customers reply to our messages?', answer: 'Yes. Replies can go to a shared inbox, a chatbot, or both.' },
    { question: 'What do we need to get started?', answer: 'A business phone number, your business details and a list of the messages you plan to send.' }
  ]
};

const digitalGrowthPage = {
  theme: 'growth',
  seoTitle: 'Digital Marketing & Branding Services in India | Srisun',
  micro: {
    theme: 'growth', label: 'Growth', home: '/solutions/digital-growth', nav: showcaseNav,
    cta: ['Get a Growth Plan', '/contact-us', 'Plan'],
    footerKicker: 'READY TO GROW?', footerTitle: 'Let’s plan your next campaign.', footerText: 'Tell us who you want to reach and what you want them to do, and we will suggest a plan.', footerButton: 'Plan Your Growth',
    footerLinks: ['Digital Growth', [['Approach', '#sc-approach'], ['Services', '#sc-services'], ['Process', '#sc-process'], ['FAQ', '#sc-faq']]]
  },
  breadcrumb: 'Digital Growth',
  eyebrow: 'BRANDING, DIGITAL MARKETING AND CONTENT',
  headline: 'Grow your',
  words: ['Brand', 'Enquiries', 'Admissions', 'Sales', 'Reach'],
  intro: 'We plan and run branding, ads, SEO and content to bring in new enquiries, and report on what is working.',
  primary: ['Plan Your Growth', '/contact-us'],
  secondary: ['See How We Work', '#sc-process'],
  logosCaption: 'TRUSTED BY SCHOOLS, COLLEGES AND GROWING ORGANISATIONS',
  approachTitle: 'How we approach growth',
  advantages: [
    [TrendingUp, 'red', 'Measured from day one', 'Each campaign has a clear goal and tracking, so you can see what every rupee achieves.'],
    [Users, 'yellow', 'Know your audience', 'We agree who you want to reach before choosing any channels.'],
    [Palette, 'green', 'A consistent brand', 'A logo, colours and tone of voice that stay consistent wherever you appear.'],
    [Lightbulb, 'blue', 'Test, learn, improve', 'We start small, keep what works and drop what does not.']
  ],
  chipsLabel: 'WHERE WE HELP',
  chips: ['Brand identity', 'Google & Meta ads', 'SEO', 'Social media content'],
  servicesTitle: 'Growth across brand, marketing and content',
  services: [
    { tab: 'Brand', items: [
      [Palette, 'Brand identity', 'A logo, colours and guidelines for a consistent look.', '/contact-us'],
      [PenTool, 'Design & creatives', 'Posters, social posts and ad designs.', '/contact-us'],
      [MessageCircle, 'Brand voice', 'How you describe your business on the web, on social media and in print.', '/contact-us']
    ] },
    { tab: 'Marketing', items: [
      [TrendingUp, 'Performance ads', 'Google and Meta campaigns measured by enquiries and sales.', '/services/marketing'],
      [Search, 'SEO', 'Helping customers find you on Google for the searches that matter.', '/contact-us'],
      [Send, 'Email & WhatsApp campaigns', 'Offers and updates for your existing customers.', '/solutions/business-communication']
    ] },
    { tab: 'Content', items: [
      [Monitor, 'Social media management', 'Planned posts and replies on the platforms your audience uses most.', '/contact-us'],
      [Layers, 'Content writing', 'Website pages, blogs and campaign copy.', '/contact-us'],
      [Database, 'Reports & insights', 'Regular reports on reach, enquiries and spending.', '/contact-us']
    ] }
  ],
  processTitle: 'From the first plan to steady growth',
  processIntro: 'You approve the plan and budget before anything goes live.',
  steps: [
    [Search, '01', 'Research', 'We look at your audience, competitors and current channels.'],
    [Lightbulb, '02', 'Plan', 'We set the goals, channels and budget for your approval.'],
    [Rocket, '03', 'Launch', 'We create the content and run the campaigns for you.'],
    [TrendingUp, '04', 'Improve', 'We report the results and move budget towards what works.']
  ],
  storiesTitle: 'Organisations that work with Srisun',
  storyText: 'An organisation we work with. Ask us about the growth work we do for organisations like yours.',
  faqTitle: 'Questions about digital growth',
  faq: [
    { question: 'How soon will we see results?', answer: 'Ads can bring enquiries soon after launch, while SEO and brand work take months to build up. The plan sets out what to expect from each channel.' },
    { question: 'What budget do we need?', answer: 'That depends on your goals and channels. We suggest a starting budget and adjust it once results come in.' },
    { question: 'Can you manage our social media accounts?', answer: 'Yes. We can plan, design and publish your posts, and reply to comments and messages.' },
    { question: 'Will we get reports?', answer: 'Yes. You receive regular reports on reach, enquiries and spending.' }
  ]
};

const showcasePages = { consulting: techConsultingPage, commerce: webCommercePage, software: softwareAppsPage, ai: aiAutomationPage, security: cybersecurityPage, comms: businessCommunicationPage, growth: digitalGrowthPage };

function SolutionShowcasePage({ page }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [activeClient, setActiveClient] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => setWordIndex((index) => (index + 1) % page.words.length), 2400);
    return () => clearInterval(timer);
  }, [page]);

  const featuredClients = trustedBrands.slice(0, 4);
  const [clientName, clientLogo] = featuredClients[activeClient];

  return (
    <main className={`tc-page tc-theme-${page.theme}`} id="sc-top">
      <section className="tc-hero">
        <svg className="tc-hero-art" viewBox="0 0 520 420" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M40 360 L140 280 L250 310 L360 190 L470 220" />
            <path d="M140 280 L170 150 L300 90 L360 190" />
            <path d="M250 310 L300 90 M170 150 L60 120 M300 90 L440 60 L470 220" />
            <rect x="330" y="250" width="150" height="120" rx="6" />
            <rect x="350" y="270" width="110" height="10" rx="2" />
            <rect x="350" y="292" width="80" height="10" rx="2" />
            <rect x="350" y="314" width="95" height="10" rx="2" />
            <circle cx="300" cy="90" r="34" />
            <circle cx="170" cy="150" r="22" />
          </g>
          <g fill="currentColor">
            {[[40,360],[140,280],[250,310],[360,190],[470,220],[170,150],[300,90],[60,120],[440,60]].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />)}
          </g>
        </svg>
        <div className="content-page-inner tc-hero-inner">
          <nav className="content-breadcrumb tc-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><ChevronRight size={14} /><a href="/solutions">Solutions</a><ChevronRight size={14} /><span>{page.breadcrumb}</span></nav>
          <span className="tc-eyebrow">{page.eyebrow}</span>
          <h1>{page.headline} <span className="tc-rotating-word" key={wordIndex}>{page.words[wordIndex]}</span><i className="tc-cursor" aria-hidden="true" /></h1>
          <span className="tc-rule" aria-hidden="true" />
          <p>{page.intro}</p>
          <div className="tc-hero-actions">
            <a className="tc-btn-primary" href={page.primary[1]}>{page.primary[0]} <ChevronRight size={16} /></a>
            <a className="tc-btn-ghost" href={page.secondary[1]}>{page.secondary[0]} <ChevronRight size={16} /></a>
          </div>
        </div>
      </section>

      <section className="tc-logos" aria-label="Organisations that work with Srisun">
        <div className="content-page-inner">
          <p>{page.logosCaption}</p>
          <div className="tc-logo-track">
            <div className="tc-logo-row">
              {[...trustedBrands, ...trustedBrands].map(([name, logo], index) => <img key={`${name}-${index}`} src={logo} alt={index < trustedBrands.length ? name : ''} aria-hidden={index >= trustedBrands.length} loading="lazy" />)}
            </div>
          </div>
        </div>
      </section>

      <section className="tc-advantage" id="sc-approach">
        <div className="content-page-inner">
          <div className="tc-heading"><h2>{page.approachTitle}</h2><span className="tc-rule red" aria-hidden="true" /></div>
          <div className="tc-advantage-grid">
            {page.advantages.map(([Icon, tone, title, text]) => (
              <article key={title}>
                <span className={`tc-adv-icon ${tone}`}><Icon size={24} /></span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
          <div className="tc-engagement">
            <span>{page.chipsLabel}</span>
            <div>{page.chips.map((item) => <b key={item}>{item}</b>)}</div>
          </div>
        </div>
      </section>

      <section className="tc-services" id="sc-services">
        <div className="content-page-inner tc-services-inner">
          <div className="tc-heading center light"><h2>{page.servicesTitle}</h2><span className="tc-rule" aria-hidden="true" /></div>
          <div className="tc-tabs" role="tablist" aria-label="Service areas">
            {page.services.map(({ tab }, index) => (
              <button type="button" role="tab" id={`sc-tab-${index}`} aria-controls="sc-tabpanel" aria-selected={activeTab === index} className={activeTab === index ? 'active' : ''} onClick={() => setActiveTab(index)} key={tab}>{tab}</button>
            ))}
          </div>
          <div className="tc-service-list" role="tabpanel" id="sc-tabpanel" aria-labelledby={`sc-tab-${activeTab}`} key={activeTab}>
            {page.services[activeTab].items.map(([Icon, title, text, href]) => (
              <a className="tc-service-row" href={href} key={title}>
                <span className="tc-service-icon"><Icon size={26} strokeWidth={1.5} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="tc-service-arrow" aria-hidden="true"><ArrowRight size={16} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="tc-process" id="sc-process">
        <div className="content-page-inner">
          <div className="tc-heading center"><span className="tc-kicker">OUR PROCESS</span><h2>{page.processTitle}</h2><span className="tc-rule red" aria-hidden="true" /><p>{page.processIntro}</p></div>
          <ol className="tc-process-grid">
            {page.steps.map(([Icon, number, title, text]) => (
              <li key={number}>
                <span className="tc-step-icon"><Icon size={22} /></span>
                <span className="tc-step-number">STEP {number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tc-stories" id="sc-stories">
        <div className="tc-stories-band">
          <div className="content-page-inner"><div className="tc-heading center light"><h2>{page.storiesTitle}</h2><span className="tc-rule" aria-hidden="true" /></div></div>
        </div>
        <div className="content-page-inner">
          <div className="tc-story-card">
            <div className="tc-story-main" key={activeClient}>
              <div className="tc-story-logo"><img src={clientLogo} alt="" /></div>
              <div>
                <span className="tc-kicker">CLIENT STORY</span>
                <h3>{clientName}</h3>
                <span className="tc-story-rule" aria-hidden="true" />
                <p>{page.storyText}</p>
                <a href="/contact-us">Discuss a Similar Project <ChevronRight size={14} /></a>
              </div>
            </div>
            <div className="tc-story-list" role="tablist" aria-label="Choose a client">
              {featuredClients.map(([name, logo], index) => (
                <button type="button" role="tab" aria-selected={activeClient === index} className={activeClient === index ? 'active' : ''} onClick={() => setActiveClient(index)} key={name}>
                  <img src={logo} alt="" /><span>{name}</span>
                </button>
              ))}
              <a href="/clients/stories">View All Client Stories <ChevronRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="tc-faq" id="sc-faq">
        <div className="content-page-inner">
          <div className="tc-heading center"><span className="tc-kicker">FAQ</span><h2>{page.faqTitle}</h2><span className="tc-rule red" aria-hidden="true" /></div>
          <div className="content-faq-list">{page.faq.map((faq) => <details key={faq.question}><summary>{faq.question}<ChevronDown size={17} /></summary><p>{faq.answer}</p></details>)}</div>
        </div>
      </section>
    </main>
  );
}

const footerCols = [
  { title: 'Apps and Platforms', links: ['Srisun AI', 'Srisun Books', 'Srisun Social', 'Zedu', 'XLoan'] },
  { title: 'Learn', links: ['Announcements Hub', 'Training & Certifications', 'Blog', 'Knowledge Base', 'Shri (AI Agent)', 'The Long Game', 'Newsletter'] },
  { title: 'Community', links: ['Client Stories', 'Work With a Partner', 'Affiliate Program', 'Partner Program', 'Technology Partners'] },
  { title: 'Company', links: ['About Us', 'Our Story', 'Careers', 'News & Updates', 'Brand Guidelines', 'Contact Us'] }
];

function ContactUsPage() {
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const payload = { ...Object.fromEntries(new FormData(formElement)), page: window.location.pathname };
    setStatus({ state: 'sending', message: '' });
    try {
      await submitEnquiry(payload);
      formElement.reset();
      setStatus({ state: 'sent', message: 'Thank you. Your message has reached our team, and we will get back to you soon.' });
    } catch (error) {
      setStatus({ state: 'error', message: error.message });
    }
  };

  return (
    <main className="contact-page contact-modern">
      <section className="contact-modern-hero">
        <div className="contact-width">
          <nav className="contact-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><ChevronRight size={14} /><span>Contact Us</span></nav>
          <div className="contact-modern-grid">
          <div className="contact-modern-panel">
            <div className="contact-modern-logo"><img src="/assets/srisun-logo.png" alt="Srisun" /></div>
            <span className="contact-modern-eyebrow"><i /> LET’S TALK</span>
            <h1>Have a project<br />in <em>mind?</em></h1>
            <p>Tell us what you are working on, and we will put you in touch with the right people at Srisun.</p>
            <div className="contact-modern-links">
              <a href="tel:+918883388162"><span className="contact-modern-icon"><Phone size={17} /></span><span><small>CALL US</small><strong>88833 88162</strong></span><ChevronRight size={17} /></a>
              <a href="mailto:hello@srisun.ai"><span className="contact-modern-icon"><AtSign size={17} /></span><span><small>WRITE TO US</small><strong>hello@srisun.ai</strong></span><ChevronRight size={17} /></a>
            </div>
            <div className="contact-modern-founder"><span>SR</span><div><strong>Sundar Rajamani</strong><small>Founder &amp; CEO · SRISUN Group</small></div></div>
            <div className="contact-modern-colorbar" aria-hidden="true"><i /><i /><i /><i /></div>
          </div>

          <form className="contact-modern-form" onSubmit={handleContactSubmit}>
            <span className="contact-modern-form-kicker">CONTACT FORM</span>
            <h2>Let’s start a conversation.</h2>
            <p>Send us a few details, and we will get back to you.</p>
            <div className="contact-modern-fields">
              <label>Your name *<input name="name" autoComplete="name" required placeholder="Your full name" /></label>
              <label>Work email *<input type="email" name="email" autoComplete="email" required placeholder="you@company.com" /></label>
              <label>Phone number<input type="tel" name="phone" autoComplete="tel" placeholder="+91" /></label>
              <label>Company<input name="company" autoComplete="organization" placeholder="Company name" /></label>
              <label className="contact-modern-topic">What can we help with?<select name="topic" defaultValue=""><option value="">Choose a topic</option><option>Technology consulting</option><option>Website or application</option><option>Software and automation</option><option>General enquiry</option></select></label>
              <label className="contact-modern-message">Your message *<textarea name="message" rows="4" required placeholder="Tell us briefly about your project or question" /></label>
            </div>
            <label className="careers-hp" aria-hidden="true">Leave this empty<input name="nickname" tabIndex={-1} autoComplete="off" /></label>
            <button type="submit" disabled={status.state === 'sending'}>{status.state === 'sending' ? 'Sending…' : <>Send Enquiry <Send size={16} /></>}</button>
            {status.state === 'sent' ? <p className="contact-modern-status is-ok" role="status">{status.message}</p> : null}
            {status.state === 'error' ? <p className="contact-modern-status is-err" role="alert">{status.message}</p> : null}
          </form>
          </div>
          <div className="contact-modern-office">
          <div className="contact-modern-office-inner">
            <span className="contact-modern-office-icon"><MapPin size={21} /></span>
            <div><small>OUR OFFICE</small><strong>Srisun Corporation</strong><p>#16, 1st floor, GR Tower, Tindivanam Road, Kilnachipet, Tiruvannamalai, Tamil Nadu, India - 606611</p></div>
          </div>
          <div className="contact-modern-map-wrap">
            <iframe
              src="https://www.google.com/maps?q=GR%20Tower%2C%20Tindivanam%20Road%2C%20Kilnachipet%2C%20Tiruvannamalai%2C%20Tamil%20Nadu%20606611%2C%20India&output=embed"
              title="Map to the Srisun office"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer zoho-footer">
      <div className="footer-signup scroll-reveal">
        <h2>Have a project in mind?</h2>
        <p>Tell us what you need, and we will reply with a practical next step.</p>
        <a href="#contact">Get In Touch <ChevronRight size={16} /></a>
      </div>
      <div className="footer-main">
        {footerCols.map((column) => (
          <div className="footer-col" key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((link) => <a href={link === 'Careers' ? '/careers' : menuItemHref(link)} key={link}>{link}</a>)}
          </div>
        ))}
        <div className="footer-contact" id="contact">
          <h3>Contact Sales</h3>
          <strong>Phone</strong>
          <a href="tel:+918883388162">88833 88162</a>
          <strong>Email</strong>
          <a href="mailto:hello@srisun.ai">hello@srisun.ai</a>
          <div className="contact-links"><a href={menuItemHref('Knowledge Base')}>Support <ChevronRight size={15} /></a><a href={menuItemHref('Concierge')}>Talk to Concierge <ChevronRight size={15} /></a></div>
        </div>
      </div>
      <div className="footer-social-row">
        <a href="/" className="footer-logo" aria-label="Srisun home"><img src="/assets/srisun-logo.png" alt="Srisun" width="128" height="42" /></a>
        <a className="footer-connect-link" href="/contact-us">Connect with Srisun <ChevronRight size={15} /></a>
      </div>
      <div className="footer-legal"><div className="legal-links">{['Contact Us', 'Security', 'Compliance', 'IPR Complaints', 'Terms of Service', 'Privacy Policy', 'Refund Policy', 'Trademark Policy', 'Cookie Policy', 'GDPR Compliance', 'Abuse Policy'].map((link) => <a href={menuItemHref(link)} key={link}>{link}</a>)}</div></div>
      <div className="footer-copyright"><img src="/assets/srisun-logo.png" alt="" aria-hidden="true" /><span>© 2026, Srisun. All Rights Reserved.</span></div>
    </footer>
  );
}

export function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const isCareersPage = normalizedPath.startsWith('/careers');
  const isContactPage = normalizedPath === '/contact-us';
  const isHomePage = normalizedPath === '/';
  const selectedCareerRole = jobsSnapshot.find((role) => careerRolePath(role) === normalizedPath.replace(/\/apply$/, ''));
  const routePage = normalizedPath === '/search'
    ? { path: '/search', title: 'Search', group: 'Search', description: 'Search Srisun services, solutions and resources.' }
    : contentPages.find((page) => page.path === normalizedPath);
  // Case studies live under the stories page but are not in contentPages: the
  // records come from the demo store, so the slug is matched by prefix instead.
  const caseStudySlug = normalizedPath.startsWith('/clients/stories/') ? normalizedPath.slice('/clients/stories/'.length).split('/')[0] : null;
  // Demo admin: browser-only, never prerendered and never indexed.
  const isAdmin = normalizedPath === '/admin' || normalizedPath.startsWith('/admin/');
  const isNotFound = !isHomePage && !isCareersPage && !isContactPage && !routePage && !caseStudySlug && !isAdmin;
  const showcasePage = routePage?.showcase ? showcasePages[routePage.showcase] : null;
  const microsite = routePage?.erp ? erpMicrosite : showcasePage ? showcasePage.micro : null;
  const subpage = routePage && !routePage.erp && !showcasePage ? getSubpage(routePage.path) : null;

  useEffect(() => {
    // Case study pages publish their own metadata from the database once
    // the record has loaded, so this route-level block stands aside. Pages the
    // build prerendered already carry complete head tags, so they are left alone.
    if (!caseStudySlug && !headPrerenderedFor(normalizedPath)) {
      const title = isCareersPage
        ? normalizedPath.endsWith('/jobs') ? 'Open Roles at Srisun | Careers' : normalizedPath.includes('/apply') ? 'Apply for a Role at Srisun | Careers' : normalizedPath.split('/').length > 3 ? `${selectedCareerRole?.title || 'Careers'} at Srisun | Careers` : 'Careers at Srisun | Build what moves people forward'
        : isContactPage ? 'Contact Srisun | Let’s build something better'
          : isHomePage ? 'Srisun | Technology Solutions for Businesses'
            : routePage?.erp ? 'ERP Consulting & Implementation in India | Srisun'
            : showcasePage ? showcasePage.seoTitle
            : routePage ? `${routePage.title} | Srisun` : isAdmin ? 'Demo Admin | Srisun' : caseStudySlug ? 'Case Study | Srisun' : 'Page Not Found | Srisun';
      const description = isCareersPage ? selectedCareerRole?.summary || 'Explore open roles at Srisun across India and find your next opportunity.' : isContactPage ? 'Contact Srisun to discuss technology consulting, software, automation and digital services.' : routePage?.description || 'Explore Srisun technology solutions for businesses.';
      document.title = title;
      const setMeta = (key, value, property = false) => {
        let el = document.head.querySelector(`${property ? 'meta[property' : 'meta[name'}="${key}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute(property ? 'property' : 'name', key); document.head.appendChild(el); }
        el.content = value;
      };
      setMeta('description', description);
      setMeta('robots', (routePage?.group === 'Policies' && !publishedPage(normalizedPath)) || normalizedPath === '/search' || normalizedPath.endsWith('/apply') || isNotFound || caseStudySlug || isAdmin ? 'noindex,follow' : 'index,follow');
      setMeta('og:title', title, true); setMeta('og:description', description, true);
      setMeta('og:type', 'website', true); setMeta('og:url', `https://srisun.ai${normalizedPath === '/' ? '/' : normalizedPath}`, true);
      setMeta('og:image', 'https://srisun.ai/assets/srisun-logo.png', true);
      let canonical = document.head.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = `https://srisun.ai${normalizedPath === '/' ? '/' : normalizedPath}`;
      let schemaScript = document.getElementById('srisun-schema');
      if (!schemaScript) { schemaScript = document.createElement('script'); schemaScript.id = 'srisun-schema'; schemaScript.type = 'application/ld+json'; document.head.appendChild(schemaScript); }
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@graph': [
          { '@type': 'Organization', '@id': 'https://srisun.ai/#organization', name: 'Srisun', url: 'https://srisun.ai/', logo: 'https://srisun.ai/assets/srisun-logo.png', email: 'hello@srisun.ai', telephone: '+91 88833 88162', description: 'Building technology for better lives and businesses.' },
          { '@type': 'WebPage', '@id': `https://srisun.ai${normalizedPath}#webpage`, url: `https://srisun.ai${normalizedPath === '/' ? '/' : normalizedPath}`, name: title, description, isPartOf: { '@id': 'https://srisun.ai/#website' }, about: { '@id': 'https://srisun.ai/#organization' } },
          { '@type': 'WebSite', '@id': 'https://srisun.ai/#website', url: 'https://srisun.ai/', name: 'Srisun', publisher: { '@id': 'https://srisun.ai/#organization' } },
          ...(routePage && routePage.group !== 'Policies' && normalizedPath !== '/search' ? [{ '@type': 'FAQPage', mainEntity: getPageFaq(routePage).map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }] : [])
        ]
      });
    }

    const elements = document.querySelectorAll('.scroll-reveal, .erp-page section, .tc-page section, .sp-page [data-reveal]');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [caseStudySlug, isAdmin, isCareersPage, isContactPage, isHomePage, isNotFound, normalizedPath, routePage, selectedCareerRole]);

  if (isAdmin) return <AdminApp path={normalizedPath} />;

  return (
    <>
      {microsite ? <MicrositeHeader site={microsite} /> : <Header />}

      {caseStudySlug ? <CaseStudyRoute slug={caseStudySlug} /> : isCareersPage ? <CareersPage /> : isContactPage ? <ContactUsPage /> : routePage ? routePage.erp ? <ErpPage /> : showcasePage ? <SolutionShowcasePage page={showcasePage} /> : subpage ? <SubPage page={subpage} meta={routePage} /> : <ContentPage page={routePage} /> : isNotFound ? <main className="content-page content-not-found"><div className="content-page-inner"><span className="content-eyebrow"><i /> 404</span><h1>We couldn’t find that page.</h1><p>Try the main sections or contact the Srisun team for help.</p><div className="content-not-found-links"><a href="/">Home</a><a href="/services">Services</a><a href="/solutions">Solutions</a><a href="/contact-us">Contact Us</a></div></div></main> : (
        <main>
          <Hero />
          <SrisunFeaturedSection />
          <TrustedBrandsSection />
          <VideoStoriesSection />
          <EnterpriseSection />
          <IndustriesSection />
          <HowWeWorkSection />
          <CoreValuesSection />
          <IndiaImpactSection />
        </main>
      )}

      {microsite ? <MicrositeFooter site={microsite} /> : <Footer />}
    </>
  );
}
if (typeof document !== 'undefined') {
  const root = document.getElementById('root');
  // Hydrate only markup prerendered for this exact path. Routes added after
  // the build (new jobs, case studies) are served the home page shell by the
  // rewrites, so they are rendered fresh instead of hydrated against it.
  const trim = (value) => value.replace(/\/+$/, '') || '/';
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const prerenderedHere = canonical && trim(new URL(canonical, window.location.origin).pathname) === trim(window.location.pathname);
  const dynamicRoute = window.location.pathname.startsWith('/clients/stories/') || window.location.pathname.startsWith('/admin');
  if (root.hasChildNodes() && prerenderedHere && !dynamicRoute) hydrateRoot(root, <App />);
  else { root.innerHTML = ''; createRoot(root).render(<App />); }

  // The PWA has been retired. Remove any service worker and caches that
  // earlier visits installed, so returning visitors get the live site.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
  }
  if (typeof caches !== 'undefined') {
    caches.keys()
      .then((keys) => keys.filter((key) => key.startsWith('srisun-')).forEach((key) => caches.delete(key)))
      .catch(() => {});
  }
}

export { contentPages, showcasePages, jobsSnapshot as openRoles };


