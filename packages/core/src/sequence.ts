export class Sequence<T> {
  private counter = 1;

  constructor(private readonly produce: (n: number) => T) {}

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
    const items: T[] = [];

    for (let i = 1; i <= n; i++) {
      items.push(this.next());
    }

    return items;
  }
}
