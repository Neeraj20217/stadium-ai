// ============================================
// StadiumAI — Client-Side Router
// ============================================

import { getCurrentLanguage, translateElement } from './translator.js';

const routes = {};
let currentRoute = '';
let contentEl = null;

export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function navigateTo(path, force = false) {
  if (currentRoute === path && !force) return;
  currentRoute = path;
  window.location.hash = path;
  renderCurrentRoute();
}

export function getCurrentRoute() {
  return currentRoute;
}

export function initRouter(containerSelector = '#page-content') {
  contentEl = document.querySelector(containerSelector);

  window.addEventListener('hashchange', () => {
    currentRoute = window.location.hash.slice(1) || '/fan';
    renderCurrentRoute();
  });

  currentRoute = window.location.hash.slice(1) || '/fan';
  renderCurrentRoute();
}

export function renderCurrentRoute() {
  contentEl = document.querySelector('#page-content') || contentEl;
  if (!contentEl) return;

  let renderFn = routes[currentRoute];
  let isDynamicVenue = false;
  let venueId = '';

  if (!renderFn && currentRoute.startsWith('/fan/venue/')) {
    renderFn = routes['/fan/venue'];
    isDynamicVenue = true;
    venueId = currentRoute.replace('/fan/venue/', '');
  }

  if (renderFn) {
    contentEl.innerHTML = '';
    contentEl.classList.add('page-transition');
    
    if (isDynamicVenue) {
      renderFn(contentEl, venueId);
    } else {
      renderFn(contentEl);
    }

    requestAnimationFrame(() => {
      contentEl.classList.remove('page-transition');
    });
  } else {
    // Default to fan home
    const fallback = routes['/fan'];
    if (fallback) {
      currentRoute = '/fan';
      window.location.hash = '/fan';
      fallback(contentEl);
    }
  }

  // Translate page if a language other than English is selected
  const currentLang = getCurrentLanguage();
  if (currentLang !== 'en') {
    translateElement(contentEl, currentLang);
  }

  // Update active sidebar items
  document.querySelectorAll('.sidebar-item').forEach(item => {
    const route = item.dataset.route;
    const isActive = route === currentRoute || (route === '/fan/venue' && currentRoute.startsWith('/fan/venue/'));
    item.classList.toggle('active', isActive);
  });
}
