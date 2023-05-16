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
export type Persister<T, TContext> = (
  entity: T,
  context: TContext
) => Promise<T>;

export interface Sequences {
  [name: string]: Sequence<unknown>;
}

export type Manifest = <T>(Entity: Entity, overrides?: Partial<T>) => T;
