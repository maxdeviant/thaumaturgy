import { Sequence } from '@thaumaturgy/core';
import * as t from 'io-ts';

export type EntityName = string;

export type EntityC = t.Any;

/**
 * The options passed to a `Manifester`.
 */
export interface ManifesterOptions<TSequences> {
  uuid: () => string;
  sequences: TSequences;
}

/**
 * A manifester for an entity of type `T`.
 */
export type Manifester<T, TSequences> = (
  options: ManifesterOptions<TSequences>
) => T;

/**
 * A persister for an entity of type `T`.
 */
export type Persister<T> = (entity: T) => Promise<T>;

export interface Sequences {
  [name: string]: Sequence<unknown>;
}

export interface DefineOptions<T, TSequences extends Sequences> {
  sequences?: TSequences;
  manifest: Manifester<T, TSequences>;
  persist?: Persister<T>;
}

export type Define = <C extends EntityC, TSequences extends Sequences>(
  Entity: C,
  options: DefineOptions<t.TypeOf<C>, TSequences>
) => void;

export type Manifest = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<t.TypeOf<C>>
) => t.TypeOf<C>;

export type Persist = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<t.TypeOf<C>>
) => Promise<t.TypeOf<C>>;

export type PersistLeaves = () => Promise<unknown[]>;
