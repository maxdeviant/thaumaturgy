import { EntityName } from './types';

export class ManifesterNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No manifester found for '${entityName}'.`);
  }
}

export class ManifesterAlreadyRegisteredError extends Error {
  constructor(entityName: EntityName) {
    super(`A manifester is already registered for '${entityName}'.`);
  }
}

export class PersisterNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No persister found for '${entityName}'.`);
  }
}

export class PersisterAlreadyRegisteredError extends Error {
  constructor(entityName: EntityName) {
    super(`A persister is already registered for '${entityName}'.`);
  }
}
