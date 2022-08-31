import { pipe } from 'fp-ts/function';
import * as NEA from 'fp-ts/NonEmptyArray';

export class Sequence<T> {
  private counter = 1;

  constructor(private readonly produce: (n: number) => T) {}

  next() {
    return this.produce(this.counter++);
  }

  take(n: number) {
    return [
      ...pipe(
        NEA.range(1, n),
        NEA.map(() => this.next())
      ),
    ];
  }
}
