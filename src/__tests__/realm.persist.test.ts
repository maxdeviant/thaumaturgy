import * as t from 'io-ts';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Realm } from '../realm';

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
  });
});
