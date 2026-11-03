// Admin sections beyond clients: overview, enquiries, job applications, jobs,
// policy pages and the account page. Every list is read from the API on open; nothing is
// kept in browser storage.

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, Download, Eye, Inbox, Briefcase, Mail, Plus, Search, Trash2, Users } from 'lucide-react';
import {
  adminStats, adminEnquiries, updateEnquiry, removeEnquiry,
  adminApplications, updateApplication, removeApplication, resumeUrl,
  adminJobs, adminJob, createJob, updateJob, removeJob, changePassword,
  adminPages, adminPage, updatePage,
  pushDevices, updatePushDevice, removePushDevice, sendTestPush
} from './apiClient.js';
import { pushSupported, permission, enablePush, currentToken, forgetLocalToken } from './push.js';
import { PolicyText } from './subpages.jsx';

const formatDate = (value) => new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const formatSize = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const label = (value) => value.replace('_', ' ').replace(/^./, (c) => c.toUpperCase());

function useLoad(load, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    return load().then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error: error.message }));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, [reload]);
  return [state, reload, setState];
}

const Loading = () => <p className="ad-loading" role="status">Loading…</p>;
const ErrorLine = ({ message }) => <p className="ad-msg ad-msg-err" role="alert"><AlertCircle size={16} /> {message}</p>;

