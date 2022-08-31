import * as t from 'io-ts';
import { Sequence, SequenceProducer } from './sequence';

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
  [name: string]: SequenceProducer<unknown>;
}

export type Mapped<T extends Sequences> = {
  [K in keyof T]: Sequence<ReturnType<T[K]>>;
};

export interface DefineOptions<T, TSequences extends Sequences> {
  sequences?: TSequences;
  manifest: Manifester<T, Mapped<TSequences>>;
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
