import { Faker } from '@faker-js/faker';
import * as t from 'io-ts';

export type EntityName = string;

export interface ManifesterOptions {
  faker: Faker;
}

export type Manifester<T> = (options: ManifesterOptions) => T;

export type Persister<T> = (entity: T) => Promise<T>;

export interface DefineOptions<P extends t.Props> {
  manifest: Manifester<t.OutputOf<t.TypeC<P>>>;
  persist?: Persister<t.OutputOf<t.TypeC<P>>>;
}

export type Define = <P extends t.Props>(
  Entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  options: DefineOptions<P>
) => void;

export type Manifest = <P extends t.Props>(
  Entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  overrides?: t.TypeOfPartialProps<P>
) => t.OutputOf<t.TypeC<P>>;

export type Persist = <P extends t.Props>(
  Entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  overrides?: t.TypeOfPartialProps<P>
) => Promise<t.OutputOf<t.TypeC<P>>>;
