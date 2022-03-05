import faker, { Faker } from '@faker-js/faker';
import * as t from 'io-ts';

export type EntityName = string;

export type Manifester<T> = (faker: Faker) => T;

export type Persister<T> = (entity: T) => Promise<T>;

export interface DefineOptions<P extends t.Props> {
  manifest: Manifester<t.OutputOf<t.TypeC<P>>>;
  persist?: Persister<t.OutputOf<t.TypeC<P>>>;
}

export class ManifesterNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No manifester found for ${entityName}.`);
  }
}

export class PersisterNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No persister found for ${entityName}.`);
  }
}

export class Realm {
  private readonly manifesters = new Map<EntityName, Manifester<any>>();
  private readonly persisters = new Map<EntityName, Persister<any>>();

  define<P extends t.Props>(
    entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
    { manifest: manifester, persist: persister }: DefineOptions<P>
  ): void {
    this.manifesters.set(entity.name, manifester);

    if (typeof persister === 'function') {
      this.persisters.set(entity.name, persister);
    }
  }

  manifest<P extends t.Props>(
    entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
    overrides: t.TypeOfPartialProps<P> = {}
  ): t.OutputOf<t.TypeC<P>> {
    const manifester = this.findManifester(entity.name);

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
    const persister = this.findPersister(entity.name);

    return persister(this.manifest(entity, overrides));
  }

  private findManifester(entityName: EntityName) {
    const manifester = this.manifesters.get(entityName);
    if (!manifester) {
      throw new ManifesterNotFoundError(entityName);
    }

    return manifester;
  }

  private findPersister(entityName: EntityName) {
    const persister = this.persisters.get(entityName);
    if (!persister) {
      throw new PersisterNotFoundError(entityName);
    }

    return persister;
  }

  clear() {
    this.manifesters.clear();
    this.persisters.clear();
  }
}
