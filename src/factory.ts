import { faker, Faker } from '@faker-js/faker';
import * as t from 'io-ts';

export type FactoryFn<TEntity> = (faker: Faker) => TEntity;

const registeredFactories = new Map<string, FactoryFn<any>>();

export const define = <TEntity>(
  entity: t.Mixed,
  factory: FactoryFn<TEntity>
): void => {
  registeredFactories.set(entity.name, factory);
};

export const clearRegisteredFactories = () => {
  registeredFactories.clear();
};

export const manifest = <P extends t.Props>(
  entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  overrides: t.TypeOfPartialProps<P> = {}
): t.OutputOf<t.TypeC<P>> => {
  const findFactory = () => {
    const registeredFactory = registeredFactories.get(entity.name);
    if (typeof registeredFactory === 'function') {
      return registeredFactory;
    }

    throw new Error(`No factory found for '${entity.name}'.`);
  };

  const factory = findFactory();

  const manifestedEntity = factory(faker);

  for (const key in overrides) {
    manifestedEntity[key] = overrides[key];
  }

  return manifestedEntity;
};
