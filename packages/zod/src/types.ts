import { DefineOptions, Sequences } from '@thaumaturgy/core';
import { z } from 'zod';

export type EntityName = string;

export type EntityC = z.ZodTypeAny;

export type Define = <
  C extends EntityC,
  TSequences extends Sequences,
  TContext
>(
  Entity: C,
  options: DefineOptions<z.TypeOf<C>, TSequences, TContext>
) => void;

export type Manifest = <C extends EntityC>(
  Entity: C,
  overrides?: Partial<z.TypeOf<C>>
) => z.TypeOf<C>;
