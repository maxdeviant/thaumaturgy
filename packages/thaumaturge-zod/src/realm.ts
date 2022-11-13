import { z } from 'zod';
import { v4 as uuidV4 } from 'uuid';
import { topologicallyBatchEntities } from './entity-graph-utils';
import { RealmStorage } from './realm-storage';
import { isMappedRef, ManifestedRef, MappedRef } from './ref';
import { Define, EntityC, Manifest, Persist, PersistLeaves } from './types';
import { extractEntityName } from './entity-name';

export const isUnknownRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * A realm is an isolated environment that entities may be registered with.
 *
 * Entity names must be unique within a realm.
 */
export class Realm {
  private readonly storage = new RealmStorage();

  /**
   * Defines an entity in the realm using the specified manifester and persister.
   */
  readonly define: Define = (
    Entity,
    { manifest: manifester, persist: persister, sequences }
  ) => {
    const entityName = extractEntityName(Entity);

    this.storage.registerEntity(entityName, Entity);
    this.storage.registerManifester(entityName, manifester);

    if (typeof persister === 'function') {
      this.storage.registerPersister(entityName, persister);
    }

    if (sequences) {
      this.storage.registerSequences(entityName, sequences);
    }
  };

  /**
   * Clears all of the entities within the realm.
   */
  clear() {
    this.storage.clear();
  }

  /**
   * Manifests an instance of the specified entity.
   *
   * @param Entity The entity to manifest.
   * @param overrides The overrides to pass to the manifester.
   */
  readonly manifest: Manifest = (Entity, overrides = {}) => {
    const { manifestedEntity } = this.manifestWithRefs(Entity, overrides);

    return manifestedEntity;
  };

  /**
   * Persists an instance of the specified entity.
   *
   * @param Entity The entity to persist.
   * @param overrides The overrides to pass to the persister.
   */
  readonly persist: Persist = async (Entity, overrides = {}) => {
    const persister = this.storage.findPersister(extractEntityName(Entity));

    const { manifestedEntity, refs } = this.manifestWithRefs(Entity, overrides);

    for (const ref of refs.reverse()) {
      await this.persistRef(ref);
    }

    return persister(manifestedEntity);
  };

  readonly persistLeaves: PersistLeaves = async () => {
    const topologicallyBatchedEntities = this.storage.withSnapshottedSequences(
      () =>
        topologicallyBatchEntities(
          this.storage.allEntities,
          (Entity, overrides) => this.manifestWithRefs(Entity, overrides)
        )
    );

    const lastBatch = topologicallyBatchedEntities.pop();
    if (!lastBatch) {
      throw new Error('No leaves found to persist.');
    }

    const persistedEntities: any[] = [];

    for (const Entity of lastBatch) {
      persistedEntities.push(await this.persist(Entity));
    }

    return persistedEntities;
  };

  private manifestWithRefs<C extends EntityC>(
    Entity: C,
    overrides: Partial<z.TypeOf<C>>
  ) {
    const entityName = Entity.description;
    if (!entityName) {
      throw new Error('Entity must have a name.');
    }

    const manifester = this.storage.findManifester(entityName);
    const sequences = this.storage.findSequences(entityName);

    const manifestedEntity = manifester({
      uuid: () => uuidV4(),
      sequences,
    });

    const refs: ManifestedRef<any, any>[] = [];

    const processRef = (ref: MappedRef<any, any>) => {
      const [manifestedRef, ...childRefs] = this.manifestRef(ref);

      refs.push(manifestedRef, ...childRefs);

      return manifestedRef.mappedValue;
    };

    const processValue = (value: unknown) => {
      if (isMappedRef(value)) {
        return processRef(value);
      }

      if (isUnknownRecord(value)) {
        const acc: Record<string, unknown> = {};

        for (const [subKey, subValue] of Object.entries(value)) {
          acc[subKey] = processValue(subValue);
        }

        return acc;
      }

      return value;
    };

    for (const [key, value] of Object.entries(manifestedEntity)) {
      if (key in overrides) {
        continue;
      }

      manifestedEntity[key] = processValue(value);
    }

    for (const key in overrides) {
      manifestedEntity[key] = overrides[key];
    }

    return { manifestedEntity, refs };
  }

  private manifestRef<C extends EntityC>(
    ref: MappedRef<C, any>
  ): [ManifestedRef<C, any>, ...ManifestedRef<any, any>[]] {
    const { manifestedEntity, refs } = this.manifestWithRefs(ref.Entity, {});

    return [
      new ManifestedRef(
        ref.Entity,
        manifestedEntity,
        ref.mapping(manifestedEntity)
      ),
      ...refs,
    ];
  }

  private persistRef<C extends EntityC>(ref: ManifestedRef<C, unknown>) {
    const persister = this.storage.findPersister(extractEntityName(ref.Entity));

    return persister(ref.entity);
  }
}
