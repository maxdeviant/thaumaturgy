import { pipe } from 'fp-ts/function';
import * as NEA from 'fp-ts/NonEmptyArray';

export type SequenceProducer<T> = (n: number) => T;

export class Sequence<T> {
  private counter = 1;

  constructor(private readonly produce: SequenceProducer<T>) {}

  /**
   * Returns the next item in the sequence.
   */
  next() {
    return this.produce(this.counter++);
  }

  /**
   * Returns the next _n_ items in the sequence.
   *
   * @param n The number of items to take from the sequence.
   */
  take(n: number) {
    return [
      ...pipe(
        NEA.range(1, n),
        NEA.map(() => this.next())
      ),
    ];
  }
}
