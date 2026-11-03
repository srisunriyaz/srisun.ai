// Srisun admin: enquiries, job applications, jobs, clients and case studies.
//
// Every read and write goes to the /api/v1 REST API over a session cookie set
// by the server; authorisation is enforced server-side on every endpoint and
// the browser holds no copy of the data.

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft, Plus, Trash2, Eye, EyeOff, Upload, X, Check, Info, FileText, Search, LogOut, AlertCircle, LayoutDashboard, Mail, Inbox,
  Briefcase, Users, KeyRound, ScrollText, UserCog, Menu, Sun, Moon, ExternalLink, ChevronRight, PanelLeftClose, PanelLeftOpen,
  Lock, ShieldCheck, BellRing, Building2, BookOpen
} from 'lucide-react';
import {
  fetchMe, login as apiLogin, logout as apiLogout,
  adminStats, adminClients, adminClient, createClient, updateClient, removeClient, setStatus, uploadFile
} from './apiClient.js';
import { emptyCaseStudy, caseStudyPath, isPublished, projectStages } from './clientsApi.js';
import { fetchTaxonomies } from './apiClient.js';
import { Overview, Enquiries, Applications, JobsList, JobEditor, PagesList, PageEditor, Account, Team, Avatar, EmptyState } from './adminSections.jsx';
import { refreshPush } from './push.js';
import './admin.css';

const MAX_UPLOAD_MB = 4;
const LOGO = '/assets/srisun-favicon.png';

function Field({ label, hint, children }) {
  return (
    <label className="ad-field">
      <span className="ad-label">{label}</span>
      {hint ? <span className="ad-hint">{hint}</span> : null}
      {children}
    </label>
  );
}

function ListField({ label, hint, value, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={2} value={value.join(', ')} onChange={(event) => onChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} />
    </Field>
  );
}

