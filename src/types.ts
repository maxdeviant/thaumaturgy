import { Faker } from '@faker-js/faker';
import * as t from 'io-ts';

export type EntityName = string;

export type EntityC<P extends t.Props, P2 extends t.Props> =
  | t.TypeC<P>
  | t.ExactC<t.TypeC<P>>
  | t.ReadonlyC<t.TypeC<P>>
  | t.ReadonlyC<t.ExactC<t.TypeC<P>>>
  | t.IntersectionC<[t.TypeC<P>, t.TypeC<P2>]>
  | t.ReadonlyC<t.IntersectionC<[t.TypeC<P>, t.TypeC<P2>]>>
  | t.ReadonlyC<t.IntersectionC<[t.ExactC<t.TypeC<P>>, t.ExactC<t.TypeC<P2>>]>>;

export interface ManifesterOptions {
  faker: Faker;
}

export type Manifester<T> = (options: ManifesterOptions) => T;

export type Persister<T> = (entity: T) => Promise<T>;

export interface DefineOptions<P extends t.Props> {
  manifest: Manifester<t.OutputOf<t.TypeC<P>>>;
  persist?: Persister<t.OutputOf<t.TypeC<P>>>;
}

export type Define = <P extends t.Props, P2 extends t.Props>(
  Entity: EntityC<P, P2>,
  options: DefineOptions<P>
) => void;

export type Manifest = <P extends t.Props, P2 extends t.Props>(
  Entity: EntityC<P, P2>,
  overrides?: t.TypeOfPartialProps<P>
) => t.OutputOf<t.TypeC<P>>;

export type Persist = <P extends t.Props, P2 extends t.Props>(
  Entity: EntityC<P, P2>,
  overrides?: t.TypeOfPartialProps<P>
) => Promise<t.OutputOf<t.TypeC<P>>>;
