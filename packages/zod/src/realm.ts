import {
  Realm as BackingRealm,
  DefineOptions,
  Sequences,
} from '@thaumaturgy/core';
import { z } from 'zod';
import { extractEntityName } from './entity-name';
import { EntityC } from './types';

/**
 * A realm is an isolated environment that entities may be registered with.
 *
 * Entity names must be unique within a realm.
 */
export class Realm<TContext> {
  private readonly realm = new BackingRealm<TContext>();

  /**
   * Defines an entity in the realm using the specified manifester and persister.
   */
  readonly define = <C extends EntityC, TSequences extends Sequences>(
    Entity: C,
    options: DefineOptions<z.TypeOf<C>, TSequences, TContext>
  ): void => {
    this.realm.define({ C: Entity, name: extractEntityName(Entity) }, options);
  };

  /**
   * Clears all of the entities within the realm.
   */
  clear() {
    this.realm.clear();
  }

  /**
   * Manifests an instance of the specified entity.
   *
   * @param Entity The entity to manifest.
   * @param overrides The overrides to pass to the manifester.
   */
  readonly manifest = <C extends EntityC>(
    Entity: C,
    overrides: Partial<z.TypeOf<C>> = {}
  ): z.TypeOf<C> => {
    return this.realm.manifest(
      { C: Entity, name: extractEntityName(Entity) },
      overrides
    );
  };

  /**
   * Persists an instance of the specified entity.
   *
   * @param Entity The entity to persist.
   * @param context The context to pass to the persister.
   * @param overrides The overrides to pass to the persister.
   */
  readonly persist = async <C extends EntityC>(
    Entity: C,
    context: TContext,
    overrides: Partial<z.TypeOf<C>> = {}
  ): Promise<z.TypeOf<C>> => {
    return this.realm.persist(
      { C: Entity, name: extractEntityName(Entity) },
      context,
      overrides
    );
  };

  readonly persistLeaves = async (context: TContext) => {
    return this.realm.persistLeaves(context);
  };
}
