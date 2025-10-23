import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cn } from '../../src/lib/utils';

describe('cn utility', () => {
  it('merges tailwind variants by preference', () => {
    const result = cn('p-2', 'p-4', { 'text-red-500': true, 'hidden': false });
    assert.equal(result, 'p-4 text-red-500');
  });

  it('skips falsy values and trims whitespace', () => {
    const result = cn('bg-white', null, undefined, false, '   text-sm   ');
    assert.equal(result, 'bg-white text-sm');
  });
});
