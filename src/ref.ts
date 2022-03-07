import * as t from 'io-ts';
import { Realm } from './realm';
import { EntityC } from './types';

export class Ref<P extends t.Props, P2 extends t.Props> {
  static to<P extends t.Props, P2 extends t.Props>(Entity: EntityC<P, P2>) {
    return new Ref(Entity);
  }

  private constructor(private readonly Entity: EntityC<P, P2>) {}

  through<U>(mapping: (entity: t.OutputOf<t.TypeC<P>>) => U) {
    return new MappedRef(this.Entity, mapping) as unknown as U;
  }
}

/**
 * @internal
 */
export class MappedRef<P extends t.Props, P2 extends t.Props, U> {
  constructor(
    readonly Entity: EntityC<P, P2>,
    private readonly mapping: (entity: t.OutputOf<t.TypeC<P>>) => U
  ) {}

  manifest(realm: Realm) {
    return this.mapping(realm.manifest(this.Entity));
  }
}
