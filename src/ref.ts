import * as t from 'io-ts';
import { Realm } from './realm';

export class Ref<P extends t.Props> {
  static to<P extends t.Props>(Entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>) {
    return new Ref(Entity);
  }

  private constructor(
    private readonly Entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>
  ) {}

  through<U>(mapping: (entity: t.OutputOf<t.TypeC<P>>) => U) {
    return new MappedRef(this.Entity, mapping) as unknown as U;
  }
}

/**
 * @internal
 */
export class MappedRef<P extends t.Props, U> {
  constructor(
    private readonly Entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
    private readonly mapping: (entity: t.OutputOf<t.TypeC<P>>) => U
  ) {}

  manifest(realm: Realm) {
    return this.mapping(realm.manifest(this.Entity));
  }
}
