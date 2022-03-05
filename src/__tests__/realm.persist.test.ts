import * as t from 'io-ts';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Realm } from '../realm';
import { Ref } from '../ref';

describe('Realm', () => {
  describe('persist', () => {
    const setupDatabase = async () => {
      const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database,
      });

      return { db };
    };

    describe('for a `type` codec', () => {
      const realm = new Realm();

      const Car = t.type({
        make: t.string,
        model: t.string,
      });

      const performSetup = async () => {
        const { db } = await setupDatabase();

        await db.exec('create table car (make text, model text)');

        realm.define(Car, {
          manifest: () =>
            Car.encode({
              make: 'Honda',
              model: 'Civic',
            }),
          persist: async car => {
            await db.run('insert into car values (?, ?)', car.make, car.model);

            return car;
          },
        });

        return { db };
      };

      describe('with no overrides', () => {
        it('persists an instance of the provided type', async () => {
          const { db } = await performSetup();

          const persisted = await realm.persist(Car);

          expect(persisted).toEqual(
            Car.encode({
              make: 'Honda',
              model: 'Civic',
            })
          );

          const carFromDatabase = await db.get('select make, model from car');

          expect(carFromDatabase).toEqual(persisted);
        });
      });

      describe('with overrides', () => {
        it('persists an instance of the provided type with the overrides applied', async () => {
          const { db } = await performSetup();

          const persisted = await realm.persist(Car, {
            model: 'CRV',
          });

          expect(persisted).toEqual(
            Car.encode({
              make: 'Honda',
              model: 'CRV',
            })
          );

          const carFromDatabase = await db.get('select make, model from car');

          expect(carFromDatabase).toEqual(persisted);
        });
      });
    });

    describe('for an entity hierarchy', () => {
      const realm = new Realm();

      const Kingdom = t.type({ name: t.string });

      const Phylum = t.type({ kingdom: t.string, name: t.string });

      const Class = t.type({ phylum: t.string, name: t.string });

      const performSetup = async () => {
        const { db } = await setupDatabase();

        await db.exec('pragma foreign_keys = on');
        await db.exec('create table kingdom (name text primary key)');
        await db.exec(
          'create table phylum (kingdom text, name text primary key, foreign key(kingdom) references kingdom(name))'
        );
        await db.exec(
          'create table class (phylum text, name text primary key, foreign key(phylum) references phylum(name))'
        );

        realm.define(Kingdom, {
          manifest: () => Kingdom.encode({ name: 'Animalia' }),
          persist: async kingdom => {
            await db.run('insert into kingdom values (?)', kingdom.name);

            return kingdom;
          },
        });

        realm.define(Phylum, {
          manifest: () =>
            Phylum.encode({
              kingdom: Ref.to(Kingdom).through(kingdom => kingdom.name),
              name: 'Chordata',
            }),
          persist: async phylum => {
            await db.run(
              'insert into phylum values (?, ?)',
              phylum.kingdom,
              phylum.name
            );

            return phylum;
          },
        });

        realm.define(Class, {
          manifest: () =>
            Class.encode({
              phylum: Ref.to(Phylum).through(phylum => phylum.name),
              name: 'Mammalia',
            }),
          persist: async class_ => {
            await db.run(
              'insert into class values (?, ?)',
              class_.phylum,
              class_.name
            );

            return class_;
          },
        });

        return { db };
      };

      it('persists an instance of each entity in the hierarchy', async () => {
        const { db } = await performSetup();

        const persisted = await realm.persist(Class);

        expect(persisted).toEqual(
          Class.encode({
            phylum: 'Chordata',
            name: 'Mammalia',
          })
        );

        const classFromDatabase = await db.get(
          'select phylum, name from class'
        );

        expect(classFromDatabase).toEqual(persisted);

        const phylumFromDatabase = await db.get(
          'select kingdom, name from phylum'
        );

        expect(phylumFromDatabase).toEqual(
          Phylum.encode({
            kingdom: 'Animalia',
            name: 'Chordata',
          })
        );

        const kingdomFromDatabase = await db.get('select name from kingdom');

        expect(kingdomFromDatabase).toEqual(
          Kingdom.encode({ name: 'Animalia' })
        );
      });
    });
  });
});
