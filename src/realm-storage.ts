import { ManifesterNotFoundError, PersisterNotFoundError } from './errors';
import { EntityName, Manifester, Persister } from './types';

/**
 * @internal
 */
export class RealmStorage {
  private readonly manifesters = new Map<EntityName, Manifester<any>>();
  private readonly persisters = new Map<EntityName, Persister<any>>();

  registerManifester(entityName: EntityName, manifester: Manifester<any>) {
    this.manifesters.set(entityName, manifester);
  }

  findManifester(entityName: EntityName) {
    const manifester = this.manifesters.get(entityName);
    if (!manifester) {
      throw new ManifesterNotFoundError(entityName);
    }

    return manifester;
  }

  registerPersister(entityName: EntityName, persister: Persister<any>) {
    this.persisters.set(entityName, persister);
  }

  findPersister(entityName: EntityName) {
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
