import { MappedRef } from '@thaumaturgy/core';
import { z } from 'zod';
import { extractEntityName } from './entity-name';
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

  through<U>(mapping: (entity: z.TypeOf<C>) => U) {
    return new MappedRef(
      { C: this.Entity, name: extractEntityName(this.Entity) },
      mapping
    ) as unknown as U;
  }
}
