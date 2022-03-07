import * as t from 'io-ts';
import { Realm } from './realm';
import { EntityC } from './types';

export class Ref<C extends EntityC> {
  static to<C extends EntityC>(Entity: C) {
    return new Ref(Entity);
  }

  private constructor(private readonly Entity: C) {}

  through<U>(mapping: (entity: t.OutputOf<C>) => U) {
    return new MappedRef(this.Entity, mapping) as unknown as U;
  }
}

/**
 * @internal
 */
export class MappedRef<C extends EntityC, U> {
  constructor(
    readonly Entity: C,
    private readonly mapping: (entity: t.OutputOf<C>) => U
  ) {}

  manifest(realm: Realm) {
    return this.mapping(realm.manifest(this.Entity));
  }
}
