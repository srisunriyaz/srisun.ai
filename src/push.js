// Browser side of admin push alerts (Firebase Cloud Messaging). The Firebase
// web config and VAPID key below are public identifiers, not secrets; the
// server's service account never reaches the browser. The Firebase SDK is
// loaded on demand, so visitors to the public site never download it.

import { registerPushDevice } from './apiClient.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDY92DpS751ssQTaxUxDJDf_wcIyK2ZGxs',
  authDomain: 'alc-push-eb6d0.firebaseapp.com',
  projectId: 'alc-push-eb6d0',
  storageBucket: 'alc-push-eb6d0.firebasestorage.app',
  messagingSenderId: '906535226092',
  appId: '1:906535226092:web:ff705323d954e8357fb3c9'
};
const VAPID_KEY = 'BGydO4lNev7ZO9LOBFbx9aLHyvLH7lNdhfCx9Q3prBAjd7i4OC7OV8LvI4O9eSFaFsoujkcdg6fnmjBqGya-n5w';
const SW_URL = '/firebase-messaging-sw.js';
const SW_SCOPE = '/firebase-cloud-messaging-push-scope';
const TOKEN_KEY = 'srisun-push-token';

const stored = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
const store = (token) => { try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ } };

export const pushSupported = () => typeof window !== 'undefined'
  && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && window.isSecureContext;

export const permission = () => (pushSupported() ? Notification.permission : 'unsupported');
export const currentToken = stored;

const deviceLabel = () => {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} on ${os}` : browser;
};

async function fetchToken() {
  const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  const [{ initializeApp, getApps }, { getMessaging, getToken, isSupported }] = await Promise.all([import('firebase/app'), import('firebase/messaging')]);
  if (!(await isSupported())) throw new Error('This browser does not support push notifications.');
  const app = getApps()[0] || initializeApp(firebaseConfig);
  return getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
}

/** Asks for permission (only after a click), gets a token and registers it. */
export async function enablePush() {
  if (!pushSupported()) throw new Error('This browser does not support push notifications. On iPhone, add the site to your Home Screen first.');
  const result = await Notification.requestPermission();
  if (result === 'denied') throw new Error('Notifications are blocked for this site. Allow them in your browser’s site settings, then try again.');
  if (result !== 'granted') throw new Error('Notification permission was not granted.');
  const token = await fetchToken();
  if (!token) throw new Error('Could not get a push token from Firebase. Please try again.');
  const device = await registerPushDevice({ token, previousToken: stored(), label: deviceLabel(), origin: window.location.origin });
  store(token);
  return device;
}

/** Re-checks the token on each admin visit; Firebase may rotate it. Silent on failure. */
export async function refreshPush() {
  if (!stored() || permission() !== 'granted') return;
  try {
    const token = await fetchToken();
    if (token) { await registerPushDevice({ token, previousToken: stored(), label: deviceLabel(), origin: window.location.origin }); store(token); }
  } catch { /* the device list will show it as stale; the admin can re-enable */ }
}

export const forgetLocalToken = () => store(null);
