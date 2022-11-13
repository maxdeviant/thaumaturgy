import { EntityName } from './types';

/**
 * An error thrown when an entity was not found.
 */
export class EntityNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No entity found with name '${entityName}'.`);
  }
}

/**
 * An error thrown when an entity was already registered.
 */
export class EntityAlreadyRegisteredError extends Error {
  constructor(entityName: EntityName) {
    super(`An entity is already registered as '${entityName}'.`);
  }
}

/**
 * An error thrown when a manifester was not found for a given entity.
 */
export class ManifesterNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No manifester found for '${entityName}'.`);
  }
}

/**
 * An error thrown when a manifester was already registered for a given entity.
 */
export class ManifesterAlreadyRegisteredError extends Error {
  constructor(entityName: EntityName) {
    super(`A manifester is already registered for '${entityName}'.`);
  }
}

/**
 * An error thrown when a persister was not found for a given entity.
 */
export class PersisterNotFoundError extends Error {
  constructor(entityName: EntityName) {
    super(`No persister found for '${entityName}'.`);
  }
}

/**
 * An error thrown when a persister was already registered for a given entity.
 */
export class PersisterAlreadyRegisteredError extends Error {
  constructor(entityName: EntityName) {
    super(`A persister is already registered for '${entityName}'.`);
  }
}
