import * as t from 'io-ts';
import { Realm } from './realm';

/**
 * @internal
 */
export class Ref<P extends t.Props> {
  constructor(
    private readonly realm: Realm,
    private readonly entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>
  ) {}

  through<U>(mapping: (entity: t.OutputOf<t.TypeC<P>>) => U) {
    return new MappedRef(this.realm, this.entity, mapping) as unknown as U;
  }
}

/**
 * @internal
 */
export class MappedRef<P extends t.Props, U> {
  constructor(
    private readonly realm: Realm,
    private readonly entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
    private readonly mapping: (entity: t.OutputOf<t.TypeC<P>>) => U
  ) {}

  manifest() {
    return this.mapping(this.realm.manifest(this.entity));
  }
}
