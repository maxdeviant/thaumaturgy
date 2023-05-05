import { describe, expect, it } from 'vitest';
import { isUnknownRecord } from './is-unknown-record';

describe('isUnknownRecord', () => {
  it.each([undefined, null, [], 1, '1', new Date(), new Date().toISOString()])(
    'returns `false` for a non-record value: %O',
    value => {
      expect(isUnknownRecord(value)).toBe(false);
    }
  );

  it.each([{}, { hello: 'world' }, { foo: [1, 2, 3] }])(
    'returns `true` for a record value: %O',
    value => {
      expect(isUnknownRecord(value)).toBe(true);
    }
  );
});
