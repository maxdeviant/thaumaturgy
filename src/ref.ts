import * as t from 'io-ts';
import { EntityC } from './types';

export class Ref<C extends EntityC> {
  static to<C extends EntityC>(Entity: C) {
    return new Ref(Entity);
  }

  private constructor(private readonly Entity: C) {}

  through<U>(mapping: (entity: t.TypeOf<C>) => U) {
    return new MappedRef(this.Entity, mapping) as unknown as U;
  }
}

/**
 * @internal
 */
export const isMappedRef = (value: unknown): value is MappedRef<any, any> =>
  value instanceof MappedRef;

/**
 * @internal
 */
export class MappedRef<C extends EntityC, U> {
  constructor(
    readonly Entity: C,
    readonly mapping: (entity: t.TypeOf<C>) => U
  ) {}
}

/**
 * @internal
 */
export class ManifestedRef<C extends EntityC, U> {
  constructor(
    readonly Entity: C,
    readonly entity: t.TypeOf<C>,
    readonly mappedValue: U
  ) {}
}
