import { Faker } from '@faker-js/faker';
import * as t from 'io-ts';

export type EntityName = string;

export type EntityC = t.Any;

export interface ManifesterOptions {
  faker: Faker;
}

export type Manifester<T> = (options: ManifesterOptions) => T;

export type Persister<T> = (entity: T) => Promise<T>;

export interface Traversal<T> {
  is: (value: unknown) => value is T;
  traverse: (f: (value: unknown) => unknown) => (container: T) => T;
}

export interface DefineOptions<T> {
  manifest: Manifester<T>;
  persist?: Persister<T>;
}

export type Define = <C extends EntityC>(
  Entity: C,
  options: DefineOptions<t.OutputOf<C>>
) => void;

export type DefineTraversal = <T>(traversal: Traversal<T>) => void;

export type Manifest = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<t.OutputOf<C>>
) => t.OutputOf<C>;

export type Persist = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<t.OutputOf<C>>
) => Promise<t.OutputOf<C>>;
