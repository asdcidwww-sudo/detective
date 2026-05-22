import crypto from 'node:crypto';

// Polyfill the native crypto module object itself
if (!crypto.getRandomValues) {
  crypto.getRandomValues = function (arr) {
    return crypto.randomFillSync(arr);
  };
}

// Also polyfill globalThis.crypto and getRandomValues
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto.webcrypto || {
    getRandomValues: crypto.getRandomValues
  };
} else if (typeof globalThis.crypto.getRandomValues === 'undefined') {
  globalThis.crypto.getRandomValues = crypto.getRandomValues;
}
