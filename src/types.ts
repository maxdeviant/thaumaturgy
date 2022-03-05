import { Faker } from '@faker-js/faker';

export type EntityName = string;

export type Manifester<T> = (faker: Faker) => T;

export type Persister<T> = (entity: T) => Promise<T>;
