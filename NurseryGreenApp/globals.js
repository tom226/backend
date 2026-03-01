/**
 * Global polyfills for React Native / Hermes engine.
 *
 * Hermes does not provide browser globals like `window`, `self`, or
 * `document`. Some third-party packages (whatwg-fetch, React DevTools,
 * EventTarget polyfills, etc.) reference these at module-load time,
 * causing ReferenceError crashes before any application code runs.
 *
 * This file MUST be imported before any other module so that these
 * globals are available when downstream modules are evaluated.
 */

// Provide `window` — many web-oriented packages expect it.
if (typeof window === 'undefined') {
  global.window = global;
}

// Provide `self` — used by some fetch / Worker polyfills.
if (typeof self === 'undefined') {
  global.self = global;
}

// Provide a minimal `document` stub so that code that feature-detects the
// DOM (e.g. `if (document && document.createElement)`) doesn't crash.
// Only the most commonly probed properties are stubbed.
if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({}),
    createElementNS: () => ({}),
    createTextNode: () => ({}),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    body: { appendChild: () => {}, removeChild: () => {} },
    head: { appendChild: () => {}, removeChild: () => {} },
    documentElement: { style: {} },
  };
}

// Provide `navigator` stub if not already defined (Hermes usually has it,
// but guard just in case).
if (typeof navigator === 'undefined') {
  global.navigator = { userAgent: 'ReactNative' };
}
