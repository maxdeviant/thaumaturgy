import * as t from 'io-ts';
import { v4 as uuidV4 } from 'uuid';
import { RealmStorage } from './realm-storage';
import { isMappedRef, ManifestedRef, MappedRef } from './ref';
import { Define, EntityC, Manifest, Persist } from './types';

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

  readonly manifest: Manifest = (Entity, overrides = {}) => {
    const { manifestedEntity } = this.manifestWithRefs(Entity, overrides);

    return manifestedEntity;
  };

  readonly persist: Persist = async (Entity, overrides = {}) => {
    const persister = this.storage.findPersister(Entity.name);

    const { manifestedEntity, refs } = this.manifestWithRefs(Entity, overrides);

    for (const ref of refs.reverse()) {
      await this.persistRef(ref);
    }

    return persister(manifestedEntity);
  };

  readonly persistAll = async () => {
    this.storage.buildEntityGraph({
      manifestWithRefs: (Entity, overrides) =>
        this.manifestWithRefs(Entity, overrides),
    });
  };

  private manifestWithRefs<C extends EntityC>(
    Entity: C,
    overrides: Partial<t.TypeOf<C>>
  ) {
    const manifester = this.storage.findManifester(Entity.name);
    const sequences = this.storage.findSequences(Entity.name);

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

      if (t.UnknownRecord.is(value)) {
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
    const persister = this.storage.findPersister(ref.Entity.name);

    return persister(ref.entity);
  }
}
