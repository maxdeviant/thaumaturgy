import { identity } from 'fp-ts/function';
import { Sequence } from './sequence';

describe('Sequence', () => {
  describe('next', () => {
    it('yields the next item in the sequence', () => {
      const sequence = new Sequence(identity);

      expect([
        sequence.next(),
        sequence.next(),
        sequence.next(),
        sequence.next(),
      ]).toEqual([1, 2, 3, 4]);
    });
  });

  describe('take', () => {
    it('yields the specified number of items from the sequence', () => {
      const sequence = new Sequence(identity);

      expect(sequence.take(3)).toEqual([1, 2, 3]);
    });
  });
});
