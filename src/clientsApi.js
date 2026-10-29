// React data hooks over the PHP REST API. The public endpoints return only
// published case studies; drafts never leave the server for anonymous callers.

import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchClients, fetchClient, fetchTaxonomies } from './apiClient.js';

export const projectStages = ['Discovery', 'Design', 'Development', 'Testing', 'Launch'];

export const caseStudyPath = (client) => `/clients/stories/${client.id}`;

export const isPublished = (client) => client?.caseStudy?.status === 'published';

export const hasCaseStudyContent = (client) => {
  const cs = client?.caseStudy;
  if (!cs) return false;
  return Boolean(
    cs.summary || cs.executiveSummary || cs.aboutClient || cs.challenge || cs.solution ||
    cs.results || cs.conclusion || cs.testimonial ||
    cs.services?.length || cs.technologies?.length || cs.timeline?.length ||
    cs.metrics?.length || cs.images?.length || cs.heroImage || cs.pdf
  );
};

export const emptyCaseStudy = () => ({
  status: 'draft',
  publishedAt: null,
  title: '', summary: '', heroImage: '',
  seoTitle: '', metaDescription: '', keywords: '', ogTitle: '', ogDescription: '',
  executiveSummary: '', aboutClient: '', challenge: '', solution: '',
  services: [], technologies: [], timeline: [], metrics: [],
  results: '', testimonial: null, conclusion: '', images: [], pdf: null
});

// ---------------------------------------------------------------------------

export function useTaxonomies() {
  const [data, setData] = useState({ industries: [], solutions: [] });
  useEffect(() => {
    const controller = new AbortController();
    fetchTaxonomies(controller.signal)
      .then(setData)
      .catch((error) => { if (error.name !== 'AbortError') setData({ industries: [], solutions: [] }); });
    return () => controller.abort();
  }, []);
  return data;
}

/** Filtering and search run in SQL; this only debounces the typing. */
export function useClientList({ query = '', industries = [], solutions = [] }) {
  const [state, setState] = useState({ clients: [], total: 0, loading: true, error: null });
  const industryKey = industries.join(',');
  const solutionKey = solutions.join(',');
  const firstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    const delay = firstLoad.current ? 0 : 250;
    firstLoad.current = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    const timer = window.setTimeout(() => {
      fetchClients({ q: query.trim(), industries: industryKey, solutions: solutionKey, per_page: 100 }, controller.signal)
        .then((response) => setState({ clients: response.data, total: response.meta.total, loading: false, error: null }))
        .catch((error) => {
          if (error.name === 'AbortError') return;
          setState({ clients: [], total: 0, loading: false, error: error.message });
        });
    }, delay);

    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query, industryKey, solutionKey]);

  return state;
}

export function useClient(slug) {
  const [state, setState] = useState({ client: null, loading: true, error: null, notFound: false });

  useEffect(() => {
    const controller = new AbortController();
    setState({ client: null, loading: true, error: null, notFound: false });
    fetchClient(slug, controller.signal)
      .then((client) => setState({ client, loading: false, error: null, notFound: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ client: null, loading: false, error: error.status === 404 ? null : error.message, notFound: error.status === 404 });
      });
    return () => controller.abort();
  }, [slug]);

  return state;
}

/** Related published case studies, chosen from the already-loaded list. */
export function useRelated(client) {
  const [clients, setClients] = useState([]);
  useEffect(() => {
    if (!client) return undefined;
    const controller = new AbortController();
    fetchClients({ per_page: 100 }, controller.signal)
      .then((response) => setClients(response.data))
      .catch(() => setClients([]));
    return () => controller.abort();
  }, [client?.id]);

  return useMemo(() => clients
    .filter((other) => other.id !== client?.id && isPublished(other)
      && (other.industry === client?.industry || other.solutions.some((item) => client?.solutions.includes(item))))
    .slice(0, 3), [clients, client]);
}
