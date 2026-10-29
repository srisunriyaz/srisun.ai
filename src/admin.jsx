// Srisun admin: enquiries, job applications, jobs, clients and case studies.
//
// Every read and write goes to the /api/v1 REST API over a session cookie set
// by the server; authorisation is enforced server-side on every endpoint and
// the browser holds no copy of the data.

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Eye, Upload, X, Check, Info, FileText, Search, LogOut, AlertCircle, LayoutDashboard, Mail, Inbox, Briefcase, Users, KeyRound, ScrollText } from 'lucide-react';
import {
  fetchMe, login as apiLogin, logout as apiLogout,
  adminStats, adminClients, adminClient, createClient, updateClient, removeClient, setStatus, uploadFile
} from './apiClient.js';
import { emptyCaseStudy, caseStudyPath, isPublished, projectStages } from './clientsApi.js';
import { fetchTaxonomies } from './apiClient.js';
import { Overview, Enquiries, Applications, JobsList, JobEditor, PagesList, PageEditor, Account } from './adminSections.jsx';
import './admin.css';

const MAX_UPLOAD_MB = 4;

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

// ---------------------------------------------------------------- sign in
function LoginScreen({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <main className="ad-page ad-login-page">
      <form className="ad-login" onSubmit={submit}>
        <h1>Srisun admin</h1>
        <p>Sign in to see enquiries and applications, and to manage jobs and client stories.</p>
        {error ? <p className="ad-msg ad-msg-err" role="alert">{error}</p> : null}
        <Field label="Email">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
        </Field>
        <Field label="Password">
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </Field>
        <button type="submit" className="ad-primary ad-login-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
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

  return (
    <>
      <div className="ad-stats">
        <div className="ad-stat"><strong>{stats?.clients ?? 0}</strong><span>Clients</span></div>
        <div className="ad-stat"><strong>{stats?.published ?? 0}</strong><span>Published case studies</span></div>
        <div className="ad-stat"><strong>{stats?.drafts ?? 0}</strong><span>Drafts</span></div>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search">
          <Search size={17} aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients..." aria-label="Search clients" />
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

      <table className="ad-table">
        <thead>
          <tr><th>Client</th><th>Industry</th><th>Case study</th><th aria-label="Actions" /></tr>
        </thead>
        <tbody>
          {visible.map((client) => (
            <tr key={client.id}>
              <td>
                <div className="ad-cell-client">
                  {client.logo ? <img src={client.logo} alt="" /> : <span className="ad-mono" aria-hidden="true">{client.name.slice(0, 2).toUpperCase()}</span>}
                  <div>
                    <strong>{client.name}</strong>
                    <span>{client.website || 'No website recorded'}</span>
                  </div>
                </div>
              </td>
              <td>{client.industry || <em>Not set</em>}</td>
              <td><span className={`ad-pill ad-pill-${isPublished(client) ? 'live' : 'draft'}`}>{isPublished(client) ? 'Published' : 'Draft'}</span></td>
              <td className="ad-row-actions">
                <button type="button" className="ad-link" onClick={() => onOpen(client.id)}>Edit</button>
                <a href={caseStudyPath(client)} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${client.name}`}><Eye size={15} /></a>
              </td>
            </tr>
          ))}
          {visible.length === 0 ? <tr><td colSpan={4} className="ad-empty">No clients match that search.</td></tr> : null}
        </tbody>
      </table>
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

  return (
    <>
      <div className="ad-editor-head">
        <button type="button" className="ad-back" onClick={onBack}><ArrowLeft size={16} /> All clients</button>
        <div className="ad-editor-actions">
          <span className={`ad-pill ad-pill-${cs.status === 'published' ? 'live' : 'draft'}`}>{cs.status === 'published' ? 'Published' : 'Draft'}</span>
          {currentSlug ? <a className="ad-ghost" href={`/clients/stories/${currentSlug}`} target="_blank" rel="noopener noreferrer"><Eye size={15} /> Preview</a> : null}
          <button type="button" className="ad-ghost" onClick={() => persist(null)} disabled={busy}>Save</button>
          {cs.status === 'published'
            ? <button type="button" className="ad-ghost" onClick={() => changeStatus('draft')} disabled={busy}>Unpublish</button>
            : <button type="button" className="ad-primary" onClick={() => persist('published')} disabled={busy}><Check size={16} /> Publish</button>}
        </div>
      </div>

      {message ? <p className="ad-msg ad-msg-ok" role="status">{message}</p> : null}
      {error ? <p className="ad-msg ad-msg-err" role="alert"><AlertCircle size={16} /> {error}</p> : null}

      <section className="ad-card">
        <h2>Client</h2>
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

      <section className="ad-card">
        <h2>Case study</h2>
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

        <div className="ad-sub">
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

        <Field label="Project summary"><textarea rows={2} value={cs.summary} onChange={setCase('summary')} /></Field>
        <Field label="Executive summary"><textarea rows={3} value={cs.executiveSummary} onChange={setCase('executiveSummary')} /></Field>
        <Field label="About the client"><textarea rows={3} value={cs.aboutClient} onChange={setCase('aboutClient')} /></Field>
        <Field label="The challenge"><textarea rows={3} value={cs.challenge} onChange={setCase('challenge')} /></Field>
        <Field label="Our solution"><textarea rows={3} value={cs.solution} onChange={setCase('solution')} /></Field>

        <ListField label="Services delivered" hint="Comma separated" value={cs.services} onChange={(services) => setCs((prev) => ({ ...prev, services }))} />
        <ListField label="Technologies used" hint="Comma separated" value={cs.technologies} onChange={(technologies) => setCs((prev) => ({ ...prev, technologies }))} />

        <div className="ad-sub">
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

        <div className="ad-sub">
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

        <div className="ad-sub">
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

        <Field label="Results and outcomes"><textarea rows={3} value={cs.results} onChange={setCase('results')} /></Field>

        <div className="ad-sub">
          <h3>Client testimonial</h3>
          <p className="ad-hint">Only paste a quote the client actually gave and approved.</p>
          <Field label="Quote"><textarea rows={2} value={testimonial.quote} onChange={setQuote('quote')} /></Field>
          <div className="ad-grid">
            <Field label="Author"><input value={testimonial.author} onChange={setQuote('author')} /></Field>
            <Field label="Role"><input value={testimonial.role} onChange={setQuote('role')} /></Field>
          </div>
        </div>

        <Field label="Conclusion"><textarea rows={3} value={cs.conclusion} onChange={setCase('conclusion')} /></Field>

        <div className="ad-sub">
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
    </>
  );
}

// -------------------------------------------------------------------- app
const NAV = [
  { to: '/admin', text: 'Overview', icon: LayoutDashboard },
  { to: '/admin/enquiries', text: 'Enquiries', icon: Mail },
  { to: '/admin/applications', text: 'Applications', icon: Inbox },
  { to: '/admin/jobs', text: 'Jobs', icon: Briefcase },
  { to: '/admin/clients', text: 'Clients', icon: Users },
  { to: '/admin/pages', text: 'Policy pages', icon: ScrollText },
  { to: '/admin/account', text: 'Account', icon: KeyRound }
];

const TITLES = { '': 'Overview', enquiries: 'Enquiries', applications: 'Job applications', jobs: 'Jobs', clients: 'Clients & case studies', pages: 'Policy pages', account: 'Account' };

export function AdminApp({ path: initialPath }) {
  const [user, setUser] = useState(undefined);   // undefined = still checking
  const [location, setLocation] = useState(() => ({ path: initialPath, search: window.location.search }));

  useEffect(() => { fetchMe().then(setUser).catch(() => setUser(null)); }, []);

  const go = useCallback((to) => {
    const url = new URL(to, window.location.origin);
    window.history.pushState({}, '', url.pathname + url.search);
    setLocation({ path: url.pathname, search: url.search });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPop = () => setLocation({ path: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (user === undefined) return <main className="ad-page"><p className="ad-loading" role="status">Checking your session…</p></main>;
  if (!user) return <LoginScreen onSignedIn={setUser} />;

  const [, , section = '', item] = location.path.replace(/\/+$/, '').split('/');
  const params = new URLSearchParams(location.search);
  let content;
  if (section === 'enquiries') content = <Enquiries />;
  else if (section === 'applications') content = <Applications key={location.search} initialJob={params.get('job') || ''} />;
  else if (section === 'jobs') content = item ? <JobEditor key={item} slug={item} go={go} /> : <JobsList go={go} />;
  else if (section === 'clients') content = item
    ? <Editor key={item} slug={item} onBack={() => go('/admin/clients')} />
    : <Dashboard onOpen={(slug) => go(`/admin/clients/${slug}`)} />;
  else if (section === 'pages') content = item ? <PageEditor key={item} slug={item} go={go} /> : <PagesList go={go} />;
  else if (section === 'account') content = <Account user={user} />;
  else content = <Overview go={go} />;

  return (
    <main className="ad-page ad-shell">
      <nav className="ad-nav" aria-label="Admin">
        <span className="ad-brand">Srisun admin</span>
        {NAV.map(({ to, text, icon: Icon }) => {
          const active = to === '/admin' ? section === '' : location.path.startsWith(to);
          return (
            <a key={to} href={to} className={active ? 'is-on' : ''} aria-current={active ? 'page' : undefined}
              onClick={(event) => { event.preventDefault(); go(to); }}>
              <Icon size={17} aria-hidden="true" /> {text}
            </a>
          );
        })}
      </nav>
      <div className="ad-inner">
        <header className="ad-head">
          <div>
            <h1>{TITLES[section] ?? 'Overview'}</h1>
            <p>Signed in as {user.name} ({user.role})</p>
          </div>
          <div className="ad-head-actions">
            <a className="ad-ghost" href="/" target="_blank" rel="noopener noreferrer">View site</a>
            <button type="button" className="ad-ghost" onClick={() => apiLogout().then(() => setUser(null))}><LogOut size={15} /> Sign out</button>
          </div>
        </header>
        {content}
      </div>
    </main>
  );
}
