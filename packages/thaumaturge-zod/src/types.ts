import { z } from 'zod';
import { Sequence } from 'thaumaturge';

export type EntityName = string;

export type EntityC = z.ZodTypeAny;

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
  options: DefineOptions<z.TypeOf<C>, TSequences>
) => void;

export type Manifest = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<z.TypeOf<C>>
) => z.TypeOf<C>;

export type Persist = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<z.TypeOf<C>>
) => Promise<z.TypeOf<C>>;

export type PersistLeaves = () => Promise<unknown[]>;
