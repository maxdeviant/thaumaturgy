import { Faker } from '@faker-js/faker';
import * as t from 'io-ts';

export type EntityName = string;

export type EntityC = t.Any;

/**
 * The options passed to a `Manifester`.
 */
export interface ManifesterOptions {
  faker: Faker;
}

/**
 * A manifester for an entity of type `T`.
 */
export type Manifester<T> = (options: ManifesterOptions) => T;

/**
 * A persister for an entity of type `T`.
 */
export type Persister<T> = (entity: T) => Promise<T>;

export interface DefineOptions<T> {
  manifest: Manifester<T>;
  persist?: Persister<T>;
}

export type Define = <C extends EntityC>(
  Entity: C,
  options: DefineOptions<t.TypeOf<C>>
) => void;

export type Manifest = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<t.TypeOf<C>>
) => t.TypeOf<C>;

export type Persist = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<t.TypeOf<C>>
) => Promise<t.TypeOf<C>>;
