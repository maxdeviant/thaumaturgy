import { MappedRef } from '@thaumaturgy/core';
import * as t from 'io-ts';
import { EntityC } from './types';

/**
 * A reference to another entity.
 *
 * ### Examples
 *
 * ```
 * Ref.to(User).through(user => user.id);
 * ```
 */
export class Ref<C extends EntityC> {
  static to<C extends EntityC>(Entity: C) {
    return new Ref(Entity);
  }

  private constructor(private readonly Entity: C) {}

  through<U>(mapping: (entity: t.TypeOf<C>) => U) {
    return new MappedRef(
      { C: this.Entity, name: this.Entity.name },
      mapping
    ) as unknown as U;
  }
}
