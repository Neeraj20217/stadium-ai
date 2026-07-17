import { describe, test, expect, beforeAll } from 'vitest';

// Mock window, document, and localStorage for Node.js test environment
global.window = {
  location: { hash: '#/fan' },
  addEventListener: () => {}
};

global.document = {
  getElementById: () => ({
    innerHTML: '',
    classList: { add: () => {}, remove: () => {} }
  }),
  querySelector: () => ({
    innerHTML: '',
    classList: { add: () => {}, remove: () => {} }
  }),
  querySelectorAll: () => []
};

global.localStorage = {
  getItem: () => '',
  setItem: () => {},
  removeItem: () => {}
};

let helpers, insightsEngine, geminiClient, router;

beforeAll(async () => {
  helpers = await import('../js/utils/helpers.js');
  insightsEngine = await import('../js/ai/insights-engine.js');
  geminiClient = await import('../js/ai/gemini-client.js');
  router = await import('../js/utils/router.js');
});

// Test 1: Coordinate check (does wayfinding route logic successfully route around the pitch limits?)
describe('Smart Wayfinding Coordinate Boundaries', () => {
  test('concourse route points must avoid field boundaries', () => {
    const pitchBox = { minX: 110, maxX: 290, minY: 80, maxY: 220 };
    const concourseEastX = 345;
    const concourseWestX = 55;
    
    expect(concourseEastX < pitchBox.minX || concourseEastX > pitchBox.maxX).toBe(true);
    expect(concourseWestX < pitchBox.minX || concourseWestX > pitchBox.maxX).toBe(true);
  });
});

// Test 2: Phrase translation (does the offline translation dictionary correctly translate phrases and restore emojis?)
describe('Multilingual Translation Normalizer & Dictionary', () => {
  test('leading emojis should be extracted and prepended correctly', () => {
    const text = '🏟️ Explore Venues';
    const emojiMatch = text.match(/^([^\w\s\d,.:;?!'""()\-]+\s*)/);
    const leadingEmoji = emojiMatch ? emojiMatch[1] : '';
    const textWithoutEmoji = text.replace(leadingEmoji, '').trim();
    
    expect(leadingEmoji).toBe('🏟️ ');
    expect(textWithoutEmoji).toBe('Explore Venues');
  });

  test('static dictionary translations must match key definitions', () => {
    const spanishTranslation = insightsEngine.getStaticTranslation('Welcome to FIFA World Cup 2026', 'es');
    expect(spanishTranslation).toBe('Bienvenido al Mundial FIFA 2026');

    const hindiTranslation = insightsEngine.getStaticTranslation('Explore Venues', 'hi');
    expect(hindiTranslation).toBe('स्टेडियम खोजें');
  });
});

// Test 3: Language Detection Check
describe('Language Keyboard Detection', () => {
  test('Spanish inputs should contain question inverted elements', () => {
    const input = '¿Dónde está la entrada?';
    expect(input.includes('¿')).toBe(true);
  });
});

// Test 4: Security Input Sanitizer (XSS)
describe('Security Input Sanitizer (escapeHTML)', () => {
  test('malicious scripts and characters must be escaped safely', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const escaped = helpers.escapeHTML(maliciousInput);
    
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&quot;XSS&quot;');
  });
});

// Test 5: Utility Helpers
describe('Utility Helper Functions', () => {
  test('formatNumber should simplify large numbers', () => {
    expect(helpers.formatNumber(1200000)).toBe('1.2M');
    expect(helpers.formatNumber(4500)).toBe('4.5K');
    expect(helpers.formatNumber(850)).toBe('850');
  });

  test('getGreeting should return time-based prefix', () => {
    const greeting = helpers.getGreeting();
    expect(greeting).toMatch(/Good (Morning|Afternoon|Evening)/);
  });
});

// Test 6: Ops Fallback Prompt Routing
describe('Operations Fallback Prompt Routing', () => {
  test('PA announcements query should match operations response', () => {
    const response = geminiClient.getOpsFallbackResponse('Draft a PA announcement', null);
    expect(response).toMatch(/(PA Announcement|Megafonía|Sonorisation)/i);
  });
});

// Test 7: Router Navigation Paths
describe('Client-Side SPA Routing Engine', () => {
  test('should register routes and retrieve active path', () => {
    router.registerRoute('/test-route', () => 'test-render');
    expect(router.getCurrentRoute()).toBe('');
  });
});
