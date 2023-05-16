import { randomUUID } from 'crypto';
import { topologicallyBatchEntities } from './entity-graph-utils';
import { isUnknownRecord } from './is-unknown-record';
import { RealmStorage } from './realm-storage';
import { isMappedRef, ManifestedRef, MappedRef } from './ref';
import { Define, Entity, Manifest } from './types';

/**
 * A realm is an isolated environment that entities may be registered with.
 *
 * Entity names must be unique within a realm.
 */
export class Realm<TContext> {
  private readonly storage = new RealmStorage();

  /**
   * Defines an entity in the realm using the specified manifester and persister.
   */
  readonly define: Define = (
    Entity,
    { manifest: manifester, persist: persister, sequences }
  ) => {
    this.storage.registerEntity(Entity);
    this.storage.registerManifester(Entity.name, manifester);

    if (typeof persister === 'function') {
      this.storage.registerPersister(Entity.name, persister);
    }

    if (sequences) {
      this.storage.registerSequences(Entity.name, sequences);
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
   * @param context The context to pass to the persister.
   */
  readonly persist = async <T>(
    Entity: Entity,
    overrides: Partial<T> = {},
    context: TContext
  ): Promise<T> => {
    const persister = this.storage.findPersister(Entity.name);

    const { manifestedEntity, refs } = this.manifestWithRefs(Entity, overrides);

    for (const ref of refs.reverse()) {
      await this.persistRef(context, ref);
    }

    return persister(manifestedEntity, context);
  };

  readonly persistLeaves = async (context: TContext): Promise<unknown[]> => {
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
      persistedEntities.push(await this.persist(Entity, undefined, context));
    }

    return persistedEntities;
  };

  private manifestWithRefs<C extends Entity, T>(
    Entity: C,
    overrides: Partial<T>
  ) {
    const manifester = this.storage.findManifester(Entity.name);
    const sequences = this.storage.findSequences(Entity.name);

    const manifestedEntity = manifester({
      uuid: () => randomUUID(),
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

  private manifestRef<C extends Entity>(
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

  private persistRef<C extends Entity>(
    context: TContext,
    ref: ManifestedRef<C, unknown>
  ) {
    const persister = this.storage.findPersister(ref.Entity.name);

    return persister(ref.entity, context);
  }
}
