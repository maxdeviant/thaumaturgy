import { DefineOptions, Sequences } from '@thaumaturgy/core';
import * as t from 'io-ts';

export type EntityName = string;

export type EntityC = t.Any;

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