function Segments({ value, options, onChange, ariaLabel }) {
  return (
    <div className="ad-seg" role="group" aria-label={ariaLabel}>
      {options.map(([key, text]) => (
        <button type="button" key={key} className={value === key ? 'is-on' : ''} aria-pressed={value === key} onClick={() => onChange(key)}>{text}</button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- overview
export function Overview({ go }) {
  const [{ data, loading, error }] = useLoad(() => adminStats(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorLine message={error} />;
  const cards = [
    { icon: Mail, value: data.newEnquiries, text: 'New enquiries', sub: `${data.enquiries} in total`, to: '/admin/enquiries' },
    { icon: Inbox, value: data.newApplications, text: 'New applications', sub: `${data.applications} in total`, to: '/admin/applications' },
    { icon: Briefcase, value: data.openJobs, text: 'Open jobs', sub: `${data.jobs} in total`, to: '/admin/jobs' },
    { icon: Users, value: data.clients, text: 'Clients', sub: `${data.published} published case studies`, to: '/admin/clients' }
  ];
  return (
    <div className="ad-overview">
      {cards.map(({ icon: Icon, value, text, sub, to }) => (
        <button type="button" className="ad-ov-card" key={to} onClick={() => go(to)}>
          <Icon size={20} aria-hidden="true" />
          <strong>{value}</strong>
          <span>{text}</span>
          <small>{sub}</small>
        </button>
      ))}
    </div>
  );
}

// --------------------------------------------------------------- enquiries
const ENQUIRY_STATUSES = ['new', 'in_progress', 'closed'];

export function Enquiries() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  // a push notification links here with ?open=<id>
  const [openId, setOpenId] = useState(() => Number(new URLSearchParams(window.location.search).get('open')) || null);
  const [{ data, loading, error }, , setState] = useLoad(() => adminEnquiries(filter === 'all' ? {} : { status: filter }), [filter]);
  const [actionError, setActionError] = useState(null);

  const patch = async (id, changes) => {
    setActionError(null);
    try {
      const saved = await updateEnquiry(id, changes);
      setState((prev) => ({ ...prev, data: prev.data.map((item) => (item.id === id ? saved : item)) }));
      return true;
    } catch (patchError) { setActionError(patchError.message); return false; }
  };
  useEffect(() => {
    const linked = data?.find((item) => item.id === openId);
    if (!linked) return;
    document.getElementById(`enquiry-${linked.id}`)?.scrollIntoView({ block: 'center' });
    if (linked.status === 'new') patch(linked.id, { status: 'in_progress' });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const remove = async (item) => {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await removeEnquiry(item.id);
      setState((prev) => ({ ...prev, data: prev.data.filter((row) => row.id !== item.id) }));
    } catch (deleteError) { setActionError(deleteError.message); }
  };

  const term = query.trim().toLowerCase();
  const visible = (data || []).filter((item) => !term || `${item.name} ${item.email} ${item.company} ${item.message}`.toLowerCase().includes(term));

  return (
    <>
      <div className="ad-toolbar">
        <div className="ad-search"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, company or message" aria-label="Search enquiries" /></div>
        <Segments value={filter} onChange={setFilter} ariaLabel="Filter by status" options={[['all', 'All'], ['new', 'Unread'], ['in_progress', 'In progress'], ['closed', 'Closed']]} />
      </div>
      {actionError ? <ErrorLine message={actionError} /> : null}
      {loading ? <Loading /> : error ? <ErrorLine message={error} /> : (
        <div className="ad-inbox">
          {visible.map((item) => (
            <InboxItem
              key={item.id}
              id={`enquiry-${item.id}`}
              open={openId === item.id}
              onToggle={() => {
                setOpenId(openId === item.id ? null : item.id);
                if (openId !== item.id && item.status === 'new') patch(item.id, { status: 'in_progress' });
              }}
              title={item.name}
              subtitle={[item.company, item.topic].filter(Boolean).join(' · ') || 'General enquiry'}
              preview={item.message}
              status={item.status}
              pill={item.status === 'new' ? 'Unread' : `Read · ${label(item.status)}`}
              date={item.createdAt}
            >
              <dl className="ad-details">
                <div><dt>Email</dt><dd><a href={`mailto:${item.email}`}>{item.email}</a></dd></div>
                {item.phone ? <div><dt>Phone</dt><dd><a href={`tel:${item.phone.replace(/[^\d+]/g, '')}`}>{item.phone}</a></dd></div> : null}
                {item.company ? <div><dt>Company</dt><dd>{item.company}</dd></div> : null}
                <div><dt>Enquiry type</dt><dd>{item.topic || 'General enquiry'}</dd></div>
                <div><dt>Received</dt><dd>{formatDate(item.createdAt)}</dd></div>
              </dl>
              <p className="ad-message">{item.message}</p>
              <ItemControls
                status={item.status}
                statuses={ENQUIRY_STATUSES}
                notes={item.notes}
                onSave={(changes) => patch(item.id, changes)}
                onDelete={() => remove(item)}
                extra={<a className="ad-ghost" href={`mailto:${item.email}?subject=${encodeURIComponent('Re: your enquiry to Srisun')}`}><Mail size={15} /> Reply by email</a>}
              />
            </InboxItem>
          ))}
          {visible.length === 0 ? <p className="ad-empty">{data?.length ? 'No enquiries match that search.' : 'No enquiries yet. Messages sent from the Contact page appear here.'}</p> : null}
        </div>
      )}
    </>
  );
}

function InboxItem({ id, open, onToggle, title, subtitle, preview, status, pill, date, children }) {
  return (
    <article id={id} className={`ad-inbox-item${open ? ' is-open' : ''}${status === 'new' ? ' is-new' : ''}`}>
      <button type="button" className="ad-inbox-head" onClick={onToggle} aria-expanded={open}>
        <span className="ad-inbox-who"><strong>{title}</strong><span>{subtitle}</span></span>
        {!open ? <span className="ad-inbox-preview">{preview}</span> : <span />}
        <span className={`ad-pill ad-pill-${status}`}>{pill || label(status)}</span>
        <time dateTime={date}>{formatDate(date)}</time>
      </button>
      {open ? <div className="ad-inbox-body">{children}</div> : null}
    </article>
  );
}

function ItemControls({ status, statuses, notes, onSave, onDelete, extra }) {
  const [draft, setDraft] = useState(notes);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(notes), [notes]);
  return (
    <div className="ad-controls">
      <label className="ad-field">
        <span className="ad-label">Status</span>
        <select value={status} onChange={(e) => onSave({ status: e.target.value })}>
          {statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}
        </select>
      </label>
      <label className="ad-field ad-notes">
        <span className="ad-label">Internal notes</span>
        <textarea rows={2} value={draft} maxLength={4000} onChange={(e) => { setDraft(e.target.value); setSaved(false); }} placeholder="Only visible to admins" />
      </label>
      <div className="ad-controls-actions">
        {extra}
        <button type="button" className="ad-ghost" disabled={draft === notes} onClick={async () => setSaved(await onSave({ notes: draft }))}>{saved ? <><Check size={15} /> Saved</> : 'Save notes'}</button>
        <button type="button" className="ad-danger" onClick={onDelete}><Trash2 size={15} /> Delete</button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ applications
const APPLICATION_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];

export function Applications({ initialJob = '' }) {
  const [filter, setFilter] = useState('all');
  const [job, setJob] = useState(initialJob);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [{ data: jobs }] = useLoad(() => adminJobs(), []);
  const [{ data, loading, error }, , setState] = useLoad(
    () => adminApplications({ ...(filter === 'all' ? {} : { status: filter }), ...(job ? { job } : {}) }),
    [filter, job]
  );

  const patch = async (id, changes) => {
    setActionError(null);
    try {
      const saved = await updateApplication(id, changes);
      setState((prev) => ({ ...prev, data: prev.data.map((item) => (item.id === id ? { ...item, ...saved } : item)) }));
      return true;
    } catch (patchError) { setActionError(patchError.message); return false; }
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete the application from ${item.firstName} ${item.lastName}, including their resume? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await removeApplication(item.id);
      setState((prev) => ({ ...prev, data: prev.data.filter((row) => row.id !== item.id) }));
    } catch (deleteError) { setActionError(deleteError.message); }
  };

  const term = query.trim().toLowerCase();
  const visible = (data || []).filter((item) => !term || `${item.firstName} ${item.lastName} ${item.email} ${item.skills} ${item.currentLocation}`.toLowerCase().includes(term));

  return (
    <>
      <div className="ad-toolbar">
        <div className="ad-search"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, skills or city" aria-label="Search applications" /></div>
        <select className="ad-select" value={job} onChange={(e) => setJob(e.target.value)} aria-label="Filter by job">
          <option value="">All jobs</option>
          {(jobs || []).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <Segments value={filter} onChange={setFilter} ariaLabel="Filter by status" options={[['all', 'All'], ...APPLICATION_STATUSES.map((s) => [s, label(s)])]} />
      </div>
      {actionError ? <ErrorLine message={actionError} /> : null}
      {loading ? <Loading /> : error ? <ErrorLine message={error} /> : (
        <div className="ad-inbox">
          {visible.map((item) => (
            <InboxItem
              key={item.id}
              open={openId === item.id}
              onToggle={() => {
                setOpenId(openId === item.id ? null : item.id);
                if (openId !== item.id && item.status === 'new') patch(item.id, { status: 'reviewing' });
              }}
              title={`${item.firstName} ${item.lastName}`}
              subtitle={`${item.jobTitle} · ${item.currentLocation}`}
              preview={item.skills}
              status={item.status}
              date={item.createdAt}
            >
              <dl className="ad-details">
                <div><dt>Role</dt><dd>{item.jobTitle}</dd></div>
                <div><dt>Email</dt><dd><a href={`mailto:${item.email}`}>{item.email}</a></dd></div>
                <div><dt>Phone</dt><dd><a href={`tel:${item.phone.replace(/[^\d+]/g, '')}`}>{item.phone}</a></dd></div>
                <div><dt>Location</dt><dd>{item.currentLocation}{item.preferredLocation ? ` · ${item.preferredLocation}` : ''}</dd></div>
                {item.experience ? <div><dt>Experience</dt><dd>{item.experience}</dd></div> : null}
                {item.employer ? <div><dt>Current employer</dt><dd>{item.employer}</dd></div> : null}
                {item.noticePeriod ? <div><dt>Notice period</dt><dd>{item.noticePeriod}</dd></div> : null}
                {item.portfolio ? <div><dt>Portfolio</dt><dd><a href={item.portfolio} target="_blank" rel="noopener noreferrer nofollow">{item.portfolio}</a></dd></div> : null}
                <div><dt>Applied</dt><dd>{formatDate(item.createdAt)}</dd></div>
              </dl>
              <p className="ad-message"><strong>Key skills:</strong> {item.skills}</p>
              <ItemControls
                status={item.status}
                statuses={APPLICATION_STATUSES}
                notes={item.notes}
                onSave={(changes) => patch(item.id, changes)}
                onDelete={() => remove(item)}
                extra={item.resume ? <a className="ad-primary" href={resumeUrl(item.id)}><Download size={15} /> Resume ({formatSize(item.resume.size)})</a> : null}
              />
            </InboxItem>
          ))}
          {visible.length === 0 ? <p className="ad-empty">{data?.length ? 'No applications match that search.' : 'No applications yet. Applications sent from the job pages appear here.'}</p> : null}
        </div>
      )}
    </>
  );
}

// -------------------------------------------------------------------- jobs
export function JobsList({ go }) {
  const [{ data, loading, error }] = useLoad(() => adminJobs(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorLine message={error} />;
  return (
    <>
      <div className="ad-toolbar">
        <p className="ad-hint ad-grow">Only jobs marked <strong>Open</strong> appear on the careers page. Closed jobs stop taking applications.</p>
        <button type="button" className="ad-primary" onClick={() => go('/admin/jobs/new')}><Plus size={16} /> Add job</button>
      </div>
      <table className="ad-table">
        <thead><tr><th>Job</th><th>Team</th><th>Status</th><th>Applications</th><th aria-label="Actions" /></tr></thead>
        <tbody>
          {data.map((job) => (
            <tr key={job.id}>
              <td><strong>{job.title}</strong><br /><span className="ad-sub-text">{[job.location, job.type].filter(Boolean).join(' · ')}</span></td>
              <td>{job.department || <em>Not set</em>}</td>
              <td><span className={`ad-pill ad-pill-${job.status}`}>{label(job.status)}</span></td>
              <td>{job.applications ? <button type="button" className="ad-link" onClick={() => go(`/admin/applications?job=${job.id}`)}>{job.applications} {job.applications === 1 ? 'application' : 'applications'}</button> : <span className="ad-sub-text">None yet</span>}</td>
              <td className="ad-row-actions">
                <button type="button" className="ad-link" onClick={() => go(`/admin/jobs/${job.id}`)}>Edit</button>
                {job.status === 'open' ? <a href={`/careers/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${job.title}`}><Eye size={15} /></a> : null}
              </td>
            </tr>
          ))}
          {data.length === 0 ? <tr><td colSpan={5} className="ad-empty">No jobs yet.</td></tr> : null}
        </tbody>
      </table>
    </>
  );
}

const emptyJob = { title: '', department: '', location: 'India · Multiple locations', type: 'Full time', summary: '', responsibilities: [], qualifications: [], status: 'draft' };
const lines = (list) => list.join('\n');
const toList = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

export function JobEditor({ slug, go }) {
  const creating = slug === 'new';
  const [form, setForm] = useState(emptyJob);
  const [text, setText] = useState({ responsibilities: '', qualifications: '' });
  const [currentSlug, setCurrentSlug] = useState(creating ? null : slug);
  const [loading, setLoading] = useState(!creating);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (creating) return;
    adminJob(slug)
      .then((job) => { setForm(job); setText({ responsibilities: lines(job.responsibilities), qualifications: lines(job.qualifications) }); setLoading(false); })
      .catch((loadError) => { setError(loadError.message); setLoading(false); });
  }, [slug, creating]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const save = async (status) => {
    setError(null);
    setMessage(null);
    if (!form.title.trim()) { setError('A job title is required.'); return; }
    setBusy(true);
    try {
      const payload = {
        title: form.title, department: form.department, location: form.location, type: form.type, summary: form.summary,
        responsibilities: toList(text.responsibilities), qualifications: toList(text.qualifications), status: status ?? form.status
      };
      const saved = currentSlug ? await updateJob(currentSlug, payload) : await createJob(payload);
      setForm(saved);
      if (!currentSlug) window.history.replaceState({}, '', `/admin/jobs/${saved.id}`);
      setCurrentSlug(saved.id);
      setMessage(saved.status === 'open' ? 'Saved. The job is live on the careers page.' : saved.status === 'closed' ? 'Saved. The job is closed and hidden from the careers page.' : 'Saved as a draft.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${form.title}"? Applications already received are kept.`)) return;
    try { await removeJob(currentSlug); go('/admin/jobs'); } catch (deleteError) { setError(deleteError.message); }
  };

  if (loading) return <Loading />;
  return (
    <>
      <div className="ad-editor-head">
        <button type="button" className="ad-back" onClick={() => go('/admin/jobs')}><ArrowLeft size={16} /> All jobs</button>
        <div className="ad-editor-actions">
          <span className={`ad-pill ad-pill-${form.status}`}>{label(form.status)}</span>
          {currentSlug && form.status === 'open' ? <a className="ad-ghost" href={`/careers/jobs/${currentSlug}`} target="_blank" rel="noopener noreferrer"><Eye size={15} /> View</a> : null}
          <button type="button" className="ad-ghost" onClick={() => save(null)} disabled={busy}>Save</button>
          {form.status === 'open'
            ? <button type="button" className="ad-ghost" onClick={() => save('closed')} disabled={busy}>Close job</button>
            : <button type="button" className="ad-primary" onClick={() => save('open')} disabled={busy}><Check size={16} /> Publish job</button>}
        </div>
      </div>
      {message ? <p className="ad-msg ad-msg-ok" role="status">{message}</p> : null}
      {error ? <ErrorLine message={error} /> : null}
      <section className="ad-card">
        <h2>Job details</h2>
        <div className="ad-grid">
          <label className="ad-field"><span className="ad-label">Job title *</span><input value={form.title} onChange={set('title')} maxLength={120} /></label>
          <label className="ad-field"><span className="ad-label">Team</span><input value={form.department} onChange={set('department')} maxLength={120} placeholder="e.g. Engineering & Technology" /></label>
          <label className="ad-field"><span className="ad-label">Location</span><input value={form.location} onChange={set('location')} maxLength={120} /></label>
          <label className="ad-field"><span className="ad-label">Work type</span>
            <input list="ad-job-types" value={form.type} onChange={set('type')} maxLength={60} />
            <datalist id="ad-job-types"><option value="Full time" /><option value="Part time" /><option value="Internship" /><option value="Contract" /></datalist>
          </label>
        </div>
        <label className="ad-field"><span className="ad-label">Summary *</span><span className="ad-hint">One or two sentences shown on the job list and at the top of the job page.</span><textarea rows={2} value={form.summary} onChange={set('summary')} maxLength={600} /></label>
        <label className="ad-field"><span className="ad-label">What you’ll work on</span><span className="ad-hint">One point per line.</span><textarea rows={5} value={text.responsibilities} onChange={(e) => setText((prev) => ({ ...prev, responsibilities: e.target.value }))} /></label>
        <label className="ad-field"><span className="ad-label">What will help you succeed</span><span className="ad-hint">One point per line.</span><textarea rows={5} value={text.qualifications} onChange={(e) => setText((prev) => ({ ...prev, qualifications: e.target.value }))} /></label>
      </section>
      <div className="ad-foot">
        {currentSlug ? <button type="button" className="ad-danger" onClick={remove}><Trash2 size={15} /> Delete job</button> : null}
        <button type="button" className="ad-ghost" onClick={() => save(null)} disabled={busy}>Save</button>
      </div>
    </>
  );
}

// ----------------------------------------------------------------- account
export function Account({ user }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [state, setState] = useState({ busy: false, message: null, error: null });
  const submit = async (event) => {
    event.preventDefault();
    if (form.next !== form.confirm) { setState({ busy: false, message: null, error: 'The new passwords do not match.' }); return; }
    setState({ busy: true, message: null, error: null });
    try {
      await changePassword(form.current, form.next);
      setForm({ current: '', next: '', confirm: '' });
      setState({ busy: false, message: 'Password changed. Other signed-in sessions were signed out.', error: null });
    } catch (error) {
      setState({ busy: false, message: null, error: error.message });
    }
  };
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  return (
    <>
    <PushSettings />
    <section className="ad-card ad-account">
      <h2>Your account</h2>
      <p className="ad-hint">Signed in as {user.email}</p>
      <form onSubmit={submit}>
        {state.message ? <p className="ad-msg ad-msg-ok" role="status">{state.message}</p> : null}
        {state.error ? <ErrorLine message={state.error} /> : null}
        <label className="ad-field"><span className="ad-label">Current password</span><input type="password" value={form.current} onChange={set('current')} autoComplete="current-password" required /></label>
        <label className="ad-field"><span className="ad-label">New password</span><span className="ad-hint">At least 12 characters, with letters and a number.</span><input type="password" value={form.next} onChange={set('next')} autoComplete="new-password" minLength={12} required /></label>
        <label className="ad-field"><span className="ad-label">Confirm new password</span><input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required /></label>
        <button type="submit" className="ad-primary" disabled={state.busy}>{state.busy ? 'Saving…' : 'Change password'}</button>
      </form>
    </section>
    </>
  );
}

// Push alerts for new enquiries, per browser/device.
function PushSettings() {
  const [{ data, loading, error }, reload, setState] = useLoad(() => pushDevices(), []);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState({ message: null, error: null });
  const run = async (work, success) => {
    setBusy(true); setNote({ message: null, error: null });
    try { await work(); if (success) setNote({ message: success, error: null }); }
    catch (runError) { setNote({ message: null, error: runError.message }); }
    finally { setBusy(false); }
  };
  const mine = currentToken();
  const supported = pushSupported();
  const blocked = permission() === 'denied';
  const devices = data?.devices || [];
  const replace = (saved) => setState((prev) => ({ ...prev, data: { ...prev.data, devices: prev.data.devices.map((item) => (item.id === saved.id ? saved : item)) } }));

  return (
    <section className="ad-card ad-account">
      <h2>Push notifications</h2>
      <p className="ad-hint">Get an alert on this browser or phone when a new enquiry arrives. Alerts show only the enquiry number and type; open the admin to read the details.</p>
      {note.message ? <p className="ad-msg ad-msg-ok" role="status">{note.message}</p> : null}
      {note.error ? <ErrorLine message={note.error} /> : null}
      {data && !data.configured ? <ErrorLine message="Push is not configured on the server yet." /> : null}
      {!supported ? <p className="ad-hint">This browser does not support push notifications. On iPhone, add the site to your Home Screen first.</p> : null}
      {blocked ? <p className="ad-hint">Notifications are blocked for this site. Allow them in your browser’s site settings, then turn them on here.</p> : null}
      <div className="ad-controls">
        {supported ? <button type="button" className="ad-primary" disabled={busy} onClick={() => run(async () => { await enablePush(); await reload(); }, 'Notifications are on for this device.')}>{busy ? 'Working…' : 'Turn on for this device'}</button> : null}
        {devices.some((item) => item.enabled) ? <button type="button" className="ad-ghost" disabled={busy} onClick={() => run(() => sendTestPush(), 'Test notification sent.')}>Send test notification</button> : null}
      </div>
      {loading ? <Loading /> : error ? <ErrorLine message={error} /> : (
        <table className="ad-table">
          <thead><tr><th>Device</th><th>Added</th><th>Last alert</th><th>Status</th><th /></tr></thead>
          <tbody>
            {devices.map((item) => (
              <tr key={item.id}>
                <td>{item.label}{mine?.endsWith(item.tokenTail) ? ' (this device)' : ''}<br /><small className="ad-hint">{item.origin}</small>{item.lastError ? <><br /><small className="ad-hint">Last failure: {item.lastError}</small></> : null}</td>
                <td>{formatDate(item.createdAt)}</td>
                <td>{item.lastSentAt ? formatDate(item.lastSentAt) : '—'}</td>
                <td><label><input type="checkbox" checked={item.enabled} disabled={busy} onChange={(event) => run(async () => replace(await updatePushDevice(item.id, { enabled: event.target.checked })))} /> {item.enabled ? 'On' : 'Off'}</label></td>
                <td><button type="button" className="ad-ghost" disabled={busy} onClick={() => run(async () => { await removePushDevice(item.id); if (mine?.endsWith(item.tokenTail)) forgetLocalToken(); await reload(); }, 'Device removed.')}><Trash2 size={15} /> Remove</button></td>
              </tr>
            ))}
            {devices.length === 0 ? <tr><td colSpan={5} className="ad-empty">No devices yet. Turn notifications on above.</td></tr> : null}
          </tbody>
        </table>
      )}
    </section>
  );
}

// ------------------------------------------------------------------- pages
export function PagesList({ go }) {
  const [{ data, loading, error }] = useLoad(() => adminPages(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorLine message={error} />;
  return (
    <>
      <p className="ad-hint ad-intro">Policy pages linked from the site footer. Published text appears on the site as soon as you save. Unpublished pages show a short contact panel instead.</p>
      <table className="ad-table">
        <thead><tr><th>Page</th><th>Status</th><th>Last updated</th><th aria-label="Actions" /></tr></thead>
        <tbody>
          {data.map((page) => (
            <tr key={page.slug}>
              <td><strong>{page.title}</strong><br /><span className="ad-sub-text">{page.path}</span></td>
              <td><span className={`ad-pill ad-pill-${page.status === 'published' ? 'live' : 'draft'}`}>{page.status === 'published' ? 'Published' : 'Draft'}</span></td>
              <td>{formatDate(page.updatedAt)}</td>
              <td className="ad-row-actions">
                <button type="button" className="ad-link" onClick={() => go(`/admin/pages/${page.slug}`)}>Edit</button>
                <a href={page.path} target="_blank" rel="noopener noreferrer" aria-label={`View ${page.title}`}><Eye size={15} /></a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function PageEditor({ slug, go }) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminPage(slug).then(setForm).catch((loadError) => setError(loadError.message));
  }, [slug]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const save = async (status) => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const saved = await updatePage(slug, { title: form.title, summary: form.summary, body: form.body, status: status ?? form.status });
      setForm(saved);
      setMessage(saved.status === 'published' ? 'Saved. The page is live on the site.' : 'Saved as a draft. The site shows the contact panel for this page.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  if (!form) return error ? <ErrorLine message={error} /> : <Loading />;
  return (
    <>
      <div className="ad-editor-head">
        <button type="button" className="ad-back" onClick={() => go('/admin/pages')}><ArrowLeft size={16} /> All pages</button>
        <div className="ad-editor-actions">
          <span className={`ad-pill ad-pill-${form.status === 'published' ? 'live' : 'draft'}`}>{form.status === 'published' ? 'Published' : 'Draft'}</span>
          <a className="ad-ghost" href={form.path} target="_blank" rel="noopener noreferrer"><Eye size={15} /> View</a>
          <button type="button" className="ad-ghost" onClick={() => save(null)} disabled={busy}>Save</button>
          {form.status === 'published'
            ? <button type="button" className="ad-ghost" onClick={() => save('draft')} disabled={busy}>Unpublish</button>
            : <button type="button" className="ad-primary" onClick={() => save('published')} disabled={busy}><Check size={16} /> Publish</button>}
        </div>
      </div>
      {message ? <p className="ad-msg ad-msg-ok" role="status">{message}</p> : null}
      {error ? <ErrorLine message={error} /> : null}
      <div className="ad-page-edit">
        <section className="ad-card">
          <h2>Page text</h2>
          <label className="ad-field"><span className="ad-label">Title *</span><input value={form.title} onChange={set('title')} maxLength={120} /></label>
          <label className="ad-field"><span className="ad-label">Summary</span><span className="ad-hint">One or two sentences shown under the title.</span><textarea rows={2} value={form.summary} onChange={set('summary')} maxLength={400} /></label>
          <label className="ad-field">
            <span className="ad-label">Policy text</span>
            <span className="ad-hint">Start a line with <code>## </code> for a heading and <code>- </code> for a bullet point. Leave a blank line between paragraphs.</span>
            <textarea className="ad-body-text" rows={22} value={form.body} onChange={set('body')} />
          </label>
        </section>
        <section className="ad-card ad-preview" aria-label="Preview">
          <h2>Preview</h2>
          <h3 className="ad-preview-title">{form.title}</h3>
          {form.summary ? <p className="ad-preview-summary">{form.summary}</p> : null}
          {form.body.trim() ? <PolicyText text={form.body} /> : <p className="ad-hint">Add the policy text to see a preview.</p>}
        </section>
      </div>
    </>
  );
}
