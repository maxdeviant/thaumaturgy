import { faker } from '@faker-js/faker';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import { either, option } from 'io-ts-types';
import { RealmStorage } from './realm-storage';
import { isMappedRef, ManifestedRef, MappedRef } from './ref';
import { Define, EntityC, Manifest, Persist } from './types';

interface Transform<T> {
  is: (value: unknown) => value is T;
  map: (container: T, f: (value: unknown) => unknown) => T;
}

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

    const customContainers: Transform<any>[] = [
      {
        is: (_value: unknown): _value is unknown => true,
        map: (container, f) => f(container),
      },
      {
        is: option(t.unknown).is,
        map: (container, f) => pipe(container, O.map(f)),
      },
      {
        is: either(t.unknown, t.unknown).is,
        map: (container, f) => pipe(container, E.bimap(f, f)),
      },
    ];

    for (const [key, value] of Object.entries(manifestedEntity)) {
      if (key in overrides) {
        continue;
      }

      for (const container of customContainers) {
        if (container.is(value)) {
          manifestedEntity[key] = container.map(value, value => {
            if (isMappedRef(value)) {
              return processRef(value);
            }

            return value;
          });
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
