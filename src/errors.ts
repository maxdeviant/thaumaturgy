import { EntityName } from './types';

export class ManifesterNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No manifester found for '${entityName}'.`);
  }
}

export class PersisterNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No persister found for '${entityName}'.`);
  }
}
