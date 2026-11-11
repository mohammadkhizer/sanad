import { describe, it } from 'node:test';
import assert from 'node:assert';
import { registerSchema } from './schemas.js';

describe('Registration Schema & Age Compliance', () => {
  const validAdult = {
    displayName: 'Hassan Al-Basri',
    email: 'hassan@example.com',
    password: 'SecurePassword123!',
    dateOfBirth: '1995-04-12',
  };

  it('accepts valid registration with dateOfBirth for age 13+', () => {
    const result = registerSchema.safeParse(validAdult);
    assert.strictEqual(result.success, true);
  });

  it('rejects registration if dateOfBirth format is invalid', () => {
    const invalidFormat = { ...validAdult, dateOfBirth: '12-04-1995' };
    const result = registerSchema.safeParse(invalidFormat);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.errors.some((e) => e.message.includes('YYYY-MM-DD')));
    }
  });

  it('rejects registration if applicant is under 13 years old', () => {
    const underAge = { ...validAdult, dateOfBirth: '2020-01-01' };
    const result = registerSchema.safeParse(underAge);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.errors.some((e) => e.message.includes('at least 13 years old')));
    }
  });

  it('rejects registration if neither email nor phone is provided', () => {
    const noContact = {
      displayName: 'Hassan Al-Basri',
      password: 'SecurePassword123!',
      dateOfBirth: '1995-04-12',
    };
    const result = registerSchema.safeParse(noContact);
    assert.strictEqual(result.success, false);
  });
});
