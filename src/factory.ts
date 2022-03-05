import { faker, Faker } from '@faker-js/faker';
import * as t from 'io-ts';

export type FactoryFn<TEntity> = (faker: Faker) => TEntity;

const registeredFactories = new Map<string, FactoryFn<any>>();

export const define = <TEntity>(
  entity: t.ExactC<any>,
  factory: FactoryFn<TEntity>
): void => {
  registeredFactories.set(entity.name, factory);
};

export const manifest = <TEntity extends t.ExactC<any>>(entity: TEntity) => {
  const findFactory = () => {
    const registeredFactory = registeredFactories.get(entity.name);
    if (typeof registeredFactory === 'function') {
      return registeredFactory;
    }

    throw new Error(`No factory found for '${entity.name}'.`);
  };

  const factory = findFactory();

  return factory(faker);
};
