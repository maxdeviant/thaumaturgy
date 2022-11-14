import { Entity } from './types';

/**
 * @internal
 */
export const isMappedRef = (value: unknown): value is MappedRef<any, any> =>
  value instanceof MappedRef;

export class MappedRef<T, U> {
  constructor(readonly Entity: Entity, readonly mapping: (entity: T) => U) {}
}

/**
 * @internal
 */
export class ManifestedRef<T, U> {
  constructor(
    readonly Entity: Entity,
    readonly entity: T,
    readonly mappedValue: U
  ) {}
}
