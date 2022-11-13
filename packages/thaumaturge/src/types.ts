import { Sequence } from './sequence';

export type EntityName = string;

export interface Entity {
  C: any;
  name: EntityName;
}

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

export type Define = <T, TSequences extends Sequences>(
  Entity: Entity,
  options: DefineOptions<T, TSequences>
) => void;

export type Manifest = <T>(Entity: Entity, overrides?: Partial<T>) => T;

export type Persist = <T>(Entity: Entity, overrides?: Partial<T>) => Promise<T>;

export type PersistLeaves = () => Promise<unknown[]>;
