import { faker } from '@faker-js/faker';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import { either, option } from 'io-ts-types';
import { RealmStorage } from './realm-storage';
import { ManifestedRef, MappedRef } from './ref';
import { Define, EntityC, Manifest, Persist } from './types';

export class Realm {
  private readonly storage = new RealmStorage();

  readonly define: Define = (
    Entity,
    { manifest: manifester, persist: persister }
  ) => {
    this.storage.registerManifester(Entity.name, manifester);

    if (typeof persister === 'function') {
      this.storage.registerPersister(Entity.name, persister);
    }
  };

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

  private manifestWithRefs<C extends EntityC>(
    Entity: C,
    overrides: Partial<t.OutputOf<C>>
  ) {
    const manifester = this.storage.findManifester(Entity.name);

    const manifestedEntity = manifester({ faker });

    const refs: ManifestedRef<any, any>[] = [];

    const processRef = (ref: MappedRef<any, any>) => {
      const [manifestedRef, ...childRefs] = this.manifestRef(ref);

      refs.push(manifestedRef, ...childRefs);

      return manifestedRef.mappedValue;
    };

    for (const [key, value] of Object.entries(manifestedEntity)) {
      if (key in overrides) {
        continue;
      }

      if (value instanceof MappedRef) {
        manifestedEntity[key] = processRef(value);
      } else if (option(t.unknown).is(value)) {
        if (O.isSome(value) && value.value instanceof MappedRef) {
          manifestedEntity[key] = O.some(processRef(value.value));
        }
      } else if (either(t.unknown, t.unknown).is(value)) {
        if (E.isLeft(value) && value.left instanceof MappedRef) {
          manifestedEntity[key] = E.left(processRef(value.left));
        } else if (E.isRight(value) && value.right instanceof MappedRef) {
          manifestedEntity[key] = E.right(processRef(value.right));
        }
      }
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
