import { faker } from '@faker-js/faker';
import * as t from 'io-ts';
import { RealmStorage } from './realm-storage';
import { MappedRef } from './ref';
import { Define, Manifest, Persist } from './types';

export class Realm {
  private readonly storage = new RealmStorage();

  define: Define = (Entity, { manifest: manifester, persist: persister }) => {
    this.storage.registerManifester(Entity.name, manifester);

    if (typeof persister === 'function') {
      this.storage.registerPersister(Entity.name, persister);
    }
  };

  clear() {
    this.storage.clear();
  }

  manifest: Manifest = (Entity, overrides = {}) => {
    const { manifestedEntity } = this.manifestWithRefs(Entity, overrides);

    return manifestedEntity;
  };

  private manifestWithRefs<P extends t.Props>(
    Entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
    overrides: t.TypeOfPartialProps<P>
  ) {
    const manifester = this.storage.findManifester(Entity.name);

    const refs: MappedRef<any, any>[] = [];

    const manifestedEntity = manifester({ faker });

    for (const [key, value] of Object.entries(manifestedEntity)) {
      if (value instanceof MappedRef) {
        if (key in overrides) {
          continue;
        }

        refs.push(value);

        manifestedEntity[key] = value.manifest(this);
      }
    }

    for (const key in overrides) {
      manifestedEntity[key] = overrides[key];
    }

    return { manifestedEntity, refs };
  }

  persist: Persist = async (Entity, overrides = {}) => {
    const persister = this.storage.findPersister(Entity.name);

    const { manifestedEntity, refs } = this.manifestWithRefs(Entity, overrides);

    for (const ref of refs) {
      await this.persist(ref.Entity);
    }

    return persister(manifestedEntity);
  };
}
