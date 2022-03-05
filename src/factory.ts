import { faker, Faker } from '@faker-js/faker';
import * as t from 'io-ts';

export type Manifester<T> = (faker: Faker) => T;

const registeredManifesters = new Map<string, Manifester<any>>();

export interface DefineOptions<P extends t.Props> {
  manifest: Manifester<t.OutputOf<t.TypeC<P>>>;
}

export const define = <P extends t.Props>(
  entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  { manifest: manifester }: DefineOptions<P>
): void => {
  registeredManifesters.set(entity.name, manifester);
};

export const clearRegisteredFactories = () => {
  registeredManifesters.clear();
};

export const manifest = <P extends t.Props>(
  entity: t.TypeC<P> | t.ExactC<t.TypeC<P>>,
  overrides: t.TypeOfPartialProps<P> = {}
): t.OutputOf<t.TypeC<P>> => {
  const findManifester = () => {
    const registeredManifester = registeredManifesters.get(entity.name);
    if (typeof registeredManifester === 'function') {
      return registeredManifester;
    }

    throw new Error(`No manifester found for '${entity.name}'.`);
  };

  const manifester = findManifester();

  const manifestedEntity = manifester(faker);

  for (const key in overrides) {
    manifestedEntity[key] = overrides[key];
  }

  return manifestedEntity;
};
