import {
  EntityAlreadyRegisteredError,
  ManifesterAlreadyRegisteredError,
  ManifesterNotFoundError,
  PersisterAlreadyRegisteredError,
  PersisterNotFoundError,
} from './errors';
import { Sequence } from './sequence';
import { EntityC, EntityName, Manifester, Persister } from './types';

/**
 * The storage for a `Realm`.
 *
 * Contains the manifesters and persisters that are defined within a realm.
 *
 * @internal
 */
export class RealmStorage {
  private readonly entities = new Map<EntityName, EntityC>();
  private readonly manifesters = new Map<EntityName, Manifester<any, any>>();
  private readonly persisters = new Map<EntityName, Persister<any>>();
  private readonly sequences = new Map<
    EntityName,
    Record<string, Sequence<any>>
  >();

  /**
   * The list of all entities defined with this storage.
   */
  get allEntities() {
    return [...this.entities.values()];
  }

  /**
   * Registers an entity under its name.
   *
   * @param Entity The entity to register.
   */
  registerEntity(Entity: EntityC) {
    const entityName = Entity.name;

    if (this.entities.has(entityName)) {
      throw new EntityAlreadyRegisteredError(entityName);
    }

    this.entities.set(entityName, Entity);
  }

  /**
   * Registers a manifester under the specified entity name.
   *
   * @param entityName The name of the entity to register the manifester under.
   * @param manifester The manifester to register.
   */
  registerManifester(entityName: EntityName, manifester: Manifester<any, any>) {
    if (this.manifesters.has(entityName)) {
      throw new ManifesterAlreadyRegisteredError(entityName);
    }

    this.manifesters.set(entityName, manifester);
  }

  /**
   * Returns the manifester registered under the specified entity name.
   *
   * Throws a `ManifesterNotFoundError` if there is no manifester registered
   * under the specified entity name.
   *
   * @param entityName The name of the entity to find the manifester for.
   */
  findManifester(entityName: EntityName) {
    const manifester = this.manifesters.get(entityName);
    if (!manifester) {
      throw new ManifesterNotFoundError(entityName);
    }

    return manifester;
  }

  /**
   * Registers a persister under the specified entity name.
   *
   * @param entityName The name of the entity to register the persister under.
   * @param persister The persister to register.
   */
  registerPersister(entityName: EntityName, persister: Persister<any>) {
    if (this.persisters.has(entityName)) {
      throw new PersisterAlreadyRegisteredError(entityName);
    }

    this.persisters.set(entityName, persister);
  }

  /**
   * Returns the persister registered under the specified entity name.
   *
   * Throws a `PersisterNotFoundError` if there is no persister registered
   * under the specified entity name.
   *
   * @param entityName The name of the entity to find the persister for.
   */
  findPersister(entityName: EntityName) {
    const persister = this.persisters.get(entityName);
    if (!persister) {
      throw new PersisterNotFoundError(entityName);
    }

    return persister;
  }

  /**
   * Registers a collection of sequences under the specified entity name.
   *
   * @param entityName The name of the entity to register the sequences under.
   * @param sequences The sequences to register.
   */
  registerSequences(
    entityName: EntityName,
    sequences: Record<string, Sequence<any>>
  ) {
    this.sequences.set(entityName, sequences);
  }

  /**
   * Returns the sequences registered under the specified entity name.
   *
   * Returns `undefined` if there are no sequences registered under the specified
   * entity name.
   *
   * @param entityName The name of the entity to find the sequences for.
   */
  findSequences(entityName: EntityName) {
    return this.sequences.get(entityName);
  }

  /**
   * Clears all manifesters and persisters registered with this `RealmStorage`
   * instance.
   */
  clear() {
    this.manifesters.clear();
    this.persisters.clear();
    this.sequences.clear();
  }
}
