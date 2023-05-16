import * as t from 'io-ts';
import { Realm } from '../realm';
import { Ref } from '../ref';
import { Transaction } from 'kysely';
import { Database } from './database';

const Kingdom = t.type({ name: t.string });

const Phylum = t.type({ kingdom: t.string, name: t.string });

const Class = t.type({ phylum: t.string, name: t.string });

export interface Context {
  tx: Transaction<Database>;
}

export const define = (realm: Realm<Context>) => {
  realm.define(Kingdom, {
    manifest: () => ({ name: 'Animalia' }),
    persist: async (kingdom, { tx }) => {
      await tx.insertInto('kingdom').values({ name: kingdom.name }).execute();

      return kingdom;
    },
  });

  realm.define(Phylum, {
    manifest: () => ({
      kingdom: Ref.to(Kingdom).through(kingdom => kingdom.name),
      name: 'Chordata',
    }),
    persist: async (phylum, { tx }) => {
      await tx
        .insertInto('phylum')
        .values({ kingdom: phylum.kingdom, name: phylum.name })
        .execute();

      return phylum;
    },
  });

  realm.define(Class, {
    manifest: () => ({
      phylum: Ref.to(Phylum).through(phylum => phylum.name),
      name: 'Mammalia',
    }),
    persist: async (class_, { tx }) => {
      await tx
        .insertInto('class')
        .values({ phylum: class_.phylum, name: class_.name })
        .execute();

      return class_;
    },
  });
};
