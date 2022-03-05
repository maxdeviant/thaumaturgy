import * as t from 'io-ts';
import { DefineOptions, Realm } from './realm';

const globalRealm = new Realm();

export const define = <P extends t.Props>(
  entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  options: DefineOptions<P>
): void => {
  globalRealm.define(entity, options);
};

export const clearRegisteredFactories = () => {
  globalRealm.clear();
};

export const manifest = <P extends t.Props>(
  entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  overrides: t.TypeOfPartialProps<P> = {}
): t.OutputOf<t.TypeC<P>> => globalRealm.manifest(entity, overrides);

export const persist = <P extends t.Props>(
  entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  overrides: t.TypeOfPartialProps<P> = {}
): Promise<t.OutputOf<t.TypeC<P>>> => globalRealm.persist(entity, overrides);
