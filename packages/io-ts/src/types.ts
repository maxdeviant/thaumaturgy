import { DefineOptions, Sequences } from '@thaumaturgy/core';
import * as t from 'io-ts';

export type EntityName = string;

export type EntityC = t.Any;

export type Define = <
  C extends EntityC,
  TSequences extends Sequences,
  TContext
>(
  Entity: C,
  options: DefineOptions<t.TypeOf<C>, TSequences, TContext>
) => void;

export type Manifest = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<t.TypeOf<C>>
) => t.TypeOf<C>;

export type Persist = <C extends EntityC, TContext = unknown>(
  Entity: C,
  overrides?: Partial<t.TypeOf<C>>,
  context?: TContext
) => Promise<t.TypeOf<C>>;