// Theme and sidebar width are display preferences only (no admin data).
function usePref(key, initial) {
  const [value, setValue] = useState(() => {
    try { return window.localStorage.getItem(key) ?? initial(); } catch { return initial(); }
  });
  useEffect(() => { try { window.localStorage.setItem(key, value); } catch { /* private mode */ } }, [key, value]);
  return [value, setValue];
}
const systemTheme = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// ---------------------------------------------------------------- sign in
function LoginScreen({ onSignedIn, theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onSignedIn(await apiLogin(email, password));
    } catch (loginError) {
      setError(loginError.message);
      setBusy(false);
    }
  };

  return (
    <main className="ad-page ad-login-page" data-theme={theme}>
      <aside className="ad-login-art" aria-hidden="true">
        <div className="ad-login-brand"><img src={LOGO} alt="" /><strong>SRISUN</strong><span>Admin console</span></div>
        <div>
          <h2>Run the whole site from <em>one calm workspace.</em></h2>
          <p>Enquiries, job applications, open roles, client stories and policy pages, all in one place.</p>
          <ul className="ad-login-points">
            <li><Mail /> Reply to new enquiries quickly</li>
            <li><Inbox /> Review candidates and download resumes</li>
            <li><BellRing /> Get push alerts on your phone</li>
          </ul>
        </div>
        <div>
          <div className="ad-login-bar"><i style={{ background: '#e2262a' }} /><i style={{ background: '#079b68' }} /><i style={{ background: '#f5b021' }} /><i style={{ background: '#236db5' }} /></div>
          <p className="ad-login-foot">© {new Date().getFullYear()} Srisun. Authorised staff only.</p>
        </div>
      </aside>
      <div className="ad-login-side">
        <form className="ad-login" onSubmit={submit}>
          <div className="ad-login-mobile-brand"><img src={LOGO} alt="" /><strong>SRISUN</strong></div>
          <h1>Welcome back</h1>
          <p className="ad-login-intro">Sign in to your Srisun admin account.</p>
          {error ? <p className="ad-msg ad-msg-err" role="alert"><AlertCircle size={16} /> {error}</p> : null}
          <Field label="Email">
            <span className="ad-input-wrap">
              <Mail size={16} aria-hidden="true" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="you@srisun.ai" required />
            </span>
          </Field>
          <Field label="Password">
            <span className="ad-input-wrap">
              <Lock size={16} aria-hidden="true" />
              <input type={reveal ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required style={{ paddingRight: 44 }} />
              <button type="button" className="ad-reveal" onClick={() => setReveal((on) => !on)} aria-label={reveal ? 'Hide password' : 'Show password'} aria-pressed={reveal}>
                {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </Field>
          <button type="submit" className="ad-primary ad-login-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <p className="ad-login-secure"><ShieldCheck size={14} /> Secure session · signs out after 8 hours</p>
        </form>
      </div>
    </main>
  );
}

// ------------------------------------------------------------- dashboard
function Dashboard({ onOpen }) {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });
  const [query, setQuery] = useState('');
  const [status, setFilterStatus] = useState('all');

  useEffect(() => {
    let live = true;
    Promise.all([adminClients(), adminStats()])
      .then(([list, counts]) => { if (live) { setClients(list); setStats(counts); setState({ loading: false, error: null }); } })
      .catch((error) => { if (live) setState({ loading: false, error: error.message }); });
    return () => { live = false; };
  }, []);

  const visible = clients.filter((client) => {
    if (status === 'published' && !isPublished(client)) return false;
    if (status === 'draft' && isPublished(client)) return false;
    const term = query.trim().toLowerCase();
    return !term || client.name.toLowerCase().includes(term);
  });

  if (state.loading) return <p className="ad-loading" role="status">Loading…</p>;
  if (state.error) return <p className="ad-msg ad-msg-err" role="alert"><AlertCircle size={16} /> {state.error}</p>;

  const kpis = [
    { key: 'all', icon: Building2, value: stats?.clients ?? 0, text: 'Clients', tone: '--ad-blue' },
    { key: 'published', icon: Check, value: stats?.published ?? 0, text: 'Published case studies', tone: '--ad-green' },
    { key: 'draft', icon: FileText, value: stats?.drafts ?? 0, text: 'Drafts', tone: '--ad-amber' }
  ];

  return (
    <>
      <div className="ad-overview">
        {kpis.map(({ key, icon: Icon, value, text, tone }) => (
          <button type="button" key={key} className="ad-ov-card" style={{ '--c': `var(${tone})` }} onClick={() => setFilterStatus(key)} aria-pressed={status === key}>
            <span className="ad-ov-top"><span className="ad-ov-icon"><Icon size={19} aria-hidden="true" /></span>{status === key ? <span className="ad-pill ad-pill-live">Showing</span> : null}</span>
            <strong>{value}</strong>
            <span>{text}</span>
          </button>
        ))}
      </div>

      <div className="ad-toolbar">
        <div className="ad-search">
          <Search size={17} aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients…" aria-label="Search clients" />
        </div>
        <div className="ad-seg" role="group" aria-label="Filter by status">
          {['all', 'published', 'draft'].map((value) => (
            <button type="button" key={value} className={status === value ? 'is-on' : ''} aria-pressed={status === value} onClick={() => setFilterStatus(value)}>
              {value === 'all' ? 'All' : value === 'published' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>
        <button type="button" className="ad-primary" onClick={() => onOpen('new')}><Plus size={16} /> Add client</button>
      </div>

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>Client</th><th>Industry</th><th>Case study</th><th aria-label="Actions" /></tr>
          </thead>
          <tbody>
            {visible.map((client) => (
              <tr key={client.id}>
                <td className="ad-td-main">
                  <div className="ad-cell-main ad-cell-client">
                    {client.logo ? <img src={client.logo} alt="" /> : <span className="ad-mono" aria-hidden="true">{client.name.slice(0, 2).toUpperCase()}</span>}
                    <div>
                      <strong>{client.name}</strong>
                      <span>{client.website || 'No website recorded'}</span>
                    </div>
                  </div>
                </td>
                <td data-label="Industry">{client.industry || <em>Not set</em>}</td>
                <td data-label="Case study"><span className={`ad-pill ad-pill-${isPublished(client) ? 'live' : 'draft'}`}>{isPublished(client) ? 'Published' : 'Draft'}</span></td>
                <td className="ad-row-actions">
                  <button type="button" className="ad-ghost" onClick={() => onOpen(client.id)}>Edit</button>
                  <a className="ad-icon-btn" href={caseStudyPath(client)} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${client.name}`} title="Preview"><Eye size={15} /></a>
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr><td colSpan={4} className="ad-empty">
                <EmptyState icon={Users} title={clients.length ? 'No matches' : 'No clients yet'} text={clients.length ? 'No clients match that search or filter.' : 'Add your first client to start building case studies.'} />
              </td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ----------------------------------------------------------------- editor
function Editor({ slug, onBack }) {
  const creating = slug === 'new';
  const [form, setForm] = useState({ name: '', website: '', logo: '', logoMediaId: null, industry: '', solutions: [], tags: [], description: '' });
  const [cs, setCs] = useState(emptyCaseStudy);
  const [options, setOptions] = useState({ industries: [], solutions: [] });
  const [loading, setLoading] = useState(!creating);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [currentSlug, setCurrentSlug] = useState(creating ? null : slug);

  useEffect(() => { fetchTaxonomies().then(setOptions).catch(() => {}); }, []);

  useEffect(() => {
    if (creating) return undefined;
    let live = true;
    adminClient(slug)
      .then((client) => {
        if (!live) return;
        setForm({
          name: client.name, website: client.website, logo: client.logo, logoMediaId: client.logoMediaId,
          industry: client.industry, solutions: client.solutions, tags: client.tags, description: client.description
        });
        setCs({ ...emptyCaseStudy(), ...(client.caseStudy || {}) });
        setLoading(false);
      })
      .catch((loadError) => { if (live) { setError(loadError.message); setLoading(false); } });
    return () => { live = false; };
  }, [slug, creating]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setCase = (key) => (event) => setCs((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleSolution = (value) => setForm((prev) => ({
    ...prev,
    solutions: prev.solutions.includes(value) ? prev.solutions.filter((item) => item !== value) : [...prev.solutions, value]
  }));

  const upload = async (event, apply) => {
    const files = [...event.target.files];
    event.target.value = '';
    setError(null);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`${file.name} is larger than the ${MAX_UPLOAD_MB} MB limit.`);
        uploaded.push(await uploadFile(file));
      }
      apply(uploaded);
    } catch (uploadError) {
      setError(uploadError.message);
    }
  };

  // Saves, and only reports success once the server has confirmed it.
  const persist = useCallback(async (status) => {
    setError(null);
    setMessage(null);
    if (!form.name.trim()) { setError('A client name is required.'); return; }
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        website: form.website,
        description: form.description,
        logoMediaId: form.logoMediaId,
        industry: form.industry,
        solutions: form.solutions,
        tags: form.tags,
        caseStudy: { ...cs, status: status ?? cs.status }
      };
      const saved = currentSlug ? await updateClient(currentSlug, payload) : await createClient(payload);
      setCurrentSlug(saved.id);
      setCs({ ...emptyCaseStudy(), ...(saved.caseStudy || {}) });
      setMessage(status === 'published' ? 'Published.' : status === 'draft' ? 'Unpublished — back to draft.' : 'Saved.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }, [form, cs, currentSlug]);

  const changeStatus = async (status) => {
    if (!currentSlug) { await persist(status); return; }
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await setStatus(currentSlug, status);
      setCs((prev) => ({ ...prev, status }));
      setMessage(status === 'published' ? 'Published.' : 'Unpublished — back to draft.');
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!currentSlug) return;
    if (!window.confirm(`Delete ${form.name} and its case study? This cannot be undone.`)) return;
    try {
      await removeClient(currentSlug);
      onBack();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const timelineRow = (index, key) => (event) => setCs((prev) => ({
    ...prev,
    timeline: prev.timeline.map((step, i) => (i === index ? { ...step, [key]: event.target.value } : step))
  }));

  const metricRow = (index, key) => (event) => setCs((prev) => ({
    ...prev,
    metrics: prev.metrics.map((metric, i) => (i === index ? { ...metric, [key]: event.target.value } : metric))
  }));

  const testimonial = cs.testimonial || { quote: '', author: '', role: '' };
  const setQuote = (key) => (event) => {
    const next = { ...testimonial, [key]: event.target.value };
    setCs((prev) => ({ ...prev, testimonial: next.quote || next.author || next.role ? next : null }));
  };

  if (loading) return <p className="ad-loading" role="status">Loading…</p>;

  const toc = [['cs-client', 'Client'], ['cs-story', 'Case study'], ['cs-seo', 'Search listing'], ['cs-results', 'Key results'],
    ['cs-timeline', 'Timeline'], ['cs-images', 'Project images'], ['cs-quote', 'Testimonial'], ['cs-pdf', 'Case study PDF']];

  return (
    <>
      <div className="ad-editor-head">
        <button type="button" className="ad-back" onClick={onBack}><ArrowLeft size={16} /> All clients</button>
        <div className="ad-editor-actions">
          <span className={`ad-pill ad-pill-${cs.status === 'published' ? 'live' : 'draft'}`}>{cs.status === 'published' ? 'Published' : 'Draft'}</span>
          {currentSlug ? <a className="ad-ghost" href={`/clients/stories/${currentSlug}`} target="_blank" rel="noopener noreferrer"><Eye size={15} /> Preview</a> : null}
          <button type="button" className="ad-ghost" onClick={() => persist(null)} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          {cs.status === 'published'
            ? <button type="button" className="ad-ghost" onClick={() => changeStatus('draft')} disabled={busy}>Unpublish</button>
            : <button type="button" className="ad-primary" onClick={() => persist('published')} disabled={busy}><Check size={16} /> Publish</button>}
        </div>
      </div>

      {message ? <p className="ad-msg ad-msg-ok" role="status"><Check size={16} /> {message}</p> : null}
      {error ? <p className="ad-msg ad-msg-err" role="alert"><AlertCircle size={16} /> {error}</p> : null}

      <div className="ad-editor-layout">
        <div>
          <section className="ad-card" id="cs-client">
            <h2><span className="ad-card-icon"><Building2 size={17} /></span> Client</h2>
            <p className="ad-note"><Info size={15} aria-hidden="true" /> Leave anything you cannot confirm blank — empty sections are not rendered on the public page.</p>
            <div className="ad-grid">
              <Field label="Client name *"><input value={form.name} onChange={set('name')} /></Field>
              <Field label="Website URL"><input value={form.website} onChange={set('website')} placeholder="https://" /></Field>
              <Field label="Industry">
                <select value={form.industry} onChange={set('industry')}>
                  <option value="">Not set</option>
                  {options.industries.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Logo" hint={`PNG, JPEG or WebP, under ${MAX_UPLOAD_MB} MB`}>
                <div className="ad-upload">
                  {form.logo ? <img className="ad-thumb" src={form.logo} alt="" /> : null}
                  <label className="ad-file"><Upload size={15} /> Choose file
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => upload(event, ([file]) => setForm((prev) => ({ ...prev, logo: file.url, logoMediaId: file.id })))} />
                  </label>
                  {form.logo ? <button type="button" className="ad-x" onClick={() => setForm((prev) => ({ ...prev, logo: '', logoMediaId: null }))} aria-label="Remove logo"><X size={15} /></button> : null}
                </div>
              </Field>
            </div>

            <Field label="Card description" hint="One or two lines shown on the clients grid">
              <textarea rows={2} value={form.description} onChange={set('description')} />
            </Field>

            <fieldset className="ad-fieldset">
              <legend>Solutions</legend>
              <div className="ad-checks">
                {options.solutions.map((item) => (
                  <label key={item} className={form.solutions.includes(item) ? 'is-on' : ''}>
                    <input type="checkbox" checked={form.solutions.includes(item)} onChange={() => toggleSolution(item)} /> {item}
                  </label>
                ))}
              </div>
            </fieldset>

            <ListField label="Service tags" hint="Comma separated" value={form.tags} onChange={(tags) => setForm((prev) => ({ ...prev, tags }))} />
          </section>

          <section className="ad-card" id="cs-story">
            <h2><span className="ad-card-icon"><BookOpen size={17} /></span> Case study</h2>
            <p className="ad-note"><Info size={15} aria-hidden="true" /> Nothing here is pre-filled. Do not enter a metric, outcome or quote the client has not confirmed.</p>

            <div className="ad-grid">
              <Field label="Case study title" hint="Defaults to the client name"><input value={cs.title} onChange={setCase('title')} /></Field>
              <Field label="Hero image" hint="Optional banner behind the title">
                <div className="ad-upload">
                  {cs.heroImage ? <img className="ad-thumb" src={cs.heroImage} alt="" /> : null}
                  <label className="ad-file"><Upload size={15} /> Choose file
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => upload(event, ([file]) => setCs((prev) => ({ ...prev, heroImage: file.url, heroMediaId: file.id })))} />
                  </label>
                  {cs.heroImage ? <button type="button" className="ad-x" onClick={() => setCs((prev) => ({ ...prev, heroImage: '', heroMediaId: null }))} aria-label="Remove hero image"><X size={15} /></button> : null}
                </div>
              </Field>
            </div>

            <div className="ad-sub" id="cs-seo">
              <h3>Search engine listing</h3>
              <p className="ad-hint">Used for the page title, meta description, Open Graph tags and structured data. Left blank, the client name and project summary are used.</p>
              <div className="ad-grid">
                <Field label="SEO title" hint="Around 60 characters"><input value={cs.seoTitle} onChange={setCase('seoTitle')} maxLength={190} /></Field>
                <Field label="Keywords" hint="Comma separated"><input value={cs.keywords} onChange={setCase('keywords')} maxLength={500} /></Field>
              </div>
              <Field label="Meta description" hint="Around 155 characters"><textarea rows={2} value={cs.metaDescription} onChange={setCase('metaDescription')} maxLength={320} /></Field>
              <div className="ad-grid">
                <Field label="Open Graph title" hint="Defaults to the SEO title"><input value={cs.ogTitle} onChange={setCase('ogTitle')} maxLength={190} /></Field>
                <Field label="Open Graph description" hint="Defaults to the meta description"><input value={cs.ogDescription} onChange={setCase('ogDescription')} maxLength={320} /></Field>
              </div>
            </div>

            <div className="ad-sub">
              <Field label="Project summary"><textarea rows={2} value={cs.summary} onChange={setCase('summary')} /></Field>
              <Field label="Executive summary"><textarea rows={3} value={cs.executiveSummary} onChange={setCase('executiveSummary')} /></Field>
              <Field label="About the client"><textarea rows={3} value={cs.aboutClient} onChange={setCase('aboutClient')} /></Field>
              <Field label="The challenge"><textarea rows={3} value={cs.challenge} onChange={setCase('challenge')} /></Field>
              <Field label="Our solution"><textarea rows={3} value={cs.solution} onChange={setCase('solution')} /></Field>

              <ListField label="Services delivered" hint="Comma separated" value={cs.services} onChange={(services) => setCs((prev) => ({ ...prev, services }))} />
              <ListField label="Technologies used" hint="Comma separated" value={cs.technologies} onChange={(technologies) => setCs((prev) => ({ ...prev, technologies }))} />
            </div>

            <div className="ad-sub" id="cs-results">
              <h3>Key results</h3>
              <p className="ad-hint">Only add a number the client has confirmed.</p>
              {cs.metrics.map((metric, index) => (
                <div className="ad-row" key={`metric-${index}`}>
                  <input value={metric.value} onChange={metricRow(index, 'value')} placeholder="Value, e.g. 42%" />
                  <input value={metric.label} onChange={metricRow(index, 'label')} placeholder="Label" />
                  <input value={metric.caption || ''} onChange={metricRow(index, 'caption')} placeholder="Caption (optional)" />
                  <button type="button" className="ad-x" onClick={() => setCs((prev) => ({ ...prev, metrics: prev.metrics.filter((_, i) => i !== index) }))} aria-label="Remove metric"><Trash2 size={15} /></button>
                </div>
              ))}
              <button type="button" className="ad-add" onClick={() => setCs((prev) => ({ ...prev, metrics: [...prev.metrics, { value: '', label: '', caption: '' }] }))}><Plus size={15} /> Add metric</button>
            </div>

            <div className="ad-sub" id="cs-timeline">
              <h3>Implementation timeline</h3>
              <p className="ad-hint">Add only the stages that actually happened.</p>
              {cs.timeline.map((step, index) => (
                <div className="ad-row" key={`stage-${index}`}>
                  <input list="ad-stages" value={step.stage} onChange={timelineRow(index, 'stage')} placeholder="Stage" />
                  <input value={step.title || ''} onChange={timelineRow(index, 'title')} placeholder="Short title (optional)" />
                  <input value={step.detail || ''} onChange={timelineRow(index, 'detail')} placeholder="Detail (optional)" />
                  <button type="button" className="ad-x" onClick={() => setCs((prev) => ({ ...prev, timeline: prev.timeline.filter((_, i) => i !== index) }))} aria-label="Remove stage"><Trash2 size={15} /></button>
                </div>
              ))}
              <datalist id="ad-stages">{projectStages.map((stage) => <option key={stage} value={stage} />)}</datalist>
              <button type="button" className="ad-add" onClick={() => setCs((prev) => ({ ...prev, timeline: [...prev.timeline, { stage: '', title: '', detail: '' }] }))}><Plus size={15} /> Add stage</button>
            </div>

            <div className="ad-sub" id="cs-images">
              <h3>Project images</h3>
              <div className="ad-gallery">
                {cs.images.map((image, index) => (
                  <div className="ad-gallery-item" key={`img-${index}`}>
                    <img src={image.src} alt="" />
                    <input
                      value={image.alt || ''}
                      placeholder="Alt text"
                      onChange={(event) => setCs((prev) => ({ ...prev, images: prev.images.map((item, i) => (i === index ? { ...item, alt: event.target.value } : item)) }))}
                    />
                    <button type="button" className="ad-x" onClick={() => setCs((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))} aria-label="Remove image"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              <label className="ad-file"><Upload size={15} /> Upload images
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={(event) => upload(event, (files) => setCs((prev) => ({ ...prev, images: [...prev.images, ...files.map((file) => ({ src: file.url, mediaId: file.id, alt: '' }))] })))} />
              </label>
            </div>

            <div className="ad-sub">
              <Field label="Results and outcomes"><textarea rows={3} value={cs.results} onChange={setCase('results')} /></Field>
            </div>

            <div className="ad-sub" id="cs-quote">
              <h3>Client testimonial</h3>
              <p className="ad-hint">Only paste a quote the client actually gave and approved.</p>
              <Field label="Quote"><textarea rows={2} value={testimonial.quote} onChange={setQuote('quote')} /></Field>
              <div className="ad-grid">
                <Field label="Author"><input value={testimonial.author} onChange={setQuote('author')} /></Field>
                <Field label="Role"><input value={testimonial.role} onChange={setQuote('role')} /></Field>
              </div>
              <Field label="Conclusion"><textarea rows={3} value={cs.conclusion} onChange={setCase('conclusion')} /></Field>
            </div>

            <div className="ad-sub" id="cs-pdf">
              <h3>Case study PDF</h3>
              <div className="ad-upload">
                {cs.pdf ? <span className="ad-pdf"><FileText size={15} /> {cs.pdf.name}</span> : null}
                <label className="ad-file"><Upload size={15} /> Upload PDF
                  <input type="file" accept="application/pdf" onChange={(event) => upload(event, ([file]) => setCs((prev) => ({ ...prev, pdf: { name: file.name, src: file.url }, pdfMediaId: file.id })))} />
                </label>
                {cs.pdf ? <button type="button" className="ad-x" onClick={() => setCs((prev) => ({ ...prev, pdf: null, pdfMediaId: null }))} aria-label="Remove PDF"><X size={15} /></button> : null}
              </div>
            </div>
          </section>

          <div className="ad-foot">
            {currentSlug ? <button type="button" className="ad-danger" onClick={remove}><Trash2 size={15} /> Delete client</button> : null}
            <button type="button" className="ad-ghost" onClick={() => persist(null)} disabled={busy}>Save</button>
            {cs.status !== 'published' ? <button type="button" className="ad-primary" onClick={() => persist('published')} disabled={busy}><Check size={16} /> Publish</button> : null}
          </div>
        </div>

        <nav className="ad-toc" aria-label="Sections">
          <h4>On this page</h4>
          {toc.map(([id, text]) => <a key={id} href={`#${id}`} onClick={(event) => { event.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{text}</a>)}
        </nav>
      </div>
    </>
  );
}

// -------------------------------------------------------------------- app
const NAV_GROUPS = [
  { title: 'Workspace', items: [{ to: '/admin', text: 'Overview', icon: LayoutDashboard }] },
  { title: 'Inbox', items: [
    { to: '/admin/enquiries', text: 'Enquiries', icon: Mail, badge: 'newEnquiries' },
    { to: '/admin/applications', text: 'Applications', icon: Inbox, badge: 'newApplications' }
  ] },
  { title: 'Content', items: [
    { to: '/admin/jobs', text: 'Jobs', icon: Briefcase },
    { to: '/admin/clients', text: 'Clients', icon: Users },
    { to: '/admin/pages', text: 'Policy pages', icon: ScrollText }
  ] },
  { title: 'Settings', items: [
    { to: '/admin/team', text: 'Team', icon: UserCog },
    { to: '/admin/account', text: 'Account', icon: KeyRound }
  ] }
];

// sections each role may open; the API enforces the same rules
const HR_SECTIONS = ['', 'enquiries', 'applications', 'jobs', 'account'];
const canOpen = (role, section) => (role === 'hr' ? HR_SECTIONS.includes(section) : section !== 'team' || role === 'admin');

const TITLES = { '': 'Overview', enquiries: 'Enquiries', applications: 'Job applications', jobs: 'Jobs', clients: 'Clients & case studies', pages: 'Policy pages', team: 'Team', account: 'Account' };
const SUBTITLES = {
  enquiries: 'Messages sent from the Contact page.',
  applications: 'Candidates who applied from the careers pages.',
  jobs: 'Open roles shown on the careers page.',
  clients: 'Client logos and the case studies behind them.',
  pages: 'Privacy, terms and other footer pages.',
  team: 'Who can sign in to this admin, and what they can see.',
  account: 'Your password and notification settings.'
};

export function AdminApp({ path: initialPath }) {
  const [user, setUser] = useState(undefined);   // undefined = still checking
  const [location, setLocation] = useState(() => ({ path: initialPath, search: window.location.search }));
  const [theme, setTheme] = usePref('srisun-admin-theme', systemTheme);
  const [collapsed, setCollapsed] = usePref('srisun-admin-rail', () => 'false');
  const [drawer, setDrawer] = useState(false);
  const [counts, setCounts] = useState(null);

  useEffect(() => { fetchMe().then(setUser).catch(() => setUser(null)); }, []);
  useEffect(() => { if (user && user.role !== 'hr') refreshPush(); }, [user]);
  // unread counts for the sidebar badges, refreshed as you move around
  useEffect(() => { if (user) adminStats().then(setCounts).catch(() => {}); }, [user, location.path, location.search]);

  const go = useCallback((to) => {
    const url = new URL(to, window.location.origin);
    window.history.pushState({}, '', url.pathname + url.search);
    setLocation({ path: url.pathname, search: url.search });
    setDrawer(false);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPop = () => setLocation({ path: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setDrawer(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [drawer]);

  if (user === undefined) return <main className="ad-page ad-session" data-theme={theme}><p className="ad-loading" role="status">Checking your session…</p></main>;
  if (!user) return <LoginScreen onSignedIn={setUser} theme={theme} />;

  const [, , requested = '', item] = location.path.replace(/\/+$/, '').split('/');
  const section = canOpen(user.role, requested) ? requested : '';
  const readOnly = user.role === 'hr';
  const params = new URLSearchParams(location.search);
  let content;
  if (section === 'enquiries') content = <Enquiries readOnly={readOnly} />;
  else if (section === 'team') content = <Team user={user} />;
  else if (section === 'applications') content = <Applications key={location.search} initialJob={params.get('job') || ''} />;
  else if (section === 'jobs') content = item ? <JobEditor key={item} slug={item} go={go} /> : <JobsList go={go} />;
  else if (section === 'clients') content = item
    ? <Editor key={item} slug={item} onBack={() => go('/admin/clients')} />
    : <Dashboard onOpen={(slug) => go(`/admin/clients/${slug}`)} />;
  else if (section === 'pages') content = item ? <PageEditor key={item} slug={item} go={go} /> : <PagesList go={go} />;
  else if (section === 'account') content = <Account user={user} />;
  else content = <Overview go={go} role={user.role} name={user.name} />;

  const isRail = collapsed === 'true';
  const signOut = () => apiLogout().then(() => setUser(null));
  // editors carry their own sticky header, so the page title is left out
  const showHead = !item && section !== '';

  return (
    <div className="ad-page ad-shell" data-theme={theme} data-collapsed={isRail}>
      <aside className="ad-side" data-open={drawer} aria-label="Admin navigation">
        <div className="ad-side-brand">
          <img src={LOGO} alt="" />
          <span className="ad-side-brand-text"><strong>SRISUN</strong><small>Admin console</small></span>
          <button type="button" className="ad-side-collapse" onClick={() => setCollapsed(isRail ? 'false' : 'true')} aria-label={isRail ? 'Expand sidebar' : 'Collapse sidebar'} title={isRail ? 'Expand' : 'Collapse'}>
            {isRail ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
        <nav className="ad-side-nav">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter(({ to }) => canOpen(user.role, to.split('/')[2] || ''));
            if (!items.length) return null;
            return (
              <div key={group.title}>
                <p className="ad-side-group">{group.title}</p>
                {items.map(({ to, text, icon: Icon, badge }) => {
                  const active = to === '/admin' ? section === '' : location.path.startsWith(to);
                  const count = badge ? counts?.[badge] : 0;
                  return (
                    <a key={to} href={to} className={`ad-side-link${active ? ' is-on' : ''}`} aria-current={active ? 'page' : undefined} title={isRail ? text : undefined}
                      onClick={(event) => { event.preventDefault(); go(to); }}>
                      <Icon size={18} aria-hidden="true" /> <span>{text}</span>
                      {count ? <b className="ad-side-badge" aria-label={`${count} new`}>{count > 99 ? '99+' : count}</b> : null}
                    </a>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="ad-side-user">
          <Avatar name={user.name} />
          <span className="ad-side-user-text"><strong>{user.name}</strong><span>{user.email}</span></span>
          <button type="button" className="ad-side-signout" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
        </div>
      </aside>
      <div className="ad-scrim" data-open={drawer} onClick={() => setDrawer(false)} aria-hidden="true" />

      <div className="ad-main">
        <header className="ad-top">
          <button type="button" className="ad-icon-btn ad-menu-btn" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={18} /></button>
          <div className="ad-crumbs">
            <span>Admin</span><ChevronRight size={14} aria-hidden="true" />
            <strong>{TITLES[section] ?? 'Overview'}</strong>
          </div>
          <div className="ad-top-actions">
            <span className="ad-role-chip"><ShieldCheck size={13} /> {user.role}</span>
            <a className="ad-ghost ad-top-site" href="/" target="_blank" rel="noopener noreferrer" aria-label="View site"><ExternalLink size={15} /> <span>View site</span></a>
            <button type="button" className="ad-icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title="Toggle theme">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>
        <div className="ad-inner">
          {showHead ? (
            <header className="ad-head">
              <div>
                <h1>{TITLES[section]}</h1>
                {SUBTITLES[section] ? <p>{SUBTITLES[section]}</p> : null}
              </div>
            </header>
          ) : null}
          <div className="ad-view" key={location.path}>{content}</div>
        </div>
      </div>
    </div>
  );
}
