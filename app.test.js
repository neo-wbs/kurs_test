const { getRandomMessage, validateEmail, formatVersion, messages } = require('./app.cjs');

// ── Unit-Tests: getRandomMessage ──────────────────────────────────────────
describe('getRandomMessage()', () => {
  test('gibt einen String zurück', () => {
    const result = getRandomMessage();
    expect(typeof result).toBe('string');
  });

  test('gibt eine Nachricht aus der messages-Liste zurück', () => {
    const result = getRandomMessage();
    expect(messages).toContain(result);
  });

  test('gibt bei mehrfachem Aufruf immer einen gültigen Wert zurück', () => {
    for (let i = 0; i < 20; i++) {
      expect(messages).toContain(getRandomMessage());
    }
  });
});

// ── Unit-Tests: validateEmail ─────────────────────────────────────────────
describe('validateEmail()', () => {
  test('akzeptiert gültige E-Mail-Adressen', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co')).toBe(true);
    expect(validateEmail('admin@sub.domain.de')).toBe(true);
  });

  test('lehnt ungültige E-Mail-Adressen ab', () => {
    expect(validateEmail('kein-at-zeichen')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  test('behandelt null und undefined sicher', () => {
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });
});

// ── Unit-Tests: formatVersion ─────────────────────────────────────────────
describe('formatVersion()', () => {
  test('formatiert eine Versionsnummer korrekt', () => {
    expect(formatVersion(1, 0, 0)).toBe('v1.0.0');
    expect(formatVersion(2, 13, 4)).toBe('v2.13.4');
  });

  test('wirft einen Fehler bei nicht-numerischen Werten', () => {
    expect(() => formatVersion('1', 0, 0)).toThrow('All version parts must be numbers');
    expect(() => formatVersion(1, '0', 0)).toThrow();
  });
});