import {
  Realm as BackingRealm,
  DefineOptions,
  Sequences,
} from '@thaumaturgy/core';
import * as t from 'io-ts';
import { EntityC, Manifest } from './types';

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
    options: DefineOptions<t.TypeOf<C>, TSequences, TContext>
  ) => {
    this.realm.define({ C: Entity, name: Entity.name }, options);
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
  readonly manifest: Manifest = (Entity, overrides = {}) => {
    return this.realm.manifest({ C: Entity, name: Entity.name }, overrides);
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
    overrides: Partial<t.TypeOf<C>> = {}
  ): Promise<t.TypeOf<C>> => {
    return this.realm.persist(
      { C: Entity, name: Entity.name },
      overrides,
      context
    );
  };

  readonly persistLeaves = async (context: TContext) => {
    return this.realm.persistLeaves(context);
  };
}
