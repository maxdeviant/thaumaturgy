import faker from '@faker-js/faker';
import * as t from 'io-ts';
import { RealmStorage } from './realm-storage';
import { Manifester, Persister } from './types';

export interface DefineOptions<P extends t.Props> {
  manifest: Manifester<t.OutputOf<t.TypeC<P>>>;
  persist?: Persister<t.OutputOf<t.TypeC<P>>>;
}

export class Realm {
  private readonly storage = new RealmStorage();

  define<P extends t.Props>(
    entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
    { manifest: manifester, persist: persister }: DefineOptions<P>
  ): void {
    this.storage.registerManifester(entity.name, manifester);

    if (typeof persister === 'function') {
      this.storage.registerPersister(entity.name, persister);
    }
  }

  clear() {
    this.storage.clear();
  }

  manifest<P extends t.Props>(
    entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
    overrides: t.TypeOfPartialProps<P> = {}
  ): t.OutputOf<t.TypeC<P>> {
    const manifester = this.storage.findManifester(entity.name);

    const manifestedEntity = manifester(faker);

    for (const key in overrides) {
      manifestedEntity[key] = overrides[key];
    }

    return manifestedEntity;
  }

  persist<P extends t.Props>(
    entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
    overrides: t.TypeOfPartialProps<P> = {}
  ): Promise<t.OutputOf<t.TypeC<P>>> {
    const persister = this.storage.findPersister(entity.name);

    return persister(this.manifest(entity, overrides));
  }
}
