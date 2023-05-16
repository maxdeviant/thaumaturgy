import { DefineOptions, Sequences } from '@thaumaturgy/core';
import { z } from 'zod';

export type EntityName = string;

export type EntityC = z.ZodTypeAny;

export type Define = <C extends EntityC, TSequences extends Sequences>(
  Entity: C,
  options: DefineOptions<z.TypeOf<C>, TSequences>
) => void;

export type Manifest = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<z.TypeOf<C>>
) => z.TypeOf<C>;

export type Persist = <C extends EntityC, TContext = unknown>(
  Entity: C,
  overrides?: Partial<z.TypeOf<C>>,
  context?: TContext
) => Promise<z.TypeOf<C>>;
