// public/app.js - SkillSwap Comprehensive Single-Page Application (React + HTM)
(function() {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const htm = window.htm || self.htm;

  if (!React || !ReactDOM || !htm) {
    console.error('SkillSwap initialization error: React or HTM failed to load.');
    return;
  }

  const { useState, useEffect, useRef } = React;
  const html = htm.bind(React.createElement);

  // ----------------------------------------------------
  // Lightweight, Self-Contained SVG Icon Component
  // ----------------------------------------------------
  function Icon({ name, class: className = "w-5 h-5" }) {
    const icons = {
      'repeat': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
      'sparkles': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
      'compass': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
      'arrow-left-right': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>`,
      'arrow-right': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
      'arrow-left': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
      'layout-grid': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
      'message-square': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      'layers': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5"/></svg>`,
      'users': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      'bell': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
      'bell-off': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`,
      'star': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'map-pin': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
      'clock': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      'search': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
      'search-x': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m8 8 6 6"/><path d="m14 8-6 6"/></svg>`,
      'filter': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
      'shield': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
      'shield-alert': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
      'check-circle-2': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
      'check-check': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>`,
      'circle': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,
      'check-square': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      'square': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
      'send': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
      'x': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
      'plus': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
      'plus-circle': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
      'edit-3': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
      'trash-2': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
      'activity': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      'zap': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      'chevron-down': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
      'chevron-up': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>`,
      'refresh-cw': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
      'loader': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`,
      'user': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      'user-plus': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`,
      'award': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
      'log-out': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
      'code': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      'image': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
      'info': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      'help-circle': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
      'book-open': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
      'target': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
      'globe': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      'flag': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
      'inbox': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
      'bookmark': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
      'bookmark-check': html`<svg class=${className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
      'settings': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
      'calendar': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
      'file-text': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
      'eye': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
      'eye-off': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`,
      'columns': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>`
    };
    return icons[name] || html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8"/></svg>`;
  }

  // Global API fetcher
  async function api(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const res = await fetch(path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // ----------------------------------------------------
  // Premium Multi-Column Light Footer (Sections 0 & 5)
  // ----------------------------------------------------
  function Footer({ setActiveTab, onOpenRegister }) {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
      e.preventDefault();
      if (!newsletterEmail.trim()) return;
      setSubscribed(true);
      setNewsletterEmail('');
    };

    return html`
      <footer class="mt-20 border-t border-cream-300 bg-cream-50/70 text-left">
        <!-- Pre-footer CTA Band -->
        <div class="border-b border-cream-300 bg-gradient-to-r from-cream-100 via-white to-navy-50 py-12 px-4 sm:px-6 lg:px-8">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="space-y-1.5 text-center md:text-left">
              <h3 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">Ready to trade skills with verified peers?</h3>
              <p class="text-sm text-warmgray-600">Join thousands of engineers, designers, polyglots, and creators swapping knowledge every day.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onClick=${() => onOpenRegister ? onOpenRegister() : setActiveTab('signup')}
                class="px-6 py-3 rounded-2xl bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm shadow-boutique transition-all flex items-center space-x-2">
                <span>Get Started Free</span>
                <${Icon} name="arrow-right" class="w-4 h-4" />
              </button>
              <button onClick=${() => setActiveTab('matches')}
                class="px-5 py-3 rounded-2xl bg-white hover:bg-cream-100 text-navy-900 border border-cream-300 font-bold text-xs sm:text-sm shadow-sm transition-all">
                Explore Matches
              </button>
            </div>
          </div>
        </div>

        <!-- Main 4-5 Column Grid -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            
            <div class="lg:col-span-2 space-y-4">
              <button onClick=${() => setActiveTab('home')} class="flex items-center space-x-2.5">
                <div class="w-8 h-8 rounded-xl bg-navy-700 text-cream-100 flex items-center justify-center font-serif font-bold text-sm shadow-sm">
                  S
                </div>
                <span class="font-serif text-xl font-bold text-navy-900">SkillSwap</span>
              </button>

              <p class="text-xs text-warmgray-600 leading-relaxed max-w-sm">
                SkillSwap is the reciprocal peer-to-peer exchange platform where members teach what they know in exchange for learning what they want. Zero monetary transactions—pure reciprocal growth.
              </p>

              <div class="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-cream-300 rounded-full text-[11px] font-semibold text-warmgray-700 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Synergy Engine: Operational</span>
              </div>
            </div>

            <div class="space-y-3 text-xs">
              <p class="font-bold uppercase tracking-wider text-navy-900 text-[11px]">Platform</p>
              <ul class="space-y-2 text-warmgray-600 font-medium">
                <li><button onClick=${() => setActiveTab('matches')} class="hover:text-navy-900 transition-colors">Reciprocal Matches</button></li>
                <li><button onClick=${() => setActiveTab('skills-dir')} class="hover:text-navy-900 transition-colors">Skill Directory</button></li>
                <li><button onClick=${() => setActiveTab('workspaces')} class="hover:text-navy-900 transition-colors">Shared Workspaces</button></li>
                <li><button onClick=${() => setActiveTab('search')} class="hover:text-navy-900 transition-colors">Explore Mentors</button></li>
              </ul>
            </div>

            <div class="space-y-3 text-xs">
              <p class="font-bold uppercase tracking-wider text-navy-900 text-[11px]">Resources</p>
              <ul class="space-y-2 text-warmgray-600 font-medium">
                <li><button onClick=${() => setActiveTab('help')} class="hover:text-navy-900 transition-colors">Help Center & FAQ</button></li>
                <li><button onClick=${() => setActiveTab('guidelines')} class="hover:text-navy-900 transition-colors">Swap Etiquette</button></li>
                <li><button onClick=${() => setActiveTab('guidelines')} class="hover:text-navy-900 transition-colors">Trust & Safety Policy</button></li>
                <li><button onClick=${() => setActiveTab('terms')} class="hover:text-navy-900 transition-colors">Community Standards</button></li>
              </ul>
            </div>

            <div class="space-y-3 text-xs">
              <p class="font-bold uppercase tracking-wider text-navy-900 text-[11px]">Stay in the Loop</p>
              <p class="text-warmgray-600 text-[11px] leading-relaxed">Weekly curations of top trending reciprocal skills & exchange strategies.</p>
              
              ${subscribed ? html`
                <div class="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold">
                  ✓ Subscribed! Check your inbox soon.
                </div>
              ` : html`
                <form onSubmit=${handleSubscribe} class="space-y-2">
                  <div class="flex space-x-1.5">
                    <input type="email" value=${newsletterEmail} onChange=${e => setNewsletterEmail(e.target.value)} required
                      placeholder="Your email" class="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs text-navy-900 focus:ring-2 focus:ring-navy-700" />
                    <button type="submit" class="px-3.5 py-2 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs">
                      Join
                    </button>
                  </div>
                  <p class="text-[10px] text-warmgray-400">Zero spam. Unsubscribe anytime.</p>
                </form>
              `}
            </div>

          </div>
        </div>

        <div class="border-t border-cream-300 bg-cream-100 py-6 px-4 sm:px-6 lg:px-8 text-xs text-warmgray-500">
          <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 SkillSwap Platform. Built on Hatchable.</p>
            
            <div class="flex flex-wrap items-center gap-4 text-xs">
              <button onClick=${() => setActiveTab('privacy')} class="hover:text-navy-900">Privacy Policy</button>
              <button onClick=${() => setActiveTab('terms')} class="hover:text-navy-900">Terms of Service</button>
              <button onClick=${() => setActiveTab('guidelines')} class="hover:text-navy-900">Guidelines</button>
              <span>•</span>
              <span class="flex items-center space-x-1 font-semibold text-navy-900">
                <${Icon} name="globe" class="w-3.5 h-3.5 text-warmgray-400" />
                <span>English (US)</span>
              </span>
              <span class="px-2 py-0.5 bg-cream-200 rounded-md text-[11px] font-mono text-warmgray-600">
                UTC +05:30
              </span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // ----------------------------------------------------
  // Navigation Header Component
  // ----------------------------------------------------
  function Header({ user, activeTab, setActiveTab, unreadCount, pendingRequestsCount, onLogout }) {
    const [showUserMenu, setShowUserMenu] = useState(false);

    return html`
      <header class="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            
            <div class="flex items-center space-x-8">
              <button onClick=${() => setActiveTab(user ? 'matches' : 'home')} class="flex items-center space-x-3 group focus:outline-none">
                <div class="w-11 h-11 rounded-2xl bg-navy-700 text-cream-100 flex items-center justify-center shadow-md group-hover:bg-navy-800 transition-colors">
                  <${Icon} name="repeat" class="w-6 h-6 text-cream-200" />
                </div>
                <div class="text-left">
                  <span class="font-serif text-2xl font-bold tracking-tight text-navy-900 block leading-none">SkillSwap</span>
                  <span class="text-[10px] tracking-widest uppercase font-semibold text-warmgray-500 mt-1 block">Reciprocal Exchange</span>
                </div>
              </button>

              <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
                ${user ? html`
                  <button onClick=${() => setActiveTab('matches')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'matches' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span class="flex items-center space-x-2">
                      <${Icon} name="sparkles" class="w-4 h-4 text-amber-500" />
                      <span>Matches</span>
                    </span>
                  </button>
                  
                  <button onClick=${() => setActiveTab('search')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span class="flex items-center space-x-2">
                      <${Icon} name="compass" class="w-4 h-4" />
                      <span>Explore</span>
                    </span>
                  </button>

                  <button onClick=${() => setActiveTab('requests')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative ${activeTab === 'requests' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span class="flex items-center space-x-2">
                      <${Icon} name="arrow-left-right" class="w-4 h-4" />
                      <span>Requests</span>
                      ${pendingRequestsCount > 0 && html`
                        <span class="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-amber-600 rounded-full">${pendingRequestsCount}</span>
                      `}
                    </span>
                  </button>

                  <button onClick=${() => setActiveTab('workspaces')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'workspaces' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span class="flex items-center space-x-2">
                      <${Icon} name="layout-grid" class="w-4 h-4" />
                      <span>Workspaces</span>
                    </span>
                  </button>

                  <button onClick=${() => setActiveTab('chat')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span class="flex items-center space-x-2">
                      <${Icon} name="message-square" class="w-4 h-4" />
                      <span>Messages</span>
                    </span>
                  </button>

                  <button onClick=${() => setActiveTab('skills')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'skills' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span class="flex items-center space-x-2">
                      <${Icon} name="layers" class="w-4 h-4" />
                      <span>My Skills</span>
                    </span>
                  </button>

                  ${user.role === 'ADMIN' && html`
                    <button onClick=${() => setActiveTab('admin')} 
                      class="px-3 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'admin' ? 'bg-red-700 text-white' : 'text-red-700 hover:bg-red-50'}">
                      <span class="flex items-center space-x-1.5">
                        <${Icon} name="shield-alert" class="w-4 h-4" />
                        <span>Admin</span>
                      </span>
                    </button>
                  `}
                ` : html`
                  <button onClick=${() => setActiveTab('home')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'home' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span>Home</span>
                  </button>

                  <button onClick=${() => setActiveTab('skills-dir')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'skills-dir' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span>Skills Directory</span>
                  </button>

                  <button onClick=${() => setActiveTab('search')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span>Explore Mentors</span>
                  </button>

                  <button onClick=${() => setActiveTab('help')} 
                    class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'help' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                    <span>How It Works & FAQ</span>
                  </button>
                `}
              </nav>
            </div>

            <div class="flex items-center space-x-3">
              ${user ? html`
                <button onClick=${() => setActiveTab('notifications')}
                  class="relative p-2.5 rounded-xl bg-cream-200/60 hover:bg-cream-300 text-navy-900 transition-colors">
                  <${Icon} name="bell" class="w-5 h-5" />
                  ${unreadCount > 0 && html`
                    <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-cream-100"></span>
                  `}
                </button>

                <div class="relative">
                  <button onClick=${() => setShowUserMenu(!showUserMenu)}
                    class="flex items-center space-x-2 p-1.5 rounded-2xl hover:bg-cream-200 border border-cream-300 transition-all">
                    <img src=${user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.id}
                      class="w-8 h-8 rounded-xl object-cover border border-cream-400" />
                    <span class="hidden xl:inline text-xs font-bold text-navy-900 pr-1">${user.name?.split(' ')[0]}</span>
                  </button>

                  ${showUserMenu && html`
                    <div class="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-cream-300 py-2 z-50 text-left animate-in fade-in">
                      <div class="px-4 py-2.5 border-b border-cream-200">
                        <p class="text-sm font-bold text-navy-900 truncate">${user.name}</p>
                        <p class="text-xs text-warmgray-500 truncate">@${user.username || user.email?.split('@')[0]}</p>
                      </div>
                      <button onClick=${() => { setActiveTab('profile'); setShowUserMenu(false); }}
                        class="w-full text-left px-4 py-2.5 text-sm text-navy-900 hover:bg-cream-100 flex items-center space-x-2.5">
                        <${Icon} name="user" class="w-4 h-4 text-warmgray-500" />
                        <span>My Public Profile</span>
                      </button>
                      <button onClick=${() => { setActiveTab('skills'); setShowUserMenu(false); }}
                        class="w-full text-left px-4 py-2.5 text-sm text-navy-900 hover:bg-cream-100 flex items-center space-x-2.5">
                        <${Icon} name="award" class="w-4 h-4 text-warmgray-500" />
                        <span>Manage Skills Matrix</span>
                      </button>
                      <button onClick=${() => { setActiveTab('settings'); setShowUserMenu(false); }}
                        class="w-full text-left px-4 py-2.5 text-sm text-navy-900 hover:bg-cream-100 flex items-center space-x-2.5">
                        <${Icon} name="settings" class="w-4 h-4 text-warmgray-500" />
                        <span>Account & Settings</span>
                      </button>
                      <div class="border-t border-cream-200 my-1"></div>
                      <button onClick=${() => { onLogout(); setShowUserMenu(false); }}
                        class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2.5">
                        <${Icon} name="log-out" class="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  `}
                </div>
              ` : html`
                <div class="flex items-center space-x-2">
                  <button onClick=${() => setActiveTab('login')}
                    class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-navy-900 hover:bg-cream-200 border border-cream-300 transition-colors">
                    Sign In
                  </button>
                  <button onClick=${() => setActiveTab('signup')}
                    class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-navy-700 hover:bg-navy-800 text-white shadow-boutique transition-all">
                    Register Free
                  </button>
                </div>
              `}
            </div>

          </div>
        </div>
      </header>
    `;
  }

  // ----------------------------------------------------
  // Home Landing Page Component
  // ----------------------------------------------------
  function HomeLandingView({ setActiveTab }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
      api('/api/skills/directory').then(d => setCategories(d.categories || [])).catch(() => {});
    }, []);

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        setActiveTab('search');
      }
    };

    return html`
      <div class="space-y-20 pb-16 text-left">
        <div class="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-cream-300 bg-gradient-to-b from-cream-50 via-cream-100 to-cream-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="max-w-3xl mx-auto text-center space-y-6">
              
              <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-navy-50 border border-navy-200 text-navy-800 text-xs font-bold tracking-wide">
                <${Icon} name="sparkles" class="w-4 h-4 text-amber-500" />
                <span>The Global Peer-to-Peer Reciprocal Knowledge Exchange</span>
              </div>

              <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy-900 leading-[1.12]">
                Trade what you know for what you <span class="italic font-normal text-navy-700 underline decoration-amber-400 decoration-wavy decoration-2">want to master</span>.
              </h1>

              <p class="text-base sm:text-lg text-warmgray-600 max-w-2xl mx-auto leading-relaxed">
                Connect with mentors who teach what you want to learn, and teach them what they want in return. No money involved—just structured 1-on-1 collaborative skill swaps.
              </p>

              <form onSubmit=${handleSearchSubmit} class="max-w-xl mx-auto pt-2">
                <div class="relative flex items-center shadow-boutique rounded-2xl bg-white border border-cream-300 p-2">
                  <div class="pl-3 text-warmgray-400">
                    <${Icon} name="search" class="w-5 h-5" />
                  </div>
                  <input type="text" value=${searchQuery} onChange=${e => setSearchQuery(e.target.value)}
                    placeholder="What do you want to learn today? (e.g. Python, UI/UX, Spanish...)"
                    class="w-full px-3 py-2 text-sm text-navy-900 placeholder:text-warmgray-400 bg-transparent border-none focus:ring-0" />
                  <button type="submit"
                    class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm flex-shrink-0 transition-colors">
                    Explore
                  </button>
                </div>
              </form>

              <div class="flex flex-wrap justify-center items-center gap-4 pt-3">
                <button onClick=${() => setActiveTab('signup')}
                  class="px-7 py-3.5 bg-navy-700 hover:bg-navy-800 text-white rounded-2xl font-bold text-sm shadow-boutique transition-all flex items-center space-x-2">
                  <span>Create Free Account</span>
                  <${Icon} name="arrow-right" class="w-4 h-4" />
                </button>
                <button onClick=${() => setActiveTab('skills-dir')}
                  class="px-6 py-3.5 bg-white hover:bg-cream-100 text-navy-900 border border-cream-300 rounded-2xl font-bold text-sm shadow-sm transition-all">
                  Browse Skills Directory
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Social Proof Stats Band -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-8 rounded-3xl border border-cream-300 shadow-boutique text-center">
            <div>
              <p class="font-serif text-3xl font-bold text-navy-900">100%</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Reciprocal & Free</p>
            </div>
            <div>
              <p class="font-serif text-3xl font-bold text-emerald-700">6-Factor</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Synergy Match Engine</p>
            </div>
            <div>
              <p class="font-serif text-3xl font-bold text-navy-900">4.9★</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Community Trust Rating</p>
            </div>
            <div>
              <p class="font-serif text-3xl font-bold text-amber-700">1,200+</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Active Skill Pairs</p>
            </div>
          </div>
        </div>

        <!-- How It Works 3-Step Visual -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <p class="text-xs font-bold uppercase tracking-widest text-navy-700">Simple & Trustworthy</p>
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900">How SkillSwap Works</h2>
            <p class="text-sm text-warmgray-600">A structured reciprocal learning framework from matching to mutual review.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-boutique space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-navy-100 text-navy-800 flex items-center justify-center font-serif font-bold text-xl">1</div>
              <h3 class="font-serif font-bold text-xl text-navy-900">List Your Skills</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">Declare skills you can teach with your experience level, plus the skills you are eager to learn and your weekly schedule.</p>
            </div>

            <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-boutique space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-xl">2</div>
              <h3 class="font-serif font-bold text-xl text-navy-900">Get Matched with Synergy</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">Our 6-factor algorithm finds two-way complementary peers and explains exactly why the pair is a great match in plain English.</p>
            </div>

            <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-boutique space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-serif font-bold text-xl">3</div>
              <h3 class="font-serif font-bold text-xl text-navy-900">Swap in Shared Workspace</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">Schedule sessions with timezone sync, track milestones and practice tasks, chat in real-time, and leave verified blind reviews.</p>
            </div>
          </div>
        </div>

        <!-- Featured Skill Categories Grid -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-navy-700">Explore Catalog</p>
              <h2 class="font-serif text-3xl font-bold text-navy-900 mt-1">Popular Skill Categories</h2>
            </div>
            <button onClick=${() => setActiveTab('skills-dir')} class="text-xs font-bold text-navy-700 hover:underline flex items-center space-x-1">
              <span>View All Categories</span>
              <${Icon} name="arrow-right" class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${categories.slice(0, 8).map(c => html`
              <button key=${c.id} onClick=${() => setActiveTab('skills-dir')}
                class="bg-white p-6 rounded-3xl border border-cream-300 shadow-boutique hover:shadow-lg transition-all text-left space-y-3 group">
                <div class="w-10 h-10 rounded-2xl bg-cream-100 text-navy-800 flex items-center justify-center group-hover:bg-navy-700 group-hover:text-white transition-colors">
                  <${Icon} name="layers" class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-serif font-bold text-base text-navy-900 group-hover:text-navy-700 transition-colors">${c.name}</h4>
                  <p class="text-xs text-warmgray-500 mt-0.5">${c.skills_count || 3} skills • ${c.active_members_count || 12} members</p>
                </div>
              </button>
            `)}
          </div>
        </div>

      </div>
    `;
  }

  // ----------------------------------------------------
  // Authentication: Signup Screen
  // ----------------------------------------------------
  function SignupView({ setActiveTab, onAuthSuccess }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [headline, setHeadline] = useState('');
    const [allSkills, setAllSkills] = useState([]);
    const [teachSkillId, setTeachSkillId] = useState('');
    const [teachLevel, setTeachLevel] = useState('Intermediate');
    const [teachExp, setTeachExp] = useState(2.0);
    const [learnSkillId, setLearnSkillId] = useState('');
    const [learnLevel, setLearnLevel] = useState('Beginner');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
      api('/api/skills').then(d => {
        setAllSkills(d.skills || []);
        if (d.skills?.[0]) {
          setTeachSkillId(d.skills[0].id);
          setLearnSkillId(d.skills[1]?.id || d.skills[0].id);
        }
      }).catch(() => {});
    }, []);

    const handleSignupSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
        setSubmitting(true);
        const res = await api('/api/account/signup', {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            username: username.trim(),
            email: email.trim(),
            password,
            headline: headline.trim() || 'SkillSwap Community Member',
            teachSkills: teachSkillId ? [{ skill_id: teachSkillId, level: teachLevel, experience_years: teachExp }] : [],
            learnSkills: learnSkillId ? [{ skill_id: learnSkillId, level: learnLevel, experience_years: 0 }] : []
          })
        });

        onAuthSuccess(res.user);
        setActiveTab('onboarding');
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 text-left">
        <div class="bg-white rounded-3xl max-w-lg w-full p-8 sm:p-10 border border-cream-300 shadow-2xl space-y-6">
          
          <div class="border-b border-cream-200 pb-4">
            <div class="flex items-center justify-between">
              <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">Create Your Account</h2>
              <span class="text-xs font-bold text-navy-700 bg-navy-50 px-2.5 py-1 rounded-full border border-navy-200">Step ${step} of 2</span>
            </div>
            <p class="text-xs text-warmgray-500 mt-1">${step === 1 ? 'Enter your login credentials & public display name' : 'Add your first teaching skill & target learning desire'}</p>
          </div>

          ${error && html`
            <div class="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              ${error}
            </div>
          `}

          <form onSubmit=${step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSignupSubmit} class="space-y-4 text-xs">
            ${step === 1 ? html`
              <div>
                <label class="block font-bold text-navy-900 mb-1">Full Name</label>
                <input type="text" value=${name} onChange=${e => setName(e.target.value)} required
                  placeholder="e.g. Jordan Smith" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-navy-900 mb-1">Username</label>
                  <input type="text" value=${username} onChange=${e => setUsername(e.target.value)} required
                    placeholder="e.g. jordans" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
                </div>
                <div>
                  <label class="block font-bold text-navy-900 mb-1">Email Address</label>
                  <input type="email" value=${email} onChange=${e => setEmail(e.target.value)} required
                    placeholder="you@example.com" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
                </div>
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1">Password</label>
                <input type="password" value=${password} onChange=${e => setPassword(e.target.value)} required minlength="6"
                  placeholder="•••••••• (Min 6 characters)" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1">Professional Headline (Optional)</label>
                <input type="text" value=${headline} onChange=${e => setHeadline(e.target.value)}
                  placeholder="e.g. Frontend Developer & Photography Hobbyist" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
              </div>

              <button type="submit" class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all mt-4 flex items-center justify-center space-x-2">
                <span>Continue to Skill Setup</span>
                <${Icon} name="arrow-right" class="w-4 h-4" />
              </button>
            ` : html`
              <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
                <p class="font-bold text-navy-900 uppercase tracking-wide text-[11px] flex items-center space-x-1.5">
                  <${Icon} name="award" class="w-4 h-4 text-navy-700" />
                  <span>A Skill You Can Teach:</span>
                </p>
                <select value=${teachSkillId} onChange=${e => setTeachSkillId(e.target.value)}
                  class="w-full p-2.5 bg-white border border-cream-300 rounded-xl text-navy-900">
                  ${allSkills.map(s => html`<option key=${s.id} value=${s.id}>${s.name} (${s.category_name})</option>`)}
                </select>

                <div class="grid grid-cols-2 gap-2">
                  <select value=${teachLevel} onChange=${e => setTeachLevel(e.target.value)}
                    class="p-2 bg-white border border-cream-300 rounded-xl text-navy-900">
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <input type="number" step="0.5" min="0.5" value=${teachExp} onChange=${e => setTeachExp(e.target.value)}
                    placeholder="Years exp" class="p-2 bg-white border border-cream-300 rounded-xl text-navy-900" />
                </div>
              </div>

              <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
                <p class="font-bold text-amber-900 uppercase tracking-wide text-[11px] flex items-center space-x-1.5">
                  <${Icon} name="target" class="w-4 h-4 text-amber-600" />
                  <span>A Skill You Want to Learn:</span>
                </p>
                <select value=${learnSkillId} onChange=${e => setLearnSkillId(e.target.value)}
                  class="w-full p-2.5 bg-white border border-cream-300 rounded-xl text-navy-900">
                  ${allSkills.map(s => html`<option key=${s.id} value=${s.id}>${s.name} (${s.category_name})</option>`)}
                </select>

                <select value=${learnLevel} onChange=${e => setLearnLevel(e.target.value)}
                  class="w-full p-2 bg-white border border-cream-300 rounded-xl text-navy-900">
                  <option value="Beginner">Beginner (Starting from scratch)</option>
                  <option value="Intermediate">Intermediate (Building on basics)</option>
                </select>
              </div>

              <div class="flex space-x-2 pt-3">
                <button type="button" onClick=${() => setStep(1)} class="px-4 py-3 bg-cream-100 hover:bg-cream-200 text-navy-900 rounded-xl font-bold">
                  Back
                </button>
                <button type="submit" disabled=${submitting} class="flex-1 py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all">
                  ${submitting ? 'Creating Profile...' : 'Complete Registration & Enter'}
                </button>
              </div>
            `}
          </form>

          <div class="text-center pt-2 text-xs text-warmgray-500">
            Already have an account? <button onClick=${() => setActiveTab('login')} class="font-bold text-navy-700 hover:underline ml-1">Sign In</button>
          </div>

        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Authentication: Login Screen
  // ----------------------------------------------------
  function LoginView({ setActiveTab, onAuthSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleLoginSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
        setSubmitting(true);
        const res = await api('/api/account/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password, rememberMe })
        });
        onAuthSuccess(res.user);
        setActiveTab('matches');
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    const handleQuickDemoLogin = async (demoUserId) => {
      setError('');
      try {
        setSubmitting(true);
        const res = await api('/api/account/login', {
          method: 'POST',
          body: JSON.stringify({ demoUserId })
        });
        onAuthSuccess(res.user);
        setActiveTab('matches');
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 text-left">
        <div class="bg-white rounded-3xl max-w-md w-full p-8 sm:p-10 border border-cream-300 shadow-2xl space-y-6">
          
          <div class="text-center space-y-2">
            <div class="w-12 h-12 bg-navy-700 text-cream-100 rounded-2xl flex items-center justify-center font-serif font-bold text-2xl mx-auto shadow-sm">
              S
            </div>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">Sign In to SkillSwap</h2>
            <p class="text-xs text-warmgray-500">Enter your email or username and password to continue</p>
          </div>

          ${error && html`
            <div class="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              ${error}
            </div>
          `}

          <form onSubmit=${handleLoginSubmit} class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-navy-900 mb-1">Email or Username</label>
              <input type="text" value=${email} onChange=${e => setEmail(e.target.value)} required
                placeholder="alice@skillswap.io or username"
                class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900 focus:ring-2 focus:ring-navy-700" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-navy-900">Password</label>
                <button type="button" onClick=${() => setActiveTab('forgot-password')} class="text-navy-700 hover:underline">Forgot password?</button>
              </div>
              <input type="password" value=${password} onChange=${e => setPassword(e.target.value)} required
                placeholder="••••••••"
                class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900 focus:ring-2 focus:ring-navy-700" />
            </div>

            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked=${rememberMe} onChange=${e => setRememberMe(e.target.checked)} class="rounded text-navy-700 focus:ring-navy-700" />
                <span class="text-warmgray-600 font-medium">Remember Me (30 days)</span>
              </label>
            </div>

            <button type="submit" disabled=${submitting}
              class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2">
              <span>${submitting ? 'Authenticating...' : 'Sign In'}</span>
              <${Icon} name="arrow-right" class="w-4 h-4" />
            </button>
          </form>

          <div class="pt-4 border-t border-cream-200 text-center space-y-2">
            <p class="text-[11px] uppercase font-bold text-warmgray-400 tracking-wider">Fast 1-Click Demo Login</p>
            <div class="grid grid-cols-3 gap-2">
              <button onClick=${() => handleQuickDemoLogin('user_alice')} class="py-2 bg-cream-100 hover:bg-cream-200 text-navy-900 rounded-xl text-xs font-bold border border-cream-300">
                Alice (Python)
              </button>
              <button onClick=${() => handleQuickDemoLogin('user_bob')} class="py-2 bg-cream-100 hover:bg-cream-200 text-navy-900 rounded-xl text-xs font-bold border border-cream-300">
                Bob (Design)
              </button>
              <button onClick=${() => handleQuickDemoLogin('user_admin')} class="py-2 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl text-xs font-bold border border-red-200">
                Admin
              </button>
            </div>
          </div>

          <div class="text-center text-xs text-warmgray-500">
            Don't have an account yet? <button onClick=${() => setActiveTab('signup')} class="font-bold text-navy-700 hover:underline ml-1">Sign Up</button>
          </div>

        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Authentication: Forgot & Reset Password
  // ----------------------------------------------------
  function ForgotPasswordView({ setActiveTab }) {
    const [email, setEmail] = useState('');
    const [tokenSent, setTokenSent] = useState(false);
    const [tokenDebug, setTokenDebug] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
        setSubmitting(true);
        const res = await api('/api/account/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        setTokenSent(true);
        if (res.debug_reset_token) setTokenDebug(res.debug_reset_token);
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="min-h-[75vh] flex items-center justify-center p-4 text-left">
        <div class="bg-white rounded-3xl max-w-md w-full p-8 border border-cream-300 shadow-2xl space-y-6">
          <div class="text-center space-y-1">
            <h2 class="font-serif text-2xl font-bold text-navy-900">Reset Password</h2>
            <p class="text-xs text-warmgray-500">Enter your registered email address to receive a secure password reset link.</p>
          </div>

          ${error && html`<div class="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">${error}</div>`}

          ${tokenSent ? html`
            <div class="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs space-y-3">
              <p class="font-bold">✓ Password reset link generated!</p>
              <p class="text-emerald-800">Use the token below to set your new password:</p>
              <div class="p-2.5 bg-white border border-emerald-300 rounded-xl font-mono text-xs text-center font-bold">
                ${tokenDebug || 'Check email'}
              </div>
              <button onClick=${() => setActiveTab('reset-password')} class="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold">
                Proceed to Enter New Password →
              </button>
            </div>
          ` : html`
            <form onSubmit=${handleSubmit} class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-navy-900 mb-1">Email Address</label>
                <input type="email" value=${email} onChange=${e => setEmail(e.target.value)} required
                  placeholder="you@example.com" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
              </div>
              <button type="submit" disabled=${submitting} class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-sm">
                ${submitting ? 'Dispatching Link...' : 'Send Recovery Link'}
              </button>
            </form>
          `}

          <div class="text-center text-xs text-warmgray-500 pt-2">
            <button onClick=${() => setActiveTab('login')} class="text-navy-700 font-bold hover:underline">← Back to Sign In</button>
          </div>
        </div>
      </div>
    `;
  }

  function ResetPasswordView({ setActiveTab }) {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleResetSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
        setSubmitting(true);
        await api('/api/account/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token: token.trim(), newPassword })
        });
        setSuccess(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="min-h-[75vh] flex items-center justify-center p-4 text-left">
        <div class="bg-white rounded-3xl max-w-md w-full p-8 border border-cream-300 shadow-2xl space-y-6">
          <div class="text-center space-y-1">
            <h2 class="font-serif text-2xl font-bold text-navy-900">Set New Password</h2>
            <p class="text-xs text-warmgray-500">Enter the recovery token from your email</p>
          </div>

          ${error && html`<div class="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">${error}</div>`}

          ${success ? html`
            <div class="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs text-center space-y-3">
              <p class="font-bold text-sm">🎉 Password successfully reset!</p>
              <p>Your account password has been updated. You can now sign in.</p>
              <button onClick=${() => setActiveTab('login')} class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold">
                Sign In Now
              </button>
            </div>
          ` : html`
            <form onSubmit=${handleResetSubmit} class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-navy-900 mb-1">Reset Token</label>
                <input type="text" value=${token} onChange=${e => setToken(e.target.value)} required
                  placeholder="Paste token from reset email" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900 font-mono" />
              </div>
              <div>
                <label class="block font-bold text-navy-900 mb-1">New Password</label>
                <input type="password" value=${newPassword} onChange=${e => setNewPassword(e.target.value)} required minlength="6"
                  placeholder="•••••••• (Min 6 characters)" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
              </div>
              <button type="submit" disabled=${submitting} class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-sm">
                ${submitting ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          `}
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Onboarding Wizard
  // ----------------------------------------------------
  function OnboardingWizardView({ user, setActiveTab, onComplete }) {
    const [bio, setBio] = useState(user?.profile?.bio || '');
    const [location, setLocation] = useState(user?.profile?.location || 'Remote / Worldwide');
    const [timezone, setTimezone] = useState(user?.profile?.timezone || 'UTC');
    const [language, setLanguage] = useState(user?.profile?.preferred_language || 'English');
    const [weeklyHours, setWeeklyHours] = useState(4);
    const [schedule, setSchedule] = useState({
      monday: ['evening'],
      tuesday: ['evening'],
      wednesday: ['evening'],
      thursday: ['evening'],
      friday: ['evening'],
      saturday: ['morning', 'afternoon'],
      sunday: ['morning']
    });
    const [submitting, setSubmitting] = useState(false);

    const toggleSlot = (day, slot) => {
      setSchedule(prev => {
        const curr = prev[day] || [];
        const next = curr.includes(slot) ? curr.filter(s => s !== slot) : [...curr, slot];
        return { ...prev, [day]: next };
      });
    };

    const handleSaveOnboarding = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        await api('/api/account/onboarding', {
          method: 'POST',
          body: JSON.stringify({
            bio,
            location,
            timezone,
            preferred_language: language,
            weekly_hours: weeklyHours,
            availability_schedule: schedule
          })
        });
        alert('Welcome aboard! Your matching profile is fully configured.');
        onComplete();
        setActiveTab('matches');
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const slots = ['morning', 'afternoon', 'evening'];

    return html`
      <div class="max-w-3xl mx-auto px-4 py-10 text-left space-y-8">
        <div class="border-b border-cream-300 pb-6">
          <span class="text-xs font-bold uppercase tracking-wider text-navy-700">Welcome to SkillSwap</span>
          <h1 class="font-serif text-3xl font-bold text-navy-900 mt-1">Configure Your Swap Availability & Baseline</h1>
          <p class="text-sm text-warmgray-600 mt-1">This takes less than a minute and powers your schedule-overlap synergy scores.</p>
        </div>

        <form onSubmit=${handleSaveOnboarding} class="space-y-6 text-xs">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-boutique space-y-4">
            <h3 class="font-serif font-bold text-lg text-navy-900">1. General Availability & Timezone</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block font-bold text-navy-900 mb-1">Your Timezone</label>
                <select value=${timezone} onChange=${e => setTimezone(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900">
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="EST">Eastern Time (UTC-5)</option>
                  <option value="CST">Central Time (UTC-6)</option>
                  <option value="PST">Pacific Time (UTC-8)</option>
                  <option value="IST">India Standard Time (UTC+5:30)</option>
                  <option value="CET">Central European Time (UTC+1)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1">Preferred Language</label>
                <input type="text" value=${language} onChange=${e => setLanguage(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1">Target Hours / Week</label>
                <input type="number" min="1" max="20" value=${weeklyHours} onChange=${e => setWeeklyHours(Number(e.target.value))} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Location (City, Country)</label>
              <input type="text" value=${location} onChange=${e => setLocation(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Brief Learning Bio</label>
              <textarea rows="3" value=${bio} onChange=${e => setBio(e.target.value)} placeholder="What are you currently passionate about building or mastering?" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900"></textarea>
            </div>
          </div>

          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-boutique space-y-4">
            <h3 class="font-serif font-bold text-lg text-navy-900">2. Weekly Schedule Grid (Click to toggle free slots)</h3>
            
            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-center text-xs">
                <thead>
                  <tr class="border-b border-cream-200">
                    <th class="p-2 text-left text-warmgray-500 font-bold uppercase text-[10px]">Time Block</th>
                    ${days.map(d => html`<th key=${d} class="p-2 font-bold text-navy-900 uppercase text-[10px] capitalize">${d.slice(0,3)}</th>`)}
                  </tr>
                </thead>
                <tbody class="divide-y divide-cream-100">
                  ${slots.map(slot => html`
                    <tr key=${slot}>
                      <td class="p-2.5 text-left font-bold text-navy-900 capitalize text-xs">${slot}</td>
                      ${days.map(day => {
                        const isSelected = (schedule[day] || []).includes(slot);
                        return html`
                          <td key=${day} class="p-1">
                            <button type="button" onClick=${() => toggleSlot(day, slot)}
                              class="w-full py-2 rounded-lg font-bold text-[10px] transition-all ${isSelected ? 'bg-navy-700 text-white shadow-sm' : 'bg-cream-100 text-warmgray-400 hover:bg-cream-200'}">
                              ${isSelected ? 'Free' : '—'}
                            </button>
                          </td>
                        `;
                      })}
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>

          <button type="submit" disabled=${submitting} class="w-full py-4 bg-navy-700 hover:bg-navy-800 text-white rounded-2xl font-bold text-sm shadow-boutique transition-all">
            ${submitting ? 'Saving Configuration...' : 'Save & Launch Match Dashboard →'}
          </button>
        </form>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Public SEO-Indexable Skills Directory (/skills or /browse)
  // ----------------------------------------------------
  function SkillsDirectoryView({ setActiveTab, onSelectSkillSearch }) {
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      api('/api/skills/directory').then(d => {
        setDirectory(d.directory || []);
      }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
        <div class="border-b border-cream-300 pb-6">
          <span class="text-xs font-bold uppercase tracking-widest text-navy-700">Public Knowledge Catalog</span>
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mt-1">Skill Directory</h1>
          <p class="text-sm text-warmgray-600 mt-1">Explore all verified teaching disciplines and learning demands across SkillSwap.</p>
        </div>

        ${loading ? html`
          <div class="py-20 text-center"><${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" /></div>
        ` : html`
          <div class="space-y-12">
            ${directory.map(cat => html`
              <div key=${cat.id} class="bg-white rounded-3xl p-8 border border-cream-300 shadow-boutique space-y-6">
                <div class="flex items-center justify-between border-b border-cream-200 pb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-2xl bg-navy-100 text-navy-800 flex items-center justify-center font-bold">
                      <${Icon} name="layers" class="w-5 h-5" />
                    </div>
                    <div>
                      <h2 class="font-serif font-bold text-2xl text-navy-900">${cat.name}</h2>
                      <p class="text-xs text-warmgray-500">${cat.description}</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-warmgray-500">${cat.skills?.length || 0} skills</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  ${cat.skills?.map(s => html`
                    <div key=${s.id} class="p-4 bg-cream-50 rounded-2xl border border-cream-200 hover:border-navy-300 transition-all flex flex-col justify-between space-y-3">
                      <div>
                        <h4 class="font-serif font-bold text-base text-navy-900">${s.name}</h4>
                        <p class="text-xs text-warmgray-600 mt-1 line-clamp-2">${s.description}</p>
                      </div>

                      <div class="flex items-center justify-between text-[11px] pt-2 border-t border-cream-200 text-warmgray-500">
                        <span class="font-semibold text-navy-700">${s.teachers_count || 0} teachers</span>
                        <span class="font-semibold text-amber-800">${s.learners_count || 0} seeking</span>
                        <button onClick=${() => { onSelectSkillSearch(s.name); setActiveTab('search'); }}
                          class="px-2.5 py-1 bg-white hover:bg-navy-700 hover:text-white border border-cream-300 rounded-lg font-bold text-navy-900 transition-colors">
                          View Peers
                        </button>
                      </div>
                    </div>
                  `)}
                </div>
              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }

  // ----------------------------------------------------
  // Public Profile View (/u/:username)
  // ----------------------------------------------------
  function PublicProfileView({ username, userId, currentUser, onProposeSwap, onReportUser, setActiveTab }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const param = username ? `username=${encodeURIComponent(username)}` : `userId=${encodeURIComponent(userId)}`;
      api(`/api/public/profile?${param}`).then(d => {
        setProfile(d.user);
      }).catch(err => {
        console.error('Public profile error:', err);
      }).finally(() => setLoading(false));
    }, [username, userId]);

    if (loading) {
      return html`<div class="py-20 text-center"><${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" /></div>`;
    }

    if (!profile) {
      return html`<div class="py-20 text-center text-warmgray-500">Member profile not found.</div>`;
    }

    const isMe = currentUser?.id === profile.id;

    return html`
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <div class="bg-white rounded-3xl p-8 sm:p-10 border border-cream-300 shadow-boutique space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div class="flex items-start space-x-5">
              <img src=${profile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + profile.name} 
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-cream-300 shadow-md flex-shrink-0" />
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <h1 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">${profile.name}</h1>
                  <span class="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">✓ Verified</span>
                </div>
                <p class="text-sm text-warmgray-600 font-medium">${profile.headline || 'SkillSwap Member'}</p>
                <p class="text-xs text-warmgray-400">@${profile.username || 'user'}</p>
                
                <div class="flex flex-wrap items-center gap-4 text-xs text-warmgray-500 pt-2">
                  <span class="flex items-center space-x-1">
                    <${Icon} name="map-pin" class="w-3.5 h-3.5 text-warmgray-400" />
                    <span>${profile.location || 'Remote / Worldwide'}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <${Icon} name="clock" class="w-3.5 h-3.5 text-warmgray-400" />
                    <span>${profile.timezone || 'UTC'}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <${Icon} name="globe" class="w-3.5 h-3.5 text-warmgray-400" />
                    <span>${profile.preferred_language || 'English'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              ${!isMe && html`
                <button onClick=${() => onReportUser(profile.id)}
                  class="p-2.5 bg-cream-100 hover:bg-red-50 hover:text-red-700 text-warmgray-600 border border-cream-300 rounded-xl text-xs font-semibold">
                  <${Icon} name="flag" class="w-4 h-4" />
                </button>
                <button onClick=${() => onProposeSwap({ user: profile })}
                  class="px-6 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-boutique flex items-center space-x-2">
                  <${Icon} name="arrow-left-right" class="w-4 h-4" />
                  <span>Propose Skill Swap</span>
                </button>
              `}
            </div>
          </div>

          <div class="pt-4 border-t border-cream-200">
            <p class="text-xs font-bold uppercase tracking-wider text-navy-900 mb-1">About & Background</p>
            <p class="text-xs sm:text-sm text-warmgray-700 leading-relaxed">${profile.bio || 'No bio written yet.'}</p>
          </div>

          ${(profile.github_url || profile.dribbble_url || profile.website_url || profile.linkedin_url) && html`
            <div class="pt-4 border-t border-cream-200 flex flex-wrap items-center gap-3 text-xs">
              <span class="font-bold text-navy-900 uppercase tracking-wide text-[10px]">Proof of Work:</span>
              ${profile.github_url && html`<a href=${profile.github_url} target="_blank" class="px-3 py-1 bg-cream-100 rounded-lg font-semibold text-navy-800 hover:underline">GitHub</a>`}
              ${profile.dribbble_url && html`<a href=${profile.dribbble_url} target="_blank" class="px-3 py-1 bg-cream-100 rounded-lg font-semibold text-navy-800 hover:underline">Dribbble / Portfolio</a>`}
              ${profile.website_url && html`<a href=${profile.website_url} target="_blank" class="px-3 py-1 bg-cream-100 rounded-lg font-semibold text-navy-800 hover:underline">Personal Website</a>`}
              ${profile.linkedin_url && html`<a href=${profile.linkedin_url} target="_blank" class="px-3 py-1 bg-cream-100 rounded-lg font-semibold text-navy-800 hover:underline">LinkedIn</a>`}
            </div>
          `}
        </div>

        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-boutique space-y-6">
          <h3 class="font-serif font-bold text-lg text-navy-900">Community Trust & Verification Scorecard</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <p class="font-serif text-3xl font-bold text-navy-900">${profile.avg_rating || '5.0'}★</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Overall (${profile.reviews_count || 0} reviews)</p>
            </div>
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <p class="font-serif text-3xl font-bold text-navy-900">${profile.avg_communication || '5.0'}</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Communication</p>
            </div>
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <p class="font-serif text-3xl font-bold text-navy-900">${profile.avg_knowledge || '5.0'}</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Knowledge</p>
            </div>
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <p class="font-serif text-3xl font-bold text-navy-900">${profile.avg_reliability || '5.0'}</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Reliability</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-boutique space-y-4">
            <h3 class="font-serif font-bold text-lg text-navy-900 flex items-center space-x-2">
              <${Icon} name="award" class="w-5 h-5 text-navy-700" />
              <span>Skills Offered (Can Teach)</span>
            </h3>
            <div class="space-y-3">
              ${profile.teach_skills?.map(s => html`
                <div key=${s.id} class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-navy-900 text-sm">${s.skill_name}</span>
                    <span class="text-xs font-semibold px-2 py-0.5 bg-navy-100 text-navy-800 rounded-md">${s.level}</span>
                  </div>
                  <p class="text-xs text-warmgray-600">${s.description || `${s.experience_years} years experience`}</p>
                </div>
              `)}
            </div>
          </div>

          <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-boutique space-y-4">
            <h3 class="font-serif font-bold text-lg text-navy-900 flex items-center space-x-2">
              <${Icon} name="target" class="w-5 h-5 text-amber-600" />
              <span>Target Learning Goals</span>
            </h3>
            <div class="space-y-3">
              ${profile.learn_skills?.map(s => html`
                <div key=${s.id} class="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-amber-950 text-sm">${s.skill_name}</span>
                    <span class="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">${s.level}</span>
                  </div>
                  <p class="text-xs text-warmgray-600">${s.description || 'Eager to practice and build capstones.'}</p>
                </div>
              `)}
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-boutique space-y-6">
          <h3 class="font-serif font-bold text-lg text-navy-900">Verified Exchange Testimonials (${profile.reviews?.length || 0})</h3>
          ${profile.reviews?.length === 0 ? html`
            <p class="text-xs text-warmgray-500">No testimonials published yet.</p>
          ` : html`
            <div class="space-y-4">
              ${profile.reviews?.map(r => html`
                <div key=${r.id} class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2.5">
                      <img src=${r.reviewer_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + r.reviewer_name} class="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <p class="text-xs font-bold text-navy-900">${r.reviewer_name}</p>
                        <p class="text-[10px] text-warmgray-500">${r.workspace_title}</p>
                      </div>
                    </div>
                    <span class="text-xs font-bold text-amber-600">${r.rating} ★★★★★</span>
                  </div>
                  <p class="text-xs text-warmgray-700 italic">"${r.comment || 'Phenomenal exchange partner!'}"</p>
                </div>
              `)}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Settings View (/settings) — 5 Sub-sections
  // ----------------------------------------------------
  function SettingsView({ user, onUserUpdated }) {
    const [activeSection, setActiveSection] = useState('security');
    const [settingsData, setSettingsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [maxSwaps, setMaxSwaps] = useState(3);
    const [visibility, setVisibility] = useState('public');
    const [allowProposals, setAllowProposals] = useState('all');
    const [notifications, setNotifications] = useState({
      in_app_requests: true,
      in_app_messages: true,
      in_app_milestones: true,
      email_digest: true
    });
    const [theme, setTheme] = useState('light');
    const [githubUrl, setGithubUrl] = useState('');
    const [dribbbleUrl, setDribbbleUrl] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [saving, setSaving] = useState(false);

    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await api('/api/account/settings');
        if (res.settings) {
          const s = res.settings;
          setSettingsData(s);
          setName(s.name || '');
          setUsername(s.username || '');
          setEmail(s.email || '');
          setMaxSwaps(s.matchmaking_preferences?.max_weekly_swaps || 3);
          setVisibility(s.privacy_settings?.visibility || 'public');
          setAllowProposals(s.privacy_settings?.allow_proposals || 'all');
          setNotifications(s.notification_settings || {});
          setTheme(s.theme_preference || 'light');
          setGithubUrl(s.github_url || '');
          setDribbbleUrl(s.dribbble_url || '');
          setWebsiteUrl(s.website_url || '');
          setLinkedinUrl(s.linkedin_url || '');
        }
      } catch (err) {
        console.error('Settings load error:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadSettings();
    }, [user?.id]);

    const handleSaveSection = async (sectionKey, payload) => {
      try {
        setSaving(true);
        await api('/api/account/settings', {
          method: 'PUT',
          body: JSON.stringify({ section: sectionKey, data: payload })
        });
        alert('Settings saved successfully!');
        loadSettings();
        onUserUpdated();
      } catch (err) {
        alert(err.message);
      } finally {
        setSaving(false);
      }
    };

    const handleExportData = async () => {
      try {
        const res = await api('/api/account/settings', {
          method: 'PUT',
          body: JSON.stringify({ section: 'privacy', data: { export_data: true } })
        });
        const blob = new Blob([JSON.stringify(res.export, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillswap-export-${user.username || 'data'}.json`;
        a.click();
      } catch (err) {
        alert(err.message);
      }
    };

    return html`
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <div class="border-b border-cream-300 pb-6">
          <span class="text-xs font-bold uppercase tracking-widest text-navy-700">Account Preferences</span>
          <h1 class="font-serif text-3xl font-bold text-navy-900 mt-1">Platform Settings</h1>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div class="md:col-span-4 space-y-2">
            <button onClick=${() => setActiveSection('security')}
              class="w-full text-left p-3.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-3 ${activeSection === 'security' ? 'bg-navy-700 text-white shadow-sm' : 'bg-white text-navy-900 border border-cream-300 hover:bg-cream-100'}">
              <${Icon} name="shield" class="w-4 h-4" />
              <span>Account & Security</span>
            </button>

            <button onClick=${() => setActiveSection('matchmaking')}
              class="w-full text-left p-3.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-3 ${activeSection === 'matchmaking' ? 'bg-navy-700 text-white shadow-sm' : 'bg-white text-navy-900 border border-cream-300 hover:bg-cream-100'}">
              <${Icon} name="sparkles" class="w-4 h-4" />
              <span>Matchmaking Preferences</span>
            </button>

            <button onClick=${() => setActiveSection('portfolio')}
              class="w-full text-left p-3.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-3 ${activeSection === 'portfolio' ? 'bg-navy-700 text-white shadow-sm' : 'bg-white text-navy-900 border border-cream-300 hover:bg-cream-100'}">
              <${Icon} name="file-text" class="w-4 h-4" />
              <span>Portfolio & Proof-of-Work</span>
            </button>

            <button onClick=${() => setActiveSection('privacy')}
              class="w-full text-left p-3.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-3 ${activeSection === 'privacy' ? 'bg-navy-700 text-white shadow-sm' : 'bg-white text-navy-900 border border-cream-300 hover:bg-cream-100'}">
              <${Icon} name="eye" class="w-4 h-4" />
              <span>Privacy & Discovery</span>
            </button>

            <button onClick=${() => setActiveSection('notifications')}
              class="w-full text-left p-3.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-3 ${activeSection === 'notifications' ? 'bg-navy-700 text-white shadow-sm' : 'bg-white text-navy-900 border border-cream-300 hover:bg-cream-100'}">
              <${Icon} name="bell" class="w-4 h-4" />
              <span>Notification Channels</span>
            </button>

            <button onClick=${() => setActiveSection('theme')}
              class="w-full text-left p-3.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-3 ${activeSection === 'theme' ? 'bg-navy-700 text-white shadow-sm' : 'bg-white text-navy-900 border border-cream-300 hover:bg-cream-100'}">
              <${Icon} name="layers" class="w-4 h-4" />
              <span>Appearance & Theme</span>
            </button>
          </div>

          <div class="md:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-boutique text-xs">
            ${activeSection === 'security' && html`
              <form onSubmit=${e => { e.preventDefault(); handleSaveSection('security', { name, username, email, currentPassword, newPassword }); }} class="space-y-4">
                <h3 class="font-serif font-bold text-lg text-navy-900">Account Credentials & Security</h3>
                
                <div>
                  <label class="block font-bold text-navy-900 mb-1">Display Name</label>
                  <input type="text" value=${name} onChange=${e => setName(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-navy-900 mb-1">Username</label>
                    <input type="text" value=${username} onChange=${e => setUsername(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-900 mb-1">Email Address</label>
                    <input type="email" value=${email} onChange=${e => setEmail(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                  </div>
                </div>

                <div class="pt-4 border-t border-cream-200 space-y-3">
                  <p class="font-bold text-navy-900">Change Password</p>
                  <div>
                    <label class="block text-warmgray-500 mb-1">Current Password</label>
                    <input type="password" value=${currentPassword} onChange=${e => setCurrentPassword(e.target.value)} placeholder="••••••••" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                  </div>
                  <div>
                    <label class="block text-warmgray-500 mb-1">New Password</label>
                    <input type="password" value=${newPassword} onChange=${e => setNewPassword(e.target.value)} placeholder="•••••••• (Min 6 characters)" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                  </div>
                </div>

                <button type="submit" disabled=${saving} class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold shadow-sm">
                  ${saving ? 'Saving...' : 'Update Account Security'}
                </button>
              </form>
            `}

            ${activeSection === 'matchmaking' && html`
              <form onSubmit=${e => { e.preventDefault(); handleSaveSection('matchmaking', { max_weekly_swaps: maxSwaps }); }} class="space-y-4">
                <h3 class="font-serif font-bold text-lg text-navy-900">Matchmaking & Swap Capacity</h3>
                
                <div>
                  <label class="block font-bold text-navy-900 mb-1">Maximum Concurrent Active Swaps</label>
                  <input type="number" min="1" max="10" value=${maxSwaps} onChange=${e => setMaxSwaps(Number(e.target.value))} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                  <p class="text-[11px] text-warmgray-500 mt-1">Prevents overbooking and ensures quality 1-on-1 mentorship attention.</p>
                </div>

                <button type="submit" disabled=${saving} class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold shadow-sm">
                  ${saving ? 'Saving...' : 'Save Matchmaking Preferences'}
                </button>
              </form>
            `}

            ${activeSection === 'portfolio' && html`
              <form onSubmit=${e => { e.preventDefault(); handleSaveSection('portfolio', { github_url: githubUrl, dribbble_url: dribbbleUrl, website_url: websiteUrl, linkedin_url: linkedinUrl }); }} class="space-y-4">
                <h3 class="font-serif font-bold text-lg text-navy-900">Portfolio & Proof-of-Work Verification</h3>
                <p class="text-warmgray-500">Public links displayed on your profile as trust and mastery indicators.</p>

                <div>
                  <label class="block font-bold text-navy-900 mb-1">GitHub / Code Repository URL</label>
                  <input type="url" value=${githubUrl} onChange=${e => setGithubUrl(e.target.value)} placeholder="https://github.com/username" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <div>
                  <label class="block font-bold text-navy-900 mb-1">Dribbble / Figma / Design Portfolio</label>
                  <input type="url" value=${dribbbleUrl} onChange=${e => setDribbbleUrl(e.target.value)} placeholder="https://dribbble.com/username" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <div>
                  <label class="block font-bold text-navy-900 mb-1">Personal Website or Blog</label>
                  <input type="url" value=${websiteUrl} onChange=${e => setWebsiteUrl(e.target.value)} placeholder="https://mywebsite.com" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <div>
                  <label class="block font-bold text-navy-900 mb-1">LinkedIn Profile</label>
                  <input type="url" value=${linkedinUrl} onChange=${e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <button type="submit" disabled=${saving} class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold shadow-sm">
                  ${saving ? 'Saving...' : 'Save Portfolio Links'}
                </button>
              </form>
            `}

            ${activeSection === 'privacy' && html`
              <div class="space-y-6">
                <h3 class="font-serif font-bold text-lg text-navy-900">Privacy & Discovery</h3>
                
                <div class="space-y-3">
                  <div>
                    <label class="block font-bold text-navy-900 mb-1">Profile Discovery Visibility</label>
                    <select value=${visibility} onChange=${e => setVisibility(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl">
                      <option value="public">Public (Visible in search, matches & public URL)</option>
                      <option value="members_only">Members Only (Logged-in peers only)</option>
                      <option value="hidden">Hidden / Incognito (Only visible to current connections)</option>
                    </select>
                  </div>

                  <div>
                    <label class="block font-bold text-navy-900 mb-1">Who Can Send You Proposals?</label>
                    <select value=${allowProposals} onChange=${e => setAllowProposals(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl">
                      <option value="all">All Community Members</option>
                      <option value="verified_only">Verified Peers Only</option>
                    </select>
                  </div>

                  <button onClick=${() => handleSaveSection('privacy', { visibility, allow_proposals: allowProposals })} class="px-6 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold">
                    Save Privacy Settings
                  </button>
                </div>

                <div class="pt-6 border-t border-cream-200 space-y-2">
                  <p class="font-bold text-navy-900">GDPR Data Portability</p>
                  <p class="text-warmgray-500">Download a complete JSON copy of your profile, skills, workspaces, and review history.</p>
                  <button onClick=${handleExportData} class="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-navy-900 border border-cream-300 rounded-xl font-bold">
                    Export My Data Bundle (.json)
                  </button>
                </div>
              </div>
            `}

            ${activeSection === 'notifications' && html`
              <form onSubmit=${e => { e.preventDefault(); handleSaveSection('notifications', notifications); }} class="space-y-4">
                <h3 class="font-serif font-bold text-lg text-navy-900">Notification Preferences</h3>
                
                <div class="space-y-3">
                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked=${notifications.in_app_requests} onChange=${e => setNotifications(p => ({ ...p, in_app_requests: e.target.checked }))} class="rounded text-navy-700" />
                    <span class="font-medium text-navy-900">In-app notifications for new swap proposals & acceptances</span>
                  </label>

                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked=${notifications.in_app_messages} onChange=${e => setNotifications(p => ({ ...p, in_app_messages: e.target.checked }))} class="rounded text-navy-700" />
                    <span class="font-medium text-navy-900">In-app notifications for direct messages in active connections</span>
                  </label>

                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked=${notifications.in_app_milestones} onChange=${e => setNotifications(p => ({ ...p, in_app_milestones: e.target.checked }))} class="rounded text-navy-700" />
                    <span class="font-medium text-navy-900">Milestone & scheduled session reminders</span>
                  </label>

                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked=${notifications.email_digest} onChange=${e => setNotifications(p => ({ ...p, email_digest: e.target.checked }))} class="rounded text-navy-700" />
                    <span class="font-medium text-navy-900">Weekly reciprocal matching digest email</span>
                  </label>
                </div>

                <button type="submit" disabled=${saving} class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold shadow-sm">
                  ${saving ? 'Saving...' : 'Save Notification Preferences'}
                </button>
              </form>
            `}

            ${activeSection === 'theme' && html`
              <div class="space-y-4">
                <h3 class="font-serif font-bold text-lg text-navy-900">Appearance Preference</h3>
                <p class="text-warmgray-500">SkillSwap defaults to our signature warm cream and navy palette.</p>
                
                <div class="grid grid-cols-2 gap-3 max-w-sm">
                  <button onClick=${() => { setTheme('light'); handleSaveSection('theme', { theme: 'light' }); }}
                    class="p-4 rounded-2xl border text-center transition-all ${theme === 'light' ? 'border-navy-700 bg-cream-50 font-bold' : 'border-cream-300 bg-white'}">
                    <div class="w-8 h-8 rounded-full bg-cream-200 mx-auto mb-2 border border-cream-400"></div>
                    <span>Cream & Navy (Default)</span>
                  </button>

                  <button onClick=${() => { setTheme('dark'); handleSaveSection('theme', { theme: 'dark' }); }}
                    class="p-4 rounded-2xl border text-center transition-all ${theme === 'dark' ? 'border-navy-700 bg-cream-50 font-bold' : 'border-cream-300 bg-white'}">
                    <div class="w-8 h-8 rounded-full bg-navy-900 mx-auto mb-2"></div>
                    <span>Dark Mode Accent</span>
                  </button>
                </div>
              </div>
            `}
          </div>

        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Help Center, Terms, Privacy, Guidelines Pages
  // ----------------------------------------------------
  function HelpCenterView() {
    return html`
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <div class="border-b border-cream-300 pb-6">
          <span class="text-xs font-bold uppercase tracking-widest text-navy-700">Knowledge Base</span>
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mt-1">Help Center & Swap Etiquette</h1>
        </div>

        <div class="space-y-6 text-xs sm:text-sm">
          <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-boutique space-y-2">
            <h3 class="font-serif font-bold text-lg text-navy-900">How does the 6-Factor Reciprocal Matching work?</h3>
            <p class="text-warmgray-600 leading-relaxed">
              SkillSwap compares your teach and learn offerings with other members. If Member A teaches Python and wants to learn Figma, and Member B teaches Figma and wants to learn Python, our algorithm identifies this as a 100% two-way reciprocal match. We also evaluate proficiency levels, schedule availability overlap, and community trust scores.
            </p>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-boutique space-y-2">
            <h3 class="font-serif font-bold text-lg text-navy-900">What is the Golden Rule of Skill Swapping?</h3>
            <p class="text-warmgray-600 leading-relaxed">
              Reciprocity and reliability. Both partners agree to equal exchange time (e.g. 1 hour of Python mentorship for 1 hour of Figma design guidance per week). Punctuality, preparedness, and patience are expected from all community members.
            </p>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-boutique space-y-2">
            <h3 class="font-serif font-bold text-lg text-navy-900">How do Two-Way Blind Reviews work?</h3>
            <p class="text-warmgray-600 leading-relaxed">
              After an exchange workspace concludes, both members submit ratings across Communication, Knowledge, and Reliability. Reviews remain hidden until both parties have submitted (or 7 days elapse), ensuring authentic, uninfluenced trust signals.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function LegalView({ type }) {
    const titles = {
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      guidelines: 'Community Standards & Safety Guidelines'
    };

    return html`
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-left">
        <div class="border-b border-cream-300 pb-6">
          <h1 class="font-serif text-3xl font-bold text-navy-900">${titles[type] || 'Legal'}</h1>
          <p class="text-xs text-warmgray-500 mt-1">Last updated: August 2026</p>
        </div>

        <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-boutique text-xs sm:text-sm text-warmgray-700 space-y-4 leading-relaxed">
          <p>SkillSwap is a peer-to-peer reciprocal skill exchange network operated on mutual trust and collaboration.</p>
          <h4 class="font-serif font-bold text-navy-900 text-base">1. Exchange Conduct & Safety</h4>
          <p>All members must treat exchange partners with dignity, respect, and constructive encouragement. Harassment, solicitation of paid services, or non-educational conduct will result in immediate suspension.</p>
          <h4 class="font-serif font-bold text-navy-900 text-base">2. Data Privacy & Verification</h4>
          <p>We respect your personal data. We never sell your contact information. You retain full ownership of your curriculum, notes, and profile assets.</p>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Side-by-Side Peer Comparison Modal Component
  // ----------------------------------------------------
  function CompareModal({ isOpen, onClose, peer1, peer2, onProposeSwap }) {
    if (!isOpen || !peer1 || !peer2) return null;

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-cream-300 space-y-6 text-left">
          <div class="flex items-center justify-between border-b border-cream-200 pb-4">
            <div>
              <h3 class="font-serif font-bold text-xl text-navy-900">Side-by-Side Peer Comparison</h3>
              <p class="text-xs text-warmgray-500 mt-0.5">Compare complementary skills and schedule synergy</p>
            </div>
            <button onClick=${onClose} class="p-1.5 text-warmgray-400 hover:text-navy-900 rounded-xl hover:bg-cream-100">
              <${Icon} name="x" class="w-5 h-5" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-6 text-xs">
            <div class="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-4">
              <div class="flex items-center space-x-3">
                <img src=${peer1.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + peer1.name} class="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 class="font-serif font-bold text-base text-navy-900">${peer1.name}</h4>
                  <p class="text-[11px] text-warmgray-500">${peer1.location || 'Remote'}</p>
                </div>
              </div>
              <div class="p-2.5 bg-white rounded-xl border border-cream-200 font-bold text-emerald-800">
                Match Score: ${peer1.matchScore || 90}%
              </div>
              <div class="space-y-1">
                <span class="font-bold text-navy-900 uppercase tracking-wide text-[10px]">Can Teach:</span>
                <div class="flex flex-wrap gap-1">
                  ${peer1.teach_skills?.map(s => html`<span key=${s.id} class="px-2 py-0.5 bg-cream-200 rounded text-[10px] font-semibold">${s.skill_name}</span>`)}
                </div>
              </div>
              <div class="space-y-1">
                <span class="font-bold text-amber-800 uppercase tracking-wide text-[10px]">Availability:</span>
                <p class="text-warmgray-600">${peer1.availability || 'Flexible'}</p>
              </div>
              <button onClick=${() => { onClose(); onProposeSwap({ user: peer1 }); }} class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold">
                Propose Swap with ${peer1.name.split(' ')[0]}
              </button>
            </div>

            <div class="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-4">
              <div class="flex items-center space-x-3">
                <img src=${peer2.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + peer2.name} class="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 class="font-serif font-bold text-base text-navy-900">${peer2.name}</h4>
                  <p class="text-[11px] text-warmgray-500">${peer2.location || 'Remote'}</p>
                </div>
              </div>
              <div class="p-2.5 bg-white rounded-xl border border-cream-200 font-bold text-emerald-800">
                Match Score: ${peer2.matchScore || 85}%
              </div>
              <div class="space-y-1">
                <span class="font-bold text-navy-900 uppercase tracking-wide text-[10px]">Can Teach:</span>
                <div class="flex flex-wrap gap-1">
                  ${peer2.teach_skills?.map(s => html`<span key=${s.id} class="px-2 py-0.5 bg-cream-200 rounded text-[10px] font-semibold">${s.skill_name}</span>`)}
                </div>
              </div>
              <div class="space-y-1">
                <span class="font-bold text-amber-800 uppercase tracking-wide text-[10px]">Availability:</span>
                <p class="text-warmgray-600">${peer2.availability || 'Flexible'}</p>
              </div>
              <button onClick=${() => { onClose(); onProposeSwap({ user: peer2 }); }} class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold">
                Propose Swap with ${peer2.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Proposal Builder Modal Component
  // ----------------------------------------------------
  function ProposalModal({ isOpen, onClose, targetMatch, currentUser, onSubmitted }) {
    if (!isOpen || !targetMatch) return null;

    const peer = targetMatch.user || targetMatch;
    const [teachSkillId, setTeachSkillId] = useState('');
    const [learnSkillId, setLearnSkillId] = useState('');
    const [duration, setDuration] = useState(4);
    const [cadence, setCadence] = useState('Weekly (1-2 hrs)');
    const [channel, setChannel] = useState('In-App Video');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const myTeachSkills = currentUser?.skills?.filter(s => s.type === 'TEACH') || [];
    const peerTeachSkills = peer?.teach_skills || [];

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        await api('/api/requests', {
          method: 'POST',
          body: JSON.stringify({
            receiver_id: peer.id,
            teach_skill_id: teachSkillId || null,
            learn_skill_id: learnSkillId || null,
            duration_weeks: duration,
            cadence,
            preferred_channel: channel,
            message: message.trim() || `Hi ${peer.name}! I would love to exchange skills with you.`
          })
        });
        alert('Exchange proposal sent!');
        onClose();
        onSubmitted?.();
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl max-w-lg w-full p-8 border border-cream-300 shadow-2xl space-y-4 text-left text-xs">
          <div class="flex items-center justify-between border-b border-cream-200 pb-3">
            <div>
              <h3 class="font-serif font-bold text-lg text-navy-900">Propose Skill Swap</h3>
              <p class="text-warmgray-500">Initiate structured exchange agreement with ${peer.name}</p>
            </div>
            <button onClick=${onClose}><${Icon} name="x" class="w-4 h-4" /></button>
          </div>

          <form onSubmit=${handleSubmit} class="space-y-3">
            <div>
              <label class="block font-bold mb-1">What You Will Teach ${peer.name}</label>
              <select value=${teachSkillId} onChange=${e => setTeachSkillId(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl">
                <option value="">Select teaching skill</option>
                ${myTeachSkills.map(s => html`<option key=${s.skill_id || s.id} value=${s.skill_id || s.id}>${s.skill_name} (${s.level})</option>`)}
              </select>
            </div>

            <div>
              <label class="block font-bold mb-1">What You Want to Learn from ${peer.name}</label>
              <select value=${learnSkillId} onChange=${e => setLearnSkillId(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl">
                <option value="">Select target learning skill</option>
                ${peerTeachSkills.map(s => html`<option key=${s.skill_id || s.id} value=${s.skill_id || s.id}>${s.skill_name} (${s.level})</option>`)}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold mb-1">Exchange Cadence</label>
                <select value=${cadence} onChange=${e => setCadence(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl">
                  <option value="Weekly (1 hr)">Weekly (1 hr)</option>
                  <option value="Weekly (1-2 hrs)">Weekly (1-2 hrs)</option>
                  <option value="Bi-Weekly (2 hrs)">Bi-Weekly (2 hrs)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold mb-1">Target Duration (Weeks)</label>
                <input type="number" min="2" max="12" value=${duration} onChange=${e => setDuration(Number(e.target.value))} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
              </div>
            </div>

            <div>
              <label class="block font-bold mb-1">Preferred Communication Channel</label>
              <select value=${channel} onChange=${e => setChannel(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl">
                <option value="In-App Video">In-App Video & Chat</option>
                <option value="Google Meet / Zoom">Google Meet / Zoom</option>
                <option value="Discord / Async">Discord / Async Reviews</option>
              </select>
            </div>

            <div>
              <label class="block font-bold mb-1">Message & Learning Roadmap</label>
              <textarea rows="3" value=${message} onChange=${e => setMessage(e.target.value)} placeholder="Introduce yourself and outline your learning goals..." class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"></textarea>
            </div>

            <button type="submit" disabled=${submitting} class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs shadow-sm">
              ${submitting ? 'Sending...' : 'Send Swap Proposal'}
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // Mount React DOM
  const rootEl = document.getElementById('root');
  if (rootEl) {
    ReactDOM.createRoot(rootEl).render(html`<${App} />`);
  }
})();