import { Realm as BackingRealm, PersistLeaves } from '@thaumaturgy/core';
import { Define, Manifest, Persist } from './types';

/**
 * A realm is an isolated environment that entities may be registered with.
 *
 * Entity names must be unique within a realm.
 */
export class Realm {
  private readonly realm = new BackingRealm();

  /**
   * Defines an entity in the realm using the specified manifester and persister.
   */
  readonly define: Define = (Entity, options) => {
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
   * @param overrides The overrides to pass to the persister.
   */
  readonly persist: Persist = async (Entity, overrides = {}) => {
    return this.realm.persist({ C: Entity, name: Entity.name }, overrides);
  };

  readonly persistLeaves: PersistLeaves = async () => {
    return this.realm.persistLeaves();
  };
}
