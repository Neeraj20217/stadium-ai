// ============================================
// StadiumAI — Client-side DOM Translator
// Walks the DOM, normalizes whitespace, and translates
// text content using the Gemini batch API or static fallbacks.
// Uses a MutationObserver to translate async content dynamically.
// ============================================

import { translateBatch } from '../ai/insights-engine.js';

let currentLanguage = localStorage.getItem('stadiumai_lang') || 'en';
let translationObserver = null;

export function getCurrentLanguage() {
  return currentLanguage;
}

export function setCurrentLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('stadiumai_lang', lang);
  
  if (lang === 'en') {
    stopTranslationObserver();
  } else {
    startTranslationObserver(lang);
  }
}

// Normalize whitespace for reliable dictionary matching
export function normalizeText(str) {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

// Translate all text in a container (and optionally its siblings/parent)
export async function translateElement(container, targetLang) {
  if (!container || !targetLang) return;
  if (targetLang === 'en') return;

  const textNodes = [];
  const originalTexts = [];
  
  function walk(node) {
    if (
      node.nodeName === 'SCRIPT' || 
      node.nodeName === 'STYLE' || 
      node.nodeName === 'CANVAS' ||
      node.nodeName === 'SELECT' ||
      node.nodeName === 'OPTION' ||
      (node.classList && (
        node.classList.contains('leaflet-container') ||
        node.classList.contains('weather-widget')
      ))
    ) {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      const trimmed = text.trim();
      // Only translate meaningful text
      if (trimmed && trimmed.length > 1 && !/^\d+$/.test(trimmed) && !/^[0-9:\-\+\%\s]+$/.test(trimmed)) {
        textNodes.push(node);
        originalTexts.push(normalizeText(trimmed));
      }
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        walk(node.childNodes[i]);
      }
    }
  }

  walk(container);

  if (originalTexts.length === 0) return;

  // Batch translate
  const chunkSize = 35;
  const translatedTexts = [];

  for (let i = 0; i < originalTexts.length; i += chunkSize) {
    const chunk = originalTexts.slice(i, i + chunkSize);
    try {
      const translatedChunk = await translateBatch(chunk, targetLang);
      translatedTexts.push(...translatedChunk);
    } catch (e) {
      console.error('Translation chunk error:', e);
      translatedTexts.push(...chunk);
    }
  }

  // Map back to DOM preserving leading/trailing whitespaces
  for (let i = 0; i < textNodes.length; i++) {
    if (translatedTexts[i]) {
      const originalValue = textNodes[i].nodeValue;
      const matchLeading = originalValue.match(/^\s*/);
      const matchTrailing = originalValue.match(/\s*$/);
      const leading = matchLeading ? matchLeading[0] : '';
      const trailing = matchTrailing ? matchTrailing[0] : '';
      textNodes[i].nodeValue = `${leading}${translatedTexts[i]}${trailing}`;
    }
  }
}

// Start MutationObserver to translate any dynamic/asynchronous DOM insertions
export function startTranslationObserver(targetLang) {
  if (translationObserver) {
    translationObserver.disconnect();
  }
  if (targetLang === 'en') return;

  const targetEl = document.getElementById('app') || document.body;

  const observer = new MutationObserver(async (mutations) => {
    const textNodes = [];
    const originalTexts = [];

    function walk(node) {
      if (
        node.nodeName === 'SCRIPT' || 
        node.nodeName === 'STYLE' || 
        node.nodeName === 'CANVAS' ||
        node.nodeName === 'SELECT' ||
        node.nodeName === 'OPTION' ||
        (node.classList && (
          node.classList.contains('leaflet-container') ||
          node.classList.contains('weather-widget')
        ))
      ) {
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        const trimmed = text.trim();
        // Skip translating if node has already been translated to avoid double translations
        if (trimmed && trimmed.length > 1 && !/^\d+$/.test(trimmed) && !/^[0-9:\-\+\%\s]+$/.test(trimmed)) {
          textNodes.push(node);
          originalTexts.push(normalizeText(trimmed));
        }
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    }

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => walk(node));
      } else if (mutation.type === 'characterData') {
        const trimmed = mutation.target.nodeValue.trim();
        if (trimmed && trimmed.length > 1 && !/^\d+$/.test(trimmed) && !/^[0-9:\-\+\%\s]+$/.test(trimmed)) {
          textNodes.push(mutation.target);
          originalTexts.push(normalizeText(trimmed));
        }
      }
    }

    if (originalTexts.length === 0) return;

    // Disconnect observer while modifying nodes to prevent loops
    observer.disconnect();

    try {
      const translated = await translateBatch(originalTexts, targetLang);
      for (let i = 0; i < textNodes.length; i++) {
        if (translated[i]) {
          const originalValue = textNodes[i].nodeValue;
          const matchLeading = originalValue.match(/^\s*/);
          const matchTrailing = originalValue.match(/\s*$/);
          const leading = matchLeading ? matchLeading[0] : '';
          const trailing = matchTrailing ? matchTrailing[0] : '';
          textNodes[i].nodeValue = `${leading}${translated[i]}${trailing}`;
        }
      }
    } catch (e) {
      console.error('Observer translation error:', e);
    }

    // Reconnect observer
    observer.observe(targetEl, {
      childList: true,
      subtree: true,
      characterData: true
    });
  });

  observer.observe(targetEl, {
    childList: true,
    subtree: true,
    characterData: true
  });

  translationObserver = observer;
}

export function stopTranslationObserver() {
  if (translationObserver) {
    translationObserver.disconnect();
    translationObserver = null;
  }
}
